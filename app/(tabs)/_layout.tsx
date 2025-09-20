import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabsLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false, // Hides the header for Home and Profile
                tabBarActiveTintColor: '#4A80F0', // Vibrant blue for active icon
                tabBarInactiveTintColor: '#9E9E9E', // Grey for inactive icon
                tabBarStyle: {
                    backgroundColor: '#FFFFFF',
                    borderTopWidth: 1,
                    borderTopColor: '#E0E0E0',
                    height: 90, // A bit taller for a modern feel
                    paddingBottom: 30,
                    // Soft shadow for iOS
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                    // Elevation for Android
                    elevation: 5,
                },
                tabBarLabelStyle: {
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 12,
                },
            }}
        >
            <Tabs.Screen
                name="home"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => 
                        <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ color, focused }) => 
                        <Ionicons name={focused ? "person-circle" : "person-circle-outline"} size={26} color={color} />,
                }}
            />
        </Tabs>
    );
}