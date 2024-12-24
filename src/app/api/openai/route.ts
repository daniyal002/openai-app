import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { SYSTEM_PROMPT } from './helper';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, messages, type } = body;

  if (!prompt && type !== 'daily-plan') {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const fullMessages = [
      ...messages,
      SYSTEM_PROMPT
    ];

    const requestPayload = {
      model: 'gpt-4o-mini',
      messages: fullMessages,
      temperature: 0.7,
    };

    if (type === 'daily-plan') {
      requestPayload.messages.push({
        role: 'user',
        content: 'Generate a daily plan for the next month with clear and actionable instructions for each day.'
      });
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      requestPayload,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error('Error fetching response from OpenAI:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Error fetching response from OpenAI' }, { status: 500 });
  }
}
