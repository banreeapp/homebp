import React, { useState } from 'react';
import { X, User, Save, Plus, Calendar, FileText, Download, Check } from 'lucide-react';
import { UserProfile, MonitoringSession } from '../types/bloodPressure';

interface PatientProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  sessions: MonitoringSession[];
  currentSessionId: string;
  onSaveProfile: (updatedProfile: UserProfile) => Promise<void>;
  onStartNewCycle: (title: string, startDate: string) => Promise<void>;
  onSelectSession: (sessionId: string) => void;
  onExportCsv: () => void;
}

export const PatientProfileModal: React.FC<PatientProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  sessions,
  currentSessionId,
  onSaveProfile,
  onStartNewCycle,
  onSelectSession,
  onExportCsv,
}) => {
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [age, setAge] = useState<string>(profile?.age?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | 'prefer_not_to_say'>(
    profile?.gender || 'prefer_not_to_say'
  );
  const [hasHypertensionDiagnosis, setHasHypertensionDiagnosis] = useState<boolean>(
    profile?.hasHypertensionDiagnosis ?? true
  );
  const [takingMedication, setTakingMedication] = useState<boolean>(
    profile?.takingMedication ?? false
  );
  const [medicationList, setMedicationList] = useState<string>(profile?.medicationList || '');
  const [targetSys, setTargetSys] = useState<string>(profile?.targetSys?.toString() || '135');
  const [targetDia, setTargetDia] = useState<string>(profile?.targetDia?.toString() || '85');

  // New Cycle form
  const [showNewCycleForm, setShowNewCycleForm] = useState(false);
  const [newCycleTitle, setNewCycleTitle] = useState('รอบบันทึก 7 วัน (ก่อนพบแพทย์)');
  const [newCycleStartDate, setNewCycleStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setIsSaving(true);
    try {
      await onSaveProfile({
        ...profile,
        displayName: displayName.trim() || 'ผู้รับการตรวจ',
        age: age ? parseInt(age, 10) : undefined,
        gender,
        hasHypertensionDiagnosis,
        takingMedication,
        medicationList: medicationList.trim(),
        targetSys: parseInt(targetSys, 10) || 135,
        targetDia: parseInt(targetDia, 10) || 85,
        updatedAt: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    await onStartNewCycle(newCycleTitle, newCycleStartDate);
    setShowNewCycleForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden card-tactile my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbf8ff] border-b border-[#181A2E]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#181A2E] text-white flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#181A2E] font-display">
                ข้อมูลผู้ป่วยและรอบการบันทึก
              </h3>
              <p className="text-xs text-[#181A2E]/60">
                ตั้งค่าข้อมูลเพื่อนำไปแสดงในรายงานทางการแพทย์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#181A2E]/50 hover:text-[#181A2E] hover:bg-[#edecff] rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Profile Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h4 className="font-extrabold text-sm text-[#181A2E] uppercase tracking-wider text-[#b7102a]">
              1. ข้อมูลส่วนบุคคล
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                  ชื่อ-นามสกุล / ชื่อเล่น
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="เช่น สมชาย ใจดี"
                  className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-sm text-[#181A2E] font-semibold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                    อายุ (ปี)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="58"
                    className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-sm text-[#181A2E] font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                    เพศ
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-sm text-[#181A2E] font-semibold"
                  >
                    <option value="male">ชาย</option>
                    <option value="female">หญิง</option>
                    <option value="other">อื่นๆ</option>
                    <option value="prefer_not_to_say">ไม่ระบุ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health Background */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 bg-[#fbf8ff] rounded-xl border border-[#181A2E]/10 space-y-1">
                <span className="text-xs font-bold text-[#181A2E] block">ประวัติโรคความดันโลหิตสูง:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasHypertensionDiagnosis(true)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      hasHypertensionDiagnosis
                        ? 'bg-[#181A2E] text-white border-[#181A2E]'
                        : 'bg-white text-[#181A2E]/70 border-[#181A2E]/15'
                    }`}
                  >
                    เคยได้รับการวินิจฉัย
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasHypertensionDiagnosis(false)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      !hasHypertensionDiagnosis
                        ? 'bg-[#181A2E] text-white border-[#181A2E]'
                        : 'bg-white text-[#181A2E]/70 border-[#181A2E]/15'
                    }`}
                  >
                    ตรวจคัดกรองเบื้องต้น
                  </button>
                </div>
              </div>

              <div className="p-3 bg-[#fbf8ff] rounded-xl border border-[#181A2E]/10 space-y-1">
                <span className="text-xs font-bold text-[#181A2E] block">การทานยาลดความดัน:</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTakingMedication(true)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      takingMedication
                        ? 'bg-[#006948] text-white border-[#006948]'
                        : 'bg-white text-[#181A2E]/70 border-[#181A2E]/15'
                    }`}
                  >
                    ทานยาเป็นประจำ
                  </button>
                  <button
                    type="button"
                    onClick={() => setTakingMedication(false)}
                    className={`flex-1 py-1 text-xs font-bold rounded-lg border cursor-pointer ${
                      !takingMedication
                        ? 'bg-[#181A2E] text-white border-[#181A2E]'
                        : 'bg-white text-[#181A2E]/70 border-[#181A2E]/15'
                    }`}
                  >
                    ยังไม่ทานยา
                  </button>
                </div>
              </div>
            </div>

            {/* Current Medications text */}
            <div>
              <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                รายชื่อยาลดความดันโลหิตที่รับประทานในปัจจุบัน (ถ้ามี):
              </label>
              <input
                type="text"
                placeholder="เช่น Amlodipine 5mg วันละ 1 เม็ด เช้า, Losartan 50mg"
                value={medicationList}
                onChange={(e) => setMedicationList(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border-1.5 border-[#181A2E]/20 focus:border-[#b7102a] text-xs text-[#181A2E]"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-[#006948] font-bold">
                {saveSuccess ? '✓ บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว' : ''}
              </span>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-[#181A2E] hover:bg-[#2d2f44] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูลผู้ป่วย'}</span>
              </button>
            </div>
          </form>

          {/* 7-Day Monitoring Sessions Management */}
          <div className="pt-4 border-t border-[#181A2E]/10 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-[#181A2E] uppercase tracking-wider text-[#b7102a]">
                  2. รอบการบันทึก 7 วัน (Sessions)
                </h4>
                <p className="text-xs text-[#181A2E]/60">
                  เลือกดูรอบบันทึกในอดีต หรือเปิดรอบใหม่สำหรับพบแพทย์ครั้งต่อไป
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNewCycleForm(!showNewCycleForm)}
                className="px-3 py-1.5 bg-[#b7102a] hover:bg-[#db313f] text-white text-xs font-extrabold rounded-xl btn-primary-shelf flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เปิดรอบใหม่ 7 วัน</span>
              </button>
            </div>

            {/* New Cycle Form */}
            {showNewCycleForm && (
              <form onSubmit={handleCreateCycle} className="p-4 bg-[#fbf8ff] rounded-2xl border-1.5 border-[#b7102a]/30 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                      ชื่อรอบบันทึก
                    </label>
                    <input
                      type="text"
                      value={newCycleTitle}
                      onChange={(e) => setNewCycleTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#181A2E]/20 text-xs font-bold text-[#181A2E]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#181A2E]/80 mb-1">
                      วันที่เริ่มต้น (Day 1)
                    </label>
                    <input
                      type="date"
                      value={newCycleStartDate}
                      onChange={(e) => setNewCycleStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white rounded-xl border border-[#181A2E]/20 text-xs font-bold text-[#181A2E]"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowNewCycleForm(false)}
                    className="px-3 py-1.5 text-xs text-[#181A2E]/70 rounded-lg hover:bg-white cursor-pointer"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#b7102a] text-white text-xs font-bold rounded-xl btn-primary-shelf cursor-pointer"
                  >
                    ยืนยันเปิดรอบใหม่
                  </button>
                </div>
              </form>
            )}

            {/* Sessions List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {sessions.map((sess) => {
                const isSelected = sess.id === currentSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => onSelectSession(sess.id)}
                    className={`p-3 rounded-xl border-1.5 flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#e6f7ef] border-[#006948] text-[#004d35]'
                        : 'bg-white border-[#181A2E]/15 hover:bg-[#fbf8ff]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className={`w-4 h-4 ${isSelected ? 'text-[#006948]' : 'text-[#181A2E]/50'}`} />
                      <div>
                        <div className="font-extrabold text-xs text-[#181A2E] flex items-center gap-2">
                          <span>{sess.title}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-[#006948] text-white px-2 py-0.2 rounded-full font-bold">
                              รอบปัจจุบัน
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-[#181A2E]/60">
                          {sess.startDate} ถึง {sess.endDate}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-[#006948]" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Export Data */}
          <div className="pt-4 border-t border-[#181A2E]/10 flex items-center justify-between">
            <div className="text-xs text-[#181A2E]/70">
              ดาวน์โหลดประวัติการวัดความดันทั้งหมดเป็นไฟล์ CSV
            </div>
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-1.5 bg-white hover:bg-[#fbf8ff] text-[#181A2E] text-xs font-bold rounded-xl border border-[#181A2E]/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-[#b7102a]" />
              <span>ส่งออกไฟล์ CSV</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
