/* The words on a piece page, in each language, and the question set for each
 * kind of garment (docs/seo/SEO-GEO-PLAN.md §6.6, COPY-PAGES §6). English
 * keeps its own sets in lib/garments.ts. German and French are for a
 * native-speaker pass before they go live (§13.7). */

import { CATEGORY, QUESTIONS, type GarmentType, type QA } from './garments';
import type { Piece } from './catalog';
import { deepDe, LOCALES, type Lang, type Locale } from './i18n';
import { piecePath, pieceLanguages } from './locale-routes';
import { pieceName } from './piece-names';
import { slugify } from './slug';

export type PieceText = {
  collection: string;
  men: string;
  women: string;
  archive: string;
  cloth: { silk: string; linen: string };
  /** The body paragraph under the title. */
  description: (cloth: string) => string;
  run: (numeral: string) => string;
  weeks: string;
  closed: string;
  factsH: string;
  factCloth: string;
  factColours: string;
  coloursLine: (cloth: 'silk' | 'linen', n: number) => string;
  seeCloth: string;
  factMaking: string;
  makingLine: string;
  factCare: string;
  careLine: string;
  factDelivery: string;
  deliveryLine: string;
  shippingLink: string;
  howH: string;
  howList: [string, string, string];
  measuringPre: string;
  measuringLink: string;
  measuringPost: string;
  howLink: string;
  questionsH: (category: string) => string;
  moreQuestions: string;
  allQuestions: string;
  alsoIn: (cloth: string) => string;
  /** Page title and meta description. */
  title: (name: string) => string;
  meta: (name: string, cloth: string, colours: string, price: string) => string;
  metaClosed: (name: string, cloth: string, season: string) => string;
  /** Image alt text. */
  altWho: { women: string; men: string };
  altLine: (who: string, name: string, view: string) => string;
  views: Record<string, string>;
  viewN: (n: number) => string;
  /** Product schema description. */
  ldDescription: (name: string, cloth: string) => string;
  category: Record<GarmentType, string>;
  questions: Record<GarmentType, QA[]>;
};

const CARE_SILK: QA = {
  q: 'Wie pflege ich es?',
  a: 'Seide mag kühle Handwäsche und liegendes Trocknen ohne direkte Sonne; sie gehört nicht in den Tumbler.',
};
const CARE_LINEN: QA = {
  q: 'Wie pflege ich es?',
  a: 'Leinen mag kühle Handwäsche und liegendes Trocknen ohne direkte Sonne; es gehört nicht in den Tumbler.',
};
const CREASE: QA = {
  q: 'Knittert Leinen?',
  a: 'Ja. Natürliches Leinen knittert, wird weicher und altert mit dem Tragen; das ist der Stoff, kein Mangel.',
};
const ORDER_AHEAD: QA = {
  q: 'Wie früh sollte ich für einen Anlass bestellen?',
  a: 'Etwa sechs Wochen vor einem Termin in Europa und acht Wochen vor einem weiter entfernten: Das Stück braucht 2–4 Wochen ab Ihrem bestätigten Massblatt, dann je nach Ort 2–10 Tage bis zur Ankunft.',
};
const DRESS_LENGTH: QA = {
  q: 'Wie wähle ich die Länge?',
  a: 'Die Länge bestimmen Sie selbst: Messen Sie von der Schulterhöhe über die Brust senkrecht nach unten bis dorthin, wo der Saum fallen soll. Hilfreich ist ein Vergleich mit einem Kleid, das Sie schon besitzen und mögen.',
};

