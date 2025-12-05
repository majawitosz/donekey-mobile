/** @format */

import { Image } from 'expo-image';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { AttendanceControl } from '@/components/attendance-control';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { Coordinates } from '@/hooks/use-location';

export default function HomeScreen() {
	const { user, logout } = useAuth();
	const [isWorking, setIsWorking] = useState(false);

	// Mock workplace coordinates (Example: Warsaw Palace of Culture)
	// In production, this should come from the backend/user profile
	const workplaceCoords = {
		latitude: 52.2319,
		longitude: 21.0067,
	};

	const handleCheckIn = async (location: Coordinates) => {
		// TODO: Call backend API to register check-in
		console.log('Check in at', location);
		setIsWorking(true);
		Alert.alert('Sukces', 'Rozpoczęto pracę!');
	};

	const handleCheckOut = async (location: Coordinates) => {
		// TODO: Call backend API to register check-out
		console.log('Check out at', location);
		setIsWorking(false);
		Alert.alert('Sukces', 'Zakończono pracę!');
	};

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

			<AttendanceControl
				isWorking={isWorking}
				workplaceCoordinates={workplaceCoords}
				geofenceRadius={150} // 150 meters
				onCheckIn={handleCheckIn}
				onCheckOut={handleCheckOut}
			/>

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
