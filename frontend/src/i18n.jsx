import React, { createContext, useContext, useEffect, useState } from 'react'

const translations = {
  en: {
    brand: 'CRM - Cold Calls',
    pending: 'Pending',
    registrations: 'Registrations',
    login: 'Login',
    register: 'Register',
    addClient: 'Add Client',
    name: 'Name',
    company: 'Company',
    phone: 'Phone',
    email: 'Email',
    notes: 'Notes',
    search: 'Search...',
    searchBtn: 'Search',
    clear: 'Clear',
    addClientBtn: 'Add client',
    clients: 'Clients',
    logout: 'Logout',
    table: { name: 'Name', company: 'Company', phone: 'Phone', email: 'Email', status: 'Status', last: 'Last note', actions: 'Actions' },
    noteModalTitle: 'Add Note',
    statusModalTitle: 'Update Status',
    toast: { 
      clientAdded: 'Client added', 
      deleted: 'Deleted', 
      statusUpdated: 'Status updated', 
      serverRejected: 'Server rejected',
      userApproved: 'approved',
      userDenied: 'denied',
      approveFailed: 'Approve failed',
      denyFailed: 'Deny failed',
      registrationSuccess: 'Registration submitted and pending admin approval.'
    },
    confirm: { deleteClient: 'Delete client?', deleteNote: 'Delete note?' },
    prompt: { editNote: 'Edit note:' },
    back: 'Back',
    changeStatus: 'Change status',
    contactDetails: 'Contact details',
    lastContact: 'Last contact',
    never: 'never',
    addNote: 'Add note',
    saveNote: 'Save note',
    save: 'Save',
    cancel: 'Cancel',
    notesHistory: 'Notes history',
    noNotes: 'No notes yet',
    actions: 'Actions',
    returnToList: 'Return to list',
    deleteClientBtn: 'Delete client',
    call: 'Call',
    emailBtn: 'Email',
    password: 'Password',
    user: 'User',
    approve: 'Approve',
    deny: 'Deny',
    requestedRole: 'Requested Role',
    roleYouAreRequesting: 'Role you are requesting',
    serverError: 'Server returned',
    connectionError: 'Failed to connect to backend (is server running at',
    roles: { sales_agent: 'Sales agent', agent_manager: 'Agent manager', big_boss: 'Big boss' },
    status: { New: 'New', Contacted: 'Contacted', Interested: 'Interested', NotInterested: 'Not interested', DoNotCall: 'Do not call' },
    loginWelcome: 'Welcome back! Please sign in to continue.',
    registerWelcome: 'Create your account to get started',
    enterUsername: 'Enter your username',
    enterPassword: 'Enter your password',
    chooseUsername: 'Choose a username',
    enterEmail: 'Enter your email',
    createPassword: 'Create a strong password',
    orDivider: 'or',
    continueWithGoogle: 'Continue with Google',
    signUpWithGoogle: 'Sign up with Google',
    noAccount: "Don't have an account? ",
    haveAccount: 'Already have an account? ',
    switchToDarkMode: 'Switch to dark mode',
    switchToLightMode: 'Switch to light mode',
    superAdmin: 'Super-Admin',
    userManagement: 'User Management',
    activeUsers: 'Active Users',
    pendingRegistrations: 'Pending Registrations',
    username: 'Username',
    userRoles: 'Roles',
    deleteUser: 'Delete',
    disableUser: 'Disable',
    confirmDeleteUser: 'Are you sure you want to delete this user?',
    confirmDisableUser: 'Are you sure you want to disable this user?',
    userDeleted: 'User deleted successfully',
    userDisabled: 'User disabled successfully',
    deleteFailed: 'Delete failed',
    disableFailed: 'Disable failed',
    noActiveUsers: 'No active users',
    noPendingUsers: 'No pending registrations',
    assignedAgent: 'Assigned Agent',
    unassigned: 'Unassigned',
    assignmentUpdated: 'Assignment updated',
    error: 'Error'
  },
  he: {
    brand: 'CRM - שיחות קרות',
    pending: 'ממתינים',
    registrations: 'רשומות',
    login: 'התחבר',
    register: 'הרשם',
    addClient: 'הוסף לקוח',
    name: 'שם',
    company: 'חברה',
    phone: 'טלפון',
    email: 'דוא"ל',
    notes: 'הערות',
    search: 'חפש...',
    searchBtn: 'חפש',
    clear: 'נקה',
    addClientBtn: 'הוסף לקוח',
    clients: 'לקוחות',
    logout: 'התנתק',
    table: { name: 'שם', company: 'חברה', phone: 'טלפון', email: 'דוא"ל', status: 'סטטוס', last: 'הערה אחרונה', actions: 'פעולות' },
    noteModalTitle: 'הוסף הערה',
    statusModalTitle: 'עדכון סטטוס',
    toast: { 
      clientAdded: 'הלקוח נוסף', 
      deleted: 'הוסר', 
      statusUpdated: 'הסטטוס עודכן', 
      serverRejected: 'השרת דחה',
      userApproved: 'אושר',
      userDenied: 'נדחה',
      approveFailed: 'האישור נכשל',
      denyFailed: 'הדחייה נכשלה',
      registrationSuccess: 'ההרשמה נשלחה וממתינה לאישור מנהל.'
    },
    confirm: { deleteClient: 'האם למחוק את הלקוח?', deleteNote: 'האם למחוק את ההערה?' },
    prompt: { editNote: 'ערוך הערה:' },
    back: 'חזור',
    changeStatus: 'שנה סטטוס',
    contactDetails: 'פרטי קשר',
    lastContact: 'יצירת קשר אחרונה',
    never: 'אף פעם',
    addNote: 'הוסף הערה',
    saveNote: 'שמור הערה',
    save: 'שמור',
    cancel: 'ביטול',
    notesHistory: 'היסטוריית הערות',
    noNotes: 'אין הערות',
    actions: 'פעולות',
    returnToList: 'חזור לרשימה',
    deleteClientBtn: 'מחק לקוח',
    call: 'התקשר',
    emailBtn: 'שלח מייל',
    password: 'סיסמה',
    user: 'משתמש',
    approve: 'אשר',
    deny: 'סרב',
    requestedRole: 'תפקיד מבוקש',
    roleYouAreRequesting: 'תפקיד שאתה מבקש',
    serverError: 'השרת החזיר',
    connectionError: 'כישלון בהתחברות לשרת (האם השרת רץ ב',
    roles: { sales_agent: 'נציג מכירות', agent_manager: 'מנהל נציגים', big_boss: 'מנהל על' },
    status: { New: 'חדש', Contacted: 'יצרו קשר', Interested: 'מעוניין', NotInterested: 'לא מעוניין', DoNotCall: 'אין להתקשר' },
    loginWelcome: 'ברוכים השבים! אנא התחברו כדי להמשיך.',
    registerWelcome: 'צור את חשבונך כדי להתחיל',
    enterUsername: 'הזן שם משתמש',
    enterPassword: 'הזן סיסמה',
    chooseUsername: 'בחר שם משתמש',
    enterEmail: 'הזן דוא"ל',
    createPassword: 'צור סיסמה חזקה',
    orDivider: 'או',
    continueWithGoogle: 'המשך עם Google',
    signUpWithGoogle: 'הירשם עם Google',
    noAccount: 'אין לך חשבון? ',
    haveAccount: 'כבר יש לך חשבון? ',
    switchToDarkMode: 'עבור למצב כהה',
    switchToLightMode: 'עבור למצב בהיר',
    superAdmin: 'מנהל-על',
    userManagement: 'ניהול משתמשים',
    activeUsers: 'משתמשים פעילים',
    pendingRegistrations: 'רישומים ממתינים',
    username: 'שם משתמש',
    userRoles: 'תפקידים',
    deleteUser: 'מחק',
    disableUser: 'השבת',
    confirmDeleteUser: 'האם אתה בטוח שברצונך למחוק משתמש זה?',
    confirmDisableUser: 'האם אתה בטוח שברצונך להשבית משתמש זה?',
    userDeleted: 'המשתמש נמחק בהצלחה',
    userDisabled: 'המשתמש הושבת בהצלחה',
    deleteFailed: 'המחיקה נכשלה',
    disableFailed: 'ההשבתה נכשלה',
    noActiveUsers: 'אין משתמשים פעילים',
    noPendingUsers: 'אין רישומים ממתינים',
    assignedAgent: 'נציג משויך',
    unassigned: 'לא משויך',
    assignmentUpdated: 'השיוך עודכן',
    error: 'שגיאה'
  }
}

