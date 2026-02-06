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
            hasReport: !!data.analysis,
            overall_compliance_score: data.analysis?.overall_compliance_score || 0
        });

        // Also save compliance check as a sub-collection or field
        if (data.analysis) {
            await adminDb.collection("procurements").doc(docRef.id).collection("complianceChecks").add({
                ...data.analysis,
                checkedAt: new Date(),
            });

            // If not compliant, create a high-priority alert
            if (!data.analysis.isCompliant) {
                await adminDb.collection("alerts").add({
                    type: "Compliance Breach",
                    title: `Low Health Score for ${data.title}`,
                    procurementId: `PRQ-${Math.floor(1000 + Math.random() * 9000)}`, // Using the generated ID for tracking
                    procurementDocId: docRef.id,
                    severity: data.analysis.overall_compliance_score < 40 ? "Critical" : "High",
                    status: "New",
                    createdAt: new Date(),
                    description: data.analysis.summary
                });
            }
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
            docId: doc.id,
            hasReport: doc.data().hasReport || false,
            overall_compliance_score: doc.data().overall_compliance_score || 0
        }));
        return { success: true, items };
    } catch (error: any) {
        console.error("Firestore Fetch Error:", error);
        return { success: false, error: error.message };
    }
}

export async function getProcurementByIdAction(docId: string) {
    try {
        if (!docId || typeof docId !== 'string') {
            return { success: false, error: "Invalid procurement ID" };
        }
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

export async function getAlertsAction() {
    try {
        const snapshot = await adminDb.collection("alerts").orderBy("createdAt", "desc").get();
        const items = snapshot.docs.map(doc => ({
            ...doc.data(),
            docId: doc.id,
            createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
        }));
        return { success: true, items };
    } catch (error: any) {
        console.error("Firestore Fetch Error (Alerts):", error);
        return { success: false, error: error.message };
    }
}

export async function getDashboardStatsAction() {
    try {
        const procSnapshot = await adminDb.collection("procurements").get();
        const alertSnapshot = await adminDb.collection("alerts").where("status", "==", "New").get();

        let totalValue = 0;
        let totalScore = 0;
        let compliantCount = 0;
        let procurementCount = procSnapshot.size;

        const riskDistribution = { Low: 0, Medium: 0, High: 0, Critical: 0 };
        const monthlySpend = new Array(12).fill(0);
        const currentMonth = new Date().getMonth();

        procSnapshot.docs.forEach(doc => {
            const data = doc.data();
            const val = Number(data.value || 0);
            totalValue += val;
            totalScore += Number(data.overall_compliance_score || 0);
            if (data.hasReport && data.isCompliant !== false) compliantCount++;

            const risk = data.risk as keyof typeof riskDistribution;
            if (risk && riskDistribution[risk] !== undefined) riskDistribution[risk]++;

            // Monthly Spend Calculation
            const date = data.createdAt?.toDate?.() || new Date(data.date || Date.now());
            const monthIndex = date.getMonth();
            const relativeIndex = (monthIndex - (currentMonth - 11) + 12) % 12;
            if (relativeIndex >= 0 && relativeIndex < 12) {
                monthlySpend[relativeIndex] += val;
            }
        });

        // Normalize monthly spend for chart (0-100 scale)
        const maxSpend = Math.max(...monthlySpend, 1);
        const normalizedSpend = monthlySpend.map(s => Math.round((s / maxSpend) * 100));

        const riskPercentages = {
            Low: procurementCount > 0 ? Math.round((riskDistribution.Low / procurementCount) * 100) : 0,
            Medium: procurementCount > 0 ? Math.round((riskDistribution.Medium / procurementCount) * 100) : 0,
            High: procurementCount > 0 ? Math.round((riskDistribution.High / procurementCount) * 100) : 0,
            Critical: procurementCount > 0 ? Math.round((riskDistribution.Critical / procurementCount) * 100) : 0,
        };

        const stats = {
            totalValue,
            avgScore: procurementCount > 0 ? (totalScore / procurementCount).toFixed(1) : 0,
            complianceRate: procurementCount > 0 ? ((compliantCount / procurementCount) * 100).toFixed(1) : 0,
            activeAlerts: alertSnapshot.size,
            riskPercentages,
            normalizedSpend
        };

        return { success: true, stats };
    } catch (error: any) {
        console.error("Dashboard Stats Error:", error);
        return { success: false, error: error.message };
    }
}
export async function getAuditReportsAction() {
    try {
        const snapshot = await adminDb.collection("procurements")
            .where("hasReport", "==", true)
            .orderBy("createdAt", "desc")
            .get();

        const items = snapshot.docs.map(doc => ({
            id: doc.data().id,
            title: doc.data().title,
            method: doc.data().method,
            value: doc.data().value,
            date: doc.data().date,
            docId: doc.id,
            overall_compliance_score: doc.data().overall_compliance_score || 0,
            summary: doc.data().analysis?.summary || ""
        }));
        return { success: true, items };
    } catch (error: any) {
        console.error("Firestore Fetch Error (Reports):", error);
        return { success: false, error: error.message };
    }
}
