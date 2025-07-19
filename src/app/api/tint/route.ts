import { NextRequest, NextResponse } from 'next/server';
import Jimp from 'jimp';

// Endpoint to apply tint to the image
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('image') as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    const image = await Jimp.read(fileBuffer);

    // Apply tint
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      if (this.bitmap.data[idx + 3] > 0) {
        const r = this.bitmap.data[idx + 0];
        const g = this.bitmap.data[idx + 1];
        const b = this.bitmap.data[idx + 2];

        const tintColor = { r: 102, g: 212, b: 255 };
        const tintFactor = 0.2;

        this.bitmap.data[idx + 0] = Math.round(r * (1 - tintFactor) + tintColor.r * tintFactor);
        this.bitmap.data[idx + 1] = Math.round(g * (1 - tintFactor) + tintColor.g * tintFactor);
        this.bitmap.data[idx + 2] = Math.round(b * (1 - tintFactor) + tintColor.b * tintFactor);
      }
    });

    const outputBuffer = await image.getBufferAsync(Jimp.MIME_PNG);
    const base64Image = `data:image/png;base64,${outputBuffer.toString('base64')}`;

    return NextResponse.json({ processedImageUrl: base64Image });
  } catch (error) {
    console.error("Tinting failed:", error);
    return NextResponse.json({ error: "Tinting failed", details: (error as Error).message }, { status: 500 });
  }
}