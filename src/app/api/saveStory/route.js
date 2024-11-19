import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req) {
  try {
    const { title, content, prompt, model } = await req.json();

    // Получаем максимальный номер истории
    const maxNumber = await prisma.story.findFirst({
      orderBy: {
        number: 'desc',
      },
      select: {
        number: true,
      },
    });

    // Создаем новую историю
    const story = await prisma.story.create({
      data: {
        title,
        content,
        prompt,
        model,
        number: (maxNumber?.number || 0) + 1,
      },
    });

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error saving story:', error);
    return NextResponse.json(
      { error: 'Failed to save story' },
      { status: 500 }
    );
  }
} 