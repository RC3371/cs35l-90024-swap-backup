import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Categories } from './Listing.types';

interface SegmentedControlProps {
    value: Categories;
    onChange: (value: Categories) => void;
}

const options: Categories[] = [Categories.Skills, Categories.Goods];

export const SegmentedControl: React.FC<SegmentedControlProps> = ({ value, onChange }) => {
    return (
        <View style={styles.wrapper}>
            <View style={styles.container}>
                {options.map((option, index) => {
                    const selected = value === option;

                    return (
                        <Pressable
                            key={option}
                            onPress={() => onChange(option)}
                            style={({ pressed }) => [
                                styles.segment,
                                selected ? styles.activeSegment : styles.inactiveSegment,
                                pressed && styles.pressed,
                                index === 0 ? styles.leftSegment : styles.rightSegment,
                            ]}
                            android_ripple={{ color: '#c7d2fe' }}
                        >
                            <Text style={[styles.label, selected ? styles.activeLabel : styles.inactiveLabel]}>
                                {option}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        paddingHorizontal: 16,
        marginVertical: 16,
    },
    container: {
        flexDirection: 'row',
        backgroundColor: '#f2f4f8',
        borderRadius: 28,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
        elevation: 2,
    },
    segment: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    activeSegment: {
        backgroundColor: '#2563eb',
    },
    inactiveSegment: {
        backgroundColor: '#f8fafc',
    },
    pressed: {
        transform: [{ scale: 0.99 }],
    },
    leftSegment: {
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
    },
    rightSegment: {
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
    },
    label: {
        fontSize: 15,
        fontWeight: '600',
        letterSpacing: 0.15,
    },
    activeLabel: {
        color: '#ffffff',
    },
    inactiveLabel: {
        color: '#1f2937',
    },
});
