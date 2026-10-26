/* The home page's words in each language (docs/seo/COPY-PAGES.md §2). English
 * is the source; German and French are for a native-speaker pass before they
 * go live (docs/seo/SEO-GEO-PLAN.md §13.7). */

import { deepDe, type Lang } from './i18n';

export type HomeCopy = {
  title: string;
  description: (colours: string, from: string) => string;
  kicker: string;
  heroLines: [string, string, string];
  women: string;
  men: string;
  introH: string;
  introLead: string;
  steps: (silk: number, linen: number) => string[];
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
  title: 'LINSILK | Made-to-measure silk and linen clothing from Geneva',
  description: (colours, from) =>
    `LINSILK makes silk and linen clothing to your own measurements in 2–4 weeks. ${colours}${from}. No fittings needed. From Geneva.`,
  kicker: 'Made-to-measure silk and linen clothing, from Geneva',
  heroLines: ['Cut from silk.', 'Woven by hand.', 'Fitted to you.'],
  women: 'Women’s collection',
  men: 'Men’s collection',
  introH: 'How ordering works',
  introLead:
    'LINSILK is a made-to-measure silk and linen clothing house based in Geneva, Switzerland. You choose a piece, choose its colour from swatches of the cloth, enter your own measurements, and it is cut and sewn for you in 2–4 weeks.',
  steps: (silk, linen) => [
    'Choose a piece from the women’s or men’s collection.',
    `Choose its colour: ${silk} silk colours, ${linen} linen colours.`,
    'Enter your measurements. No fittings: measure yourself, or take the guide to any tailor.',
    'It is cut and sewn in 2–4 weeks from your confirmed sheet, then sent with tracking.',
  ],
  introCta: 'How made-to-measure works',
  pillars: [
    {
      title: 'Luxury, premium-quality material',
      body: 'Silk and linen of the finest grade, chosen for how they feel against the skin before how they look on a hanger. Every LINSILK garment is made in 100% silk or 100% linen cloth: no polyester and no blended cloth.',
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
    'Choose a base silhouette, choose the cloth, write to the tailor, submit your measurements. The atelier builds one garment to that brief. It is the only path where the design is yours before it is ours.',
  designCta: 'Begin a commission',
  designAlt: 'Silk chalked with a pattern, with shears, pins and thread',
  eyebrowAtelier: 'The Atelier',
  atelierH: 'Clothes made the way they were always meant to be had.',
  atelierBody:
    'LINSILK does not make mass-produced, low-grade, synthetic clothing. Each piece is made to your own measurements, so the garment follows your body instead of asking your body to follow it. That fit is what lets smooth, breathable silk and linen do what they do best: rest lightly on the skin, move with you, and stay comfortable from the first hour to the last.',
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
      body: 'Energy vibrates, and each kind vibrates differently: light, sound, heat, and the activity of your own body. Cloth lies against you all day, so we believe it belongs in that picture. We want our clothes not only to feel comfortable but to raise your natural frequency. Silk and linen come from living things, the silkworm and the flax plant, and we hold that they carry that life into the garment.',
    },
    {
      title: 'What synthetics take away',
      body: 'PU, polyester, nylon and other plastic-based fabrics are made from petrochemicals. They trap heat and moisture against the skin, shed microplastic fibres as they are worn and washed, and often carry finishing chemicals that sit on your skin for hours a day. Over years, that can mean irritation and discomfort, and the effect of long plastic exposure on the body is still being studied. In our view a cloth with no life in it dulls your energy rather than lifting it, which is why we use none.',
    },
  ],
  eyebrowCloth: 'The Cloth',
  clothH: 'Silk and linen. Nothing else enters the room.',
  clothP1:
    'Premium silk and premium linen, and nothing else: no polyester and no blended cloth. Synthetic fibre is cheaper to sew and it holds a press longer, which is precisely why so much clothing is made from it.',
  clothP2:
    'Natural fibre moves, creases and ages. A linen shirt worn through one summer will not look the way it looked in the photograph, and that is the point of it. Silk and linen breathe and rest lightly on the skin, which is why comfort comes first.',
  statCloth: 'silk or linen cloth',
  statDesigns: (season) => (season ? `designs in ${season}` : 'designs this season'),
};

