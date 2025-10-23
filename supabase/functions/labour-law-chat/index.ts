import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

    const { messages } = await req.json();

    const systemPrompt = `You are a Romanian Labor Law expert assistant. Answer questions based on Romanian Labor Code (Codul Muncii) as of October 2025.

KEY FACTS (October 2025):
- Minimum vacation: 21 working days per year (increased from 20)
- Meal vouchers (tichete de masă): Mandatory for companies 50+ employees, typically 20-30 RON/day
- Working hours: Standard 8h/day, 40h/week; Max 48h/week including overtime
- Medical leave: Paid at 75% of average salary, covered by health insurance
- Maternity leave: 126 days (140 for complications), paid by state
- Paternity leave: 15 working days, paid
- Notice period: Minimum 20 working days (can be longer per contract)
- Overtime: Max 8h/week or 48h/month, compensated at 175% of base salary or time off

RULES:
- Provide accurate information per current Romanian legislation
- Cite specific Labor Code articles when relevant (e.g., 'Conform Articolului 145...')
- Be concise but thorough (aim for 3-5 paragraphs)
- Use simple language, avoid excessive legal jargon
- If unsure, say 'Vă recomand să consultați un specialist HR sau avocat de dreptul muncii'
- Always include disclaimer: '⚠️ Aceasta este o informație generală, nu un sfat juridic'
- Answer in the same language as the question (Romanian or English)
- Be empathetic and supportive - these are real workplace concerns
- Format responses with clear paragraphs and bullet points when helpful

TOPICS YOU COVER:
- Medical leave (concediu medical) - duration, pay, procedures
- Meal vouchers (tichete de masă) - eligibility, value, taxation
- Paid leave (concediu de odihnă) - calculation, carryover, compensation
- Working hours - flexible schedules, remote work, breaks
- Overtime - limits, compensation, refusal rights
- Maternity/paternity leave - duration, benefits, job protection
- Notice periods - resignation, termination, garden leave
- Employee rights and employer obligations
- Collective labor agreements
- Work safety and health regulations
- Discrimination and harassment protection

If asked about non-labor-law topics, politely redirect: "Îmi pare rău, dar sunt specializat doar în dreptul muncii din România. Cum vă pot ajuta cu întrebări legate de relația dumneavoastră de muncă?"`;

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
          ...messages
        ],
        stream: true,
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
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('AI gateway error');
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('Error in labour-law-chat:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
