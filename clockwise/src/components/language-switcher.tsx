import { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../contexts/localization-context';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';

interface LanguageSwitcherProps {
  variant?: 'minimal' | 'sidebar' | 'pill';
  className?: string;
}

const LANGUAGE_FLAGS: Record<string, string> = {
  'en-US': '🇺🇸',
  'en': '🇺🇸',
  'de-DE': '🇩🇪',
  'de': '🇩🇪',
  'bn-BD': '🇧🇩',
  'bn': '🇧🇩',
};

const LANGUAGE_LABELS: Record<string, string> = {
  'en-US': 'English',
  'en': 'English',
  'de-DE': 'Deutsch',
  'de': 'Deutsch',
  'bn-BD': 'বাংলা',
  'bn': 'বাংলা',
};

export function LanguageSwitcher({ variant = 'minimal', className }: LanguageSwitcherProps) {
  const { currentLanguage, languages, changeLanguage, isLoading } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentFlag = LANGUAGE_FLAGS[currentLanguage] || '🌐';
  const currentLabel =
    LANGUAGE_LABELS[currentLanguage] ||
    languages.find((l) => l.languageCode === currentLanguage)?.languageName ||
    currentLanguage;

  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-2 rounded-lg text-sm font-medium transition-colors cursor-pointer',
          variant === 'sidebar' &&
            'w-full justify-between bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100 border border-slate-200/70',
          variant === 'minimal' &&
            'border border-slate-200 bg-white px-2.5 py-1.5 text-slate-700 hover:bg-slate-50 shadow-xs',
          variant === 'pill' &&
            'rounded-full border border-slate-200 bg-white/90 backdrop-blur-xs px-3 py-1.5 text-slate-700 hover:bg-white shadow-xs'
        )}
      >
        <span className="flex items-center gap-1.5">
          <span className="text-base leading-none">{currentFlag}</span>
          <span className="text-xs font-medium">{currentLabel}</span>
        </span>
        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 text-slate-400 transition-transform duration-150',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-1 min-w-[150px] rounded-xl border border-slate-200 bg-white p-1 shadow-lg animate-in fade-in-50 zoom-in-95',
            variant === 'sidebar' ? 'bottom-full mb-1 left-0 right-0' : 'right-0'
          )}
        >
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Select Language
          </div>
          {languages.map((lang) => {
            const isSelected = lang.languageCode === currentLanguage;
            const flag = LANGUAGE_FLAGS[lang.languageCode] || '🌐';
            const nativeLabel = LANGUAGE_LABELS[lang.languageCode] || lang.languageName;

            return (
              <button
                key={lang.languageCode}
                type="button"
                onClick={() => {
                  changeLanguage(lang.languageCode);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-slate-700 hover:bg-slate-100'
                )}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm">{flag}</span>
                  <span>{nativeLabel}</span>
                </span>
                {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
