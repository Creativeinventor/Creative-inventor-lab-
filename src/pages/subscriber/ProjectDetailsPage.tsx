import React, { useState } from 'react';
import type { Project, ProjectFile } from '../../types/index.js';
import { api } from '../../services/api.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import {
  ArrowLeft,
  FileCode,
  Download,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';

interface ProjectDetailsPageProps {
  project: Project;
  onBack: () => void;
}

export const ProjectDetailsPage: React.FC<ProjectDetailsPageProps> = ({ project, onBack }) => {
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const handleDownload = async (file: ProjectFile) => {
    setDownloadingFileId(file.id);
    setDownloadSuccess(null);
    setDownloadError(null);

    try {
      const res = await api.createDownload(project.id, file.id);

      // Trigger file download in browser
      const link = document.createElement('a');
      link.href = res.downloadUrl;
      link.download = res.fileName || file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(`Authorized download started: ${file.fileName}`);
    } catch (err: any) {
      setDownloadError(err.message || 'Download authorization failed. Verify your subscription.');
    } finally {
      setDownloadingFileId(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Projects</span>
      </button>

      {/* Notifications */}
      {downloadSuccess && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadSuccess}</span>
          </div>
          <button onClick={() => setDownloadSuccess(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {downloadError && (
        <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-xl text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{downloadError}</span>
          </div>
          <button onClick={() => setDownloadError(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Cover Thumbnail */}
        <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
          <img
            src={project.thumbnailUrl}
            alt={project.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-4 right-4 bg-slate-950/90 border border-slate-700 backdrop-blur-sm rounded-lg px-3 py-1 font-mono text-xs font-semibold text-cyan-400">
            {project.version}
          </div>
        </div>

        {/* Header & Details */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            {/* Unboxed Metadata per Zero-Pill Constitution */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
              <span className="text-cyan-400 font-semibold">{project.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{project.version}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {formatToKolkata(project.updatedAt, false)}</span>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-white mb-3">
              {project.title}
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              {project.description}
            </p>
          </div>

          {/* Build & Setup Instructions */}
          {project.instructions && (
            <div className="p-5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Build & Assembly Guidelines
              </h3>
              <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {project.instructions}
              </pre>
            </div>
          )}

          {/* Downloadable Files Package */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
              <span>Included Project Files ({project.files?.length || 0})</span>
              <span className="text-[11px] font-normal text-slate-500 font-mono flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Server-Authorized Downloads Only
              </span>
            </h3>

            <div className="space-y-2.5">
              {project.files?.map((file) => {
                const isDownloading = downloadingFileId === file.id;
                return (
                  <div
                    key={file.id}
                    className="p-4 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shrink-0">
                        <FileCode className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-mono text-sm text-white font-semibold">{file.fileName}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {(file.fileSizeBytes / 1024).toFixed(1)} KB · Format: {file.fileType}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDownload(file)}
                      disabled={isDownloading}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap self-stretch sm:self-auto"
                    >
                      <Download className="w-4 h-4" />
                      <span>{isDownloading ? 'Authorizing...' : 'Download File'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
