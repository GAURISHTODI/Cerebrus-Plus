import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Lexend_700Bold } from '@expo-google-fonts/lexend';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { ActivityIndicator, StatusBar as RNStatusBar, View } from 'react-native';
import { AuthProvider, useAuth } from '../context/AuthContext';

const InitialLayout = () => {
    const { user, isLoading } = useAuth();
    const segments = useSegments();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;
        const inTabsGroup = segments[0] === '(tabs)';
        if (user && !inTabsGroup) {
            router.replace('/home');
        } else if (!user && inTabsGroup) {
            router.replace('/login');
        }
    }, [user, isLoading]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#0D0F13' }}>
                <ActivityIndicator size="large" color="#FFFFFF" />
            </View>
        );
    }

    return <Slot />;
};

export default function RootLayout() {
    // --- Loads the custom fonts ---
    let [fontsLoaded, fontError] = useFonts({
        Lexend_700Bold,
        Inter_400Regular,
        Inter_600SemiBold,
    });

    if (!fontsLoaded && !fontError) {
        return null;
    }

    return (
        <AuthProvider>
          
            <RNStatusBar
  barStyle="dark-content"   // black text/icons
  translucent
  backgroundColor="transparent"
/>
            <InitialLayout />
        </AuthProvider>
    );
}
