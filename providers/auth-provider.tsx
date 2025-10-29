/** @format */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
	createContext,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode,
} from 'react';

type User = {
	id: number;
	email: string;
	first_name: string;
	last_name: string;
	full_name: string;
	role: string;
	company_id: number;
	company_name: string;
	is_active: boolean;
	is_staff: boolean;
};

type AuthContextValue = {
	isAuthenticated: boolean;
	user: User | null;
	accessToken: string | null;
	refreshToken: string | null;
	login: (userData: User, accessToken: string, refreshToken: string) => void;
	logout: () => void;
	refreshAccessToken: () => Promise<boolean>;
};

const AUTH_STORAGE_KEY = '@auth/user_v2';
const ACCESS_TOKEN_STORAGE_KEY = '@auth/access_token';
const REFRESH_TOKEN_STORAGE_KEY = '@auth/refresh_token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [refreshToken, setRefreshToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load user data from storage on app start
	useEffect(() => {
		const loadUserData = async () => {
			try {
				// Clean up old storage key
				await AsyncStorage.removeItem('@auth/user');

				const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
				const storedAccessToken = await AsyncStorage.getItem(
					ACCESS_TOKEN_STORAGE_KEY
				);
				const storedRefreshToken = await AsyncStorage.getItem(
					REFRESH_TOKEN_STORAGE_KEY
				);

				if (storedUser && storedAccessToken && storedRefreshToken) {
					const userData: User = JSON.parse(storedUser);
					setUser(userData);
					setAccessToken(storedAccessToken);
					setRefreshToken(storedRefreshToken);
					setIsAuthenticated(true);
				} else {
					console.log('No stored user data found');
				}
			} catch (error) {
				console.error('Error loading user data:', error);
			} finally {
				setIsLoading(false);
			}
		};

		loadUserData();
	}, []);

	// Save user data to storage whenever it changes
	useEffect(() => {
		const saveUserData = async () => {
			// Skip during initial load
			if (isLoading) return;

			try {
				if (user && accessToken && refreshToken) {
					console.log('Saving user data to storage');
					await AsyncStorage.setItem(
						AUTH_STORAGE_KEY,
						JSON.stringify(user)
					);
					await AsyncStorage.setItem(
						ACCESS_TOKEN_STORAGE_KEY,
						accessToken
					);
					await AsyncStorage.setItem(
						REFRESH_TOKEN_STORAGE_KEY,
						refreshToken
					);
				} else if (!user && !accessToken && !refreshToken) {
					// Only remove if all are null (logout scenario)
					console.log('Removing user data from storage');
					await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
					await AsyncStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
					await AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
				}
			} catch (error) {
				console.error('Error saving user data:', error);
			}
		};

		saveUserData();
	}, [user, accessToken, refreshToken, isLoading]);

	const refreshAccessToken = async (): Promise<boolean> => {
		if (!refreshToken) {
			console.log('No refresh token available');
			return false;
		}

		try {
			console.log('=== REFRESHING ACCESS TOKEN ===');
			const response = await fetch(
				`${process.env.EXPO_PUBLIC_API_URL}/token/refresh`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						refresh: refreshToken,
					}),
				}
			);

			if (!response.ok) {
				console.log('Token refresh failed, logging out');
				// Token refresh failed, logout user
				await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
				await AsyncStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
				await AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
				setIsAuthenticated(false);
				setUser(null);
				setAccessToken(null);
				setRefreshToken(null);
				return false;
			}

			const data = await response.json();
			console.log('New access token received');
			setAccessToken(data.access);
			await AsyncStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, data.access);
			return true;
		} catch (error) {
			console.error('Error refreshing token:', error);
			return false;
		}
	};

	const value = useMemo(
		() => ({
			isAuthenticated,
			user,
			accessToken,
			refreshToken,
			login: (
				userData: User,
				accessToken: string,
				refreshToken: string
			) => {
				console.log('=== AUTH PROVIDER LOGIN ===');
				console.log('Setting user:', userData.email);
				console.log('Setting access token');
				console.log('Setting refresh token');
				setIsAuthenticated(true);
				setUser(userData);
				setAccessToken(accessToken);
				setRefreshToken(refreshToken);
			},
			logout: async () => {
				setIsAuthenticated(false);
				setUser(null);
				setAccessToken(null);
				setRefreshToken(null);
				try {
					await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
					await AsyncStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
					await AsyncStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
				} catch (error) {
					console.error('Error clearing user data:', error);
				}
			},
			refreshAccessToken,
		}),
		[isAuthenticated, user, accessToken, refreshToken]
	);

	// Don't render children until we've checked for stored user data
	if (isLoading) {
		return null; // Or a loading screen
	}

	return (
		<AuthContext.Provider value={value}>{children}</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuthContext must be used within an AuthProvider');
	}
	return context;
}
