/* Copy for the translated content pages: made to measure, about, the cloth,
 * the answer bank (docs/seo/COPY-PAGES.md §4, §5, §7; COPY-GUIDES-FAQ §3).
 * English is the source and lives with its page; this file holds the shape
 * all languages share, and German and French. German and French are for a
 * native-speaker pass before they go live (§13.7). */

import type { QA } from './garments';
import { deepDe, type Lang } from './i18n';

/* ---- /made-to-measure ---- */

export type MtmCopy = {
  title: string;
  description: (from: string) => string;
  eyebrow: string;
  h1: string;
  lead: string;
  see: string;
  guide: string;
  howH: string;
  steps: (silk: number, linen: number) => string[];
  payH: string;
  payLine: (all: string, silkLinen: string) => string;
  silkLinen: (silk: string, linen: string) => string;
  payDuty: string;
  dutyLink: string;
  payDutyEnd: string;
  termsH: string;
  terms: string;
  noFitH: string;
  noFit: string;
  designH: string;
  design: string;
  designLink: string;
  questionsH: string;
  faq: QA[];
};

const MTM_DE_CH: MtmCopy = {
  title: 'Kleidung nach Mass online bestellen: so funktioniert es',
  description: (from) =>
    `So bestellen Sie Kleidung aus Seide und Leinen nach Mass online: auswählen, 15 Masse eingeben, in 2–4 Wochen fertig. Ohne Anprobe${from}.`,
  eyebrow: 'Nach Mass',
  h1: 'Kleidung nach Mass, online bestellt',
  lead: 'Kleidung nach Mass wird nach Ihren eigenen Körpermassen zugeschnitten und genäht, nicht in einer Standardgrösse. Bei LINSILK bestellen Sie online: Sie wählen ein Stück aus Seide oder Leinen, wählen seine Farbe, geben fünfzehn Masse ein, und es wird innert 2–4 Wochen für Sie zugeschnitten und genäht und ab Genf versandt.',
  see: 'Kollektion ansehen',
  guide: 'Messanleitung',
  howH: 'So funktioniert es',
  steps: (silk, linen) => [
    'Wählen Sie ein Stück aus der Damen- oder Herrenkollektion.',
    `Wählen Sie seine Farbe aus den Mustern seines Stoffs (${silk} Seidenfarben, ${linen} Leinenfarben).`,
    'Geben Sie Ihre Masse ein, die Messanleitung neben sich. Ohne Anprobe: Sie messen selbst, oder Sie gehen mit der Anleitung zu einer beliebigen Schneiderei.',
    'Es wird in 2–4 Wochen ab Ihrem bestätigten Blatt zugeschnitten und genäht, zweimal geprüft und mit Sendungsverfolgung versandt.',
  ],
  payH: 'Was es kostet',
  payLine: (all, silkLinen) =>
    `Die Stücke kosten ${all}${silkLinen}. Das Zuschneiden nach Ihren Massen kostet nichts extra: Jedes Stück wird so gefertigt. Die Preise gelten in Schweizer Franken; `,
  silkLinen: (silk, linen) => ` (Seide ab ${silk}, Leinen ab ${linen})`,
  payDuty: '',
  dutyLink: 'Zoll und Lieferung',
  payDutyEnd: ' hängen davon ab, wo Sie wohnen.',
  termsH: 'Nach Mass, Massanfertigung, Einzelanfertigung oder Bespoke?',
  terms:
    'LINSILK fertigt nach Mass, auch Massanfertigung genannt: ein Schnitt, der nach Ihren Massen gezeichnet und einzeln zugeschnitten und genäht wird. Es ist kein Bespoke im strengen Sinn der Schneiderei, das Anproben und ein Probekleid einschliesst. LINSILK führt keine Anproben durch.',
  noFitH: 'Ein Kleid online anfertigen lassen, ohne Anprobe',
  noFit:
    'Sie messen selbst mit der Anleitung (etwa zehn Minuten mit einem weichen Massband), oder Sie gehen mit der Anleitung zu einer beliebigen Schneiderei. Nichts wird zugeschnitten, bevor Sie Ihr Blatt schriftlich bestätigen, und jedes Stück wird vor dem Versand zweimal an Ihren Zahlen geprüft.',
  designH: 'Etwas, das nicht in der Kollektion ist?',
  design:
    'Entwerfen Sie Ihr eigenes Stück als Auftrag: Wählen Sie eine Grundsilhouette und den Stoff, schreiben Sie Ihre Vorstellung auf, und das Atelier antwortet mit einem Preis. ',
  designLink: 'Selbst entwerfen',
  questionsH: 'Fragen',
  faq: [
    {
      q: 'Was ist Kleidung nach Mass?',
      a: 'Kleidung nach Mass wird nach Ihren eigenen Körpermassen statt in einer Standardgrösse zugeschnitten und genäht. Bei LINSILK geben Sie fünfzehn Masse ein, und das Stück wird innert 2–4 Wochen für Sie zugeschnitten und genäht.',
    },
    {
      q: 'Wie lange dauert Nach-Mass?',
      a: 'Bei LINSILK 2–4 Wochen ab dem Tag, an dem Ihr Massblatt bestätigt ist, plus Lieferung: Schweiz 2–3 Tage, EU und Grossbritannien 3–6 Tage, übrige Welt 5–10 Tage.',
    },
    {
      q: 'Brauche ich eine Anprobe?',
      a: 'Nein. LINSILK führt keine Anproben durch: Sie messen selbst mit der Messanleitung, oder Sie gehen mit der Anleitung zu einer beliebigen Schneiderei, und das Stück wird vor dem Versand ab Genf zweimal an Ihren Massen geprüft.',
    },
    {
      q: 'Was, wenn ich falsch messe?',
      a: 'Das Massblatt markiert eine Zahl ausserhalb des üblichen Bereichs für diese Zone, damit Sie das Massband kontrollieren können, und nichts wird zugeschnitten, bevor Sie Ihr Blatt schriftlich bestätigen.',
    },
    {
      q: 'Kann ich ein Kleid online anfertigen lassen?',
      a: 'Ja. Wählen Sie ein Stück aus Seide oder Leinen, wählen Sie seine Farbe aus den Mustern, geben Sie Ihre Masse ein, und LINSILK schneidet und näht es in 2–4 Wochen für Sie und versendet es ab Genf.',
    },
  ],
};

