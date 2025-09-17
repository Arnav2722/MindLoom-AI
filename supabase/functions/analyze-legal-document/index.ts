import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentText, fileName } = await req.json();
    
    if (!documentText) {
      return new Response(
        JSON.stringify({ error: 'Document text is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `You are a legal document analysis AI. Analyze the following legal document and provide a comprehensive analysis.

Document: ${fileName || 'Legal Document'}

Text: ${documentText}

Please provide your response in the following JSON format:
{
  "summary": "A clear, plain English summary of the document (2-3 sentences)",
  "riskLevel": "low|medium|high",
  "risks": [
    {
      "severity": "low|medium|high",
      "clause": "Name of the problematic clause or section",
      "issue": "Description of the issue in plain English",
      "impact": "What this means for the user"
    }
  ],
  "keyTerms": [
    {
      "term": "Important term name",
      "explanation": "Plain English explanation of what this term means",
      "section": "Section reference where this term is found"
    }
  ]
}

Focus on:
1. Identifying unfavorable terms, hidden fees, automatic renewals, liability issues
2. Explaining complex legal jargon in simple terms
3. Highlighting any red flags or unusual clauses
4. Providing practical guidance for the average person

Be thorough but concise. Prioritize the most important risks and terms.`;

    console.log('Calling Gemini API for document analysis...');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      console.error('Gemini API error:', response.status, await response.text());
      return new Response(
        JSON.stringify({ error: 'Failed to analyze document' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Gemini API response received');

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error('No text generated from Gemini API');
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse the JSON response from Gemini
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      // Fallback: create a structured response from the text
      analysis = {
        summary: generatedText.substring(0, 500) + '...',
        riskLevel: 'medium',
        risks: [
          {
            severity: 'medium',
            clause: 'Document Analysis',
            issue: 'Could not parse detailed analysis',
            impact: 'Please review the document manually'
          }
        ],
        keyTerms: [
          {
            term: 'Analysis Result',
            explanation: generatedText.substring(0, 200) + '...',
            section: 'General'
          }
        ]
      };
    }

    console.log('Analysis completed successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in analyze-legal-document function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});