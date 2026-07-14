/**
 * @file src/RealizeCore/localization/ui/messages.header.ts
 * @version 1.0.0 – 2025-12-03 10:15
 * @description
 * Локализованные текстовые сообщения для шапки приложения (header).
 * Файл:
 * - описывает типизированную структуру переводов для зоны header;
 * - содержит базовый набор строк для трёх локалей (en, ru, ka);
 * - предназначен для агрегации в общем UI-словаре (см. ui/index.ts).
 *
 * В дальнейшем:
 * - сообщения из этого файла будут использоваться через общий хелпер getUiMessage / useUiMessages;
 * - при добавлении новых элементов в шапке следует расширять именно этот словарь.
 */

import type { PayloadLocale } from '@/RealizeCore/localization'
import { localizationSettings } from '../config'

export type HeaderMessagesLocale = {
  /**
   * @remarks
   * Сообщения, связанные с переключателем темы (ThemeToggle).
   */
  themeToggle: {
    /**
     * @remarks
     * aria-label / title для кнопки переключения темы.
     * Используется как:
     * - aria-label={...}
     * - title={...}
     * - текст внутри sr-only.
     */
    ariaLabel: string
  }

  /**
   * @remarks
   * Сообщения для переключателя языка (LanguageToggle).
   */
  languageToggle: {
    /**
     * @remarks
     * aria-label / title для кнопки переключения языка.
     * Формулировка должна быть нейтральной и работать без указания конкретных кодов локалей.
     */
    ariaLabel: string

    /**
     * @remarks
     * Текст заголовка выпадающего списка.
     */
    menuLabel: string

    /**
     * @remarks
     * Локализованные названия поддерживаемых локалей.
     * Ключи соответствуют поддерживаемым кодам (en, ru, ka).
     */
    localeLabels: Partial<Record<PayloadLocale, string>>
  }

  /**
   * @remarks
   * Сообщения для блока аккаунта/аутентификации в шапке.
   */
  account: {
    /**
     * @remarks
     * Текст ссылки/кнопки входа в личный кабинет.
     * Используется в HeaderActions для ссылки на /account/login.
     */
    loginLabel: string
    /**
     * @remarks
     * Подпись для ссылки регистрации.
     */
    registerLabel: string
    /**
     * @remarks
     * Подпись для перехода в профиль.
     */
    profileLabel: string
    /**
     * @remarks
     * Подпись для перехода в настройки профиля.
     */
    settingsLabel: string
    /**
     * @remarks
     * Подпись кнопки выхода.
     */
    logoutLabel: string
    /**
     * @remarks
     * aria-label / title для меню аккаунта.
     */
    menuLabel: string
    /**
     * @remarks
     * Подпись в выпадающем меню: "Signed in as ...".
     */
    signedInAs: string
  }
}

/**
 * @remarks
 * Типизированный словарь сообщений для шапки по локалям.
 * Ключи верхнего уровня соответствуют поддерживаемым локалям приложения.
 */
export type HeaderMessages = Partial<Record<PayloadLocale, HeaderMessagesLocale>>

/**
 * @remarks
 * Реализация словаря сообщений для шапки.
 * Данный объект будет агрегирован в общем UI-словаре (uiMessages) и использован
 * через хелперы getUiMessage / useUiMessages.
 */
const buildLocaleLabels = (): Partial<Record<PayloadLocale, string>> =>
  localizationSettings.payloadLocales.reduce<Partial<Record<PayloadLocale, string>>>(
    (acc, locale) => {
      acc[locale.code as PayloadLocale] = locale.label
      return acc
    },
    {},
  )

const localeLabels = buildLocaleLabels()

