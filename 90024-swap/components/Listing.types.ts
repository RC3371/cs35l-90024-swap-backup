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

    // Optional props to accomodate the description version of the card
    description?: string; 
    email?: string; 
    phone?: string; 

    eventHandler?: () => void; // Note: In the parent component, logic should be to "flip" the version of the card between compact and description when the button is clicked. So if the current version is compact, it should change to description, and vice versa.
}