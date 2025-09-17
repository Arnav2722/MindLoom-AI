import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, transformationType, title } = await req.json();
    
    if (!content || !transformationType) {
      throw new Error('Content and transformation type are required');
    }

    console.log('Transforming content:', { transformationType, contentLength: content.length });

    let prompt = '';
    switch (transformationType) {
      case 'summary':
        prompt = `Create a comprehensive summary of the following content. Focus on key points, main arguments, and important details:\n\n${content}`;
        break;
      case 'mindmap':
        prompt = `Create a structured mind map outline of the following content. Use hierarchical bullet points to organize main topics, subtopics, and key details:\n\n${content}`;
        break;
      case 'podcast':
        prompt = `Transform the following content into a conversational podcast script. Make it engaging, natural, and informative:\n\n${content}`;
        break;
      case 'legal':
        prompt = `Analyze the following legal document and provide: 1) Plain English summary, 2) Key risks and obligations, 3) Important terms and definitions:\n\n${content}`;
        break;
      default:
        prompt = `Process and summarize the following content:\n\n${content}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const transformedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No content generated';

    console.log('Content transformed successfully');

    return new Response(JSON.stringify({
      success: true,
      transformedContent,
      originalTitle: title,
      transformationType
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in content-transformer:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});