const HOME_DE_CH: HomeCopy = {
  title: 'LINSILK | Kleidung aus Seide und Leinen nach Mass, aus Genf',
  description: (colours, from) =>
    `LINSILK fertigt Kleidung aus Seide und Leinen nach Ihren eigenen Massen, innert 2–4 Wochen. ${colours}${from}. Ohne Anprobe. Aus Genf.`,
  kicker: 'Kleidung aus Seide und Leinen nach Mass, aus Genf',
  heroLines: ['Aus Seide geschnitten.', 'Von Hand gewebt.', 'Auf Sie abgestimmt.'],
  women: 'Damenkollektion',
  men: 'Herrenkollektion',
  introH: 'So funktioniert die Bestellung',
  introLead:
    'LINSILK ist ein Genfer Modehaus für Seide und Leinen nach Mass. Sie wählen ein Stück, wählen seine Farbe aus Mustern des Stoffs, geben Ihre eigenen Masse ein, und es wird innert 2–4 Wochen für Sie zugeschnitten und genäht.',
  steps: (silk, linen) => [
    'Wählen Sie ein Stück aus der Damen- oder Herrenkollektion.',
    `Wählen Sie seine Farbe: ${silk} Seidenfarben, ${linen} Leinenfarben.`,
    'Geben Sie Ihre Masse ein. Ohne Anprobe: Sie messen selbst, oder Sie gehen mit der Anleitung zu einer beliebigen Schneiderei.',
    'Es wird in 2–4 Wochen ab Ihrem bestätigten Blatt zugeschnitten und genäht und dann mit Sendungsverfolgung versandt.',
  ],
  introCta: 'So funktioniert Nach-Mass',
  pillars: [
    {
      title: 'Luxuriöses Material von höchster Qualität',
      body: 'Seide und Leinen von feinster Güte, ausgewählt dafür, wie sie sich auf der Haut anfühlen, bevor es darum geht, wie sie am Bügel aussehen. Jedes LINSILK-Kleidungsstück ist aus 100 % Seide oder 100 % Leinen gefertigt: kein Polyester und kein Mischgewebe.',
    },
    {
      title: 'Nach Ihrer Passform und Ihren Massen',
      body: 'Keine Grössentabelle, keine nächstgelegene Grösse. Jedes Stück wird zugeschnitten, nachdem Sie Ihre Masse gesendet haben, sodass es mit Ihrem Körper sitzt, fällt und sich bewegt und mit keinem anderen.',
    },
    {
      title: 'Hochfrequenter Stoff, der Sie aufrichtet',
      body: 'Naturstoff aus lebender Faser, leicht auf dem Körper und ruhig zu tragen. Wir fertigen ihn, damit er mehr tut, als sich gut anzufühlen: Er soll heben, wie Sie sich fühlen und wie Sie sich bewegen.',
    },
  ],
  seasonH: 'Diese Saison',
  seasonRail: 'Diese Saison',
  railHint: 'Ziehen, scrollen oder die Pfeile nutzen, um durch die Saison zu blättern',
  eyebrowDesign: 'Selbst entwerfen',
  designH: 'Ein Stück, das existiert, weil Sie es beschrieben haben.',
  designBody:
    'Wählen Sie eine Grundsilhouette, wählen Sie den Stoff, schreiben Sie der Schneiderin oder dem Schneider, senden Sie Ihre Masse. Das Atelier baut ein Kleidungsstück nach diesem Auftrag. Es ist der einzige Weg, auf dem der Entwurf Ihnen gehört, bevor er uns gehört.',
  designCta: 'Einen Auftrag beginnen',
  designAlt: 'Seide mit aufgezeichnetem Schnittmuster, dazu Schere, Nadeln und Faden',
  eyebrowAtelier: 'Das Atelier',
  atelierH: 'Kleidung, so gefertigt, wie sie immer gedacht war.',
  atelierBody:
    'LINSILK fertigt keine massenproduzierte, minderwertige, synthetische Kleidung. Jedes Stück wird nach Ihren eigenen Massen gefertigt, sodass das Kleidungsstück Ihrem Körper folgt, statt zu verlangen, dass Ihr Körper ihm folgt. Diese Passform lässt glatte, atmungsaktive Seide und Leinen tun, was sie am besten können: leicht auf der Haut liegen, sich mit Ihnen bewegen und von der ersten bis zur letzten Stunde angenehm bleiben.',
  atelierAlts: ['Hände, die eine Blumenseide von Hand nähen', 'Hände, die ein Seidenoberteil an einer Schneiderpuppe feststecken'],
  chalk: 'Schulter · 41',
  eyebrowFreq: 'Hohe Frequenz',
  freqH: 'Was wir mit hoher Frequenz meinen.',
  freq: [
    {
      title: 'Alles ist Energie',
      body: 'Die Physik sagt es seit einem Jahrhundert. Einsteins E = mc² zeigt, dass Masse Energie in sehr dichter Form ist. Betrachten Sie alles, was Sie berühren können, einen Stein, eine Hand, ein Stück Seide, genau, und Sie finden Atome, die fast vollständig leerer Raum sind, aus Teilchen, die sich am besten als Schwingungen in zugrunde liegenden Feldern beschreiben lassen. Was fest wirkt, ist verdichtete Energie.',
    },
    {
      title: 'Jede Energie hat eine Frequenz',
      body: 'Energie schwingt, und jede Art schwingt anders: Licht, Schall, Wärme und die Aktivität Ihres eigenen Körpers. Stoff liegt den ganzen Tag an Ihnen an, darum gehört er unserer Überzeugung nach in dieses Bild. Wir möchten, dass unsere Kleidung sich nicht nur angenehm anfühlt, sondern Ihre natürliche Frequenz anhebt. Seide und Leinen stammen von lebenden Wesen, der Seidenraupe und der Flachspflanze, und wir sind überzeugt, dass sie dieses Leben in das Kleidungsstück tragen.',
    },
    {
      title: 'Was Synthetik nimmt',
      body: 'PU, Polyester, Nylon und andere Stoffe auf Kunststoffbasis werden aus Petrochemikalien hergestellt. Sie stauen Wärme und Feuchtigkeit auf der Haut, geben beim Tragen und Waschen Mikroplastikfasern ab und tragen oft Ausrüstungschemikalien, die stundenlang täglich auf Ihrer Haut liegen. Über Jahre kann das Reizungen und Unwohlsein bedeuten, und die Wirkung langer Kunststoffbelastung auf den Körper wird noch erforscht. Unserer Ansicht nach dämpft ein Stoff ohne Leben Ihre Energie, statt sie zu heben, weshalb wir keinen verwenden.',
    },
  ],
  eyebrowCloth: 'Der Stoff',
  clothH: 'Seide und Leinen. Sonst kommt nichts in den Raum.',
  clothP1:
    'Erstklassige Seide und erstklassiges Leinen, und sonst nichts: kein Polyester und kein Mischgewebe. Synthetische Faser ist günstiger zu nähen und hält die Bügelfalte länger, und genau deshalb wird so viel Kleidung daraus gefertigt.',
  clothP2:
    'Naturfaser bewegt sich, knittert und altert. Ein Leinenhemd, das einen Sommer lang getragen wurde, sieht nicht mehr so aus wie auf dem Foto, und darin liegt sein Sinn. Seide und Leinen atmen und liegen leicht auf der Haut, weshalb Komfort an erster Stelle steht.',
  statCloth: 'Seiden- oder Leinenstoff',
  statDesigns: (season) => (season ? `Entwürfe in ${season}` : 'Entwürfe diese Saison'),
};

