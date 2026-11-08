import React from 'react';
import { X, Printer, Heart, ShieldCheck, Download, AlertTriangle } from 'lucide-react';
import { BPRecord, MonitoringSession, UserProfile, TSHSummaryReport } from '../types/bloodPressure';
import { TSH_CATEGORIES } from '../utils/tshGuidelines';

interface DoctorPrintReportProps {
  isOpen: boolean;
  onClose: () => void;
  session: MonitoringSession | null;
  profile: UserProfile | null;
  records: BPRecord[];
  report: TSHSummaryReport;
}

export const DoctorPrintReport: React.FC<DoctorPrintReportProps> = ({
  isOpen,
  onClose,
  session,
  profile,
  records,
  report,
}) => {
  if (!isOpen) return null;

  const baseDate = new Date(session?.startDate || new Date().toISOString().split('T')[0]);
  const catInfo = TSH_CATEGORIES[report.category] || TSH_CATEGORIES.normal;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto">
        
        {/* Top Control Bar (Hidden when printed) */}
        <div className="no-print px-6 py-3.5 bg-[#181A2E] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-[#ffb702]" />
            <span className="font-extrabold text-sm sm:text-base">
              แบบฟอร์มรายงานผลความดันโลหิต 7 วัน สำหรับนำไปพบแพทย์ (TSH HBPM)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#b7102a] hover:bg-[#db313f] text-white text-xs sm:text-sm font-extrabold rounded-xl btn-primary-shelf flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ / บันทึก PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 formatted) */}
        <div className="p-6 sm:p-10 max-h-[85vh] overflow-y-auto print:p-0 print:max-h-none print:overflow-visible bg-white text-[#181A2E]">
          
          {/* Document Header */}
          <div className="border-b-2 border-[#181A2E] pb-4 mb-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-[#b7102a] text-white flex items-center justify-center font-black text-xl shrink-0">
                  <Heart className="w-6 h-6 fill-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-[#181A2E] font-display">
                    แบบบันทึกและรายงานผลการวัดความดันโลหิตที่บ้าน 7 วัน
                  </h2>
                  <p className="text-xs text-[#181A2E]/70 font-semibold">
                    ตามแนวทางเวชปฏิบัติสมาคมความดันโลหิตสูงแห่งประเทศไทย (Thai Society of Hypertension - TSH HBPM)
                  </p>
                </div>
              </div>
              <div className="text-right text-xs shrink-0">
                <p className="font-bold text-[#b7102a]">เกณฑ์เป้าหมายที่บ้าน: &lt; 135/85 mmHg</p>
                <p className="text-[11px] text-[#181A2E]/60">พิมพ์เมื่อ: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Patient Demographics */}
            <div className="mt-4 pt-3 border-t border-[#181A2E]/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[#181A2E]/60 block font-semibold">ชื่อ-นามสกุล ผู้ป่วย:</span>
                <strong className="text-sm text-[#181A2E]">{profile?.displayName || 'ผู้รับการตรวจ'}</strong>
              </div>
              <div>
                <span className="text-[#181A2E]/60 block font-semibold">อายุ / เพศ:</span>
                <strong className="text-[#181A2E]">
                  {profile?.age ? `${profile.age} ปี` : '-'} / {profile?.gender === 'male' ? 'ชาย' : profile?.gender === 'female' ? 'หญิง' : '-'}
                </strong>
              </div>
              <div>
                <span className="text-[#181A2E]/60 block font-semibold">ช่วงวันที่ตรวจ 7 วัน:</span>
                <strong className="text-[#181A2E]">
                  {session?.startDate || '-'} ถึง {session?.endDate || '-'}
                </strong>
              </div>
              <div>
                <span className="text-[#181A2E]/60 block font-semibold">การรับประทานยาลดความดัน:</span>
                <strong className="text-[#181A2E]">
                  {profile?.takingMedication ? 'รับประทานยาประจำ' : 'ยังไม่ได้รับประทานยา'}
                </strong>
              </div>
            </div>
            {profile?.medicationList && (
              <div className="mt-2 text-xs bg-[#f4f2ff] p-2 rounded-lg">
                <span className="font-bold text-[#181A2E]">รายการยาปัจจุบัน:</span> {profile.medicationList}
              </div>
            )}
          </div>

          {/* Primary Doctor Key Finding Box */}
          <div className="mb-6 p-4 rounded-2xl border-2 border-[#181A2E] bg-[#fbf8ff]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-black uppercase text-[#b7102a] tracking-wider">
                  ★ ค่าเฉลี่ยมาตรฐาน TSH สำหรับวินิจฉัย (วันที่ 2 - วันที่ 7):
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className="font-display font-black text-3xl sm:text-4xl text-[#181A2E]">
                    {report.tshSys || '-'}/{report.tshDia || '-'}
                  </span>
                  <span className="text-sm font-bold text-[#181A2E]/60">mmHg</span>
                  <span className="text-sm font-semibold text-[#181A2E]/80 ml-2">
                    (ชีพจรเฉลี่ย {report.tshPulse || '-'} bpm)
                  </span>
                </div>
              </div>
              <div className="sm:text-right">
                <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full border ${catInfo.badgeClass}`}>
                  {catInfo.labelTh}
                </span>
                <p className="text-xs font-bold text-[#181A2E] mt-1">
                  {report.isUnderControl
                    ? '✓ ความดันที่บ้านควบคุมได้ดี (< 135/85 mmHg)'
                    : '⚠ สูงกว่าเกณฑ์มาตรฐานวัดที่บ้าน (≥ 135/85 mmHg)'}
                </p>
              </div>
            </div>

            {/* Sub-Averages Row */}
            <div className="mt-3 pt-3 border-t border-[#181A2E]/10 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2 bg-white rounded-lg border border-[#181A2E]/10">
                <span className="text-[#181A2E]/60 block">เฉลี่ยเช้า (Morning):</span>
                <strong className="text-sm">{report.morningSys || '-'}/{report.morningDia || '-'} mmHg</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#181A2E]/10">
                <span className="text-[#181A2E]/60 block">เฉลี่ยเย็น (Evening):</span>
                <strong className="text-sm">{report.eveningSys || '-'}/{report.eveningDia || '-'} mmHg</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#181A2E]/10">
                <span className="text-[#181A2E]/60 block">Morning Surge (เช้า-เย็น):</span>
                <strong className={`text-sm ${report.isMorningSurgeSignificant ? 'text-red-700' : ''}`}>
                  {report.morningSurge > 0 ? `+${report.morningSurge}` : report.morningSurge} mmHg
                </strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-[#181A2E]/10">
                <span className="text-[#181A2E]/60 block">เฉลี่ยรวมทุกวัน (Day 1-7):</span>
                <strong className="text-sm">{report.allSys || '-'}/{report.allDia || '-'} mmHg</strong>
              </div>
            </div>
          </div>

          {/* 7-Day Table */}
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse border border-[#181A2E]/20">
              <thead>
                <tr className="bg-[#181A2E] text-white">
                  <th rowSpan={2} className="border border-[#181A2E]/30 p-2 text-center w-16">วัน / วันที่</th>
                  <th colSpan={4} className="border border-[#181A2E]/30 p-2 text-center bg-amber-700/80">
                    ☀️ ช่วงเช้า (หลังตื่นนอน ปัสสาวะแล้ว ก่อนอาหาร/ยา)
                  </th>
                  <th colSpan={4} className="border border-[#181A2E]/30 p-2 text-center bg-indigo-900/80">
                    🌙 ช่วงเย็น (ก่อนนอน นั่งพักสงบ 5 นาที)
                  </th>
                  <th rowSpan={2} className="border border-[#181A2E]/30 p-2 text-center w-24">
                    หมายเหตุ / อาการ
                  </th>
                </tr>
                <tr className="bg-[#f4f2ff] text-[#181A2E] font-bold text-[11px]">
                  <th className="border border-[#181A2E]/20 p-1.5 text-center">ครั้งที่ 1</th>
                  <th className="border border-[#181A2E]/20 p-1.5 text-center">ครั้งที่ 2</th>
                  <th className="border border-[#181A2E]/20 p-1.5 text-center bg-amber-100 font-black">เฉลี่ยเช้า</th>
                  <th className="border border-[#181A2E]/20 p-1.5 text-center">ชีพจร</th>

                  <th className="border border-[#181A2E]/20 p-1.5 text-center">ครั้งที่ 1</th>
                  <th className="border border-[#181A2E]/20 p-1.5 text-center">ครั้งที่ 2</th>
                  <th className="border border-[#181A2E]/20 p-1.5 text-center bg-indigo-100 font-black">เฉลี่ยเย็น</th>
                  <th className="border border-[#181A2E]/20 p-1.5 text-center">ชีพจร</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
                  const curDate = new Date(baseDate);
                  curDate.setDate(baseDate.getDate() + (dayNum - 1));
                  const dateShort = curDate.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' });

                  const mRec = records.find(r => r.dayIndex === dayNum && r.period === 'morning');
                  const eRec = records.find(r => r.dayIndex === dayNum && r.period === 'evening');
                  const isDay1 = dayNum === 1;

                  return (
                    <tr key={dayNum} className={isDay1 ? 'bg-amber-50/50' : dayNum % 2 === 0 ? 'bg-[#fbf8ff]' : 'bg-white'}>
                      <td className="border border-[#181A2E]/20 p-2 text-center font-bold">
                        <div>ว.{dayNum}</div>
                        <div className="text-[10px] text-[#181A2E]/50">{dateShort}</div>
                        {isDay1 && <div className="text-[9px] text-[#b38000] font-black">*วันปรับตัว</div>}
                      </td>

                      {/* Morning */}
                      <td className="border border-[#181A2E]/20 p-1.5 text-center">
                        {mRec?.sys1 ? `${mRec.sys1}/${mRec.dia1}` : '-'}
                      </td>
                      <td className="border border-[#181A2E]/20 p-1.5 text-center">
                        {mRec?.sys2 ? `${mRec.sys2}/${mRec.dia2}` : '-'}
                      </td>
                      <td className="border border-[#181A2E]/20 p-1.5 text-center font-black bg-amber-50/70 text-amber-950">
                        {mRec ? `${mRec.avgSys}/${mRec.avgDia}` : '-'}
                      </td>
                      <td className="border border-[#181A2E]/20 p-1.5 text-center">
                        {mRec?.avgPulse || '-'}
                      </td>

                      {/* Evening */}
                      <td className="border border-[#181A2E]/20 p-1.5 text-center">
                        {eRec?.sys1 ? `${eRec.sys1}/${eRec.dia1}` : '-'}
                      </td>
                      <td className="border border-[#181A2E]/20 p-1.5 text-center">
                        {eRec?.sys2 ? `${eRec.sys2}/${eRec.dia2}` : '-'}
                      </td>
                      <td className="border border-[#181A2E]/20 p-1.5 text-center font-black bg-indigo-50/70 text-indigo-950">
                        {eRec ? `${eRec.avgSys}/${eRec.avgDia}` : '-'}
                      </td>
                      <td className="border border-[#181A2E]/20 p-1.5 text-center">
                        {eRec?.avgPulse || '-'}
                      </td>

                      {/* Notes / Symptoms */}
                      <td className="border border-[#181A2E]/20 p-1.5 text-[10px] leading-tight">
                        {mRec?.symptoms && <div>เช้า: {mRec.symptoms}</div>}
                        {eRec?.symptoms && <div>เย็น: {eRec.symptoms}</div>}
                        {!mRec?.symptoms && !eRec?.symptoms && <span className="text-[#181A2E]/30">-</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Doctor Assessment & Prescription Plan Area */}
          <div className="border border-[#181A2E]/30 rounded-xl p-4 bg-[#fbf8ff] text-xs">
            <div className="font-extrabold text-[#181A2E] mb-2 flex items-center justify-between">
              <span>ความเห็นของแพทย์ผู้ตรวจรักษา (Physician's Assessment & Action Plan):</span>
              <span className="text-[10px] text-[#181A2E]/60 font-normal">คลินิกโรคความดันโลหิตสูง / แผนกผู้ป่วยนอก</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <div className="space-y-4">
                <div className="border-b border-dashed border-[#181A2E]/30 pb-1">
                  การวินิจฉัย: [ &nbsp; ] Controlled Hypertension &nbsp;&nbsp; [ &nbsp; ] Uncontrolled Hypertension &nbsp;&nbsp; [ &nbsp; ] White-coat HT &nbsp;&nbsp; [ &nbsp; ] Masked HT
                </div>
                <div className="h-10 border-b border-dashed border-[#181A2E]/30">
                  แผนการรักษา / ปรับยา:
                </div>
              </div>
              <div className="flex flex-col justify-between items-end pt-4 sm:pt-0">
                <div className="text-right w-full">
                  <div className="mt-6 border-b border-[#181A2E]/40 w-48 ml-auto"></div>
                  <p className="text-[11px] text-[#181A2E]/70 mt-1">ลงชื่อแพทย์ผู้ตรวจ (.....................................................)</p>
                  <p className="text-[10px] text-[#181A2E]/50">วันที่ .......... / .......... / ................</p>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
