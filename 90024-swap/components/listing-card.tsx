import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { ListingCardProps } from './Listing.types';

export const ListingCard: React.FC<ListingCardProps> = ({
  title,
  author,
  price,
  unit,
  imageUrl,
  topic,
  category,
  description,
  email,
  phone,
  version,
  eventHandler
}) => {
  return (
    <TouchableOpacity onPress={eventHandler} style={{ padding: 10, borderBottomWidth: 1 }}>
      <Image source={{ uri: imageUrl }} style={{ width: 100, height: 100 }} />
      
      <View>
        <Text style={{ fontWeight: 'bold' }}>{title}</Text>
        <Text>By {author}</Text>
        <Text>${price} / {unit}</Text>
        <Text>Category: {category}</Text>
      </View>

      {version !== 'compact' && (
        <View>
          <Text>{description}</Text>
          {email && <Text>Email: {email}</Text>}
          {phone && <Text>Phone: {phone}</Text>}
        </View>
      )}

      <Text style={{ color: 'blue', marginTop: 5 }}>
        {version === 'compact' ? "See more..." : "See less..."}
      </Text>
    </TouchableOpacity>
  );
};