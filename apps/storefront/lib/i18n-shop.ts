/* The words of the cart, checkout, payment and order confirmation. English is
 * the source; German and French are for a native-speaker pass before they go
 * live (docs/seo/SEO-GEO-PLAN.md §13.7). Messages the backend or the payment
 * provider writes are shown as they arrive. */

import { deepDe, type Lang } from './i18n';

const EN = {
  cart: {
    title: 'Your cart',
    lede:
      'Nothing is cut until the atelier has read your sheet and written back. An order holds the design against the season’s capped run in the meantime.',
    empty: 'Your cart is empty.',
    enter: 'Enter the collection',
    design: 'Design an outfit',
    cloth: 'Cloth',
    sheet: 'Sheet',
    taken: (n: number, of: number) => `${n} of ${of} taken`,
    chest: 'chest',
    remove: 'Remove',
    terms:
      'Prices are in Swiss francs and include duty within Switzerland and the EU. A piece takes two to four weeks from the confirmed sheet.',
    piece: 'piece',
    pieces: 'pieces',
    shipping: 'Shipping',
    atCheckout: 'Calculated at checkout',
    total: 'Total',
    toCheckout: 'Continue to checkout',
    estimate:
      'Every figure here is the price of the piece. A commission is quoted separately: a tailor reads the brief and writes to you with its price.',
  },
  checkout: {
    title: 'Checkout',
    nothing:
      'There is nothing to check out. Order a piece from the season, or begin a commission, and it will appear here.',
    begin: 'Begin a commission',
    labels: {
      email: 'Email', firstName: 'First name', lastName: 'Last name', address1: 'Address',
      address2: 'Apartment, floor (optional)', postcode: 'Postcode', city: 'City', country: 'Country',
      phone: 'Telephone',
    } as Record<string, string>,
    required: 'Required',
    checkAddress: 'Check this address',
    invalidCode: 'That code is not valid for this order.',
    noPayment: 'The house cannot take payment on this region yet.',
    notPlaced: 'The order could not be placed. Nothing has been charged.',
    notCompleted: 'The payment was not completed. Nothing has been charged.',
    confirming: 'Confirming your payment…',
    promo: 'Promo code',
    apply: 'Apply',
    codeApplied: (codes: string) => `Code ${codes} applied.`,
    code: (code: string) => `Code ${code}`,
    remove: 'Remove',
    edit: 'Edit',
    s1: 'Where it goes',
    s2: 'How it travels',
    s3: 'Payment',
    phoneNote: 'A telephone number is required by the courier for customs clearance. It is not used for anything else.',
    saving: 'Saving…',
    toShipping: 'Continue to shipping',
    shipping: 'Shipping',
    included: 'Included',
    includedLower: 'included',
    noShip: 'The house does not ship to that address yet. Write to hello@bylinsilk.com and the atelier will arrange it.',
    moment: 'One moment…',
    toPayment: 'Continue to payment',
    yourOrder: 'Your order',
    subtotal: 'Subtotal',
    discount: 'Discount',
    total: 'Total',
    reassure: 'Nothing is cut until the atelier has confirmed your measurement sheet in writing.',
  },
  pay: {
    notConfigured: 'Payment is not configured on this storefront yet. Write to hello@bylinsilk.com and the atelier will take it from here.',
    notTaken: 'The payment was not taken. Nothing has been charged.',
    taking: 'Taking payment…',
    pay: (amount: string) => `Pay ${amount}`,
    choose: 'Choose how to pay',
    placing: 'Placing…',
    place: (amount: string) => `Place the order — ${amount}`,
    noCard: 'no card is charged',
    standIn: 'Standing in for Stripe',
    standInBody:
      'The house has no payment keys on this environment, so the order is placed without money moving. This cannot happen in production: a region with a real payment provider stops offering this one.',
  },
  approx: (currency: string, date: string | null) =>
    `You are charged in Swiss francs. The ${currency} figure is approximate${date ? `, at the European Central Bank’s rate of ${date}` : ''}; your bank sets its own rate.`,
  order: {
    eyebrow: 'The house',
    metaTitle: 'Your order',
    metaDescription: 'What the atelier has, and what happens next.',
    title: 'Thank you — it is with the atelier',
    leadCommission: 'Your commission is paid for and the bench has it. A pattern is drawn to your sheet before anything is cut.',
    lead: 'Your order is paid for. Nothing is cut until the atelier has read your sheet and written back to confirm it.',
    enter: 'Enter the collection',
    questions: 'Questions',
    heading: (ref: string) => `Order ${ref}`,
    no: (n: number) => `no. ${n}`,
    paid: (total: string, email: string) => `Paid in full: ${total}. A written confirmation is on its way to ${email}.`,
    yourEmail: 'your email',
    next: 'What happens next',
    nextCommission: 'Two to four weeks at the bench from today.',
    nextOrder: 'The atelier writes within two days to confirm your measurement sheet. Cutting begins once you have agreed it, and takes two to four weeks.',
    change: 'Anything to change, or a question about the sheet — write to',
    theHouse: 'the house',
    quote: 'and quote this order.',
  },
};

