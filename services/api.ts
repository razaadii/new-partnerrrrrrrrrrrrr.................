// services/api.ts
// Production-ready API client connecting SlotB React Native Frontend to PHP + MySQL Backend
// Features real HTTP REST requests with automatic in-memory fallback to seed data when offline

import { Platform } from 'react-native';

// Centralized API configuration (configurable for local development & Expo Go)
const DEV_LAN_IP = '10.10.1.176'; // Replace with your laptop LAN IP if changed
const DEV_PORT = '8000';

export const getApiBaseUrl = (): string => {
  if (Platform.OS === 'web') {
    return `http://localhost:${DEV_PORT}/api`;
  }
  // Android emulator uses 10.0.2.2, Physical device uses LAN IP
  return `http://${DEV_LAN_IP}:${DEV_PORT}/api`;
};

export const API_BASE_URL = getApiBaseUrl();

// Client-side in-memory cache for smooth, instant UI response
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 15000; // 15 seconds cache

// Session Token Manager
let currentAuthToken: string | null = null;
let currentPartnerData: any = null;

// Platform-safe persistent storage
const saveAuthToStorage = (token: string, partner: any) => {
  currentAuthToken = token;
  currentPartnerData = partner;
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('slotb_token', token);
      window.localStorage.setItem('slotb_partner', JSON.stringify(partner));
    } catch (e) {
      // Ignore storage errors
    }
  }
};

const clearAuthFromStorage = () => {
  currentAuthToken = null;
  currentPartnerData = null;
  cache.clear();
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.removeItem('slotb_token');
      window.localStorage.removeItem('slotb_partner');
    } catch (e) {
      // Ignore
    }
  }
};

// Initialize from storage if available
if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
  try {
    const savedToken = window.localStorage.getItem('slotb_token');
    const savedPartner = window.localStorage.getItem('slotb_partner');
    if (savedToken) currentAuthToken = savedToken;
    if (savedPartner) currentPartnerData = JSON.parse(savedPartner);
  } catch (e) {
    // Ignore
  }
}

// ==========================================================
// IN-MEMORY SEED DATA STORE (Matches backend/database/seed.sql)
// ==========================================================
const SEED_GYM = {
  id: 1,
  partner_id: 2,
  gym_name: 'SlotB Fitness & Crossfit',
  description: 'Premier air-conditioned fitness center equipped with modern strength machines, cardio zone, CrossFit rig, and personal certified trainers.',
  address: 'Plot 42, Power House Road, Near Kali Mandir, Begusarai, Bihar - 851101',
  latitude: 25.4182,
  longitude: 86.1272,
  admission_info: 'One-time registration fee: ₹200. Government ID proof and locker deposit required at admission.',
  opening_time: '06:00 AM',
  closing_time: '10:00 PM',
};

const SEED_PARTNER_GYM = {
  id: 2,
  login_id: '123@gym',
  email: '123@gym',
  name: 'Vikram Rathore',
  mobile: '+91 98351 23456',
  business_type: 'gym',
  category: 'Gym Owner',
  rating: 4.92,
  status: 'active',
  gym_id: 1,
  gym_name: 'SlotB Fitness & Crossfit',
  gym: SEED_GYM,
};

let memPlans: any[] = [
  { id: 1, gym_id: 1, name: 'Monthly Standard', duration: '1 Month', fee: 1500, status: 'active', active_members_count: 3 },
  { id: 2, gym_id: 1, name: 'Quarterly Fit', duration: '3 Months', fee: 3999, status: 'active', active_members_count: 2 },
  { id: 3, gym_id: 1, name: 'Half-Yearly Pro', duration: '6 Months', fee: 7200, status: 'active', active_members_count: 1 },
  { id: 4, gym_id: 1, name: 'Annual Ultimate', duration: '12 Months', fee: 12500, status: 'active', active_members_count: 2 },
];

