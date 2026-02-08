# Role-Based LMS Setup Guide

## Overview

This LMS system implements strict role-based access control with three distinct roles:
- **Admin**: Full platform management (ONE admin account only)
- **Instructor**: Course creation and management (created by admin only)
- **Learner**: Course enrollment and learning (public signup)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

Your `.env` file should already have:
```
VITE_SUPABASE_PROJECT_ID="hmvzvxncspgbyknffbkx"
VITE_SUPABASE_PUBLISHABLE_KEY="sb_publishable_gnnpeY3FpmL_L2mjwy7cdg_63wbOjEB"
VITE_SUPABASE_URL="https://hmvzvxncspgbyknffbkx.supabase.co"
```

### 3. Run Database Migrations

The following migrations need to be applied to your Supabase database:

1. **Main Schema** (already exists): `supabase/migrations/20260207165052_ea97b562-3ac4-4c0f-88c4-b78db9310c0b.sql`
2. **User Blocking** (new): `supabase/migrations/20260208000000_user_blocking.sql`

To apply migrations:
- Go to your Supabase Dashboard → SQL Editor
- Copy and paste the SQL from each migration file
- Run the queries

### 4. Create Admin Account

**IMPORTANT**: The admin account must be created manually in Supabase.

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Enter email and password for the admin
4. After creating the user, go to SQL Editor and run:

```sql
-- Replace 'ADMIN_USER_ID' with the actual user ID from the auth.users table
INSERT INTO public.user_roles (user_id, role)
VALUES ('ADMIN_USER_ID', 'admin');
```

### 5. Start Development Server

```bash
npm run dev
```

## User Flows

### Admin Flow

1. Login at `/login` with admin credentials
2. Automatically redirected to `/admin`
3. Can:
   - View platform statistics
   - Create instructor accounts (Users page)
   - Manage all courses
   - View all users and their roles

### Instructor Flow

1. **Cannot signup publicly** - must be created by admin
2. Admin creates instructor account from Admin Dashboard → Users → Create Instructor
3. Instructor logs in at `/login`
4. Automatically redirected to `/instructor`
5. Can:
   - Create and manage courses
   - Add lessons and quizzes
   - View enrolled learners

### Learner Flow

1. Signup at `/signup` (only learner role available)
2. Login at `/login`
3. Automatically redirected to `/learner`
4. Can:
   - Browse available courses
   - Enroll in courses
   - Complete lessons and quizzes
   - Earn points and badges

## Security Features

### Route Protection

All dashboard routes are protected by role:
- `/admin/*` - Admin only
- `/instructor/*` - Instructor only
- `/learner/*` - Learner only

Unauthorized access attempts redirect to the user's appropriate dashboard.

### Signup Restrictions

- **Learner**: Public signup allowed
- **Instructor**: Cannot signup - must be created by admin
- **Admin**: Cannot signup - must be created manually in database

### Authentication Flow

1. User logs in
2. System fetches user roles from database
3. User redirected to appropriate dashboard based on primary role
4. Role priority: Admin > Instructor > Learner

## Database Schema

### Key Tables

- `profiles`: User profile information
- `user_roles`: User role assignments (supports multiple roles)
- `courses`: Course information
- `lessons`: Course lessons
- `quizzes`: Course quizzes
- `enrollments`: Learner course enrollments
- `user_points`: Learner points tracking
- `badges`: Achievement badges

### Row Level Security (RLS)

All tables have RLS enabled with policies that enforce role-based access:
- Admins can access everything
- Instructors can manage their own courses
- Learners can access enrolled courses

## API Usage

### Creating Instructor (Admin Only)

The admin dashboard uses `supabase.auth.admin.createUser()` to create instructor accounts. This requires admin privileges in Supabase.

### Role Assignment

Roles are stored in the `user_roles` table and fetched on authentication. The `AuthContext` provides role information throughout the app.

## Troubleshooting

### "User blocking feature requires database migration"

Run the `20260208000000_user_blocking.sql` migration in Supabase SQL Editor.

### Instructor can't be created

Ensure you're logged in as admin and have proper Supabase admin permissions.

### Redirected to wrong dashboard

Clear browser cache and local storage, then log in again.

### Can't access admin dashboard

Verify the admin role was properly added to `user_roles` table for your user.

## Next Steps

To complete the LMS, implement:
- Instructor course creation interface
- Learner course browsing and enrollment
- Lesson player with progress tracking
- Quiz attempt system
- Points and badges awarding logic
- User blocking functionality (after migration)
