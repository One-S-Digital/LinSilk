/* Le guide d’entretien en français. Écrit comme une maison de soie, de lin et
 * de cachemire parle à ses clientes et à ses clients : vouvoiement, phrases
 * courtes, le vocabulaire courant de l’entretien des textiles (lessive pour
 * le délicat, programme laine, pressing, repassage à la vapeur). Il n’est pas
 * traduit de l’anglais ; les règles sont les mêmes que dans care-guide.ts
 * (docs/care/CARE-GUIDE-PLAN.md §0). */

import type { CareCopy, ClothCare } from './care-guide';

const silk: ClothCare = {
  name: 'Soie',
  forCloth: 'la soie',
  feel: 'Fluide, fraîche, légère sur la peau',
  texture: '/swatches/silk/LS-S07.webp',
  glance: [
    { icon: 'washHand', label: 'À la main, 30°' },
    { icon: 'noBleach', label: 'Pas de javel' },
    { icon: 'dryFlatShade', label: 'À plat, à l’ombre' },
    { icon: 'noTumble', label: 'Pas de sèche-linge' },
    { icon: 'iron1', label: 'Fer doux' },
    { icon: 'dryCleanP', label: 'Pressing possible' },
  ],
  rules: [
    'Toujours de l’eau fraîche et une lessive pour la soie.',
    'On presse l’eau, on ne tord jamais.',
    'Laissez le parfum et le déodorant sécher avant de vous habiller.',
  ],
  notice: {
    title: 'Soie jacquard ou brocart ?',
    body: 'Les soies à motif tissé se confient uniquement à un pressing. Le motif est dans le tissage même, et un lavage à la maison peut le faire gondoler ou glisser. Les gestes ci-dessous valent pour la soie unie.',
  },
  washH: 'Le lavage à la main',
  washIntro: 'Cinq minutes tranquilles au lavabo suffisent à la soie unie.',
  wash: [
    { icon: 'basin', title: 'Eau fraîche', body: 'Remplissez une bassine propre d’eau fraîche, à 30 °C au plus.' },
    { icon: 'bottle', title: 'Un peu de lessive pour soie', body: 'Un bouchon de lessive au pH neutre, conçue pour la soie. Sans enzymes, sans javel, sans adoucissant.' },
    { icon: 'swirl', title: 'À l’envers, tout doucement', body: 'Retournez la pièce et faites-la circuler dans l’eau pendant trois à cinq minutes. Sans frotter.' },
    { icon: 'rinse', title: 'Rincez à l’eau fraîche', body: 'Rincez dans une eau claire et fraîche jusqu’à disparition de toute trace de savon.' },
    { icon: 'pressPalms', title: 'Pressez, ne tordez pas', body: 'Pressez l’eau entre les paumes, à plat. La soie mouillée se fragilise si on la tord.' },
    { icon: 'towelRoll', title: 'Roulez dans une serviette', body: 'Posez-la sur une serviette propre, roulez, puis pressez une dernière fois pour absorber l’humidité.' },
  ],
  washAlt: {
    title: 'En machine, si le temps manque',
    body: 'Ce n’est pas le premier choix, mais c’est possible pour la soie unie : programme délicat à 30 °C, dans un filet de lavage, essorage minimal, avec d’autres soies seulement. Sortez la pièce dès la fin du cycle.',
  },
  dry: [
    { icon: 'dryFlat', text: 'Séchez-la à plat sur une serviette sèche, ou sur un cintre rembourré.' },
    { icon: 'shade', text: 'À l’intérieur ou à l’ombre, loin du soleil et des radiateurs.' },
    { icon: 'clock', text: 'La soie sèche vite : quelques heures suffisent le plus souvent.' },
  ],
  dryNever: 'Jamais au sèche-linge',
  heat: 1,
  heatLabel: 'Doux, le réglage soie',
  press: [
    { icon: 'insideOut', text: 'À l’envers, et seulement lorsque la soie est parfaitement sèche.' },
    { icon: 'pressCloth', text: 'Glissez un linge fin en coton entre le fer et la soie.' },
    { icon: 'noSpray', text: 'Pas de vaporisateur : les gouttes peuvent marquer la soie.' },
    { icon: 'steamer', text: 'Le défroisseur vapeur, à une largeur de main, est le plus simple au quotidien.' },
  ],
  wear: [
    { icon: 'perfume', text: 'D’abord le parfum, la laque et le déodorant ; la robe ensuite, une fois tout sec.' },
    { icon: 'air', text: 'Après une soirée, aérez-la sur un cintre plutôt que de la laver à chaque fois.' },
    { icon: 'rest', text: 'Laissez-la reposer un jour entre deux sorties : les fibres reprennent leur place.' },
    { icon: 'sun', text: 'Évitez les longues heures de plein soleil, qui font pâlir la soie avec le temps.' },
  ],
  store: {
    method: 'padded',
    label: 'Sur un cintre rembourré',
    tips: [
      { icon: 'hangerPadded', text: 'Robes et chemisiers sur cintres rembourrés, boutons fermés.' },
      { icon: 'bag', text: 'Les robes du soir dans une housse en coton qui respire, jamais en plastique.' },
      { icon: 'dark', text: 'Un placard frais, sombre et sec, avec un peu d’espace autour de chaque pièce.' },
    ],
  },
  keep: [
    'Une eau fraîche, 30 °C au plus',
    'Une lessive au pH neutre pour la soie',
    'Presser, puis rouler dans une serviette',
    'Fer doux, à l’envers, avec un linge',
    'Cintres rembourrés, housses en coton',
  ],
  avoid: [
    'Eau chaude, javel, adoucissant, enzymes',
    'Tordre, frotter, gratter une tache',
    'Sèche-linge et radiateurs',
    'Vaporiser de l’eau en repassant',
    'Housses en plastique et plein soleil',
  ],
};

