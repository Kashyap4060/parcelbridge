import { createClient } from '@supabase/supabase-js'

// Create a Supabase client with service role key for server-side operations
// This bypasses RLS policies and should only be used in secure server environments
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

let supabaseAdmin: any = null

// Only initialize the admin client if the service key is available
if (supabaseUrl && supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
} else {
  if (process.env.NODE_ENV !== 'development') {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables. Admin operations will fail.')
  }
  
  // Create a dummy client that won't be used during build
  supabaseAdmin = {
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () => Promise.resolve({ data: null, error: new Error('Admin client not initialized') })
        })
      })
    })
  }
}

export { supabaseAdmin }
export default supabaseAdmin