const MTM_FR: MtmCopy = {
  title: 'Vêtements sur mesure en ligne : comment ça marche',
  description: (from) =>
    `Comment commander des vêtements en soie et en lin sur mesure en ligne : choisir, indiquer 15 mesures, prêt en 2 à 4 semaines. Sans essayage${from}.`,
  eyebrow: 'Sur mesure',
  h1: 'Des vêtements sur mesure, commandés en ligne',
  lead: 'Un vêtement sur mesure est coupé et cousu à vos propres mesures plutôt que dans une taille standard. Chez LINSILK, vous commandez en ligne : vous choisissez une pièce en soie ou en lin, son coloris, vous indiquez quinze mesures, et elle est coupée et cousue pour vous en 2 à 4 semaines, puis expédiée depuis Genève.',
  see: 'Voir la collection',
  guide: 'Guide de mesure',
  howH: 'Comment ça marche',
  steps: (silk, linen) => [
    'Choisissez une pièce dans la collection femme ou homme.',
    `Choisissez son coloris parmi les échantillons de son tissu (${silk} coloris de soie, ${linen} coloris de lin).`,
    'Indiquez vos mesures, le guide de mesure à côté de vous. Sans essayage : vous vous mesurez vous-même, ou vous emportez le guide chez n’importe quel tailleur.',
    'Elle est coupée et cousue en 2 à 4 semaines à partir de votre fiche confirmée, inspectée deux fois, puis envoyée avec suivi.',
  ],
  payH: 'Ce que cela coûte',
  payLine: (all, silkLinen) =>
    `Les pièces vont de ${all}${silkLinen}. La coupe à vos mesures n’entraîne aucun supplément : chaque pièce est faite ainsi. Les prix sont en francs suisses ; `,
  silkLinen: (silk, linen) => ` (soie dès ${silk}, lin dès ${linen})`,
  payDuty: '',
  dutyLink: 'les droits de douane et la livraison',
  payDutyEnd: ' dépendent de l’endroit où vous vous trouvez.',
  termsH: 'Sur mesure, à façon, personnalisé ou bespoke ?',
  terms:
    'LINSILK fait du sur mesure, parfois appelé « à façon » : un patron tracé d’après vos mesures, coupé et cousu individuellement. Ce n’est pas du bespoke au sens strict du métier de tailleur, qui ajoute des essayages et un vêtement d’essai. LINSILK ne propose pas d’essayages.',
  noFitH: 'Faire faire une robe en ligne, sans essayage',
  noFit:
    'Vous vous mesurez avec le guide (une dizaine de minutes avec un mètre ruban souple), ou vous emportez le guide chez n’importe quel tailleur. Rien n’est coupé avant que vous confirmiez votre fiche par écrit, et chaque pièce est vérifiée deux fois d’après vos chiffres avant l’expédition.',
  designH: 'Une pièce qui n’est pas dans la collection ?',
  design:
    'Dessinez votre propre pièce sur commande : choisissez une silhouette de base et le tissu, rédigez votre brief, et l’atelier répond avec un prix. ',
  designLink: 'Créer votre pièce',
  questionsH: 'Questions',
  faq: [
    {
      q: 'Qu’est-ce que le sur-mesure ?',
      a: 'Un vêtement sur mesure est coupé et cousu à vos propres mesures plutôt que dans une taille standard. Chez LINSILK, vous indiquez quinze mesures et la pièce est coupée et cousue pour vous en 2 à 4 semaines.',
    },
    {
      q: 'Combien de temps prend le sur-mesure ?',
      a: 'Chez LINSILK, 2 à 4 semaines à partir du jour où votre fiche de mesures est confirmée, plus la livraison : Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6 jours, reste du monde 5 à 10 jours.',
    },
    {
      q: 'Ai-je besoin d’un essayage ?',
      a: 'Non. LINSILK ne propose pas d’essayages : vous vous mesurez avec le guide de mesure, ou vous emportez le guide chez n’importe quel tailleur, et la pièce est vérifiée deux fois d’après vos mesures avant d’être expédiée depuis Genève.',
    },
    {
      q: 'Et si je me mesure mal ?',
      a: 'La fiche de mesures signale un chiffre hors de la plage habituelle pour la zone concernée afin que vous revérifiiez le mètre ruban, et rien n’est coupé avant que vous confirmiez votre fiche par écrit.',
    },
    {
      q: 'Puis-je faire faire une robe en ligne ?',
      a: 'Oui. Choisissez une pièce en soie ou en lin, choisissez son coloris parmi les échantillons, indiquez vos mesures, et LINSILK la coupe et la coud pour vous en 2 à 4 semaines, puis l’expédie depuis Genève.',
    },
  ],
};

