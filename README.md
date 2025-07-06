# Moroccoin Admin Portal

A comprehensive admin dashboard for the Moroccoin remittance platform built with Django (backend) and Next.js (frontend).

## 🏗️ Project Structure

```
moroccoin-admin/
├── backend/                 # Django backend
│   ├── moroccoin_admin/    # Django project
│   ├── api/                # Main API app
│   ├── requirements.txt    # Python dependencies
│   ├── manage.py          # Django management script
│   ├── seed_data.py       # Database seeding script
│   └── .env               # Backend environment variables
├── frontend/               # Next.js frontend
│   ├── src/               # Source code
│   │   ├── app/           # Next.js app directory
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   └── lib/           # Utilities and API client
│   ├── package.json       # Frontend dependencies
│   └── .env.local         # Frontend environment variables
├── package.json           # Root package.json for concurrently
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.8+** (for Django backend)
- **Node.js 18+** (for Next.js frontend)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Git** (for version control)

### 1. Clone and Setup

```bash
# Clone the repository
git clone <your-repo-url>
cd moroccoin-admin

# Install root dependencies (concurrently)
npm install
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your MongoDB connection string and other settings
```

#### Backend Environment Variables (.env)

Create a `.env` file in the `backend` directory:

```bash
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/moroccoin_admin?retryWrites=true&w=majority
DATABASE_NAME=moroccoin_admin

# Django Settings
SECRET_KEY=your-super-secret-key-here-change-in-production
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key-here

# Email Settings
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# SMS Settings (mock for demo)
SMS_API_KEY=mock-sms-api-key
SMS_API_URL=https://api.sms-provider.com/send
```

#### Database Setup

```bash
# Run migrations (creates necessary Django tables)
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Seed database with demo data
python seed_data.py
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.local.example .env.local
```

#### Frontend Environment Variables (.env.local)

Create a `.env.local` file in the `frontend` directory:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_APP_NAME=Moroccoin Admin
NEXT_PUBLIC_ENVIRONMENT=development
```

### 4. Run the Application

From the root directory:

```bash
# Run both backend and frontend concurrently
npm run dev
```

This will start:
- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:3000

### 5. Access the Application

1. Open your browser and go to http://localhost:3000
2. Use the demo credentials to login:

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Support User:**
- Username: `sarah_support`
- Password: `support123`

## 🗄️ Database Setup

### MongoDB Atlas (Recommended for Production)

1. Create a free MongoDB Atlas account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Create a database user
4. Whitelist your IP address
5. Get your connection string and update the `MONGODB_URI` in your `.env` file

### Local MongoDB (Development)

1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/
2. Start MongoDB service
3. Update `MONGODB_URI` in `.env` to: `mongodb://localhost:27017/moroccoin_admin`

## 📊 Features

### ✅ Implemented Features

1. **Authentication & Authorization**
   - JWT-based session management
   - Role-based access (Admin, Support)
   - Protected routes

2. **User Management**
   - View all users with pagination
   - Search and filter users
   - User detail view with transaction history
   - User activity tracking

3. **Transaction Management**
   - View all transactions with filtering
   - Transaction details
   - Transaction status tracking

4. **Refund System**
   - View refund requests
   - Process refunds (approve/reject)
   - Refund history

5. **Customer Support Tools**
   - Send notifications (Email/SMS/Push)
   - Chat message interface (mock)
   - User activity logs

6. **Analytics Dashboard**
   - Key performance indicators
   - Transaction charts and graphs
   - User statistics
   - Financial metrics

7. **Modern UI**
   - Responsive design
   - Dark/Light theme support
   - Loading states and error handling
   - Professional admin interface

### 🔮 Demo Data

The application comes with pre-seeded demo data including:
- 3 admin users (1 admin, 2 support)
- 5 sample users
- 50 sample transactions
- Sample refunds and activities
- Chat messages and notifications

## 🛠️ Development

### Backend Development

```bash
cd backend

# Activate virtual environment
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate     # Windows

# Run development server
python manage.py runserver 8000

# Run migrations after model changes
python manage.py makemigrations
python manage.py migrate

# Access Django admin (optional)
# Go to http://localhost:8000/admin
```

### Frontend Development

```bash
cd frontend

# Run development server
npm run dev

# Build for production
npm run build

# Run production build
npm start
```

### Running Both Servers

```bash
# From root directory
npm run dev
```

## 🧪 Testing Features

### 1. User Management
- Go to `/users` to see all users
- Click on a user to view details
- Test search and filtering functionality
- Send notifications to users

