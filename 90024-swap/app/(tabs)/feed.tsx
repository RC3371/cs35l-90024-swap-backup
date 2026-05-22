import { ListingCard } from '@/components/listing-card';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { SegmentedControl } from '../../components/SegmentedControl';
import { SearchBar } from '../../components/SearchBar';
import { PillFilterCarousel, PillOption } from '../../components/PillFilterCarousel';
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

    // first filter by category by default

    
    const [filterCategory, setFilterCategory] = React.useState<Categories>(Categories.Skills); // default filter category is skills. 

    function handleFilterCategory(category: Categories) { 
        setFilterCategory(category);
    }

    let filteredData = database.filter(item => item.category === filterCategory); // filter by category first

    const [selectedPill, setSelectedPill] = React.useState<PillOption>('All');

    function handlePillSelect(option: PillOption) {
        setSelectedPill(option);
    }

    // Filter the data based on the search term

    const [filterSearch, setFilterSearch] = React.useState('');
    function handleFilterSearch(query: string) {
        setFilterSearch(query); // filter by search term 
    }


    if (filterSearch.trim() !== '') {
        filteredData = filteredData.filter(item => 
            item.title.toLowerCase().includes(filterSearch.toLowerCase()) ||
            item.description?.toLowerCase().includes(filterSearch.toLowerCase())
        );
    }
    return (
        <View style={{ flex: 1 }}>
            <SearchBar
                query={filterSearch}
                onSearch={handleFilterSearch}
            />
            <SegmentedControl value={filterCategory} onChange={handleFilterCategory} />
            <PillFilterCarousel selectedOption={selectedPill} onSelect={handlePillSelect} />

            <ScrollView style={{ flex: 1 }}>
                {filteredData.map((listing, index) => (
                    <ListingCard key={index} {...listing} />
                ))}
            </ScrollView>
        </View>
    );
}