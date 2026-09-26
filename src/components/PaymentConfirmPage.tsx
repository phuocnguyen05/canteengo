import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Copy, 
  Check, 
  AlertCircle, 
  Wallet, 
  ShoppingBag, 
  User, 
  Phone, 
  Calendar,
  Filter
} from 'lucide-react';
import { TransactionItem, Order, User as UserType } from '../types';
import { PaymentBadge } from './PaymentBadge';
import { confirmPaymentTransaction, rejectPaymentTransaction } from '../services/qrPaymentService';

interface PaymentConfirmPageProps {
  currentUser: UserType;
  orders: Order[];
  transactions: TransactionItem[];
  onUpdateOrder: (updatedOrder: Order) => void;
  onUpdateTransaction: (updatedTx: TransactionItem) => void;
  showToast: (msg: string) => void;
}

export const PaymentConfirmPage: React.FC<PaymentConfirmPageProps> = ({
  currentUser,
  orders,
  transactions,
  onUpdateOrder,
  onUpdateTransaction,
  showToast
}) => {
  type FilterStatus = 'ALL' | 'PENDING' | 'PAID' | 'REJECTED';
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

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

  // Selected item for confirm/reject dialogs
  const [confirmTarget, setConfirmTarget] = useState<TransactionItem | Order | null>(null);
  const [confirmNote, setConfirmNote] = useState('');

  const [rejectTarget, setRejectTarget] = useState<TransactionItem | Order | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const [copiedTxId, setCopiedTxId] = useState<string | null>(null);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTxId(text);
    setTimeout(() => setCopiedTxId(null), 2000);
    showToast('Đã sao chép mã giao dịch!');
  };

  // Combine QR & Cash orders with pending_confirm status and transactions
  const combinedItems: Array<{
    type: 'ORDER' | 'DEPOSIT';
    id: string;
    code: string;
    customerName: string;
    customerPhone: string;
    amount: number;
    status: string;
    method: 'qr' | 'cash' | 'deposit';
    createdAt: number | string;
    qrExpiresAt?: number | string | null;
    raw: TransactionItem | Order;
    note?: string | null;
  }> = [];

  // Add QR and Cash orders (exclude WALLET and CANCELLED)
  orders.forEach((o) => {
    // 1. Exclude cancelled orders
    if (o.status === 'CANCELLED') return;

    // 2. EXCLUDE WALLET ORDERS completely (auto paid via wallet deduction)
    const isWallet = o.paymentMethod === 'WALLET' || o.payment?.method === 'wallet';
    if (isWallet) return;

    // 3. Determine method: QR vs Cash
    const isQR = o.paymentMethod === 'TRANSFER' || o.payment?.method === 'qr';
    const method: 'qr' | 'cash' = isQR ? 'qr' : 'cash';

    // 4. Determine payment status
    let pStatus = (o.payment?.status || (o.paymentStatus === 'PAID' ? 'paid' : 'pending_confirm')).toLowerCase();
    if (pStatus === 'unpaid' && method === 'cash') {
      pStatus = 'pending_confirm';
    }

    combinedItems.push({
      type: 'ORDER',
      id: `ORDER_${o.orderCode}`,
      code: o.payment?.transactionId || `CTG-${o.orderCode}`,
      customerName: o.receiverName,
      customerPhone: o.phone,
      amount: o.finalAmount,
      status: pStatus,
      method,
      createdAt: o.createdAt,
      qrExpiresAt: o.payment?.qrExpiresAt,
      note: o.payment?.note || o.notes,
      raw: o
    });
  });

  // Add deposit transactions (Wallet top-up)
  transactions.forEach((tx) => {
    if (tx.status === 'failed' || tx.status === 'expired') return;
    combinedItems.push({
      type: 'DEPOSIT',
      id: `TX_${tx.id}`,
      code: tx.transactionId,
      customerName: tx.userName,
      customerPhone: tx.userPhone,
      amount: tx.amount,
      status: tx.status.toLowerCase(),
      method: 'deposit',
      createdAt: tx.createdAt,
      qrExpiresAt: tx.qrExpiresAt,
      note: tx.reason,
      raw: tx
    });
  });

  // Sort newest first
  combinedItems.sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || Number(a.createdAt) || 0;
    const timeB = new Date(b.createdAt).getTime() || Number(b.createdAt) || 0;
    return timeB - timeA;
  });

  // Filter items
  const filteredItems = combinedItems.filter((item) => {
    const normStatus = item.status.toLowerCase();
    if (activeFilter === 'PENDING' && !(normStatus === 'pending_confirm' || normStatus === 'pending')) return false;
    if (activeFilter === 'PAID' && normStatus !== 'paid') return false;
    if (activeFilter === 'REJECTED' && normStatus !== 'failed' && normStatus !== 'expired' && normStatus !== 'rejected') return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.code.toLowerCase().includes(q) ||
        item.customerName.toLowerCase().includes(q) ||
        item.customerPhone.includes(q)
      );
    }
    return true;
  });

  const pendingCount = combinedItems.filter(
    (i) => i.status.toLowerCase() === 'pending_confirm' || i.status.toLowerCase() === 'pending'
  ).length;

  const handleConfirmAction = async () => {
    if (!confirmTarget) return;
    try {
      const result = await confirmPaymentTransaction(confirmTarget, currentUser);
      if ('orderCode' in result.updatedItem) {
        onUpdateOrder(result.updatedItem as Order);
        showToast(`✅ Đã xác nhận thanh toán đơn #${(result.updatedItem as Order).orderCode}`);
      } else {
        onUpdateTransaction(result.updatedItem as TransactionItem);
        showToast(`✅ Đã xác nhận nạp tiền ví cho ${result.updatedItem.userName}`);
      }
      setConfirmTarget(null);
      setConfirmNote('');
    } catch (err) {
      showToast('Có lỗi xảy ra khi xác nhận thanh toán.');
    }
  };

  const handleRejectAction = async () => {
    if (!rejectTarget) return;
    if (!rejectReason.trim()) {
      showToast('Vui lòng nhập lý do từ chối!');
      return;
    }
    try {
      const updated = await rejectPaymentTransaction(rejectTarget, currentUser, rejectReason);
      if ('orderCode' in updated) {
        onUpdateOrder(updated as Order);
        showToast(`❌ Đã từ chối thanh toán đơn #${(updated as Order).orderCode}`);
      } else {
        onUpdateTransaction(updated as TransactionItem);
        showToast(`❌ Đã từ chối giao dịch nạp ví #${(updated as TransactionItem).id}`);
      }
      setRejectTarget(null);
      setRejectReason('');
    } catch (err) {
      showToast('Có lỗi xảy ra khi từ chối thanh toán.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-bg-card border border-[rgba(232,184,75,0.3)] rounded-2xl p-5 shadow-[0_8px_30px_rgba(0,0,0,0.6)]">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-serif font-bold text-text-primary">Xác Nhận Thanh Toán</h2>
            {pendingCount > 0 && (
              <span className="bg-orange-500 text-black text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse">
                {pendingCount} chờ duyệt
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mt-1">
            Duyệt các giao dịch chuyển khoản ngân hàng VietQR & yêu cầu nạp tiền ví C-Pay
          </p>
        </div>

        {/* Search & Refresh */}
        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo mã GD, tên, SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-bg-input border border-border-base focus:border-[#E8B84B] text-text-primary placeholder-text-muted text-xs rounded-xl pl-9 pr-4 py-2.5 outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { key: 'ALL', label: 'Tất cả', count: combinedItems.length },
          { key: 'PENDING', label: '⏳ Chờ xác nhận', count: pendingCount, highlight: true },
          {
            key: 'PAID',
            label: '✅ Đã duyệt',
            count: combinedItems.filter((i) => i.status.toLowerCase() === 'paid').length
          },
          {
            key: 'REJECTED',
            label: '❌ Từ chối / Hết hạn',
            count: combinedItems.filter((i) => i.status.toLowerCase() === 'failed' || i.status.toLowerCase() === 'expired').length
          }
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key as FilterStatus)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 border ${
              activeFilter === f.key
                ? 'bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black border-transparent shadow-[0_4px_12px_rgba(232,184,75,0.25)]'
                : 'bg-bg-card border-border-base text-text-secondary hover:text-text-primary hover:bg-bg-input'
            }`}
          >
            {f.label}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                activeFilter === f.key
                  ? 'bg-black/20 text-black font-bold'
                  : 'bg-bg-input text-text-secondary'
              }`}
            >
              {f.count}
            </span>
          </button>
        ))}
      </div>

      {/* Transactions Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-bg-card border border-border-base rounded-2xl p-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h4 className="text-base font-bold text-gray-300">Không tìm thấy giao dịch nào</h4>
          <p className="text-xs text-text-secondary mt-1">Vui lòng thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const isPending = item.status.toLowerCase() === 'pending_confirm' || item.status.toLowerCase() === 'pending';

            return (
              <div
                id={`tx-${(item.raw as any).id || (item.raw as any).transactionId || item.code}`}
                key={item.id}
                className={`bg-bg-card rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  isPending
                    ? 'border-orange-500/50 shadow-[0_4px_20px_rgba(251,146,60,0.1)]'
                    : 'border-border-base opacity-90'
                }`}
              >
                <div className="space-y-3">
                  {/* Top Bar: Type & Payment Badge */}
                  <div className="flex items-center justify-between gap-2 border-b border-border-base pb-3">
                    <div className="flex items-center gap-2">
                      {item.type === 'ORDER' ? (
                        <span className="p-1.5 rounded-lg bg-[#E8B84B]/10 text-[#E8B84B]">
                          <ShoppingBag className="w-4 h-4" />
                        </span>
                      ) : (
                        <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                          <Wallet className="w-4 h-4" />
                        </span>
                      )}
                      <span className="text-xs font-bold text-text-primary">
                        {item.type === 'ORDER' ? `Đơn hàng #${(item.raw as Order).orderCode}` : 'Nạp tiền Ví C-Pay'}
                      </span>
                    </div>
                    {/* Method Specific Badges */}
                    {item.method === 'qr' ? (
                      isPending ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#E8B84B]/15 text-[#E8B84B] border border-[#E8B84B]/40 animate-pulse">
                          📱 QR - Chờ xác nhận
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          📱 QR - Đã xác nhận
                        </span>
                      )
                    ) : item.method === 'cash' ? (
                      isPending ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/40 animate-pulse">
                          💵 Tiền mặt - Chờ thu
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          💵 Tiền mặt - Đã thu
                        </span>
                      )
                    ) : (
                      isPending ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 animate-pulse">
                          💰 Nạp ví - Chờ duyệt
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          💰 Nạp ví - Thành công
                        </span>
                      )
                    )}
                  </div>

                  {/* Transaction Code Box */}
                  <div className="bg-bg-input border border-border-base rounded-xl p-2.5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-text-secondary block">Mã GD / Nội dung</span>
                      <span className="font-mono text-xs font-bold text-[#E8B84B]">{item.code}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(item.code)}
                      className="p-1.5 hover:bg-bg-hover rounded-lg text-[#E8B84B] transition-colors"
                      title="Copy mã"
                    >
                      {copiedTxId === item.code ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Amount & Customer details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center bg-bg-elevated p-2.5 rounded-xl border border-border-base">
                      <span className="text-text-secondary">Số tiền giao dịch:</span>
                      <span className="text-lg font-bold text-[#E8B84B]">
                        {item.amount.toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center gap-2 text-text-secondary">
                        <User className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-text-primary font-medium">{item.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-secondary">
                        <Phone className="w-3.5 h-3.5 text-gray-500" />
                        <span>{item.customerPhone}</span>
                      </div>
                      {item.note && (
                        <div className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20 mt-1">
                          💬 {item.note}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom Actions for Pending Status */}
                {isPending && (
                  <div className="pt-3 border-t border-border-base flex gap-2">
                    <button
                      onClick={() => setRejectTarget(item.raw)}
                      className="py-2 px-3 rounded-xl border border-red-500/40 text-red-400 font-medium hover:bg-red-500/10 transition-colors text-xs flex-1 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      {item.method === 'cash' ? '❌ Hủy' : '❌ Từ chối'}
                    </button>
                    <button
                      onClick={() => setConfirmTarget(item.raw)}
                      className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black font-semibold hover:brightness-110 transition-all text-xs flex-[1.5] flex items-center justify-center gap-1 shadow-[0_4px_12px_rgba(232,184,75,0.2)] cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.method === 'cash' ? '✅ Đã thu tiền' : '✅ Đã nhận tiền'}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Confirm Dialog */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-bg-card border border-[rgba(232,184,75,0.4)] rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-text-primary flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Xác Nhận Đã Nhận Tiền
            </h3>
            <p className="text-xs text-text-secondary">
              Vui lòng kiểm tra kỹ tài khoản ngân hàng trước khi bấm duyệt giao dịch này.
            </p>

            <div className="bg-bg-input p-3 rounded-xl border border-border-base space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-text-secondary">Số tiền:</span>
                <span className="font-bold text-[#E8B84B]">
                  {('finalAmount' in confirmTarget ? confirmTarget.finalAmount : confirmTarget.amount).toLocaleString('vi-VN')}đ
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Người gửi:</span>
                <span className="text-text-primary font-medium">
                  {'receiverName' in confirmTarget ? confirmTarget.receiverName : confirmTarget.userName}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-2.5 rounded-xl border border-border-base bg-bg-input text-text-secondary font-medium hover:text-text-primary transition-colors text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleConfirmAction}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] text-black font-semibold hover:brightness-110 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Xác nhận đã nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Reject Dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-bg-card border border-red-500/40 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <h3 className="text-lg font-serif font-bold text-red-400 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-400" />
              Từ Chối Giao Dịch
            </h3>
            <p className="text-xs text-text-secondary">
              Nhập lý do không nhận được tiền để thông báo lại cho khách hàng.
            </p>

            <textarea
              rows={3}
              placeholder="Nhập lý do từ chối (ví dụ: Không thấy tiền trong biến động số dư, sai nội dung)..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-bg-input border border-border-base focus:border-red-500 text-text-primary placeholder-text-muted text-xs rounded-xl p-3 outline-none resize-none"
            />

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setRejectTarget(null);
                  setRejectReason('');
                }}
                className="flex-1 py-2.5 rounded-xl border border-border-base bg-bg-input text-text-secondary font-medium hover:text-text-primary transition-colors text-xs"
              >
                Hủy
              </button>
              <button
                onClick={handleRejectAction}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition-all text-xs flex items-center justify-center gap-1.5"
              >
                <XCircle className="w-4 h-4" />
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
