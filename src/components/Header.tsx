import React from 'react';
import Link from 'next/link';
// import Image from 'next/image';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="bg-white shadow-md fixed w-full top-0 z-50">
      <nav className="container mx-auto px-4 py-2 flex items-center justify-between sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-10 lg:py-5">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/">
            {/* <Image src="/logo.svg" alt="Logo" width={50} height={50} /> */}
            <h1 className='text-blue-900 font-bold text-3xl'>BASED GENE</h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4 sm:space-x-6 md:space-x-8 lg:space-x-10">
          <Link href="/color-effects" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
            Color Effects
          </Link>
          <Link href="/bg-fill" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
            BG Refill
          </Link>
          <Link href="/text-effects" className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
            Text Effects
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMenu}
            className="flex items-center px-3 py-2 border rounded text-gray-600 border-gray-600 hover:text-gray-900 hover:border-gray-900 focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <title>Close</title>
                <path d="M10 8.586L2.929 1.515 1.515 2.929 8.586 10l-7.071 7.071 1.414 1.414L10 11.414l7.071 7.071 1.414-1.414L11.414 10l7.071-7.071-1.414-1.414L10 8.586z" />
              </svg>
            ) : (
              <svg className="fill-current h-4 w-4" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <title>Menu</title>
                <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="bg-white shadow-md px-4 py-2">
          <Link
            href="/color-effects"
            className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Color Effects
          </Link>
          <Link
            href="/bg-refill"
            className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            BG Refill
          </Link>
          <Link
            href="/text-effects"
            className="block px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(false)}
          >
            Text Effects
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;