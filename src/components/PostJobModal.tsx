import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Briefcase, MapPin, DollarSign, Send, LayoutGrid, Upload, Trash2 } from 'lucide-react';
import { Job, JobType, Category } from '@/src/types';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPost: (job: Job) => Promise<{ success: boolean; approved?: boolean; error?: string }>;
}

export default function PostJobModal({ isOpen, onClose, onPost }: PostJobModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [awaitingApproval, setAwaitingApproval] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: 'Phnom Penh',
    salary: '',
    type: JobType.FULL_TIME,
    category: Category.DEVELOPMENT,
    description: '',
    logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&q=80',
    website: '',
  });

  useEffect(() => {
    if (isOpen) {
      const loadCompProfile = async () => {
        try {
          const res = await fetch('/api/companies/mine');
          if (res.ok) {
            const profile = await res.json();
            if (profile) {
              setFormData(prev => ({
                ...prev,
                company: profile.name || prev.company,
                logo: profile.logo || prev.logo,
                website: profile.website || prev.website,
              }));
            }
          }
        } catch (err) {
          console.error('Failed to prefill company profile in PostJobModal:', err);
        }
      };
      loadCompProfile();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    const newJob: Job = {
      ...formData,
      id: '', // Server will assign
      logo: formData.logo || `https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&q=80`,
      postedAt: 'Just now',
      urgent: false,
    };

    try {
      const result = await onPost(newJob);
      
      if (result.success) {
        setSuccess(true);
        setAwaitingApproval(!result.approved);
        setFormData({
          title: '',
          company: '',
          location: 'Phnom Penh',
          salary: '',
          type: JobType.FULL_TIME,
          category: Category.DEVELOPMENT,
          description: '',
          logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop&q=80',
        });
        
        setTimeout(() => {
          setSuccess(false);
          setAwaitingApproval(false);
          onClose();
        }, 3000);
      } else {
        setError(result.error || 'Failed to post job. Please try again or check your connection.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while posting.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed for company logo.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file is too large. Max 5MB allowed.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 200;
        const MAX_HEIGHT = 200;
        const width = img.width;
        const height = img.height;

        // Perfect square crop centered around middle
        const size = Math.min(width, height);
        const xOffset = (width - size) / 2;
        const yOffset = (height - size) / 2;

        canvas.width = MAX_WIDTH;
        canvas.height = MAX_HEIGHT;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, xOffset, yOffset, size, size, 0, 0, MAX_WIDTH, MAX_HEIGHT);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          setFormData(prev => ({ ...prev, logo: dataUrl }));
          setError(null);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-surface rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8 bg-surface sticky top-0 z-10 pt-2 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-2xl font-display font-bold text-slate-900">Post a New Job</h2>
                  <p className="text-slate-500 text-sm font-medium">Reach top talent in Cambodia</p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-medium rounded-2xl flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Job Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="e.g. Senior React Developer"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Name</label>
                    <input
                      required
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="e.g. Soma Software"
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        placeholder="e.g. Phnom Penh"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Salary Range</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        required
                        name="salary"
                        value={formData.salary}
                        onChange={handleChange}
                        placeholder="e.g. $1,000 - $2,000"
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Job Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all"
                    >
                      {Object.values(JobType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Category</label>
                    <div className="relative">
                       <LayoutGrid className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-11 pr-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all appearance-none"
                      >
                        {Object.values(Category).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <div className="flex flex-col gap-3">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Company Logo File</label>
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white border-2 border-slate-100 shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                        {formData.logo ? (
                          <img src={formData.logo} alt="Logo Preview" className="w-full h-full object-contain" />
                        ) : (
                          <Briefcase className="w-5 h-5 text-slate-300" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label 
                          htmlFor="logo-file-upload" 
                          className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-bold text-slate-600 transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 w-max"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-400" />
                          Choose Logo File
                        </label>
                        <input 
                          id="logo-file-upload"
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload}
                          className="hidden" 
                        />
                        <p className="text-[10px] text-slate-400 font-medium">PNG, JPG up to 5MB</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Or Logo Image URL</label>
                    <input
                      name="logo"
                      value={formData.logo}
                      onChange={handleChange}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-white border border-slate-100 rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all font-mono text-[11px]"
                    />
                    {formData.logo && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, logo: '' }))}
                        className="mt-1.5 text-[10px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Clear Logo
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Company Website (Optional)</label>
                  <input
                    name="website"
                    value={formData.website || ''}
                    onChange={handleChange}
                    placeholder="https://www.company.com"
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Description</label>
                  <textarea
                    required
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the role and responsibilities..."
                    className="w-full bg-slate-50 border-none rounded-2xl py-3 px-4 text-sm focus:ring-2 focus:ring-brand/20 transition-all resize-none"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-brand text-white py-4 rounded-2xl font-bold shadow-xl shadow-brand/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : success ? (
                    <div className="flex items-center gap-2">
                       <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                         <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                       </div>
                       {awaitingApproval ? 'Submitted! Awaiting admin approval' : 'Posted Successfully!'}
                    </div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Post Job Listing
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
