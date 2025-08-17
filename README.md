# IWB25-200
## 🔵 UniConnect – Smart University Appointment & Notification System

### 🎯 Problem

* Students struggle with chaotic appointment booking (office hours, advising, lab access).
* Faculty deal with clashes, double bookings, and no-shows.
* Lack of **reminders** and **Google Calendar integration** makes everything worse.

---

### 💡 Solution

A **Ballerina-based backend** that connects students, faculty, and admins in one streamlined system:

* Students: Request and manage appointments.
* Faculty: Approve/decline, sync with Google Calendar, avoid clashes.
* Admins: View analytics (popular slots, no-shows, workload balance).

---

### 🛠 Tech Stack

* **Backend**: Ballerina (REST APIs, JWT Auth, SMTP, Google Calendar integration)
* **Frontend**: React.js
* **Database**: PostgreSQL/MySQL (appointments, users, tokens)
* **APIs**:

  * Google Calendar API (auto-sync lectures/office hours)
  * SMTP (appointment confirmation + reminders)

---

### 🧩 Core Modules

1. **Authentication & Roles**

   * JWT-based login.
   * Roles: `student`, `faculty`, `admin`.

2. **Appointment Booking**

   * Students book appointments.
   * System checks **availability** & **conflicts**.
   * Faculty can set available slots.

3. **Waitlist System**

   * If a slot is full, students can join a waitlist.
   * If a slot frees up, waitlist auto-updates.

4. **Notifications**

   * Email confirmations on booking.
   * Reminders 24h before appointment.

5. **Calendar Sync**

   * Faculty can connect Google Calendar.
   * Appointments are **automatically synced**.

6. **Admin Dashboard**

   * View usage analytics:

     * No-shows
     * Most booked slots
     * Faculty workload distribution

---

### ⚡ How Ballerina Shines Here

* **REST API orchestration** (auth, booking, reminders).
* **Easy API integration** with Google Calendar.
* **Email (SMTP) support out-of-the-box** for reminders.
* **Data handling** with SQL connectors.
* **Observability** (metrics, logs, tracing) built in → easy for hackathon demo.

---