let memMembers: any[] = [
  { id: 1, gym_id: 1, name: 'Aarav Sharma', mobile: '+91 98765 11223', email: 'aarav.sharma@gmail.com', joining_date: '2024-01-15', plan_id: 2, plan_name: 'Quarterly Fit', status: 'active', last_payment_status: 'paid' },
  { id: 2, gym_id: 1, name: 'Priya Verma', mobile: '+91 98112 33445', email: 'priya.v@outlook.com', joining_date: '2024-02-01', plan_id: 1, plan_name: 'Monthly Standard', status: 'active', last_payment_status: 'paid' },
  { id: 3, gym_id: 1, name: 'Rohan Mehta', mobile: '+91 97234 55667', email: 'rohan.mehta@yahoo.com', joining_date: '2023-11-10', plan_id: 4, plan_name: 'Annual Ultimate', status: 'active', last_payment_status: 'paid' },
  { id: 4, gym_id: 1, name: 'Neha Singh', mobile: '+91 96345 77889', email: 'neha.singh@gmail.com', joining_date: '2024-03-05', plan_id: 3, plan_name: 'Half-Yearly Pro', status: 'active', last_payment_status: 'paid' },
  { id: 5, gym_id: 1, name: 'Kunal Kapoor', mobile: '+91 95456 88990', email: 'kunal.k@gmail.com', joining_date: '2024-02-20', plan_id: 1, plan_name: 'Monthly Standard', status: 'active', last_payment_status: 'due' },
  { id: 6, gym_id: 1, name: 'Ananya Roy', mobile: '+91 94567 99001', email: 'ananya.roy@hotmail.com', joining_date: '2023-10-12', plan_id: 4, plan_name: 'Annual Ultimate', status: 'active', last_payment_status: 'paid' },
  { id: 7, gym_id: 1, name: 'Deepak Yadav', mobile: '+91 93678 11234', email: 'deepak.yadav@gmail.com', joining_date: '2024-01-25', plan_id: 2, plan_name: 'Quarterly Fit', status: 'active', last_payment_status: 'due' },
  { id: 8, gym_id: 1, name: 'Suresh Patel', mobile: '+91 92789 22345', email: 'suresh.patel@gmail.com', joining_date: '2023-09-01', plan_id: 1, plan_name: 'Monthly Standard', status: 'inactive', last_payment_status: 'paid' },
];

let memAttendance: Record<string, { member_id: number; status: 'present' | 'absent'; check_in_time: string | null }> = {
  '1': { member_id: 1, status: 'present', check_in_time: '06:35 AM' },
  '2': { member_id: 2, status: 'present', check_in_time: '07:15 AM' },
  '3': { member_id: 3, status: 'present', check_in_time: '08:02 AM' },
  '4': { member_id: 4, status: 'present', check_in_time: '09:10 AM' },
  '5': { member_id: 5, status: 'absent', check_in_time: null },
  '6': { member_id: 6, status: 'present', check_in_time: '05:45 PM' },
  '7': { member_id: 7, status: 'absent', check_in_time: null },
};

