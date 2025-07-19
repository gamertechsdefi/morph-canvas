"use client";

import { useState } from "react";
import axios from "axios";
import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [tintedImage, setTintedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setTintedImage(null);
      setError(null);
    }
  };

  const handleTint = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await axios.post("http://localhost:5000/tint", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setTintedImage(response.data.processedImageUrl);
    } catch (error) {
      console.error("Error tinting image", error);
      setError("Failed to apply tint effect");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      setError("Failed to download image");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow mt-16 bg-gray-100 px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h1 className="text-3xl font-bold text-[#1A3CFF] mb-6 text-center">
              Tint Effect
            </h1>
            <div className="space-y-4">
              <div>
                <label htmlFor="image" className="block text-gray-700 mb-2">
                  Select Image
                </label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-2 border-2 border-dashed border-[#66D4FF] rounded-md text-gray-700"
                />
              </div>

              <button
                onClick={handleTint}
                className="w-full bg-[#1A3CFF] text-white py-2 px-4 rounded-md hover:bg-[#66D4FF] transition-colors disabled:opacity-50"
                disabled={!image || loading}
              >
                {loading ? "Processing..." : "Apply Tint"}
              </button>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {preview && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Original Image</h2>
                    <Image
                      src={preview}
                      alt="Preview"
                      width={300}
                      height={300}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                  </div>
                )}
                {tintedImage && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 mb-2">Tinted Image</h2>
                    <Image
                      src={tintedImage}
                      alt="Tinted"
                      width={300}
                      height={300}
                      className="w-full h-auto object-contain rounded-lg"
                    />
                    <button
                      onClick={() => handleDownload(tintedImage, "tinted-image.png")}
                      className="mt-4 w-full px-4 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors"
                    >
                      Download Tinted Image
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="mt-4 text-red-500 text-center">
                  Error: {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}