const DE_QUESTIONS: Record<GarmentType, QA[]> = {
  gown: [DRESS_LENGTH, ORDER_AHEAD, CARE_SILK],
  dress: [
    DRESS_LENGTH,
    {
      q: 'Ist ein Seidenkleid bei warmem Wetter angenehm?',
      a: 'Ja. Seide atmet und liegt leicht auf der Haut, und sie bleibt angenehm, wenn die Temperatur sinkt wie auch wenn sie steigt.',
    },
    ORDER_AHEAD,
  ],
  skirt: [
    {
      q: 'Wie wähle ich die Rocklänge?',
      a: 'Messen Sie von Ihrer natürlichen Taille senkrecht nach unten bis dorthin, wo der Saum fallen soll.',
    },
    {
      q: 'Welche Masse braucht ein Rock?',
      a: 'Nur Taille, Hüfte und Hüfttiefe, dazu die Rocklänge. Oberkörper und Bein entfallen auf dem Blatt.',
    },
    CARE_SILK,
  ],
  blouse: [
    {
      q: 'Wie wähle ich die Länge?',
      a: 'Messen Sie von der Schulternaht senkrecht nach unten bis dorthin, wo der Saum fallen soll, am besten an einem Oberteil, das Sie schon besitzen und mögen.',
    },
    {
      q: 'Welche Masse braucht eine Bluse?',
      a: 'Die Oberkörpermasse, Taille und Hüfte, dazu die Länge. Das Bein entfällt auf dem Blatt.',
    },
    CARE_SILK,
  ],
  'linen-set': [
    {
      q: 'Werden die zwei Teile getrennt vermessen?',
      a: 'Sie teilen ein Massblatt, und jedes Teil erhält seine eigene Länge, sodass Oberteil und Hose oder Shorts jeweils dort fallen, wo Sie es möchten.',
    },
    CREASE,
    CARE_LINEN,
  ],
  sleepwear: [
    {
      q: 'Kann ich es verschenken?',
      a: 'Ja, mit einer Einschränkung: Es wird nach Mass gefertigt, daher brauchen Sie die Masse der beschenkten Person. Schicken Sie ihr die Messanleitung, oder bitten Sie sie, die fünfzehn Masse bei einer Schneiderei nehmen zu lassen.',
    },
    {
      q: 'Ist Seide gut zum Schlafen?',
      a: 'Seide ist glatt, atmet und bleibt angenehm, ob die Nacht warm oder kühl ist.',
    },
    CARE_SILK,
  ],
  shirt: [
    {
      q: 'Welche Masse braucht ein Hemd?',
      a: 'Die Oberkörpermasse, Taille und Hüfte, dazu die gewünschte Länge. Das Bein entfällt auf dem Blatt.',
    },
    {
      q: 'Ist Leinen gut bei heissem Wetter?',
      a: 'Leinen ist fest, luftig und kühlend; es atmet in der Hitze und wird mit jedem Tragen weicher.',
    },
    CREASE,
  ],
  trousers: [
    {
      q: 'Wie wähle ich die Hosenlänge?',
      a: 'Messen Sie von Ihrer natürlichen Taille an der Aussenseite des Beins bis dorthin, wo der Saum fallen soll, ohne Schuhe.',
    },
    {
      q: 'Welche Masse braucht eine Hose?',
      a: 'Taille, Hüfte, Hüfttiefe, Oberschenkel, Knie und Schritthöhe, dazu die Hosenlänge. Der Oberkörper entfällt auf dem Blatt.',
    },
    CREASE,
  ],
};

const FR_CARE_SILK: QA = {
  q: 'Comment l’entretenir ?',
  a: 'La soie préfère un lavage à la main à l’eau fraîche et un séchage à plat, à l’abri du soleil direct ; elle n’aime pas le sèche-linge.',
};
const FR_CARE_LINEN: QA = {
  q: 'Comment l’entretenir ?',
  a: 'Le lin préfère un lavage à la main à l’eau fraîche et un séchage à plat, à l’abri du soleil direct ; il n’aime pas le sèche-linge.',
};
const FR_CREASE: QA = {
  q: 'Le lin se froisse-t-il ?',
  a: 'Oui. Le lin naturel se froisse, s’assouplit et vieillit avec le port ; c’est le tissu, pas un défaut.',
};
const FR_ORDER_AHEAD: QA = {
  q: 'Combien de temps à l’avance faut-il commander pour un événement ?',
  a: 'Environ six semaines avant une date en Europe et huit semaines avant une date plus lointaine : la pièce prend 2 à 4 semaines à partir de votre fiche de mesures confirmée, puis 2 à 10 jours pour arriver selon l’endroit.',
};
const FR_DRESS_LENGTH: QA = {
  q: 'Comment choisir la longueur ?',
  a: 'Vous indiquez vous-même la longueur : mesurez depuis le haut de l’épaule, par-dessus la poitrine, tout droit jusqu’à l’endroit où l’ourlet doit tomber. Se référer à une robe que vous possédez et aimez aide beaucoup.',
};

