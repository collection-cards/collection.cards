import sharp from 'sharp'

/**
 * Generate a mask image from a foil image, mirroring the ImageMagick pipeline
 * used by the legacy bash script:
 *   -alpha set -channel A -evaluate multiply 8 +channel
 * combined with a fuzz-based black-pixel removal (fuzz 20%).
 */
export async function createMaskFromBuffer(input: Buffer): Promise<Buffer> {
  const {data, info} = await sharp(input)
    .ensureAlpha() // -alpha set
    .raw()
    .toBuffer({resolveWithObject: true})

  // ImageMagick fuzz 20%
  const MAX_DISTANCE = Math.sqrt(3 * 255 * 255) // ≈ 441.67
  const FUZZ_DISTANCE = 0.2 * MAX_DISTANCE // ≈ 88.33

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // -channel A -evaluate multiply 8
    let a = Math.min(255, data[i + 3] * 8)

    // true ImageMagick-style fuzz distance (treat near-black as fully transparent)
    const distance = Math.sqrt(r * r + g * g + b * b)
    if (distance <= FUZZ_DISTANCE) {
      a = 0
    }

    data[i + 3] = a
  }

  return sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4
    }
  })
    .png()
    .toBuffer()
}
