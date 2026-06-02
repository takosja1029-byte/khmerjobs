import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getClearbitLogo(company: string): string {
  // Common Cambodia companies domain mapping for better logo resolution
  const domainMap: Record<string, string> = {
    'ABA Bank': 'ababank.com',
    'Grab': 'grab.com',
    'Prudential': 'prudential.com.kh',
    'Coca-Cola': 'cocacola.com',
    'Heineken': 'heineken.com',
    'DHL': 'dhl.com',
    'Nestle': 'nestle.com.kh',
    'Unilever': 'unilever.com',
    'Smart Axiata': 'smart.com.kh',
    'Cellcard': 'cellcard.com.kh',
    'Wing Bank': 'wingbank.com.kh',
    'Manulife': 'manulife.com.kh',
    'PPCBank': 'ppcbank.com.kh',
    'Soma Software': 'soma.com.kh',
    'Vattanac Bank': 'vattanacbank.com',
    'Nham24': 'nham24.com',
    'Sabay Digital': 'sabay.com.kh',
    'Chip Mong Bank': 'chipmongbank.com',
    'Sathapana Bank': 'sathapana.com.kh',
    'ACLEDA Bank': 'acledabank.com.kh',
    'J Trust Royal Bank': 'jtrustroyal.com',
    'Canadia Bank': 'canadiabank.com.kh',
    'Breadstack': 'breadstack.com',
  };

  const domain = domainMap[company] || `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  return `https://logo.clearbit.com/${domain}?size=200`;
}

export function proxifyUrl(url: string, size: number = 200): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  if (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) {
    return trimmed;
  }
  if (trimmed.includes('wsrv.nl') || trimmed.includes('images.weserv.nl')) {
    return trimmed;
  }
  return `https://wsrv.nl/?url=${encodeURIComponent(trimmed)}&w=${size}&fit=contain`;
}

export function getGoogleFavicon(company: string): string {
  const domainMap: Record<string, string> = {
    'ABA Bank': 'ababank.com',
    'Grab': 'grab.com',
    'Prudential': 'prudential.com.kh',
    'Coca-Cola': 'cocacola.com',
    'Heineken': 'heineken.com',
    'DHL': 'dhl.com',
    'Nestle': 'nestle.com.kh',
    'Unilever': 'unilever.com',
    'Smart Axiata': 'smart.com.kh',
    'Cellcard': 'cellcard.com.kh',
    'Wing Bank': 'wingbank.com.kh',
    'Manulife': 'manulife.com.kh',
    'PPCBank': 'ppcbank.com.kh',
    'Soma Software': 'soma.com.kh',
    'Vattanac Bank': 'vattanacbank.com',
    'Nham24': 'nham24.com',
    'Sabay Digital': 'sabay.com.kh',
    'Chip Mong Bank': 'chipmongbank.com',
    'Sathapana Bank': 'sathapana.com.kh',
    'ACLEDA Bank': 'acledabank.com.kh',
    'J Trust Royal Bank': 'jtrustroyal.com',
    'Canadia Bank': 'canadiabank.com.kh',
    'Breadstack': 'breadstack.com',
  };

  const domain = domainMap[company] || `${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  return `https://t3.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${domain}&size=128`;
}

/**
 * Resolves a company logo with a fallback hierarchy.
 * @param company The company name.
 * @param providedUrl An optional provided logo URL.
 * @param level The fallback level: 0 = Priority/Provided, 1 = Clearbit, 2 = Google Favicon, 3 = Avatar.
 */
export function getCompanyLogo(company: string, providedUrl?: string | null, level: number = 0): string {
  const name = company ? company.trim() : '';

  // Priority 1: User-uploaded base64 or custom URL from form inputs
  const isCustomUrl = providedUrl && 
                      (providedUrl.startsWith('http') || providedUrl.startsWith('data:image/')) && 
                      providedUrl.length > 10 && 
                      !providedUrl.includes('placeholder') && 
                      !providedUrl.includes('broken') &&
                      !providedUrl.includes('unsplash.com');

  if (isCustomUrl && level === 0) {
    return proxifyUrl(providedUrl as string);
  }

  const officialLogos: Record<string, string> = {
    'ABA Bank': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/ABA_Bank_Logo.svg/512px-ABA_Bank_Logo.svg.png',
    'Grab': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Grab_logo.svg/512px-Grab_logo.svg.png',
    'Prudential': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Prudential_PLC_logo.svg/512px-Prudential_PLC_logo.svg.png',
    'Coca-Cola': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Coca-Cola_logo.svg/512px-Coca-Cola_logo.svg.png',
    'Unilever': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Unilever.svg/512px-Unilever.svg.png',
    'Heineken': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Heineken_logo.svg/512px-Heineken_logo.svg.png',
    'DHL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b9/DHL_Logo.svg/512px-DHL_Logo.svg.png',
    'Nestle': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Nestl%C3%A9_logo.svg/512px-Nestl%C3%A9_logo.svg.png',
    'Manulife': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Manulife_logo.svg/512px-Manulife_logo.svg.png',
    'Smart Axiata': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Smart_Axiata_Logo.svg/512px-Smart_Axiata_Logo.svg.png',
    'Cellcard': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Cellcard_logo.png/512px-Cellcard_logo.png',
    'Wing Bank': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Wing_Bank_Logo_2021.svg/512px-Wing_Bank_Logo_2021.svg.png',
    'PPCBank': 'https://www.ppcbank.com.kh/wp-content/themes/ppcb/assets/images/logo.png',
    'Soma Software': 'https://logo.clearbit.com/soma.com.kh?size=200',
    'Vattanac Bank': 'https://logo.clearbit.com/vattanacbank.com?size=200',
    'Sabay Digital': 'https://logo.clearbit.com/sabay.com.kh?size=200',
    'Nham24': 'https://logo.clearbit.com/nham24.com?size=200',
  };

  // Exact match
  if (level === 0 && officialLogos[name]) {
    return proxifyUrl(officialLogos[name]);
  }

  // Case-insensitive match or custom fuzzy match (avoid matching short common terms too aggresively)
  if (level === 0) {
    for (const [key, val] of Object.entries(officialLogos)) {
      const keyLower = key.toLowerCase();
      const nameLower = name.toLowerCase();

      if (nameLower === keyLower) {
        return proxifyUrl(val);
      }

      const commonTerms = ['bank', 'software', 'digital', 'delivery'];
      const isCommonTerm = commonTerms.includes(nameLower);

      if (!isCommonTerm && nameLower.length > 3) {
        if (nameLower.includes(keyLower) || keyLower.includes(nameLower)) {
          return proxifyUrl(val);
        }
      }
    }
  }

  // Level 0: Try Provided URL. Fallback to Clearbit if missing/invalid.
  if (level === 0) {
    const isUrlValid = providedUrl && 
                      (providedUrl.startsWith('http') || providedUrl.startsWith('data:image/')) && 
                      providedUrl.length > 10 && 
                      !providedUrl.includes('placeholder') && 
                      !providedUrl.includes('broken');
    
    if (isUrlValid) {
      return proxifyUrl(providedUrl as string);
    }
    // If provided URL is invalid, we return the Level 1 choice (Clearbit)
    return proxifyUrl(getClearbitLogo(name));
  }

  // Level 1: Try Clearbit.
  if (level === 1) {
    return proxifyUrl(getClearbitLogo(name));
  }

  // Level 2: Try Google Favicon.
  if (level === 2) {
    return getGoogleFavicon(name);
  }

  // Level 3 (or default): Fallback to Avatar.
  return getFallbackAvatar(name);
}

export function getFallbackAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=200`;
}
