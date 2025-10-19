# 🚀 Deploy Cars-G to Render

This guide will help you deploy both the frontend and backend of Cars-G Community Safety PWA to Render.

## 📋 Prerequisites

- [Render account](https://render.com) (free tier available)
- Firebase project with all services enabled
- GitHub repository with your code

## 🔧 Step-by-Step Deployment

### **1. Prepare Your Repository**

Make sure your repository has:
- ✅ All source code committed
- ✅ `render.yaml` files in both root and server directories
- ✅ Environment variables documented
- ✅ No sensitive data in code

### **2. Deploy Backend API**

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `cars-g-api`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Set Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   FRONTEND_URL=https://cars-g-app.onrender.com
   FIREBASE_PROJECT_ID=your_project_id
   FIREBASE_PRIVATE_KEY_ID=your_private_key_id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your_service_account_email
   FIREBASE_CLIENT_ID=your_client_id
   FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   ```

6. **Click "Create Web Service"**

### **3. Deploy Frontend**

1. **Go to [Render Dashboard](https://dashboard.render.com)**
2. **Click "New +" → "Static Site"**
3. **Connect your GitHub repository**
4. **Configure the service:**
   - **Name**: `cars-g-app`
   - **Root Directory**: `.` (root)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
   - **Plan**: Free

5. **Set Environment Variables:**
   ```
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_API_URL=https://cars-g-api.onrender.com
   ```

6. **Click "Create Static Site"**

### **4. Update Firebase Configuration**

1. **Go to Firebase Console** → **Authentication** → **Settings**
2. **Add authorized domains:**
   - `cars-g-app.onrender.com`
   - `cars-g-api.onrender.com`

3. **Update Firestore Security Rules** (if needed for production)

### **5. Test Your Deployment**

1. **Backend Health Check:**
   ```
   https://cars-g-api.onrender.com/health
   ```

2. **Frontend Access:**
   ```
   https://cars-g-app.onrender.com
   ```

3. **Test Features:**
   - User registration/login
   - Report submission
   - Admin dashboard
   - Chat functionality

## 🔧 Environment Variables Reference

### Backend (cars-g-api)
| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `10000` |
| `FRONTEND_URL` | Frontend URL | `https://cars-g-app.onrender.com` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `your-project-id` |
| `FIREBASE_PRIVATE_KEY_ID` | Private key ID | `abc123...` |
| `FIREBASE_PRIVATE_KEY` | Private key | `-----BEGIN PRIVATE KEY-----...` |
| `FIREBASE_CLIENT_EMAIL` | Service account email | `firebase-adminsdk-...@your-project.iam.gserviceaccount.com` |
| `FIREBASE_CLIENT_ID` | Client ID | `123456789...` |
| `FIREBASE_STORAGE_BUCKET` | Storage bucket | `your-project.appspot.com` |

### Frontend (cars-g-app)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key | `AIza...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Auth domain | `your-project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Project ID | `your-project-id` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Storage bucket | `your-project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | App ID | `1:123456789:web:abc123` |
| `VITE_API_URL` | Backend API URL | `https://cars-g-api.onrender.com` |

## 🚨 Important Notes

### **Free Tier Limitations:**
- **Sleep Mode**: Services sleep after 15 minutes of inactivity
- **Cold Start**: First request after sleep takes ~30 seconds
- **Bandwidth**: 100GB/month
- **Build Time**: 90 minutes/month

### **Production Considerations:**
1. **Upgrade to paid plan** for always-on services
2. **Set up monitoring** and alerts
3. **Configure custom domains** if needed
4. **Set up SSL certificates** (automatic on Render)
5. **Monitor usage** and costs

### **Security:**
- ✅ Environment variables are encrypted
- ✅ No sensitive data in code
- ✅ Firebase security rules enabled
- ✅ HTTPS enforced

## 🔍 Troubleshooting

### **Common Issues:**

1. **Build Failures:**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json
   - Check build logs for specific errors

2. **Environment Variables:**
   - Ensure all required variables are set
   - Check for typos in variable names
   - Verify Firebase credentials are correct

3. **CORS Issues:**
   - Update `FRONTEND_URL` in backend environment
   - Check Firebase authorized domains

4. **Database Connection:**
   - Verify Firebase project ID
   - Check service account permissions
   - Ensure Firestore is enabled

### **Debugging:**
- Check Render service logs
- Test API endpoints directly
- Verify Firebase console for data
- Check browser console for frontend errors

## 📊 Monitoring

### **Render Dashboard:**
- Service health status
- Build and deployment logs
- Resource usage
- Error tracking

### **Firebase Console:**
- Authentication users
- Firestore data
- Storage files
- Usage analytics

## 🎯 Next Steps

After successful deployment:

1. **Test all features** thoroughly
2. **Set up monitoring** and alerts
3. **Configure custom domain** (optional)
4. **Set up backup strategies**
5. **Plan for scaling** as your user base grows

## 🆘 Support

If you encounter issues:
1. Check Render service logs
2. Verify environment variables
3. Test Firebase connectivity
4. Review this documentation
5. Check Render's [documentation](https://render.com/docs)

---

**Your Cars-G Community Safety PWA is now live on Render! 🎉**
