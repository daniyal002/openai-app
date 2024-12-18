import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { knowledgeBase } from './helper';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { prompt, messages } = body; // Получаем историю сообщений

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    // Формируем весь контекст сообщений, включая историю
    const fullMessages = [
      ...messages,
      ...knowledgeBase, // Если нужно добавить базу знаний
    ];

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini', // Используй нужную модель
        messages: fullMessages,
        temperature: 0.7,
        // max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching response from OpenAI' }, { status: 500 });
  }
}
