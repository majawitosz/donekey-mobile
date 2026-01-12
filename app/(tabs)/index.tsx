/** @format */

import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, StyleSheet } from 'react-native';

import { AttendanceControl } from '@/components/attendance-control';
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import { Coordinates } from '@/hooks/use-location';

type WorkplaceConfig = {
	latitude: number;
	longitude: number;
	radius: number;
};

export default function HomeScreen() {
	const { user, logout, accessToken } = useAuth();
	const [isWorking, setIsWorking] = useState(false);
	const [workplaceConfig, setWorkplaceConfig] =
		useState<WorkplaceConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const initialize = async () => {
			if (!accessToken) {
				setIsLoading(false);
				return;
			}

			try {
				// Fetch workplace config
				const configResponse = await fetch(
					`${process.env.EXPO_PUBLIC_API_URL}/workplace/config/`,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					}
				);

				if (configResponse.ok) {
					const configData = await configResponse.json();
					setWorkplaceConfig({
						latitude: parseFloat(configData.latitude),
						longitude: parseFloat(configData.longitude),
						radius: configData.radius || 150,
					});
				} else {
					console.error('Failed to fetch workplace config');
				}

				// Fetch attendance status
				const statusResponse = await fetch(
					`${process.env.EXPO_PUBLIC_API_URL}/attendance/status/`,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
							'Content-Type': 'application/json',
						},
					}
				);

				if (statusResponse.ok) {
					const statusData = await statusResponse.json();
					setIsWorking(statusData.is_working);
				} else {
					console.error('Failed to fetch attendance status');
				}
			} catch (error) {
				console.error('Error initializing home screen:', error);
				Alert.alert('Błąd', 'Nie udało się pobrać danych z serwera.');
			} finally {
				setIsLoading(false);
			}
		};

		if (user && accessToken) {
			initialize();
		}
	}, [user, accessToken]);

	const handleAttendanceEvent = async (
		type: 'check_in' | 'check_out',
		location: Coordinates
	) => {
		if (!accessToken) return;

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/attendance/event/`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						type,
						latitude: location.latitude.toFixed(6),
						longitude: location.longitude.toFixed(6),
						timestamp: new Date().toISOString(),
					}),
				}
			);

			if (response.ok) {
				const data = await response.json();
				setIsWorking(type === 'check_in');
				Alert.alert(
					'Sukces',
					type === 'check_in'
						? 'Rozpoczęto pracę!'
						: 'Zakończono pracę!'
				);
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Attendance error:', response.status, errorData);
				Alert.alert(
					'Błąd',
					errorData.detail ||
						errorData.message ||
						JSON.stringify(errorData) ||
						'Wystąpił błąd podczas rejestracji zdarzenia.'
				);
			}
		} catch (error) {
			console.error('Error registering attendance event:', error);
			Alert.alert('Błąd', 'Wystąpił błąd połączenia z serwerem.');
		}
	};

	const handleCheckIn = async (location: Coordinates) => {
		await handleAttendanceEvent('check_in', location);
	};

	const handleCheckOut = async (location: Coordinates) => {
		await handleAttendanceEvent('check_out', location);
	};

	const handleLogout = async () => {
		await logout();
	};

	return (
		<ParallaxScrollView
			headerBackgroundColor={{ light: '#e0e0e0ff', dark: '#242424ff' }}
			headerImage={
				<Image
					source={require('@/assets/images/logo-dark.svg')}
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

			{isLoading ? (
				<ActivityIndicator size='large' color='#c9c9c9ff' />
			) : workplaceConfig ? (
				<AttendanceControl
					isWorking={isWorking}
					workplaceCoordinates={workplaceConfig}
					geofenceRadius={workplaceConfig.radius}
					onCheckIn={handleCheckIn}
					onCheckOut={handleCheckOut}
				/>
			) : (
				<ThemedText>
					Nie udało się pobrać konfiguracji miejsca pracy.
				</ThemedText>
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
		height: 89,
		width: 300,
		margin: 'auto',
	},
});
