import { db } from '../db';

/**
 * Exports all operational data from Dexie to a JSON file.
 */
export const exportData = async () => {
    try {
        const members = await db.members.toArray();
        const attendance = await db.attendance.toArray();
        const payments = await db.payments.toArray();
        const settings = await db.gym_settings.toArray();
        const cardio = await db.cardio_subscriptions.toArray();
        const pt = await db.training_plans.toArray();
        const classes = await db.classes.toArray();
        const invoices = await db.invoices.toArray();

        const backupData = {
            version: 2,
            timestamp: new Date().toISOString(),
            data: {
                members,
                attendance,
                payments,
                settings,
                cardio,
                pt,
                classes,
                invoices
            }
        };

        const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gym_backup_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        return { success: true };
    } catch (error) {
        console.error("Export failed:", error);
        return { success: false, error: error.message };
    }
};

/**
 * Imports data from a JSON file into Dexie.
 * WARNING: This replaces current local data.
 */
export const importData = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const backup = JSON.parse(e.target.result);
                
                if (!backup.data || !backup.data.members) {
                    throw new Error("Invalid backup file format");
                }

                if (!window.confirm("This will replace all current member data on this device. Continue?")) {
                    return resolve({ success: false, message: "Import cancelled" });
                }

                // Clear current tables
                await db.transaction('rw', db.members, db.attendance, db.payments, db.gym_settings, db.cardio_subscriptions, db.training_plans, db.classes, db.invoices, async () => {
                    await db.members.clear();
                    await db.attendance.clear();
                    await db.payments.clear();
                    await db.gym_settings.clear();
                    await db.cardio_subscriptions.clear();
                    await db.training_plans.clear();
                    await db.classes.clear();
                    await db.invoices.clear();

                    // Bulk add new data
                    if (backup.data.members?.length > 0) await db.members.bulkAdd(backup.data.members);
                    if (backup.data.attendance?.length > 0) await db.attendance.bulkAdd(backup.data.attendance);
                    if (backup.data.payments?.length > 0) await db.payments.bulkAdd(backup.data.payments);
                    if (backup.data.settings?.length > 0) await db.gym_settings.bulkAdd(backup.data.settings);
                    if (backup.data.cardio?.length > 0) await db.cardio_subscriptions.bulkAdd(backup.data.cardio);
                    if (backup.data.pt?.length > 0) await db.training_plans.bulkAdd(backup.data.pt);
                    if (backup.data.classes?.length > 0) await db.classes.bulkAdd(backup.data.classes);
                    if (backup.data.invoices?.length > 0) await db.invoices.bulkAdd(backup.data.invoices);
                });

                resolve({ success: true });
            } catch (err) {
                console.error("Import failed:", err);
                resolve({ success: false, error: err.message });
            }
        };
        reader.onerror = () => reject(new Error("File reading failed"));
        reader.readAsText(file);
    });
};
