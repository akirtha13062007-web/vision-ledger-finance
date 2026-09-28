import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type Language = 'en' | 'ta'

const translations = {
  en: {
    appName: 'Vision Ledger',
    tagline: 'Smart Finance. Smarter Future.',
    dashboard: 'Dashboard',
    scan: 'Scan',
    transactions: 'Transactions',
    budget: 'Budget',
    insights: 'AI Insights',
    analytics: 'Analytics',
    reports: 'Reports',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    logout: 'Logout',
    addExpense: 'Add Expense',
    addIncome: 'Add Income',
    totalBalance: 'Total Balance',
    monthlyIncome: 'Monthly Income',
    monthlyExpenses: 'Monthly Expenses',
    savings: 'Savings',
    recentTransactions: 'Recent Transactions',
    financialHealth: 'Financial Health',
    upcomingBills: 'Upcoming Bills',
    todaysTip: "Today's Tip",
  },
  ta: {
    appName: 'விஷன் லெட்ஜர்',
    tagline: 'சிறந்த நிதி. சிறந்த எதிர்காலம்.',
    dashboard: 'டாஷ்போர்டு',
    scan: 'ஸ்கேன்',
    transactions: 'பரிவர்த்தனைகள்',
    budget: 'பட்ஜெட்',
    insights: 'AI நுண்ணறிவு',
    analytics: 'பகுப்பாய்வு',
    reports: 'அறிக்கைகள்',
    notifications: 'அறிவிப்புகள்',
    profile: 'சுயவிவரம்',
    settings: 'அமைப்புகள்',
    help: 'உதவி',
    logout: 'வெளியேறு',
    addExpense: 'செலவு சேர்',
    addIncome: 'வருமானம் சேர்',
    totalBalance: 'மொத்த இருப்பு',
    monthlyIncome: 'மாத வருமானம்',
    monthlyExpenses: 'மாத செலவுகள்',
    savings: 'சேமிப்பு',
    recentTransactions: 'சமீபத்திய பரிவர்த்தனைகள்',
    financialHealth: 'நிதி ஆரோக்கியம்',
    upcomingBills: 'வரவிருக்கும் பில்கள்',
    todaysTip: 'இன்றைய குறிப்பு',
  },
} as const

type TranslationKey = keyof typeof translations.en

type LanguageContextValue = {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('vision-ledger-language')
    return saved === 'ta' ? 'ta' : 'en'
  })

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage)
    localStorage.setItem('vision-ledger-language', nextLanguage)
  }

  const value = useMemo(
    () => ({
      language,
      setLanguage: changeLanguage,
      t: (key: TranslationKey) => translations[language][key],
    }),
    [language],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }

  return context
}