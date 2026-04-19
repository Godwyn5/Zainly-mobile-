import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { AnimatedSection } from '@/components/ui/AnimatedSection';
import { TodayHeader } from '@/components/today/TodayHeader';
import { MemorizationCard } from '@/components/today/MemorizationCard';
import { RevisionItem } from '@/components/today/RevisionItem';
import { ProgressBlock } from '@/components/today/ProgressBlock';
import { todayMock } from '@/data/todayMock';

export default function TodayScreen() {
  const insets = useSafeAreaInsets();
  const { date, streak, revisionCount, memorizationCard, revisions } = todayMock;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 32 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <AnimatedSection delay={0}>
        <TodayHeader date={date} />
      </AnimatedSection>

      <View style={styles.gap24} />

      <AnimatedSection delay={80}>
        <MemorizationCard data={memorizationCard} />
      </AnimatedSection>

      <View style={styles.gap32} />

      <AnimatedSection delay={160}>
        <Text style={styles.sectionTitle}>Révisions</Text>
      </AnimatedSection>

      <View style={styles.gap12} />

      {revisions.map((item, index) => (
        <AnimatedSection key={item.id} delay={200 + index * 60}>
          <RevisionItem item={item} />
          {index < revisions.length - 1 && <View style={styles.gap8} />}
        </AnimatedSection>
      ))}

      <View style={styles.gap32} />

      <AnimatedSection delay={400}>
        <ProgressBlock streak={streak} revisionCount={revisionCount} />
      </AnimatedSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  content: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  gap8:  { height: 8 },
  gap12: { height: 12 },
  gap24: { height: 24 },
  gap32: { height: 32 },
});