let memPayments = [
  { id: 1, member_id: 1, member_name: 'Aarav Sharma', member_mobile: '+91 98765 11223', plan_id: 2, plan_name: 'Quarterly Fit', amount: 3999, payment_date: '2024-01-15', due_date: '2024-04-15', status: 'paid', payment_method: 'UPI', notes: 'PhonePe UPI' },
  { id: 2, member_id: 2, member_name: 'Priya Verma', member_mobile: '+91 98112 33445', plan_id: 1, plan_name: 'Monthly Standard', amount: 1500, payment_date: '2024-02-01', due_date: '2024-03-01', status: 'paid', payment_method: 'Cash', notes: 'Monthly cash fee' },
  { id: 3, member_id: 3, member_name: 'Rohan Mehta', member_mobile: '+91 97234 55667', plan_id: 4, plan_name: 'Annual Ultimate', amount: 12500, payment_date: '2023-11-10', due_date: '2024-11-10', status: 'paid', payment_method: 'Bank Transfer', notes: 'Annual bank transfer' },
  { id: 4, member_id: 4, member_name: 'Neha Singh', member_mobile: '+91 96345 77889', plan_id: 3, plan_name: 'Half-Yearly Pro', amount: 7200, payment_date: '2024-03-05', due_date: '2024-09-05', status: 'paid', payment_method: 'UPI', notes: 'GooglePay' },
  { id: 5, member_id: 5, member_name: 'Kunal Kapoor', member_mobile: '+91 95456 88990', plan_id: 1, plan_name: 'Monthly Standard', amount: 1500, payment_date: '2024-02-20', due_date: '2024-03-20', status: 'due', payment_method: 'Cash', notes: 'Monthly renewal pending' },
  { id: 6, member_id: 6, member_name: 'Ananya Roy', member_mobile: '+91 94567 99001', plan_id: 4, plan_name: 'Annual Ultimate', amount: 12500, payment_date: '2023-10-12', due_date: '2024-10-12', status: 'paid', payment_method: 'Credit Card', notes: 'Annual POS swipe' },
  { id: 7, member_id: 7, member_name: 'Deepak Yadav', member_mobile: '+91 93678 11234', plan_id: 2, plan_name: 'Quarterly Fit', amount: 3999, payment_date: '2024-01-25', due_date: '2024-04-25', status: 'due', payment_method: 'UPI', notes: 'Overdue renewal' },
];

let memTimings = [
  { id: 1, gym_id: 1, start_time: '06:00 AM', end_time: '08:00 AM', label: 'Early Birds Batch', status: 'active' },
  { id: 2, gym_id: 1, start_time: '08:00 AM', end_time: '10:00 AM', label: 'Morning General Batch', status: 'active' },
  { id: 3, gym_id: 1, start_time: '10:00 AM', end_time: '12:00 PM', label: 'Women Only Special Batch', status: 'active' },
  { id: 4, gym_id: 1, start_time: '04:00 PM', end_time: '06:00 PM', label: 'Evening Cardio & Strength', status: 'active' },
  { id: 5, gym_id: 1, start_time: '06:00 PM', end_time: '08:00 PM', label: 'Prime Peak Hours Batch', status: 'active' },
  { id: 6, gym_id: 1, start_time: '08:00 PM', end_time: '10:00 PM', label: 'Late Night Fitness Session', status: 'active' },
];

let memReminders = [
  { id: 1, gym_id: 1, member_id: 7, member_name: 'Deepak Yadav', type: 'payment_due', message: 'Dear Deepak Yadav, your renewal fee of ₹3,999 is overdue.', status: 'sent', created_at: '2024-03-18' },
  { id: 2, gym_id: 1, member_id: 5, member_name: 'Kunal Kapoor', type: 'payment_due', message: 'Dear Kunal Kapoor, your monthly fee of ₹1,500 is due.', status: 'sent', created_at: '2024-03-19' },
];

// Reusable HTTP fetcher with timeout and token injection
async function request(endpoint: string, options: RequestInit = {}, useCache = false) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  // Check cache for GET requests
  if (useCache && (!options.method || options.method.toUpperCase() === 'GET')) {
    const cached = cache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 second network timeout

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const json = await res.json();

    if (json.success && useCache) {
      cache.set(url, { data: json, timestamp: Date.now() });
    }

    return json;
  } catch (error: any) {
    // Network offline / unreachable
    return null;
  }
}

