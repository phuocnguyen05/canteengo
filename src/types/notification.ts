export interface Notification {
  id: string;
  userId: number;
  userRole: "customer" | "staff" | "admin";
  type: NotificationType;
  title: string;
  message: string;
  relatedOrderId: string | null;
  relatedTransactionId: string | null;
  isRead: boolean;
  createdAt: number;
  readAt: number | null;
}

export type NotificationType = 
  | "order_new" | "order_cooking" | "order_ready" 
  | "order_done" | "order_cancelled"
  | "payment_confirmed" | "payment_rejected"
  | "deposit_new" | "deposit_confirmed" | "deposit_rejected"
  | "refund" | "system";
