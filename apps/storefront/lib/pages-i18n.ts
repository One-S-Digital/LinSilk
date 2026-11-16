/* Copy for the translated content pages: made to measure, about, the cloth,
 * the answer bank (docs/seo/COPY-PAGES.md §4, §5, §7; COPY-GUIDES-FAQ §3).
 * English is the source and lives with its page; this file holds the shape
 * all languages share, and German and French. German and French are for a
 * native-speaker pass before they go live (§13.7). */

import type { QA } from './garments';
import type { Lang } from './i18n';

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
  steps: (silk: number, linen: number, cashmere: number) => string[];
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

const MTM_DE: MtmCopy = {
  title: 'Massgefertigte Kleidung online bestellen: So funktioniert es',
  description: (from) =>
    `Kleidung aus Seide, Leinen und hochfrequenten Stoffen online nach Mass bestellen: Stück und Farbe wählen, 15 Masse eingeben, nach 2 bis 4 Wochen bei Ihnen. Ganz ohne Anprobe${from}.`,
  eyebrow: 'Massanfertigung',
  h1: 'Massgefertigte Kleidung, bequem online bestellt',
  lead: 'Massgefertigte Kleidung entsteht nicht in einer Standardgrösse, sondern nach Ihren eigenen Körpermassen: Aus ihnen wird der Schnitt gezeichnet, danach wird das Stück zugeschnitten und genäht. Bei LINSILK bestellen Sie ganz bequem online. Sie suchen sich ein Stück aus Seide, Leinen oder einem hochfrequenten Stoff aus, wählen die Farbe, geben fünfzehn Masse ein, und innert zwei bis vier Wochen wird es für Sie gefertigt und von Genf aus verschickt.',
  see: 'Zur Kollektion',
  guide: 'Anleitung zum Massnehmen',
  howH: 'So bestellen Sie',
  steps: (silk, linen, cashmere) => [
    'Suchen Sie sich ein Stück aus der Damen- oder Herrenkollektion aus.',
    `Wählen Sie die Farbe anhand der Stoffmuster: ${silk} Farben in Seide, ${linen} in Leinen, ${cashmere} in Kaschmir.`,
    'Geben Sie Ihre Masse ein; die Anleitung führt Sie Schritt für Schritt durch das Massnehmen. Eine Anprobe gibt es nicht: Sie messen selbst, oder Sie gehen mit der Anleitung zu einer Schneiderei Ihrer Wahl.',
    'Sobald Sie Ihr Massblatt bestätigt haben, wird das Stück innert zwei bis vier Wochen zugeschnitten und genäht, zweimal geprüft und mit Sendungsverfolgung verschickt.',
  ],
  payH: 'Preise',
  payLine: (all, silkLinen) =>
    `Die Stücke kosten ${all}${silkLinen}. Der Zuschnitt nach Ihren Massen kostet keinen Aufpreis, denn so entsteht jedes Stück bei uns. Alle Preise verstehen sich in Schweizer Franken. `,
  silkLinen: (silk, linen) => ` (Seide ab ${silk}, Leinen ab ${linen})`,
  payDuty: '',
  dutyLink: 'Zoll und Lieferung',
  payDutyEnd: ' richten sich nach Ihrem Lieferland.',
  termsH: 'Massanfertigung, Massschneiderei, Bespoke: Was ist der Unterschied?',
  terms:
    'LINSILK arbeitet nach Mass: Aus Ihren Massen entsteht ein eigener Schnitt, und jedes Stück wird einzeln zugeschnitten und genäht. Bespoke im engeren Sinn des Schneiderhandwerks ist das nicht, denn dazu gehören Anproben und ein Probestück. Anproben bietet LINSILK nicht an.',
  noFitH: 'Ein Kleid online nach Mass anfertigen lassen, ohne Anprobe',
  noFit:
    'Sie nehmen Ihre Masse selbst mit der Anleitung (mit einem weichen Massband dauert das etwa zehn Minuten) oder lassen sie bei einer Schneiderei Ihrer Wahl nehmen. Zugeschnitten wird erst, wenn Sie Ihr Massblatt schriftlich bestätigt haben, und vor dem Versand wird jedes Stück zweimal anhand Ihrer Zahlen geprüft.',
  designH: 'Sie suchen etwas, das nicht in der Kollektion ist?',
  design:
    'Dann entwerfen Sie Ihr eigenes Stück: Sie wählen eine Grundsilhouette und den Stoff, beschreiben, was Ihnen vorschwebt, und das Atelier antwortet mit einem Preis. ',
  designLink: 'Selbst entwerfen',
  questionsH: 'Fragen und Antworten',
  faq: [
    {
      q: 'Was bedeutet «nach Mass»?',
      a: 'Das Stück wird nicht in einer Standardgrösse gefertigt, sondern nach Ihren eigenen Körpermassen zugeschnitten und genäht. Bei LINSILK geben Sie fünfzehn Masse ein, und innert zwei bis vier Wochen entsteht das Stück für Sie.',
    },
    {
      q: 'Wie lange dauert eine Massanfertigung?',
      a: 'Bei LINSILK zwei bis vier Wochen ab dem Tag, an dem Sie Ihr Massblatt bestätigt haben, dazu die Lieferzeit: Schweiz 2 bis 3 Tage, EU und Vereinigtes Königreich 3 bis 6 Tage, übrige Welt 5 bis 10 Tage.',
    },
    {
      q: 'Brauche ich eine Anprobe?',
      a: 'Nein. LINSILK bietet keine Anproben an. Sie nehmen Ihre Masse selbst mit der Anleitung oder gehen damit zu einer Schneiderei Ihrer Wahl, und vor dem Versand aus Genf wird das Stück zweimal anhand Ihrer Masse geprüft.',
    },
    {
      q: 'Was passiert, wenn ich mich vermesse?',
      a: 'Liegt ein Wert ausserhalb des üblichen Bereichs für die jeweilige Körperstelle, weist das Massblatt Sie darauf hin, damit Sie das Massband noch einmal ansetzen können. Zugeschnitten wird ohnehin erst, wenn Sie Ihr Massblatt schriftlich bestätigt haben.',
    },
    {
      q: 'Kann ich ein Kleid online nach Mass anfertigen lassen?',
      a: 'Ja. Suchen Sie sich ein Stück aus Seide, Leinen oder einem hochfrequenten Stoff aus, wählen Sie die Farbe anhand der Stoffmuster und geben Sie Ihre Masse ein. LINSILK schneidet und näht es innert zwei bis vier Wochen und verschickt es von Genf aus.',
    },
  ],
};

