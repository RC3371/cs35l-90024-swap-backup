import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

const options = ['All', 'Tutoring', 'Creative', 'Tech', 'Language'] as const;
export type PillOption = (typeof options)[number];

interface PillFilterCarouselProps {
    selectedOption: PillOption;
    onSelect: (option: PillOption) => void;
}

export const PillFilterCarousel: React.FC<PillFilterCarouselProps> = ({ selectedOption, onSelect }) => {
    return (
        <View style={styles.wrapper}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
                bounces
                snapToAlignment="start"
            >
                {options.map(option => {
                    const isActive = selectedOption === option;

                    return (
                        <Pressable
                            key={option}
                            onPress={() => onSelect(option)}
                            style={({ pressed }) => [
                                styles.pill,
                                isActive ? styles.activePill : styles.inactivePill,
                                pressed && styles.pressed,
                            ]}
                        >
                            <Text style={[styles.label, isActive ? styles.activeLabel : styles.inactiveLabel]}>
                                {option}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        marginTop: 8,
    },
    contentContainer: {
        paddingHorizontal: 16,
        paddingVertical: 6,
    },
    pill: {
        borderRadius: 999,
        paddingVertical: 10,
        paddingHorizontal: 18,
        marginRight: 10,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 44,
    },
    activePill: {
        backgroundColor: '#2563eb',
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.18,
        shadowRadius: 16,
        elevation: 3,
    },
    inactivePill: {
        backgroundColor: '#f3f4f6',
    },
    pressed: {
        opacity: 0.85,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        letterSpacing: 0.2,
    },
    activeLabel: {
        color: '#ffffff',
    },
    inactiveLabel: {
        color: '#111827',
    },
});
