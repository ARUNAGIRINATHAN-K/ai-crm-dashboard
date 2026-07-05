import React from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Kanban, Users, CheckSquare, LogOut, ShieldAlert } from 'lucide-react';

/**
 * Common dashboard layout container. Provides responsive premium sidebar navigation,
 * top headers showing page contexts, and dynamically registers outlet targets.
 */
export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads & Kanban', path: '/leads', icon: Kanban },
    { name: 'Contacts', path: '/contacts', icon: Users },
    { name: 'Tasks', path: '/tasks', icon: CheckSquare },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar Drawer */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-900 bg-slate-950 p-6 flex flex-col justify-between">
        <div>
          {/* Logo Frame */}
          <div className="flex items-center gap-3 mb-8 px-2">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              AI CRM
            </h1>
          </div>

          {/* Navigation link elements */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout Trigger */}
        <div className="border-t border-slate-900 pt-6">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="h-9 w-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-sm font-semibold text-indigo-400">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-sm font-semibold text-slate-200 truncate">{user?.name}</h4>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Primary Application Workspace */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Header */}
        <header className="h-16 border-b border-slate-900 bg-slate-950 px-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-200">
              {navItems.find((n) => n.path === location.pathname)?.name || 'Workspace'}
            </h2>
          </div>
          {user?.role === 'admin' && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold text-amber-400">
              <ShieldAlert className="h-3.5 w-3.5" />
              Administrator Control
            </div>
          )}
        </header>

        {/* Content Canvas */}
        <main className="flex-1 overflow-y-auto p-8 bg-slate-950">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};