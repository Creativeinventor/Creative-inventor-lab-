import React, { useEffect, useState, useMemo } from 'react';
import { api } from '../../services/api.js';
import type { UserProfile, UserStatus } from '../../types/index.js';
import { formatToKolkata, getRemainingDays } from '../../services/dateUtils.js';
import { StatusBadge } from '../../components/StatusBadge.js';
import { Modal } from '../../components/Modal.js';
import {
  Search,
  UserPlus,
  CalendarPlus,
  ShieldBan,
  ShieldCheck,
  KeyRound,
  Trash2,
  Edit2,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

interface ManageUsersProps {
  onNavigate: (path: string) => void;
}

export const ManageUsers: React.FC<ManageUsersProps> = ({ onNavigate }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | UserStatus>('ALL');

  // Modals state
  const [extendModalUser, setExtendModalUser] = useState<UserProfile | null>(null);
  const [extendDays, setExtendDays] = useState(30);

  const [disableModalUser, setDisableModalUser] = useState<UserProfile | null>(null);
  const [disableReason, setDisableReason] = useState('');

  const [passwordModalResult, setPasswordModalResult] = useState<{
    user: UserProfile;
    tempPass: string;
  } | null>(null);

  const [editUserModal, setEditUserModal] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editUserId, setEditUserId] = useState('');

  const [deleteModalUser, setDeleteModalUser] = useState<UserProfile | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      // Filter out system admin from standard subscriber view
      setUsers(res.users);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Don't show admin in the subscriber list table
      if (u.role === 'ADMIN') return false;

      const matchesSearch =
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.userId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  // Handlers
  const handleExtend = async () => {
    if (!extendModalUser) return;
    try {
      await api.manageUser(extendModalUser.uid, 'EXTEND', { additionalDays: extendDays });
      setActionMessage(`Extended subscription for ${extendModalUser.userId} by ${extendDays} days.`);
      setExtendModalUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDisable = async () => {
    if (!disableModalUser) return;
    try {
      await api.manageUser(disableModalUser.uid, 'DISABLE', { reason: disableReason });
      setActionMessage(`Account ${disableModalUser.userId} disabled.`);
      setDisableModalUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReactivate = async (u: UserProfile) => {
    try {
      await api.manageUser(u.uid, 'ENABLE');
      setActionMessage(`Account ${u.userId} reactivated.`);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (u: UserProfile) => {
    try {
      const res = await api.manageUser(u.uid, 'RESET_PASSWORD');
      setPasswordModalResult({
        user: u,
        tempPass: res.temporaryPassword || 'Generated',
      });
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editUserModal) return;
    try {
      await api.manageUser(editUserModal.uid, 'UPDATE_PROFILE', {
        name: editName,
        email: editEmail,
        userId: editUserId,
      });
      setActionMessage(`Updated profile for ${editUserId}.`);
      setEditUserModal(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteModalUser) return;
    try {
      await api.manageUser(deleteModalUser.uid, 'DELETE');
      setActionMessage(`User ${deleteModalUser.userId} deleted.`);
      setDeleteModalUser(null);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Manage Subscribers</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search, filter, extend durations, and manage access credentials.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/admin/create-user')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create New User</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-cyan-950/40 border border-cyan-800/60 rounded-lg text-xs text-cyan-300 flex items-center justify-between">
          <span>{actionMessage}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-slate-900/80 p-4 border border-slate-800 rounded-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by User ID, Name, or Email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Status Filter Tabs (Functional segmented buttons per frontend design constitution) */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg self-start md:self-auto">
          {(['ALL', 'ACTIVE', 'EXPIRED', 'DISABLED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-slate-800 text-cyan-400 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading subscriber accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <div className="text-sm font-semibold text-slate-300">No subscribers found</div>
            <p className="text-xs text-slate-500">
              {searchQuery ? 'Try adjusting your search criteria.' : 'Create your first subscriber account.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-medium">User ID</th>
                  <th className="py-3 px-4 font-medium">Subscriber Name</th>
                  <th className="py-3 px-4 font-medium">Email Address</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                  <th className="py-3 px-4 font-medium">Start Date (IST)</th>
                  <th className="py-3 px-4 font-medium">Expiry Date (IST)</th>
                  <th className="py-3 px-4 font-medium">Remaining</th>
                  <th className="py-3 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => {
                  const remaining = getRemainingDays(u.subscriptionExpiry);
                  return (
                    <tr key={u.uid} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                        {u.userId}
                      </td>
                      <td className="py-3 px-4 font-medium text-white">{u.name}</td>
                      <td className="py-3 px-4 text-slate-400">{u.email}</td>
                      <td className="py-3 px-4">
                        <StatusBadge status={u.status} />
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                        {formatToKolkata(u.subscriptionStart, false)}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300 tabular-nums font-semibold">
                        {formatToKolkata(u.subscriptionExpiry, false)}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {u.status === 'ACTIVE' ? (
                          <span className={remaining <= 7 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                            {remaining} {remaining === 1 ? 'day' : 'days'}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Extend Duration */}
                          <button
                            onClick={() => {
                              setExtendModalUser(u);
                              setExtendDays(30);
                            }}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded transition-colors"
                            title="Extend Subscription"
                          >
                            <CalendarPlus className="w-4 h-4" />
                          </button>

                          {/* Enable / Disable */}
                          {u.status === 'DISABLED' ? (
                            <button
                              onClick={() => handleReactivate(u)}
                              className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded transition-colors"
                              title="Reactivate Account"
                            >
                              <ShieldCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setDisableModalUser(u);
                                setDisableReason('');
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                              title="Disable Account"
                            >
                              <ShieldBan className="w-4 h-4" />
                            </button>
                          )}

                          {/* Reset Password */}
                          <button
                            onClick={() => handleResetPassword(u)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors"
                            title="Reset Password"
                          >
                            <KeyRound className="w-4 h-4" />
                          </button>

                          {/* Edit Details */}
                          <button
                            onClick={() => {
                              setEditUserModal(u);
                              setEditName(u.name);
                              setEditEmail(u.email);
                              setEditUserId(u.userId);
                            }}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
                            title="Edit Details"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteModalUser(u)}
                            className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800 rounded transition-colors"
                            title="Delete User"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Extend Subscription */}
      <Modal
        isOpen={Boolean(extendModalUser)}
        onClose={() => setExtendModalUser(null)}
        title={`Extend Subscription - ${extendModalUser?.userId}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Current Expiry: <strong className="text-white">{formatToKolkata(extendModalUser?.subscriptionExpiry)}</strong>
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Select Additional Duration
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[7, 15, 30, 90].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setExtendDays(d)}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-colors ${
                    extendDays === d
                      ? 'bg-cyan-600/20 text-cyan-400 border-cyan-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  +{d} Days
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Or Custom Days to Add
            </label>
            <input
              type="number"
              min="1"
              value={extendDays}
              onChange={(e) => setExtendDays(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={() => setExtendModalUser(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleExtend}
              className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              Extend Subscription
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Disable Account */}
      <Modal
        isOpen={Boolean(disableModalUser)}
        onClose={() => setDisableModalUser(null)}
        title={`Disable Subscriber Account - ${disableModalUser?.userId}`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-400">
            Disabling will immediately revoke all project download access and prevent portal sign-in.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Reason for Suspension (sent to subscriber via email)
            </label>
            <textarea
              rows={3}
              value={disableReason}
              onChange={(e) => setDisableReason(e.target.value)}
              placeholder="e.g. Account paused per user request or policy violation"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white placeholder-slate-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={() => setDisableModalUser(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDisable}
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition-colors"
            >
              Confirm Disable
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal: Password Reset Result */}
      <Modal
        isOpen={Boolean(passwordModalResult)}
        onClose={() => setPasswordModalResult(null)}
        title="Password Reset Successful"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-300">
            A temporary password was generated for{' '}
            <strong className="text-white">{passwordModalResult?.user.name}</strong> (
            {passwordModalResult?.user.userId}).
          </p>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg font-mono text-sm text-cyan-400 select-all">
            {passwordModalResult?.tempPass}
          </div>
          <p className="text-[11px] text-slate-500">
            An email notification has also been dispatched via Resend.
          </p>
          <button
            onClick={() => setPasswordModalResult(null)}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg"
          >
            Close
          </button>
        </div>
      </Modal>

      {/* Modal: Edit User */}
      <Modal
        isOpen={Boolean(editUserModal)}
        onClose={() => setEditUserModal(null)}
        title="Edit Subscriber Information"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">User ID</label>
            <input
              type="text"
              value={editUserId}
              onChange={(e) => setEditUserId(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Subscriber Name</label>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              required
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditUserModal(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Delete User Confirmation */}
      <Modal
        isOpen={Boolean(deleteModalUser)}
        onClose={() => setDeleteModalUser(null)}
        title="Confirm User Deletion"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300">
            Are you sure you want to permanently delete{' '}
            <strong className="text-white">{deleteModalUser?.name}</strong> (
            <span className="font-mono text-cyan-400">{deleteModalUser?.userId}</span>)?
          </p>
          <p className="text-xs text-rose-400">
            This will remove their authentication account, Firestore record, and all project access permissions.
          </p>
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              onClick={() => setDeleteModalUser(null)}
              className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-500 text-white rounded-lg transition-colors"
            >
              Permanently Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
