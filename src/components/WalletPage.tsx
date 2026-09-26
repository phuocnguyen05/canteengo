import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  PlusCircle, 
  ArrowDownRight, 
  ArrowUpRight, 
  RotateCcw, 
  Clock, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  X,
  CreditCard,
  ShieldCheck
} from 'lucide-react';
import { User, WalletHistoryItem, TransactionItem } from '../types';
import { PaymentBadge } from './PaymentBadge';
import { createDepositTransaction } from '../services/qrPaymentService';
import { PaymentQRModal } from './PaymentQRModal';
import { createNotification, createNotificationForRole } from '../services/notificationService';
import { useSearchParams } from 'react-router-dom';

interface WalletPageProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
  onAddTransaction: (tx: TransactionItem) => void;
  showToast: (msg: string) => void;
}

export const WalletPage: React.FC<WalletPageProps> = ({
  currentUser,
  onUpdateUser,
  onAddTransaction,
  showToast
}) => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState<number>(100000);
  const [depositMethod, setDepositMethod] = useState<'cash' | 'qr'>('qr');

  // Active deposit transaction for QR Modal
  const [activeDepositTx, setActiveDepositTx] = useState<TransactionItem | null>(null);
  const [isDepositQRModalOpen, setIsDepositQRModalOpen] = useState(false);

  const walletBalance = currentUser.wallet ?? currentUser.walletBalance ?? 0;
  const history: WalletHistoryItem[] = currentUser.walletHistory || [];

  const [searchParams] = useSearchParams();

  useEffect(() => {
    const txId = searchParams.get("txId");
    if (!txId) return;
    
    setTimeout(() => {
      const el = document.getElementById(`tx-${txId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("highlight-pulse");
        setTimeout(() => el.classList.remove("highlight-pulse"), 3000);
      }
    }, 300);
  }, [searchParams]);

  const handleDepositSubmit = () => {
    if (depositAmount < 10000) {
      showToast('Số tiền nạp tối thiểu là 10.000đ');
      return;
    }

    const tx = createDepositTransaction(currentUser, depositAmount, depositMethod);
    onAddTransaction(tx);
    setIsDepositModalOpen(false);

    // Notifications for deposit request
    createNotification({
      userId: currentUser.id,
      userRole: 'customer',
      type: 'deposit_new',
      title: '💰 Yêu cầu nạp đã ghi nhận',
      message: `Yêu cầu nạp ${depositAmount.toLocaleString('vi-VN')}₫ vào ví đã được ghi nhận.`,
      relatedTransactionId: tx.id
    });

    createNotificationForRole('admin', {
      type: 'deposit_new',
      title: '💵 Có yêu cầu nạp mới',
      message: `Khách hàng ${currentUser.fullName || 'Khách'} vừa tạo yêu cầu nạp ${depositAmount.toLocaleString('vi-VN')}₫.`,
      relatedTransactionId: tx.id
    });

    if (depositMethod === 'qr') {
      setActiveDepositTx(tx);
      setIsDepositQRModalOpen(true);
    } else {
      showToast('Yêu cầu nạp tiền mặt đã được gửi. Vui lòng thanh toán tại quầy canteen.');
    }
  };

  const handleQRConfirmTransfer = () => {
    if (activeDepositTx) {
      const updatedTx: TransactionItem = {
        ...activeDepositTx,
        status: 'pending_confirm'
      };
      onAddTransaction(updatedTx);

      createNotification({
        userId: currentUser.id,
        userRole: 'customer',
        type: 'deposit_new',
        title: '💰 Yêu cầu nạp đã ghi nhận',
        message: `Yêu cầu nạp ${activeDepositTx.amount.toLocaleString('vi-VN')}₫ đã được gửi xác nhận chuyển khoản.`,
        relatedTransactionId: activeDepositTx.id
      });

      createNotificationForRole('admin', {
        type: 'deposit_new',
        title: '💵 Có yêu cầu nạp mới',
        message: `Khách hàng ${currentUser.fullName || 'Khách'} đã báo chuyển khoản nạp ${activeDepositTx.amount.toLocaleString('vi-VN')}₫.`,
        relatedTransactionId: activeDepositTx.id
      });
    }
    setIsDepositQRModalOpen(false);
    showToast('Đã ghi nhận! Vui lòng chờ nhân viên kiểm tra số dư và duyệt tiền vào ví.');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Wallet Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-bg-card via-bg-input to-bg-card border border-[rgba(232,184,75,0.35)] rounded-3xl p-6 md:p-8 shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#E8B84B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#E8B84B] text-xs font-semibold tracking-wider uppercase">
              <Wallet className="w-4 h-4" />
              Ví CanteenPay (C-Pay)
            </div>
            <div className="text-4xl md:text-5xl font-serif font-bold text-text-primary gold-gradient-text">
              {walletBalance.toLocaleString('vi-VN')} <span className="text-2xl font-sans">đ</span>
            </div>
            <p className="text-xs text-text-secondary flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Thanh toán 1-Click siêu tốc, không cần tiền mặt tại quầy
            </p>
          </div>

          <button
            onClick={() => setIsDepositModalOpen(true)}
            className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black font-bold hover:brightness-110 transition-all text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(232,184,75,0.3)] shrink-0"
          >
            <PlusCircle className="w-5 h-5" />
            Nạp tiền vào ví
          </button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="bg-bg-card border border-border-base rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-border-base pb-4">
          <h3 className="text-lg font-serif font-bold text-text-primary flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#E8B84B]" />
            Lịch Sử Giao Dịch Ví
          </h3>
          <span className="text-xs text-text-secondary">{history.length} giao dịch</span>
        </div>

        {history.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <CreditCard className="w-10 h-10 text-gray-600 mx-auto" />
            <p className="text-sm text-gray-400">Chưa có giao dịch biến động số dư nào</p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((item, idx) => {
              const isDeposit = item.type === 'deposit';
              const isRefund = item.type === 'refund';

              return (
                <div
                  id={`tx-${item.txId}`}
                  key={`${item.txId}_${idx}`}
                  className="bg-bg-input border border-border-base rounded-xl p-4 flex items-center justify-between gap-4 hover:border-[rgba(232,184,75,0.3)] transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2.5 rounded-xl text-lg font-bold ${
                        isDeposit
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : isRefund
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                          : 'bg-red-500/10 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {isDeposit ? <ArrowDownRight className="w-5 h-5" /> : isRefund ? <RotateCcw className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>

                    <div>
                      <div className="text-xs font-bold text-text-primary">
                        {isDeposit
                          ? 'Nạp tiền vào ví'
                          : isRefund
                          ? `Hoàn tiền ${item.relatedOrderId ? 'đơn #' + item.relatedOrderId : ''}`
                          : `Thanh toán đơn #${item.relatedOrderId || '---'}`}
                      </div>
                      <p className="text-[11px] text-text-secondary mt-0.5">{item.reason}</p>
                      <span className="text-[10px] text-gray-500 font-mono block mt-1">
                        {new Date(item.at).toLocaleString('vi-VN')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <div
                      className={`text-sm font-bold font-mono ${
                        isDeposit || isRefund ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isDeposit || isRefund ? '+' : '-'}
                      {item.amount.toLocaleString('vi-VN')}đ
                    </div>
                    <span className="text-[10px] bg-bg-card border border-border-base text-gray-400 px-2 py-0.5 rounded-full inline-block mt-1">
                      {item.txId}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-bg-card border border-[rgba(232,184,75,0.3)] rounded-2xl p-6 shadow-2xl space-y-5">
            <button
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-text-primary hover:bg-bg-hover"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-border-base pb-3">
              <div className="p-2.5 rounded-xl bg-[#E8B84B]/10 text-[#E8B84B] border border-[#E8B84B]/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-text-primary">Nạp Tiền Vào Ví C-Pay</h3>
                <p className="text-xs text-text-secondary">Chọn số tiền và phương thức thanh toán</p>
              </div>
            </div>

            {/* Quick Amount Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary block">Chọn nhanh số tiền:</label>
              <div className="grid grid-cols-4 gap-2">
                {[50000, 100000, 200000, 500000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setDepositAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      depositAmount === amt
                        ? 'bg-[#E8B84B] text-black border-[#E8B84B]'
                        : 'bg-bg-input text-text-primary border-border-base hover:bg-bg-hover'
                    }`}
                  >
                    {amt / 1000}k
                  </button>
                ))}
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-text-secondary block">Hoặc nhập số tiền tùy chỉnh (VNĐ):</label>
              <input
                type="number"
                min={10000}
                step={10000}
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                className="w-full bg-bg-input border border-border-base focus:border-[#E8B84B] text-text-primary font-mono text-lg font-bold rounded-xl px-4 py-3 outline-none"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-secondary block">Phương thức nạp:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDepositMethod('qr')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    depositMethod === 'qr'
                      ? 'bg-[#E8B84B]/10 border-[#E8B84B] text-text-primary'
                      : 'bg-bg-input border-border-base text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#E8B84B]" />
                  <div>
                    <div className="text-xs font-bold">Mã VietQR</div>
                    <div className="text-[10px] text-gray-400">Nạp online 24/7</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDepositMethod('cash')}
                  className={`p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                    depositMethod === 'cash'
                      ? 'bg-[#E8B84B]/10 border-[#E8B84B] text-text-primary'
                      : 'bg-bg-input border-border-base text-text-secondary hover:bg-bg-hover'
                  }`}
                >
                  <Banknote className="w-5 h-5 text-[#E8B84B]" />
                  <div>
                    <div className="text-xs font-bold">Tiền mặt</div>
                    <div className="text-[10px] text-gray-400">Thanh toán tại quầy</div>
                  </div>
                </button>
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setIsDepositModalOpen(false)}
                className="flex-1 py-3 rounded-xl border border-border-base bg-bg-input text-text-secondary font-medium hover:text-text-primary transition-colors text-xs"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDepositSubmit}
                className="flex-[1.5] py-3 rounded-xl bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black font-bold hover:brightness-110 transition-all text-xs flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(232,184,75,0.2)]"
              >
                Tiếp tục thanh toán
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit QR Modal */}
      {activeDepositTx && (
        <PaymentQRModal
          isOpen={isDepositQRModalOpen}
          order={{
            id: 99999,
            orderCode: activeDepositTx.transactionId,
            receiverName: currentUser.fullName,
            phone: currentUser.phone,
            pickupArea: 'Nạp ví C-Pay',
            pickupTime: 'Ngay',
            status: 'PENDING',
            totalAmount: activeDepositTx.amount,
            finalAmount: activeDepositTx.amount,
            paymentMethod: 'TRANSFER',
            paymentStatus: 'PENDING',
            createdAt: new Date().toISOString(),
            items: []
          }}
          paymentDetails={{
            method: 'qr',
            status: 'pending_confirm',
            transactionId: activeDepositTx.transactionId,
            qrContent: activeDepositTx.qrContent,
            qrExpiresAt: activeDepositTx.qrExpiresAt
          }}
          onClose={() => setIsDepositQRModalOpen(false)}
          onConfirmTransfer={handleQRConfirmTransfer}
          showToast={showToast}
        />
      )}
    </div>
  );
};
