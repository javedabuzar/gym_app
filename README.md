# 🏋️ GymPro: Professional Gym Management System

[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.1-yellow.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC.svg)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-DB-3ECF8E.svg)](https://supabase.com/)

**GymPro** is a comprehensive, all-in-one management solution for modern fitness centers. Designed for efficiency and ease of use, it streamlines everything from member registration to financial reporting, allowing gym owners to focus on what matters most: their members' fitness.

---

## ✨ Key Features

### 👥 Member Management
- **Digital Profiles:** Comprehensive member records with photos and status tracking.
- **QR Code Identification:** Automatically generated QR codes for seamless check-ins.
- **Subscription Tracking:** Monitor "Active" and "Inactive" statuses at a glance.

### 🧾 Financial Operations
- **Smart Billing:** Generate professional PDF invoices with a single click.
- **Payment Tracking:** Manage full and partial payments, track revenue, and monitor expenses.
- **Reporting:** Visual dashboard for income trends and sales data.

### 📊 Attendance & Scheduling
- **QR Scanner:** Integrated attendance tracking via browser-based QR scanning.
- **Class Schedules:** Detailed timetables with instructor assignment and capacity management.
- **Real-time Logs:** Monitor gym attendance history and trends.

### 💊 Advanced Modules
- **Supplements Store:** Inventory management for gym supplements with stock alerts.
- **Training Plans:** Specialized modules for Personal Training (PT) and Cardio packages.
- **Dashboard Analytics:** High-level interactive charts for business health overview.

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) (State Management via Context API)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (Responsive Utility-First CSS)
- **Build Tool:** [Vite](https://vitejs.dev/) (Fast Hot Module Replacement)
- **Backend-as-a-Service:** [Supabase](https://supabase.com/)
  - **Database:** PostgreSQL with Row Level Security (RLS)
  - **Auth:** Secure user authentication
- **Libraries:**
  - `recharts`: Data visualization and interactive graphs
  - `jspdf` & `html2canvas`: Dynamic PDF generation for invoices
  - `react-router-dom`: SPA routing navigation
  - `lucide-react`: Modern icon set

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/gym-application.git
cd gym-application
npm install
```

### 2. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Database Setup
1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor**.
3. Run the script found in `COMPLETE-GYM-DATABASE.sql` to initialize all tables, RLS policies, and sample data.

### 4. Launch Application
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📂 Project Structure

- `src/pages/`: All main application views (Dashboard, Members, Reports, etc.)
- `src/components/`: Reusable UI components like Sidebars, Layouts, and UI cards.
- `src/context/`: Global state management for gym data.
- `src/assets/`: Static assets like logos and images.
- `src/supabaseClient.js`: Connection configuration for Supabase.

---

## 📸 Preview

*(Add screenshots here to showcase your beautiful UI!)*

---

## 🤝 Contribution
Contributions are welcome! If you have suggestions or find bugs, feel free to open an issue or submit a pull request.

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <b>GymPro - Simplify Your Gym Management</b>
</div>