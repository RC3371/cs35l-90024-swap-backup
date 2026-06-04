import { ListingCard } from '@/components/listing-card';
import { db } from '@/constants/firebaseConfig';
import { useAuth } from '@/contexts/AuthContext';
import { getAllListings, Listing } from '@/services/listings';
import { getSavedListingIds, savePost, unsavePost } from '@/services/saved';
import { addDoc, collection, getDocs, query, where } from '@firebase/firestore';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Categories } from '../../components/Listing.types';
import { PillFilterCarousel, PillOption } from '../../components/PillFilterCarousel';
import { SearchBar } from '../../components/SearchBar';
import { SegmentedControl } from '../../components/SegmentedControl';
//import { addDoc, collection, getDocs, query, where } from '@firebase/firestore';
//import { db } from '@/constants/firebaseConfig';

export default function Feed() {

    const router = useRouter();
    const { user } = useAuth();
    const viewerUid = user?.uid;

    // Live listings loaded from Firestore. Refreshed whenever the feed gains focus
    // so new/edited/deleted listings show up without a manual reload.
    const [database, setDatabase] = React.useState<Listing[]>([]);
    const [savedIds, setSavedIds] = React.useState<Set<string>>(new Set());

    useFocusEffect(
        React.useCallback(() => {
            let active = true;
            Promise.all([
                getAllListings(),
                viewerUid ? getSavedListingIds(viewerUid) : Promise.resolve(new Set<string>()),
            ])
                .then(([listings, ids]) => {
                    if (active) {
                        setDatabase(listings);
                        setSavedIds(ids);
                    }
                })
                .catch((err) => console.error('Failed to load listings', err));
            return () => {
                active = false;
            };
        }, [viewerUid]),
    );

    async function handleToggleSave(listing: Listing) {
        if (!viewerUid || !listing.id) return;
        const id = listing.id;
        const isSaved = savedIds.has(id);
        setSavedIds((prev) => {
            const next = new Set(prev);
            if (isSaved) next.delete(id);
            else next.add(id);
            return next;
        });
        try {
            if (isSaved) await unsavePost(viewerUid, id);
            else await savePost(viewerUid, id);
        } catch (err) {
            console.error('Failed to toggle saved post', err);
        }
    }

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
                {filteredData.map((listing) => (
                    <ListingCard
                        key={listing.id}
                        {...listing}
                        version="compact"
                        viewerUid={viewerUid}
                        onAuthorPress={
                            listing.owner
                                ? () => router.push(`/provider/${listing.owner}`)
                                : undefined
                        }
                        onMessage={
                            listing.owner && listing.owner !== viewerUid
                                ? async () => {
                                        if (!viewerUid || !listing.id) {
                                            return;
                                        }
                                        const checkExistingQuery = query(
                                            collection(db, "conversations"), 
                                            where ("buyer_id", "==", viewerUid),
                                            where ("listing_id", "==", listing.id)
                                        )
                                        try {
                                            const existingConversation = await getDocs(checkExistingQuery)
                                            if(!existingConversation.empty) {
                                                router.push({
                                                    pathname: '/(messages)/ConversationView',
                                                    params: {
                                                        recipient: listing.author,
                                                        title: listing.title,
                                                        conversationId: existingConversation.docs[0].id,
                                                    },
                                                })
                                                return;
                                            }
                                            const newConversation = await addDoc(collection(db, "conversations"), {
                                                listing_id: listing.id,
                                                buyer_id: viewerUid,
                                                seller_id: listing.owner,
                                                participants: [viewerUid, listing.owner],
                                                title: listing.title,
                                                last_message_content: null,
                                                last_message_at: null,
                                                last_message_id: null,
                                                created_at: new Date().toISOString()
                                            })
                                        
                                            router.push({
                                                pathname: '/(messages)/ConversationView',
                                                params: {
                                                    recipient: listing.author,
                                                    title: listing.title,
                                                    conversationId: newConversation.id,
                                                },
                                            })
                                        } catch (error) {
                                            console.error("Could not create conversation", error)
                                            return
                                        }
                                    }
                                : undefined
                        }
                        isSaved={listing.id ? savedIds.has(listing.id) : false}
                        onToggleSave={
                            viewerUid && listing.owner !== viewerUid
                                ? () => handleToggleSave(listing)
                                : undefined
                        }
                    />
                ))}
            </ScrollView>
        </View>
    );
}
