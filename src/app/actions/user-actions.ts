"use server"

import { adminAuth } from "@/lib/firebase-admin";

export async function getUsersAction() {
    try {
        const listUsersResult = await adminAuth.listUsers();
        const users = listUsersResult.users.map(user => ({
            id: user.uid,
            name: user.displayName || "Unknown User",
            email: user.email,
            role: (user.customClaims?.role as string) || "User",
            status: user.disabled ? "Inactive" : "Active",
            lastLogin: user.metadata.lastSignInTime ? new Date(user.metadata.lastSignInTime).toLocaleString() : "Never",
            photoURL: user.photoURL
        }));
        return { success: true, users };
    } catch (error: any) {
        console.error("Firebase Auth Fetch Error:", error);
        return { success: false, error: error.message };
    }
}
