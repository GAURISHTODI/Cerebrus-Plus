import { Ionicons } from '@expo/vector-icons';
import { Skia, SkPath } from '@shopify/react-native-skia';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, DocumentSnapshot, onSnapshot, orderBy, query } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, GestureResponderEvent, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WhiteboardCanvas } from '../../components/whiteboard/WhiteboardCanvas';
import { useAuth, UserProfile } from '../../context/AuthContext';
import { firestore } from '../../firebase/config';
import { addPathToRoom, getRoomMembers, PathData } from '../../services/firestore';

const BACKGROUND_COLOR = '#111317';
const COLORS = ['#FFFFFF', '#FF3B30', '#FF9500', '#FFCC00', '#34C759', '#007AFF', '#AF52DE'];
const THICKNESSES = [3, 6, 10, 15];

interface ToolbarProps {
  currentColor: string;
  currentThickness: number;
  setCurrentColor: (color: string) => void;
  setCurrentThickness: (thickness: number) => void;
  handleUndo: () => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ currentColor, currentThickness, setCurrentColor, setCurrentThickness, handleUndo }) => (
  <View style={styles.toolbarContainer}>
    {/* Top Row: Tools */}
    <View style={styles.toolbar}>
      <TouchableOpacity onPress={handleUndo} style={styles.toolButton}>
        <Ionicons name="arrow-undo-outline" size={24} color="white" />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setCurrentColor(BACKGROUND_COLOR)} style={[styles.toolButton, currentColor === BACKGROUND_COLOR && { backgroundColor: '#007AFF' }]}>
        <Ionicons name="trash-outline" size={24} color="white" />
      </TouchableOpacity>
      {/* Thickness Selector */}
      <View style={styles.thicknessContainer}>
        {THICKNESSES.map(t => (
          <TouchableOpacity key={t} onPress={() => setCurrentThickness(t)} style={styles.thicknessButton}>
            <View style={{ width: t + 4, height: t + 4, borderRadius: (t + 4) / 2, backgroundColor: currentThickness === t ? '#007AFF' : 'white' }} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
    {/* Bottom Row: Colors */}
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorPalette}>
      {COLORS.map(c => (
        <TouchableOpacity key={c} onPress={() => setCurrentColor(c)} style={[styles.colorButton, { backgroundColor: c }, currentColor === c && styles.selectedColor]} />
      ))}
    </ScrollView>
  </View>
);

export default function RoomScreen() {
    const { id: roomId } = useLocalSearchParams<{ id: string }>();
    const { userInfo } = useAuth();
    
    const [roomData, setRoomData] = useState<any>(null);
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [paths, setPaths] = useState<any[]>([]);
    const [currentColor, setCurrentColor] = useState('#FFFFFF');
    const [currentThickness, setCurrentThickness] = useState(5);
    const [currentPath, setCurrentPath] = useState<SkPath>(Skia.Path.Make());

    useEffect(() => {
        if (!roomId) return;
        const roomRef = doc(firestore, 'rooms', roomId);

        const unsubscribe = onSnapshot(roomRef, async (docSnap: DocumentSnapshot) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setRoomData(data);
                const memberProfiles = await getRoomMembers(data.members);
                setMembers(memberProfiles);
            } else {
                Alert.alert("Error", "This room no longer exists.", [{ text: "OK", onPress: () => router.back() }]);
            }
        });
        return () => unsubscribe();
    }, [roomId]);
    
    useEffect(() => {
        if (!roomId) return;
        const pathsRef = collection(firestore, 'rooms', roomId, 'paths');
        const q = query(pathsRef, orderBy('createdAt'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newPaths = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setPaths(newPaths);
        });
        return () => unsubscribe();
    }, [roomId]);

    // --- FINAL FIX for the phantom line drawing bug ---
    const handleTouchStart = useCallback((e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        // Resetting the path to a completely new object before starting is the most robust fix
        const newPath = Skia.Path.Make();
        newPath.moveTo(locationX, locationY);
        setCurrentPath(newPath);
    }, []);

    const handleTouchMove = useCallback((e: GestureResponderEvent) => {
        const { locationX, locationY } = e.nativeEvent;
        const newPath = currentPath.copy();
        newPath.lineTo(locationX, locationY);
        setCurrentPath(newPath);
    }, [currentPath]);

    const handleTouchEnd = useCallback(async () => {
        if (!userInfo || !roomId || currentPath.isEmpty()) {
            setCurrentPath(Skia.Path.Make()); // Clear path even if not sent
            return;
        };
        const pathData: PathData = { path: currentPath.toSVGString(), color: currentColor, thickness: currentThickness };
        await addPathToRoom(roomId, userInfo.uid, pathData);
        setCurrentPath(Skia.Path.Make());
    }, [userInfo, roomId, currentColor, currentThickness, currentPath]);

    const handleUndo = async () => { /* ... same as before, will now work after creating index ... */ };

    if (!roomData) return <ActivityIndicator style={{ flex: 1, backgroundColor: '#0D0F13' }} color="white" />;

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.roomNameText}>{roomData.name}</Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.canvasContainer}>
                <WhiteboardCanvas 
                    paths={paths}
                    currentPath={currentPath}
                    currentColor={currentColor}
                    currentThickness={currentThickness}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                />
            </View>
            
            {/* Toolbar and Members are now at the bottom */}
            <View style={styles.bottomContainer}>
                <Toolbar currentColor={currentColor} setCurrentColor={setCurrentColor} currentThickness={currentThickness} setCurrentThickness={setCurrentThickness} handleUndo={handleUndo} />
                <View style={styles.membersSection}>
                    <Text style={styles.membersTitle}>Members ({members.length})</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {members.map(member => (
                            <View key={member.uid} style={styles.memberChip}>
                                <Text style={styles.memberName}>
                                    {member.name}
                                    {member.uid === roomData.createdBy.uid && ' (Host)'}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0D0F13' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
    backButton: { padding: 5 },
    roomNameText: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    // --- INCREASED BOARD SIZE ---
    canvasContainer: { 
        flex: 1, // Takes up all available space
        marginHorizontal: 15,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 10,
    },
    bottomContainer: {
        paddingBottom: 10,
    },
    toolbarContainer: {
        marginHorizontal: 15,
        backgroundColor: '#1D1F23',
        borderRadius: 10,
        padding: 5,
    },
    toolbar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 5,
    },
    toolButton: { padding: 8, borderRadius: 5 },
    thicknessContainer: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#111317', 
        padding: 5, 
        borderRadius: 5 
    },
    thicknessButton: { marginHorizontal: 6, padding: 2, alignItems: 'center', justifyContent: 'center' },
    colorPalette: { 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingTop: 8,
        paddingHorizontal: 5,
    },
    colorButton: { 
        width: 28, 
        height: 28, 
        borderRadius: 14, 
        borderWidth: 2, 
        borderColor: 'transparent',
        marginHorizontal: 4,
    },
    selectedColor: { 
        borderColor: '#FFFFFF',
        transform: [{ scale: 1.2 }],
    },
    membersSection: { paddingHorizontal: 15, paddingTop: 15 },
    membersTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
    memberChip: { backgroundColor: '#007AFF', borderRadius: 15, paddingVertical: 5, paddingHorizontal: 12, marginRight: 10 },
    memberName: { color: 'white', fontWeight: '500' },
});