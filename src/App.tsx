import { useState, useMemo, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import LogoMarquee from './components/LogoMarquee';
import JobCard from './components/JobCard';
import JobDetails from './components/JobDetails';
import AuthModal from './components/AuthModal';
import PostJobModal from './components/PostJobModal';
import AdvancedFilters from './components/AdvancedFilters';
import JobAlertsModal from './components/JobAlertsModal';
import Dashboard from './components/Dashboard';
import { Job, Category, JobType } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { Filter, SlidersHorizontal, Search, Heart, Bell, LayoutDashboard } from 'lucide-react';
import { cn } from './lib/utils';
import { auth } from '@/src/lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [user, setUser] = useState<{ name: string; email: string; picture?: string } | null>(null);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);
  const [isSavedJobsView, setIsSavedJobsView] = useState(false);

  const [advancedFilters, setAdvancedFilters] = useState({
    types: [] as JobType[],
    salaryRange: 'Any Salary',
    postedWithin: 'any',
  });

  const categories = ['All', ...Object.values(Category)];

  const fetchJobs = async () => {
    try {
      const jobsRes = await fetch('/api/jobs');
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json();
        setJobs(jobsData);
      }
    } catch (error) {
      console.error('Failed to fetch jobs', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch initial data
  useEffect(() => {
    fetchJobs();

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          picture: firebaseUser.photoURL || undefined
        });

        // Sync with server
        try {
          const idToken = await firebaseUser.getIdToken();
          await fetch('/api/auth/firebase-sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ idToken })
          });
        } catch (err) {
          console.error('Failed to sync auth with server', err);
        }
        
        // Fetch saved jobs for the user
        const savedJobsRes = await fetch('/api/jobs/saved');
        if (savedJobsRes.ok) {
          const savedJobsData = await savedJobsRes.json();
          setSavedJobIds(savedJobsData.map((j: Job) => j.id));
        }
      } else {
        setUser(null);
        setSavedJobIds([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    const isSaved = savedJobIds.includes(jobId);
    const endpoint = isSaved ? `/api/jobs/${jobId}/unsave` : `/api/jobs/${jobId}/save`;

    try {
      const response = await fetch(endpoint, { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        setSavedJobIds(data.savedIds);
      }
    } catch (error) {
      console.error('Failed to toggle save job', error);
    }
  };

  const filteredJobs = useMemo(() => {
    let list = jobs;
    
    // If in saved jobs view, filter by saved IDs
    if (isSavedJobsView) {
      list = list.filter(job => savedJobIds.includes(job.id));
    }

    return list.filter(job => {
      // Category Filter
      const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
      
      // Search Filter
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            job.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Advanced Filters - Types
      const matchesType = advancedFilters.types.length === 0 || advancedFilters.types.includes(job.type);

      // Advanced Filters - Salary (Numerical comparison)
      let matchesSalary = true;
      if (advancedFilters.salaryRange !== 'Any Salary') {
        const parseSalary = (s: string) => {
          // Extract numbers from string like "$1,000 - $2,000" or "$3,000+"
          const numbers = s.replace(/[$,\s]/g, '').split('-').map(n => parseInt(n)).filter(n => !isNaN(n));
          if (numbers.length === 0) return { min: 0, max: Infinity };
          if (numbers.length === 1) {
            // Check if it's a "min+" or exactly one value
            return { min: numbers[0], max: s.includes('+') ? Infinity : numbers[0] };
          }
          return { min: numbers[0], max: numbers[1] };
        };

        const filterRange = parseSalary(advancedFilters.salaryRange);
        const jobRange = parseSalary(job.salary);

        // Check if job range overlaps with filter range
        // A job [jMin, jMax] matches filter [fMin, fMax] if:
        // jMax >= fMin AND jMin <= fMax
        matchesSalary = jobRange.max >= filterRange.min && jobRange.min <= filterRange.max;
      }

      // Advanced Filters - Date (Heuristic based on postedAt strings)
      let matchesDate = true;
      if (advancedFilters.postedWithin !== 'any') {
        const posted = job.postedAt.toLowerCase();
        if (advancedFilters.postedWithin === 'today') {
          matchesDate = posted.includes('h ago') || posted.includes('minute') || posted.includes('just now');
        } else if (advancedFilters.postedWithin === 'week') {
          matchesDate = !posted.includes('month') && !posted.includes('year');
        } else if (advancedFilters.postedWithin === 'month') {
          matchesDate = !posted.includes('year');
        }
      }

      return matchesCategory && matchesSearch && matchesType && matchesSalary && matchesDate;
    });
  }, [selectedCategory, searchTerm, jobs, advancedFilters, isSavedJobsView, savedJobIds]);

  const handlePostJob = async (newJob: Job) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newJob),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.approved) {
          setJobs([data, ...jobs]);
        }
        return { success: true, approved: data.approved };
      }
      return { success: false, error: data.error || 'Server error' };
    } catch (error: any) {
      console.error('Failed to post job', error);
      return { success: false, error: 'Connection failed' };
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // We don't need to manually clear state here as onAuthStateChanged will handle it
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  const clearFilters = () => {
    setAdvancedFilters({
      types: [],
      salaryRange: 'Any Salary',
      postedWithin: 'any',
    });
    setSelectedCategory('All');
    setSearchTerm('');
    setIsSavedJobsView(false);
  };

  const activeFilterCount = (advancedFilters.types.length > 0 ? 1 : 0) + 
                            (advancedFilters.salaryRange !== 'Any Salary' ? 1 : 0) +
                            (advancedFilters.postedWithin !== 'any' ? 1 : 0) +
                            (isSavedJobsView ? 1 : 0);

  return (
    <div id="app-root" className="min-h-screen bg-background">
      <Navbar 
        onSearch={setSearchTerm} 
        searchTerm={searchTerm} 
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenPostJob={() => {
          if (user) {
            setIsPostJobModalOpen(true);
          } else {
            setIsAuthModalOpen(true);
          }
        }}
        user={user}
        onLogout={handleLogout}
        jobs={jobs}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
      
      <main>
        <Hero />
        <LogoMarquee />

        <section id="jobs-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div className="flex-1">
              <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">
                {isSavedJobsView ? 'Your Saved Jobs' : 'Explore Opportunities'}
              </h2>
              <p className="text-slate-500 font-medium">
                {isSavedJobsView 
                  ? `Viewing ${filteredJobs.length} jobs you've bookmarked` 
                  : `Browse through ${filteredJobs.length} active listings in Cambodia`
                }
              </p>
            </div>

            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar md:justify-end">
              {user && (
                <button 
                  id="open-dashboard-btn"
                  onClick={() => setIsDashboardOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-slate-200 text-slate-600 text-sm font-bold shadow-sm hover:border-brand/40 group overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-brand/0 group-hover:bg-brand/5 transition-colors" />
                  <LayoutDashboard className="w-4 h-4 text-brand" />
                  Dashboard
                </button>
              )}

              {user && (
                <button 
                  id="manage-alerts-btn"
                  onClick={() => setIsAlertsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900 border border-slate-900 text-white text-sm font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all active:scale-[0.98] group"
                >
                  <Bell className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  Alerts
                </button>
              )}

              {user && (
                <button 
                  onClick={() => setIsSavedJobsView(!isSavedJobsView)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm text-sm font-bold smooth-transition",
                    isSavedJobsView 
                    ? "bg-rose-50 border-rose-200 text-rose-600" 
                    : "bg-surface border-slate-200 text-slate-600 hover:border-rose-400/40"
                  )}
                >
                  <Heart className={cn("w-4 h-4", isSavedJobsView && "fill-rose-600")} />
                  {isSavedJobsView ? 'Showing Saved' : 'Saved Jobs'}
                </button>
              )}

              <button 
                onClick={() => setIsFiltersOpen(true)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-2xl border shadow-sm text-sm font-bold smooth-transition",
                  activeFilterCount > 0 
                  ? "bg-brand/5 border-brand text-brand" 
                  : "bg-surface border-slate-200 text-slate-600 hover:border-brand/40"
                )}
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-brand text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center ml-1">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="h-8 w-px bg-slate-200 mx-1 hidden sm:block" />

              {!isSavedJobsView && categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat as Category | 'All')}
                  className={cn(
                    "px-4 py-2 rounded-2xl text-sm font-semibold whitespace-nowrap smooth-transition",
                    selectedCategory === cat 
                      ? "bg-brand text-white shadow-lg shadow-brand/20" 
                      : "bg-surface text-slate-500 border border-slate-200 hover:border-brand/40 hover:text-brand"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <motion.div 
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <AnimatePresence mode='popLayout'>
              {filteredJobs.map((job, index) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  index={index} 
                  onClick={setSelectedJob} 
                  isSaved={savedJobIds.includes(job.id)}
                  onToggleSave={() => handleToggleSaveJob(job.id)}
                />
              ))}
            </AnimatePresence>
          </motion.div>

          {filteredJobs.length === 0 && (
            <div className="py-20 text-center">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md mx-auto"
              >
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400">
                  {isSavedJobsView ? <Heart className="w-8 h-8" /> : <Search className="w-8 h-8" />}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {isSavedJobsView ? 'No saved jobs yet' : 'No matching jobs'}
                </h3>
                <p className="text-slate-500 font-medium mb-8 leading-relaxed">
                  {isSavedJobsView 
                    ? "You haven't saved any jobs yet. Browse listings and click the heart icon to save them for later." 
                    : "We couldn't find any jobs matching your current search criteria. Try adjusting your filters or search terms."
                  }
                </p>
                <button 
                  onClick={isSavedJobsView ? () => setIsSavedJobsView(false) : clearFilters}
                  className="px-6 py-3 bg-brand text-white rounded-2xl font-bold shadow-xl shadow-brand/20 hover:bg-brand/90 transition-all font-display"
                >
                  {isSavedJobsView ? 'Explore Jobs' : 'Clear all filters'}
                </button>
              </motion.div>
            </div>
          )}
        </section>
      </main>

      <footer className="bg-slate-900 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-brand p-2 rounded-xl">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-2xl tracking-tight">
                  Khmer<span className="text-brand">Jobs</span>
                </span>
              </div>
              <p className="text-slate-400 max-w-sm mb-6 leading-relaxed">
                Empowering the next generation of Cambodian professionals. Find the role that truly fits your lifestyle and ambition.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-slate-200 uppercase text-xs tracking-widest">Platform</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><a href="#" className="hover:text-brand transition-colors">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">For Employers</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Career Advice</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-slate-200 uppercase text-xs tracking-widest">Support</h4>
              <ul className="space-y-4 text-sm text-slate-400 font-medium">
                <li><a href="#" className="hover:text-brand transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-800 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-slate-500 font-medium">© 2026 KhmerJobs. All rights reserved.</p>
            <div className="flex items-center gap-6">
               <span className="text-xs text-slate-500">Made with ❤️ in Phnom Penh</span>
            </div>
          </div>
        </div>
      </footer>

      <JobDetails 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)} 
        user={user}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        isSaved={selectedJob ? savedJobIds.includes(selectedJob.id) : false}
        onToggleSave={() => selectedJob && handleToggleSaveJob(selectedJob.id)}
        onJobStatusChange={() => {
          fetchJobs();
          setDashboardRefreshKey(prev => prev + 1);
        }}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <PostJobModal 
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onPost={handlePostJob}
      />

      <AdvancedFilters 
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filters={advancedFilters}
        setFilters={setAdvancedFilters}
        onClear={clearFilters}
      />

      <JobAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        currentFilters={{
          category: selectedCategory,
          searchTerm,
          ...advancedFilters
        }}
      />

      {isDashboardOpen && (
        <Dashboard 
          key={dashboardRefreshKey}
          user={user} 
          onClose={() => setIsDashboardOpen(false)}
          onJobClick={(job) => {
            setSelectedJob(job);
            if (user?.email !== 'takosja1029@gmail.com') {
              setIsDashboardOpen(false);
            }
          }}
          onUpdateUser={(updatedUser) => setUser(updatedUser)}
          onRefreshJobs={fetchJobs}
        />
      )}
    </div>
  );
}