const MTM_FR: MtmCopy = {
  title: 'Vêtements sur mesure en ligne : comment commander',
  description: (from) =>
    `Commandez en ligne des vêtements sur mesure en soie, en lin et en tissus à haute fréquence : choisissez une pièce et son coloris, indiquez 15 mesures, recevez-la en 2 à 4 semaines. Sans essayage${from}.`,
  eyebrow: 'Sur mesure',
  h1: 'Le sur-mesure, commandé en ligne',
  lead: 'Un vêtement sur mesure n’est pas taillé dans une taille standard : il est coupé et cousu d’après vos propres mesures, qui servent à tracer le patron. Chez LINSILK, tout se passe en ligne. Vous choisissez une pièce en soie, en lin ou en tissu à haute fréquence, son coloris, vous indiquez quinze mesures, et en deux à quatre semaines elle est réalisée pour vous, puis expédiée depuis Genève.',
  see: 'Découvrir la collection',
  guide: 'Guide pour prendre vos mesures',
  howH: 'Comment commander',
  steps: (silk, linen, cashmere) => [
    'Choisissez une pièce dans la collection femme ou homme.',
    `Choisissez son coloris parmi les échantillons du tissu : ${silk} en soie, ${linen} en lin, ${cashmere} en cachemire.`,
    'Indiquez vos mesures, guide en main : il vous accompagne pas à pas. Pas d’essayage : vous vous mesurez vous-même, ou vous confiez le guide au tailleur de votre choix.',
    'Une fois votre fiche confirmée, la pièce est coupée et cousue en deux à quatre semaines, contrôlée à deux reprises, puis expédiée avec suivi.',
  ],
  payH: 'Tarifs',
  payLine: (all, silkLinen) =>
    `Les pièces sont proposées de ${all}${silkLinen}. La coupe d’après vos mesures n’entraîne aucun supplément : c’est ainsi que chaque pièce est réalisée. Les prix sont indiqués en francs suisses. `,
  silkLinen: (silk, linen) => ` (soie dès ${silk}, lin dès ${linen})`,
  payDuty: '',
  dutyLink: 'Les droits de douane et la livraison',
  payDutyEnd: ' varient selon votre pays de destination.',
  termsH: 'Sur mesure, à façon, bespoke : quelles différences ?',
  terms:
    'LINSILK travaille sur mesure : un patron est tracé d’après vos mesures, puis chaque pièce est coupée et cousue à l’unité. Ce n’est pas du bespoke au sens strict du métier de tailleur, qui suppose des essayages et une toile d’essai. LINSILK ne propose pas d’essayages.',
  noFitH: 'Commander une robe sur mesure en ligne, sans essayage',
  noFit:
    'Vous prenez vos mesures vous-même avec le guide (une dizaine de minutes avec un mètre ruban souple), ou vous les faites prendre par le tailleur de votre choix. Rien n’est coupé avant que vous ayez confirmé votre fiche par écrit, et chaque pièce est vérifiée deux fois d’après vos chiffres avant son départ.',
  designH: 'Vous cherchez une pièce absente de la collection ?',
  design:
    'Créez la vôtre : choisissez une silhouette de base et le tissu, décrivez ce que vous imaginez, et l’atelier vous répond avec un prix. ',
  designLink: 'Créer votre pièce',
  questionsH: 'Questions fréquentes',
  faq: [
    {
      q: 'Que signifie « sur mesure » ?',
      a: 'La pièce n’est pas coupée dans une taille standard, mais d’après vos propres mesures. Chez LINSILK, vous indiquez quinze mesures et la pièce est réalisée pour vous en deux à quatre semaines.',
    },
    {
      q: 'Quel est le délai pour une pièce sur mesure ?',
      a: 'Chez LINSILK, de deux à quatre semaines à compter de la confirmation de votre fiche de mesures, auxquelles s’ajoute la livraison : Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6 jours, reste du monde 5 à 10 jours.',
    },
    {
      q: 'Dois-je venir pour un essayage ?',
      a: 'Non, LINSILK ne propose pas d’essayages. Vous prenez vos mesures avec le guide, ou vous le confiez au tailleur de votre choix, et la pièce est contrôlée deux fois d’après vos mesures avant de quitter Genève.',
    },
    {
      q: 'Que se passe-t-il si je me trompe en me mesurant ?',
      a: 'Lorsqu’une valeur sort de la plage habituelle pour la zone concernée, la fiche vous le signale pour que vous repreniez le mètre ruban. De toute façon, rien n’est coupé avant que vous ayez confirmé votre fiche par écrit.',
    },
    {
      q: 'Puis-je commander une robe sur mesure en ligne ?',
      a: 'Oui. Choisissez une pièce en soie, en lin ou en tissu à haute fréquence, son coloris parmi les échantillons, indiquez vos mesures : LINSILK la coupe et la coud en deux à quatre semaines, puis l’expédie depuis Genève.',
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
    colours: [string, (silk: number, linen: number, cashmere: number) => string];
    price: [string, (range: string) => string];
    making: [string, string];
    order: [string, string];
    fittings: [string, string];
    delivery: [string, string];
    returns: [string, string];
    contact: [string, (email: string) => string];
  };
};

const ABOUT_DE: AboutCopy = {
  title: 'Über LINSILK: Seide, Leinen und hochfrequente Stoffe nach Mass, aus Genf',
  description:
    'LINSILK ist ein Modehaus in Genf. Es fertigt Kleidung nach Ihren Massen, aus 100 % Seide und 100 % Leinen. So entsteht sie, das kostet sie, so bestellen Sie.',
  eyebrow: 'Das Haus',
  h1: 'Über LINSILK',
  entity:
    'LINSILK ist ein Modehaus in Genf, das Kleidung aus Seide, Leinen und hochfrequenten Stoffen nach Mass fertigt. Jedes Stück wird nach den Körpermassen seiner Trägerin oder seines Trägers zugeschnitten und genäht, innert zwei bis vier Wochen, aus 100 % Seide, 100 % Leinen oder hochfrequenten Stoffen.',
  see: 'Zur Kollektion',
  contact: 'Kontakt',
  meansH: 'Was «nach Mass» bei LINSILK heisst',
  meansPre:
    'Nichts entsteht in einer Standardgrösse. Aus Ihren fünfzehn Massen wird ein Schnitt, der ausschliesslich für Sie gezeichnet wird. Danach wird das Stück einzeln flach zugeschnitten, genäht, zweimal anhand Ihrer Masse geprüft und von Genf aus verschickt. Anproben bietet LINSILK nicht an: Sie messen selbst, oder Sie gehen mit der ',
  guideLink: 'Anleitung zum Massnehmen',
  meansPost: ' zu einer Schneiderei Ihrer Wahl.',
  whyH: 'Warum ausschliesslich Seide, Leinen und hochfrequente Stoffe',
  why: 'Seide, Leinen und hochfrequente Stoffe sind Naturfasern: Sie gehen mit dem Körper mit und liegen leicht auf der Haut. Jedes Kleidungsstück von LINSILK besteht aus 100 % Seide, 100 % Leinen oder hochfrequenten Stoffen, niemals aus Kunstfasern. Polyester, Nylon und PU werden aus Erdöl gewonnen, lassen die Haut nicht atmen und setzen beim Tragen und Waschen Mikroplastik frei.',
  glanceH: 'LINSILK im Überblick',
  rows: {
    what: ['Angebot', 'Massgefertigte Kleidung für Damen und Herren'],
    where: ['Sitz', 'Genf, Schweiz'],
    cloth: ['Stoffe', '100 % Seide, 100 % Leinen oder hochfrequente Stoffe'],
    colours: ['Farben', (s, l, c) => `${s} Farben in Seide (glatt, Jacquard, Brokat), ${l} in Leinen, ${c} in Kaschmir`],
    price: ['Preis', (r) => `${r} pro Stück`],
    making: ['Fertigungszeit', 'Zwei bis vier Wochen ab Ihrem bestätigten Massblatt'],
    order: ['Bestellung', 'Stück und Farbe wählen, 15 Masse eingeben, und es wird für Sie zugeschnitten und genäht'],
    fittings: ['Anproben', 'Keine: Sie messen selbst oder gehen zu einer Schneiderei Ihrer Wahl'],
    delivery: ['Lieferung', 'Schweiz 2 bis 3 Tage, EU und Vereinigtes Königreich 3 bis 6 Tage, übrige Welt 5 bis 10 Tage ab Versand aus Genf; Sendungsverfolgung inklusive'],
    returns: ['Rückgabe', 'Massgefertigte Stücke sind von der Rückgabe bei Nichtgefallen ausgeschlossen; bei Fertigungsfehlern wird repariert oder ersetzt; vor dem Zuschnitt lässt sich die Bestellung stornieren'],
    contact: ['Kontakt', (e) => `${e}: Eine Person antwortet, in der Regel innert eines Tages`],
  },
};

const ABOUT_FR: AboutCopy = {
  title: 'À propos de LINSILK : soie, lin et tissus à haute fréquence sur mesure, à Genève',
  description:
    'LINSILK est une maison genevoise qui réalise des vêtements à vos mesures, en 100 % soie et 100 % lin. Comment ils sont faits, ce qu’ils coûtent, comment les commander.',
  eyebrow: 'La maison',
  h1: 'À propos de LINSILK',
  entity:
    'LINSILK est une maison de mode genevoise, spécialisée dans les vêtements sur mesure en soie, en lin et en tissus à haute fréquence. Chaque pièce est coupée et cousue d’après les mesures de celle ou celui qui la portera, en deux à quatre semaines, en 100 % soie, 100 % lin ou en tissus à haute fréquence.',
  see: 'Découvrir la collection',
  contact: 'Contact',
  meansH: 'Ce que « sur mesure » veut dire chez LINSILK',
  meansPre:
    'Rien n’est fait dans une taille standard. Vos quinze mesures servent à tracer un patron qui n’existe que pour vous. La pièce est ensuite coupée à plat, à l’unité, cousue, contrôlée à deux reprises d’après vos mesures, puis expédiée depuis Genève. LINSILK ne propose pas d’essayages : vous vous mesurez vous-même, ou vous confiez le ',
  guideLink: 'guide pour prendre vos mesures',
  meansPost: ' au tailleur de votre choix.',
  whyH: 'Pourquoi seulement la soie, le lin et les tissus à haute fréquence',
  why: 'La soie, le lin et les tissus à haute fréquence sont des fibres naturelles : elles accompagnent le corps et se posent légèrement sur la peau. Chaque vêtement LINSILK est réalisé en 100 % soie, 100 % lin ou en tissus à haute fréquence, jamais en fibres synthétiques. Le polyester, le nylon et le PU sont dérivés du pétrole, empêchent la peau de respirer et libèrent des microplastiques à chaque port et à chaque lavage.',
  glanceH: 'LINSILK en bref',
  rows: {
    what: ['Activité', 'Vêtements sur mesure pour femme et pour homme'],
    where: ['Siège', 'Genève, Suisse'],
    cloth: ['Tissus', '100 % soie, 100 % lin ou tissus à haute fréquence'],
    colours: ['Coloris', (s, l, c) => `${s} en soie (uni, jacquard, brocart), ${l} en lin, ${c} en cachemire`],
    price: ['Prix', (r) => `${r} la pièce`],
    making: ['Délai de réalisation', 'De deux à quatre semaines après confirmation de votre fiche de mesures'],
    order: ['Commande', 'Choisir une pièce et son coloris, indiquer 15 mesures : elle est alors coupée et cousue pour vous'],
    fittings: ['Essayages', 'Aucun : vous vous mesurez vous-même ou vous allez chez le tailleur de votre choix'],
    delivery: ['Livraison', 'Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6 jours, reste du monde 5 à 10 jours après l’expédition depuis Genève ; suivi inclus'],
    returns: ['Retours', 'Les pièces sur mesure ne sont ni reprises ni échangées en cas de simple changement d’avis ; un défaut de fabrication donne lieu à une réparation ou à un remplacement ; la commande peut être annulée avant la coupe'],
    contact: ['Contact', (e) => `${e} : une personne vous répond, en général dans la journée`],
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
  /** The cashmere paragraph. */
  c: string;
  cta: string;
};

const CLOTH_DE: ClothCopy = {
  title: 'Seide, Leinen und hochfrequente Stoffe: 48 Farben in Seide, 40 in Leinen, 12 in Kaschmir',
  description:
    'Die Stoffe von LINSILK: reine Seide (glatt, Jacquard, Brokat), reines Leinen und Kaschmir. Wie sie sich anfühlen, wie sie sich tragen und pflegen lassen, dazu alle 100 Farben.',
  h1: 'Der Stoff: reine Seide, reines Leinen und Kaschmir',
  lead: 'LINSILK verarbeitet ausschliesslich Seide, Leinen und hochfrequente Stoffe, also reine Seide, reines Leinen und Kaschmir. Polyester und Mischgewebe gibt es bei uns nicht. Die Farbe Ihres Stücks wählen Sie anhand von Mustern genau des Stoffs, aus dem es entsteht. Auf dieser Seite sehen Sie, was zur Auswahl steht.',
  a: 'Seide ist glatt und leicht und fühlt sich bei Kälte wie bei Wärme angenehm an. Es gibt sie in drei Bindungen: glatt (15 Farben), Jacquard (20 Farben mit Muster) und Brokat (13 Farben mit Muster), zusammen 48 Farben. Aus Seide entstehen unsere Kleider, Roben, Röcke, Blusen und die Schlafmode.',
  b: 'Leinen ist fest, luftig und kühlt auf der Haut; mit jedem Tragen wird es weicher. Seine 40 Farben gelten für die gesamte Herrenkleidung und für die Damen-Sets mit Weste und Hose. Eine Naturfaser knittert, gibt nach und altert. Ein Leinenhemd, das einen Sommer lang getragen wurde, sieht nicht mehr aus wie auf dem Foto, und genau das macht seinen Reiz aus. Kunstfaser-Mischungen halten die Bügelfalte länger und sind günstiger zu verarbeiten; bei LINSILK besteht der Stoff aus reiner Seide oder reinem Leinen.',
  c: 'Kaschmir ist weich und warm und kommt bei unseren Hosen zum Einsatz; es gibt ihn in 12 Farben.',
  cta: 'Stoffmuster anfragen',
};

const CLOTH_FR: ClothCopy = {
  title: 'Soie, lin et tissus à haute fréquence : 48 coloris en soie, 40 en lin, 12 en cachemire',
  description:
    'Les tissus de LINSILK : soie pure (unie, jacquard, brocart), lin pur et cachemire. Leur toucher, leur tombé, leur entretien, et les 100 coloris.',
  h1: 'Le tissu : soie pure, lin pur et cachemire',
  lead: 'LINSILK ne travaille que la soie, le lin et les tissus à haute fréquence : soie pure, lin pur et cachemire, sans polyester ni tissu mélangé. Le coloris de votre pièce se choisit sur des échantillons du tissu même dans lequel elle sera réalisée. Cette page vous montre ce qui s’offre à votre choix.',
  a: 'La soie est lisse et légère, et reste agréable au porter par temps frais comme par temps chaud. Elle existe en trois armures : unie (15 coloris), jacquard (20 coloris à motifs) et brocart (13 coloris à motifs), soit 48 coloris. C’est la matière de nos robes, robes du soir, jupes, chemisiers et vêtements de nuit.',
  b: 'Le lin est ferme, aéré et frais sur la peau, et il s’assouplit à chaque port. Ses 40 coloris s’appliquent à toute la garde-robe masculine et aux ensembles gilet et pantalon pour femme. Une fibre naturelle se froisse, joue et vieillit. Une chemise en lin portée tout un été ne ressemble plus à sa photo, et c’est ce qui fait son charme. Les mélanges synthétiques gardent mieux le pli et coûtent moins à travailler ; chez LINSILK, le tissu est de la soie pure ou du lin pur.',
  c: 'Le cachemire est doux et chaud ; il sert à nos pantalons et existe en 12 coloris.',
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
  colours: (silk: number, linen: number, cashmere: number) => QA;
  contactQ: (email: string) => QA;
};

const BANK_DE: BankCopy = {
  title: 'Häufige Fragen: Massanfertigung, Stoffe, Lieferung und Rückgabe',
  description:
    'Antworten auf die Fragen, die uns am häufigsten gestellt werden: wie Massanfertigung funktioniert, Anproben, Fertigungszeit, Pflege von Seide, Leinen und Kaschmir, Lieferung, Zoll und Rückgabe.',
  h1: 'Häufige Fragen',
  lead: (email) =>
    `Was das Büro in Genf am häufigsten gefragt wird. Fehlt Ihre Frage, schreiben Sie an ${email}: Eine Person antwortet Ihnen, in der Regel innert eines Tages.`,
  measuring: 'Anleitung zum Massnehmen',
  shipping: 'Lieferung',
  price: (range) => ({
    q: 'Was kosten die Stücke von LINSILK?',
    a: `${range}, je nach Stück. Alle Preise gelten in Schweizer Franken; auf der Website können Sie sich ungefähre Beträge in Euro, Pfund, Dollar oder Dirham anzeigen lassen.`,
  }),
  colours: (silk, linen, cashmere) => ({
    q: 'Aus wie vielen Farben kann ich wählen?',
    a: `Es stehen ${silk} Farben in Seide (glatt, Jacquard und Brokat), ${linen} in Leinen und ${cashmere} in Kaschmir zur Wahl. Sie wählen anhand von Mustern des Stoffs, aus dem das Stück gefertigt wird.`,
  }),
  contactQ: (email) => ({
    q: 'Gibt es LINSILK wirklich?',
    a: `Ja. LINSILK ist ein Modehaus in Genf für Seide, Leinen und hochfrequente Stoffe nach Mass. Jedes Stück wird nach den Massen seiner Trägerin oder seines Trägers zugeschnitten und genäht und mit Sendungsverfolgung verschickt. Kontakt: ${email}.`,
  }),
  groups: [
    {
      title: 'Massanfertigung',
      items: [
        { q: 'Warum gibt es keine Grössentabelle?', a: 'Weil bei uns nichts in einer Grösse entsteht. Aus Ihren fünfzehn Massen wird ein Schnitt gezeichnet und aufbewahrt. Deshalb sitzt auch das zweite Stück, das Sie bestellen, genau wie das erste.' },
        { q: 'Was, wenn ich zwischen zwei Grössen liege?', a: 'Dann gibt es nichts zu entscheiden: Grössen, zwischen denen Sie liegen könnten, kennen wir nicht. LINSILK schneidet jedes Stück nach Ihren fünfzehn Massen zu.' },
        { q: 'Brauche ich eine Anprobe?', a: 'Nein. LINSILK bietet keine Anproben an. Sie nehmen Ihre Masse selbst mit der Anleitung oder gehen damit zu einer Schneiderei Ihrer Wahl, und vor dem Versand aus Genf wird das Stück zweimal anhand Ihrer Masse geprüft.' },
        { q: 'Kann ich ein Kleid anfertigen lassen, ohne zur Schneiderin zu gehen?', a: 'Ja. LINSILK fertigt das Kleid; von Ihnen braucht es nur die Masse. Die können Sie selbst nehmen oder in einer Schneiderei Ihrer Wahl nehmen lassen.' },
        { q: 'Was unterscheidet Massanfertigung von Bespoke?', a: 'Bei der Massanfertigung wird nach Ihren Massen ein Schnitt gezeichnet; Bespoke kommt mit Anproben und einem Probestück. LINSILK arbeitet nach Mass und bietet keine Anproben an.' },
        { q: 'Was unterscheidet ein Stück von einem Auftrag?', a: 'Ein Stück ist ein Modell des Hauses, nach Ihren Massen zugeschnitten. Ein Auftrag ist ein Kleidungsstück, das es nur gibt, weil Sie es beschrieben haben: Sie wählen die Silhouette und den Stoff und schreiben dazu, was Sie sich vorstellen, und das Atelier fertigt danach ein einzelnes Kleidungsstück.' },
        { q: 'Ändert LINSILK Kleidung nachträglich?', a: 'Nein. Jedes Stück wird von vornherein nach Ihren Massen gefertigt. Bei einem Fehler in der Verarbeitung wird das Stück repariert oder ersetzt.' },
      ],
    },
    {
      title: 'Stoffe und Pflege',
      items: [
        { q: 'Warum verarbeitet LINSILK nur Seide, Leinen und hochfrequente Stoffe?', a: 'Weil es Naturfasern sind: Sie gehen mit dem Körper mit und liegen leicht auf der Haut. Deshalb besteht jedes Stück von LINSILK aus 100 % Seide, 100 % Leinen oder Kaschmir, nie aus Kunstfasern.' },
        { q: 'Sind die Stücke von LINSILK wirklich aus 100 % Seide oder Leinen, und wie ist es bei Kaschmir?', a: 'Stücke aus Seide bestehen zu 100 % aus Seide, Stücke aus Leinen zu 100 % aus Leinen, und die Kaschmirstücke sind aus Kaschmir gefertigt. Knöpfe, Reissverschlüsse und ähnliche Verschlüsse gehören nicht zum Stoff.' },
        { q: 'Ist bei warmem Wetter Seide oder Leinen besser?', a: 'Beide atmen. Leinen ist fest, luftig und kühlend und wird mit jedem Tragen weicher; Seide ist glatt und leicht und fühlt sich auch an kühleren Tagen angenehm an.' },
        { q: 'Wie wasche ich die Stücke?', a: 'Glatte Seide waschen Sie kühl von Hand; Jacquard- und Brokatseide gehören nur in die Reinigung. Leinen kommt für die erste Wäsche in die Reinigung, danach in den Schonwaschgang bei 30 °C. Kaschmir waschen Sie kühl von Hand oder im Wollprogramm bei 30 °C. Keines der Stücke gehört in den Tumbler. Die Pflegeanleitung von LINSILK unter bylinsilk.com/care erklärt jeden Schritt.' },
        { q: 'Knittert Leinen?', a: 'Ja. Echtes Leinen knittert, wird weicher und altert, und das gehört zu diesem Stoff, es ist kein Mangel.' },
        { q: 'Warum verzichtet LINSILK auf Polyester?', a: 'Polyester, Nylon und PU werden aus Erdöl hergestellt, lassen die Haut nicht atmen, stauen Wärme und Feuchtigkeit und setzen beim Tragen und Waschen Mikroplastik frei.' },
      ],
    },
    {
      title: 'Bestellung, Lieferung und Rückgabe',
      items: [
        { q: 'Wie lange dauert eine Massanfertigung?', a: 'Bei LINSILK zwei bis vier Wochen ab dem Tag, an dem Sie Ihr Massblatt bestätigt haben, dazu die Lieferzeit: Schweiz 2 bis 3 Tage, EU und Vereinigtes Königreich 3 bis 6 Tage, übrige Welt 5 bis 10 Tage.' },
        { q: 'Wann sollte ich ein Kleid für einen Anlass bestellen?', a: 'In Europa etwa sechs Wochen vorher, in anderen Ländern etwa acht Wochen: zwei bis vier Wochen Fertigung ab Ihrem bestätigten Massblatt, dazu die Lieferzeit.' },
        { q: 'Liefert LINSILK nach Deutschland, Österreich, Frankreich, Luxemburg, in die Niederlande und in die Vereinigten Arabischen Emirate?', a: 'Ja, von Genf aus. Nach Versand dauert die Lieferung in die EU und ins Vereinigte Königreich 3 bis 6 Tage, in alle anderen Länder 5 bis 10 Tage, jeweils mit Sendungsverfolgung.' },
        { q: 'Wer zahlt den Zoll?', a: 'In der Schweiz und in der EU ist der Zoll im Preis enthalten. Im Vereinigten Königreich wird die Einfuhr-Mehrwertsteuer bei Ankunft fällig; in anderen Ländern erhebt der Zusteller Zoll und Einfuhrabgaben bei der Lieferung.' },
        { q: 'Kann ich ein massgefertigtes Stück zurückgeben?', a: 'Ein Stück, das nach den Massen eines einzelnen Menschen zugeschnitten wurde, kann nicht zurückgegeben werden, nur weil es nicht gefällt. Bei einem Fehler in der Verarbeitung wird es repariert oder ersetzt, und vor dem Zuschnitt können Sie stornieren.' },
        { q: 'Kann ich eine Bestellung stornieren?', a: 'Ja, bis Sie Ihr Massblatt schriftlich bestätigen, vollständig und ohne Begründung.' },
        { q: 'Gibt es ein Modell auch in der nächsten Saison noch?', a: 'Die meisten Modelle gehen in die nächste Kollektion über; einige wenige laufen jede Saison aus.' },
      ],
    },
    {
      title: 'Das Haus',
      items: [
        { q: 'Wo hat LINSILK seinen Sitz?', a: 'LINSILK hat seinen Sitz in Genf, Schweiz.' },
        { q: 'Gibt es bei LINSILK auch Herrenmode?', a: 'Ja: Hemden, Hosen und zweiteilige Looks aus Leinen sowie Hosen aus Kaschmir, nach Ihren Massen gefertigt in zwei bis vier Wochen. Dazu Seidenkrawatten, bei denen Sie nur die Farbe wählen.' },
        { q: 'Eignet sich ein Seidenpyjama als Geschenk?', a: 'Ja, mit einer Einschränkung: Er wird nach Mass gefertigt, Sie brauchen also die Masse der beschenkten Person.' },
      ],
    },
  ],
};

const BANK_FR: BankCopy = {
  title: 'Questions fréquentes : sur mesure, tissus, livraison et retours',
  description:
    'Les réponses aux questions que l’on nous pose le plus : le fonctionnement du sur-mesure, les essayages, les délais, l’entretien de la soie, du lin et du cachemire, la livraison, la douane et les retours.',
  h1: 'Questions fréquentes',
  lead: (email) =>
    `Ce que l’on demande le plus souvent au bureau de Genève. Si votre question n’y figure pas, écrivez à ${email} : une personne vous répond, en général dans la journée.`,
  measuring: 'Guide pour prendre vos mesures',
  shipping: 'Livraison',
  price: (range) => ({
    q: 'Quel est le prix d’une pièce LINSILK ?',
    a: `${range}, selon la pièce. Les prix sont indiqués en francs suisses ; le site peut afficher un montant approximatif en euros, en livres, en dollars ou en dirhams.`,
  }),
  colours: (silk, linen, cashmere) => ({
    q: 'Parmi combien de coloris puis-je choisir ?',
    a: `${silk} coloris en soie (unie, jacquard et brocart), ${linen} en lin et ${cashmere} en cachemire. Vous choisissez sur des échantillons du tissu dans lequel la pièce sera réalisée.`,
  }),
  contactQ: (email) => ({
    q: 'LINSILK existe-t-elle vraiment ?',
    a: `Oui. LINSILK est une maison genevoise de vêtements sur mesure en soie, en lin et en tissus à haute fréquence. Chaque pièce est coupée et cousue d’après les mesures de celle ou celui qui la portera, puis expédiée avec suivi. Contact : ${email}.`,
  }),
  groups: [
    {
      title: 'Sur mesure',
      items: [
        { q: 'Pourquoi n’y a-t-il pas de tableau des tailles ?', a: 'Parce que rien n’est fabriqué dans une taille. Un patron est tracé d’après vos quinze mesures, puis conservé : c’est aussi pourquoi la deuxième pièce que vous commandez vous va exactement comme la première.' },
        { q: 'Que faire si je suis entre deux tailles ?', a: 'Rien : chez nous, il n’y a pas de tailles entre lesquelles hésiter. LINSILK coupe chaque pièce d’après vos quinze mesures.' },
        { q: 'Dois-je venir pour un essayage ?', a: 'Non, LINSILK ne propose pas d’essayages. Vous prenez vos mesures avec le guide, ou vous le confiez au tailleur de votre choix, et la pièce est contrôlée deux fois d’après vos mesures avant de quitter Genève.' },
        { q: 'Puis-je faire réaliser une robe sans passer chez un tailleur ?', a: 'Oui. LINSILK réalise la robe ; il ne lui faut que vos mesures, que vous prenez vous-même ou que vous faites prendre chez le tailleur de votre choix.' },
        { q: 'Quelle différence entre le sur-mesure et le bespoke ?', a: 'Dans le sur-mesure, un patron est tracé d’après vos mesures ; le bespoke y ajoute des essayages et une toile d’essai. LINSILK fait du sur-mesure et ne propose pas d’essayages.' },
        { q: 'Quelle différence entre une pièce et une commande personnalisée ?', a: 'Une pièce est un modèle de la maison, coupé d’après vos mesures. Une commande personnalisée est un vêtement qui n’existe que parce que vous l’avez décrit : vous choisissez la silhouette et le tissu, vous racontez ce que vous imaginez, et l’atelier réalise un seul vêtement.' },
        { q: 'LINSILK propose-t-elle des retouches ?', a: 'Non. Chaque pièce est réalisée d’emblée à vos mesures. En cas de défaut de fabrication, la pièce est réparée ou remplacée.' },
      ],
    },
    {
      title: 'Tissus et entretien',
      items: [
        { q: 'Pourquoi LINSILK ne travaille-t-elle que la soie, le lin et les tissus à haute fréquence ?', a: 'Parce que ce sont des fibres naturelles : elles accompagnent le corps et se posent légèrement sur la peau. Chaque pièce LINSILK est donc en 100 % soie, 100 % lin ou en cachemire, jamais en fibres synthétiques.' },
        { q: 'Les pièces LINSILK sont-elles vraiment en 100 % soie ou en lin, et qu’en est-il du cachemire ?', a: 'Les pièces en soie sont en 100 % soie, celles en lin en 100 % lin, et les pièces en cachemire sont en cachemire. Les boutons, fermetures à glissière et autres fermetures ne font pas partie du tissu.' },
        { q: 'La soie ou le lin : lequel choisir par temps chaud ?', a: 'Les deux respirent. Le lin est ferme, aéré et rafraîchissant, et s’assouplit à chaque port ; la soie est lisse et légère, et reste agréable lorsque les températures baissent.' },
        { q: 'Comment les laver ?', a: 'La soie unie se lave à la main, à l’eau fraîche ; la soie jacquard et brocart se confie uniquement au pressing. Le lin passe au pressing pour son premier nettoyage, puis se lave en cycle délicat à 30 °C. Le cachemire se lave à la main, à l’eau fraîche, ou au programme laine à 30 °C. Aucune de ces pièces ne va au sèche-linge. Le guide d’entretien LINSILK, sur bylinsilk.com/care, détaille chaque étape.' },
        { q: 'Le lin se froisse-t-il ?', a: 'Oui. Le lin naturel se froisse, s’assouplit et vieillit : c’est dans sa nature, ce n’est pas un défaut.' },
        { q: 'Pourquoi LINSILK écarte-t-elle le polyester ?', a: 'Le polyester, le nylon et le PU sont dérivés du pétrole, empêchent la peau de respirer, retiennent la chaleur et l’humidité et libèrent des microplastiques à chaque port et à chaque lavage.' },
      ],
    },
    {
      title: 'Commande, livraison et retours',
      items: [
        { q: 'Quel est le délai pour une pièce sur mesure ?', a: 'Chez LINSILK, de deux à quatre semaines à compter de la confirmation de votre fiche de mesures, auxquelles s’ajoute la livraison : Suisse 2 à 3 jours, UE et Royaume-Uni 3 à 6 jours, reste du monde 5 à 10 jours.' },
        { q: 'Quand commander une robe pour un événement ?', a: 'Environ six semaines à l’avance en Europe, huit semaines ailleurs : deux à quatre semaines de réalisation à partir de votre fiche confirmée, plus la livraison.' },
        { q: 'LINSILK livre-t-elle en Allemagne, en Autriche, en France, au Luxembourg, aux Pays-Bas et aux Émirats arabes unis ?', a: 'Oui, depuis Genève. Une fois la pièce expédiée, la livraison prend de 3 à 6 jours vers l’UE et le Royaume-Uni, de 5 à 10 jours vers le reste du monde, avec suivi.' },
        { q: 'Qui règle les droits de douane ?', a: 'En Suisse et dans l’UE, ils sont inclus dans le prix. Au Royaume-Uni, la TVA à l’importation est due à l’arrivée ; dans les autres pays, le transporteur perçoit les droits et taxes à la livraison.' },
        { q: 'Puis-je retourner une pièce sur mesure ?', a: 'Une pièce coupée aux mesures d’une seule personne ne peut pas être retournée par simple changement d’avis. En cas de défaut de fabrication, elle est réparée ou remplacée, et vous pouvez annuler votre commande avant la coupe.' },
        { q: 'Puis-je annuler une commande ?', a: 'Oui, jusqu’à ce que vous confirmiez votre fiche de mesures par écrit, intégralement et sans avoir à vous justifier.' },
        { q: 'Un modèle sera-t-il encore disponible à la saison suivante ?', a: 'La plupart des modèles sont reconduits dans la collection suivante ; quelques-uns sortent de la collection à chaque saison.' },
      ],
    },
    {
      title: 'La maison',
      items: [
        { q: 'Où LINSILK est-elle installée ?', a: 'LINSILK a son siège à Genève, en Suisse.' },
        { q: 'LINSILK propose-t-elle de la mode homme ?', a: 'Oui : chemises, pantalons et tenues deux pièces en lin, ainsi que des pantalons en cachemire, réalisés d’après vos mesures en deux à quatre semaines. S’y ajoutent des cravates en soie, pour lesquelles vous ne choisissez que le coloris.' },
        { q: 'Un pyjama en soie est-il un bon cadeau ?', a: 'Oui, à une réserve près : il est réalisé sur mesure, il faut donc les mesures de la personne qui le recevra.' },
      ],
    },
  ],
};

const PICK = <T,>(table: { de: T; fr: T }, lang: Exclude<Lang, 'en'>): T =>
  lang.startsWith('fr') ? table.fr : table.de;

export const mtmCopy = (lang: Exclude<Lang, 'en'>) => PICK({ de: MTM_DE, fr: MTM_FR }, lang);
export const aboutCopy = (lang: Exclude<Lang, 'en'>) => PICK({ de: ABOUT_DE, fr: ABOUT_FR }, lang);
export const clothCopy = (lang: Exclude<Lang, 'en'>) => PICK({ de: CLOTH_DE, fr: CLOTH_FR }, lang);
export const bankCopy = (lang: Exclude<Lang, 'en'>) => PICK({ de: BANK_DE, fr: BANK_FR }, lang);
