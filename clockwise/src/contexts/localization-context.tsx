import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { blocksClient } from '../lib/blocks/client';
import { defaultDictionary } from '../lib/i18n/default-dictionary';

export interface LanguageOption {
  languageName: string;
  languageCode: string;
  isDefault?: boolean;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { languageName: 'English', languageCode: 'en-US', isDefault: true },
  { languageName: 'German', languageCode: 'de-DE', isDefault: false },
  { languageName: 'Bengali', languageCode: 'bn-BD', isDefault: false },
];

const LANGUAGE_STORAGE_KEY = 'clockwise_language';
const MODULE_NAME = 'clockwise';

interface LocalizationContextType {
  currentLanguage: string;
  languages: LanguageOption[];
  isLoading: boolean;
  t: (key: string, fallback?: string) => string;
  changeLanguage: (languageCode: string) => Promise<void>;
  refreshTranslations: () => Promise<void>;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || 'en-US';
  });

  const [languages, setLanguages] = useState<LanguageOption[]>(DEFAULT_LANGUAGES);
  const [dictionary, setDictionary] = useState<Record<string, string>>(defaultDictionary);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Load available languages from Blocks tenant
  useEffect(() => {
    async function fetchLanguages() {
      try {
        const tenantLangs = await blocksClient.localization.languages();
        if (Array.isArray(tenantLangs) && tenantLangs.length > 0) {
          const mapped: LanguageOption[] = tenantLangs.map((l: any) => ({
            languageName: l.languageName || l.name,
            languageCode: l.languageCode || l.code,
            isDefault: Boolean(l.isDefault),
          }));
          setLanguages(mapped);
        }
      } catch (err) {
        console.warn('Could not load tenant languages from Blocks, using defaults:', err);
      }
    }

    fetchLanguages();
  }, []);

  // Load translation dictionary whenever currentLanguage changes
  const loadDictionary = useCallback(async (lang: string) => {
    setIsLoading(true);
    try {
      const loaded = await blocksClient.localization.load(lang, [MODULE_NAME]);
      if (loaded && typeof loaded === 'object' && Object.keys(loaded).length > 0) {
        setDictionary((prev) => ({
          ...prev,
          ...(loaded as Record<string, string>),
        }));
      }
    } catch (err) {
      console.warn(`Could not load translations for ${lang} from Blocks:`, err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDictionary(currentLanguage);
  }, [currentLanguage, loadDictionary]);

  const changeLanguage = useCallback(
    async (code: string) => {
      setCurrentLanguage(code);
      localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
      await loadDictionary(code);
    },
    [loadDictionary]
  );

  const refreshTranslations = useCallback(async () => {
    setIsLoading(true);
    try {
      const tenantLangs = await blocksClient.localization.languages();
      if (Array.isArray(tenantLangs) && tenantLangs.length > 0) {
        const mapped: LanguageOption[] = tenantLangs.map((l: any) => ({
          languageName: l.languageName || l.name,
          languageCode: l.languageCode || l.code,
          isDefault: Boolean(l.isDefault),
        }));
        setLanguages(mapped);
      }
      await loadDictionary(currentLanguage);
    } catch (err) {
      console.warn('Could not refresh translations:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLanguage, loadDictionary]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      return dictionary[key] ?? defaultDictionary[key] ?? fallback ?? key;
    },
    [dictionary]
  );

  return (
    <LocalizationContext.Provider
      value={{
        currentLanguage,
        languages,
        isLoading,
        t,
        changeLanguage,
        refreshTranslations,
      }}
    >
      {children}
    </LocalizationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LocalizationProvider');
  }
  return context;
}
