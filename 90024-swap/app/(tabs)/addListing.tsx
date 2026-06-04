import { useAuth } from '@/contexts/AuthContext';
import {
  createListing,
  getListing,
  ListingStatus,
  setListingStatus,
  updateListing,
} from '@/services/listings';
import { getUserProfile } from '@/services/users';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { Categories, ListingCardProps, Topics } from '../../components/Listing.types';

export default function AddListing() {
  const router = useRouter();
  const { user } = useAuth();
  const { listingId } = useLocalSearchParams<{ listingId?: string }>();
  const isEdit = !!listingId;

  const [newListing, setNewListing] = React.useState<ListingCardProps>({
    title: '',
    author: '',
    price: 0,
    unit: '',
    topic: [],
    category: Categories.Skills,
    version: 'compact',
    description: '',
  });

  const [focusedField, setFocusedField] = React.useState<string>('');
  const [topicDropdownOpen, setTopicDropdownOpen] = React.useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  // Status of the listing being edited ('draft' vs 'active'); undefined when creating.
  const [editStatus, setEditStatus] = React.useState<ListingStatus | undefined>();
  const isDraft = editStatus === 'draft';

  // In edit mode, load the existing listing and prefill the form. In create
  // mode (no listingId) reset to a blank form. This runs on every focus (not
  // just when listingId changes) because the tab stays mounted — otherwise
  // re-opening "New" after creating a listing would keep the stale data.
  useFocusEffect(
    React.useCallback(() => {
      if (!listingId) {
        setEditStatus(undefined);
        setNewListing({
          title: '',
          author: '',
          price: 0,
          unit: '',
          topic: [],
          category: Categories.Skills,
          version: 'compact',
          description: '',
        });
        setTopicDropdownOpen(false);
        setCategoryDropdownOpen(false);
        setFocusedField('');
        return;
      }
      let active = true;
      (async () => {
        const listing = await getListing(listingId);
        if (active && listing) {
          setEditStatus(listing.status);
          setNewListing({
            ...listing,
            version: 'compact',
            description: listing.description ?? '',
          });
        }
      })();
      return () => {
        active = false;
      };
    }, [listingId]),
  );

  const topics = Object.values(Topics) as Topics[];
  const categories = Object.values(Categories) as Categories[];

  function handleInputChange(
    field: keyof ListingCardProps,
    value: string | number | Categories | Topics[]
  ) {
    setNewListing(prevListing => ({
      ...prevListing,
      [field]:
        field === 'price' && typeof value === 'string'
          ? parseFloat(value) || 0
          : value
    } as ListingCardProps));
  }

  function toggleTopic(value: Topics) {
    setNewListing(prevListing => ({
      ...prevListing,
      topic: prevListing.topic.includes(value)
        ? prevListing.topic.filter(t => t !== value)
        : [...prevListing.topic, value]
    }));
  }

  function addCategory(value: Categories) {
    handleInputChange('category', value);
    setCategoryDropdownOpen(false);
  }

  // target 'active' = post/publish (requires a title); 'draft' = save privately.
  async function save(target: ListingStatus) {
    if (target === 'active' && !newListing.title.trim()) {
      Alert.alert('Missing title', 'Please give your listing a title.');
      return;
    }
    if (!user) {
      Alert.alert('Not signed in', 'You must be signed in to save a listing.');
      return;
    }

    setSubmitting(true);
    try {
      // Contact info is sourced from the poster's profile, not entered per-listing.
      const profile = await getUserProfile(user.uid);
      const phoneDisplay =
        profile?.phoneCountryCode && profile?.phoneNumber
          ? `${profile.phoneCountryCode} ${profile.phoneNumber}`
          : profile?.phone ?? '';
      const withContact = {
        ...newListing,
        email: profile?.email ?? user.email ?? '',
        phone: phoneDisplay,
      };

      if (isEdit && listingId) {
        await updateListing(listingId, withContact);
        // Publishing a draft (or keeping a draft a draft) needs an explicit
        // status write; editing an already-active listing leaves it active.
        if (target !== editStatus) {
          await setListingStatus(listingId, target);
        }
      } else {
        await createListing(withContact, user.uid, user.displayName ?? 'Anonymous', target);
      }
      router.back();
    } catch (err) {
      console.error('Failed to save listing', err);
      Alert.alert('Error', 'Could not save your listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    router.back();
  }

  const renderLabel = (label: string) => (
    <Text style={styles.label}>
      {label}
      <Text style={styles.required}> *</Text>
    </Text>
  );

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.screen}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>{isEdit ? 'Edit Listing' : 'Create Listing'}</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          
          {/* Listing Title */}
          <View style={styles.fieldGroup}>
            {renderLabel('Listing Title')}
            <TextInput
              style={[
                styles.input,
                focusedField === 'title' && styles.inputFocus
              ]}
              placeholder="e.g., Physics 1A Tutoring"
              placeholderTextColor="#999"
              value={newListing.title}
              onChangeText={(text) => handleInputChange('title', text)}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Price & Unit Row */}
          <View style={styles.row}>
            <View style={[styles.fieldGroup, styles.halfWidth]}>
              {renderLabel('Price')}
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'price' && styles.inputFocus
                ]}
                placeholder="$0.00"
                placeholderTextColor="#999"
                keyboardType="numeric"
                value={newListing.price === 0 ? '' : newListing.price.toString()}
                onChangeText={(text) => handleInputChange('price', text)}
                onFocus={() => setFocusedField('price')}
                onBlur={() => setFocusedField('')}
              />
            </View>

            <View style={[styles.fieldGroup, styles.halfWidth]}>
              {renderLabel('Unit')}
              <TextInput
                style={[
                  styles.input,
                  focusedField === 'unit' && styles.inputFocus
                ]}
                placeholder="e.g., hour / item"
                placeholderTextColor="#999"
                value={newListing.unit}
                onChangeText={(text) => handleInputChange('unit', text)}
                onFocus={() => setFocusedField('unit')}
                onBlur={() => setFocusedField('')}
              />
            </View>
          </View>

          {/* Topics Accordion/Dropdown */}
          <View style={styles.fieldGroup}>
            {renderLabel('Topics')}
            <TouchableOpacity
              style={[
                styles.selectBox,
                focusedField === 'topic' && styles.inputFocus
              ]}
              onPress={() => {
                setTopicDropdownOpen(prev => !prev);
                setCategoryDropdownOpen(false);
                setFocusedField('topic');
              }}
            >
              <Text style={styles.selectText}>
                {newListing.topic.length > 0
                  ? newListing.topic.join(', ')
                  : 'Select relevant campus topics'}
              </Text>
              <Text style={styles.chevron}>{topicDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {topicDropdownOpen && (
              <View style={styles.dropdownList}>
                {topics.map((topic, index) => {
                  const isSelected = newListing.topic.includes(topic);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected
                      ]}
                      onPress={() => toggleTopic(topic)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected
                        ]}
                      >
                        {topic}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Category Accordion/Dropdown */}
          <View style={styles.fieldGroup}>
            {renderLabel('Category')}
            <TouchableOpacity
              style={[
                styles.selectBox,
                focusedField === 'category' && styles.inputFocus
              ]}
              onPress={() => {
                setCategoryDropdownOpen(prev => !prev);
                setTopicDropdownOpen(false);
                setFocusedField('category');
              }}
            >
              <Text style={styles.selectText}>{newListing.category}</Text>
              <Text style={styles.chevron}>{categoryDropdownOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {categoryDropdownOpen && (
              <View style={styles.dropdownList}>
                {categories.map((category, index) => {
                  const isSelected = newListing.category === category;
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        isSelected && styles.dropdownItemSelected
                      ]}
                      onPress={() => addCategory(category)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          isSelected && styles.dropdownItemTextSelected
                        ]}
                      >
                        {category}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            {renderLabel('Description')}
            <TextInput
              style={[
                styles.textarea,
                focusedField === 'description' && styles.inputFocus
              ]}
              placeholder="Describe what you are offering to the UCLA community..."
              placeholderTextColor="#999"
              multiline
              value={newListing.description}
              onChangeText={text => handleInputChange('description', text)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          {/* Contact info (email & phone) is taken from your profile automatically. */}

        </ScrollView>

        {/* Footer/Action Buttons */}
        <View style={styles.footer}>
          <TouchableOpacity style={[styles.actionButton, styles.cancelAction]} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {/* Save Draft is offered for new listings and when editing a draft. */}
          {(!isEdit || isDraft) && (
            <TouchableOpacity
              style={[styles.actionButton, styles.draftAction, submitting && styles.disabledAction]}
              onPress={() => save('draft')}
              disabled={submitting}
            >
              <Text style={styles.draftText}>{submitting ? '...' : 'Save Draft'}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction, submitting && styles.disabledAction]}
            onPress={() => save('active')}
            disabled={submitting}
          >
            <Text style={styles.primaryText}>
              {submitting
                ? 'Saving...'
                : !isEdit
                  ? 'Post Listing'
                  : isDraft
                    ? 'Publish'
                    : 'Save Changes'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f8f9fb'
  },
  screen: {
    flex: 1,
    paddingTop: 20
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111'
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef2ff'
  },
  closeText: {
    fontSize: 24,
    color: '#1a4ed6',
    lineHeight: 26
  },
  form: {
    paddingHorizontal: 20,
    paddingBottom: 140,
    gap: 16
  },
  fieldGroup: {
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222'
  },
  required: {
    color: '#d32f2f'
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 12,
    paddingHorizontal: 14,
    color: '#111',
    backgroundColor: '#fff'
  },
  textarea: {
    minHeight: 120,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 14,
    color: '#111',
    backgroundColor: '#fff',
    textAlignVertical: 'top'
  },
  selectBox: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#d7dce3',
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  selectText: {
    color: '#111',
    flex: 1
  },
  chevron: {
    color: '#6b7280',
    fontSize: 14,
    marginLeft: 8
  },
  dropdownList: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden'
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f1f5f9'
  },
  dropdownItemSelected: {
    backgroundColor: '#eef2ff'
  },
  dropdownItemText: {
    color: '#111'
  },
  dropdownItemTextSelected: {
    color: '#1e40af',
    fontWeight: '700'
  },
  inputFocus: {
    borderColor: '#4f8bff',
    shadowColor: '#4f8bff',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  row: {
    flexDirection: 'row',
    gap: 12
  },
  halfWidth: {
    flex: 1
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    backgroundColor: '#f8f9fb',
    borderTopWidth: 1,
    borderTopColor: '#eef2ff'
  },
  actionButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  cancelAction: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff'
  },
  primaryAction: {
    backgroundColor: '#2563eb'
  },
  draftAction: {
    borderWidth: 1,
    borderColor: '#2563eb',
    backgroundColor: '#eef2ff'
  },
  draftText: {
    color: '#2563eb',
    fontWeight: '700'
  },
  disabledAction: {
    opacity: 0.6
  },
  cancelText: {
    color: '#334155',
    fontWeight: '700'
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700'
  }
});