const FR_QUESTIONS: Record<GarmentType, QA[]> = {
  gown: [FR_DRESS_LENGTH, FR_ORDER_AHEAD, FR_CARE_SILK],
  dress: [
    FR_DRESS_LENGTH,
    {
      q: 'Une robe en soie est-elle agréable par temps chaud ?',
      a: 'Oui. La soie respire et repose légèrement sur la peau, et reste agréable quand la température baisse comme quand elle monte.',
    },
    FR_ORDER_AHEAD,
  ],
  skirt: [
    {
      q: 'Comment choisir la longueur de la jupe ?',
      a: 'Mesurez depuis votre taille naturelle, tout droit jusqu’à l’endroit où l’ourlet doit tomber.',
    },
    {
      q: 'Quelles mesures faut-il pour une jupe ?',
      a: 'Seulement la taille, les hanches et la profondeur de hanches, plus la longueur de jupe. La fiche omet le haut du corps et la jambe.',
    },
    FR_CARE_SILK,
  ],
  blouse: [
    {
      q: 'Comment choisir la longueur ?',
      a: 'Mesurez depuis la couture d’épaule, tout droit jusqu’à l’endroit où l’ourlet doit tomber, idéalement sur un haut que vous possédez et aimez.',
    },
    {
      q: 'Quelles mesures faut-il pour un chemisier ?',
      a: 'Les mesures du haut du corps, la taille et les hanches, plus la longueur. La fiche omet la jambe.',
    },
    FR_CARE_SILK,
  ],
  'linen-set': [
    {
      q: 'Les deux pièces sont-elles mesurées séparément ?',
      a: 'Elles partagent une même fiche de mesures et chaque vêtement a sa propre longueur, si bien que le haut et le pantalon ou le short tombent chacun là où vous le souhaitez.',
    },
    FR_CREASE,
    FR_CARE_LINEN,
  ],
  sleepwear: [
    {
      q: 'Puis-je l’offrir en cadeau ?',
      a: 'Oui, avec une réserve : il est fait sur mesure, il faut donc les mesures de la personne qui le reçoit. Envoyez-lui le guide de mesure, ou demandez-lui de faire prendre les quinze mesures chez un tailleur.',
    },
    {
      q: 'La soie est-elle agréable pour dormir ?',
      a: 'La soie est lisse, respire et reste agréable que la nuit soit chaude ou fraîche.',
    },
    FR_CARE_SILK,
  ],
  shirt: [
    {
      q: 'Quelles mesures faut-il pour une chemise ?',
      a: 'Les mesures du haut du corps, la taille et les hanches, plus la longueur souhaitée. La fiche omet la jambe.',
    },
    {
      q: 'Le lin est-il adapté aux fortes chaleurs ?',
      a: 'Le lin est ferme, aéré et rafraîchissant ; il respire par forte chaleur et s’assouplit à chaque port.',
    },
    FR_CREASE,
  ],
  trousers: [
    {
      q: 'Comment choisir la longueur du pantalon ?',
      a: 'Mesurez depuis la taille naturelle le long de l’extérieur de la jambe jusqu’à l’endroit où l’ourlet doit tomber, sans chaussures.',
    },
    {
      q: 'Quelles mesures faut-il pour un pantalon ?',
      a: 'La taille, les hanches, la profondeur de hanches, la cuisse, le genou et l’entrejambe, plus la longueur du pantalon. La fiche omet le haut du corps.',
    },
    FR_CREASE,
  ],
};

