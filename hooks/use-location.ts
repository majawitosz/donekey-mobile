import * as Location from 'expo-location';
import { useState } from 'react';
import { Alert } from 'react-native';

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export const useLocation = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Brak uprawnień do lokalizacji');
      Alert.alert('Błąd', 'Aplikacja wymaga dostępu do lokalizacji, aby potwierdzić obecność w pracy.');
      return false;
    }
    return true;
  };

  const getCurrentLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setIsLoading(false);
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      return location;
    } catch (error) {
      setErrorMsg('Nie udało się pobrać lokalizacji');
      console.error(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Haversine formula to calculate distance in meters
  const calculateDistance = (coords1: Coordinates, coords2: Coordinates) => {
    const toRad = (x: number) => (x * Math.PI) / 180;

    const R = 6371e3; // Earth radius in meters
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);
    const deltaLat = toRad(coords2.latitude - coords1.latitude);
    const deltaLon = toRad(coords2.longitude - coords1.longitude);

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c;
    return distance; // in meters
  };

  const isWithinGeofence = (
    userCoords: Coordinates,
    targetCoords: Coordinates,
    radiusInMeters: number
  ) => {
    const distance = calculateDistance(userCoords, targetCoords);
    return {
      isInside: distance <= radiusInMeters,
      distance,
    };
  };

  return {
    location,
    errorMsg,
    isLoading,
    getCurrentLocation,
    calculateDistance,
    isWithinGeofence,
  };
};
