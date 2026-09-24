# Clockwise — Employee Attendance Management System
## Knowledge Base & Chatbot Operational Reference Manual

*Document Version:* 1.0.0  
*Target Audience:* End Users, HR Administrators, and AI Chatbot / Virtual Assistant Knowledge Retrieval Systems (RAG / LLM Prompts)  
*Authentication Backend:* SELISE Blocks IAM & Hosted OIDC  
*Localization:* English (`en-US`), German (`de-DE`), Bengali (`bn-BD`)

---

## 1. Executive Summary & Product Overview

**Clockwise** is a focused employee attendance management web application designed for a single core purpose: **seamless, automated tracking of daily employee work shifts.**

Employees log in, clock in when they begin their workday, clock out when they conclude, and Clockwise automatically calculates exact shift durations, working minutes, and attendance status compliance without requiring manual timecards or administrative overhead.

### Key Capabilities:
- **One-Click Shift Clocking:** Simple 3-state clock card (Not Clocked In $\rightarrow$ Working with Live Duration $\rightarrow$ Completed).
- **Automated Compliance Engine:** Classifies days as **Present**, **Late**, **Incomplete**, or **Absent** based on company working hour policies.
- **Weekend Protection:** Automatically treats Saturdays and Sundays as non-working days; weekends are never penalized as absences.
- **Dual Attendance Views:** Interactive monthly visual calendar with color-coded status indicators and chronological tabular records.
- **Enterprise IAM Integration:** Powered by SELISE Blocks hosted OIDC authentication, self-service invitation activation, and password recovery.
- **Native Localization:** Multilingual client interface supporting English, German, and Bengali with localized date and time formats.

---

## 2. Authentication & Account Management (SELISE Blocks IAM)

Clockwise uses enterprise-grade identity and access management provided by SELISE Blocks IAM. No plain credentials or unencrypted tokens are stored in the client application.

### 2.1 Sign-In Flow
1. Navigate to the Clockwise login URL (`/login`).
2. Click **"Sign In with Blocks"** (or use language switcher in the top right).
3. The user is redirected to the secure, hosted SELISE Blocks IAM login portal.
4. Enter your corporate email and password.
5. Upon successful verification, Blocks sets a Secure `httpOnly` session cookie and redirects back to Clockwise (`/login/callback`).
6. Clockwise automatically verifies the session and routes the employee to their **Dashboard**.

### 2.2 New Employee Invitation & Account Activation
When an administrator adds an employee to the system:
1. Blocks automatically sends an activation email to the employee's registered inbox.
2. The email contains a secure activation link pointing to `/oidc/activate/?code=<ACTIVATION_CODE>`.
3. Clicking the link opens the Clockwise **Activate Account** page.
4. The employee enters and confirms their new password (minimum 8 characters).
5. Clicking **"Set Password & Activate"** activates the account on Blocks IAM.
6. The employee can immediately log in to Clockwise.

### 2.3 Password Reset ("Forgot Password")
If an employee forgets their password:
1. On the Clockwise login screen (`/login`), click **"Forgot your password?"**.
2. Enter the registered corporate email address and click **"Send Reset Link"**.
3. A password recovery email is dispatched by Blocks with a reset token.
4. The link directs to `/resetpassword?code=<RESET_CODE>`.
5. Enter and confirm the new password, then click **"Save New Password"**.

---

## 3. Core Attendance Rules & Status Determination Engine

Clockwise enforces precise business logic to evaluate employee shifts automatically.

### 3.1 Working Schedule
- **Standard Working Days:** Monday, Tuesday, Wednesday, Thursday, Friday.
- **Non-Working Days (Weekends):** Saturday and Sunday.
- **Shift Window:** 9:00 AM – 6:00 PM (9 total hours, including 1 hour lunch break, totaling **8 required working hours**).

### 3.2 Shift Status Evaluation Rules

