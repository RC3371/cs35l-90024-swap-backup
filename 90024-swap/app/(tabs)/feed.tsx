import { ListingCard } from '@/components/listing-card';
import { useAuth } from '@/contexts/AuthContext';
import { getAllListings, Listing } from '@/services/listings';
import { getSavedListingIds, savePost, unsavePost } from '@/services/saved';
import { useFocusEffect, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';
import { Categories } from '../../components/Listing.types';
import { PillFilterCarousel, PillOption } from '../../components/PillFilterCarousel';
import { SearchBar } from '../../components/SearchBar';
import { SegmentedControl } from '../../components/SegmentedControl';

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
                        onAuthorPress={
                            listing.owner
                                ? () => router.push(`/provider/${listing.owner}`)
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