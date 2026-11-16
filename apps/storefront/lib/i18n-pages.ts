/* The words of the collection pages, Design Your Own, shipping, returns, the
 * measurement guide and contact. English is the source; German and French are
 * for a native-speaker pass before they go live (docs/seo/SEO-GEO-PLAN.md
 * §13.7). The terms, privacy and legal-notice pages are placeholders awaiting a
 * lawyer and stay in English until the real text exists. */

import type { Lang } from './i18n';

const EN = {
  collection: {
    title: 'The collection: made-to-measure silk, linen and high frequency fabrics',
    description: (open: string) =>
      `${open}Women’s and men’s pieces in 100% silk, 100% linen and high frequency fabrics, each cut and sewn to your measurements in 2–4 weeks.`,
    none: 'No collection is open at the moment. When the next season is cut, its pieces appear here.',
    commission: 'Commission a piece',
    designs: (n: string) => `${n} designs`,
    enter: (who: string) => `Enter the ${who}’s collection`,
    women: 'Women',
    men: 'Men',
    womenAlt: 'A woman in a made-to-measure silk wrap dress on a sunlit loggia above the sea',
    menAlt: 'A man in a made-to-measure linen shirt and pants seated on limestone steps above the sea',
    aboutEyebrow: 'About the collection',
    aboutTitle: 'Made-to-measure silk, linen and high frequency fabrics',
    about: (open: string) =>
      `${open}Every LINSILK piece is cut and sewn to your own measurements in 2–4 weeks, in 100% silk, 100% linen or high frequency fabrics. Choose a piece, choose its colour from the swatches of its cloth, and enter your measurements: there are no sizes and no fittings. Four small collections a year, from Geneva.`,
    links: {
      '/collection/women/silk': 'Silk dresses and gowns',
      '/collection/women/silk-separates': 'Silk skirts and blouses',
      '/collection/women/linen': 'Women’s linen sets',
      '/collection/sleepwear': 'Silk sleepwear',
      '/collection/men/shirts': 'Men’s linen shirts',
      '/collection/men/trousers': 'Men’s linen pants',
      '/occasion/wedding-guest': 'Wedding guest dresses',
    } as Record<string, string>,
  },
  group: {
    women: 'Women',
    men: 'Men',
    crumb: 'Collection',
    titleWomen: 'Women’s clothing in silk, linen and high frequency fabrics, made to measure',
    titleMen: 'Men’s clothing in silk, linen and high frequency fabrics, made to measure',
    descWomen:
      'Silk dresses, gowns, skirts, blouses and sleepwear, linen two-piece sets and cashmere pants, each cut and sewn to your measurements in 2–4 weeks. From Geneva.',
    descMen:
      'Linen shirts and pants, cashmere pants and silk ties for men. The clothing is cut and sewn to your measurements in 2–4 weeks. From Geneva.',
    intro: (closes: string | undefined) =>
      `Each is cut to your measurements and made in a capped run. ${
        closes
          ? `When the season closes in ${closes} these designs are archived and are not made again.`
          : 'When the season closes these designs are archived and are not made again.'
      }`,
    designs: (n: string) => `${n} designs`,
    sleepwear: (label: string) => `${label} — sleepwear`,
    jump: 'Jump to',
    sections: {
      dresses: 'Dresses and gowns',
      skirts: 'Skirts',
      blouses: 'Blouses',
      linenSets: 'Linen sets',
      shirts: 'Shirts',
      pants: 'Pants',
      ties: 'Ties',
    },
    aboutEyebrow: 'About the collection',
    aboutTitle: 'Made to your measurements',
    aboutWomen:
      'LINSILK’s women’s pieces in 100% silk, 100% linen and cashmere, each cut and sewn to your own measurements in 2–4 weeks.',
    aboutMen: 'LINSILK’s men’s pieces in 100% linen and cashmere, each cut and sewn to your own measurements in 2–4 weeks, and silk ties ordered by colour alone.',
    colour: 'Choose the colour from the swatches of its cloth on the piece’s page.',
    wedding: 'Wedding guest dresses in silk',
    sleep: 'Silk sleepwear',
  },
  design: {
    title: 'Design your own dress, shirt or pants in silk, linen or cashmere',
    description:
      'Design your own piece: choose a base silhouette and the cloth, write a brief, add your measurements. A tailor reads it and replies with a price. Silk, linen or cashmere.',
    aboutTitle: 'Design your own, made to your measurements',
    about:
      'Design Your Own is LINSILK’s commission service: you choose a base silhouette and the cloth, write a brief to the tailor and submit your measurements; the tailor builds one garment to it and replies with a price before anything is cut. Every commission is made in 100% silk, 100% linen or cashmere.',
    mtmLink: 'How made-to-measure works',
    unreachablePre: 'Commissions cannot be sent just now — the tailor’s desk is unreachable. Write to ',
    unreachablePost: ' and a tailor will take your brief by email instead.',
    questions: 'Questions',
    faq: [
      { q: 'Can I design my own dress online?', a: 'Yes. Choose a base silhouette, choose the cloth, write a note to the tailor and enter your measurements. The tailor builds one garment to that brief.' },
      { q: 'How is a commission priced?', a: 'Each silhouette shows an opening figure. A tailor reads every brief and replies with the price for your piece before anything is cut.' },
      { q: 'How long does a commission take?', a: 'Two to four weeks at the bench from your confirmed measurement sheet, the same as a piece from the collection, plus delivery.' },
    ],
  },
  shipping: {
    title: 'Shipping',
    description: 'Everything is made to order and dispatched from Geneva. Times, duty and tracking.',
    lead: 'Every garment is cut and finished to your measurement sheet, inspected twice, then dispatched from Geneva.',
    returns: 'Returns',
    questions: 'Questions',
    timeH: 'How long it takes',
    time: 'The clock starts when your measurement sheet is confirmed in writing, not when you order. A piece takes two to four weeks at the bench, whether it comes from a collection or from a commission.',
    rows: [
      ['Switzerland', 'Two to three days once dispatched. Duty included.'],
      ['European Union', 'Three to six days. Duty included in the price.'],
      ['United Kingdom', 'Three to six days. Import VAT payable on arrival.'],
      ['Rest of world', 'Five to ten days. Duties and import tax payable on arrival.'],
    ] as [string, string][],
    dutyH: 'Duty and tax',
    duty: 'Prices are in Swiss francs and include duty within Switzerland and the European Union — the figure you agree is the figure you pay. Outside those markets the carrier collects duty and import tax at delivery, set by your own customs authority. The house does not mark parcels as gifts or understate their value.',
    trackH: 'Tracking',
    track: 'You are written to when the pattern is cut, when the piece passes its second check, and when it is dispatched with a tracking number. If a parcel stalls in customs, write to hello@bylinsilk.com and the office in Geneva will chase it rather than asking you to.',
  },
  returns: {
    title: 'Returns',
    description: 'Why made-to-measure work is not returnable, what is done about a fault, and when an order can be released.',
    lead: 'A garment cut to one person’s measurements cannot be resold, so the house does not offer a general right of return on made-to-measure work.',
    write: 'Write to the house',
    faultsH: 'Faults',
    faults: 'Natural fibre creases, softens and moves, and none of that is a fault. A manufacturing fault — a failed seam, a dropped hem or a button that pulls away — is repaired, or the piece replaced, whichever the bench judges right.',
    beforeH: 'Before anything is cut',
    before: 'Nothing is cut until you have confirmed your sheet in writing, so an order can be released at any point up to that reply, in full and without a reason.',
  },
  measuring: {
    title: 'Measurement guide',
    metaTitle: 'How to measure yourself for a dress: 15 measurements',
    description: 'A step-by-step guide to the 15 body measurements for made-to-measure clothing: ten minutes, a soft tape and a helper, or any tailor.',
    lead: 'There is no small, medium or large. Fifteen measurements decide the garment, and they are the part of the order worth slowing down for. Ten minutes with a soft tape and someone to help you is enough.',
    enter: 'Enter the collection',
    help: 'Ask for help',
    beforeH: 'Before you start',
    before: [
      'Wear close-fitting clothes, or none. Never measure over a jumper.',
      'Use a soft tape. A metal builder’s tape cannot follow the body.',
      'Keep the tape flat against you and level all the way round — check the back in a mirror.',
      'Stand as you normally stand. Pulling your shoulders back changes the garment.',
      'Ask someone else to take the back and shoulder measurements if you can.',
      'Write centimetres if you have them. The site converts inches, but the tape is easier to read in cm.',
    ],
    fifteenH: 'The fifteen',
    ratherH: 'If you would rather not',
    rather: 'Any tailor or alterations shop will take these fifteen in a few minutes, often for nothing. Print this page, or show them the list on your phone.',
    wrongH: 'If a measurement looks wrong',
    wrong: 'The sheet flags a figure that sits outside the usual range for that zone. That is a prompt to check the tape, not a refusal — bodies vary, and the tailor would rather cut to an unusual number you have confirmed than to a typing error you did not notice.',
  },
  contact: {
    metaTitle: 'Contact the house',
    story: {
      title: 'The house',
      lead: 'LINSILK was set up to make one thing properly: clothing in pure silk, pure linen and high frequency fabrics, cut for one body, in four small collections a year.',
      a: 'Orders and client care are handled from Geneva. Prices are in Swiss francs and include duty within Switzerland and the EU. A piece takes two to four weeks from the confirmed measurement sheet.',
      b: 'Write to hello@bylinsilk.com with any question about a piece or your order.',
    },
    help: 'Measurement help',
  },
};

