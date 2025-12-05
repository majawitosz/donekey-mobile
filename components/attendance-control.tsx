import { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, Alert } from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import { ThemedButton as Button } from './ui/button';
import { useLocation, Coordinates } from '@/hooks/use-location';

type AttendanceControlProps = {
  isWorking: boolean;
  workplaceCoordinates: Coordinates;
  geofenceRadius: number; // in meters
  onCheckIn: (location: Coordinates) => Promise<void>;
  onCheckOut: (location: Coordinates) => Promise<void>;
};

export function AttendanceControl({
  isWorking,
  workplaceCoordinates,
  geofenceRadius,
  onCheckIn,
  onCheckOut,
}: AttendanceControlProps) {
  const { getCurrentLocation, isWithinGeofence, isLoading: isLocationLoading } = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastDistance, setLastDistance] = useState<number | null>(null);

  const handleAction = async () => {
    setIsProcessing(true);
    try {
      const location = await getCurrentLocation();
      
      if (!location) {
        // Error is handled in useLocation (Alert)
        setIsProcessing(false);
        return;
      }

      const userCoords: Coordinates = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const { isInside, distance } = isWithinGeofence(
        userCoords,
        workplaceCoordinates,
        geofenceRadius
      );

      setLastDistance(distance);

      if (!isInside) {
        Alert.alert(
          'Poza strefą pracy',
          `Jesteś ${Math.round(distance)}m od miejsca pracy. Maksymalna odległość to ${geofenceRadius}m.`
        );
        setIsProcessing(false);
        return;
      }

      if (isWorking) {
        await onCheckOut(userCoords);
      } else {
        await onCheckIn(userCoords);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Błąd', 'Wystąpił błąd podczas przetwarzania żądania.');
    } finally {
      setIsProcessing(false);
    }
  };

  const isLoading = isLocationLoading || isProcessing;

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="subtitle" style={styles.header}>
        Ewidencja czasu pracy
      </ThemedText>
      
      <View style={styles.statusContainer}>
        <ThemedText>Status: </ThemedText>
        <ThemedText type="defaultSemiBold" style={{ color: isWorking ? '#4CAF50' : '#757575' }}>
          {isWorking ? 'W PRACY' : 'POZA PRACĄ'}
        </ThemedText>
      </View>

      {lastDistance !== null && (
        <ThemedText style={styles.distanceInfo}>
          Ostatnia odległość: {Math.round(lastDistance)}m
        </ThemedText>
      )}

      <Button
        onPress={handleAction}
        disabled={isLoading}
        variant={isWorking ? 'destructive' : 'default'}
        style={styles.button}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <ThemedText style={styles.buttonText}>
            {isWorking ? 'Zakończ zmianę (Check-out)' : 'Rozpocznij zmianę (Check-in)'}
          </ThemedText>
        )}
      </Button>
      
      <ThemedText style={styles.hint}>
        Wymagana lokalizacja w promieniu {geofenceRadius}m od zakładu pracy.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    marginVertical: 16,
  },
  header: {
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  distanceInfo: {
    marginBottom: 12,
    fontSize: 12,
    opacity: 0.7,
  },
  button: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 12,
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.6,
  },
});
