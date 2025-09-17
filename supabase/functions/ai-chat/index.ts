import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, context, chatHistory } = await req.json();
    
    if (!question) {
      throw new Error('Question is required');
    }

    console.log('Processing Q&A request:', { question, contextLength: context?.length });

    // Prepare messages for Perplexity API
    const messages = [
      {
        role: 'system',
        content: `You are an AI assistant helping users understand content. ${context ? `Use this context to answer questions: ${context}` : 'Answer questions clearly and helpfully.'}`
      }
    ];

    // Add chat history if provided
    if (chatHistory && Array.isArray(chatHistory)) {
      messages.push(...chatHistory);
    }

    // Add current question
    messages.push({
      role: 'user',
      content: question
    });

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: messages,
        temperature: 0.2,
        top_p: 0.9,
        max_tokens: 1000,
        return_images: false,
        return_related_questions: true,
        frequency_penalty: 1,
        presence_penalty: 0
      }),
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content || 'No answer generated';
    const relatedQuestions = data.related_questions || [];

    console.log('Q&A response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      answer,
      relatedQuestions,
      question
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});