import { Stack } from 'expo-router';
import React from 'react';

export default function RoomLayout() {
    return (
        <Stack>
            <Stack.Screen name="[id]" options={{ headerShown: false }} />
        </Stack>
    );
}