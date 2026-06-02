export type AgreementStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'edit-requested';

export interface PendingEdit {
  proposerUid: string;
  proposedAt: number;
  changes: AgreementEditable;
}

// The fields a party is allowed to propose changes to.
export interface AgreementEditable {
  dates: string[];
  price: number;
  unit: string;
  otherDetails: string;
}

export interface Agreement extends AgreementEditable {
  id: string;
  listingId?: string;
  listingTitle: string;
  conversationId?: string;

  providerUid: string;
  providerName: string;
  buyerUid: string;
  buyerName: string;

  isMultiDay: boolean;

  status: AgreementStatus;
  createdAt: number;
  updatedAt: number;

  pendingEdit?: PendingEdit | null;
}

export function makeDraftAgreement(args: {
  providerUid: string;
  providerName: string;
  buyerUid: string;
  buyerName: string;
  listingId?: string;
  listingTitle: string;
  unit?: string;
  price?: number;
  isMultiDay?: boolean;
  conversationId?: string;
}): Agreement {
  const now = Date.now();
  return {
    id: '',
    listingId: args.listingId,
    listingTitle: args.listingTitle,
    conversationId: args.conversationId,
    providerUid: args.providerUid,
    providerName: args.providerName,
    buyerUid: args.buyerUid,
    buyerName: args.buyerName,
    isMultiDay: args.isMultiDay ?? false,
    dates: [],
    price: args.price ?? 0,
    unit: args.unit ?? '',
    otherDetails: '',
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    pendingEdit: null,
  };
}
