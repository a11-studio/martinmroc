"use client";

import type { ReactNode } from "react";
import { MAILTO_COLLABORATION_HREF } from "@/lib/mailto";

const SPECIALTIES = [
  "Product & interface (UI) design",
  "UX — flows, research, wireframes",
  "Motion & animation (After Effects)",
  "Web3 & complex dashboards",
  "Design systems & craft-heavy handoff",
  "Front-end–aware collaboration",
];

/** From Behance profile — awards / features */
const BEHANCE_AWARDS = [
  "Honorable Mention — Awwwards",
  "Site of the day — Lapa.ninja",
  "Website of the day — Land-Book.com",
  "Design of the week — InVision",
  "Interactions of the week — Muzli (#186)",
  "Interactions of the week — Muzli (#215)",
] as const;

const BEHANCE_HREF = "https://www.behance.net/martinclear";

const CONTACT_LINKS = [
  { label: "Email", href: MAILTO_COLLABORATION_HREF, icon: "✉" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/martin-mroc/",
    icon: "in",
  },
  {
    label: "Behance",
    href: BEHANCE_HREF,
    icon: "Be",
  },
  {
    label: "Dribbble",
    href: "https://dribbble.com/martinmroc",
    icon: "Db",
  },
] as const;

/** Notes-style section: label + children with consistent rhythm */
function NoteSection({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <section className="pt-8 first:pt-0" aria-labelledby={id}>
      <h2
        id={id}
        className="text-[12px] font-medium text-[#3c3c43]/48 mb-4 tracking-wide"
      >
        {label}
      </h2>
      {children}
    </section>
  );
}

export default function AboutWindow() {
  return (
    <div className="h-full overflow-y-auto scroll-smooth">
      <article className="max-w-[min(100%,28rem)] pl-7 pr-8 py-8 pb-12 text-left">
        {/* Note header — title + meta like Apple Notes */}
        <header className="mb-10">
          <p className="text-[12px] text-[#3c3c43]/42 mb-2 font-medium tabular-nums">
            About
          </p>
          <div className="flex items-start gap-1 min-h-[1.35em]">
            <h1 className="text-[22px] font-semibold text-[#1c1c1e] leading-snug tracking-tight">
              Things I&apos;d actually say out loud
            </h1>
            {/* Minimal caret hint — static, low contrast */}
            <span
              className="mt-1 inline-block w-px h-[1.1em] shrink-0 bg-[#1c1c1e]/22"
              aria-hidden="true"
            />
          </div>
          <p className="text-[12px] text-[#3c3c43]/45 mt-3 leading-relaxed">
            Bratislava, Slovakia · UX/UI · updated when the bio felt honest enough
          </p>
        </header>

        {/* Who — compact identity, not hero */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[16px] font-semibold shrink-0"
            aria-hidden="true"
          >
            M
          </div>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-[#1c1c1e] leading-tight">
              Martin Mroč
            </p>
            <p className="text-[12px] text-[#3c3c43]/55 leading-snug mt-0.5">
              Design lead · UX/UI · Bratislava, Slovakia
            </p>
          </div>
        </div>

        <div className="space-y-6 text-[15px] text-[#3c3c43]/88 leading-[1.7]">
          <p>
            I&apos;m a UX/UI designer based in Bratislava. For years I&apos;ve lived
            in the overlap of product UI, motion, and web3 — including work with{" "}
            <span className="text-[#1c1c1e]/90">Thirdweb studio</span> and, most
            recently, helping grow{" "}
            <span className="text-[#1c1c1e]/90">A11.studio</span> (World App, dense
            dashboards, the kind of interfaces that have to earn trust fast).
          </p>
          <p>
            Before the studio chapter I was at PLATFORM, and before that I split
            time as a front-end developer and designer at Everlution — so I care
            about handoff, constraints, and what actually ships.
          </p>
          <p>
            I recently stepped back from my co-founder role at A11 after about six
            years. Right now I&apos;m listening for what&apos;s next — freelance,
            contract, or the right full-time team.
          </p>
          <p className="text-[#1c1c1e]/90 font-medium leading-[1.65]">
            If the problem is hard, the product is ambitious, and the craft
            matters — I&apos;ll probably want to talk.
          </p>
        </div>

        <div
          className="my-10 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent"
          aria-hidden="true"
        />

        <NoteSection id="about-specialties" label="What I spend time on">
          <ul className="space-y-3 text-[15px] text-[#3c3c43]/85 leading-[1.65] list-none pl-0">
            {SPECIALTIES.map((s) => (
              <li key={s} className="flex gap-3">
                <span className="text-[#3c3c43]/35 select-none" aria-hidden>
                  —
                </span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </NoteSection>

        <div className="my-10 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

        <NoteSection id="about-approach" label="How I think about it">
          <div className="space-y-5 text-[15px] text-[#3c3c43]/85 leading-[1.7]">
            <p>
              Good design should remove friction before it asks for attention. I
              like work that earns trust quietly — not stuff that shouts.
            </p>
            <p>
              I tend to start from the feeling we want someone to have, then work
              backward to layout, type, motion. Pixels come last, not first.
            </p>
            <p className="text-[#3c3c43]/70 italic leading-[1.65]">
              If I&apos;m explaining it in three paragraphs, we&apos;re not there yet.
            </p>
          </div>
        </NoteSection>

        <div className="my-10 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

        <NoteSection id="about-recognition" label="Recognition & case studies">
          <p className="text-[15px] text-[#3c3c43]/80 leading-[1.7] mb-5">
            Longer projects, motion, and the messy middle live on{" "}
            <a
              href={BEHANCE_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#1c1c1e] underline decoration-[#3c3c43]/25 underline-offset-2 hover:text-blue-600 hover:decoration-blue-600/40 transition-colors"
            >
              Behance
            </a>
            . A few things that still make me quietly proud:
          </p>
          <ul className="space-y-2.5 text-[14px] text-[#3c3c43]/82 leading-[1.6] list-none pl-0 mb-6">
            {BEHANCE_AWARDS.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="text-[#3c3c43]/30 select-none shrink-0" aria-hidden>
                  ★
                </span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <p className="text-[13px] text-[#3c3c43]/58 leading-[1.65]">
            Clients there include Worldcoin, Cardinal, WingRiders, Gopass,
            Kontentino, Fleximodo — among others. Tools I reach for most: After
            Effects, Photoshop (same as on my Behance stack).
          </p>
        </NoteSection>

        <div className="my-10 h-px bg-gradient-to-r from-gray-200 via-gray-100 to-transparent" />

        <NoteSection id="about-contact" label="Say hi">
          <p className="text-[15px] text-[#3c3c43]/75 leading-[1.7] mb-5">
            If any of that resonates, I&apos;d love to hear from you. No form, no
            funnel — just links.
          </p>
          <ul className="flex flex-col gap-1.5 list-none p-0 m-0">
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  target={
                    link.href.startsWith("mailto:") ? undefined : "_blank"
                  }
                  rel={
                    link.href.startsWith("mailto:")
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="inline-flex items-center gap-3 rounded-lg -mx-2 px-2 py-2 text-[14px] text-[#1c1c1e] hover:text-blue-600 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30 focus-visible:ring-offset-1 group w-full max-w-full"
                >
                  <span
                    className="w-7 h-7 rounded-md bg-gray-100/90 flex items-center justify-center text-[11px] font-medium shrink-0 group-hover:bg-blue-50 transition-colors duration-150"
                    aria-hidden="true"
                  >
                    {link.icon}
                  </span>
                  <span className="truncate">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </NoteSection>
      </article>
    </div>
  );
}
