import { NextRequest, NextResponse } from "next/server";
import { 
  removeBackgroundAI,
  removeBackgroundSimple, 
  removeBackgroundRobust
} from "@/app/utils/image-processing";

// API Route Handler for testing background removal methods
export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("image") as File;
  const method = formData.get("method")?.toString() || "robust";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  try {
    console.log(`Testing background removal with method: ${method}`);
    
    let buffer: Buffer;
    
    switch (method) {
      case "ai":
        buffer = await removeBackgroundAI(fileBuffer);
        break;
      case "simple":
        buffer = await removeBackgroundSimple(fileBuffer);
        break;
      case "robust":
      default:
        buffer = await removeBackgroundRobust(fileBuffer);
        break;
    }

    if (!buffer || buffer.length === 0) {
      throw new Error("Background removal failed, empty buffer received");
    }

    const base64Image = `data:image/png;base64,${buffer.toString("base64")}`;

    console.log(`Background removal with method '${method}' completed successfully.`);
    return NextResponse.json({ 
      processedImageUrl: base64Image,
      method: method,
      success: true
    });
  } catch (error) {
    console.error(`Background removal with method '${method}' failed:`, error);
    return NextResponse.json(
      { 
        error: "Background removal failed", 
        details: error instanceof Error ? error.message : String(error),
        method: method,
        success: false
      },
      { status: 500 }
    );
  }
} 