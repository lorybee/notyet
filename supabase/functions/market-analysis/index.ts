import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    
    // Create client with service role to bypass RLS
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT and get user
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Unauthorized');
    }

    console.log('Authenticated user:', user.id);

    // Get user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    console.log('Profile data:', profile);
    if (profileError) {
      console.error('Profile error:', profileError);
    }

    // Get user's compensation data using anonymous_id
    const anonymousId = profile?.anonymous_compensation_id;
    let userCompData = null;
    
    console.log('Looking for compensation with anonymous_id:', anonymousId);
    
    if (anonymousId) {
      const { data, error: compError } = await supabase
        .from('compensation_data')
        .select('*')
        .eq('anonymous_id', anonymousId)
        .maybeSingle();
      
      console.log('Compensation data found:', data);
      if (compError) {
        console.error('Compensation error:', compError);
      }
      userCompData = data;
    }

    // Get market benchmarks
    const { data: marketData } = await supabase
      .from('compensation_data')
      .select('gross_salary, net_salary, job_title, experience_level, industry, city')
      .limit(100);

    const systemPrompt = `You are a compensation analysis expert specializing in Romanian market data. 

IMPORTANT: Format your response in clear markdown with:
- Use ## for main sections
- Use **bold** for key metrics and numbers
- Use bullet points for lists
- Include specific percentages and comparisons
- Make it scannable and easy to read

Analyze the user's compensation against market benchmarks and provide:

1. **Market Position** - Where they stand (percentile, above/below average)
2. **Salary Analysis** - Specific gaps or advantages with numbers
3. **Benefits Comparison** - How their benefits stack up
4. **Career Recommendations** - Actionable next steps
5. **Location Insights** - City-specific analysis

Be direct, data-driven, and actionable. Use specific numbers and percentages.`;

    const userContext = userCompData 
      ? `User's Data:
- Gross Salary: ${userCompData.gross_salary} RON
- Net Salary: ${userCompData.net_salary} RON
- Job Title: ${userCompData.job_title}
- Experience Level: ${userCompData.experience_level}
- Industry: ${userCompData.industry}
- City: ${userCompData.city}
- Company Size: ${userCompData.company_size}
- Benefits: ${userCompData.has_meal_vouchers ? 'Meal Vouchers (' + userCompData.meal_vouchers_value + ' RON)' : ''} ${userCompData.has_health_insurance ? 'Health Insurance' : ''} ${userCompData.has_life_insurance ? 'Life Insurance' : ''}

USER HAS SUBMITTED THEIR DATA. Provide detailed analysis.`
      : 'User has not submitted compensation data yet. Encourage them to complete their profile in the Total Rewards tab first, then come back for analysis.';

    const marketSummary = marketData && marketData.length > 0
      ? `Market Data (${marketData.length} entries):
Average Gross: ${Math.round(marketData.reduce((sum, d) => sum + Number(d.gross_salary), 0) / marketData.length)} RON
Range: ${Math.min(...marketData.map(d => Number(d.gross_salary)))} - ${Math.max(...marketData.map(d => Number(d.gross_salary)))} RON`
      : 'Limited market data available.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${userContext}\n\n${marketSummary}\n\nProvide a comprehensive market analysis with specific recommendations.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI gateway error');
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market-analysis:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
