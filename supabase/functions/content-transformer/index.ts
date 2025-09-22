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
    let systemPrompt = '';
    
    switch (transformationType) {
      case 'summary':
        systemPrompt = 'You are an expert content summarizer. Create clear, concise summaries that capture the essence of any content.';
        prompt = `Create a comprehensive summary of the following content. Structure your response with:

• **Key Points**: 3-5 main takeaways
• **Main Arguments**: Core thesis or arguments presented
• **Important Details**: Supporting facts, data, or examples
• **Conclusion**: Overall significance or implications

Content to summarize:
${content}`;
        break;
        
      case 'mindmap':
        systemPrompt = 'You are an expert at creating visual mind maps. Transform content into hierarchical, easy-to-follow structures.';
        prompt = `Create a detailed mind map of the following content. Use this format:

🎯 **MAIN TOPIC**
├── 📚 **Major Theme 1**
│   ├── Subtopic A
│   │   ├── Detail 1
│   │   └── Detail 2
│   └── Subtopic B
├── 🔍 **Major Theme 2**
└── ⚙️ **Major Theme 3**

Use emojis and clear hierarchy. Make it visually engaging and easy to follow.

Content:
${content}`;
        break;
        
      case 'notes':
        systemPrompt = 'You are an expert educator who creates comprehensive study materials and learning notes.';
        prompt = `Transform the following content into structured study notes. Include:

📝 **STUDY NOTES**

**🎯 Learning Objectives:**
- [Key learning goals]

**📚 Key Concepts:**
- [Important terms and definitions]

**🔍 Main Topics:**
- [Organized topic breakdown]

**❓ Study Questions:**
- [Questions to test understanding]

**💡 Key Takeaways:**
- [Essential points to remember]

**📚 Further Reading:**
- [Related topics or resources]

Content:
${content}`;
        break;
        
      case 'legal':
        systemPrompt = 'You are a legal expert who explains complex legal documents in plain English for non-lawyers.';
        prompt = `Analyze this legal document and provide a comprehensive breakdown:

⚖️ **LEGAL DOCUMENT ANALYSIS**

**📝 Plain English Summary:**
[Explain what this document is about in simple terms]

**⚠️ Key Risks & Obligations:**
[List important risks, responsibilities, and obligations]

**📜 Important Terms & Definitions:**
[Define complex legal terms used in the document]

**🔴 Red Flags:**
[Highlight any concerning clauses or unusual terms]

**✅ Recommendations:**
[Suggest actions or considerations for the reader]

Document:
${content}`;
        break;
        
      case 'analysis':
        systemPrompt = 'You are an expert analyst who provides deep insights and critical analysis of content.';
        prompt = `Provide a comprehensive analysis of the following content:

🔍 **CONTENT ANALYSIS**

**🎯 Purpose & Context:**
[What is the main purpose and context?]

**📊 Key Arguments:**
[Main arguments and supporting evidence]

**🔄 Strengths & Weaknesses:**
[Critical evaluation of the content]

**💡 Insights:**
[Deeper insights and implications]

**🔮 Conclusions:**
[Final thoughts and recommendations]

Content:
${content}`;
        break;
        
      case 'qa':
        systemPrompt = 'You are an expert who creates comprehensive Q&A materials from any content.';
        prompt = `Create a comprehensive Q&A based on the following content:

❓ **QUESTIONS & ANSWERS**

**Basic Understanding:**
[5-7 fundamental questions about the content]

**Detailed Analysis:**
[3-5 deeper analytical questions]

**Application Questions:**
[2-3 questions about practical applications]

**Critical Thinking:**
[2-3 questions that require critical analysis]

Provide clear, comprehensive answers for each question.

Content:
${content}`;
        break;
        
      default:
        systemPrompt = 'You are a helpful AI assistant that processes and transforms content according to user needs.';
        prompt = `Process and transform the following content in a helpful and structured way:

${content}`;
    }

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${prompt}`
          }]
        }],
        generationConfig: {
          temperature: transformationType === 'legal' ? 0.3 : 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: transformationType === 'mindmap' ? 3000 : 2048,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
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