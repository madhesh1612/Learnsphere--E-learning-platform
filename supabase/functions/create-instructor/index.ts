import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get the authorization header from the request
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: 'No authorization header' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401,
                }
            )
        }

        // Create a Supabase client with the Auth context of the logged in user
        const supabaseUrl = Deno.env.get('SUPABASE_URL')
        const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')

        if (!supabaseUrl || !supabaseAnonKey) {
            return new Response(
                JSON.stringify({ error: 'Missing Supabase configuration' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                }
            )
        }

        const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
            global: {
                headers: { Authorization: authHeader },
            },
        })

        // Verify the user is an admin
        const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        if (userError || !user) {
            return new Response(
                JSON.stringify({ error: 'Not authenticated' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 401,
                }
            )
        }

        // Check if user has admin role
        const { data: roles, error: rolesError } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id)
            .eq('role', 'admin')
            .single()

        if (rolesError || !roles) {
            return new Response(
                JSON.stringify({ error: 'Unauthorized: Admin access required' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 403,
                }
            )
        }

        // Get request body
        const { email, password, fullName } = await req.json()

        if (!email || !password || !fullName) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields: email, password, fullName' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        // Create a Supabase Admin client
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

        if (!supabaseServiceKey) {
            return new Response(
                JSON.stringify({ error: 'Service role key not configured' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                }
            )
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // Create the user with admin privileges
        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName },
        })

        if (createError) {
            return new Response(
                JSON.stringify({ error: createError.message }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 400,
                }
            )
        }

        if (!newUser.user) {
            return new Response(
                JSON.stringify({ error: 'Failed to create user' }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                }
            )
        }

        // Add instructor role
        const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({ user_id: newUser.user.id, role: 'instructor' })

        if (roleError) {
            return new Response(
                JSON.stringify({ error: `User created but role assignment failed: ${roleError.message}` }),
                {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 500,
                }
            )
        }

        return new Response(
            JSON.stringify({ success: true, user: newUser.user }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            }
        )
    } catch (error) {
        console.error('Error in create-instructor function:', error)
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            }
        )
    }
})
