'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LoggedInUser {
    name: string;
    email: string;
    loggedIn: boolean;
}

interface UserContextType {
    user: LoggedInUser | null;
    login: (email: string, name?: string) => void;
    logout: () => void;
    isLoggedIn: boolean;
}

const UserContext = createContext<UserContextType>({
    user: null,
    login: () => { },
    logout: () => { },
    isLoggedIn: false,
});

export function UserProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<LoggedInUser | null>(null);

    // Load user from localStorage on mount
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('haatak_user');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    if (parsed.loggedIn) {
                        setUser(parsed);
                    }
                } catch {
                    // Invalid data, clear it
                    localStorage.removeItem('haatak_user');
                }
            }
        }
    }, []);

    const login = (email: string, name?: string) => {
        // Derive display name from email if not provided
        const displayName = name || email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const userData: LoggedInUser = {
            name: displayName,
            email,
            loggedIn: true,
        };
        setUser(userData);
        if (typeof window !== 'undefined') {
            localStorage.setItem('haatak_user', JSON.stringify(userData));
        }
    };

    const logout = () => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem('haatak_user');
        }
    };

    return (
        <UserContext.Provider value={{ user, login, logout, isLoggedIn: !!user?.loggedIn }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);
