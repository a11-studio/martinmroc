"use client";

const SPECIALTIES = [
  "Brand Identity",
  "Product Design",
  "Motion & Animation",
  "Design Systems",
  "Web3 Interfaces",
];

const CONTACT_LINKS = [
  { label: "Email", href: "mailto:hello@example.com", icon: "✉" },
  { label: "Twitter / X", href: "https://twitter.com", icon: "𝕏" },
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "Read.cv", href: "https://read.cv", icon: "cv" },
];

export default function AboutWindow() {
  return (
    <div className="flex flex-col h-full overflow-y-auto px-7 py-6 gap-6">
      {/* Bio header */}
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[18px] font-semibold shrink-0"
            aria-hidden="true"
          >
            M
          </div>
          <div>
            <h2 className="text-[16px] font-semibold text-[#1c1c1e] leading-tight">
              Martin
            </h2>
            <p className="text-[13px] text-[#3c3c43]/60 leading-tight">
              Designer · Based in London
            </p>
          </div>
        </div>

        <p className="text-[14px] text-[#3c3c43]/80 leading-relaxed">
          I design brands, products, and systems that feel considered and
          intentional. Currently building things I care about, working with
          teams I respect.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Specialties */}
      <div>
        <h3 className="text-[11px] font-semibold text-[#3c3c43]/40 uppercase tracking-wider mb-3">
          Specialties
        </h3>
        <div className="flex flex-col gap-[6px]">
          {SPECIALTIES.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className="w-[5px] h-[5px] rounded-full bg-[#1c1c1e]/20 shrink-0"
                aria-hidden="true"
              />
              <span className="text-[13px] text-[#1c1c1e]/80">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Design philosophy */}
      <div>
        <h3 className="text-[11px] font-semibold text-[#3c3c43]/40 uppercase tracking-wider mb-3">
          Approach
        </h3>
        <p className="text-[13px] text-[#3c3c43]/70 leading-relaxed">
          Good design is invisible. It removes friction, creates trust, and
          communicates without explanation. I start with the feeling, then work
          backwards to the pixels.
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-100" />

      {/* Contact */}
      <div>
        <h3 className="text-[11px] font-semibold text-[#3c3c43]/40 uppercase tracking-wider mb-3">
          Contact
        </h3>
        <div className="flex flex-col gap-[6px]">
          {CONTACT_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-[13px] text-[#1c1c1e] hover:text-blue-600 transition-colors duration-150 focus-visible:outline-none focus-visible:text-blue-600 group"
            >
              <span
                className="w-7 h-7 rounded-[7px] bg-gray-100 flex items-center justify-center text-[11px] font-medium shrink-0 group-hover:bg-blue-50 transition-colors duration-150"
                aria-hidden="true"
              >
                {link.icon}
              </span>
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