/* ---- /about ---- */

export type AboutCopy = {
  title: string;
  description: string;
  eyebrow: string;
  h1: string;
  entity: string;
  see: string;
  contact: string;
  meansH: string;
  meansPre: string;
  guideLink: string;
  meansPost: string;
  whyH: string;
  why: string;
  glanceH: string;
  rows: {
    what: [string, string];
    where: [string, string];
    cloth: [string, string];
    colours: [string, (silk: number, linen: number) => string];
    price: [string, (range: string) => string];
    making: [string, string];
    order: [string, string];
    fittings: [string, string];
    delivery: [string, string];
    returns: [string, string];
    contact: [string, (email: string) => string];
  };
};

const ABOUT_DE_CH: AboutCopy = {
  title: 'Über LINSILK: Seide und Leinen nach Mass aus Genf',
  description:
    'LINSILK ist ein Genfer Modehaus, das Kleidung nach Ihren Massen aus 100 % Seide und 100 % Leinen fertigt. Wie sie entsteht, was sie kostet und wie Sie bestellen.',
  eyebrow: 'Das Haus',
  h1: 'Über LINSILK',
  entity:
    'LINSILK ist ein Genfer Modehaus für Seide und Leinen nach Mass. Jedes Stück wird nach den eigenen Massen der Kundin oder des Kunden zugeschnitten und genäht, innert 2–4 Wochen, aus 100 % Seide oder 100 % Leinen.',
  see: 'Kollektion ansehen',
  contact: 'Kontakt',
  meansH: 'Was Nach-Mass bei LINSILK bedeutet',
  meansPre:
    'Nichts wird in einer Standardgrösse gefertigt. Ihre fünfzehn Masse werden zu einem Schnitt, der nur für Sie gezeichnet wird. Das Stück wird danach einzeln flach zugeschnitten, genäht, zweimal an Ihren Massen geprüft und ab Genf versandt. LINSILK führt keine Anproben durch: Sie messen selbst, oder Sie gehen mit der ',
  guideLink: 'Messanleitung',
  meansPost: ' zu einer beliebigen Schneiderei.',
  whyH: 'Warum nur Seide und Leinen',
  why: 'Seide und Leinen sind Naturfasern, die atmen, sich mit dem Körper bewegen und leicht auf der Haut liegen. Jedes LINSILK-Kleidungsstück ist aus 100 % Seide oder 100 % Leinen gefertigt, nie aus einer Mischung oder aus Synthetik. Polyester, Nylon und PU-Stoffe werden aus Erdöl hergestellt, atmen nicht und geben beim Tragen und Waschen Mikroplastikfasern ab.',
  glanceH: 'LINSILK auf einen Blick',
  rows: {
    what: ['Was', 'Kleidung nach Mass für Damen und Herren'],
    where: ['Wo', 'Mit Sitz in Genf, Schweiz'],
    cloth: ['Stoff', '100 % Seide oder 100 % Leinen'],
    colours: ['Farben', (s, l) => `${s} Seidenfarben (glatt, Jacquard, Brokat); ${l} Leinenfarben`],
    price: ['Preis', (r) => `${r} pro Stück`],
    making: ['Fertigungszeit', '2–4 Wochen ab Ihrem bestätigten Massblatt'],
    order: ['So bestellen Sie', 'Stück und Farbe wählen, 15 Masse eingeben, und es wird für Sie zugeschnitten und genäht'],
    fittings: ['Anproben', 'Keine; Sie messen selbst oder gehen zu einer beliebigen Schneiderei'],
    delivery: ['Lieferung', 'Schweiz 2–3 Tage, EU und Grossbritannien 3–6 Tage, übrige Welt 5–10 Tage, nach dem Versand ab Genf; Sendungsverfolgung inbegriffen'],
    returns: ['Rückgabe', 'Stücke nach Mass können nicht aus Gründen des Gefallens zurückgegeben werden; Fertigungsfehler werden repariert oder das Stück ersetzt; eine Bestellung kann vor dem Zuschnitt storniert werden'],
    contact: ['Kontakt', (e) => `${e}, beantwortet von einer Person, in der Regel innert eines Tages`],
  },
};

