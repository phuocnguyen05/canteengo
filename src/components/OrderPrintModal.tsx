import React from 'react';
import { Printer, X, CheckCircle2, Clock, MapPin, Phone, User as UserIcon, Tag } from 'lucide-react';
import { Order } from '../types';
import { formatOrderDisplayDateTime, normalizeTimeString24h } from '../utils/orderTimeHelper';

interface OrderPrintModalProps {
  order: Order | null;
  onClose: () => void;
}

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({ order, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDateTime = () => {
    return formatOrderDisplayDateTime(order.createdAt, order.orderDate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-none">
        
        {/* Modal Header - Hidden when printing */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-orange-500 text-white flex items-center justify-center shadow-xs">
              <Printer className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black tracking-wide">In Hóa Đơn & Phiếu Bếp</h2>
              <p className="text-[11px] text-slate-300">Khổ giấy in nhiệt quầy chuẩn K80 / K57 hoặc A5/A4</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-orange-500/30 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In ngay</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-5 sm:p-6 overflow-y-auto print:p-0 print:overflow-visible bg-slate-50 print:bg-white flex-1 flex justify-center">
          
          {/* Receipt Paper Card */}
          <div 
            id="order-receipt-print"
            className="w-full max-w-[380px] bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm print:shadow-none print:border-none print:p-2 text-slate-900 font-sans text-xs print:w-[78mm] print:max-w-[78mm]"
          >
            {/* Header / Brand */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <div className="text-base font-black uppercase tracking-wider text-slate-950">
                CĂNG TIN TRƯỜNG HỌC & CÔNG SỞ
              </div>
              <div className="text-[11px] text-slate-500">
                Quầy phục vụ ẩm thực tươi ngon mỗi ngày
              </div>
              <div className="text-[10px] text-slate-400">
                Hotline hỗ trợ: 0987.654.321
              </div>
              <div className="pt-2">
                <div className="inline-block bg-slate-100 text-slate-800 border border-slate-300 px-3 py-1 rounded-md text-xs font-black uppercase tracking-widest">
                  PHIẾU GỌI MÓN & HÓA ĐƠN
                </div>
              </div>
            </div>

            {/* Order Meta */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between items-center font-bold">
                <span className="text-slate-600">Mã đơn hàng:</span>
                <span className="font-mono text-sm font-black text-orange-600 print:text-black">
                  #{order.orderCode}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Thời gian đặt:</span>
                <span className="font-semibold text-slate-800">{formattedDateTime()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Giờ hẹn nhận món:</span>
                <span className="font-black text-slate-900 bg-amber-50 print:bg-transparent px-1.5 py-0.5 rounded border border-amber-200 print:border-none">
                  {normalizeTimeString24h(order.pickupTime)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 items-center">
                <span>Thời gian hoàn thành món:</span>
                <span className="font-bold text-slate-900 bg-emerald-50 print:bg-transparent px-1.5 py-0.5 rounded border border-emerald-200 print:border-none text-emerald-800 print:text-black">
                  {order.status === 'READY' || order.status === 'DELIVERED'
                    ? normalizeTimeString24h(order.completedAt || order.pickupTime)
                    : `${normalizeTimeString24h(order.estimatedCompletionTime || order.pickupTime)} (Dự kiến)`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Khách hàng:</span>
                <span className="font-bold text-slate-900">{order.receiverName}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Số điện thoại:</span>
                <span className="font-semibold text-slate-800">{order.phone}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Nơi nhận món:</span>
                <span className="font-bold text-slate-900">{order.pickupArea}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Trạng thái:</span>
                <span className="font-bold text-slate-800">
                  {order.status === 'PENDING' ? 'Chờ duyệt' :
                   order.status === 'PROCESSING' ? 'Đang chuẩn bị nấu' :
                   order.status === 'READY' ? 'Đã ra khay (Sẵn sàng)' :
                   order.status === 'DELIVERED' ? 'Đã giao thành công' : 'Đã hủy'}
                </span>
              </div>
            </div>

            {/* Item Table */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-2">
              <div className="flex justify-between text-[11px] font-bold text-slate-700 uppercase tracking-wider pb-1 border-b border-slate-200">
                <span className="w-1/2">Món ăn / Yêu cầu</span>
                <span className="w-1/6 text-center">SL</span>
                <span className="w-1/3 text-right">T.Tiền</span>
              </div>

              <div className="space-y-2 pt-1">
                {order.items.map((item, idx) => (
                  <div key={idx} className="text-[11px] space-y-0.5">
                    <div className="flex justify-between items-start font-bold text-slate-900">
                      <span className="w-1/2 leading-tight">
                        {idx + 1}. {item.itemName}
                      </span>
                      <span className="w-1/6 text-center font-black">
                        x{item.quantity}
                      </span>
                      <span className="w-1/3 text-right">
                        {(item.unitPrice * item.quantity).toLocaleString('vi-VN')}đ
                      </span>
                    </div>

                    {/* Combo items detail */}
                    {item.isCombo && item.comboDetails && item.comboDetails.length > 0 && (
                      <div className="text-[10px] text-slate-600 pl-3 space-y-0.5">
                        {item.comboDetails.map((cd, cidx) => (
                          <div key={cidx} className="italic">• {cd}</div>
                        ))}
                      </div>
                    )}

                    {/* Note if any */}
                    {item.note && (
                      <div className="text-[10px] text-amber-800 print:text-black font-semibold pl-3">
                        ⚠️ Ghi chú: {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Calculations */}
            <div className="py-3 border-b border-dashed border-slate-300 space-y-1.5 text-[11px]">
              <div className="flex justify-between text-slate-600">
                <span>Tạm tính ({order.items.reduce((s, i) => s + i.quantity, 0)} phần):</span>
                <span className="font-semibold text-slate-800">{order.totalAmount.toLocaleString('vi-VN')}₫</span>
              </div>

              {order.discountAmount && order.discountAmount > 0 ? (
                <div className="flex justify-between text-emerald-600 print:text-black font-semibold">
                  <span>Giảm giá {order.voucherCode ? `(${order.voucherCode})` : ''}:</span>
                  <span>-{order.discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              ) : null}

              <div className="flex justify-between items-baseline pt-1.5 border-t border-slate-200">
                <span className="text-xs font-black uppercase text-slate-900">TỔNG THANH TOÁN:</span>
                <span className="text-base font-black text-orange-600 print:text-black">
                  {order.finalAmount.toLocaleString('vi-VN')}₫
                </span>
              </div>

              <div className="flex justify-between text-slate-600 pt-1 text-[10px]">
                <span>Hình thức:</span>
                <span className="font-bold text-slate-800">
                  {order.paymentMethod === 'COD' 
                    ? 'Tiền mặt tại quầy (COD)' 
                    : order.paymentMethod === 'WALLET'
                    ? 'Ví số dư Canteen'
                    : 'Chuyển khoản QR (Đã thanh toán)'}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 text-[10px]">
                <span>Thanh toán:</span>
                <span className="font-bold text-slate-800">
                  {order.paymentStatus === 'PAID' ? '✅ ĐÃ THANH TOÁN' : '⏳ THU TIỀN TẠI QUẦY'}
                </span>
              </div>
            </div>

            {/* Footer Notes & Barcode */}
            <div className="pt-3 text-center space-y-1.5 text-[10px] text-slate-500">
              <div className="font-bold text-slate-700">
                Chúc Quý khách bữa ăn ngon miệng!
              </div>
              <div className="text-[9px] text-slate-400">
                Vui lòng mang phiếu này hoặc xuất trình mã đơn khi nhận món tại quầy.
              </div>
              
              {/* Simulated barcode for counter POS scanning */}
              <div className="pt-2 flex flex-col items-center justify-center">
                <div className="h-7 w-48 bg-repeating-linear-gradient flex items-center justify-center border-y border-slate-400 tracking-[6px] font-mono text-[9px] text-slate-800 font-bold select-none">
                  ||||||||||||||||||||||||||||||||||||||
                </div>
                <div className="text-[9px] font-mono font-bold text-slate-600 mt-0.5 tracking-wider">
                  *{order.orderCode}*
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Actions Footer - Hidden when printing */}
        <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-end gap-2.5 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2 rounded-xl bg-[#E8B84B] hover:bg-[#F4C95D] text-black text-xs font-extrabold flex items-center gap-2 shadow-md shadow-[#E8B84B]/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In hóa đơn giấy ngay</span>
          </button>
        </div>

      </div>
    </div>
  );
};
