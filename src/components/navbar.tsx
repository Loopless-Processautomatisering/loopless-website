"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoWithText } from "@/components/logo";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/diensten", label: "Diensten" },
  { href: "/configurator", label: "Doe de zelfscan" },
  { href: "/over", label: "Over mij" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [mobileOpen]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-white/85 backdrop-blur-xl shadow-[0_1px_0_#DCE6F5]"
            : "bg-transparent"
        )}
      >
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
          {/* Logo with icon */}
          <Link href="/" className="z-50">
            <LogoWithText iconSize={30} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "text-[#10182B] after:absolute after:-bottom-1.5 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-[#4F8EF7]"
                    : "text-[#5F6B85] hover:text-[#10182B]"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="rounded-full bg-[#4F8EF7] px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3A75D8]"
            >
              Plan een gesprek
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="z-50 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6 text-[#10182B]" />
            ) : (
              <Menu className="h-6 w-6 text-[#10182B]" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile fullscreen nav — outside header to avoid backdrop-blur containing block */}
      <nav
        className={cn(
          "fixed inset-0 z-[45] flex flex-col items-center justify-center gap-6 bg-[#FFFFFF] transition-all duration-300 md:hidden",
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={closeMobile}
            className={cn(
              "text-lg font-medium transition-colors",
              pathname === item.href
                ? "text-[#10182B]"
                : "text-[#5F6B85] hover:text-[#10182B]"
            )}
          >
            {item.label}
          </Link>
        ))}
        <Link
          href="/contact"
          onClick={closeMobile}
          className="mt-4 inline-block rounded-full bg-[#4F8EF7] px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-[#3A75D8]"
        >
          Plan een gesprek
        </Link>
      </nav>
    </>
  );
}
