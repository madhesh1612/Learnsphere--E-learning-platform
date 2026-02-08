# Troubleshooting Edge Function Errors

## Current Error: "Edge Function returned a non-2xx status code"

This means the function is deployed but returning an error. Let's diagnose:

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Try creating an instructor again
4. Look for console logs showing the error details

You should see logs like:
- "Calling create-instructor function..."
- "Function response: ..."
- Any error messages

### Step 2: Check Function Logs in Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Edge Functions → `create-instructor`
4. Click on the "Logs" tab
5. Try creating an instructor again
6. Check what error appears in the logs

### Common Issues & Solutions

#### Issue 1: Function Not Deployed
**Symptom**: "Function not found" or 404 error

**Solution**:
1. Go to Supabase Dashboard → Edge Functions
2. Verify `create-instructor` function exists
3. If not, create it using the code from `supabase/functions/create-instructor/index.ts`

#### Issue 2: Not Logged In as Admin
**Symptom**: "Unauthorized: Admin access required"

**Solution**:
1. Verify you're logged in as admin
2. Check the `user_roles` table in Supabase:
   ```sql
   SELECT * FROM user_roles WHERE role = 'admin';
   ```
3. If no admin role exists, create one:
   ```sql
   -- Replace YOUR_USER_ID with your actual user ID from auth.users
   INSERT INTO user_roles (user_id, role)
   VALUES ('YOUR_USER_ID', 'admin');
   ```

#### Issue 3: Service Role Key Missing
**Symptom**: "Invalid API key" or authentication errors

**Solution**:
The service role key should be automatically available in Edge Functions. If not:
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (keep it secret!)
3. The Edge Function uses `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` which should work automatically

#### Issue 4: Email Already Exists
**Symptom**: "User already registered" or duplicate email error

**Solution**:
Try with a different email address that hasn't been used before.

### Step 3: Test with Simplified Function

If the above doesn't work, let's test with a simpler version. Replace the Edge Function code with this minimal test:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    return new Response(
      JSON.stringify({ success: true, message: 'Function is working!' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
```

If this works, the issue is in the main function logic. If it doesn't work, there's a deployment issue.

### What to Check Next

After trying to create an instructor:
1. **Check browser console** - What error message appears?
2. **Check Supabase function logs** - What error is logged there?
3. **Share the error** - Tell me what you see and I can help fix it!
