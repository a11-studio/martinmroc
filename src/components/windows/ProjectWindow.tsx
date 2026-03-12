"use client";

import { PROJECTS } from "@/data/projects";
import { PROJECT_IMAGES } from "@/data/assets";

interface ProjectWindowProps {
  projectId?: string;
}

const TAG_COLORS: Record<string, string> = {
  Branding: "bg-blue-50 text-blue-700",
  Identity: "bg-indigo-50 text-indigo-700",
  Typography: "bg-violet-50 text-violet-700",
  Product: "bg-green-50 text-green-700",
  Interface: "bg-teal-50 text-teal-700",
  "Design System": "bg-cyan-50 text-cyan-700",
  Web3: "bg-orange-50 text-orange-700",
  "Developer Tools": "bg-amber-50 text-amber-700",
  Motion: "bg-pink-50 text-pink-700",
  "Art Direction": "bg-rose-50 text-rose-700",
};

export default function ProjectWindow({ projectId }: ProjectWindowProps) {
  const project = projectId ? PROJECTS[projectId] : null;
  const imageSrc =
    projectId && PROJECT_IMAGES[projectId as keyof typeof PROJECT_IMAGES]
      ? PROJECT_IMAGES[projectId as keyof typeof PROJECT_IMAGES]
      : project?.imageSrc;

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Project not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Full-bleed image */}
      <div className="relative flex-shrink-0 h-[54%] bg-gray-100 overflow-hidden">
        <img
          src={imageSrc}
          alt={project.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Subtle bottom gradient overlay */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent" />
      </div>

      {/* Metadata */}
      <div className="flex-1 flex flex-col gap-4 px-6 py-5 overflow-y-auto">
        <div>
          <h2 className="text-[20px] font-semibold text-[#1c1c1e] tracking-tight leading-tight">
            {project.title}
          </h2>

          {/* Tags */}
          <div className="flex flex-wrap gap-[6px] mt-3">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className={`inline-flex items-center px-[10px] py-[3px] rounded-full text-[11px] font-medium ${TAG_COLORS[tag] ?? "bg-gray-100 text-gray-600"}`}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-[14px] text-[#3c3c43]/80 leading-relaxed">
          {project.description}
        </p>

        {/* CTA */}
        {project.ctaLabel && (
          <div className="mt-auto pt-2">
            <a
              href={project.ctaHref ?? "#"}
              className="inline-flex items-center gap-2 px-5 py-[9px] rounded-[9px] bg-[#1c1c1e] text-white text-[13px] font-medium hover:bg-[#3c3c43] transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#1c1c1e] focus-visible:ring-offset-2 outline-none"
            >
              {project.ctaLabel}
              <span aria-hidden="true">→</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
