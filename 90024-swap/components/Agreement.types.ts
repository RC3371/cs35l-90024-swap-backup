export type AgreementStatus =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'edit-requested'
  | 'completion-requested'
  | 'completed';

// Single source of truth for each status's short label so agreement screens
// and the Agreements tab use the same wording.
export const AGREEMENT_STATUS_LABEL: Record<AgreementStatus, string> = {
  draft: 'Draft',
  sent: 'Awaiting acceptance',
  accepted: 'Accepted',
  'edit-requested': 'Edit proposed',
  'completion-requested': 'Completion pending',
  completed: 'Completed',
};

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

  providerUid: string;
  providerName: string;
  buyerUid: string;
  buyerName: string;

  isMultiDay: boolean;

  status: AgreementStatus;
  createdAt: number;
  updatedAt: number;

  pendingEdit?: PendingEdit | null;
  // Set to the uid of the party who marked the service completed, while waiting
  // for the other party to confirm. Cleared once both agree (status 'completed').
  completionRequestedBy?: string | null;
}

export type AgreementRole = 'provider' | 'buyer' | 'observer';

// Which side of an agreement a given user is on. Single source of truth so the
// detail screen and the Agreements tab agree on who's the provider vs. buyer.
export function roleOf(agreement: Agreement, uid: string): AgreementRole {
  if (uid === agreement.providerUid) return 'provider';
  if (uid === agreement.buyerUid) return 'buyer';
  return 'observer';
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
}): Agreement {
  const now = Date.now();
  return {
    id: '',
    listingId: args.listingId,
    listingTitle: args.listingTitle,
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
    completionRequestedBy: null,
  };
}
