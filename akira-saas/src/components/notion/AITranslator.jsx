import { useState } from 'react'
import { Languages, Loader } from 'lucide-react'
import { motion } from 'framer-motion'

const LANGUAGES = {
  es: 'Español',
  en: 'English',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ja: '日本語',
  zh: '中文',
  ko: '한국어',
}

export function AITranslator({ pageContent = '', onTranslate }) {
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [isTranslating, setIsTranslating] = useState(false)
  const [translatedContent, setTranslatedContent] = useState('')
  const [showTranslator, setShowTranslator] = useState(false)

  const handleTranslate = async () => {
    setIsTranslating(true)

    // Simular traducción con API
    setTimeout(() => {
      const translations = {
        es: 'Contenido traducido al español',
        en: 'Content translated to English',
        fr: 'Contenu traduit en français',
      }

      setTranslatedContent(translations[selectedLanguage] || 'Traducción completa')
      setIsTranslating(false)
    }, 1000)

    onTranslate?.(selectedLanguage, pageContent)
  }

  return (
    <div className="relative">
      {/* Translator button in topbar */}
      <button
        onClick={() => setShowTranslator(!showTranslator)}
        className="p-2 hover:bg-surface-2 rounded transition-colors text-text-3 hover:text-text-1 flex items-center gap-1 text-sm"
        title="Traducir"
      >
        <Languages size={18} />
        <span className="hidden sm:inline">Traducir</span>
      </button>

      {/* Translator panel */}
      {showTranslator && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-96 bg-surface-0 border border-surface-2 rounded-lg shadow-xl z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-surface-2">
            <h3 className="font-semibold text-text-1 flex items-center gap-2">
              <Languages size={18} />
              Traductor IA
            </h3>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Original */}
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-2">Idioma original</label>
              <div className="bg-surface-1 border border-surface-2 rounded p-3 min-h-24 max-h-32 overflow-y-auto">
                <p className="text-sm text-text-1">{pageContent || 'Contenido de la página...'}</p>
              </div>
            </div>

            {/* Language selector */}
            <div>
              <label className="text-xs font-semibold text-text-2 block mb-2">Traducir a:</label>
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="w-full px-3 py-2 bg-surface-1 border border-surface-2 rounded text-text-1 text-sm focus:outline-none focus:border-blue-500"
              >
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {/* Translate button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleTranslate}
              disabled={isTranslating}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-surface-2 disabled:text-text-3 text-white rounded transition-colors font-medium"
            >
              {isTranslating ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  Traduciendo...
                </>
              ) : (
                <>
                  <Languages size={16} />
                  Traducir
                </>
              )}
            </motion.button>

            {/* Translation result */}
            {translatedContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <label className="text-xs font-semibold text-text-2 block mb-2">
                  Traducción ({LANGUAGES[selectedLanguage]})
                </label>
                <div className="bg-green-600/10 border border-green-600/30 rounded p-3 min-h-24 max-h-32 overflow-y-auto">
                  <p className="text-sm text-text-1">{translatedContent}</p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-3 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded text-sm font-medium transition-colors"
                >
                  📋 Copiar traducción
                </motion.button>
              </motion.div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-surface-2 text-xs text-text-3">
            <p>💡 Powered by Google Translate API</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
