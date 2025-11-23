import React from 'react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="bg-gray-800 text-white shadow-lg">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center p-4 space-y-3 md:space-y-0">
        <Link to="/" className="text-xl font-bold tracking-wider text-blue-400 hover:text-blue-300 transition duration-300">
          VMS | Warranty Management
        </Link>
        
        <nav>
          <ul className="flex space-x-6 text-sm">
            <li>
              <Link to="/" className="hover:text-blue-400 transition duration-300">
                Đăng ký Xe
              </Link>
            </li>
            <li>
              <Link to="/vehicles" className="hover:text-blue-400 transition duration-300">
                Danh sách Xe
              </Link>
            </li>
            <li>
              <Link to="/customers" className="hover:text-blue-400 transition duration-300">
                Danh sách KH
              </Link>
            </li>
            <li>
              <a 
                href="http://localhost:8000/swagger/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-400 hover:text-white transition duration-300"
              >
                [API Docs]
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;