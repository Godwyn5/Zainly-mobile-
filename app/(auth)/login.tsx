import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/hooks/useAuth';
import { Colors } from '@/constants/colors';
import { FontSizes } from '@/constants/typography';

type Mode = 'login' | 'signup' | 'reset';

export default function LoginScreen() {
  const { signIn, signUp, resetPassword } = useAuth();

  const [mode, setMode]         = useState<Mode>('login');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [info, setInfo]         = useState<string | null>(null);

  async function handleSubmit() {
    if (mode === 'reset') {
      if (!email.trim()) {
        setError('Saisis ton adresse e-mail.');
        return;
      }
      setError(null);
      setInfo(null);
      setSubmitting(true);
      const err = await resetPassword(email.trim());
      setSubmitting(false);
      if (err) {
        setError(err.message);
        return;
      }
      setInfo('Si ce compte existe, un e-mail de réinitialisation vient d\'être envoyé.');
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Remplis tous les champs.');
      return;
    }
    setError(null);
    setInfo(null);
    setSubmitting(true);

    const err = mode === 'login'
      ? await signIn(email.trim(), password)
      : await signUp(email.trim(), password);

    setSubmitting(false);

    if (err) {
      setError(err.message);
      return;
    }

    if (mode === 'signup') {
      // If Supabase "Confirm email" is enabled, no session is returned immediately.
      // Show confirmation message and switch to login mode so the user can sign in after confirming.
      setInfo('Compte créé. Vérifie ta boîte mail pour confirmer, puis connecte-toi.');
      setMode('login');
      setPassword('');
    }
    // If signup returns a session directly (confirm email disabled),
    // the auth guard in _layout.tsx handles the redirect automatically.
  }

  function toggleMode() {
    setMode(m => m === 'login' ? 'signup' : 'login');
    setError(null);
    setInfo(null);
  }

  function goToReset() {
    setMode('reset');
    setError(null);
    setInfo(null);
  }

  function goBackToLogin() {
    setMode('login');
    setError(null);
    setInfo(null);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.wordmark}>Zainly</Text>
            <Text style={styles.tagline}>
              {mode === 'login'  && 'Content de te revoir.'}
              {mode === 'signup' && 'Commence ta mémorisation.'}
              {mode === 'reset'  && 'Réinitialiser le mot de passe.'}
            </Text>
          </View>

          {/* ── RESET MODE ── */}
          {mode === 'reset' && (
            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Adresse e-mail</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="ton@email.com"
                  placeholderTextColor={Colors.text.muted}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              </View>

              {error && <Text style={styles.errorText}>{error}</Text>}
              {info  && <Text style={styles.infoText}>{info}</Text>}

              <TouchableOpacity
                style={[styles.button, submitting && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.85}
              >
                {submitting
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={styles.buttonText}>Envoyer le lien</Text>
                }
              </TouchableOpacity>

              <TouchableOpacity style={styles.toggle} onPress={goBackToLogin} activeOpacity={0.7}>
                <Text style={styles.toggleText}>
                  <Text style={styles.toggleLink}>← Retour à la connexion</Text>
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ── LOGIN / SIGNUP MODE ── */}
          {mode !== 'reset' && (
            <>
              <View style={styles.form}>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Adresse e-mail</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ton@email.com"
                    placeholderTextColor={Colors.text.muted}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Mot de passe</Text>
                  <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={Colors.text.muted}
                    secureTextEntry
                    textContentType={mode === 'signup' ? 'newPassword' : 'password'}
                  />
                </View>

                {error && <Text style={styles.errorText}>{error}</Text>}
                {info  && <Text style={styles.infoText}>{info}</Text>}

                <TouchableOpacity
                  style={[styles.button, submitting && styles.buttonDisabled]}
                  onPress={handleSubmit}
                  disabled={submitting}
                  activeOpacity={0.85}
                >
                  {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.buttonText}>
                        {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
                      </Text>
                  }
                </TouchableOpacity>

                {mode === 'login' && (
                  <TouchableOpacity onPress={goToReset} activeOpacity={0.7} style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Toggle mode */}
              <TouchableOpacity style={styles.toggle} onPress={toggleMode} activeOpacity={0.7}>
                <Text style={styles.toggleText}>
                  {mode === 'login'
                    ? "Pas encore de compte ? "
                    : "Déjà un compte ? "}
                  <Text style={styles.toggleLink}>
                    {mode === 'login' ? "S'inscrire" : 'Se connecter'}
                  </Text>
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.ui.pageBg,
  },
  kav: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 28,
  },
  header: {
    marginBottom: 48,
  },
  wordmark: {
    fontSize: 42,
    color: Colors.brand.dark,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: FontSizes.md,
    color: Colors.text.secondary,
    lineHeight: 24,
  },
  form: {
    gap: 20,
    marginBottom: 32,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: Colors.ui.border,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: FontSizes.base,
    color: Colors.text.primary,
  },
  errorText: {
    fontSize: FontSizes.sm,
    color: Colors.status.error,
    marginTop: -8,
  },
  infoText: {
    fontSize: FontSizes.sm,
    color: Colors.brand.dark,
    marginTop: -8,
    lineHeight: 20,
  },
  button: {
    backgroundColor: Colors.brand.dark,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: Colors.brand.dark,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: FontSizes.md,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  toggle: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: FontSizes.sm,
    color: Colors.text.secondary,
  },
  toggleLink: {
    color: Colors.brand.dark,
    fontWeight: '600',
  },
  forgotBtn: {
    alignItems: 'center',
    paddingVertical: 4,
    marginTop: -8,
  },
  forgotText: {
    fontSize: FontSizes.sm,
    color: Colors.text.muted,
  },
});
