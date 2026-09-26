import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  Clock, 
  MapPin, 
  User as UserIcon, 
  Phone, 
  QrCode, 
  Banknote, 
  CheckCircle2, 
  Tag,
  ArrowRight,
  Flame,
  Layers,
  Sparkles,
  Wallet,
  AlertCircle,
  Calendar,
  Zap
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, MenuItem, Order, User, Voucher, PaymentMethod, CanteenStatusConfig, OrderPayment } from '../types';
import { PICKUP_AREAS } from '../data/initialData';
import { validateVoucher, getVoucherStatusBadge } from '../utils/voucherHelper';
import { generateOrderQR } from '../services/qrPaymentService';
import {
  validatePickupTime,
  getEarliestPickupOption,
  isWithinOperatingHours,
  getOperatingIntervals,
  formatTime24h,
  normalizeTimeString24h
} from '../utils/orderTimeHelper';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  menuItems?: MenuItem[];
  showToast?: (message: string, type?: 'success' | 'info' | 'error') => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  currentUser: User | null;
  vouchers: Voucher[];
  statusConfig?: CanteenStatusConfig;
  onCreateOrder: (newOrder: Order) => void;
  onOpenWallet?: () => void;
  onRequestLogin?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  menuItems = [],
  showToast,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  currentUser,
  vouchers,
  statusConfig,
  onCreateOrder,
  onOpenWallet,
  onRequestLogin,
}) => {
  const [step, setStep] = useState<'CART' | 'CHECKOUT' | 'SUCCESS'>('CART');
  const [autoCloseCountdown, setAutoCloseCountdown] = useState<number>(5);

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  // Auto-close order success screen after 5s if user doesn't click continue
  useEffect(() => {
    if (!isOpen || step !== 'SUCCESS') {
      setAutoCloseCountdown(5);
      return;
    }

    setAutoCloseCountdown(5);

    const countdownInterval = setInterval(() => {
      setAutoCloseCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    const autoCloseTimeout = setTimeout(() => {
      setStep('CART');
      onCloseRef.current();
    }, 5000);

    return () => {
      clearInterval(countdownInterval);
      clearTimeout(autoCloseTimeout);
    };
  }, [isOpen, step]);
  const [receiverName, setReceiverName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [pickupArea, setPickupArea] = useState(currentUser?.area || PICKUP_AREAS[0]);
  const [customStreet, setCustomStreet] = useState('');
  const [customWard, setCustomWard] = useState('');
  const [customDistrict, setCustomDistrict] = useState('');
  const [customCity, setCustomCity] = useState('Hà Nội');
  const earliestOption = getEarliestPickupOption();
  const [pickupDayOption, setPickupDayOption] = useState<'TODAY' | 'TOMORROW'>(earliestOption.dayOption);
  const [pickupHour, setPickupHour] = useState(earliestOption.hour);
  const [pickupMinute, setPickupMinute] = useState(earliestOption.minute);
  
  const pickupTimeFormatted = `${(pickupHour || '00').padStart(2, '0')}:${(pickupMinute || '00').padStart(2, '0')}`;
  const dayLabel = pickupDayOption === 'TOMORROW' ? 'Ngày mai' : 'Hôm nay';
  const pickupTime = `${dayLabel} ${pickupTimeFormatted}`;

  const timeValidation = validatePickupTime(
    pickupDayOption,
    pickupHour,
    pickupMinute,
    statusConfig
  );
  const operatingIntervals = getOperatingIntervals(statusConfig);
  const nowOperating = isWithinOperatingHours(new Date(), statusConfig);
  // If admin has "Đang mở cửa phục vụ" turned on (isOpen === true), the store is considered open
  const isCurrentlyClosed = statusConfig?.isOpen === true ? false : !nowOperating.isOpen || (statusConfig && statusConfig.isOpen === false);

  const handleSetEarliestTime = () => {
    const earliest = getEarliestPickupOption();
    setPickupDayOption(earliest.dayOption);
    setPickupHour(earliest.hour);
    setPickupMinute(earliest.minute);
  };

  const COUNTER_LOCATIONS = ['Quầy Canteen 1', 'Quầy Canteen 2'];
  const DELIVERY_LOCATIONS = [
    'Tòa nhà Văn phòng - Tầng 2',
    'Tòa nhà A - Phòng 402',
    'Khu tự học Căn-tin B',
    'Sảnh chính Tòa nhà B',
    'Khác (Nhập địa chỉ giao hàng)'
  ];

  const [orderType, setOrderType] = useState<'at-counter' | 'eat-in' | 'take-away' | 'delivery'>('at-counter');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');
  const [walletError, setWalletError] = useState<string>('');
  const [checkoutTxId, setCheckoutTxId] = useState<string>('');

  const isPickupAtCounter =
    orderType === 'at-counter' ||
    orderType === 'eat-in' ||
    orderType === 'take-away' ||
    (orderType !== 'delivery' &&
      pickupArea !== 'Khác' &&
      !pickupArea.startsWith('Khác') &&
      !pickupArea.toLowerCase().includes('giao tận nơi'));

  useEffect(() => {
    if (step === 'CHECKOUT' && !checkoutTxId) {
      const orderNum = Math.floor(1000 + Math.random() * 9000);
      const ts = Math.floor(Date.now() / 1000);
      setCheckoutTxId(`DH${orderNum}-${ts}`);
    } else if (step === 'CART') {
      setCheckoutTxId('');
    }
  }, [step, checkoutTxId]);

  useEffect(() => {
    if (isPickupAtCounter) {
      if (!COUNTER_LOCATIONS.includes(pickupArea)) {
        setPickupArea(COUNTER_LOCATIONS[0]);
      }
    } else {
      if (COUNTER_LOCATIONS.includes(pickupArea)) {
        setPickupArea(DELIVERY_LOCATIONS[0]);
      }
    }
  }, [isPickupAtCounter]);

  const paymentOptions = isPickupAtCounter
    ? ['cash', 'qr', 'wallet']
    : ['qr', 'wallet'];

  useEffect(() => {
    if (!isPickupAtCounter && (paymentMethod === 'COD' || (paymentMethod as string) === 'cash')) {
      setPaymentMethod('TRANSFER');
    }
  }, [isPickupAtCounter, paymentMethod]);

  const handleHourChange = (val: string) => {
    if (val === '') {
      setPickupHour('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num >= 0 && num <= 23) {
        setPickupHour(val);
      } else if (num > 23) {
        setPickupHour('23');
      }
    }
  };

  const handleHourBlur = () => {
    if (pickupHour === '' || isNaN(parseInt(pickupHour, 10))) {
      setPickupHour(earliestOption.hour);
    } else {
      const num = Math.min(23, Math.max(0, parseInt(pickupHour, 10)));
      setPickupHour(String(num).padStart(2, '0'));
    }
  };

  const handleMinuteChange = (val: string) => {
    if (val === '') {
      setPickupMinute('');
      return;
    }
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num >= 0 && num <= 59) {
        setPickupMinute(val);
      } else if (num > 59) {
        setPickupMinute('59');
      }
    }
  };

  const handleMinuteBlur = () => {
    if (pickupMinute === '' || isNaN(parseInt(pickupMinute, 10))) {
      setPickupMinute('00');
    } else {
      const num = Math.min(59, Math.max(0, parseInt(pickupMinute, 10)));
      setPickupMinute(String(num).padStart(2, '0'));
    }
  };
  
  // Voucher state (US20)
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState('');
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);

  // Sync user profile if current user changes
  React.useEffect(() => {
    if (currentUser) {
      if (!receiverName) setReceiverName(currentUser.fullName);
      if (!phone) setPhone(currentUser.phone);
      if (!pickupArea && currentUser.area) setPickupArea(currentUser.area);
    }
  }, [currentUser]);

  // Calculate subtotal & calories
  const subtotal = cartItems.reduce((acc, item) => acc + item.totalPrice * item.quantity, 0);
  const totalCalories = cartItems.reduce((acc, item) => acc + item.totalCalories * item.quantity, 0);

  // Calculate discount from voucher
  let discountAmount = 0;
  if (appliedVoucher) {
    discountAmount = Math.round((subtotal * appliedVoucher.discountPct) / 100);
  }
  const finalAmount = Math.max(0, subtotal - discountAmount);

  const handleApplyVoucher = (codeOverride?: string) => {
    setVoucherError('');
    const targetCode = (codeOverride || voucherCodeInput).trim().toUpperCase();
    if (!targetCode) return;

    if (codeOverride) {
      setVoucherCodeInput(codeOverride);
    }

    const found = vouchers.find(v => v.code.toUpperCase() === targetCode);
    if (!found) {
      setVoucherError('Voucher không khả dụng: Mã giảm giá không tồn tại trong hệ thống.');
      return;
    }

    // Comprehensive time, date & minimum order validation
    const check = validateVoucher(found, subtotal, new Date());
    if (!check.isValid) {
      setVoucherError(check.error || 'Voucher không khả dụng vào thời điểm hiện tại.');
      setAppliedVoucher(null);
      return;
    }

    setAppliedVoucher(found);
    setVoucherError('');
  };

  const handlePlaceOrder = () => {
    setWalletError('');

    if (!currentUser) {
      if (onRequestLogin) onRequestLogin();
      return;
    }

    if (!receiverName.trim() || !phone.trim()) {
      alert('Vui lòng nhập tên người nhận và số điện thoại liên hệ.');
      return;
    }

    // Validate pickup time & store closure
    if (!timeValidation.isValid) {
      if (timeValidation.isClosed) {
        alert('Quán hiện đang tạm nghỉ. Vui lòng chọn khung giờ khác trong ca mở cửa của quán.');
      } else {
        alert(timeValidation.error || 'Thời gian nhận món chưa hợp lệ.');
      }
      return;
    }

    let finalPickupArea = pickupArea;
    if (pickupArea === 'Khác' || pickupArea.startsWith('Khác')) {
      if (!customStreet.trim()) {
        alert('Vui lòng ghi rõ địa chỉ (Số nhà, ngõ/đường).');
        return;
      }
      const parts = [customStreet.trim(), customWard.trim(), customDistrict.trim(), customCity.trim()].filter(Boolean);
      finalPickupArea = `Giao tận nơi: ${parts.join(', ')}`;
    }

    // Check stock limits for all items (Flash Sale and regular menu items)
    for (const ci of cartItems) {
      if (ci.isFlashSale && ci.menuItem) {
        const matched = menuItems.find(m => m.id === ci.menuItem?.id);
        const totalQty = matched?.flashSaleTotalQty ?? 20;
        const soldCount = matched?.flashSaleSoldCount ?? 0;
        const remaining = Math.max(0, totalQty - soldCount);
        if (ci.quantity > remaining) {
          if (showToast) {
            showToast('Số lượng món giảm giá không đủ', 'error');
          } else {
            alert('Số lượng món giảm giá không đủ');
          }
          return;
        }
      } else if (!ci.isCombo && ci.menuItem) {
        const matched = menuItems.find(m => m.id === ci.menuItem?.id) || ci.menuItem;
        if (ci.quantity > matched.stock) {
          if (showToast) {
            showToast('Món ăn đã hết', 'error');
          } else {
            alert('Món ăn đã hết');
          }
          return;
        }
      }
    }

    // Check payment method & balance
    const isWallet = paymentMethod === 'WALLET' || (paymentMethod as string) === 'wallet';
    const isQR = paymentMethod === 'TRANSFER' || (paymentMethod as string) === 'qr';

    if (isWallet) {
      const userBalance = currentUser?.walletBalance ?? currentUser?.wallet ?? 0;
      if (userBalance < finalAmount) {
        const errorText = `Số dư ví không đủ (${userBalance.toLocaleString('vi-VN')}đ). Vui lòng nạp thêm hoặc chọn QR.`;
        setWalletError(errorText);
        if (showToast) {
          showToast(`❌ ${errorText}`);
        }
        return;
      }
    }

    const orderId = Math.floor(1000 + Math.random() * 9000);
    const orderCode = `CTG-${Math.floor(1000 + Math.random() * 9000)}`;

    let orderPaymentObj: OrderPayment;
    let initialPaymentStatus: 'PENDING' | 'PAID' = 'PENDING';

    if (isWallet) {
      initialPaymentStatus = 'PAID';
      orderPaymentObj = {
        method: 'wallet',
        status: 'paid',
        paidAt: Date.now()
      };
    } else if (isQR) {
      initialPaymentStatus = 'PENDING';
      const txIdToUse = checkoutTxId || `DH${orderId}-${Math.floor(Date.now() / 1000)}`;
      const qrUrl = `https://img.vietqr.io/image/MB-0110151552005-compact2.png?amount=${Math.round(finalAmount)}&addInfo=${encodeURIComponent(txIdToUse)}&accountName=NGUYEN%20HUU%20PHUOC`;
      orderPaymentObj = {
        method: 'qr',
        status: 'pending_confirm',
        transactionId: txIdToUse,
        qrContent: qrUrl,
        qrExpiresAt: Date.now() + 5 * 60 * 1000
      };
    } else {
      initialPaymentStatus = 'PENDING';
      orderPaymentObj = {
        method: 'cash',
        status: 'pending_confirm'
      };
    }

    const newOrder: Order = {
      id: orderId,
      orderCode,
      userId: currentUser?.id,
      receiverName: receiverName.trim(),
      phone: phone.trim(),
      pickupArea: finalPickupArea,
      pickupTime: normalizeTimeString24h(pickupTime),
      status: 'PENDING',
      totalAmount: subtotal,
      discountAmount,
      finalAmount,
      voucherCode: appliedVoucher?.code,
      paymentMethod: isWallet ? 'WALLET' : isQR ? 'TRANSFER' : 'COD',
      paymentStatus: initialPaymentStatus,
      payment: orderPaymentObj,
      createdAt: formatTime24h(new Date(), true),
      orderDate: new Date().toISOString().split('T')[0],
      estimatedCompletionTime: normalizeTimeString24h(pickupTime),
      type: isPickupAtCounter ? 'at-counter' : 'delivery',
      orderType: isPickupAtCounter ? 'at-counter' : 'delivery',
      deliveryMethod: isPickupAtCounter ? 'at-counter' : 'delivery',
      items: cartItems.map((ci, idx) => ({
        id: idx + 1,
        orderId,
        itemId: ci.menuItem?.id,
        itemName: ci.isCombo ? ci.comboName || 'Combo Tùy Chỉnh' : ci.menuItem?.name || '',
        quantity: ci.quantity,
        unitPrice: ci.totalPrice,
        note: ci.note,
        isCombo: ci.isCombo,
        isFlashSale: ci.isFlashSale,
        comboDetails: ci.comboItems?.map(i => i.name),
        comboItemIds: ci.comboItems?.map(i => i.id),
      }))
    };

    onCreateOrder(newOrder);
    setCreatedOrder(newOrder);
    setStep('SUCCESS');
    onClearCart();

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  if (!isOpen) return null;

  const isModalLayout = step === 'CHECKOUT' || step === 'SUCCESS';

  return (
    <div 
      className={`fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex ${
        isModalLayout ? 'items-center justify-center p-3 sm:p-6' : 'justify-end overflow-hidden'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          if (step === 'SUCCESS') setStep('CART');
          onClose();
        }
      }}
    >
      <div className={`${
        isModalLayout 
          ? 'w-full max-w-[560px] bg-bg-card text-text-primary rounded-[20px] border border-[#E8B84B]/20 shadow-[0_24px_64px_rgba(0,0,0,0.6)] flex flex-col my-auto max-h-[90vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300'
          : 'w-full max-w-md bg-bg-card text-text-primary h-full shadow-2xl flex flex-col border-l border-border-base animate-in slide-in-from-right duration-200'
      }`}>
        
        {/* Header Modal */}
        <div className="p-4 border-b border-border-base flex items-center justify-between bg-bg-primary">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8B84B] text-black flex items-center justify-center font-extrabold text-lg shadow-md shadow-[#E8B84B]/20 shrink-0">
              <ShoppingBag className="w-5 h-5 text-black fill-black" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-text-primary font-serif tracking-wide">
                {step === 'CART' ? 'Giỏ hàng của bạn' : step === 'CHECKOUT' ? 'Xác nhận đặt món' : 'Đặt món thành công'}
              </h2>
              <p className="text-xs text-text-secondary">
                {step === 'CART' ? `${cartItems.length} sản phẩm đã chọn` : step === 'CHECKOUT' ? 'Điền thông tin nhận món tại Canteen' : 'Mã đơn sẵn sàng tại quầy'}
              </p>
            </div>
          </div>
          
          <button
            onClick={() => {
              if (step === 'SUCCESS') setStep('CART');
              onClose();
            }}
            className="w-8 h-8 rounded-xl text-text-secondary hover:text-text-primary hover:bg-bg-elevated bg-transparent flex items-center justify-center transition-colors cursor-pointer border border-border-base"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Canteen Closed Notification Banner */}
          {isCurrentlyClosed && step !== 'SUCCESS' && (
            <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-black text-rose-100 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>Quán hiện đang tạm nghỉ</span>
              </div>
              <p className="text-[11px] text-rose-300 leading-relaxed pl-6">
                {statusConfig?.closedNote || 'Căng tin hiện tạm nghỉ phục vụ để dọn dẹp và chuẩn bị nguyên liệu tươi ngon.'}
              </p>
              {operatingIntervals.length > 0 && (
                <div className="pl-6 flex flex-wrap gap-1.5 text-[10px] items-center pt-0.5">
                  <span className="font-bold text-rose-200">Giờ mở cửa phục vụ:</span>
                  {operatingIntervals.map((shift, idx) => (
                    <span key={idx} className="bg-rose-900/60 border border-rose-700 text-rose-200 px-2 py-0.5 rounded-md font-semibold">
                      {shift.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* STEP 1: CART LIST (US17) */}
          {step === 'CART' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-bg-input border border-border-base flex items-center justify-center mx-auto mb-3 text-[#E8B84B]">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-text-primary text-sm">Giỏ hàng đang trống</h3>
                  <p className="text-xs text-text-secondary mt-1 max-w-xs mx-auto">
                    Hãy chọn các món ngon trên thực đơn hoặc tự tạo combo 4 món để tiếp tục nhé!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const matchedItem = !item.isCombo ? menuItems.find(m => m.id === item.menuItem?.id) : null;
                    const totalFlash = matchedItem?.flashSaleTotalQty ?? 20;
                    const soldFlash = matchedItem?.flashSaleSoldCount ?? 0;
                    const remainingFlash = Math.max(0, totalFlash - soldFlash);
                    const isMaxFlashSale = Boolean(item.isFlashSale && item.quantity >= remainingFlash);
                    const isMaxStock = Boolean(!item.isFlashSale && !item.isCombo && matchedItem && item.quantity >= matchedItem.stock);

                    return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl border border-border-base bg-bg-card hover:border-[#E8B84B]/40 transition-colors shadow-2xs space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2.5">
                          {item.isCombo ? (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#E8B84B] to-amber-600 flex items-center justify-center text-black font-bold flex-shrink-0">
                              <Layers className="w-6 h-6 text-black" />
                            </div>
                          ) : (
                            <img
                              src={item.menuItem?.imageUrl}
                              alt={item.menuItem?.name}
                              referrerPolicy="no-referrer"
                              className="w-12 h-12 rounded-xl object-cover bg-bg-input border border-border-base flex-shrink-0"
                            />
                          )}

                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <h4 className="font-bold text-xs text-text-primary line-clamp-1">
                                {item.isCombo ? item.comboName : item.menuItem?.name}
                              </h4>
                              {item.isCombo && (
                                <span className="text-[9px] bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/30 font-extrabold px-1.5 py-0.5 rounded">
                                  Combo -10%
                                </span>
                              )}
                              {item.isFlashSale && (
                                <span className="text-[9px] bg-rose-950/80 text-rose-300 border border-rose-800 font-extrabold px-1.5 py-0.5 rounded">
                                  ⚡ Flash Sale (còn {remainingFlash} suất)
                                </span>
                              )}
                              {!item.isCombo && !item.isFlashSale && matchedItem && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                  matchedItem.stock <= 0 
                                    ? 'bg-rose-950/80 text-rose-300 border border-rose-800' 
                                    : 'bg-bg-input text-text-secondary border border-border-base'
                                }`}>
                                  {matchedItem.stock <= 0 ? 'Món ăn đã hết' : `Còn ${matchedItem.stock} món`}
                                </span>
                              )}
                            </div>

                            {/* Sub-items in combo */}
                            {item.isCombo && item.comboItems && (
                              <ul className="text-[10px] text-text-secondary mt-1 space-y-0.5 list-disc list-inside">
                                {item.comboItems.map((ci, idx) => (
                                  <li key={idx} className="truncate">{ci.name}</li>
                                ))}
                              </ul>
                            )}

                            <div className="flex items-center gap-2 mt-1 text-[11px] text-text-secondary">
                              <span className="font-extrabold text-[#E8B84B]">
                                {item.totalPrice.toLocaleString()}₫
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5">
                                <Flame className="w-3 h-3 text-[#E8B84B]" />
                                {item.totalCalories} kcal
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Remove button */}
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-text-secondary hover:text-rose-400 p-1.5 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer"
                          title="Xóa món này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center justify-between pt-2 border-t border-border-base">
                        <span className="text-[11px] text-text-secondary">Số lượng</span>
                        <div className="flex items-center gap-2 bg-bg-input rounded-xl p-1 border border-border-base">
                          <button
                            onClick={() => onUpdateQuantity(item.id, -1)}
                            className="w-6 h-6 rounded-lg bg-bg-elevated text-text-primary hover:bg-bg-hover flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-text-primary w-6 text-center font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => {
                              if (isMaxFlashSale) {
                                if (showToast) {
                                  showToast('Số lượng món giảm giá không đủ', 'error');
                                } else {
                                  alert('Số lượng món giảm giá không đủ');
                                }
                                return;
                              }
                              if (isMaxStock) {
                                if (showToast) {
                                  showToast('Món ăn đã hết', 'error');
                                } else {
                                  alert('Món ăn đã hết');
                                }
                                return;
                              }
                              onUpdateQuantity(item.id, 1);
                            }}
                            className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                              (isMaxFlashSale || isMaxStock)
                                ? 'bg-bg-elevated text-slate-500 cursor-not-allowed'
                                : 'bg-[#E8B84B] text-black hover:bg-[#F4C95D] cursor-pointer'
                            }`}
                            title={isMaxFlashSale ? 'Số lượng món giảm giá không đủ' : isMaxStock ? 'Món ăn đã hết' : 'Tăng số lượng'}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                    </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* STEP 2: CHECKOUT FORM (US18, US19, US20) */}
          {step === 'CHECKOUT' && (
            <div className="space-y-4">
              
              {/* Receiver Info Section */}
              <div className="p-5 rounded-[16px] border border-border-base bg-bg-card space-y-3.5">
                <div className="text-xs font-bold text-text-primary flex items-center gap-2 uppercase tracking-wider">
                  <UserIcon className="w-4 h-4 text-[#E8B84B]" />
                  <span>Thông tin người nhận món</span>
                </div>

                <div>
                  <label className="text-[#E8B84B]/90 font-bold text-xs block mb-1.5">
                    Họ và tên <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={receiverName}
                    onChange={(e) => setReceiverName(e.target.value)}
                    placeholder="Nhập họ và tên người nhận..."
                    className="w-full text-xs px-3.5 py-2.5 rounded-[12px] border border-border-base bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:border-2 focus:ring-2 focus:ring-[#E8B84B]/20 transition-all duration-200 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[#E8B84B]/90 font-bold text-xs block mb-1.5">
                    Số điện thoại nhận tin / gọi lấy món <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#E8B84B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="VD: 0901234567..."
                      className="w-full text-xs pl-10 pr-3.5 py-2.5 rounded-[12px] border border-border-base bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:border-2 focus:ring-2 focus:ring-[#E8B84B]/20 transition-all duration-200 font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Area & Time Section */}
              <div className="p-5 rounded-[16px] border border-border-base bg-bg-card space-y-3.5">
                <div className="text-xs font-bold text-text-primary flex items-center gap-2 uppercase tracking-wider">
                  <MapPin className="w-4 h-4 text-[#E8B84B]" />
                  <span>Địa điểm & Khung giờ nhận món</span>
                </div>

                {/* Loai don hang selector */}
                <div>
                  <label className="text-[#E8B84B]/90 font-bold text-xs block mb-1.5">
                    Hình thức nhận món <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2 bg-bg-input p-1 rounded-xl border border-border-base mb-3">
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType('at-counter');
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isPickupAtCounter
                          ? 'bg-[#E8B84B] text-black font-extrabold shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>🏬 Lấy tại quầy</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setOrderType('delivery');
                        if (paymentMethod === 'COD' || (paymentMethod as string) === 'cash') {
                          setPaymentMethod('TRANSFER');
                        }
                      }}
                      className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        !isPickupAtCounter
                          ? 'bg-[#E8B84B] text-black font-extrabold shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span>🛵 Giao tận nơi</span>
                    </button>
                  </div>

                  <label className="text-[#E8B84B]/90 font-bold text-xs block mb-1.5">
                    Khu vực nhận món
                  </label>
                  <select
                    value={pickupArea}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPickupArea(val);
                      if (val === 'Khác' || val.startsWith('Khác')) {
                        setOrderType('delivery');
                        if (paymentMethod === 'COD' || (paymentMethod as string) === 'cash') {
                          setPaymentMethod('TRANSFER');
                        }
                      }
                    }}
                    className="w-full text-xs px-3.5 py-2.5 rounded-[12px] border border-border-base bg-bg-input text-text-primary focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 font-medium transition-all cursor-pointer"
                  >
                    {(isPickupAtCounter ? COUNTER_LOCATIONS : DELIVERY_LOCATIONS).map((area, idx) => (
                      <option key={idx} value={area} className="bg-bg-card text-text-primary">{area}</option>
                    ))}
                  </select>

                  {/* Khi chọn Khác -> Hiện 4 ô ghi/chọn địa chỉ */}
                  {!isPickupAtCounter && (pickupArea === 'Khác' || pickupArea.startsWith('Khác')) && (
                    <div className="mt-3 p-3.5 bg-bg-card rounded-[12px] border border-border-base space-y-3 animate-in fade-in duration-200">
                      <div className="text-xs font-bold text-[#E8B84B] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#E8B84B]" />
                        <span>Nhập chi tiết địa chỉ giao món tận nơi:</span>
                      </div>

                      {/* Ô 1: Địa chỉ */}
                      <div>
                        <label className="text-[#E8B84B]/90 font-bold text-[11px] block mb-1">
                          1. Địa chỉ <span className="text-text-secondary font-normal">(vd: Số 14 ngõ 50)</span> <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={customStreet}
                          onChange={(e) => setCustomStreet(e.target.value)}
                          placeholder="Số 14 ngõ 50..."
                          className="w-full text-xs px-3 py-2 rounded-[12px] border border-border-base bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 font-medium transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Ô 2: Phường / Xã */}
                        <div>
                          <label className="text-[#E8B84B]/90 font-bold text-[11px] block mb-1">
                            2. Phường / Xã <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customWard}
                            onChange={(e) => setCustomWard(e.target.value)}
                            placeholder="Phường Láng Hạ..."
                            className="w-full text-xs px-3 py-2 rounded-[12px] border border-border-base bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 font-medium transition-all"
                          />
                        </div>

                        {/* Ô 3: Quận / Huyện */}
                        <div>
                          <label className="text-[#E8B84B]/90 font-bold text-[11px] block mb-1">
                            3. Quận / Huyện <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customDistrict}
                            onChange={(e) => setCustomDistrict(e.target.value)}
                            placeholder="Quận Đống Đa..."
                            className="w-full text-xs px-3 py-2 rounded-[12px] border border-border-base bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 font-medium transition-all"
                          />
                        </div>

                        {/* Ô 4: Thành phố */}
                        <div>
                          <label className="text-[#E8B84B]/90 font-bold text-[11px] block mb-1">
                            4. Thành phố <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={customCity}
                            onChange={(e) => setCustomCity(e.target.value)}
                            placeholder="Hà Nội..."
                            className="w-full text-xs px-3 py-2 rounded-[12px] border border-border-base bg-bg-input text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-[#E8B84B] focus:ring-2 focus:ring-[#E8B84B]/20 font-medium transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {!isPickupAtCounter ? (
                    <div className="mt-2 text-[11px] text-text-secondary bg-bg-card border border-border-base p-2.5 rounded-[12px] flex items-center justify-between">
                      <span>📍 68 Nguyễn Chí Thanh, Hà Nội</span>
                      <a href="tel:098456789" className="font-bold text-[#E8B84B] hover:underline">
                        📞 Hotline: 098456789
                      </a>
                    </div>
                  ) : (
                    <div className="mt-2 text-[11px] text-text-secondary bg-bg-card border border-border-base p-2.5 rounded-[12px] flex items-center justify-between">
                      <span>🏬 Nhận khay ăn trực tiếp tại quầy</span>
                      <a href="tel:098456789" className="font-bold text-[#E8B84B] hover:underline">
                        📞 Hotline: 098456789
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-4 rounded-[14px] bg-bg-card border border-border-base space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#E8B84B]" />
                      <span>Khung giờ nhận món</span>
                    </label>
                    <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black font-mono shadow-2xs ${
                      timeValidation.isClosed
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800'
                        : !timeValidation.isValid
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        : 'bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40'
                    }`}>
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider">
                        {timeValidation.isClosed ? '🔴 Tạm nghỉ:' : !timeValidation.isValid ? '⚠️ Chờ sửa:' : 'Hẹn lấy:'}
                      </span>
                      <span>
                        {pickupDayOption === 'TOMORROW' ? 'Ngày mai ' : 'Hôm nay '}
                        {(pickupHour || '00').padStart(2, '0')}:{(pickupMinute || '00').padStart(2, '0')}
                      </span>
                    </div>
                  </div>

                  {/* Day Selection (Hôm nay / Ngày mai trong vòng 24h) */}
                  <div className="grid grid-cols-2 gap-2 bg-bg-input p-1 rounded-xl border border-border-base">
                    <button
                      type="button"
                      onClick={() => setPickupDayOption('TODAY')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        pickupDayOption === 'TODAY'
                          ? 'bg-[#E8B84B] text-black font-extrabold shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Hôm nay</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        ({new Date().toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPickupDayOption('TOMORROW')}
                      className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        pickupDayOption === 'TOMORROW'
                          ? 'bg-[#E8B84B] text-black font-extrabold shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Ngày mai</span>
                      <span className="text-[10px] opacity-80 font-mono">
                        ({new Date(Date.now() + 86400000).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })})
                      </span>
                    </button>
                  </div>

                  {/* 2 Inputs: Giờ & Phút */}
                  <div className="grid grid-cols-2 gap-3">
                    {/* Giờ */}
                    <div className="bg-bg-input p-2.5 rounded-[12px] border border-border-base focus-within:border-[#E8B84B] focus-within:ring-2 focus-within:ring-[#E8B84B]/20 transition-all shadow-2xs">
                      <label className="text-[11px] font-bold text-[#E8B84B] block mb-1">
                        Giờ
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={0}
                          max={23}
                          list="hour-options-list"
                          value={pickupHour}
                          onChange={(e) => handleHourChange(e.target.value)}
                          onBlur={handleHourBlur}
                          placeholder="11"
                          className="w-full text-base font-black text-text-primary bg-transparent pr-12 focus:outline-none placeholder:text-text-secondary"
                        />
                        <span className="absolute right-1 text-xs font-bold text-text-secondary select-none">
                          giờ
                        </span>
                      </div>
                      <datalist id="hour-options-list">
                        {Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')).map((h) => (
                          <option key={h} value={h} />
                        ))}
                      </datalist>
                    </div>

                    {/* Phút */}
                    <div className="bg-bg-input p-2.5 rounded-[12px] border border-border-base focus-within:border-[#E8B84B] focus-within:ring-2 focus-within:ring-[#E8B84B]/20 transition-all shadow-2xs">
                      <label className="text-[11px] font-bold text-[#E8B84B] block mb-1">
                        Phút
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type="number"
                          min={0}
                          max={59}
                          list="minute-options-list"
                          value={pickupMinute}
                          onChange={(e) => handleMinuteChange(e.target.value)}
                          onBlur={handleMinuteBlur}
                          placeholder="30"
                          className="w-full text-base font-black text-text-primary bg-transparent pr-12 focus:outline-none placeholder:text-text-secondary"
                        />
                        <span className="absolute right-1 text-xs font-bold text-text-secondary select-none">
                          phút
                        </span>
                      </div>
                      <datalist id="minute-options-list">
                        {['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'].map((m) => (
                          <option key={m} value={m} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* Quick Earliest Button */}
                  <div className="flex items-center justify-between pt-0.5">
                    <button
                      type="button"
                      onClick={handleSetEarliestTime}
                      className="text-[11px] font-bold text-[#E8B84B] hover:text-[#F4C95D] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Zap className="w-3.5 h-3.5 text-[#E8B84B] fill-[#E8B84B]" />
                      <span>Hẹn sớm nhất (+30p)</span>
                    </button>
                    <span className="text-[10px] text-text-secondary">
                      Bếp cần &gt; 29p chuẩn bị
                    </span>
                  </div>

                  {/* Validation Warnings / Status messages */}
                  {timeValidation.isClosed ? (
                    <div className="p-3 rounded-xl bg-rose-950/90 border border-rose-800 text-rose-200 text-xs space-y-1 max-w-full break-words whitespace-normal">
                      <div className="flex items-center gap-1.5 font-bold text-rose-100">
                        <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>Quán hiện đang tạm nghỉ</span>
                      </div>
                      <p className="text-[11px] text-rose-300 pl-5 leading-relaxed break-words whitespace-normal">
                        Khung giờ bạn chọn nằm ngoài giờ mở cửa của quán. Giờ mở cửa: {operatingIntervals.map(i => i.label).join(', ')}.
                      </p>
                    </div>
                  ) : !timeValidation.isValid && timeValidation.error ? (
                    <div className="p-3.5 rounded-xl bg-amber-950/90 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5 w-full max-w-full min-w-0 break-words whitespace-normal shadow-md box-border overflow-hidden">
                      <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <span className="text-[11px] font-semibold break-words whitespace-normal min-w-0 flex-1 leading-relaxed">{timeValidation.error}</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      <span>
                        Khung giờ hợp lệ (còn {timeValidation.diffMinutes} phút - trong vòng 24h)
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method Section (US19) */}
              <div className="p-5 rounded-[16px] border border-border-base bg-bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-text-primary uppercase tracking-wider">
                    Phương thức thanh toán
                  </span>
                  {(currentUser?.role === 'CUSTOMER' || currentUser?.role === 'GUEST' || currentUser?.role === 'TEACHER' || currentUser?.role === 'STUDENT') && (
                    <span className="text-[11px] text-[#E8B84B] font-semibold flex items-center gap-1">
                      <Wallet className="w-3.5 h-3.5" />
                      Ví C-Pay: {(currentUser.walletBalance || 0).toLocaleString()}đ
                    </span>
                  )}
                </div>

                <div className={`grid ${paymentOptions.length === 3 ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                  {/* Option 1: Cash (Tiền mặt) - Only for Pickup at Counter */}
                  {paymentOptions.includes('cash') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('COD');
                        setWalletError('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'COD' || (paymentMethod as string) === 'cash'
                          ? 'border-[#E8B84B] bg-[#E8B84B]/15 text-[#E8B84B] font-bold ring-2 ring-[#E8B84B]/20'
                          : 'border-border-base bg-bg-input hover:border-[#E8B84B]/40 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Banknote className="w-4 h-4 mb-1 text-[#E8B84B]" />
                      <div className="text-xs font-bold">💵 Tiền mặt</div>
                      <p className="text-[10px] text-text-secondary font-normal">Tại quầy nhận</p>
                    </button>
                  )}

                  {/* Option 2: VietQR */}
                  {paymentOptions.includes('qr') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('TRANSFER');
                        setWalletError('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'TRANSFER' || (paymentMethod as string) === 'qr'
                          ? 'border-[#E8B84B] bg-[#E8B84B]/15 text-[#E8B84B] font-bold ring-2 ring-[#E8B84B]/20'
                          : 'border-border-base bg-bg-input hover:border-[#E8B84B]/40 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <QrCode className="w-4 h-4 mb-1 text-[#E8B84B]" />
                      <div className="text-xs font-bold">📱 QR</div>
                      <p className="text-[10px] text-text-secondary font-normal">Chuyển khoản</p>
                    </button>
                  )}

                  {/* Option 3: Ví C-Pay */}
                  {paymentOptions.includes('wallet') && (
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('WALLET');
                        setWalletError('');
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        paymentMethod === 'WALLET' || (paymentMethod as string) === 'wallet'
                          ? 'border-[#E8B84B] bg-[#E8B84B]/15 text-[#E8B84B] font-bold ring-2 ring-[#E8B84B]/20'
                          : 'border-border-base bg-bg-input hover:border-[#E8B84B]/40 text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <Wallet className="w-4 h-4 mb-1 text-[#E8B84B]" />
                      <div className="text-xs font-bold">💰 Ví C-Pay</div>
                      <p className="text-[10px] text-emerald-400 font-medium">Trừ số dư ví</p>
                    </button>
                  )}
                </div>

                {!isPickupAtCounter && (
                  <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-800/80 text-amber-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-[11px]">
                      Đơn giao tận nơi bắt buộc thanh toán qua QR hoặc Ví
                    </span>
                  </div>
                )}

                {/* Wallet Info Box when WALLET is selected */}
                {paymentMethod === 'WALLET' && (
                  <div className="p-3 bg-bg-card rounded-xl border border-border-base text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Số dư ví của bạn:</span>
                      <strong className="text-[#E8B84B] font-black font-mono">
                        {(currentUser?.walletBalance || 0).toLocaleString('vi-VN')}₫
                      </strong>
                    </div>

                    {(currentUser?.walletBalance || 0) < finalAmount ? (
                      <div className="space-y-1.5 pt-1 border-t border-border-base">
                        <p className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Số dư chưa đủ ({finalAmount.toLocaleString()}đ).</span>
                        </p>
                        {onOpenWallet && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onOpenWallet();
                            }}
                            className="w-full py-1.5 rounded-lg bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-bold text-[11px] flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                          >
                            <span>Nạp thêm tiền vào Ví C-Pay ngay</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-[11px] text-emerald-400 font-medium">
                        ✓ Số dư ví đủ thanh toán. Đơn sẽ tự động chuyển sang trạng thái <strong>ĐÃ THANH TOÁN</strong>.
                      </div>
                    )}
                  </div>
                )}

                {walletError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    <span>{walletError}</span>
                  </div>
                )}

                {paymentMethod === 'TRANSFER' && (
                  <div className="p-4 bg-bg-card rounded-xl border border-border-base text-center space-y-3">
                    <div className="text-xs font-bold text-[#E8B84B]">
                      Mã QR thanh toán nhanh:
                    </div>

                    {/* QR Image Container (FIX 3) */}
                    <div className="bg-white p-4 rounded-[16px] max-w-[320px] mx-auto shadow-md">
                      <img
                        src={`https://img.vietqr.io/image/MB-0110151552005-compact2.png?amount=${Math.round(finalAmount)}&addInfo=${encodeURIComponent(checkoutTxId || `DH001-${Math.floor(Date.now() / 1000)}`)}&accountName=NGUYEN%20HUU%20PHUOC`}
                        alt="QR thanh toán MB Bank"
                        className="w-64 h-auto rounded-lg mx-auto"
                      />
                    </div>

                    {/* Transfer Info Block (FIX 4) */}
                    <div className="bg-bg-input border border-border-base rounded-xl p-4 text-text-primary text-left space-y-2 text-xs">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-base">💳</span>
                        <span className="font-bold text-sm text-text-primary">Thông tin chuyển khoản</span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Ngân hàng:</span>
                          <span className="font-semibold text-text-primary">MB Bank</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Số TK:</span>
                          <span className="font-mono font-bold text-text-primary">0110151552005</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-secondary">Chủ TK:</span>
                          <span className="font-semibold text-text-primary">NGUYEN HUU PHUOC</span>
                        </div>

                        <div className="border-t border-border-base my-2"></div>

                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Số tiền:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[#E8B84B] font-bold text-sm font-mono">
                              {finalAmount.toLocaleString('vi-VN')}đ
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(String(Math.round(finalAmount)));
                                if (showToast) showToast('Đã copy số tiền!', 'info');
                              }}
                              className="p-1 hover:bg-bg-elevated rounded text-[#E8B84B] transition-colors cursor-pointer"
                              title="Copy số tiền"
                            >
                              📋
                            </button>
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-text-secondary">Mã GD:</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[#E8B84B] font-bold text-xs">
                              {checkoutTxId || `DH001-${Math.floor(Date.now() / 1000)}`}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const codeToCopy = checkoutTxId || `DH001-${Math.floor(Date.now() / 1000)}`;
                                navigator.clipboard.writeText(codeToCopy);
                                if (showToast) showToast('Đã copy mã GD!', 'info');
                              }}
                              className="p-1 hover:bg-bg-elevated rounded text-[#E8B84B] transition-colors cursor-pointer"
                              title="Copy mã GD"
                            >
                              📋
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 p-2 bg-orange-500/10 border border-orange-500/30 rounded-lg text-xs text-orange-300 leading-relaxed">
                        ⚠️ Quét QR, số tiền và nội dung sẽ tự động điền sẵn. Vui lòng KHÔNG sửa nội dung.
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* STEP 3: ORDER SUCCESS CELEBRATION */}
          {step === 'SUCCESS' && createdOrder && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#E8B84B]/20 text-[#E8B84B] border border-[#E8B84B]/40 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10 text-[#E8B84B]" />
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-extrabold text-text-primary font-serif">Đặt món thành công!</h3>
                <p className="text-xs text-text-secondary mt-1">
                  Đơn hàng của bạn đã được chuyển đến bộ phận Bếp Canteen.
                </p>
              </div>

              {/* 5s Auto-close notice with animated progress bar */}
              <div className="p-3 bg-bg-card rounded-2xl border border-[#E8B84B]/30 text-center space-y-2 shadow-2xs">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#E8B84B]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8B84B] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E8B84B]"></span>
                  </span>
                  <span>Tự động đóng sau <span className="font-extrabold text-black font-mono text-sm px-2 py-0.5 bg-[#E8B84B] rounded-md">{autoCloseCountdown}s</span> để đặt món khác</span>
                </div>
                <div className="w-full bg-bg-elevated h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#E8B84B] h-full rounded-full transition-all duration-1000 ease-linear"
                    style={{ width: `${Math.max(0, (autoCloseCountdown / 5) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="p-4 bg-bg-card rounded-xl border border-border-base text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Mã đơn hàng:</span>
                  <span className="font-extrabold text-[#E8B84B] text-sm font-mono">{createdOrder.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Khách nhận:</span>
                  <span className="font-bold text-text-primary">{createdOrder.receiverName} ({createdOrder.phone})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Khung giờ lấy món:</span>
                  <span className="font-bold text-text-primary">{createdOrder.pickupTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Khu vực nhận:</span>
                  <span className="font-bold text-text-primary">{createdOrder.pickupArea}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Thanh toán:</span>
                  <span className="font-bold text-text-primary">
                    {createdOrder.paymentMethod === 'COD' ? 'Tiền mặt tại quầy' : createdOrder.paymentMethod === 'WALLET' ? 'Ví C-Pay' : 'Chuyển khoản'}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border-base">
                  <span className="font-bold text-text-primary">Tổng thanh toán:</span>
                  <span className="font-black text-[#E8B84B] text-base font-mono">{createdOrder.finalAmount.toLocaleString()}₫</span>
                </div>
              </div>

              <p className="text-[11px] text-text-secondary">
                Nhân viên sẽ gọi thông báo hoặc bạn có thể đến quầy nhận món đúng khung giờ đã đăng ký.
              </p>
            </div>
          )}

        </div>

        {/* Footer with Summary & Buttons */}
        {step !== 'SUCCESS' && cartItems.length > 0 && (
          <div className="p-5 border-t border-[rgba(232,184,75,0.3)] bg-bg-primary space-y-3.5 rounded-b-[20px] shrink-0 sticky bottom-0 z-10">
            
            {/* Voucher Code Box (US20) */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-[#E8B84B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={voucherCodeInput}
                    onChange={(e) => {
                      setVoucherCodeInput(e.target.value.toUpperCase());
                      if (voucherError) setVoucherError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleApplyVoucher();
                      }
                    }}
                    placeholder="Nhập mã voucher (vd: COMBOYEU)..."
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-[12px] border border-dashed border-[#E8B84B] uppercase font-bold text-text-primary bg-bg-input placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-[#E8B84B]/20 transition-all"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyVoucher()}
                  className="px-4 py-2.5 rounded-[12px] bg-[#E8B84B] hover:bg-[#F4C95D] text-black font-extrabold text-xs shadow-sm transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
                >
                  Áp dụng
                </button>
              </div>

              {/* Quick Available Vouchers Chips */}
              {vouchers && vouchers.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-text-secondary font-bold uppercase tracking-wider">
                    <span>Mã ưu đãi gợi ý:</span>
                    <span className="text-[9px] text-text-secondary/70 font-normal">Nhấn để chọn</span>
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                    {vouchers.map((v) => {
                      const isCurrentlyApplied = appliedVoucher?.code === v.code;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setVoucherCodeInput(v.code);
                            handleApplyVoucher(v.code);
                          }}
                          className={`px-2.5 py-1.5 rounded-[10px] border text-xs font-bold shrink-0 flex items-center gap-1.5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:shadow-[#E8B84B]/10 cursor-pointer ${
                            isCurrentlyApplied
                              ? 'bg-[#E8B84B]/20 border-[#E8B84B] text-[#E8B84B] ring-1 ring-[#E8B84B]/40'
                              : 'bg-bg-card border-[#E8B84B]/30 hover:border-[#E8B84B] text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          <span className="font-mono text-[#E8B84B] font-extrabold text-xs">{v.code}</span>
                          <span className="text-rose-400 font-extrabold text-xs">-{v.discountPct}%</span>
                          {v.timeRestricted && (
                            <span className="text-[10px] text-text-secondary flex items-center gap-0.5 px-1 py-0.2 rounded bg-bg-input border border-border-base">
                              <Clock className="w-2.5 h-2.5" />
                              {v.validFromTime}-{v.validToTime}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Applied Voucher Success Banner */}
              {appliedVoucher && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-800 text-xs text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="font-bold">Đã áp dụng mã {appliedVoucher.code} (-{appliedVoucher.discountPct}%)</span>
                      {appliedVoucher.timeRestricted && (
                        <span className="block text-[10px] text-emerald-400/80">
                          Khung giờ áp dụng: {appliedVoucher.validFromTime} - {appliedVoucher.validToTime}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedVoucher(null);
                      setVoucherCodeInput('');
                    }}
                    className="text-xs font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-900/40 cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              )}

              {/* Voucher Invalidation / Out of hours warning banner */}
              {voucherError && (
                <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs leading-relaxed flex items-start gap-2 shadow-2xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1 font-semibold text-[11px]">{voucherError}</div>
                </div>
              )}
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-text-secondary">
                <span>Tạm tính:</span>
                <span className="text-text-primary font-medium">{subtotal.toLocaleString('vi-VN')}₫</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Voucher giảm giá:</span>
                  <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
                </div>
              )}
              <div className="flex justify-between text-[#E8B84B] font-serif text-base sm:text-lg font-black pt-2 border-t border-border-base">
                <span>Tổng cộng:</span>
                <span className="text-[#E8B84B] font-mono text-xl sm:text-2xl font-extrabold">{finalAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            </div>

            {/* Action Buttons */}
            {step === 'CART' ? (
              <button
                onClick={() => {
                  if (!currentUser) {
                    if (onRequestLogin) onRequestLogin();
                    return;
                  }
                  for (const ci of cartItems) {
                    if (ci.isFlashSale && ci.menuItem) {
                      const matched = menuItems.find(m => m.id === ci.menuItem?.id);
                      const totalQty = matched?.flashSaleTotalQty ?? 20;
                      const soldCount = matched?.flashSaleSoldCount ?? 0;
                      const remaining = Math.max(0, totalQty - soldCount);
                      if (ci.quantity > remaining) {
                        if (showToast) showToast('Số lượng món giảm giá không đủ', 'error');
                        return;
                      }
                    } else if (!ci.isCombo && ci.menuItem) {
                      const matched = menuItems.find(m => m.id === ci.menuItem?.id) || ci.menuItem;
                      if (ci.quantity > matched.stock) {
                        if (showToast) showToast('Món ăn đã hết', 'error');
                        return;
                      }
                    }
                  }
                  setStep('CHECKOUT');
                }}
                className="w-full py-3 px-5 rounded-[12px] bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] hover:scale-[1.02] text-black font-black text-sm shadow-lg shadow-[#E8B84B]/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98"
              >
                <span>{!currentUser ? '🔑 Đăng nhập để tiến hành đặt món' : 'Tiến hành đặt món'}</span>
                <ArrowRight className="w-4 h-4 text-black" />
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('CART')}
                  className="px-4 py-3 rounded-[12px] bg-transparent border border-[#E8B84B] text-[#E8B84B] font-bold text-xs hover:bg-[#E8B84B]/15 transition-all duration-200 cursor-pointer"
                >
                  Quay lại
                </button>
                {isCurrentlyClosed ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-4 rounded-[12px] bg-rose-950/80 text-rose-300 border border-rose-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-95"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span className="truncate">Quán hiện đang tạm nghỉ</span>
                  </button>
                ) : !timeValidation.isValid ? (
                  <button
                    type="button"
                    disabled
                    className="flex-1 py-3 px-4 rounded-[12px] bg-amber-950/80 text-amber-300 border border-amber-800 font-bold text-xs flex items-center justify-center gap-1.5 cursor-not-allowed opacity-95"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="truncate">{timeValidation.error || 'Giờ nhận chưa hợp lệ'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (!currentUser) {
                        if (onRequestLogin) onRequestLogin();
                        return;
                      }
                      handlePlaceOrder();
                    }}
                    className="flex-1 py-3 px-5 rounded-[12px] bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] hover:scale-[1.02] text-black font-black text-xs sm:text-sm shadow-lg shadow-[#E8B84B]/20 flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer active:scale-98"
                  >
                    <span>{!currentUser ? '🔑 Đăng nhập để hoàn tất' : `Hoàn tất đặt đơn (${finalAmount.toLocaleString('vi-VN')}₫)`}</span>
                  </button>
                )}
              </div>
            )}

          </div>
        )}

        {/* Close on success */}
        {step === 'SUCCESS' && (
          <div className="p-5 border-t border-[#E8B84B]/20 bg-bg-primary space-y-2 rounded-b-[20px]">
            <button
              onClick={() => {
                setStep('CART');
                onClose();
              }}
              className="w-full py-3 rounded-[12px] bg-gradient-to-r from-[#E8B84B] to-[#F4C95D] hover:scale-[1.02] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#E8B84B]/20 transition-all cursor-pointer active:scale-98"
            >
              <span>Tiếp tục xem thực đơn</span>
              <span className="px-2 py-0.5 rounded-full bg-black text-[#E8B84B] font-mono text-[11px] font-extrabold">
                {autoCloseCountdown}s
              </span>
            </button>
            <p className="text-[11px] text-center text-text-secondary">
              Màn hình sẽ tự động đóng sau <strong className="text-[#E8B84B]">{autoCloseCountdown} giây</strong> để bạn đặt món khác
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
