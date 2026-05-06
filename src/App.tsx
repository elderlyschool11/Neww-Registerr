import React, { useState, useEffect } from 'react';
import liff from '@line/liff';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Heart, 
  Ruler, 
  Weight, 
  Calendar, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  XCircle,
  ChevronRight
} from 'lucide-react';
import { cn } from './lib/utils';

// --- Types ---
interface FormData {
  firstName: string;
  lastName: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  chronicDiseases: string;
}

interface UserProfile {
  lineId: string;
  displayName: string;
  pictureUrl?: string;
}

const GENDER_OPTIONS = [
  { label: 'ชาย', value: 'male' },
  { label: 'หญิง', value: 'female' },
  { label: 'อื่นๆ', value: 'other' }
];

export default function App() {
  const [liffError, setLiffError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    weight: '',
    height: '',
    chronicDiseases: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  console.log('App Rendering');

  // Initialize LIFF
  useEffect(() => {
    const initLiff = async () => {
      // ดึงค่าจาก environment variables
      const liffId = import.meta.env.VITE_LIFF_ID;
      
      if (!liffId || liffId === 'YOUR_LIFF_ID') {
        console.error('LIFF ID is missing');
        setLiffError('กรุณาตั้งค่า LIFF ID');
        return;
      }

      try {
        await liff.init({ liffId });
        if (liff.isLoggedIn()) {
          const profileData = await liff.getProfile();
          setProfile({
            lineId: profileData.userId,
            displayName: profileData.displayName,
            pictureUrl: profileData.pictureUrl,
          });
        } else {
          // หากไม่ได้เปิดใน LINE ให้ Login (กรณีเปิดผ่าน Browser ปกติ)
          if (!liff.isInClient()) {
            liff.login();
          }
        }
      } catch (err) {
        console.error('LIFF init failed', err);
        setLiffError('ไม่สามารถเชื่อมต่อกับ LINE ได้ ตรวจสอบ LIFF ID ของคุณ');
      }
    };

    initLiff();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    const gasUrl = import.meta.env.VITE_GAS_URL;
    if (!gasUrl || gasUrl === 'https://script.google.com/macros/s/.../exec') {
      setStatus('error');
      setErrorMessage('กรุณาตั้งค่า URL ของ Google Apps Script');
      return;
    }

    try {
      const payload = {
        ...formData,
        lineId: profile?.lineId || 'anonymous',
        displayName: profile?.displayName || 'anonymous',
      };

      const response = await fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', // Standard for GAS Web App posts from different domain
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      // Since mode is no-cors, we can't reliably read the response body
      // We assume success if no error was thrown
      setStatus('success');
      
      // Auto-close LIFF after 3 seconds on success
      setTimeout(() => {
        if (liff.isInClient()) {
          liff.closeWindow();
        }
      }, 3000);

    } catch (err) {
      console.error('Submission failed', err);
      setStatus('error');
      setErrorMessage('เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    }
  };

  const InputWrapper = ({ label, icon: Icon, children, className }: { label: string, icon: any, children: React.ReactNode, className?: string }) => (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-sm font-bold text-slate-600 ml-1 flex items-center gap-2">
        <Icon className="w-4 h-4 text-brand" />
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-[#F4F7F6]">
      {/* Header Section */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-brand/20">
            {profile?.pictureUrl ? (
              <img src={profile.pictureUrl} alt="P" className="w-full h-full rounded-xl object-cover" />
            ) : "L"}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-tight">ระบบลงทะเบียนผู้สูงอายุ</h1>
            <p className="text-xs md:text-sm text-slate-500 font-medium">โครงการดูแลสุขภาพชุมชนประจำปี 2567</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <span className="px-3 py-1 bg-emerald-50 text-brand text-[10px] font-bold rounded-full border border-emerald-100 uppercase tracking-wider">
            Online via LINE LIFF
          </span>
          <div className="h-8 w-px bg-slate-200 mx-2"></div>
          <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 shadow-sm overflow-hidden flex items-center justify-center text-[10px]">
              {profile?.displayName?.charAt(0) || <User className="w-4 h-4" />}
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-300 shadow-sm flex items-center justify-center text-[10px] text-white">+1</div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 max-w-7xl mx-auto w-full">
        {/* Sidebar Guidance - Desktop Only */}
        <aside className="hidden md:flex w-64 flex-col gap-6 shrink-0">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">ขั้นตอนการลงทะเบียน</h2>
            <ul className="space-y-4">
              <li className="flex gap-3 items-center">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  status === 'idle' || status === 'submitting' ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-emerald-100 text-brand"
                )}>
                  {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                </div>
                <span className={cn(
                  "text-sm font-semibold transition-colors",
                  status === 'success' ? "text-slate-400" : "text-slate-900"
                )}>กรอกข้อมูลส่วนตัว</span>
              </li>
              <li className="flex gap-3 items-center">
                <div className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors",
                  status === 'success' ? "bg-brand text-white shadow-md shadow-brand/20" : "bg-slate-100 text-slate-400"
                )}>2</div>
                <span className={cn(
                  "text-sm font-medium transition-colors",
                  status === 'success' ? "text-slate-900 font-semibold" : "text-slate-400"
                )}>บันทึกสำเร็จ</span>
              </li>
              <li className="flex gap-3 items-center opacity-50">
                <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold">3</div>
                <span className="text-sm font-medium text-slate-400">เสร็จสิ้นขั้นตอน</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-emerald-50/50 p-6 rounded-2xl border border-emerald-100 shrink-0">
            <p className="text-xs text-brand font-semibold leading-relaxed italic">
              "ข้อมูลของท่านจะถูกเก็บเป็นความลับและใช้เพื่อวัตถุประสงค์ในการดูแลสุขภาพเท่านั้น"
            </p>
          </div>
        </aside>

        {/* Form Container */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col min-h-0">
          <div className="flex-1 flex flex-col">
            {status === 'success' ? (
              <div 
                className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-6"
              >
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center ring-8 ring-emerald-50/50">
                  <CheckCircle2 className="w-16 h-16 text-brand" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-slate-900">บันทึกเรียบร้อย</h2>
                  <p className="text-slate-500 font-medium">ข้อมูลถูกส่งไปยังโครงการเรียบร้อยแล้ว</p>
                </div>
                <button 
                  onClick={() => liff.closeWindow()}
                  className="mt-4 px-10 py-4 bg-brand text-white rounded-xl font-bold text-lg shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  ปิดหน้าต่างและกลับไปที่ LINE
                </button>
              </div>
            ) : (
              <form 
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col p-6 md:p-10"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <InputWrapper label="ชื่อ (First Name)" icon={User}>
                    <input
                      required
                      type="text"
                      name="firstName"
                      placeholder="สมชาย"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder:text-slate-300"
                    />
                  </InputWrapper>
                  <InputWrapper label="นามสกุล (Last Name)" icon={User}>
                    <input
                      required
                      type="text"
                      name="lastName"
                      placeholder="ใจดีเสมอ"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all placeholder:text-slate-300"
                    />
                  </InputWrapper>

                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="อายุ (Age)" icon={Calendar}>
                      <input
                        required
                        type="number"
                        name="age"
                        placeholder="65"
                        value={formData.age}
                        onChange={handleChange}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      />
                    </InputWrapper>
                    <InputWrapper label="เพศ (Gender)" icon={User}>
                      <select
                        required
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled>เลือกเพศ</option>
                        {GENDER_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </InputWrapper>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InputWrapper label="น้ำหนัก (กก.)" icon={Weight}>
                      <input
                        required
                        type="number"
                        name="weight"
                        placeholder="60"
                        value={formData.weight}
                        onChange={handleChange}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      />
                    </InputWrapper>
                    <InputWrapper label="ส่วนสูง (ซม.)" icon={Ruler}>
                      <input
                        required
                        type="number"
                        name="height"
                        placeholder="165"
                        value={formData.height}
                        onChange={handleChange}
                        className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all"
                      />
                    </InputWrapper>
                  </div>

                  <InputWrapper label="โรคประจำตัว (Chronic Diseases)" icon={Heart} className="md:col-span-2">
                    <textarea
                      required
                      name="chronicDiseases"
                      rows={2}
                      placeholder="เช่น เบาหวาน ความดัน (หากไม่มีให้ใส่ -)"
                      value={formData.chronicDiseases}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition-all resize-none"
                    />
                  </InputWrapper>
                </div>

                {/* Status/Error Info */}
                <div className="mt-4">
                  {liffError && (
                    <div className="text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded inline-flex items-center gap-1.5 border border-amber-100 uppercase tracking-tighter">
                      <AlertCircle className="w-3 h-3" />
                      LIFF Connectivity Reduced
                    </div>
                  )}
                  {status === 'error' && (
                    <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 flex items-center gap-3 text-sm font-semibold">
                      <XCircle className="w-5 h-5 shrink-0" />
                      {errorMessage}
                    </div>
                  )}
                </div>

                {/* Action Area */}
                <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-medium">
                    <div className={cn("w-2 h-2 rounded-full", status === 'submitting' ? "bg-amber-400 animate-pulse" : "bg-brand")}></div>
                    Cloud Synchronization: {status === 'idle' || status === 'submitting' ? 'Awaiting Data' : 'Active'}
                  </div>
                  <div className="flex gap-4 w-full md:w-auto">
                    <button 
                      type="button"
                      disabled={status === 'submitting'}
                      onClick={() => setFormData({ firstName: '', lastName: '', age: '', gender: '', weight: '', height: '', chronicDiseases: '' })}
                      className="flex-1 md:flex-none px-8 py-4 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button 
                      type="submit"
                      disabled={status === 'submitting'}
                      className="flex-1 md:flex-none px-10 py-4 rounded-xl bg-brand text-white font-bold shadow-lg shadow-brand/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {status === 'submitting' ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          กำลังบันทึก...
                        </>
                      ) : (
                        <>
                          บันทึกข้อมูลและปิดหน้าต่าง
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Footer Decorative Status Bar */}
      <footer className="h-12 bg-slate-900 shrink-0 flex items-center justify-between px-6 md:px-10 text-[10px] text-slate-400 uppercase tracking-[0.2em] font-medium overflow-hidden">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-brand"></div> Connected to Google Apps Script</span>
          <span className="hidden md:inline">• DATABASE: PRIMARY SHEET (ACTIVE)</span>
        </div>
        <span className="hidden sm:inline">Version 2.4.0 • Build ID: AIS-7GIABNJ-943</span>
      </footer>
    </div>
  );
}
