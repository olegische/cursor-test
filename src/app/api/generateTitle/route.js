import { headers } from 'next/headers';

export async function POST(request) {
  const { content } = await request.json();

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.APP_URL,
        'X-Title': 'Wow Stories',
      },
      body: JSON.stringify({
        model: 'mistralai/mixtral-8x7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a title generator. IMPORTANT: Return ONLY the title itself in Russian, 5-7 words max. DO NOT include any translations, explanations, or variations. DO NOT explain your choice. DO NOT translate the title. If you generate anything besides the title itself, you have failed the task.'
          },
          {
            role: 'user',
            content: `Generate ONLY a title: ${content}`
          }
        ],
        max_tokens: 30,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate title');
    }

    // Настраиваем стриминг
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(content));
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }
        } catch (error) {
          controller.error(error);
        } finally {
          controller.close();
          reader.releaseLock();
        }
      },
    });

    return new Response(stream);
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate title' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
} 