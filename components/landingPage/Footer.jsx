import React from "react";

export default function Footer() {
  const footerLinks = [
    { name: "About", href: "#about" },
    { name: "Sectors", href: "#sectors" },
    { name: "Rules", href: "#rules" },
    { name: "Timeline", href: "#timeline" },
    { name: "FAQs", href: "#faqs" },
  ];

  return (
    <footer className="w-full bg-maroon-base border-t border-border-brown/50 py-12 px-5 sm:px-8 lg:px-12 text-cream-muted/80 text-xs transition-colors">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left branding */}
        <div className="flex items-center gap-2.5">
          <span className="font-serif text-sm text-cream-light font-normal">
            Investor Forum
          </span>
          <span className="text-cream-muted/40">|</span>
          <span className="font-mono text-[11px] text-cream-muted/70">
            Intra-School Edition 2026
          </span>
        </div>

        {/* Center Links */}
        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-sans text-xs">
          {footerLinks.map((link, idx) => (
            <React.Fragment key={link.name}>
              <a href={link.href} className="hover:text-cream-light transition-colors">
                {link.name}
              </a>
              {idx < footerLinks.length - 1 && (
                <span className="text-border-brown">·</span>
              )}
            </React.Fragment>
          ))}
        </nav>

        {/* Right Institutional Support Note */}
        <div className="flex flex-col sm:flex-row items-center gap-1.5 text-center md:text-right font-sans">
          <span className="text-cream-light font-medium">School Tech &amp; Planning Society</span>
          <span className="hidden sm:inline text-cream-muted/40">—</span>
          <span className="text-cream-muted/60">
            Need assistance? Visit the Admin Command Table at the venue.
          </span>
        </div>
      </div>
    </footer>
  );
}
