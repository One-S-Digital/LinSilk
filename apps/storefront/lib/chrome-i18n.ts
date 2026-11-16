/* The words around the pages: header, footer, menu, the currency line, the
 * language names. German and French are for a native-speaker pass before they
 * go live (docs/seo/SEO-GEO-PLAN.md §13.7). */

import type { Lang } from './i18n';

const EN = {
  home: 'LINSILK — home',
  skip: 'Skip to content',
  primary: 'Primary',
  menu: 'Menu',
  close: 'Close',
  account: 'Account',
  cart: 'Cart',
  where: 'Geneva, Switzerland',
  nav: {
    '/collection': 'Collection',
    '/made-to-measure': 'Made to Measure',
    '/design': 'Design Your Own',
    '/cloth': 'The Cloth',
    '/archive': 'Past Collections',
    '/contact': 'Contact',
  } as Record<string, string>,
  blurb:
    'Made-to-measure silk, linen and high frequency fabrics, from Geneva. Cut and sewn to your measurements in 2–4 weeks. Four small collections a year.',
  shop: 'Shop',
  care: 'Client care',
  house: 'The house',
  connect: 'Connect',
  links: {
    '/collection/women/silk': 'Silk dresses and gowns',
    '/collection/sleepwear': 'Silk sleepwear',
    '/collection/men/shirts': 'Linen shirts',
    '/care': 'Care guide',
    '/care/shipping': 'Shipping',
    '/care/measuring': 'Measurement guide',
    '/care/returns': 'Returns',
    '/care/questions': 'Questions',
    '/about': 'About',
    '/season-letter': 'Season letter',
    '/legal/terms': 'Terms',
    '/legal/privacy': 'Privacy',
  } as Record<string, string>,
  prices: 'Prices in CHF',
  credit: 'Powered by:',
  currencyLabel: 'Also show approximately in',
  francsOnly: 'Francs only',
  currencies: { EUR: 'Euro (EUR)', GBP: 'Pound (GBP)', USD: 'US dollar (USD)', AED: 'UAE dirham (AED)' } as Record<string, string>,
  language: 'Language',
  suggestOwn: '',
  suggestGo: '',
  dismiss: 'Dismiss',
};

type Chrome = typeof EN;

const DE: Chrome = {
  home: 'LINSILK – Startseite',
  skip: 'Zum Inhalt springen',
  primary: 'Hauptnavigation',
  menu: 'Menü',
  close: 'Schliessen',
  account: 'Konto',
  cart: 'Warenkorb',
  where: 'Genf, Schweiz',
  nav: {
    '/collection': 'Kollektion',
    '/made-to-measure': 'Massanfertigung',
    '/design': 'Selbst entwerfen',
    '/cloth': 'Der Stoff',
    '/archive': 'Frühere Kollektionen',
    '/contact': 'Kontakt',
  },
  blurb:
    'Seide, Leinen und hochfrequente Stoffe nach Mass, aus Genf. Nach Ihren Massen zugeschnitten und genäht, in zwei bis vier Wochen. Vier kleine Kollektionen im Jahr.',
  shop: 'Shop',
  care: 'Kundenservice',
  house: 'Das Haus',
  connect: 'Folgen Sie uns',
  links: {
    '/collection/women/silk': 'Kleider und Roben aus Seide',
    '/collection/sleepwear': 'Schlafmode aus Seide',
    '/collection/men/shirts': 'Hemden aus Leinen',
    '/care': 'Pflegeanleitung',
    '/care/shipping': 'Lieferung',
    '/care/measuring': 'Anleitung zum Massnehmen',
    '/care/returns': 'Rückgabe',
    '/care/questions': 'Häufige Fragen',
    '/about': 'Über LINSILK',
    '/season-letter': 'Saisonbrief',
    '/legal/terms': 'AGB',
    '/legal/privacy': 'Datenschutz',
  },
  prices: 'Preise in CHF',
  credit: 'Umsetzung:',
  currencyLabel: 'Zusätzlich ungefähr anzeigen in',
  francsOnly: 'Nur Franken',
  currencies: { EUR: 'Euro (EUR)', GBP: 'Pfund (GBP)', USD: 'US-Dollar (USD)', AED: 'VAE-Dirham (AED)' },
  language: 'Sprache',
  suggestOwn: 'Diese Seite gibt es auch auf Deutsch.',
  suggestGo: 'Auf Deutsch lesen',
  dismiss: 'Schliessen',
};

const FR: Chrome = {
  home: 'LINSILK – accueil',
  skip: 'Aller au contenu',
  primary: 'Navigation principale',
  menu: 'Menu',
  close: 'Fermer',
  account: 'Compte',
  cart: 'Panier',
  where: 'Genève, Suisse',
  nav: {
    '/collection': 'Collection',
    '/made-to-measure': 'Sur mesure',
    '/design': 'Créer votre pièce',
    '/cloth': 'Le tissu',
    '/archive': 'Collections passées',
    '/contact': 'Contact',
  },
  blurb:
    'Soie, lin et tissus à haute fréquence sur mesure, depuis Genève. Coupés et cousus d’après vos mesures, en deux à quatre semaines. Quatre petites collections par an.',
  shop: 'Boutique',
  care: 'Service client',
  house: 'La maison',
  connect: 'Suivez-nous',
  links: {
    '/collection/women/silk': 'Robes et robes longues en soie',
    '/collection/sleepwear': 'Vêtements de nuit en soie',
    '/collection/men/shirts': 'Chemises en lin',
    '/care': 'Guide d’entretien',
    '/care/shipping': 'Livraison',
    '/care/measuring': 'Guide pour prendre vos mesures',
    '/care/returns': 'Retours',
    '/care/questions': 'Questions fréquentes',
    '/about': 'À propos',
    '/season-letter': 'Lettre de saison',
    '/legal/terms': 'CGV',
    '/legal/privacy': 'Confidentialité',
  },
  prices: 'Prix en CHF',
  credit: 'Réalisation :',
  currencyLabel: 'Afficher aussi, à titre indicatif, en',
  francsOnly: 'Francs suisses uniquement',
  currencies: { EUR: 'Euro (EUR)', GBP: 'Livre sterling (GBP)', USD: 'Dollar américain (USD)', AED: 'Dirham des EAU (AED)' },
  language: 'Langue',
  suggestOwn: 'Cette page existe aussi en français.',
  suggestGo: 'Lire en français',
  dismiss: 'Fermer',
};

export const CHROME: Record<Lang, Chrome> = {
  en: EN,
  de: DE,
  fr: FR,
};

/** Names of the languages, each in its own language. */
export const LANGUAGE_NAMES: Record<Lang, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
};
