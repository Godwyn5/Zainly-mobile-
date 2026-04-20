import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Pressable,
  ActivityIndicator, Linking, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';

const PREMIUM_URL = 'https://zainly-alpha.vercel.app/premium';

const FEATURES = [
  'Le Coran complet — toutes les sourates',
  'Sessions illimitées — sans interruption',
  'Révisions quotidiennes — ne perds rien',
  'Accès aux futures améliorations',
];

export default function PaywallScreen() {
  const router  = useRouter();
  const insets  = useSafeAreaInsets();
  const [opening, setOpening] = useState(false);

  async function handleUnlock() {
    if (opening) return;
    setOpening(true);
    try {
      await Linking.openURL(PREMIUM_URL);
    } finally {
      setOpening(false);
    }
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.goldBar} />
        <Text style={styles.eyebrow}>Devenir Hafiz</Text>
        <Text style={styles.title}>Le Coran entier.{'\n'}Pour toi.</Text>
        <Text style={styles.subtitle}>
          Tu as utilisé tes 5 sessions gratuites.{'\n'}
          Continue ta mémorisation sans limite إن شاء الله.
        </Text>
      </View>

      {/* ── PRIX ── */}
      <View style={styles.priceCard}>
        <View style={styles.premiumBadge}>
          <Text style={styles.premiumBadgeText}>PREMIUM</Text>
        </View>
        <Text style={styles.price}>2,99€</Text>
        <Text style={styles.priceSub}>par mois — annulable à tout moment</Text>
        <Text style={styles.priceAlt}>ou 24,99€ / an (2 mois offerts)</Text>
      </View>

      {/* ── FEATURES ── */}
      <View style={styles.features}>
        {FEATURES.map((feat, i) => (
          <View key={i} style={[styles.featRow, i < FEATURES.length - 1 && styles.featBorder]}>
            <Text style={styles.featDiamond}>◆</Text>
            <Text style={styles.featText}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* ── CTA ── */}
      <View style={styles.ctaBlock}>
        <Pressable
          onPress={handleUnlock}
          disabled={opening}
          style={({ pressed }) => [styles.ctaBtn, (pressed || opening) && styles.ctaBtnPressed]}
        >
          {opening
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.ctaBtnText}>Débloquer Zainly →</Text>
          }
        </Pressable>

        <Text style={styles.reassurance}>✓ Paiement sécurisé par Stripe{Platform.OS === 'ios' ? '' : ''}</Text>

        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Retour</Text>
        </Pressable>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
    paddingHorizontal: 24,
  },

  // Header
  header: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
  },
  goldBar: {
    width: 40,
    height: 2,
    backgroundColor: Colors.brand.gold,
    marginBottom: 16,
  },
  eyebrow: {
    fontFamily: Fonts.playfairItalic,
    fontSize: FontSizes.base,
    color: Colors.brand.gold,
    marginBottom: 10,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes['3xl'],
    fontWeight: '700',
    color: Colors.brand.dark,
    textAlign: 'center',
    lineHeight: FontSizes['3xl'] * 1.2,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: FontSizes.base * 1.7,
  },

  // Price card
  priceCard: {
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  premiumBadge: {
    backgroundColor: 'rgba(184,150,46,0.12)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 16,
  },
  premiumBadgeText: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.xs,
    letterSpacing: 2,
    color: Colors.brand.gold,
  },
  price: {
    fontFamily: Fonts.playfair,
    fontSize: 48,
    fontWeight: '700',
    color: Colors.brand.dark,
    lineHeight: 56,
    letterSpacing: -1,
  },
  priceSub: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    marginTop: 4,
  },
  priceAlt: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.sm,
    color: '#2d5a42',
    marginTop: 6,
  },

  // Features
  features: {
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  featRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
  },
  featBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.ui.border,
  },
  featDiamond: {
    fontSize: 10,
    color: Colors.brand.gold,
    flexShrink: 0,
  },
  featText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.base,
    color: Colors.brand.dark,
    lineHeight: FontSizes.base * 1.5,
    flex: 1,
  },

  // CTA
  ctaBlock: {
    gap: 12,
    alignItems: 'center',
  },
  ctaBtn: {
    width: '100%',
    backgroundColor: Colors.brand.dark,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 58,
  },
  ctaBtnPressed: {
    opacity: 0.75,
  },
  ctaBtnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  reassurance: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
  },
  backBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
});
