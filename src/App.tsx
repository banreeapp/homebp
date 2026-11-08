/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  auth, 
  onAuthStateChanged, 
  loginWithGoogle, 
  logoutUser, 
  testConnection, 
  User 
} from './lib/firebase';
import { 
  BPRecord, 
  MonitoringSession, 
  UserProfile, 
  MeasurementPeriod 
} from './types/bloodPressure';
import { 
  getUserProfile, 
  saveUserProfile, 
  getSessions, 
  createMonitoringSession, 
  subscribeToRecords, 
  saveBPRecord, 
  deleteBPRecord, 
  seedDemo7DayData 
} from './services/bpService';
import { generateTSHReport } from './utils/tshGuidelines';
import { Header } from './components/Header';
import { ProtocolTimeline } from './components/ProtocolTimeline';
import { TshReportSummary } from './components/TshReportSummary';
import { TrendChart } from './components/TrendChart';
import { MeasurementModal } from './components/MeasurementModal';
import { DoctorPrintReport } from './components/DoctorPrintReport';
import { GuidelineModal } from './components/GuidelineModal';
import { PatientProfileModal } from './components/PatientProfileModal';
import { Heart, Sparkles, CheckCircle2, ShieldCheck, LogIn, ArrowRight, AlertCircle } from 'lucide-react';

interface ActiveUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  isGuest?: boolean;
}

