# Deploy Edge Function via Supabase Dashboard

Since the Supabase CLI installation isn't working on Windows, you can deploy the Edge Function directly through the Supabase Dashboard. This is actually easier!

## Steps to Deploy

### 1. Go to Supabase Dashboard

1. Open your browser and go to: https://supabase.com/dashboard
2. Login to your account
3. Select your project: `hmvzvxncspgbyknffbkx`

### 2. Navigate to Edge Functions

1. In the left sidebar, click on **"Edge Functions"**
2. Click the **"Create a new function"** button

### 3. Create the Function

1. **Function Name**: Enter `create-instructor`
2. **Code Editor**: Copy and paste the entire code from:
   `supabase/functions/create-instructor/index.ts`

3. Click **"Deploy function"**

### 4. Verify Deployment

After deployment, you should see:
- Function name: `create-instructor`
- Status: Active/Deployed
- URL: `https://hmvzvxncspgbyknffbkx.supabase.co/functions/v1/create-instructor`

### 5. Test the Function

1. Go back to your application at `http://localhost:8080`
2. Login as admin
3. Navigate to Admin → Users
4. Click "Create Instructor"
5. Fill in the form and submit

The function should now work without the "bearer token" error!

## What the Function Does

The Edge Function:
1. Runs on Supabase servers (not your browser)
2. Has access to the service role key (admin privileges)
3. Verifies you're an admin before creating users
4. Creates the instructor account
5. Assigns the instructor role

## Troubleshooting

**If you still get errors:**

1. **Check function is deployed**: Go to Edge Functions in dashboard and verify it's there
2. **Check function logs**: In the Edge Functions page, click on your function to see logs
3. **Verify admin role**: Make sure your account has the 'admin' role in the `user_roles` table

**Common issues:**
- Function not deployed → Deploy it via dashboard
- Not logged in as admin → Create admin role in database
- Network error → Check your internet connection
