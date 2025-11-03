/** @format */

import { useState } from 'react';
import {
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

import { Link, useRouter, type Href } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function RegisterCompanyScreen() {
	const router = useRouter();
	const { login } = useAuth();
	const [companyName, setCompanyName] = useState('');
	const [nip, setNip] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const loginHref = '/auth/login' as Href;
	const workerRegisterHref = '/auth/register' as Href;

	const handleSubmit = async () => {
		setError(null);
		setFieldErrors({});
		if (
			!companyName.trim() ||
			!nip.trim() ||
			!email.trim() ||
			!password.trim() ||
			!confirmPassword.trim()
		) {
			setError('Uzupełnij wszystkie pola.');
			return;
		}

		const sanitizedNip = nip.replace(/[^\d]/g, '');
		if (sanitizedNip.length !== 10) {
			setError('Numer NIP powinien zawierać dokładnie 10 cyfr.');
			return;
		}

		if (password !== confirmPassword) {
			setError('Hasła muszą być takie same.');
			return;
		}

		try {
			const response = await fetch(
				`${
					process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'
				}/register-company`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						company_name: companyName,
						nip: sanitizedNip,
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

			await response.json();
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
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={styles.keyboardView}
				keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
				<ScrollView
					contentContainerStyle={styles.content}
					keyboardShouldPersistTaps='handled'
					showsVerticalScrollIndicator={false}>
					<View style={styles.card}>
						<View style={styles.header}>
							<ThemedText type='title'>
								Rejestracja firmy
							</ThemedText>
							<ThemedText style={styles.subtitle}>
								Utwórz konto firmowe, aby zarządzać zespołem i
								zleceniami.
							</ThemedText>
						</View>
						<View style={styles.fieldGroup}>
							<ThemedText type='subtitle' style={styles.label}>
								Nazwa firmy
							</ThemedText>
							<TextInput
								placeholder='DoneKey Sp. z o.o.'
								placeholderTextColor='rgba(148,163,184,0.7)'
								style={styles.input}
								value={companyName}
								onChangeText={(value) => {
									setCompanyName(value);
									if (error) setError(null);
									if (fieldErrors.company_name) {
										setFieldErrors((prev) => ({
											...prev,
											company_name: '',
										}));
									}
								}}
							/>
							{fieldErrors.company_name ? (
								<ThemedText
									lightColor='#ef4444'
									darkColor='#fca5a5'
									style={styles.fieldError}>
									{fieldErrors.company_name}
								</ThemedText>
							) : null}
						</View>
						<View style={styles.fieldGroup}>
							<ThemedText type='subtitle' style={styles.label}>
								NIP
							</ThemedText>
							<TextInput
								keyboardType='number-pad'
								placeholder='1234567890'
								placeholderTextColor='rgba(148,163,184,0.7)'
								style={styles.input}
								value={nip}
								onChangeText={(value) => {
									setNip(value);
									if (error) setError(null);
									if (fieldErrors.nip) {
										setFieldErrors((prev) => ({
											...prev,
											nip: '',
										}));
									}
								}}
							/>
							{fieldErrors.nip ? (
								<ThemedText
									lightColor='#ef4444'
									darkColor='#fca5a5'
									style={styles.fieldError}>
									{fieldErrors.nip}
								</ThemedText>
							) : null}
						</View>
						<View style={styles.fieldGroup}>
							<ThemedText type='subtitle' style={styles.label}>
								E-mail firmowy
							</ThemedText>
							<TextInput
								autoCapitalize='none'
								autoCorrect={false}
								keyboardType='email-address'
								placeholder='kontakt@donekey.pl'
								placeholderTextColor='rgba(148,163,184,0.7)'
								style={styles.input}
								value={email}
								onChangeText={(value) => {
									setEmail(value);
									if (error) setError(null);
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
									if (error) setError(null);
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
									if (error) setError(null);
								}}
							/>
						</View>
						{error ? (
							<ThemedText
								lightColor='#ef4444'
								darkColor='#fca5a5'>
								{error}
							</ThemedText>
						) : null}
						<Pressable
							style={styles.primaryButton}
							onPress={handleSubmit}>
							<ThemedText
								type='defaultSemiBold'
								style={styles.primaryText}>
								Utwórz konto firmowe
							</ThemedText>
						</Pressable>
						<View style={styles.footer}>
							<ThemedText>Wolisz konto pracownika?</ThemedText>
							<Link href={workerRegisterHref}>
								<ThemedText type='link'>
									Zarejestruj się jako pracownik
								</ThemedText>
							</Link>
						</View>
						<View style={styles.footer}>
							<ThemedText>Masz już firmę w DoneKey?</ThemedText>
							<Link href={loginHref}>
								<ThemedText type='link'>Zaloguj się</ThemedText>
							</Link>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
	},
	keyboardView: {
		flex: 1,
	},
	content: {
		flexGrow: 1,
		justifyContent: 'center',
	},
	card: {
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
