import { I18nProvider, useI18n } from "@/i18n/I18nProvider";
import { clearStoredSession } from "@/services/authService";
import * as storage from "@/utils/secureStorage";
import { Stack, useRootNavigationState, useRouter } from "expo-router";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { LogBox, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

LogBox.ignoreLogs(['Unsupported top level event type "topSvgLayout"']);

// Error boundary fallback component
function ErrorFallback({ error }: { error: Error }) {
  const { t } = useI18n();
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 18, marginBottom: 10, fontWeight: 'bold' }}>{t("app_error_title")}</Text>
      <Text style={{ color: 'red', marginBottom: 10 }}>{error.message}</Text>
      <Text>{t("app_error_hint")}</Text>
    </View>
  );
}

function RootNavigator() {
  const router = useRouter();
  const { t } = useI18n();
  const rootNavigationState = useRootNavigationState();

  useEffect(() => {
    if (!rootNavigationState?.key) return; // Wait until navigation is fully mounted

    const checkAuth = async () => {
      try {
        const [registerNo, baseUrl, authToken, subscription] = await Promise.all([
          storage.getItemAsync("register_no"),
          storage.getItemAsync("baseUrl"),
          storage.getItemAsync("authToken"),
          storage.getItemAsync("subscription"),
        ]);

        if (!registerNo || !baseUrl) {
          router.replace("/(auth)/login");
          return;
        }

        if (!authToken) {
          router.replace("/otp");
          return;
        }

        if (subscription === "true") {
          router.replace("/(tabs)/profile");
        } else {
          router.replace("/subscription");
        }
      } catch (error) {
        console.error("Auth check error:", error);
        await clearStoredSession();
        try { router.replace("/(auth)/login"); } catch (e) {}
      }
    };

    checkAuth();
  }, [router, rootNavigationState?.key]);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error) => {
        console.error(t("app_error_title"), error);
      }}
    >
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="otp" />
          <Stack.Screen name="(auth)/login" />
          <Stack.Screen name="subscription" />
          {/* <Stack.Screen name="faceCapture" /> */}
        </Stack>
        <Toast />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <RootNavigator />
    </I18nProvider>
  );
}
