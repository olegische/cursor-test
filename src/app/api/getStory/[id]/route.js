import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req, { params }) {
  try {
    const { id } = params;

    const story = await prisma.story.findUnique({
      where: {
        id: id,
      },
    });

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error getting story:', error);
    return NextResponse.json(
      { error: 'Failed to get story' },
      { status: 500 }
    );
  }
} 