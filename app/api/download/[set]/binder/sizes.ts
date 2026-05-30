export const FRONT_SIZES = ['a4', 'letter'] as const
export const SPINE_SIZES = ['a4_16'] as const

export const frontSizes: Record<
  (typeof FRONT_SIZES)[number],
  {width: number; height: number}
> = {
  a4: {width: 2480, height: 3508},
  letter: {width: 2550, height: 3300}
} as const

export const spineSizes: Record<
  (typeof SPINE_SIZES)[number],
  {width: number; height: number}
> = {
  a4_16: {width: 224, height: 3508}
} as const
