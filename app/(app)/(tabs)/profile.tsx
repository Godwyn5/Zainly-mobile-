import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  Pressable, ActivityIndicator, Linking, Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';
import { Fonts, FontSizes } from '@/constants/typography';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';

const PREMIUM_URL  = 'https://zainly-alpha.vercel.app/premium';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function planLabel(type: string | null): string {
  if (type === 'monthly') return 'Mensuel';
  if (type === 'yearly')  return 'Annuel';
  return '—';
}

function statusLabel(status: string | null): string {
  if (status === 'active')   return 'Actif';
  if (status === 'canceled') return 'Annulé (actif jusqu\'à la prochaine période)';
  if (status === 'past_due') return 'Paiement en retard';
  return '—';
}

function statusColor(status: string | null): string {
  if (status === 'active')   return '#2E7D52';
  if (status === 'canceled') return Colors.brand.gold;
  if (status === 'past_due') return Colors.status.error;
  return Colors.text.muted;
}

// ─── Row component ────────────────────────────────────────────────────────────

function InfoRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={rowStyles.row}>
      <Text style={rowStyles.label}>{label}</Text>
      <Text style={[rowStyles.value, valueColor ? { color: valueColor } : undefined]}>{value}</Text>
    </View>
  );
}

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  label: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
  },
  value: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.base,
    color: Colors.brand.dark,
    flexShrink: 1,
    textAlign: 'right',
    maxWidth: '60%',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const insets          = useSafeAreaInsets();
  const router          = useRouter();
  const { result, reload } = useProfile();
  const { signOut }     = useAuth();
  const [actionLoading, setActionLoading] = useState(false);

  async function handleManage() {
    if (actionLoading) return;
    setActionLoading(true);
    try { await Linking.openURL(PREMIUM_URL); }
    finally { setActionLoading(false); }
  }

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
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── HEADER ── */}
      <View style={styles.header}>
        <View style={styles.goldBar} />
        <Text style={styles.title}>Profil</Text>
        <Text style={styles.email}>{data.email}</Text>
      </View>

      {/* ── STATUT ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Abonnement</Text>

        <View style={[styles.card, data.isPremium && styles.cardPremium]}>
          {/* Badge statut */}
          <View style={[styles.badge, data.isPremium ? styles.badgePremium : styles.badgeFree]}>
            <Text style={[styles.badgeText, data.isPremium ? styles.badgeTextPremium : styles.badgeTextFree]}>
              {data.isPremium ? 'PREMIUM' : 'GRATUIT'}
            </Text>
          </View>

          {data.isPremium ? (
            <>
              <View style={styles.divider} />
              <InfoRow label="Plan"           value={planLabel(data.planType)} />
              <View style={styles.rowSep} />
              <InfoRow
                label="État"
                value={statusLabel(data.subscriptionStatus)}
                valueColor={statusColor(data.subscriptionStatus)}
              />
              <View style={styles.rowSep} />
              <InfoRow label="Actif depuis"   value={formatDate(data.premiumSince)} />
            </>
          ) : (
            <Text style={styles.freeDesc}>
              5 sessions gratuites. Débloquez l'accès complet pour continuer votre mémorisation.
            </Text>
          )}
        </View>
      </View>

      {/* ── ACTIONS ── */}
      <View style={styles.section}>
        {data.isPremium ? (
          <Pressable
            onPress={handleManage}
            disabled={actionLoading}
            style={({ pressed }) => [styles.outlineBtn, (pressed || actionLoading) && styles.btnPressed]}
          >
            {actionLoading
              ? <ActivityIndicator color={Colors.brand.dark} size="small" />
              : <Text style={styles.outlineBtnText}>Voir mon abonnement →</Text>
            }
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/(app)/paywall')}
            style={({ pressed }) => [styles.primaryBtn, pressed && styles.btnPressed]}
          >
            <Text style={styles.primaryBtnText}>Débloquer Zainly →</Text>
          </Pressable>
        )}
      </View>

      {/* ── COMPTE ── */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Compte</Text>
        <View style={styles.card}>
          <Pressable onPress={handleSignOut} style={styles.signOutRow}>
            <Text style={styles.signOutText}>Se déconnecter</Text>
          </Pressable>
        </View>
      </View>

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
    gap: 0,
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
    alignItems: 'center',
    marginBottom: 32,
  },
  goldBar: {
    width: 32,
    height: 2,
    backgroundColor: Colors.brand.gold,
    marginBottom: 14,
  },
  title: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    color: Colors.brand.dark,
    marginBottom: 6,
  },
  email: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.base,
    color: Colors.text.secondary,
  },

  // Section
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.xs,
    color: Colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Card
  card: {
    backgroundColor: Colors.ui.cardBg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.ui.border,
    paddingHorizontal: 18,
    paddingVertical: 18,
  },
  cardPremium: {
    borderColor: Colors.brand.gold,
    borderWidth: 1.5,
  },

  // Badge
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 4,
  },
  badgePremium: {
    backgroundColor: 'rgba(184,150,46,0.12)',
  },
  badgeFree: {
    backgroundColor: Colors.ui.pageBg,
    borderWidth: 1,
    borderColor: Colors.ui.border,
  },
  badgeText: {
    fontFamily: Fonts.dmSansBold,
    fontSize: FontSizes.xs,
    letterSpacing: 1.5,
  },
  badgeTextPremium: { color: Colors.brand.gold },
  badgeTextFree:    { color: Colors.text.muted },

  divider: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginVertical: 10,
  },
  rowSep: {
    height: 1,
    backgroundColor: Colors.ui.border,
    marginLeft: 0,
  },

  freeDesc: {
    fontFamily: Fonts.dmSans,
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    lineHeight: FontSizes.sm * 1.7,
    marginTop: 10,
  },

  // Buttons
  primaryBtn: {
    backgroundColor: Colors.brand.dark,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryBtnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: '#fff',
  },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: Colors.brand.dark,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  outlineBtnText: {
    fontFamily: Fonts.playfair,
    fontSize: FontSizes.md,
    fontWeight: '700',
    color: Colors.brand.dark,
  },
  btnPressed: {
    opacity: 0.65,
  },

  // Sign out
  signOutRow: {
    paddingVertical: 4,
    alignItems: 'center',
  },
  signOutText: {
    fontFamily: Fonts.dmSansMedium,
    fontSize: FontSizes.base,
    color: Colors.status.error,
  },
});