const LanguageContext = createContext()

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('lang') || 'en' } catch (e) { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('lang', lang) } catch (e) {}
    document.documentElement.lang = lang
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr'
  }, [lang])

  const t = (key) => {
    const parts = key.split('.')
    let cur = translations[lang] || translations.en
    for (const p of parts) {
      if (cur == null) return key
      cur = cur[p]
    }
    return cur == null ? key : cur
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return { t: ctx.t, lang: ctx.lang, setLang: ctx.setLang }
}

export function LanguageSwitcher() {
  const { lang, setLang } = useTranslation()
  return (
    <div style={{ display: 'inline-flex', gap: 8 }}>
      <button aria-label="English" title="English" onClick={() => setLang('en')} className={lang === 'en' ? 'lang-active' : ''} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }} aria-pressed={lang === 'en'}>
        {/* UK flag SVG (small) */}
        <svg width="22" height="16" viewBox="0 0 60 30" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
          <clipPath id="t"><rect width="60" height="30" rx="2"/></clipPath>
          <g clipPath="url(#t)">
            <rect width="60" height="30" fill="#012169"/>
            <path d="M0 0 L60 30 M60 0 L0 30" stroke="#fff" strokeWidth="6"/>
            <path d="M0 0 L60 30 M60 0 L0 30" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30 0 L30 30 M0 15 L60 15" stroke="#fff" strokeWidth="10"/>
            <path d="M30 0 L30 30 M0 15 L60 15" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
      </button>
      <button aria-label="עברית" title="עברית" onClick={() => setLang('he')} className={lang === 'he' ? 'lang-active' : ''} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 2 }} aria-pressed={lang === 'he'}>
        {/* Israel flag SVG (small) */}
        <svg width="22" height="16" viewBox="0 0 30 20" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden>
          <rect width="30" height="20" fill="#fff"/>
          <rect y="2" width="30" height="3" fill="#0038B8"/>
          <rect y="15" width="30" height="3" fill="#0038B8"/>
          <g transform="translate(15,10) scale(0.8)">
            <polygon points="0,-6 1.7,-1.8 6,-1.8 2.1,1 3.8,5.5 0,3  -3.8,5.5 -2.1,1 -6,-1.8 -1.7,-1.8" fill="#0038B8"/>
          </g>
        </svg>
      </button>
    </div>
  )
}

export default translations
