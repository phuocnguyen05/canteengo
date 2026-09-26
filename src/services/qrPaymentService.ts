import { runTransaction, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order, User, TransactionItem, WalletHistoryItem, OrderPayment, OrderCancelInfo } from '../types';
import { createNotification, createNotificationForRole } from './notificationService';

/**
 * 2.1. Generate QR code payment details for an order
 */
export function generateOrderQR(orderCode: string, totalAmount: number): OrderPayment {
  const timestamp = Math.floor(Date.now() / 1000);
  const transactionId = `DH${orderCode}-${timestamp}`;
  const qrContent = `https://img.vietqr.io/image/MB-0110151552005-compact2.png?amount=${totalAmount}&addInfo=${encodeURIComponent(transactionId)}&accountName=NGUYEN%20HUU%20PHUOC`;
  const qrExpiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  return {
    method: 'qr',
    status: 'unpaid',
    transactionId,
    qrContent,
    qrExpiresAt,
    paidAt: null,
    confirmedBy: null,
    confirmedByName: null,
    confirmedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    rejectedAt: null,
    refundedAt: null,
    refundedBy: null,
    refundAmount: 0,
    refundMethod: null,
    refundTransactionId: null,
    expiredAt: null,
    note: null
  };
}

/**
 * 2.3. Generate deposit transaction for Wallet deposit
 */
