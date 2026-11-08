import React from 'react';
import { Sun, Moon, Plus, CheckCircle2, Clock, Pill, AlertCircle, Edit3, Trash2 } from 'lucide-react';
import { BPRecord, MeasurementPeriod } from '../types/bloodPressure';
import { TSH_CATEGORIES } from '../utils/tshGuidelines';

interface ProtocolTimelineProps {
  startDate: string; // YYYY-MM-DD
  records: BPRecord[];
  onOpenRecordModal: (dayIndex: number, period: MeasurementPeriod, existingRecord?: BPRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

export const ProtocolTimeline: React.FC<ProtocolTimelineProps> = ({
  startDate,
  records,
  onOpenRecordModal,
  onDeleteRecord,
}) => {
  const baseDate = new Date(startDate || new Date().toISOString().split('T')[0]);

  // Map records by `${dayIndex}_${period}`
  const recordMap = new Map<string, BPRecord>();
  records.forEach(r => {
    recordMap.set(`${r.dayIndex}_${r.period}`, r);
  });

  const totalRecorded = records.length;
  const progressPercent = Math.min(100, Math.round((totalRecorded / 14) * 100));

  return (
    <div className="space-y-6">
      
      {/* Progress & Protocol Guidance Banner */}
      <div className="bg-white rounded-2xl p-5 card-tactile">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#b7102a] uppercase tracking-wider bg-[#ffebee] px-2.5 py-0.5 rounded-full border border-[#ffcdd2]">
                รอบบันทึก 7 วันต่อเนื่อง
              </span>
              <span className="text-xs text-[#181A2E]/60 font-medium">
                เป้าหมาย: วันละ 2 เวลา (เช้า-เย็น) ครั้งละ 2 ครั้ง
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#181A2E] mt-1 font-display">
              ความคืบหน้าการบันทึก: {totalRecorded} / 14 ครั้ง ({progressPercent}%)
            </h2>
          </div>

          {/* Progress Bar & Badges */}
          <div className="w-full sm:w-64">
            <div className="w-full bg-[#edecff] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#181A2E]/10">
              <div
                className="h-full bg-gradient-to-r from-[#ffb702] to-[#b7102a] rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] font-bold text-[#181A2E]/70 mt-1.5">
              <span>เริ่มวันที่ 1</span>
              <span>{totalRecorded >= 12 ? 'ครบเกณฑ์ TSH แล้ว' : `เหลืออีก ${Math.max(0, 14 - totalRecorded)} ครั้ง`}</span>
              <span>วันที่ 7</span>
            </div>
          </div>
        </div>

        {/* TSH Protocol Note */}
        <div className="mt-4 pt-3 border-t border-[#181A2E]/10 flex flex-wrap items-center justify-between gap-2 text-xs text-[#181A2E]/80">
          <div className="flex items-center gap-1.5 text-[#7d5800] bg-[#fff9e6] px-3 py-1.5 rounded-lg border border-[#ffe08a]">
            <AlertCircle className="w-4 h-4 text-[#b38000] shrink-0" />
            <span>
              <strong>เกณฑ์สมาคม TSH:</strong> นำผลวันที่ 2-7 มาหาค่าเฉลี่ยในการวินิจฉัย (ตัดวันแรกเพื่อลดความคลาดเคลื่อนจากความตื่นเต้น)
            </span>
          </div>
          <div className="text-[11px] text-[#181A2E]/60">
            * เกณฑ์วัดที่บ้านปกติ: ค่าเฉลี่ย &lt; 135/85 mmHg
          </div>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5">
        {[1, 2, 3, 4, 5, 6, 7].map((dayNum) => {
          const curDate = new Date(baseDate);
          curDate.setDate(baseDate.getDate() + (dayNum - 1));
          const dateStr = curDate.toLocaleDateString('th-TH', {
            day: 'numeric',
            month: 'short',
          });

          const morningRec = recordMap.get(`${dayNum}_morning`);
          const eveningRec = recordMap.get(`${dayNum}_evening`);
          const isDay1 = dayNum === 1;

          return (
            <div
              key={dayNum}
              className={`bg-white rounded-2xl p-3.5 card-tactile flex flex-col justify-between transition-all ${
                isDay1 ? 'border-amber-300/80 bg-gradient-to-b from-amber-50/40 to-white' : ''
              }`}
            >
              {/* Day Header */}
              <div className="border-b border-[#181A2E]/10 pb-2 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-extrabold text-base text-[#181A2E]">
                    วันที่ {dayNum}
                  </span>
                  <span className="text-xs font-semibold text-[#181A2E]/60 bg-[#f4f2ff] px-2 py-0.5 rounded-md">
                    {dateStr}
                  </span>
                </div>
                <div className="text-[10px] font-semibold mt-0.5">
                  {isDay1 ? (
                    <span className="text-[#b38000] bg-[#fff3e0] px-1.5 py-0.5 rounded">
                      วันแรก (ปรับตัว)
                    </span>
                  ) : (
                    <span className="text-[#006948] bg-[#e6f7ef] px-1.5 py-0.5 rounded">
                      วันที่ {dayNum} คำนวณผล
                    </span>
                  )}
                </div>
              </div>

              {/* Slots Container */}
              <div className="space-y-2.5 flex-1 flex flex-col justify-center">
                
                {/* Morning Slot */}
                <SlotCard
                  dayNum={dayNum}
                  period="morning"
                  label="เช้า"
                  icon={<Sun className="w-4 h-4 text-amber-500" />}
                  record={morningRec}
                  onOpenRecordModal={onOpenRecordModal}
                  onDeleteRecord={onDeleteRecord}
                />

                {/* Evening Slot */}
                <SlotCard
                  dayNum={dayNum}
                  period="evening"
                  label="เย็น"
                  icon={<Moon className="w-4 h-4 text-indigo-500" />}
                  record={eveningRec}
                  onOpenRecordModal={onOpenRecordModal}
                  onDeleteRecord={onDeleteRecord}
                />

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};

interface SlotCardProps {
  dayNum: number;
  period: MeasurementPeriod;
  label: string;
  icon: React.ReactNode;
  record?: BPRecord;
  onOpenRecordModal: (dayIndex: number, period: MeasurementPeriod, existingRecord?: BPRecord) => void;
  onDeleteRecord: (recordId: string) => void;
}

const SlotCard: React.FC<SlotCardProps> = ({
  dayNum,
  period,
  label,
  icon,
  record,
  onOpenRecordModal,
  onDeleteRecord,
}) => {
  if (record) {
    const catInfo = TSH_CATEGORIES[record.category] || TSH_CATEGORIES.normal;

    return (
      <div
        className="rounded-xl p-2.5 border-1.5 transition-all text-left group relative bg-white"
        style={{ borderColor: catInfo.borderColor, backgroundColor: catInfo.bgColor + '50' }}
      >
        <div className="flex items-center justify-between text-[11px] font-bold text-[#181A2E]/70 mb-1">
          <div className="flex items-center gap-1">
            {icon}
            <span>ช่วง{label}</span>
          </div>
          <span className="text-[10px] text-[#181A2E]/50 flex items-center gap-0.5">
            <Clock className="w-3 h-3" /> {record.measuredAt}
          </span>
        </div>

        {/* BP Value Display */}
        <div className="flex items-baseline justify-between mt-1">
          <div className="font-display font-black text-lg text-[#181A2E] leading-none">
            {record.avgSys}
            <span className="text-xs text-[#181A2E]/40 font-normal">/</span>
            {record.avgDia}
            <span className="text-[10px] font-normal text-[#181A2E]/50 ml-1">mmHg</span>
          </div>
          <div className="text-[11px] font-bold text-[#181A2E]/70">
            ชีพจร <span className="text-xs font-black text-[#181A2E]">{record.avgPulse}</span>
          </div>
        </div>

        {/* Category Badge & Flags */}
        <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${catInfo.badgeClass}`}>
            {catInfo.labelTh}
          </span>
          {record.medicationTaken && (
            <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1 py-0.5 rounded flex items-center gap-0.5" title="ทานยาแล้ว">
              <Pill className="w-2.5 h-2.5" /> ทานยา
            </span>
          )}
        </div>

        {/* Action buttons hover */}
        <div className="mt-2 pt-1.5 border-t border-[#181A2E]/10 flex items-center justify-end gap-1">
          <button
            onClick={() => onOpenRecordModal(dayNum, period, record)}
            className="p-1 text-[#181A2E]/70 hover:text-[#b7102a] hover:bg-white rounded cursor-pointer transition"
            title="แก้ไขการบันทึก"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => {
              if (confirm(`ต้องการลบผลการวัดวันที่ ${dayNum} ช่วง${label} ใช่หรือไม่?`)) {
                onDeleteRecord(record.id);
              }
            }}
            className="p-1 text-[#181A2E]/40 hover:text-red-600 hover:bg-white rounded cursor-pointer transition"
            title="ลบรายการนี้"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // Pending Slot Button
  return (
    <button
      onClick={() => onOpenRecordModal(dayNum, period)}
      className="w-full rounded-xl p-2.5 border-1.5 border-dashed border-[#181A2E]/25 hover:border-[#b7102a] bg-[#fbf8ff] hover:bg-[#ffebee]/60 transition-all text-left flex flex-col items-center justify-center min-h-[92px] group cursor-pointer"
    >
      <div className="flex items-center gap-1 text-xs font-bold text-[#181A2E]/70 group-hover:text-[#b7102a]">
        {icon}
        <span>ช่วง{label}</span>
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[11px] font-bold text-white bg-[#b7102a] group-hover:bg-[#db313f] px-2.5 py-1 rounded-lg shadow-[0_2px_0_#8f0d20]">
        <Plus className="w-3.5 h-3.5" />
        <span>บันทึก</span>
      </div>
    </button>
  );
};
