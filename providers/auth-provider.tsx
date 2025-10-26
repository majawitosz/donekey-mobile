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
	login: (userData: User, token: string) => void;
	logout: () => void;
};

const AUTH_STORAGE_KEY = '@auth/user_v2';
const TOKEN_STORAGE_KEY = '@auth/token';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [user, setUser] = useState<User | null>(null);
	const [accessToken, setAccessToken] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load user data from storage on app start
	useEffect(() => {
		const loadUserData = async () => {
			try {
				// Clean up old storage key
				await AsyncStorage.removeItem('@auth/user');

				const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
				const storedToken = await AsyncStorage.getItem(
					TOKEN_STORAGE_KEY
				);

				if (storedUser && storedToken) {
					const userData: User = JSON.parse(storedUser);
					setUser(userData);
					setAccessToken(storedToken);
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
			try {
				if (user && accessToken) {
					await AsyncStorage.setItem(
						AUTH_STORAGE_KEY,
						JSON.stringify(user)
					);
					await AsyncStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
				} else {
					console.log('Removing user data from storage');
					await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
					await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
				}
			} catch (error) {
				console.error('Error saving user data:', error);
			}
		};

		if (!isLoading) {
			saveUserData();
		}
	}, [user, accessToken, isLoading]);

	const value = useMemo(
		() => ({
			isAuthenticated,
			user,
			accessToken,
			login: (userData: User, token: string) => {
				setIsAuthenticated(true);
				setUser(userData);
				setAccessToken(token);
			},
			logout: async () => {
				setIsAuthenticated(false);
				setUser(null);
				setAccessToken(null);
				try {
					await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
					await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
				} catch (error) {
					console.error('Error clearing user data:', error);
				}
			},
		}),
		[isAuthenticated, user, accessToken]
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
