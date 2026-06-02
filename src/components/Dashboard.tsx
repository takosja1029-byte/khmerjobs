import React, { useState, useEffect } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  Briefcase, 
  Heart, 
  Bell, 
  FileText, 
  FileStack,
  LayoutDashboard, 
  User, 
  Target, 
  ChevronRight,
  Clock,
  MapPin,
  ExternalLink,
  PlusCircle,
  Users,
  Trash2,
  Upload,
  X,
  Building,
  ShieldCheck,
  Check,
  AlertCircle,
  Search
} from 'lucide-react';
import { Job, Application, JobType } from '../types';
import { cn, getCompanyLogo } from '../lib/utils';

interface DashboardProps {
  key?: React.Key;
  user: { name: string; email: string; picture?: string } | null;
  onClose: () => void;
  onJobClick: (job: Job) => void;
  onUpdateUser?: (updated: { name: string; email: string; picture?: string } | null) => void;
  onRefreshJobs?: () => void;
}

type Tab = 'overview' | 'applications' | 'documents' | 'saved' | 'posted' | 'received' | 'alerts' | 'profile' | 'employer' | 'admin_pending';

export default function Dashboard({ user, onClose, onJobClick, onUpdateUser, onRefreshJobs }: DashboardProps) {
  const [activeTab, setActiveTab ] = useState<Tab>('overview');
  const [applications, setApplications] = useState<Application[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [postedJobs, setPostedJobs] = useState<Job[]>([]);
  const [adminPendingJobs, setAdminPendingJobs] = useState<Job[]>([]);
  const [receivedApps, setReceivedApps] = useState<Application[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Profile States
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePicture, setProfilePicture] = useState(user?.picture || '');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Profile CV States
  const [profileCvFile, setProfileCvFile] = useState<File | null>(null);
  const [profileCvSaving, setProfileCvSaving] = useState(false);
  const [profileCvSuccess, setProfileCvSuccess] = useState<string | null>(null);
  const [profileCvError, setProfileCvError] = useState<string | null>(null);

  // Company Profile States
  const [companyProfile, setCompanyProfile] = useState<any>(null);
  const [compName, setCompName] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [compIndustry, setCompIndustry] = useState('');
  const [compWebsite, setCompWebsite] = useState('');
  const [compSize, setCompSize] = useState('');
  const [compFounded, setCompFounded] = useState('');
  const [compLocation, setCompLocation] = useState('');
  const [compDescription, setCompDescription] = useState('');
  const [compBenefits, setCompBenefits] = useState('');
  const [companySaving, setCompanySaving] = useState(false);
  const [compProfileSuccess, setCompProfileSuccess] = useState<string | null>(null);
  const [compProfileError, setCompProfileError] = useState<string | null>(null);
  const [employerSubTab, setEmployerSubTab] = useState<'profile' | 'posted' | 'received'>('profile');

  // Search state for employers
  const [postedSearchQuery, setPostedSearchQuery] = useState('');
  const [receivedSearchQuery, setReceivedSearchQuery] = useState('');

  // Filtered lists based on search
  const filteredPostedJobs = postedJobs.filter(job => {
    if (!postedSearchQuery.trim()) return true;
    const query = postedSearchQuery.toLowerCase();
    return (
      (job.title && job.title.toLowerCase().includes(query)) ||
      (job.company && job.company.toLowerCase().includes(query)) ||
      (job.location && job.location.toLowerCase().includes(query)) ||
      (job.category && job.category.toLowerCase().includes(query)) ||
      (job.description && job.description.toLowerCase().includes(query))
    );
  });

  const filteredReceivedApps = receivedApps.filter(app => {
    if (!receivedSearchQuery.trim()) return true;
    const query = receivedSearchQuery.toLowerCase();
    return (
      (app.fullName && app.fullName.toLowerCase().includes(query)) ||
      (app.email && app.email.toLowerCase().includes(query)) ||
      (app.cvName && app.cvName.toLowerCase().includes(query)) ||
      (app.job?.title && app.job.title.toLowerCase().includes(query)) ||
      (app.job?.category && app.job.category.toLowerCase().includes(query))
    );
  });

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
      setProfilePicture(user.picture || '');
    }
  }, [user]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setProfileError('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setProfileError('File is too large. Max 5MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        // Perfect square crop centered around middle
        const size = Math.min(width, height);
        const xOffset = (width - size) / 2;
        const yOffset = (height - size) / 2;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, MAX_WIDTH, MAX_HEIGHT);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setProfilePicture(dataUrl);
          setProfileError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleProfileCvSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setProfileCvError('File is too large. Max 10MB allowed.');
      setProfileCvFile(null);
      return;
    }

    setProfileCvFile(file);
    setProfileCvError(null);
    setProfileCvSuccess(null);
  };

  const handleProfileCvSave = async () => {
    if (!profileCvFile) {
      setProfileCvError('Please select a file to upload first.');
      return;
    }

    setProfileCvSaving(true);
    setProfileCvSuccess(null);
    setProfileCvError(null);

    const formData = new FormData();
    formData.append('cv', profileCvFile);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [...prev, newDoc]);
        setProfileCvSuccess('CV uploaded and saved to your profile successfully!');
        setProfileCvFile(null);
      } else {
        const err = await res.json();
        setProfileCvError(err.error || 'Failed to save CV.');
      }
    } catch (error) {
      console.error('Failed to save CV in profile:', error);
      setProfileCvError('Network error. Failed to save CV.');
    } finally {
      setProfileCvSaving(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setProfileError('Name cannot be empty.');
      return;
    }
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          picture: profilePicture
        })
      });

      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {
        data = { error: 'Failed to parse response' };
      }

      if (res.ok) {
        setProfileSuccess('Profile updated successfully!');
        if (onUpdateUser && data.user) {
          onUpdateUser(data.user);
        }
      } else {
        setProfileError(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Failed to update profile', err);
      setProfileError('Network error. Failed to update profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const isAdmin = user.email === 'takosja1029@gmail.com';
        const promises: Promise<any>[] = [
          fetch('/api/applications'),
          fetch('/api/documents'),
          fetch('/api/jobs/saved'),
          fetch('/api/jobs/posted'),
          fetch('/api/applications/received'),
          fetch('/api/alerts'),
          fetch('/api/companies/mine')
        ];

        if (isAdmin) {
          promises.push(fetch('/api/jobs'));
        }

        const results = await Promise.all(promises);
        const [appsRes, docsRes, savedRes, postedRes, receivedRes, alertsRes, companyRes, jobsRes] = results;

        if (appsRes.ok) setApplications(await appsRes.json());
        if (docsRes.ok) setDocuments(await docsRes.json());
        if (savedRes.ok) setSavedJobs(await savedRes.json());
        if (postedRes.ok) setPostedJobs(await postedRes.json());
        if (receivedRes.ok) setReceivedApps(await receivedRes.json());
        if (alertsRes.ok) setAlerts(await alertsRes.json());
        if (companyRes.ok) {
          const profile = await companyRes.json();
          setCompanyProfile(profile);
        }
        if (isAdmin && jobsRes && jobsRes.ok) {
          const allJobsData: Job[] = await jobsRes.json();
          setAdminPendingJobs(allJobsData.filter((job: Job) => !job.approved));
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
    if (companyProfile) {
      setCompName(companyProfile.name || '');
      setCompLogo(companyProfile.logo || '');
      setCompIndustry(companyProfile.industry || '');
      setCompWebsite(companyProfile.website || '');
      setCompSize(companyProfile.size || '');
      setCompFounded(companyProfile.founded || '');
      setCompLocation(companyProfile.location || '');
      setCompDescription(companyProfile.description || '');
      setCompBenefits(Array.isArray(companyProfile.benefits) ? companyProfile.benefits.join(', ') : '');
    }
  }, [companyProfile]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText, count: applications.length },
    { id: 'documents', label: 'My Documents', icon: FileStack, count: documents.length },
    { id: 'saved', label: 'Saved Jobs', icon: Heart, count: savedJobs.length },
    ...(user?.email === 'takosja1029@gmail.com' ? [
      { id: 'admin_pending', label: 'Admin approvals', icon: ShieldCheck, count: adminPendingJobs.length }
    ] : []),
    { id: 'employer', label: 'Employer Portal', icon: Building },
    { id: 'posted', label: 'Job Listings', icon: Briefcase, count: postedJobs.length },
    { id: 'received', label: 'Received Apps', icon: Users, count: receivedApps.length },
    { id: 'alerts', label: 'Job Alerts', icon: Bell, count: alerts.length },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  const handleUpdateStatus = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (res.ok) {
        // Optimistic update
        const updated = (apps: Application[]) => 
          apps.map(a => a.id === appId ? { ...a, status: newStatus as any } : a);
        
        setApplications(prev => updated(prev));
        setReceivedApps(prev => updated(prev));
      }
    } catch (error) {
      console.error('Failed to update application status', error);
    }
  };

  const handleUploadDocument = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('cv', file);

    try {
      const res = await fetch('/api/documents', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        const newDoc = await res.json();
        setDocuments(prev => [...prev, newDoc]);
      }
    } catch (error) {
      console.error('Failed to upload document', error);
    } finally {
      setUploading(false);
      // Reset target value so uploading the same file again fires the change event
      e.target.value = '';
    }
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      const res = await fetch(`/api/documents/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(prev => prev.filter(d => d.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete document', error);
    }
  };

  const renderOverview = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Applied" 
          value={applications.length} 
          icon={FileText} 
          color="bg-blue-500" 
          onClick={() => setActiveTab('applications')}
        />
        <StatsCard 
          title="Saved" 
          value={savedJobs.length} 
          icon={Heart} 
          color="bg-rose-500" 
          onClick={() => setActiveTab('saved')}
        />
        <StatsCard 
          title="Alerts" 
          value={alerts.length} 
          icon={Bell} 
          color="bg-amber-500" 
          onClick={() => setActiveTab('alerts')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentActivity 
          title="Recent Applications" 
          items={applications.slice(0, 3)} 
          type="application"
          onViewAll={() => setActiveTab('applications')}
          onItemClick={(item: any) => item.job && onJobClick(item.job)}
        />
        <RecentActivity 
          title="Recently Saved" 
          items={savedJobs.slice(0, 3)} 
          type="job"
          onViewAll={() => setActiveTab('saved')}
          onItemClick={(item: any) => onJobClick(item)}
        />
      </div>
    </div>
  );

  const renderApplications = () => (
    <div className="space-y-4">
      {applications.length === 0 ? (
        <EmptyState 
          icon={FileText} 
          title="No applications yet" 
          desc="Apply for jobs to see them here." 
          actionLabel="Explore Jobs"
          action={onClose}
        />
      ) : (
        applications.map((app) => (
          <ApplicationRow key={app.id} app={app} onJobClick={onJobClick} />
        ))
      )}
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Document Vault</h3>
          <p className="text-sm text-slate-500 font-medium">Save your CVs here to apply faster to jobs.</p>
        </div>
        <div className="relative">
          <input 
            type="file" 
            id="dash-cv-upload" 
            className="hidden" 
            accept="application/pdf"
            onChange={handleUploadDocument}
            disabled={uploading}
          />
          <label 
            htmlFor="dash-cv-upload"
            className={cn(
              "flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-2xl font-bold shadow-xl shadow-brand/20 hover:bg-brand/90 transition-all cursor-pointer",
              uploading && "opacity-50 cursor-not-allowed"
            )}
          >
            {uploading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <PlusCircle className="w-4 h-4" />}
            Upload CV
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.length === 0 ? (
          <div className="md:col-span-2">
            <EmptyState 
              icon={FileStack} 
              title="No documents saved" 
              desc="Upload your resume to use it in job applications." 
            />
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 group">
              <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{doc.name}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Added {formatDate(doc.createdAt)}
                </p>
              </div>
              <button 
                onClick={() => handleDeleteDocument(doc.id)}
                className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                title="Delete Document"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const handleApproveJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/approve`, {
        method: 'POST'
      });
      if (res.ok) {
        setAdminPendingJobs(prev => prev.filter(j => j.id !== jobId));
        if (onRefreshJobs) onRefreshJobs();
      }
    } catch (err) {
      console.error('Failed to approve job:', err);
    }
  };

  const handleRejectJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}/reject`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setAdminPendingJobs(prev => prev.filter(j => j.id !== jobId));
        if (onRefreshJobs) onRefreshJobs();
      }
    } catch (err) {
      console.error('Failed to reject job:', err);
    }
  };

  const renderAdminPending = () => (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-brand" /> Admin approvals center
          </h3>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Review and authorize job listings submitted by the community. Only approved listings are visible to normal job seekers.
          </p>
        </div>
        <span className="text-xs bg-slate-200/60 font-bold tracking-tight px-3 py-1.5 rounded-full text-slate-600 uppercase shrink-0">
          {adminPendingJobs.length} Pending
        </span>
      </div>

      <div className="space-y-4">
        {adminPendingJobs.length === 0 ? (
          <EmptyState 
            icon={ShieldCheck} 
            title="All caught up!" 
            desc="No listings are currently awaiting approval. Great job keeping the portal clean!" 
          />
        ) : (
          adminPendingJobs.map((job) => (
            <div 
              key={job.id}
              className="p-5 rounded-3xl border border-slate-100 bg-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-brand/20 transition-all group"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100 overflow-hidden shrink-0">
                  <img src={getCompanyLogo(job.company, job.logo)} alt="co" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 truncate">
                      {job.title}
                    </h4>
                    {job.urgent && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 text-[8px] font-bold uppercase tracking-wider shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs font-medium flex flex-wrap items-center gap-2 mt-0.5">
                    <span className="font-bold text-slate-700">{job.company}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="flex items-center gap-0.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {job.location}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="font-bold text-slate-600">{job.salary}</span>
                    <span className="w-1.5 h-1.5 bg-slate-200 rounded-full" />
                    <span className="text-slate-400 lowercase truncate italic">(submitted by: {job.postedBy || 'Anonymous'})</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                <button 
                  onClick={() => onJobClick(job)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                >
                  Review Details
                </button>
                <button 
                  onClick={() => handleRejectJob(job.id)}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 active:scale-[0.98]"
                  title="Reject & Delete listing"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button 
                  onClick={() => handleApproveJob(job.id)}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/10 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
                  title="Approve & Post listing live"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const renderSaved = () => (
    <div className="space-y-4">
       {savedJobs.length === 0 ? (
        <EmptyState 
          icon={Heart} 
          title="No saved jobs" 
          desc="Jobs you save will appear here." 
          actionLabel="Explore Jobs"
          action={onClose}
        />
      ) : (
        savedJobs.map((job) => (
          <JobRow key={job.id} job={job} onClick={onJobClick} />
        ))
      )}
    </div>
  );

  const renderPosted = () => (
    <div className="space-y-4">
       {postedJobs.length === 0 ? (
        <EmptyState 
          icon={Briefcase} 
          title="No jobs posted" 
          desc="Looking for talent? Post your first job." 
          actionLabel="Post a Job"
          action={onClose}
        />
      ) : (
        <>
          <div className="relative flex items-center max-w-md w-full">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search posted jobs by title, details..."
              value={postedSearchQuery}
              onChange={(e) => setPostedSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all font-sans text-slate-800"
            />
            {postedSearchQuery && (
              <button
                onClick={() => setPostedSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredPostedJobs.length === 0 ? (
            <EmptyState 
              icon={Search} 
              title="No jobs found" 
              desc={`We couldn't find any job listing matching "${postedSearchQuery}". Try a different keyword.`} 
              actionLabel="Clear Search"
              action={() => setPostedSearchQuery('')}
            />
          ) : (
            filteredPostedJobs.map((job) => (
              <JobRow key={job.id} job={job} onClick={onJobClick} isEmployer />
            ))
          )}
        </>
      )}
    </div>
  );

  const renderReceived = () => (
    <div className="space-y-4">
      {receivedApps.length === 0 ? (
        <EmptyState 
          icon={Users} 
          title="No applications received" 
          desc="Post jobs to attract candidates." 
          actionLabel="Post a Job"
          action={onClose}
        />
      ) : (
        <>
          <div className="relative flex items-center max-w-md w-full">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              placeholder="Search applications by candidate, email, cv..."
              value={receivedSearchQuery}
              onChange={(e) => setReceivedSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all font-sans text-slate-800"
            />
            {receivedSearchQuery && (
              <button
                onClick={() => setReceivedSearchQuery('')}
                className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredReceivedApps.length === 0 ? (
            <EmptyState 
              icon={Search} 
              title="No candidates found" 
              desc={`We couldn't find any candidate or job matching "${receivedSearchQuery}". Try a different term.`} 
              actionLabel="Clear Search"
              action={() => setReceivedSearchQuery('')}
            />
          ) : (
            filteredReceivedApps.map((app) => (
              <ApplicationRow 
                key={app.id} 
                app={app} 
                onJobClick={onJobClick} 
                isEmployer 
                onUpdateStatus={handleUpdateStatus}
              />
            ))
          )}
        </>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <EmptyState 
          icon={Bell} 
          title="No alerts set" 
          desc="Get notified about new jobs matching your criteria." 
          actionLabel="Set Up Search"
          action={onClose}
        />
      ) : (
        alerts.map((alert) => (
          <AlertRow key={alert.id} alert={alert} />
        ))
      )}
    </div>
  );

  const predefinedAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://api.dicebear.com/7.x/identicon/svg?seed=KhmerJobs',
    'https://api.dicebear.com/7.x/bottts/svg?seed=KhmerJobs',
  ];

  const renderProfile = () => (
    <div className="max-w-xl mx-auto bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-100/50">
      <form onSubmit={handleUpdateProfile} className="space-y-8">
        <div>
          <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Profile Information</h3>
          <p className="text-sm text-slate-500 font-medium">Keep your account details up to date to get matched with employers.</p>
        </div>

        {profileSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{profileSuccess}</span>
          </div>
        )}

        {profileError && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-sm font-bold animate-in fade-in duration-300">
            {profileError}
          </div>
        )}

        {/* Current Avatar Frame & File Upload Selector */}
        <div className="flex flex-col items-center gap-4 py-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative group">
          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden shrink-0 relative">
            {profilePicture ? (
              <img src={profilePicture} alt="Avatar Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold font-display text-4xl">
                {profileName ? profileName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            
            {/* Overlay Hover Selector */}
            <label 
              htmlFor="avatar-file-upload" 
              className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
            >
              <Upload className="w-4 h-4 mb-1" />
              <span>CHOOSE</span>
            </label>
          </div>
          <input 
            id="avatar-file-upload"
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload}
            className="hidden" 
          />
          
          <div className="flex flex-col items-center gap-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">Avatar Preview</p>
            <div className="flex items-center gap-2 mt-1">
              <label 
                htmlFor="avatar-file-upload" 
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              >
                <Upload className="w-3.5 h-3.5 text-slate-400" />
                Upload Photo from Computer
              </label>
              {profilePicture && (
                <button
                  type="button"
                  onClick={() => setProfilePicture('')}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 rounded-xl text-xs font-bold text-rose-600 transition-all flex items-center gap-1 cursor-pointer"
                  title="Remove custom photo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Full Name</label>
            <input 
              type="text" 
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="e.g. Sokha Panha"
              className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Email Address (Read-only)</label>
            <input 
              type="email" 
              value={user?.email || ''} 
              disabled
              className="w-full px-5 py-4 bg-slate-100 border border-slate-200/50 rounded-2xl text-sm font-bold text-slate-400 cursor-not-allowed"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Choose an Avatar</label>
            <div className="grid grid-cols-6 gap-3">
              {predefinedAvatars.map((avUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => setProfilePicture(avUrl)}
                  className={cn(
                    "w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 shrink-0 hover:scale-110 active:scale-95",
                    profilePicture === avUrl ? "border-brand shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <img src={avUrl} alt={`Predefined Avatar ${idx + 1}`} className="w-full h-full object-cover rounded-full" />
                </button>
              ))}
            </div>
            
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider font-sans">Or Use Custom Image URL</span>
              <input 
                type="url" 
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://example.com/your-avatar.jpg"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
              />
            </div>
          </div>
          
          {/* CV / Resume Upload Section */}
          <div className="space-y-4 p-6 bg-slate-50/50 border border-slate-200/60 rounded-3xl mt-4">
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans mb-1">
                Your CV / Resume
              </label>
              <p className="text-xs text-slate-500 font-medium">
                Upload your latest resume (PDF, Word, or Text doc). Max 10MB.
              </p>
            </div>

            {profileCvSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>{profileCvSuccess}</span>
              </div>
            )}

            {profileCvError && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-xl text-xs font-bold animate-in fade-in">
                {profileCvError}
              </div>
            )}

            {!profileCvFile ? (
              <div className="border-2 border-dashed border-slate-200 hover:border-brand/40 bg-white rounded-2xl p-6 transition-all text-center group cursor-pointer relative">
                <input
                  type="file"
                  id="profile-cv-upload"
                  accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={handleProfileCvSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:bg-brand/10 group-hover:text-brand transition-all">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Click or drag file to upload CV
                  </div>
                  <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    PDF, DOC, DOCX or TXT
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-brand/5 text-brand rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{profileCvFile.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{formatFileSize(profileCvFile.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfileCvFile(null)}
                  className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  title="Remove selected file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {profileCvFile && (
              <button
                type="button"
                onClick={handleProfileCvSave}
                disabled={profileCvSaving}
                className="w-full py-3 bg-brand text-white rounded-xl text-xs font-bold font-display shadow-lg shadow-brand/10 hover:bg-brand/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {profileCvSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Saving CV...</span>
                  </>
                ) : (
                  <>
                    <FileStack className="w-3.5 h-3.5" />
                    <span>Save Uploaded CV</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={profileSaving}
          className="w-full py-4 bg-brand text-white rounded-2xl font-bold font-display shadow-xl shadow-brand/20 hover:bg-brand/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
        >
          {profileSaving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Saving profile...</span>
            </>
          ) : (
            <span>Save Profile Changes</span>
          )}
        </button>
      </form>
    </div>
  );

  const handleCompanyLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setCompProfileError('Only image files are allowed.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setCompProfileError('File is too large. Max 5MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        const size = Math.min(width, height);
        const xOffset = (width - size) / 2;
        const yOffset = (height - size) / 2;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, MAX_WIDTH, MAX_HEIGHT);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setCompLogo(dataUrl);
          setCompProfileError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateCompanyProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName.trim()) {
      setCompProfileError('Company Name is required.');
      return;
    }
    setCompanySaving(true);
    setCompProfileSuccess(null);
    setCompProfileError(null);

    const benefitsArray = compBenefits.split(',').map(b => b.trim()).filter(b => b.length > 0);

    try {
      const res = await fetch('/api/companies/mine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: companyProfile?.id || '',
          name: compName,
          logo: compLogo,
          industry: compIndustry,
          website: compWebsite,
          size: compSize,
          founded: compFounded,
          location: compLocation,
          description: compDescription,
          benefits: benefitsArray
        })
      });

      if (res.ok) {
        const data = await res.json();
        setCompProfileSuccess('Company profile saved successfully!');
        setCompanyProfile(data.company);
      } else {
        const err = await res.json();
        setCompProfileError(err.error || 'Failed to update company profile');
      }
    } catch (err) {
      console.error('Failed to update company profile', err);
      setCompProfileError('Network error. Failed to update company profile.');
    } finally {
      setCompanySaving(false);
    }
  };

  const renderEmployerPortal = () => {
    return (
      <div className="space-y-8">
        {/* Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl shadow-slate-100/50">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-white via-indigo-200 to-indigo-900"></div>
          <div className="relative z-10 max-w-2xl">
            <h3 className="text-2xl font-display font-extrabold tracking-tight mb-2">Employer Suite</h3>
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              Define your brand identity, manage jobs you have posted, and evaluate received applications to find your company's next great hire.
            </p>
          </div>
        </div>

        {/* Dynamic Sub-tab Selector */}
        <div className="flex border-b border-slate-100 p-1 bg-slate-50 rounded-2xl max-w-fit gap-1">
          <button
            type="button"
            onClick={() => setEmployerSubTab('profile')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              employerSubTab === 'profile'
                ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Building className="w-4 h-4" />
            <span>Manage Company Profile</span>
          </button>
          <button
            type="button"
            onClick={() => setEmployerSubTab('posted')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              employerSubTab === 'posted'
                ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jobs Posted</span>
            {postedJobs.length > 0 && (
              <span className="bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none font-bold">
                {postedJobs.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setEmployerSubTab('received')}
            className={cn(
              "px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer",
              employerSubTab === 'received'
                ? "bg-white text-slate-900 shadow-sm border border-slate-100"
                : "text-slate-500 hover:text-slate-800 hover:bg-white/50"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Applications Received</span>
            {receivedApps.length > 0 && (
              <span className="bg-brand text-white text-[10px] px-1.5 py-0.5 rounded-full leading-none font-bold">
                {receivedApps.length}
              </span>
            )}
          </button>
        </div>

        {/* Nested tab rendering panels */}
        <div className="mt-6">
          {employerSubTab === 'profile' && (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-xl shadow-slate-100/50 max-w-3xl">
              <form onSubmit={handleUpdateCompanyProfile} className="space-y-8">
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900 mb-2">Company Brand & Info</h3>
                  <p className="text-sm text-slate-500 font-medium">Keep your company brand accurate so applicants recognize your listings.</p>
                </div>

                {compProfileSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl text-sm font-bold flex items-center gap-3 animate-in fade-in duration-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>{compProfileSuccess}</span>
                  </div>
                )}

                {compProfileError && (
                  <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-sm font-bold animate-in fade-in duration-300">
                    {compProfileError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Company Logo Upload & Preview frame */}
                  <div className="md:col-span-2 flex flex-col items-center gap-4 py-6 bg-slate-50/50 rounded-3xl border border-slate-100 relative group">
                    <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden shrink-0 relative bg-white p-2">
                      {compLogo ? (
                        <img src={getCompanyLogo(compName, compLogo)} alt="Company Logo" className="w-full h-full object-contain animate-in fade-in duration-350" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Building className="w-10 h-10 animate-pulse" />
                        </div>
                      )}
                      
                      <label 
                        htmlFor="company-logo-upload" 
                        className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
                      >
                        <Upload className="w-4 h-4 mb-2" />
                        <span>CHOOSE</span>
                      </label>
                    </div>
                    <input 
                      id="company-logo-upload"
                      type="file" 
                      accept="image/*" 
                      onChange={handleCompanyLogoUpload}
                      className="hidden" 
                    />
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Company logo image</p>
                      <span className="text-[10px] text-slate-400 font-medium">Click image block to upload or paste a direct URL below</span>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Company Name *</label>
                    <input 
                      type="text" 
                      value={compName}
                      onChange={(e) => setCompName(e.target.value)}
                      placeholder="e.g. ABA Bank"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                      required
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Website URL</label>
                    <input 
                      type="url" 
                      value={compWebsite}
                      onChange={(e) => setCompWebsite(e.target.value)}
                      placeholder="e.g. https://www.ababank.com"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    />
                  </div>

                  {/* Logo URL input field */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Company Logo Image URL</label>
                    <input 
                      type="text" 
                      value={compLogo}
                      onChange={(e) => setCompLogo(e.target.value)}
                      placeholder="e.g. https://upload.wikimedia.org/.../logo.png"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    />
                  </div>

                  {/* Industry */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Industry / sector</label>
                    <input 
                      type="text" 
                      value={compIndustry}
                      onChange={(e) => setCompIndustry(e.target.value)}
                      placeholder="e.g. Banking & Finance, Tech, Retail"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    />
                  </div>

                  {/* Company Size */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Company Size Estimate</label>
                    <select 
                      value={compSize}
                      onChange={(e) => setCompSize(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    >
                      <option value="">Select Size</option>
                      <option value="1-10 employees">1-10 employees</option>
                      <option value="11-50 employees">11-50 employees</option>
                      <option value="51-200 employees">51-200 employees</option>
                      <option value="201-500 employees">201-500 employees</option>
                      <option value="501-1,000 employees">501-1,000 employees</option>
                      <option value="1,000+ employees">1,000+ employees</option>
                    </select>
                  </div>

                  {/* Founded */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Founded Year</label>
                    <input 
                      type="text" 
                      value={compFounded}
                      onChange={(e) => setCompFounded(e.target.value)}
                      placeholder="e.g. 1996"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    />
                  </div>

                  {/* Location */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Headquarters / Location</label>
                    <input 
                      type="text" 
                      value={compLocation}
                      onChange={(e) => setCompLocation(e.target.value)}
                      placeholder="e.g. Phnom Penh, Cambodia"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 transition-all"
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Company description</label>
                    <textarea 
                      value={compDescription}
                      onChange={(e) => setCompDescription(e.target.value)}
                      placeholder="Describe what your company does, your vision, and what makes you a unique place to work..."
                      rows={4}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Benefits */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Company perks & benefits (comma separated)</label>
                    <textarea 
                      value={compBenefits}
                      onChange={(e) => setCompBenefits(e.target.value)}
                      placeholder="e.g. Competitive Salary, Yearly bonus, Premium insurance, Flexible work setup"
                      rows={2}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-brand focus:ring-4 focus:ring-brand/10 outline-none transition-all resize-none"
                    />
                    {compBenefits.trim() && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {compBenefits.split(',').map(b=>b.trim()).filter(Boolean).map((benefit, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 font-bold px-2 py-1 rounded-lg">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={companySaving}
                    className="w-full md:w-auto px-8 py-4 bg-brand text-white rounded-2xl text-sm font-bold shadow-xl shadow-brand/20 hover:bg-brand/90 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {companySaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Saving company brand...</span>
                      </>
                    ) : (
                      <span>Save Company Profile</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {employerSubTab === 'posted' && (
            <div className="space-y-4">
              {postedJobs.length === 0 ? (
                <EmptyState 
                  icon={Briefcase} 
                  title="No jobs posted yet" 
                  desc="Post jobs and find top talent in Cambodia." 
                  actionLabel="Go Back & Post a Job"
                  action={onClose}
                />
              ) : (
                <>
                  <div className="relative flex items-center max-w-md w-full">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search posted jobs by title, details..."
                      value={postedSearchQuery}
                      onChange={(e) => setPostedSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all font-sans text-slate-800"
                    />
                    {postedSearchQuery && (
                      <button
                        onClick={() => setPostedSearchQuery('')}
                        className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {filteredPostedJobs.length === 0 ? (
                    <EmptyState 
                      icon={Search} 
                      title="No jobs found" 
                      desc={`We couldn't find any job listing matching "${postedSearchQuery}". Try a different keyword.`} 
                      actionLabel="Clear Search"
                      action={() => setPostedSearchQuery('')}
                    />
                  ) : (
                    filteredPostedJobs.map((job) => (
                      <JobRow key={job.id} job={job} onClick={onJobClick} isEmployer />
                    ))
                  )}
                </>
              )}
            </div>
          )}

          {employerSubTab === 'received' && (
            <div className="space-y-4">
              {receivedApps.length === 0 ? (
                <EmptyState 
                  icon={Users} 
                  title="No applications received" 
                  desc="Your posted jobs haven't received any matches yet." 
                  actionLabel="Go to Active Job Listings"
                  action={() => setEmployerSubTab('posted')}
                />
              ) : (
                <>
                  <div className="relative flex items-center max-w-md w-full">
                    <div className="absolute left-4 text-slate-400 pointer-events-none">
                      <Search className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search applications by candidate, email, cv..."
                      value={receivedSearchQuery}
                      onChange={(e) => setReceivedSearchQuery(e.target.value)}
                      className="w-full pl-11 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 hover:border-slate-300 focus:border-indigo-500 rounded-xl text-sm placeholder-slate-400 focus:outline-none transition-all font-sans text-slate-800"
                    />
                    {receivedSearchQuery && (
                      <button
                        onClick={() => setReceivedSearchQuery('')}
                        className="absolute right-3 p-1 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                        title="Clear search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {filteredReceivedApps.length === 0 ? (
                    <EmptyState 
                      icon={Search} 
                      title="No candidates found" 
                      desc={`We couldn't find any candidate or job matching "${receivedSearchQuery}". Try a different term.`} 
                      actionLabel="Clear Search"
                      action={() => setReceivedSearchQuery('')}
                    />
                  ) : (
                    filteredReceivedApps.map((app) => (
                      <ApplicationRow 
                        key={app.id} 
                        app={app} 
                        onJobClick={onJobClick} 
                        isEmployer 
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[120] bg-surface overflow-hidden flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-background border-r border-slate-200 flex flex-col overflow-y-auto md:overflow-y-auto shrink-0">
        <div className="p-8 pb-4">
          <button 
            onClick={onClose}
            className="flex items-center gap-3 mb-8 text-left hover:opacity-80 transition-opacity w-full group"
            title="Back to home"
          >
             <div className="w-10 h-10 bg-brand rounded-xl flex items-center justify-center text-white font-bold shadow-md shadow-brand/10 group-hover:scale-105 transition-transform">
               KJ
             </div>
             <div>
               <h1 className="font-display font-bold text-slate-900 tracking-tight leading-none uppercase text-lg group-hover:text-brand transition-colors">
                Dashboard
               </h1>
               <p className="text-slate-400 text-xs font-bold mt-1">KhmerJobs Portal</p>
             </div>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className="mb-8 flex items-center gap-4 p-4 bg-surface rounded-2xl border border-slate-100 shadow-sm hover:border-brand/40 hover:shadow-md transition-all text-left w-full group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border-2 border-brand/20 p-0.5 overflow-hidden transition-transform group-hover:scale-105">
               {user?.picture ? (
                 <img src={user.picture} alt="profile" className="w-full h-full object-cover rounded-full" />
               ) : (
                 <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                   <User className="w-5 h-5 text-slate-400" />
                 </div>
               )}
            </div>
            <div className="flex-1 min-w-0">
               <p className="font-bold text-slate-900 truncate text-sm group-hover:text-brand transition-colors">{user?.name}</p>
               <p className="text-slate-400 text-[10px] uppercase tracking-wider font-bold truncate">{user?.email}</p>
            </div>
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Tab)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all group",
                  isActive 
                    ? "bg-brand text-white shadow-lg shadow-brand/20 font-bold" 
                    : "text-slate-500 hover:bg-white hover:text-brand font-semibold"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5 transition-transform", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="text-sm">{tab.label}</span>
                </div>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full",
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-8 pt-4">
           <button 
             onClick={onClose}
             className="w-full py-3 border border-slate-200 text-slate-500 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all active:scale-[0.98]"
           >
             Return to Jobs
           </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-surface overflow-y-auto min-h-0 relative">
        <header className="sticky top-0 z-10 bg-surface/80 backdrop-blur-xl border-b border-slate-100 px-8 py-6 flex justify-between items-center">
            <h2 className="text-xl font-display font-bold text-slate-900 capitalize flex items-center gap-3">
               {tabs.find(t => t.id === activeTab)?.label}
               {loading && <div className="w-4 h-4 border-2 border-brand/20 border-t-brand rounded-full animate-spin" />}
            </h2>
            <div className="flex items-center gap-3">
              <button 
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                <X className="w-4 h-4" />
                <span>Back to Jobs</span>
              </button>
            </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'applications' && renderApplications()}
              {activeTab === 'documents' && renderDocuments()}
              {activeTab === 'saved' && renderSaved()}
              {activeTab === 'admin_pending' && renderAdminPending()}
              {activeTab === 'employer' && renderEmployerPortal()}
              {activeTab === 'posted' && renderPosted()}
              {activeTab === 'received' && renderReceived()}
              {activeTab === 'alerts' && renderAlerts()}
              {activeTab === 'profile' && renderProfile()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="group bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/40 transition-all text-left flex flex-col h-full active:scale-[0.98]"
    >
      <div className={cn("p-3 rounded-2xl w-fit mb-4 transition-transform group-hover:scale-110", color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-3xl font-display font-bold text-slate-900 mb-1">{value}</p>
        <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{title}</p>
      </div>
    </button>
  );
}

function RecentActivity({ title, items, type, onViewAll, onItemClick }: any) {
  return (
    <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h4 className="font-bold text-slate-900 flex items-center gap-2">
           {title}
        </h4>
        <button 
          onClick={onViewAll}
          className="text-xs font-bold text-brand hover:underline flex items-center gap-1"
        >
          View all <ChevronRight className="w-3 h-3" />
        </button>
      </div>
      
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-center py-8 text-slate-400 text-sm italic">Nothing here yet.</p>
        ) : (
          items.map((item: any) => (
            <button 
              key={item.id} 
              onClick={() => onItemClick?.(item)}
              className={cn(
                "w-full p-4 rounded-2xl border transition-all text-left flex items-center gap-4 group",
                type === 'job' && item.urgent
                  ? "bg-amber-50/50 border-amber-200 hover:border-amber-300 shadow-sm"
                  : "bg-white border-slate-100 hover:border-brand/30"
              )}
            >
               <div className="w-10 h-10 bg-slate-50 rounded-xl overflow-hidden p-1 flex-shrink-0">
                 <img 
                   src={getCompanyLogo(type === 'job' ? item.company : (item.job?.company || ''), type === 'job' ? item.logo : (item.job?.logo || null))} 
                   alt="logo" 
                   className="w-full h-full object-contain"
                   referrerPolicy="no-referrer"
                 />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-900 truncate text-sm group-hover:text-brand transition-colors">
                      {type === 'job' ? item.title : (item.job?.title || 'Unknown Role')}
                    </p>
                    {type === 'job' && item.urgent && (
                      <span className="px-1.5 py-0.5 rounded-full bg-red-50 text-red-500 text-[8px] font-bold uppercase tracking-wider flex-shrink-0">
                        Urgent
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-xs font-medium truncate">
                    {type === 'job' ? item.company : (item.job?.company || 'Unknown Company')}
                  </p>
               </div>
               {type === 'application' && (
                 <span className={cn(
                   "text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-lg border",
                   item.status === 'pending' ? "bg-amber-50 border-amber-100 text-amber-600" : 
                   item.status === 'accepted' ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                   item.status === 'reviewed' ? "bg-blue-50 border-blue-100 text-blue-600" :
                   item.status === 'rejected' ? "bg-rose-50 border-rose-100 text-rose-600" :
                   "bg-slate-100 border-slate-200 text-slate-600"
                 )}>
                   {item.status}
                 </span>
               )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function formatDate(date: any) {
  if (!date) return 'Recently';
  if (date._seconds) {
    return new Date(date._seconds * 1000).toLocaleDateString();
  }
  if (typeof date === 'string') {
    return new Date(date).toLocaleDateString();
  }
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  return 'Recently';
}

function ApplicationRow({ app, onJobClick, isEmployer, onUpdateStatus }: { app: Application; onJobClick: (job: Job) => void; isEmployer?: boolean; onUpdateStatus?: (id: string, status: string) => void; key?: React.Key }) {
  const dateStr = formatDate(app.createdAt);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const statuses = [
    { value: 'pending', label: 'Pending', color: 'bg-amber-50 border-amber-200 text-amber-600' },
    { value: 'reviewed', label: 'Reviewed', color: 'bg-blue-50 border-blue-200 text-blue-600' },
    { value: 'accepted', label: 'Accepted', color: 'bg-emerald-50 border-emerald-200 text-emerald-600' },
    { value: 'rejected', label: 'Rejected', color: 'bg-rose-50 border-rose-200 text-rose-600' },
  ];

  const currentStatus = statuses.find(s => s.value === app.status) || statuses[0];

  return (
    <div 
      onClick={() => !isEmployer && app.job && onJobClick(app.job)}
      className={cn(
        "bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:border-brand/30 transition-all group flex flex-col md:flex-row md:items-center gap-6 relative",
        !isEmployer && "cursor-pointer"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100 overflow-hidden">
          <img 
            src={getCompanyLogo(app.job?.company || '', app.job?.logo)} 
            alt="co" 
            className="w-full h-full object-contain" 
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="min-w-0">
           <h4 className="font-bold text-slate-900 block group-hover:text-brand transition-colors truncate">
              {isEmployer ? app.fullName : (app.job?.title || 'Application')}
           </h4>
           <div className="flex items-center gap-2 flex-wrap">
              <p className="text-slate-500 text-sm font-medium truncate">
                {isEmployer ? app.email : app.job?.company}
              </p>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1 text-slate-400 text-xs"><Clock className="w-3 h-3" /> {dateStr}</span>
           </div>
        </div>
      </div>

      <div className="flex items-center gap-4 self-end md:self-center">
         <div className="relative">
           {isEmployer ? (
             <button
               onClick={() => setShowStatusMenu(!showStatusMenu)}
               className={cn(
                 "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border transition-all hover:scale-105 active:scale-95",
                 currentStatus.color
               )}
             >
               {app.status}
             </button>
           ) : (
             <div className={cn(
               "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border",
               currentStatus.color
             )}>
               {app.status}
             </div>
           )}

           {isEmployer && showStatusMenu && (
             <>
               <div className="fixed inset-0 z-[130]" onClick={() => setShowStatusMenu(false)} />
               <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[140] overflow-hidden animate-in fade-in zoom-in duration-200">
                 {statuses.map((s) => (
                   <button
                     key={s.value}
                     disabled={app.status === s.value}
                     onClick={() => {
                       onUpdateStatus?.(app.id, s.value);
                       setShowStatusMenu(false);
                     }}
                     className={cn(
                       "w-full text-left px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors",
                       app.status === s.value 
                         ? "opacity-30 cursor-not-allowed bg-slate-50" 
                         : "hover:bg-slate-50"
                     )}
                   >
                     {s.label}
                   </button>
                 ))}
               </div>
             </>
           )}
         </div>
         
         <button 
           onClick={() => app.job && onJobClick(app.job)}
           className="p-2 hover:bg-slate-50 rounded-xl transition-colors text-slate-400 hover:text-brand"
           title="View Job"
         >
           <ExternalLink className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
}

function JobRow({ job, onClick, isEmployer }: { job: Job; onClick: (job: Job) => void; isEmployer?: boolean; key?: React.Key }) {
  return (
    <div 
      onClick={() => onClick(job)}
      className={cn(
        "p-5 rounded-3xl border transition-all group flex flex-col md:flex-row md:items-center gap-6 cursor-pointer",
        job.urgent
          ? "bg-amber-50/30 border-amber-200 shadow-sm hover:border-amber-300"
          : "bg-white border-slate-100 shadow-sm hover:border-brand/30"
      )}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border border-slate-100 overflow-hidden">
           <img src={getCompanyLogo(job.company, job.logo)} alt="co" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
        </div>
        <div>
           <div className="flex items-center gap-2">
             <h4 className="font-bold text-slate-900 block group-hover:text-brand transition-colors">
                {job.title}
             </h4>
             {job.urgent && (
               <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-500 text-[10px] font-bold uppercase tracking-wider">
                 Urgent
               </span>
             )}
             {isEmployer && (
               <span className={cn(
                 "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                 job.approved === true 
                   ? "bg-emerald-100/50 text-emerald-700 border-emerald-200" 
                   : "bg-amber-50 text-amber-600 border-amber-100"
               )}>
                 {job.approved === true ? "Approved" : "Pending Approval"}
               </span>
             )}
           </div>
           <p className="text-slate-500 text-sm font-medium flex items-center gap-3">
              {job.company}
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
           </p>
        </div>
      </div>

      <div className="flex items-center gap-4 self-end md:self-center">
         <span className="px-3 py-1 bg-slate-50 rounded-lg text-xs font-bold text-slate-500">
           {job.type}
         </span>
         <button 
           onClick={() => onClick(job)}
           className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all active:scale-[0.98]"
         >
           View Details
         </button>
      </div>
    </div>
  );
}

function AlertRow({ alert }: { alert: any; key?: React.Key }) {
  const f = alert.filters;
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm transition-all flex flex-col md:flex-row md:items-center gap-6 group hover:shadow-xl hover:shadow-slate-200/40 relative">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-100 group-hover:scale-110 transition-transform">
           <Bell className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1 min-w-0">
           <div className="flex items-center justify-between gap-2 mb-1">
             <h4 className="font-bold text-slate-900 truncate">{alert.name}</h4>
             <span className="md:hidden text-[10px] font-black text-brand uppercase tracking-widest">{alert.matchCount || 0} Matches</span>
           </div>
           <div className="flex flex-wrap gap-2">
              {f.searchTerm && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-brand/5 border border-brand/10 text-brand rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  <Target className="w-3 h-3" />
                  "{f.searchTerm}"
                </div>
              )}
              {f.category !== 'All' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  <Briefcase className="w-3 h-3" />
                  {f.category}
                </div>
              )}
              {f.types.length > 0 && f.types.map((t: string) => (
                <div key={t} className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200/50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  <Clock className="w-3 h-3" />
                  {t}
                </div>
              ))}
              {f.salaryRange !== 'Any Salary' && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50/50 border border-emerald-100/50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">
                  <span className="w-3 h-3 flex items-center justify-center font-bold">$</span>
                  {f.salaryRange}
                </div>
              )}
           </div>
        </div>
      </div>
      
      <div className="hidden md:flex items-center gap-6 self-end md:self-center pr-2">
         <div className="text-right">
            <p className="text-2xl font-display font-bold text-slate-900 leading-none mb-0.5">{alert.matchCount || 0}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Matches</p>
         </div>
         <div className="w-px h-10 bg-slate-100" />
         <button className="p-3 bg-slate-50 hover:bg-brand hover:text-white rounded-2xl transition-all text-slate-400 group/btn shadow-sm">
            <Target className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
         </button>
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, actionLabel, action }: any) {
  return (
    <div className="py-20 text-center bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
        <Icon className="w-10 h-10 text-slate-300" />
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 font-medium mb-8 max-w-xs mx-auto">{desc}</p>
      {actionLabel && (
        <button 
          onClick={action}
          className="px-6 py-3 bg-brand text-white rounded-2xl font-bold shadow-xl shadow-brand/20 hover:bg-brand/90 transition-all font-display"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
