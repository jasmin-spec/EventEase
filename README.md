# 🎟️ Eventase – Event Management System (MERN Stack)

Eventase is a full-stack **Event Management and Booking Platform** where users can discover and book events, and organizers can create and manage their own events. It includes QR-based ticket verification, secure online payments, an admin approval system, and a modern responsive UI.

---

## 🚀 Features

### 👤 User
- Register and log in securely
- Browse available events
- Book event tickets
- Secure online payment (Razorpay)
- QR code ticket generation and PDF ticket download
- View booking history

### 🎪 Organizer
- Create, edit, and manage events
- View bookings for their events
- Scan and verify tickets using the QR scanner
- Dashboard with event statistics

### 🛡️ Admin
- Approve or reject events
- Monitor organizers and users
- Handle support/contact tickets

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Language | JavaScript |
| Frontend | React (Vite), React Router, Tailwind CSS, Axios, Lucide React Icons, `@yudiel/react-qr-scanner` |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcryptjs |
| Integrations | Razorpay (payments), Cloudinary (image uploads), Nodemailer (email), QR code generation, PDF ticket export |
| Deployment | Vercel (frontend), Render (backend) |

---

## 📂 Project Structure

```
Eventease/
├── client/                # React + Vite frontend
│   └── src/
│       ├── pages/         # Home, Login, Signup, Admin,Organizer,User-Dashboards, Bookings, etc.
│       └── config/
│
├── server/                # Express + MongoDB backend
│   ├── config/            # DB and Cloudinary config
│   ├── controllers/       # Route logic
│   ├── middlewares/       # Auth, role checks, file upload
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── services/          # Email service
│   └── server.js
│
└── README.md
```

---

## 🔐 Authentication Flow

1. User registers with name, email, and password
2. Password is hashed using bcrypt
3. User logs in and receives a JWT token
4. Token is stored in `localStorage`
5. Protected routes verify the token
6. Access is controlled by role: **User / Organizer / Admin**

## 🎫 Event Booking Flow

1. Organizer creates an event
2. Admin approves the event
3. Users browse and book tickets
4. Payment is processed via Razorpay
5. A QR code ticket is generated
6. Organizer scans the QR code at event entry
7. Ticket is verified in real time

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18 or later recommended)
- A MongoDB database (local or Atlas)
- Cloudinary, Razorpay, and email (SMTP/Gmail) credentials

### 1. Backend setup

```bash
cd server
npm install
```

Run the server:

```bash
npm run dev     # nodemon, auto-restarts on changes
# or
npm start
```

### 2. Frontend setup

```bash
cd client
npm install
npm run dev
```

The app will be available at **http://localhost:5173**.

---

## 📦 API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/signup` | Register user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users/profile` | Get current user profile |

### Events
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/events` | Get approved events |
| POST | `/api/events` | Create event (Organizer) |
| GET | `/api/events/my-events` | Get organizer's events |
| PUT | `/api/events/:id` | Update event |
| DELETE | `/api/events/:id` | Delete event |

### Bookings
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my-bookings` | Get user's bookings |
| GET | `/api/bookings/verify/:id` | Verify ticket (QR scanner) |

### Payments
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-order` | Create Razorpay order |
| POST | `/api/payments/verify` | Verify Razorpay payment |

### Support & Admin
| Endpoint | Description |
|---|---|
| `/api/support` | Contact/support messages |
| `/api/admin` | Admin-only operations (event approval, user monitoring) |

---

## 🌐 Deployment

- **Frontend** Deployed on **Vercel**
- **Backend** Deployed on **Render**

---

## 📝 Notes

- Never commit real credentials. Keep `.env` files in `.gitignore`.
- Use Razorpay **test keys** during development.

---

## 👩‍💻 Author

Developed by **Jasmin C T **
