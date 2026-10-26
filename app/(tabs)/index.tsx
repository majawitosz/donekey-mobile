/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
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
	const { user, logout } = useAuth();
	const [isWorking, setIsWorking] = useState(false);
	const [workplaceConfig, setWorkplaceConfig] = useState<WorkplaceConfig | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const initialize = async () => {
			try {
				const storedToken = await AsyncStorage.getItem('@auth/token');
				if (!storedToken) {
					// Profil i token żyją pod różnymi kluczami — brak tokenu przy
					// zapisanym profilu oznacza stan „zalogowany, ale bez dostępu".
					Alert.alert(
						'Sesja wygasła',
						'Zaloguj się ponownie, aby kontynuować.'
					);
					await logout();
					return;
				}
				setToken(storedToken);

				// Fetch workplace config
				const configResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/workplace/config/`, {
					headers: {
						'Authorization': `Bearer ${storedToken}`,
						'Content-Type': 'application/json',
					},
				});

				if (configResponse.status === 401) {
					Alert.alert('Sesja wygasła', 'Zaloguj się ponownie, aby kontynuować.');
					await logout();
					return;
				}

				if (configResponse.ok) {
					const configData = await configResponse.json();
					const latitude = Number.parseFloat(configData.latitude);
					const longitude = Number.parseFloat(configData.longitude);

					if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
						setWorkplaceConfig({
							latitude,
							longitude,
							radius: configData.radius || 150,
						});
					} else {
						// Firma nie ma jeszcze ustawionej geofencji — nie pokazujemy
						// przycisków check-in/out, bo i tak zostałyby odrzucone.
						setWorkplaceConfig(null);
					}
				} else {
					console.error('Failed to fetch workplace config');
				}

				// Fetch attendance status
				const statusResponse = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/attendance/status/`, {
					headers: {
						'Authorization': `Bearer ${storedToken}`,
						'Content-Type': 'application/json',
					},
				});

				if (statusResponse.status === 401) {
					Alert.alert('Sesja wygasła', 'Zaloguj się ponownie, aby kontynuować.');
					await logout();
					return;
				}

				if (statusResponse.ok) {
					const statusData = await statusResponse.json();
					setIsWorking(Boolean(statusData.is_working));
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

		if (user) {
			initialize();
		}
	}, [user, logout]);

	const handleAttendanceEvent = async (type: 'check_in' | 'check_out', location: Coordinates) => {
		if (!token) return;

		try {
			const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/attendance/event/`, {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					type,
					latitude: location.latitude.toFixed(6),
					longitude: location.longitude.toFixed(6),
					timestamp: new Date().toISOString(),
				}),
			});

			if (response.ok) {
				setIsWorking(type === 'check_in');
				Alert.alert('Sukces', type === 'check_in' ? 'Rozpoczęto pracę!' : 'Zakończono pracę!');
			} else if (response.status === 401) {
				Alert.alert('Sesja wygasła', 'Zaloguj się ponownie, aby kontynuować.');
				await logout();
			} else {
				const errorData = await response.json().catch(() => ({}));
				console.error('Attendance error:', response.status, errorData);
				Alert.alert('Błąd', errorData.detail || errorData.message || JSON.stringify(errorData) || 'Wystąpił błąd podczas rejestracji zdarzenia.');
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

			{isLoading ? (
				<ActivityIndicator size="large" color="#0000ff" />
			) : workplaceConfig ? (
				<AttendanceControl
					isWorking={isWorking}
					workplaceCoordinates={workplaceConfig}
					geofenceRadius={workplaceConfig.radius}
					onCheckIn={handleCheckIn}
					onCheckOut={handleCheckOut}
				/>
			) : (
				<ThemedText>Nie udało się pobrać konfiguracji miejsca pracy.</ThemedText>
			)}

			<ThemedView style={styles.stepContainer}>
				<ThemedText type='subtitle'>Dyspozycje</ThemedText>
				<ThemedText>
					Przejdź do zakładki „Dyspo” aby zarządzać swoimi
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
