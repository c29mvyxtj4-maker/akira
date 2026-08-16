import { createContext, useState, useEffect } from 'react'

export const LanguageContext = createContext()

const translations = {
  es: {
    // Navigation
    home: 'Inicio',
    messages: 'Mensajes',
    mentions: 'Menciones',
    meetings: 'Reuniones',
    search: 'Buscar',

    // Dashboard/Inicio
    yourBusiness: 'Tu negocio de un vistazo',
    financialSummary: 'Resumen financiero',
    income: 'Ingresos',
    expenses: 'Gastos',
    netProfit: 'Beneficio neto',
    pendingInvoices: 'Facturas pendientes',
    mrr: 'MRR',
    activeClients: 'Clientes activos',
    projects: 'Proyectos',
    monthIncome: 'Ingresos mes',
    quickAccess: 'Accesos rápidos',
    commandCenter: 'Centro de mando',
    clients: 'Clientes',
    finances: 'Finanzas',
    invoices: 'Facturas',
    calendar: 'Calendario',

    // Finance
    incomeExpenses: 'Ingresos, gastos y rentabilidad del negocio',
    exportCsv: 'Exportar CSV',
    newMovement: 'Nuevo movimiento',
    totalIncome: 'Ingresos totales',
    totalExpenses: 'Gastos totales',
    pendingPayment: 'Por cobrar',
    evolution: 'Evolución últimos 5 meses',
    clientRanking: 'Ranking de clientes',
    thisMonthIncome: 'Ingresos este mes',
    lastMonthTrend: '% vs mes anterior',
    documents: 'Documentos',
    documentsSub: 'Gestion Notion integrada',

    // Projects
    projectsList: 'Proyectos',
    activeProjects: 'proyectos activos',
    list: 'Lista',
    kanban: 'Kanban',
    newProject: 'Nuevo proyecto',
    selectProject: 'Selecciona un proyecto',
    clickProject: 'Haz clic en un proyecto de la lista.',
    completed: 'Completados',

    // Inicio page specific
    commandCenterSub: 'KPIs y atención hoy',
    clientsSub: 'Cuentas y portal',
    projectsSub: 'Kanban y entregas',
    financesSub: 'Ingresos y gastos',
    invoicesSub: 'Cobros y PDF',
    calendarSub: 'Agenda y eventos',
    timeTracking: 'Time tracking',
    knowledgeBase: 'Base de conocimiento',

    // Common
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    add: 'Agregar',
    close: 'Cerrar',
    settings: 'Configuración',
    language: 'Idioma',
    currency: '€',
    currencyName: 'Euro',
    thisMonth: 'Este mes',
    lastMonth: 'Mes anterior',
    percentage: '%',
  },
  ca: {
    // Navigation
    home: 'Inici',
    messages: 'Missatges',
    mentions: 'Mencions',
    meetings: 'Reunions',
    search: 'Cercar',

    // Dashboard/Inicio
    yourBusiness: 'El teu negoci d\'una ullada',
    financialSummary: 'Resum financer',
    income: 'Ingressos',
    expenses: 'Despeses',
    netProfit: 'Benefici net',
    pendingInvoices: 'Factures pendents',
    mrr: 'MRR',
    activeClients: 'Clients actius',
    projects: 'Projectes',
    monthIncome: 'Ingressos mes',
    quickAccess: 'Accés ràpid',
    commandCenter: 'Centre de manament',
    clients: 'Clients',
    finances: 'Finances',
    invoices: 'Factures',
    calendar: 'Calendari',

    // Finance
    incomeExpenses: 'Ingressos, despeses i rendibilitat del negoci',
    exportCsv: 'Exportar CSV',
    newMovement: 'Nou moviment',
    totalIncome: 'Ingressos totals',
    totalExpenses: 'Despeses totals',
    pendingPayment: 'Per cobrar',
    evolution: 'Evolució últims 5 mesos',
    clientRanking: 'Ranking de clients',
    thisMonthIncome: 'Ingressos aquest mes',
    lastMonthTrend: '% vs mes anterior',
    documents: 'Documents',
    documentsSub: 'Gestió Notion integrada',

    // Projects
    projectsList: 'Projectes',
    activeProjects: 'projectes actius',
    list: 'Llista',
    kanban: 'Kanban',
    newProject: 'Nou projecte',
    selectProject: 'Selecciona un projecte',
    clickProject: 'Feu clic en un projecte de la llista.',
    completed: 'Completats',

    // Inicio page specific
    commandCenterSub: 'KPIs i atenció avui',
    clientsSub: 'Comptes i portal',
    projectsSub: 'Kanban i lliuraments',
    financesSub: 'Ingressos i despeses',
    invoicesSub: 'Cobraments i PDF',
    calendarSub: 'Agenda i events',
    timeTracking: 'Seguiment de temps',
    knowledgeBase: 'Base de coneixement',

    // Common
    loading: 'Carregant...',
    error: 'Error',
    success: 'Èxit',
    save: 'Guardar',
    cancel: 'Cancel·lar',
    delete: 'Suprimir',
    edit: 'Editar',
    add: 'Afegir',
    close: 'Tancar',
    settings: 'Configuració',
    language: 'Idioma',
    currency: '€',
    currencyName: 'Euro',
    thisMonth: 'Aquest mes',
    lastMonth: 'Mes anterior',
    percentage: '%',
  },
  en: {
    // Navigation
    home: 'Home',
    messages: 'Messages',
    mentions: 'Mentions',
    meetings: 'Meetings',
    search: 'Search',

    // Dashboard/Inicio
    yourBusiness: 'Your business at a glance',
    financialSummary: 'Financial summary',
    income: 'Income',
    expenses: 'Expenses',
    netProfit: 'Net profit',
    pendingInvoices: 'Pending invoices',
    mrr: 'MRR',
    activeClients: 'Active clients',
    projects: 'Projects',
    monthIncome: 'Monthly income',
    quickAccess: 'Quick access',
    commandCenter: 'Command center',
    clients: 'Clients',
    finances: 'Finances',
    invoices: 'Invoices',
    calendar: 'Calendar',

    // Finance
    incomeExpenses: 'Income, expenses and business profitability',
    exportCsv: 'Export CSV',
    newMovement: 'New movement',
    totalIncome: 'Total income',
    totalExpenses: 'Total expenses',
    pendingPayment: 'To collect',
    evolution: 'Evolution last 5 months',
    clientRanking: 'Client ranking',
    thisMonthIncome: 'Income this month',
    lastMonthTrend: '% vs last month',
    documents: 'Documents',
    documentsSub: 'Integrated Notion management',

    // Projects
    projectsList: 'Projects',
    activeProjects: 'active projects',
    list: 'List',
    kanban: 'Kanban',
    newProject: 'New project',
    selectProject: 'Select a project',
    clickProject: 'Click on a project in the list.',
    completed: 'Completed',

    // Inicio page specific
    commandCenterSub: 'KPIs and focus today',
    clientsSub: 'Accounts and portal',
    projectsSub: 'Kanban and deliverables',
    financesSub: 'Income and expenses',
    invoicesSub: 'Collections and PDF',
    calendarSub: 'Agenda and events',
    timeTracking: 'Time tracking',
    knowledgeBase: 'Knowledge base',

    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add',
    close: 'Close',
    settings: 'Settings',
    language: 'Language',
    currency: '$',
    currencyName: 'Dollar',
    thisMonth: 'This month',
    lastMonth: 'Last month',
    percentage: '%',
  },
}

const currencySymbols = {
  es: '€',
  ca: '€',
  en: '$',
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('language') || 'es'
    }
    return 'es'
  })

  useEffect(() => {
    localStorage.setItem('language', language)
    document.documentElement.lang = language
  }, [language])

  const t = (key) => translations[language][key] || key

  const getCurrency = () => currencySymbols[language]

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang)
    }
  }

  return (
    <LanguageContext.Provider value={{ language, t, changeLanguage, getCurrency }}>
      {children}
    </LanguageContext.Provider>
  )
}
