/* The words on a piece page, in each language, and the question set for each
 * kind of garment (docs/seo/SEO-GEO-PLAN.md §6.6, COPY-PAGES §6). English
 * keeps its own sets in lib/garments.ts. German and French are for a
 * native-speaker pass before they go live (§13.7). */

import { CATEGORY, QUESTIONS, type GarmentType, type QA } from './garments';
import type { Cloth, Piece } from './catalog';
import { PURE } from './house';
import { deepDe, LOCALES, type Lang, type Locale } from './i18n';
import { piecePath, pieceLanguages } from './locale-routes';
import { pieceName } from './piece-names';
import { slugify } from './slug';

export type PieceText = {
  collection: string;
  view: string;
  men: string;
  women: string;
  archive: string;
  cloth: { silk: string; linen: string; cashmere: string };
  /** `fibre` is how the cloth is claimed: '100% silk', or 'cashmere' until its composition is confirmed. */
  /** The body paragraph under the title. */
  description: (cloth: string) => string;
  run: (numeral: string) => string;
  weeks: string;
  closed: string;
  factsH: string;
  factCloth: string;
  factColours: string;
  coloursLine: (cloth: Cloth, n: number, own?: boolean) => string;
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
  /** A tie is ordered by colour alone, so its page says so instead of the measuring steps. */
  tie: {
    description: (fibre: string) => string;
    howH: string;
    title: (name: string) => string;
    meta: (name: string, fibre: string, colours: string, price: string) => string;
    ldDescription: (name: string, fibre: string) => string;
    makingLine: string;
    howList: [string, string];
    /** What each photograph of a tie shows, by view name. */
    views: Record<string, string>;
  };
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

const DE_CARE_CASHMERE: QA = {
  q: 'Wie pflege ich es?',
  a: 'Kaschmir mag kühle Handwäsche und liegendes Trocknen ohne direkte Sonne; es gehört nicht in den Tumbler.',
};

const DE_QUESTIONS: Record<GarmentType, QA[]> = {
  'cashmere-pants': [
    {
      q: 'Wie wähle ich die Hosenlänge?',
      a: 'Messen Sie von Ihrer natürlichen Taille an der Aussenseite des Beins bis dorthin, wo der Saum fallen soll, ohne Schuhe.',
    },
    {
      q: 'Welche Masse braucht eine Kaschmirhose?',
      a: 'Taille, Hüfte, Hüfttiefe, Oberschenkel, Knie und Schritthöhe, dazu die Hosenlänge. Der Oberkörper entfällt auf dem Blatt.',
    },
    {
      q: 'In welchen Farben gibt es die Hose?',
      a: 'Sie wählen aus 12 Kaschmirfarben, an Mustern des Stoffs selbst, bevor Sie Ihre Masse eingeben.',
    },
    DE_CARE_CASHMERE,
  ],
  tie: [
    {
      q: 'Braucht eine Krawatte Masse?',
      a: 'Nein. Eine Krawatte wird nicht nach Ihrem Körper zugeschnitten: Sie wählen die Farbe aus den angebotenen Mustern, und sie wird in einer Standardlänge gefertigt.',
    },
    {
      q: 'Wie breit ist die Krawatte?',
      a: 'Klassische Breite: etwa 8 cm an der breitesten Stelle des breiten Endes.',
    },
    {
      q: 'Was befindet sich auf der Rückseite?',
      a: 'Ein kleines gewebtes LINSILK-Etikett auf dem breiten Ende und eine Schlaufe aus derselben Seide, durch die das schmale Ende geführt wird. Das Foto der Rückseite zeigt genau, wo.',
    },
    {
      q: 'Wie lange dauert die Lieferung?',
      a: 'Nach dem Versand ab Genf, mit Sendungsverfolgung: 2–3 Tage in der Schweiz, 3–6 Tage in die EU und nach Grossbritannien, 5–10 Tage in andere Länder.',
    },
  ],
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

const FR_CARE_CASHMERE: QA = {
  q: 'Comment l’entretenir ?',
  a: 'Le cachemire préfère un lavage à la main à l’eau fraîche et un séchage à plat, à l’abri du soleil direct ; il n’aime pas le sèche-linge.',
};

const FR_QUESTIONS: Record<GarmentType, QA[]> = {
  'cashmere-pants': [
    {
      q: 'Comment choisir la longueur du pantalon ?',
      a: 'Mesurez depuis la taille naturelle le long de l’extérieur de la jambe jusqu’à l’endroit où l’ourlet doit tomber, sans chaussures.',
    },
    {
      q: 'Quelles mesures faut-il pour un pantalon en cachemire ?',
      a: 'La taille, les hanches, la profondeur de hanches, la cuisse, le genou et l’entrejambe, plus la longueur du pantalon. La fiche omet le haut du corps.',
    },
    {
      q: 'Dans quels coloris existe-t-il ?',
      a: 'Vous choisissez parmi 12 coloris de cachemire, sur des échantillons du tissu lui-même, avant d’indiquer vos mesures.',
    },
    FR_CARE_CASHMERE,
  ],
  tie: [
    {
      q: 'Une cravate demande-t-elle des mesures ?',
      a: 'Non. Une cravate n’est pas coupée à votre corps : vous choisissez le coloris parmi les échantillons proposés, et elle est faite dans une longueur standard.',
    },
    {
      q: 'Quelle est la largeur de la cravate ?',
      a: 'Largeur classique : environ 8 cm à l’endroit le plus large de la pointe large.',
    },
    {
      q: 'Que trouve-t-on au dos de la cravate ?',
      a: 'Une petite étiquette LINSILK tissée sur la pointe large, et un passant de la même soie où glisse la pointe étroite. La photo du dos montre exactement où.',
    },
    {
      q: 'Quel est le délai de livraison ?',
      a: 'Une fois expédiée depuis Genève, avec suivi : 2 à 3 jours en Suisse, 3 à 6 jours vers l’UE et le Royaume-Uni, 5 à 10 jours ailleurs.',
    },
  ],
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
  view: 'Ansehen',
  men: 'Herren',
  women: 'Damen',
  archive: 'Archiv',
  cloth: { silk: 'Seide', linen: 'Leinen', cashmere: 'Kaschmir' },
  description: (cloth) =>
    `Nach Mass gefertigt aus ${cloth}: nach Ihren eigenen Massen zugeschnitten und genäht, innert zwei bis vier Wochen ab Ihrem bestätigten Massblatt, zweimal geprüft und dann ab Genf versandt. Von Hand flach zugeschnitten nach einem Schnitt, der nach Ihrem Blatt gezeichnet wird, dann auf der Maschine geschlossen und am Tisch fertiggestellt – Saum, Besätze und Futter von Hand.`,
  run: (n) => `Kollektion ${n}`,
  weeks: 'zwei bis vier Wochen',
  closed: 'abgeschlossen',
  factsH: 'Die Fakten',
  factCloth: 'Stoff',
  factColours: 'Farben',
  coloursLine: (cloth, n, own) =>
    cloth === 'linen'
      ? `Eine von ${n} Leinenfarben.`
      : cloth === 'cashmere'
        ? `Eine von ${n} Kaschmirfarben.`
        : own
          ? `Eine von ${n} Seidenfarben.`
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
    `${name} aus ${cloth}, nach Ihren Massen zugeschnitten und genäht in 2–4 Wochen. ${colours}. ${price}.`,
  metaClosed: (name, cloth, season) => `${name} aus ${cloth}, aus ${season}.`,
  altWho: { women: 'Frau', men: 'Mann' },
  altLine: (who, name, view) => `${who} in ${name}, nach Mass gefertigt, ${view}`,
  viewN: (n) => `Ansicht ${n}`,
  ldDescription: (name, cloth) =>
    `${name}, nach Mass gefertigt aus ${cloth}: nach Ihren eigenen Massen zugeschnitten und genäht in 2–4 Wochen, dann ab Genf versandt.`,
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
    'cashmere-pants': 'Kaschmirhosen',
    tie: 'Krawatten',
  },
  questions: DE_QUESTIONS,
  tie: {
    description: (fibre) =>
      `Aus ${fibre}, klassische Breite von etwa 8 cm. Sie wählen nur die Farbe aus den Mustern, die für diese Krawatte angeboten werden; sie wird in einer Standardlänge gefertigt und ab Genf versandt.`,
    howH: 'So bestellen Sie sie',
    title: (name) => `${name} | LINSILK`,
    meta: (name, fibre, colours, price) =>
      `${name} aus ${fibre}: Sie wählen nur die Farbe, Masse sind nicht nötig. ${colours}. ${price}.`,
    ldDescription: (name, fibre) =>
      `${name} aus ${fibre}: Bestellung nur nach Farbe, in einer Standardlänge, dann ab Genf versandt.`,
    makingLine: 'Auf Bestellung gefertigt und ab Genf versandt',
    howList: [
      'Wählen Sie Ihre Farbe aus den Mustern, die für diese Krawatte angeboten werden.',
      'Sie wird in einer Standardlänge gefertigt und mit Sendungsverfolgung versandt.',
    ],
    views: {
      FULL_FRONT: 'aufgerollte Krawatte',
      ANGLE_ROLL: 'aufgerollte Krawatte, schräg',
      FLAT: 'flach ausgelegte Krawatte, beide Enden',
      DETAIL: 'Nahaufnahme des Seidengewebes',
      BACK: 'Rückseite der Krawatte mit dem LINSILK-Etikett',
    },
  },
};

const FR: PieceText = {
  collection: 'Collection',
  view: 'Voir',
  men: 'Hommes',
  women: 'Femmes',
  archive: 'Archives',
  cloth: { silk: 'soie', linen: 'lin', cashmere: 'cachemire' },
  description: (cloth) =>
    `Fait sur mesure en ${cloth} : coupé et cousu à vos propres mesures en deux à quatre semaines à partir de votre fiche confirmée, inspecté deux fois, puis expédié depuis Genève. Coupé à plat à la main d’après un patron tracé sur votre fiche, puis assemblé à la machine et fini à l’établi – ourlet, parementures et doublure à la main.`,
  run: (n) => `Collection ${n}`,
  weeks: 'deux à quatre semaines',
  closed: 'close',
  factsH: 'L’essentiel',
  factCloth: 'Tissu',
  factColours: 'Coloris',
  coloursLine: (cloth, n, own) =>
    cloth === 'linen'
      ? `L’un des ${n} coloris de lin.`
      : cloth === 'cashmere'
        ? `L’un des ${n} coloris de cachemire.`
        : own
          ? `L’un des ${n} coloris de soie.`
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
    `${name} en ${cloth}, coupé et cousu à vos mesures en 2 à 4 semaines. ${colours}. ${price}.`,
  metaClosed: (name, cloth, season) => `${name} en ${cloth}, de ${season}.`,
  altWho: { women: 'Femme', men: 'Homme' },
  altLine: (who, name, view) => `${who} portant ${name.charAt(0).toLowerCase()}${name.slice(1)}, fait sur mesure, ${view}`,
  viewN: (n) => `vue ${n}`,
  ldDescription: (name, cloth) =>
    `${name}, fait sur mesure en ${cloth} : coupé et cousu à vos propres mesures en 2 à 4 semaines, puis expédié depuis Genève.`,
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
    'cashmere-pants': 'les pantalons en cachemire',
    tie: 'les cravates',
  },
  questions: FR_QUESTIONS,
  tie: {
    description: (fibre) =>
      `En ${fibre}, largeur classique d’environ 8 cm. Vous choisissez seulement le coloris parmi les échantillons proposés pour cette cravate ; elle est faite dans une longueur standard et expédiée depuis Genève.`,
    howH: 'Comment la commander',
    title: (name) => `${name} | LINSILK`,
    meta: (name, fibre, colours, price) =>
      `${name} en ${fibre} : vous choisissez seulement le coloris, aucune mesure n’est nécessaire. ${colours}. ${price}.`,
    ldDescription: (name, fibre) =>
      `${name} en ${fibre} : commande par coloris seulement, dans une longueur standard, puis expédiée depuis Genève.`,
    makingLine: 'Faite sur commande et expédiée depuis Genève',
    howList: [
      'Choisissez votre coloris parmi les échantillons proposés pour cette cravate.',
      'Elle est faite dans une longueur standard et envoyée avec suivi.',
    ],
    views: {
      FULL_FRONT: 'cravate roulée',
      ANGLE_ROLL: 'cravate roulée, vue en angle',
      FLAT: 'cravate à plat, les deux pointes',
      DETAIL: 'gros plan du tissage de la soie',
      BACK: 'dos de la cravate avec l’étiquette LINSILK',
    },
  },
};

