import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { BPRecord, MonitoringSession, UserProfile } from '../types/bloodPressure';
import { calculateSessionAverage, classifyTSH } from '../utils/tshGuidelines';

const GUEST_DISPATCH_EVENT = 'tsh_guest_records_updated';

// Helper for local guest storage
function isGuestUser(userId: string): boolean {
  return userId.startsWith('guest_');
}

// User Profile Service
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  if (isGuestUser(uid)) {
    const raw = localStorage.getItem(`tsh_profile_${uid}`);
    return raw ? JSON.parse(raw) : null;
  }

  const path = `users/${uid}`;
  try {
    const docSnap = await getDoc(doc(db, 'users', uid));
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  if (isGuestUser(profile.uid)) {
    localStorage.setItem(`tsh_profile_${profile.uid}`, JSON.stringify(profile));
    return;
  }

  const path = `users/${profile.uid}`;
  try {
    const docRef = doc(db, 'users', profile.uid);
    await setDoc(docRef, {
      ...profile,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Monitoring Session Service
export async function getSessions(userId: string): Promise<MonitoringSession[]> {
  if (isGuestUser(userId)) {
    const raw = localStorage.getItem(`tsh_sessions_${userId}`);
    return raw ? JSON.parse(raw) : [];
  }

  const path = `users/${userId}/sessions`;
  try {
    const q = query(collection(db, 'users', userId, 'sessions'), orderBy('startDate', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as MonitoringSession));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createMonitoringSession(
  userId: string,
  title: string = 'โปรแกรมบันทึกความดัน 7 วัน (TSH Protocol)',
  startDateStr?: string
): Promise<MonitoringSession> {
  const sessionId = 'session_' + Date.now();
  const start = startDateStr ? new Date(startDateStr) : new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 6); // 7 days: day 1 to day 7

  const newSession: MonitoringSession = {
    id: sessionId,
    userId,
    title,
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0],
    status: 'in_progress',
    completedReadingsCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (isGuestUser(userId)) {
    const current = await getSessions(userId);
    localStorage.setItem(`tsh_sessions_${userId}`, JSON.stringify([newSession, ...current]));
    return newSession;
  }

  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    await setDoc(doc(db, 'users', userId, 'sessions', sessionId), newSession);
    return newSession;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateSessionMetrics(
  userId: string,
  sessionId: string,
  metrics: Partial<MonitoringSession>
): Promise<void> {
  if (isGuestUser(userId)) {
    const sessions = await getSessions(userId);
    const updated = sessions.map(s => s.id === sessionId ? { ...s, ...metrics, updatedAt: new Date().toISOString() } : s);
    localStorage.setItem(`tsh_sessions_${userId}`, JSON.stringify(updated));
    return;
  }

  const path = `users/${userId}/sessions/${sessionId}`;
  try {
    await updateDoc(doc(db, 'users', userId, 'sessions', sessionId), {
      ...metrics,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// BP Records Service
export async function getRecords(userId: string, sessionId?: string): Promise<BPRecord[]> {
  if (isGuestUser(userId)) {
    const raw = localStorage.getItem(`tsh_records_${userId}_${sessionId || 'all'}`);
    const records: BPRecord[] = raw ? JSON.parse(raw) : [];
    return records.sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.period === 'morning' ? -1 : 1;
    });
  }

  const path = `users/${userId}/records`;
  try {
    let q = query(collection(db, 'users', userId, 'records'), orderBy('dayIndex', 'asc'), orderBy('period', 'asc'));
    if (sessionId) {
      q = query(collection(db, 'users', userId, 'records'), where('sessionId', '==', sessionId));
    }
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BPRecord));
    return records.sort((a, b) => {
      if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
      return a.period === 'morning' ? -1 : 1;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export function subscribeToRecords(
  userId: string,
  sessionId: string,
  onUpdate: (records: BPRecord[]) => void,
  onError?: (error: unknown) => void
) {
  if (isGuestUser(userId)) {
    const emitLocal = () => {
      const raw = localStorage.getItem(`tsh_records_${userId}_${sessionId}`);
      const list: BPRecord[] = raw ? JSON.parse(raw) : [];
      list.sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        return a.period === 'morning' ? -1 : 1;
      });
      onUpdate(list);
    };

    // Emit initial
    emitLocal();

    const listener = (e: any) => {
      if (e.detail?.userId === userId && e.detail?.sessionId === sessionId) {
        emitLocal();
      }
    };
    window.addEventListener(GUEST_DISPATCH_EVENT, listener);

    return () => {
      window.removeEventListener(GUEST_DISPATCH_EVENT, listener);
    };
  }

  const path = `users/${userId}/records`;
  const q = query(collection(db, 'users', userId, 'records'), where('sessionId', '==', sessionId));

  return onSnapshot(
    q,
    (snapshot) => {
      const records = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as BPRecord));
      records.sort((a, b) => {
        if (a.dayIndex !== b.dayIndex) return a.dayIndex - b.dayIndex;
        return a.period === 'morning' ? -1 : 1;
      });
      onUpdate(records);
    },
    (err) => {
      if (onError) onError(err);
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

export async function saveBPRecord(record: BPRecord): Promise<void> {
  const recordId = record.id || `rec_${record.dayIndex}_${record.period}_${Date.now()}`;
  const cleanRecord: BPRecord = {
    ...record,
    id: recordId,
    updatedAt: new Date().toISOString(),
  };

  if (isGuestUser(record.userId)) {
    const key = `tsh_records_${record.userId}_${record.sessionId}`;
    const raw = localStorage.getItem(key);
    let list: BPRecord[] = raw ? JSON.parse(raw) : [];
    const existingIndex = list.findIndex(r => r.id === recordId || (r.dayIndex === record.dayIndex && r.period === record.period));
    if (existingIndex >= 0) {
      list[existingIndex] = cleanRecord;
    } else {
      list.push(cleanRecord);
    }
    localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent(GUEST_DISPATCH_EVENT, { detail: { userId: record.userId, sessionId: record.sessionId } }));
    return;
  }

  const path = `users/${record.userId}/records/${recordId}`;
  try {
    await setDoc(doc(db, 'users', record.userId, 'records', recordId), cleanRecord, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBPRecord(userId: string, recordId: string, sessionId?: string): Promise<void> {
  if (isGuestUser(userId)) {
    if (sessionId) {
      const key = `tsh_records_${userId}_${sessionId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        const list: BPRecord[] = JSON.parse(raw);
        const filtered = list.filter(r => r.id !== recordId);
        localStorage.setItem(key, JSON.stringify(filtered));
        window.dispatchEvent(new CustomEvent(GUEST_DISPATCH_EVENT, { detail: { userId, sessionId } }));
      }
    }
    return;
  }

  const path = `users/${userId}/records/${recordId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'records', recordId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Seed complete Demo 7-Day Protocol
export async function seedDemo7DayData(userId: string, sessionId: string, startDateStr: string) {
  const baseDate = new Date(startDateStr);

  const patternData: Array<{
    day: number;
    mSys1: number; mDia1: number; mPulse1: number;
    mSys2: number; mDia2: number; mPulse2: number;
    eSys1: number; eDia1: number; ePulse1: number;
    eSys2: number; eDia2: number; ePulse2: number;
    symptomsM?: string; symptomsE?: string;
  }> = [
    // Day 1 (Familiarization / adjustment day)
    { day: 1, mSys1: 146, mDia1: 92, mPulse1: 78, mSys2: 142, mDia2: 89, mPulse2: 76, eSys1: 138, eDia1: 86, ePulse1: 74, eSys2: 135, eDia2: 84, ePulse2: 73, symptomsM: 'ตื่นเต้นเล็กน้อย เริ่มวัดวันแรก' },
    // Day 2
    { day: 2, mSys1: 139, mDia1: 88, mPulse1: 72, mSys2: 136, mDia2: 86, mPulse2: 71, eSys1: 132, eDia1: 84, ePulse1: 70, eSys2: 130, eDia2: 82, ePulse2: 69 },
    // Day 3
    { day: 3, mSys1: 141, mDia1: 89, mPulse1: 75, mSys2: 137, mDia2: 86, mPulse2: 74, eSys1: 129, eDia1: 83, ePulse1: 72, eSys2: 127, eDia2: 81, ePulse2: 71, symptomsM: 'ปวดตึงท้ายทอยเล็กน้อย' },
    // Day 4
    { day: 4, mSys1: 138, mDia1: 87, mPulse1: 73, mSys2: 135, mDia2: 85, mPulse2: 72, eSys1: 128, eDia1: 82, ePulse1: 68, eSys2: 126, eDia2: 80, ePulse2: 68 },
    // Day 5
    { day: 5, mSys1: 142, mDia1: 88, mPulse1: 76, mSys2: 138, mDia2: 86, mPulse2: 75, eSys1: 133, eDia1: 85, ePulse1: 74, eSys2: 131, eDia2: 83, ePulse2: 73, symptomsM: 'นอนดึก หลับไม่สนิท' },
    // Day 6
    { day: 6, mSys1: 136, mDia1: 85, mPulse1: 71, mSys2: 134, mDia2: 84, mPulse2: 70, eSys1: 127, eDia1: 81, ePulse1: 69, eSys2: 125, eDia2: 79, ePulse2: 68 },
    // Day 7
    { day: 7, mSys1: 135, mDia1: 85, mPulse1: 70, mSys2: 133, mDia2: 83, mPulse2: 69, eSys1: 126, eDia1: 80, ePulse1: 67, eSys2: 124, eDia2: 78, ePulse2: 67 },
  ];

  for (const item of patternData) {
    const curDate = new Date(baseDate);
    curDate.setDate(baseDate.getDate() + (item.day - 1));
    const dateStr = curDate.toISOString().split('T')[0];

    // Morning
    const mAvg = calculateSessionAverage(
      { sys: item.mSys1, dia: item.mDia1, pulse: item.mPulse1 },
      { sys: item.mSys2, dia: item.mDia2, pulse: item.mPulse2 }
    );
    const mRecord: BPRecord = {
      id: `demo_${sessionId}_d${item.day}_morning`,
      userId,
      sessionId,
      dayIndex: item.day,
      period: 'morning',
      date: dateStr,
      measuredAt: '07:15',
      sys1: item.mSys1, dia1: item.mDia1, pulse1: item.mPulse1,
      sys2: item.mSys2, dia2: item.mDia2, pulse2: item.mPulse2,
      avgSys: mAvg.avgSys,
      avgDia: mAvg.avgDia,
      avgPulse: mAvg.avgPulse,
      category: mAvg.category,
      armUsed: 'right',
      medicationTaken: false,
      symptoms: item.symptomsM || '',
      note: 'วัดหลังตื่นนอน ปัสสาวะแล้ว ก่อนอาหารเช้าและยา',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveBPRecord(mRecord);

    // Evening
    const eAvg = calculateSessionAverage(
      { sys: item.eSys1, dia: item.eDia1, pulse: item.ePulse1 },
      { sys: item.eSys2, dia: item.eDia2, pulse: item.ePulse2 }
    );
    const eRecord: BPRecord = {
      id: `demo_${sessionId}_d${item.day}_evening`,
      userId,
      sessionId,
      dayIndex: item.day,
      period: 'evening',
      date: dateStr,
      measuredAt: '20:30',
      sys1: item.eSys1, dia1: item.eDia1, pulse1: item.ePulse1,
      sys2: item.eSys2, dia2: item.eDia2, pulse2: item.ePulse2,
      avgSys: eAvg.avgSys,
      avgDia: eAvg.avgDia,
      avgPulse: eAvg.avgPulse,
      category: eAvg.category,
      armUsed: 'right',
      medicationTaken: true,
      symptoms: item.symptomsE || '',
      note: 'วัดก่อนเข้านอน นั่งพัก 10 นาที',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await saveBPRecord(eRecord);
  }
}