const linen: ClothCare = {
  name: 'Lin',
  forCloth: 'le lin',
  feel: 'Aérien, net, plus doux à chaque lavage',
  texture: '/swatches/linen/LS-L04.webp',
  glance: [
    { icon: 'dryCleanP', label: '1er lavage : pressing' },
    { icon: 'wash30Gentle', label: 'Ensuite 30°, délicat' },
    { icon: 'noBleach', label: 'Pas de javel' },
    { icon: 'lineDryShade', label: 'Sécher sur cintre' },
    { icon: 'noTumble', label: 'Pas de sèche-linge' },
    { icon: 'iron2', label: 'Fer moyen' },
  ],
  rules: [
    'Le premier lavage se fait chez un professionnel.',
    'Ensuite : 30 °C, cycle délicat, sans sèche-linge.',
    'Repassez le lin lorsqu’il est encore légèrement humide.',
  ],
  notice: {
    title: 'Le premier lavage, c’est au pressing',
    body: 'Le lin se resserre surtout au premier lavage, et le lin LINSILK n’est pas prélavé. Lavé chez vous dès la première fois, il peut perdre quelques centimètres, et avec eux la coupe réalisée à vos mesures. Confiez-le une première fois à un pressing, pour un nettoyage délicat. Dès le deuxième lavage, tout se fait à la maison.',
  },
  washH: 'À partir du deuxième lavage',
  washIntro: 'Le lin est le plus simple des trois, et il s’adoucit à chaque lavage.',
  wash: [
    { icon: 'insideOut', title: 'Fermez, retournez', body: 'Fermez les boutons, videz les poches et retournez la pièce.' },
    { icon: 'meshBag', title: 'Dans un filet', body: 'Dans un filet, boutons et coutures ne s’accrochent pas au tambour.' },
    { icon: 'wash30Gentle', title: 'Délicat, 30 °C', body: 'Un cycle délicat à 30 °C avec une lessive douce. Sans javel.' },
    { icon: 'similar', title: 'Avec du semblable', body: 'Lavez-le avec du lin ou du coton de teinte voisine, sans surcharger le tambour.' },
    { icon: 'shake', title: 'Secouez', body: 'À la sortie de la machine, secouez-le franchement et lissez les coutures du plat de la main.' },
    { icon: 'hangerWide', title: 'Sur cintre, à l’ombre', body: 'Faites-le sécher sur un cintre large, à l’ombre. Un lavage à la main à l’eau fraîche convient tout aussi bien.' },
  ],
  dry: [
    { icon: 'hangerWide', text: 'Chemises et vestes sur un cintre large, pantalons suspendus par la ceinture.' },
    { icon: 'shade', text: 'À l’ombre ou à l’intérieur : un soleil fort peut faire pâlir le lin foncé.' },
    { icon: 'clock', text: 'Si vous repassez, retirez-le du fil quand il est juste humide.' },
  ],
  dryNever: 'Jamais au sèche-linge',
  heat: 2,
  heatLabel: 'Moyen, tant qu’il est encore humide',
  press: [
    { icon: 'insideOut', text: 'Repassez à l’envers, surtout le lin foncé, pour éviter qu’il ne brille.' },
    { icon: 'spray', text: 'Déjà sec ? Vaporisez légèrement et patientez cinq minutes.' },
    { icon: 'steamer', text: 'Le défroisseur assouplit vite les plis, sans rendre le lin aussi net qu’un fer.' },
    { icon: 'crease', text: 'Quelques plis reviendront avant midi. C’est la nature du lin.' },
  ],
  wear: [
    { icon: 'crease', text: 'Les plis font partie de l’aisance du lin ; ils s’adoucissent en bougeant.' },
    { icon: 'air', text: 'Aérez-le pendant la nuit : le lin retrouve vite sa fraîcheur.' },
    { icon: 'sun', text: 'Pensé pour les journées chaudes, les terrasses et les longs déjeuners.' },
    { icon: 'perfume', text: 'Laissez le parfum sécher avant de vous habiller, surtout sur du lin clair.' },
  ],
  store: {
    method: 'wide',
    label: 'Sur un cintre large',
    tips: [
      { icon: 'hangerWide', text: 'Chemises et vestes sur des cintres larges qui soutiennent l’épaule.' },
      { icon: 'fold', text: 'Pantalons pliés sans serrer, dans le sens du pli.' },
      { icon: 'bag', text: 'Pour l’hiver : propre, dans un sac en coton, jamais dans un plastique hermétique.' },
    ],
  },
  keep: [
    'Un premier lavage chez un professionnel',
    '30 °C, cycle délicat, filet de lavage',
    'Secouer et sécher à l’ombre',
    'Repasser humide, à l’envers',
    'Cintres larges et un peu d’air dans le placard',
  ],
  avoid: [
    'Un premier lavage à la maison',
    'Eau chaude et javel',
    'Le sèche-linge',
    'Repasser le lin foncé à l’endroit',
    'Un plastique hermétique pour le rangement longue durée',
  ],
};

