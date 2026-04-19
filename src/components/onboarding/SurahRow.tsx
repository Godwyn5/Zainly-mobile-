import React from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { getSurahNumber, getSurahAyatCount } from '@/data/onboardingData';
import type { PartialSurah } from '@/data/onboardingData';

type Props = {
  name: string;
  checked: boolean;
  partial?: PartialSurah;
  expandedPartial: string | null;
  onToggle: () => void;
  onExpandPartial: () => void;
  onPartialFrom: (val: string) => void;
  onPartialTo: (val: string) => void;
  onPartialConfirm: () => void;
};

export function SurahRow({
  name,
  checked,
  partial,
  expandedPartial,
  onToggle,
  onExpandPartial,
  onPartialFrom,
  onPartialTo,
  onPartialConfirm,
}: Props) {
  const num = getSurahNumber(name);
  const isExpanded = expandedPartial === name;
  const maxAyat = getSurahAyatCount(name);

  return (
    <View>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.row, checked && styles.rowChecked, pressed && styles.rowPressed]}
        android_ripple={{ color: 'rgba(22,48,38,0.06)' }}
      >
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          {checked && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <View style={styles.nameBlock}>
          <Text style={styles.num}>{num}.</Text>
          <Text style={[styles.name, checked && styles.nameChecked]}>
            {name}
          </Text>
          {partial && (
            <Text style={styles.partialBadge}>
              {' '}(ayat {partial.from}–{partial.to})
            </Text>
          )}
        </View>

        {checked && (
          <Pressable onPress={onExpandPartial} hitSlop={8}>
            <Text style={styles.preciser}>Préciser</Text>
          </Pressable>
        )}
      </Pressable>

      {checked && isExpanded && (
        <View style={styles.partialRow}>
          <Text style={styles.partialLabel}>De l'ayat</Text>
          <TextInput
            style={styles.partialInput}
            keyboardType="number-pad"
            value={partial?.from ? String(partial.from) : ''}
            onChangeText={onPartialFrom}
            placeholder="1"
            placeholderTextColor={Colors.text.muted}
            maxLength={3}
          />
          <Text style={styles.partialLabel}>à</Text>
          <TextInput
            style={styles.partialInput}
            keyboardType="number-pad"
            value={partial?.to ? String(partial.to) : ''}
            onChangeText={onPartialTo}
            placeholder={String(maxAyat)}
            placeholderTextColor={Colors.text.muted}
            maxLength={3}
          />
          <Pressable onPress={onPartialConfirm} style={styles.okBtn}>
            <Text style={styles.okText}>OK</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  rowChecked: {
    backgroundColor: 'rgba(22,48,38,0.04)',
  },
  rowPressed: {
    backgroundColor: 'rgba(22,48,38,0.03)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkboxChecked: {
    backgroundColor: Colors.brand.dark,
    borderColor: Colors.brand.dark,
  },
  checkmark: {
    color: '#fff',
    fontSize: 11,
    lineHeight: 14,
  },
  nameBlock: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  num: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    marginRight: 5,
  },
  name: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.primary,
  },
  nameChecked: {
    color: Colors.brand.dark,
    fontFamily: Fonts.dmSansMedium,
  },
  partialBadge: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.brand.gold,
  },
  preciser: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.xs,
    color: Colors.brand.gold,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  partialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingLeft: 48,
    backgroundColor: 'rgba(184,150,46,0.05)',
  },
  partialLabel: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  partialInput: {
    width: 52,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: Colors.ui.border,
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.primary,
    textAlign: 'center',
    backgroundColor: Colors.ui.cardBg,
  },
  okBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.brand.dark,
  },
  okText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: '#fff',
  },
});
