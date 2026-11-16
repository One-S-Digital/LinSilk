/* The home page's words in each language (docs/seo/COPY-PAGES.md §2). English
 * is the source; German and French are for a native-speaker pass before they
 * go live (docs/seo/SEO-GEO-PLAN.md §13.7). */

import type { Lang } from './i18n';

export type HomeCopy = {
  title: string;
  description: (colours: string, from: string) => string;
  kicker: string;
  heroLines: [string, string, string, string];
  women: string;
  men: string;
  introH: string;
  introLead: string;
  steps: (silk: number, linen: number, cashmere: number) => string[];
  introCta: string;
  pillars: { title: string; body: string }[];
  seasonH: string;
  seasonRail: string;
  railHint: string;
  eyebrowDesign: string;
  designH: string;
  designBody: string;
  designCta: string;
  designAlt: string;
  eyebrowAtelier: string;
  atelierH: string;
  atelierBody: string;
  atelierAlts: [string, string];
  chalk: string;
  eyebrowFreq: string;
  freqH: string;
  freq: { title: string; body: string }[];
  eyebrowCloth: string;
  clothH: string;
  clothP1: string;
  clothP2: string;
  statCloth: string;
  statDesigns: (season: string | undefined) => string;
};

export const HOME_EN: HomeCopy = {
  title: 'LINSILK | Made-to-measure silk, linen and high frequency fabrics, Geneva',
  description: (colours, from) =>
    `LINSILK makes clothing in silk, linen and high frequency fabrics to your own measurements in 2–4 weeks. ${colours}${from}. No fittings needed. From Geneva.`,
  kicker: 'Made-to-measure clothing in silk, linen and high frequency fabrics, from Geneva',
  heroLines: ['Exceptional style,', 'Made personal.', 'Made-to-measure.', 'Linen · Silk · Cashmere'],
  women: 'Women’s collection',
  men: 'Men’s collection',
  introH: 'How ordering works',
  introLead:
    'LINSILK is a made-to-measure clothing house based in Geneva, Switzerland, working in silk, linen and high frequency fabrics. You choose a piece, choose its colour from swatches of the cloth, enter your own measurements, and it is cut and sewn for you in 2–4 weeks.',
  steps: (silk, linen, cashmere) => [
    'Choose a piece from the women’s or men’s collection.',
    `Choose its colour: ${silk} silk colours, ${linen} linen colours, ${cashmere} cashmere colours.`,
    'Enter your measurements. No fittings: measure yourself, or take the guide to any tailor.',
    'It is cut and sewn in 2–4 weeks from your confirmed sheet, then sent with tracking.',
  ],
  introCta: 'How made-to-measure works',
  pillars: [
    {
      title: 'Luxury, premium-quality material',
      body: 'Silk, linen and high frequency fabrics of the finest grade, chosen for how they feel against the skin before how they look on a hanger. Every LINSILK garment is made in 100% silk, 100% linen or high frequency fabric: no polyester and no synthetic fabric.',
    },
    {
      title: 'Made to your fit and measurements',
      body: 'No size chart, no nearest size. Each piece is cut after you send your measurements, so it sits, falls and moves with your body and no one else’s.',
    },
    {
      title: 'High-frequency fabric that raises you',
      body: 'Natural cloth from living fibre, light on the body and calm to wear. We make it to do more than feel good: to lift how you feel and how you carry yourself.',
    },
  ],
  seasonH: 'This season',
  seasonRail: 'This season',
  railHint: 'Drag, scroll or use the arrows to move through the season',
  eyebrowDesign: 'Design Your Own',
  designH: 'A piece that exists because you described it.',
  designBody:
    'Choose a base silhouette, choose the cloth, write to the tailor, submit your measurements. The tailor builds one garment to that brief. It is the only path where the design is yours before it is ours.',
  designCta: 'Begin a commission',
  designAlt: 'Silk chalked with a pattern, with shears, pins and thread',
  eyebrowAtelier: 'The Tailor',
  atelierH: 'Clothes made the way they were always meant to be had.',
  atelierBody:
    'LINSILK does not make mass-produced, low-grade, synthetic clothing. Each piece is made to your own measurements, so the garment follows your body instead of asking your body to follow it. That fit is what lets smooth, breathable silk, linen and high frequency fabrics do what they do best: rest lightly on the skin, move with you, and stay comfortable from the first hour to the last.',
  atelierAlts: ['Hands stitching a floral silk by hand', 'Hands pinning a silk top on a dress form'],
  chalk: 'shoulder · 41',
  eyebrowFreq: 'High Frequency',
  freqH: 'What we mean by high frequency.',
  freq: [
    {
      title: 'Everything is energy',
      body: 'Physics has said it for a century. Einstein’s E = mc² shows that mass is energy held in a very dense form. Look closely at anything you can touch, a stone, a hand, a length of silk, and you find atoms that are almost entirely empty space, made of particles that are best described as vibrations in underlying fields. What feels solid is energy, condensed.',
    },
    {
      title: 'All energy has a frequency',
      body: 'Energy vibrates, and each kind vibrates differently: light, sound, heat, and the activity of your own body. Cloth lies against you all day, so we believe it belongs in that picture. We want our clothes not only to feel comfortable but to raise your natural frequency. Silk, linen and cashmere come from living things, the silkworm, the flax plant and the cashmere goat, and we hold that they carry that life into the garment.',
    },
    {
      title: 'What synthetics take away',
      body: 'PU, polyester, nylon and other plastic-based fabrics are made from petrochemicals. They trap heat and moisture against the skin, shed microplastic fibres as they are worn and washed, and often carry finishing chemicals that sit on your skin for hours a day. Over years, that can mean irritation and discomfort, and the effect of long plastic exposure on the body is still being studied. In our view a cloth with no life in it dulls your energy rather than lifting it, which is why we use none.',
    },
  ],
  eyebrowCloth: 'The Cloth',
  clothH: 'Silk, linen and high frequency fabrics. Nothing else enters the room.',
  clothP1:
    'Premium silk, premium linen and high frequency fabrics, and nothing else: no polyester and no synthetic fabric. Synthetic fibre is cheaper to sew and it holds a press longer, which is precisely why so much clothing is made from it.',
  clothP2:
    'Natural fibre moves, creases and ages. A linen shirt worn through one summer will not look the way it looked in the photograph, and that is the point of it. Silk, linen and high frequency fabrics rest lightly on the skin, which is why comfort comes first.',
  statCloth: 'silk, linen or high frequency cloth',
  statDesigns: (season) => (season ? `designs in ${season}` : 'designs this season'),
};

