import Link from "next/link";
import { LogoWithText } from "@/components/logo";
import { CurrentYear } from "@/components/current-year";

export function Footer() {
  return (
    <footer className="border-t border-[#2E2E4A] px-6 pb-8 pt-16">
      <div className="mx-auto max-w-[1200px]">
        <div className="mb-10 flex flex-col justify-between gap-10 md:flex-row">
          {/* Brand */}
          <div className="max-w-[300px]">
            <Link href="/" className="mb-4 inline-block">
              <LogoWithText iconSize={26} />
            </Link>
            <p className="text-sm leading-relaxed text-[#8585A3]">
              Geen overbodige stappen. Alleen processen die werken.
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-16">
            <div>
              <h4 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-white">
                Pagina&apos;s
              </h4>
              <ul className="flex flex-col gap-2">
                {[
                  { href: "/", label: "Home" },
                  { href: "/diensten", label: "Diensten" },
                  { href: "/configurator", label: "Doe de zelfscan" },
                  { href: "/cases", label: "Cases" },
                  { href: "/kennisbank", label: "Kennisbank" },
                  { href: "/over", label: "Over mij" },
                  { href: "/faq", label: "FAQ" },
                  { href: "/contact", label: "Contact" },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm text-[#8585A3] transition-colors hover:text-[#4F8EF7]"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-[family-name:var(--font-heading)] text-sm font-semibold uppercase tracking-wider text-white">
                Contact
              </h4>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="mailto:wessel@loopless.nl"
                    className="text-sm text-[#8585A3] transition-colors hover:text-[#4F8EF7]"
                  >
                    wessel@loopless.nl
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.linkedin.com/in/wessel-broeders-250767221/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#8585A3] transition-colors hover:text-[#4F8EF7]"
                  >
                    LinkedIn
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-[#2E2E4A] pt-6">
          <p className="text-center text-xs text-[#8585A3]">
            &copy; <CurrentYear /> Loopless — Broeders Digital | KVK: 42004729 |{" "}
            <Link href="/privacy" className="transition-colors hover:text-[#4F8EF7]">
              Privacy
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
