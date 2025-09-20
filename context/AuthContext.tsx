import { User, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, firestore } from '../firebase/config';

export interface UserProfile {
    uid: string;
    name: string;
    email: string;
    regNo: string;
    rooms: string[];
}

interface AuthContextType {
    user: User | null;
    userInfo: UserProfile | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (name: string, regNo: string, email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userInfo, setUserInfo] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (authUser) => {
            if (authUser) {
                const userDocRef = doc(firestore, 'users', authUser.uid);
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    setUserInfo(userDoc.data() as UserProfile);
                }
                setUser(authUser);
            } else {
                setUser(null);
                setUserInfo(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const signup = async (name: string, regNo: string, email: string, password: string) => {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;
        const userProfile: UserProfile = { uid: user.uid, name, email, regNo, rooms: [] };
        await setDoc(doc(firestore, 'users', user.uid), userProfile);
        setUserInfo(userProfile);
    };

    const login = (email: string, password: string) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);

    const value = { user, userInfo, isLoading, login, signup, logout };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);