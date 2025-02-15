import { OpenAI } from 'openai';
import { NextResponse } from 'next/server';
import { validateInput, moderateContent, sanitizeInput, checkRateLimit } from '@/utils/security';
import { headers } from 'next/headers';
import { OpenAISettings } from '@/components/OpenAISettings';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    // Simple rate limiting by session
    const sessionId = Math.random().toString(36).substring(7);
    if (!checkRateLimit(sessionId)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { messages, systemPrompt, settings } = await req.json();
    const openAISettings = settings as OpenAISettings;

    // Validate and sanitize all inputs
    const validationResults = [
      validateInput(systemPrompt),
      ...messages.map((msg: any) => validateInput(msg.content))
    ];

    const invalidInput = validationResults.find(result => !result.isValid);
    if (invalidInput) {
      return NextResponse.json(
        { error: invalidInput.reason },
        { status: 400 }
      );
    }

    // Content moderation for all inputs
    const moderationResults = [
      moderateContent(systemPrompt),
      ...messages.map((msg: any) => moderateContent(msg.content))
    ];

    const inappropriateContent = moderationResults.find(result => !result.isValid);
    if (inappropriateContent) {
      return NextResponse.json(
        { error: inappropriateContent.reason },
        { status: 400 }
      );
    }

    // Sanitize all inputs
    const sanitizedSystemPrompt = sanitizeInput(systemPrompt);
    const sanitizedMessages = messages.map((msg: any) => ({
      ...msg,
      content: sanitizeInput(msg.content)
    }));

    const completion = await openai.chat.completions.create({
      model: openAISettings.model,
      messages: [
        { role: "system", content: sanitizedSystemPrompt },
        ...sanitizedMessages
      ],
      temperature: openAISettings.temperature,
      max_tokens: openAISettings.maxTokens,
      top_p: openAISettings.topP,
      frequency_penalty: openAISettings.frequencyPenalty,
      presence_penalty: openAISettings.presencePenalty,
    });

    return NextResponse.json({
      message: completion.choices[0].message.content
    });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return NextResponse.json(
      { error: 'There was an error processing your request' },
      { status: 500 }
    );
  }
} 