import React, { useState } from 'react';
import { TeamMember, RosterConfig } from '../types';
import { Users, UserPlus, Edit2, Check, X, Shield, Clock } from 'lucide-react';

interface TeamManagerProps {
  members: TeamMember[];
  config: RosterConfig;
  onUpdateMember: (updatedMember: TeamMember) => void;
  onAddMember: (newMember: Omit<TeamMember, 'id'>) => void;
}

export const TeamManager: React.FC<TeamManagerProps> = ({
  members,
  onUpdateMember,
  onAddMember,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<TeamMember>>({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('Console Engineer');
  const [newPreferred, setNewPreferred] = useState<'Morning' | 'Afternoon' | 'Night' | 'None'>('None');

  const startEdit = (m: TeamMember) => {
    setEditingId(m.id);
    setEditForm(m);
  };

  const saveEdit = () => {
    if (editingId && editForm) {
      onUpdateMember(editForm as TeamMember);
      setEditingId(null);
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    onAddMember({
      name: newName.trim(),
      role: newRole.trim() || 'Console Engineer',
      preferredShift: newPreferred,
      maxOffDays: 8,
      avatarColor: ['#2563eb', '#059669', '#d97706', '#7c3aed', '#db2777', '#0891b2'][
        Math.floor(Math.random() * 6)
      ],
    });

    setNewName('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-200">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Console Team Members</h2>
            <p className="text-xs text-slate-500">
              Manage team list ({members.length} engineers), shift preferences, and monthly weekoffs.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Engineer</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {members.map((member) => {
          const isEditing = editingId === member.id;

          return (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-2.5">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                      style={{ backgroundColor: member.avatarColor }}
                    >
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>

                    {!isEditing ? (
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs">{member.name}</h3>
                        <p className="text-[10px] text-slate-500">{member.role}</p>
                      </div>
                    ) : (
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 text-xs text-slate-900 w-28"
                      />
                    )}
                  </div>

                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(member)}
                      className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={saveEdit}
                        className="p-1 text-emerald-700 hover:bg-emerald-50 rounded cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="p-1 text-rose-700 hover:bg-rose-50 rounded cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-indigo-600" />
                      Preferred:
                    </span>
                    {!isEditing ? (
                      <span className="font-semibold text-slate-900 text-[11px]">{member.preferredShift}</span>
                    ) : (
                      <select
                        value={editForm.preferredShift || 'None'}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            preferredShift: e.target.value as any,
                          })
                        }
                        className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] text-slate-900"
                      >
                        <option value="None">None</option>
                        <option value="Morning">Morning</option>
                        <option value="Afternoon">Afternoon</option>
                        <option value="Night">Night</option>
                      </select>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1 text-[11px]">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      Monthly Weekoffs:
                    </span>
                    {!isEditing ? (
                      <span className="font-semibold text-slate-900 text-[11px]">{member.maxOffDays} days</span>
                    ) : (
                      <input
                        type="number"
                        min={4}
                        max={12}
                        value={editForm.maxOffDays || 8}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            maxOffDays: parseInt(e.target.value, 10) || 8,
                          })
                        }
                        className="bg-slate-50 border border-slate-200 rounded px-1 py-0.5 text-[11px] text-slate-900 w-12 text-center"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-sm w-full shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-900 text-xs">Add New Engineer</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Role</label>
                <input
                  type="text"
                  placeholder="Console Engineer"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Shift Preference</label>
                <select
                  value={newPreferred}
                  onChange={(e) => setNewPreferred(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-900 focus:outline-none focus:border-indigo-600"
                >
                  <option value="None">No preference (Rotate freely)</option>
                  <option value="Morning">Morning Preference</option>
                  <option value="Afternoon">Afternoon Preference</option>
                  <option value="Night">Night Preference</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold cursor-pointer"
                >
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
