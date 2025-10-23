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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get user's compensation data using anonymous_id
    const anonymousId = profile?.anonymous_compensation_id;
    let userCompData = null;
    
    if (anonymousId) {
      const { data } = await supabase
        .from('compensation_data')
        .select('*')
        .eq('anonymous_id', anonymousId)
        .single();
      userCompData = data;
    }

    // Get market benchmarks
    const { data: marketData } = await supabase
      .from('compensation_data')
      .select('gross_salary, net_salary, job_title, experience_level, industry, city')
      .limit(100);

    const systemPrompt = `You are a compensation analysis expert specializing in Romanian market data. 
Analyze the user's compensation against market benchmarks and provide personalized insights.
Focus on:
- Market position (percentile ranking)
- Specific salary gaps or advantages
- Career growth recommendations
- Industry-specific insights
- Location-based comparisons

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
- Benefits: ${userCompData.has_meal_vouchers ? 'Meal Vouchers' : ''} ${userCompData.has_health_insurance ? 'Health Insurance' : ''}`
      : 'User has not submitted compensation data yet. Encourage them to complete their profile in the Total Rewards tab.';

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
