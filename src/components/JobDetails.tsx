import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Clock, DollarSign, Briefcase, Share2, Heart, Send, ArrowRight, Upload, FileText, Building2, AlignLeft, Globe, ExternalLink, Users, Check, Pencil, Trash2 } from 'lucide-react';
import { Job } from '@/src/types';
import { cn, getCompanyLogo, getFallbackAvatar, getClearbitLogo } from '@/src/lib/utils';
import CompanyDetails from './CompanyDetails';
import EditJobModal from './EditJobModal';

interface JobDetailsProps {
  job: Job | null;
  onClose: () => void;
  user: { name: string; email: string } | null;
  onOpenAuth: () => void;
  isSaved?: boolean;
  onToggleSave?: () => void;
  onJobStatusChange?: () => void;
}

type Tab = 'description' | 'company';

export default function JobDetails({ job: propJob, onClose, user, onOpenAuth, isSaved, onToggleSave, onJobStatusChange }: JobDetailsProps) {
  const [localJob, setLocalJob] = useState<Job | null>(null);

  useEffect(() => {
    setLocalJob(propJob);
  }, [propJob]);

  const job = localJob;

  const [activeTab, setActiveTab] = useState<Tab>('description');
  const [isApplying, setIsApplying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('Applied via Telegram!');
  const [companyWebsite, setCompanyWebsite] = useState<string | null>(null);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [saveCv, setSaveCv] = useState(false);
  const [savedCvs, setSavedCvs] = useState<any[]>([]);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [cvSource, setCvSource] = useState<'upload' | 'saved'>('upload');
  const [fetchingCvs, setFetchingCvs] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveEdit = async (updatedJob: Job) => {
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${updatedJob.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedJob),
      });
      const data = await res.json();
      if (res.ok) {
        setLocalJob(updatedJob);
        if (onJobStatusChange) onJobStatusChange();
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to save changes' };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred while saving changes' };
    }
  };

  const handleDeleteJob = async () => {
    if (!job) return;
    if (!window.confirm('Are you sure you want to permanently delete this job listing?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${job.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setIsApplying(true);
        setSuccessMessage('Job listing deleted successfully.');
        if (onJobStatusChange) onJobStatusChange();
        setTimeout(() => {
          setIsApplying(false);
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to delete job');
      }
    } catch (err) {
      setError('An error occurred while deleting the job.');
    } finally {
      setLoading(false);
    }
  };

  const [logoLevel, setLogoLevel] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const logoUrl = job ? getCompanyLogo(job.company, job.logo, logoLevel) : null;
  const [companyInfo, setCompanyInfo] = useState<any>(null);

  useEffect(() => {
    const fetchCompanyData = async () => {
      if (!job) return;
      
      setLogoLevel(0);
      setHasFailedAll(false);
      
      // If job already has a website, we can use it immediately
      if (job.website) {
        setCompanyWebsite(job.website);
      }

      try {
        const res = await fetch(`/api/companies/${job.companyId || job.company}`);
        if (res.ok) {
          const data = await res.json();
          setCompanyInfo(data);
          setCompanyWebsite(data.website);
        }
      } catch (err) {
        console.error('Failed to fetch company info', err);
      }
    };

    if (job) {
      setActiveTab('description');
      setCompanyWebsite(null);
      setCompanyInfo(null);
      fetchCompanyData();
    }
  }, [job]);

  useEffect(() => {
    if (showApplyForm && user && savedCvs.length === 0) {
      const fetchCvs = async () => {
        setFetchingCvs(true);
        try {
          const res = await fetch('/api/documents');
          if (res.ok) {
            const data = await res.json();
            setSavedCvs(data);
            if (data.length > 0) {
              setCvSource('saved');
              setSelectedCvId(data[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to fetch CVs', err);
        } finally {
          setFetchingCvs(false);
        }
      };
      fetchCvs();
    }
  }, [showApplyForm, user]);

  const handleImageError = () => {
    if (job) {
      const clearbitUrl = getClearbitLogo(job.company);
      
      // If we already failed level 3 (Avatar), we give up on images
      if (logoLevel >= 3) {
        setHasFailedAll(true);
        return;
      }

      // If we were at level 0, and level 0 already produced the same URL as level 1 (Clearbit), skip level 1
      if (logoLevel === 0 && logoUrl === clearbitUrl) {
        setLogoLevel(2);
      } else {
        setLogoLevel(prev => prev + 1);
      }
    }
  };

  if (!job) return null;

  const handleApply = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }

    if (!fullName || !email || (cvSource === 'upload' ? !cvFile : !selectedCvId)) {
      setError('Please fill in all fields and select or upload your CV before applying.');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('email', email);
    
    if (cvSource === 'upload' && cvFile) {
      formData.append('cv', cvFile);
      if (saveCv) {
        formData.append('saveCv', 'true');
      }
    } else if (cvSource === 'saved' && selectedCvId) {
      formData.append('cvId', selectedCvId);
    }

    try {
      const response = await fetch(`/api/jobs/${job.id}/apply`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage(data.message || 'Applied via Telegram!');
        setIsApplying(true);
        setTimeout(() => {
          setIsApplying(false);
          setShowApplyForm(false);
          setCvFile(null);
        }, 5000); // Allow re-applying after 5 seconds
      } else {
        setError(data.error || 'Failed to send application');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isAdminPending = user?.email === 'takosja1029@gmail.com' && job && !job.approved;

  const handleAdminApprove = async () => {
    if (!job) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setIsApplying(true);
        setSuccessMessage('Job listing approved successfully!');
        if (onJobStatusChange) onJobStatusChange();
        setTimeout(() => {
          setIsApplying(false);
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to approve job');
      }
    } catch (err) {
      setError('An error occurred while approving the job.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminReject = async () => {
    if (!job) return;
    if (!window.confirm('Are you sure you want to reject and permanently delete this job listing?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}/reject`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        setIsApplying(true);
        setSuccessMessage('Job listing rejected and deleted.');
        if (onJobStatusChange) onJobStatusChange();
        setTimeout(() => {
          setIsApplying(false);
          onClose();
        }, 2000);
      } else {
        setError(data.error || 'Failed to reject job');
      }
    } catch (err) {
      setError('An error occurred while rejecting the job.');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = fullName.trim().length > 2 && 
                     email.trim().includes('@') && 
                     (cvSource === 'upload' ? cvFile !== null : selectedCvId !== null);

  return (
    <AnimatePresence>
      <div id="job-details-overlay" className="fixed inset-0 z-[200] flex justify-end">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-zoom-out"
        />
        
        <motion.div
          id="job-details-panel"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="relative w-full max-w-2xl bg-surface shadow-2xl h-full flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-slate-100 transition-colors"
               >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-slate-900">
                {showApplyForm ? 'Submit Application' : 'Job Details'}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              {job && (user?.email === 'takosja1029@gmail.com' || (job.postedBy === user?.email && job.approved)) && !showApplyForm && (
                <>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-indigo-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shadow-sm cursor-pointer"
                    title="Edit Job Listing"
                  >
                    <Pencil className="w-4 h-4" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleDeleteJob}
                    disabled={loading}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
                    title="Delete Job Listing"
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </>
              )}

              <button className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:text-brand transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              {!showApplyForm && (
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onToggleSave}
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-sm",
                    isSaved 
                      ? "bg-rose-50 text-rose-500 border border-rose-100" 
                      : "bg-slate-50 text-slate-500 hover:text-rose-500 hover:bg-rose-50/50 border border-transparent hover:border-rose-100"
                  )}
                >
                  <Heart className={cn("w-4 h-4 transition-transform", isSaved && "fill-rose-500 scale-110")} />
                </motion.button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {showApplyForm ? (
              <div className="p-8">
                <button 
                  onClick={() => setShowApplyForm(false)}
                  className="mb-8 flex items-center gap-2 text-slate-400 hover:text-brand font-bold text-xs uppercase tracking-wider transition-colors"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" />
                  Back to description
                </button>

                <div className="max-w-md">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 flex items-center justify-center">
                      {hasFailedAll ? (
                        <Building2 className="w-5 h-5 text-brand" />
                      ) : (
                        <img 
                          src={logoUrl || undefined} 
                          alt={job.company} 
                          className="w-full h-full object-cover" 
                          onError={handleImageError}
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-tight">Finalize your application</h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Applying for <span className="text-brand font-bold">{job.title}</span> at {job.company}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                      <input 
                        type="text" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-5 outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Choose your CV</label>
                      
                      {savedCvs.length > 0 && (
                        <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl mb-4">
                          <button 
                            type="button"
                            onClick={() => setCvSource('saved')}
                            className={cn(
                              "flex-1 py-2 text-[10px] font-bold rounded-xl transition-all",
                              cvSource === 'saved' ? "bg-surface text-slate-900 shadow-sm" : "text-slate-500"
                            )}
                          >
                            Saved Documents
                          </button>
                          <button 
                            type="button"
                            onClick={() => setCvSource('upload')}
                            className={cn(
                              "flex-1 py-2 text-[10px] font-bold rounded-xl transition-all",
                              cvSource === 'upload' ? "bg-surface text-slate-900 shadow-sm" : "text-slate-500"
                            )}
                          >
                            Upload New
                          </button>
                        </div>
                      )}

                      {cvSource === 'saved' && savedCvs.length > 0 ? (
                        <div className="space-y-3">
                          {savedCvs.map((cv) => (
                            <button
                              key={cv.id}
                              type="button"
                              onClick={() => setSelectedCvId(cv.id)}
                              className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left",
                                selectedCvId === cv.id 
                                  ? "border-brand bg-brand/5 shadow-md shadow-brand/10" 
                                  : "border-slate-100 hover:border-slate-200 bg-surface"
                              )}
                            >
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                selectedCvId === cv.id ? "bg-brand text-white" : "bg-slate-50 text-slate-400"
                              )}>
                                <FileText className="w-5 h-5" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 truncate">{cv.name}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                  Saved {new Date(cv.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                              {selectedCvId === cv.id && (
                                <div className="w-5 h-5 rounded-full bg-brand flex items-center justify-center">
                                  <div className="w-2 h-2 rounded-full bg-white" />
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="relative">
                          <input 
                            type="file" 
                            accept="application/pdf"
                            onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                            className="hidden"
                            id="cv-upload"
                          />
                          <label 
                            htmlFor="cv-upload"
                            className={cn(
                              "w-full bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-8 px-5 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-brand/40 hover:bg-brand/5 transition-all text-center",
                              cvFile && "border-brand bg-brand/5"
                            )}
                          >
                            {cvFile ? (
                              <>
                                <FileText className="w-10 h-10 text-brand" />
                                <div className="text-center">
                                  <p className="text-sm font-bold text-slate-900 truncate max-w-[250px]">{cvFile.name}</p>
                                  <p className="text-[10px] text-slate-500">{(cvFile.size / 1024 / 1024).toFixed(2)} MB • Click to change</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 text-slate-300" />
                                <div className="text-center">
                                  <p className="text-sm font-bold text-slate-600">Click or drag to upload CV</p>
                                  <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">PDF files only (Max 5MB)</p>
                                </div>
                              </>
                            )}
                          </label>
                          
                          {cvFile && (
                            <label className="flex items-center gap-3 mt-4 px-2 cursor-pointer group">
                              <div className="relative flex items-center">
                                <input 
                                  type="checkbox" 
                                  checked={saveCv} 
                                  onChange={(e) => setSaveCv(e.target.checked)}
                                  className="peer appearance-none w-5 h-5 border-2 border-slate-200 rounded-lg checked:bg-brand checked:border-brand transition-all cursor-pointer"
                                />
                                <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform pointer-events-none">
                                  <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                                    <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                                  </svg>
                                </div>
                              </div>
                              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider group-hover:text-slate-700 transition-colors">Save CV to my documents for future use</span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8">
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-3xl overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0 shadow-sm relative group flex items-center justify-center">
                    {hasFailedAll ? (
                      <Building2 className="w-10 h-10 text-brand" />
                    ) : (
                      <img 
                        src={logoUrl || undefined} 
                        alt={job.company} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110" 
                        onError={handleImageError}
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="inline-flex px-2 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-black uppercase tracking-wider mb-2">
                      {job.category}
                    </div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 mb-1 leading-tight">{job.title}</h1>
                    <div className="flex items-center gap-2">
                       <p className="text-lg font-bold text-slate-500">{job.company}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                  <DetailMeta icon={<MapPin />} label="Location" value={job.location} />
                  <DetailMeta icon={<Clock />} label="Type" value={job.type} />
                  <DetailMeta icon={<DollarSign />} label="Salary" value={job.salary} />
                  <DetailMeta icon={<Briefcase />} label="Posted" value={job.postedAt} />
                </div>

                {/* Refined Tabs */}
                <div className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md pt-2 -mx-2 px-2 mb-8">
                  <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                    <button
                      onClick={() => setActiveTab('description')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all relative",
                        activeTab === 'description' 
                          ? "text-slate-900" 
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {activeTab === 'description' && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 bg-surface shadow-sm border border-slate-200/50 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <AlignLeft className={cn("w-4 h-4", activeTab === 'description' ? "text-brand" : "text-slate-400")} />
                        Description
                      </span>
                    </button>
                    <button
                      onClick={() => setActiveTab('company')}
                      className={cn(
                        "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all relative",
                        activeTab === 'company' 
                          ? "text-slate-900" 
                          : "text-slate-500 hover:text-slate-700"
                      )}
                    >
                      {activeTab === 'company' && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute inset-0 bg-surface shadow-sm border border-slate-200/50 rounded-xl"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <Building2 className={cn("w-4 h-4", activeTab === 'company' ? "text-brand" : "text-slate-400")} />
                        Company Info
                      </span>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === 'description' ? (
                    <motion.div
                      key="description"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-10"
                    >
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <span className="w-8 h-px bg-slate-200" />
                          Role Overview
                          <span className="w-8 h-px bg-slate-200" />
                        </h3>
                        <p className="text-slate-600 leading-relaxed font-medium text-base">
                          {job.description}
                        </p>
                      </div>
                      
                      <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                          <Users className="w-4 h-4 text-brand" />
                          Key Requirements
                        </h3>
                        <ul className="grid grid-cols-1 gap-4">
                          {[
                            '3+ years of professional experience in this or related field',
                            'Strong proficiency in core technical requirements',
                            'Excellent communication skills in Khmer and English',
                            'Ability to work effectively in a collaborative environment',
                            'Proven problem-solving skills and attention to detail'
                          ].map((req, i) => (
                            <li key={i} className="flex items-start gap-3 text-slate-600 font-medium text-sm">
                              <div className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0" />
                              {req}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="company"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <CompanyDetails 
                        companyId={job.companyId || job.company} 
                        initialData={companyInfo}
                        onLoad={(data) => {
                          setCompanyWebsite(data.website);
                          setCompanyInfo(data);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0, 
                    scale: 1,
                    x: [0, -4, 4, -4, 4, 0]
                  }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ 
                    duration: 0.3,
                    x: { duration: 0.4, delay: 0.1 }
                  }}
                  className="mb-4 p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl flex items-center gap-3 shadow-sm shadow-red-100"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                  <div className="flex-1">
                    <p className="uppercase tracking-wider opacity-60 text-[8px] mb-0.5">Submission Error</p>
                    {error}
                  </div>
                  <button 
                    onClick={() => setError(null)}
                    className="p-1 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4 opacity-40 hover:opacity-100" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
            
            {isAdminPending ? (
              isApplying ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold gap-2 w-full"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                  <span className="text-xs font-bold leading-tight uppercase tracking-tight">{successMessage}</span>
                </motion.div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3 w-full">
                  <button
                    onClick={handleAdminReject}
                    disabled={loading}
                    className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-3.5 px-6 rounded-2xl font-bold text-sm transition-all border border-rose-200/50 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    Reject listing
                  </button>
                  <button
                    onClick={handleAdminApprove}
                    disabled={loading}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 px-6 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Approve and Publish
                  </button>
                </div>
              )
            ) : isApplying ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-bold gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                <span className="text-xs font-bold leading-tight uppercase tracking-tight">{successMessage}</span>
              </motion.div>
            ) : (
              <motion.button
                whileHover={{ 
                  scale: 1.02,
                  y: -2,
                  boxShadow: "0 20px 25px -5px rgb(59 130 246 / 0.1), 0 8px 10px -6px rgb(59 130 246 / 0.1)"
                }}
                whileTap={{ scale: 0.98 }}
                onClick={showApplyForm ? handleApply : () => setShowApplyForm(true)}
                disabled={loading || (showApplyForm && !isFormValid)}
                className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand/20 flex items-center justify-center gap-2 hover:bg-blue-600 transition-all disabled:opacity-70 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={false}
                />
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <motion.div
                    animate={showApplyForm ? {} : { x: [0, 5, 0] }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                      ease: "easeInOut",
                      repeatDelay: 2
                    }}
                  >
                    <Send className="w-5 h-5" />
                  </motion.div>
                )}
                <span className="relative z-10">
                  {!user 
                    ? 'Sign in to Apply' 
                    : showApplyForm 
                      ? 'Send Application' 
                      : 'Apply for this Position'
                  }
                </span>
              </motion.button>
            )}
          </div>
        </motion.div>
      </div>

      {isEditModalOpen && job && (
        <EditJobModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          job={job}
          onSave={handleSaveEdit}
        />
      )}
    </AnimatePresence>
  );
}

function DetailMeta({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100/50">
      <div className="w-8 h-8 rounded-xl bg-surface flex items-center justify-center text-slate-400 mb-2 shadow-sm">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
      </div>
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-xs font-bold text-slate-900 truncate">{value}</div>
    </div>
  );
}
