import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface AIRequest {
  elementHtml: string;
  elementCss: Record<string, string>;
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

    const { elementHtml, elementCss, websiteUrl }: AIRequest = await req.json()

    // Check if we have Gemini API key configured
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    // Format the prompt for Gemini
    const systemPrompt = `You are an expert web design and accessibility consultant named 'Spectra'. A user has selected an HTML element from a live website. Based on the provided HTML snippet and its computed CSS, provide a concise, actionable list of suggestions to improve it. For each suggestion, provide a 'title', a 'reason' (explaining why the change is beneficial), and a 'category'. The categories are: 'Accessibility', 'Performance', 'UI/UX', and 'Modern Practices'. Your analysis should focus on:

Accessibility: Check for sufficient color contrast, presence of ARIA attributes if necessary, semantic HTML usage, and font readability.

UI/UX: Suggest improvements for spacing (padding/margin), visual hierarchy, hover states, and user interaction clarity.

Performance: Identify inefficient CSS selectors or properties that could impact rendering performance.

Modern Practices: Recommend modern CSS techniques like using gap for spacing in flexbox/grid, logical properties, or variable fonts if applicable.

Respond ONLY with a JSON array of suggestion objects. Each object should have the keys: title, reason, and category.

User's Element Data:

HTML:
${elementHtml}

CSS:
${JSON.stringify(elementCss, null, 2)}`

    // Call Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      })
    })

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`)
    }

    const geminiData = await geminiResponse.json()
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponseText) {
      throw new Error('No response from AI')
    }

    // Parse AI response as JSON
    let suggestions: any[]
    try {
      // Clean the response text (remove markdown code blocks if present)
      const cleanedResponse = aiResponseText.replace(/```json\n?|\n?```/g, '').trim()
      suggestions = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponseText)
      suggestions = [{
        title: "AI Analysis Complete",
        reason: "The AI provided suggestions but they couldn't be parsed properly. Please try again.",
        category: "Performance"
      }]
    }

    // Save to database
    const { data: savedSuggestion, error: saveError } = await supabase
      .from('ai_suggestions')
      .insert({
        user_id: user.id,
        element_html: elementHtml,
        element_css: elementCss,
        suggestions: suggestions,
        website_url: websiteUrl
      })
      .select()
      .single()

    if (saveError) {
      console.error('Error saving suggestion:', saveError)
      // Still return the suggestions even if saving fails
    }

    return new Response(
      JSON.stringify({ 
        suggestions,
        saved: !saveError,
        suggestionId: savedSuggestion?.id 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in ai-suggestions function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [{
          title: "Error Getting Suggestions",
          reason: "There was an error analyzing this element. Please try again later.",
          category: "Performance"
        }]
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})