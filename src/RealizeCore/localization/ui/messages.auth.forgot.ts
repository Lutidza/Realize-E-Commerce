/**
 * @file src/RealizeCore/localization/ui/messages.auth.forgot.ts
 * @version 0.1.0 – 2025-12-24 04:35
 * @description
 * Локализованные строки для формы восстановления пароля (forgot password).
 */

export type ForgotPasswordMessagesLocale = {
  title: string
  subtitle: string
  emailLabel: string
  submitLabel: string
  submitPendingLabel: string
  errorTitle: string
  errorFallback: string
  successTitle: string
  successDescription: string
  rememberPrompt: string
  loginLink: string
}

import type { PayloadLocale } from '@/RealizeCore/localization'

export type ForgotPasswordMessages = Partial<Record<PayloadLocale, ForgotPasswordMessagesLocale>>

const cloneForgotMessages = (source: ForgotPasswordMessagesLocale): ForgotPasswordMessagesLocale => ({
  ...source,
})

const englishForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Forgot password',
  subtitle: "We'll send a reset link to your email address.",
  emailLabel: 'Email',
  submitLabel: 'Send reset link',
  submitPendingLabel: 'Sending...',
  errorTitle: 'Unable to send email',
  errorFallback: 'Unable to send reset email.',
  successTitle: 'Check your inbox',
  successDescription:
    'If an account exists, we sent a reset link. Follow the instructions to continue.',
  rememberPrompt: 'Remembered your password?',
  loginLink: 'Sign in',
}

const russianForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Восстановление пароля',
  subtitle: 'Мы отправим ссылку для сброса на ваш email.',
  emailLabel: 'Email',
  submitLabel: 'Отправить ссылку',
  submitPendingLabel: 'Отправка...',
  errorTitle: 'Не удалось отправить письмо',
  errorFallback: 'Не удалось отправить письмо для восстановления.',
  successTitle: 'Проверьте почту',
  successDescription:
    'Если аккаунт существует, мы отправили ссылку. Следуйте инструкциям из письма.',
  rememberPrompt: 'Вспомнили пароль?',
  loginLink: 'Войти',
}

const georgianForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'პაროლის აღდგენა',
  subtitle: 'ჩვენ გამოგიგზავნით ბმულს ელფოსტაზე.',
  emailLabel: 'ელფოსტა',
  submitLabel: 'ბმულის გაგზავნა',
  submitPendingLabel: 'იგზავნება...',
  errorTitle: 'ელფოსტა ვერ გაიგზავნა',
  errorFallback: 'აღდგენის ელფოსტა ვერ გაიგზავნა.',
  successTitle: 'შეამოწმეთ ფოსტა',
  successDescription:
    'თუ ანგარიში არსებობს, გამოგიგზავნეთ ბმული. მიჰყევით ინსტრუქციას.',
  rememberPrompt: 'გაიხსენეთ პაროლი?',
  loginLink: 'შესვლა',
}

const turkishForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Şifreyi sıfırla',
  subtitle: 'E-posta adresinize bir sıfırlama bağlantısı göndereceğiz.',
  emailLabel: 'E-posta',
  submitLabel: 'Bağlantı gönder',
  submitPendingLabel: 'Gönderiliyor...',
  errorTitle: 'E-posta gönderilemedi',
  errorFallback: 'Sıfırlama e-postası gönderilemedi.',
  successTitle: 'Gelen kutunuzu kontrol edin',
  successDescription:
    'Hesap varsa bağlantı gönderdik. Devam etmek için talimatları izleyin.',
  rememberPrompt: 'Şifrenizi hatırladınız mı?',
  loginLink: 'Giriş yapın',
}

const polishForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Resetuj hasło',
  subtitle: 'Wyślemy link resetujący na twój adres e-mail.',
  emailLabel: 'E-mail',
  submitLabel: 'Wyślij link',
  submitPendingLabel: 'Wysyłanie...',
  errorTitle: 'Nie udało się wysłać e-maila',
  errorFallback: 'Nie udało się wysłać wiadomości resetującej.',
  successTitle: 'Sprawdź skrzynkę',
  successDescription:
    'Jeśli konto istnieje, wysłaliśmy link. Postępuj zgodnie z instrukcjami.',
  rememberPrompt: 'Przypomniałeś sobie hasło?',
  loginLink: 'Zaloguj się',
}

const hebrewForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'איפוס סיסמה',
  subtitle: 'נשלח קישור לאיפוס לכתובת הדוא״ל שלך.',
  emailLabel: 'דוא״ל',
  submitLabel: 'שלחו קישור',
  submitPendingLabel: 'נשלח...',
  errorTitle: 'לא ניתן לשלוח הודעה',
  errorFallback: 'לא הצלחנו לשלוח את הדוא״ל לאיפוס.',
  successTitle: 'בדקו את הדוא״ל',
  successDescription:
    'אם קיים חשבון, שלחנו קישור. המשיכו לפי ההוראות בדוא״ל.',
  rememberPrompt: 'נזכרתם בסיסמה?',
  loginLink: 'התחברו',
}

const kazakhForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Құпиясөзді қалпына келтіру',
  subtitle: 'Электрондық поштаңызға қалпына келтіру сілтемесін жібереміз.',
  emailLabel: 'Электрондық пошта',
  submitLabel: 'Сілтемені жіберу',
  submitPendingLabel: 'Жіберілуде...',
  errorTitle: 'Хат жіберілмеді',
  errorFallback: 'Қалпына келтіру хаты жіберілмеді.',
  successTitle: 'Поштаны тексеріңіз',
  successDescription:
    'Егер аккаунт бар болса, біз сілтеме жібердік. Нұсқауларды орындаңыз.',
  rememberPrompt: 'Құпиясөз есіңізге түсті ме?',
  loginLink: 'Кіру',
}

const azerbaijaniForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Şifrəni bərpa et',
  subtitle: 'Elektron poçtunuza bərpa linki göndərəcəyik.',
  emailLabel: 'E-poçt',
  submitLabel: 'Link göndər',
  submitPendingLabel: 'Göndərilir...',
  errorTitle: 'E-poçt göndərilə bilmədi',
  errorFallback: 'Bərpa məktubu göndərilə bilmədi.',
  successTitle: 'Poçtunuzu yoxlayın',
  successDescription:
    'Hesab varsa link göndərdik. Davam etmək üçün təlimatlara əməl edin.',
  rememberPrompt: 'Şifrənizi xatırladınız?',
  loginLink: 'Daxil olun',
}

const arabicForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'استعادة كلمة المرور',
  subtitle: 'سنرسل رابط إعادة التعيين إلى بريدك الإلكتروني.',
  emailLabel: 'البريد الإلكتروني',
  submitLabel: 'إرسال الرابط',
  submitPendingLabel: 'جاري الإرسال...',
  errorTitle: 'تعذر إرسال البريد',
  errorFallback: 'تعذر إرسال رسالة الاستعادة.',
  successTitle: 'تحقق من بريدك',
  successDescription:
    'إذا كان الحساب موجودًا فقد أرسلنا رابطًا. اتبع التعليمات للمتابعة.',
  rememberPrompt: 'تذكرت كلمة المرور؟',
  loginLink: 'تسجيل الدخول',
}

const germanForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Passwort vergessen',
  subtitle: 'Wir senden dir einen Link zum Zurücksetzen per E-Mail.',
  emailLabel: 'E-Mail',
  submitLabel: 'Link senden',
  submitPendingLabel: 'Wird gesendet...',
  errorTitle: 'E-Mail konnte nicht gesendet werden',
  errorFallback: 'Reset-E-Mail konnte nicht gesendet werden.',
  successTitle: 'Posteingang prüfen',
  successDescription:
    'Falls ein Konto existiert, haben wir einen Link gesendet. Folge den Anweisungen.',
  rememberPrompt: 'Passwort wieder eingefallen?',
  loginLink: 'Anmelden',
}

const frenchForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Mot de passe oublié',
  subtitle: 'Nous vous enverrons un lien de réinitialisation par e-mail.',
  emailLabel: 'E-mail',
  submitLabel: 'Envoyer le lien',
  submitPendingLabel: 'Envoi...',
  errorTitle: 'Impossible d’envoyer l’e-mail',
  errorFallback: 'Impossible d’envoyer l’e-mail de réinitialisation.',
  successTitle: 'Vérifiez votre boîte mail',
  successDescription:
    'Si un compte existe, nous avons envoyé un lien. Suivez les instructions.',
  rememberPrompt: 'Vous souvenez-vous du mot de passe ?',
  loginLink: 'Connectez-vous',
}

const spanishForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Recuperar contraseña',
  subtitle: 'Enviaremos un enlace de restablecimiento a tu correo.',
  emailLabel: 'Correo electrónico',
  submitLabel: 'Enviar enlace',
  submitPendingLabel: 'Enviando...',
  errorTitle: 'No se pudo enviar el correo',
  errorFallback: 'No se pudo enviar el correo de restablecimiento.',
  successTitle: 'Revisa tu bandeja',
  successDescription:
    'Si existe una cuenta, enviamos un enlace. Sigue las instrucciones.',
  rememberPrompt: '¿Recordaste la contraseña?',
  loginLink: 'Inicia sesión',
}

const ukrainianForgotMessages: ForgotPasswordMessagesLocale = {
  title: 'Відновлення пароля',
  subtitle: 'Ми надішлемо посилання для скидання на вашу пошту.',
  emailLabel: 'Email',
  submitLabel: 'Надіслати посилання',
  submitPendingLabel: 'Надсилання...',
  errorTitle: 'Не вдалося надіслати лист',
  errorFallback: 'Не вдалося надіслати лист для відновлення.',
  successTitle: 'Перевірте пошту',
  successDescription:
    'Якщо акаунт існує, ми надіслали посилання. Дотримуйтесь інструкцій.',
  rememberPrompt: 'Згадали пароль?',
  loginLink: 'Увійти',
}

const chineseForgotMessages: ForgotPasswordMessagesLocale = {
  title: '忘记密码',
  subtitle: '我们会向您的邮箱发送重置链接。',
  emailLabel: '邮箱',
  submitLabel: '发送链接',
  submitPendingLabel: '发送中...',
  errorTitle: '无法发送邮件',
  errorFallback: '无法发送重置邮件。',
  successTitle: '请检查邮箱',
  successDescription:
    '如果账号存在，我们已发送链接。按照邮件中的说明继续。',
  rememberPrompt: '想起密码了吗？',
  loginLink: '登录',
}

export const forgotPasswordMessages: ForgotPasswordMessages = {
  en: englishForgotMessages,
  ru: russianForgotMessages,
  ka: georgianForgotMessages,
  tr: turkishForgotMessages,
  pl: polishForgotMessages,
  he: hebrewForgotMessages,
  kk: kazakhForgotMessages,
  az: azerbaijaniForgotMessages,
  ar: arabicForgotMessages,
  de: germanForgotMessages,
  fr: frenchForgotMessages,
  es: spanishForgotMessages,
  uk: ukrainianForgotMessages,
  zh: chineseForgotMessages,
}
