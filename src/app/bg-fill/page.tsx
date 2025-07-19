"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import Image from "next/image";
import Header from "@/components/Header";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [tintedImage, setTintedImage] = useState<string | null>(null);
  const [projectType, setProjectType] = useState<string>("morph");
  const [backgroundChoice, setBackgroundChoice] = useState<string>("background1.png");
  const [backgrounds, setBackgrounds] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const projectTypes = ["morph"];

  // Fetch available backgrounds for the selected project type
  useEffect(() => {
    async function fetchBackgrounds() {
      try {
        console.log(`Fetching backgrounds from: /api/background-count?projectType=${projectType}`);
        const response = await fetch(`/api/background-count?projectType=${projectType}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch backgrounds: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        console.log("Backgrounds received:", data);
        setBackgrounds(data.backgrounds || []);
        if (data.backgrounds && data.backgrounds.length > 0) {
          setBackgroundChoice(data.backgrounds[0]);
        } else {
          setBackgroundChoice("");
        }
      } catch (err) {
        const errorMessage = (err as Error).message || "Could not fetch backgrounds";
        console.error("Fetch error:", err);
        setError(errorMessage);
        setBackgrounds([]);
        setBackgroundChoice("");
      }
    }
    fetchBackgrounds();
  }, [projectType]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setSelectedImage(URL.createObjectURL(file));
      setProcessedImage(null);
      setTintedImage(null);
      setError(null);
    }
  };

  const handleProjectTypeChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setProjectType(e.target.value);
  };

  const handleBackgroundChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setBackgroundChoice(e.target.value);
  };

  const handleBackgroundUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please select an image first");
      return;
    }

    setLoading(true);
    setError(null);
    setProcessedImage(null);
    setTintedImage(null);

    const formData = new FormData();
    formData.append("image", selectedFile);
    formData.append("projectType", projectType);
    formData.append("backgroundChoice", backgroundChoice);

    try {
      console.log(`Sending to /api/upload`);
      const response = await fetch(`/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `Failed to process image: ${response.status}`);
      }

      const data = await response.json();
      if (data.processedImageUrl) {
        setProcessedImage(data.processedImageUrl);
      } else {
        throw new Error("No processed image URL returned");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "Failed to apply background";
      console.error("Background update error:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleTint = async () => {
    if (!processedImage) {
      setError("Please update the background first.");
      return;
    }

    setLoading(true);
    setError(null);
    setTintedImage(null);

    try {
      // Convert base64 processedImage to Blob
      const response = await fetch(processedImage);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("image", blob, "processed-image.png");

      console.log(`Sending to /api/tint`);
      const tintResponse = await fetch(`/api/tint`, {
        method: "POST",
        body: formData,
      });

      if (!tintResponse.ok) {
        const errorData = await tintResponse.json();
        throw new Error(errorData.details || errorData.error || `Failed to tint image: ${tintResponse.status}`);
      }

      const data = await tintResponse.json();
      if (data.processedImageUrl) {
        setTintedImage(data.processedImageUrl);
      } else {
        throw new Error("No tinted image URL returned");
      }
    } catch (err) {
      const errorMessage = (err as Error).message || "Error occurred while trying to apply tint";
      console.error("Tint error:", err);
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
                Background Updater
              </h1>
              <form onSubmit={handleBackgroundUpdate} className="space-y-4">
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
                  <label htmlFor="projectType" className="block mb-2 text-white">
                    Select Project Type
                  </label>
                  <select
                    id="projectType"
                    value={projectType}
                    onChange={handleProjectTypeChange}
                    className="w-full p-2 border border-green-300 rounded-md text-gray-700 bg-white"
                  >
                    {projectTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="backgroundChoice" className="block mb-2 text-white">
                    Select Background ({backgrounds.length} available)
                  </label>
                  <select
                    id="backgroundChoice"
                    value={backgroundChoice}
                    onChange={handleBackgroundChange}
                    className="w-full p-2 border border-green-300 rounded-md text-gray-700 bg-white"
                    disabled={backgrounds.length === 0}
                  >
                    {backgrounds.length > 0 ? (
                      backgrounds.map((bg) => (
                        <option key={bg} value={bg}>
                          {bg}
                        </option>
                      ))
                    ) : (
                      <option value="">No backgrounds available</option>
                    )}
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || backgrounds.length === 0 || !selectedImage}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-300 transition-colors disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Update Background"}
                </button>
              </form>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedImage && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Preview</h2>
                    <Image
                      src={selectedImage}
                      alt="Preview"
                      width={500}
                      height={500}
                      className="w-full h-auto rounded-md object-contain bg-white"
                    />
                  </div>
                )}
                {processedImage && (
                  <div>
                    <h2 className="text-lg font-semibold text-white mb-2">Processed Image</h2>
                    <Image
                      src={processedImage}
                      alt="Processed Image"
                      width={500}
                      height={500}
                      className="w-full h-auto rounded-md object-contain bg-white"
                    />
                    <div className="mt-4 space-y-2">
                      <button
                        onClick={() => handleDownload(processedImage, "processed-image.png")}
                        className="w-full px-4 py-2 bg-green-700 text-white font-bold rounded-md hover:bg-green-800 transition-colors"
                      >
                        Download Processed Image
                      </button>
                      {!tintedImage && (
                        <button
                          onClick={handleTint}
                          disabled={loading}
                          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-300 transition-colors disabled:opacity-50"
                        >
                          {loading ? "Processing..." : "Apply Base Tint"}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {tintedImage && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-white mb-2">Tinted Image</h2>
                  <Image
                    src={tintedImage}
                    alt="Tinted Image"
                    width={500}
                    height={500}
                    className="w-full h-auto rounded-md object-contain bg-white"
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
        </main>
      </div>
    </div>
  );
}