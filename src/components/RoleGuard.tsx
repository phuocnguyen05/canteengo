import React from 'react';
import { 
  ShieldAlert, 
  Lock, 
  ArrowLeft, 
  UserCheck, 
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { User, UserRole } from '../types';

interface RoleGuardProps {
  requiredRole: 'STAFF' | 'ADMIN';
  currentUser: User | null;
  onSwitchRole: (role: UserRole) => void;
  onGoHome: () => void;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  requiredRole,
  currentUser,
  onSwitchRole,
  onGoHome,
  children,
}) => {
  const userRole = currentUser?.role || 'GUEST';

  // STAFF section allows: STAFF or ADMIN
  const canAccessStaff = requiredRole === 'STAFF' && (userRole === 'STAFF' || userRole === 'ADMIN');
  
  // ADMIN section allows: ADMIN only
  const canAccessAdmin = requiredRole === 'ADMIN' && userRole === 'ADMIN';

  const hasAccess = canAccessStaff || canAccessAdmin;

  if (hasAccess) {
    return <>{children}</>;
  }

  // Access Denied Screen (Simulating RoleFilter.java 403 Forbidden)
  return (
    <div className="min-h-[65vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-rose-200 shadow-xl max-w-lg w-full p-6 sm:p-8 text-center space-y-5">
        
        <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto shadow-md shadow-rose-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
            <Lock className="w-3 h-3" />
            <span>RoleFilter Security: 403 FORBIDDEN</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Quyền Truy Cập Bị Từ Chối
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            {requiredRole === 'ADMIN' ? (
              <>
                Khu vực <strong>Cổng Admin (Báo cáo doanh thu & Quản trị hệ thống)</strong> yêu cầu quyền <span className="font-bold text-purple-700">Quản trị viên (ADMIN)</span>. Khách hàng và Nhân viên bếp không được phép truy cập dữ liệu này.
              </>
            ) : (
              <>
                Khu vực <strong>Điều phối Bếp & Quản lý đơn hàng</strong> chỉ dành riêng cho <span className="font-bold text-blue-700">Nhân viên Canteen (STAFF)</span> hoặc Quản trị viên. Khách hàng chỉ có thể xem mục <em>Đơn hàng của tôi</em>.
              </>
            )}
          </p>
        </div>

        {/* Current status card */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 text-left space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Tài khoản hiện tại:</span>
            <span className="font-bold text-slate-900">{currentUser?.fullName || 'Khách vãng lai'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vai trò hiện tại:</span>
            <span className="font-bold text-rose-600 uppercase tracking-wide">
              {currentUser?.role || 'GUEST (Chưa đăng nhập)'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Vai trò bắt buộc:</span>
            <span className="font-bold text-slate-800 uppercase tracking-wide">
              {requiredRole}
            </span>
          </div>
        </div>

        {/* Actions to solve access */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => onSwitchRole(requiredRole)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>Đăng nhập tài khoản {requiredRole === 'ADMIN' ? 'Quản trị viên (Admin)' : 'Nhân viên Bếp (Staff)'}</span>
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Quay lại trang Thực đơn (Dành cho khách hàng)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
