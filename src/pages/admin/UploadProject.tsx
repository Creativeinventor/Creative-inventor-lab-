import React, { useState } from 'react';
import { api } from '../../services/api.js';
import type { ProjectCategory } from '../../types/index.js';
import {
  UploadCloud,
  FileCode,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';

interface UploadProjectProps {
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

const PRESET_THUMBNAILS = [
  { label: 'ESP32 IoT Hub', url: '/src/assets/images/thumb_esp32_iot_1794412649331.jpg' },
  { label: 'Arduino Robotics', url: '/src/assets/images/thumb_arduino_robotics_1794412650289.jpg' },
  { label: 'Custom PCB Board', url: '/src/assets/images/thumb_custom_pcb_1794412649367.jpg' },
  { label: 'High-Tech Workshop Hero', url: '/src/assets/images/hero_creative_inventor_1794412649106.jpg' },
];

export const UploadProject: React.FC<UploadProjectProps> = ({ onNavigate }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Arduino Projects');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [version, setVersion] = useState('v1.0');
  const [thumbnailUrl, setThumbnailUrl] = useState(PRESET_THUMBNAILS[0].url);
  const [isPublished, setIsPublished] = useState(true);
  const [assignToAllActiveUsers, setAssignToAllActiveUsers] = useState(false);

  // Files list
  const [files, setFiles] = useState<
    Array<{ fileName: string; fileSizeBytes: number; fileType: string }>
  >([
    { fileName: 'Project_Firmware.ino', fileSizeBytes: 32000, fileType: 'INO' },
    { fileName: 'Circuit_Schematic.pdf', fileSizeBytes: 1250000, fileType: 'PDF' },
  ]);

  const [newFileName, setNewFileName] = useState('');
  const [newFileType, setNewFileType] = useState('ZIP');
  const [newFileSizeKb, setNewFileSizeKb] = useState(1500);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    setFiles((prev) => [
      ...prev,
      {
        fileName: newFileName.trim(),
        fileType: newFileType.toUpperCase(),
        fileSizeBytes: Math.round(newFileSizeKb * 1024),
      },
    ]);
    setNewFileName('');
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (files.length === 0) {
      setError('Please attach at least one downloadable file to the project package.');
      return;
    }

    setIsLoading(true);
    try {
      await api.createProject({
        title: title.trim(),
        category,
        description: description.trim(),
        instructions: instructions.trim(),
        version: version.trim(),
        thumbnailUrl,
        isPublished,
        files: files.map((f, idx) => ({
          id: `file_${Date.now()}_${idx + 1}`,
          projectId: '',
          fileName: f.fileName,
          fileSizeBytes: f.fileSizeBytes,
          fileType: f.fileType,
          storagePath: `projects/${f.fileName}`,
          uploadedAt: new Date().toISOString(),
          downloadCount: 0,
        })),
        assignToAllActiveUsers,
      });

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-cyan-400" />
          Upload New Project Archive
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Publish engineering source files, KiCad/Altium Gerbers, microcode, and assembly guides.
        </p>
      </div>

      {success ? (
        <div className="p-8 bg-slate-900 border border-emerald-500/40 rounded-xl text-center space-y-4 shadow-xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Project Published Successfully!</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your files have been indexed and secure download tokens are configured.
            {assignToAllActiveUsers && ' All active channel subscribers have been granted immediate access.'}
          </p>

          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSuccess(false);
                setTitle('');
                setDescription('');
                setInstructions('');
              }}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              Upload Another Project
            </button>
            <button
              onClick={() => onNavigate('/admin/projects')}
              className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              View in Project Archive &rarr;
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-950/40 border border-rose-800/60 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Basic Info */}
          <div className="space-y-4">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              1. Project Details & Classification
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Project Title <span className="text-cyan-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. WiFi Smart Power Strip with ESP32 & Web Dashboard"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="v1.0"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-cyan-400 font-mono font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Category <span className="text-cyan-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Project Overview & Description <span className="text-cyan-400">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what the circuit does, components used, and target application..."
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Build & Flashing Instructions
              </label>
              <textarea
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="1. Board manager settings&#10;2. Required Arduino libraries&#10;3. Pinout assignments..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Section 2: Thumbnail Selection */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              2. Cover Thumbnail
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PRESET_THUMBNAILS.map((thumb) => (
                <button
                  key={thumb.url}
                  type="button"
                  onClick={() => setThumbnailUrl(thumb.url)}
                  className={`p-1.5 rounded-lg border text-left transition-all overflow-hidden ${
                    thumbnailUrl === thumb.url
                      ? 'border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-950/20'
                      : 'border-slate-800 hover:border-slate-700 bg-slate-950'
                  }`}
                >
                  <div className="aspect-video w-full rounded overflow-hidden bg-slate-900 mb-1.5">
                    <img
                      src={thumb.url}
                      alt={thumb.label}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 truncate">
                    {thumb.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Multi-File Manager */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              3. Downloadable Project Files
            </div>

            {/* Existing Files List */}
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="font-mono text-white font-medium">{file.fileName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {(file.fileSizeBytes / 1024).toFixed(1)} KB · {file.fileType}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1.5 text-slate-500 hover:text-red-400 rounded"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add File Inputs */}
            <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg space-y-3">
              <div className="text-xs font-medium text-slate-300">Add Another File:</div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    placeholder="File name (e.g. Gerber_Rev2.zip)"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white"
                  >
                    {['ZIP', 'RAR', 'PDF', 'INO', 'CPP', 'C', 'H', 'HEX', 'BIN', 'TXT', 'GERBER', 'PCB'].map(
                      (ext) => (
                        <option key={ext} value={ext}>
                          {ext}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <input
                    type="number"
                    min="1"
                    value={newFileSizeKb}
                    onChange={(e) => setNewFileSizeKb(Number(e.target.value))}
                    placeholder="Size in KB"
                    className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1.5 text-xs text-white"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFile}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-cyan-400" />
                <span>Add File to Package</span>
              </button>
            </div>
          </div>

          {/* Section 4: Access & Publishing */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800">
              4. Access Distribution
            </div>

            <label className="flex items-center gap-2.5 p-3 bg-slate-950 rounded-lg border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={assignToAllActiveUsers}
                onChange={(e) => setAssignToAllActiveUsers(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-600 bg-slate-900 border-slate-700"
              />
              <div className="text-xs text-slate-300">
                <span className="font-semibold text-white block">
                  Broadcast Assignment to All Active Subscribers
                </span>
                <span>
                  Every subscriber currently holding an active subscription will immediately gain download access.
                </span>
              </div>
            </label>
          </div>

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => onNavigate('/admin/projects')}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isLoading ? 'Uploading...' : 'Publish Project Package'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