const HOME_FR: HomeCopy = {
  title: 'LINSILK | Vêtements en soie et en lin sur mesure, depuis Genève',
  description: (colours, from) =>
    `LINSILK réalise des vêtements en soie et en lin à vos propres mesures en 2 à 4 semaines. ${colours}${from}. Sans essayage. Depuis Genève.`,
  kicker: 'Vêtements en soie et en lin sur mesure, depuis Genève',
  heroLines: ['Taillé dans la soie.', 'Tissé à la main.', 'Ajusté à vous.'],
  women: 'Collection femme',
  men: 'Collection homme',
  introH: 'Comment commander',
  introLead:
    'LINSILK est une maison genevoise de vêtements sur mesure en soie et en lin. Vous choisissez une pièce, son coloris parmi des échantillons du tissu, vous indiquez vos propres mesures, et elle est coupée et cousue pour vous en 2 à 4 semaines.',
  steps: (silk, linen) => [
    'Choisissez une pièce dans la collection femme ou homme.',
    `Choisissez son coloris : ${silk} coloris de soie, ${linen} coloris de lin.`,
    'Indiquez vos mesures. Sans essayage : vous vous mesurez vous-même, ou vous emportez le guide chez n’importe quel tailleur.',
    'Elle est coupée et cousue en 2 à 4 semaines à partir de votre fiche confirmée, puis envoyée avec suivi.',
  ],
  introCta: 'Comment fonctionne le sur-mesure',
  pillars: [
    {
      title: 'Une matière de luxe, de qualité supérieure',
      body: 'Soie et lin de la plus belle qualité, choisis pour ce qu’ils font sentir sur la peau avant ce qu’ils donnent à voir sur un cintre. Chaque vêtement LINSILK est fait en 100 % soie ou 100 % lin : ni polyester ni tissu mélangé.',
    },
    {
      title: 'Fait à votre coupe et à vos mesures',
      body: 'Pas de guide des tailles, pas de taille la plus proche. Chaque pièce est coupée après l’envoi de vos mesures, afin qu’elle tombe et bouge avec votre corps, et avec aucun autre.',
    },
    {
      title: 'Un tissu à haute fréquence qui vous élève',
      body: 'Un tissu naturel issu d’une fibre vivante, léger sur le corps et apaisant à porter. Nous le faisons pour qu’il fasse plus que bien se sentir : qu’il élève ce que vous ressentez et la façon dont vous vous portez.',
    },
  ],
  seasonH: 'Cette saison',
  seasonRail: 'Cette saison',
  railHint: 'Faites glisser, défilez ou utilisez les flèches pour parcourir la saison',
  eyebrowDesign: 'Créer votre pièce',
  designH: 'Une pièce qui existe parce que vous l’avez décrite.',
  designBody:
    'Choisissez une silhouette de base, choisissez le tissu, écrivez au tailleur, envoyez vos mesures. L’atelier construit un vêtement selon ce brief. C’est la seule voie où le modèle est à vous avant d’être à nous.',
  designCta: 'Commencer une commande',
  designAlt: 'Soie marquée à la craie d’un patron, avec ciseaux, épingles et fil',
  eyebrowAtelier: 'L’atelier',
  atelierH: 'Des vêtements faits comme ils auraient toujours dû l’être.',
  atelierBody:
    'LINSILK ne fait pas de vêtements produits en série, de qualité médiocre et synthétiques. Chaque pièce est faite à vos propres mesures, si bien que le vêtement suit votre corps au lieu de demander à votre corps de le suivre. C’est cette coupe qui laisse la soie et le lin, lisses et respirants, faire ce qu’ils font de mieux : reposer légèrement sur la peau, bouger avec vous et rester confortables de la première heure à la dernière.',
  atelierAlts: ['Des mains cousant à la main une soie à fleurs', 'Des mains épinglant un haut en soie sur un mannequin'],
  chalk: 'épaule · 41',
  eyebrowFreq: 'Haute fréquence',
  freqH: 'Ce que nous entendons par haute fréquence.',
  freq: [
    {
      title: 'Tout est énergie',
      body: 'La physique le dit depuis un siècle. Le E = mc² d’Einstein montre que la masse est de l’énergie sous une forme très dense. Regardez de près tout ce que vous pouvez toucher, une pierre, une main, une longueur de soie, et vous trouvez des atomes presque entièrement vides, faits de particules que l’on décrit au mieux comme des vibrations de champs sous-jacents. Ce qui paraît solide est de l’énergie condensée.',
    },
    {
      title: 'Toute énergie a une fréquence',
      body: 'L’énergie vibre, et chaque forme vibre différemment : la lumière, le son, la chaleur et l’activité de votre propre corps. Le tissu reste contre vous toute la journée, nous pensons donc qu’il a sa place dans ce tableau. Nous voulons que nos vêtements soient non seulement confortables, mais qu’ils élèvent votre fréquence naturelle. La soie et le lin viennent d’êtres vivants, le ver à soie et le lin cultivé, et nous tenons qu’ils portent cette vie dans le vêtement.',
    },
    {
      title: 'Ce que les synthétiques enlèvent',
      body: 'Le PU, le polyester, le nylon et les autres tissus à base de plastique sont faits à partir de produits pétrochimiques. Ils retiennent la chaleur et l’humidité contre la peau, libèrent des microfibres de plastique quand on les porte et les lave, et portent souvent des produits de finition qui restent des heures par jour sur votre peau. Sur des années, cela peut signifier irritation et inconfort, et l’effet d’une longue exposition au plastique sur le corps est encore à l’étude. À notre avis, un tissu sans vie amortit votre énergie au lieu de l’élever, et c’est pourquoi nous n’en utilisons aucun.',
    },
  ],
  eyebrowCloth: 'Le tissu',
  clothH: 'La soie et le lin. Rien d’autre n’entre dans la pièce.',
  clothP1:
    'Une soie et un lin de première qualité, et rien d’autre : ni polyester ni tissu mélangé. La fibre synthétique coûte moins cher à coudre et tient mieux le pli, et c’est précisément pourquoi tant de vêtements en sont faits.',
  clothP2:
    'La fibre naturelle bouge, se froisse et vieillit. Une chemise en lin portée tout un été ne ressemblera plus à ce qu’elle était sur la photo, et c’est tout son intérêt. La soie et le lin respirent et reposent légèrement sur la peau, c’est pourquoi le confort passe en premier.',
  statCloth: 'tissu de soie ou de lin',
  statDesigns: (season) => (season ? `modèles en ${season}` : 'modèles cette saison'),
};

export const homeCopy = (lang: Lang): HomeCopy => {
  if (lang === 'en') return HOME_EN;
  if (lang.startsWith('fr')) return HOME_FR;
  return lang === 'de' ? deepDe(HOME_DE_CH) : HOME_DE_CH;
};