export default function App() {
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(() => {
    // Check if guest session exists in localStorage
    const savedGuest = localStorage.getItem('tsh_active_guest');
    return savedGuest ? JSON.parse(savedGuest) : null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<MonitoringSession[]>([]);
  const [currentSession, setCurrentSession] = useState<MonitoringSession | null>(null);
  const [records, setRecords] = useState<BPRecord[]>([]);

  // Modals
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1);
  const [selectedPeriod, setSelectedPeriod] = useState<MeasurementPeriod>('morning');
  const [selectedRecord, setSelectedRecord] = useState<BPRecord | undefined>(undefined);

  const [isPrintReportOpen, setIsPrintReportOpen] = useState(false);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);
  const [loginError, setLoginError] = useState<string>('');

  // Connection test on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Clear local guest if signed into real Firebase account
        localStorage.removeItem('tsh_active_guest');
        const userObj: ActiveUser = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          isGuest: false,
        };
        setActiveUser(userObj);
        await initUserData(userObj);
      } else {
        // If no Firebase user, check if there's an active local guest
        const savedGuest = localStorage.getItem('tsh_active_guest');
        if (savedGuest) {
          const guestObj = JSON.parse(savedGuest);
          setActiveUser(guestObj);
          await initUserData(guestObj);
        } else {
          setActiveUser(null);
          setProfile(null);
          setSessions([]);
          setCurrentSession(null);
          setRecords([]);
        }
      }
      setIsLoadingAuth(false);
    });

    return () => unsubscribe();
  }, []);

  // Helper to load or initialize user data
  const initUserData = async (usr: ActiveUser) => {
    try {
      let userProf = await getUserProfile(usr.uid);
      if (!userProf) {
        userProf = {
          uid: usr.uid,
          displayName: usr.displayName || (usr.isGuest ? 'ผู้ป่วย (โหมดทดลอง)' : 'ผู้รับการตรวจ'),
          email: usr.email || undefined,
          hasHypertensionDiagnosis: true,
          takingMedication: false,
          targetSys: 135,
          targetDia: 85,
          createdAt: new Date().toISOString(),
        };
        await saveUserProfile(userProf);
      }
      setProfile(userProf);

      const sessList = await getSessions(usr.uid);
      if (sessList && sessList.length > 0) {
        setSessions(sessList);
        setCurrentSession(sessList[0]);
      } else {
        const newSess = await createMonitoringSession(usr.uid);
        setSessions([newSess]);
        setCurrentSession(newSess);
      }
    } catch (err) {
      console.error('Error initializing user data:', err);
    }
  };

  // Subscribe to records of active session
  useEffect(() => {
    if (!activeUser || !currentSession) {
      setRecords([]);
      return;
    }

    const unsubscribe = subscribeToRecords(activeUser.uid, currentSession.id, (updatedRecords) => {
      setRecords(updatedRecords);

      // Trigger celebration if all 14 completed
      if (updatedRecords.length === 14) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#b7102a', '#ffb702', '#006948', '#181a2e'],
        });
      }
    });

    return () => unsubscribe();
  }, [activeUser, currentSession]);

  // Compute TSH Report
  const tshReport = generateTSHReport(records);

  // Handlers
  const handleOpenRecordModal = (dayIndex: number, period: MeasurementPeriod, existingRecord?: BPRecord) => {
    setSelectedDayIndex(dayIndex);
    setSelectedPeriod(period);
    setSelectedRecord(existingRecord);
    setIsRecordModalOpen(true);
  };

  const handleSaveRecord = async (newRecord: BPRecord) => {
    await saveBPRecord(newRecord);
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!activeUser) return;
    await deleteBPRecord(activeUser.uid, recordId, currentSession?.id);
  };

  const handleLoadDemoData = async () => {
    if (!activeUser || !currentSession) return;
    try {
      setIsLoadingDemo(true);
      await seedDemo7DayData(activeUser.uid, currentSession.id, currentSession.startDate);
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.5 },
      });
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการโหลดข้อมูลตัวอย่าง');
    } finally {
      setIsLoadingDemo(false);
    }
  };

  const handleStartNewCycle = async (title: string, startDate: string) => {
    if (!activeUser) return;
    const newSess = await createMonitoringSession(activeUser.uid, title, startDate);
    setSessions([newSess, ...sessions]);
    setCurrentSession(newSess);
  };

  // Google Sign-In Handler
  const handleGoogleLogin = async () => {
    setLoginError('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        setLoginError('หน้าต่างเข้าสู่ระบบถูกปิด กรุณาลองใหม่อีกครั้ง');
      } else if (err.code === 'auth/popup-blocked') {
        setLoginError('เบราว์เซอร์บล็อกป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับหน้านี้แล้วลองใหม่');
      } else {
        setLoginError(err.message || 'ไม่สามารถเข้าสู่ระบบ Google ได้');
      }
    }
  };

  // Local Guest Mode Handler (Safe, zero Firebase error)
  const handleStartGuestMode = async () => {
    const guestUser: ActiveUser = {
      uid: 'guest_local_user',
      displayName: 'ผู้ป่วย (โหมดทดลองใช้งาน)',
      email: null,
      isGuest: true,
    };
    localStorage.setItem('tsh_active_guest', JSON.stringify(guestUser));
    setActiveUser(guestUser);
    await initUserData(guestUser);
  };

  const handleLogout = async () => {
    localStorage.removeItem('tsh_active_guest');
    await logoutUser();
    setActiveUser(null);
    setProfile(null);
    setSessions([]);
    setCurrentSession(null);
    setRecords([]);
  };

  const handleExportCsv = () => {
    if (records.length === 0) {
      alert('ยังไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = [
      'Day',
      'Period',
      'Date',
      'Time',
      'SYS_Avg',
      'DIA_Avg',
      'Pulse_Avg',
      'Category',
      'Reading1_SYS',
      'Reading1_DIA',
      'Reading1_Pulse',
      'Reading2_SYS',
      'Reading2_DIA',
      'Reading2_Pulse',
      'Arm',
      'MedicationTaken',
      'Symptoms',
      'Note'
    ];

    const rows = records.map(r => [
      r.dayIndex,
      r.period,
      r.date,
      r.measuredAt,
      r.avgSys,
      r.avgDia,
      r.avgPulse,
      r.category,
      r.sys1,
      r.dia1,
      r.pulse1,
      r.sys2,
      r.dia2,
      r.pulse2,
      r.armUsed,
      r.medicationTaken ? 'Yes' : 'No',
      `"${r.symptoms || ''}"`,
      `"${r.note || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TSH_HomeBP_Report_${currentSession?.startDate || '7days'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // If loading auth
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-14 h-14 bg-[#b7102a] text-white rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-[0_4px_0_#8f0d20]">
            <Heart className="w-8 h-8 fill-white" />
          </div>
          <p className="font-extrabold text-[#181A2E] text-base font-display">
            กำลังโหลดระบบบันทึกความดันโลหิต TSH...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in: Welcome & One-Click Start
  if (!activeUser) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between">
        
        {/* Simple Top Bar */}
        <header className="bg-white border-b border-[#181A2E]/10 py-3.5 px-4 sm:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#b7102a] text-white flex items-center justify-center shadow-[0_3px_0_#8f0d20]">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <span className="font-display font-extrabold text-lg sm:text-xl text-[#181A2E]">
                ระบบบันทึกความดันโลหิตที่บ้าน 7 วัน
              </span>
            </div>
            <span className="text-xs font-bold text-[#006948] bg-[#e6f7ef] px-3 py-1 rounded-full border border-emerald-200">
              มาตรฐานสมาคมความดันโลหิตสูงไทย (TSH)
            </span>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-4xl mx-auto px-4 py-12 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#ffb702]/20 border border-[#ffb702]/50 text-[#7d5800] text-xs sm:text-sm font-extrabold">
            <ShieldCheck className="w-4 h-4" />
            <span>แนวทางเวชปฏิบัติ Home Blood Pressure Monitoring (HBPM)</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl font-black text-[#181A2E] tracking-tight font-display leading-tight">
              บันทึกและติดตามความดันโลหิตที่บ้าน<br />
              <span className="text-[#b7102a]">ต่อเนื่อง 7 วัน (เช้า-เย็น)</span>
            </h1>
            <p className="text-sm sm:text-base text-[#181A2E]/70 max-w-2xl mx-auto leading-relaxed">
              ปฏิบัติตามแนวทางของ <strong>สมาคมความดันโลหิตสูงแห่งประเทศไทย (TSH)</strong> วัด 2 ครั้งต่อวัน (เช้าก่อนอาหาร/ยา และเย็นก่อนนอน) รอบละ 2 ครั้งเพื่อตัดผลกระทบจากความตื่นเต้น พร้อมประเมินค่าเฉลี่ยวันที่ 2-7 และออกรายงานสรุปสำหรับนำไปพบแพทย์
            </p>
          </div>

          {loginError && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-900 rounded-xl max-w-md mx-auto text-xs font-bold flex items-center gap-2 text-left">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={handleGoogleLogin}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#b7102a] hover:bg-[#db313f] text-white font-extrabold text-sm sm:text-base rounded-2xl btn-primary-shelf flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <LogIn className="w-5 h-5" />
              <span>เข้าสู่ระบบด้วยบัญชี Google (คลาวด์ Firebase)</span>
            </button>
            <button
              onClick={handleStartGuestMode}
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#fbf8ff] text-[#181A2E] font-bold text-sm sm:text-base rounded-2xl border-1.5 border-[#181A2E]/20 btn-secondary-shelf flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>ทดลองใช้งานทันที (Guest Mode)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 3 Core Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-8 text-left">
            <div className="bg-white p-5 rounded-2xl card-tactile space-y-2">
              <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-black text-sm">
                7
              </span>
              <h3 className="font-extrabold text-sm text-[#181A2E]">บันทึกต่อเนื่อง 7 วัน</h3>
              <p className="text-xs text-[#181A2E]/70 leading-relaxed">
                วัดวันละ 2 เวลา: เช้าหลังตื่นนอน และเย็นก่อนนอน ตามข้อแนะนำสมาคม TSH
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl card-tactile space-y-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-sm">
                2
              </span>
              <h3 className="font-extrabold text-sm text-[#181A2E]">วัดรอบละ 2 ครั้ง</h3>
              <p className="text-xs text-[#181A2E]/70 leading-relaxed">
                มีนาฬิกาจับเวลานั่งพัก 1 นาทีระหว่างครั้งที่ 1 และ 2 พร้อมหาค่าเฉลี่ยอัตโนมัติ
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl card-tactile space-y-2">
              <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-black text-sm">
                📋
              </span>
              <h3 className="font-extrabold text-sm text-[#181A2E]">รายงานพบแพทย์มาตรฐาน</h3>
              <p className="text-xs text-[#181A2E]/70 leading-relaxed">
                คำนวณค่าเฉลี่ยวันที่ 2-7 ตรวจสอบ Morning Surge และพิมพ์แบบฟอร์ม A4 ได้ทันที
              </p>
            </div>
          </div>

        </main>

        {/* Footer */}
        <footer className="py-4 text-center text-xs text-[#181A2E]/50 border-t border-[#181A2E]/10 bg-white">
          พัฒนาตามข้อแนะนำสมาคมความดันโลหิตสูงแห่งประเทศไทย (TSH) • จัดเก็บข้อมูลบน Firebase: homebp-d5f86
        </footer>

      </div>
    );
  }

  // Authenticated Main View
  return (
    <div className="min-h-screen bg-[#FDFBF7] text-[#181A2E] flex flex-col justify-between">
      
      <div>
        {/* Top Header */}
        <Header
          user={activeUser as any}
          profile={profile}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenGuidelines={() => setIsGuidelinesOpen(true)}
          onOpenPrintReport={() => setIsPrintReportOpen(true)}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
          onLoadDemoData={handleLoadDemoData}
          onNewCycle={() => {
            setIsProfileOpen(true);
          }}
          isLoadingDemo={isLoadingDemo}
        />

        {/* Main Body */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          
          {/* Guest Mode notice banner if in guest mode */}
          {activeUser.isGuest && (
            <div className="bg-[#fff9e6] border border-[#ffe08a] rounded-2xl p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-[#7d5800]">
                <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                <span>
                  <strong>โหมดทดลองใช้งานในเครื่อง (Guest Mode):</strong> ข้อมูลจะถูกบันทึกในเบราว์เซอร์นี้ หากต้องการบันทึกขึ้นคลาวด์ Firebase ถาวร สามารถเข้าสู่ระบบด้วย Google ได้ตลอดเวลา
                </span>
              </div>
              <button
                onClick={handleGoogleLogin}
                className="px-3.5 py-1.5 bg-[#b7102a] text-white font-extrabold rounded-xl btn-primary-shelf shrink-0 cursor-pointer flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>เข้าสู่ระบบ Google</span>
              </button>
            </div>
          )}

          {/* TSH Diagnostic Report Summary */}
          <TshReportSummary
            report={tshReport}
            patientName={profile?.displayName}
            onOpenPrintReport={() => setIsPrintReportOpen(true)}
          />

          {/* 7-Day Protocol Timeline Grid */}
          <ProtocolTimeline
            startDate={currentSession?.startDate || new Date().toISOString().split('T')[0]}
            records={records}
            onOpenRecordModal={handleOpenRecordModal}
            onDeleteRecord={handleDeleteRecord}
          />

          {/* 7-Day Trend Chart */}
          <TrendChart
            records={records}
            startDateStr={currentSession?.startDate || new Date().toISOString().split('T')[0]}
          />

        </main>
      </div>

      {/* Footer */}
      <footer className="no-print py-6 mt-12 text-center text-xs text-[#181A2E]/60 border-t border-[#181A2E]/10 bg-white space-y-1">
        <p className="font-semibold text-[#181A2E]/80">
          ระบบบันทึกความดันโลหิตที่บ้านตามแนวทางสมาคมความดันโลหิตสูงแห่งประเทศไทย (Thai Society of Hypertension - TSH)
        </p>
        <p className="text-[11px] text-[#181A2E]/50">
          Firebase Project: homebp-d5f86 • เกณฑ์วินิจฉัยความดันโลหิตสูงที่บ้าน &ge; 135/85 mmHg
        </p>
      </footer>

      {/* Measurement Modal */}
      <MeasurementModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        dayIndex={selectedDayIndex}
        period={selectedPeriod}
        dateStr={(() => {
          const base = new Date(currentSession?.startDate || new Date());
          base.setDate(base.getDate() + (selectedDayIndex - 1));
          return base.toISOString().split('T')[0];
        })()}
        userId={activeUser.uid}
        sessionId={currentSession?.id || 'default_session'}
        existingRecord={selectedRecord}
        onSave={handleSaveRecord}
      />

      {/* Printable Doctor Report */}
      <DoctorPrintReport
        isOpen={isPrintReportOpen}
        onClose={() => setIsPrintReportOpen(false)}
        session={currentSession}
        profile={profile}
        records={records}
        report={tshReport}
      />

      {/* Educational Guidelines Modal */}
      <GuidelineModal
        isOpen={isGuidelinesOpen}
        onClose={() => setIsGuidelinesOpen(false)}
      />

      {/* Patient Profile & Cycles Modal */}
      <PatientProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        profile={profile}
        sessions={sessions}
        currentSessionId={currentSession?.id || ''}
        onSaveProfile={async (upd) => {
          await saveUserProfile(upd);
          setProfile(upd);
        }}
        onStartNewCycle={handleStartNewCycle}
        onSelectSession={(sessId) => {
          const target = sessions.find(s => s.id === sessId);
          if (target) setCurrentSession(target);
          setIsProfileOpen(false);
        }}
        onExportCsv={handleExportCsv}
      />

    </div>
  );
}
