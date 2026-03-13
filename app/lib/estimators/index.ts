/**
 * Deterministic estimate engine.
 * Computes area, quantities, and cost from extracted project data.
 * No AI - pure math.
 */

// Approximate cost per sq ft (budget to premium range)
const FLOORING_COST_PER_SQFT: Record<string, { low: number; mid: number; high: number }> = {
  lvp: { low: 2, mid: 4, high: 8 },
  hardwood: { low: 5, mid: 10, high: 15 },
  carpet: { low: 2, mid: 4, high: 8 },
  tile: { low: 3, mid: 8, high: 15 },
};

// Cost per linear ft for fence
const FENCE_COST_PER_FT: Record<string, { low: number; mid: number; high: number }> = {
  wood: { low: 15, mid: 25, high: 40 },
  metal: { low: 20, mid: 35, high: 55 },
  plastic: { low: 15, mid: 25, high: 45 },
};

// Paint: ~$30-50/gallon, 350 sq ft coverage
const PAINT_COST_PER_GALLON = { low: 25, mid: 40, high: 60 };
const PAINT_COVERAGE_SQFT = 350;
const WASTE_FACTOR = 1.1; // 10% waste

export type EstimatedProject = {
  projectType: string;
  areaSqFt?: number;
  quantity?: number;
  costLow: number;
  costMid: number;
  costHigh: number;
  details: Record<string, string | number>;
};

export function estimateProject(extracted: Record<string, unknown>): EstimatedProject {
  const projectType = String(extracted.projectType);

  if (projectType === 'painting') {
    return estimatePainting(extracted);
  }
  if (projectType === 'flooring') {
    return estimateFlooring(extracted);
  }
  if (projectType === 'fence') {
    return estimateFence(extracted);
  }

  return {
    projectType,
    costLow: 0,
    costMid: 0,
    costHigh: 0,
    details: {},
  };
}

function estimatePainting(extracted: Record<string, unknown>): EstimatedProject {
  const length = Number(extracted.roomLengthFt) || 0;
  const width = Number(extracted.roomWidthFt) || 0;
  const ceilingHeight = Number(extracted.ceilingHeightFt) || 8;
  const paintCeiling = Boolean(extracted.paintCeiling);

  // Wall area: 2 * (length + width) * height
  const wallArea = 2 * (length + width) * ceilingHeight;

  // Ceiling area if painting ceiling
  const ceilingArea = paintCeiling ? length * width : 0;
  const totalArea = Math.ceil((wallArea + ceilingArea) * WASTE_FACTOR);

  const gallonsNeeded = Math.ceil(totalArea / PAINT_COVERAGE_SQFT);

  return {
    projectType: 'painting',
    areaSqFt: Math.round(wallArea + ceilingArea),
    quantity: gallonsNeeded,
    costLow: gallonsNeeded * PAINT_COST_PER_GALLON.low,
    costMid: gallonsNeeded * PAINT_COST_PER_GALLON.mid,
    costHigh: gallonsNeeded * PAINT_COST_PER_GALLON.high,
    details: {
      wallAreaSqFt: Math.round(wallArea),
      ceilingAreaSqFt: Math.round(ceilingArea),
      totalAreaSqFt: Math.round(wallArea + ceilingArea),
      paintGallonsNeeded: gallonsNeeded,
      roomSize: `${length} × ${width} ft`,
      ceilingHeightFt: ceilingHeight,
      paintCeiling,
    },
  };
}

function estimateFlooring(extracted: Record<string, unknown>): EstimatedProject {
  const length = Number(extracted.roomLengthFt) || 0;
  const width = Number(extracted.roomWidthFt) || 0;
  const flooringType = String(extracted.flooringType || 'lvp').toLowerCase();

  const areaSqFt = Math.ceil(length * width * WASTE_FACTOR);
  const costs = FLOORING_COST_PER_SQFT[flooringType] ?? FLOORING_COST_PER_SQFT.lvp;

  return {
    projectType: 'flooring',
    areaSqFt,
    quantity: areaSqFt,
    costLow: Math.round(areaSqFt * costs.low),
    costMid: Math.round(areaSqFt * costs.mid),
    costHigh: Math.round(areaSqFt * costs.high),
    details: {
      roomSize: `${length} × ${width} ft`,
      flooringType,
      areaSqFt,
      costPerSqFtLow: costs.low,
      costPerSqFtMid: costs.mid,
      costPerSqFtHigh: costs.high,
    },
  };
}

function estimateFence(extracted: Record<string, unknown>): EstimatedProject {
  const length = Number(extracted.fenceLengthFt) || 0;
  const height = Number(extracted.fenceHeightFt) || 0;
  const fenceType = String(extracted.fenceType || 'wood').toLowerCase();

  const linearFt = length;
  const costs = FENCE_COST_PER_FT[fenceType] ?? FENCE_COST_PER_FT.wood;

  return {
    projectType: 'fence',
    areaSqFt: length * height,
    quantity: linearFt,
    costLow: Math.round(linearFt * costs.low),
    costMid: Math.round(linearFt * costs.mid),
    costHigh: Math.round(linearFt * costs.high),
    details: {
      lengthFt: length,
      heightFt: height,
      linearFt,
      fenceType,
      costPerFtLow: costs.low,
      costPerFtMid: costs.mid,
      costPerFtHigh: costs.high,
    },
  };
}
