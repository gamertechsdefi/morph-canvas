"use client";
import Image from "next/image";
import Link from "next/link"; // For navigation to the tool page

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <main className="flex-grow p-4 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            {/* Left: Text Content */}
            <div className="md:w-1/2 text-center md:text-left">
              <h1 className="text-4xl md:text-5xl font-bold text-green-600 mb-4">
                Get morphed
              </h1>
              <p className="text-lg md:text-xl text-gray-300 mb-6">
                Generate stunning color effects and custom backgrounds for your pfps in one click.
              </p>
              <Link href="/bg-fill">
                <button className="bg-green-600 text-white font-semibold py-3 px-6 rounded-md hover:bg-green-700 transition-colors">
                  Try the Background Updater Now
                </button>
              </Link>
            </div>
            {/* Right: Hero Image */}
            <div className="md:w-1/2">
              <Image
                src="/images/example.png" // Placeholder: replace with an actual image
                alt="Example of a processed image with custom background"
                width={400}
                height={400}
                className="w-full h-auto rounded-lg shadow-md object-contain"
              />
            </div>
          </div>
        </div>
      </main>
    
      {/* Footer */}
      <footer className="bg-neutral-900 py-6 text-center text-gray-500">
        <p>Built with ❤️ for Morphers </p>
        <p className="mt-2">
          <Link href="/bg-tools" className="text-green-300 hover:underline">
            Get Started
          </Link>
          {" | "}
          <a href="https://github.com/your-repo" className="text-green-300 hover:underline">
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}