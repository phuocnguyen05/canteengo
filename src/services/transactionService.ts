import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { TransactionItem } from '../types';

export async function getTransactionById(txId: string | number): Promise<TransactionItem | null> {
  if (!txId) return null;
  if (db) {
    try {
      const snap = await getDoc(doc(db, 'transactions', String(txId)));
      if (snap.exists()) {
        return snap.data() as TransactionItem;
      }
    } catch (e) {}
  }
  return null;
}
