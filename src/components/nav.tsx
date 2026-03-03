"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, BarChart3 } from "lucide-react";

const links = [
  { href: "/research", label: "Research" },
  { href: "/sectors", label: "Sectors" },
  { href: "/compare", label: "Compare" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/personality", label: "Identity" },
];

export function Nav() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3 pointer-events-none">
      <nav
        className={`pointer-events-auto w-full max-w-4xl transition-all duration-300 ${
          scrolled
            ? "rounded-xl bg-surface/95 shadow-lg shadow-black/30 border border-border"
            : "rounded-2xl bg-surface/80 border border-border/60"
        } backdrop-blur-xl`}
      >
        <div className="px-4 h-12 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-green/10 flex items-center justify-center group-hover:bg-green/20 transition-colors">
              <BarChart3 className="w-4 h-4 text-green" />
            </div>
            <span className="text-sm font-semibold tracking-tight font-mono">
              StockPilot
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? "text-text-primary"
                      : "text-text-muted hover:text-text-secondary"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 bg-green/10 border border-green/20 rounded-lg"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              );
            })}

            <Link
              href="/portfolio"
              className={`ml-2 text-xs font-medium px-4 py-1.5 rounded-lg transition-all ${
                pathname === "/portfolio"
                  ? "bg-green text-black"
                  : "bg-green/10 text-green border border-green/20 hover:bg-green/20"
              }`}
            >
              Portfolio
            </Link>
          </div>

          {/* Mobile burger */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-1.5 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-alt transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Mobile dropdown -- inside the pill */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 overflow-hidden"
          >
            <div className="px-3 py-3 flex flex-col gap-1">
              {links.map((link) => {
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-sm px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-green/10 text-text-primary border border-green/20"
                        : "text-text-secondary hover:text-text-primary hover:bg-surface-alt"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/portfolio"
                className="text-sm bg-green/10 text-green border border-green/20 px-3 py-2 rounded-lg font-medium text-center mt-1 hover:bg-green/20 transition-colors"
              >
                Build Portfolio
              </Link>
            </div>
          </motion.div>
        )}
      </nav>
    </div>
  );
}