export type ShopText = typeof EN;

const DE_CH: ShopText = {
  cart: {
    title: 'Ihr Warenkorb',
    lede:
      'Nichts wird zugeschnitten, bevor das Atelier Ihr Massblatt gelesen und Ihnen geantwortet hat. Bis dahin reserviert die Bestellung das Modell in der begrenzten Auflage der Saison.',
    empty: 'Ihr Warenkorb ist leer.',
    enter: 'Zur Kollektion',
    design: 'Ein Outfit entwerfen',
    cloth: 'Stoff',
    sheet: 'Massblatt',
    taken: (n, of) => `${n} von ${of} genommen`,
    chest: 'Brust',
    remove: 'Entfernen',
    terms:
      'Die Preise verstehen sich in Schweizer Franken und enthalten die Zollabgaben innerhalb der Schweiz und der EU. Ein Stück braucht ab dem bestätigten Massblatt zwei bis vier Wochen.',
    piece: 'Stück',
    pieces: 'Stücke',
    shipping: 'Versand',
    atCheckout: 'Wird an der Kasse berechnet',
    total: 'Total',
    toCheckout: 'Weiter zur Kasse',
    estimate:
      'Jeder Betrag hier ist der Preis des Stücks. Ein Auftrag nach Mass wird separat offeriert: Eine Schneiderin oder ein Schneider liest Ihre Angaben und schreibt Ihnen mit dem Preis.',
  },
  checkout: {
    title: 'Kasse',
    nothing:
      'Es gibt nichts zu bezahlen. Bestellen Sie ein Stück aus der Saison oder beginnen Sie einen Auftrag nach Mass, dann erscheint es hier.',
    begin: 'Auftrag beginnen',
    labels: {
      email: 'E-Mail', firstName: 'Vorname', lastName: 'Nachname', address1: 'Adresse',
      address2: 'Wohnung, Stockwerk (optional)', postcode: 'Postleitzahl', city: 'Ort', country: 'Land',
      phone: 'Telefon',
    },
    required: 'Pflichtfeld',
    checkAddress: 'Bitte Adresse prüfen',
    invalidCode: 'Dieser Code ist für diese Bestellung nicht gültig.',
    noPayment: 'Das Atelier kann in dieser Region noch keine Zahlung entgegennehmen.',
    notPlaced: 'Die Bestellung konnte nicht aufgegeben werden. Es wurde nichts belastet.',
    notCompleted: 'Die Zahlung wurde nicht abgeschlossen. Es wurde nichts belastet.',
    confirming: 'Ihre Zahlung wird bestätigt…',
    promo: 'Gutscheincode',
    apply: 'Einlösen',
    codeApplied: (codes) => `Code ${codes} eingelöst.`,
    code: (code) => `Code ${code}`,
    remove: 'Entfernen',
    edit: 'Ändern',
    s1: 'Wohin es geht',
    s2: 'Wie es reist',
    s3: 'Zahlung',
    phoneNote: 'Die Telefonnummer verlangt der Kurier für die Zollabfertigung. Sie wird für nichts anderes verwendet.',
    saving: 'Wird gespeichert…',
    toShipping: 'Weiter zum Versand',
    shipping: 'Versand',
    included: 'Inbegriffen',
    includedLower: 'inbegriffen',
    noShip: 'Das Atelier liefert noch nicht an diese Adresse. Schreiben Sie an hello@bylinsilk.com, das Atelier organisiert es.',
    moment: 'Einen Moment…',
    toPayment: 'Weiter zur Zahlung',
    yourOrder: 'Ihre Bestellung',
    subtotal: 'Zwischensumme',
    discount: 'Rabatt',
    total: 'Total',
    reassure: 'Nichts wird zugeschnitten, bevor das Atelier Ihr Massblatt schriftlich bestätigt hat.',
  },
  pay: {
    notConfigured: 'Die Zahlung ist in diesem Shop noch nicht eingerichtet. Schreiben Sie an hello@bylinsilk.com, das Atelier übernimmt von dort.',
    notTaken: 'Die Zahlung wurde nicht ausgeführt. Es wurde nichts belastet.',
    taking: 'Zahlung wird ausgeführt…',
    pay: (amount) => `${amount} bezahlen`,
    choose: 'Zahlungsart wählen',
    placing: 'Wird aufgegeben…',
    place: (amount) => `Bestellung aufgeben – ${amount}`,
    noCard: 'keine Karte wird belastet',
    standIn: 'Platzhalter für Stripe',
    standInBody:
      'In dieser Umgebung sind keine Zahlungsschlüssel hinterlegt, deshalb wird die Bestellung ohne Geldfluss aufgegeben. Im Produktivbetrieb ist das nicht möglich: Eine Region mit einem echten Zahlungsanbieter bietet diese Variante nicht mehr an.',
  },
  approx: (currency, date) =>
    `Belastet wird in Schweizer Franken. Der Betrag in ${currency} ist ungefähr${date ? `, zum Kurs der Europäischen Zentralbank vom ${date}` : ''}; Ihre Bank legt ihren eigenen Kurs fest.`,
  order: {
    eyebrow: 'Das Haus',
    metaTitle: 'Ihre Bestellung',
    metaDescription: 'Was das Atelier hat und was als Nächstes geschieht.',
    title: 'Vielen Dank – es ist im Atelier',
    leadCommission: 'Ihr Auftrag ist bezahlt und liegt in der Werkstatt. Bevor zugeschnitten wird, entsteht ein Schnittmuster nach Ihrem Massblatt.',
    lead: 'Ihre Bestellung ist bezahlt. Es wird nichts zugeschnitten, bevor das Atelier Ihr Massblatt gelesen und Ihnen zur Bestätigung geschrieben hat.',
    enter: 'Zur Kollektion',
    questions: 'Fragen',
    heading: (ref) => `Bestellung ${ref}`,
    no: (n) => `Nr. ${n}`,
    paid: (total, email) => `Vollständig bezahlt: ${total}. Eine schriftliche Bestätigung ist unterwegs an ${email}.`,
    yourEmail: 'Ihre E-Mail-Adresse',
    next: 'Wie es weitergeht',
    nextCommission: 'Ab heute zwei bis vier Wochen in der Werkstatt.',
    nextOrder: 'Das Atelier schreibt Ihnen innert zwei Tagen, um Ihr Massblatt zu bestätigen. Der Zuschnitt beginnt, sobald Sie zugestimmt haben, und dauert zwei bis vier Wochen.',
    change: 'Etwas zu ändern oder eine Frage zum Massblatt? Schreiben Sie an',
    theHouse: 'das Haus',
    quote: 'und nennen Sie diese Bestellung.',
  },
};

