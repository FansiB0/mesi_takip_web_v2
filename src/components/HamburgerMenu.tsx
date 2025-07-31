import { useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";

export const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Hamburger Butonu */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-700 focus:outline-none"
      >
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>

      {/* Menü İçeriği */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Anasayfa</a></li>
            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Keşfet</a></li>
            <li><a href="#" className="block px-4 py-2 hover:bg-gray-100">Abonelikler</a></li>
          </ul>
        </div>
      )}
    </div>
  );
};