import React, { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import type { UserProfile, Project, ProjectAssignment } from '../../types/index.js';
import { formatToKolkata } from '../../services/dateUtils.js';
import {
  Layers,
  UserCheck,
  FolderCheck,
  CheckCircle2,
  Trash2,
  Users,
  Search,
  AlertCircle,
  Radio,
} from 'lucide-react';

export const AssignProjects: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [assignments, setAssignments] = useState<ProjectAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Assignment Mode
  // 1: Single User -> Multiple Projects
  // 2: Single Project -> Multiple Users
  // 3: Project -> All Active Users
  const [mode, setMode] = useState<'USER_TO_PROJECTS' | 'PROJECT_TO_USERS' | 'BROADCAST'>('USER_TO_PROJECTS');

  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  const [broadcastProjectId, setBroadcastProjectId] = useState<string>('');

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [uRes, pRes, aRes] = await Promise.all([
        api.getUsers(),
        api.getAdminProjects(),
        api.getAssignments(),
      ]);

      const subs = uRes.users.filter((u) => u.role === 'SUBSCRIBER');
      setUsers(subs);
      setProjects(pRes.projects);
      setAssignments(aRes.assignments);

      if (subs.length > 0 && !selectedUserId) {
        setSelectedUserId(subs[0].uid);
      }
      if (pRes.projects.length > 0 && !selectedProjectId) {
        setSelectedProjectId(pRes.projects[0].id);
        setBroadcastProjectId(pRes.projects[0].id);
      }
    } catch (err) {
      console.error('Failed to load assignment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update selected projects when switching selected user
  useEffect(() => {
    if (selectedUserId) {
      const assigned = assignments
        .filter((a) => a.userId === selectedUserId)
        .map((a) => a.projectId);
      setSelectedProjectIds(assigned);
    }
  }, [selectedUserId, assignments]);

  // Update selected users when switching selected project
  useEffect(() => {
    if (selectedProjectId) {
      const assigned = assignments
        .filter((a) => a.projectId === selectedProjectId)
        .map((a) => a.userId);
      setSelectedUserIds(assigned);
    }
  }, [selectedProjectId, assignments]);

  const handleSaveUserProjects = async () => {
    if (!selectedUserId) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      // Find what needs to be added and what needs to be removed
      const currentAssigned = assignments
        .filter((a) => a.userId === selectedUserId)
        .map((a) => a.projectId);

      const toAdd = selectedProjectIds.filter((pId) => !currentAssigned.includes(pId));
      const toRemove = currentAssigned.filter((pId) => !selectedProjectIds.includes(pId));

      if (toAdd.length > 0) {
        await api.assignProject({
          action: 'ASSIGN',
          userId: selectedUserId,
          projectIds: toAdd,
        });
      }

      for (const pId of toRemove) {
        await api.assignProject({
          action: 'REMOVE',
          userId: selectedUserId,
          projectId: pId,
        });
      }

      setStatusMessage('User project assignments updated successfully!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveProjectUsers = async () => {
    if (!selectedProjectId) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const currentAssigned = assignments
        .filter((a) => a.projectId === selectedProjectId)
        .map((a) => a.userId);

      const toAdd = selectedUserIds.filter((uId) => !currentAssigned.includes(uId));
      const toRemove = currentAssigned.filter((uId) => !selectedUserIds.includes(uId));

      if (toAdd.length > 0) {
        await api.assignProject({
          action: 'ASSIGN',
          userIds: toAdd,
          projectId: selectedProjectId,
        });
      }

      for (const uId of toRemove) {
        await api.assignProject({
          action: 'REMOVE',
          userId: uId,
          projectId: selectedProjectId,
        });
      }

      setStatusMessage('Subscribers access list updated for this project!');
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBroadcastAssign = async () => {
    if (!broadcastProjectId) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const res = await api.assignProject({
        action: 'ASSIGN_ALL_ACTIVE',
        projectId: broadcastProjectId,
      });

      setStatusMessage(res.message);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokeSingle = async (uId: string, pId: string) => {
    try {
      await api.assignProject({
        action: 'REMOVE',
        userId: uId,
        projectId: pId,
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Layers className="w-5 h-5 text-cyan-400" />
          Project Assignment Matrix
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Control exactly which subscribers have access to download which project files.
        </p>
      </div>

      {statusMessage && (
        <div className="p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusMessage}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Mode Selector Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-xl">
        <button
          onClick={() => setMode('USER_TO_PROJECTS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            mode === 'USER_TO_PROJECTS'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Assign Projects to a Subscriber</span>
        </button>

        <button
          onClick={() => setMode('PROJECT_TO_USERS')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            mode === 'PROJECT_TO_USERS'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <FolderCheck className="w-4 h-4" />
          <span>Assign Users to a Project</span>
        </button>

        <button
          onClick={() => setMode('BROADCAST')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 ${
            mode === 'BROADCAST'
              ? 'bg-slate-800 text-cyan-400 shadow-sm border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Broadcast to All Active Users</span>
        </button>
      </div>

      {/* Mode 1: User to Projects */}
      {mode === 'USER_TO_PROJECTS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* User selector column */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Subscriber
            </h3>
            <div className="space-y-1 max-h-[460px] overflow-y-auto">
              {users.map((u) => {
                const assignedCount = assignments.filter((a) => a.userId === u.uid).length;
                const isSelected = selectedUserId === u.uid;
                return (
                  <button
                    key={u.uid}
                    type="button"
                    onClick={() => setSelectedUserId(u.uid)}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors border ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-cyan-400">{u.userId}</span>
                      <span className="text-[11px] text-slate-500">{assignedCount} assigned</span>
                    </div>
                    <div className="text-slate-200 font-medium truncate">{u.name}</div>
                    <div className="text-[11px] text-slate-500">{u.status}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Project checkboxes column */}
          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Check Projects Allowed for Selected Subscriber
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProjectIds(projects.map((p) => p.id))}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Select All
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => setSelectedProjectIds([])}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
              {projects.map((p) => {
                const isChecked = selectedProjectIds.includes(p.id);
                return (
                  <label
                    key={p.id}
                    className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setSelectedProjectIds((prev) =>
                          prev.includes(p.id)
                            ? prev.filter((id) => id !== p.id)
                            : [...prev, p.id]
                        )
                      }
                      className="w-4 h-4 mt-0.5 rounded text-cyan-600 bg-slate-900 border-slate-700"
                    />
                    <div className="truncate">
                      <div className="font-semibold text-white truncate text-xs">{p.title}</div>
                      <div className="text-[11px] text-cyan-400">{p.category} · {p.version}</div>
                      <div className="text-[11px] text-slate-500">{p.files?.length || 0} files</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSaveUserProjects}
                disabled={isSubmitting}
                className="px-6 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving Assignments...' : 'Save Allowed Projects'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 2: Project to Users */}
      {mode === 'PROJECT_TO_USERS' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Project
            </h3>
            <div className="space-y-1.5 max-h-[460px] overflow-y-auto">
              {projects.map((p) => {
                const assignedCount = assignments.filter((a) => a.projectId === p.id).length;
                const isSelected = selectedProjectId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProjectId(p.id)}
                    className={`w-full p-2.5 rounded-lg text-left text-xs transition-colors border ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/50 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-white truncate">{p.title}</div>
                    <div className="flex items-center justify-between mt-1 text-[11px]">
                      <span className="text-cyan-400">{p.category}</span>
                      <span className="text-slate-500">{assignedCount} subscribers</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Subscribers with Access to this Project
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedUserIds(users.map((u) => u.uid))}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
                >
                  Select All
                </button>
                <span className="text-slate-600">·</span>
                <button
                  onClick={() => setSelectedUserIds([])}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto p-1">
              {users.map((u) => {
                const isChecked = selectedUserIds.includes(u.uid);
                return (
                  <label
                    key={u.uid}
                    className={`p-3 rounded-lg border flex items-start gap-3 cursor-pointer transition-all ${
                      isChecked
                        ? 'bg-cyan-950/30 border-cyan-500/40 text-white'
                        : 'bg-slate-950 border-slate-800/80 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() =>
                        setSelectedUserIds((prev) =>
                          prev.includes(u.uid)
                            ? prev.filter((id) => id !== u.uid)
                            : [...prev, u.uid]
                        )
                      }
                      className="w-4 h-4 mt-0.5 rounded text-cyan-600 bg-slate-900 border-slate-700"
                    />
                    <div className="truncate">
                      <div className="font-mono font-bold text-cyan-400 text-xs">{u.userId}</div>
                      <div className="text-xs text-white font-medium truncate">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </div>
                  </label>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={handleSaveProjectUsers}
                disabled={isSubmitting}
                className="px-6 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Updating Access...' : 'Save Authorized Subscribers'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Broadcast to All Active Users */}
      {mode === 'BROADCAST' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-xl mx-auto space-y-5">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              Broadcast Assignment to All Active Subscribers
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Instantly grant download access for the chosen project to every subscriber who currently holds an ACTIVE subscription.
            </p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Select Target Project
            </label>
            <select
              value={broadcastProjectId}
              onChange={(e) => setBroadcastProjectId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.category})
                </option>
              ))}
            </select>
          </div>

          <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs text-cyan-300">
            Active Subscribers Count: <strong className="text-white">{users.filter((u) => u.status === 'ACTIVE').length}</strong>
          </div>

          <button
            onClick={handleBroadcastAssign}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Broadcasting...' : 'Confirm Broadcast Access'}
          </button>
        </div>
      )}
    </div>
  );
};