export const headerMessages: HeaderMessages = {
  en: {
    themeToggle: {
      ariaLabel: 'Toggle theme',
    },
    languageToggle: {
      ariaLabel: 'Change language',
      menuLabel: 'Select language',
      localeLabels,
    },
    account: {
      loginLabel: 'Sign in',
      registerLabel: 'Create account',
      profileLabel: 'Profile',
      settingsLabel: 'Settings',
      logoutLabel: 'Log out',
      menuLabel: 'Account menu',
      signedInAs: 'Signed in as',
    },
  },
  ru: {
    themeToggle: {
      ariaLabel: 'Переключить тему',
    },
    languageToggle: {
      ariaLabel: 'Сменить язык',
      menuLabel: 'Выберите язык',
      localeLabels,
    },
    account: {
      loginLabel: 'Войти',
      registerLabel: 'Создать аккаунт',
      profileLabel: 'Профиль',
      settingsLabel: 'Настройки',
      logoutLabel: 'Выйти',
      menuLabel: 'Меню аккаунта',
      signedInAs: 'Вы вошли как',
    },
  },
  ka: {
    themeToggle: {
      ariaLabel: 'თემის გადართვა',
    },
    languageToggle: {
      ariaLabel: 'ენის შეცვლა',
      menuLabel: 'აირჩიეთ ენა',
      localeLabels,
    },
    account: {
      loginLabel: 'შესვლა',
      registerLabel: 'ანგარიშის შექმნა',
      profileLabel: 'პროფილი',
      settingsLabel: 'პარამეტრები',
      logoutLabel: 'გამოსვლა',
      menuLabel: 'ანგარიშის მენიუ',
      signedInAs: 'შესული ხართ როგორც',
    },
  },
  tr: {
    themeToggle: {
      ariaLabel: 'Temayı değiştir',
    },
    languageToggle: {
      ariaLabel: 'Dili değiştir',
      menuLabel: 'Dil seçin',
      localeLabels,
    },
    account: {
      loginLabel: 'Giriş yap',
      registerLabel: 'Hesap oluştur',
      profileLabel: 'Profil',
      settingsLabel: 'Ayarlar',
      logoutLabel: 'Çıkış yap',
      menuLabel: 'Hesap menüsü',
      signedInAs: 'Şu kullanıcı olarak giriş yaptınız',
    },
  },
  pl: {
    themeToggle: {
      ariaLabel: 'Zmień motyw',
    },
    languageToggle: {
      ariaLabel: 'Zmień język',
      menuLabel: 'Wybierz język',
      localeLabels,
    },
    account: {
      loginLabel: 'Zaloguj się',
      registerLabel: 'Utwórz konto',
      profileLabel: 'Profil',
      settingsLabel: 'Ustawienia',
      logoutLabel: 'Wyloguj się',
      menuLabel: 'Menu konta',
      signedInAs: 'Zalogowano jako',
    },
  },
  he: {
    themeToggle: {
      ariaLabel: 'החלפת מצב תצוגה',
    },
    languageToggle: {
      ariaLabel: 'שינוי שפה',
      menuLabel: 'בחרו שפה',
      localeLabels,
    },
    account: {
      loginLabel: 'התחברות',
      registerLabel: 'יצירת חשבון',
      profileLabel: 'פרופיל',
      settingsLabel: 'הגדרות',
      logoutLabel: 'התנתקות',
      menuLabel: 'תפריט חשבון',
      signedInAs: 'מחובר כ־',
    },
  },
  kk: {
    themeToggle: {
      ariaLabel: 'Тақырыпты ауыстыру',
    },
    languageToggle: {
      ariaLabel: 'Тілді өзгерту',
      menuLabel: 'Тілді таңдаңыз',
      localeLabels,
    },
    account: {
      loginLabel: 'Кіру',
      registerLabel: 'Тіркелу',
      profileLabel: 'Профиль',
      settingsLabel: 'Баптаулар',
      logoutLabel: 'Шығу',
      menuLabel: 'Есептік жазба мәзірі',
      signedInAs: 'Кіру орындалды:',
    },
  },
  az: {
    themeToggle: {
      ariaLabel: 'Mövzunu dəyiş',
    },
    languageToggle: {
      ariaLabel: 'Dili dəyiş',
      menuLabel: 'Dili seçin',
      localeLabels,
    },
    account: {
      loginLabel: 'Daxil ol',
      registerLabel: 'Hesab yaradın',
      profileLabel: 'Profil',
      settingsLabel: 'Parametrlər',
      logoutLabel: 'Çıxış et',
      menuLabel: 'Hesab menyusu',
      signedInAs: 'Hesaba daxil oldunuz',
    },
  },
  ar: {
    themeToggle: {
      ariaLabel: 'تبديل النمط',
    },
    languageToggle: {
      ariaLabel: 'تغيير اللغة',
      menuLabel: 'اختر اللغة',
      localeLabels,
    },
    account: {
      loginLabel: 'تسجيل الدخول',
      registerLabel: 'إنشاء حساب',
      profileLabel: 'الملف الشخصي',
      settingsLabel: 'الإعدادات',
      logoutLabel: 'تسجيل الخروج',
      menuLabel: 'قائمة الحساب',
      signedInAs: 'مسجل الدخول كـ',
    },
  },
  de: {
    themeToggle: {
      ariaLabel: 'Design wechseln',
    },
    languageToggle: {
      ariaLabel: 'Sprache ändern',
      menuLabel: 'Sprache auswählen',
      localeLabels,
    },
    account: {
      loginLabel: 'Anmelden',
      registerLabel: 'Konto erstellen',
      profileLabel: 'Profil',
      settingsLabel: 'Einstellungen',
      logoutLabel: 'Abmelden',
      menuLabel: 'Kontomenü',
      signedInAs: 'Angemeldet als',
    },
  },
  fr: {
    themeToggle: {
      ariaLabel: 'Changer de thème',
    },
    languageToggle: {
      ariaLabel: 'Changer de langue',
      menuLabel: 'Choisir une langue',
      localeLabels,
    },
    account: {
      loginLabel: 'Se connecter',
      registerLabel: 'Créer un compte',
      profileLabel: 'Profil',
      settingsLabel: 'Paramètres',
      logoutLabel: 'Se déconnecter',
      menuLabel: 'Menu du compte',
      signedInAs: 'Connecté en tant que',
    },
  },
  es: {
    themeToggle: {
      ariaLabel: 'Cambiar tema',
    },
    languageToggle: {
      ariaLabel: 'Cambiar idioma',
      menuLabel: 'Selecciona un idioma',
      localeLabels,
    },
    account: {
      loginLabel: 'Iniciar sesión',
      registerLabel: 'Crear cuenta',
      profileLabel: 'Perfil',
      settingsLabel: 'Configuración',
      logoutLabel: 'Cerrar sesión',
      menuLabel: 'Menú de cuenta',
      signedInAs: 'Has iniciado sesión como',
    },
  },
  uk: {
    themeToggle: {
      ariaLabel: 'Змінити тему',
    },
    languageToggle: {
      ariaLabel: 'Змінити мову',
      menuLabel: 'Виберіть мову',
      localeLabels,
    },
    account: {
      loginLabel: 'Увійти',
      registerLabel: 'Створити акаунт',
      profileLabel: 'Профіль',
      settingsLabel: 'Налаштування',
      logoutLabel: 'Вийти',
      menuLabel: 'Меню акаунта',
      signedInAs: 'Ви ввійшли як',
    },
  },
  zh: {
    themeToggle: {
      ariaLabel: '切换主题',
    },
    languageToggle: {
      ariaLabel: '切换语言',
      menuLabel: '选择语言',
      localeLabels,
    },
    account: {
      loginLabel: '登录',
      registerLabel: '创建账户',
      profileLabel: '个人资料',
      settingsLabel: '设置',
      logoutLabel: '退出登录',
      menuLabel: '账户菜单',
      signedInAs: '当前登录为',
    },
  },
}
