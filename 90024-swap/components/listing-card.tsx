import React from 'react';

enum Categories {
    Skills = 'Skills',
    Goods = 'Goods'
}
enum Topics {
    Programming = 'Programming',
    Design = 'Design',
    Writing = 'Writing',
    Marketing = 'Marketing',
    Tutoring = 'Tutoring',
    Other = 'Other'
}
interface ListingCardProps {
    title: string;
    author: string;
    price: number;
    unit: string;
    imageUrl: string;
    topic: Topics; 
    category: Categories; 
    eventHandler?: () => void;
}


export const ListingCard: React.FC<ListingCardProps> = ({title, author, price, unit, imageUrl, topic, category, eventHandler}: ListingCardProps) => {
    return (
        <div className="listing-card" onClick={eventHandler}>
            <img src={imageUrl} alt={title} className="listing-image" />
            <div className="listing-details">
                <h3 className="listing-title">{title}</h3>
                <p className="listing-author">By {author}</p>
                <p className="listing-price">${price} / {unit}</p>
                <p className="listing-topic">Topic: {topic}</p>
                <p className="listing-category">Category: {category}</p>
            </div>
            <button onClick={eventHandler} className="listing-button">See more...</button>
        </div>


    );
}