import { NextRequest, NextResponse } from "next/server";
import Jimp from "jimp";
import path from "path";
import fs from "fs/promises";
import { removeBackgroundRobust } from "@/app/utils/image-processing";

// API Route Handler
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File;
  const projectType = formData.get("projectType")?.toString() || "base";
  const backgroundChoice = formData.get("backgroundChoice")?.toString() || "background1.png";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    console.log("Removing background using robust local processing...");
    
    // Use robust background removal that tries multiple methods
    const buffer = await removeBackgroundRobust(fileBuffer);

    if (!buffer || buffer.length === 0) {
      throw new Error("Background removal failed, empty buffer received");
    }

    const image = await Jimp.read(buffer);
    const backgroundPath = path.resolve(process.cwd(), "public", "assets", projectType, backgroundChoice);

    try {
      await fs.access(backgroundPath);
    } catch {
      throw new Error(`Background image not found: ${backgroundPath}`);
    }

    console.log("Loading background image...");
    const background = await Jimp.read(backgroundPath);

    background.resize(image.bitmap.width, image.bitmap.height);
    background.composite(image, 0, 0);

    const outputBuffer = await background.getBufferAsync(Jimp.MIME_PNG);
    const base64Image = `data:image/png;base64,${outputBuffer.toString("base64")}`;

    console.log("Image processing complete.");
    return NextResponse.json({ processedImageUrl: base64Image });
  } catch (error) {
    console.error("Image processing failed:", error);
    return NextResponse.json(
      { 
        error: "Image processing failed", 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}