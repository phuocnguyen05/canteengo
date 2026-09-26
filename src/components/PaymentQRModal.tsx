import React, { useState, useEffect } from 'react';
import { QrCode, Copy, Check, Clock, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { Order, OrderPayment } from '../types';

interface PaymentQRModalProps {
  isOpen: boolean;
  order: Order | null;
  paymentDetails: OrderPayment | null;
  onClose: () => void;
  onConfirmTransfer: () => void;
  onReorder?: () => void;
  showToast?: (msg: string) => void;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({
  isOpen,
  order,
  paymentDetails,
  onClose,
  onConfirmTransfer,
  onReorder,
  showToast
}) => {
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [copiedTxId, setCopiedTxId] = useState(false);
  const [timeLeftMs, setTimeLeftMs] = useState<number>(300000); // 5 minutes default
  const [isExpired, setIsExpired] = useState(false);

  const txId = paymentDetails?.transactionId || `DH${order?.orderCode || '000'}-${Math.floor(Date.now() / 1000)}`;
  const amount = order?.finalAmount || order?.totalAmount || 0;
  const expiresAt = paymentDetails?.qrExpiresAt ? Number(paymentDetails.qrExpiresAt) : Date.now() + 300000;

  useEffect(() => {
    if (!isOpen) return;

    const updateTimer = () => {
      const remaining = Math.max(0, expiresAt - Date.now());
      setTimeLeftMs(remaining);
      if (remaining <= 0) {
        setIsExpired(true);
      } else {
        setIsExpired(false);
      }
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isOpen, expiresAt]);

  if (!isOpen || !order) return null;

  const totalDurationMs = 5 * 60 * 1000;
  const progressPct = Math.min(100, Math.max(0, (timeLeftMs / totalDurationMs) * 100));

  const minutes = Math.floor(timeLeftMs / 60000);
  const seconds = Math.floor((timeLeftMs % 60000) / 1000);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isWarningTime = minutes < 1; // < 1 minute

  const handleCopy = (text: string, type: 'tx' | 'amount' | 'stk') => {
    navigator.clipboard.writeText(text);
    if (type === 'tx') {
      setCopiedTxId(true);
      setTimeout(() => setCopiedTxId(false), 2000);
    } else if (type === 'amount') {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
    if (showToast) showToast('Đã copy!');
  };

  const qrImageUrl = `https://img.vietqr.io/image/MB-0110151552005-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(txId)}&accountName=NGUYEN%20HUU%20PHUOC`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className={`relative w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all duration-300 ${
          isExpired
            ? 'bg-bg-elevated border-gray-700/60 text-gray-400'
            : 'bg-bg-card border-[rgba(232,184,75,0.3)] text-text-primary shadow-[0_0_50px_rgba(232,184,75,0.15)]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-text-primary hover:bg-bg-hover transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5 border-b border-border-base pb-4">
          <div className="p-2.5 rounded-xl bg-[#E8B84B]/10 border border-[#E8B84B]/30 text-[#E8B84B]">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-serif font-bold text-text-primary">Thanh toán Qua Mã QR</h3>
            <p className="text-xs text-text-secondary">Quét mã VietQR hoặc chuyển khoản thủ công</p>
          </div>
        </div>

        {isExpired ? (
          /* Expired State UI */
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <Clock className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-red-400">⌛ Đã hết thời gian thanh toán</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto">
              Giao dịch QR cho đơn hàng #{order.orderCode} đã bị quá hạn 5 phút và tự động hủy.
            </p>
            <div className="pt-4 flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-border-base bg-bg-input text-text-primary font-medium hover:bg-bg-hover transition-colors text-sm"
              >
                Đóng
              </button>
              {onReorder && (
                <button
                  onClick={() => {
                    onClose();
                    onReorder();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black font-semibold hover:brightness-110 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Đặt lại đơn mới
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Active QR State UI */
          <div className="space-y-4">
            {/* Timer & Progress Bar */}
            <div className="bg-bg-input border border-border-base rounded-xl p-3">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Clock className="w-4 h-4 text-[#E8B84B]" /> Thời gian giữ mã:
                </span>
                <span
                  className={`font-mono font-bold text-sm ${
                    isWarningTime ? 'text-red-400 animate-pulse' : 'text-[#E8B84B]'
                  }`}
                >
                  {formattedTime}
                </span>
              </div>
              <div className="w-full bg-bg-card h-2 rounded-full overflow-hidden border border-border-base">
                <div
                  className={`h-full transition-all duration-1000 ${
                    isWarningTime ? 'bg-red-500' : 'bg-gradient-to-r from-[#E8B84B] to-[#F4C95D]'
                  }`}
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center bg-white p-4 rounded-2xl shadow-inner border border-[#E8B84B]/40 my-2 max-w-[320px] mx-auto">
              <img
                src={qrImageUrl}
                alt="VietQR MB Bank"
                className="w-full h-auto object-contain rounded-lg"
              />
            </div>

            {/* Bank Details Table */}
            <div className="bg-bg-input border border-border-base rounded-xl p-3.5 space-y-2.5 text-xs">
              <div className="font-bold text-[#E8B84B] flex items-center gap-1.5 pb-1 border-b border-border-base">
                💳 Thông tin chuyển khoản:
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Ngân hàng:</span>
                <span className="font-semibold text-text-primary">MB Bank (MB)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Số TK:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-text-primary font-bold">0110151552005</span>
                  <button
                    onClick={() => handleCopy('0110151552005', 'stk')}
                    className="p-1 hover:bg-bg-hover rounded text-[#E8B84B] transition-colors"
                    title="Sao chép STK"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Chủ TK:</span>
                <span className="font-semibold text-text-primary">NGUYEN HUU PHUOC</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border-base">
                <span className="text-text-secondary">Số tiền:</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black text-[#E8B84B]">
                    {amount.toLocaleString('vi-VN')}đ
                  </span>
                  <button
                    onClick={() => handleCopy(String(amount), 'amount')}
                    className="p-1 hover:bg-bg-hover rounded text-[#E8B84B] transition-colors"
                  >
                    {copiedAmount ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-text-secondary">Nội dung:</span>
                <div className="flex items-center gap-1.5 bg-bg-card border border-border-base px-2.5 py-1 rounded-md">
                  <span className="font-mono font-bold text-[#E8B84B]">{txId}</span>
                  <button
                    onClick={() => handleCopy(txId, 'tx')}
                    className="p-1 hover:bg-bg-hover rounded text-[#E8B84B] transition-colors"
                  >
                    {copiedTxId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Warning Note */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-2.5 flex items-start gap-2 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
              <span>
                ⚠️ Quét QR bằng app ngân hàng, số tiền và nội dung sẽ tự động điền sẵn. KHÔNG sửa nội dung.
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex gap-3">
              <button
                onClick={onClose}
                className="py-2.5 px-4 rounded-xl border border-border-base bg-bg-input text-text-secondary font-medium hover:text-text-primary hover:bg-bg-hover transition-colors text-xs"
              >
                Hủy / Đóng
              </button>
              <button
                onClick={() => {
                  onConfirmTransfer();
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black font-semibold hover:brightness-110 transition-all text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(232,184,75,0.2)]"
              >
                <Check className="w-4 h-4" />
                Tôi đã chuyển khoản
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