### 2. Transaction Management
- Go to `/transactions` to see all transactions
- Filter by status, type, or date range
- Click on transaction ID to view details

### 3. Refund Processing
- Go to `/refunds` to see refund requests
- Test approving/rejecting refunds
- Check refund status updates

### 4. Dashboard Analytics
- View KPIs and charts on `/dashboard`
- Check real-time statistics
- Verify chart data accuracy

### 5. Customer Support
- Test chat functionality (mock interface)
- Send test notifications
- View user activity logs

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Prepare for deployment:**

```bash
cd backend

# Install additional dependencies
pip install gunicorn whitenoise

# Update requirements.txt
pip freeze > requirements.txt
```

2. **Create Procfile:**

```bash
echo "web: gunicorn moroccoin_admin.wsgi --log-file -" > Procfile
```

3. **Update settings for production:**

```python
# In settings.py
import os
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Add whitenoise to middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add this
    # ... other middleware
]
```

4. **Deploy to Heroku:**

```bash
# Login to Heroku
heroku login

# Create Heroku app
heroku create moroccoin-admin-backend

# Set environment variables
heroku config:set SECRET_KEY=your-production-secret-key
heroku config:set DEBUG=False
heroku config:set MONGODB_URI=your-production-mongodb-uri

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Run migrations
heroku run python manage.py migrate
```

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**

```bash
npm install -g vercel
```

2. **Deploy:**

```bash
cd frontend

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables in Vercel dashboard
# NEXT_PUBLIC_API_URL=https://your-backend-url.herokuapp.com/api
```

### Environment Variables for Production

**Backend (.env):**
```bash
SECRET_KEY=your-production-secret-key-change-this
DEBUG=False
ALLOWED_HOSTS=your-domain.herokuapp.com,localhost
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET_KEY=your-production-jwt-secret
```

**Frontend (.env.local):**
```bash
NEXT_PUBLIC_API_URL=https://your-backend-domain.herokuapp.com/api
NEXT_PUBLIC_APP_NAME=Moroccoin Admin
NEXT_PUBLIC_ENVIRONMENT=production
```

## 🔧 Customization

### Adding New Features

1. **Backend (Django):**
   - Add new models in `api/models.py`
   - Create serializers in `api/serializers.py`
   - Add views in `api/views.py`
   - Update URLs in `api/urls.py`

2. **Frontend (Next.js):**
   - Add new pages in `src/app/`
   - Create components in `src/components/`
   - Update API client in `src/lib/api.ts`
   - Add new routes to navigation

### Styling Customization

- Edit `tailwind.config.js` for theme customization
- Modify `src/app/globals.css` for global styles
- Update color schemes in Tailwind configuration

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Check your `MONGODB_URI` in `.env`
   - Ensure MongoDB Atlas IP whitelist includes your IP
   - Verify database user credentials

2. **CORS Errors:**
   - Check `CORS_ALLOWED_ORIGINS` in Django settings
   - Ensure frontend URL is included in allowed origins

3. **Authentication Issues:**
   - Verify JWT secret keys match between frontend/backend
   - Check token expiration settings
   - Clear browser localStorage and retry login

4. **Module Not Found Errors:**
   - Ensure all dependencies are installed
   - Check virtual environment activation
   - Verify import paths are correct

### Resetting Database

```bash
cd backend

# Clear all data and reseed
python manage.py flush
python seed_data.py
```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/login/` - Admin login
- `POST /api/auth/logout/` - Admin logout
- `GET /api/auth/profile/` - Get current user profile

### User Management

- `GET /api/users/` - List all users (with filtering)
- `GET /api/users/{user_id}/` - Get user details
- `GET /api/users/{user_id}/transactions/` - Get user transactions

### Transaction Management

- `GET /api/transactions/` - List all transactions
- `GET /api/transactions/{transaction_id}/` - Get transaction details

### Refund Management

- `GET /api/refunds/` - List all refunds
- `POST /api/refunds/` - Create new refund
- `POST /api/refunds/{refund_id}/process/` - Process refund

### Support Tools

- `GET /api/chat/` - Get chat messages
- `POST /api/chat/` - Send chat message
- `POST /api/notifications/send/` - Send notification

### Analytics

- `GET /api/dashboard/stats/` - Get dashboard statistics
- `GET /api/dashboard/charts/` - Get chart data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🆘 Support

For support and questions:
- Email: anasbhr1@hotmail.com
- Issues: [GitHub Issues]

---

**Made with ❤️ by the Moroccoin Team**