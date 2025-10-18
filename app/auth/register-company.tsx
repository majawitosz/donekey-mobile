/** @format */

import { useState } from 'react';
import {
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
	const loginHref = '/auth/login' as Href;
	const workerRegisterHref = '/auth/register' as Href;

	const handleSubmit = () => {
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

		setError(null);
		login();
		router.replace('/(tabs)');
	};

	return (
		<ThemedView style={styles.container}>
			<ScrollView
				contentContainerStyle={styles.content}
				keyboardShouldPersistTaps='handled'>
				<View style={styles.card}>
					<View style={styles.header}>
						<ThemedText type='title'>Rejestracja firmy</ThemedText>
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
							}}
						/>
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
							}}
						/>
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
							}}
						/>
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
							}}
						/>
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
						<ThemedText lightColor='#ef4444' darkColor='#fca5a5'>
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
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 24,
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
