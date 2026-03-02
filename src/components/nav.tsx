"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, BarChart3 } from "lucide-react";

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/research", label: "Research" },
    { href: "/sectors", label: "Sectors" },
    { href: "/compare", label: "Compare" },
    { href: "/personality", label: "Personality" },
    { href: "/portfolio", label: "Portfolio" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <BarChart3 className="w-5 h-5 text-green group-hover:text-green-light transition-colors" />
          <span className="text-base font-semibold tracking-tight">
            StockPilot
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/portfolio"
            className="text-sm bg-green text-black px-4 py-1.5 rounded-lg font-medium hover:bg-green-light transition-colors"
          >
            Build Portfolio
          </Link>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-text-secondary"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-md">
          <div className="px-4 py-4 flex flex-col gap-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="text-base text-text-secondary hover:text-text-primary py-2"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
