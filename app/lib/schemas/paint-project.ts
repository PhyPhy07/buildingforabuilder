import { z } from 'zod';

export const paintProjectSchema = z.object({
  roomLengthFt: z.number().positive(),
  roomWidthFt: z.number().positive(),
  ceilingHeightFt: z.number().positive().default(8),
  paintCeiling: z.boolean().default(false),
  wallCount: z.number().positive().default(4),
  wallHeightFt: z.number().positive().default(8),
  wallAreaSqFt: z.number().positive().default(0),
  paintCoverageSqFt: z.number().positive().default(350),
  paintGallonsNeeded: z.number().positive().default(0),
});

export type PaintProject = z.infer<typeof paintProjectSchema>;