export const PIECE_TEXT: Record<Exclude<Lang, 'en'>, PieceText> = {
  'de-ch': DE_CH,
  de: deepDe(DE_CH),
  'fr-ch': FR,
  fr: FR,
};

const EN: PieceText = {
  collection: 'Collection',
  view: 'View',
  men: 'Men',
  women: 'Women',
  archive: 'Archive',
  cloth: { silk: 'silk', linen: 'linen', cashmere: 'cashmere' },
  description: (cloth) =>
    `Made to measure in ${cloth}: cut and sewn to your own measurements in two to four weeks from your confirmed sheet, inspected twice, then dispatched from Geneva. Cut flat by hand from a pattern drawn to your sheet, then closed on the machine and finished at the bench — hem, facings and lining by hand.`,
  run: (n) => `Collection ${n}`,
  weeks: 'two to four weeks',
  closed: 'closed',
  factsH: 'The facts',
  factCloth: 'Cloth',
  factColours: 'Colours',
  coloursLine: (cloth, n, own) =>
    cloth === 'linen'
      ? `Any of ${n} linen colours.`
      : cloth === 'cashmere'
        ? `Any of ${n} cashmere colours.`
        : own
          ? `Any of ${n} silk colours.`
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
    `${name} in ${cloth}, cut and sewn to your measurements in 2–4 weeks. Choose from ${colours} colours. ${price}.`,
  metaClosed: (name, cloth, season) => `${name} in ${cloth}, from ${season}.`,
  altWho: { women: 'Woman', men: 'Man' },
  altLine: (who, name, view) => `${who} wearing a made-to-measure ${name.charAt(0).toLowerCase()}${name.slice(1)}, ${view}`,
  viewN: (n) => `view ${n}`,
  ldDescription: (name, cloth) =>
    `${name}, made to measure in ${cloth}: cut and sewn to your own measurements in 2–4 weeks, then dispatched from Geneva.`,
  views: {
    FULL_FRONT: 'front view',
    UPPER: 'upper body detail',
    LOWER: 'lower body and hem detail',
    SIDE: 'three-quarter side view',
    BACK: 'back view',
    ALT_DETAIL: 'three-quarter view',
    FULL_LOOK: 'full look with the matching piece',
    LONG_PANTS: 'worn with long pants',
  },
  category: Object.fromEntries(
    Object.entries(CATEGORY).map(([k, v]) => [k, v.label.toLowerCase()]),
  ) as Record<GarmentType, string>,
  questions: QUESTIONS,
  tie: {
    description: (fibre) =>
      `In ${fibre}, classic width, about 8 cm at the widest point. You choose only the colour, from the swatches offered for this tie; it is made in one standard length and dispatched from Geneva.`,
    howH: 'How it is ordered',
    title: (name) => `${name} | LINSILK Geneva`,
    meta: (name, fibre, colours, price) =>
      `${name} in ${fibre}: you choose only the colour, no measurements needed. Choose from ${colours} colours. ${price}.`,
    ldDescription: (name, fibre) =>
      `${name}, in ${fibre}: ordered by colour alone, in one standard length, then dispatched from Geneva.`,
    makingLine: 'Made to order and dispatched from Geneva',
    howList: [
      'Choose your colour from the swatches offered for this tie.',
      'It is made in one standard length and sent with tracking.',
    ],
    views: {
      FULL_FRONT: 'rolled tie',
      ANGLE_ROLL: 'rolled tie, angled view',
      FLAT: 'tie laid flat, both blades',
      DETAIL: 'close-up of the silk weave',
      BACK: 'back of the tie with the LINSILK label',
    },
  },
};

