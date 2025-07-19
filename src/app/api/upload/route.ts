import { NextRequest, NextResponse } from "next/server";
import Jimp from "jimp";
import FormData from "form-data";
import fetch from "node-fetch";
import path from "path";
import fs from "fs/promises";

// Define proper header type
type HeadersInit = Record<string, string>;

// Helper: Ensure API headers are valid
const getHeaders = (apiKey?: string): HeadersInit => {
  return apiKey ? { "X-API-Key": apiKey } : {};
};

// API configuration interface
interface ApiConfig {
  name: string;
  url: string;
  headers: HeadersInit;
  formData: (buffer: Buffer) => Promise<FormData | string>;
  isJson?: boolean;
  processResponse?: (data: any) => Buffer;
}

// Function to remove background using multiple APIs
async function removeBackground(fileBuffer: Buffer): Promise<Buffer> {
  const apis: ApiConfig[] = [
    {
      name: "Remove.bg",
      url: "https://api.remove.bg/v1.0/removebg",
      headers: getHeaders(process.env.REMOVEBG_API_KEY),
      formData: async (buffer: Buffer) => {
        const form = new FormData();
        form.append("image_file", buffer, { filename: "image.png" });
        form.append("size", "auto");
        return form;
      },
    },
    {
      name: "WithoutBG",
      url: "https://api.withoutbg.com/v1.0/image-without-background-base64",
      headers: { 
        ...getHeaders(process.env.WITHOUTBG_API_KEY), 
        "Content-Type": "application/json" 
      },
      
      formData: async (buffer: Buffer) => {
        if (!buffer || buffer.length === 0) throw new Error("Invalid buffer for WithoutBG API");
        const image = await Jimp.read(buffer);
        const base64 = await image.getBase64Async(Jimp.MIME_PNG);
        return JSON.stringify({ 
          image_base64: base64.replace(/^data:image\/png;base64,/, "") 
        });
      },
      isJson: true,
      processResponse: (data: any) => {
        if (!data?.result) throw new Error("WithoutBG API failed");
        return Buffer.from(data.result, "base64");
      },
    },
    {
      name: "Photoroom",
      url: "https://sdk.photoroom.com/v1/segment",
      headers: getHeaders(process.env.PHOTOROOM_API_KEY),
      formData: async (buffer: Buffer) => {
        const form = new FormData();
        form.append("image_file", buffer, { filename: "image.png" });
        return form;
      },
    },
    {
      name: "RapidAI Background Remover",
      url: "https://ai-background-remover.p.rapidapi.com/image/matte/v1",
      headers: {
        "x-rapidapi-host": "ai-background-remover.p.rapidapi.com",
        "x-rapidapi-key": process.env.RAPIDAPI_KEY || "", // Add RAPIDAPI_KEY to your .env
        "Content-Type": "application/x-www-form-urlencoded",
      },
      formData: async (buffer: Buffer) => {
        const form = new URLSearchParams();
        // Convert buffer to base64 for RapidAPI
        const base64 = buffer.toString("base64");
        form.append("image", base64);
        return form;
      },
      processResponse: (data: Buffer) => {
        // RapidAPI returns the image directly as a buffer
        if (!data || data.length === 0) {
          throw new Error("RapidAI returned empty response");
        }
        return data;
      },
    },
  ];

  for (const api of apis) {
    try {
      console.log(`Attempting ${api.name} API...`);
      const body = await api.formData(fileBuffer);
      const response = await fetch(api.url, {
        method: "POST",
        headers: api.headers,
        body: body as BodyInit,
      });

      if (!response.ok) throw new Error(`${api.name} API failed: ${response.statusText}`);
      const data = await response.buffer(); // Get raw buffer directly
      const processedBuffer = api.processResponse ? api.processResponse(data) : data;

      if (!processedBuffer || processedBuffer.length === 0) {
        throw new Error(`${api.name} returned an empty response`);
      }
      return processedBuffer;
    } catch (error) {
      console.error(`Error with ${api.name}:`, error);
    }
  }
  throw new Error("All background removal APIs failed");
}

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
    console.log("Removing background...");
    const buffer = await removeBackground(fileBuffer);

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