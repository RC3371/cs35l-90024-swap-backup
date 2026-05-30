
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ListingCardProps } from './Listing.types';


export const ListingCard: React.FC<ListingCardProps> = ({
  title,
  author,
  price,
  unit,
  topic,
  category,
  description,
  email,
  phone,
  version,
  eventHandler,
  onAuthorPress,
  onEdit,
  onDelete
}) => {
  const [currentVersion, setCurrentVersion] = useState(version ?? 'compact');

  return (
    <TouchableOpacity onPress={eventHandler} style={styles.card} activeOpacity={0.9}>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.priceWrap}>
            <Text style={styles.price}>${price?.toFixed?.(2) ?? '-'}</Text>
            <Text style={styles.unit}>/{unit}</Text>
          </View>
        </View>

        {onAuthorPress ? (
          <Pressable onPress={onAuthorPress} hitSlop={6}>
            <Text style={[styles.meta, styles.authorLink]}>By {author}</Text>
          </Pressable>
        ) : (
          <Text style={styles.meta}>By {author}</Text>
        )}

        <View style={styles.badgeRow}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
          <View style={styles.topicRow}>
            {topic?.map((t, i) => (
              <View key={i} style={styles.topicPill}>
                <Text style={styles.topicText}>{String(t)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Description is completely hidden in compact mode */}
        {currentVersion !== 'compact' && (
          <View style={styles.descriptionWrap}>
            <Text style={styles.descriptionText}>{description}</Text>
            {email ? <Text style={styles.contact}>Email: {email}</Text> : null}
            {phone ? <Text style={styles.contact}>Phone: {phone}</Text> : null}
          </View>
        )}

        <View style={styles.footerRow}>
          <TouchableOpacity
            onPress={() => setCurrentVersion(prev => (prev === 'compact' ? 'description' : 'compact'))}
            style={styles.toggleButton}
          >
            <Text style={styles.toggleText}>
              {currentVersion === 'compact' ? 'See more...' : 'See less...'}
            </Text>
          </TouchableOpacity>

          {(onEdit || onDelete) && (
            <View style={styles.actionRow}>
              {onEdit && (
                <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              )}
              {onDelete && (
                <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 12,
    marginBottom: 12, 
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e6e6e6',
    backgroundColor: '#fff',
    alignItems: 'flex-start',
    borderRadius: 8 
  },
  content: {
    flex: 1,
    justifyContent: 'space-between'
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    flexShrink: 1,
    marginRight: 8
  },
  priceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline'
  },
  price: {
    color: '#0a84ff',
    fontWeight: '700',
    fontSize: 15
  },
  unit: {
    color: '#666',
    marginLeft: 4,
    fontSize: 12
  },
  meta: {
    color: '#666',
    fontSize: 13,
    marginTop: 4
  },
  authorLink: {
    color: '#0a84ff',
    fontWeight: '600',
    textDecorationLine: 'underline'
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8
  },
  categoryBadge: {
    backgroundColor: '#eef6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8
  },
  categoryText: {
    color: '#0a66ff',
    fontSize: 12,
    fontWeight: '600'
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  topicPill: {
    backgroundColor: '#f4f4f4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    marginRight: 6
  },
  topicText: {
    fontSize: 11,
    color: '#444'
  },
  descriptionWrap: {
    marginTop: 8
  },
  descriptionText: {
    color: '#333',
    fontSize: 13,
    lineHeight: 18
  },
  contact: {
    color: '#555',
    fontSize: 12,
    marginTop: 6
  },
  footerRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  toggleButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 6
  },
  toggleText: {
    color: '#0a84ff',
    fontWeight: '600',
    fontSize: 13
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  actionButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginLeft: 4
  },
  editText: {
    color: '#0a66ff',
    fontWeight: '600',
    fontSize: 13
  },
  deleteText: {
    color: '#d32f2f',
    fontWeight: '600',
    fontSize: 13
  }
});
