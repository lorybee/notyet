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

    // Get market benchmarks - filter by user's city and experience level for freemium
    const { data: marketData } = await supabase
      .from('compensation_data')
      .select('gross_salary, net_salary, job_title, experience_level, industry, city')
      .eq('city', userCompData.city)
      .eq('experience_level', userCompData.experience_level)
      .limit(100);
    
    console.log(`Found ${marketData?.length || 0} compensation entries for ${userCompData.city} at ${userCompData.experience_level} level`);

    const systemPrompt = `You are a compensation analysis expert specializing in Romanian market data. 
Analyze the user's compensation and provide structured, data-driven insights.`;

    const userContext = userCompData 
      ? `User's Data:
- Gross Salary: ${userCompData.gross_salary} RON
- Net Salary: ${userCompData.net_salary} RON
- Job Title: ${userCompData.job_title}
- Experience Level: ${userCompData.experience_level}
- Industry: ${userCompData.industry}
- City: ${userCompData.city}
- Company Size: ${userCompData.company_size}
- Benefits: ${userCompData.has_meal_vouchers ? 'Meal Vouchers (' + userCompData.meal_vouchers_value + ' RON)' : ''} ${userCompData.has_health_insurance ? 'Health Insurance' : ''} ${userCompData.has_life_insurance ? 'Life Insurance' : ''}`
      : null;

    if (!userContext) {
      return new Response(JSON.stringify({ 
        needsData: true,
        message: 'Please complete your Total Rewards profile first to get personalized analysis.' 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
          { role: 'user', content: `${userContext}\n\n${marketSummary}\n\nProvide comprehensive analysis.` }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'provide_compensation_analysis',
            description: 'Provide structured compensation analysis',
            parameters: {
              type: 'object',
              properties: {
                percentile: { type: 'number', description: 'User percentile (0-100)' },
                percentileText: { type: 'string', description: 'Description like "You earn more than X% of [Job Title]s in [City]"' },
                vsMarketAverage: { type: 'number', description: 'Percentage difference vs market average' },
                marketAverageGross: { type: 'number', description: 'Market average gross salary' },
                top10Gross: { type: 'number', description: 'Top 10% gross salary' },
                strengths: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of 3-4 competitive strengths'
                },
                opportunities: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: 'List of 3-4 growth opportunities'
                },
                careerMoves: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      impact: { type: 'string' },
                      actions: { type: 'array', items: { type: 'string' } }
                    }
                  },
                  description: '3 actionable career recommendations'
                },
                marketInsights: { 
                  type: 'array', 
                  items: { type: 'string' },
                  description: '3-4 quick market context insights'
                },
                talkingPoints: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '3 data-driven negotiation talking points'
                }
              },
              required: ['percentile', 'percentileText', 'vsMarketAverage', 'marketAverageGross', 'top10Gross', 'strengths', 'opportunities', 'careerMoves', 'marketInsights', 'talkingPoints']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'provide_compensation_analysis' } }
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
    const toolCall = data.choices[0].message.tool_calls?.[0];
    
    if (!toolCall) {
      throw new Error('No structured analysis returned');
    }

    const analysis = JSON.parse(toolCall.function.arguments);

    // Calculate min/max/median from market data
    let minSalary = userCompData.gross_salary;
    let maxSalary = userCompData.gross_salary;
    let medianSalary = userCompData.gross_salary;
    
    if (marketData && marketData.length > 0) {
      const salaries = marketData.map(d => Number(d.gross_salary)).filter(s => !isNaN(s));
      
      if (salaries.length > 0) {
        minSalary = Math.min(...salaries);
        maxSalary = Math.max(...salaries);
        
        // Calculate median
        const sortedSalaries = [...salaries].sort((a, b) => a - b);
        const mid = Math.floor(sortedSalaries.length / 2);
        medianSalary = sortedSalaries.length % 2 === 0
          ? Math.round((sortedSalaries[mid - 1] + sortedSalaries[mid]) / 2)
          : sortedSalaries[mid];
      }
    }

    console.log('Salary range for', userCompData.city, ':', { 
      min: minSalary, 
      max: maxSalary, 
      median: medianSalary,
      dataPoints: marketData?.length 
    });

    return new Response(JSON.stringify({ 
      analysis,
      userData: {
        grossSalary: userCompData.gross_salary,
        netSalary: userCompData.net_salary,
        jobTitle: userCompData.job_title,
        city: userCompData.city
      },
      dataPoints: marketData?.length || 0,
      salaryRange: {
        min: minSalary,
        max: maxSalary,
        median: medianSalary
      },
      experienceLevel: userCompData.experience_level
    }), {
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
