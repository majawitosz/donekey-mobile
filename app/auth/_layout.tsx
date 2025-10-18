/** @format */

import { Redirect, Stack, type Href } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';

export default function AuthLayout() {
	const { isAuthenticated } = useAuth();

	if (isAuthenticated) {
		return <Redirect href={'/(tabs)' as Href} />;
	}

	return (
		<Stack
			screenOptions={{
				headerTitleAlign: 'center',
			}}>
			<Stack.Screen name='index' options={{ headerShown: false }} />
			<Stack.Screen name='login' options={{ title: 'Logowanie' }} />
			<Stack.Screen name='register' options={{ title: 'Rejestracja' }} />
			<Stack.Screen
				name='register-company'
				options={{ title: 'Rejestracja firmy' }}
			/>
		</Stack>
	);
}
