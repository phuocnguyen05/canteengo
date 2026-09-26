import React, { useState } from 'react';
import {
  Store,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Save,
  X,
  Sparkles,
  Sliders,
  Settings,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import { CanteenStatusConfig } from '../types';

interface CanteenStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CanteenStatusConfig;
  onSaveConfig: (newConfig: CanteenStatusConfig) => void;
}

export const CanteenStatusModal: React.FC<CanteenStatusModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [isOpenState, setIsOpenState] = useState(config.isOpen);
  const [mode, setMode] = useState<'MANUAL' | 'AUTO'>(config.mode || 'MANUAL');
  const [statusText, setStatusText] = useState(config.statusText || 'Đang mở cửa phục vụ');
  const [closedNote, setClosedNote] = useState(
    config.closedNote ||
      'Căng tin tạm nghỉ phục vụ để dọn dẹp và chuẩn bị nguyên liệu tươi ngon. Hẹn gặp lại bạn vào ca tiếp theo!'
  );
  const [lunchHours, setLunchHours] = useState(config.lunchHours || '10:30 – 13:30 (Thứ 2 – Thứ 7)');
  const [breakfastHours, setBreakfastHours] = useState(
    config.breakfastHours || '06:30 – 08:30 & 16:00 – 21:00'
  );
  const [allowOrderingWhenClosed, setAllowOrderingWhenClosed] = useState(
    config.allowOrderingWhenClosed ?? true
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig({
      isOpen: isOpenState,
      mode,
      statusText: statusText.trim() || (isOpenState ? 'Đang mở cửa phục vụ' : 'Tạm đóng cửa / Nghỉ phục vụ'),
      closedNote: closedNote.trim(),
      lunchHours: lunchHours.trim() || '10:30 – 13:30 (Thứ 2 – Thứ 7)',
      breakfastHours: breakfastHours.trim() || '06:30 – 08:30 & 16:00 – 18:30',
      allowOrderingWhenClosed,
    });
    onClose();
  };

  // Quick preset text handlers
  const handleQuickStatus = (open: boolean, text: string, note?: string) => {
    setIsOpenState(open);
    setStatusText(text);
    if (note !== undefined) setClosedNote(note);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-bg-card rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-border-base my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-base">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 text-[#E8B84B] flex items-center justify-center font-bold shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-text-primary text-base font-serif">
                Cài Đặt Trạng Thái Căng Tin & Giờ Mở Cửa
              </h3>
              <p className="text-xs text-text-secondary">
                Tùy chỉnh mục "Đang mở cửa", bật/tắt phục vụ và thông tin giờ hoạt động dưới đáy trang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-input transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Main On/Off Toggle Cards */}
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-2">
              Trạng thái phục vụ hiện tại (Admin Bật/Tắt):
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* OPEN Card */}
              <button
                type="button"
                onClick={() => handleQuickStatus(true, 'Đang mở cửa phục vụ')}
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  isOpenState
                    ? 'border-emerald-500 bg-emerald-950/40 shadow-md ring-2 ring-emerald-500/20'
                    : 'border-border-base bg-bg-input hover:bg-bg-elevated opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <CheckCircle2
                    className={`w-5 h-5 ${isOpenState ? 'text-emerald-400' : 'text-text-secondary'}`}
                  />
                </div>
                <div className="mt-3">
                  <div className="font-black text-sm text-emerald-300">ĐANG MỞ CỬA</div>
                  <p className="text-[11px] text-text-secondary font-medium mt-0.5">
                    Phục vụ và nhận đơn bình thường
                  </p>
                </div>
              </button>

              {/* CLOSED Card */}
              <button
                type="button"
                onClick={() =>
                  handleQuickStatus(
                    false,
                    'Tạm đóng cửa / Nghỉ phục vụ',
                    'Căng tin hiện tạm nghỉ phục vụ. Quý khách vui lòng quay lại sau!'
                  )
                }
                className={`p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                  !isOpenState
                    ? 'border-rose-500 bg-rose-950/40 shadow-md ring-2 ring-rose-500/20'
                    : 'border-border-base bg-bg-input hover:bg-bg-elevated opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <XCircle className={`w-5 h-5 ${!isOpenState ? 'text-rose-400' : 'text-text-secondary'}`} />
                </div>
                <div className="mt-3">
                  <div className="font-black text-sm text-rose-300">TẠM ĐÓNG CỬA</div>
                  <p className="text-[11px] text-text-secondary font-medium mt-0.5">
                    Tạm nghỉ hoặc hết giờ phục vụ
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Quick presets for status text */}
          <div>
            <span className="text-[11px] font-bold text-text-secondary uppercase tracking-wider block mb-1.5">
              Chọn nhanh trạng thái phổ biến:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickStatus(true, 'Đang mở cửa phục vụ')}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 text-xs font-semibold border border-emerald-500/40 transition-colors cursor-pointer"
              >
                🟢 Đang mở cửa phục vụ
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickStatus(
                    true,
                    'Đang trong giờ cao điểm (Nhanh tay)',
                    'Giờ cơm trưa cao điểm đang phục vụ đông khách, xin ưu tiên đặt trước.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-[#E8B84B]/20 hover:bg-[#E8B84B]/30 text-[#E8B84B] text-xs font-semibold border border-[#E8B84B]/40 transition-colors cursor-pointer"
              >
                ⚡ Giờ cao điểm
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickStatus(
                    false,
                    'Bếp đang chuẩn bị ca trưa (Mở lúc 10:30)',
                    'Đầu bếp đang chế biến các món tươi nóng, bắt đầu mở bán vào 10:30.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 text-xs font-semibold border border-blue-500/40 transition-colors cursor-pointer"
              >
                🍳 Bếp đang chuẩn bị
              </button>
              <button
                type="button"
                onClick={() =>
                  handleQuickStatus(
                    false,
                    'Tạm nghỉ trưa - Hẹn ca xế 16:00',
                    'Căng tin đã phục vụ hết suất cơm trưa. Mời bạn ghé lại vào ca xế 16:00.'
                  )
                }
                className="px-2.5 py-1 rounded-lg bg-bg-input hover:bg-bg-elevated text-text-secondary hover:text-text-primary text-xs font-semibold border border-border-base transition-colors cursor-pointer"
              >
                🌙 Nghỉ giữa ca
              </button>
            </div>
          </div>

          {/* Custom Status Label */}
          <div>
            <label className="text-xs font-bold text-text-secondary block mb-1">
              Dòng chữ hiển thị trên huy hiệu trạng thái:
            </label>
            <input
              type="text"
              required
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              placeholder="VD: Đang mở cửa phục vụ, Tạm đóng cửa nghỉ lễ..."
              className="w-full text-xs font-bold p-2.5 rounded-xl border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B]"
            />
          </div>

          {/* Note when closed */}
          {!isOpenState && (
            <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
              <label className="text-xs font-bold text-rose-300 block">
                Thông báo chi tiết cho khách hàng khi đóng cửa:
              </label>
              <textarea
                rows={2}
                value={closedNote}
                onChange={(e) => setClosedNote(e.target.value)}
                placeholder="Nhập thông báo khi căng tin đóng cửa..."
                className="w-full text-xs p-2 rounded-xl bg-bg-card border border-rose-500/40 text-text-primary focus:outline-none focus:border-rose-400"
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="allowOrderingWhenClosed"
                  checked={allowOrderingWhenClosed}
                  onChange={(e) => setAllowOrderingWhenClosed(e.target.checked)}
                  className="rounded text-rose-500 focus:ring-rose-400"
                />
                <label
                  htmlFor="allowOrderingWhenClosed"
                  className="text-[11px] font-semibold text-rose-300 cursor-pointer"
                >
                  Cho phép khách đặt trước hẹn giờ (Pre-order) ngay cả khi đang đóng cửa
                </label>
              </div>
            </div>
          )}

          {/* Operating Hours Settings */}
          <div className="p-3.5 rounded-2xl bg-bg-input border border-border-base space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#E8B84B]" />
              <span className="text-xs font-extrabold text-text-primary">
                Chỉnh sửa thông tin giờ hoạt động (Hiển thị ở Footer)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">
                  Giờ bữa trưa chính:
                </label>
                <input
                  type="text"
                  value={lunchHours}
                  onChange={(e) => setLunchHours(e.target.value)}
                  placeholder="10:30 – 13:30 (Thứ 2 – Thứ 7)"
                  className="w-full text-xs p-2 rounded-xl bg-bg-primary border border-border-base text-text-primary focus:outline-none focus:border-[#E8B84B] font-medium"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-text-secondary block mb-1">
                  Giờ bữa sáng & bữa xế:
                </label>
                <input
                  type="text"
                  value={breakfastHours}
                  onChange={(e) => setBreakfastHours(e.target.value)}
                  placeholder="06:30 – 08:30 & 16:00 – 18:30"
                  className="w-full text-xs p-2 rounded-xl bg-bg-primary border border-border-base text-text-primary focus:outline-none focus:border-[#E8B84B] font-medium"
                />
              </div>
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="p-3.5 rounded-2xl bg-bg-primary border border-border-base text-slate-300 space-y-2">
            <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
              Xem trước hiển thị ở chân trang (Footer Preview):
            </span>
            <div className="flex items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isOpenState
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border-rose-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isOpenState ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {statusText || (isOpenState ? 'Đang mở cửa phục vụ' : 'Tạm đóng cửa / Nghỉ phục vụ')}
              </span>
            </div>
            {!isOpenState && closedNote && (
              <p className="text-[11px] text-rose-300/90 italic pt-0.5">{closedNote}</p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-border-base">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-base text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-bg-input cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu Cấu Hình Mở Cửa</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
