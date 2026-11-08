export type MeasurementPeriod = 'morning' | 'evening';

export type TSHCategory =
  | 'optimal'      // < 120 / < 80
  | 'normal'       // 120-129 / 80-84
  | 'high_normal'  // 130-134 / 80-84 (TSH Prehypertension)
  | 'stage1'       // 135-149 / 85-94 (TSH Stage 1 HT for Home BP)
  | 'stage2'       // 150-179 / 95-109
  | 'crisis';      // >= 180 / >= 110 (Urgent Medical Review)

export interface TSHCategoryInfo {
  key: TSHCategory;
  labelTh: string;
  labelEn: string;
  sysRange: string;
  diaRange: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  badgeClass: string;
  adviceTh: string;
  isHypertension: boolean;
}

export interface BPRecord {
  id: string;
  userId: string;
  sessionId: string;
  dayIndex: number; // 1 to 7
  period: MeasurementPeriod; // 'morning' | 'evening'
  date: string; // YYYY-MM-DD
  measuredAt: string; // HH:mm or ISO
  sys1: number;
  dia1: number;
  pulse1: number;
  sys2: number;
  dia2: number;
  pulse2: number;
  sys3?: number;
  dia3?: number;
  pulse3?: number;
  avgSys: number;
  avgDia: number;
  avgPulse: number;
  category: TSHCategory;
  armUsed: 'left' | 'right';
  medicationTaken: boolean;
  symptoms: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringSession {
  id: string;
  userId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  title: string;
  status: 'in_progress' | 'completed' | 'archived';
  completedReadingsCount: number; // 0 to 14
  tshAverageSys?: number; // Days 2-7 mean (TSH Gold Standard)
  tshAverageDia?: number; // Days 2-7 mean
  tshAveragePulse?: number;
  overallAverageSys?: number; // All 7 days
  overallAverageDia?: number;
  morningAverageSys?: number;
  morningAverageDia?: number;
  eveningAverageSys?: number;
  eveningAverageDia?: number;
  morningSurge?: number; // Morning SYS - Evening SYS
  tshDiagnosis?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  hasHypertensionDiagnosis?: boolean;
  takingMedication?: boolean;
  targetSys?: number; // Default 135 mmHg
  targetDia?: number; // Default 85 mmHg
  medicationList?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TSHSummaryReport {
  dayCount: number;
  recordedSessionsCount: number; // out of 14
  completionPercentage: number;
  day2to7Count: number; // out of 12 (Days 2-7 x 2)
  isProtocolValid: boolean; // At least 12 readings across days 2-7 as per TSH recommendations
  tshSys: number; // Day 2-7 mean
  tshDia: number; // Day 2-7 mean
  tshPulse: number;
  allSys: number; // All days mean
  allDia: number;
  allPulse: number;
  morningSys: number;
  morningDia: number;
  morningPulse: number;
  eveningSys: number;
  eveningDia: number;
  eveningPulse: number;
  morningSurge: number; // morningSys - eveningSys
  isMorningSurgeSignificant: boolean; // difference > 15-20 mmHg
  pulsePressure: number; // sys - dia
  isUnderControl: boolean; // sys < 135 and dia < 85
  category: TSHCategory;
  clinicalInterpretation: string;
  lifestyleAdvice: string[];
}
