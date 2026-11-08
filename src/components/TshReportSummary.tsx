import React, { useState } from 'react';
import { 
  Award, 
  CheckCircle, 
  AlertTriangle, 
  Sun, 
  Moon, 
  TrendingUp, 
  Copy, 
  Check, 
  Info, 
  Share2, 
  ShieldCheck,
  Activity,
  HeartPulse
} from 'lucide-react';
import { TSHSummaryReport, BPRecord } from '../types/bloodPressure';
import { TSH_CATEGORIES } from '../utils/tshGuidelines';

interface TshReportSummaryProps {
  report: TSHSummaryReport;
  patientName?: string;
  onOpenPrintReport: () => void;
}

export const TshReportSummary: React.FC<TshReportSummaryProps> = ({
  report,
  patientName,
  onOpenPrintReport,
}) => {
  const [copied, setCopied] = useState(false);
  const catInfo = TSH_CATEGORIES[report.category] || TSH_CATEGORIES.normal;

  const handleCopySummary = () => {
    const summaryText = `📋 สรุปผลบันทึกความดันโลหิตที่บ้าน 7 วัน (ตามแนวทาง TSH)
ผู้ป่วย: ${patientName || 'ผู้รับการตรวจ'}
------------------------------------
🎯 ค่าเฉลี่ยมาตรฐาน TSH (วันที่ 2-7): ${report.tshSys || '-'}/${report.tshDia || '-'} mmHg (ชีพจร ${report.tshPulse || '-'} bpm)
สถานะ: ${catInfo.labelTh} (${report.isUnderControl ? 'ผ่านเกณฑ์เป้าหมาย < 135/85 mmHg' : 'เกินเกณฑ์เป้าหมาย ≥ 135/85 mmHg'})

☀️ ค่าเฉลี่ยช่วงเช้า: ${report.morningSys || '-'}/${report.morningDia || '-'} mmHg (ชีพจร ${report.morningPulse || '-'} bpm)
🌙 ค่าเฉลี่ยช่วงเย็น: ${report.eveningSys || '-'}/${report.eveningDia || '-'} mmHg (ชีพจร ${report.eveningPulse || '-'} bpm)
📊 ความต่างเช้า-เย็น (Morning Surge): ${report.morningSurge > 0 ? '+' : ''}${report.morningSurge} mmHg ${report.isMorningSurgeSignificant ? '(ตรวจพบ Morning Surge สูง)' : '(ปกติ)'}

บันทึกสำเร็จ: ${report.recordedSessionsCount} / 14 ครั้ง (${report.completionPercentage}%)
------------------------------------
ข้อแนะนำ: ${catInfo.adviceTh}`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (report.recordedSessionsCount === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 card-tactile text-center">
        <div className="w-16 h-16 bg-[#f4f2ff] text-[#b7102a] rounded-2xl flex items-center justify-center mx-auto mb-3">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-[#181A2E] font-display">
          ยังไม่มีข้อมูลการบันทึก
        </h3>
        <p className="text-sm text-[#181A2E]/60 max-w-md mx-auto mt-1">
          กรุณากดปุ่ม <strong>"+ บันทึก"</strong> ในตารางช่วงเช้าหรือเย็นเพื่อเริ่มโปรแกรมวัด 7 วัน หรือกดปุ่ม <strong>"ข้อมูลตัวอย่าง 7 วัน"</strong> ด้านบนเพื่อทดลองดูรายงาน
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Primary TSH Evaluation Banner */}
      <div
        className="rounded-3xl p-6 sm:p-8 border-2 card-tactile transition-all"
        style={{ backgroundColor: catInfo.bgColor, borderColor: catInfo.borderColor }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-wider bg-white/90 text-[#181A2E] px-3 py-1 rounded-full border border-[#181A2E]/10 shadow-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#006948]" />
                เกณฑ์มาตรฐาน TSH (Home BP Guideline)
              </span>
              <span className={`text-xs font-black px-3 py-1 rounded-full border ${catInfo.badgeClass}`}>
                {catInfo.labelTh} ({catInfo.labelEn})
              </span>
            </div>

            <div>
              <p className="text-xs sm:text-sm font-bold text-[#181A2E]/70">
                ค่าเฉลี่ยความดันโลหิตมาตรฐาน TSH (วันที่ 2 ถึงวันที่ 7):
              </p>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display font-black text-4xl sm:text-6xl text-[#181A2E] tracking-tight">
                  {report.tshSys}/{report.tshDia}
                </span>
                <span className="text-base sm:text-xl font-bold text-[#181A2E]/60">mmHg</span>
                <span className="text-sm sm:text-base font-bold text-[#181A2E]/70 bg-white/60 px-3 py-1 rounded-xl border border-[#181A2E]/10">
                  ชีพจรเฉลี่ย {report.tshPulse} bpm
                </span>
              </div>
            </div>

            {/* Target Status */}
            <div className="flex items-center gap-2 pt-1">
              {report.isUnderControl ? (
                <div className="flex items-center gap-1.5 text-xs font-black text-[#006948] bg-white/80 px-3 py-1.5 rounded-xl border border-emerald-300">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>ผ่านเกณฑ์เป้าหมายการวัดที่บ้านของ TSH (&lt; 135/85 mmHg)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-black text-[#b7102a] bg-white/80 px-3 py-1.5 rounded-xl border border-rose-300">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>สูงกว่าเกณฑ์เป้าหมายการวัดที่บ้านของ TSH (≥ 135/85 mmHg)</span>
                </div>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[#181A2E]/80 max-w-2xl leading-relaxed">
              <strong>คำแนะนำ:</strong> {catInfo.adviceTh}
            </p>
          </div>

          {/* Quick Actions in Banner */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            <button
              onClick={handleCopySummary}
              className="px-4 py-2.5 bg-white hover:bg-[#fbf8ff] text-[#181A2E] text-xs sm:text-sm font-extrabold rounded-xl border-1.5 border-[#181A2E]/20 btn-secondary-shelf flex items-center justify-center gap-2 cursor-pointer transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#b7102a]" />}
              <span>{copied ? 'คัดลอกเรียบร้อยแล้ว' : 'คัดลอกสรุปผล (LINE/แพทย์)'}</span>
            </button>
            <button
              onClick={onOpenPrintReport}
              className="px-4 py-2.5 bg-[#b7102a] hover:bg-[#db313f] text-white text-xs sm:text-sm font-extrabold rounded-xl btn-primary-shelf flex items-center justify-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 fill-white" />
              <span>เปิดใบรายงานผลแพทย์ (PDF)</span>
            </button>
          </div>

        </div>
      </div>

      {/* Analytics Matrix: Morning vs Evening vs Surge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Morning Average */}
        <div className="bg-white rounded-2xl p-4 card-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#7d5800] flex items-center gap-1">
              <Sun className="w-4 h-4 text-amber-500" /> ค่าเฉลี่ยช่วงเช้า
            </span>
            <span className="text-[11px] text-[#181A2E]/50 font-semibold">หลังตื่นนอน</span>
          </div>
          <div className="font-display font-black text-2xl text-[#181A2E]">
            {report.morningSys || '-'}/{report.morningDia || '-'}
            <span className="text-xs font-medium text-[#181A2E]/50 ml-1">mmHg</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#181A2E]/10 text-[11px] text-[#181A2E]/70 flex justify-between">
            <span>ชีพจร: {report.morningPulse || '-'} bpm</span>
            <span>เกณฑ์ &lt; 135/85</span>
          </div>
        </div>

        {/* Evening Average */}
        <div className="bg-white rounded-2xl p-4 card-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-indigo-700 flex items-center gap-1">
              <Moon className="w-4 h-4 text-indigo-500" /> ค่าเฉลี่ยช่วงเย็น
            </span>
            <span className="text-[11px] text-[#181A2E]/50 font-semibold">ก่อนนอน</span>
          </div>
          <div className="font-display font-black text-2xl text-[#181A2E]">
            {report.eveningSys || '-'}/{report.eveningDia || '-'}
            <span className="text-xs font-medium text-[#181A2E]/50 ml-1">mmHg</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#181A2E]/10 text-[11px] text-[#181A2E]/70 flex justify-between">
            <span>ชีพจร: {report.eveningPulse || '-'} bpm</span>
            <span>เกณฑ์ &lt; 135/85</span>
          </div>
        </div>

        {/* Morning Surge (ความต่างเช้า-เย็น) */}
        <div className={`rounded-2xl p-4 card-tactile flex flex-col justify-between ${
          report.isMorningSurgeSignificant ? 'bg-[#fff3e0] border-orange-300' : 'bg-white'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#181A2E] flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-[#b7102a]" /> Morning Surge
            </span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              report.isMorningSurgeSignificant ? 'bg-orange-200 text-orange-950' : 'bg-green-100 text-green-800'
            }`}>
              {report.isMorningSurgeSignificant ? 'สูงเด่น' : 'ปกติ'}
            </span>
          </div>
          <div className="font-display font-black text-2xl text-[#181A2E]">
            {report.morningSurge > 0 ? `+${report.morningSurge}` : report.morningSurge}
            <span className="text-xs font-medium text-[#181A2E]/50 ml-1">mmHg</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#181A2E]/10 text-[10px] text-[#181A2E]/70 leading-tight">
            {report.isMorningSurgeSignificant
              ? 'เช้าสูงกว่าเย็น ≥ 15 mmHg ควรปรึกษาแพทย์'
              : 'ความดันช่วงเช้าและเย็นสมดุลดี (&lt; 15 mmHg)'}
          </div>
        </div>

        {/* Pulse Pressure (ความดันชีพจร) */}
        <div className="bg-white rounded-2xl p-4 card-tactile flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-extrabold text-[#181A2E] flex items-center gap-1">
              <Activity className="w-4 h-4 text-[#006948]" /> Pulse Pressure
            </span>
            <span className="text-[10px] font-bold bg-[#f4f2ff] text-[#181A2E]/70 px-1.5 py-0.5 rounded">
              ตัวบน - ตัวล่าง
            </span>
          </div>
          <div className="font-display font-black text-2xl text-[#181A2E]">
            {report.pulsePressure}
            <span className="text-xs font-medium text-[#181A2E]/50 ml-1">mmHg</span>
          </div>
          <div className="mt-2 pt-2 border-t border-[#181A2E]/10 text-[10px] text-[#181A2E]/70 leading-tight">
            {report.pulsePressure > 60
              ? 'ความดันชีพจรค่อนข้างกว้าง (> 60 mmHg) สัมพันธ์กับหลอดเลือดแข็งตัว'
              : 'อยู่ในเกณฑ์ทั่วไป (40-60 mmHg)'}
          </div>
        </div>

      </div>

      {/* Protocol Fidelity & Lifestyle Advice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* TSH Rule Explanation Card */}
        <div className="bg-white rounded-2xl p-5 card-tactile space-y-3">
          <div className="flex items-center gap-2 text-sm font-extrabold text-[#181A2E]">
            <Info className="w-4 h-4 text-[#b7102a]" />
            <span>ทำไม TSH ถึงตัดผลวันที่ 1 ออก?</span>
          </div>
          <p className="text-xs text-[#181A2E]/80 leading-relaxed">
            สมาคมความดันโลหิตสูงแห่งประเทศไทย (TSH) กำหนดให้ตัดผลการวัดของ <strong>"วันแรก"</strong> ออกจากการคำนวณวินิจฉัย เนื่องจากผู้ป่วยมักมีความตื่นเต้น กังวล หรือยังปรับตัวกับเครื่องวัดไม่ได้ ทำให้ค่าวันแรกมักสูงกว่าปกติ (Familiarization period) และนำค่าเฉลี่ยของ <strong>วันที่ 2 ถึงวันที่ 7</strong> มาใช้ในการตัดสินใจทางการแพทย์
          </p>
          <div className="p-3 bg-[#fbf8ff] rounded-xl text-xs text-[#181A2E]/70 border border-[#181A2E]/10 flex justify-between">
            <span>เฉลี่ยรวมทุกวัน (Day 1-7):</span>
            <strong className="text-[#181A2E]">{report.allSys}/{report.allDia} mmHg</strong>
          </div>
        </div>

        {/* Lifestyle Recommendations */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 card-tactile space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-[#181A2E] flex items-center gap-2">
              <Award className="w-4 h-4 text-[#7d5800]" />
              แนวทางปรับพฤติกรรมลดความดันโลหิต (TSH Guidelines)
            </span>
            <span className="text-[11px] font-bold text-[#006948] bg-[#e6f7ef] px-2 py-0.5 rounded-full">
              ข้อปฏิบัติสำคัญ
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#181A2E]/80">
            {report.lifestyleAdvice.map((adv, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-xl bg-[#fbf8ff] border border-[#181A2E]/5">
                <span className="w-5 h-5 rounded-full bg-[#b7102a]/10 text-[#b7102a] flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-tight">{adv}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
