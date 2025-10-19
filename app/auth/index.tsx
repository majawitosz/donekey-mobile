/** @format */

import { Link, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ThemedButton } from '@/components/ui/button';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function AuthChoiceScreen() {
	const loginHref = '/auth/login' as Href;
	const registerHref = '/auth/register' as Href;
	const colorScheme = useColorScheme();
	const isDark = colorScheme === 'dark';

	return (
		<ThemedView
			style={[
				styles.container,
				{
					backgroundColor: isDark
						? '#0a0a0a'
						: 'rgba(255,255,255,0.85)',
				},
			]}>
			<View
				style={[
					styles.card,
					{
						backgroundColor: isDark
							? '#171717'
							: 'rgba(255,255,255,0.85)',
						borderColor: isDark ? '#262626' : 'rgba(15,23,42,0.1)',
					},
				]}>
				<View style={styles.header}>
					<ThemedText type='title'>Witaj w Donekey</ThemedText>
					<ThemedText
						style={[
							styles.subtitle,
							{
								color: isDark ? '#737373' : '#262626',
							},
						]}>
						Wybierz, czy chcesz się zalogować, czy założyć nowe
						konto.
					</ThemedText>
				</View>
				<View style={styles.actions}>
					<Link href={registerHref} asChild>
						<ThemedButton size='default'>Rejestracja</ThemedButton>
					</Link>
					<Link href={loginHref} asChild>
						<ThemedButton variant='outline' size='default'>
							Logowanie
						</ThemedButton>
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
	subtitle: {},
	actions: {
		gap: 12,
	},

	primaryText: {
		color: '#f8fafc',
	},
});
