import React from 'react';
import { X, BookOpen, Heart, CheckCircle2, AlertOctagon, HelpCircle, Activity } from 'lucide-react';
import { TSH_CATEGORIES } from '../utils/tshGuidelines';

interface GuidelineModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GuidelineModal: React.FC<GuidelineModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden card-tactile my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbf8ff] border-b border-[#181A2E]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#006948] text-white flex items-center justify-center shadow-[0_3px_0_#004d35]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase text-[#006948] bg-[#e6f7ef] px-2 py-0.5 rounded-md">
                สมาคมความดันโลหิตสูงแห่งประเทศไทย
              </span>
              <h3 className="text-lg sm:text-xl font-extrabold text-[#181A2E] font-display">
                คู่มือแนวทางการวัดความดันโลหิตที่บ้าน 7 วัน (TSH HBPM)
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto text-[#181A2E]">
          
          {/* Key Principle: Why 7 Days? */}
          <div className="bg-[#fff9e6] rounded-2xl p-4 border border-[#ffe08a] space-y-2">
            <h4 className="font-extrabold text-[#7d5800] text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#006948]" />
              ทำไมต้องวัดต่อเนื่อง 7 วัน เช้า-เย็น ตามแนวทาง TSH?
            </h4>
            <p className="text-xs text-[#181A2E]/80 leading-relaxed">
              การวัดความดันโลหิตที่บ้านต่อเนื่อง 7 วันเป็นวิธีที่มีความแม่นยำสูงกว่าการวัดที่โรงพยาบาลเพียงครั้งเดียว ช่วยตัดปัญหาภาวะ <strong>"ความดันโลหิตสูงเพราะตื่นเต้นเมื่อเจอแพทย์" (White-coat effect)</strong> หรือ <strong>"ความดันโลหิตแฝง" (Masked hypertension)</strong> ที่วัดที่ รพ. ปกติแต่วัดที่บ้านสูง
            </p>
            <p className="text-xs text-[#7d5800] font-bold">
              * กฎของสมาคม TSH: ผลของ "วันแรก" จะถูกตัดออกจากการวินิจฉัย เพราะมักมีความคลาดเคลื่อนจากความตื่นเต้น โดยจะนำค่าเฉลี่ยของ "วันที่ 2 ถึงวันที่ 7" มาประเมิน
            </p>
          </div>

          {/* 4 Golden Steps */}
          <div>
            <h4 className="font-extrabold text-base text-[#181A2E] font-display mb-3">
              4 กฎเหล็กการวัดความดันโลหิตที่ถูกต้อง
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              
              <div className="p-3.5 rounded-2xl bg-[#fbf8ff] border border-[#181A2E]/10 space-y-1.5">
                <span className="font-extrabold text-[#b7102a] text-sm block">1. ช่วงเช้า (Morning)</span>
                <p className="text-[#181A2E]/75 leading-relaxed">
                  วัดภายใน <strong>1 ชั่วโมงหลังตื่นนอน</strong> หลังจากปัสสาวะเรียบร้อยแล้ว และที่สำคัญต้อง <strong>ก่อนรับประทานอาหารเช้า และก่อนรับประทานยาลดความดัน</strong>
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fbf8ff] border border-[#181A2E]/10 space-y-1.5">
                <span className="font-extrabold text-indigo-700 text-sm block">2. ช่วงเย็น (Evening)</span>
                <p className="text-[#181A2E]/75 leading-relaxed">
                  วัดช่วงหัวค่ำหรือ <strong>ก่อนเข้านอน</strong> ควรทิ้งระยะห่างหลังอาหารเย็นอย่างน้อย 30-60 นาที และนั่งพักผ่อนสบายๆ 5 นาทีก่อนเริ่มวัด
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fbf8ff] border border-[#181A2E]/10 space-y-1.5">
                <span className="font-extrabold text-[#006948] text-sm block">3. วัด 2 ครั้ง ห่างกัน 1-2 นาที</span>
                <p className="text-[#181A2E]/75 leading-relaxed">
                  ในแต่ละช่วงเวลา ให้วัด <strong>2 ครั้งต่อเนื่องกัน</strong> โดยพักแขนนิ่งๆ 1-2 นาทีระหว่างครั้ง เพื่อให้หลอดเลือดคลายตัว จากนั้นนำค่าทั้งสองมาหาค่าเฉลี่ย
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#fbf8ff] border border-[#181A2E]/10 space-y-1.5">
                <span className="font-extrabold text-[#7d5800] text-sm block">4. ท่าทางการนั่งที่ถูกต้อง</span>
                <p className="text-[#181A2E]/75 leading-relaxed">
                  นั่งเก้าอี้หลังพิงพนัก <strong>เท้าสองข้างวางราบกับพื้น ห้ามไขว่ห้าง</strong> วางแขนบนโต๊ะให้ปลอกแขน (Cuff) อยู่ระดับเดียวกับหัวใจ ไม่พูดคุยขณะเครื่องทำงาน
                </p>
              </div>

            </div>
          </div>

          {/* Classification Criteria Table */}
          <div>
            <h4 className="font-extrabold text-base text-[#181A2E] font-display mb-2">
              เกณฑ์การแปลผลความดันโลหิตที่บ้าน (TSH Criteria)
            </h4>
            <div className="border border-[#181A2E]/15 rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#181A2E] text-white">
                  <tr>
                    <th className="p-2.5">ระดับความดัน</th>
                    <th className="p-2.5 text-center">ตัวบน (SYS)</th>
                    <th className="p-2.5 text-center">ตัวล่าง (DIA)</th>
                    <th className="p-2.5">คำอธิบาย</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#181A2E]/10">
                  {Object.values(TSH_CATEGORIES).map((cat) => (
                    <tr key={cat.key} style={{ backgroundColor: cat.bgColor + '40' }}>
                      <td className="p-2.5 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-black border ${cat.badgeClass}`}>
                          {cat.labelTh}
                        </span>
                      </td>
                      <td className="p-2.5 text-center font-black">{cat.sysRange}</td>
                      <td className="p-2.5 text-center font-black">{cat.diaRange}</td>
                      <td className="p-2.5 text-[#181A2E]/80 text-[11px]">{cat.adviceTh}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[11px] text-[#181A2E]/60 mt-1.5 italic">
              * ข้อสังเกต: เกณฑ์วินิจฉัยความดันโลหิตสูงที่บ้านคือ <strong>≥ 135/85 mmHg</strong> (ต่ำกว่าเกณฑ์วัดที่โรงพยาบาลซึ่งอยู่ที่ ≥ 140/90 mmHg)
            </p>
          </div>

          {/* Red Flag Warning */}
          <div className="bg-[#ffebee] border-2 border-red-300 rounded-2xl p-4 flex items-start gap-3">
            <AlertOctagon className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs text-red-950 space-y-1">
              <strong className="text-sm font-black text-red-800 block">
                สัญญาณอันตราย (Red Flags) ที่ต้องไปพบแพทย์ทันที:
              </strong>
              <p>
                หากวัดความดันโลหิตได้ <strong>สูงเกิน 180/110 mmHg</strong> แม้จะนั่งพัก 15 นาทีแล้ววัดซ้ำ หรือมีอาการเตือนต่อไปนี้ร่วมด้วย:
              </p>
              <ul className="list-disc list-inside font-semibold space-y-0.5">
                <li>ปวดศีรษะรุนแรงอย่างไม่เคยเป็นมาก่อน</li>
                <li>แน่นหน้าอก เจ็บหน้าอกร้าวไปกรามหรือแขน</li>
                <li>เหนื่อยหอบ หายใจไม่ทัน นอนราบไม่ได้</li>
                <li>ตาพร่ามัว มองเห็นภาพซ้อนเฉียบพลัน</li>
                <li>ปากเบี้ยว แขนขาอ่อนแรง หรือชาครึ่งซีก พูดไม่ชัด</li>
              </ul>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-[#fbf8ff] border-t border-[#181A2E]/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#181A2E] text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-[#2d2f44] cursor-pointer"
          >
            เข้าใจแล้ว ปิดหน้าต่างนี้
          </button>
        </div>

      </div>
    </div>
  );
};
