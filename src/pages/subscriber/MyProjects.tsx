import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api.js';
import type { Project, ProjectCategory } from '../../types/index.js';
import { ProjectCard } from '../../components/ProjectCard.js';
import { FolderCheck, Search } from 'lucide-react';

interface MyProjectsProps {
  onSelectProject: (project: Project) => void;
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

export const MyProjects: React.FC<MyProjectsProps> = ({ onSelectProject }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    api.getSubscriberProjects()
      .then((res) => setProjects(res.projects))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase());

      const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [projects, search, selectedCategory]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <FolderCheck className="w-5 h-5 text-cyan-400" />
          My Assigned Project Archives
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Engineering files, firmware codes, and PCB packages authorized for your subscriber account.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assigned projects..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors font-medium ${
              selectedCategory === 'ALL'
                ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            All Projects ({projects.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = projects.filter((p) => p.category === cat).length;
            if (count === 0) return null;
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

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-900 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center space-y-3 bg-slate-900/60 border border-slate-800 rounded-xl">
          <FolderCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No projects found</h3>
          <p className="text-xs text-slate-500">
            {search ? 'No projects match your search.' : 'You have no assigned projects yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((proj) => (
            <ProjectCard
              key={proj.id}
              project={proj}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      )}
    </div>
  );
};
