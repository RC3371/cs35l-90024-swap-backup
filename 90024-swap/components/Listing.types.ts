// Metadata to sort listing into correct category 
export enum Categories {
    Skills = 'Skills',
    Goods = 'Goods'
}

// Metadata to aid in filtering and searching for listings by topic 
// NOTE: need to add more here and make it more specific
export enum Topics {
    Programming = 'Programming',
    Design = 'Design',
    Writing = 'Writing',
    Marketing = 'Marketing',
    Tutoring = 'Tutoring',
    Other = 'Other'
}

// Props for the listing card component. The version prop determines whether the card is in compact or description mode.
export interface ListingCardProps {
    title: string;
    author: string;
    price: number;
    unit: string;
    topic: Topics[];
    category: Categories;
    version: 'compact' | 'description';

    // Identity fields (populated once a listing is persisted to Firestore)
    id?: string;     // Firestore document id
    owner?: string;  // uid of the user who created the listing
    status?: 'active' | 'archived'; // archived listings are hidden from the feed

    // Optional props to accomodate the description version of the card
    description?: string;
    email?: string;
    phone?: string;
    imageUrl?: string;

    eventHandler?: () => void; // Note: In the parent component, logic should be to "flip" the version of the card between compact and description when the button is clicked. So if the current version is compact, it should change to description, and vice versa.

    // Optional interactions layered on top of the base card
    onAuthorPress?: () => void; // makes the "By {author}" line tappable (feed -> provider profile)
    onEdit?: () => void;        // when set, renders an Edit action (owner viewing own listing)
    onDelete?: () => void;      // when set, renders a Delete action (owner viewing own listing)
    onArchive?: () => void;     // when set, renders an Archive action (owner, active listing)
    onUnarchive?: () => void;   // when set, renders an Unarchive action (owner, archived listing)
    isSaved?: boolean;          // bookmark state, used with onToggleSave
    onToggleSave?: () => void;  // when set, renders a bookmark toggle (feed / provider / saved view)
}