const DE_CH: PieceText = {
  collection: 'Kollektion',
  men: 'Herren',
  women: 'Damen',
  archive: 'Archiv',
  cloth: { silk: 'Seide', linen: 'Leinen' },
  description: (cloth) =>
    `Nach Mass gefertigt aus 100 % ${cloth}: nach Ihren eigenen Massen zugeschnitten und genäht, innert zwei bis vier Wochen ab Ihrem bestätigten Massblatt, zweimal geprüft und dann ab Genf versandt. Von Hand flach zugeschnitten nach einem Schnitt, der nach Ihrem Blatt gezeichnet wird, dann auf der Maschine geschlossen und am Tisch fertiggestellt – Saum, Besätze und Futter von Hand.`,
  run: (n) => `Kollektion ${n}`,
  weeks: 'zwei bis vier Wochen',
  closed: 'abgeschlossen',
  factsH: 'Die Fakten',
  factCloth: 'Stoff',
  factColours: 'Farben',
  coloursLine: (cloth, n) =>
    cloth === 'linen'
      ? `Eine von ${n} Leinenfarben.`
      : `Eine von ${n} Seidenfarben: glatt, Jacquard und Brokat.`,
  seeCloth: 'Den Stoff ansehen',
  factMaking: 'Fertigungszeit',
  makingLine: '2–4 Wochen ab Ihrem bestätigten Massblatt',
  factCare: 'Pflege',
  careLine: 'Kühle Handwäsche, liegend trocknen, nicht in direkter Sonne',
  factDelivery: 'Lieferung',
  deliveryLine:
    'Schweiz 2–3 Tage, EU und Grossbritannien 3–6, übrige Welt 5–10, nach dem Versand ab Genf, mit Sendungsverfolgung.',
  shippingLink: 'Versand und Zoll',
  howH: 'So entsteht es nach Mass',
  howList: [
    'Wählen Sie Ihre Farbe aus den Mustern seines Stoffs.',
    'Geben Sie Ihre Masse ein; die Messanleitung hilft dabei.',
    'Es wird in 2–4 Wochen zugeschnitten und genäht und mit Sendungsverfolgung versandt.',
  ],
  measuringPre: 'Geben Sie Ihre Masse ein; die ',
  measuringLink: 'Messanleitung',
  measuringPost: ' hilft dabei.',
  howLink: 'So funktioniert Nach-Mass bei LINSILK',
  questionsH: (c) => `Fragen zu ${c}`,
  moreQuestions: 'Lieferzeit, Zoll und Rückgabe:',
  allQuestions: 'alle Fragen',
  alsoIn: (cloth) => `Auch in ${cloth}`,
  title: (name) => `${name}, nach Mass | LINSILK`,
  meta: (name, cloth, colours, price) =>
    `${name} aus 100 % ${cloth}, nach Ihren Massen zugeschnitten und genäht in 2–4 Wochen. ${colours}. ${price}.`,
  metaClosed: (name, cloth, season) => `${name} aus 100 % ${cloth}, aus ${season}.`,
  altWho: { women: 'Frau', men: 'Mann' },
  altLine: (who, name, view) => `${who} in ${name}, nach Mass gefertigt, ${view}`,
  viewN: (n) => `Ansicht ${n}`,
  ldDescription: (name, cloth) =>
    `${name}, nach Mass gefertigt aus 100 % ${cloth}: nach Ihren eigenen Massen zugeschnitten und genäht in 2–4 Wochen, dann ab Genf versandt.`,
  views: {
    FULL_FRONT: 'Vorderansicht',
    UPPER: 'Detail Oberkörper',
    LOWER: 'Detail unterer Teil und Saum',
    SIDE: 'Dreiviertelansicht von der Seite',
    BACK: 'Rückansicht',
    ALT_DETAIL: 'Dreiviertelansicht',
    FULL_LOOK: 'ganzer Look mit dem passenden Stück',
    LONG_PANTS: 'mit langer Hose getragen',
  },
  category: {
    gown: 'Abendkleidern',
    dress: 'Kleidern',
    skirt: 'Röcken',
    blouse: 'Blusen',
    'linen-set': 'Leinen-Sets',
    sleepwear: 'Schlafmode',
    shirt: 'Hemden',
    trousers: 'Hosen',
  },
  questions: DE_QUESTIONS,
};

