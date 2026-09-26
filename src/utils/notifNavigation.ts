import { getOrderById } from "../services/orderService";
import { getTransactionById } from "../services/transactionService";

export const navigateToNotifTarget = async (
  notif: any,
  currentUser: any,
  navigate: any,
  openOrderModal?: (order: any) => void
) => {
  // === A. NOTIF VỀ ĐƠN HÀNG ===
  if (notif.relatedOrderId) {
    const order = await getOrderById(notif.relatedOrderId);
    
    if (!order) {
      return { success: false, message: "Đơn không tồn tại" };
    }
    
    if (currentUser.role === "customer") {
      // Khách → mở modal chi tiết đơn
      if (openOrderModal) {
        openOrderModal(order);
      } else {
        navigate(`/my-orders?orderId=${order.id}`);
      }
    } else if (currentUser.role === "staff") {
      // Staff → trang Bếp + highlight
      navigate(`/kitchen?orderId=${order.id}`);
    } else if (currentUser.role === "admin") {
      // Admin → tab Đơn hàng + highlight
      navigate(`/admin/orders?orderId=${order.id}`);
    }
    return { success: true };
  }
  
  // === B. NOTIF VỀ GIAO DỊCH ===
  if (notif.relatedTransactionId) {
    const tx = await getTransactionById(notif.relatedTransactionId);
    
    if (!tx) {
      return { success: false, message: "Giao dịch không tồn tại" };
    }
    
    if (currentUser.role === "customer") {
      navigate(`/wallet?txId=${tx.id}`);
    } else {
      navigate(`/admin/confirm-payment?txId=${tx.id}`);
    }
    return { success: true };
  }
  
  // === C. NOTIF SYSTEM ===
  return { success: false, message: "Thông báo không có liên kết" };
};
