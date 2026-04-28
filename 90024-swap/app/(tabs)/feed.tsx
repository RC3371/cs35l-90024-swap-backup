import { ListingCard } from '@/components/listing-card';
import { Categories, Topics, ListingCardProps } from '../../components/Listing.types';

// Example data to test the feed component. Will switch to data from backend once we have that set up. 
// Note: the version prop is set to 'compact' by default, but will be flipped to 'description' when the card is clicked, and vice versa. 
const database: ListingCardProps[] = [
    { 
        title: "Example Listing", 
        author: "John Doe", 
        price: 10.99, 
        unit: "hour", 
        imageUrl: "/example-image.jpg", 
        topic: [Topics.Programming], 
        category: Categories.Skills,
        version: 'compact' 
    },
    {
        title: "Another Listing",
        author: "Jane Smith",
        price: 5.00,
        unit: "item",       
        imageUrl: "/another-image.jpg",
        topic: [Topics.Design, Topics.Marketing], 
        category: Categories.Goods,
        version: 'compact'
    },
    {
        title: "Tutoring Services",
        author: "Alice Johnson",
        price: 20.00,
        unit: "hour",
        imageUrl: "/tutoring-image.jpg",
        topic: [Topics.Tutoring],
        category: Categories.Skills,
        version: 'compact'
    }
];


export function feed({database}: {database: ListingCardProps[]}) {
    return (
        <div className="feed">
            {database.map((listing, index) => ( // map through the database and render a listing card for each listing. The key is set to the index of the listing in the database, but in a real application, it should be set to a unique identifier for each listing (e.g. listing ID from the backend).
                <ListingCard key={index} {...listing} />
            ))}
        </div>
    );
}