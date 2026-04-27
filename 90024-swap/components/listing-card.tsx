import React from 'react';

/*
This is the listing card component. It handles both the compact and description versions of the card.
The parent component should handle the logic of flipping between the two versions when the button is clicked.
The card displays the title, author, price, unit, image, topic, category, 
description (if in description version), and contact information (if in description version). 
The event handler is passed down from the parent component to handle the click event on the card and button.
*/

// Metadata to sort listing into correct category 
enum Categories {
    Skills = 'Skills',
    Goods = 'Goods'
}

// Metadata to aid in filtering and searching for listings by topic 
// NOTE: need to add more here and make it more specific
enum Topics {
    Programming = 'Programming',
    Design = 'Design',
    Writing = 'Writing',
    Marketing = 'Marketing',
    Tutoring = 'Tutoring',
    Other = 'Other'
}

// Props for the listing card component. The version prop determines whether the card is in compact or description mode.
interface ListingCardProps {
    title: string;
    author: string;
    price: number;
    unit: string;
    imageUrl: string;
    topic: Topics[]; 
    category: Categories; 
    version: 'compact' | 'description';

    // Optional props to accomodate the description version of the card
    description?: string; 
    email?: string; 
    phone?: string; 

    eventHandler?: () => void; // Note: In the parent component, logic should be to "flip" the version of the card between compact and description when the button is clicked. So if the current version is compact, it should change to description, and vice versa.
}


export const ListingCard: React.FC<ListingCardProps> = ({title, author, price, unit, imageUrl, topic, category, description, email, phone, version, eventHandler}: ListingCardProps) => {
    if (version === 'compact') // UI if the card is in compact mode, which only shows the basic information about the listing. 
    {
        return (
            <div className="compact-listing-card" onClick={eventHandler}>
            <img src={imageUrl} alt={title} className="listing-image" />
            <div className="listing-details">
                <h3 className="listing-title">{title}</h3>
                <p className="listing-author">By {author}</p>
                <p className="listing-price">${price} / {unit}</p>
                <p className="listing-topic">Topic: {topic.join(', ')}</p>
                <p className="listing-category">Category: {category}</p>
            </div>
            <button onClick={eventHandler} className="listing-button">See more...</button>
        </div>
    );
    } else { // UI if the card is in description mode, which shows all the information about the listing, including the description and contact information.
        return (
            <div className="description-listing-card" onClick={eventHandler}>
                <img src={imageUrl} alt={title} className="listing-image" />
                <div className="listing-details">
                    <h3 className="listing-title">{title}</h3>
                    <p className="listing-author">By {author}</p>
                    <p className="listing-price">${price} / {unit}</p>
                    <p className="listing-topic">Topic: {topic.join(', ')}</p>
                    <p className="listing-category">Category: {category}</p>
                    <p className="listing-description">Description: {description}</p>
                    {email && <p className="listing-contact">Email: {email}</p>}
                    {phone && <p className="listing-contact">Phone: {phone}</p>}
                </div>
                <button onClick={eventHandler} className="listing-button">See less...</button>
            </div>
        );

    }
}