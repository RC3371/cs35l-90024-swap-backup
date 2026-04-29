import { ListingCard } from '@/components/listing-card';
import { ScrollView } from 'react-native';
import { Categories, ListingCardProps, Topics } from '../../components/Listing.types';

// Example data to test the feed component. Will switch to data from backend once we have that set up. 
// Note: the version prop is set to 'compact' by default, but will be flipped to 'description' when the card is clicked, and vice versa. 
const database: ListingCardProps[] = [
    { 
        title: "Example Listing", 
        author: "John Doe", 
        price: 10.99, 
        unit: "hour", 
        imageUrl: "../../assets/icon.png", 
        topic: [Topics.Programming], 
        category: Categories.Skills,
        version: 'compact' 
    },
    {
        title: "Another Listing",
        author: "Jane Smith",
        price: 5.00,
        unit: "item",       
        imageUrl: "../../assets/another-image.png",
        topic: [Topics.Design, Topics.Marketing], 
        category: Categories.Goods,
        version: 'compact'
    },
    {
        title: "Tutoring Services",
        author: "Alice Johnson",
        price: 20.00,
        unit: "hour",
        imageUrl: "../../assets/tutoring-image.jpg",
        topic: [Topics.Tutoring],
        category: Categories.Skills,
        version: 'compact'
    }
];


export default function Feed() { 
    return (
        <ScrollView style={{ flex: 1 }}> 
            {database.map((listing, index) => (
                <ListingCard key={index} {...listing} />
            ))}
        </ScrollView>
    );
}