import React from 'react';
import type { Project } from '../types/index.js';
import { FileCode, Download, ArrowRight, Layers } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  onSelect: (project: Project) => void;
  isAdmin?: boolean;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onSelect, isAdmin }) => {
  const fileCount = project.files?.length || 0;

  return (
    <div className="group bg-slate-900/90 border border-slate-800 hover:border-cyan-500/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col justify-between">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={project.thumbnailUrl}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // Styled CSS/SVG fallback container if image fails to load
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-sm border border-slate-700/80 rounded px-2 py-0.5 text-[11px] font-mono text-cyan-400">
          {project.version}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & File count metadata (Unboxed text with separators per Zero-Pill rule) */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
            <span className="text-cyan-400 font-medium">{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{fileCount} {fileCount === 1 ? 'file' : 'files'} available</span>
            {!project.isPublished && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-medium">Unpublished</span>
              </>
            )}
          </div>

          <h3 className="text-base font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2 mb-2">
            {project.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {project.description}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
            <FileCode className="w-3.5 h-3.5 text-slate-500" />
            <span>{project.files?.[0]?.fileType || 'ARCHIVE'}</span>
          </div>

          <button
            onClick={() => onSelect(project)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-cyan-600 rounded-lg transition-colors"
          >
            <span>{isAdmin ? 'Manage Files' : 'Access Project'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
