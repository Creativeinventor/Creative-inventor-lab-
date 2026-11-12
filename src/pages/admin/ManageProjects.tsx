import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api.js';
import type { Project, ProjectCategory } from '../../types/index.js';
import { ProjectCard } from '../../components/ProjectCard.js';
import { Modal } from '../../components/Modal.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import {
  FolderGit2,
  UploadCloud,
  Search,
  Filter,
  FileCode,
  Users,
  Eye,
  Trash2,
  CheckCircle2,
  Download,
} from 'lucide-react';

interface ManageProjectsProps {
  onNavigate: (path: string) => void;
}

const CATEGORIES: ProjectCategory[] = [
  'Arduino Projects',
  'ESP8266 Projects',
  'ESP32 Projects',
  'Raspberry Pi Pico',
  'Electronics Projects',
  'DIY Projects',
  'PCB Projects',
  'Other Projects',
];

export const ManageProjects: React.FC<ManageProjectsProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Selected project modal
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminProjects();
      setProjects(res.projects);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [projects, searchQuery, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-cyan-400" />
            Project Archive Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your hardware source codes, PCB Gerbers, 3D STLs, and circuit diagrams.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/admin/upload-project')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <UploadCloud className="w-4 h-4" />
          <span>Upload New Project</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="space-y-3 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by name, code, or hardware..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Categories Segmented Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Categories ({projects.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
                  selectedCategory === cat
                    ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <FolderGit2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No projects matching your search term.'
              : 'Upload your first project package to make it available to your subscribers.'}
          </p>
          <button
            onClick={() => onNavigate('/admin/upload-project')}
            className="mt-2 px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
          >
            Upload Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              isAdmin={true}
              onSelect={(p) => setViewingProject(p)}
            />
          ))}
        </div>
      )}

      {/* Project Details / Files Modal */}
      <Modal
        isOpen={Boolean(viewingProject)}
        onClose={() => setViewingProject(null)}
        title={viewingProject?.title || 'Project Archive'}
        maxWidth="max-w-2xl"
      >
        {viewingProject && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-semibold">{viewingProject.category}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{viewingProject.version}</span>
              <span aria-hidden="true">·</span>
              <span>Updated {formatToKolkata(viewingProject.updatedAt, false)}</span>
            </div>

            <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800">
              <img
                src={viewingProject.thumbnailUrl}
                alt={viewingProject.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Project Description
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {viewingProject.description}
              </p>
            </div>

            {viewingProject.instructions && (
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                <h4 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                  Build & Flashing Instructions
                </h4>
                <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {viewingProject.instructions}
                </pre>
              </div>
            )}

            <div>
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                Included Download Files ({viewingProject.files?.length || 0})
              </h4>
              <div className="space-y-2">
                {viewingProject.files?.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <FileCode className="w-4 h-4 text-cyan-400" />
                      <div>
                        <div className="font-mono text-white font-medium">{f.fileName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {(f.fileSizeBytes / 1024).toFixed(1)} KB · {f.fileType} · {f.downloadCount || 0} downloads
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={async () => {
                        try {
                          const res = await api.createDownload(viewingProject.id, f.id);
                          window.open(res.downloadUrl, '_blank');
                        } catch (e: any) {
                          alert(e.message);
                        }
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-cyan-600 text-white rounded text-xs transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-between items-center">
              <button
                onClick={() => {
                  onNavigate('/admin/assign-projects');
                  setViewingProject(null);
                }}
                className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                <Users className="w-4 h-4" />
                <span>Assign this project to subscribers &rarr;</span>
              </button>

              <button
                onClick={() => setViewingProject(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
