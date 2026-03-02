/**
 * Registered user credentials for HAATAK platform.
 * Each user has a fixed email, password, and display name.
 * In production this would be a real auth backend.
 */

export interface RegisteredUser {
    email: string;
    password: string;
    name: string;
}

export const REGISTERED_USERS: RegisteredUser[] = [
    {
        email: 'jayachandrapatel123@gmail.com',
        password: 'abcd',
        name: 'Jayachandra Patel',
    },
    {
        email: 'aryaanand@gmail.com',
        password: 'arya2025',
        name: 'Arya Anand',
    },
    {
        email: 'rahulsharma@gmail.com',
        password: 'rahul@123',
        name: 'Rahul Sharma',
    },
    {
        email: 'priyamehra@gmail.com',
        password: 'priya456',
        name: 'Priya Mehra',
    },
    {
        email: 'demo@haatak.com',
        password: 'demo1234',
        name: 'Demo User',
    },
];

/**
 * Validate credentials and return the user if found, null otherwise.
 */
export function validateCredentials(email: string, password: string): RegisteredUser | null {
    const user = REGISTERED_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    return user || null;
}
