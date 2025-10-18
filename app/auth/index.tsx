import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthChoiceScreen() {
  const loginHref = '/auth/login' as Href;
  const registerHref = '/auth/register' as Href;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.card,
          {
            backgroundColor: isDark ? 'rgba(15,23,42,0.6)' : 'rgba(255,255,255,0.85)',
            borderColor: isDark ? 'rgba(148,163,184,0.4)' : 'rgba(15,23,42,0.1)',
          },
        ]}
      >
        <View style={styles.header}>
          <ThemedText type="title">Witaj w Donekey</ThemedText>
          <ThemedText
            style={[
              styles.subtitle,
              {
                color: isDark ? 'rgba(148,163,184,1)' : 'rgba(71,85,105,1)',
              },
            ]}
          >
            Wybierz, czy chcesz się zalogować, czy założyć nowe konto.
          </ThemedText>
        </View>
        <View style={styles.actions}>
          <Link href={loginHref} asChild>
            <Pressable style={styles.primaryButton}>
              <ThemedText type="defaultSemiBold" style={styles.primaryText}>
                Logowanie
              </ThemedText>
            </Pressable>
          </Link>
          <Link href={registerHref} asChild>
            <Pressable
              style={[
                styles.secondaryButton,
                {
                  borderColor: isDark ? 'rgba(148,163,184,0.35)' : 'rgba(71,85,105,0.25)',
                },
              ]}
            >
              <ThemedText type="defaultSemiBold" lightColor="#0f172a" darkColor="#f8fafc">
                Rejestracja
              </ThemedText>
            </Pressable>
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
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    gap: 24,
  },
  header: {
    gap: 8,
  },
  subtitle: {
  },
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#18181b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  primaryText: {
    color: '#f8fafc',
  },
});
