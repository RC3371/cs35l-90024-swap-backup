import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebaseConfig';
import {
  Agreement,
  AgreementEditable,
  AgreementStatus,
} from '@/components/Agreement.types';

const COLLECTION = 'agreements';
const MESSAGES_COLLECTION = 'agreementMessages';

export interface AgreementMessage {
  id: string;
  conversationId: string;
  senderId: string;
  agreementId: string;
  createdAt: number;
}

function stripId<T extends { id?: string }>(x: T): Omit<T, 'id'> {
  const { id: _ignored, ...rest } = x;
  return rest;
}

export async function createAgreement(
  draft: Omit<Agreement, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...stripId(draft as Agreement),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function getAgreement(id: string): Promise<Agreement | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Agreement, 'id'>) };
}

export function subscribeToAgreement(
  id: string,
  onChange: (a: Agreement | null) => void,
): () => void {
  return onSnapshot(doc(db, COLLECTION, id), (snap) => {
    if (!snap.exists()) {
      onChange(null);
      return;
    }
    onChange({ id: snap.id, ...(snap.data() as Omit<Agreement, 'id'>) });
  });
}

export async function setAgreementStatus(
  id: string,
  status: AgreementStatus,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status,
    updatedAt: serverTimestamp(),
  });
}

// One party proposes edits. Requires the other party to accept before they apply.
export async function proposeEdit(
  id: string,
  proposerUid: string,
  changes: AgreementEditable,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'edit-requested',
    pendingEdit: {
      proposerUid,
      proposedAt: Date.now(),
      changes,
    },
    updatedAt: serverTimestamp(),
  });
}

export async function acceptPendingEdit(
  id: string,
  pending: AgreementEditable,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    ...pending,
    status: 'sent',
    pendingEdit: null,
    updatedAt: serverTimestamp(),
  });
}

export async function rejectPendingEdit(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'sent',
    pendingEdit: null,
    updatedAt: serverTimestamp(),
  });
}

export async function postAgreementMessage(args: {
  conversationId: string;
  senderId: string;
  agreementId: string;
}): Promise<string> {
  const ref = await addDoc(collection(db, MESSAGES_COLLECTION), {
    conversationId: args.conversationId,
    senderId: args.senderId,
    agreementId: args.agreementId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

// Subscribe to agreement messages for a given conversation, ordered oldest first.
// Falls back to client-side sort while serverTimestamp is still pending.
export function subscribeToAgreementMessages(
  conversationId: string,
  onChange: (msgs: AgreementMessage[]) => void,
): () => void {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('createdAt', 'asc'),
  );
  return onSnapshot(q, (snap) => {
    const msgs: AgreementMessage[] = snap.docs.map((d) => {
      const data = d.data() as any;
      const created =
        data.createdAt && typeof data.createdAt.toMillis === 'function'
          ? data.createdAt.toMillis()
          : Date.now();
      return {
        id: d.id,
        conversationId: data.conversationId,
        senderId: data.senderId,
        agreementId: data.agreementId,
        createdAt: created,
      };
    });
    onChange(msgs);
  });
}