export function createDepositTransaction(
  user: User,
  amount: number,
  method: 'cash' | 'qr'
): TransactionItem {
  const timestamp = Math.floor(Date.now() / 1000);
  const transactionId = `NAP${user.id}-${timestamp}`;
  const qrContent = method === 'qr' 
    ? `https://img.vietqr.io/image/MB-0110151552005-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transactionId)}&accountName=NGUYEN%20HUU%20PHUOC`
    : '';
  const qrExpiresAt = method === 'qr' ? Date.now() + 5 * 60 * 1000 : null;

  return {
    id: transactionId,
    type: 'deposit',
    userId: user.id,
    userName: user.fullName || 'Khách hàng',
    userPhone: user.phone || '',
    amount,
    method,
    status: 'pending_confirm',
    transactionId,
    qrContent,
    qrExpiresAt,
    relatedOrderId: null,
    reason: 'Nạp tiền vào ví C-Pay',
    confirmedBy: null,
    confirmedByName: null,
    confirmedAt: null,
    rejectedBy: null,
    rejectionReason: null,
    refundedBy: null,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}

/**
 * 2.2. Customer confirms transfer
 */
export async function markCustomerTransferSent(order: Order): Promise<Order> {
  if (order.payment?.status === 'paid') {
    throw new Error('Đơn hàng đã được thanh toán thành công, không thể báo chuyển khoản lại!');
  }

  const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  const updatedPayment: OrderPayment = {
    ...(order.payment || generateOrderQR(order.orderCode, order.finalAmount)),
    status: 'pending_confirm',
    note: `Khách báo đã CK lúc ${timeStr}`
  };

  const updatedOrder: Order = {
    ...order,
    paymentStatus: 'PENDING',
    payment: updatedPayment
  };

  // Sync with Firestore safely
  if (db) {
    try {
      await setDoc(doc(db, 'orders', order.orderCode), {
        paymentStatus: 'PENDING',
        payment: updatedPayment,
        notes: order.notes || ''
      }, { merge: true });

      if (updatedPayment.transactionId) {
        const txDoc: TransactionItem = {
          id: updatedPayment.transactionId,
          type: 'payment',
          userId: order.userId || 0,
          userName: order.receiverName,
          userPhone: order.phone,
          amount: order.finalAmount,
          method: 'qr',
          status: 'pending_confirm',
          transactionId: updatedPayment.transactionId,
          qrContent: updatedPayment.qrContent || null,
          qrExpiresAt: updatedPayment.qrExpiresAt || null,
          relatedOrderId: order.orderCode,
          reason: `Thanh toán đơn hàng #${order.orderCode}`,
          confirmedBy: null,
          confirmedByName: null,
          confirmedAt: null,
          rejectedBy: null,
          rejectionReason: null,
          refundedBy: null,
          createdAt: Date.now(),
          updatedAt: Date.now()
        };
        await setDoc(doc(db, 'transactions', updatedPayment.transactionId), txDoc, { merge: true });
      }
    } catch (err) {
      console.warn('Firestore markCustomerTransferSent error:', err);
    }
  }

  return updatedOrder;
}

/**
 * 2.4. Admin/Staff confirms payment
 */
export async function confirmPaymentTransaction(
  item: TransactionItem | Order,
  currentUser: User
): Promise<{ updatedItem: TransactionItem | Order; updatedUser?: User }> {
  const now = Date.now();
  const staffRole = currentUser.role === 'ADMIN' ? 'admin' : 'staff';
  const staffName = currentUser.fullName || currentUser.role;

  // Case A: Confirming a Deposit Transaction
  if ('type' in item && (item as TransactionItem).type === 'deposit') {
    const tx = item as TransactionItem;
    const updatedTx: TransactionItem = {
      ...tx,
      status: 'paid',
      confirmedBy: staffRole,
      confirmedByName: staffName,
      confirmedAt: now,
      updatedAt: now
    };

    if (db) {
      try {
        await setDoc(doc(db, 'transactions', String(tx.id)), updatedTx, { merge: true });
      } catch (e) {
        console.warn('Firestore tx update:', e);
      }
    }

    createNotification({
      userId: tx.userId,
      userRole: 'customer',
      type: 'deposit_confirmed',
      title: '✅ Nạp ví thành công',
      message: `Yêu cầu nạp ${tx.amount.toLocaleString('vi-VN')}₫ đã được duyệt và cộng vào ví.`,
      relatedTransactionId: tx.id
    });

    createNotificationForRole('admin', {
      type: 'deposit_confirmed',
      title: '✅ Đã duyệt nạp ví',
      message: `Quản lý/Nhân viên ${staffName} đã duyệt nạp ${tx.amount.toLocaleString('vi-VN')}₫ cho khách ${tx.userName}.`,
      relatedTransactionId: tx.id
    });

    return { updatedItem: updatedTx };
  }

  // Case B: Confirming an Order Payment
  const order = item as Order;
  const updatedPayment: OrderPayment = {
    ...(order.payment || generateOrderQR(order.orderCode, order.finalAmount)),
    status: 'paid',
    paidAt: now,
    confirmedBy: staffRole,
    confirmedByName: staffName,
    confirmedAt: now
  };

  const updatedOrder: Order = {
    ...order,
    paymentStatus: 'PAID',
    payment: updatedPayment
  };

  if (db) {
    try {
      await setDoc(doc(db, 'orders', order.orderCode), {
        paymentStatus: 'PAID',
        payment: updatedPayment
      }, { merge: true });

      if (updatedPayment.transactionId) {
        await setDoc(doc(db, 'transactions', updatedPayment.transactionId), {
          status: 'paid',
          confirmedBy: staffRole,
          confirmedByName: staffName,
          confirmedAt: now,
          updatedAt: now
        }, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore order confirm:', e);
    }
  }

  createNotification({
    userId: order.userId || 0,
    userRole: 'customer',
    type: 'payment_confirmed',
    title: `✅ Đã xác nhận thanh toán đơn #${order.orderCode}`,
    message: `Thanh toán qua QR cho đơn #${order.orderCode} đã được xác nhận thành công.`,
    relatedOrderId: order.orderCode,
    relatedTransactionId: updatedPayment.transactionId || null
  });

  if (staffRole === 'staff') {
    createNotificationForRole('admin', {
      type: 'payment_confirmed',
      title: `🔔 Nhân viên ${staffName} xác nhận TT`,
      message: `Nhân viên ${staffName} đã xác nhận thanh toán cho đơn #${order.orderCode}.`,
      relatedOrderId: order.orderCode,
      relatedTransactionId: updatedPayment.transactionId || null
    });
  }

  return { updatedItem: updatedOrder };
}

/**
 * 2.5. Admin/Staff rejects payment
 */
export async function rejectPaymentTransaction(
  item: TransactionItem | Order,
  currentUser: User,
  reason: string
): Promise<TransactionItem | Order> {
  const now = Date.now();
  const staffRole = currentUser.role === 'ADMIN' ? 'admin' : 'staff';

  if ('type' in item && (item as TransactionItem).type === 'deposit') {
    const tx = item as TransactionItem;
    const updatedTx: TransactionItem = {
      ...tx,
      status: 'failed',
      rejectedBy: staffRole,
      rejectionReason: reason,
      updatedAt: now
    };

    if (db) {
      try {
        await setDoc(doc(db, 'transactions', String(tx.id)), updatedTx, { merge: true });
      } catch (e) {}
    }

    return updatedTx;
  }

  const order = item as Order;
  const updatedPayment: OrderPayment = {
    ...(order.payment || generateOrderQR(order.orderCode, order.finalAmount)),
    status: 'failed',
    rejectedBy: staffRole,
    rejectionReason: reason,
    rejectedAt: now
  };

  const updatedOrder: Order = {
    ...order,
    status: 'PENDING',
    paymentStatus: 'PENDING',
    payment: updatedPayment
  };

  if (db) {
    try {
      await setDoc(doc(db, 'orders', order.orderCode), {
        status: 'PENDING',
        paymentStatus: 'PENDING',
        payment: updatedPayment
      }, { merge: true });

      if (updatedPayment.transactionId) {
        await setDoc(doc(db, 'transactions', updatedPayment.transactionId), {
          status: 'failed',
          rejectedBy: staffRole,
          rejectionReason: reason,
          updatedAt: now
        }, { merge: true });
      }
    } catch (e) {}
  }

  return updatedOrder;
}

/**
 * 2.6. Check and cancel expired QR codes
 */
export function checkExpiredQR(
  orders: Order[],
  transactions: TransactionItem[]
): {
  expiredOrderCodes: string[];
  expiredTxIds: string[];
  updatedOrders: Order[];
  updatedTransactions: TransactionItem[];
} {
  const now = Date.now();
  const expiredOrderCodes: string[] = [];
  const expiredTxIds: string[] = [];

  const updatedOrders = orders.map((o) => {
    if (
      o.payment?.method === 'qr' &&
      (o.payment.status === 'unpaid' || o.payment.status === 'pending_confirm') &&
      o.payment.qrExpiresAt &&
      Number(o.payment.qrExpiresAt) < now &&
      o.status !== 'CANCELLED'
    ) {
      expiredOrderCodes.push(o.orderCode);
      const cancelInfo: OrderCancelInfo = {
        cancelledBy: 'system',
        reason: 'Hết thời gian thanh toán QR',
        cancelledAt: now,
        autoCancelled: true
      };
      const updatedPayment: OrderPayment = {
        ...o.payment,
        status: 'expired',
        expiredAt: now
      };
      const updatedOrder: Order = {
        ...o,
        status: 'CANCELLED',
        cancelReason: cancelInfo.reason,
        payment: updatedPayment,
        cancel: cancelInfo
      };

      if (db) {
        setDoc(doc(db, 'orders', o.orderCode), {
          status: 'CANCELLED',
          cancelReason: cancelInfo.reason,
          payment: updatedPayment,
          cancel: cancelInfo
        }, { merge: true }).catch(console.warn);
      }

      return updatedOrder;
    }
    return o;
  });

  const updatedTransactions = transactions.map((tx) => {
    if (
      tx.method === 'qr' &&
      tx.status === 'pending_confirm' &&
      tx.qrExpiresAt &&
      Number(tx.qrExpiresAt) < now
    ) {
      expiredTxIds.push(tx.id);
      const updatedTx: TransactionItem = {
        ...tx,
        status: 'expired',
        updatedAt: now
      };

      if (db) {
        setDoc(doc(db, 'transactions', tx.id), updatedTx, { merge: true }).catch(console.warn);
      }

      return updatedTx;
    }
    return tx;
  });

  return { expiredOrderCodes, expiredTxIds, updatedOrders, updatedTransactions };
}

/**
 * 2.7. Refund when cancelling order
 */
export async function cancelAndRefundOrder(
  order: Order,
  currentUser: User,
  reason: string,
  userProfile?: User
): Promise<{
  updatedOrder: Order;
  updatedUser?: User;
  refunded: boolean;
  refundAmount: number;
  message: string;
}> {
  // Prevent cancelling finished or already cancelled orders
  if (order.status === 'DELIVERED' || order.status === 'READY') {
    throw new Error('Đơn hàng đã hoàn thành hoặc sẵn sàng phục vụ, không thể hủy!');
  }
  if (order.status === 'CANCELLED') {
    throw new Error('Đơn hàng đã bị hủy trước đó!');
  }

  const now = Date.now();
  const roleLower = (currentUser.role === 'ADMIN' ? 'admin' : currentUser.role === 'STAFF' ? 'staff' : 'customer') as "customer" | "staff" | "admin";
  const cancelInfo: OrderCancelInfo = {
    cancelledBy: roleLower,
    reason,
    cancelledAt: now,
    autoCancelled: false
  };

  const paymentStatus = order.payment?.status || (order.paymentStatus === 'PAID' ? 'paid' : 'unpaid');
  const amountToRefund = order.finalAmount || order.totalAmount || 0;

  // Case A: Order was PAID -> AUTOMATICALLY REFUND TO WALLET
  if (paymentStatus === 'paid') {
    const refundTxId = `REF${order.orderCode}-${Math.floor(now / 1000)}`;
    const updatedPayment: OrderPayment = {
      ...(order.payment || generateOrderQR(order.orderCode, amountToRefund)),
      status: 'refunded',
      refundedAt: now,
      refundedBy: roleLower,
      refundAmount: amountToRefund,
      refundMethod: 'wallet',
      refundTransactionId: refundTxId
    };

    const updatedOrder: Order = {
      ...order,
      status: 'CANCELLED',
      cancelReason: reason,
      payment: updatedPayment,
      cancel: cancelInfo
    };

    // Update target user wallet balance
    const targetUser = userProfile || currentUser;
    const currentWallet = targetUser.wallet ?? targetUser.walletBalance ?? 0;
    const newBalance = currentWallet + amountToRefund;

    const newWalletHistoryItem: WalletHistoryItem = {
      type: 'refund',
      amount: amountToRefund,
      relatedOrderId: order.orderCode,
      reason: `Hoàn tiền hủy đơn #${order.orderCode}: ${reason}`,
      at: now,
      txId: refundTxId
    };

    const updatedUser: User = {
      ...targetUser,
      wallet: newBalance,
      walletBalance: newBalance,
      walletHistory: [newWalletHistoryItem, ...(targetUser.walletHistory || [])]
    };

    // Refund transaction doc
    const refundTxDoc: TransactionItem = {
      id: refundTxId,
      type: 'refund',
      userId: targetUser.id,
      userName: targetUser.fullName || order.receiverName,
      userPhone: targetUser.phone || order.phone,
      amount: amountToRefund,
      method: 'wallet',
      status: 'paid',
      transactionId: refundTxId,
      relatedOrderId: order.orderCode,
      reason: `Hoàn tiền hủy đơn #${order.orderCode}`,
      refundedBy: roleLower,
      createdAt: now,
      updatedAt: now
    };

    if (db) {
      try {
        await runTransaction(db, async (transaction) => {
          const orderRef = doc(db, 'orders', order.orderCode);
          transaction.set(orderRef, {
            status: 'CANCELLED',
            cancelReason: reason,
            payment: updatedPayment,
            cancel: cancelInfo
          }, { merge: true });

          const txRef = doc(db, 'transactions', refundTxId);
          transaction.set(txRef, refundTxDoc, { merge: true });

          if (targetUser.firebaseUid) {
            const userRef = doc(db, 'users', targetUser.firebaseUid);
            transaction.set(userRef, {
              wallet: newBalance,
              walletBalance: newBalance,
              walletHistory: updatedUser.walletHistory
            }, { merge: true });
          }
        });
      } catch (err) {
        console.warn('Firestore refund transaction failed:', err);
      }
    }

    createNotification({
      userId: targetUser.id,
      userRole: 'customer',
      type: 'refund',
      title: `💸 Đã hoàn ${amountToRefund.toLocaleString('vi-VN')}₫ vào ví`,
      message: `Đơn #${order.orderCode} hủy và hoàn tiền thành công vào ví.`,
      relatedOrderId: order.orderCode,
      relatedTransactionId: refundTxId
    });

    createNotificationForRole('admin', {
      type: 'refund',
      title: `💰 Đã hoàn tiền cho khách ${targetUser.fullName || order.receiverName}`,
      message: `Đơn #${order.orderCode} đã hoàn ${amountToRefund.toLocaleString('vi-VN')}₫ cho khách ${targetUser.fullName || order.receiverName}.`,
      relatedOrderId: order.orderCode,
      relatedTransactionId: refundTxId
    });

    return {
      updatedOrder,
      updatedUser,
      refunded: true,
      refundAmount: amountToRefund,
      message: `Đã hủy đơn và hoàn ${amountToRefund.toLocaleString('vi-VN')}đ vào Ví C-Pay thành công!`
    };
  }

  // Case B: Order pending confirmation -> set payment status failed
  if (paymentStatus === 'pending_confirm') {
    const updatedPayment: OrderPayment = {
      ...(order.payment || generateOrderQR(order.orderCode, amountToRefund)),
      status: 'failed',
      rejectedBy: roleLower,
      rejectionReason: 'Hủy đơn trong khi chờ xác nhận',
      rejectedAt: now
    };

    const updatedOrder: Order = {
      ...order,
      status: 'CANCELLED',
      cancelReason: reason,
      payment: updatedPayment,
      cancel: cancelInfo
    };

    if (db) {
      try {
        await setDoc(doc(db, 'orders', order.orderCode), {
          status: 'CANCELLED',
          cancelReason: reason,
          payment: updatedPayment,
          cancel: cancelInfo
        }, { merge: true });
      } catch (e) {}
    }

    return {
      updatedOrder,
      refunded: false,
      refundAmount: 0,
      message: `Đã hủy đơn hàng #${order.orderCode}.`
    };
  }

  // Case C: Unpaid / Failed / Expired -> Just cancel, no refund
  const updatedOrder: Order = {
    ...order,
    status: 'CANCELLED',
    cancelReason: reason,
    cancel: cancelInfo
  };

  if (db) {
    try {
      await setDoc(doc(db, 'orders', order.orderCode), {
        status: 'CANCELLED',
        cancelReason: reason,
        cancel: cancelInfo
      }, { merge: true });
    } catch (e) {}
  }

  return {
    updatedOrder,
    refunded: false,
    refundAmount: 0,
    message: `Đã hủy đơn hàng #${order.orderCode}.`
  };
}