const FR: PieceText = {
  collection: 'Collection',
  men: 'Hommes',
  women: 'Femmes',
  archive: 'Archives',
  cloth: { silk: 'soie', linen: 'lin' },
  description: (cloth) =>
    `Fait sur mesure en 100 % ${cloth} : coupé et cousu à vos propres mesures en deux à quatre semaines à partir de votre fiche confirmée, inspecté deux fois, puis expédié depuis Genève. Coupé à plat à la main d’après un patron tracé sur votre fiche, puis assemblé à la machine et fini à l’établi – ourlet, parementures et doublure à la main.`,
  run: (n) => `Collection ${n}`,
  weeks: 'deux à quatre semaines',
  closed: 'close',
  factsH: 'L’essentiel',
  factCloth: 'Tissu',
  factColours: 'Coloris',
  coloursLine: (cloth, n) =>
    cloth === 'linen'
      ? `L’un des ${n} coloris de lin.`
      : `L’un des ${n} coloris de soie : unie, jacquard et brocart.`,
  seeCloth: 'Voir le tissu',
  factMaking: 'Délai de confection',
  makingLine: '2 à 4 semaines à partir de votre fiche de mesures confirmée',
  factCare: 'Entretien',
  careLine: 'Lavage à la main à l’eau fraîche, séchage à plat à l’abri du soleil direct',
  factDelivery: 'Livraison',
  deliveryLine:
    'Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6, reste du monde 5 à 10, une fois expédié depuis Genève, avec suivi.',
  shippingLink: 'Livraison et douane',
  howH: 'Comment il est fait sur mesure',
  howList: [
    'Choisissez votre coloris parmi les échantillons de son tissu.',
    'Indiquez vos mesures ; le guide de mesure vous aide.',
    'Il est coupé et cousu en 2 à 4 semaines et envoyé avec suivi.',
  ],
  measuringPre: 'Indiquez vos mesures ; le ',
  measuringLink: 'guide de mesure',
  measuringPost: ' vous aide.',
  howLink: 'Comment fonctionne le sur-mesure chez LINSILK',
  questionsH: (c) => `Questions sur ${c}`,
  moreQuestions: 'Délais, douane et retours :',
  allQuestions: 'toutes les questions',
  alsoIn: (cloth) => `Aussi en ${cloth}`,
  title: (name) => `${name}, sur mesure | LINSILK`,
  meta: (name, cloth, colours, price) =>
    `${name} en 100 % ${cloth}, coupé et cousu à vos mesures en 2 à 4 semaines. ${colours}. ${price}.`,
  metaClosed: (name, cloth, season) => `${name} en 100 % ${cloth}, de ${season}.`,
  altWho: { women: 'Femme', men: 'Homme' },
  altLine: (who, name, view) => `${who} portant ${name.charAt(0).toLowerCase()}${name.slice(1)}, fait sur mesure, ${view}`,
  viewN: (n) => `vue ${n}`,
  ldDescription: (name, cloth) =>
    `${name}, fait sur mesure en 100 % ${cloth} : coupé et cousu à vos propres mesures en 2 à 4 semaines, puis expédié depuis Genève.`,
  views: {
    FULL_FRONT: 'vue de face',
    UPPER: 'détail du haut du corps',
    LOWER: 'détail du bas et de l’ourlet',
    SIDE: 'vue de trois quarts de côté',
    BACK: 'vue de dos',
    ALT_DETAIL: 'vue de trois quarts',
    FULL_LOOK: 'tenue complète avec la pièce assortie',
    LONG_PANTS: 'porté avec un pantalon long',
  },
  category: {
    gown: 'les robes de soirée',
    dress: 'les robes',
    skirt: 'les jupes',
    blouse: 'les chemisiers',
    'linen-set': 'les ensembles en lin',
    sleepwear: 'les vêtements de nuit',
    shirt: 'les chemises',
    trousers: 'les pantalons',
  },
  questions: FR_QUESTIONS,
};

export const PIECE_TEXT: Record<Exclude<Lang, 'en'>, PieceText> = {
  'de-ch': DE_CH,
  de: deepDe(DE_CH),
  'fr-ch': FR,
  fr: FR,
};

