import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const MAX_REQUESTS_PER_WINDOW = 10;
const WINDOW_HOURS = 20;
const MAX_REQUEST_SIZE = 10000; // 10KB max request size

async function checkRateLimit(supabase: any, ipAddress: string, endpoint: string) {
  console.log(`Checking rate limit for IP: ${ipAddress}, endpoint: ${endpoint}`);
  
  // Clean up old entries first
  await supabase
    .from('rate_limits')
    .delete()
    .lt('first_request_at', new Date(Date.now() - WINDOW_HOURS * 60 * 60 * 1000).toISOString());

  // Check current rate limit
  const { data: existing, error: fetchError } = await supabase
    .from('rate_limits')
    .select('*')
    .eq('ip_address', ipAddress)
    .eq('endpoint', endpoint)
    .maybeSingle();

  if (fetchError) {
    console.error('Rate limit fetch error:', fetchError);
    throw new Error('Rate limit check failed');
  }

  const now = new Date();
  
  if (existing) {
    const firstRequest = new Date(existing.first_request_at);
    const hoursSinceFirst = (now.getTime() - firstRequest.getTime()) / (1000 * 60 * 60);
    
    console.log(`Existing rate limit: ${existing.request_count}/${MAX_REQUESTS_PER_WINDOW}, hours: ${hoursSinceFirst}`);
    
    if (hoursSinceFirst < WINDOW_HOURS) {
      if (existing.request_count >= MAX_REQUESTS_PER_WINDOW) {
        const hoursRemaining = Math.ceil(WINDOW_HOURS - hoursSinceFirst);
        throw new Error(`Rate limit exceeded. Try again in ${hoursRemaining} hours.`);
      }
      
      // Increment counter
      await supabase
        .from('rate_limits')
        .update({
          request_count: existing.request_count + 1,
          last_request_at: now.toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Reset counter if window expired
      await supabase
        .from('rate_limits')
        .update({
          request_count: 1,
          first_request_at: now.toISOString(),
          last_request_at: now.toISOString()
        })
        .eq('id', existing.id);
    }
  } else {
    // Create new entry
    await supabase
      .from('rate_limits')
      .insert({
        ip_address: ipAddress,
        endpoint: endpoint,
        request_count: 1,
        first_request_at: now.toISOString(),
        last_request_at: now.toISOString()
      });
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get IP address from request
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                      req.headers.get('x-real-ip') || 
                      'unknown';
    
    console.log('Request from IP:', ipAddress);

    // Create Supabase client for rate limiting
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check rate limit
    try {
      await checkRateLimit(supabase, ipAddress, 'labour-law-chat');
    } catch (rateLimitError) {
      console.error('Rate limit error:', rateLimitError);
      return new Response(JSON.stringify({ 
        error: rateLimitError instanceof Error ? rateLimitError.message : 'Rate limit exceeded' 
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    // Read request body with size limit
    const requestText = await req.text();
    if (requestText.length > MAX_REQUEST_SIZE) {
      return new Response(JSON.stringify({ 
        error: `Request too large. Maximum size is ${MAX_REQUEST_SIZE} bytes.` 
      }), {
        status: 413,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { messages } = JSON.parse(requestText);

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ 
        error: 'Invalid request: messages array required' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const knowledgeBase = {
      meal_vouchers: {
        topic: "Tichete de masă (Meal Vouchers)",
        legal_reference: "Law 165/2018; Law 296/2023",
        facts: [
          "NOT mandatory - employers can choose to grant them (no legal obligation)",
          "Common benefit: Most Romanian employees receive meal vouchers monthly",
          "Typical value: 30-40 RON per working day (August 2023: 35 RON; later increased to 40 RON)",
          "Tax treatment: Subject to 10% CASS (health contribution) since January 2024",
          "Deductibility limit (2025): Maximum 2x minimum gross salary from January 2019, indexed with inflation",
          "Given only for working days - not for vacation, sick leave, or delegation days",
          "Must be electronic/card format (paper vouchers phased out)",
          "Can be used at restaurants, supermarkets, food stores, and for online food purchases"
        ]
      },
      vacation_days: {
        topic: "Concediu de odihnă (Paid Annual Leave)",
        legal_reference: "Romanian Labor Code (Law 53/2003), Article 145",
        facts: [
          "Minimum: 20 working days per year (not calendar days)",
          "Additional days for: minors under 18 (+3 days), employees in hazardous conditions (+3 days), disabled persons (+3 days)",
          "Collective agreements may provide more days",
          "Must take at least 10 consecutive working days in one period",
          "Cannot be replaced with money except at employment termination",
          "Unused leave can be carried forward for 18 months (starting from the year after it was earned)",
          "Employer must create annual vacation schedule",
          "Public holidays (15 days in Romania) do NOT count toward annual leave",
          "Employees are entitled to take 3 consecutive weeks between June 1 - September 30"
        ]
      },
      medical_leave: {
        topic: "Concediu medical (Sick Leave)",
        legal_reference: "Romanian Labor Code Article 173; GEO 158/2005",
        facts: [
          "IMPORTANT CHANGE (August 1, 2025): New tiered payment system introduced",
          "New rates: 55% for days 1-7, 65% for days 8-14, 75% for 15+ days",
          "(Old system: flat 75% for most illnesses - applies only to certificates issued before August 1, 2025)",
          "Higher rates: 100% for tuberculosis, HIV, contagious diseases",
          "First 5 calendar days: Paid by EMPLOYER",
          "From day 6 onwards: Paid by National Health Insurance Fund (CNAS)",
          "Based on average gross salary from previous 6 months",
          "Maximum duration: 183 days per year (can be extended 90 days)",
          "Tuberculosis: Up to 1 year of sick leave",
          "Requires medical certificate from authorized doctor",
          "Must have contributed to health insurance for 6 months in last 12 months",
          "Employer advances payment, then seeks reimbursement from CNAS (within 90 days)"
        ]
      },
      overtime: {
        topic: "Ore suplimentare (Overtime)",
        legal_reference: "Romanian Labor Code Articles 120-123",
        facts: [
          "Standard work week: 40 hours (8 hours/day, 5 days/week)",
          "Maximum with overtime: 48 hours per week",
          "Can extend to 48+ hours if 4-month average stays at 48 hours/week",
          "Overtime requires: employer request AND employee agreement (except emergencies)",
          "Compensation priority: Time off within 90 calendar days",
          "If time off not possible: Payment with minimum 75% bonus added to base salary",
          "Percentage can be negotiated higher via collective agreement or employment contract",
          "Weekend work: Compensated with free day within 30 days OR 100% salary increase",
          "Public holiday work: Free day within 30 days OR 100% salary increase",
          "Night work (22:00-06:00): Higher compensation rates apply",
          "RESTRICTIONS: Minors under 18 CANNOT work overtime; Part-time employees CANNOT work overtime"
        ]
      },
      maternity_leave: {
        topic: "Concediu de maternitate (Maternity Leave)",
        legal_reference: "Romanian Labor Code; Social Insurance Law",
        facts: [
          "Duration: 126 calendar days total",
          "Split: 63 days before expected birth, 63 days after (flexible, but minimum 42 days postnatal required)",
          "Payment: 85% of average gross salary from previous 12 months",
          "Paid by: State social insurance system (not employer)",
          "Eligibility: Must have contributed to social insurance for 6+ months in last year",
          "Medical certificate required from doctor",
          "Employment contract suspended during leave",
          "After maternity: Childcare leave available (up to 2 years, 3 if child has disability)"
        ]
      },
      paternity_leave: {
        topic: "Concediu de paternitate (Paternity Leave)",
        legal_reference: "Romanian Labor Code",
        facts: [
          "Duration: 10 working days (mandatory minimum)",
          "Additional 5 days if father completes infant care course",
          "Must be taken within first 8 weeks after birth",
          "Payment: 100% of salary",
          "Paid by: Employer",
          "Plus: Father must take minimum 1 month of childcare leave later (while mother returns to work)"
        ]
      },
      notice_period: {
        topic: "Preaviz (Notice Period)",
        legal_reference: "Romanian Labor Code Article 81",
        facts: [
          "Employee resignation: Minimum 20 working days",
          "Can be longer if specified in employment contract",
          "Employer dismissal: 15-20 working days (depends on reason and seniority)",
          "During notice period: Employee continues working and receives full salary",
          "Can be waived by mutual written agreement",
          "Cannot give notice while employee on: sick leave, maternity leave, caring for sick child under 1 year"
        ]
      },
      special_leave: {
        topic: "Concedii pentru evenimente speciale (Special Event Leave)",
        legal_reference: "Romanian Labor Code Article 152; former National Collective Agreement",
        facts: [
          "Marriage (employee): 5 working days paid",
          "Birth of child: 5 working days paid (separate from paternity leave)",
          "Marriage of child: 2 working days paid",
          "Death of spouse/child/parent/in-laws: 3 working days paid",
          "Death of grandparent/sibling: 1 working day paid",
          "Blood donation: 1 day paid",
          "These days do NOT count against annual vacation leave",
          "May vary by collective agreement or internal regulations"
        ]
      },
      minimum_wage_2025: {
        topic: "Salariul minim (Minimum Wage 2025)",
        legal_reference: "Government Decision 1506/2024",
        facts: [
          "General minimum wage: 4,050 RON gross/month (as of January 1, 2025)",
          "Construction sector: 4,582 RON gross/month (July 2024)",
          "Based on 168-hour work month (40 hours/week average)",
          "Employers cannot pay minimum wage for more than 24 consecutive months to same employee",
          "Does not include bonuses, overtime pay, or other additional compensation"
        ]
      }
    };

    const systemPrompt = `You are a friendly and knowledgeable Romanian Labor Law companion. Your role is to help employees understand their workplace rights in a conversational, empathetic way.

KNOWLEDGE BASE (Your source of truth):
${JSON.stringify(knowledgeBase, null, 2)}

YOUR PERSONALITY:
- Warm, supportive, and understanding
- You recognize that workplace issues can be stressful
- You explain legal concepts in plain language, avoiding jargon when possible
- You're conversational but professional
- You ask clarifying questions if needed
- You provide examples to illustrate points when helpful

HOW TO ANSWER:
1. Use the knowledge base facts as your foundation - these are accurate and up-to-date
2. Present information in a natural, conversational way (not rigid templates)
3. Always cite the legal reference somewhere in your answer
4. If something isn't in the knowledge base, honestly say: "I don't have specific information about that in my current knowledge base. I'd recommend checking with your HR department or the Romanian Labor Inspectorate (Inspectoratul Teritorial de Muncii) for accurate details."
5. Answer in English
6. End with the disclaimer: "⚠️ This is general information, not legal advice. For your specific situation, consult your HR department or a labor law specialist."

CONVERSATION STYLE:
- Start with empathy: "I understand this is important..." or "Let me help you with that..."
- Break down complex topics into digestible parts
- Use bullet points for clarity when listing multiple facts
- Offer to clarify or elaborate if the person has follow-up questions
- Be encouraging: "You're right to ask about this..." or "It's good that you're informed about your rights..."

TOPICS YOU COVER (keyword matching):
- Meal vouchers → meal_vouchers
- Vacation/annual leave → vacation_days
- Medical/sick leave → medical_leave
- Overtime/working hours → overtime
- Maternity leave → maternity_leave
- Paternity leave → paternity_leave
- Notice period/resignation → notice_period
- Special event leave → special_leave
- Minimum wage → minimum_wage_2025

When answering:
1. Acknowledge the question with understanding
2. Provide the key information from the knowledge base in a natural way
3. Add context or examples if helpful
4. Cite the legal reference
5. Include the disclaimer
6. Invite follow-up questions if they need clarification

Remember: You're a helpful companion, not a rigid legal robot. Be human, be kind, be accurate.`;

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