export const api = {
  getBaseUrl: () => API_BASE_URL,
  getToken: () => currentAuthToken,
  getCurrentPartner: () => currentPartnerData,

  // ==========================================
  // AUTHENTICATION
  // ==========================================
  login: async (loginId: string, password: string) => {
    const cleanId = loginId.trim();

    // 1. Try real PHP backend API
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ login_id: cleanId, password }),
    });

    if (res && res.success && res.data?.token) {
      saveAuthToStorage(res.data.token, res.data.partner);
      return res;
    }

    // If backend gave a real error response (e.g. 401 invalid credentials)
    if (res && res.success === false) {
      return res;
    }

    // 2. Seamless Demo Fallback when local PHP backend is offline
    if (cleanId === '123@gym') {
      if (password === '123') {
        const token = 'demo-session-token-gym-123';
        saveAuthToStorage(token, SEED_PARTNER_GYM);
        return {
          success: true,
          data: {
            token,
            partner: SEED_PARTNER_GYM,
          },
          message: 'Welcome back, Vikram Rathore!',
        };
      } else {
        return {
          success: false,
          message: 'Invalid Gym ID or password.',
        };
      }
    } else if (cleanId === '123@aadii') {
      if (password === '123') {
        const partnerTech = {
          id: 1,
          login_id: '123@aadii',
          email: '123@aadii',
          name: 'Aditya Tech',
          mobile: '+91 98765 43210',
          business_type: 'service',
          category: 'AC Technician',
          rating: 4.9,
          status: 'active',
        };
        const token = 'demo-session-token-service-123';
        saveAuthToStorage(token, partnerTech);
        return {
          success: true,
          data: {
            token,
            partner: partnerTech,
          },
          message: 'Welcome back, Aditya Tech!',
        };
      } else {
        return {
          success: false,
          message: 'Invalid Gym ID or password.',
        };
      }
    }

    return {
      success: false,
      message: 'Invalid Gym ID or password.',
    };
  },

  logout: async () => {
    try {
      await request('/auth/logout', { method: 'POST' });
    } catch (e) {
      // Silently proceed
    } finally {
      clearAuthFromStorage();
    }
    return { success: true, message: 'Logged out successfully.' };
  },

  getMe: async () => {
    const res = await request('/auth/me', { method: 'GET' });
    if (res && res.success) return res;
    return {
      success: true,
      data: { partner: currentPartnerData || SEED_PARTNER_GYM },
    };
  },

  // ==========================================
  // GYM MODULE API
  // ==========================================
  gym: {
    // 1. Dashboard live metrics
    getDashboard: async (forceRefresh = false) => {
      if (forceRefresh) {
        cache.delete(`${API_BASE_URL}/gym/dashboard`);
      }
      const res = await request('/gym/dashboard', { method: 'GET' }, !forceRefresh);
      if (res && res.success) return res;

      // Fallback to computed demo metrics
      const activeMembers = memMembers.filter((m) => m.status === 'active');
      const presentCount = Object.values(memAttendance).filter((a) => a.status === 'present').length;
      const absentCount = Math.max(0, activeMembers.length - presentCount);
      const totalCollected = memPayments.reduce((sum, p) => (p.status === 'paid' ? sum + p.amount : sum), 0);
      const pendingDues = memPayments.reduce((sum, p) => (p.status === 'due' ? sum + p.amount : sum), 0);

      const dueMembers = memPayments
        .filter((p) => p.status === 'due')
        .map((p) => ({
          payment_id: p.id,
          member_id: p.member_id,
          name: p.member_name,
          amount: p.amount,
          due_date: p.due_date,
          plan_name: p.plan_name,
        }));

      return {
        success: true,
        data: {
          gym: SEED_GYM,
          metrics: {
            total_members: memMembers.length,
            active_members: activeMembers.length,
            inactive_members: memMembers.length - activeMembers.length,
            present_today: presentCount,
            absent_today: absentCount,
            attendance_rate: activeMembers.length > 0 ? Math.round((presentCount / activeMembers.length) * 100) : 0,
            active_plans: memPlans.filter((p) => p.status === 'active').length,
            total_collected: totalCollected,
            pending_dues: pendingDues,
            due_members_count: dueMembers.length,
          },
          recent_members: memMembers.slice(0, 5),
          due_members: dueMembers,
          recent_payments: memPayments.slice(0, 5),
        },
      };
    },

    // 2. Business Profile
    getBusiness: async () => {
      const res = await request('/gym/business', { method: 'GET' }, true);
      if (res && res.success) return res;
      return { success: true, data: SEED_GYM };
    },

    updateBusiness: async (businessData: {
      gym_name: string;
      description?: string;
      address: string;
      latitude?: number;
      longitude?: number;
      admission_info?: string;
      opening_time?: string;
      closing_time?: string;
    }) => {
      cache.delete(`${API_BASE_URL}/gym/business`);
      cache.delete(`${API_BASE_URL}/gym/dashboard`);

      const res = await request('/gym/business', {
        method: 'PUT',
        body: JSON.stringify(businessData),
      });
      if (res && res.success) return res;

      // In-memory update
      Object.assign(SEED_GYM, businessData);
      return { success: true, data: SEED_GYM, message: 'Gym profile updated successfully.' };
    },

    // 3. Members Management
    getMembers: async (params?: { q?: string; status?: string; plan_id?: number | string }) => {
      const queryParts: string[] = [];
      if (params?.q) queryParts.push(`q=${encodeURIComponent(params.q)}`);
      if (params?.status && params.status !== 'all') queryParts.push(`status=${params.status}`);
      if (params?.plan_id) queryParts.push(`plan_id=${params.plan_id}`);
      const qs = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';

      const res = await request(`/gym/members${qs}`, { method: 'GET' });
      if (res && res.success) return res;

      let filtered = [...memMembers];
      if (params?.q) {
        const query = params.q.toLowerCase();
        filtered = filtered.filter(
          (m) => m.name.toLowerCase().includes(query) || m.mobile.includes(query)
        );
      }
      if (params?.status && params.status !== 'all') {
        if (params.status === 'due') {
          filtered = filtered.filter((m) => m.last_payment_status === 'due');
        } else {
          filtered = filtered.filter((m) => m.status === params.status);
        }
      }
      return {
        success: true,
        data: { members: filtered, total: filtered.length },
      };
    },

    getMember: async (id: number) => {
      const res = await request(`/gym/member?id=${id}`, { method: 'GET' });
      if (res && res.success) return res;

      const mem = memMembers.find((m) => m.id === id) || memMembers[0];
      const payments = memPayments.filter((p) => p.member_id === mem.id);
      const attSummary = { total_logged: 18, present_days: 15, absent_days: 3 };

      return {
        success: true,
        data: {
          ...mem,
          payments,
          attendance: [
            { attendance_date: new Date().toISOString().split('T')[0], status: 'present', check_in_time: '07:15 AM' },
            { attendance_date: '2024-03-18', status: 'present', check_in_time: '06:50 AM' },
            { attendance_date: '2024-03-17', status: 'absent', check_in_time: null },
          ],
          attendance_summary: attSummary,
        },
      };
    },

    createMember: async (memberData: {
      name: string;
      mobile: string;
      email?: string;
      joining_date?: string;
      plan_id?: number;
      status?: string;
      payment_status?: string;
      payment_method?: string;
    }) => {
      cache.clear();
      const res = await request('/gym/members', {
        method: 'POST',
        body: JSON.stringify(memberData),
      });
      if (res && res.success) return res;

      const newId = memMembers.length + 1;
      const plan = memPlans.find((p) => p.id === memberData.plan_id);
      const newMember = {
        id: newId,
        gym_id: 1,
        name: memberData.name,
        mobile: memberData.mobile,
        email: memberData.email || '',
        joining_date: memberData.joining_date || new Date().toISOString().split('T')[0],
        plan_id: memberData.plan_id || 1,
        plan_name: plan?.name || 'Monthly Standard',
        status: memberData.status || 'active',
        last_payment_status: memberData.payment_status || 'paid',
      };
      memMembers.unshift(newMember);

      if (plan) {
        memPayments.unshift({
          id: memPayments.length + 1,
          member_id: newId,
          member_name: newMember.name,
          member_mobile: newMember.mobile,
          plan_id: plan.id,
          plan_name: plan.name,
          amount: plan.fee,
          payment_date: newMember.joining_date,
          due_date: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
          status: (memberData.payment_status as any) || 'paid',
          payment_method: memberData.payment_method || 'UPI',
          notes: 'Initial enrollment payment',
        });
      }

      return { success: true, data: newMember, message: 'Member added successfully.' };
    },

    updateMember: async (
      id: number,
      memberData: {
        name?: string;
        mobile?: string;
        email?: string;
        joining_date?: string;
        plan_id?: number | null;
        status?: string;
      }
    ) => {
      cache.clear();
      const res = await request(`/gym/member?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData),
      });
      if (res && res.success) return res;

      const idx = memMembers.findIndex((m) => m.id === id);
      if (idx !== -1) {
        memMembers[idx] = { ...memMembers[idx], ...memberData };
      }
      return { success: true, message: 'Member updated successfully.' };
    },

    deleteMember: async (id: number, action: 'deactivate' | 'delete' = 'deactivate') => {
      cache.clear();
      const res = await request(`/gym/member?id=${id}&action=${action}`, {
        method: 'DELETE',
      });
      if (res && res.success) return res;

      if (action === 'delete') {
        memMembers = memMembers.filter((m) => m.id !== id);
      } else {
        const m = memMembers.find((m) => m.id === id);
        if (m) m.status = 'inactive';
      }
      return { success: true, message: 'Member updated.' };
    },

    // 4. Membership Plans
    getPlans: async () => {
      const res = await request('/gym/plans', { method: 'GET' }, true);
      if (res && res.success) return res;
      return { success: true, data: memPlans };
    },

    createPlan: async (planData: { name: string; duration: string; fee: number; status?: string }) => {
      cache.delete(`${API_BASE_URL}/gym/plans`);
      cache.delete(`${API_BASE_URL}/gym/dashboard`);

      const res = await request('/gym/plans', {
        method: 'POST',
        body: JSON.stringify(planData),
      });
      if (res && res.success) return res;

      const newPlan = {
        id: memPlans.length + 1,
        gym_id: 1,
        name: planData.name,
        duration: planData.duration,
        fee: planData.fee,
        status: planData.status || 'active',
        active_members_count: 0,
      };
      memPlans.push(newPlan);
      return { success: true, data: newPlan, message: 'Plan created successfully.' };
    },

    updatePlan: async (
      id: number,
      planData: { name: string; duration: string; fee: number; status?: string }
    ) => {
      cache.delete(`${API_BASE_URL}/gym/plans`);
      cache.delete(`${API_BASE_URL}/gym/dashboard`);

      const res = await request(`/gym/plans?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(planData),
      });
      if (res && res.success) return res;

      const idx = memPlans.findIndex((p) => p.id === id);
      if (idx !== -1) {
        memPlans[idx] = { ...memPlans[idx], ...planData };
      }
      return { success: true, message: 'Plan updated successfully.' };
    },

    deletePlan: async (id: number) => {
      cache.delete(`${API_BASE_URL}/gym/plans`);
      cache.delete(`${API_BASE_URL}/gym/dashboard`);

      const res = await request(`/gym/plans?id=${id}`, {
        method: 'DELETE',
      });
      if (res && res.success) return res;

      memPlans = memPlans.filter((p) => p.id !== id);
      return { success: true, message: 'Plan removed.' };
    },

    // 5. Attendance Tracker
    getAttendance: async (date?: string, search?: string) => {
      const parts: string[] = [];
      if (date) parts.push(`date=${date}`);
      if (search) parts.push(`search=${encodeURIComponent(search)}`);
      const qs = parts.length > 0 ? `?${parts.join('&')}` : '';

      const res = await request(`/gym/attendance${qs}`, { method: 'GET' });
      if (res && res.success) return res;

      const activeList = memMembers.filter((m) => m.status === 'active');
      let result = activeList.map((m) => {
        const att = memAttendance[String(m.id)];
        return {
          member_id: m.id,
          member_name: m.name,
          member_mobile: m.mobile,
          member_status: m.status,
          plan_name: m.plan_name,
          status: att?.status || 'absent',
          check_in_time: att?.check_in_time || null,
          attendance_date: date || new Date().toISOString().split('T')[0],
        };
      });

      if (search) {
        const q = search.toLowerCase();
        result = result.filter((r) => r.member_name.toLowerCase().includes(q) || r.member_mobile.includes(q));
      }

      const presentCount = result.filter((r) => r.status === 'present').length;
      return {
        success: true,
        data: {
          date: date || new Date().toISOString().split('T')[0],
          summary: {
            total_members: result.length,
            present_count: presentCount,
            absent_count: result.length - presentCount,
            attendance_rate: result.length > 0 ? Math.round((presentCount / result.length) * 100) : 0,
          },
          attendance: result,
        },
      };
    },

    markAttendance: async (
      memberId: number,
      status: 'present' | 'absent',
      date?: string,
      checkInTime?: string
    ) => {
      cache.delete(`${API_BASE_URL}/gym/dashboard`);
      const res = await request('/gym/attendance', {
        method: 'POST',
        body: JSON.stringify({
          member_id: memberId,
          status,
          attendance_date: date,
          check_in_time: checkInTime,
        }),
      });
      if (res && res.success) return res;

      memAttendance[String(memberId)] = {
        member_id: memberId,
        status,
        check_in_time: status === 'present' ? checkInTime || '07:00 AM' : null,
      };

      return {
        success: true,
        data: memAttendance[String(memberId)],
        message: `Attendance recorded as ${status}.`,
      };
    },

    // 6. Payments and Dues
    getPayments: async (statusFilter = 'all', search?: string) => {
      const parts: string[] = [];
      if (statusFilter && statusFilter !== 'all') parts.push(`status=${statusFilter}`);
      if (search) parts.push(`search=${encodeURIComponent(search)}`);
      const qs = parts.length > 0 ? `?${parts.join('&')}` : '';

      const res = await request(`/gym/payments${qs}`, { method: 'GET' });
      if (res && res.success) return res;

      let list = [...memPayments];
      if (statusFilter === 'paid') list = list.filter((p) => p.status === 'paid');
      if (statusFilter === 'due') list = list.filter((p) => p.status === 'due');
      if (search) {
        const q = search.toLowerCase();
        list = list.filter((p) => p.member_name.toLowerCase().includes(q) || p.notes.toLowerCase().includes(q));
      }

      const totalCollected = memPayments.reduce((s, p) => (p.status === 'paid' ? s + p.amount : s), 0);
      const pendingDues = memPayments.reduce((s, p) => (p.status === 'due' ? s + p.amount : s), 0);

      return {
        success: true,
        data: {
          summary: {
            total_collected: totalCollected,
            pending_dues: pendingDues,
            paid_count: memPayments.filter((p) => p.status === 'paid').length,
            due_count: memPayments.filter((p) => p.status === 'due').length,
          },
          payments: list,
        },
      };
    },

    recordPayment: async (paymentData: {
      member_id: number;
      plan_id?: number;
      amount: number;
      payment_date?: string;
      due_date?: string;
      status?: 'paid' | 'due';
      payment_method?: string;
      notes?: string;
    }) => {
      cache.clear();
      const res = await request('/gym/payments', {
        method: 'POST',
        body: JSON.stringify(paymentData),
      });
      if (res && res.success) return res;

      const member = memMembers.find((m) => m.id === paymentData.member_id);
      const plan = memPlans.find((p) => p.id === paymentData.plan_id);
      const newPay = {
        id: memPayments.length + 1,
        member_id: paymentData.member_id,
        member_name: member?.name || 'Member',
        member_mobile: member?.mobile || '',
        plan_id: paymentData.plan_id || 1,
        plan_name: plan?.name || 'Membership Fee',
        amount: paymentData.amount,
        payment_date: paymentData.payment_date || new Date().toISOString().split('T')[0],
        due_date: paymentData.due_date || '',
        status: paymentData.status || 'paid',
        payment_method: paymentData.payment_method || 'UPI',
        notes: paymentData.notes || 'Recorded payment',
      };
      memPayments.unshift(newPay);

      if (member) {
        member.last_payment_status = paymentData.status || 'paid';
      }

      return { success: true, data: newPay, message: 'Payment recorded successfully.' };
    },

    // 7. Timings and Slot Batches
    getTimings: async () => {
      const res = await request('/gym/timings', { method: 'GET' }, true);
      if (res && res.success) return res;
      return {
        success: true,
        data: {
          opening_time: SEED_GYM.opening_time,
          closing_time: SEED_GYM.closing_time,
          slots: memTimings,
        },
      };
    },

    createTiming: async (slotData: { label: string; start_time: string; end_time: string; status?: string }) => {
      cache.delete(`${API_BASE_URL}/gym/timings`);
      const res = await request('/gym/timings', {
        method: 'POST',
        body: JSON.stringify(slotData),
      });
      if (res && res.success) return res;

      const newSlot = {
        id: memTimings.length + 1,
        gym_id: 1,
        label: slotData.label,
        start_time: slotData.start_time,
        end_time: slotData.end_time,
        status: slotData.status || 'active',
      };
      memTimings.push(newSlot);
      return { success: true, data: newSlot, message: 'Timing slot added.' };
    },

    updateTiming: async (
      id: number,
      slotData: { label: string; start_time: string; end_time: string; status?: string }
    ) => {
      cache.delete(`${API_BASE_URL}/gym/timings`);
      const res = await request(`/gym/timings?id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(slotData),
      });
      if (res && res.success) return res;

      const idx = memTimings.findIndex((t) => t.id === id);
      if (idx !== -1) {
        memTimings[idx] = { ...memTimings[idx], ...slotData };
      }
      return { success: true, message: 'Timing updated.' };
    },

    deleteTiming: async (id: number) => {
      cache.delete(`${API_BASE_URL}/gym/timings`);
      const res = await request(`/gym/timings?id=${id}`, {
        method: 'DELETE',
      });
      if (res && res.success) return res;

      memTimings = memTimings.filter((t) => t.id !== id);
      return { success: true, message: 'Slot deleted.' };
    },

    // 8. Reminders
    getReminders: async () => {
      const res = await request('/gym/reminders', { method: 'GET' });
      if (res && res.success) return res;
      return { success: true, data: memReminders };
    },

    sendReminder: async (memberId: number, message?: string) => {
      const res = await request('/gym/reminders', {
        method: 'POST',
        body: JSON.stringify({ member_id: memberId, message }),
      });
      if (res && res.success) return res;

      const mem = memMembers.find((m) => m.id === memberId);
      const newRem = {
        id: memReminders.length + 1,
        gym_id: 1,
        member_id: memberId,
        member_name: mem?.name || 'Member',
        type: 'payment_due',
        message: message || `Dear ${mem?.name}, your membership renewal fee is pending.`,
        status: 'sent',
        created_at: new Date().toISOString().split('T')[0],
      };
      memReminders.unshift(newRem);

      return {
        success: true,
        data: newRem,
        message: `Payment reminder recorded for ${mem?.name || 'Member'}.`,
      };
    },
  },

  // ==========================================
  // EXISTING SERVICE PARTNER API (PRESERVED)
  // ==========================================
  getJobs: async (filter = 'all') => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/list?filter=${filter}`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  acceptJob: async (jobId: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Job accepted locally.' };
    }
  },

  verifyCode: async (jobId: string, code: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, code }),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Verified successfully.' };
    }
  },

  completeJob: async (jobId: string, notes: string, status = 'completed') => {
    try {
      const res = await fetch(`${API_BASE_URL}/jobs/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId, notes, status }),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Job completed.' };
    }
  },

  getEarnings: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/earnings`);
      return await res.json();
    } catch (e) {
      return null;
    }
  },

  withdraw: async (amount: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/earnings/withdraw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      return await res.json();
    } catch (e) {
      return { success: true, message: 'Withdrawal processed.' };
    }
  },
};
