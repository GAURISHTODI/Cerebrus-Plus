import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';

// --- This component creates the multi-color, aurora-style background ---
const Background = () => (
    <View style={styles.backgroundContainer}>
        {/* Each BlurView is a soft, colored circle positioned absolutely */}
        <BlurView intensity={80} tint="light" style={[styles.blurBlob, styles.blob1]} />
        <BlurView intensity={90} tint="light" style={[styles.blurBlob, styles.blob2]} />
        <BlurView intensity={70} tint="light" style={[styles.blurBlob, styles.blob3]} />
    </View>
);

interface SocialButtonProps {
  icon: string;
  text: string;
  onPress: () => void;
}

const SocialButton: React.FC<SocialButtonProps> = ({ icon, text, onPress }) => (
  <TouchableOpacity style={styles.socialButton} onPress={onPress}>
    {/* <Ionicons name={icon} size={22} color="#1A1A1A" style={styles.socialIcon} /> */}
     <Ionicons name={icon as any} size={22} color="#1A1A1A" style={styles.socialIcon} />
    <Text style={styles.socialButtonText}>{text}</Text>
  </TouchableOpacity>
);

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password.');
            return;
        }
        setIsLoading(true);
        try {
            await login(email, password);
        } catch (error) {
            Alert.alert('Login Failed', 'Invalid email or password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Background />
            <SafeAreaView style={{flex: 1, marginTop: -40}}>
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={styles.keyboardAvoidingContainer}
                >
                    <View style={styles.header}>
                        <Text style={styles.title}>Cerebrus Plus</Text>
                        <Text style={styles.subtitle}>Sign in to get started</Text>
                    </View>

                    <View style={styles.formContainer}>
                        <TextInput style={styles.input} placeholder="Email" placeholderTextColor="#9E9E9E" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
                        <TextInput style={styles.input} placeholder="Password" placeholderTextColor="#9E9E9E" value={password} onChangeText={setPassword} secureTextEntry />
                        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.buttonText}>Sign In</Text>}
                        </TouchableOpacity>
                        
                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>or</Text>
                            <View style={styles.divider} />
                        </View>

                        <SocialButton icon="logo-google" text="Sign In with Google" onPress={() => Alert.alert('TODO: Implement Google Sign-In')} />
                        <SocialButton icon="logo-apple" text="Sign In with Apple" onPress={() => Alert.alert('TODO: Implement Apple Sign-In')} />
                    </View>

                    <TouchableOpacity onPress={() => router.push('/signup' as any)}>
                        <Text style={styles.linkText}>Don't have an account? <Text style={{fontFamily: 'Inter_600SemiBold'}}>Sign Up</Text></Text>
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
    keyboardAvoidingContainer: { flex: 1, justifyContent: 'space-between', padding: 20 },
    header: { alignItems: 'center', paddingTop: 60 },
    title: { fontFamily: 'Lexend_700Bold', fontSize: 48, color: '#1A1A1A' },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 16, color: '#666666', marginTop: 10 },
    formContainer: { backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: 25, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.9)' },
    input: { backgroundColor: '#F8F7F4', fontFamily: 'Inter_400Regular', color: '#1A1A1A', padding: 18, borderRadius: 12, marginBottom: 15, fontSize: 16, borderWidth: 1, borderColor: '#E0E0E0' },
    button: { backgroundColor: '#1A1A1A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
    dividerContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 20 },
    divider: { flex: 1, height: 1, backgroundColor: '#E0E0E0' },
    dividerText: { marginHorizontal: 10, color: '#9E9E9E', fontFamily: 'Inter_400Regular' },
    socialButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 15, borderWidth: 1, borderColor: '#E0E0E0', marginBottom: 10 },
    socialIcon: { marginRight: 10 },
    socialButtonText: { color: '#1A1A1A', fontFamily: 'Inter_600SemiBold', fontSize: 16 },
    linkText: { color: '#666666', textAlign: 'center', paddingBottom: 20, fontFamily: 'Inter_400Regular' }
});