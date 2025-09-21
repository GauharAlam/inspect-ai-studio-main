import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SavePaletteRequest {
  name: string;
  colors: string[];
  websiteUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { authorization: authHeader } } }
    )

    // Get user from JWT
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    const { name, colors, websiteUrl }: SavePaletteRequest = await req.json()

    // Validate input
    if (!name || !colors || !Array.isArray(colors) || colors.length === 0) {
      throw new Error('Invalid palette data')
    }

    // Save palette to database
    const { data: palette, error: saveError } = await supabase
      .from('saved_palettes')
      .insert({
        user_id: user.id,
        name,
        colors,
        website_url: websiteUrl
      })
      .select()
      .single()

    if (saveError) {
      throw new Error('Failed to save palette')
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        palette
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in save-palette function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})