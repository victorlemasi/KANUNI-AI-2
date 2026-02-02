"use server"

import { adminDb } from "@/lib/firebase-admin";
import { revalidatePath } from "next/cache";

export async function createProcurementAction(data: {
    title: string;
    value: number;
    method: string;
    analysis?: any;
}) {
    try {
        const docRef = await adminDb.collection("procurements").add({
            ...data,
            id: `PRQ-${Math.floor(1000 + Math.random() * 9000)}`, // Simple ID generation
            status: "Pending",
            risk: data.analysis?.isCompliant ? "Low" : "High", // Deriving risk from compliance
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date(),
        });

        // Also save compliance check as a sub-collection or field
        if (data.analysis) {
            await adminDb.collection("procurements").doc(docRef.id).collection("complianceChecks").add({
                ...data.analysis,
                checkedAt: new Date(),
            });
        }

        revalidatePath("/dashboard/procurements");
        return { success: true, id: docRef.id };
    } catch (error: any) {
        console.error("Firestore Save Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getProcurementsAction() {
    try {
        const snapshot = await adminDb.collection("procurements").orderBy("createdAt", "desc").get();
        const items = snapshot.docs.map(doc => ({
            id: doc.data().id,
            title: doc.data().title,
            method: doc.data().method,
            value: doc.data().value,
            status: doc.data().status,
            risk: doc.data().risk,
            date: doc.data().date,
            docId: doc.id
        }));
        return { success: true, items };
    } catch (error: any) {
        console.error("Firestore Fetch Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getProcurementByIdAction(docId: string) {
    try {
        const doc = await adminDb.collection("procurements").doc(docId).get();
        if (!doc.exists) return { success: false, error: "Not found" };

        const procurement = doc.data();

        // Fetch checks from sub-collection
        const checksSnapshot = await adminDb.collection("procurements").doc(docId).collection("complianceChecks").orderBy("checkedAt", "desc").limit(1).get();
        const latestCheck = checksSnapshot.empty ? null : checksSnapshot.docs[0].data();

        return {
            success: true,
            procurement: { ...procurement, docId: doc.id },
            analysis: latestCheck
        };
    } catch (error: any) {
        console.error("Firestore Fetch Error:", error);
        return { success: false, error: error.message };
    }
}