| Status | Condition | Criteria Details |
| :--- | :--- | :--- |
| **Present** | On-time + Full Shift | Clocked in on or before **9:15 AM** (15-minute grace period) **AND** total working duration $\ge$ **8 hours (480 minutes)**. |
| **Late** | Late Clock-in | Clocked in after **9:15 AM**, regardless of total hours worked. |
| **Incomplete** | Short Hours or Missed Out | Clocked in, but failed to clock out, **OR** clocked out with less than 8 hours total duration (and clocked in before 9:15 AM). |
| **Absent** | No Attendance Recorded | A regular business day (Monday–Friday) that has concluded with zero clock-in records. |
| **Weekend** | Rest Days | Saturdays and Sundays. Never counted as working days or absences. |

> **Grace Period Policy:** The official workday begins at 9:00 AM. Clockwise includes a built-in 15-minute grace window. Clocking in at 9:14 AM or 9:15 AM is marked as on-time. Clocking in at 9:16 AM or later is automatically flagged as **Late**.

---

## 4. User Interface & Feature Walkthrough

### 4.1 Dashboard (`/dashboard`)
The central hub for daily attendance operations:
- **Personalized Header:** Dynamic greeting ("Good morning", "Good afternoon", "Good evening") with the employee's name and localized current date.
- **Live Clock:** Real-time digital clock displaying hours, minutes, and seconds.
- **Interactive Clock Card:**
  - *State 1 (Not Clocked In):* Displays current time and a prominent **"CLOCK IN"** button.
  - *State 2 (Working):* Displays clock-in timestamp, animated pulse badge, real-time elapsed working hours counter, and a red **"CLOCK OUT"** button.
  - *State 3 (Completed):* Green checkmark card displaying clock-in time, clock-out time, and total hours worked for the day.
- **Monthly Overview Cards:** Real-time summary counts for Present Days, Absent Days, Late Days, and overall Attendance Rate %.

### 4.2 Attendance History (`/attendance`)
Provides comprehensive transparency into historical attendance:
- **Month Selector:** Navigate forward and backward across calendar months.
- **Interactive Monthly Calendar:**
  - Displays every day of the month aligned to weekdays.
  - Color-coded status dots on worked days (Green = Present, Amber = Late, Red = Absent, Blue = Incomplete).
  - Clicking on any worked date opens a detailed flyout card showing exact clock-in, clock-out, total duration, and status.
- **Detailed Attendance Table:** Chronological tabular view listing Date, Clock In time, Clock Out time, Working Duration, and formatted status badges.

### 4.3 Employee Profile (`/profile`)
Displays authenticated employee identity details:
- Full Name
- Corporate Email Address
- Employee ID
- Department & Position
- Secure **"Sign Out"** button to invalidate the session cookie and terminate the session.

---

## 5. Multilingual Localization (i18n)

Clockwise supports seamless on-the-fly language switching powered by the SELISE Blocks Localization service:

| Language | Culture Code | Native Name | Available In |
| :--- | :--- | :--- | :--- |
| **English** | `en-US` | English (Default) | Login Page, Sidebar, Mobile Header |
| **German** | `de-DE` | Deutsch | Login Page, Sidebar, Mobile Header |
| **Bengali** | `bn-BD` | বাংলা | Login Page, Sidebar, Mobile Header |

- **Language Switcher Locations:**
  - Top-right pill selector on the Login screen (`/login`).
  - Bottom dropdown selector in the navigation Sidebar.
  - Header dropdown on mobile screens.
- **Localized Date & Time:** Month names, day names, calendar headers, and clock displays automatically reformat according to the chosen culture.
- **Live Syncing:** Dictionaries are fetched directly from the Blocks Localization Cloud with zero-cache delay.

---

## 6. Chatbot Knowledge Base & Q&A Retrieval Bank

*Use the following Question-and-Answer pairs to configure your virtual assistant / customer support bot for Clockwise:*

### Q1: What is Clockwise?
**Answer:** Clockwise is a web application designed for employee attendance tracking. It allows employees to clock in when starting work, clock out when finishing, and automatically calculates attendance records, shift durations, and monthly summaries.

### Q2: How do I sign in to Clockwise?
**Answer:** Open the Clockwise application in your browser and click "Sign In with Blocks". You will be redirected to the secure Blocks IAM portal where you enter your work email and password. Once authenticated, you will be automatically returned to your Clockwise dashboard.

### Q3: How do I clock in at the start of my shift?
**Answer:** After logging into Clockwise, navigate to the Dashboard. In the "Today's Attendance" card, click the blue "CLOCK IN" button. The system will record your exact start time and begin tracking your active shift duration.

