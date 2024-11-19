import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const story = await prisma.story.findFirst({
      orderBy: {
        number: 'desc',
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'No stories found' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error getting latest story:', error);
    return NextResponse.json(
      { error: 'Failed to get latest story' },
      { status: 500 }
    );
  }
} 