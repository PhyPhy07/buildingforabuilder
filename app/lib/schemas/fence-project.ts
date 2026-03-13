import { z } from 'zod';

export const fenceProjectSchema = z.object({
  fenceLengthFt: z.number().positive(),
  fenceHeightFt: z.number().positive(),
  fenceType: z.enum(['wood', 'metal', 'plastic']),
  fenceCostPerFt: z.number().positive().default(0),
  fenceCost: z.number().positive().default(0),
});

export type FenceProject = z.infer<typeof fenceProjectSchema>;