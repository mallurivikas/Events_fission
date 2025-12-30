# Event Platform - MERN Application

A full-stack event management platform built with the MERN stack

![Tech Stack](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

---

## Features

### Core Functionality
- **User Authentication**: JWT-based secure authentication with bcrypt password hashing
- **Event Management**: Create, read, update, and delete events
- **Image Upload**: Cloudinary integration for event images with automatic optimization
- **RSVP System**: Atomic RSVP operations with capacity enforcement
- **Authorization**: Role-based access control (only event creators can edit/delete their events)

### Advanced Features
- **Concurrency-Safe RSVP**: Uses MongoDB atomic operations to prevent race conditions
- **Real-time Capacity Tracking**: Shows remaining slots in real-time
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Form Validation**: Client and server-side validation
- **Error Handling**: Centralized error handling with descriptive messages

---

## Tech Stack

### Frontend
- **React 18** with Vite for fast development
- **React Router** for client-side routing
- **Tailwind CSS** for styling (matching provided UI design)
- **Axios** for API communication
- **Context API** for state management

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **Cloudinary** for image storage
- **Multer** for file uploads

### Infrastructure
- MongoDB Atlas for database
- base64 Storage for images
- Deployable on Render/Railway (backend)
- Deployable on Vercel/Netlify (frontend)

---

## Prerequisites

Before running this project, ensure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB Atlas** account (or local MongoDB)
- **Cloudinary** account for image uploads

---

## 🔧 Local Setup

### 1. Clone the Repository

```bash
git clone https://github.com/mallurivikas/Events_fission
cd Events
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your `.env` file:**

```env
PORT=5000
MONGODB_URI=mongodb+srv://vikas_db_user:password@cluster0.xwltiuu.mongodb.net/mydb?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d
NODE_ENV=development

# Cloudinary Config (use these for now, or add your own)
CLOUDINARY_CLOUD_NAME=demo
CLOUDINARY_API_KEY=demo
CLOUDINARY_API_SECRET=demo
```

**Start the backend server:**

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Configure your `.env` file:**

```env
VITE_API_URL=http://localhost:5000/api
```

**Start the frontend development server:**

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

### 4. Access the Application

Open your browser and navigate to `http://localhost:3000`

---

## 🗂️ Project Structure

```
Events/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary configuration
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   └── eventController.js    # Event CRUD + RSVP logic
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication middleware
│   │   ├── errorHandler.js       # Centralized error handling
│   │   └── upload.js             # Multer file upload configuration
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Event.js              # Event schema
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   └── eventRoutes.js        # Event endpoints
│   ├── .env.example              # Environment variables template
│   ├── package.json
│   └── server.js                 # Express server entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx        # Navigation component
    │   │   ├── EventCard.jsx     # Event card component
    │   │   └── PrivateRoute.jsx  # Route protection
    │   ├── context/
    │   │   └── AuthContext.jsx   # Authentication context
    │   ├── pages/
    │   │   ├── Home.jsx          # Landing page
    │   │   ├── Login.jsx         # Login page
    │   │   ├── Register.jsx      # Registration page
    │   │   ├── Events.jsx        # Events listing
    │   │   ├── CreateEvent.jsx   # Create event form
    │   │   └── EditEvent.jsx     # Edit event form
    │   ├── utils/
    │   │   └── api.js            # Axios configuration
    │   ├── App.jsx               # Main app component
    │   ├── main.jsx              # React entry point
    │   └── index.css             # Global styles
    ├── .env.example
    ├── index.html
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| GET | `/api/auth/me` | Get current user | Yes |

### Events

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/events` | Get all upcoming events | No |
| GET | `/api/events/:id` | Get single event | No |
| POST | `/api/events` | Create new event | Yes |
| PUT | `/api/events/:id` | Update event | Yes (Creator only) |
| DELETE | `/api/events/:id` | Delete event | Yes (Creator only) |
| POST | `/api/events/:id/rsvp` | RSVP to event | Yes |
| DELETE | `/api/events/:id/rsvp` | Cancel RSVP | Yes |

---

## UI Design

The UI follows the provided screenshot with:

- **Primary Color**: Neon green/lime (#A3FF12)
- **Background**: White and light gray
- **Typography**: Inter font family with bold, condensed headings
- **Layout**: Modern agency-style with large section headings
- **Components**: Rounded cards with hover effects
- **Responsive**: Mobile-first design with grid layouts

---

## 📝 Environment Variables

### Backend

```env
PORT                    # Server port (default: 5000)
MONGODB_URI            # MongoDB connection string
JWT_SECRET             # Secret key for JWT signing
JWT_EXPIRE             # Token expiration time (e.g., 7d)
NODE_ENV               # Environment (development/production)
CLOUDINARY_CLOUD_NAME  # Cloudinary cloud name
CLOUDINARY_API_KEY     # Cloudinary API key
CLOUDINARY_API_SECRET  # Cloudinary API secret
```

### Frontend

```env
VITE_API_URL           # Backend API URL
```

---

## 🐛 Common Issues & Solutions

### Issue: "Failed to connect to MongoDB"
**Solution**: Check your `MONGODB_URI` is correct and your IP is whitelisted in MongoDB Atlas

### Issue: "Token expired"
**Solution**: User will be automatically logged out and redirected to login
---

## 📚 Learning Resources

- [MongoDB Atomic Operations](https://docs.mongodb.com/manual/core/write-operations-atomicity/)
- [React Context API](https://react.dev/reference/react/useContext)
- [JWT Authentication](https://jwt.io/introduction)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Cloudinary Upload](https://cloudinary.com/documentation/upload_images)

---

## To Chcek For Scoring

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/ExampleFeature`)
3. Commit your changes (`git commit -m 'Add some ExampleFeature'`)
4. Push to the branch (`git push origin feature/ExampleFeature`)
5. Open a Pull Request

---

## Author

Built by Vikas Malluri For Fission's Assignment using the MERN stack

---

## Support

For issues or questions, please open an issue in the repository.

---
