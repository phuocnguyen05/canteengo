import { db } from "../firebase";
import { 
  collection, addDoc, query, where, getDocs, 
  orderBy, limit, onSnapshot, updateDoc, doc 
} from "firebase/firestore";
import { Notification, NotificationType } from "../types/notification";

export interface CreateNotifParams {
  userId: number;
  userRole: "customer" | "staff" | "admin";
  type: NotificationType | string;
  title: string;
  message: string;
  relatedOrderId?: string | number | null;
  relatedTransactionId?: string | null;
}

// Tạo 1 thông báo cho 1 user
export const createNotification = async (params: CreateNotifParams) => {
  try {
    await addDoc(collection(db, "notifications"), {
      userId: params.userId,
      userRole: params.userRole,
      type: params.type,
      title: params.title,
      message: params.message,
      relatedOrderId: params.relatedOrderId ? String(params.relatedOrderId) : null,
      relatedTransactionId: params.relatedTransactionId || null,
      isRead: false,
      createdAt: Date.now(),
      readAt: null,
    });
  } catch (error) {
    console.warn("Không thể lưu notification vào Firestore (chạy offline/fallback):", error);
  }
};

// Tạo cho TẤT CẢ user có role cụ thể (staff hoặc admin)
export const createNotificationForRole = async (
  role: "staff" | "admin",
  data: Omit<CreateNotifParams, "userId" | "userRole">
) => {
  try {
    const roleUpper = role.toUpperCase();
    const usersSnap = await getDocs(
      query(collection(db, "users"), where("role", "in", [role, roleUpper]))
    );
    
    if (usersSnap.empty) {
      // Fallback nếu users collection chưa đồng bộ Firestore
      // hoặc lấy từ local demo accounts
      const fallbackIds = role === "admin" ? [999] : [201, 202];
      await Promise.all(
        fallbackIds.map((uid) =>
          createNotification({
            userId: uid,
            userRole: role,
            ...data,
          })
        )
      );
      return;
    }

    const promises = usersSnap.docs.map((userDoc) => {
      const userData = userDoc.data();
      const numUserId = typeof userData.id === "number" ? userData.id : parseInt(userData.id, 10) || 0;
      return createNotification({
        userId: numUserId,
        userRole: role,
        ...data,
      });
    });
    
    await Promise.all(promises);
  } catch (error) {
    console.warn(`Lỗi gửi thông báo cho role ${role}:`, error);
  }
};

// Subscribe notifications của 1 user (realtime)
export const subscribeUserNotifications = (
  userId: number,
  callback: (notifications: Notification[]) => void
) => {
  const q = query(
    collection(db, "notifications"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  
  return onSnapshot(q, (snap) => {
    const notifications = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    })) as Notification[];
    callback(notifications);
  }, (err) => {
    console.warn("Lỗi subscribe notifications:", err);
  });
};

// Đánh dấu 1 thông báo đã đọc
export const markAsRead = async (notificationId: string) => {
  try {
    await updateDoc(doc(db, "notifications", notificationId), {
      isRead: true,
      readAt: Date.now(),
    });
  } catch (error) {
    console.warn("Lỗi markAsRead:", error);
  }
};

// Đánh dấu TẤT CẢ đã đọc
export const markAllAsRead = async (userId: number) => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    
    const snap = await getDocs(q);
    const promises = snap.docs.map((d) =>
      updateDoc(d.ref, { isRead: true, readAt: Date.now() })
    );
    
    await Promise.all(promises);
  } catch (error) {
    console.warn("Lỗi markAllAsRead:", error);
  }
};
