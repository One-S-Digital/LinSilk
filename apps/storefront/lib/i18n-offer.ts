/* The first-order offer: 20% of a client's first order comes back as credit
 * once it is delivered (the rules are in apps/medusa/src/lib/first-order-credit.ts).
 * English is the source; German and French are for a native-speaker pass
 * before they go live (docs/seo/SEO-GEO-PLAN.md §13.7). */

import { deepDe, type Lang } from './i18n';

export const OFFER_PERCENT = 20;

const EN = {
  eyebrow: 'For your first order',
  title: `${OFFER_PERCENT}% back on your first piece`,
  lead: `Order your first made-to-measure piece in silk, linen or cashmere and ${OFFER_PERCENT}% of it returns to you as credit for the next, once it has been delivered.`,
  terms:
    'Worked out on the pieces, without shipping, tax or duties. The credit arrives by email as a single-use code, is valid for twelve months and cannot be combined with another code. One offer per client.',
  cta: 'Discover the collection',
  close: 'Close',
  note: `Your first order earns ${OFFER_PERCENT}% back as credit for the next, once it has been delivered.`,
  noteTerms: 'Without shipping, tax or duties. Single use, valid for twelve months, not combinable with another code.',
};

export type OfferText = typeof EN;

const DE_CH: OfferText = {
  eyebrow: 'Für Ihre erste Bestellung',
  title: `${OFFER_PERCENT}% zurück auf Ihr erstes Stück`,
  lead: `Bestellen Sie Ihr erstes Stück nach Mass in Seide, Leinen oder Kaschmir, und ${OFFER_PERCENT}% davon erhalten Sie nach der Lieferung als Guthaben für das nächste zurück.`,
  terms:
    'Berechnet auf die Stücke, ohne Versand, Steuern und Zölle. Das Guthaben kommt per E-Mail als Code für eine einmalige Verwendung, gilt zwölf Monate und lässt sich nicht mit einem anderen Code verbinden. Ein Angebot pro Kundin oder Kunde.',
  cta: 'Kollektion entdecken',
  close: 'Schliessen',
  note: `Ihre erste Bestellung bringt Ihnen ${OFFER_PERCENT}% als Guthaben für die nächste, sobald sie geliefert ist.`,
  noteTerms: 'Ohne Versand, Steuern und Zölle. Einmal verwendbar, zwölf Monate gültig, nicht mit einem anderen Code kombinierbar.',
};

const FR: OfferText = {
  eyebrow: 'Pour votre première commande',
  title: `${OFFER_PERCENT}% de retour sur votre première pièce`,
  lead: `Commandez votre première pièce sur mesure en soie, en lin ou en cachemire : ${OFFER_PERCENT}% de son prix vous revient en crédit pour la suivante, une fois la commande livrée.`,
  terms:
    'Calculé sur les pièces, hors livraison, taxes et droits de douane. Le crédit arrive par e-mail sous la forme d’un code à usage unique, valable douze mois, non cumulable avec un autre code. Une offre par cliente ou client.',
  cta: 'Découvrir la collection',
  close: 'Fermer',
  note: `Votre première commande vous rend ${OFFER_PERCENT}% en crédit pour la suivante, une fois livrée.`,
  noteTerms: 'Hors livraison, taxes et droits de douane. Usage unique, valable douze mois, non cumulable avec un autre code.',
};

export function offerText(lang: Lang): OfferText {
  if (lang === 'en') return EN;
  if (lang === 'fr' || lang === 'fr-ch') return FR;
  return lang === 'de-ch' ? DE_CH : deepDe(DE_CH);
}
