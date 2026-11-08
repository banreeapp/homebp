import { BPRecord, TSHCategory, TSHCategoryInfo, TSHSummaryReport } from '../types/bloodPressure';

export const TSH_CATEGORIES: Record<TSHCategory, TSHCategoryInfo> = {
  optimal: {
    key: 'optimal',
    labelTh: 'เหมาะสมยอดเยี่ยม',
    labelEn: 'Optimal',
    sysRange: '< 120',
    diaRange: '< 80',
    color: '#006948',
    bgColor: '#e6f7ef',
    borderColor: '#85f8c4',
    textColor: '#004d35',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    adviceTh: 'ความดันโลหิตอยู่ในเกณฑ์เหมาะสมยอดเยี่ยม รักษาวิถีชีวิตสุขภาพดี ออกกำลังกายสม่ำเสมอ และควบคุมอาหาร',
    isHypertension: false,
  },
  normal: {
    key: 'normal',
    labelTh: 'ความดันปกติ',
    labelEn: 'Normal',
    sysRange: '120 - 129',
    diaRange: '80 - 84',
    color: '#00855d',
    bgColor: '#edfbf4',
    borderColor: '#a3f3cb',
    textColor: '#005a3e',
    badgeClass: 'bg-green-100 text-green-800 border-green-300',
    adviceTh: 'ความดันโลหิตปกติ ควรตรวจติดตามเป็นประจำ และดูแลสุขภาพตามปกติ',
    isHypertension: false,
  },
  high_normal: {
    key: 'high_normal',
    labelTh: 'ปกติค่อนข้างสูง (เริ่มเสี่ยง)',
    labelEn: 'High Normal / Prehypertension',
    sysRange: '130 - 134',
    diaRange: '80 - 84',
    color: '#b38000',
    bgColor: '#fff9e6',
    borderColor: '#ffe08a',
    textColor: '#704f00',
    badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
    adviceTh: 'ความดันเริ่มปริ่มสูง ควรปรับเปลี่ยนพฤติกรรม: ลดเค็ม ลดของทอด ออกกำลังกายสม่ำเสมอ และบันทึกติดตามต่อเนื่อง',
    isHypertension: false,
  },
  stage1: {
    key: 'stage1',
    labelTh: 'ความดันโลหิตสูงระดับ 1',
    labelEn: 'Stage 1 Hypertension',
    sysRange: '135 - 149',
    diaRange: '85 - 94',
    color: '#e65100',
    bgColor: '#fff3e0',
    borderColor: '#ffcc80',
    textColor: '#bf360c',
    badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
    adviceTh: 'เกินเกณฑ์มาตรฐานการวัดที่บ้านของ TSH (≥ 135/85 mmHg) นำบันทึก 7 วันนี้ไปปรึกษาแพทย์เพื่อพิจารณาการรักษาหรือปรับยา',
    isHypertension: true,
  },
  stage2: {
    key: 'stage2',
    labelTh: 'ความดันโลหิตสูงระดับ 2',
    labelEn: 'Stage 2 Hypertension',
    sysRange: '150 - 179',
    diaRange: '95 - 109',
    color: '#b7102a',
    bgColor: '#ffebee',
    borderColor: '#ffcdd2',
    textColor: '#880e4f',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
    adviceTh: 'ความดันสูงชัดเจน ควรรับประทานยาสม่ำเสมอตามแพทย์สั่ง และนำสมุดบันทึกไปพบแพทย์ตามนัดหรือปรึกษาแพทย์โดยเร็ว',
    isHypertension: true,
  },
  crisis: {
    key: 'crisis',
    labelTh: 'วิกฤตความดันโลหิตสูง (อันตราย)',
    labelEn: 'Hypertensive Urgency / Emergency',
    sysRange: '≥ 180',
    diaRange: '≥ 110',
    color: '#900c1e',
    bgColor: '#ffebee',
    borderColor: '#e57373',
    textColor: '#b7102a',
    badgeClass: 'bg-red-200 text-red-950 border-red-500 font-bold animate-pulse',
    adviceTh: 'คำเตือนเร่งด่วน: ให้นั่งพักนิ่งๆ 15 นาทีแล้ววัดซ้ำ หากยังสูงเกิน 180/110 หรือมีอาการปวดศีรษะรุนแรง แน่นหน้าอก หอบเหนื่อย ตาพร่ามัว ชาครึ่งซีก ควรรีบไปโรงพยาบาลทันที!',
    isHypertension: true,
  },
};

