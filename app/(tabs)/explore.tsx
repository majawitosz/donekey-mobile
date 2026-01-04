/** @format */

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, {
	DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
	Alert,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

interface Availability {
	[key: string]: {
		from: Date | null;
		to: Date | null;
	};
}

const DAYS_OF_WEEK = [
	'Poniedziałek',
	'Wtorek',
	'Środa',
	'Czwartek',
	'Piątek',
	'Sobota',
	'Niedziela',
];

export default function AvailabilityScreen() {
	const { user, logout } = useAuth();
	const [token, setToken] = useState<string | null>(null);

	useEffect(() => {
		const fetchToken = async () => {
			try {
				const storedToken = await AsyncStorage.getItem('@auth/token');
				if (!storedToken && user) {
					Alert.alert('Sesja wygasła', 'Zaloguj się ponownie, aby kontynuować.');
					await logout();
					return;
				}
				setToken(storedToken);
			} catch (error) {
				console.error('Error fetching token:', error);
			}
		};
		fetchToken();
	}, []);

	const [availability, setAvailability] = useState<Availability>({
		Poniedziałek: { from: null, to: null },
		Wtorek: { from: null, to: null },
		Środa: { from: null, to: null },
		Czwartek: { from: null, to: null },
		Piątek: { from: null, to: null },
		Sobota: { from: null, to: null },
		Niedziela: { from: null, to: null },
	});
	const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [showPicker, setShowPicker] = useState<{
		day: string;
		field: 'from' | 'to';
	} | null>(null);

	const getMonday = (d: Date) => {
		d = new Date(d);
		const day = d.getDay();
		const diff = d.getDate() - day + (day === 0 ? -6 : 1);
		return new Date(d.setDate(diff));
	};

	const [currentMonday, setCurrentMonday] = useState<Date>(getMonday(new Date()));

	const changeWeek = (direction: 'prev' | 'next') => {
		const newMonday = new Date(currentMonday);
		newMonday.setDate(newMonday.getDate() + (direction === 'next' ? 7 : -7));
		setCurrentMonday(newMonday);
	};

	useEffect(() => {
		if (token && user) {
			fetchAvailability();
		}
	}, [token, user, currentMonday]);

	const fetchAvailability = async () => {
		const userId = user?.id || (user as any)?.pk;
		if (!userId || !token) return;

		const monday = new Date(currentMonday);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);

		const dateFrom = monday.toISOString().split('T')[0];
		const dateTo = sunday.toISOString().split('T')[0];

		try {
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL_V2}/availability/mobile?employee_id=${userId}&date_from=${dateFrom}&date_to=${dateTo}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.ok) {
				const responseData = await response.json();
				console.log('Availability data received:', responseData);
				
				// Handle both array response and paginated response ({ results: [...] })
				const data = Array.isArray(responseData) ? responseData : (responseData.results || []);

				// Reset availability for the new week
				const newAvailability: Availability = {
					Poniedziałek: { from: null, to: null },
					Wtorek: { from: null, to: null },
					Środa: { from: null, to: null },
					Czwartek: { from: null, to: null },
					Piątek: { from: null, to: null },
					Sobota: { from: null, to: null },
					Niedziela: { from: null, to: null },
				};
				const newSelectedDays = new Set<string>();

				data.forEach((item: any) => {
					const date = new Date(item.date);
					const dayIndex = date.getDay(); // 0 is Sunday
					// Adjust index for DAYS_OF_WEEK array (0=Monday, 6=Sunday)
					const arrayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
					const dayName = DAYS_OF_WEEK[arrayIndex];

					if (
						item.available_slots &&
						item.available_slots.length > 0
					) {
						const slot = item.available_slots[0];
						const [startH, startM] = slot.start.split(':');
						const [endH, endM] = slot.end.split(':');

						const fromDate = new Date();
						fromDate.setHours(
							parseInt(startH),
							parseInt(startM),
							0,
							0
						);

						const toDate = new Date();
						toDate.setHours(
							parseInt(endH),
							parseInt(endM),
							0,
							0
						);

						newAvailability[dayName] = {
							from: fromDate,
							to: toDate,
						};
						newSelectedDays.add(dayName);
					}
				});
				setAvailability(newAvailability);
				setSelectedDays(newSelectedDays);
			}
		} catch (error) {
			console.error('Error fetching availability:', error);
		}
	};

	const getCurrentWeekRange = () => {
		const monday = new Date(currentMonday);
		const sunday = new Date(monday);
		sunday.setDate(monday.getDate() + 6);

		const formatDate = (date: Date) => {
			return date.getDate().toString();
		};

		const monthNames = [
			'stycznia',
			'lutego',
			'marca',
			'kwietnia',
			'maja',
			'czerwca',
			'lipca',
			'sierpnia',
			'września',
			'października',
			'listopada',
			'grudnia',
		];

		const month = monthNames[sunday.getMonth()];

		return `${formatDate(monday)}-${formatDate(sunday)} ${month}`;
	};

	const getMinTime = () => {
		const date = new Date();
		date.setHours(10, 0, 0, 0);
		return date;
	};

	const getMaxTime = () => {
		const date = new Date();
		date.setHours(20, 30, 0, 0);
		return date;
	};

	const getDateForDayOfWeek = (dayName: string) => {
		const monday = new Date(currentMonday);
		const dayIndex = DAYS_OF_WEEK.indexOf(dayName);
		const targetDate = new Date(monday);
		targetDate.setDate(monday.getDate() + dayIndex);

		return targetDate.toISOString().split('T')[0]; // YYYY-MM-DD format
	};

	const updateAvailability = (
		day: string,
		field: 'from' | 'to',
		value: Date | null
	) => {
		setAvailability((prev) => ({
			...prev,
			[day]: {
				...prev[day],
				[field]: value,
			},
		}));
	};

	const toggleDaySelection = (day: string) => {
		setSelectedDays((prev) => {
			const newSelected = new Set(prev);
			if (newSelected.has(day)) {
				// Odznaczanie dnia - wyczyść godziny
				newSelected.delete(day);
				setAvailability((prev) => ({
					...prev,
					[day]: { from: null, to: null },
				}));
			} else {
				// Zaznaczanie dnia
				newSelected.add(day);
			}
			return newSelected;
		});
	};

	const showTimePicker = (day: string, field: 'from' | 'to') => {
		if (Platform.OS === 'android') {
			DateTimePickerAndroid.open({
				value: availability[day][field] || new Date(),
				mode: 'time',
				is24Hour: true,
				minimumDate: getMinTime(),
				maximumDate: getMaxTime(),
				onChange: (event, selectedDate) => {
					if (event.type === 'set') {
						updateAvailability(day, field, selectedDate || null);
					}
				},
			});
		} else {
			setShowPicker({ day, field }); // Pokaż picker na iOS
		}
	};

	const handleSubmit = async () => {
		// Fallback to use user.pk if user.id is missing (casting to any to bypass TS check if needed)
		const userId = user?.id || (user as any)?.pk;

		if (!userId) {
			console.log('User object missing id/pk:', user);
			setSubmitError('Musisz być zalogowany, aby wysłać dyspozycje (brak ID użytkownika)');
			return;
		}
		for (const day of selectedDays) {
			const dayAvailability = availability[day];

			// If both times are set, "from" must be before "to"
			if (dayAvailability.from! >= dayAvailability.to!) {
				setSubmitError(
					`Dla ${day} godzina "od" musi być wcześniejsza niż godzina "do"`
				);
				return;
			}
		}

		setIsSubmitting(true);
		setSubmitError(null);

		try {
			// Transform availability data to API format - array of all 7 days
			const availabilityData = DAYS_OF_WEEK.map((day) => ({
				date: getDateForDayOfWeek(day),
				available_slots:
					availability[day].from && availability[day].to
						? {
								start: availability[day]
									.from!.toTimeString()
									.slice(0, 5), // HH:MM format
								end: availability[day]
									.to!.toTimeString()
									.slice(0, 5),
						  }
						: null,
			}));

			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL_V2}/availability/bulk`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`,
					},
					body: JSON.stringify({
						employee_id: userId,
						availabilities: availabilityData,
					}),
				}
			);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				console.error('Availability error:', response.status, errorData);
				throw new Error(
					errorData.detail ||
					errorData.message ||
						'Wystąpił błąd podczas wysyłania dyspozycji'
				);
			}

			Alert.alert('Sukces', 'Dyspozycje zostały wysłane pomyślnie.');
			await fetchAvailability();
		} catch (err) {
			setSubmitError(
				err instanceof Error
					? err.message
					: 'Wystąpił błąd podczas wysyłania dyspozycji'
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<View style={styles.header}>
					<ThemedText type='title'>Dyspozycje do grafiku</ThemedText>
					<View style={styles.weekNavigation}>
						<Pressable
							onPress={() => changeWeek('prev')}
							style={styles.navButton}>
							<ThemedText style={styles.navButtonText}>
								←
							</ThemedText>
						</Pressable>
						<ThemedText style={styles.weekText}>
							{getCurrentWeekRange()}
						</ThemedText>
						<Pressable
							onPress={() => changeWeek('next')}
							style={styles.navButton}>
							<ThemedText style={styles.navButtonText}>
								→
							</ThemedText>
						</Pressable>
					</View>
				</View>

				<View style={styles.daysContainer}>
					{DAYS_OF_WEEK.map((day) => {
						const isSelected = selectedDays.has(day);
						return (
							<View
								key={day}
								style={[
									styles.dayBlock,
									!isSelected && styles.dayBlockInactive,
								]}>
								<View style={styles.dayHeader}>
									<ThemedText
										type='subtitle'
										style={styles.dayTitle}>
										{day}
									</ThemedText>
									<Pressable
										style={[
											styles.checkbox,
											isSelected &&
												styles.checkboxSelected,
										]}
										onPress={() => toggleDaySelection(day)}>
										{isSelected && (
											<ThemedText
												style={styles.checkmark}>
												✓
											</ThemedText>
										)}
									</Pressable>
								</View>

								{isSelected && (
									<View style={styles.timeInputs}>
										<View style={styles.timeInputGroup}>
											<Pressable
												onPress={() =>
													showTimePicker(day, 'from')
												}>
												<ThemedText
													style={styles.timeLabel}>
													Od:{' '}
													{availability[day].from
														? availability[day]
																.from!.toTimeString()
																.slice(0, 5)
														: '00:00'}
												</ThemedText>
											</Pressable>
											{Platform.OS === 'ios' &&
												showPicker?.day === day &&
												showPicker?.field ===
													'from' && (
													<DateTimePicker
														value={
															availability[day]
																.from ||
															new Date()
														}
														mode='time'
														display='default'
														minimumDate={getMinTime()}
														maximumDate={getMaxTime()}
														onChange={(
															event,
															date
														) =>
															updateAvailability(
																day,
																'from',
																date || null
															)
														}
													/>
												)}
										</View>
										<View style={styles.timeInputGroup}>
											<Pressable
												onPress={() =>
													showTimePicker(day, 'to')
												}>
												<ThemedText
													style={styles.timeLabel}>
													Do:{' '}
													{availability[day].to
														? availability[day]
																.to!.toTimeString()
																.slice(0, 5)
														: '00:00'}
												</ThemedText>
											</Pressable>
											{Platform.OS === 'ios' &&
												showPicker?.day === day &&
												showPicker?.field === 'to' && (
													<DateTimePicker
														value={
															availability[day]
																.to ||
															new Date()
														}
														mode='time'
														display='default'
														minimumDate={getMinTime()}
														maximumDate={getMaxTime()}
														onChange={(
															event,
															date
														) =>
															updateAvailability(
																day,
																'to',
																date || null
															)
														}
													/>
												)}
										</View>
									</View>
								)}
							</View>
						);
					})}
				</View>

				{submitError ? (
					<ThemedText
						lightColor='#ef4444'
						darkColor='#fca5a5'
						style={styles.errorText}>
						{submitError}
					</ThemedText>
				) : null}

				<View style={styles.footer}>
					<Pressable
						style={[
							styles.submitButton,
							isSubmitting && styles.submitButtonDisabled,
						]}
						onPress={handleSubmit}
						disabled={isSubmitting}>
						<ThemedText
							type='defaultSemiBold'
							style={styles.submitButtonText}>
							{isSubmitting
								? 'Wysyłanie...'
								: 'Wyślij dyspozycje'}
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
	scrollContent: {
		flexGrow: 1,
		padding: 24,
		marginTop: 30,
	},
	header: {
		marginBottom: 24,
		gap: 8,
	},
	weekNavigation: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: 'rgba(15,23,42,0.6)',
		borderRadius: 12,
		padding: 8,
		marginTop: 8,
	},
	navButton: {
		padding: 8,
		backgroundColor: 'rgba(148,163,184,0.2)',
		borderRadius: 8,
		width: 40,
		alignItems: 'center',
	},
	navButtonText: {
		fontSize: 20,
		fontWeight: 'bold',
	},
	weekText: {
		fontSize: 16,
		color: 'rgba(148,163,184,1)',
	},
	daysContainer: {
		gap: 16,
	},
	dayBlock: {
		backgroundColor: 'rgba(15,23,42,0.6)',
		borderRadius: 12,
		padding: 16,
		borderWidth: 1,
		borderColor: 'rgba(148,163,184,0.2)',
	},
	dayBlockInactive: {
		opacity: 0.7,
	},
	dayHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 12,
	},
	checkbox: {
		width: 24,
		height: 24,
		borderWidth: 2,
		borderColor: 'rgba(148,163,184,0.5)',
		borderRadius: 4,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(15,23,42,0.4)',
	},
	checkboxSelected: {
		backgroundColor: '#3b82f6',
		borderColor: '#3b82f6',
	},
	checkmark: {
		color: '#ffffff',
		fontSize: 16,
		fontWeight: 'bold',
	},
	dayTitle: {
		fontSize: 16,
		marginBottom: 12,
	},
	timeInputs: {
		flexDirection: 'row',
		gap: 16,
	},
	timeInputGroup: {
		flex: 1,
		gap: 4,
	},
	timeLabel: {
		fontSize: 14,
		color: 'rgba(148,163,184,1)',
	},
	timeInput: {
		backgroundColor: 'rgba(15,23,42,0.4)',
		borderWidth: 1,
		borderColor: 'rgba(148,163,184,0.2)',
		borderRadius: 8,
		paddingHorizontal: 12,
		paddingVertical: 8,
		color: '#f8fafc',
		fontSize: 16,
	},
	timeDisplay: {
		fontSize: 14,
		color: '#f8fafc',
		textAlign: 'center',
		marginTop: 4,
	},
	footer: {
		marginTop: 32,
		marginBottom: 24,
	},
	submitButton: {
		backgroundColor: '#18181b',
		borderRadius: 12,
		paddingVertical: 16,
		alignItems: 'center',
	},
	submitButtonDisabled: {
		opacity: 0.6,
	},
	submitButtonText: {
		color: '#f8fafc',
		fontSize: 16,
	},
	errorText: {
		fontSize: 14,
		textAlign: 'center',
		marginTop: 16,
	},
});
