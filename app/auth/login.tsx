/** @format */

import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Link, useLocalSearchParams, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
	const router = useRouter();
	const { login } = useAuth();
	const { email: emailParam } = useLocalSearchParams<{ email?: string }>();
	const [email, setEmail] = useState(emailParam || '');
	const [password, setPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const registerHref = '/auth/register' as Href;

	const handleSubmit = async () => {
		setError(null);
		setFieldErrors({});
		if (!email.trim() || !password.trim()) {
			setError('Podaj e-mail oraz hasło.');
			return;
		}

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/login`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email,
						password,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				if (errorData && typeof errorData === 'object') {
					const newFieldErrors: Record<string, string> = {};
					Object.entries(errorData).forEach(([field, messages]) => {
						if (Array.isArray(messages)) {
							newFieldErrors[field] = messages.join(', ');
						} else if (typeof messages === 'string') {
							newFieldErrors[field] = messages;
						}
					});
					setFieldErrors(newFieldErrors);
					throw new Error('Popraw błędy w formularzu');
				} else {
					throw new Error(errorData.detail || 'Coś poszło nie tak');
				}
			}

			const responseData = await response.json();
			console.log('Login response:', JSON.stringify(responseData, null, 2));
			
			if (responseData.token) {
				await AsyncStorage.setItem('@auth/token', responseData.token);
			} else if (responseData.access) {
				await AsyncStorage.setItem('@auth/token', responseData.access);
			}

			let userData = responseData.user;

			// Check if we have a token but missing user data or missing user ID
			const token = responseData.token || responseData.access;
			const isUserIncomplete = !userData || (!userData.id && !userData.pk);

			if (token && isUserIncomplete) {
				console.log('User data incomplete or missing, fetching profile...');
				try {
					// Try /users/me/ first
					let userResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/users/me/`, {
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					});
					
					if (userResponse.ok) {
						const fullUserData = await userResponse.json();
						// Merge or overwrite. If userData was null, it becomes fullUserData.
						// If userData existed, we overwrite it to ensure we have the ID.
						userData = fullUserData;
					} else {
						console.log('Failed to fetch /users/me/, trying /auth/user/');
						// Try alternative endpoint /auth/user/
						userResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/auth/user/`, {
							headers: {
								'Authorization': `Bearer ${token}`,
								'Content-Type': 'application/json',
							},
						});
						if (userResponse.ok) {
							userData = await userResponse.json();
						} else {
							console.log('Failed to fetch /auth/user/');
						}
					}
				} catch (e) {
					console.error('Failed to fetch user profile', e);
				}
			}

			if (!userData) {
				setError('Zalogowano, ale nie udało się pobrać danych użytkownika.');
				return;
			}

			// Normalize user data: ensure 'id' exists (map from 'pk' if necessary)
			if (!userData.id && userData.pk) {
				userData.id = userData.pk;
			}

			setError(null);
			login(userData);
			router.replace('/(tabs)');
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Wystąpił błąd podczas logowania'
			);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<View style={styles.card}>
				<View style={styles.header}>
					<ThemedText type='title'>Zaloguj się</ThemedText>
					<ThemedText style={styles.subtitle}>
						Wprowadź swoje dane, aby uzyskać dostęp do aplikacji.
					</ThemedText>
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText type='subtitle' style={styles.label}>
						E-mail
					</ThemedText>
					<TextInput
						autoCapitalize='none'
						autoCorrect={false}
						keyboardType='email-address'
						placeholder='adres@example.com'
						placeholderTextColor='rgba(148,163,184,0.7)'
						style={styles.input}
						value={email}
						onChangeText={(value) => {
							setEmail(value);
							if (error) {
								setError(null);
							}
							if (fieldErrors.email) {
								setFieldErrors((prev) => ({
									...prev,
									email: '',
								}));
							}
						}}
					/>
					{fieldErrors.email ? (
						<ThemedText
							lightColor='#ef4444'
							darkColor='#fca5a5'
							style={styles.fieldError}>
							{fieldErrors.email}
						</ThemedText>
					) : null}
				</View>
				<View style={styles.fieldGroup}>
					<ThemedText type='subtitle' style={styles.label}>
						Hasło
					</ThemedText>
					<TextInput
						secureTextEntry
						placeholder='••••••••'
						placeholderTextColor='rgba(148,163,184,0.7)'
						style={styles.input}
						value={password}
						onChangeText={(value) => {
							setPassword(value);
							if (error) {
								setError(null);
							}
							if (fieldErrors.password) {
								setFieldErrors((prev) => ({
									...prev,
									password: '',
								}));
							}
						}}
					/>
					{fieldErrors.password ? (
						<ThemedText
							lightColor='#ef4444'
							darkColor='#fca5a5'
							style={styles.fieldError}>
							{fieldErrors.password}
						</ThemedText>
					) : null}
				</View>
				{error ? (
					<ThemedText lightColor='#ef4444' darkColor='#fca5a5'>
						{error}
					</ThemedText>
				) : null}
				<Pressable style={styles.primaryButton} onPress={handleSubmit}>
					<ThemedText
						type='defaultSemiBold'
						style={styles.primaryText}>
						Zaloguj się
					</ThemedText>
				</Pressable>
				<View style={styles.footer}>
					<ThemedText>Nie masz konta?</ThemedText>
					<Link href={registerHref}>
						<ThemedText type='link'>Załóż je tutaj</ThemedText>
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
	fieldError: {
		fontSize: 12,
		marginTop: 4,
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
