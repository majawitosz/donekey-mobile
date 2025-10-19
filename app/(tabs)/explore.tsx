/** @format */

import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/use-auth';

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
	const { user } = useAuth();

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

	const getCurrentWeekRange = () => {
		const now = new Date();
		const monday = new Date(now);
		monday.setDate(now.getDate() - now.getDay() + 1);

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

	const getDateForDayOfWeek = (dayName: string) => {
		const now = new Date();
		const monday = new Date(now);
		monday.setDate(now.getDate() - now.getDay() + 1);

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

	const handleSubmit = async () => {
		if (!user?.id) {
			setSubmitError('Musisz być zalogowany, aby wysłać dyspozycje');
			return;
		}

		// Validation: Check selected days for complete time slots and logical time order
		for (const day of selectedDays) {
			const dayAvailability = availability[day];
			const hasFrom = dayAvailability.from !== null;
			const hasTo = dayAvailability.to !== null;

			// Selected days must have both times set
			if (!hasFrom || !hasTo) {
				setSubmitError(
					`Dla ${day} musisz ustawić zarówno godzinę "od" jak i "do"`
				);
				return;
			}

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
				`${process.env.EXPO_PUBLIC_API_URL}/availability`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						employee_id: user.id,
						availabilities: availabilityData,
					}),
				}
			);
			console.log('Wysyłane dane na backend:', {
				url: `${process.env.EXPO_PUBLIC_API_URL}/availability`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: {
					employee_id: user.id,
					availabilities: availabilityData,
				},
			});
			console.log('Response status:', response.status);
			console.log('Response ok:', response.ok);
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(
					errorData.detail ||
						'Wystąpił błąd podczas wysyłania dyspozycji'
				);
			}
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
					<ThemedText style={styles.weekText}>
						Tydzień: {getCurrentWeekRange()}
					</ThemedText>
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
											<ThemedText
												style={styles.timeLabel}>
												Od:
											</ThemedText>
											<DateTimePicker
												value={
													availability[day].from ||
													new Date(
														new Date().setHours(
															0,
															0,
															0,
															0
														)
													)
												}
												mode='time'
												display='default'
												onChange={(event, date) =>
													updateAvailability(
														day,
														'from',
														date || null
													)
												}
											/>
										</View>
										<View style={styles.timeInputGroup}>
											<ThemedText
												style={styles.timeLabel}>
												Do:
											</ThemedText>
											<DateTimePicker
												value={
													availability[day].to ||
													new Date(
														new Date().setHours(
															0,
															0,
															0,
															0
														)
													)
												}
												mode='time'
												display='default'
												onChange={(event, date) =>
													updateAvailability(
														day,
														'to',
														date || null
													)
												}
											/>
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
		opacity: 0.5,
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
