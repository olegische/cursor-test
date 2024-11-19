import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Получаем две последние истории и берем вторую
    const stories = await prisma.story.findMany({
      orderBy: {
        number: 'desc',
      },
      take: 2,
    });

    // Если есть хотя бы две истории, возвращаем вторую (предпоследнюю)
    if (stories.length >= 2) {
      return NextResponse.json(stories[1]);
    }

    return NextResponse.json(
      { error: 'No previous story found' },
      { status: 404 }
    );
  } catch (error) {
    console.error('Error getting previous story:', error);
    return NextResponse.json(
      { error: 'Failed to get previous story' },
      { status: 500 }
    );
  }
} 