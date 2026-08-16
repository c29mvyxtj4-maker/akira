import { useLanguage } from '@/shared/hooks/useLanguage'
import { motion } from 'framer-motion'

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage()

  const languages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ca', name: 'Català', flag: '🇦🇩' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
  ]

  return (
    <div className="flex gap-1 p-1 bg-surface-2 rounded-lg">
      {languages.map((lang) => (
        <motion.button
          key={lang.code}
          onClick={() => changeLanguage(lang.code)}
          className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
            language === lang.code
              ? 'bg-brand-500 text-white'
              : 'bg-transparent text-text-2 hover:bg-surface-3'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title={lang.name}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.code.toUpperCase()}
        </motion.button>
      ))}
    </div>
  )
}
