import React from 'react';
import { Button, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Categories, ListingCardProps, Topics } from '../../components/Listing.types';



export default function AddListing() {
    const [newListing, setNewListing] = React.useState<ListingCardProps>({
        title: '',
        author: '',
        price: 0,
        unit: '',
        imageUrl: '',
        topic: [], 
        category: Categories.Skills,
        version: 'compact',
        description: '', 
        email: '', 
        phone: ''
    });

    function handleInputChange(field: keyof ListingCardProps, value: string | Topics[] | number | Categories) { // add to the current listing being created
    setNewListing(prevListing => ({
        ...prevListing,
        [field]: field ==='price' && typeof value === 'string' ? parseFloat(value) || 0 : value // if price, convert to number before adding
        }));
    }

    function addTopic(field: keyof ListingCardProps, value: Topics) { // add topic to the current listing being created
        setNewListing(prevListing => ({
            ...prevListing,
            [field]: prevListing.topic.includes(value) ? prevListing.topic.filter(t => t !== value) : [...prevListing.topic, value] // if topic already exists, remove it from the list, otherwise add it to the list
        }))
        handleInputChange(field, value); // add topic to the listing as well so it can be submitted to the database
    }

    function addCategory(field: keyof ListingCardProps, value: Categories) {
        handleInputChange(field, value)
    }

    function addToDatabase(newListing: ListingCardProps) { // placeholder, will need backend for this
        console.log("New listing created:", newListing)
    }

    const topics = Object.values(Topics); // change topics to object to iterate over
    const categories = Object.values(Categories); // change categories to iterate over


    return (

        // text input fields for user to enter details about their listing 
        <>
        <TextInput
            placeholder="Listing "
            value={newListing.title}
            onChangeText={(text) => handleInputChange('title', text)}
        />
        <TextInput
            placeholder="Your Name"
            value={newListing.author}
            onChangeText={(text) => handleInputChange('author', text)}
        />
        <TextInput
            placeholder="$0.00"
            keyboardType="numeric"
            value={newListing.price.toString()}
            onChangeText={(text) => handleInputChange('price', text)}
        />
        <TextInput
            placeholder="https://image-of-product"
            value={newListing.imageUrl}
            onChangeText={(text) => handleInputChange('imageUrl', text)}
        />
        <View>
            {topics.map((topic, index) => (
                <TouchableOpacity key={index} onPress={() => addTopic('topic', topic)}>
                    <Text>{topic}</Text>
                </TouchableOpacity>
            ))}
        </View>

        <View>
            {categories.map((category, index)=>(
                <TouchableOpacity key={index} onPress = {()=>addCategory('category', category)}>
                    <Text>{category}</Text>
                </TouchableOpacity>
            ))
            }

        </View>

        <TextInput 
            placeholder="Choose a Category"
            value={newListing.category}
            onChangeText={(text) => handleInputChange('category', text)}
        />

        <TextInput
            placeholder="Description"
            multiline
            value={newListing.description}
            onChangeText={(text) => handleInputChange('description', text)}
        />
        <TextInput
            placeholder="username@gmail.com"
            value={newListing.email}
            onChangeText={(text) => handleInputChange('email', text)}
        />
        <TextInput
            placeholder="000-000-0000"
            value={newListing.phone}
            onChangeText={(text) => handleInputChange('phone', text)}
        />

            <Button title="Submit Listing" onPress={() => addToDatabase(newListing)} />
        </>


    );
}