const cashmere: ClothCare = {
  name: 'Cachemire',
  forCloth: 'le cachemire',
  feel: 'Doux, chaud, bien coupé',
  texture: '/swatches/cashmere/LS-C05.webp',
  glance: [
    { icon: 'washHand', label: 'À la main, 30°' },
    { icon: 'wash30Wool', label: 'Ou programme laine, 30°' },
    { icon: 'noBleach', label: 'Pas de javel' },
    { icon: 'dryFlat', label: 'Sécher à plat' },
    { icon: 'noTumble', label: 'Pas de sèche-linge' },
    { icon: 'iron2', label: 'Fer avec un linge' },
  ],
  rules: [
    'Brossez et aérez entre deux ports ; lavez seulement au besoin.',
    'La même eau fraîche, du lavage au rinçage.',
    'Séchez à plat, puis retracez le pli avec un linge.',
  ],
  washH: 'Le lavage à la main',
  washIntro: 'Le cachemire se lave bien moins souvent qu’on ne le croit. Quand il le faut : eau fraîche et mains douces.',
  wash: [
    { icon: 'basin', title: 'Eau fraîche', body: 'Une bassine d’eau fraîche, à 30 °C au plus, et le pantalon retourné.' },
    { icon: 'bottle', title: 'Lessive laine et cachemire', body: 'Une lessive douce pour la laine. Les lessives courantes avec enzymes abîment la fibre.' },
    { icon: 'soak', title: 'Laissez tremper, puis pressez', body: 'Dix minutes de trempage, puis faites passer l’eau à travers la fibre en pressant doucement. Sans frotter.' },
    { icon: 'rinse', title: 'Rincez à la même température', body: 'Rincez dans une eau aussi fraîche. Un changement brutal de température resserre la fibre.' },
    { icon: 'towelRoll', title: 'Roulez dans une serviette', body: 'Soulevez-le à deux mains, posez-le sur une serviette et roulez pour en retirer l’eau.' },
    { icon: 'dryFlat', title: 'Séchez à plat, remettez en forme', body: 'Posez-le à plat, aligné sur le pli, et lissez la ceinture et les poches du plat de la main.' },
  ],
  washAlt: {
    title: 'En machine',
    body: 'Programme laine à 30 °C, dans un filet, essorage doux, puis séchage à plat. Le lavage à la main ménage mieux le pli et la ceinture ; gardez la machine pour les jours où le temps manque.',
  },
  dry: [
    { icon: 'dryFlat', text: 'À plat sur une serviette sèche, à retourner une fois ; jamais suspendu tant qu’il est mouillé.' },
    { icon: 'shade', text: 'Loin des radiateurs et du soleil, qui durcissent la fibre.' },
    { icon: 'clock', text: 'Prévoyez une journée ou plus, et ne le rangez que lorsqu’il est entièrement sec.' },
  ],
  dryNever: 'Jamais au sèche-linge',
  heat: 2,
  heatLabel: 'Réglage laine, avec un linge humide',
  press: [
    { icon: 'pressCloth', text: 'Toujours un linge de coton humide entre le fer et le cachemire.' },
    { icon: 'crease', text: 'Retracez le pli sur sa ligne ; soulevez le fer au lieu de le faire glisser.' },
    { icon: 'steamer', text: 'Entre deux ports, passez le défroisseur à l’envers, à une largeur de main.' },
    { icon: 'noShine', text: 'Un fer chaud directement sur l’étoffe la fait briller et écrase le poil.' },
  ],
  wear: [
    { icon: 'brush', text: 'Après le port, brossez doucement dans le sens du poil pour ôter la poussière.' },
    { icon: 'rest', text: 'Un jour de repos entre deux ports, et l’étoffe retrouve sa forme.' },
    { icon: 'comb', text: 'De petites bouloches au niveau des cuisses sont naturelles ; un peigne à cachemire les retire, sans en abuser.' },
    { icon: 'air', text: 'Aérer plutôt que laver : sur un cintre, près d’une fenêtre ouverte, le cachemire se rafraîchit.' },
  ],
  store: {
    method: 'clip',
    label: 'Suspendu par l’ourlet, sur un cintre à pinces',
    tips: [
      { icon: 'hangerClip', text: 'Suspendez-le par l’ourlet à un cintre à pinces ; les petits plis tombent pendant la nuit.' },
      { icon: 'cedar', text: 'Le cèdre ou la lavande dans le placard éloignent les mites.' },
      { icon: 'bag', text: 'Pour l’été : d’abord propre, puis dans un sac en coton. Vérifiez au printemps.' },
    ],
  },
  keep: [
    'Brosser et aérer entre deux ports',
    'Une eau fraîche et une lessive laine',
    'Sécher à plat, loin de la chaleur',
    'Repasser avec un linge humide',
    'Du cèdre et un rangement propre',
  ],
  avoid: [
    'Laver après chaque port',
    'L’eau chaude ou les écarts de température',
    'Tordre et le sèche-linge',
    'Un fer chaud directement sur l’étoffe',
    'Ranger une pièce portée sans l’avoir lavée',
  ],
};

