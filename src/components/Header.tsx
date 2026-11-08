import React from 'react';
import { Heart, Activity, User, BookOpen, Printer, Sparkles, RefreshCw, LogIn, LogOut, CheckCircle2 } from 'lucide-react';
import { User as FirebaseUser } from '../lib/firebase';
import { UserProfile } from '../types/bloodPressure';

interface HeaderProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  onOpenProfile: () => void;
  onOpenGuidelines: () => void;
  onOpenPrintReport: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onLoadDemoData: () => void;
  onNewCycle: () => void;
  isLoadingDemo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  profile,
  onOpenProfile,
  onOpenGuidelines,
  onOpenPrintReport,
  onLogin,
  onLogout,
  onLoadDemoData,
  onNewCycle,
  isLoadingDemo,
}) => {
  return (
    <header className="bg-white border-b-2 border-[#181A2E]/10 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          
          {/* Logo & Protocol Title */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#b7102a] text-white flex items-center justify-center shadow-[0_4px_0_#8f0d20] shrink-0">
              <Heart className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ffb702]/20 text-[#7d5800] border border-[#ffb702]/40">
                  TSH HBPM 7-Day Protocol
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#006948] bg-[#006948]/10 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3" /> มาตรฐานสมาคมความดันโลหิตสูงไทย
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-[#181A2E] tracking-tight font-display flex items-center gap-2">
                บันทึกความดันโลหิตที่บ้าน 7 วัน
              </h1>
            </div>
          </div>

          {/* Quick Actions & User Bar */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* TSH Guidelines Button */}
            <button
              onClick={onOpenGuidelines}
              className="px-3 py-2 text-xs sm:text-sm font-bold text-[#181A2E] bg-[#fbf8ff] hover:bg-[#edecff] rounded-xl border-1.5 border-[#181A2E]/20 btn-secondary-shelf flex items-center gap-1.5 cursor-pointer"
              title="ข้อปฏิบัติการวัดความดันตามแนวทาง TSH"
            >
              <BookOpen className="w-4 h-4 text-[#b7102a]" />
              <span>แนวทาง TSH</span>
            </button>

            {/* Print / Medical Report */}
            <button
              onClick={onOpenPrintReport}
              className="px-3 py-2 text-xs sm:text-sm font-bold text-white bg-[#006948] hover:bg-[#00855d] rounded-xl btn-tertiary-shelf flex items-center gap-1.5 cursor-pointer"
              title="พิมพ์แบบฟอร์มนำไปพบแพทย์"
            >
              <Printer className="w-4 h-4" />
              <span>รายงานพบแพทย์</span>
            </button>

            {/* Load Sample Data */}
            <button
              onClick={onLoadDemoData}
              disabled={isLoadingDemo}
              className="px-3 py-2 text-xs sm:text-sm font-bold text-[#7d5800] bg-[#ffb702]/20 hover:bg-[#ffb702]/30 rounded-xl border border-[#ffb702]/50 flex items-center gap-1.5 cursor-pointer transition disabled:opacity-50"
              title="โหลดชุดข้อมูลตัวอย่าง 7 วันครบถ้วน เพื่อทดสอบระบบ"
            >
              <Sparkles className="w-4 h-4 text-[#7d5800]" />
              <span className="hidden sm:inline">ข้อมูลตัวอย่าง 7 วัน</span>
              <span className="sm:hidden">ตัวอย่าง</span>
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l-2 border-[#181A2E]/10">
                <button
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#f4f2ff] hover:bg-[#e6e6ff] rounded-xl border border-[#181A2E]/15 cursor-pointer"
                  title="ข้อมูลผู้ป่วยและการตั้งค่า"
                >
                  <div className="w-7 h-7 rounded-full bg-[#181A2E] text-white flex items-center justify-center font-bold text-xs uppercase">
                    {profile?.displayName?.charAt(0) || user.displayName?.charAt(0) || 'P'}
                  </div>
                  <div className="text-left hidden md:block">
                    <p className="text-xs font-bold text-[#181A2E] leading-tight truncate max-w-[120px]">
                      {profile?.displayName || user.displayName || 'ผู้ป่วย'}
                    </p>
                    <p className="text-[10px] text-[#181A2E]/60 leading-tight">
                      เป้าหมาย &lt; 135/85
                    </p>
                  </div>
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-[#181A2E]/60 hover:text-[#b7102a] rounded-lg hover:bg-[#ffebee] transition"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="px-4 py-2 text-xs sm:text-sm font-bold text-white bg-[#b7102a] hover:bg-[#db313f] rounded-xl btn-primary-shelf flex items-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
