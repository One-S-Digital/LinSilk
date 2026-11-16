/* The contact form's words. English is the source; German and French are for
 * a native-speaker pass before they go live (docs/seo/SEO-GEO-PLAN.md §13.7). */

import type { Lang } from './i18n';

const EN = {
  title: 'Write to the house',
  name: 'Your name',
  email: 'Email',
  message: 'Your message',
  send: 'Send message',
  sending: 'Sending…',
  sent: 'Thank you. Your message has reached the house, and a person will answer by email, usually within a day.',
  invalid: 'Please give your name, a valid email address and a message.',
  failed: 'The message could not be sent. Please try again in a moment, or write to hello@bylinsilk.com.',
  privacy: 'Your details are used only to answer you.',
};

export type ContactText = typeof EN;

const DE: ContactText = {
  title: 'Schreiben Sie dem Haus',
  name: 'Ihr Name',
  email: 'E-Mail-Adresse',
  message: 'Ihre Nachricht',
  send: 'Nachricht senden',
  sending: 'Wird gesendet …',
  sent: 'Vielen Dank, Ihre Nachricht ist bei uns angekommen. Eine Person antwortet Ihnen per E-Mail, in der Regel innert eines Tages.',
  invalid: 'Bitte geben Sie Ihren Namen, eine gültige E-Mail-Adresse und Ihre Nachricht ein.',
  failed: 'Ihre Nachricht konnte leider nicht gesendet werden. Bitte versuchen Sie es in einem Moment noch einmal oder schreiben Sie direkt an hello@bylinsilk.com.',
  privacy: 'Wir verwenden Ihre Angaben ausschliesslich, um Ihnen zu antworten.',
};

const FR: ContactText = {
  title: 'Écrire à la maison',
  name: 'Votre nom',
  email: 'E-mail',
  message: 'Votre message',
  send: 'Envoyer le message',
  sending: 'Envoi en cours…',
  sent: 'Merci, votre message nous est bien parvenu. Une personne vous répondra par e-mail, en général dans la journée.',
  invalid: 'Veuillez indiquer votre nom, une adresse e-mail valide et un message.',
  failed: 'Votre message n’a malheureusement pas pu partir. Réessayez dans un instant, ou écrivez directement à hello@bylinsilk.com.',
  privacy: 'Vos coordonnées servent uniquement à vous répondre.',
};

export function contactText(lang: Lang): ContactText {
  if (lang === 'en') return EN;
  if (lang === 'fr') return FR;
  return DE;
}
