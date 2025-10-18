import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { Link, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const loginHref = '/auth/login' as Href;

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      setError('Uzupełnij wszystkie pola.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła muszą być takie same.');
      return;
    }

    setError(null);
    login();
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <ThemedText type="title">Załóż konto</ThemedText>
          <ThemedText style={styles.subtitle}>
            Utwórz swoje konto, aby rozpocząć pracę z aplikacją.
          </ThemedText>
        </View>
        <View style={styles.fieldGroup}>
          <ThemedText type="subtitle" style={styles.label}>
            E-mail
          </ThemedText>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            placeholder="adres@example.com"
            placeholderTextColor="rgba(148,163,184,0.7)"
            style={styles.input}
            value={email}
            onChangeText={(value) => {
              setEmail(value);
              if (error) {
                setError(null);
              }
            }}
          />
        </View>
        <View style={styles.fieldGroup}>
          <ThemedText type="subtitle" style={styles.label}>
            Hasło
          </ThemedText>
          <TextInput
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(148,163,184,0.7)"
            style={styles.input}
            value={password}
            onChangeText={(value) => {
              setPassword(value);
              if (error) {
                setError(null);
              }
            }}
          />
        </View>
        <View style={styles.fieldGroup}>
          <ThemedText type="subtitle" style={styles.label}>
            Powtórz hasło
          </ThemedText>
          <TextInput
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(148,163,184,0.7)"
            style={styles.input}
            value={confirmPassword}
            onChangeText={(value) => {
              setConfirmPassword(value);
              if (error) {
                setError(null);
              }
            }}
          />
        </View>
        {error ? (
          <ThemedText lightColor="#ef4444" darkColor="#fca5a5">
            {error}
          </ThemedText>
        ) : null}
        <Pressable style={styles.primaryButton} onPress={handleSubmit}>
          <ThemedText type="defaultSemiBold" style={styles.primaryText}>
            Zarejestruj się
          </ThemedText>
        </Pressable>
        <View style={styles.footer}>
          <ThemedText>Masz już konto?</ThemedText>
          <Link href={loginHref}>
            <ThemedText type="link">Zaloguj się</ThemedText>
          </Link>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  card: {
    flex: 1,
    justifyContent: 'center',
    gap: 20,
  },
  header: {
    gap: 8,
  },
  subtitle: {
    color: 'rgba(148,163,184,1)',
  },
  fieldGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#f8fafc',
  },
  primaryButton: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: {
    color: '#f8fafc',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
});
