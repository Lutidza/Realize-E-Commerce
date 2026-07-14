/**
 * @file src/RealizeCore/localization/ui/messages.auth.ts
 * @version 1.0.0 – 2025-12-24 04:15
 * @description
 * Локализованные сообщения для auth-компонентов (формы входа/сброса и т.д.).
 */

export type AuthMessagesLocale = {
  login: {
    title: string
    subtitle: string
    emailLabel: string
    passwordLabel: string
    forgotLink: string
    submitLabel: string
    submitPendingLabel: string
    registerPrompt: string
    registerLink: string
    errorTitle: string
    errorDescription: string
    footerDisclaimer: string
    footerConjunction: string
    termsLabel: string
    privacyLabel: string
  }
}

import type { PayloadLocale } from '@/RealizeCore/localization'

export type AuthMessages = Partial<Record<PayloadLocale, AuthMessagesLocale>>

const cloneAuthMessages = (source: AuthMessagesLocale): AuthMessagesLocale => ({
  login: { ...source.login },
})

const englishAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Welcome back',
    subtitle: 'Sign in to manage your Realize account',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    forgotLink: 'Forgot your password?',
    submitLabel: 'Login',
    submitPendingLabel: 'Signing in...',
    registerPrompt: "Don't have an account?",
    registerLink: 'Sign up',
    errorTitle: 'Authentication failed',
    errorDescription: 'Unable to sign in',
    footerDisclaimer: 'By continuing, you agree to our',
    footerConjunction: 'and',
    termsLabel: 'Terms of Service',
    privacyLabel: 'Privacy Policy',
  },
}

const russianAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'С возвращением',
    subtitle: 'Войдите, чтобы управлять аккаунтом Realize',
    emailLabel: 'Email',
    passwordLabel: 'Пароль',
    forgotLink: 'Забыли пароль?',
    submitLabel: 'Войти',
    submitPendingLabel: 'Выполняется вход...',
    registerPrompt: 'Нет аккаунта?',
    registerLink: 'Зарегистрируйтесь',
    errorTitle: 'Ошибка авторизации',
    errorDescription: 'Не удалось выполнить вход',
    footerDisclaimer: 'Продолжая, вы соглашаетесь с нашими',
    footerConjunction: 'и',
    termsLabel: 'Условиями использования',
    privacyLabel: 'Политикой конфиденциальности',
  },
}

const georgianAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'კეთილი იყოს თქვენი დაბრუნება',
    subtitle: 'შედით Realize ანგარიშის სამართავად',
    emailLabel: 'ელფოსტა',
    passwordLabel: 'პაროლი',
    forgotLink: 'დაგავიწყდათ პაროლი?',
    submitLabel: 'შესვლა',
    submitPendingLabel: 'შესვლა...',
    registerPrompt: 'არ გაქვთ ანგარიში?',
    registerLink: 'დარეგისტრირდით',
    errorTitle: 'ავტორიზაცია ვერ მოხერხდა',
    errorDescription: 'შესვლა ვერ მოხერხდა',
    footerDisclaimer: 'გაგრძელებით ეთანხმებით',
    footerConjunction: 'და',
    termsLabel: 'მომსახურების პირობებს',
    privacyLabel: 'კონფიდენციალობის პოლიტიკას',
  },
}

const turkishAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Tekrar hoş geldiniz',
    subtitle: 'Realize hesabınızı yönetmek için giriş yapın',
    emailLabel: 'E-posta',
    passwordLabel: 'Şifre',
    forgotLink: 'Şifrenizi mi unuttunuz?',
    submitLabel: 'Giriş yap',
    submitPendingLabel: 'Giriş yapılıyor...',
    registerPrompt: 'Hesabınız yok mu?',
    registerLink: 'Kaydolun',
    errorTitle: 'Kimlik doğrulama başarısız',
    errorDescription: 'Giriş yapılamadı',
    footerDisclaimer: 'Devam ederek',
    footerConjunction: 've',
    termsLabel: 'Hizmet Şartlarımızı',
    privacyLabel: 'Gizlilik Politikamızı',
  },
}

const polishAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Witamy ponownie',
    subtitle: 'Zaloguj się, aby zarządzać kontem Realize',
    emailLabel: 'E-mail',
    passwordLabel: 'Hasło',
    forgotLink: 'Zapomniałeś hasła?',
    submitLabel: 'Zaloguj się',
    submitPendingLabel: 'Logowanie...',
    registerPrompt: 'Nie masz konta?',
    registerLink: 'Zarejestruj się',
    errorTitle: 'Logowanie nieudane',
    errorDescription: 'Nie udało się zalogować',
    footerDisclaimer: 'Kontynuując, akceptujesz nasze',
    footerConjunction: 'oraz',
    termsLabel: 'Warunki korzystania',
    privacyLabel: 'Politykę prywatności',
  },
}

const hebrewAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'ברוכים השבים',
    subtitle: 'התחברו כדי לנהל את חשבון Realize שלכם',
    emailLabel: 'דוא״ל',
    passwordLabel: 'סיסמה',
    forgotLink: 'שכחתם את הסיסמה?',
    submitLabel: 'התחברות',
    submitPendingLabel: 'מתחבר...',
    registerPrompt: 'אין לכם חשבון?',
    registerLink: 'צרו חשבון',
    errorTitle: 'האימות נכשל',
    errorDescription: 'לא ניתן להתחבר',
    footerDisclaimer: 'בהמשך אתם מסכימים ל־',
    footerConjunction: 'ו־',
    termsLabel: 'תנאי השירות',
    privacyLabel: 'מדיניות הפרטיות',
  },
}

const kazakhAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Қайта оралғаныңызға қуаныштымыз',
    subtitle: 'Realize аккаунтын басқару үшін кіріңіз',
    emailLabel: 'Электрондық пошта',
    passwordLabel: 'Құпиясөз',
    forgotLink: 'Құпиясөзді ұмыттыңыз ба?',
    submitLabel: 'Кіру',
    submitPendingLabel: 'Кіруде...',
    registerPrompt: 'Аккаунтыңыз жоқ па?',
    registerLink: 'Тіркеліңіз',
    errorTitle: 'Аутентификация қателігі',
    errorDescription: 'Кіру мүмкін болмады',
    footerDisclaimer: 'Жалғастыру арқылы сіз біздің',
    footerConjunction: 'және',
    termsLabel: 'Қызмет көрсету шарттарымызды',
    privacyLabel: 'Құпиялылық саясатымызды',
  },
}

const azerbaijaniAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Yenidən xoş gəldiniz',
    subtitle: 'Realize hesabınızı idarə etmək üçün daxil olun',
    emailLabel: 'E-poçt',
    passwordLabel: 'Şifrə',
    forgotLink: 'Şifrəni unutmusunuz?',
    submitLabel: 'Daxil ol',
    submitPendingLabel: 'Daxil olunur...',
    registerPrompt: 'Hesabınız yoxdur?',
    registerLink: 'Qeydiyyatdan keçin',
    errorTitle: 'Kimlik doğrulama alınmadı',
    errorDescription: 'Daxil olmaq mümkün olmadı',
    footerDisclaimer: 'Davam etməklə',
    footerConjunction: 'və',
    termsLabel: 'Xidmət Şərtlərimizi',
    privacyLabel: 'Məxfilik Siyasətimizi',
  },
}

const arabicAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'مرحبًا بعودتك',
    subtitle: 'سجّل الدخول لإدارة حساب Realize الخاص بك',
    emailLabel: 'البريد الإلكتروني',
    passwordLabel: 'كلمة المرور',
    forgotLink: 'هل نسيت كلمة المرور؟',
    submitLabel: 'تسجيل الدخول',
    submitPendingLabel: 'جارٍ تسجيل الدخول...',
    registerPrompt: 'ليس لديك حساب؟',
    registerLink: 'أنشئ حسابًا',
    errorTitle: 'فشل التحقق',
    errorDescription: 'تعذر تسجيل الدخول',
    footerDisclaimer: 'بمتابعة الاستخدام فإنك توافق على',
    footerConjunction: 'و',
    termsLabel: 'شروط الخدمة',
    privacyLabel: 'سياسة الخصوصية',
  },
}

const germanAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Willkommen zurück',
    subtitle: 'Melde dich an, um dein Realize-Konto zu verwalten',
    emailLabel: 'E-Mail',
    passwordLabel: 'Passwort',
    forgotLink: 'Passwort vergessen?',
    submitLabel: 'Anmelden',
    submitPendingLabel: 'Anmeldung läuft...',
    registerPrompt: 'Noch kein Konto?',
    registerLink: 'Registrieren',
    errorTitle: 'Anmeldung fehlgeschlagen',
    errorDescription: 'Anmeldung nicht möglich',
    footerDisclaimer: 'Mit dem Fortfahren stimmst du unseren',
    footerConjunction: 'und',
    termsLabel: 'Nutzungsbedingungen',
    privacyLabel: 'Datenschutzbestimmungen',
  },
}

const frenchAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Bon retour',
    subtitle: 'Connectez-vous pour gérer votre compte Realize',
    emailLabel: 'E-mail',
    passwordLabel: 'Mot de passe',
    forgotLink: 'Mot de passe oublié ?',
    submitLabel: 'Se connecter',
    submitPendingLabel: 'Connexion en cours...',
    registerPrompt: 'Pas encore de compte ?',
    registerLink: 'Inscrivez-vous',
    errorTitle: 'Échec de l’authentification',
    errorDescription: 'Connexion impossible',
    footerDisclaimer: 'En continuant, vous acceptez nos',
    footerConjunction: 'et',
    termsLabel: 'Conditions d’utilisation',
    privacyLabel: 'Politique de confidentialité',
  },
}

const spanishAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'Bienvenido de nuevo',
    subtitle: 'Inicia sesión para gestionar tu cuenta de Realize',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    forgotLink: '¿Olvidaste la contraseña?',
    submitLabel: 'Iniciar sesión',
    submitPendingLabel: 'Iniciando sesión...',
    registerPrompt: '¿No tienes cuenta?',
    registerLink: 'Regístrate',
    errorTitle: 'Autenticación fallida',
    errorDescription: 'No se pudo iniciar sesión',
    footerDisclaimer: 'Al continuar aceptas nuestros',
    footerConjunction: 'y',
    termsLabel: 'Términos del servicio',
    privacyLabel: 'Política de privacidad',
  },
}

const ukrainianAuthMessages: AuthMessagesLocale = {
  login: {
    title: 'З поверненням',
    subtitle: 'Увійдіть, щоб керувати обліковим записом Realize',
    emailLabel: 'Email',
    passwordLabel: 'Пароль',
    forgotLink: 'Забули пароль?',
    submitLabel: 'Увійти',
    submitPendingLabel: 'Вхід...',
    registerPrompt: 'Немає акаунта?',
    registerLink: 'Зареєструйтеся',
    errorTitle: 'Помилка авторизації',
    errorDescription: 'Не вдалося увійти',
    footerDisclaimer: 'Продовжуючи, ви погоджуєтеся з нашими',
    footerConjunction: 'та',
    termsLabel: 'Умовами використання',
    privacyLabel: 'Політикою конфіденційності',
  },
}

const chineseAuthMessages: AuthMessagesLocale = {
  login: {
    title: '欢迎回来',
    subtitle: '登录以管理您的 Realize 账号',
    emailLabel: '邮箱',
    passwordLabel: '密码',
    forgotLink: '忘记密码？',
    submitLabel: '登录',
    submitPendingLabel: '正在登录...',
    registerPrompt: '还没有账号？',
    registerLink: '立即注册',
    errorTitle: '验证失败',
    errorDescription: '无法登录',
    footerDisclaimer: '继续即表示您同意我们的',
    footerConjunction: '和',
    termsLabel: '服务条款',
    privacyLabel: '隐私政策',
  },
}

export const authMessages: AuthMessages = {
  en: englishAuthMessages,
  ru: russianAuthMessages,
  ka: georgianAuthMessages,
  tr: turkishAuthMessages,
  pl: polishAuthMessages,
  he: hebrewAuthMessages,
  kk: kazakhAuthMessages,
  az: azerbaijaniAuthMessages,
  ar: arabicAuthMessages,
  de: germanAuthMessages,
  fr: frenchAuthMessages,
  es: spanishAuthMessages,
  uk: ukrainianAuthMessages,
  zh: chineseAuthMessages,
}