const ABOUT_FR: AboutCopy = {
  title: 'À propos de LINSILK : soie et lin sur mesure, de Genève',
  description:
    'LINSILK est une maison genevoise qui réalise des vêtements à vos mesures en 100 % soie et 100 % lin. Comment ils sont faits, ce qu’ils coûtent et comment commander.',
  eyebrow: 'La maison',
  h1: 'À propos de LINSILK',
  entity:
    'LINSILK est une maison genevoise de vêtements sur mesure en soie et en lin. Chaque pièce est coupée et cousue aux mesures de la cliente ou du client en 2 à 4 semaines, en 100 % soie ou 100 % lin.',
  see: 'Voir la collection',
  contact: 'Contact',
  meansH: 'Ce que signifie le sur-mesure chez LINSILK',
  meansPre:
    'Rien n’est fait dans une taille standard. Vos quinze mesures deviennent un patron tracé pour vous seul·e. La pièce est ensuite coupée à plat, une à la fois, cousue, inspectée deux fois d’après vos mesures, puis expédiée depuis Genève. LINSILK ne propose pas d’essayages : vous vous mesurez vous-même, ou vous emportez le ',
  guideLink: 'guide de mesure',
  meansPost: ' chez n’importe quel tailleur.',
  whyH: 'Pourquoi seulement la soie et le lin',
  why: 'La soie et le lin sont des fibres naturelles qui respirent, suivent le corps et reposent légèrement sur la peau. Chaque vêtement LINSILK est fait en 100 % soie ou 100 % lin, jamais en mélange ni en synthétique. Les tissus en polyester, nylon et PU sont issus du pétrole, ne respirent pas et libèrent des microfibres de plastique quand on les porte et les lave.',
  glanceH: 'LINSILK en un coup d’œil',
  rows: {
    what: ['Quoi', 'Des vêtements sur mesure pour femme et pour homme'],
    where: ['Où', 'Basée à Genève, en Suisse'],
    cloth: ['Tissu', '100 % soie ou 100 % lin'],
    colours: ['Coloris', (s, l) => `${s} coloris de soie (uni, jacquard, brocart) ; ${l} coloris de lin`],
    price: ['Prix', (r) => `${r} par pièce`],
    making: ['Délai de confection', '2 à 4 semaines à partir de votre fiche de mesures confirmée'],
    order: ['Comment commander', 'Choisir une pièce et son coloris, indiquer 15 mesures, et elle est coupée et cousue pour vous'],
    fittings: ['Essayages', 'Aucun ; vous vous mesurez ou allez chez n’importe quel tailleur'],
    delivery: ['Livraison', 'Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6 jours, reste du monde 5 à 10 jours, une fois expédiée depuis Genève ; suivi inclus'],
    returns: ['Retours', 'Les pièces sur mesure ne peuvent pas être retournées par simple changement d’avis ; les défauts de fabrication sont réparés ou la pièce remplacée ; une commande peut être annulée avant la coupe'],
    contact: ['Contact', (e) => `${e}, une personne répond, en général sous un jour`],
  },
};

/* ---- /cloth ---- */

export type ClothCopy = {
  title: string;
  description: string;
  lead: string;
  h1: string;
  a: string;
  b: string;
  cta: string;
};

const CLOTH_DE_CH: ClothCopy = {
  title: 'Seide und Leinen: 48 Seidenfarben und 40 Leinenfarben',
  description:
    'Die Stoffe, in denen LINSILK fertigt: reine Seide (glatt, Jacquard, Brokat) und reines Leinen. Wie sie sich anfühlen, wie sie sich tragen, wie man sie pflegt, und alle 88 Farben.',
  h1: 'Der Stoff: reine Seide und reines Leinen',
  lead: 'LINSILK fertigt in nur zwei Stoffen, reiner Seide und reinem Leinen: kein Polyester und kein Mischgewebe. Die Farbe Ihres Stücks wählen Sie aus Mustern seines eigenen Stoffs; diese Seite zeigt, woraus Sie wählen.',
  a: 'Seide ist glatt und leicht und bleibt angenehm, wenn die Temperatur sinkt wie auch wenn sie steigt. Sie gibt es in drei Bindungen: glatt (15 Farben), Jacquard (20 gemusterte Farbstellungen) und Brokat (13 gemusterte Farbstellungen), zusammen 48 Seidenfarben, verwendet für die Kleider, Abendkleider, Röcke, Blusen und die Schlafmode.',
  b: 'Leinen ist fest, luftig und kühlend und wird mit jedem Tragen weicher; seine 40 Farben werden für die gesamte Herrenmode und für die Westen-Hosen-Sets der Damen verwendet. Naturfaser knittert, bewegt sich und altert. Ein Leinenhemd, das einen Sommer lang getragen wurde, sieht nicht mehr so aus wie auf dem Foto, und dafür ist es da. Synthetische Mischungen halten die Bügelfalte länger und sind günstiger zu nähen; der Stoff von LINSILK ist reine Seide oder reines Leinen.',
  cta: 'Ein Stoffmuster anfragen',
};

