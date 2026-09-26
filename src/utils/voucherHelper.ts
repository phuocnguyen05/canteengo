import { Voucher } from '../types';

export interface VoucherValidationResult {
  isValid: boolean;
  error?: string;
  reason?: 'INACTIVE' | 'NOT_STARTED' | 'EXPIRED' | 'TOO_EARLY' | 'TOO_LATE' | 'MIN_ORDER';
  currentTimeStr?: string;
  timeRangeStr?: string;
  discountAmount?: number;
}

/**
 * Validates whether a voucher can be used for the given order subtotal at a specific time.
 */
export function validateVoucher(
  voucher: Voucher,
  orderAmount: number,
  targetDate: Date = new Date()
): VoucherValidationResult {
  // 1. Check active status
  if (!voucher.isActive) {
    return {
      isValid: false,
      reason: 'INACTIVE',
      error: 'Voucher không khả dụng: Mã giảm giá hiện đang tạm ngừng hoạt động.'
    };
  }

  // 2. Check start date if defined
  const todayStr = targetDate.toISOString().slice(0, 10);
  if (voucher.startDate && todayStr < voucher.startDate) {
    return {
      isValid: false,
      reason: 'NOT_STARTED',
      error: `Voucher không khả dụng: Chương trình ưu đãi này bắt đầu từ ngày ${voucher.startDate}.`
    };
  }

  // 3. Check expiration date
  if (voucher.expiredAt) {
    const isExpired =
      voucher.expiredAt.length === 10
        ? todayStr > voucher.expiredAt
        : targetDate.getTime() > new Date(voucher.expiredAt).getTime();

    if (isExpired) {
      return {
        isValid: false,
        reason: 'EXPIRED',
        error: `Voucher không khả dụng: Mã đã quá hạn sử dụng (Hạn cuối: ${voucher.expiredAt}).`
      };
    }
  }

  // 4. Check time window restriction (Khung giờ nhất định trong ngày, e.g. 10:30 - 13:30)
  if (voucher.timeRestricted && voucher.validFromTime && voucher.validToTime) {
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    if (currentTimeStr < voucher.validFromTime) {
      return {
        isValid: false,
        reason: 'TOO_EARLY',
        currentTimeStr,
        timeRangeStr: `${voucher.validFromTime} - ${voucher.validToTime}`,
        error: `Voucher không khả dụng: Mã này chỉ áp dụng trong khung giờ ${voucher.validFromTime} - ${voucher.validToTime}. Hiện tại là ${currentTimeStr} (chưa đến giờ áp dụng).`
      };
    }

    if (currentTimeStr > voucher.validToTime) {
      return {
        isValid: false,
        reason: 'TOO_LATE',
        currentTimeStr,
        timeRangeStr: `${voucher.validFromTime} - ${voucher.validToTime}`,
        error: `Voucher không khả dụng: Mã này chỉ áp dụng trong khung giờ ${voucher.validFromTime} - ${voucher.validToTime}. Hiện tại là ${currentTimeStr} (đã quá giờ áp dụng).`
      };
    }
  }

  // 5. Check minimum order amount
  if (orderAmount < voucher.minOrder) {
    return {
      isValid: false,
      reason: 'MIN_ORDER',
      error: `Voucher không khả dụng: Đơn hàng cần tối thiểu ${voucher.minOrder.toLocaleString('vi-VN')}₫ để áp dụng mã này (hiện tại: ${orderAmount.toLocaleString('vi-VN')}₫).`
    };
  }

  // 6. Valid
  const discountAmount = Math.round((orderAmount * voucher.discountPct) / 100);
  return {
    isValid: true,
    discountAmount
  };
}

/**
 * Returns human-friendly current status details for UI badges
 */
export function getVoucherStatusBadge(voucher: Voucher, targetDate: Date = new Date()) {
  const todayStr = targetDate.toISOString().slice(0, 10);
  const isExpired =
    voucher.expiredAt &&
    (voucher.expiredAt.length === 10
      ? todayStr > voucher.expiredAt
      : targetDate.getTime() > new Date(voucher.expiredAt).getTime());

  if (!voucher.isActive) {
    return {
      type: 'INACTIVE',
      label: 'Đang tắt',
      bgClass: 'bg-slate-100 text-slate-600 border-slate-200'
    };
  }

  if (isExpired) {
    return {
      type: 'EXPIRED',
      label: 'Đã hết hạn',
      bgClass: 'bg-rose-100 text-rose-700 border-rose-200'
    };
  }

  if (voucher.timeRestricted && voucher.validFromTime && voucher.validToTime) {
    const hours = String(targetDate.getHours()).padStart(2, '0');
    const minutes = String(targetDate.getMinutes()).padStart(2, '0');
    const currentTimeStr = `${hours}:${minutes}`;

    if (currentTimeStr >= voucher.validFromTime && currentTimeStr <= voucher.validToTime) {
      return {
        type: 'IN_WINDOW',
        label: `Đang trong giờ (${voucher.validFromTime} - ${voucher.validToTime})`,
        bgClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 animate-pulse'
      };
    } else {
      const isEarly = currentTimeStr < voucher.validFromTime;
      return {
        type: 'OUT_WINDOW',
        label: `${isEarly ? 'Chưa đến giờ' : 'Đã quá giờ'} (${voucher.validFromTime} - ${voucher.validToTime})`,
        bgClass: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }
  }

  return {
    type: 'ACTIVE',
    label: 'Cả ngày (Khả dụng)',
    bgClass: 'bg-blue-100 text-blue-800 border-blue-200'
  };
}