const ties: ClothCare = {
  name: 'Cravates en soie',
  forCloth: 'les cravates en soie',
  feel: 'Bords roulottés, un nœud net',
  texture: '/swatches/silk/LS-J16.webp',
  glance: [
    { icon: 'noWash', label: 'Ne pas laver' },
    { icon: 'noBleach', label: 'Pas de javel' },
    { icon: 'noTumble', label: 'Pas de sèche-linge' },
    { icon: 'noIron', label: 'Ne pas repasser' },
    { icon: 'steamer', label: 'Vapeur, à distance' },
    { icon: 'dryCleanP', label: 'Pressing spécialisé' },
  ],
  rules: [
    'Défaites le nœud comme vous l’avez fait.',
    'Laissez-la reposer à plat ou roulée pendant la nuit.',
    'Jamais lavée : une tache se confie à un spécialiste.',
  ],
  washH: 'En cas de tache',
  washIntro: 'Une cravate en soie ne se lave jamais. Agissez vite, puis laissez faire un spécialiste.',
  wash: [
    { icon: 'blot', title: 'Tamponnez aussitôt', body: 'Absorbez avec un linge blanc propre ou une serviette. En tamponnant, jamais en frottant.' },
    { icon: 'noSpray', title: 'Pas d’eau', body: 'Ni eau, ni eau gazeuse sur la tache : la soie en garde une auréole.' },
    { icon: 'dryCleanP', title: 'Un pressing spécialisé', body: 'Choisissez un pressing habitué aux cravates, et demandez que les bords restent roulottés au lieu d’être aplatis.' },
  ],
  dryH: 'Après le port',
  dry: [
    { icon: 'roll', text: 'Après le port, roulez-la sans serrer ou posez-la à plat pour la nuit.' },
    { icon: 'shade', text: 'À l’abri du soleil, qui fait pâlir la soie.' },
    { icon: 'rest', text: 'Alternez vos cravates : une cravate reposée garde sa forme.' },
  ],
  dryNever: 'Jamais lavée, jamais tordue',
  heat: 0,
  heatLabel: 'Pas de fer : de la vapeur seulement',
  press: [
    { icon: 'steamer', text: 'Tenez le défroisseur à une largeur de main et laissez la vapeur agir.' },
    { icon: 'shower', text: 'Pas de défroisseur ? Suspendez-la dans la salle de bains pendant une douche chaude.' },
    { icon: 'noIron', text: 'Un fer aplatit pour de bon les bords roulottés.' },
  ],
  wear: [
    { icon: 'tie', text: 'Défaites le nœud à l’envers ; tirer le petit bout à travers l’étire la soie.' },
    { icon: 'perfume', text: 'Le parfum d’abord, la cravate ensuite.' },
    { icon: 'rest', text: 'Même une cravate portée tous les jours a droit à un jour de repos de temps en temps.' },
  ],
  store: {
    method: 'roll',
    label: 'Roulée sans serrer, dans un tiroir',
    tips: [
      { icon: 'roll', text: 'Roulez-la sans serrer à partir du petit bout et rangez-la dans un tiroir.' },
      { icon: 'tie', text: 'Ou posez-la sur un porte-cravates, jamais suspendue par la boucle à un crochet.' },
      { icon: 'travel', text: 'En voyage : roulée, glissée dans une chaussure ou dans la poche d’une valise.' },
    ],
  },
  keep: [
    'Défaire le nœud à l’envers',
    'La laisser reposer, roulée ou à plat',
    'Tamponner une tache aussitôt',
    'La vapeur, à distance',
    'Un pressing spécialisé pour cravates',
  ],
  avoid: [
    'Laver, à la main ou en machine',
    'Tirer le petit bout à travers le nœud',
    'De l’eau ou de l’eau gazeuse sur une tache',
    'Un fer chaud',
    'La suspendre par la boucle à un crochet',
  ],
};

