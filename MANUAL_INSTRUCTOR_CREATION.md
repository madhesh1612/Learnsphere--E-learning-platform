# Manual Instructor Creation (Workaround)

Since the Edge Function is having authorization issues, here's a simple workaround to create instructor accounts manually.

## Steps to Create an Instructor

### 1. Go to Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Select your project (hmvzvxncspgbyknffbkx)
3. Click **"SQL Editor"** in the left sidebar

### 2. Run This SQL Query

Replace the values in the query below with the instructor's information:

```sql
-- Step 1: Create the auth user
-- Replace these values:
--   'instructor@example.com' with the instructor's email
--   'SecurePassword123' with a secure password
--   'John Doe' with the instructor's full name

DO $$
DECLARE
  new_user_id uuid;
BEGIN
  -- Create auth user (you'll need to do this through Supabase Auth UI or use service role)
  -- For now, have the instructor sign up normally, then run this:
  
  -- Get the user ID of the newly signed up user
  SELECT id INTO new_user_id
  FROM auth.users
  WHERE email = 'instructor@example.com';  -- Replace with actual email
  
  -- Add instructor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, 'instructor')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RAISE NOTICE 'Instructor role added for user: %', new_user_id;
END $$;
```

### 3. Alternative: Two-Step Process

**Step A: Have the instructor sign up normally**
1. Send the instructor the signup link: `http://localhost:8080/signup`
2. They sign up with their email and password
3. They will be created as a "learner" by default

**Step B: Upgrade them to instructor**
1. Go to Supabase Dashboard → SQL Editor
2. Run this query (replace the email):

```sql
-- Upgrade a learner to instructor
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'instructor'
FROM auth.users
WHERE email = 'instructor@example.com'  -- Replace with actual email
ON CONFLICT (user_id, role) DO NOTHING;
```

3. The user now has both 'learner' and 'instructor' roles
4. When they log in, they'll be redirected to the instructor dashboard

### 4. Verify

Check that the role was added:

```sql
SELECT u.email, ur.role
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id
WHERE u.email = 'instructor@example.com';  -- Replace with actual email
```

You should see a row with role = 'instructor'.

## Quick Reference

**To create multiple instructors:**

```sql
-- Add instructor role to multiple users at once
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'instructor'
FROM auth.users
WHERE email IN (
  'instructor1@example.com',
  'instructor2@example.com',
  'instructor3@example.com'
)
ON CONFLICT (user_id, role) DO NOTHING;
```

This workaround lets you create instructors without needing the Edge Function!
