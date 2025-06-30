import React from "react";
import { Link, useLocation } from "react-router-dom";
import { twMerge } from "tailwind-merge";

const navLinks = [
  { to: "/", label: "Swap" },
  { to: "/add-liquidity", label: "Add Liquidity" },

  { to: "/transfer", label: "Transfer" },
  { to: "/lp-token", label: "LP Token" },
];

function NavBar({ children }) {
  const location = useLocation();
  return (
    <nav className="w-full border-b border-[#4d194d] bg-[#001d3d]">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Brand */}
        <span className="text-xl font-bold" style={{ color: "#ffc300" }}>
          YniSwap
        </span>
        {/* Navigation Links */}
        <div className="flex space-x-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={twMerge(
                "px-3 py-2 rounded transition-colors text-sm font-medium",
                location.pathname === link.to
                  ? "bg-[#001d3d] text-[#ffc300]"
                  : "text-white hover:bg-[#4d194d] hover:text-[#ffc300]"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
        {/* Connect Button Slot */}
        <div>{children}</div>
      </div>
    </nav>
  );
}

export default NavBar;
