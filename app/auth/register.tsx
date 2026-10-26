/** @format */

import { useState } from 'react';
import {
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

import { Link, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
	const router = useRouter();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [companyCode, setCompanyCode] = useState('');
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [error, setError] = useState<string | null>(null);
	const loginHref = '/auth/login' as Href;

	const handleSubmit = async () => {
		setError(null);
		setFieldErrors({});
		if (
			!firstName.trim() ||
			!lastName.trim() ||
			!email.trim() ||
			!password.trim() ||
			!confirmPassword.trim() ||
			!companyCode.trim()
		) {
			setError('Uzupełnij wszystkie pola.');
			return;
		}

		if (firstName.trim().length < 2) {
			setError('Imię musi mieć co najmniej 2 znaki.');
			return;
		}

		if (lastName.trim().length < 2) {
			setError('Nazwisko musi mieć co najmniej 2 znaki.');
			return;
		}

		if (password !== confirmPassword) {
			setError('Hasła muszą być takie same.');
			return;
		}

		if (password.length < 8) {
			setError('Hasło musi mieć co najmniej 8 znaków.');
			return;
		}

		if (companyCode.trim().length < 2) {
			setError('Kod firmy musi mieć co najmniej 2 znaki.');
			return;
		}
		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/register`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						first_name: firstName,
						last_name: lastName,
						email,
						password,
						company_code: companyCode,
					}),
				}
			);

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				let hasFieldErrors = false;

				if (errorData && typeof errorData === 'object') {
					const newFieldErrors: Record<string, string> = {};
					Object.entries(errorData).forEach(([field, messages]) => {
						if (Array.isArray(messages)) {
							newFieldErrors[field] = messages.join(', ');
						} else if (typeof messages === 'string') {
							newFieldErrors[field] = messages;
						}
					});
					hasFieldErrors = Object.keys(newFieldErrors).length > 0;
					setFieldErrors(newFieldErrors);

					if (!hasFieldErrors && typeof errorData.detail === 'string') {
						throw new Error(errorData.detail);
					}
				}

				if (hasFieldErrors) {
					return;
				}

				throw new Error('Coś poszło nie tak');
			}

			router.push(`/auth/login?email=${encodeURIComponent(email)}`);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: 'Wystąpił błąd podczas rejestracji'
			);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.cardContent}
				keyboardShouldPersistTaps='handled'>
				<View style={styles.header}>
					<ThemedText type='title'>Rejestracja pracownika</ThemedText>
					<ThemedText style={styles.subtitle}>
						Wprowadź swoje dane, aby się zarejestrować
					</ThemedText>
					<View style={styles.headerAction}>
						<Link href={loginHref}>
							<ThemedText type='link'>Masz już konto?</ThemedText>
						</Link>
					</View>
				</View>
				<View style={styles.content}>
					<View style={styles.fieldGroup}>
						<ThemedText type='subtitle' style={styles.label}>
							Imię
						</ThemedText>
						<TextInput
							placeholder='Jan'
							placeholderTextColor='rgba(148,163,184,0.7)'
							style={styles.input}
							value={firstName}
							onChangeText={(value) => {
								setFirstName(value);
								if (error) {
									setError(null);
								}
								if (fieldErrors.first_name) {
									setFieldErrors((prev) => ({
										...prev,
										first_name: '',
									}));
								}
							}}
						/>
						{fieldErrors.first_name ? (
							<ThemedText
								lightColor='#ef4444'
								darkColor='#fca5a5'
								style={styles.fieldError}>
								{fieldErrors.first_name}
							</ThemedText>
						) : null}
					</View>
					<View style={styles.fieldGroup}>
						<ThemedText type='subtitle' style={styles.label}>
							Nazwisko
						</ThemedText>
						<TextInput
							placeholder='Kowalski'
							placeholderTextColor='rgba(148,163,184,0.7)'
							style={styles.input}
							value={lastName}
							onChangeText={(value) => {
								setLastName(value);
								if (error) {
									setError(null);
								}
								if (fieldErrors.last_name) {
									setFieldErrors((prev) => ({
										...prev,
										last_name: '',
									}));
								}
							}}
						/>
						{fieldErrors.last_name ? (
							<ThemedText
								lightColor='#ef4444'
								darkColor='#fca5a5'
								style={styles.fieldError}>
								{fieldErrors.last_name}
							</ThemedText>
						) : null}
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
					<View style={styles.fieldGroup}>
						<ThemedText type='subtitle' style={styles.label}>
							Powtórz hasło
						</ThemedText>
						<TextInput
							secureTextEntry
							placeholder='••••••••'
							placeholderTextColor='rgba(148,163,184,0.7)'
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
					<View style={styles.fieldGroup}>
						<View style={styles.labelRow}>
							<ThemedText type='subtitle' style={styles.label}>
								Kod firmy
							</ThemedText>
							<Pressable
								onPress={() =>
									alert('Skontaktuj się z właścicielem firmy')
								}>
								<ThemedText
									type='link'
									style={styles.tooltipText}>
									Jak uzyskać kod firmy?
								</ThemedText>
							</Pressable>
						</View>
						<TextInput
							placeholder='12345678'
							placeholderTextColor='rgba(148,163,184,0.7)'
							style={styles.input}
							value={companyCode}
							onChangeText={(value) => {
								setCompanyCode(value);
								if (error) {
									setError(null);
								}
								if (fieldErrors.company_code) {
									setFieldErrors((prev) => ({
										...prev,
										company_code: '',
									}));
								}
							}}
						/>
						{fieldErrors.company_code ? (
							<ThemedText
								lightColor='#ef4444'
								darkColor='#fca5a5'
								style={styles.fieldError}>
								{fieldErrors.company_code}
							</ThemedText>
						) : null}
					</View>
				</View>
				{error ? (
					<ThemedText lightColor='#ef4444' darkColor='#fca5a5'>
						{error}
					</ThemedText>
				) : null}
				<View style={styles.footer}>
					<Pressable
						style={styles.primaryButton}
						onPress={handleSubmit}>
						<ThemedText
							type='defaultSemiBold'
							style={styles.primaryText}>
							Zarejestruj się
						</ThemedText>
					</Pressable>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	cardContent: {
		flexGrow: 1,
		justifyContent: 'center',
		gap: 20,
		paddingVertical: 20,
		padding: 24,
	},
	header: {
		gap: 8,
	},
	headerAction: {
		alignSelf: 'flex-start',
		marginTop: 8,
	},
	content: {
		gap: 16,
		marginVertical: 16,
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
	labelRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	tooltipText: {
		fontSize: 12,
		textDecorationLine: 'underline',
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
	secondaryButton: {
		marginTop: 8,
	},
	footer: {
		gap: 8,
	},
});