export type PagesText = typeof EN;

const DE: PagesText = {
  collection: {
    title: 'Die Kollektion: Seide, Leinen und hochfrequente Stoffe nach Mass',
    description: (open) =>
      `${open}Mode für Damen und Herren aus 100 % Seide, 100 % Leinen und hochfrequenten Stoffen, jedes Stück nach Ihren Massen zugeschnitten und genäht, innert zwei bis vier Wochen.`,
    none: 'Zurzeit ist keine Kollektion geöffnet. Sobald die nächste Saison zugeschnitten ist, finden Sie ihre Stücke hier.',
    commission: 'Ein Stück in Auftrag geben',
    designs: (n) => `${n} Modelle`,
    enter: (who) => `Zur ${who}kollektion`,
    women: 'Damen',
    men: 'Herren',
    womenAlt: 'Eine Frau in einem massgefertigten Wickelkleid aus Seide auf einer sonnigen Loggia über dem Meer',
    menAlt: 'Ein Mann in massgefertigtem Leinenhemd und Leinenhose, auf Kalksteinstufen über dem Meer sitzend',
    aboutEyebrow: 'Über die Kollektion',
    aboutTitle: 'Seide, Leinen und hochfrequente Stoffe, ganz nach Mass',
    about: (open) =>
      `${open}Jedes Stück von LINSILK wird nach Ihren eigenen Massen zugeschnitten und genäht, innert zwei bis vier Wochen, aus 100 % Seide, 100 % Leinen oder hochfrequenten Stoffen. Sie suchen sich ein Stück aus, wählen die Farbe anhand der Stoffmuster und geben Ihre Masse ein. Konfektionsgrössen und Anproben gibt es nicht. Vier kleine Kollektionen im Jahr, aus Genf.`,
    links: {
      '/collection/women/silk': 'Kleider und Roben aus Seide',
      '/collection/women/silk-separates': 'Röcke und Blusen aus Seide',
      '/collection/women/linen': 'Damen-Sets aus Leinen',
      '/collection/sleepwear': 'Schlafmode aus Seide',
      '/collection/men/shirts': 'Herrenhemden aus Leinen',
      '/collection/men/trousers': 'Herrenhosen aus Leinen',
      '/occasion/wedding-guest': 'Kleider für Hochzeitsgäste',
    },
  },
  group: {
    women: 'Damen',
    men: 'Herren',
    crumb: 'Kollektion',
    titleWomen: 'Damenmode nach Mass aus Seide, Leinen und hochfrequenten Stoffen',
    titleMen: 'Herrenmode nach Mass aus Seide, Leinen und hochfrequenten Stoffen',
    descWomen:
      'Kleider, Roben, Röcke, Blusen und Schlafmode aus Seide, zweiteilige Sets aus Leinen und Kaschmirhosen: jedes Stück nach Ihren Massen zugeschnitten und genäht, innert zwei bis vier Wochen. Aus Genf.',
    descMen:
      'Hemden und Hosen aus Leinen, Kaschmirhosen und Seidenkrawatten für Herren. Alles wird nach Ihren Massen zugeschnitten und genäht, innert zwei bis vier Wochen. Aus Genf.',
    intro: (closes) =>
      `Jedes Stück wird nach Ihren Massen zugeschnitten und nur in begrenzter Auflage gefertigt. ${
        closes
          ? `Endet die Saison im ${closes}, werden diese Modelle archiviert und nicht wieder aufgelegt.`
          : 'Mit dem Ende der Saison werden diese Modelle archiviert und nicht wieder aufgelegt.'
      }`,
    designs: (n) => `${n} Modelle`,
    sleepwear: (label) => `${label}: Schlafmode`,
    jump: 'Direkt zu',
    sections: {
      dresses: 'Kleider und Roben',
      skirts: 'Röcke',
      blouses: 'Blusen',
      linenSets: 'Sets aus Leinen',
      shirts: 'Hemden',
      pants: 'Hosen',
      ties: 'Krawatten',
    },
    aboutEyebrow: 'Über die Kollektion',
    aboutTitle: 'Nach Ihren Massen gefertigt',
    aboutWomen:
      'Damenmode von LINSILK aus 100 % Seide, 100 % Leinen und Kaschmir: jedes Stück nach Ihren eigenen Massen zugeschnitten und genäht, innert zwei bis vier Wochen.',
    aboutMen:
      'Herrenmode von LINSILK aus 100 % Leinen und Kaschmir, jedes Stück nach Ihren eigenen Massen zugeschnitten und genäht, innert zwei bis vier Wochen. Dazu Seidenkrawatten, bei denen Sie nur die Farbe wählen.',
    colour: 'Die Farbe wählen Sie auf der Seite des Stücks anhand der Stoffmuster.',
    wedding: 'Kleider für Hochzeitsgäste aus Seide',
    sleep: 'Schlafmode aus Seide',
  },
  design: {
    title: 'Kleid, Hemd oder Hose aus Seide, Leinen oder Kaschmir selbst entwerfen',
    description:
      'Entwerfen Sie Ihr eigenes Stück: Sie wählen eine Grundsilhouette und den Stoff, beschreiben Ihre Vorstellung und geben Ihre Masse an. Das Atelier liest Ihren Auftrag und antwortet mit einem Preis. In Seide, Leinen oder Kaschmir.',
    aboutTitle: 'Selbst entwerfen, nach Ihren Massen gefertigt',
    about:
      '«Selbst entwerfen» ist der Auftragsservice von LINSILK. Sie wählen eine Grundsilhouette und den Stoff, schreiben dem Atelier, was Ihnen vorschwebt, und senden Ihre Masse. Das Atelier fertigt daraufhin ein einzelnes Kleidungsstück und nennt Ihnen den Preis, bevor etwas zugeschnitten wird. Jeder Auftrag entsteht aus 100 % Seide, 100 % Leinen oder Kaschmir.',
    mtmLink: 'So funktioniert die Massanfertigung',
    unreachablePre: 'Aufträge lassen sich im Moment nicht übermitteln, das Atelier ist nicht erreichbar. Schreiben Sie an ',
    unreachablePost: ', dann nimmt das Atelier Ihren Auftrag stattdessen per E-Mail entgegen.',
    questions: 'Fragen',
    faq: [
      { q: 'Kann ich mein Kleid online selbst entwerfen?', a: 'Ja. Sie wählen eine Grundsilhouette und den Stoff, schreiben dem Atelier, was Sie sich vorstellen, und geben Ihre Masse ein. Das Atelier fertigt ein Kleidungsstück nach Ihrem Auftrag.' },
      { q: 'Wie wird der Preis eines Auftrags bestimmt?', a: 'Zu jeder Silhouette sehen Sie einen Ausgangspreis. Das Atelier liest jeden Auftrag und nennt Ihnen den Preis für Ihr Stück, bevor etwas zugeschnitten wird.' },
      { q: 'Wie lange dauert ein Auftrag?', a: 'Zwei bis vier Wochen ab dem Tag, an dem Sie Ihr Massblatt bestätigt haben, genau wie bei einem Stück aus der Kollektion, dazu die Lieferzeit.' },
    ],
  },
  shipping: {
    title: 'Lieferung',
    description: 'Jedes Stück wird auf Bestellung gefertigt und von Genf aus verschickt. Lieferzeiten, Zoll und Sendungsverfolgung.',
    lead: 'Jedes Kleidungsstück wird nach Ihrem Massblatt zugeschnitten und fertiggestellt, zweimal geprüft und dann von Genf aus auf den Weg gebracht.',
    returns: 'Rückgabe',
    questions: 'Fragen',
    timeH: 'Wie lange es dauert',
    time: 'Gerechnet wird ab dem Tag, an dem Sie Ihr Massblatt schriftlich bestätigt haben, nicht ab der Bestellung. Ob Stück aus der Kollektion oder Auftragsarbeit: Die Fertigung dauert zwei bis vier Wochen.',
    rows: [
      ['Schweiz', 'Zwei bis drei Tage nach dem Versand. Zoll inklusive.'],
      ['Europäische Union', 'Drei bis sechs Tage. Zoll ist im Preis enthalten.'],
      ['Vereinigtes Königreich', 'Drei bis sechs Tage. Die Einfuhr-Mehrwertsteuer wird bei Ankunft fällig.'],
      ['Übrige Welt', 'Fünf bis zehn Tage. Zoll und Einfuhrabgaben werden bei Ankunft fällig.'],
    ],
    dutyH: 'Zoll und Steuern',
    duty: 'Alle Preise verstehen sich in Schweizer Franken und schliessen den Zoll innerhalb der Schweiz und der Europäischen Union ein: Der Betrag, den Sie bestätigen, ist der Betrag, den Sie zahlen. In allen anderen Ländern erhebt der Zusteller Zoll und Einfuhrabgaben bei der Lieferung; ihre Höhe legt die Zollbehörde Ihres Landes fest. Pakete werden weder als Geschenk deklariert noch mit einem zu niedrigen Warenwert angegeben.',
    trackH: 'Sendungsverfolgung',
    track: 'Wir schreiben Ihnen, sobald Ihr Schnitt zugeschnitten ist, sobald das Stück die zweite Kontrolle bestanden hat und sobald es mit Sendungsnummer unterwegs ist. Hängt ein Paket im Zoll fest, genügt eine Nachricht an hello@bylinsilk.com: Das Büro in Genf kümmert sich darum, Sie müssen nicht selbst nachhaken.',
  },
  returns: {
    title: 'Rückgabe',
    description: 'Warum massgefertigte Stücke nicht zurückgenommen werden, was bei einem Mangel geschieht und bis wann Sie eine Bestellung stornieren können.',
    lead: 'Ein Kleidungsstück, das nach den Massen eines einzelnen Menschen gefertigt wurde, lässt sich nicht weiterverkaufen. Deshalb gibt es bei massgefertigten Stücken kein allgemeines Rückgaberecht.',
    write: 'Dem Haus schreiben',
    faultsH: 'Mängel',
    faults: 'Naturfasern knittern, werden weicher und geben nach; das alles ist kein Mangel. Ein Fehler in der Verarbeitung, etwa eine aufgegangene Naht, ein ausgefallener Saum oder ein Knopf, der sich löst, wird repariert, oder das Stück wird ersetzt, je nachdem, was die Werkstatt für richtig hält.',
    beforeH: 'Bevor etwas zugeschnitten wird',
    before: 'Zugeschnitten wird erst, wenn Sie Ihr Massblatt schriftlich bestätigt haben. Bis zu dieser Bestätigung können Sie Ihre Bestellung jederzeit zurückziehen, vollständig und ohne Begründung.',
  },
  measuring: {
    title: 'Anleitung zum Massnehmen',
    metaTitle: 'So nehmen Sie Ihre Masse für ein Kleid: 15 Masse in zehn Minuten',
    description: 'Schritt für Schritt zu den 15 Körpermassen für massgefertigte Kleidung: zehn Minuten, ein weiches Massband und eine helfende Hand, oder gleich bei einer Schneiderei.',
    lead: 'Ein S, M oder L gibt es bei uns nicht. Fünfzehn Masse bestimmen, wie das Stück sitzt, und sie sind der Teil der Bestellung, für den Sie sich Zeit nehmen sollten. Zehn Minuten mit einem weichen Massband und einer helfenden Hand genügen.',
    enter: 'Zur Kollektion',
    help: 'Hilfe anfragen',
    beforeH: 'Bevor Sie beginnen',
    before: [
      'Tragen Sie eng anliegende Kleidung oder gar keine. Messen Sie nie über einem Pullover.',
      'Nehmen Sie ein weiches Massband. Ein Bandmass aus Metall vom Bau schmiegt sich nicht an den Körper.',
      'Halten Sie das Massband flach am Körper und rundherum waagrecht. Den Rücken prüfen Sie am besten im Spiegel.',
      'Stehen Sie so, wie Sie normalerweise stehen. Wer die Schultern nach hinten zieht, verfälscht das Mass.',
      'Lassen Sie Rücken und Schultern nach Möglichkeit von jemand anderem messen.',
      'Notieren Sie die Werte in Zentimetern, wenn Sie können. Die Website rechnet Zoll um, aber am Massband liest man Zentimeter leichter ab.',
    ],
    fifteenH: 'Die fünfzehn Masse',
    ratherH: 'Wenn Sie es lieber nicht selbst machen',
    rather: 'Jede Schneiderei nimmt diese fünfzehn Masse in wenigen Minuten, oft ohne Berechnung. Drucken Sie diese Seite aus, oder zeigen Sie die Liste auf Ihrem Telefon.',
    wrongH: 'Wenn ein Mass nicht stimmig wirkt',
    wrong: 'Liegt ein Wert ausserhalb des üblichen Bereichs für die jeweilige Körperstelle, markiert das Massblatt ihn. Das ist ein Hinweis, das Massband noch einmal anzusetzen, keine Ablehnung: Körper sind verschieden, und das Atelier schneidet lieber nach einem ungewöhnlichen Wert, den Sie bestätigt haben, als nach einem Tippfehler, den niemand bemerkt hat.',
  },
  contact: {
    metaTitle: 'Das Haus kontaktieren',
    story: {
      title: 'Das Haus',
      lead: 'LINSILK entstand mit dem Wunsch, eines wirklich gut zu machen: Kleidung aus reiner Seide, reinem Leinen und hochfrequenten Stoffen, zugeschnitten für einen einzigen Körper, in vier kleinen Kollektionen im Jahr.',
      a: 'Bestellungen und Kundenbetreuung laufen über Genf. Die Preise gelten in Schweizer Franken und schliessen den Zoll innerhalb der Schweiz und der EU ein. Ein Stück braucht ab Ihrem bestätigten Massblatt zwei bis vier Wochen.',
      b: 'Bei Fragen zu einem Stück oder zu Ihrer Bestellung schreiben Sie an hello@bylinsilk.com.',
    },
    help: 'Hilfe beim Massnehmen',
  },
};