export const pieceText = (lang: Lang): PieceText => (lang === 'en' ? EN : PIECE_TEXT[lang]);

/* ---- How the cloth and its colours are named in a sentence ---- */

/** '100% silk', '100 % Seide', or just 'cashmere' while its composition is unconfirmed. */
export function fibreIn(lang: Lang, cloth: Cloth): string {
  const word = pieceText(lang).cloth[cloth];
  if (!PURE[cloth]) return word;
  return lang === 'en' ? `100% ${word}` : `100 % ${word}`;
}

const COLOUR_WORD: Record<'de' | 'fr', Record<Cloth, string>> = {
  de: { silk: 'Seidenfarben', linen: 'Leinenfarben', cashmere: 'Kaschmirfarben' },
  fr: { silk: 'coloris de soie', linen: 'coloris de lin', cashmere: 'coloris de cachemire' },
};

/** '48 silk' (English, read as 'Choose from 48 silk colours') or '48 Seidenfarben'. */
export function coloursIn(lang: Lang, cloth: Cloth, n: number): string {
  if (lang === 'en') return `${n} ${cloth}`;
  return `${n} ${COLOUR_WORD[lang.startsWith('de') ? 'de' : 'fr'][cloth]}`;
}

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

/** What a photograph shows, in a language, from its file name. */
export function altIn(
  lang: Lang,
  piece: Pick<Piece, 'group' | 'name'> & { noMeasurements?: boolean },
  src: string,
  index: number,
) {
  const t = pieceText(lang);
  const view = src.match(/_\d{2}_([A-Z_]+?)-[A-Z0-9]+\.\w+$/)?.[1];
  if (piece.noMeasurements) {
    return `${pieceName(piece.name, lang)}, ${(view && t.tie.views[view]) || t.viewN(index + 1)}`;
  }
  return t.altLine(
    t.altWho[piece.group === 'men' ? 'men' : 'women'],
    pieceName(piece.name, lang),
    view && t.views[view] ? t.views[view] : t.viewN(index + 1),
  );
}