/* German and French are written natively, as a Geneva house would address a
   customer in each language, not translated line by line from English
   (CLAUDE.md, "Native writing in every language"). */
const HOME_DE: HomeCopy = {
  title: 'LINSILK | Massgefertigte Kleidung aus Seide, Leinen und hochfrequenten Stoffen, aus Genf',
  description: (colours, from) =>
    `LINSILK fertigt Kleidung aus Seide, Leinen und hochfrequenten Stoffen nach Ihren Massen, in 2 bis 4 Wochen. ${colours}${from}. Ohne Anprobe. Aus Genf.`,
  kicker: 'Massgefertigte Kleidung aus Seide, Leinen und hochfrequenten Stoffen, aus Genf',
  heroLines: ['Aussergewöhnlicher Stil,', 'ganz persönlich.', 'Massgefertigt.', 'Leinen · Seide · Kaschmir'],
  women: 'Damenkollektion',
  men: 'Herrenkollektion',
  introH: 'So bestellen Sie',
  introLead:
    'LINSILK ist ein Modehaus aus Genf und fertigt Kleidung aus Seide, Leinen und hochfrequenten Stoffen ganz nach Mass. Sie suchen sich ein Stück aus, wählen die Farbe anhand von Stoffmustern, geben Ihre Masse ein, und innert zwei bis vier Wochen wird es für Sie zugeschnitten und genäht.',
  steps: (silk, linen, cashmere) => [
    'Suchen Sie sich ein Stück aus der Damen- oder Herrenkollektion aus.',
    `Wählen Sie die Farbe: ${silk} Farben in Seide, ${linen} in Leinen, ${cashmere} in Kaschmir.`,
    'Geben Sie Ihre Masse ein. Eine Anprobe gibt es nicht: Sie nehmen Ihre Masse selbst, oder Sie gehen mit unserer Anleitung zu einer Schneiderei Ihrer Wahl.',
    'Nach Ihrer Bestätigung wird das Stück innert zwei bis vier Wochen zugeschnitten und genäht und anschliessend mit Sendungsverfolgung verschickt.',
  ],
  introCta: 'So funktioniert Massanfertigung',
  pillars: [
    {
      title: 'Hochwertigste Materialien',
      body: 'Seide, Leinen und hochfrequente Stoffe in bester Qualität, ausgewählt danach, wie sie sich auf der Haut anfühlen, nicht danach, wie sie auf dem Bügel wirken. Jedes Stück von LINSILK besteht aus 100 % Seide, 100 % Leinen oder hochfrequenten Stoffen: kein Polyester, kein synthetisches Gewebe.',
    },
    {
      title: 'Ihre Passform, Ihre Masse',
      body: 'Keine Grössentabelle, keine «ungefähr passende» Grösse. Jedes Stück wird erst zugeschnitten, wenn Ihre Masse vorliegen. So sitzt, fällt und bewegt es sich mit Ihrem Körper und mit keinem anderen.',
    },
    {
      title: 'Hochfrequenter Stoff, der aufrichtet',
      body: 'Naturstoff aus lebender Faser: leicht auf dem Körper, ruhig im Tragen. Er soll mehr leisten, als sich gut anzufühlen: Er hebt, wie Sie sich fühlen und wie Sie sich bewegen.',
    },
  ],
  seasonH: 'Diese Saison',
  seasonRail: 'Diese Saison',
  railHint: 'Ziehen, scrollen oder mit den Pfeilen durch die Saison blättern',
  eyebrowDesign: 'Selbst entwerfen',
  designH: 'Ein Stück, das es nur gibt, weil Sie es beschrieben haben.',
  designBody:
    'Sie wählen eine Grundsilhouette und den Stoff, schreiben der Schneiderin oder dem Schneider, was Sie sich vorstellen, und senden Ihre Masse. Danach entsteht ein einzelnes Kleidungsstück nach Ihrem Auftrag. Das Modell gehört so zuerst Ihnen und erst danach uns.',
  designCta: 'Auftrag beginnen',
  designAlt: 'Seide mit aufgezeichnetem Schnittmuster, daneben Schere, Stecknadeln und Faden',
  eyebrowAtelier: 'Die Schneiderei',
  atelierH: 'Kleidung, wie sie schon immer sein sollte.',
  atelierBody:
    'LINSILK stellt keine Massenware her, keine Kleidung von geringer Qualität, keine Kunstfaser. Jedes Stück entsteht nach Ihren eigenen Massen, sodass das Kleidungsstück Ihrem Körper folgt und nicht umgekehrt. Erst diese Passform lässt glatte, atmungsaktive Seide, Leinen und hochfrequente Stoffe das tun, was sie am besten können: leicht auf der Haut liegen, sich mit Ihnen bewegen und von der ersten bis zur letzten Stunde angenehm bleiben.',
  atelierAlts: ['Hände nähen von Hand eine geblümte Seide', 'Hände stecken ein Seidenoberteil an einer Schneiderpuppe ab'],
  chalk: 'Schulter · 41',
  eyebrowFreq: 'Hohe Frequenz',
  freqH: 'Was wir unter hoher Frequenz verstehen.',
  freq: [
    {
      title: 'Alles ist Energie',
      body: 'Die Physik weiss es seit hundert Jahren: Nach Einsteins E = mc² ist Masse stark verdichtete Energie. Wer genau hinsieht, bei einem Stein, einer Hand, einem Stück Seide, findet Atome, die fast nur aus leerem Raum bestehen, und Teilchen, die sich am besten als Schwingungen zugrunde liegender Felder beschreiben lassen. Was sich fest anfühlt, ist verdichtete Energie.',
    },
    {
      title: 'Jede Energie schwingt in ihrer Frequenz',
      body: 'Energie schwingt, und jede Form auf ihre Weise: Licht, Klang, Wärme, auch die Aktivität Ihres Körpers. Stoff liegt den ganzen Tag auf Ihrer Haut und gehört deshalb dazu. Kleidung von LINSILK soll sich nicht nur angenehm tragen, sondern Ihre natürliche Frequenz anheben. Seide, Leinen und Kaschmir stammen von Lebewesen, vom Seidenspinner, von der Flachspflanze, von der Kaschmirziege, und sie tragen dieses Leben ins Kleidungsstück.',
    },
    {
      title: 'Was Kunstfasern nehmen',
      body: 'PU, Polyester, Nylon und andere Kunststoffgewebe stammen aus der Petrochemie. Sie stauen Wärme und Feuchtigkeit auf der Haut, setzen beim Tragen und Waschen Mikroplastik frei und sind oft mit Chemikalien ausgerüstet, die täglich stundenlang auf Ihrer Haut liegen. Über Jahre kann das zu Hautreizungen und Unbehagen führen; was langer Kontakt mit Kunststoff im Körper bewirkt, wird noch erforscht. Ein Stoff ohne Leben dämpft Ihre Energie, statt sie zu heben. Deshalb verwenden wir keinen.',
    },
  ],
  eyebrowCloth: 'Der Stoff',
  clothH: 'Seide, Leinen und hochfrequente Stoffe. Mehr kommt nicht ins Haus.',
  clothP1:
    'Erstklassige Seide, erstklassiges Leinen und hochfrequente Stoffe, sonst nichts: kein Polyester, kein synthetisches Gewebe. Kunstfaser ist billiger zu verarbeiten und hält die Bügelfalte länger, und genau deshalb besteht so viel Kleidung daraus.',
  clothP2:
    'Naturfaser bewegt sich, knittert und altert. Ein Leinenhemd, das einen Sommer lang getragen wurde, sieht danach nicht mehr aus wie auf dem Foto, und das ist ihr Reiz. Seide, Leinen und hochfrequente Stoffe liegen leicht auf der Haut, deshalb steht der Tragekomfort an erster Stelle.',
  statCloth: 'Seide, Leinen oder hochfrequenter Stoff',
  statDesigns: (season) => (season ? `Entwürfe in ${season}` : 'Entwürfe in dieser Saison'),
};

