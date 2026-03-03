import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import {
  FaChartBar, FaUsers, FaMoneyBillWave, FaCalendar, FaCrown,
  FaExchangeAlt, FaShieldAlt, FaSignOutAlt, FaBars, FaTimes
} from 'react-icons/fa';

const NAV_ITEMS = [
  { path: '/',              label: 'Dashboard',    icon: FaChartBar },
  { path: '/users',         label: 'Users',        icon: FaUsers },
  { path: '/payments',      label: 'Payments',     icon: FaMoneyBillWave },
  { path: '/seasons',       label: 'Seasons',      icon: FaCalendar },
  { path: '/vip',           label: 'VIP',          icon: FaCrown },
  { path: '/transactions',  label: 'Transactions', icon: FaExchangeAlt },
  { path: '/actions',       label: 'Actions Log',  icon: FaShieldAlt },
];

export default function Sidebar() {
  const { logout, admin } = useAuth();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-admin-card border-b border-admin-border flex items-center justify-between px-4 py-3">
        <h1 className="text-sm font-bold text-white">BR4C Admin</h1>
        <button onClick={() => setOpen(!open)} className="text-gray-400 p-1">
          {open ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-admin-card border-r border-admin-border flex flex-col transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="p-6 border-b border-admin-border">
          <h1 className="text-lg font-bold text-white">BR4C Admin</h1>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{admin?.email}</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-admin-accent/10 text-admin-accent'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon className="text-sm" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-admin-border">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 w-full transition-colors"
          >
            <FaSignOutAlt />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
