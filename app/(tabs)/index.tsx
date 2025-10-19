/** @format */

import { Image } from 'expo-image';
import { Pressable, StyleSheet } from 'react-native';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

export default function HomeScreen() {
	const { user, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
			headerImage={
				<Image
					source={require('@/assets/images/partial-react-logo.png')}
					style={styles.reactLogo}
				/>
			}>
			<ThemedView style={styles.titleContainer}>
				<ThemedText type='title'>
					Witaj, {user?.first_name || 'Użytkowniku'}!
				</ThemedText>
				<HelloWave />
			</ThemedView>

			{user && (
				<ThemedView style={styles.userInfo}>
					<ThemedText type='subtitle'>Twoje dane:</ThemedText>
					<ThemedText>Email: {user.email}</ThemedText>
					<ThemedText>
						Imię: {user.first_name} {user.last_name}
					</ThemedText>
					<ThemedText>Rola: {user.role}</ThemedText>
					<ThemedText>Firma: {user.company_name}</ThemedText>
				</ThemedView>
			)}

			<ThemedView style={styles.stepContainer}>
				<ThemedText type='subtitle'>Dyspozycje</ThemedText>
				<ThemedText>
					Przejdź do zakładki "Dyspo" aby zarządzać swoimi
					dyspozycjami do grafiku pracy.
				</ThemedText>
			</ThemedView>

			<ThemedView style={styles.logoutContainer}>
				<Pressable style={styles.logoutButton} onPress={handleLogout}>
					<ThemedText style={styles.logoutText}>
						Wyloguj się
					</ThemedText>
				</Pressable>
			</ThemedView>
		</ParallaxScrollView>
	);
}

const styles = StyleSheet.create({
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
	},
	userInfo: {
		backgroundColor: 'rgba(15,23,42,0.6)',
		borderRadius: 12,
		padding: 16,
		marginBottom: 16,
		gap: 8,
	},
	stepContainer: {
		gap: 8,
		marginBottom: 8,
	},
	logoutContainer: {
		marginTop: 32,
		alignItems: 'center',
	},
	logoutButton: {
		backgroundColor: '#dc2626',
		borderRadius: 12,
		paddingVertical: 16,
		paddingHorizontal: 32,
		alignItems: 'center',
	},
	logoutText: {
		color: '#f8fafc',
		fontSize: 16,
		fontWeight: '600',
	},
	reactLogo: {
		height: 178,
		width: 290,
		bottom: 0,
		left: 0,
		position: 'absolute',
	},
});
