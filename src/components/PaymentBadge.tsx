import React from 'react';
import { OrderPayment } from '../types';

interface PaymentBadgeProps {
  status?: OrderPayment['status'] | string;
  size?: 'sm' | 'md' | 'lg';
}

export const PaymentBadge: React.FC<PaymentBadgeProps> = ({ status = 'unpaid', size = 'md' }) => {
  const normStatus = String(status).toLowerCase();

  let label = '💵 Chưa trả';
  let bgClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  let pulse = false;

  if (normStatus === 'pending_confirm' || normStatus === 'pending') {
    label = '⏳ Chờ xác nhận';
    bgClass = 'bg-orange-500/15 text-orange-400 border-orange-500/40';
    pulse = true;
  } else if (normStatus === 'paid') {
    label = '✅ Đã thanh toán';
    bgClass = 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  } else if (normStatus === 'failed') {
    label = '❌ Thất bại';
    bgClass = 'bg-red-500/15 text-red-400 border-red-500/30';
  } else if (normStatus === 'expired') {
    label = '⌛ Hết hạn';
    bgClass = 'bg-gray-500/15 text-gray-400 border-gray-500/30';
  } else if (normStatus === 'refunded') {
    label = '🔄 Đã hoàn tiền';
    bgClass = 'bg-slate-500/15 text-slate-300 border-slate-500/30';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
    lg: 'px-3 py-1.5 text-sm gap-2 font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${bgClass} ${sizeClasses} ${
        pulse ? 'animate-pulse' : ''
      }`}
    >
      {label}
    </span>
  );
};
