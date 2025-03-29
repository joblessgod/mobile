import { Stack, useRouter, useSegments } from "expo-router";
// import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SafeScreen from "../components/SafeScreen";
import { StatusBar } from "expo-status-bar";
// SplashScreen.preventAutoHideAsync();
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();
  const segments = useSegments();

  const { checkAuth, user, token } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  // const [fontsLoaded] = useFonts({
  //   "JetBrainsMono-Medium": require("../assets/fonts/JetBrainsMonoNL-Medium.ttf"),
  // });

  // useEffect(() => {
  //   if (fontsLoaded) SplashScreen.hideAsync();
  // }, [fontsLoaded]);

  useEffect(() => {
    const isThisAuthScreen = segments[0] === "(auth)";
    const isSignedIn = user && token;

    if (!isThisAuthScreen && !isSignedIn) router.replace("/(auth)");
    else if (isThisAuthScreen && isSignedIn) router.replace("/(tabs)");
  }, [user, token, segments]);

  return (
    <SafeAreaProvider>
      <SafeScreen>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
        </Stack>
      </SafeScreen>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
