# 🚀 EduSync Quick Start Guide

## Step 1: Install Dependencies

```powershell
# Navigate to project directory
cd K:\10th\swlab\Edusync

# Install all dependencies
npm install
```

## Step 2: Start the Backend Server

Open a new PowerShell terminal:

```powershell
cd K:\10th\swlab\Edusync
npm run server
```

You should see:
```
✅ Connected to PostgreSQL database
✅ Database tables created successfully
🚀 Server running on port 5000
📍 Environment: development
```

## Step 3: Start the Frontend

Open another PowerShell terminal:

```powershell
cd K:\10th\swlab\Edusync
npm run dev
```

You should see:
```
VITE v5.0.8  ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

## Step 4: Access the Application

Open your browser and go to: **http://localhost:3000**

## 🎯 Testing the Authentication Flow

### 1. **Sign Up**
- Click on "Sign Up" tab
- **Step 1**: Enter your university email (must end with @uiu.ac.bd)
  - Example: `test.user@uiu.ac.bd`
  - Create a strong password
- **Step 2**: Fill in personal information
  - First Name: `John`
  - Last Name: `Doe`
  - Student ID: `0112230609` (10 digits)
  - Phone (optional): `01712345678`
  - Upload profile photo (optional)
- **Step 3**: Academic information
  - Department: Select from dropdown
  - Batch: `2021`
  - Year: `2nd Year`
  - Program: `BSc`
- Click "Complete Registration"

### 2. **Email Verification**
- Check your email (dishchord3@gmail.com will receive it)
- Enter the 6-digit OTP code
- Click "Verify Email"
- You'll see confetti animation and be redirected to dashboard!

### 3. **Login**
- Go to login page
- Enter your email and password
- Check "Remember Me" if you want
- Click "Sign In"

### 4. **Role Switching** (if you have multiple roles)
- Click on your profile picture (top-right)
- Click "Switch Account"
- Select the role you want to use

### 5. **Forgot Password**
- Click "Forgot password?" on login page
- Enter your email
- Check email for reset link
- Click link and create new password

### 6. **Active Sessions**
- View all logged-in devices
- Revoke sessions remotely
- Logout from all devices

## 🔧 Troubleshooting

### Backend won't start?
```powershell
# Check if .env file exists in backend folder
ls backend\.env

# Make sure all environment variables are set
cat backend\.env
```

### Frontend won't start?
```powershell
# Clear node_modules and reinstall
rm -r node_modules
npm install
```

### Database connection error?
The database is already hosted on Aiven Cloud. Make sure the DATABASE_URL in `backend/.env` is correct.

### Email not received?
- Check spam folder
- Make sure EMAIL_APP_PASSWORD is correct in backend/.env
- Email goes to: dishchord3@gmail.com

## 📧 Test Email Credentials

- **Email**: dishchord3@gmail.com
- **App Password**: brvkreyqzmpnbxzd

## 🎨 Features to Test

✅ Multi-step signup wizard
✅ Email verification with OTP
✅ Password strength indicator
✅ Login with remember me
✅ Role selector (if user has multiple roles)
✅ Forgot password flow
✅ Reset password
✅ Profile dropdown
✅ Switch account/role
✅ Active sessions management
✅ Logout from all devices
✅ Dark mode support
✅ Responsive design (try on mobile)
✅ Smooth animations
✅ Toast notifications

## 🚨 Important Notes

1. **University Email**: Only emails ending with `@uiu.ac.bd` are allowed
2. **Student ID**: Must be exactly 10 digits
3. **Password**: At least 8 characters, with uppercase, lowercase, number, and special character
4. **OTP**: Valid for 10 minutes
5. **Reset Link**: Valid for 1 hour
6. **Access Token**: Expires in 15 minutes
7. **Refresh Token**: Expires in 7 days

## 🎯 Default Test User (Create via Signup)

```
Email: test.student@uiu.ac.bd
Password: Test@1234
Student ID: 0112230609
Department: Computer Science & Engineering
Batch: 2021
Year: 2
Program: BSc
```

## 🌐 API Testing (Postman/Thunder Client)

### Health Check
```
GET http://localhost:5000/api/health
```

### Register
```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test.user@uiu.ac.bd",
  "password": "Test@1234",
  "passwordConfirm": "Test@1234",
  "firstName": "John",
  "lastName": "Doe",
  "studentId": "0112230609",
  "department": "Computer Science & Engineering",
  "batch": "2021",
  "year": 2,
  "program": "BSc"
}
```

### Login
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test.user@uiu.ac.bd",
  "password": "Test@1234"
}
```

Enjoy testing EduSync! 🎓✨
