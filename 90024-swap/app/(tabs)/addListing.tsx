import React from 'react';
import {
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

  const [focusedField, setFocusedField] = React.useState<string>('');
  const [topicDropdownOpen, setTopicDropdownOpen] = React.useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = React.useState(false);

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

  function addToDatabase(newListing: ListingCardProps) {
    console.log('New listing created:', newListing);
  }

  function handleClose() {
    console.log('Close listing form');
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
        <View style={styles.header}>
          <Text style={styles.title}>Create Listing</Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
          <View style={styles.fieldGroup}>
            {renderLabel('Listing Title')}
            <TextInput
              style={[
                styles.input,
                focusedField === 'title' && styles.inputFocus
              ]}
              placeholder="Listing name"
              placeholderTextColor="#999"
              value={newListing.title}
              onChangeText={text => handleInputChange('title', text)}
              onFocus={() => setFocusedField('title')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          <View style={styles.fieldGroup}>
            {renderLabel('Your Name')}
            <TextInput
              style={[
                styles.input,
                focusedField === 'author' && styles.inputFocus
              ]}
              placeholder="Your name"
              placeholderTextColor="#999"
              value={newListing.author}
              onChangeText={text => handleInputChange('author', text)}
              onFocus={() => setFocusedField('author')}
              onBlur={() => setFocusedField('')}
            />
          </View>

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
                value={newListing.price.toString()}
                onChangeText={text => handleInputChange('price', text)}
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
                placeholder="hour / item"
                placeholderTextColor="#999"
                value={newListing.unit}
                onChangeText={text => handleInputChange('unit', text)}
                onFocus={() => setFocusedField('unit')}
                onBlur={() => setFocusedField('')}
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            {renderLabel('Image URL')}
            <TextInput
              style={[
                styles.input,
                focusedField === 'imageUrl' && styles.inputFocus
              ]}
              placeholder="https://image-of-product"
              placeholderTextColor="#999"
              value={newListing.imageUrl}
              onChangeText={text => handleInputChange('imageUrl', text)}
              onFocus={() => setFocusedField('imageUrl')}
              onBlur={() => setFocusedField('')}
            />
          </View>

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
                {newListing.topic.length
                  ? newListing.topic.join(', ')
                  : 'Pick one or more topics'}
              </Text>
              <Text style={styles.chevron}>
                {topicDropdownOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {topicDropdownOpen && (
              <View style={styles.dropdownList}>
                {topics.map((topic, index) => {
                  const selected = newListing.topic.includes(topic);
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dropdownItem,
                        selected && styles.dropdownItemSelected
                      ]}
                      onPress={() => toggleTopic(topic)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          selected && styles.dropdownItemTextSelected
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
              <Text style={styles.chevron}>
                {categoryDropdownOpen ? '▲' : '▼'}
              </Text>
            </TouchableOpacity>

            {categoryDropdownOpen && (
              <View style={styles.dropdownList}>
                {categories.map((category, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      newListing.category === category && styles.dropdownItemSelected
                    ]}
                    onPress={() => addCategory(category)}
                  >
                    <Text
                      style={[
                        styles.dropdownItemText,
                        newListing.category === category && styles.dropdownItemTextSelected
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.fieldGroup}>
            {renderLabel('Description')}
            <TextInput
              style={[
                styles.textarea,
                focusedField === 'description' && styles.inputFocus
              ]}
              placeholder="Describe your listing"
              placeholderTextColor="#999"
              multiline
              value={newListing.description}
              onChangeText={text => handleInputChange('description', text)}
              onFocus={() => setFocusedField('description')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          <View style={styles.fieldGroup}>
            {renderLabel('Email')}
            <TextInput
              style={[
                styles.input,
                focusedField === 'email' && styles.inputFocus
              ]}
              placeholder="username@gmail.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              value={newListing.email}
              onChangeText={text => handleInputChange('email', text)}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
            />
          </View>

          <View style={styles.fieldGroup}>
            {renderLabel('Phone')}
            <TextInput
              style={[
                styles.input,
                focusedField === 'phone' && styles.inputFocus
              ]}
              placeholder="000-000-0000"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
              value={newListing.phone}
              onChangeText={text => handleInputChange('phone', text)}
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField('')}
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={[styles.actionButton, styles.cancelAction]} onPress={handleClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryAction]}
            onPress={() => addToDatabase(newListing)}
          >
            <Text style={styles.primaryText}>Post Listing</Text>
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
    color: '#111'
  },
  chevron: {
    color: '#6b7280',
    fontSize: 14
  },
  dropdownList: {
    marginTop: 8,
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
    backgroundColor: '#f8f9fb'
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
  cancelText: {
    color: '#334155',
    fontWeight: '700'
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700'
  }
});