const CLOTH_FR: ClothCopy = {
  title: 'Soie et lin : 48 coloris de soie et 40 coloris de lin',
  description:
    'Les tissus dans lesquels LINSILK réalise ses pièces : soie pure (unie, jacquard, brocart) et lin pur. Leur toucher, leur tenue, leur entretien, et les 88 coloris.',
  h1: 'Le tissu : soie pure et lin pur',
  lead: 'LINSILK ne travaille que deux tissus, la soie pure et le lin pur : ni polyester ni tissu mélangé. Vous choisissez le coloris de votre pièce parmi des échantillons de son propre tissu ; cette page montre ce parmi quoi vous choisissez.',
  a: 'La soie est lisse et légère, et reste agréable quand la température baisse comme quand elle monte. Elle existe en trois armures : unie (15 coloris), jacquard (20 coloris à motifs) et brocart (13 coloris à motifs), soit 48 coloris de soie au total, utilisés pour les robes, robes de soirée, jupes, chemisiers et vêtements de nuit.',
  b: 'Le lin est ferme, aéré et rafraîchissant, et s’assouplit à chaque port ; ses 40 coloris servent à tout le vestiaire masculin et aux ensembles gilet-pantalon pour femme. La fibre naturelle se froisse, bouge et vieillit. Une chemise en lin portée tout un été ne ressemblera plus à ce qu’elle était sur la photo, et c’est ce qui la rend précieuse. Les mélanges synthétiques tiennent mieux le pli et coûtent moins cher à coudre ; le tissu de LINSILK est de la soie pure ou du lin pur.',
  cta: 'Demander un échantillon',
};

/* ---- /care/questions ---- */

export type BankCopy = {
  title: string;
  description: string;
  h1: string;
  lead: (email: string) => string;
  measuring: string;
  shipping: string;
  groups: { title: string; items: QA[] }[];
  /** Questions that carry a number from the live catalogue. */
  price: (range: string) => QA;
  colours: (silk: number, linen: number) => QA;
  contactQ: (email: string) => QA;
};