/**
 * Classifies a blood pressure reading according to Thai Society of Hypertension (TSH)
 * HBPM (Home Blood Pressure Monitoring) standards.
 * Threshold for hypertension at home is ≥ 135/85 mmHg.
 */
export function classifyTSH(sys: number, dia: number): TSHCategory {
  if (sys >= 180 || dia >= 110) {
    return 'crisis';
  }
  if (sys >= 150 || dia >= 95) {
    return 'stage2';
  }
  if (sys >= 135 || dia >= 85) {
    return 'stage1';
  }
  if ((sys >= 130 && sys <= 134) || (dia >= 80 && dia <= 84)) {
    return 'high_normal';
  }
  if ((sys >= 120 && sys <= 129) || (dia >= 80 && dia <= 84)) {
    return 'normal';
  }
  return 'optimal';
}

/**
 * Calculates session average from readings
 */
export function calculateSessionAverage(
  r1: { sys: number; dia: number; pulse: number },
  r2: { sys: number; dia: number; pulse: number },
  r3?: { sys: number; dia: number; pulse: number }
) {
  if (r3 && r3.sys > 0 && r3.dia > 0) {
    const avgSys = Math.round((r1.sys + r2.sys + r3.sys) / 3);
    const avgDia = Math.round((r1.dia + r2.dia + r3.dia) / 3);
    const avgPulse = Math.round((r1.pulse + r2.pulse + r3.pulse) / 3);
    return { avgSys, avgDia, avgPulse, category: classifyTSH(avgSys, avgDia) };
  }

  const avgSys = Math.round((r1.sys + r2.sys) / 2);
  const avgDia = Math.round((r1.dia + r2.dia) / 2);
  const avgPulse = Math.round((r1.pulse + r2.pulse) / 2);
  return { avgSys, avgDia, avgPulse, category: classifyTSH(avgSys, avgDia) };
}

/**
 * Computes official TSH 7-Day Protocol Summary
 * In standard TSH protocol:
 * - Day 1 is discarded (familiarization/adjustment phase)
 * - Clinical diagnosis is based on Day 2 - Day 7 averages (ideal: at least 12 readings)
 * - TSH threshold for home BP control is mean < 135/85 mmHg
 */
