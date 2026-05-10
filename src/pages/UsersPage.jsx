import { useEffect, useState } from "react";
import { Search, Shield, Ban, Trash2, Loader2, UserCheck } from "lucide-react";
import { useAdminStore } from "../store/useAdminStore";

const UsersPage = () => {
  const { users, fetchUsers, isLoadingUsers, updateUserRole, deleteUser } = useAdminStore();
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 relative z-10 animate-fade-in">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-main tracking-tight mb-1">User Management</h1>
          <p className="text-muted text-sm">Manage roles, bans, and access controls.</p>
        </div>
        <div className="relative group w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted group-focus-within:text-accent" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-app rounded-xl py-2 pl-9 pr-4 text-sm text-main placeholder:text-muted outline-none focus:border-accent/50"
          />
        </div>
      </div>

      <div className="flex-1 glass rounded-2xl border border-app overflow-hidden flex flex-col">
        {isLoadingUsers ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-app bg-surface/50 text-xs uppercase tracking-wider text-muted font-semibold">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Verification</th>
                  <th className="p-4">Joined</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app">
                {filteredUsers.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5 transition-colors group">
                    <td className="p-4 flex items-center gap-3">
                      {user.profilePic ? (
                        <img src={user.profilePic} className="w-8 h-8 rounded-full object-cover" alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-main flex items-center justify-center text-white font-bold text-xs">
                          {user.fullName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="text-sm font-medium text-main">{user.fullName}</div>
                        <div className="text-xs text-muted">{user.email}</div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-accent/10 text-accent' : 'bg-white/5 text-muted'}`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${user.isVerified ? 'text-green-400' : 'text-amber-400'}`}>
                        {user.isVerified ? <UserCheck className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                        {user.isVerified ? "Verified" : "Pending"}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => updateUserRole(user._id, user.role === 'admin' ? 'user' : 'admin')}
                          title={user.role === 'admin' ? "Demote to User" : "Promote to Admin"}
                          className="p-1.5 text-muted hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => deleteUser(user._id)}
                          title="Delete User"
                          className="p-1.5 text-muted hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;
