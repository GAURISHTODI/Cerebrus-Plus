import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

// --- This component creates the multi-color, aurora-style background ---
const Background = () => (
    <View style={styles.backgroundContainer}>
        <BlurView intensity={80} tint="light" style={[styles.blurBlob, styles.blob1]} />
        <BlurView intensity={90} tint="light" style={[styles.blurBlob, styles.blob2]} />
        <BlurView intensity={70} tint="light" style={[styles.blurBlob, styles.blob3]} />
    </View>
);

export default function SignupScreen() {
    const [name, setName] = useState('');
    const [regNo, setRegNo] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { signup } = useAuth();
    const router = useRouter();

     const handleSignup = async () => {
        if (!name || !regNo || !email || !password) {
            Alert.alert('Error', 'Please fill in all fields.');
            return;
        }
        setIsLoading(true);
        try {
            await signup(name, regNo, email, password);
        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                 Alert.alert('Signup Failed', 'This email address is already in use.');
            } else {
                 Alert.alert('Signup Failed', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Background />
            <SafeAreaView style={{flex: 1 , marginTop:-10}}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingContainer}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Welcome to the collaborative space.</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#9E9E9E" value={name} onChangeText={setName} />
                        <TextInput style={styles.input} placeholder="Registration Number" placeholderTextColor="#9E9E9E" value={regNo} onChangeText={setRegNo} autoCapitalize="characters" />
                        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9E9E9E" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9E9E9E" value={password} onChangeText={setPassword} secureTextEntry />
                        
                        <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Create Account</Text>}
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/login' as any)}>
                        <Text style={styles.linkText}>Already have an account? <Text style={{fontFamily: 'Inter_600SemiBold'}}>Sign In</Text></Text>
                    </TouchableOpacity>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#FFFFFF' },
    backgroundContainer: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
    blurBlob: { width: 400, height: 400, borderRadius: 200, position: 'absolute' },
    blob1: { backgroundColor: 'rgba(255, 99, 132, 0.2)', top: -100, left: -150 },
    blob2: { backgroundColor: 'rgba(54, 162, 235, 0.2)', top: '25%', right: -150 },
    blob3: { backgroundColor: 'rgba(255, 206, 86, 0.2)', bottom: -100, left: '20%' },
    keyboardAvoidingContainer: { flex: 1, justifyContent: 'space-between', padding: 15 },
    header: { alignItems: 'center', paddingTop: 30 },
    title: { fontFamily: 'Lexend_700Bold', fontSize: 40, color: '#1A1A1A' },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#666666', marginTop: 10 },
    formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)' },
    input: { backgroundColor: '#F8F7F4', fontFamily: 'Inter_400Regular', color: '#1A1A1A', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    button: { backgroundColor: '#1A1A1A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
    linkText: { color: '#666666', textAlign: 'center', paddingBottom: 20, fontFamily: 'Inter_400Regular' }
});