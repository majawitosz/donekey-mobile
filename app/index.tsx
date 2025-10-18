import { Redirect, type Href } from 'expo-router';

import { useAuth } from '@/hooks/use-auth';

export default function Index() {
  const { isAuthenticated } = useAuth();
  const authHref = '/auth' as Href;

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href={authHref} />;
}
