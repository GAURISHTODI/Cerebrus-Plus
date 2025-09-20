import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { getUserRooms, RoomInfo } from '../../services/firestore';

interface InfoRowProps {
  label: string;
  value?: string | number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, icon }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={22} color="#666666" />
    <View style={{ marginLeft: 15 }}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  </View>
);

export default function ProfileScreen() {
  const { userInfo, logout } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      if (userInfo?.rooms && userInfo.rooms.length > 0) {
        try {
          const fetchedRooms = await getUserRooms(userInfo.rooms);
          setRooms(fetchedRooms);
        } catch (error) {
          console.error("Failed to fetch rooms:", error);
        }
      }
      setIsLoading(false);
    };
    fetchRooms();
  }, [userInfo]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarInitial}>{userInfo?.name.charAt(0)}</Text>
          </View>
          <Text style={styles.name}>{userInfo?.name}</Text>
        </View>

        {/* Info Card */}
        <View style={styles.card}>
          <InfoRow label="Email" value={userInfo?.email} icon="mail-outline" />
          <InfoRow label="Registration No." value={userInfo?.regNo} icon="id-card-outline" />
        </View>

        {/* Rooms */}
        <Text style={styles.roomsTitle}>Your Rooms</Text>

        {isLoading ? (
          <ActivityIndicator color="#1A1A1A" />
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.roomItem}
                onPress={() => router.push({ pathname: `/room/${item.id}` } as any)}
              >
                <Text style={styles.roomName}>{item.name}</Text>
                <Ionicons name="chevron-forward" size={22} color="#9E9E9E" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>You haven't joined any rooms yet.</Text>
              </View>
            }
            scrollEnabled={false} // ✅ disable FlatList scrolling
            contentContainerStyle={{ paddingHorizontal: 20 }}
          />
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F7F4' },
  profileHeader: { alignItems: 'center', marginVertical: 30 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4A80F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarInitial: { color: '#FFFFFF', fontFamily: 'Lexend_700Bold', fontSize: 36 },
  name: { fontSize: 26, fontFamily: 'Lexend_700Bold', color: '#1A1A1A' },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  label: {
    fontFamily: 'Inter_400Regular',
    color: '#666666',
    fontSize: 14,
    marginBottom: 2,
  },
  value: { fontFamily: 'Inter_600SemiBold', color: '#1A1A1A', fontSize: 16 },
  roomsTitle: {
    fontFamily: 'Lexend_700Bold',
    color: '#1A1A1A',
    fontSize: 20,
    marginHorizontal: 20,
    marginTop: 30,
    marginBottom: 10,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roomName: { color: '#1A1A1A', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
  emptyContainer: { alignItems: 'center', marginTop: 15 },
  emptyText: { color: '#666666', fontFamily: 'Inter_400Regular' },
  footer: { padding: 20 },
  logoutButton: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutButtonText: { color: '#FF3B30', fontSize: 16, fontFamily: 'Inter_600SemiBold' },
});
