import React from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={rStyles.row}>
      <Text style={rStyles.label}>{label}</Text>
      <Text style={[rStyles.value, valueColor ? { color: valueColor } : undefined]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return <View style={rStyles.divider} />;
}

const rStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  label: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  value: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.dark,
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '58%',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0EBE3',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets          = useSafeAreaInsets();
  const router          = useRouter();
  const { result, reload } = useProfile();
  const { signOut }     = useAuth();

  async function handleSignOut() {
    Alert.alert(
      'Se déconnecter',
      'Tu vas être déconnecté de ton compte.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/(auth)/login');
          },
        },
      ],
    );
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (result.status === 'loading') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator color={Colors.brand.dark} size="large" />
      </View>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (result.status === 'error') {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>{result.message}</Text>
        <Pressable onPress={reload} style={styles.retryBtn}>
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  const { data } = result;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={{ paddingBottom: insets.bottom + 56 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER gradient ── */}
      <LinearGradient
        colors={['#0d1f17', '#163026', '#1e4535']}
        start={{ x: 0, y: 0 }} end={{ x: 0.5, y: 1 }}
        style={[styles.header, { paddingTop: insets.top + 40 }]}
      >
        <Text style={styles.bgCalligraphy}>الله</Text>
        <Text style={styles.title}>Réglages</Text>
        <Text style={styles.headerSub}>Compte et abonnement</Text>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── COMPTE ── */}
        <View>
          <Text style={styles.sectionLabel}>Compte</Text>
          <View style={styles.card}>
            <Row label="Email" value={data.email || '—'} />
            <Divider />
            <View style={{ paddingVertical: 8 }}>
              <Pressable
                onPress={handleSignOut}
                style={({ pressed }) => [styles.signOutBtn, pressed && styles.btnPressed]}
              >
                <Text style={styles.signOutBtnText}>Déconnexion</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* ── ABONNEMENT ── */}
        <View>
          <Text style={styles.sectionLabel}>Abonnement</Text>
          <View style={[styles.card, data.isPremium && styles.cardPremium]}>
            {data.isPremium ? (
              <>
                <Row label="Statut" value="Premium actif 👑" valueColor="#2E7D52" />
                <Divider />
                <Row label="Prix" value="2,99 € / mois" />
                <Divider />
                <Row label="Renouvellement" value="Mensuel automatique" />
              </>
            ) : (
              <>
                <Row label="Statut" value="Gratuit" />
                <Divider />
                <View style={{ paddingVertical: 12, gap: 12 }}>
                  <Text style={styles.freeDesc}>
                    Passe à Premium pour mémoriser sans limite, à ton rythme.
                  </Text>
                  <Pressable
                    onPress={() => router.push('/(app)/paywall')}
                    style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
                  >
                    <Text style={styles.primaryBtnText}>Découvrir Premium →</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>

        {/* ── FOOTER LÉGAL ── */}
        <View style={styles.legalFooter}>
          <Text style={styles.legalText}>Zainly · Mémorisation du Coran</Text>
          <Text style={styles.legalText}>Baraka Allahou fikoum</Text>
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Root
  scroll: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },

  // Loading / error
  center: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 32,
  },
  errorText: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 12,
  },
  retryText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.base,
    fontWeight: '600',
    color: '#fff',
  },

  // Header
  header: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    overflow: 'hidden',
  },
  bgCalligraphy: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    fontSize: 160,
    color: 'rgba(255,255,255,0.04)',
    lineHeight: 180,
    pointerEvents: 'none',
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: 28,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
    lineHeight: 34,
  },
  headerSub: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.45)',
  },

  // Body
  body: {
    paddingHorizontal: 16,
    paddingTop: 24,
    gap: 16,
  },

  // Section label
  sectionLabel: {
    fontFamily: Fonts.dmSansBold,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1.5,
    color: Colors.brand.gold,
    textTransform: 'uppercase',
    marginLeft: 4,
    marginBottom: 8,
  },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 20,
    shadowColor: '#0f2318',
    shadowOpacity: 0.06,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPremium: {
    borderWidth: 1.5,
    borderColor: Colors.brand.gold,
  },

  freeDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: 13,
    color: Colors.text.secondary,
    lineHeight: 21,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    fontFamily: Fonts.dmSansBold,
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  signOutBtn: {
    width: '100%',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  signOutBtnText: {
    fontFamily: Fonts.dmSans,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.brand.dark,
  },
  btnPressed: {
    opacity: 0.6,
  },

  // Legal footer
  legalFooter: {
    alignItems: 'center',
    gap: 4,
    paddingTop: 8,
  },
  legalText: {
    fontFamily: Fonts.dmSans,
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
  },
});