const BANK_DE_CH: BankCopy = {
  title: 'Fragen: Nach Mass, Stoff, Lieferung und Rückgabe',
  description:
    'Antworten auf das, was LINSILK am häufigsten gefragt wird: wie Nach-Mass funktioniert, Anproben, Fertigungszeit, Pflege von Seide und Leinen, Lieferung, Zoll und Rückgabe.',
  h1: 'Fragen',
  lead: (email) =>
    `Was das Büro in Genf am häufigsten gefragt wird. Was hier fehlt, schreiben Sie an ${email} – eine Person antwortet, in der Regel innert eines Tages.`,
  measuring: 'Messanleitung',
  shipping: 'Versand',
  price: (range) => ({
    q: 'Was kosten die Stücke von LINSILK?',
    a: `${range}, je nach Stück. Die Preise gelten in Schweizer Franken; die Seite kann ungefähre Beträge in Euro, Pfund, Dollar oder Dirham anzeigen.`,
  }),
  colours: (silk, linen) => ({
    q: 'Wie viele Farben stehen zur Auswahl?',
    a: `${silk} Seidenfarben (glatt, Jacquard und Brokat) und ${linen} Leinenfarben; Sie wählen aus Mustern des eigenen Stoffs des Stücks.`,
  }),
  contactQ: (email) => ({
    q: 'Gibt es LINSILK wirklich?',
    a: `LINSILK ist ein Haus für Seide und Leinen nach Mass mit Sitz in Genf; jedes Stück wird nach den Massen der Kundschaft zugeschnitten und genäht und mit Sendungsverfolgung versandt. Kontakt: ${email}.`,
  }),
  groups: [
    {
      title: 'Nach Mass',
      items: [
        { q: 'Warum gibt es keine Grössentabelle?', a: 'Weil nichts in einer Grösse gefertigt wird. Ein Schnitt wird nach Ihren fünfzehn Massen gezeichnet und aufbewahrt, weshalb das zweite Stück, das Sie bestellen, so sitzt wie das erste.' },
        { q: 'Was, wenn ich zwischen zwei Grössen liege?', a: 'Es gibt keine Grössen, zwischen denen Sie liegen könnten. LINSILK schneidet jedes Stück nach Ihren fünfzehn Massen zu, nicht nach einer Grösse.' },
        { q: 'Brauche ich eine Anprobe?', a: 'Nein. LINSILK führt keine Anproben durch: Sie messen selbst mit der Messanleitung, oder Sie gehen mit der Anleitung zu einer beliebigen Schneiderei, und das Stück wird vor dem Versand ab Genf zweimal an Ihren Massen geprüft.' },
        { q: 'Kann ich ein Kleid ohne Schneiderin anfertigen lassen?', a: 'Ja. LINSILK fertigt das Kleid; Sie liefern nur Ihre Masse, die Sie selbst nehmen oder von einer beliebigen Schneiderei nehmen lassen können.' },
        { q: 'Was ist der Unterschied zwischen Nach-Mass und Bespoke?', a: 'Nach-Mass zeichnet einen Schnitt nach Ihren Massen; Bespoke fügt Anproben und ein Probekleid hinzu. LINSILK ist Nach-Mass und führt keine Anproben durch.' },
        { q: 'Was ist der Unterschied zwischen einem Stück und einem Auftrag?', a: 'Ein Stück ist ein Entwurf des Hauses, nach Ihren Massen zugeschnitten. Ein Auftrag ist ein Kleidungsstück, das existiert, weil Sie es beschrieben haben: Sie geben die Form, den Stoff und eine Notiz, und das Atelier baut ein Kleidungsstück nach diesem Auftrag.' },
        { q: 'Bietet LINSILK Änderungen an?', a: 'Nein. Jedes Stück wird nach Ihren Massen gefertigt; ein Fertigungsfehler wird repariert oder das Stück ersetzt.' },
      ],
    },
    {
      title: 'Stoff und Pflege',
      items: [
        { q: 'Warum verwendet LINSILK nur Seide und Leinen?', a: 'Seide und Leinen sind Naturfasern, die atmen, sich mit dem Körper bewegen und leicht auf der Haut liegen; LINSILK fertigt deshalb in nichts anderem: 100 % Seide oder 100 % Leinen, nie eine Mischung oder Synthetik.' },
        { q: 'Sind die Stücke von LINSILK 100 % Seide oder Leinen?', a: 'Ja: Jedes LINSILK-Kleidungsstück ist aus 100 % Seide oder 100 % Leinen gefertigt. Knöpfe, Reissverschlüsse und ähnliche Verschlüsse sind nicht aus Seide oder Leinen.' },
        { q: 'Ist Seide oder Leinen besser bei warmem Wetter?', a: 'Beide atmen. Leinen ist fest, luftig und kühlend und wird mit dem Tragen weicher; Seide ist glatt und leicht und hält Sie auch bei kühlerem Wetter angenehm warm.' },
        { q: 'Wie wasche ich es?', a: 'Seide und Leinen mögen beide kühle Handwäsche und liegendes Trocknen ohne direkte Sonne; keines von beiden gehört in den Tumbler.' },
        { q: 'Knittert Leinen?', a: 'Ja; natürliches Leinen knittert, wird weicher und altert, was zum Stoff gehört und kein Mangel ist.' },
        { q: 'Warum meidet LINSILK Polyester?', a: 'Polyester-, Nylon- und PU-Stoffe werden aus Erdöl hergestellt, atmen nicht, stauen Wärme und Feuchtigkeit auf der Haut und geben beim Tragen und Waschen Mikroplastikfasern ab.' },
      ],
    },
    {
      title: 'Bestellung, Lieferung und Rückgabe',
      items: [
        { q: 'Wie lange dauert Nach-Mass?', a: 'Bei LINSILK 2–4 Wochen ab dem Tag, an dem Ihr Massblatt bestätigt ist, plus Lieferung: Schweiz 2–3 Tage, EU und Grossbritannien 3–6, übrige Welt 5–10 Tage.' },
        { q: 'Wann sollte ich ein Kleid für einen Anlass bestellen?', a: 'Etwa sechs Wochen vorher in Europa und acht Wochen vorher anderswo: 2–4 Wochen Fertigung ab Ihrem bestätigten Blatt, plus Lieferung.' },
        { q: 'Liefert LINSILK nach Deutschland, Österreich, Frankreich, Luxemburg, in die Niederlande und in die VAE?', a: 'Ja, ab Genf. Die Lieferung in die EU und nach Grossbritannien dauert 3–6 Tage nach dem Versand, in die übrige Welt 5–10 Tage, mit Sendungsverfolgung.' },
        { q: 'Wer bezahlt den Zoll?', a: 'Die Preise enthalten den Zoll innerhalb der Schweiz und der EU. In Grossbritannien ist die Einfuhr-MwSt. bei Ankunft fällig; anderswo erhebt der Zusteller Zoll und Einfuhrsteuer bei der Lieferung.' },
        { q: 'Kann ich ein Stück nach Mass zurückgeben?', a: 'Ein Stück, das nach den Massen einer einzelnen Person zugeschnitten wurde, kann nicht aus Gründen des Gefallens zurückgegeben werden. Ein Fertigungsfehler wird repariert oder das Stück ersetzt, und Sie können vor dem Zuschnitt stornieren.' },
        { q: 'Kann ich eine Bestellung stornieren?', a: 'Ja, bis zu dem Zeitpunkt, an dem Sie Ihr Massblatt schriftlich bestätigen, vollständig und ohne Begründung.' },
        { q: 'Gibt es einen Entwurf auch nächste Saison noch?', a: 'Die meisten Entwürfe gehen in die nächste Kollektion über; einige wenige werden jede Saison eingestellt.' },
      ],
    },
    {
      title: 'Das Haus',
      items: [
        { q: 'Wo hat LINSILK seinen Sitz?', a: 'LINSILK hat seinen Sitz in Genf, Schweiz.' },
        { q: 'Fertigt LINSILK auch Herrenmode?', a: 'Ja: Leinenhemden, Hosen und zweiteilige Looks für Herren, nach Ihren Massen gefertigt in 2–4 Wochen.' },
        { q: 'Ist ein Seidenpyjama ein gutes Geschenk?', a: 'Ja, mit einer Einschränkung: Er wird nach Mass gefertigt, daher braucht es die Masse der beschenkten Person.' },
      ],
    },
  ],
};

