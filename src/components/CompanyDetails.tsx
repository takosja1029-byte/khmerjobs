import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, Users, Building2, Calendar, MapPin, CheckCircle2, ChevronRight, ExternalLink } from 'lucide-react';
import { Company } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface CompanyDetailsProps {
  companyId: string;
  initialData?: Company | null;
  onLoad?: (company: Company) => void;
}

export default function CompanyDetails({ companyId, initialData, onLoad }: CompanyDetailsProps) {
  const [company, setCompany] = useState<Company | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCompany(initialData);
      setLoading(false);
      return;
    }

    const fetchCompany = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/companies/${companyId}`);
        if (!res.ok) throw new Error('Company not found');
        const data = await res.json();
        setCompany(data);
        if (onLoad) onLoad(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (companyId) {
      fetchCompany();
    }
  }, [companyId, onLoad]);

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-slate-100 rounded-lg" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-24 bg-slate-50 rounded-3xl border border-slate-100" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-4 w-40 bg-slate-100 rounded-lg" />
          <div className="h-32 bg-slate-50 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
        <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <p className="text-slate-500 font-medium">Sorry, we couldn't find detailed information for this company.</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-8"
    >
      {/* Quick Facts Grid */}
      <section>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-brand" />
          Company at a Glance
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: 'Industry', value: company.industry, icon: Building2 },
            { label: 'Company Size', value: company.size, icon: Users },
            { label: 'Founded Year', value: company.founded, icon: Calendar },
            { label: 'Headquarters', value: company.location, icon: MapPin },
            { label: 'Official Website', value: company.website, icon: Globe, isLink: true },
          ].map((item, i) => (
            <div key={i} className="p-5 bg-surface rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-brand/5 flex items-center justify-center text-brand flex-shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                {item.isLink ? (
                  <a 
                    href={item.value} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-sm font-bold text-brand hover:underline flex items-center gap-1 group"
                  >
                    <span className="truncate">{item.value.replace('https://', '').replace('www.', '')}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </a>
                ) : (
                  <p className="text-sm font-bold text-slate-900 truncate">{item.value}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Company */}
      <section>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-brand" />
          About {company.name}
        </h4>
        <div className="prose prose-slate prose-sm max-w-none text-slate-600 leading-relaxed font-medium">
          <p>{company.description}</p>
        </div>
      </section>

      {/* Benefits & Culture */}
      <section>
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-brand" />
          Benefits & Culture
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {company.benefits.map((benefit, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-emerald-300">{benefit}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="pt-4">
        <a 
          href={company.website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand hover:bg-brand/90 text-white text-sm font-bold shadow-lg shadow-brand/20 transition-all group"
        >
          <Globe className="w-4 h-4" />
          Visit Website
          <ExternalLink className="w-3 h-3 opacity-50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>
      </div>
    </motion.div>
  );
}
