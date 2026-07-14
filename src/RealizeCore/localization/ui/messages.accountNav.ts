/**
 * @file src/RealizeCore/localization/ui/messages.accountNav.ts
 * @version 0.1.0 – 2025-12-24 05:50
 * @description
 * Локализованные подписи пунктов навигации личного кабинета.
 */

export type AccountNavMessagesLocale = {
  dashboard: string
  listings: string
  favorites: string
  compare: string
  searches: string
  plans: string
  balance: string
  payments: string
  companies: string
  notifications: string
  chats: string
  support: string
}

import type { PayloadLocale } from '@/RealizeCore/localization'

export type AccountNavMessages = Partial<Record<PayloadLocale, AccountNavMessagesLocale>>

const cloneAccountNavMessages = (source: AccountNavMessagesLocale): AccountNavMessagesLocale => ({
  ...source,
})

const englishAccountNavMessages: AccountNavMessagesLocale = {
  dashboard: 'Dashboard',
  listings: 'My listings',
  favorites: 'Favorites',
  compare: 'Compare',
  searches: 'Saved searches',
  plans: 'Plans & services',
  balance: 'Balance',
  payments: 'Payment methods',
  companies: 'My companies',
  notifications: 'Notifications',
  chats: 'Chats & messages',
  support: 'Support',
}

const russianAccountNavMessages: AccountNavMessagesLocale = {
  dashboard: 'Панель управления',
  listings: 'Мои объявления',
  favorites: 'Избранное',
  compare: 'Сравнение',
  searches: 'Сохранённые поиски',
  plans: 'Тарифы и услуги',
  balance: 'Баланс',
  payments: 'Способы оплаты',
  companies: 'Мои компании',
  notifications: 'Оповещения',
  chats: 'Чаты и сообщения',
  support: 'Поддержка',
}

const georgianAccountNavMessages: AccountNavMessagesLocale = {
  dashboard: 'დეშბორდი',
  listings: 'ჩემი განცხადებები',
  favorites: 'სანიშნეები',
  compare: 'შედარება',
  searches: 'შენახული ძიებები',
  plans: 'ტარიფები და სერვისები',
  balance: 'ბალანსი',
  payments: 'გადახდის მეთოდები',
  companies: 'ჩემი კომპანიები',
  notifications: 'შეტყობინებები',
  chats: 'ჩეთები და წერილები',
  support: 'მხარდაჭერა',
}

