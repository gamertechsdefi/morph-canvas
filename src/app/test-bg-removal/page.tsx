"use client";

import { useState, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Header from "@/components/Header";

export default function TestBackgroundRemoval() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<string>("robust");

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setProcessedImage(null);
      setError(null);
    }
  };

  const handleMethodChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value);
  };

  const handleBackgroundRemoval = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setProcessedImage(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("method", method);

    try {
      console.log(`Testing background removal with method: ${method}`);
      const response = await fetch(`/api/test-bg-removal`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `Failed to remove background: ${response.status}`);
      }

      const data = await response.json();
      if (data.processedImageUrl) {
        setProcessedImage(data.processedImageUrl);
      } else {
        throw new Error("No processed image URL returned");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to remove background";
      console.error("Background removal error:", err);
      setError(errorMessage);
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
    } catch (err) {
      console.error("Download error:", err);
      setError("Failed to download image");
    }
  };

  return (
    <div>
      <Header />
      <div className="flex flex-col min-h-screen">
        <main className="flex-grow mt-16 px-4 py-8 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md">
              <h1 className="text-3xl font-bold text-green-500 mb-6 text-center">
                AI Background Removal Test
              </h1>
              <p className="text-gray-300 mb-6 text-center">
                Test our AI-powered background removal - much simpler than complex math!
              </p>
              
              <form onSubmit={handleBackgroundRemoval} className="space-y-4">
                <div>
                  <label htmlFor="image" className="block mb-2 text-white">
                    Select Image
                  </label>
                  <input
                    type="file"
                    name="image"
                    id="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    required
                    className="w-full p-2 border-2 border-dashed border-green-300 rounded-md text-gray-700 bg-white"
                  />
                </div>

                <div>
                  <label htmlFor="method" className="block mb-2 text-white">
                    Background Removal Method
                  </label>
                  <select
                    id="method"
                    value={method}
                    onChange={handleMethodChange}
                    className="w-full p-2 border border-green-300 rounded-md text-gray-700 bg-white"
                  >
                    <option value="robust">Robust (AI + Fallback)</option>
                    <option value="ai">AI (Best Quality)</option>
                    <option value="simple">Simple (Color-based)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedImage}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-300 transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Remove Background"}
                </button>
              </form>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedImage && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Original Image</h2>
                    <Image
                      src={selectedImage}
                      alt="Original"
                      width={400}
                      height={400}
                      className="w-full h-auto rounded-md object-contain bg-white"
                    />
                  </div>
                )}
                {processedImage && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Background Removed</h2>
                    <Image
                      src={processedImage}
                      alt="Processed"
                      width={400}
                      height={400}
                      className="w-full h-auto rounded-md object-contain bg-white"
                    />
                    <button
                      onClick={() => handleDownload(processedImage, "background-removed.png")}
                      className="mt-4 w-full px-4 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors"
                    >
                      Download Processed Image
                    </button>
                  </div>
                )}
              </div>
            </div>

            {error && (
              <div className="mt-4 text-red-500 text-center">
                Error: {error}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
} 