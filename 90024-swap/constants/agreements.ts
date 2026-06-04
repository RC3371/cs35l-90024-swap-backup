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

// Firestore stores createdAt/updatedAt as serverTimestamp() (a Timestamp once
// read back), but a doc written locally may still hold a number. Normalize.
function toMillis(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  if (typeof value.toMillis === 'function') return value.toMillis();
  return 0;
}

// Subscribe to every agreement the user is a party to (either provider or
// buyer), newest activity first. Firestore has no cross-field OR that plays
// nicely with onSnapshot, so we run one listener per role and merge.
export function subscribeToAgreementsForUser(
  uid: string,
  onChange: (agreements: Agreement[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const mapDocs = (snap: any): Agreement[] =>
    snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as Omit<Agreement, 'id'>) }));

  let providerDocs: Agreement[] = [];
  let buyerDocs: Agreement[] = [];

  const emit = () => {
    const byId = new Map<string, Agreement>();
    for (const a of [...providerDocs, ...buyerDocs]) byId.set(a.id, a);
    const merged = Array.from(byId.values()).sort(
      (a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt),
    );
    onChange(merged);
  };

  const handleError = (e: any) => {
    console.warn('[agreements] subscription error', e);
    onError?.(e instanceof Error ? e : new Error(String(e)));
  };

  const unsubProvider = onSnapshot(
    query(collection(db, COLLECTION), where('providerUid', '==', uid)),
    (snap) => {
      providerDocs = mapDocs(snap);
      emit();
    },
    handleError,
  );
  const unsubBuyer = onSnapshot(
    query(collection(db, COLLECTION), where('buyerUid', '==', uid)),
    (snap) => {
      buyerDocs = mapDocs(snap);
      emit();
    },
    handleError,
  );

  return () => {
    unsubProvider();
    unsubBuyer();
  };
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

// Completing a service is two-sided: one party requests completion, the other
// must confirm. requestCompletion -> confirmCompletion makes it 'completed';
// cancelCompletion backs out to 'accepted'.
export async function requestCompletion(
  id: string,
  requesterUid: string,
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'completion-requested',
    completionRequestedBy: requesterUid,
    updatedAt: serverTimestamp(),
  });
}

export async function confirmCompletion(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'completed',
    completionRequestedBy: null,
    updatedAt: serverTimestamp(),
  });
}

export async function cancelCompletion(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: 'accepted',
    completionRequestedBy: null,
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