export const accountNavMessages: AccountNavMessages = {
  en: englishAccountNavMessages,
  ru: russianAccountNavMessages,
  ka: georgianAccountNavMessages,
  tr: {
    dashboard: 'Kontrol paneli',
    listings: 'İlanlarım',
    favorites: 'Favoriler',
    compare: 'Karşılaştır',
    searches: 'Kaydedilen aramalar',
    plans: 'Planlar ve hizmetler',
    balance: 'Bakiye',
    payments: 'Ödeme yöntemleri',
    companies: 'Şirketlerim',
    notifications: 'Bildirimler',
    chats: 'Sohbetler ve mesajlar',
    support: 'Destek',
  },
  pl: {
    dashboard: 'Panel główny',
    listings: 'Moje ogłoszenia',
    favorites: 'Ulubione',
    compare: 'Porównaj',
    searches: 'Zapisane wyszukiwania',
    plans: 'Plany i usługi',
    balance: 'Saldo',
    payments: 'Metody płatności',
    companies: 'Moje firmy',
    notifications: 'Powiadomienia',
    chats: 'Czaty i wiadomości',
    support: 'Wsparcie',
  },
  he: {
    dashboard: 'לוח בקרה',
    listings: 'המודעות שלי',
    favorites: 'מועדפים',
    compare: 'השוואה',
    searches: 'חיפושים שמורים',
    plans: 'תוכניות ושירותים',
    balance: 'יתרה',
    payments: 'אמצעי תשלום',
    companies: 'החברות שלי',
    notifications: 'התראות',
    chats: 'צ׳אטים והודעות',
    support: 'תמיכה',
  },
  kk: {
    dashboard: 'Басқару тақтасы',
    listings: 'Менің хабарландыруларым',
    favorites: 'Таңдаулылар',
    compare: 'Салыстыру',
    searches: 'Сақталған іздеулер',
    plans: 'Тарифтер мен қызметтер',
    balance: 'Баланс',
    payments: 'Төлем тәсілдері',
    companies: 'Менің компанияларым',
    notifications: 'Хабарламалар',
    chats: 'Чаттар және хабарламалар',
    support: 'Қолдау',
  },
  az: {
    dashboard: 'İdarə paneli',
    listings: 'Elanlarım',
    favorites: 'Sevimlilər',
    compare: 'Müqayisə et',
    searches: 'Saxlanılmış axtarışlar',
    plans: 'Planlar və xidmətlər',
    balance: 'Balans',
    payments: 'Ödəniş üsulları',
    companies: 'Şirkətlərim',
    notifications: 'Bildirişlər',
    chats: 'Çatlar və mesajlar',
    support: 'Dəstək',
  },
  ar: {
    dashboard: 'لوحة التحكم',
    listings: 'إعلاناتي',
    favorites: 'المفضلة',
    compare: 'قارن',
    searches: 'عمليات البحث المحفوظة',
    plans: 'الباقات والخدمات',
    balance: 'الرصيد',
    payments: 'طرق الدفع',
    companies: 'شركاتي',
    notifications: 'الإشعارات',
    chats: 'الدردشات والرسائل',
    support: 'الدعم',
  },
  de: {
    dashboard: 'Dashboard',
    listings: 'Meine Inserate',
    favorites: 'Favoriten',
    compare: 'Vergleichen',
    searches: 'Gespeicherte Suchen',
    plans: 'Pläne & Services',
    balance: 'Kontostand',
    payments: 'Zahlungsarten',
    companies: 'Meine Unternehmen',
    notifications: 'Benachrichtigungen',
    chats: 'Chats & Nachrichten',
    support: 'Support',
  },
  fr: {
    dashboard: 'Tableau de bord',
    listings: 'Mes annonces',
    favorites: 'Favoris',
    compare: 'Comparer',
    searches: 'Recherches enregistrées',
    plans: 'Offres et services',
    balance: 'Solde',
    payments: 'Moyens de paiement',
    companies: 'Mes entreprises',
    notifications: 'Notifications',
    chats: 'Discussions et messages',
    support: 'Assistance',
  },
  es: {
    dashboard: 'Panel de control',
    listings: 'Mis anuncios',
    favorites: 'Favoritos',
    compare: 'Comparar',
    searches: 'Búsquedas guardadas',
    plans: 'Planes y servicios',
    balance: 'Saldo',
    payments: 'Métodos de pago',
    companies: 'Mis empresas',
    notifications: 'Notificaciones',
    chats: 'Chats y mensajes',
    support: 'Soporte',
  },
  uk: {
    dashboard: 'Панель керування',
    listings: 'Мої оголошення',
    favorites: 'Вибране',
    compare: 'Порівняти',
    searches: 'Збережені пошуки',
    plans: 'Тарифи та послуги',
    balance: 'Баланс',
    payments: 'Способи оплати',
    companies: 'Мої компанії',
    notifications: 'Сповіщення',
    chats: 'Чати та повідомлення',
    support: 'Підтримка',
  },
  zh: {
    dashboard: '控制面板',
    listings: '我的房源',
    favorites: '收藏',
    compare: '对比',
    searches: '已保存搜索',
    plans: '套餐与服务',
    balance: '余额',
    payments: '支付方式',
    companies: '我的公司',
    notifications: '通知',
    chats: '聊天和消息',
    support: '支持',
  },
}