export function generateTSHReport(records: BPRecord[]): TSHSummaryReport {
  const recordedSessionsCount = records.length;
  const completionPercentage = Math.round((recordedSessionsCount / 14) * 100);

  // Group by dayIndex
  const daysPresent = new Set(records.map(r => r.dayIndex)).size;

  // Day 2-7 filter (TSH standard)
  const day2to7Records = records.filter(r => r.dayIndex >= 2 && r.dayIndex <= 7);
  const day2to7Count = day2to7Records.length;
  const isProtocolValid = day2to7Count >= 6; // At least 6 sessions (ideal is 12)

  const calcMean = (list: BPRecord[], key: 'avgSys' | 'avgDia' | 'avgPulse') => {
    if (list.length === 0) return 0;
    const sum = list.reduce((acc, curr) => acc + (curr[key] || 0), 0);
    return Math.round(sum / list.length);
  };

  const tshSys = calcMean(day2to7Records.length > 0 ? day2to7Records : records, 'avgSys');
  const tshDia = calcMean(day2to7Records.length > 0 ? day2to7Records : records, 'avgDia');
  const tshPulse = calcMean(day2to7Records.length > 0 ? day2to7Records : records, 'avgPulse');

  const allSys = calcMean(records, 'avgSys');
  const allDia = calcMean(records, 'avgDia');
  const allPulse = calcMean(records, 'avgPulse');

  const morningRecords = records.filter(r => r.period === 'morning');
  const eveningRecords = records.filter(r => r.period === 'evening');

  const morningSys = calcMean(morningRecords, 'avgSys');
  const morningDia = calcMean(morningRecords, 'avgDia');
  const morningPulse = calcMean(morningRecords, 'avgPulse');

  const eveningSys = calcMean(eveningRecords, 'avgSys');
  const eveningDia = calcMean(eveningRecords, 'avgDia');
  const eveningPulse = calcMean(eveningRecords, 'avgPulse');

  const morningSurge = morningSys > 0 && eveningSys > 0 ? morningSys - eveningSys : 0;
  const isMorningSurgeSignificant = morningSurge >= 15; // > 15-20 mmHg is clinically notable in Thai guidelines

  const pulsePressure = tshSys > 0 && tshDia > 0 ? tshSys - tshDia : 0;
  const isUnderControl = tshSys > 0 && tshSys < 135 && tshDia < 85;

  const category = classifyTSH(tshSys, tshDia);

  // Clinical interpretation text
  let clinicalInterpretation = '';
  if (tshSys === 0) {
    clinicalInterpretation = 'ยังไม่มีข้อมูลการบันทึกเพียงพอ กรุณาเริ่มบันทึกตามรอบ 7 วัน';
  } else if (isUnderControl) {
    clinicalInterpretation = `ควบคุมความดันโลหิตได้ดีตามเป้าหมายของ TSH (ค่าเฉลี่ยวันที่ 2-7 คือ ${tshSys}/${tshDia} mmHg ซึ่งต่ำกว่าเกณฑ์ 135/85 mmHg)`;
  } else {
    clinicalInterpretation = `ค่าเฉลี่ยความดันโลหิตที่บ้าน (${tshSys}/${tshDia} mmHg) สูงกว่าเกณฑ์เป้าหมายมาตรฐานของสมาคมความดันโลหิตสูงแห่งประเทศไทย (< 135/85 mmHg) ควรนำผลนี้ปรึกษาแพทย์`;
  }

  const lifestyleAdvice = [
    'ลดอาหารรสเค็ม อาหารแปรรูป และผงชูรส (โซเดียมไม่เกิน 2,000 มก./วัน หรือเกลือแกง 1 ช้อนชา)',
    'ออกกำลังกายแบบแอโรบิกปานกลาง เช่น เดินเร็ว ว่ายน้ำ วันละ 30 นาที อย่างน้อย 5 วัน/สัปดาห์',
    'ควบคุมน้ำหนักตัวให้อยู่ในเกณฑ์เหมาะสม (BMI 18.5 - 22.9 กก./ตร.ม. สำหรับคนไทย)',
    'งดหรือจำกัดการดื่มเครื่องดื่มแอลกอฮอล์ และงดสูบบุหรี่โดยเด็ดขาด',
    'นอนหลับพักผ่อนให้เพียงพอ 7-8 ชั่วโมง และจัดการความเครียดอย่างเหมาะสม',
    'รับประทานยาลดความดันโลหิตสม่ำเสมอตามแพทย์สั่ง ห้ามหยุดยาหรือปรับขนาดยาเอง'
  ];

  return {
    dayCount: daysPresent,
    recordedSessionsCount,
    completionPercentage,
    day2to7Count,
    isProtocolValid,
    tshSys,
    tshDia,
    tshPulse,
    allSys,
    allDia,
    allPulse,
    morningSys,
    morningDia,
    morningPulse,
    eveningSys,
    eveningDia,
    eveningPulse,
    morningSurge,
    isMorningSurgeSignificant,
    pulsePressure,
    isUnderControl,
    category,
    clinicalInterpretation,
    lifestyleAdvice,
  };
}

export const TSH_CHECKLIST_ITEMS = [
  {
    id: 'rest',
    label: 'นั่งพักผ่อนในที่สงบอย่างน้อย 5 นาที ก่อนเริ่มวัด',
    icon: 'couch',
  },
  {
    id: 'no_substances',
    label: 'งดดื่มชา กาแฟ น้ำอัดลม และงดสูบบุหรี่ ก่อนวัด 30 นาที',
    icon: 'coffee-off',
  },
  {
    id: 'urinate',
    label: 'ปัสสาวะให้เรียบร้อย (ไม่กลั้นปัสสาวะขณะวัด)',
    icon: 'toilet',
  },
  {
    id: 'posture',
    label: 'นั่งเก้าอี้หลังพิงพนัก เท้าทั้งสองข้างวางราบกับพื้น ไม่ไขว่ห้าง',
    icon: 'chair',
  },
  {
    id: 'cuff_level',
    label: 'วางแขนบนโต๊ะ ปลอกแขน (Cuff) อยู่ระดับเดียวกับหัวใจ',
    icon: 'heart',
  },
  {
    id: 'silence',
    label: 'ไม่พูดคุยหรือขยับตัวระหว่างเครื่องกำลังวัดความดัน',
    icon: 'message-square-off',
  },
];
