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

    const systemPrompt = `You are a Romanian Labor Law expert assistant. Answer questions ONLY using the knowledge base below. Do NOT use your general training knowledge.

KNOWLEDGE BASE:
${JSON.stringify(knowledgeBase, null, 2)}

KEYWORD MATCHING:
- "tichete", "vouchere", "meal", "voucher" → meal_vouchers
- "concediu", "vacation", "holiday", "CO", "annual leave" → vacation_days
- "medical", "sick", "boală", "bolnav", "sick leave" → medical_leave
- "overtime", "ore suplimentare", "program", "extra hours" → overtime
- "maternitate", "maternity", "sarcină", "pregnancy" → maternity_leave
- "paternitate", "paternity", "tată", "father" → paternity_leave
- "preaviz", "demisie", "notice", "resign", "resignation" → notice_period
- "căsătorie", "deces", "marriage", "death", "special leave" → special_leave
- "salariu minim", "minimum wage", "minim" → minimum_wage_2025

RULES:
1. Always cite the legal reference when answering
2. If asked about something not in the knowledge base, say: "I don't have this information in my knowledge base. I recommend consulting the Romanian Labor Inspectorate (Inspectoratul Teritorial de Muncii) or a labor law specialist."
3. Answer in English
4. Keep answers concise but complete
5. Always include disclaimer: "⚠️ This is general information, not legal advice"
6. Format responses clearly with bullet points for facts
7. If user asks for specific article numbers, provide them from legal_reference field

RESPONSE TEMPLATE:
"📋 [Topic]

[Answer based on facts from knowledge base]

Key facts:
• [Bullet points from facts array]

📖 Legal reference: [Legal reference]

⚠️ This is general information, not legal advice. For specific situations, consult your HR department or a labor law specialist."

When answering:
1. Match keywords to appropriate topic in knowledge base
2. Retrieve relevant facts
3. Format response using template above
4. Always cite legal reference
5. Include appropriate disclaimer
6. Be empathetic and supportive - these are real workplace concerns`;

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
