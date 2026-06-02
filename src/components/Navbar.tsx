import { Briefcase, Search, PlusCircle, ChevronRight, Bell, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn, getCompanyLogo, getClearbitLogo, getFallbackAvatar } from '@/src/lib/utils';
import React, { useState, useRef, useEffect } from 'react';
import { Job } from '../types';

interface NavbarProps {
  onSearch?: (term: string) => void;
  searchTerm?: string;
  onOpenAuth: () => void;
  onOpenPostJob: () => void;
  user: { name: string; email: string; picture?: string } | null;
  onLogout: () => void;
  jobs?: Job[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Navbar({ 
  onSearch, 
  searchTerm = '', 
  onOpenAuth, 
  onOpenPostJob, 
  user, 
  onLogout, 
  jobs = [],
  theme,
  onToggleTheme
}: NavbarProps) {
  const [searchValue, setSearchValue] = useState(searchTerm);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSearchValue(searchTerm);
    if (!searchTerm) setShowResults(false);
  }, [searchTerm]);

  const filteredSuggestions = jobs.filter(job => 
    job.title.toLowerCase().includes(searchValue.toLowerCase()) ||
    job.company.toLowerCase().includes(searchValue.toLowerCase())
  ).slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement>, company: string) => {
    const img = e.currentTarget;
    const clearbitUrl = getClearbitLogo(company);
    const avatarUrl = getFallbackAvatar(company);
    
    // If current source is not Clearbit, try Clearbit.
    // Otherwise, try the generic avatar.
    if (img.src !== clearbitUrl) {
      img.src = clearbitUrl;
    } else {
      img.src = avatarUrl;
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    onSearch?.(value);
    setShowResults(value.length > 0);
  };

  return (
    <nav id="navbar" className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <motion.div
              initial={{ rotate: -20, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="bg-brand p-2 rounded-xl"
            >
              <Briefcase className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display font-bold text-xl tracking-tight text-slate-900">
              Khmer<span className="text-brand">Jobs</span>
            </span>
          </div>

          <div className="hidden md:flex items-center flex-1 max-w-md mx-8 relative" ref={searchRef}>
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search dream jobs..."
                value={searchValue}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => searchValue.length > 0 && setShowResults(true)}
                className="w-full bg-slate-100/50 border-none rounded-2xl py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-brand/20 smooth-transition"
              />
            </div>

            <AnimatePresence>
              {showResults && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full mt-2 left-0 right-0 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden"
                >
                  <div className="p-2">
                    {filteredSuggestions.length > 0 ? (
                      filteredSuggestions.map((job) => (
                        <button
                          key={job.id}
                          onClick={() => {
                            setSearchValue(job.title);
                            onSearch?.(job.title);
                            setShowResults(false);
                          }}
                          className="w-full flex items-center gap-3 p-2.5 hover:bg-slate-50 rounded-xl transition-colors text-left group"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                            <img 
                              src={getCompanyLogo(job.company, job.logo)} 
                              alt={job.company} 
                              className="w-full h-full object-cover" 
                              onError={(e) => handleLogoError(e, job.company)}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate group-hover:text-brand transition-colors">{job.title}</p>
                            <p className="text-[10px] text-slate-500 truncate">{job.company} • {job.location}</p>
                          </div>
                          <ChevronRight className="w-3 h-3 text-slate-300 group-hover:text-brand transition-all" />
                        </button>
                      ))
                    ) : (
                      <div className="p-4 text-center">
                        <p className="text-xs text-slate-400">No matching jobs found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 relative group">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-bold text-slate-900">{user.name}</p>
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-[10px] font-bold text-brand uppercase tracking-wider">Online</span>
                  </div>
                </div>
                <button className="w-10 h-10 rounded-full bg-brand/10 border-2 border-brand/20 flex items-center justify-center text-brand font-bold overflow-hidden transition-all hover:border-brand/40">
                  {user.picture ? (
                    <img src={user.picture || undefined} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name[0].toUpperCase()
                  )}
                </button>

                {/* Profile Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-0.5">Signed in as</p>
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{user.email}</p>
                  </div>
                  <button 
                    id="nav-dashboard-btn"
                    onClick={() => {
                      const button = document.getElementById('open-dashboard-btn');
                      if (button) button.click();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <LayoutDashboard className="w-4 h-4" />
                    </div>
                    Dashboard
                  </button>
                  <button 
                    onClick={() => {
                      const button = document.getElementById('manage-alerts-btn');
                      if (button) button.click();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-brand dark:hover:text-brand hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    Manage Alerts
                  </button>
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                      <PlusCircle className="w-4 h-4 rotate-45" />
                    </div>
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={onOpenAuth}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                Sign In
              </button>
            )}

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onToggleTheme}
              className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 transition-all h-10 w-10 flex items-center justify-center cursor-pointer relative overflow-hidden flex-shrink-0"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ y: -20, opacity: 0, rotate: -90 }}
                  animate={{ y: 0, opacity: 1, rotate: 0 }}
                  exit={{ y: 20, opacity: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                  className="absolute flex items-center justify-center"
                >
                  {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-slate-600" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-400" />
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onOpenPostJob}
              className="bg-brand text-white px-5 py-2 rounded-2xl text-sm font-semibold shadow-lg shadow-brand/20 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Post Job
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
