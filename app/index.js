import { Redirect } from 'expo-router';

// This is the main entry point for the app
// We redirect to the auth flow by default
export default function Index() {
  return <Redirect href="/(auth)/login" />;
}
