import { addDoc, arrayUnion, collection, doc, documentId, getDoc, getDocs, query, serverTimestamp, where, writeBatch } from 'firebase/firestore';
import { UserProfile } from '../context/AuthContext';
import { firestore } from '../firebase/config';

export interface RoomInfo { id: string; name: string; }
export interface PathData { path: string; color: string; thickness: number; }

export const createRoom = async (roomName: string, user: UserProfile): Promise<string> => {
    const newRoomRef = doc(collection(firestore, 'rooms'));
    const userDocRef = doc(firestore, 'users', user.uid);
    const batch = writeBatch(firestore);
    batch.set(newRoomRef, { name: roomName, createdAt: serverTimestamp(), createdBy: { uid: user.uid, name: user.name }, members: [user.uid] });
    batch.update(userDocRef, { rooms: arrayUnion(newRoomRef.id) });
    await batch.commit();
    return newRoomRef.id;
};

export const joinRoom = async (roomId: string, user: UserProfile): Promise<void> => {
    const roomDocRef = doc(firestore, 'rooms', roomId);
    const userDocRef = doc(firestore, 'users', user.uid);
    const roomDoc = await getDoc(roomDocRef);
    if (!roomDoc.exists()) throw new Error("Room not found. Please check the ID.");
    const roomData = roomDoc.data();
    if (roomData.members.includes(user.uid)) return;
    const batch = writeBatch(firestore);
    batch.update(roomDocRef, { members: arrayUnion(user.uid) });
    batch.update(userDocRef, { rooms: arrayUnion(roomId) });
    await batch.commit();
};

export const getUserRooms = async (roomIds: string[]): Promise<RoomInfo[]> => {
    if (!roomIds || roomIds.length === 0) return [];
    const roomsRef = collection(firestore, 'rooms');
    const q = query(roomsRef, where(documentId(), 'in', roomIds));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name as string }));
};

export const addPathToRoom = async (roomId: string, authorUid: string, pathData: PathData) => {
    const pathsRef = collection(firestore, 'rooms', roomId, 'paths');
    await addDoc(pathsRef, { ...pathData, authorUid, createdAt: serverTimestamp() });
};

export const getRoomMembers = async (memberIds: string[]): Promise<UserProfile[]> => {
    if (!memberIds || memberIds.length === 0) return [];
    const usersRef = collection(firestore, 'users');
    
    const q = query(usersRef, where(documentId(), 'in', memberIds));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
};