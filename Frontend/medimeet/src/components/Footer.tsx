import { Link } from "react-router-dom";
import logo from "../assets/Group 4134.png";

export default function Footer() {
  return (
    <footer className="py-8 bg-white ">
      <div className="container w-full max-w-screen-xl gap-4 mx-auto md:px-20">
        <div className="flex flex-col grid-row md:flex-row md:items-start md:justify-between ">
          {/* Logo and description */}
          <div className="max-w-md ">
            <Link to="/" className="flex flex-row mb-4">
              <img
                className="h-10 w-9"
                alt="Logo prescripto"
                src={logo}
              />
              <h1 className="mt-1 ml-1 font-sans text-2xl font-bold text-gray-800">MediMeet</h1>

            </Link>
            <p className="text-sm leading-relaxed text-gray-600">
              Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="mb-4 text-base font-medium text-gray-800">COMPANY</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-[#5f6fff] text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-[#5f6fff] text-sm">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-[#5f6fff] text-sm">
                  Contact us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-[#5f6fff] text-sm">
                  Privacy policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="mb-4 text-base font-medium text-gray-800">GET IN TOUCH</h3>
            <ul className="space-y-2">
              <li className="text-sm text-gray-600">+1-212-456-7890</li>
              <li className="text-sm text-gray-600">greatstackdev@gmail.com</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="w-full pt-6 mt-8 text-center border-t border-gray-300">
          <p className="text-sm text-gray-600">
            Copyright © 2024 GreatStack - All Right Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
