import React, { useState } from 'react';
import { 
  X, 
  User as UserIcon, 
  Lock, 
  Mail, 
  Phone, 
  MapPin, 
  LogOut, 
  Check, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  Edit3,
  Save,
  Wallet,
  PlusCircle,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  Chrome,
  Loader2,
  GraduationCap,
  School,
  Building2,
  BadgeCheck,
} from 'lucide-react';
import { User, UserRole, SchoolRole } from '../types';
import { auth, googleProvider, signInWithPopup, signOut, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { INITIAL_USERS } from '../data/initialData';

export const isHpnSchoolEmail = (email: string): boolean => {
  if (!email) return false;
  return email.trim().toLowerCase().endsWith('@hpn.edu.vn');
};

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  usersList: User[];
  onLogin: (user: User) => void;
  onRegister: (newUser: User) => void;
  onLogout: () => void;
  onUpdateProfile?: (updatedUser: User) => void;
  onOpenWallet?: () => void;
  initialMode?: 'LOGIN' | 'REGISTER' | 'PROFILE';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  usersList,
  onLogin,
  onRegister,
  onLogout,
  onUpdateProfile,
  onOpenWallet,
  initialMode = 'LOGIN',
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER' | 'PROFILE'>(
    currentUser ? 'PROFILE' : initialMode
  );

  // Sync mode when modal opens
  React.useEffect(() => {
    if (isOpen) {
      if (currentUser && initialMode !== 'REGISTER') {
        setMode('PROFILE');
      } else {
        setMode(initialMode);
      }
      setLoginError('');
      setRegisterError('');
      setPendingGoogleSchoolUser(null);
    }
  }, [isOpen, currentUser, initialMode]);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regArea, setRegArea] = useState('');
  const [regSchoolRole, setRegSchoolRole] = useState<'TEACHER' | 'STUDENT'>('STUDENT');
  const [regStudentId, setRegStudentId] = useState('');
  const [regFaculty, setRegFaculty] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [showSampleHint, setShowSampleHint] = useState(false);

  // Pending Google Sign-in step for HPN email accounts
  const [pendingGoogleSchoolUser, setPendingGoogleSchoolUser] = useState<{
    fbUser: any;
    email: string;
    name: string;
    photoURL?: string;
  } | null>(null);
  const [googleSchoolRole, setGoogleSchoolRole] = useState<'TEACHER' | 'STUDENT' | 'GUEST'>('STUDENT');
  const [googleStudentId, setGoogleStudentId] = useState('');
  const [googleFaculty, setGoogleFaculty] = useState('');

  // Profile Edit State (for Customer, Staff, Admin to change own info)
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editArea, setEditArea] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editSchoolRole, setEditSchoolRole] = useState<'TEACHER' | 'STUDENT' | 'GUEST'>('STUDENT');
  const [editStudentId, setEditStudentId] = useState('');
  const [editFaculty, setEditFaculty] = useState('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  React.useEffect(() => {
    if (currentUser) {
      setEditFullName(currentUser.fullName);
      setEditPhone(currentUser.phone);
      setEditArea(currentUser.area);
      setEditPassword('');
      const currentRole = currentUser.role === 'TEACHER' || currentUser.schoolRole === 'TEACHER' 
        ? 'TEACHER' 
        : currentUser.role === 'STUDENT' || currentUser.schoolRole === 'STUDENT'
        ? 'STUDENT'
        : 'GUEST';
      setEditSchoolRole(currentRole);
      setEditStudentId(currentUser.studentId || '');
      setEditFaculty(currentUser.faculty || '');
      setIsEditingProfile(false);
      setProfileSuccessMsg('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen) return null;

  // Handle Google Sign-in with Firebase
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setLoginError('');
    setRegisterError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (!fbUser) return;

      const email = (fbUser.email || '').trim().toLowerCase();
      // Check if user already exists in usersList
      const existing = usersList.find(
        (u) =>
          (email && u.email.toLowerCase() === email) ||
          (u.firebaseUid && u.firebaseUid === fbUser.uid)
      );

      if (existing) {
        const updatedUser: User = {
          ...existing,
          photoURL: fbUser.photoURL || existing.photoURL,
          fullName: existing.fullName || fbUser.displayName || 'Khách hàng Google',
          firebaseUid: fbUser.uid,
        };

        try {
          await setDoc(
            doc(db, 'users', fbUser.uid),
            {
              id: String(updatedUser.id),
              email: updatedUser.email,
              name: updatedUser.fullName,
              role: updatedUser.role,
              schoolRole: updatedUser.schoolRole || updatedUser.role,
              studentId: updatedUser.studentId || '',
              faculty: updatedUser.faculty || '',
              phone: updatedUser.phone,
              balance: updatedUser.walletBalance || 0,
              rewardPoints: updatedUser.rewardPoints || 0,
              photoURL: updatedUser.photoURL || '',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (syncErr) {
          console.warn('Firestore sync info:', syncErr);
        }

        onLogin(updatedUser);
        onClose();
      } else {
        // NEW USER REGISTRATION VIA GOOGLE
        const isSchool = isHpnSchoolEmail(email);

        if (isSchool) {
          // School email (@hpn.edu.vn): Prompt user to choose between Teacher and Student
          setPendingGoogleSchoolUser({
            fbUser,
            email,
            name: fbUser.displayName || 'Thành viên HPN',
            photoURL: fbUser.photoURL || undefined,
          });
          setIsGoogleLoading(false);
          return;
        }

        // Non-HPN email: Automatically assigned as Guest ("Khách vãng lai")
        const newGoogleUser: User = {
          id: Math.floor(Date.now() / 1000),
          email: email || `user_${fbUser.uid.slice(0, 6)}@gmail.com`,
          fullName: fbUser.displayName || 'Khách vãng lai',
          phone: fbUser.phoneNumber || '0900000000',
          role: 'GUEST',
          schoolRole: 'GUEST',
          area: 'Khu A - Căn-tin chính',
          createdAt: new Date().toISOString().split('T')[0],
          walletBalance: 50000, // Tặng 50.000đ ưu đãi thành viên mới
          rewardPoints: 50, // Tặng 50 C-Points chào mừng
          vipTier: 'BRONZE',
          totalSpent: 0,
          photoURL: fbUser.photoURL || undefined,
          firebaseUid: fbUser.uid,
        };

        try {
          await setDoc(doc(db, 'users', fbUser.uid), {
            id: String(newGoogleUser.id),
            email: newGoogleUser.email,
            name: newGoogleUser.fullName,
            role: newGoogleUser.role,
            schoolRole: newGoogleUser.schoolRole,
            phone: newGoogleUser.phone,
            balance: newGoogleUser.walletBalance || 50000,
            rewardPoints: newGoogleUser.rewardPoints || 50,
            photoURL: newGoogleUser.photoURL || '',
            createdAt: new Date().toISOString(),
          });
        } catch (syncErr) {
          console.warn('Firestore sync info:', syncErr);
        }

        onRegister(newGoogleUser);
        onClose();
      }
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      if (err && typeof err === 'object' && 'code' in err) {
        const code = (err as { code: string }).code;
        if (code === 'auth/popup-closed-by-user') {
          setLoginError('Bạn đã đóng cửa sổ đăng nhập Google.');
        } else if (code === 'auth/popup-blocked') {
          setLoginError('Trình duyệt đã chặn popup. Vui lòng cho phép popup để đăng nhập Google.');
        } else if (code === 'auth/cancelled-popup-request') {
          // ignore
        } else {
          setLoginError('Đăng nhập Google không thành công. Vui lòng thử lại!');
        }
      } else {
        setLoginError('Đã xảy ra lỗi khi kết nối với tài khoản Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Complete Google School Onboarding with chosen role (Teacher or Student)
  const handleConfirmGoogleSchoolUser = async () => {
    if (!pendingGoogleSchoolUser) return;
    const { fbUser, email, name, photoURL } = pendingGoogleSchoolUser;

    const newGoogleUser: User = {
      id: Math.floor(Date.now() / 1000),
      email,
      fullName: name,
      phone: fbUser.phoneNumber || '0900000000',
      role: googleSchoolRole,
      schoolRole: googleSchoolRole,
      studentId: googleStudentId.trim() || undefined,
      faculty: googleFaculty.trim() || undefined,
      area: googleSchoolRole === 'TEACHER' ? 'Phòng Giảng viên Nhà A' : 'Khu vực Sinh viên Căn-tin',
      createdAt: new Date().toISOString().split('T')[0],
      walletBalance: 50000,
      rewardPoints: 50,
      vipTier: 'BRONZE',
      totalSpent: 0,
      photoURL,
      firebaseUid: fbUser.uid,
    };

    try {
      await setDoc(doc(db, 'users', fbUser.uid), {
        id: String(newGoogleUser.id),
        email: newGoogleUser.email,
        name: newGoogleUser.fullName,
        role: newGoogleUser.role,
        schoolRole: newGoogleUser.schoolRole,
        studentId: newGoogleUser.studentId || '',
        faculty: newGoogleUser.faculty || '',
        phone: newGoogleUser.phone,
        balance: newGoogleUser.walletBalance || 50000,
        rewardPoints: newGoogleUser.rewardPoints || 50,
        photoURL: newGoogleUser.photoURL || '',
        createdAt: new Date().toISOString(),
      });
    } catch (syncErr) {
      console.warn('Firestore sync info:', syncErr);
    }

    onRegister(newGoogleUser);
    setPendingGoogleSchoolUser(null);
    onClose();
  };

  // Direct instant login helper
  const handleDirectLogin = (userKey: keyof typeof INITIAL_USERS) => {
    const targetUser = INITIAL_USERS[userKey];
    if (targetUser) {
      onLogin(targetUser);
      onClose();
    }
  };

  // Handle Manual Login
  const handleSubmitLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanEmail = loginEmail.trim().toLowerCase();
    const cleanPass = loginPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setLoginError('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    // Check combined users: usersList + INITIAL_USERS fallback
    const allAvailableUsers = [...usersList];
    Object.values(INITIAL_USERS).forEach((initUser) => {
      if (!allAvailableUsers.some((u) => u.email.toLowerCase() === initUser.email.toLowerCase())) {
        allAvailableUsers.push(initUser);
      }
    });

    // Find in allAvailableUsers
    const foundUser = allAvailableUsers.find(
      u => u.email.toLowerCase() === cleanEmail || u.phone === cleanEmail
    );

    if (!foundUser) {
      setLoginError('Tài khoản email hoặc số điện thoại này chưa được đăng ký trong hệ thống.');
      return;
    }

    // Check password (default is password123)
    const expectedPass = foundUser.password || 'password123';
    if (cleanPass !== expectedPass) {
      setLoginError('Mật khẩu không chính xác. Mật khẩu mẫu là: password123');
      return;
    }

    // Login successful
    onLogin(foundUser);
    onClose();
  };

  // Handle Manual Register
  const handleSubmitRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!regFullName.trim()) {
      setRegisterError('Vui lòng nhập họ và tên.');
      return;
    }
    if (!regEmail.trim() || !regEmail.includes('@')) {
      setRegisterError('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }
    if (!regPhone.trim() || regPhone.trim().length < 9) {
      setRegisterError('Vui lòng nhập số điện thoại hợp lệ (ít nhất 9 số).');
      return;
    }
    if (regPassword.length < 6) {
      setRegisterError('Mật khẩu phải có ít nhất 6 ký tự.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegisterError('Mật khẩu xác nhận không khớp.');
      return;
    }

    // Check if email already exists in usersList or INITIAL_USERS
    const allAvailable = [...usersList, ...Object.values(INITIAL_USERS)];
    const existing = allAvailable.find(
      u => u.email.toLowerCase() === regEmail.trim().toLowerCase()
    );
    if (existing) {
      setRegisterError('Email này đã tồn tại trong hệ thống. Vui lòng chọn email khác hoặc đăng nhập.');
      return;
    }

    const isSchool = isHpnSchoolEmail(regEmail);
    const finalRole: UserRole = isSchool ? regSchoolRole : 'GUEST';
    const finalSchoolRole: SchoolRole = isSchool ? (regSchoolRole as SchoolRole) : 'GUEST';

    const newUser: User = {
      id: Math.floor(Date.now() / 1000),
      email: regEmail.trim(),
      phone: regPhone.trim(),
      fullName: regFullName.trim(),
      role: finalRole,
      schoolRole: finalSchoolRole,
      studentId: isSchool ? (regStudentId.trim() || undefined) : undefined,
      faculty: isSchool ? (regFaculty.trim() || undefined) : undefined,
      area: regArea.trim() || (finalRole === 'TEACHER' ? 'Phòng Giảng viên Nhà A' : finalRole === 'STUDENT' ? 'Khu vực Sinh viên Căn-tin' : 'Khu vực Căn-tin'),
      createdAt: new Date().toISOString().split('T')[0],
      password: regPassword,
      walletBalance: 50000,
      rewardPoints: 50,
      vipTier: 'BRONZE',
      totalSpent: 0,
    };

    onRegister(newUser);
    onClose();
  };

  // Quick fill helper for convenience
  const handleQuickFill = (email: string, pass: string) => {
    setLoginEmail(email);
    setLoginPassword(pass);
    setLoginError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Background ambient gold blur glow */}
      <div className="fixed -top-32 -left-32 w-80 h-80 bg-[#E8B84B]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-32 -right-32 w-80 h-80 bg-[#E8B84B]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative bg-bg-card rounded-3xl max-w-md w-full shadow-[0_0_35px_rgba(232,184,75,0.15)] border border-[#E8B84B]/30 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 text-text-primary">
        
        {/* Brand Logo Header */}
        <div className="px-5 pt-5 pb-3 text-center border-b border-border-base bg-bg-primary/90 relative">
          <div className="inline-flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#E8B84B] to-[#B88A24] flex items-center justify-center text-black font-black text-sm shadow-md shadow-[#E8B84B]/20">
              ⚡
            </div>
            <span className="font-serif text-2xl font-black gold-gradient-text tracking-tight">CanteenGo</span>
          </div>
          <p className="text-[10px] text-text-secondary uppercase tracking-widest font-semibold">Căn-tin & Đặt Cơm Cao Cấp</p>
        </div>

        {/* Header Tabs or Google Role Onboarding Header */}
        {pendingGoogleSchoolUser ? (
          <div className="bg-bg-card border-b border-border-base px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#E8B84B] text-black flex items-center justify-center shadow-xs font-bold">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-black text-xs text-[#E8B84B]">Xác Nhận Vai Trò Trường HPN</h3>
                <p className="text-[10px] text-text-secondary font-medium">Đăng nhập tài khoản Google @hpn.edu.vn</p>
              </div>
            </div>
            <button
              onClick={() => setPendingGoogleSchoolUser(null)}
              className="w-7 h-7 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="bg-bg-primary border-b border-border-base px-5 pt-3 pb-0 flex items-center justify-between">
            <div className="flex gap-4">
              {currentUser ? (
                <button
                  onClick={() => setMode('PROFILE')}
                  className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                    mode === 'PROFILE'
                      ? 'border-[#E8B84B] text-[#E8B84B]'
                      : 'border-transparent text-text-secondary hover:text-text-primary'
                  }`}
                >
                  Hồ Sơ Cá Nhân
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { setMode('LOGIN'); setLoginError(''); }}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      mode === 'LOGIN'
                        ? 'border-[#E8B84B] text-[#E8B84B]'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => { setMode('REGISTER'); setRegisterError(''); }}
                    className={`pb-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                      mode === 'REGISTER'
                        ? 'border-[#E8B84B] text-[#E8B84B]'
                        : 'border-transparent text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    Đăng Ký Tài Khoản
                  </button>
                </>
              )}
            </div>

            <button
              onClick={onClose}
              className="w-7 h-7 -mt-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-bg-elevated flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP: PENDING GOOGLE SCHOOL ROLE SELECTION */}
        {pendingGoogleSchoolUser && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in fade-in">
            <div className="text-center space-y-1 pb-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px] mb-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Đã nhận diện email nội bộ trường</span>
              </div>
              <h2 className="text-base font-black text-slate-900">
                Chọn vai trò của bạn tại trường HPN
              </h2>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tài khoản Google có đuôi xác thực <strong className="text-emerald-700 font-mono">@hpn.edu.vn</strong>. Vui lòng chọn đúng vai trò để nhận thực đơn và ưu đãi phù hợp.
              </p>
            </div>

            {/* User Google Preview Card */}
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              {pendingGoogleSchoolUser.photoURL ? (
                <img
                  src={pendingGoogleSchoolUser.photoURL}
                  alt={pendingGoogleSchoolUser.name}
                  className="w-11 h-11 rounded-xl object-cover border-2 border-white shadow-2xs flex-shrink-0"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-black text-base flex items-center justify-center flex-shrink-0">
                  {pendingGoogleSchoolUser.name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-xs text-slate-900 truncate">
                  {pendingGoogleSchoolUser.name}
                </div>
                <div className="text-[11px] text-emerald-700 font-mono font-medium truncate">
                  {pendingGoogleSchoolUser.email}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex-shrink-0">
                @hpn.edu.vn
              </span>
            </div>

            {/* Role Selection (Teacher vs Student) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Vai trò của bạn tại trường: <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setGoogleSchoolRole('TEACHER')}
                  className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                    googleSchoolRole === 'TEACHER'
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">👨‍🏫</span>
                    {googleSchoolRole === 'TEACHER' ? (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className={`font-black text-xs ${googleSchoolRole === 'TEACHER' ? 'text-emerald-950' : 'text-slate-800'}`}>
                      Giáo viên / Giảng viên
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Cán bộ, giảng viên, nhân sự trường HPN
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setGoogleSchoolRole('STUDENT')}
                  className={`p-3.5 rounded-2xl border-2 text-left flex flex-col justify-between transition-all cursor-pointer ${
                    googleSchoolRole === 'STUDENT'
                      ? 'border-indigo-600 bg-indigo-50/70 shadow-xs ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">👨‍🎓</span>
                    {googleSchoolRole === 'STUDENT' ? (
                      <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-slate-300" />
                    )}
                  </div>
                  <div>
                    <div className={`font-black text-xs ${googleSchoolRole === 'STUDENT' ? 'text-indigo-950' : 'text-slate-800'}`}>
                      Sinh viên
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Sinh viên, học viên các khóa trường HPN
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Optional School Info */}
            <div className="space-y-3 pt-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  {googleSchoolRole === 'TEACHER' ? 'Mã Giảng viên / Cán bộ (tùy chọn)' : 'Mã số Sinh viên (tùy chọn)'}
                </label>
                <input
                  type="text"
                  value={googleStudentId}
                  onChange={(e) => setGoogleStudentId(e.target.value)}
                  placeholder={googleSchoolRole === 'TEACHER' ? 'VD: GV-CNTT102' : 'VD: SV-2024HPN01'}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Khoa / Đơn vị / Lớp (tùy chọn)
                </label>
                <input
                  type="text"
                  value={googleFaculty}
                  onChange={(e) => setGoogleFaculty(e.target.value)}
                  placeholder="VD: Khoa Công Nghệ Thông Tin / Lớp K24"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPendingGoogleSchoolUser(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 font-bold text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmGoogleSchoolUser}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Xác nhận vai trò & Vào Căn-tin</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 1: MANUAL LOGIN FORM */}
        {!pendingGoogleSchoolUser && mode === 'LOGIN' && (
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h2 className="text-lg font-black font-serif text-text-primary">Chào mừng bạn trở lại!</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Nhập email và mật khẩu của bạn để đăng nhập vào CanteenGo
              </p>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Google One-Click Sign-in Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-border-base hover:border-[#E8B84B]/50 bg-bg-input hover:bg-bg-hover text-text-primary font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#E8B84B]" />
                ) : (
                  <Chrome className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                )}
                <span>{isGoogleLoading ? 'Đang kết nối Google...' : 'Đăng nhập nhanh bằng Google'}</span>
              </button>

              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-border-base w-full" />
                <span className="bg-bg-card px-2.5 text-[10px] text-text-secondary font-bold uppercase tracking-wider whitespace-nowrap absolute">
                  hoặc tài khoản mật khẩu
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitLogin} className="space-y-3.5 pt-1">
              
              <div>
                <label className="block text-xs font-bold text-text-secondary mb-1">
                  Email hoặc Số điện thoại <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="VD: khachhang@canteengo.vn"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-text-secondary">
                    Mật khẩu <span className="text-rose-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSampleHint(!showSampleHint)}
                    className="text-[11px] text-[#E8B84B] hover:underline font-bold cursor-pointer"
                  >
                    Xem tài khoản mẫu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    className="w-full text-xs pl-9 pr-10 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-text-secondary hover:text-text-primary cursor-pointer"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Sample accounts quick-fill helper */}
              {showSampleHint && (
                <div className="p-3.5 bg-bg-card rounded-2xl border border-border-base text-xs space-y-2.5">
                  <div className="flex items-center justify-between pb-1 border-b border-border-base">
                    <span className="font-extrabold text-[#E8B84B] text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#E8B84B]" />
                      <span>Tài khoản mẫu có sẵn (Mật khẩu: password123)</span>
                    </span>
                    <span className="text-[10px] text-[#E8B84B] font-bold bg-[#E8B84B]/10 px-2 py-0.5 rounded-full border border-[#E8B84B]/20">
                      Thử ngay
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px]">
                    {/* Teacher */}
                    <div className="p-2 rounded-xl bg-bg-card border border-border-base hover:border-[#E8B84B]/50 transition-all flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-text-primary">👨‍🏫 Giáo viên HPN:</span>
                          <span className="font-mono text-[#E8B84B] font-bold text-[10px] bg-[#E8B84B]/10 px-1.5 py-0.5 rounded border border-[#E8B84B]/30">
                            gv.nguyen@hpn.edu.vn
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">ThS. Nguyễn Hoàng Nam • Khoa CNTT</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickFill('gv.nguyen@hpn.edu.vn', 'password123')}
                          className="px-2 py-1 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Điền
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin('teacher')}
                          className="px-2.5 py-1 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>Vào ngay</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Student */}
                    <div className="p-2 rounded-xl bg-bg-card border border-border-base hover:border-[#E8B84B]/50 transition-all flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-text-primary">👨‍🎓 Sinh viên HPN:</span>
                          <span className="font-mono text-[#E8B84B] font-bold text-[10px] bg-[#E8B84B]/10 px-1.5 py-0.5 rounded border border-[#E8B84B]/30">
                            sv.le@hpn.edu.vn
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Lê Minh Quân • SV-2024HPN09</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickFill('sv.le@hpn.edu.vn', 'password123')}
                          className="px-2 py-1 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Điền
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin('student')}
                          className="px-2.5 py-1 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>Vào ngay</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Guest */}
                    <div className="p-2 rounded-xl bg-bg-card border border-border-base hover:border-[#E8B84B]/50 transition-all flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-text-primary">👤 Khách vãng lai:</span>
                          <span className="font-mono text-[#E8B84B] font-bold text-[10px] bg-[#E8B84B]/10 px-1.5 py-0.5 rounded border border-[#E8B84B]/30">
                            khachhang@canteengo.vn
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Khách tự do đặt cơm Căn-tin</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickFill('khachhang@canteengo.vn', 'password123')}
                          className="px-2 py-1 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Điền
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin('customer')}
                          className="px-2.5 py-1 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>Vào ngay</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Staff */}
                    <div className="p-2 rounded-xl bg-bg-card border border-border-base hover:border-[#E8B84B]/50 transition-all flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-text-primary">👨‍🍳 Bếp Canteen:</span>
                          <span className="font-mono text-blue-400 font-bold text-[10px] bg-blue-950/40 px-1.5 py-0.5 rounded border border-blue-500/30">
                            bepvien@canteengo.vn
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Trần Thị Bích • Quản lý chế biến</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickFill('bepvien@canteengo.vn', 'password123')}
                          className="px-2 py-1 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Điền
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin('staff')}
                          className="px-2.5 py-1 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>Vào ngay</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Admin */}
                    <div className="p-2 rounded-xl bg-bg-card border border-border-base hover:border-[#E8B84B]/50 transition-all flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-black text-text-primary">👑 Quản lý (Admin):</span>
                          <span className="font-mono text-purple-400 font-bold text-[10px] bg-purple-950/40 px-1.5 py-0.5 rounded border border-purple-500/30">
                            quanly@canteengo.vn
                          </span>
                        </div>
                        <div className="text-[10px] text-text-secondary mt-0.5">Admin hệ thống & Doanh thu</div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleQuickFill('quanly@canteengo.vn', 'password123')}
                          className="px-2 py-1 rounded-lg bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Điền
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDirectLogin('admin')}
                          className="px-2.5 py-1 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-[10px] transition-all active:scale-95 cursor-pointer flex items-center gap-1"
                        >
                          <span>Vào ngay</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-xs shadow-md shadow-[#E8B84B]/20 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Đăng Nhập</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-text-secondary border-t border-border-base">
              Bạn chưa có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setMode('REGISTER'); setRegisterError(''); }}
                className="text-[#E8B84B] font-bold hover:underline cursor-pointer"
              >
                Đăng ký ngay tại đây
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MANUAL REGISTER FORM */}
        {!pendingGoogleSchoolUser && mode === 'REGISTER' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            <div>
              <h2 className="text-lg font-black font-serif text-text-primary">Tạo tài khoản mới</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Nhập thông tin cá nhân của bạn để tạo tài khoản đặt cơm trên hệ thống
              </p>
            </div>

            {registerError && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
                <span>{registerError}</span>
              </div>
            )}

            {/* Google One-Click Register Button */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl border border-border-base hover:border-[#E8B84B]/50 bg-bg-input hover:bg-bg-hover text-text-primary font-bold text-xs shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {isGoogleLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#E8B84B]" />
                ) : (
                  <Chrome className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
                )}
                <span>{isGoogleLoading ? 'Đang kết nối Google...' : 'Đăng ký nhanh bằng Google'}</span>
              </button>

              <div className="relative flex items-center justify-center pt-1">
                <div className="border-t border-border-base w-full" />
                <span className="bg-bg-card px-2.5 text-[10px] text-text-secondary font-bold uppercase tracking-wider whitespace-nowrap absolute">
                  hoặc điền thông tin bên dưới
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmitRegister} className="space-y-3 text-xs pt-1">
              
              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Họ và tên <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="VD: Lê Quỳnh Trang"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-bold text-text-secondary">
                      Email <span className="text-rose-400">*</span>
                    </label>
                    {isHpnSchoolEmail(regEmail) ? (
                      <span className="text-[10px] font-bold text-[#E8B84B] bg-[#E8B84B]/10 px-1.5 py-0.5 rounded border border-[#E8B84B]/30 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        <span>Email trường HPN</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-text-secondary">
                        (@hpn.edu.vn cho GV/SV)
                      </span>
                    )}
                  </div>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="VD: nguyenvanan@hpn.edu.vn"
                    className={`w-full px-3 py-2.5 rounded-xl border focus:outline-none transition-all text-text-primary bg-bg-input ${
                      isHpnSchoolEmail(regEmail)
                        ? 'border-[#E8B84B] bg-[#E8B84B]/10 focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30'
                        : 'border-border-base focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30'
                    }`}
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 text-[10px]">
                    <span className="text-text-secondary">Gợi ý nhanh:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const base = regEmail.includes('@') ? regEmail.split('@')[0] : regEmail;
                        setRegEmail(`${base || 'sinhvien'}@hpn.edu.vn`);
                      }}
                      className="px-2 py-0.5 rounded-md bg-[#E8B84B]/10 hover:bg-[#E8B84B]/20 text-[#E8B84B] font-bold border border-[#E8B84B]/30 transition-colors cursor-pointer"
                    >
                      + @hpn.edu.vn
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const base = regEmail.includes('@') ? regEmail.split('@')[0] : regEmail;
                        setRegEmail(`${base || 'khach'}@gmail.com`);
                      }}
                      className="px-2 py-0.5 rounded-md bg-bg-elevated hover:bg-bg-hover text-text-secondary hover:text-text-primary font-medium transition-colors cursor-pointer"
                    >
                      + @gmail.com
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Số điện thoại <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="0912xxxxxx"
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-text-secondary mb-1">
                  Khu vực / Tòa nhà / Vị trí bàn nhận món
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-text-secondary absolute left-3 top-3" />
                  <input
                    type="text"
                    value={regArea}
                    onChange={(e) => setRegArea(e.target.value)}
                    placeholder="VD: Tòa B - Phòng 302 / Bàn A12"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                </div>
              </div>

              {/* Dynamic Domain-based Role Assignment */}
              {isHpnSchoolEmail(regEmail) ? (
                <div className="p-3.5 bg-bg-card rounded-2xl border border-[#E8B84B]/40 space-y-3 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[#E8B84B] font-black text-xs">
                      <GraduationCap className="w-4 h-4 text-[#E8B84B]" />
                      <span>Xác thực thành công email trường HPN</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] font-extrabold text-[10px] border border-[#E8B84B]/30">
                      HPN Member
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-text-secondary mb-1.5">
                      Chọn vai trò của bạn tại trường: <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegSchoolRole('TEACHER')}
                        className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                          regSchoolRole === 'TEACHER'
                            ? 'border-[#E8B84B] bg-[#E8B84B]/15 font-bold text-[#E8B84B]'
                            : 'border-border-base bg-bg-input text-text-secondary hover:border-[#E8B84B]/30'
                        }`}
                      >
                        <span className="text-xl">👨‍🏫</span>
                        <div className="min-w-0">
                          <div className="text-xs leading-tight">Giáo viên</div>
                          <div className="text-[9px] opacity-80">Giảng viên / Cán bộ</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setRegSchoolRole('STUDENT')}
                        className={`p-2.5 rounded-xl border-2 text-left flex items-center gap-2 transition-all cursor-pointer ${
                          regSchoolRole === 'STUDENT'
                            ? 'border-[#E8B84B] bg-[#E8B84B]/15 font-bold text-[#E8B84B]'
                            : 'border-border-base bg-bg-input text-text-secondary hover:border-[#E8B84B]/30'
                        }`}
                      >
                        <span className="text-xl">👨‍🎓</span>
                        <div className="min-w-0">
                          <div className="text-xs leading-tight">Sinh viên</div>
                          <div className="text-[9px] opacity-80">Học viên / Sinh viên</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-border-base">
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary mb-0.5">
                        {regSchoolRole === 'TEACHER' ? 'Mã Giảng viên (tùy chọn)' : 'Mã Sinh viên (tùy chọn)'}
                      </label>
                      <input
                        type="text"
                        value={regStudentId}
                        onChange={(e) => setRegStudentId(e.target.value)}
                        placeholder={regSchoolRole === 'TEACHER' ? 'VD: GV-CNTT' : 'VD: SV-2024'}
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-text-secondary mb-0.5">
                        Khoa / Đơn vị (tùy chọn)
                      </label>
                      <input
                        type="text"
                        value={regFaculty}
                        onChange={(e) => setRegFaculty(e.target.value)}
                        placeholder="VD: Khoa CNTT"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B]"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-bg-card rounded-2xl border border-border-base space-y-1 animate-in fade-in">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#E8B84B] flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-[#E8B84B]" />
                      <span>Vai trò tài khoản: Khách vãng lai</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#E8B84B]/10 text-[#E8B84B] font-extrabold text-[10px] border border-[#E8B84B]/20">
                      GUEST
                    </span>
                  </div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    * Email không có đuôi xác thực <strong className="font-mono text-text-primary">@hpn.edu.vn</strong> nên tài khoản sẽ được đăng ký dưới vai trò <strong className="text-text-primary">Khách vãng lai</strong>.
                  </p>
                  <p className="text-[10px] text-slate-500">
                    💡 Để chọn vai trò <strong>Giáo viên</strong> hoặc <strong>Sinh viên</strong>, vui lòng nhập email trường có đuôi <strong>@hpn.edu.vn</strong>.
                  </p>
                </div>
              )}

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Mật khẩu <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Ít nhất 6 ký tự"
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                </div>

                <div>
                  <label className="block font-bold text-text-secondary mb-1">
                    Xác nhận mật khẩu <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type={showRegPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu"
                    className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border-base text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-1 focus:ring-[#E8B84B]/30 transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-text-secondary">
                <input
                  type="checkbox"
                  id="showPass"
                  checked={showRegPassword}
                  onChange={(e) => setShowRegPassword(e.target.checked)}
                  className="rounded border-border-base bg-bg-input text-[#E8B84B] focus:ring-[#E8B84B]/20"
                />
                <label htmlFor="showPass" className="cursor-pointer">Hiển thị mật khẩu</label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-black text-xs shadow-md shadow-[#E8B84B]/20 transition-all flex items-center justify-center gap-1.5 mt-2 cursor-pointer active:scale-[0.99]"
              >
                <span>Tạo Tài Khoản & Đăng Nhập Ngay</span>
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-text-secondary border-t border-border-base">
              Đã có tài khoản?{' '}
              <button
                type="button"
                onClick={() => { setMode('LOGIN'); setLoginError(''); }}
                className="text-[#E8B84B] font-bold hover:underline cursor-pointer"
              >
                Đăng nhập tại đây
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: PROFILE & LOGOUT */}
        {mode === 'PROFILE' && currentUser && (
          <div className="p-5 sm:p-6 space-y-4">
            
            <div className="flex items-center justify-between p-4 rounded-2xl bg-bg-card border border-border-base">
              <div className="flex items-center gap-3.5">
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={currentUser.fullName}
                    className="w-12 h-12 rounded-2xl object-cover shadow-md border-2 border-[#E8B84B] flex-shrink-0"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#E8B84B] text-black font-black text-lg flex items-center justify-center shadow-md flex-shrink-0">
                    {currentUser.fullName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-sm text-text-primary leading-snug">
                    {currentUser.fullName}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentUser.role === 'ADMIN'
                        ? 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                        : currentUser.role === 'STAFF'
                        ? 'bg-blue-950/60 text-blue-300 border border-blue-500/30'
                        : currentUser.role === 'TEACHER'
                        ? 'bg-[#E8B84B]/15 text-[#E8B84B] border border-[#E8B84B]/30'
                        : currentUser.role === 'STUDENT'
                        ? 'bg-[#E8B84B]/15 text-[#E8B84B] border border-[#E8B84B]/30'
                        : currentUser.role === 'GUEST'
                        ? 'bg-bg-elevated text-text-secondary border border-border-base'
                        : 'bg-[#E8B84B]/10 text-[#E8B84B]'
                    }`}>
                      {currentUser.role === 'ADMIN'
                        ? 'QUẢN TRỊ VIÊN'
                        : currentUser.role === 'STAFF'
                        ? 'NHÂN VIÊN BẾP'
                        : currentUser.role === 'TEACHER'
                        ? '👨‍🏫 GIÁO VIÊN HPN'
                        : currentUser.role === 'STUDENT'
                        ? '👨‍🎓 SINH VIÊN HPN'
                        : currentUser.role === 'GUEST'
                        ? '👤 KHÁCH VÃNG LAI'
                        : 'KHÁCH HÀNG'}
                    </span>
                    {currentUser.firebaseUid && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-bg-elevated text-[#E8B84B] flex items-center gap-1 border border-[#E8B84B]/30">
                        <Chrome className="w-3 h-3 text-red-400" />
                        <span>Google</span>
                      </span>
                    )}
                    {currentUser.studentId && (
                      <span className="text-[10px] font-mono text-text-secondary bg-bg-card px-1.5 py-0.5 rounded border border-border-base">
                        {currentUser.studentId}
                      </span>
                    )}
                    <span className="text-[11px] text-text-secondary">ID: #{currentUser.id}</span>
                  </div>
                </div>
              </div>

              {!isEditingProfile && (
                <button
                  type="button"
                  onClick={() => {
                    setEditFullName(currentUser.fullName);
                    setEditPhone(currentUser.phone);
                    setEditArea(currentUser.area);
                    setEditPassword('');
                    setEditSchoolRole(currentUser.role === 'TEACHER' || currentUser.schoolRole === 'TEACHER' ? 'TEACHER' : 'STUDENT');
                    setEditStudentId(currentUser.studentId || '');
                    setEditFaculty(currentUser.faculty || '');
                    setIsEditingProfile(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] active:scale-95 text-black font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer flex-shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5 text-black" />
                  <span>Sửa thông tin</span>
                </button>
              )}
            </div>

            {profileSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{profileSuccessMsg}</span>
              </div>
            )}

            {/* Customer & School Role Wallet Card */}
            {['CUSTOMER', 'TEACHER', 'STUDENT', 'GUEST'].includes(currentUser.role) && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-bg-card to-bg-primary border border-[#E8B84B]/40 text-text-primary shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B]">
                    <Wallet className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-text-secondary font-medium">Số dư Ví C-Pay</div>
                    <div className="text-xl font-black text-[#E8B84B]">
                      {(currentUser.walletBalance || 0).toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                </div>

                {onOpenWallet && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenWallet();
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-black" />
                    <span>Nạp tiền ví</span>
                  </button>
                )}
              </div>
            )}

            {/* Customer Wallet Transaction History Table */}
            {['CUSTOMER', 'TEACHER', 'STUDENT', 'GUEST'].includes(currentUser.role) && !isEditingProfile && (
              <div className="bg-bg-card rounded-2xl border border-border-base overflow-hidden text-xs shadow-2xs">
                <div className="p-3 bg-bg-primary border-b border-border-base flex items-center justify-between">
                  <div className="font-bold text-text-primary flex items-center gap-1.5">
                    <History className="w-4 h-4 text-[#E8B84B]" />
                    <span>Lịch sử nạp tiền & biến động số dư</span>
                  </div>
                  <span className="text-[10px] text-text-secondary font-semibold bg-bg-input px-2 py-0.5 rounded-md border border-border-base">Gần đây</span>
                </div>

                {(!currentUser.walletTransactions || currentUser.walletTransactions.length === 0) ? (
                  <div className="p-4 text-center text-text-secondary text-[11px]">
                    Chưa có lịch sử giao dịch ví. Hãy nạp tiền để sử dụng thanh toán 1 chạm!
                  </div>
                ) : (
                  <div className="divide-y divide-border-base max-h-48 overflow-y-auto">
                    {currentUser.walletTransactions.map((tx) => (
                      <div key={tx.id} className="p-2.5 flex items-center justify-between hover:bg-bg-input transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                            tx.type === 'DEPOSIT' 
                              ? 'bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/30' 
                              : 'bg-orange-950/40 text-orange-400 border border-orange-500/30'
                          }`}>
                            {tx.type === 'DEPOSIT' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-bold text-text-primary text-[11px]">{tx.description}</div>
                            <div className="text-[10px] text-text-secondary">{tx.createdAt} • mã: {tx.id}</div>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <div className={`font-black text-xs ${
                            tx.type === 'DEPOSIT' ? 'text-[#E8B84B]' : 'text-text-primary'
                          }`}>
                            {tx.type === 'DEPOSIT' ? '+' : '-'}{tx.amount.toLocaleString('vi-VN')}₫
                          </div>
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#E8B84B]/10 text-[#E8B84B]">
                            Thành công
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {!isEditingProfile ? (
              <div className="bg-bg-card rounded-2xl p-3.5 border border-border-base text-xs space-y-2.5">
                <div className="flex items-center justify-between py-1 border-b border-border-base">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Email đăng nhập:</span>
                  </span>
                  <span className="font-mono font-bold text-text-primary">{currentUser.email}</span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-border-base">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Số điện thoại:</span>
                  </span>
                  <span className="font-mono font-bold text-text-primary">{currentUser.phone}</span>
                </div>

                {currentUser.studentId && (
                  <div className="flex items-center justify-between py-1 border-b border-border-base">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Mã số SV / Giảng viên:</span>
                    </span>
                    <span className="font-mono font-bold text-text-primary">{currentUser.studentId}</span>
                  </div>
                )}

                {currentUser.faculty && (
                  <div className="flex items-center justify-between py-1 border-b border-border-base">
                    <span className="text-text-secondary flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-text-secondary" />
                      <span>Khoa / Đơn vị / Lớp:</span>
                    </span>
                    <span className="font-semibold text-text-primary">{currentUser.faculty}</span>
                  </div>
                )}

                <div className="flex items-center justify-between py-1 border-b border-border-base">
                  <span className="text-text-secondary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-text-secondary" />
                    <span>Khu vực / Bàn:</span>
                  </span>
                  <span className="font-semibold text-text-primary">{currentUser.area}</span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-text-secondary">Ngày tham gia:</span>
                  <span className="text-text-secondary">{currentUser.createdAt}</span>
                </div>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!editFullName.trim()) {
                    return;
                  }
                  const isStaffOrAdmin = currentUser.role === 'STAFF' || currentUser.role === 'ADMIN';
                  const nextRole = isStaffOrAdmin
                    ? currentUser.role
                    : (editSchoolRole === 'TEACHER' ? 'TEACHER' : editSchoolRole === 'STUDENT' ? 'STUDENT' : 'GUEST');
                  const nextSchoolRole = isStaffOrAdmin
                    ? undefined
                    : editSchoolRole;

                  const updated: User = {
                    ...currentUser,
                    fullName: editFullName.trim(),
                    phone: editPhone.trim() || currentUser.phone,
                    area: editArea.trim() || currentUser.area,
                    password: editPassword.trim() ? editPassword.trim() : currentUser.password,
                    role: nextRole,
                    schoolRole: nextSchoolRole,
                    studentId: editStudentId.trim() || currentUser.studentId,
                    faculty: editFaculty.trim() || currentUser.faculty,
                  };
                  if (onUpdateProfile) {
                    onUpdateProfile(updated);
                  }
                  setIsEditingProfile(false);
                  setProfileSuccessMsg('Đã cập nhật thông tin tài khoản thành công!');
                  setTimeout(() => setProfileSuccessMsg(''), 3000);
                }}
                className="bg-bg-card rounded-2xl p-4 border border-border-base text-xs space-y-3"
              >
                <div className="font-bold text-text-primary border-b border-border-base pb-1.5">
                  Chỉnh sửa thông tin tài khoản cá nhân
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Họ và tên:
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B] text-xs"
                  />
                </div>

                {/* Role selection in profile (Teacher, Student, or Guest) */}
                {currentUser.role === 'STAFF' || currentUser.role === 'ADMIN' ? (
                  <div className="p-2.5 bg-purple-950/40 rounded-xl border border-purple-500/30 text-[11px] text-purple-300 font-semibold">
                    Vai trò hệ thống: {currentUser.role === 'ADMIN' ? '👑 Quản trị viên (Admin)' : '👨‍🍳 Nhân viên Căn-tin (Staff)'}
                  </div>
                ) : (
                  <div className="p-3 bg-bg-card rounded-xl border border-border-base space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-text-secondary">
                        Vai trò tài khoản:
                      </label>
                      {isHpnSchoolEmail(currentUser.email) ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8B84B]/10 text-[#E8B84B] border border-[#E8B84B]/30">
                          ✓ Đã xác thực @hpn.edu.vn
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-bg-elevated text-text-secondary">
                          Email ngoài trường
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setEditSchoolRole('TEACHER')}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          editSchoolRole === 'TEACHER'
                            ? 'bg-[#E8B84B] text-black border-[#E8B84B]'
                            : 'bg-bg-input text-text-secondary border-border-base hover:border-[#E8B84B]/30'
                        }`}
                      >
                        👨‍🏫 Giáo viên
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSchoolRole('STUDENT')}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          editSchoolRole === 'STUDENT'
                            ? 'bg-[#E8B84B] text-black border-[#E8B84B]'
                            : 'bg-bg-input text-text-secondary border-border-base hover:border-[#E8B84B]/30'
                        }`}
                      >
                        👨‍🎓 Sinh viên
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSchoolRole('GUEST')}
                        className={`p-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          editSchoolRole === 'GUEST'
                            ? 'bg-[#E8B84B] text-black border-[#E8B84B]'
                            : 'bg-bg-input text-text-secondary border-border-base hover:border-[#E8B84B]/30'
                        }`}
                      >
                        👤 Khách
                      </button>
                    </div>

                    {(editSchoolRole === 'TEACHER' || editSchoolRole === 'STUDENT') && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <div>
                          <label className="block text-[10px] font-semibold text-text-secondary mb-0.5">
                            {editSchoolRole === 'TEACHER' ? 'Mã Giảng viên:' : 'Mã Sinh viên:'}
                          </label>
                          <input
                            type="text"
                            value={editStudentId}
                            onChange={(e) => setEditStudentId(e.target.value)}
                            placeholder="VD: SV-2024"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border-base bg-bg-input text-text-primary text-xs focus:border-[#E8B84B]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-text-secondary mb-0.5">
                            Khoa / Đơn vị:
                          </label>
                          <input
                            type="text"
                            value={editFaculty}
                            onChange={(e) => setEditFaculty(e.target.value)}
                            placeholder="VD: Khoa CNTT"
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border-base bg-bg-input text-text-primary text-xs focus:border-[#E8B84B]"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">
                      Số điện thoại:
                    </label>
                    <input
                      type="text"
                      required
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B] text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-text-secondary mb-1">
                      Khu vực / Bàn:
                    </label>
                    <input
                      type="text"
                      value={editArea}
                      onChange={(e) => setEditArea(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B] text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Đổi mật khẩu mới (để trống nếu giữ nguyên):
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới nếu muốn đổi..."
                    className="w-full px-3 py-2 rounded-xl border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B] text-xs"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border-base">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-3 py-1.5 rounded-xl border border-border-base text-text-secondary hover:text-text-primary hover:bg-bg-elevated font-bold cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thay đổi</span>
                  </button>
                </div>
              </form>
            )}

            <div className="pt-2 flex items-center justify-between gap-3">
              <button
                onClick={async () => {
                  try {
                    await signOut(auth);
                  } catch (e) {
                    console.warn('Firebase signOut info:', e);
                  }
                  onLogout();
                  onClose();
                }}
                className="py-2.5 px-4 rounded-xl border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Đăng xuất tài khoản</span>
              </button>

              <button
                onClick={onClose}
                className="py-2.5 px-5 rounded-xl bg-bg-elevated hover:bg-bg-hover text-text-primary font-bold text-xs transition-all cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