export const CARE_FR: CareCopy = {
  CARE: { silk, linen, cashmere, ties },

  STAINS: [
    {
      key: 'wine',
      icon: 'wine',
      label: 'Vin rouge',
      linen: [
        'Tamponnez aussitôt avec un linge blanc propre. Sans frotter.',
        'Rincez la tache à l’eau froide courante, par l’envers du tissu, pour la chasser sans l’enfoncer.',
        'Lavez ensuite à 30 °C comme d’habitude, avant que la tache ne sèche.',
      ],
      delicate: [
        'Tamponnez aussitôt avec un linge blanc propre. Sans frotter et sans ajouter d’eau.',
        'Laissez sécher tel quel, sans sel, sans eau gazeuse, sans remède de grand-mère.',
        'Portez-la au pressing dans un jour ou deux en précisant qu’il s’agit de vin.',
      ],
    },
    {
      key: 'coffee',
      icon: 'coffee',
      label: 'Café ou thé',
      linen: [
        'Absorbez le liquide aussitôt.',
        'Rincez à l’eau froide, par l’envers du tissu.',
        'Lavez à 30 °C avec une lessive douce, jamais plus chaud : la chaleur fixe les tanins.',
      ],
      delicate: [
        'Absorbez aussitôt avec un linge propre et sec.',
        'Ni eau ni frottement : l’un comme l’autre étendent la tache sur la soie et le cachemire.',
        'Confiez-la à un pressing en précisant ce que c’était.',
      ],
    },
    {
      key: 'oil',
      icon: 'oil',
      label: 'Gras ou aliment',
      linen: [
        'Retirez les restes avec le dos d’une cuillère.',
        'Saupoudrez de fécule ou de talc pendant une heure pour absorber le gras, puis brossez.',
        'Lavez comme d’habitude. Un gras laissé dans le tissu peut foncer avec le temps, n’attendez pas.',
      ],
      delicate: [
        'Retirez les restes avec le dos d’une cuillère.',
        'Saupoudrez de fécule ou de talc pendant une heure, puis brossez délicatement.',
        'Ce qui reste est l’affaire du pressing.',
      ],
    },
    {
      key: 'makeup',
      icon: 'makeup',
      label: 'Maquillage',
      linen: [
        'Faites tomber la poudre en tapotant le tissu, sans l’essuyer.',
        'Pour un fond de teint ou un rouge à lèvres, tamponnez de l’extérieur vers l’intérieur avec une goutte de lessive douce sur un linge blanc humide.',
        'Rincez à l’eau fraîche et lavez comme d’habitude.',
      ],
      delicate: [
        'Secouez ou tapotez la poudre, sans frotter.',
        'Pour le rouge à lèvres ou le fond de teint, mieux vaut laisser faire un pressing.',
        'Pour la prochaine fois : habillez-vous d’abord, maquillez-vous ensuite, avec un foulard sur le décolleté.',
      ],
    },
    {
      key: 'deodorant',
      icon: 'deodorant',
      label: 'Déodorant',
      linen: [
        'Les traces blanches fraîches partent souvent en les frottant avec une chaussette propre et sèche.',
        'Sinon, lavez à l’envers, à l’eau fraîche, peu après le port.',
        'La prochaine fois, laissez le déodorant sécher complètement avant de vous habiller.',
      ],
      delicate: [
        'Traces blanches fraîches : frottez doucement avec une chaussette propre et sèche, ou une brosse douce.',
        'Lavez la soie peu après : les sels restés dans la fibre l’affaiblissent sous les bras.',
        'Ce qui reste est l’affaire du pressing.',
      ],
    },
    {
      key: 'water',
      icon: 'droplet',
      label: 'Auréoles d’eau',
      linen: [
        'L’eau ne marque pas le lin : il sèche et il n’y paraît plus.',
        'Si un pli reste, repassez-le tant qu’il est humide.',
        'Rien d’autre à faire.',
      ],
      delicate: [
        'Une goutte peut laisser une auréole sur la soie. Ne tamponnez pas, ne frottez pas.',
        'Passez la vapeur sur tout le panneau, régulièrement, à une largeur de main ; l’auréole s’estompe le plus souvent.',
        'Si elle persiste, laver la pièce entière de façon uniforme, ou un passage au pressing, la fera disparaître.',
      ],
    },
  ],

  TABLE: [
    { label: 'Lavage à la maison', values: { silk: 'À la main, soie unie', linen: 'Dès le deuxième lavage', cashmere: 'À la main', ties: 'Jamais' } },
    { label: 'Machine', values: { silk: 'Délicat, 30 °C, filet', linen: 'Délicat, 30 °C', cashmere: 'Programme laine, 30 °C', ties: 'Jamais' } },
    { label: 'Lessive', values: { silk: 'pH neutre, pour soie', linen: 'Douce, sans javel', cashmere: 'Lessive laine et cachemire', ties: '–' } },
    { label: 'Séchage', values: { silk: 'À plat ou cintre rembourré', linen: 'Cintre large, ombre', cashmere: 'À plat, loin de la chaleur', ties: 'Roulée ou à plat' } },
    { label: 'Repassage', values: { silk: '• Doux, sec, avec un linge', linen: '•• Moyen, encore humide', cashmere: '•• Laine, linge humide', ties: 'Aucun' } },
    { label: 'Vapeur', values: { silk: 'Oui, à distance', linen: 'Oui', cashmere: 'Oui, à l’envers', ties: 'Oui, à distance' } },
    { label: 'Rangement', values: { silk: 'Cintre rembourré, housse en coton', linen: 'Cintre large, pliage souple', cashmere: 'Cintre à pinces, cèdre', ties: 'Roulée, dans un tiroir' } },
    { label: 'Pressing', values: { silk: 'Bienvenu ; obligatoire pour jacquard et brocart', linen: 'Pour le premier lavage', cashmere: 'Bienvenu', ties: 'Pour chaque tache' } },
  ],

  SYMBOLS: [
    {
      family: 'Lavage',
      items: [
        { icon: 'wash30', title: '30 °C', body: 'Lavage normal à 30 °C au plus.' },
        { icon: 'wash30Gentle', title: '30 °C, délicat', body: 'Une barre sous la cuve : cycle délicat, avec un essorage réduit.' },
        { icon: 'wash30Wool', title: '30 °C, très délicat', body: 'Deux barres : un cycle très doux, tel que celui de la laine ou de la soie.' },
        { icon: 'washHand', title: 'À la main', body: 'Lavage à la main, à 40 °C au plus. LINSILK recommande 30 °C.' },
        { icon: 'noWash', title: 'Ne pas laver', body: 'Ni à la main, ni en machine.' },
      ],
    },
    {
      family: 'Blanchiment',
      items: [
        { icon: 'bleachAny', title: 'Blanchiment autorisé', body: 'Tous les agents de blanchiment peuvent être utilisés.' },
        { icon: 'noBleach', title: 'Pas de blanchiment', body: 'Aucun produit blanchissant, d’aucune sorte. Vaut pour toutes les pièces LINSILK.' },
      ],
    },
    {
      family: 'Séchage',
      items: [
        { icon: 'tumble', title: 'Séchage en tambour', body: 'Le cercle dans le carré signifie que le sèche-linge est autorisé.' },
        { icon: 'noTumble', title: 'Pas de sèche-linge', body: 'Jamais au sèche-linge. Vaut pour toutes les pièces LINSILK.' },
        { icon: 'lineDry', title: 'Séchage sur fil', body: 'Sécher sur un fil ou sur un cintre.' },
        { icon: 'dryFlat', title: 'Séchage à plat', body: 'Poser à plat pour sécher, afin que la pièce garde sa forme.' },
        { icon: 'dripDry', title: 'Séchage sans essorage', body: 'Suspendre mouillé, sans essorer ni tordre.' },
        { icon: 'dryFlatShade', title: 'Sécher à l’ombre', body: 'Le trait dans l’angle signifie : à l’abri du soleil direct.' },
      ],
    },
    {
      family: 'Repassage',
      items: [
        { icon: 'iron1', title: 'Doux', body: 'Un point : 110 °C au plus. Pour la soie, sans vapeur.' },
        { icon: 'iron2', title: 'Moyen', body: 'Deux points : 150 °C au plus. Pour la laine et le cachemire, pour le lin encore humide.' },
        { icon: 'iron3', title: 'Chaud', body: 'Trois points : 200 °C au plus. Pour le lin épais et le coton.' },
        { icon: 'noIron', title: 'Ne pas repasser', body: 'Pas de fer. Là où c’est permis, passez plutôt la vapeur à distance.' },
      ],
    },
    {
      family: 'Entretien professionnel',
      items: [
        { icon: 'dryCleanP', title: 'Nettoyage à sec (P)', body: 'Un pressing, avec les solvants usuels. La lettre est destinée au professionnel.' },
        { icon: 'dryCleanF', title: 'Nettoyage à sec (F)', body: 'Un pressing, avec un solvant doux seulement.' },
        { icon: 'wetCleanW', title: 'Nettoyage à l’eau (W)', body: 'Nettoyage professionnel à l’eau.' },
        { icon: 'noDryClean', title: 'Pas de nettoyage à sec', body: 'Aucun nettoyage à sec professionnel.' },
      ],
    },
  ],

  TRAVEL: [
    { icon: 'roll', title: 'Le lin, roulé', body: 'Roulez le lin plutôt que de le plier : il se froisse moins, et un cintre dans la salle de bains fait le reste.' },
    { icon: 'tissue', title: 'La soie, dans du papier de soie', body: 'Pliez la soie autour d’une feuille de papier de soie et rangez-la tout en haut, là où rien ne pèse dessus.' },
    { icon: 'steamer', title: 'Le cachemire, dès l’arrivée', body: 'Suspendez les pantalons en cachemire par l’ourlet dès votre arrivée ; la vapeur de la douche les remet en forme.' },
  ],

  PAGE: {
    metaTitle: 'Entretien de la soie, du lin et du cachemire',
    description:
      'Comment laver, sécher, repasser et ranger la soie, le lin, le cachemire et les cravates en soie LINSILK : les règles de la maison, pas à pas, avec les premiers gestes contre les taches et les symboles d’entretien expliqués.',
    kicker: 'Entretien',
    title: 'Comme au premier jour',
    lead: 'La soie, le lin et le cachemire sont des fibres naturelles : elles respirent, s’adoucissent avec le temps et durent, à condition d’être traitées avec douceur. Choisissez votre étoffe pour savoir comment la laver, la sécher, la repasser et la ranger.',
    chooseH: 'Choisissez votre étoffe',
    switcherLabel: 'Étoffe',
    glanceH: 'En un coup d’œil',
    dryH: 'Le séchage',
    pressH: 'Repassage et vapeur',
    heatCaption: 'Réglage du fer',
    steamDistance: 'une largeur de main',
    wearH: 'Porter et rafraîchir',
    storeH: 'Le rangement',
    keepH: 'À faire',
    avoidH: 'À éviter',
    stainsH: 'Les premiers gestes contre les taches',
    stainsLead: 'Choisissez ce qui s’est passé. Les gestes suivent l’étoffe choisie plus haut.',
    stainsFor: 'Pour',
    stainsLinenFirst:
      'Lin qui n’a pas encore passé son premier lavage chez un professionnel : tamponnez, puis portez-le au pressing plutôt que de le laver chez vous.',
    stainsStop:
      'Dans le doute, arrêtez-vous et confiez la pièce à un pressing. Une tache que l’on laisse tranquille s’enlève plus facilement qu’une tache sur laquelle on a frotté.',
    tableH: 'Les étoffes côte à côte',
    symbolsH: 'Comprendre les symboles d’entretien',
    symbolsLead: 'Les pressings et les machines à laver parlent avec ces symboles. Touchez-en un pour voir ce qu’il signifie.',
    travelH: 'En voyage',
    helpH: 'Une question sans réponse ?',
    helpBody: 'Écrivez-nous au sujet de votre pièce, d’une tache ou d’une question de votre pressing, en nous disant de quelle pièce il s’agit.',
    helpWrite: 'Écrivez-nous',
    helpContact: 'Page de contact',
    print: 'Imprimer ce guide',
    more: 'Autres aides',
    steam: 'Vapeur',
    methods: { padded: 'Cintre rembourré', wide: 'Cintre large', clip: 'Cintre à pinces', roll: 'Roulée' },
    moreLinks: [
      ['/care/questions', 'Questions'],
      ['/care/shipping', 'Livraison'],
      ['/care/returns', 'Retours'],
      ['/care/measuring', 'Guide de mesure'],
    ],
    howTo: (cloth) => `Comment laver ${cloth} LINSILK`,
  },
};