const FR: ShopText = {
  cart: {
    title: 'Votre panier',
    lede:
      'Rien n’est coupé avant que l’atelier ait lu votre fiche de mesures et vous ait répondu. D’ici là, la commande réserve le modèle dans la série limitée de la saison.',
    empty: 'Votre panier est vide.',
    enter: 'Entrer dans la collection',
    design: 'Concevoir une tenue',
    cloth: 'Tissu',
    sheet: 'Fiche de mesures',
    taken: (n, of) => `${n} sur ${of} prises`,
    chest: 'poitrine',
    remove: 'Retirer',
    terms:
      'Les prix sont en francs suisses et comprennent les droits de douane en Suisse et dans l’UE. Une pièce demande de deux à quatre semaines à partir de la fiche confirmée.',
    piece: 'pièce',
    pieces: 'pièces',
    shipping: 'Livraison',
    atCheckout: 'Calculée à la caisse',
    total: 'Total',
    toCheckout: 'Passer à la caisse',
    estimate:
      'Chaque montant ici est le prix de la pièce. Une commande sur mesure est chiffrée séparément : un tailleur lit votre brief et vous écrit avec son prix.',
  },
  checkout: {
    title: 'Caisse',
    nothing:
      'Il n’y a rien à régler. Commandez une pièce de la saison, ou commencez une commande sur mesure, et elle apparaîtra ici.',
    begin: 'Commencer une commande sur mesure',
    labels: {
      email: 'E-mail', firstName: 'Prénom', lastName: 'Nom', address1: 'Adresse',
      address2: 'Appartement, étage (facultatif)', postcode: 'Code postal', city: 'Ville', country: 'Pays',
      phone: 'Téléphone',
    },
    required: 'Obligatoire',
    checkAddress: 'Vérifiez cette adresse',
    invalidCode: 'Ce code n’est pas valable pour cette commande.',
    noPayment: 'L’atelier ne peut pas encore encaisser de paiement dans cette région.',
    notPlaced: 'La commande n’a pas pu être passée. Rien n’a été débité.',
    notCompleted: 'Le paiement n’a pas abouti. Rien n’a été débité.',
    confirming: 'Confirmation de votre paiement…',
    promo: 'Code promotionnel',
    apply: 'Appliquer',
    codeApplied: (codes) => `Code ${codes} appliqué.`,
    code: (code) => `Code ${code}`,
    remove: 'Retirer',
    edit: 'Modifier',
    s1: 'Où ça va',
    s2: 'Comment ça voyage',
    s3: 'Paiement',
    phoneNote: 'Le transporteur exige un numéro de téléphone pour le dédouanement. Il n’est utilisé pour rien d’autre.',
    saving: 'Enregistrement…',
    toShipping: 'Continuer vers la livraison',
    shipping: 'Livraison',
    included: 'Incluse',
    includedLower: 'incluse',
    noShip: 'L’atelier ne livre pas encore à cette adresse. Écrivez à hello@bylinsilk.com : l’atelier s’en occupera.',
    moment: 'Un instant…',
    toPayment: 'Continuer vers le paiement',
    yourOrder: 'Votre commande',
    subtotal: 'Sous-total',
    discount: 'Remise',
    total: 'Total',
    reassure: 'Rien n’est coupé avant que l’atelier ait confirmé votre fiche de mesures par écrit.',
  },
  pay: {
    notConfigured: 'Le paiement n’est pas encore configuré sur cette boutique. Écrivez à hello@bylinsilk.com : l’atelier prendra le relais.',
    notTaken: 'Le paiement n’a pas été effectué. Rien n’a été débité.',
    taking: 'Paiement en cours…',
    pay: (amount) => `Payer ${amount}`,
    choose: 'Choisir le mode de paiement',
    placing: 'Envoi de la commande…',
    place: (amount) => `Passer la commande — ${amount}`,
    noCard: 'aucune carte n’est débitée',
    standIn: 'En remplacement de Stripe',
    standInBody:
      'Cet environnement n’a pas de clés de paiement : la commande est passée sans mouvement d’argent. Cela ne peut pas arriver en production : une région dotée d’un vrai prestataire de paiement n’offre plus celui-ci.',
  },
  approx: (currency, date) =>
    `Vous êtes débité en francs suisses. Le montant en ${currency} est approximatif${date ? `, au taux de la Banque centrale européenne du ${date}` : ''} ; votre banque applique son propre taux.`,
  order: {
    eyebrow: 'La maison',
    metaTitle: 'Votre commande',
    metaDescription: 'Ce que l’atelier a reçu, et la suite.',
    title: 'Merci — c’est à l’atelier',
    leadCommission: 'Votre commande sur mesure est payée et l’établi l’a reçue. Un patron est dessiné d’après votre fiche avant toute coupe.',
    lead: 'Votre commande est payée. Rien n’est coupé avant que l’atelier ait lu votre fiche de mesures et vous ait écrit pour la confirmer.',
    enter: 'Entrer dans la collection',
    questions: 'Questions',
    heading: (ref) => `Commande ${ref}`,
    no: (n) => `n° ${n}`,
    paid: (total, email) => `Payée en totalité : ${total}. Une confirmation écrite est en route vers ${email}.`,
    yourEmail: 'votre adresse e-mail',
    next: 'La suite',
    nextCommission: 'De deux à quatre semaines à l’établi à partir d’aujourd’hui.',
    nextOrder: 'L’atelier vous écrit sous deux jours pour confirmer votre fiche de mesures. La coupe commence dès que vous l’avez approuvée et dure de deux à quatre semaines.',
    change: 'Quelque chose à modifier, ou une question sur la fiche ? Écrivez à',
    theHouse: 'la maison',
    quote: 'en indiquant cette commande.',
  },
};

export function shopText(lang: Lang): ShopText {
  if (lang === 'en') return EN;
  if (lang === 'fr' || lang === 'fr-ch') return FR;
  return lang === 'de-ch' ? DE_CH : deepDe(DE_CH);
}

/** A piece's material line ('100% silk') in the reader's language. */
export function materialIn(material: string, lang: Lang): string {
  if (lang === 'en') return material;
  const fr = lang === 'fr' || lang === 'fr-ch';
  return material
    .replace(/\bsilk\b/gi, fr ? 'soie' : 'Seide')
    .replace(/\blinen\b/gi, fr ? 'lin' : 'Leinen');
}
