import { z } from 'zod';

export const flooringProjectSchema = z.object({
  roomLengthFt: z.number().positive(),
  roomWidthFt: z.number().positive(),
  flooringType: z.enum(['hardwood', 'carpet', 'tile']),
  flooringThicknessFt: z.number().positive(),
  flooringAreaSqFt: z.number().positive().default(0),
  flooringCostPerSqFt: z.number().positive().default(0),
  flooringCost: z.number().positive().default(0),
});

export type FlooringProject = z.infer<typeof flooringProjectSchema>;