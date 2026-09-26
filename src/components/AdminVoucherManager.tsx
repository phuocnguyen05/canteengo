import React, { useState, useEffect } from 'react';
import {
  Tag,
  Plus,
  Clock,
  Calendar,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  Search,
  SlidersHorizontal,
  Info,
  Check,
  Zap,
  Coffee,
  Sun,
  Moon,
  AlertTriangle
} from 'lucide-react';
import { Voucher } from '../types';
import { validateVoucher, getVoucherStatusBadge } from '../utils/voucherHelper';

interface AdminVoucherManagerProps {
  vouchers: Voucher[];
  onAddVoucher: (voucher: Omit<Voucher, 'id'>) => void;
  onUpdateVoucher: (voucher: Voucher) => void;
  onDeleteVoucher: (voucherId: number) => void;
}

export const AdminVoucherManager: React.FC<AdminVoucherManagerProps> = ({
  vouchers,
  onAddVoucher,
  onUpdateVoucher,
  onDeleteVoucher,
}) => {
  // Current time state updating every 10 seconds for real-time validation checks
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const currentTimeStr = `${String(currentTime.getHours()).padStart(2, '0')}:${String(
    currentTime.getMinutes()
  ).padStart(2, '0')}`;

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'TIME_RESTRICTED' | 'EXPIRED'>('ALL');

  // Modal create/edit state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Form fields
  const [formCode, setFormCode] = useState('');
  const [formDiscountPct, setFormDiscountPct] = useState<number>(15);
  const [formMinOrder, setFormMinOrder] = useState<number>(50000);
  const [formDescription, setFormDescription] = useState('');
  const [formExpiredAt, setFormExpiredAt] = useState('2026-12-31');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formTimeRestricted, setFormTimeRestricted] = useState(false);
  const [formValidFromTime, setFormValidFromTime] = useState('10:30');
  const [formValidToTime, setFormValidToTime] = useState('13:30');
  const [formError, setFormError] = useState<string | null>(null);

  // Copied toast state
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Quick Test Sandbox State
  const [testVoucherCode, setTestVoucherCode] = useState<string>('COMBOYEU');
  const [testOrderAmount, setTestOrderAmount] = useState<number>(65000);
  const [testCustomTime, setTestCustomTime] = useState<string>(currentTimeStr);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testResultType, setTestResultType] = useState<'SUCCESS' | 'ERROR' | null>(null);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingVoucher(null);
    setFormCode('');
    setFormDiscountPct(15);
    setFormMinOrder(50000);
    setFormDescription('');
    setFormExpiredAt('2026-12-31');
    setFormIsActive(true);
    setFormTimeRestricted(false);
    setFormValidFromTime('10:30');
    setFormValidToTime('13:30');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (v: Voucher) => {
    setEditingVoucher(v);
    setFormCode(v.code);
    setFormDiscountPct(v.discountPct);
    setFormMinOrder(v.minOrder);
    setFormDescription(v.description || '');
    setFormExpiredAt(v.expiredAt ? v.expiredAt.slice(0, 10) : '2026-12-31');
    setFormIsActive(v.isActive);
    setFormTimeRestricted(Boolean(v.timeRestricted));
    setFormValidFromTime(v.validFromTime || '10:30');
    setFormValidToTime(v.validToTime || '13:30');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Save Voucher
  const handleSaveVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanCode = formCode.trim().toUpperCase();
    if (!cleanCode) {
      setFormError('Vui lòng nhập mã Voucher (Code).');
      return;
    }

    // Check duplicate code if creating or changing code
    const isDuplicate = vouchers.some(
      (v) => v.code.toUpperCase() === cleanCode && (!editingVoucher || v.id !== editingVoucher.id)
    );
    if (isDuplicate) {
      setFormError(`Mã voucher "${cleanCode}" đã tồn tại trên hệ thống.`);
      return;
    }

    if (formDiscountPct <= 0 || formDiscountPct > 100) {
      setFormError('Phần trăm giảm giá phải từ 1% đến 100%.');
      return;
    }

    if (formTimeRestricted) {
      if (!formValidFromTime || !formValidToTime) {
        setFormError('Vui lòng nhập đầy đủ giờ bắt đầu và kết thúc.');
        return;
      }
      if (formValidFromTime >= formValidToTime) {
        setFormError('Giờ bắt đầu phải nhỏ hơn giờ kết thúc (ví dụ: 10:30 đến 13:30).');
        return;
      }
    }

    const payload: Omit<Voucher, 'id'> = {
      code: cleanCode,
      discountPct: formDiscountPct,
      minOrder: Number(formMinOrder) || 0,
      description: formDescription.trim() || `Giảm ${formDiscountPct}% cho đơn từ ${formMinOrder.toLocaleString()}đ`,
      expiredAt: formExpiredAt,
      isActive: formIsActive,
      timeRestricted: formTimeRestricted,
      validFromTime: formTimeRestricted ? formValidFromTime : undefined,
      validToTime: formTimeRestricted ? formValidToTime : undefined,
    };

    if (editingVoucher) {
      onUpdateVoucher({
        ...editingVoucher,
        ...payload,
      });
    } else {
      onAddVoucher(payload);
    }

    setIsModalOpen(false);
  };

  // Quick Preset Handlers
  const handleApplyPreset = (from: string, to: string, desc: string) => {
    setFormTimeRestricted(true);
    setFormValidFromTime(from);
    setFormValidToTime(to);
    if (!formDescription) {
      setFormDescription(desc);
    }
  };

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Run validation test simulator
  const handleRunSimulator = () => {
    const targetVoucher = vouchers.find(
      (v) => v.code.toUpperCase() === testVoucherCode.trim().toUpperCase()
    );
    if (!targetVoucher) {
      setTestResult('Không tìm thấy mã voucher này trong hệ thống.');
      setTestResultType('ERROR');
      return;
    }

    // Build mock date using testCustomTime
    const [h, m] = testCustomTime.split(':').map((num) => parseInt(num, 10));
    const mockDate = new Date();
    mockDate.setHours(isNaN(h) ? 12 : h, isNaN(m) ? 0 : m, 0, 0);

    const check = validateVoucher(targetVoucher, testOrderAmount, mockDate);
    if (check.isValid) {
      const discount = check.discountAmount || 0;
      setTestResult(
        `✓ ÁP DỤNG THÀNH CÔNG: Giảm ${discount.toLocaleString('vi-VN')}₫ (-${targetVoucher.discountPct}%). Tổng tiền còn lại: ${(testOrderAmount - discount).toLocaleString('vi-VN')}₫.`
      );
      setTestResultType('SUCCESS');
    } else {
      setTestResult(check.error || 'Voucher không khả dụng.');
      setTestResultType('ERROR');
    }
  };

  // Filtered vouchers list
  const filteredVouchers = vouchers.filter((v) => {
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchCode = v.code.toLowerCase().includes(q);
      const matchDesc = v.description?.toLowerCase().includes(q);
      if (!matchCode && !matchDesc) return false;
    }

    // Status filter
    if (statusFilter === 'ACTIVE') {
      if (!v.isActive) return false;
    } else if (statusFilter === 'TIME_RESTRICTED') {
      if (!v.timeRestricted) return false;
    } else if (statusFilter === 'EXPIRED') {
      const todayStr = currentTime.toISOString().slice(0, 10);
      const isExpired = v.expiredAt && v.expiredAt.slice(0, 10) < todayStr;
      if (v.isActive && !isExpired) return false;
    }

    return true;
  });

  // Metrics count
  const totalCount = vouchers.length;
  const activeCount = vouchers.filter((v) => v.isActive).length;
  const timeRestrictedCount = vouchers.filter((v) => v.timeRestricted && v.isActive).length;
  const expiredCount = vouchers.filter((v) => {
    const todayStr = currentTime.toISOString().slice(0, 10);
    return !v.isActive || (v.expiredAt && v.expiredAt.slice(0, 10) < todayStr);
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Stats */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Tag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-900">Quản Lý Mã Khuyến Mãi & Khung Giờ (Voucher)</h2>
                <p className="text-xs text-slate-500">
                  Cấu hình voucher giảm giá cả ngày hoặc giới hạn khung giờ vàng (Sáng, Trưa, Xế chiều).
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Realtime clock display */}
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200/60 text-purple-900 text-xs font-bold flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600 animate-spin-slow" />
              <span>Giờ hệ thống: <strong className="font-mono text-sm text-purple-700">{currentTimeStr}</strong></span>
            </div>

            <button
              type="button"
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Voucher Mới</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500">Tổng số Voucher</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-slate-900">{totalCount}</span>
              <Tag className="w-4 h-4 text-purple-500" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('ACTIVE')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'ACTIVE'
                ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500">Đang kích hoạt</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-emerald-600">{activeCount}</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('TIME_RESTRICTED')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'TIME_RESTRICTED'
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500">Giới hạn theo giờ</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-amber-600">{timeRestrictedCount}</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
          </div>

          <div
            onClick={() => setStatusFilter('EXPIRED')}
            className={`p-3 rounded-xl border transition-all cursor-pointer ${
              statusFilter === 'EXPIRED'
                ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400/20'
                : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span className="text-[11px] font-semibold text-slate-500">Hết hạn / Tắt</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-xl font-black text-rose-600">{expiredCount}</span>
              <XCircle className="w-4 h-4 text-rose-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Testing Sandbox (Kiểm tra cảnh báo không khả dụng) */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-black uppercase tracking-wider text-amber-300">
            Công Cụ Thử Nghiệm Kiểm Tra Voucher (Test Giờ & Hạn Dùng)
          </h3>
        </div>
        <p className="text-xs text-slate-300 mb-4 leading-relaxed">
          Giả lập tình huống khách hàng áp dụng voucher vào một khung giờ hoặc giá trị đơn hàng bất kỳ để kiểm tra thông báo{' '}
          <span className="text-amber-300 font-bold">"Voucher không khả dụng"</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Select Voucher */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Chọn mã voucher:</label>
            <select
              value={testVoucherCode}
              onChange={(e) => setTestVoucherCode(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-400"
            >
              {vouchers.map((v) => (
                <option key={v.id} value={v.code}>
                  {v.code} (-{v.discountPct}% {v.timeRestricted ? `[${v.validFromTime}-${v.validToTime}]` : '[Cả ngày]'})
                </option>
              ))}
            </select>
          </div>

          {/* Input Order Amount */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Giá trị đơn thử nghiệm (₫):</label>
            <input
              type="number"
              step={5000}
              value={testOrderAmount}
              onChange={(e) => setTestOrderAmount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-400"
            />
          </div>

          {/* Input Mock Time */}
          <div>
            <label className="text-[11px] font-semibold text-slate-300 block mb-1">Giờ thử nghiệm (HH:mm):</label>
            <div className="flex gap-1.5">
              <input
                type="time"
                value={testCustomTime}
                onChange={(e) => setTestCustomTime(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:border-purple-400"
              />
              <button
                type="button"
                onClick={() => setTestCustomTime(currentTimeStr)}
                title="Lấy giờ hiện tại"
                className="px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-[11px] font-bold shrink-0"
              >
                Giờ này
              </button>
            </div>
          </div>

          {/* Test Button */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRunSimulator}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Chạy Thử Nghiệm</span>
            </button>
          </div>
        </div>

        {/* Test Result Display Box */}
        {testResult && (
          <div
            className={`mt-4 p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-2.5 transition-all ${
              testResultType === 'SUCCESS'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}
          >
            {testResultType === 'SUCCESS' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="font-extrabold uppercase tracking-wide text-[10px] mb-0.5 opacity-80">
                {testResultType === 'SUCCESS' ? 'Kết Quả: Hợp lệ' : 'Kết Quả Cảnh Báo Cho Khách Hàng:'}
              </div>
              <div className="font-medium text-xs">{testResult}</div>
            </div>
          </div>
        )}
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Filter Status Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl overflow-x-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ACTIVE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'ACTIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <span>Đang bật</span>
              <span className="text-[10px] bg-emerald-200/50 text-emerald-950 px-1.5 py-0.2 rounded-full font-black">
                {activeCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('TIME_RESTRICTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'TIME_RESTRICTED' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <span>Khung giờ vàng</span>
              <span className="text-[10px] bg-amber-200/50 text-amber-950 px-1.5 py-0.2 rounded-full font-black">
                {timeRestrictedCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('EXPIRED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                statusFilter === 'EXPIRED' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              <span>Hết hạn / Tắt</span>
              <span className="text-[10px] bg-rose-200/50 text-rose-950 px-1.5 py-0.2 rounded-full font-black">
                {expiredCount}
              </span>
            </button>
          </div>

          {/* Search box */}
          <div className="relative min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm theo mã code, mô tả..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>
      </div>

      {/* Vouchers List */}
      {filteredVouchers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center space-y-3">
          <Tag className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="text-sm font-extrabold text-slate-800">Không tìm thấy voucher nào</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Không có mã giảm giá nào phù hợp với bộ lọc hiện tại. Hãy thử tìm kiếm từ khóa khác hoặc tạo voucher mới.
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
          >
            Tạo Voucher Mới
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVouchers.map((v) => {
            const badge = getVoucherStatusBadge(v, currentTime);

            return (
              <div
                key={v.id}
                className={`bg-white rounded-2xl border p-4 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  !v.isActive
                    ? 'border-slate-200 bg-slate-50/60 opacity-80'
                    : v.timeRestricted
                    ? 'border-amber-200 hover:border-amber-400'
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Code + Discount percentage + Status badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-base text-slate-900 tracking-wider bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-lg">
                          {v.code}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(v.code)}
                          title="Sao chép mã"
                          className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                        >
                          {copiedCode === v.code ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <span className="text-[11px] font-bold text-slate-400 mt-0.5 block">ID #{v.id}</span>
                    </div>

                    <div className="text-right">
                      <span className="inline-block px-2.5 py-1 rounded-xl bg-purple-600 text-white font-black text-sm shadow-xs">
                        -{v.discountPct}%
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${badge.bgClass}`}
                    >
                      {v.timeRestricted ? <Clock className="w-3.5 h-3.5 shrink-0" /> : <Tag className="w-3.5 h-3.5 shrink-0" />}
                      <span>{badge.label}</span>
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 font-medium leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {v.description || 'Ưu đãi khuyến mãi CanteenGo'}
                  </p>

                  {/* Rules & Constraints info */}
                  <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Đơn tối thiểu:</span>
                      <strong className="text-slate-800 font-bold">
                        {v.minOrder > 0 ? `${v.minOrder.toLocaleString('vi-VN')}₫` : 'Không giới hạn'}
                      </strong>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Hạn sử dụng:</span>
                      <span className="text-slate-700 font-semibold">{v.expiredAt || 'Vô thời hạn'}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 font-medium">Khung giờ vàng:</span>
                      {v.timeRestricted ? (
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {v.validFromTime} - {v.validToTime}
                        </span>
                      ) : (
                        <span className="text-slate-500">Cả ngày</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Controls: Active Switch & Action buttons */}
                <div className="pt-3.5 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {/* Toggle Active Switch */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={v.isActive}
                      onChange={() => onUpdateVoucher({ ...v, isActive: !v.isActive })}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                    <span className="text-[11px] font-bold text-slate-600">
                      {v.isActive ? 'Kích hoạt' : 'Tạm dừng'}
                    </span>
                  </label>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(v)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-purple-50 transition-colors"
                      title="Chỉnh sửa voucher"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Bạn có chắc chắn muốn xóa mã voucher "${v.code}"?`)) {
                          onDeleteVoucher(v.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Xóa voucher"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL CREATE / EDIT VOUCHER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">
                    {editingVoucher ? `Chỉnh Sửa Voucher ${editingVoucher.code}` : 'Tạo Mã Khuyến Mãi Mới'}
                  </h3>
                  <p className="text-[11px] text-slate-500">Thiết lập chiết khấu, hạn mức và khung giờ vàng áp dụng.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSaveVoucher} className="space-y-4">
              {/* Code & Discount Pct */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mã Voucher (Code):</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                    placeholder="VD: COMBOYEU, LUNCH15"
                    className="w-full text-xs font-mono font-bold uppercase p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Mức Giảm Giá (%):</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formDiscountPct}
                    onChange={(e) => setFormDiscountPct(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Min Order & Expire Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Đơn tối thiểu (₫):</label>
                  <input
                    type="number"
                    step={5000}
                    min={0}
                    value={formMinOrder}
                    onChange={(e) => setFormMinOrder(Number(e.target.value))}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Ngày hết hạn:</label>
                  <input
                    type="date"
                    required
                    value={formExpiredAt}
                    onChange={(e) => setFormExpiredAt(e.target.value)}
                    className="w-full text-xs font-bold p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Mô tả ưu đãi hiển thị:</label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="VD: Giảm 15% tối đa cho bữa trưa từ 10:30 đến 13:30"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* SECTION: KHUNG GIỜ VÀNG (THỜI GIAN NHẤT ĐỊNH) */}
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span className="text-xs font-extrabold text-amber-900">
                      Giới hạn khung giờ nhất định trong ngày
                    </span>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formTimeRestricted}
                      onChange={(e) => setFormTimeRestricted(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-amber-600 relative"></div>
                    <span className="text-[11px] font-bold text-amber-900">
                      {formTimeRestricted ? 'Bật khung giờ' : 'Cả ngày'}
                    </span>
                  </label>
                </div>

                {formTimeRestricted && (
                  <div className="space-y-3 pt-1">
                    {/* Quick Presets */}
                    <div>
                      <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1.5">
                        Chọn nhanh khung giờ mẫu:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('06:30', '09:00', 'Giảm 15% bữa sáng bổ dưỡng (06:30 - 09:00)')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-left text-[11px] font-semibold text-amber-950 flex items-center gap-1.5 transition-colors"
                        >
                          <Coffee className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Ăn Sáng (06:30 - 09:00)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('10:30', '13:30', 'Giảm 15% tối đa cho Combo trưa (10:30 - 13:30)')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-left text-[11px] font-semibold text-amber-950 flex items-center gap-1.5 transition-colors"
                        >
                          <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Cơm Trưa (10:30 - 13:30)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('14:00', '16:30', 'Giờ vàng ăn vặt & trà sữa (14:00 - 16:30)')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-left text-[11px] font-semibold text-amber-950 flex items-center gap-1.5 transition-colors"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Trà Chiều (14:00 - 16:30)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleApplyPreset('17:30', '20:30', 'Ưu đãi bữa tối thịnh soạn (17:30 - 20:30)')}
                          className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-left text-[11px] font-semibold text-amber-950 flex items-center gap-1.5 transition-colors"
                        >
                          <Moon className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Bữa Tối (17:30 - 20:30)</span>
                        </button>
                      </div>
                    </div>

                    {/* From - To Time Inputs */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 block mb-1">Giờ bắt đầu:</label>
                        <input
                          type="time"
                          required={formTimeRestricted}
                          value={formValidFromTime}
                          onChange={(e) => setFormValidFromTime(e.target.value)}
                          className="w-full text-xs font-mono font-bold p-2 rounded-xl bg-white border border-amber-300 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 block mb-1">Giờ kết thúc:</label>
                        <input
                          type="time"
                          required={formTimeRestricted}
                          value={formValidToTime}
                          onChange={(e) => setFormValidToTime(e.target.value)}
                          className="w-full text-xs font-mono font-bold p-2 rounded-xl bg-white border border-amber-300 focus:outline-none focus:border-amber-600"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-amber-800 leading-relaxed bg-amber-100/60 p-2.5 rounded-xl flex items-start gap-1.5">
                      <Info className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                      <span>
                        Nếu khách hàng áp dụng voucher ngoài khoảng thời gian này (hoặc quá giờ), hệ thống sẽ từ chối và báo{' '}
                        <strong>"Voucher không khả dụng: Mã này chỉ áp dụng trong khung giờ..."</strong>.
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Status active toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Trạng thái kích hoạt:</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsActive}
                    onChange={(e) => setFormIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
                  <span className="text-xs font-bold text-slate-600">
                    {formIsActive ? 'Đang hoạt động' : 'Tạm dừng'}
                  </span>
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {editingVoucher ? 'Cập Nhật Voucher' : 'Tạo Voucher Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