### Q4: How do I clock out at the end of my day?
**Answer:** Go to your Dashboard where your Clock Card shows that you are currently working. Click the red "CLOCK OUT" button. Clockwise will record your end time, calculate your total working minutes, and update your status for the day.

### Q5: What time do I need to clock in to be marked "Present"?
**Answer:** The standard workday starts at 9:00 AM. Clockwise includes a 15-minute grace period, meaning you must clock in on or before 9:15 AM AND work at least 8 hours (480 minutes) to be marked "Present".

### Q6: What happens if I clock in after 9:15 AM?
**Answer:** Any clock-in recorded at 9:16 AM or later is automatically classified as "Late", regardless of the total hours you work that day.

### Q7: Why is my status showing as "Incomplete"?
**Answer:** A shift is marked "Incomplete" if you clocked in but forgot to clock out, or if your total working time was less than 8 hours (and you clocked in before 9:15 AM).

### Q8: Are Saturdays and Sundays counted as absences?
**Answer:** No. Saturdays and Sundays are designated as non-working weekend days. They are never counted as working days and will never be marked as absences.

### Q9: How is the Attendance Rate percentage calculated?
**Answer:** The Attendance Rate is calculated as the total number of "Present" days divided by the total number of elapsed working days in the month up to today (excluding weekends), multiplied by 100.

### Q10: How do I view my past attendance records?
**Answer:** Click "Attendance" in the navigation sidebar. You can view your monthly attendance in two formats: an interactive Calendar with color-coded dots, or a chronological Table listing your exact clock-in, clock-out, and total hours worked for each day.

### Q11: How do I activate my new Clockwise account?
**Answer:** When your administrator invites you, you will receive an invitation email from Blocks with an activation link. Click the link, enter your desired password (minimum 8 characters), and click "Set Password & Activate". You can then log in immediately.

### Q12: What should I do if I forgot my password?
**Answer:** On the Clockwise login screen, click "Forgot your password?". Enter your corporate email address and click "Send Reset Link". Check your email inbox for a password reset email and follow the instructions to set a new password.

### Q13: Can I use Clockwise in German or Bengali?
**Answer:** Yes. Clockwise is fully multilingual. You can switch languages at any time using the language selector in the top-right corner of the login screen or at the bottom of the navigation sidebar. The available languages are English, German (Deutsch), and Bengali (বাংলা).

### Q14: Can I clock in more than once in a single day?
**Answer:** Under standard attendance policy, you clock in once when your workday begins and clock out once when your workday ends. Once both clock-in and clock-out are completed, the day is marked as completed.

### Q15: How do I log out of Clockwise?
**Answer:** Click the "Sign Out" or "Log Out" button at the bottom of the navigation sidebar, or go to your Profile page (`/profile`) and click the red "Log Out" button.

### Q16: What do the different status colors mean in the calendar?
**Answer:** 
- **Green:** Present (On-time clock-in $\le$ 9:15 AM and $\ge$ 8 hours worked)
- **Amber / Yellow:** Late (Clocked in after 9:15 AM)
- **Red:** Absent (Working business day with no clock-in)
- **Blue:** Incomplete (Missing clock-out or under 8 hours worked)
- **Gray:** Weekend or rest day

### Q17: Can I access Clockwise on my mobile phone?
**Answer:** Yes. Clockwise features a responsive web interface with a mobile menu and header. You can clock in, clock out, and check your records on any smartphone browser.

---

## 7. Technical Reference for System Administrators

- **Front-End Architecture:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, React Router v7.
- **API Gateway:** SELISE Blocks Data Gateway (`https://blocksapi.slsblx.com`).
- **OIDC Client ID:** `64e8b4af-5d58-4bf4-bd63-bdbcdfbde222` (Public browser client with PKCE enabled).
- **Tenant Key:** `D70a2fe710f9249d39ecb14bb69a35695`.
- **Localization Module:** `clockwise` (`1765100a-039d-472c-92c9-51e8d9284693`).
- **Local Dev Host:** `https://dbggjs-elzzi.slsblx.com:5173` (HTTPS with self-signed SSL cert).