const BANK_FR: BankCopy = {
  title: 'Questions : sur mesure, tissu, livraison et retours',
  description:
    'Réponses à ce que l’on demande le plus à LINSILK : comment fonctionne le sur-mesure, essayages, délais, entretien de la soie et du lin, livraison, douane et retours.',
  h1: 'Questions',
  lead: (email) =>
    `Ce que l’on demande le plus souvent au bureau de Genève. Pour tout le reste, écrivez à ${email} — une personne répond, en général sous un jour.`,
  measuring: 'Guide de mesure',
  shipping: 'Livraison',
  price: (range) => ({
    q: 'Combien coûtent les pièces LINSILK ?',
    a: `${range}, selon la pièce. Les prix sont en francs suisses ; le site peut afficher un montant approximatif en euros, livres, dollars ou dirhams.`,
  }),
  colours: (silk, linen) => ({
    q: 'Parmi combien de coloris puis-je choisir ?',
    a: `${silk} coloris de soie (unie, jacquard et brocart) et ${linen} coloris de lin ; vous choisissez parmi des échantillons du tissu propre à la pièce.`,
  }),
  contactQ: (email) => ({
    q: 'LINSILK est-elle une vraie marque ?',
    a: `LINSILK est une maison de soie et de lin sur mesure basée à Genève ; chaque pièce est coupée et cousue aux mesures de la cliente ou du client et envoyée avec suivi. Contact : ${email}.`,
  }),
  groups: [
    {
      title: 'Sur mesure',
      items: [
        { q: 'Pourquoi n’y a-t-il pas de guide des tailles ?', a: 'Parce que rien n’est fait dans une taille. Un patron est tracé d’après vos quinze mesures et conservé, ce qui explique aussi que la deuxième pièce que vous commandez tombe comme la première.' },
        { q: 'Et si je suis entre deux tailles ?', a: 'Il n’y a pas de tailles entre lesquelles se trouver. LINSILK coupe chaque pièce d’après vos quinze mesures, pas d’après une taille.' },
        { q: 'Ai-je besoin d’un essayage ?', a: 'Non. LINSILK ne propose pas d’essayages : vous vous mesurez avec le guide de mesure, ou vous emportez le guide chez n’importe quel tailleur, et la pièce est vérifiée deux fois d’après vos mesures avant d’être expédiée depuis Genève.' },
        { q: 'Puis-je faire faire une robe sans tailleur ?', a: 'Oui. LINSILK réalise la robe ; vous ne fournissez que vos mesures, que vous pouvez prendre vous-même ou faire prendre chez n’importe quel tailleur.' },
        { q: 'Quelle différence entre sur-mesure et bespoke ?', a: 'Le sur-mesure trace un patron d’après vos mesures ; le bespoke ajoute des essayages et un vêtement d’essai. LINSILK fait du sur-mesure et ne propose pas d’essayages.' },
        { q: 'Quelle différence entre une pièce et une commande personnalisée ?', a: 'Une pièce est un modèle dessiné par la maison, coupé à vos mesures. Une commande personnalisée est un vêtement qui existe parce que vous l’avez décrit : vous donnez la forme, le tissu et une note, et l’atelier construit un vêtement selon ce brief.' },
        { q: 'LINSILK propose-t-elle des retouches ?', a: 'Non. Chaque pièce est faite à vos mesures ; un défaut de fabrication est réparé ou la pièce remplacée.' },
      ],
    },
    {
      title: 'Tissu et entretien',
      items: [
        { q: 'Pourquoi LINSILK n’utilise-t-elle que la soie et le lin ?', a: 'La soie et le lin sont des fibres naturelles qui respirent, suivent le corps et reposent légèrement sur la peau ; LINSILK ne fait donc rien d’autre : 100 % soie ou 100 % lin, jamais de mélange ni de synthétique.' },
        { q: 'Les pièces LINSILK sont-elles 100 % soie ou lin ?', a: 'Oui : chaque vêtement LINSILK est fait en 100 % soie ou 100 % lin. Les boutons, fermetures éclair et attaches du même type ne sont ni en soie ni en lin.' },
        { q: 'La soie ou le lin est-il préférable par temps chaud ?', a: 'Tous deux respirent. Le lin est ferme, aéré et rafraîchissant, et s’assouplit au port ; la soie est lisse et légère et reste agréable aussi quand il fait plus frais.' },
        { q: 'Comment le laver ?', a: 'La soie et le lin préfèrent tous deux un lavage à la main à l’eau fraîche et un séchage à plat à l’abri du soleil direct ; ni l’un ni l’autre n’aime le sèche-linge.' },
        { q: 'Le lin se froisse-t-il ?', a: 'Oui ; le lin naturel se froisse, s’assouplit et vieillit, ce qui fait partie du tissu et n’est pas un défaut.' },
        { q: 'Pourquoi LINSILK évite-t-elle le polyester ?', a: 'Les tissus en polyester, nylon et PU sont issus du pétrole, ne respirent pas, retiennent la chaleur et l’humidité contre la peau et libèrent des microfibres de plastique quand on les porte et les lave.' },
      ],
    },
    {
      title: 'Commande, livraison et retours',
      items: [
        { q: 'Combien de temps prend le sur-mesure ?', a: 'Chez LINSILK, 2 à 4 semaines à partir du jour où votre fiche de mesures est confirmée, plus la livraison : Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6, reste du monde 5 à 10 jours.' },
        { q: 'Quand commander une robe pour un événement ?', a: 'Environ six semaines avant en Europe et huit semaines avant ailleurs : 2 à 4 semaines de confection à partir de votre fiche confirmée, plus la livraison.' },
        { q: 'LINSILK livre-t-elle en Allemagne, en Autriche, en France, au Luxembourg, aux Pays-Bas et aux EAU ?', a: 'Oui, depuis Genève. La livraison vers l’UE et le Royaume-Uni prend 3 à 6 jours après l’expédition, vers le reste du monde 5 à 10 jours, avec suivi.' },
        { q: 'Qui paie les droits de douane ?', a: 'Les prix incluent les droits de douane en Suisse et dans l’UE. Au Royaume-Uni, la TVA à l’importation est due à l’arrivée ; ailleurs, le transporteur perçoit les droits et taxes à la livraison.' },
        { q: 'Puis-je retourner une pièce sur mesure ?', a: 'Une pièce coupée aux mesures d’une seule personne ne peut pas être retournée par simple changement d’avis. Un défaut de fabrication est réparé ou la pièce remplacée, et vous pouvez annuler avant la coupe.' },
        { q: 'Puis-je annuler une commande ?', a: 'Oui, jusqu’au moment où vous confirmez votre fiche de mesures par écrit, intégralement et sans justification.' },
        { q: 'Un modèle sera-t-il encore disponible la saison prochaine ?', a: 'La plupart des modèles passent dans la collection suivante ; quelques-uns sont retirés chaque saison.' },
      ],
    },
    {
      title: 'La maison',
      items: [
        { q: 'Où est basée LINSILK ?', a: 'LINSILK est basée à Genève, en Suisse.' },
        { q: 'LINSILK fait-elle de la mode masculine ?', a: 'Oui : chemises, pantalons et tenues deux pièces en lin pour homme, faits à vos mesures en 2 à 4 semaines.' },
        { q: 'Un pyjama en soie est-il un bon cadeau ?', a: 'Oui, avec une réserve : il est fait sur mesure, il faut donc les mesures de la personne qui le reçoit.' },
      ],
    },
  ],
};

const PICK = <T,>(table: { 'de-ch': T; fr: T }, lang: Exclude<Lang, 'en'>, derive = false): T => {
  if (lang.startsWith('fr')) return table.fr;
  return derive ? deepDe(table['de-ch']) : table['de-ch'];
};

export const mtmCopy = (lang: Exclude<Lang, 'en'>) =>
  PICK({ 'de-ch': MTM_DE_CH, fr: MTM_FR }, lang, lang === 'de');
export const aboutCopy = (lang: Exclude<Lang, 'en'>) =>
  PICK({ 'de-ch': ABOUT_DE_CH, fr: ABOUT_FR }, lang, lang === 'de');
export const clothCopy = (lang: Exclude<Lang, 'en'>) =>
  PICK({ 'de-ch': CLOTH_DE_CH, fr: CLOTH_FR }, lang, lang === 'de');
export const bankCopy = (lang: Exclude<Lang, 'en'>) =>
  PICK({ 'de-ch': BANK_DE_CH, fr: BANK_FR }, lang, lang === 'de');
