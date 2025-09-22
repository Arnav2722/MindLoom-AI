import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

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

    let answer = '';
    let relatedQuestions: string[] = [];
    let usedProvider = 'perplexity';

    // Try Perplexity first if API key is available
    if (PERPLEXITY_API_KEY) {
      try {
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

        if (response.ok) {
          const data = await response.json();
          answer = data.choices?.[0]?.message?.content || '';
          relatedQuestions = data.related_questions || [];
        } else {
          console.warn('Perplexity API failed, falling back to Gemini');
          throw new Error('Perplexity API failed');
        }
      } catch (error) {
        console.warn('Perplexity error, trying Gemini fallback:', error.message);
        usedProvider = 'gemini';
      }
    } else {
      usedProvider = 'gemini';
    }

    // Fallback to Gemini if Perplexity failed or is not available
    if (!answer && GEMINI_API_KEY) {
      try {
        const conversationText = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n\n');
        const geminiPrompt = `${conversationText}\n\nPlease provide a helpful and accurate answer to the user's question. If you don't know something, say so clearly.`;
        
        const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: geminiPrompt
              }]
            }],
            generationConfig: {
              temperature: 0.3,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1000,
            }
          }),
        });

        if (geminiResponse.ok) {
          const geminiData = await geminiResponse.json();
          answer = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || 'No answer generated';
          
          // Generate related questions based on the context
          if (context) {
            relatedQuestions = [
              `Can you explain more about the main topic?`,
              `What are the key takeaways from this content?`,
              `How does this relate to other similar topics?`
            ];
          }
        } else {
          throw new Error('Gemini API also failed');
        }
      } catch (geminiError) {
        console.error('Gemini fallback also failed:', geminiError);
        throw new Error('Both AI services are currently unavailable');
      }
    }

    if (!answer) {
      throw new Error('No AI service available to answer your question');
    }

    console.log('Q&A response generated successfully');

    return new Response(JSON.stringify({
      success: true,
      answer,
      relatedQuestions,
      question,
      provider: usedProvider
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