const HOME_FR: HomeCopy = {
  title: 'LINSILK | Vêtements sur mesure en soie, en lin et en tissus à haute fréquence, depuis Genève',
  description: (colours, from) =>
    `LINSILK réalise des vêtements en soie, en lin et en tissus à haute fréquence, à vos mesures, en 2 à 4 semaines. ${colours}${from}. Sans essayage. Depuis Genève.`,
  kicker: 'Vêtements sur mesure en soie, en lin et en tissus à haute fréquence, depuis Genève',
  heroLines: ['Un style d’exception,', 'fait pour vous.', 'Sur mesure.', 'Lin · Soie · Cachemire'],
  women: 'Collection femme',
  men: 'Collection homme',
  introH: 'Comment commander',
  introLead:
    'LINSILK est une maison genevoise de vêtements sur mesure qui travaille la soie, le lin et les tissus à haute fréquence. Vous choisissez une pièce, son coloris parmi les échantillons de l’étoffe, vous saisissez vos mesures, et elle est coupée et cousue pour vous en deux à quatre semaines.',
  steps: (silk, linen, cashmere) => [
    'Choisissez une pièce dans la collection femme ou homme.',
    `Choisissez son coloris : ${silk} en soie, ${linen} en lin, ${cashmere} en cachemire.`,
    'Saisissez vos mesures. Pas d’essayage : vous vous mesurez vous-même, ou vous confiez notre guide à un tailleur de votre choix.',
    'Après confirmation de votre fiche, la pièce est coupée et cousue en deux à quatre semaines, puis expédiée avec suivi.',
  ],
  introCta: 'Comment fonctionne le sur-mesure',
  pillars: [
    {
      title: 'Des matières d’exception',
      body: 'Soie, lin et tissus à haute fréquence de première qualité, choisis pour ce qu’ils font ressentir sur la peau avant ce qu’ils donnent à voir sur un cintre. Chaque vêtement LINSILK est en 100 % soie, 100 % lin ou en tissus à haute fréquence : ni polyester, ni tissu synthétique.',
    },
    {
      title: 'À votre coupe, à vos mesures',
      body: 'Pas de tableau des tailles, pas de « taille la plus proche ». Chaque pièce n’est coupée qu’une fois vos mesures reçues : elle tombe et bouge avec votre corps, et avec aucun autre.',
    },
    {
      title: 'Un tissu à haute fréquence qui élève',
      body: 'Une étoffe naturelle, issue d’une fibre vivante, légère sur le corps et paisible à porter. Nous la façonnons pour qu’elle fasse plus que bien tomber : qu’elle élève ce que vous ressentez et votre façon de vous tenir.',
    },
  ],
  seasonH: 'Cette saison',
  seasonRail: 'Cette saison',
  railHint: 'Faites glisser, faites défiler ou utilisez les flèches pour parcourir la saison',
  eyebrowDesign: 'Créer sa pièce',
  designH: 'Une pièce qui existe parce que vous l’avez imaginée.',
  designBody:
    'Vous choisissez une silhouette de base et l’étoffe, vous écrivez au tailleur ce que vous souhaitez, vous envoyez vos mesures. Un seul vêtement est alors réalisé selon votre demande. C’est la seule voie où le modèle est à vous avant d’être à nous.',
  designCta: 'Commencer une commande',
  designAlt: 'Une soie marquée à la craie d’un patron, avec ciseaux, épingles et fil',
  eyebrowAtelier: 'L’atelier',
  atelierH: 'Des vêtements comme ils auraient toujours dû être faits.',
  atelierBody:
    'LINSILK ne fait ni vêtements fabriqués en série, ni qualité médiocre, ni synthétique. Chaque pièce est réalisée à vos propres mesures : c’est le vêtement qui suit votre corps, et non l’inverse. C’est cette coupe qui permet à la soie, au lin et aux tissus à haute fréquence, lisses et respirants, de faire ce qu’ils font de mieux : se poser légèrement sur la peau, bouger avec vous et rester agréables de la première heure à la dernière.',
  atelierAlts: ['Des mains cousent à la main une soie fleurie', 'Des mains épinglent un haut en soie sur un mannequin'],
  chalk: 'épaule · 41',
  eyebrowFreq: 'Haute fréquence',
  freqH: 'Ce que nous entendons par haute fréquence.',
  freq: [
    {
      title: 'Tout est énergie',
      body: 'La physique le sait depuis un siècle : selon le E = mc² d’Einstein, la matière est de l’énergie très concentrée. Observez de près une pierre, une main, un coupon de soie : vous y trouvez des atomes presque entièrement vides, composés de particules que l’on décrit au mieux comme des vibrations de champs. Ce qui semble solide est de l’énergie condensée.',
    },
    {
      title: 'Toute énergie a une fréquence',
      body: 'L’énergie vibre, chaque forme à sa manière : la lumière, le son, la chaleur, l’activité de votre corps. Un tissu reste contre votre peau toute la journée, il fait donc partie de cet ensemble. Un vêtement LINSILK ne se contente pas d’être confortable : il élève votre fréquence naturelle. La soie, le lin et le cachemire viennent d’êtres vivants, le ver à soie, le lin cultivé et la chèvre du Cachemire, et ils portent cette vie jusque dans le vêtement.',
    },
    {
      title: 'Ce que retirent les fibres synthétiques',
      body: 'Le PU, le polyester, le nylon et les autres tissus à base de plastique sont fabriqués à partir de produits pétrochimiques. Ils retiennent la chaleur et l’humidité contre la peau, libèrent des microfibres de plastique au porté comme au lavage, et sont souvent traités avec des produits de finition qui restent des heures par jour sur votre peau. Au fil des années, cela peut provoquer irritations et inconfort ; les effets d’un contact prolongé avec le plastique sur l’organisme font encore l’objet de recherches. Un tissu sans vie étouffe votre énergie au lieu de l’élever : c’est pourquoi nous n’en utilisons aucun.',
    },
  ],
  eyebrowCloth: 'Le tissu',
  clothH: 'Soie, lin et tissus à haute fréquence. Rien d’autre n’entre ici.',
  clothP1:
    'De la soie, du lin et des tissus à haute fréquence de première qualité, et rien d’autre : ni polyester, ni tissu synthétique. La fibre synthétique coûte moins cher à coudre et tient mieux le pli, c’est précisément pour cela que tant de vêtements en sont faits.',
  clothP2:
    'La fibre naturelle bouge, se froisse, vieillit. Une chemise en lin portée tout un été n’aura plus l’allure de la photo, et c’est ce qui en fait le charme. La soie, le lin et les tissus à haute fréquence se posent légèrement sur la peau : voilà pourquoi le confort passe d’abord.',
  statCloth: 'soie, lin ou tissu à haute fréquence',
  statDesigns: (season) => (season ? `modèles en ${season}` : 'modèles cette saison'),
};

export const homeCopy = (lang: Lang): HomeCopy => {
  if (lang === 'en') return HOME_EN;
  return lang === 'fr' ? HOME_FR : HOME_DE;
};
