# Cars-G Community Safety PWA 🚗

A complete, real-time, and mobile-first Progressive Web App for community safety reporting and management.

## 🌟 Features

### For Community Members
- **Report Safety Issues**: Submit reports with location, images, and detailed descriptions
- **Real-time Updates**: Track your reports and see status changes instantly
- **Gamification**: Earn points for resolved reports and compete on the leaderboard
- **Community Chat**: Communicate with safety administrators
- **Mobile-First Design**: Optimized for mobile devices with PWA capabilities

### For Patrol Officers
- **Assigned Reports**: View and manage reports assigned to you
- **Status Updates**: Update report status and upload proof of resolution
- **Real-time Notifications**: Get instant updates on new assignments

### For Administrators
- **Master Dashboard**: View all reports with real-time updates
- **Live Map**: See all pending reports on an interactive map
- **User Management**: Manage user roles, ban/unban users, and assign points
- **Community Chat**: Monitor and respond to community conversations
- **Analytics**: Track community engagement and safety trends

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Router DOM** for navigation
- **Leaflet & React-Leaflet** for interactive maps
- **Chart.js & React-Chartjs-2** for data visualization
- **Lucide React** for icons
- **Firebase SDK** for client-side operations

### Backend
- **Node.js** with Express
- **Firebase Admin SDK** for server-side operations
- **Firestore** for real-time database
- **Firebase Storage** for file uploads
- **Firebase Authentication** for user management

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **Nodemon** for server development
- **Concurrent** for running multiple processes

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled
- Firebase service account key

### 1. Clone and Install
```bash
git clone <repository-url>
cd cars-g-app
npm install
cd server
npm install
cd ..
```

### 2. Environment Setup

#### Frontend (.env)
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:3001
```

#### Backend (server/.env)
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

### 3. Start Development
```bash
# Start both frontend and backend
npm run dev:full

# Or start individually
npm run dev          # Frontend only
npm run server       # Backend only
```

### 4. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

## 📱 PWA Features

The app is built as a Progressive Web App with:
- **Offline Support**: Core functionality works offline
- **Installable**: Can be installed on mobile devices
- **Push Notifications**: Real-time updates (coming soon)
- **Responsive Design**: Optimized for all screen sizes

## 🔐 User Roles & Permissions

### User (Default)
- Submit safety reports
- View own reports
- Participate in community chat
- Earn points for resolved reports

### Patrol
- All user permissions
- View assigned reports
- Update report status
- Upload proof of resolution

### Admin
- All patrol permissions
- View all reports
- Manage user roles
- Ban/unban users
- Assign reports to patrol
- Monitor community chat

### Super Admin
- All admin permissions
- Manage other admins
- System configuration

## 🗄️ Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'user' | 'patrol' | 'admin' | 'superAdmin';
  points: number;
  createdAt: Date;
  lastActive: Date;
  isBanned?: boolean;
}
```

### Reports Collection
```typescript
{
  caseNumber: string;
  title: string;
  description: string;
  category: string;
  isAnonymous: boolean;
  location: { lat: number; lng: number };
  imageUrls: string[];
  status: 'verifying' | 'pending' | 'in_progress' | 'resolved' | 'closed';
  priorityLevel: 1 | 2 | 3 | 4 | 5;
  userId: string;
  patrolUserId?: string;
  proofImages?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Messages Collection
```typescript
{
  text: string;
  userId: string;
  userDisplayName: string;
  userRole: string;
  isAdminReply: boolean;
  createdAt: Date;
}
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
npm run build
# Deploy the dist/ folder
```

### Backend (Railway/Heroku/DigitalOcean)
```bash
cd server
npm start
```

### Environment Variables for Production
Set the same environment variables in your deployment platform.

## 🧪 Testing

### API Testing
```bash
cd server
node test-server.js
```

### Frontend Testing
```bash
npm run lint
npm run build
```

## 📊 API Endpoints

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/points` - Get user points

### Reports
- `GET /api/reports` - Get all reports (admin)
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/assigned` - Get assigned reports (patrol)
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id/status` - Update report status

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/leaderboard` - Get leaderboard
- `PUT /api/users/:id/role` - Update user role (admin)
- `PUT /api/users/:id/ban` - Ban/unban user (admin)

### Chat
- `GET /api/chat` - Get messages
- `POST /api/chat` - Send message
- `GET /api/chat/conversations` - Get all conversations (admin)

## 🔧 Development

### Project Structure
```
cars-g-app/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── context/       # React context providers
│   ├── hooks/         # Custom hooks
│   ├── services/      # API client
│   └── firebase/      # Firebase configuration
├── server/            # Backend API server
│   ├── routes/        # API route handlers
│   ├── middleware/    # Express middleware
│   └── config/        # Server configuration
└── public/           # Static assets
```

### Code Quality
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Component-based architecture

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🎯 Roadmap

- [ ] Push notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Multi-language support
- [ ] Advanced reporting features
- [ ] Integration with emergency services

---

**Built with ❤️ for community safety**