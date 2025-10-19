# Cars-G API Server

Backend API server for the Cars-G Community Safety PWA.

## Features

- **Authentication**: Firebase Admin SDK integration
- **Reports Management**: CRUD operations for safety reports
- **User Management**: Role-based access control
- **Chat System**: Real-time messaging
- **Leaderboard**: Points and ranking system
- **Security**: Rate limiting, CORS, Helmet protection

## API Endpoints

### Authentication
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/points` - Get user points
- `POST /api/auth/points` - Add points to user

### Reports
- `GET /api/reports` - Get all reports (admin)
- `GET /api/reports/my-reports` - Get user's reports
- `GET /api/reports/assigned` - Get assigned reports (patrol)
- `GET /api/reports/:id` - Get single report
- `POST /api/reports` - Create new report
- `PUT /api/reports/:id/status` - Update report status
- `PUT /api/reports/:id/assign` - Assign report to patrol
- `PUT /api/reports/:id/priority` - Update report priority

### Users
- `GET /api/users` - Get all users (admin)
- `GET /api/users/leaderboard` - Get leaderboard
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id/role` - Update user role (admin)
- `PUT /api/users/:id/ban` - Ban/unban user (admin)
- `PUT /api/users/:id/points` - Update user points (admin)
- `GET /api/users/:id/stats` - Get user statistics

### Chat
- `GET /api/chat` - Get messages
- `POST /api/chat` - Send message
- `GET /api/chat/conversation/:userId` - Get conversation (admin)
- `GET /api/chat/conversations` - Get all conversations (admin)
- `DELETE /api/chat/:messageId` - Delete message (admin)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with your Firebase configuration:
```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
```

3. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `FIREBASE_PROJECT_ID` | Firebase project ID | Yes |
| `FIREBASE_PRIVATE_KEY_ID` | Firebase private key ID | Yes |
| `FIREBASE_PRIVATE_KEY` | Firebase private key | Yes |
| `FIREBASE_CLIENT_EMAIL` | Firebase client email | Yes |
| `FIREBASE_CLIENT_ID` | Firebase client ID | Yes |
| `FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | Yes |

## Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Configured for frontend origin
- **Helmet**: Security headers
- **Authentication**: Firebase ID token verification
- **Role-based Access**: Admin, patrol, and user permissions

## Development

The server uses nodemon for development with automatic restarts on file changes.

```bash
npm run dev
```

## Production

For production deployment, use:

```bash
npm start
```

Make sure to set `NODE_ENV=production` and configure all required environment variables.
