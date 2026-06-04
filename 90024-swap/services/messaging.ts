import { db } from '@/constants/firebaseConfig';
import { Conversation, Message } from '@/types/messaging';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';

const CONVERSATIONS = 'conversations';

function nowIso(): string {
  return new Date().toISOString();
}

function mapConversation(id: string, data: any): Conversation {
  return {
    id,
    listing_id: data.listing_id ?? '',
    buyer_id: data.buyer_id ?? '',
    seller_id: data.seller_id ?? '',
    participants: data.participants ?? [],
    title: data.title ?? '',
    last_message_content: data.last_message_content ?? '',
    last_message_at: data.last_message_at ?? data.created_at ?? '',
    created_at: data.created_at ?? '',
  };
}

function mapMessage(id: string, data: any): Message {
  return {
    id,
    sender_id: data.sender_id ?? '',
    content: data.content ?? '',
    created_at: data.created_at ?? '',
  };
}

export function subscribeToConversationsForUser(
  uid: string,
  onChange: (conversations: Conversation[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, CONVERSATIONS),
    where('participants', 'array-contains', uid),
  );

  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs
          .map((d) => mapConversation(d.id, d.data()))
          .sort((a, b) => b.last_message_at.localeCompare(a.last_message_at)),
      );
    },
    (e) => onError?.(e instanceof Error ? e : new Error(String(e))),
  );
}

export function subscribeToConversationMessages(
  conversationId: string,
  onChange: (messages: Message[]) => void,
  onError?: (error: Error) => void,
): () => void {
  const q = query(
    collection(db, CONVERSATIONS, conversationId, 'messages'),
    orderBy('created_at', 'asc'),
  );

  return onSnapshot(
    q,
    (snap) => {
      onChange(snap.docs.map((d) => mapMessage(d.id, d.data())));
    },
    (e) => onError?.(e instanceof Error ? e : new Error(String(e))),
  );
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
): Promise<void> {
  const trimmed = content.trim();
  if (!trimmed) return;

  const createdAt = nowIso();
  await addDoc(collection(db, CONVERSATIONS, conversationId, 'messages'), {
    sender_id: senderId,
    content: trimmed,
    created_at: createdAt,
  });
  await updateDoc(doc(db, CONVERSATIONS, conversationId), {
    last_message_content: trimmed,
    last_message_at: createdAt,
  });
}

export async function getOrCreateConversationForListing(args: {
  listingId: string;
  buyerId: string;
  sellerId: string;
  title: string;
}): Promise<string> {
  const conversationsQuery = query(
    collection(db, CONVERSATIONS),
    where('participants', 'array-contains', args.buyerId),
  );
  const snap = await getDocs(conversationsQuery);
  const existing = snap.docs.find((d) => {
    const data = d.data();
    return (
      data.listing_id === args.listingId &&
      data.buyer_id === args.buyerId &&
      data.seller_id === args.sellerId
    );
  });
  if (existing) return existing.id;

  const createdAt = nowIso();
  const ref = await addDoc(collection(db, CONVERSATIONS), {
    listing_id: args.listingId,
    buyer_id: args.buyerId,
    seller_id: args.sellerId,
    participants: [args.buyerId, args.sellerId],
    title: args.title,
    last_message_content: '',
    last_message_at: createdAt,
    created_at: createdAt,
  });
  return ref.id;
}
