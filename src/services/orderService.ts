import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Order } from '../types';

export async function getOrderById(orderId: string | number): Promise<Order | null> {
  if (!orderId) return null;
  try {
    const localOrders = localStorage.getItem('canteengo_orders');
    if (localOrders) {
      const parsed: Order[] = JSON.parse(localOrders);
      const found = parsed.find(o => String(o.id) === String(orderId) || String(o.orderCode) === String(orderId));
      if (found) return found;
    }
  } catch (e) {}

  if (db) {
    try {
      const snap = await getDoc(doc(db, 'orders', String(orderId)));
      if (snap.exists()) {
        return snap.data() as Order;
      }
    } catch (e) {}
  }
  return null;
}
