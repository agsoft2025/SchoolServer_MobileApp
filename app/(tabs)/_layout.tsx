// app/(tabs)/_layout.tsx
import LanguagePicker from "@/components/LanguagePicker";
import { useI18n } from "@/i18n/I18nProvider";
import { clearStoredSession, logoutUser } from "@/services/authService";
import * as storage from "@/utils/secureStorage";
import { Tabs, useRouter } from "expo-router";
import { CreditCard, History, LogOut, User } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useI18n();

  const [loading, setLoading] = useState(true);

useEffect(() => {
  const checkAuth = async () => {
    try {
      const [regNo, authToken, subscription] = await Promise.all([
        storage.getItemAsync("register_no"),
        storage.getItemAsync("authToken"),
        storage.getItemAsync("subscription"),
      ]);

      if (!regNo || !authToken) {
        router.replace({ pathname: "/(auth)/login" });
        return;
      }

      if (subscription !== "true") {
        router.replace({ pathname: "/subscription" });
        return;
      }
    } catch {
      await clearStoredSession();
      router.replace({ pathname: "/(auth)/login" });
    } finally {
      setLoading(false);
    }
  };

  checkAuth();
}, [router]);

const handleLogout = async () => {
  try {
    await logoutUser();
  } finally {
    await clearStoredSession();
  }
  router.replace({ pathname: "/(auth)/login" });
};



  if (loading) {
    return <ActivityIndicator size="large" color="#40407a" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.4)",
        tabBarStyle: {
          backgroundColor: "#40407a",
          borderTopWidth: 0.5,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom,
          paddingTop: 5,
          borderTopColor: "rgba(255,255,255,0.2)",
        },
      }}
    >
      <Tabs.Screen
        name="profile"
        options={{
          title: t("tab_profile"),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          headerStyle: { backgroundColor: "#40407a" },
          headerTitleStyle: { color: "#fff" },
          headerRight: () => (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginRight: 15 }}>
              <LanguagePicker compact />
              <TouchableOpacity
                onPress={() => {
                  handleLogout();
                }}
              >
                <LogOut color="#fff" size={22} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="transaction"
        options={{
          title: t("tab_transaction"),
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
          headerStyle: { backgroundColor: "#40407a" },
          headerTitleStyle: { color: "#fff" },
        }}
      />

      <Tabs.Screen
        name="payment"
        options={{
          title: t("tab_payment"),
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
          headerStyle: { backgroundColor: "#40407a" },
          headerTitleStyle: { color: "#fff" },
        }}
      />
    </Tabs>
  );
}
