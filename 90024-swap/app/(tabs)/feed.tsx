import { ListingCard } from '@/components/listing-card';
import React from 'react';
import { ScrollView } from 'react-native';
import { FilterButton } from '../../components/FilterButton';
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

    const topics = Object.values(Topics);
    const categories = Object.values(Categories);

    const [filterTopic, setFilterTopic] = React.useState<Topics[]>([])
    function handleFilterTopic(topic: Topics) {
        if (!filterTopic.includes(topic)) { // add topic to filter 
            setFilterTopic([...filterTopic, topic]);
        } else { // remove from filter list if userc clicks again 
            setFilterTopic(filterTopic.filter(t => t !== topic));
        }
    }

    const [filterCategory, setFilterCategory] = React.useState<Categories>(Categories.Skills); // default filter category is skills. 
    function handleFilterCategory(category: Categories) { 
        setFilterCategory(category);
    }

    let filteredData = database.filter(item => item.category === filterCategory); // filter by category first
    if (filterTopic.length !== 0) {
        filteredData = filteredData.filter(item => 
            // filter by topic if in filter list.
            item.topic.some(t => filterTopic.includes(t))
        );
    }
    return (
        <>
        {/* Display all data */}
        <ScrollView style={{ flex: 1 }}> 
            {filteredData.map((listing, index) => (
                <ListingCard key={index} {...listing} />
            ))}
        </ScrollView>
        {/* display filter buttons for topics and categories */}
        <ScrollView style={{ flex: 1 }}>
            {
                topics.map((topic, index) => (
                    <FilterButton key={index} text={topic} onPress={() => handleFilterTopic(topic)} />
                ))
            }
        </ScrollView>
                <ScrollView style={{ flex: 1 }}>
            {
                categories.map((category, index) => (
                    <FilterButton key={index} text={category} onPress={() => handleFilterCategory(category)} />
                ))
            }
        </ScrollView>
        </>
        
    );
}