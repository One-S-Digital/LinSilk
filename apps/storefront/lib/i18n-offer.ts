/* The first-order offer: 20% of a client's first order comes back as credit
 * once it is delivered (the rules are in apps/medusa/src/lib/first-order-credit.ts).
 * English is the source; German and French are for a native-speaker pass
 * before they go live (docs/seo/SEO-GEO-PLAN.md §13.7). */

import type { Lang } from './i18n';

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

const DE: OfferText = {
  eyebrow: 'Zu Ihrer ersten Bestellung',
  title: `${OFFER_PERCENT} % Guthaben auf Ihr erstes Stück`,
  lead: `Bestellen Sie Ihr erstes massgefertigtes Stück aus Seide, Leinen oder Kaschmir: ${OFFER_PERCENT} % des Preises schreiben wir Ihnen nach der Lieferung als Guthaben für das nächste Stück gut.`,
  terms:
    'Berechnet wird das Guthaben auf den Preis der Stücke, ohne Versand, Steuern und Zölle. Sie erhalten es per E-Mail als Code, der einmal einlösbar ist, zwölf Monate gilt und sich nicht mit einem anderen Code verbinden lässt. Das Angebot gilt einmal pro Kundin oder Kunde.',
  cta: 'Kollektion entdecken',
  close: 'Schliessen',
  note: `Zu Ihrer ersten Bestellung erhalten Sie ${OFFER_PERCENT} % als Guthaben für die nächste, sobald sie geliefert ist.`,
  noteTerms: 'Ohne Versand, Steuern und Zölle. Einmal einlösbar, zwölf Monate gültig, nicht mit anderen Codes kombinierbar.',
};

const FR: OfferText = {
  eyebrow: 'Pour votre première commande',
  title: `${OFFER_PERCENT} % de crédit sur votre première pièce`,
  lead: `Commandez votre première pièce sur mesure en soie, en lin ou en cachemire : une fois la commande livrée, ${OFFER_PERCENT} % de son prix vous est reversé sous forme de crédit pour la suivante.`,
  terms:
    'Le crédit est calculé sur le prix des pièces, hors livraison, taxes et droits de douane. Vous le recevez par e-mail sous la forme d’un code à usage unique, valable douze mois et non cumulable avec un autre code. L’offre est limitée à une par client.',
  cta: 'Découvrir la collection',
  close: 'Fermer',
  note: `Votre première commande vous donne droit à ${OFFER_PERCENT} % de crédit sur la suivante, une fois livrée.`,
  noteTerms: 'Hors livraison, taxes et droits de douane. Usage unique, valable douze mois, non cumulable avec un autre code.',
};

export function offerText(lang: Lang): OfferText {
  if (lang === 'en') return EN;
  if (lang === 'fr') return FR;
  return DE;
}
