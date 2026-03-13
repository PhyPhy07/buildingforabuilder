import { NextResponse } from 'next/server';
import { estimateProject } from '@/app/lib/estimators';
import { cachedGenerateObject } from '@/app/lib/cache-ai';
import { projectExtractionSchema } from '@/app/lib/schemas';

export async function POST(request: Request) {
  try {
    const { input } = await request.json();
    if (!input || typeof input !== 'string') {
      return NextResponse.json({ error: 'Missing input' }, { status: 400 });
    }

    const extracted = await cachedGenerateObject(
      input,
      'project-extraction',
      projectExtractionSchema,
      `You are a DIY project assistant. Extract project details into this EXACT JSON structure. Do NOT use "dimensions" arrays or "preferences" arrays.

For PAINTING: projectType "painting", roomLengthFt, roomWidthFt (numbers in feet), ceilingHeightFt (default 8), paintCeiling (boolean).
For FLOORING: projectType "flooring", roomLengthFt, roomWidthFt (numbers in feet), flooringType must be one of: "hardwood", "carpet", "tile", "lvp" (use "lvp" for vinyl/LVP/vinyl plank).
For FENCE: projectType "fence", fenceLengthFt, fenceHeightFt (numbers in feet), fenceType: "wood", "metal", or "plastic".

Always use the exact field names above. For "10x15 room" use roomLengthFt: 10, roomWidthFt: 15.

When the user does NOT specify dimensions (e.g. "paint my bedroom"), omit roomLengthFt/roomWidthFt (or fenceLengthFt/fenceHeightFt) - defaults will apply. Still include clarifyingQuestions asking for dimensions.

IMPORTANT: Include clarifyingQuestions (array of 1-3 strings) when info is missing or ambiguous. Examples: "What are the room dimensions (length x width)?", "Are you painting the ceiling too?", "Is this over concrete or existing flooring?". Omit clarifyingQuestions only when the user gave complete details.`,
      (userInput) => `User's project description: ${userInput}`
    );

    const estimate = estimateProject(extracted as Record<string, unknown>);

    return NextResponse.json({ extracted, estimate });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}