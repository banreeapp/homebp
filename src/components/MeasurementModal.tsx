import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Clock, 
  Timer, 
  CheckCircle2, 
  AlertTriangle, 
  Play, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Heart,
  Pill,
  HelpCircle
} from 'lucide-react';
import { BPRecord, MeasurementPeriod, TSHCategory } from '../types/bloodPressure';
import { calculateSessionAverage, classifyTSH, TSH_CATEGORIES, TSH_CHECKLIST_ITEMS } from '../utils/tshGuidelines';

interface MeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayIndex: number;
  period: MeasurementPeriod;
  dateStr: string;
  userId: string;
  sessionId: string;
  existingRecord?: BPRecord;
  onSave: (record: BPRecord) => Promise<void>;
}

export const MeasurementModal: React.FC<MeasurementModalProps> = ({
  isOpen,
  onClose,
  dayIndex,
  period,
  dateStr,
  userId,
  sessionId,
  existingRecord,
  onSave,
}) => {
  // Reading 1
  const [sys1, setSys1] = useState<string>(existingRecord?.sys1?.toString() || '');
  const [dia1, setDia1] = useState<string>(existingRecord?.dia1?.toString() || '');
  const [pulse1, setPulse1] = useState<string>(existingRecord?.pulse1?.toString() || '');

  // Reading 2
  const [sys2, setSys2] = useState<string>(existingRecord?.sys2?.toString() || '');
  const [dia2, setDia2] = useState<string>(existingRecord?.dia2?.toString() || '');
  const [pulse2, setPulse2] = useState<string>(existingRecord?.pulse2?.toString() || '');

  // Optional Reading 3
  const [showReading3, setShowReading3] = useState<boolean>(Boolean(existingRecord?.sys3));
  const [sys3, setSys3] = useState<string>(existingRecord?.sys3?.toString() || '');
  const [dia3, setDia3] = useState<string>(existingRecord?.dia3?.toString() || '');
  const [pulse3, setPulse3] = useState<string>(existingRecord?.pulse3?.toString() || '');

  // Metadata
  const [measuredAt, setMeasuredAt] = useState<string>(
    existingRecord?.measuredAt || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false })
  );
  const [armUsed, setArmUsed] = useState<'left' | 'right'>(existingRecord?.armUsed || 'right');
  const [medicationTaken, setMedicationTaken] = useState<boolean>(existingRecord?.medicationTaken || false);
  const [symptoms, setSymptoms] = useState<string>(existingRecord?.symptoms || '');
  const [note, setNote] = useState<string>(existingRecord?.note || '');
  const [showChecklist, setShowChecklist] = useState<boolean>(false);

  // 1-minute Rest Timer between Reading 1 and Reading 2
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Reset form when opened or target changed
  useEffect(() => {
    if (existingRecord) {
      setSys1(existingRecord.sys1?.toString() || '');
      setDia1(existingRecord.dia1?.toString() || '');
      setPulse1(existingRecord.pulse1?.toString() || '');
      setSys2(existingRecord.sys2?.toString() || '');
      setDia2(existingRecord.dia2?.toString() || '');
      setPulse2(existingRecord.pulse2?.toString() || '');
      setSys3(existingRecord.sys3?.toString() || '');
      setDia3(existingRecord.dia3?.toString() || '');
      setPulse3(existingRecord.pulse3?.toString() || '');
      setShowReading3(Boolean(existingRecord.sys3));
      setMeasuredAt(existingRecord.measuredAt || '08:00');
      setArmUsed(existingRecord.armUsed || 'right');
      setMedicationTaken(existingRecord.medicationTaken || false);
      setSymptoms(existingRecord.symptoms || '');
      setNote(existingRecord.note || '');
    } else {
      setSys1('');
      setDia1('');
      setPulse1('');
      setSys2('');
      setDia2('');
      setPulse2('');
      setSys3('');
      setDia3('');
      setPulse3('');
      setShowReading3(false);
      setMeasuredAt(new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false }));
      setArmUsed('right');
      setMedicationTaken(period === 'morning' ? false : true); // Morning typically before meds in TSH protocol
      setSymptoms('');
      setNote('');
    }
    setTimerSeconds(60);
    setIsTimerRunning(false);
    setTimerCompleted(false);
    setErrorMsg('');
  }, [existingRecord, dayIndex, period, isOpen]);

  // Countdown timer loop
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setTimerCompleted(true);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen) return null;

  // Number parses
  const s1 = parseInt(sys1, 10) || 0;
  const d1 = parseInt(dia1, 10) || 0;
  const p1 = parseInt(pulse1, 10) || 0;
  const s2 = parseInt(sys2, 10) || 0;
  const d2 = parseInt(dia2, 10) || 0;
  const p2 = parseInt(pulse2, 10) || 0;
  const s3 = parseInt(sys3, 10) || 0;
  const d3 = parseInt(dia3, 10) || 0;
  const p3 = parseInt(pulse3, 10) || 0;

  // Check if readings differ by > 5 mmHg
  const diffSys = (s1 > 0 && s2 > 0) ? Math.abs(s1 - s2) : 0;
  const diffDia = (d1 > 0 && d2 > 0) ? Math.abs(d1 - d2) : 0;
  const shouldRecommendReading3 = diffSys > 5 || diffDia > 5;

  // Calculate live average
  let liveAverage: { avgSys: number; avgDia: number; avgPulse: number; category: TSHCategory } | null = null;
  if (s1 > 0 && d1 > 0 && s2 > 0 && d2 > 0) {
    liveAverage = calculateSessionAverage(
      { sys: s1, dia: d1, pulse: p1 || 75 },
      { sys: s2, dia: d2, pulse: p2 || 75 },
      showReading3 && s3 > 0 && d3 > 0 ? { sys: s3, dia: d3, pulse: p3 || 75 } : undefined
    );
  }

  const liveCategoryInfo = liveAverage ? TSH_CATEGORIES[liveAverage.category] : null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!s1 || !d1 || !p1) {
      setErrorMsg('กรุณากรอกผลการวัดครั้งที่ 1 ให้ครบถ้วน');
      return;
    }
    if (!s2 || !d2 || !p2) {
      setErrorMsg('กรุณากรอกผลการวัดครั้งที่ 2 ให้ครบถ้วน (ตามแนวทาง TSH ต้องวัด 2 ครั้งห่างกัน 1-2 นาที)');
      return;
    }

    if (s1 < 50 || s1 > 280 || d1 < 30 || d1 > 180 || s2 < 50 || s2 > 280 || d2 < 30 || d2 > 180) {
      setErrorMsg('ค่าความดันโลหิตที่กรอกอยู่นอกช่วงทางสรีรวิทยาที่เป็นไปได้ (50-280 / 30-180 mmHg)');
      return;
    }

    const calculated = calculateSessionAverage(
      { sys: s1, dia: d1, pulse: p1 },
      { sys: s2, dia: d2, pulse: p2 },
      showReading3 && s3 > 0 && d3 > 0 ? { sys: s3, dia: d3, pulse: p3 } : undefined
    );

    const recordToSave: BPRecord = {
      id: existingRecord?.id || `rec_${dayIndex}_${period}_${Date.now()}`,
      userId,
      sessionId,
      dayIndex,
      period,
      date: dateStr,
      measuredAt,
      sys1: s1,
      dia1: d1,
      pulse1: p1,
      sys2: s2,
      dia2: d2,
      pulse2: p2,
      sys3: showReading3 && s3 > 0 ? s3 : undefined,
      dia3: showReading3 && d3 > 0 ? d3 : undefined,
      pulse3: showReading3 && p3 > 0 ? p3 : undefined,
      avgSys: calculated.avgSys,
      avgDia: calculated.avgDia,
      avgPulse: calculated.avgPulse,
      category: calculated.category,
      armUsed,
      medicationTaken,
      symptoms,
      note,
      createdAt: existingRecord?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      setIsSaving(true);
      await onSave(recordToSave);
      onClose();
    } catch (err) {
      console.error(err);
      setErrorMsg('เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsSaving(false);
    }
  };

  const symptomOptions = ['ไม่มีอาการ', 'ปวดศีรษะ', 'มึนงง/เวียนศีรษะ', 'ใจสั่น', 'แน่นหน้าอก', 'ตาพร่ามัว', 'นอนไม่หลับ'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden card-tactile my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbf8ff] border-b border-[#181A2E]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white ${
              period === 'morning' ? 'bg-amber-500 shadow-[0_3px_0_#b38000]' : 'bg-indigo-600 shadow-[0_3px_0_#3730a3]'
            }`}>
              {period === 'morning' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-[#b7102a] bg-[#ffebee] px-2 py-0.5 rounded-md">
                  วันที่ {dayIndex} จาก 7 วัน
                </span>
                <span className="text-xs text-[#181A2E]/60 font-semibold">
                  {dateStr}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#181A2E] font-display">
                บันทึกความดันโลหิตช่วง{period === 'morning' ? 'เช้า (หลังตื่นนอน)' : 'เย็น (ก่อนนอน)'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#181A2E]/50 hover:text-[#181A2E] hover:bg-[#edecff] rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* TSH Protocol Checklist Accordion */}
          <div className="bg-[#fff9e6] rounded-2xl border border-[#ffe08a] p-3.5">
            <button
              type="button"
              onClick={() => setShowChecklist(!showChecklist)}
              className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-bold text-[#7d5800] cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#006948]" />
                <span>ข้อควรปฏิบัติก่อนวัดความดัน (ตามแนวทางสมาคม TSH)</span>
              </div>
              {showChecklist ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showChecklist && (
              <ul className="mt-3 pt-3 border-t border-[#ffe08a] space-y-2 text-xs text-[#181A2E]/80">
                {TSH_CHECKLIST_ITEMS.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span className="text-emerald-700 font-bold shrink-0">✓</span>
                    <span>{item.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Time & Arm & Medication */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                เวลาที่วัด
              </label>
              <input
                type="time"
                value={measuredAt}
                onChange={(e) => setMeasuredAt(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] focus:ring-2 focus:ring-[#b7102a]/20 font-bold text-sm text-[#181A2E]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                แขนข้างที่วัด
              </label>
              <select
                value={armUsed}
                onChange={(e) => setArmUsed(e.target.value as 'left' | 'right')}
                className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] focus:ring-2 focus:ring-[#b7102a]/20 font-bold text-sm text-[#181A2E]"
              >
                <option value="right">แขนขวา (Right Arm)</option>
                <option value="left">แขนซ้าย (Left Arm)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                การรับประทานยา
              </label>
              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setMedicationTaken(false)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    !medicationTaken
                      ? 'bg-[#ffebee] text-[#b7102a] border-[#b7102a]'
                      : 'bg-white text-[#181A2E]/60 border-[#181A2E]/15'
                  }`}
                >
                  ยังไม่ทานยา
                </button>
                <button
                  type="button"
                  onClick={() => setMedicationTaken(true)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    medicationTaken
                      ? 'bg-[#e6f7ef] text-[#006948] border-[#006948]'
                      : 'bg-white text-[#181A2E]/60 border-[#181A2E]/15'
                  }`}
                >
                  ทานยาแล้ว
                </button>
              </div>
            </div>
          </div>

          {/* Readings Section: 2 Consecutive Readings (TSH Requirement) */}
          <div className="space-y-4">
            
            {/* Reading 1 Card */}
            <div className="p-4 rounded-2xl bg-[#fbf8ff] border-1.5 border-[#181A2E]/15">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#b7102a] text-white flex items-center justify-center font-black text-xs">
                    1
                  </span>
                  <span className="font-extrabold text-sm text-[#181A2E]">
                    การวัดครั้งที่ 1 (Reading 1)
                  </span>
                </div>
                <span className="text-[11px] text-[#181A2E]/60">
                  ค่าตัวบน / ค่าตัวล่าง / ชีพจร
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#181A2E]/70 mb-1">
                    SYS (ตัวบน)
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    min="50"
                    max="280"
                    value={sys1}
                    onChange={(e) => setSys1(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-[#181A2E]"
                    required
                  />
                  <span className="block text-center text-[10px] text-[#181A2E]/50 mt-0.5">mmHg</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#181A2E]/70 mb-1">
                    DIA (ตัวล่าง)
                  </label>
                  <input
                    type="number"
                    placeholder="80"
                    min="30"
                    max="180"
                    value={dia1}
                    onChange={(e) => setDia1(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-[#181A2E]"
                    required
                  />
                  <span className="block text-center text-[10px] text-[#181A2E]/50 mt-0.5">mmHg</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#181A2E]/70 mb-1">
                    PULSE (ชีพจร)
                  </label>
                  <input
                    type="number"
                    placeholder="75"
                    min="30"
                    max="220"
                    value={pulse1}
                    onChange={(e) => setPulse1(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-[#181A2E]"
                    required
                  />
                  <span className="block text-center text-[10px] text-[#181A2E]/50 mt-0.5">bpm</span>
                </div>
              </div>
            </div>

            {/* 1-Minute Interval Rest Timer between Reading 1 and Reading 2 */}
            <div className="bg-gradient-to-r from-[#edecff] to-[#f4f2ff] rounded-2xl p-3.5 border border-[#181A2E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Timer className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <p className="text-xs font-extrabold text-[#181A2E]">
                    เวลาพักระหว่างครั้งที่ 1 และ 2 (1 นาที)
                  </p>
                  <p className="text-[11px] text-[#181A2E]/60">
                    แนวทาง TSH แนะนำให้นั่งพักสงบ 1-2 นาทีก่อนเริ่มวัดครั้งถัดไป
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <div className={`px-3 py-1 rounded-xl font-display font-black text-base ${
                  timerCompleted ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-indigo-900 border border-indigo-200'
                }`}>
                  {timerCompleted ? '✓ พักครบ 1 นาที' : `${Math.floor(timerSeconds / 60)}:${(timerSeconds % 60).toString().padStart(2, '0')}`}
                </div>
                {!isTimerRunning && !timerCompleted && (
                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(true)}
                    className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-[0_2px_0_#3730a3] cursor-pointer"
                    title="เริ่มจับเวลา 1 นาที"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                  </button>
                )}
                {(isTimerRunning || timerCompleted) && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(60);
                      setTimerCompleted(false);
                    }}
                    className="p-2 bg-white text-[#181A2E]/70 hover:text-[#181A2E] rounded-xl border border-[#181A2E]/15 cursor-pointer"
                    title="รีเซ็ตเวลา"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reading 2 Card */}
            <div className="p-4 rounded-2xl bg-[#fbf8ff] border-1.5 border-[#181A2E]/15">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-[#006948] text-white flex items-center justify-center font-black text-xs">
                    2
                  </span>
                  <span className="font-extrabold text-sm text-[#181A2E]">
                    การวัดครั้งที่ 2 (Reading 2)
                  </span>
                </div>
                <span className="text-[11px] text-[#181A2E]/60">
                  วัดซ้ำหลังพัก 1 นาที
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#181A2E]/70 mb-1">
                    SYS (ตัวบน)
                  </label>
                  <input
                    type="number"
                    placeholder="120"
                    min="50"
                    max="280"
                    value={sys2}
                    onChange={(e) => setSys2(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-[#181A2E]"
                    required
                  />
                  <span className="block text-center text-[10px] text-[#181A2E]/50 mt-0.5">mmHg</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#181A2E]/70 mb-1">
                    DIA (ตัวล่าง)
                  </label>
                  <input
                    type="number"
                    placeholder="80"
                    min="30"
                    max="180"
                    value={dia2}
                    onChange={(e) => setDia2(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-[#181A2E]"
                    required
                  />
                  <span className="block text-center text-[10px] text-[#181A2E]/50 mt-0.5">mmHg</span>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#181A2E]/70 mb-1">
                    PULSE (ชีพจร)
                  </label>
                  <input
                    type="number"
                    placeholder="75"
                    min="30"
                    max="220"
                    value={pulse2}
                    onChange={(e) => setPulse2(e.target.value)}
                    className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-[#181A2E]"
                    required
                  />
                  <span className="block text-center text-[10px] text-[#181A2E]/50 mt-0.5">bpm</span>
                </div>
              </div>
            </div>

            {/* Reading 3 Suggestion & Option */}
            {shouldRecommendReading3 && !showReading3 && (
              <div className="bg-[#fff9e6] border border-[#ffe08a] rounded-xl p-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 text-[#7d5800]">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    ค่าครั้งที่ 1 และ 2 ต่างกันเกิน 5 mmHg (SYS ต่าง {diffSys}, DIA ต่าง {diffDia}) แนะนำวัดครั้งที่ 3 เพิ่ม
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReading3(true)}
                  className="px-2.5 py-1 bg-amber-600 text-white font-bold rounded-lg shrink-0 cursor-pointer text-xs"
                >
                  + เพิ่มครั้งที่ 3
                </button>
              </div>
            )}

            {/* Optional Reading 3 Input */}
            {showReading3 && (
              <div className="p-4 rounded-2xl bg-[#fff3e0] border-1.5 border-orange-300">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange-600 text-white flex items-center justify-center font-black text-xs">
                      3
                    </span>
                    <span className="font-extrabold text-sm text-orange-950">
                      การวัดครั้งที่ 3 (Reading 3 - เพิ่มเติม)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowReading3(false);
                      setSys3('');
                      setDia3('');
                      setPulse3('');
                    }}
                    className="text-xs text-orange-800 hover:text-red-700 underline font-bold cursor-pointer"
                  >
                    ยกเลิกครั้งที่ 3
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-orange-900 mb-1">
                      SYS (ตัวบน)
                    </label>
                    <input
                      type="number"
                      placeholder="120"
                      value={sys3}
                      onChange={(e) => setSys3(e.target.value)}
                      className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border border-orange-300 text-[#181A2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-orange-900 mb-1">
                      DIA (ตัวล่าง)
                    </label>
                    <input
                      type="number"
                      placeholder="80"
                      value={dia3}
                      onChange={(e) => setDia3(e.target.value)}
                      className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border border-orange-300 text-[#181A2E]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-orange-900 mb-1">
                      PULSE (ชีพจร)
                    </label>
                    <input
                      type="number"
                      placeholder="75"
                      value={pulse3}
                      onChange={(e) => setPulse3(e.target.value)}
                      className="w-full text-center text-xl sm:text-2xl font-black font-display py-2 bg-white rounded-xl border border-orange-300 text-[#181A2E]"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Live Calculated Average Card */}
          {liveAverage && liveCategoryInfo && (
            <div
              className="p-4 rounded-2xl border-2 transition-all"
              style={{
                backgroundColor: liveCategoryInfo.bgColor,
                borderColor: liveCategoryInfo.borderColor,
              }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#181A2E]/70 uppercase">
                    ค่าเฉลี่ยของรอบนี้ (TSH Session Mean):
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="font-display font-black text-3xl text-[#181A2E]">
                      {liveAverage.avgSys}/{liveAverage.avgDia}
                    </span>
                    <span className="text-sm font-semibold text-[#181A2E]/70">mmHg</span>
                    <span className="text-sm font-bold text-[#181A2E]/80 ml-2">
                      ชีพจร {liveAverage.avgPulse} bpm
                    </span>
                  </div>
                </div>
                <div className="text-right sm:text-right">
                  <span className={`inline-block text-xs font-black px-3 py-1 rounded-full border ${liveCategoryInfo.badgeClass}`}>
                    {liveCategoryInfo.labelTh}
                  </span>
                  <p className="text-[11px] text-[#181A2E]/70 mt-1 max-w-xs">
                    {liveCategoryInfo.adviceTh}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Symptoms Chips */}
          <div>
            <label className="block text-xs font-bold text-[#181A2E]/80 mb-2">
              อาการผิดปกติที่พบ (ถ้ามี):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {symptomOptions.map((sym) => {
                const isSelected = symptoms.includes(sym);
                return (
                  <button
                    key={sym}
                    type="button"
                    onClick={() => {
                      if (sym === 'ไม่มีอาการ') {
                        setSymptoms(isSelected ? '' : 'ไม่มีอาการ');
                      } else {
                        let currentList = symptoms.split(',').map(s => s.trim()).filter(s => s && s !== 'ไม่มีอาการ');
                        if (isSelected) {
                          currentList = currentList.filter(s => s !== sym);
                        } else {
                          currentList.push(sym);
                        }
                        setSymptoms(currentList.join(', '));
                      }
                    }}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#181A2E] text-white border-[#181A2E]'
                        : 'bg-white text-[#181A2E]/70 border-[#181A2E]/20 hover:bg-[#f4f2ff]'
                    }`}
                  >
                    {sym}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
              บันทึกข้อสังเกตเพิ่มเติม (เช่น กิจกรรมก่อนหน้า หรือชื่อยาที่รับประทาน)
            </label>
            <input
              type="text"
              maxLength={250}
              placeholder="เช่น เดินขึ้นบันไดมาก่อน หรือทานยา Amlodipine 5mg"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-sm text-[#181A2E]"
            />
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-100 text-red-900 border border-red-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-700 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-2 border-t border-[#181A2E]/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl border-1.5 border-[#181A2E]/20 font-bold text-sm text-[#181A2E]/80 hover:bg-[#f4f2ff] cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#b7102a] hover:bg-[#db313f] text-white font-extrabold text-sm btn-primary-shelf flex items-center gap-2 cursor-pointer transition disabled:opacity-50"
            >
              <Heart className="w-4 h-4 fill-white" />
              <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกผลการวัด'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
