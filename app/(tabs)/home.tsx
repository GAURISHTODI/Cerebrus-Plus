import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { createRoom, joinRoom } from '../../services/firestore';

export default function HomeScreen() {
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'create' | 'join'>('create');
    const [roomName, setRoomName] = useState('');
    const [roomId, setRoomId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    const { userInfo } = useAuth();
    const router = useRouter();

    const openModal = (type: 'create' | 'join') => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleAction = async () => {
        if (!userInfo) return;
        setIsLoading(true);
        try {
            if (modalType === 'create') {
                if (!roomName.trim()) throw new Error("Room name cannot be empty.");
                const newRoomId = await createRoom(roomName, userInfo);
                router.push({ pathname: "/room/[id]", params: { id: newRoomId } } as any);
            } else {
                if (!roomId.trim()) throw new Error("Room ID cannot be empty.");
                await joinRoom(roomId, userInfo);
                router.push({ pathname: "/room/[id]", params: { id: roomId } } as any);
            }
            setModalVisible(false);
            setRoomName('');
            setRoomId('');
        } catch (error: any) {
            Alert.alert("Error", error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Cerebrus Plus</Text>
                    <Text style={styles.greeting}>Welcome Back,</Text>
                    <Text style={styles.name}>{userInfo?.name}</Text>
                </View>
                <Image 
                    source={require('../../assets/images/login-illustration.png')}
                    style={styles.logo}
                    contentFit="contain"
                />
            </View>

            <View style={styles.card} >
                <Ionicons name="color-wand-outline" size={28} color="#4A80F0" />
                <Text style={styles.cardTitle}>Create a New Space</Text>
                <Text style={styles.cardSubtitle}>Start a new whiteboard and invite your team to collaborate.</Text>
                <TouchableOpacity style={styles.cardButton} onPress={() => openModal('create')}>
                    <Text style={styles.cardButtonText}>Create Room</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card} >
                <Ionicons name="enter-outline" size={28} color="#34C759" />
                <Text style={styles.cardTitle}>Join a Space</Text>
                <Text style={styles.cardSubtitle}>Enter a Room ID to join an existing whiteboard session.</Text>
                <TouchableOpacity style={[styles.cardButton, {backgroundColor: '#34C759'}]} onPress={() => openModal('join')}>
                    <Text style={styles.cardButtonText}>Join Room</Text>
                </TouchableOpacity>
            </View>

            <Modal animationType="fade" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>{modalType === 'create' ? 'Name Your New Room' : 'Enter Room ID'}</Text>
                        <TextInput
                            style={styles.input}
                            placeholder={modalType === 'create' ? "e.g., Q4 Project Plan" : "Paste Room ID here"}
                            placeholderTextColor="#9E9E9E"
                            value={modalType === 'create' ? roomName : roomId}
                            onChangeText={modalType === 'create' ? setRoomName : setRoomId}
                            autoCapitalize={modalType === 'join' ? 'none' : 'sentences'}
                        />
                        <TouchableOpacity style={styles.modalButton} onPress={handleAction} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.cardButtonText}>{modalType === 'create' ? 'Create & Go' : 'Join'}</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={{marginTop: 10}} onPress={() => setModalVisible(false)}>
                            <Text style={{color: '#666666', fontFamily: 'Inter_400Regular'}}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 15, backgroundColor: '#F8F7F4' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingTop: 25 },
    greeting: { fontFamily: 'Inter_400Regular', color: '#666666', fontSize: 20 },
    name: { fontFamily: 'Lexend_700Bold', color: '#1A1A1A', fontSize: 26 },
    logo: { width: 100, height: 150, borderRadius: 20, marginRight:20,marginLeft:20 },
    title: { fontFamily: 'Lexend_700Bold', fontSize: 30, color: '#1A1A1A', marginBottom:20 },
    card: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
    cardTitle: { fontFamily: 'Lexend_700Bold', color: '#1A1A1A', fontSize: 18, marginTop: 10 },
    cardSubtitle: { fontFamily: 'Inter_400Regular', color: '#666666', fontSize: 13, marginTop: 4, lineHeight: 18 },
    cardButton: { backgroundColor: '#4A80F0', borderRadius: 10, paddingVertical: 10, marginTop: 15, alignItems: 'center' },
    cardButtonText: { fontFamily: 'Inter_600SemiBold', color: '#FFFFFF', fontSize: 15 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalView: { width: '85%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20, alignItems: 'center' },
    modalTitle: { fontFamily: 'Lexend_700Bold', color: '#1A1A1A', fontSize: 20, marginBottom: 15 },
    input: { width: '100%', backgroundColor: '#F8F7F4', borderRadius: 8, padding: 12, color: '#1A1A1A', fontFamily: 'Inter_400Regular', fontSize: 15, marginBottom: 15, borderWidth: 1, borderColor: '#E0E0E0' },
    modalButton: { backgroundColor: '#4A80F0', borderRadius: 10, paddingVertical: 12, alignItems: 'center', width: '100%' }
});
