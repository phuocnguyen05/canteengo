export type UserRole = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'GUEST' | 'TEACHER' | 'STUDENT';
export type SchoolRole = 'TEACHER' | 'STUDENT' | 'GUEST';
export type VipTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';

export interface WalletTransaction {
  id: string;
  type: 'DEPOSIT' | 'PAYMENT' | 'REFUND';
  amount: number;
  description: string;
  createdAt: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface WalletHistoryItem {
  type: 'deposit' | 'payment' | 'refund';
  amount: number;
  relatedOrderId: string | null;
  reason: string | null;
  at: number | string;
  txId: string;
}

export interface User {
  id: number;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  schoolRole?: SchoolRole;
  studentId?: string; // Mã số Sinh viên hoặc Mã số Giảng viên
  faculty?: string; // Khoa / Đơn vị
  area: string;
  createdAt: string;
  password?: string;
  wallet?: number; // Added for QR payment & wallet balance
  walletBalance?: number; // Canteen e-wallet balance in VND
  walletTransactions?: WalletTransaction[];
  walletHistory?: WalletHistoryItem[];
  rewardPoints?: number; // C-Points accumulated in loyalty program
  vipTier?: VipTier; // Bronze, Silver, Gold, Diamond tier
  totalSpent?: number; // Total money spent for VIP level calculation
  photoURL?: string;
  firebaseUid?: string;
}

export type ItemType = 'MAIN' | 'SIDE' | 'DRINK' | 'DESSERT';

export interface Category {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  icon?: string;
}

export interface MenuItem {
  id: number;
  categoryId: number;
  name: string;
  price: number;
  stock: number;
  calories: number;
  isVegan: boolean;
  imageUrl: string;
  ingredients: string;
  isAvailable: boolean;
  slotType: ItemType; // For combo builder
  badge?: string;
  soldCount?: number;
  rating?: number;
  // Flash Sale fields
  isFlashSale?: boolean;
  flashPrice?: number;
  flashSaleEndTime?: string; // ISO timestamp string or format HH:mm:ss
  flashSaleTotalQty?: number; // Maximum units available for flash sale
  flashSaleSoldCount?: number; // Quantity sold so far in flash sale
  prepTime?: string; // e.g. '10 - 15 phút' (Thời gian hoàn thành / chuẩn bị món)
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'READY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'TRANSFER' | 'WALLET';

export interface CartItem {
  id: string; // unique cart item id
  menuItem?: MenuItem;
  quantity: number;
  isCombo?: boolean;
  isFlashSale?: boolean; // True if item is ordered at flash sale discounted price
  comboName?: string;
  comboItems?: MenuItem[];
  totalPrice: number;
  totalCalories: number;
  note?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  itemId?: number;
  itemName: string;
  quantity: number;
  unitPrice: number;
  note?: string;
  isCombo?: boolean;
  isFlashSale?: boolean; // True if ordered at flash sale discounted price
  comboDetails?: string[];
  comboItemIds?: number[];
}

export interface OrderPayment {
  method: 'cash' | 'qr' | 'wallet' | 'COD' | 'TRANSFER' | 'WALLET';
  status: 'unpaid' | 'pending_confirm' | 'paid' | 'failed' | 'expired' | 'refunded' | 'PENDING' | 'PAID';
  transactionId?: string | null;              // MỚI: mã CK riêng
  qrContent?: string | null;                  // MỚI
  qrExpiresAt?: number | string | null;       // MỚI: hết hạn QR
  paidAt?: number | string | null;
  confirmedBy?: 'admin' | 'staff' | null;      // MỚI
  confirmedByName?: string | null;             // MỚI
  confirmedAt?: number | string | null;        // MỚI
  rejectedBy?: string | null;                  // MỚI
  rejectionReason?: string | null;             // MỚI
  rejectedAt?: number | string | null;         // MỚI
  refundedAt?: number | string | null;         // MỚI
  refundedBy?: string | null;                  // MỚI
  refundAmount?: number;                       // MỚI
  refundMethod?: 'wallet' | null;              // MỚI
  refundTransactionId?: string | null;         // MỚI
  expiredAt?: number | string | null;          // MỚI
  note?: string | null;
}

export interface OrderCancelInfo {
  cancelledBy: 'customer' | 'staff' | 'admin' | 'system';   // MỚI system
  reason: string;
  cancelledAt: number | string;
  autoCancelled?: boolean;                                   // MỚI
}

export interface TransactionItem {
  id: string;                       // DH001-xxx / NAP003-xxx / REF001-xxx
  type: 'deposit' | 'payment' | 'refund';
  userId: number;
  userName: string;
  userPhone: string;
  amount: number;
  method: 'qr' | 'cash' | 'wallet';
  status: 'pending_confirm' | 'paid' | 'failed' | 'expired';
  transactionId: string;
  qrContent?: string | null;
  qrExpiresAt?: number | string | null;
  relatedOrderId?: string | null;
  reason?: string | null;
  confirmedBy?: string | null;
  confirmedByName?: string | null;
  confirmedAt?: number | string | null;
  rejectedBy?: string | null;
  rejectionReason?: string | null;
  refundedBy?: string | null;
  createdAt: number | string;
  updatedAt: number | string;
}

export interface Order {
  id: number;
  orderCode: string;
  userId?: number;
  receiverName: string;
  phone: string;
  pickupArea: string;
  pickupTime: string;
  status: OrderStatus;
  totalAmount: number;
  discountAmount?: number;
  finalAmount: number;
  voucherCode?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: 'PENDING' | 'PAID';
  payment?: OrderPayment;                      // MỚI: thông tin thanh toán QR/Ví chi tiết
  cancel?: OrderCancelInfo;                    // MỚI: thông tin hủy đơn chi tiết
  createdAt: string;
  orderDate?: string;
  items: OrderItem[];
  notes?: string;
  totalCalories?: number;
  cancelReason?: string;
  rating?: number;
  feedback?: string;
  feedbackCreatedAt?: string;
  completedAt?: string; // Thời gian hoàn thành món (thực tế)
  estimatedCompletionTime?: string; // Thời gian dự kiến hoàn thành món
  cookingAt?: number | string;      // Thời gian bắt đầu nấu
  readyAt?: number | string;        // Thời gian món hoàn thành ra khay
  doneAt?: number | string;         // Thời gian giao khách thành công
  type?: 'at-counter' | 'eat-in' | 'take-away' | 'delivery' | 'ship' | 'giao-tan-noi' | string;
  orderType?: string;
  deliveryMethod?: string;
}

export interface OrderLog {
  id: number;
  orderId: number;
  staffName: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  note: string;
  changedAt: string;
}

export interface Voucher {
  id: number;
  code: string;
  discountPct: number; // e.g. 10 = 10%
  minOrder: number;
  description: string;
  expiredAt: string;
  isActive: boolean;
  timeRestricted?: boolean; // Áp dụng trong khung giờ nhất định
  validFromTime?: string;   // 'HH:mm' e.g. '10:30'
  validToTime?: string;     // 'HH:mm' e.g. '13:30'
  startDate?: string;       // 'YYYY-MM-DD'
  usageLimit?: number;      // Số lượt dùng tối đa
  usedCount?: number;       // Số lượt đã dùng
}

export interface ComboSelection {
  main?: MenuItem;
  side?: MenuItem;
  drink?: MenuItem;
  dessert?: MenuItem;
}

export interface ItemReview {
  id: number;
  itemId: number;
  userId: number;
  userName: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
  adminReply?: {
    comment: string;
    repliedAt: string;
    repliedBy?: string;
  };
}

export interface AppNotification {
  id: string;
  userId?: number; // Target user account id for account-specific notifications
  targetRole?: 'STAFF' | 'ADMIN' | 'CUSTOMER' | 'ALL'; // Target role for staff/admin broadcast notifications
  title: string;
  message: string;
  createdAt: string;
  type: 'ORDER' | 'WALLET' | 'PROMO' | 'SYSTEM' | 'CHAT';
  isRead: boolean;
  orderId?: number;
  voucherCode?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string; // Unique identifier for user conversation (e.g., 'user-101' or customer phone)
  customerName: string;
  customerPhone?: string;
  senderId: number | string;
  senderName: string;
  senderRole: 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'GUEST';
  senderAvatar?: string;
  message: string;
  createdAt: string;
  isReadByStaff: boolean;
  isReadByCustomer: boolean;
  isStaffReply?: boolean;
}

export type ThemeColor = 'orange' | 'emerald' | 'blue' | 'purple' | 'rose' | 'amber';
export type ThemeMode = 'light' | 'dark';

export interface ThemeConfig {
  color: ThemeColor;
  mode: ThemeMode;
  bgType: 'none' | 'preset' | 'custom';
  bgPresetUrl?: string;
  bgCustomUrl?: string;
  bgOpacity: number; // 10 to 90
  bgBlur: number; // 0 to 12
}

export interface CanteenStatusConfig {
  isOpen: boolean;
  mode: 'MANUAL' | 'AUTO';
  statusText?: string;
  closedNote?: string;
  lunchHours: string;
  breakfastHours: string;
  allowOrderingWhenClosed?: boolean;
}