const FR: PagesText = {
  collection: {
    title: 'La collection : soie, lin et tissus à haute fréquence sur mesure',
    description: (open) =>
      `${open}Pièces pour femme et pour homme en 100 % soie, 100 % lin et tissus à haute fréquence, chacune coupée et cousue d’après vos mesures, en deux à quatre semaines.`,
    none: 'Aucune collection n’est ouverte pour le moment. Dès que la prochaine saison sera coupée, ses pièces s’afficheront ici.',
    commission: 'Commander une pièce sur mesure',
    designs: (n) => `${n} modèles`,
    enter: (who) => `Découvrir la collection ${who.toLowerCase()}`,
    women: 'Femme',
    men: 'Homme',
    womenAlt: 'Une femme dans une robe portefeuille en soie sur mesure, sur une loggia ensoleillée dominant la mer',
    menAlt: 'Un homme en chemise et pantalon de lin sur mesure, assis sur des marches de calcaire au-dessus de la mer',
    aboutEyebrow: 'À propos de la collection',
    aboutTitle: 'Soie, lin et tissus à haute fréquence, sur mesure',
    about: (open) =>
      `${open}Chaque pièce LINSILK est coupée et cousue d’après vos propres mesures, en deux à quatre semaines, en 100 % soie, 100 % lin ou en tissus à haute fréquence. Vous choisissez une pièce, son coloris parmi les échantillons du tissu, puis vous indiquez vos mesures : ni tailles, ni essayages. Quatre petites collections par an, depuis Genève.`,
    links: {
      '/collection/women/silk': 'Robes et robes longues en soie',
      '/collection/women/silk-separates': 'Jupes et chemisiers en soie',
      '/collection/women/linen': 'Ensembles en lin pour femme',
      '/collection/sleepwear': 'Vêtements de nuit en soie',
      '/collection/men/shirts': 'Chemises en lin pour homme',
      '/collection/men/trousers': 'Pantalons en lin pour homme',
      '/occasion/wedding-guest': 'Robes d’invitée de mariage',
    },
  },
  group: {
    women: 'Femme',
    men: 'Homme',
    crumb: 'Collection',
    titleWomen: 'Mode femme sur mesure en soie, en lin et en tissus à haute fréquence',
    titleMen: 'Mode homme sur mesure en soie, en lin et en tissus à haute fréquence',
    descWomen:
      'Robes, robes longues, jupes, chemisiers et vêtements de nuit en soie, ensembles deux pièces en lin et pantalons en cachemire : chaque pièce est coupée et cousue d’après vos mesures, en deux à quatre semaines. Depuis Genève.',
    descMen:
      'Chemises et pantalons en lin, pantalons en cachemire et cravates en soie pour homme. Tout est coupé et cousu d’après vos mesures, en deux à quatre semaines. Depuis Genève.',
    intro: (closes) =>
      `Chaque pièce est coupée d’après vos mesures et réalisée en quantité limitée. ${
        closes
          ? `À la fin de la saison, en ${closes}, ces modèles sont archivés et ne sont pas refaits.`
          : 'À la fin de la saison, ces modèles sont archivés et ne sont pas refaits.'
      }`,
    designs: (n) => `${n} modèles`,
    sleepwear: (label) => `${label} : vêtements de nuit`,
    jump: 'Accès direct',
    sections: {
      dresses: 'Robes et robes longues',
      skirts: 'Jupes',
      blouses: 'Chemisiers',
      linenSets: 'Ensembles en lin',
      shirts: 'Chemises',
      pants: 'Pantalons',
      ties: 'Cravates',
    },
    aboutEyebrow: 'À propos de la collection',
    aboutTitle: 'Faite à vos mesures',
    aboutWomen:
      'La mode femme de LINSILK en 100 % soie, 100 % lin et cachemire : chaque pièce est coupée et cousue d’après vos propres mesures, en deux à quatre semaines.',
    aboutMen:
      'La mode homme de LINSILK en 100 % lin et en cachemire, chaque pièce coupée et cousue d’après vos propres mesures en deux à quatre semaines, ainsi que des cravates en soie où vous ne choisissez que le coloris.',
    colour: 'Le coloris se choisit sur la page de la pièce, parmi les échantillons de son tissu.',
    wedding: 'Robes d’invitée de mariage en soie',
    sleep: 'Vêtements de nuit en soie',
  },
  design: {
    title: 'Créer votre robe, chemise ou pantalon en soie, en lin ou en cachemire',
    description:
      'Créez votre propre pièce : choisissez une silhouette de base et le tissu, décrivez ce que vous imaginez, indiquez vos mesures. L’atelier lit votre demande et vous répond avec un prix. En soie, en lin ou en cachemire.',
    aboutTitle: 'Créer votre pièce, à vos mesures',
    about:
      '« Créer votre pièce » est le service de commande de LINSILK. Vous choisissez une silhouette de base et le tissu, vous décrivez à l’atelier ce que vous imaginez et vous envoyez vos mesures. L’atelier réalise alors un unique vêtement et vous annonce le prix avant toute coupe. Chaque commande est réalisée en 100 % soie, 100 % lin ou en cachemire.',
    mtmLink: 'Comment fonctionne le sur-mesure',
    unreachablePre: 'Les commandes ne peuvent pas être transmises pour le moment : l’atelier est injoignable. Écrivez à ',
    unreachablePost: ' : l’atelier recevra votre demande par e-mail.',
    questions: 'Questions',
    faq: [
      { q: 'Puis-je créer ma robe en ligne ?', a: 'Oui. Vous choisissez une silhouette de base et le tissu, vous décrivez votre idée à l’atelier et vous indiquez vos mesures. L’atelier réalise un vêtement d’après votre demande.' },
      { q: 'Comment le prix d’une commande est-il fixé ?', a: 'Chaque silhouette affiche un prix de départ. L’atelier lit chaque demande et vous indique le prix de votre pièce avant toute coupe.' },
      { q: 'Quel est le délai d’une commande ?', a: 'De deux à quatre semaines à partir de la confirmation de votre fiche de mesures, comme pour une pièce de la collection, auxquelles s’ajoute la livraison.' },
    ],
  },
  shipping: {
    title: 'Livraison',
    description: 'Chaque pièce est réalisée sur commande et expédiée depuis Genève. Délais, droits de douane et suivi du colis.',
    lead: 'Chaque vêtement est coupé et fini d’après votre fiche de mesures, contrôlé à deux reprises, puis expédié depuis Genève.',
    returns: 'Retours',
    questions: 'Questions',
    timeH: 'Combien de temps faut-il compter',
    time: 'Le délai court à partir du jour où vous avez confirmé votre fiche de mesures par écrit, et non à partir de la commande. Qu’il s’agisse d’une pièce de la collection ou d’une création sur commande, la réalisation prend de deux à quatre semaines.',
    rows: [
      ['Suisse', 'Deux à trois jours après l’expédition. Droits de douane compris.'],
      ['Union européenne', 'Trois à six jours. Droits de douane compris dans le prix.'],
      ['Royaume-Uni', 'Trois à six jours. La TVA à l’importation est due à l’arrivée.'],
      ['Reste du monde', 'Cinq à dix jours. Droits de douane et taxes à l’importation dus à l’arrivée.'],
    ],
    dutyH: 'Droits de douane et taxes',
    duty: 'Les prix sont indiqués en francs suisses et incluent les droits de douane en Suisse et dans l’Union européenne : le montant que vous validez est celui que vous payez. Partout ailleurs, le transporteur perçoit les droits et taxes à la livraison, selon le barème de l’administration douanière de votre pays. Les colis ne sont jamais déclarés comme des cadeaux, et leur valeur n’est jamais minorée.',
    trackH: 'Suivi du colis',
    track: 'Nous vous écrivons lorsque votre patron est coupé, lorsque la pièce a passé son second contrôle et lorsqu’elle part avec son numéro de suivi. Si un colis reste bloqué en douane, un message à hello@bylinsilk.com suffit : le bureau de Genève s’en charge, sans que vous ayez à relancer qui que ce soit.',
  },
  returns: {
    title: 'Retours',
    description: 'Pourquoi les pièces sur mesure ne sont pas reprises, ce qui se passe en cas de défaut et jusqu’à quand une commande peut être annulée.',
    lead: 'Un vêtement coupé aux mesures d’une seule personne ne peut pas être revendu. C’est pourquoi la maison n’accorde pas de droit de retour général sur le sur-mesure.',
    write: 'Écrire à la maison',
    faultsH: 'Défauts',
    faults: 'Les fibres naturelles se froissent, s’assouplissent et prennent le mouvement du corps : rien de tout cela n’est un défaut. Un défaut de fabrication, comme une couture qui lâche, un ourlet qui tombe ou un bouton qui se détache, donne lieu à une réparation ou à un remplacement de la pièce, selon ce que l’atelier juge le plus juste.',
    beforeH: 'Avant toute coupe',
    before: 'Rien n’est coupé tant que vous n’avez pas confirmé votre fiche par écrit. Jusqu’à cette confirmation, vous pouvez annuler votre commande à tout moment, intégralement et sans avoir à vous justifier.',
  },
  measuring: {
    title: 'Guide pour prendre vos mesures',
    metaTitle: 'Comment prendre vos mesures pour une robe : 15 mesures en dix minutes',
    description: 'Le guide pas à pas des 15 mesures du corps pour un vêtement sur mesure : dix minutes, un mètre ruban souple et une paire de mains pour vous aider, ou directement chez un tailleur.',
    lead: 'Chez nous, ni S, ni M, ni L. Ce sont quinze mesures qui décident de la façon dont la pièce vous va, et c’est l’étape de la commande qui mérite que l’on prenne son temps. Dix minutes, un mètre ruban souple et quelqu’un pour vous aider suffisent.',
    enter: 'Découvrir la collection',
    help: 'Demander de l’aide',
    beforeH: 'Avant de commencer',
    before: [
      'Portez des vêtements ajustés, ou aucun. Ne prenez jamais vos mesures par-dessus un pull.',
      'Prenez un mètre ruban souple. Un mètre de chantier en métal n’épouse pas le corps.',
      'Gardez le ruban à plat contre le corps et bien horizontal sur tout le tour. Vérifiez le dos dans un miroir.',
      'Tenez-vous comme à votre habitude. Rejeter les épaules en arrière fausserait la mesure.',
      'Si possible, faites prendre le dos et les épaules par quelqu’un d’autre.',
      'Notez les valeurs en centimètres si vous le pouvez. Le site convertit les pouces, mais le ruban se lit plus aisément en centimètres.',
    ],
    fifteenH: 'Les quinze mesures',
    ratherH: 'Si vous préférez ne pas vous en charger',
    rather: 'N’importe quel tailleur prend ces quinze mesures en quelques minutes, souvent sans rien facturer. Imprimez cette page ou montrez-lui la liste sur votre téléphone.',
    wrongH: 'Si une mesure vous semble douteuse',
    wrong: 'Lorsqu’une valeur sort de la plage habituelle pour la zone concernée, la fiche la signale. C’est une invitation à reprendre le ruban, pas un refus : les corps diffèrent, et l’atelier préfère couper d’après une valeur inhabituelle que vous avez confirmée plutôt que d’après une faute de frappe passée inaperçue.',
  },
  contact: {
    metaTitle: 'Contacter la maison',
    story: {
      title: 'La maison',
      lead: 'LINSILK est née d’une envie : faire une seule chose, et la faire bien. Des vêtements en soie pure, en lin pur et en tissus à haute fréquence, coupés pour un seul corps, en quatre petites collections par an.',
      a: 'Les commandes et le service client sont gérés depuis Genève. Les prix sont indiqués en francs suisses et incluent les droits de douane en Suisse et dans l’UE. Une pièce demande de deux à quatre semaines à partir de votre fiche de mesures confirmée.',
      b: 'Pour toute question sur une pièce ou sur votre commande, écrivez à hello@bylinsilk.com.',
    },
    help: 'Aide pour les mesures',
  },
};

export function pagesText(lang: Lang): PagesText {
  if (lang === 'en') return EN;
  if (lang === 'fr') return FR;
  return DE;
}
