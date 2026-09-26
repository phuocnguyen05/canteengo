import React, { useState } from 'react';
import { 
  Wallet, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Sparkles, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  X,
  CreditCard,
  QrCode
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { User } from '../types';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onDeposit: (amount: number) => void;
  onOpenLogin: () => void;
}

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000];

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDeposit,
  onOpenLogin,
}) => {
  const [selectedAmount, setSelectedAmount] = useState<number>(100000);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [depositStep, setDepositStep] = useState<'SELECT' | 'CONFIRM' | 'SUCCESS'>('SELECT');
  const [selectedMethod, setSelectedMethod] = useState<'VIETQR' | 'CARD'>('VIETQR');

  if (!isOpen) return null;

  const currentBalance = currentUser?.walletBalance || 0;
  const depositAmount = customAmount ? parseInt(customAmount, 10) || 0 : selectedAmount;

  const handleExecuteDeposit = () => {
    if (depositAmount <= 0) return;
    onDeposit(depositAmount);
    setDepositStep('SUCCESS');
    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleResetAndClose = () => {
    setDepositStep('SELECT');
    setCustomAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border-base overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border-base flex items-center justify-between bg-bg-primary text-text-primary">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B] shadow-sm">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight font-serif text-[#E8B84B]">Ví Canteen C-Pay</h2>
              <p className="text-[11px] text-text-secondary">Thanh toán 1 chạm, nhận ưu đãi độc quyền</p>
            </div>
          </div>

          <button
            onClick={handleResetAndClose}
            className="w-8 h-8 rounded-lg bg-bg-input hover:bg-bg-elevated flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {!currentUser ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#E8B84B]/10 text-[#E8B84B] border border-[#E8B84B]/30 flex items-center justify-center mx-auto">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-text-primary text-sm">Cần đăng nhập tài khoản</h3>
              <p className="text-xs text-text-secondary max-w-xs mx-auto">
                Vui lòng đăng nhập hoặc tạo tài khoản khách hàng để kích hoạt và sử dụng ví điện tử C-Pay.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenLogin();
                }}
                className="px-4 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-md shadow-[#E8B84B]/20 cursor-pointer"
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <>
              {/* Wallet Card Display */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-bg-input via-bg-card to-bg-primary p-5 text-text-primary shadow-lg border border-[#E8B84B]/40">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] font-semibold text-[#E8B84B] uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Số dư ví C-Pay khả dụng
                    </span>
                    <div className="text-2xl sm:text-3xl font-black mt-1 tracking-tight text-[#E8B84B]">
                      {currentBalance.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-[#E8B84B]/20 border border-[#E8B84B]/30 flex items-center justify-center text-[#E8B84B]">
                    <Wallet className="w-5 h-5" />
                  </div>
                </div>

                <div className="pt-3 border-t border-border-base flex items-center justify-between text-xs text-text-secondary">
                  <div>
                    <span className="text-[10px] text-text-secondary block">Chủ ví:</span>
                    <span className="font-bold text-text-primary">{currentUser.fullName}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-text-secondary block">Trạng thái ví:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-[#E8B84B] text-[11px]">
                      <ShieldCheck className="w-3 h-3" /> Đang hoạt động
                    </span>
                  </div>
                </div>

                {/* Decorative background circle */}
                <div className="absolute -right-8 -bottom-8 w-28 h-28 bg-[#E8B84B]/10 rounded-full blur-xl pointer-events-none" />
              </div>

              {/* Deposit Steps */}
              {depositStep === 'SELECT' && (
                <div className="space-y-3 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-secondary">
                      Chọn số tiền nạp vào ví:
                    </label>
                    <span className="text-[11px] text-[#E8B84B] font-semibold">Miễn phí giao dịch</span>
                  </div>

                  {/* Quick amount chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {QUICK_AMOUNTS.map((amt) => {
                      const isSelected = !customAmount && selectedAmount === amt;
                      return (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => {
                            setSelectedAmount(amt);
                            setCustomAmount('');
                          }}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#E8B84B] bg-[#E8B84B]/20 text-[#E8B84B] shadow-xs'
                              : 'border-border-base bg-bg-input text-text-secondary hover:bg-bg-hover'
                          }`}
                        >
                          {(amt / 1000).toLocaleString()}k
                        </button>
                      );
                    })}
                  </div>

                  {/* Custom amount */}
                  <div>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="Hoặc nhập số tiền khác (VD: 150000)..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B] placeholder-slate-500"
                    />
                  </div>

                  {/* Payment method for deposit */}
                  <div className="pt-2">
                    <label className="text-xs font-bold text-text-secondary block mb-1.5">
                      Hình thức nạp tiền:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedMethod('VIETQR')}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                          selectedMethod === 'VIETQR'
                            ? 'border-[#E8B84B] bg-[#E8B84B]/15 text-[#E8B84B] font-bold'
                            : 'border-border-base bg-bg-input hover:bg-bg-hover text-text-secondary'
                        }`}
                      >
                        <QrCode className="w-4 h-4 text-[#E8B84B]" />
                        <span>VietQR 247</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedMethod('CARD')}
                        className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs transition-all cursor-pointer ${
                          selectedMethod === 'CARD'
                            ? 'border-[#E8B84B] bg-[#E8B84B]/15 text-[#E8B84B] font-bold'
                            : 'border-border-base bg-bg-input hover:bg-bg-hover text-text-secondary'
                        }`}
                      >
                        <CreditCard className="w-4 h-4 text-[#E8B84B]" />
                        <span>Thẻ ATM / Visa</span>
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDepositStep('CONFIRM')}
                    disabled={depositAmount <= 0}
                    className="w-full py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#E8B84B]/20 transition-all disabled:opacity-50 mt-3 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Tiếp tục nạp {depositAmount.toLocaleString('vi-VN')}₫</span>
                  </button>
                </div>
              )}

              {/* Step 2: Confirm / QR Scan */}
              {depositStep === 'CONFIRM' && (
                <div className="space-y-4 pt-1 text-center">
                  <div className="p-3 bg-bg-input rounded-xl border border-border-base">
                    <span className="text-xs text-text-secondary">Số tiền nạp vào ví C-Pay:</span>
                    <div className="text-2xl font-black text-[#E8B84B] mt-0.5">
                      {depositAmount.toLocaleString('vi-VN')}₫
                    </div>
                  </div>

                  <div className="w-48 h-48 mx-auto bg-white p-2.5 rounded-xl border border-[#E8B84B] shadow-sm flex items-center justify-center">
                    <img
                      src={`https://img.vietqr.io/image/MB-0110151552005-compact2.png?amount=${depositAmount}&addInfo=NAP${currentUser?.id || '0'}-${Math.floor(Date.now() / 1000)}&accountName=NGUYEN%20HUU%20PHUOC`}
                      alt="VietQR nạp ví"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <p className="text-[11px] text-text-secondary">
                    Mở ứng dụng Ngân hàng quét mã QR hoặc bấm nút bên dưới để xác nhận nạp ngay.
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setDepositStep('SELECT')}
                      className="flex-1 py-2.5 rounded-xl border border-border-base hover:bg-bg-input text-text-secondary font-bold text-xs cursor-pointer"
                    >
                      Quay lại
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteDeposit}
                      className="flex-1 py-2.5 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-md shadow-[#E8B84B]/20 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Xác nhận đã nạp</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Success */}
              {depositStep === 'SUCCESS' && (
                <div className="text-center py-6 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40 flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-text-primary text-base">Nạp tiền thành công!</h3>
                  <p className="text-xs text-text-secondary max-w-xs mx-auto">
                    Đã cộng <strong className="text-[#E8B84B]">{depositAmount.toLocaleString('vi-VN')}₫</strong> vào ví của bạn. Số dư mới là <strong className="text-text-primary">{(currentBalance).toLocaleString('vi-VN')}₫</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAndClose}
                    className="px-6 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs cursor-pointer"
                  >
                    Hoàn tất & Đóng
                  </button>
                </div>
              )}

              {/* Perks info */}
              <div className="p-3 rounded-xl bg-bg-input border border-border-base text-[11px] text-text-secondary space-y-1">
                <span className="font-bold text-[#E8B84B] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#E8B84B]" />
                  Đặc quyền ví C-Pay:
                </span>
                <p>• Thanh toán tức thì trong giỏ hàng không cần quét lại mã hay đem theo tiền lẻ.</p>
                <p>• Tự động áp dụng thêm voucher giảm giá độc quyền cho khách thanh toán qua ví.</p>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
