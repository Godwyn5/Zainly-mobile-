import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import type { SessionPhase } from '@/types';

const PHASES: { key: SessionPhase; label: string }[] = [
  { key: 'listen', label: 'Écouter' },
  { key: 'test',   label: 'Tester' },
  { key: 'validated', label: 'Validé' },
];

function phaseIndex(phase: SessionPhase): number {
  if (phase === 'reveal')    return 1;
  if (phase === 'validated') return PHASES.length;
  const i = PHASES.findIndex(p => p.key === phase);
  return i < 0 ? 0 : i;
}

type Props = { phase: SessionPhase };

export function PhasePills({ phase }: Props) {
  const currentIdx = phaseIndex(phase);
  return (
    <View style={styles.row}>
      {PHASES.map((p, i) => {
        const done   = i < currentIdx;
        const active = i === currentIdx;
        return (
          <View
            key={p.key}
            style={[
              styles.pill,
              done   && styles.pillDone,
              active && styles.pillActive,
              !done && !active && styles.pillIdle,
            ]}
          >
            <Text
              style={[
                styles.pillText,
                (done || active) ? styles.pillTextLight : styles.pillTextMuted,
              ]}
            >
              {p.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillDone:   { backgroundColor: Colors.brand.gold },
  pillActive: { backgroundColor: Colors.brand.dark },
  pillIdle:   { backgroundColor: '#E2D9CC' },
  pillText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
  },
  pillTextLight: { color: '#fff' },
  pillTextMuted: { color: Colors.text.secondary },
});
