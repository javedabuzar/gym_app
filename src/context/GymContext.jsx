import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../supabaseClient';
import { db } from '../db';
import { exportData, importData } from '../utils/backupUtils';

const GymContext = createContext();

export const useGym = () => useContext(GymContext);

export const GymProvider = ({ children }) => {
    const [members, setMembers] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [payments, setPayments] = useState([]);
    const [user, setUser] = useState({ id: 'admin-123', email: 'admin@local' });
    const [classes, setClasses] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [adminAccount, setAdminAccount] = useState({ approval_status: 'approved', payment_status: 'approved', is_active: true });
    const [adminStatusLoading, setAdminStatusLoading] = useState(false);
    const [onlineActiveMembers, setOnlineActiveMembers] = useState([]);
    const [monthlyReports, setMonthlyReports] = useState([]);


    // Core Settings
    const [baseGymFee, setBaseGymFee] = useState(3000);

    // System Settings (Synced from Supabase)
    const [supplementSettings, setSupplementSettings] = useState({
        creatine: { price: 100, isAuto: true },
        whey: { price: 300, isAuto: true },
        preworkout: { price: 200, isAuto: true }
    });

    const [cardioSettings, setCardioSettings] = useState({
        weeklyPrice: 1000,
        monthlyPrice: 3000,
        unlimitedMultiplier: 1.5,
        manualOverride: false
    });

    const [ptSettings, setPtSettings] = useState({
        rates: { one_month: 20000, six_months: 100000, one_year: 180000 }
    });

    const [cardioSubscriptions, setCardioSubscriptions] = useState({});
    const [ptSubscriptions, setPtSubscriptions] = useState({});

    useEffect(() => {
        // Authentication bypassed for local-only mode
        setLoading(false);
    }, []);


    const isAdminApproved = true;


    const fetchAdminAccount = async (authUser) => {
        return adminAccount;
    };


    const fetchData = async () => {
        if (!user || !isAdminApproved) return;

        const ownerId = user.id;
        console.log('📡 fetchData — ownerId:', ownerId);

        // --- 1. Load Local Operational Data from Dexie ---
        const localMembers = await db.members.where('owner_id').equals(ownerId).toArray();
        setMembers(localMembers);

        const localAttendance = await db.attendance.where('owner_id').equals(ownerId).toArray();
        const attendanceMap = {};
        localAttendance.forEach(record => {
            if (!attendanceMap[record.member_id]) attendanceMap[record.member_id] = [];
            attendanceMap[record.member_id].push(record.date);
        });
        setAttendance(attendanceMap);

        const localPayments = await db.payments.where('owner_id').equals(ownerId).toArray();
        setPayments(localPayments);

        const localClasses = await db.classes.where('owner_id').equals(ownerId).toArray();
        setClasses(localClasses);

        let localPlans = await db.plans.where('owner_id').equals(ownerId).toArray();
        if (localPlans.length === 0) {
            const defaults = [
                { name: 'Basic', fee: 3000, owner_id: ownerId },
                { name: 'Standard', fee: 5000, owner_id: ownerId },
                { name: 'VIP', fee: 8000, owner_id: ownerId }
            ];
            for (const plan of defaults) { await db.plans.add(plan); }
            localPlans = await db.plans.where('owner_id').equals(ownerId).toArray();
        }
        setPlans(localPlans);

        const localSettings = await db.gym_settings.where('owner_id').equals(ownerId).toArray();
        if (localSettings.length > 0) {
            localSettings.forEach(setting => {
                if (setting.category === 'supplement') setSupplementSettings(setting.settings);
                if (setting.category === 'cardio') setCardioSettings(setting.settings);
                if (setting.category === 'pt') setPtSettings(setting.settings);
            });
        }

        // --- 4. Load Subscriptions (Mapped for UI) ---
        const localCardio = await db.cardio_subscriptions
            .where('owner_id').equals(ownerId)
            .filter(sub => sub.status === 'Active')
            .toArray();

        const cardioMap = {};
        localCardio.forEach(sub => {
            cardioMap[sub.member_id] = {
                duration: sub.duration, type: sub.type, price: sub.price,
                active: true, startDate: sub.start_date
            };
        });
        setCardioSubscriptions(cardioMap);

        const localPt = await db.training_plans
            .where('owner_id').equals(ownerId)
            .filter(plan => plan.status === 'Active')
            .toArray();

        const ptMap = {};
        localPt.forEach(plan => {
            ptMap[plan.member_id] = {
                duration: plan.plan_type, price: plan.price,
                active: true, startDate: new Date(plan.start_date || plan.created_at).toLocaleDateString()
            };
        });
        setPtSubscriptions(ptMap);
    };

    // Removed syncWithCloud as per latest request (Local-only data)

    useEffect(() => {
        const init = async () => {
            try {
                await fetchData();
            } catch (err) {
                console.error('Error fetching initial data:', err);
            }
        };
        init();
    }, [user]);



    // Operational Functions (Dexie-only as requested)
    const addMember = async (member) => {
        const newMember = {
            ...member,
            owner_id: user.id,
            contact: member.contact || '',
            join_date: new Date().toISOString(),
            profile: member.profile || `https://i.pravatar.cc/150?u=${member.name + Date.now()}`
        };
        const id = await db.members.add(newMember);
        const savedMember = { ...newMember, id };
        setMembers([...members, savedMember]);
        return savedMember;
    };

    const updateMember = async (id, updates) => {
        await db.members.update(id, updates);
        setMembers(members.map(m => m.id === id ? { ...m, ...updates } : m));

        if (updates.payment === 'Paid') {
            const currentMonth = new Date().toISOString().slice(0, 7);
            const alreadyPaid = payments.some(p => p.member_id === id && p.month_year === currentMonth);
            if (!alreadyPaid) {
                const memberFee = members.find(m => m.id === id)?.fee || baseGymFee;
                const newPayment = { member_id: id, owner_id: user.id, month_year: currentMonth, amount: memberFee, status: 'Paid' };
                const payId = await db.payments.add(newPayment);
                setPayments([...payments, { ...newPayment, id: payId }]);
            }
        }
    };

    const removeMember = async (id) => {
        await db.members.delete(id);
        await db.attendance.where('member_id').equals(id).delete();
        await db.payments.where('member_id').equals(id).delete();
        setMembers(members.filter(m => m.id !== id));
    };

    const markAttendance = async (id) => {
        const today = new Date().toISOString().slice(0, 10);
        const memberAttendance = attendance[id] || [];
        if (memberAttendance.includes(today)) return { success: false, message: 'Already marked' };

        await db.attendance.add({ member_id: id, date: today, owner_id: user.id });
        setAttendance({ ...attendance, [id]: [...memberAttendance, today] });
        return { success: true, message: 'Marked!' };
    };

    const unmarkAttendance = async (id) => {
        const today = new Date().toISOString().slice(0, 10);
        await db.attendance.where({ member_id: id, date: today }).delete();
        setAttendance({ ...attendance, [id]: (attendance[id] || []).filter(d => d !== today) });
        return { success: true, message: 'Unmarked!' };
    };
    const togglePaymentStatus = async (memberId, monthYear) => {
        const existing = payments.find(p => p.member_id == memberId && p.month_year === monthYear);
        const newStatus = existing?.status === 'Paid' ? 'Unpaid' : 'Paid';
        const fee = newStatus === 'Paid' ? (members.find(m => m.id == memberId)?.fee || baseGymFee) : 0;

        if (existing) {
            await db.payments.update(existing.id, { status: newStatus, amount: fee });
            setPayments(payments.map(p => p.id === existing.id ? { ...p, status: newStatus, amount: fee } : p));
        } else {
            const newPay = { member_id: memberId, owner_id: user.id, month_year: monthYear, status: newStatus, amount: fee };
            const id = await db.payments.add(newPay);
            setPayments([...payments, { ...newPay, id }]);
        }
        return { success: true, status: newStatus };
    };

    const addClass = async (classData) => {
        const newClass = { ...classData, owner_id: user.id };
        const id = await db.classes.add(newClass);
        const saved = { ...newClass, id };
        setClasses([...classes, saved]);
        return saved;
    };

    const removeClass = async (id) => {
        await db.classes.delete(id);
        setClasses(classes.filter(c => c.id !== id));
    };

    const addPlan = async (planData) => {
        const newPlan = { ...planData, owner_id: user.id };
        const id = await db.plans.add(newPlan);
        const saved = { ...newPlan, id };
        setPlans([...plans, saved]);
        return saved;
    };

    const removePlan = async (id) => {
        await db.plans.delete(id);
        setPlans(plans.filter(p => p.id !== id));
    };

    const updatePaymentStatus = async (memberId, monthYear, status) => {
        const existing = payments.find(p => p.member_id == memberId && p.month_year === monthYear);
        const fee = status === 'Paid' ? (members.find(m => m.id == memberId)?.fee || baseGymFee) : 0;

        if (existing) {
            await db.payments.update(existing.id, { status, amount: fee });
            setPayments(payments.map(p => p.id === existing.id ? { ...p, status, amount: fee } : p));
        } else {
            const newPay = { member_id: memberId, owner_id: user.id, month_year: monthYear, status, amount: fee };
            const id = await db.payments.add(newPay);
            setPayments([...payments, { ...newPay, id }]);
        }
        return { success: true, status };
    };

    // Backup & Restore
    const backupData = async () => await exportData();
    const restoreData = async (file) => {
        const res = await importData(file);
        if (res.success) await fetchData();
        return res;
    };

    // Authentication
    const registerAdmin = async () => ({ success: true });
    const login = async () => true;
    const logout = async () => {};


    const saveSettings = async (category, newSettings) => {
        if (category === 'supplement') setSupplementSettings(newSettings);
        if (category === 'cardio') setCardioSettings(newSettings);
        if (category === 'pt') setPtSettings(newSettings);

        // Save to local Dexie with owner scoping
        await db.gym_settings.put({ owner_id: user.id, category, settings: newSettings });
    };

    return (
        <GymContext.Provider value={{
            members, attendance, payments, addMember, updateMember, removeMember,
            markAttendance, unmarkAttendance, togglePaymentStatus, updatePaymentStatus,
            getMemberAttendance: (id) => attendance[id] || [],
            user, loading, adminAccount, adminStatusLoading, isAdminApproved,
            login, logout, registerAdmin, backupData, restoreData,
            classes, addClass, removeClass,
            plans, addPlan, removePlan,
            supplementSettings, setSupplementSettings: (val) => saveSettings('supplement', val),
            cardioSettings, setCardioSettings: (val) => saveSettings('cardio', val),
            ptSettings, setPtSettings: (val) => saveSettings('pt', val),
            cardioSubscriptions, ptSubscriptions, baseGymFee, setBaseGymFee,
            refreshAdminAccount: () => fetchAdminAccount(user),
            onlineActiveMembers, monthlyReports
        }}>
            {children}
        </GymContext.Provider>
    );
};