const EN: PieceText = {
  collection: 'Collection',
  men: 'Men',
  women: 'Women',
  archive: 'Archive',
  cloth: { silk: 'silk', linen: 'linen' },
  description: (cloth) =>
    `Made to measure in 100% ${cloth}: cut and sewn to your own measurements in two to four weeks from your confirmed sheet, inspected twice, then dispatched from Geneva. Cut flat by hand from a pattern drawn to your sheet, then closed on the machine and finished at the bench — hem, facings and lining by hand.`,
  run: (n) => `Collection ${n}`,
  weeks: 'two to four weeks',
  closed: 'closed',
  factsH: 'The facts',
  factCloth: 'Cloth',
  factColours: 'Colours',
  coloursLine: (cloth, n) =>
    cloth === 'linen'
      ? `Any of ${n} linen colours.`
      : `Any of ${n} silk colours: plain, jacquard and brocade.`,
  seeCloth: 'See the cloth',
  factMaking: 'Making time',
  makingLine: '2–4 weeks from your confirmed measurement sheet',
  factCare: 'Care',
  careLine: 'Cool hand-wash, dry flat out of direct sun',
  factDelivery: 'Delivery',
  deliveryLine:
    'Switzerland 2–3 days, EU and UK 3–6, rest of world 5–10, once dispatched from Geneva, with tracking.',
  shippingLink: 'Shipping and duty',
  howH: 'How it is made to measure',
  howList: [
    'Choose your colour from the swatches of its cloth.',
    'Enter your measurements; the measuring guide helps.',
    'It is cut and sewn in 2–4 weeks and sent with tracking.',
  ],
  measuringPre: 'Enter your measurements; the ',
  measuringLink: 'measuring guide',
  measuringPost: ' helps.',
  howLink: 'How made-to-measure works at LINSILK',
  questionsH: (c) => `Questions about ${c}`,
  moreQuestions: 'Lead time, duty and returns:',
  allQuestions: 'all questions',
  alsoIn: (cloth) => `Also in ${cloth}`,
  title: (name) => `${name}, made to measure | LINSILK`,
  meta: (name, cloth, colours, price) =>
    `${name} in 100% ${cloth}, cut and sewn to your measurements in 2–4 weeks. Choose from ${colours} colours. ${price}.`,
  metaClosed: (name, cloth, season) => `${name} in 100% ${cloth}, from ${season}.`,
  altWho: { women: 'Woman', men: 'Man' },
  altLine: (who, name, view) => `${who} wearing a made-to-measure ${name.charAt(0).toLowerCase()}${name.slice(1)}, ${view}`,
  viewN: (n) => `view ${n}`,
  ldDescription: (name, cloth) =>
    `${name}, made to measure in 100% ${cloth}: cut and sewn to your own measurements in 2–4 weeks, then dispatched from Geneva.`,
  views: {
    FULL_FRONT: 'front view',
    UPPER: 'upper body detail',
    LOWER: 'lower body and hem detail',
    SIDE: 'three-quarter side view',
    BACK: 'back view',
    ALT_DETAIL: 'three-quarter view',
    FULL_LOOK: 'full look with the matching piece',
    LONG_PANTS: 'worn with long trousers',
  },
  category: Object.fromEntries(
    Object.entries(CATEGORY).map(([k, v]) => [k, v.label.toLowerCase()]),
  ) as Record<GarmentType, string>,
  questions: QUESTIONS,
};

export const pieceText = (lang: Lang): PieceText => (lang === 'en' ? EN : PIECE_TEXT[lang]);

/* ---- Addresses ---- */

/** The piece's address slug in a locale: its translated name, hyphenated. */
export const localSlug = (locale: Locale, name: string) => slugify(pieceName(name, locale));

/** Where a piece lives in a language. */
export const piecePathIn = (lang: Lang, piece: Pick<Piece, 'slug' | 'name'>) =>
  lang === 'en' ? `/piece/${piece.slug}` : piecePath(lang, localSlug(lang, piece.name));

/** All of a piece's languages, for hreflang. */
export const pieceAlternates = (piece: Pick<Piece, 'slug' | 'name'>) =>
  pieceLanguages(
    piece.slug,
    Object.fromEntries(LOCALES.map((l) => [l, localSlug(l, piece.name)])) as Record<Locale, string>,
  );
