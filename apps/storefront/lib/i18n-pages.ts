/* The words of the collection pages, Design Your Own, shipping, returns, the
 * measurement guide and contact. English is the source; German and French are
 * for a native-speaker pass before they go live (docs/seo/SEO-GEO-PLAN.md
 * §13.7). The terms, privacy and legal-notice pages are placeholders awaiting a
 * lawyer and stay in English until the real text exists. */

import { deepDe, type Lang } from './i18n';

const EN = {
  collection: {
    title: 'The collection: made-to-measure silk and linen',
    description: (open: string) =>
      `${open}Women’s and men’s pieces in 100% silk and 100% linen, each cut and sewn to your measurements in 2–4 weeks.`,
    none: 'No collection is open at the moment. When the next season is cut, its pieces appear here.',
    commission: 'Commission a piece',
    designs: (n: string) => `${n} designs`,
    enter: (who: string) => `Enter the ${who}’s collection`,
    women: 'Women',
    men: 'Men',
    womenAlt: 'A woman in a made-to-measure silk wrap dress on a sunlit loggia above the sea',
    menAlt: 'A man in a made-to-measure linen shirt and trousers seated on limestone steps above the sea',
    aboutEyebrow: 'About the collection',
    aboutTitle: 'Made-to-measure silk and linen',
    about: (open: string) =>
      `${open}Every LINSILK piece is cut and sewn to your own measurements in 2–4 weeks, in 100% silk or 100% linen. Choose a piece, choose its colour from the swatches of its cloth, and enter your measurements: there are no sizes and no fittings. Four small collections a year, from Geneva.`,
    links: {
      '/collection/women/silk': 'Silk dresses and gowns',
      '/collection/women/silk-separates': 'Silk skirts and blouses',
      '/collection/women/linen': 'Women’s linen sets',
      '/collection/sleepwear': 'Silk sleepwear',
      '/collection/men/shirts': 'Men’s linen shirts',
      '/collection/men/trousers': 'Men’s linen trousers',
      '/occasion/wedding-guest': 'Wedding guest dresses',
    } as Record<string, string>,
  },
  group: {
    women: 'Women',
    men: 'Men',
    crumb: 'Collection',
    titleWomen: 'Women’s silk and linen clothing, made to measure',
    titleMen: 'Men’s linen clothing, made to measure',
    descWomen:
      'Silk dresses, gowns, skirts, blouses and sleepwear, and linen two-piece sets, each cut and sewn to your measurements in 2–4 weeks. From Geneva.',
    descMen:
      'Linen shirts, trousers and two-piece looks for men, each cut and sewn to your measurements in 2–4 weeks in 100% linen. From Geneva.',
    intro: (closes: string | undefined) =>
      `Each is cut to your measurements and made in a capped run. ${
        closes
          ? `When the season closes in ${closes} these designs are archived and are not made again.`
          : 'When the season closes these designs are archived and are not made again.'
      }`,
    designs: (n: string) => `${n} designs`,
    sleepwear: (label: string) => `${label} — sleepwear`,
    aboutEyebrow: 'About the collection',
    aboutTitle: 'Made to your measurements',
    aboutWomen:
      'LINSILK’s women’s pieces in 100% silk and 100% linen, each cut and sewn to your own measurements in 2–4 weeks.',
    aboutMen: 'LINSILK’s men’s pieces in 100% linen, each cut and sewn to your own measurements in 2–4 weeks.',
    colour: 'Choose the colour from the swatches of its cloth on the piece’s page.',
    wedding: 'Wedding guest dresses in silk',
    sleep: 'Silk sleepwear',
  },
  design: {
    title: 'Design your own dress or shirt in silk or linen',
    description:
      'Design your own piece: choose a base silhouette and the cloth, write a brief, add your measurements. A tailor reads it and replies with a price. Silk or linen only.',
    aboutTitle: 'Design your own, made to your measurements',
    about:
      'Design Your Own is LINSILK’s commission service: you choose a base silhouette and the cloth, write a brief to the tailor and submit your measurements; the atelier builds one garment to it and replies with a price before anything is cut. Every commission is made in 100% silk or 100% linen.',
    mtmLink: 'How made-to-measure works',
    unreachablePre: 'Commissions cannot be sent just now — the atelier’s desk is unreachable. Write to ',
    unreachablePost: ' and a tailor will take your brief by email instead.',
    questions: 'Questions',
    faq: [
      { q: 'Can I design my own dress online?', a: 'Yes. Choose a base silhouette, choose the cloth, write a note to the tailor and enter your measurements. The atelier builds one garment to that brief.' },
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
    wrong: 'The sheet flags a figure that sits outside the usual range for that zone. That is a prompt to check the tape, not a refusal — bodies vary, and the atelier would rather cut to an unusual number you have confirmed than to a typing error you did not notice.',
  },
  contact: {
    metaTitle: 'Contact the house',
    story: {
      title: 'The house',
      lead: 'LINSILK was set up to make one thing properly: clothing in pure silk and pure linen, cut for one body, in four small collections a year.',
      a: 'Orders and client care are handled from Geneva. Prices are in Swiss francs and include duty within Switzerland and the EU. A piece takes two to four weeks from the confirmed measurement sheet.',
      b: 'Write to hello@bylinsilk.com with any question about a piece or your order.',
    },
    help: 'Measurement help',
  },
};

export type PagesText = typeof EN;

const DE_CH: PagesText = {
  collection: {
    title: 'Die Kollektion: Seide und Leinen nach Mass',
    description: (open) =>
      `${open}Damen- und Herrenstücke aus 100 % Seide und 100 % Leinen, jedes nach Ihren Massen in 2–4 Wochen zugeschnitten und genäht.`,
    none: 'Im Moment ist keine Kollektion geöffnet. Sobald die nächste Saison zugeschnitten ist, erscheinen ihre Stücke hier.',
    commission: 'Ein Stück in Auftrag geben',
    designs: (n) => `${n} Modelle`,
    enter: (who) => `Zur ${who}-Kollektion`,
    women: 'Damen',
    men: 'Herren',
    womenAlt: 'Eine Frau in einem Wickelkleid aus Seide nach Mass auf einer sonnigen Loggia über dem Meer',
    menAlt: 'Ein Mann in Hemd und Hose aus Leinen nach Mass, auf Kalksteinstufen über dem Meer sitzend',
    aboutEyebrow: 'Über die Kollektion',
    aboutTitle: 'Seide und Leinen nach Mass',
    about: (open) =>
      `${open}Jedes LINSILK-Stück wird nach Ihren eigenen Massen in 2–4 Wochen zugeschnitten und genäht, aus 100 % Seide oder 100 % Leinen. Wählen Sie ein Stück, wählen Sie seine Farbe aus den Stoffmustern seines Stoffs und geben Sie Ihre Masse ein: Es gibt keine Konfektionsgrössen und keine Anproben. Vier kleine Kollektionen im Jahr, aus Genf.`,
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
    titleWomen: 'Damenmode aus Seide und Leinen nach Mass',
    titleMen: 'Herrenmode aus Leinen nach Mass',
    descWomen:
      'Kleider, Roben, Röcke, Blusen und Schlafmode aus Seide sowie zweiteilige Sets aus Leinen, jedes nach Ihren Massen in 2–4 Wochen zugeschnitten und genäht. Aus Genf.',
    descMen:
      'Hemden, Hosen und zweiteilige Outfits aus Leinen für Herren, jedes nach Ihren Massen in 2–4 Wochen aus 100 % Leinen zugeschnitten und genäht. Aus Genf.',
    intro: (closes) =>
      `Jedes Stück wird nach Ihren Massen zugeschnitten und in begrenzter Auflage gefertigt. ${
        closes
          ? `Wenn die Saison im ${closes} endet, werden diese Modelle archiviert und nicht mehr gefertigt.`
          : 'Wenn die Saison endet, werden diese Modelle archiviert und nicht mehr gefertigt.'
      }`,
    designs: (n) => `${n} Modelle`,
    sleepwear: (label) => `${label} – Schlafmode`,
    aboutEyebrow: 'Über die Kollektion',
    aboutTitle: 'Nach Ihren Massen gefertigt',
    aboutWomen:
      'Die Damenstücke von LINSILK aus 100 % Seide und 100 % Leinen, jedes nach Ihren eigenen Massen in 2–4 Wochen zugeschnitten und genäht.',
    aboutMen: 'Die Herrenstücke von LINSILK aus 100 % Leinen, jedes nach Ihren eigenen Massen in 2–4 Wochen zugeschnitten und genäht.',
    colour: 'Die Farbe wählen Sie auf der Seite des Stücks aus den Stoffmustern seines Stoffs.',
    wedding: 'Kleider für Hochzeitsgäste aus Seide',
    sleep: 'Schlafmode aus Seide',
  },
  design: {
    title: 'Kleid oder Hemd aus Seide oder Leinen selbst entwerfen',
    description:
      'Entwerfen Sie Ihr eigenes Stück: Wählen Sie eine Grundsilhouette und den Stoff, schreiben Sie ein Briefing, geben Sie Ihre Masse an. Das Atelier liest es und antwortet mit einem Preis. Nur Seide oder Leinen.',
    aboutTitle: 'Selbst entwerfen, nach Ihren Massen gefertigt',
    about:
      '«Selbst entwerfen» ist der Auftragsservice von LINSILK: Sie wählen eine Grundsilhouette und den Stoff, schreiben dem Atelier ein Briefing und geben Ihre Masse an; das Atelier fertigt danach ein einziges Kleidungsstück und antwortet mit einem Preis, bevor etwas zugeschnitten wird. Jeder Auftrag wird aus 100 % Seide oder 100 % Leinen gefertigt.',
    mtmLink: 'So funktioniert Mass-Anfertigung',
    unreachablePre: 'Aufträge lassen sich im Moment nicht senden – das Atelier ist nicht erreichbar. Schreiben Sie an ',
    unreachablePost: ', dann nimmt das Atelier Ihr Briefing stattdessen per E-Mail entgegen.',
    questions: 'Fragen',
    faq: [
      { q: 'Kann ich mein Kleid online selbst entwerfen?', a: 'Ja. Wählen Sie eine Grundsilhouette und den Stoff, schreiben Sie dem Atelier eine Notiz und geben Sie Ihre Masse an. Das Atelier fertigt ein Kleidungsstück nach diesem Briefing.' },
      { q: 'Wie wird ein Auftrag berechnet?', a: 'Jede Silhouette zeigt einen Richtwert. Das Atelier liest jedes Briefing und antwortet mit dem Preis für Ihr Stück, bevor etwas zugeschnitten wird.' },
      { q: 'Wie lange dauert ein Auftrag?', a: 'Zwei bis vier Wochen in der Werkstatt ab Ihrem bestätigten Massblatt, wie bei einem Stück aus der Kollektion, plus Lieferung.' },
    ],
  },
  shipping: {
    title: 'Versand',
    description: 'Alles wird auf Bestellung gefertigt und von Genf aus versandt. Lieferzeiten, Zoll und Sendungsverfolgung.',
    lead: 'Jedes Kleidungsstück wird nach Ihrem Massblatt zugeschnitten und fertiggestellt, zweimal geprüft und dann von Genf aus versandt.',
    returns: 'Rückgabe',
    questions: 'Fragen',
    timeH: 'Wie lange es dauert',
    time: 'Die Frist beginnt, wenn Ihr Massblatt schriftlich bestätigt ist, nicht bei der Bestellung. Ein Stück braucht zwei bis vier Wochen in der Werkstatt, ob es aus einer Kollektion oder aus einem Auftrag nach Mass stammt.',
    rows: [
      ['Schweiz', 'Zwei bis drei Tage nach dem Versand. Zoll inbegriffen.'],
      ['Europäische Union', 'Drei bis sechs Tage. Zoll im Preis inbegriffen.'],
      ['Vereinigtes Königreich', 'Drei bis sechs Tage. Einfuhrmehrwertsteuer bei Ankunft zahlbar.'],
      ['Übrige Welt', 'Fünf bis zehn Tage. Zölle und Einfuhrabgaben bei Ankunft zahlbar.'],
    ],
    dutyH: 'Zoll und Steuern',
    duty: 'Die Preise verstehen sich in Schweizer Franken und enthalten den Zoll innerhalb der Schweiz und der Europäischen Union – der vereinbarte Betrag ist der Betrag, den Sie zahlen. Ausserhalb dieser Märkte erhebt der Frachtführer Zoll und Einfuhrabgaben bei der Lieferung, festgelegt von Ihrer eigenen Zollbehörde. Das Haus deklariert Pakete nicht als Geschenke und gibt ihren Wert nicht zu niedrig an.',
    trackH: 'Sendungsverfolgung',
    track: 'Wir schreiben Ihnen, wenn das Schnittmuster zugeschnitten ist, wenn das Stück seine zweite Kontrolle bestanden hat und wenn es mit einer Sendungsnummer versandt wird. Bleibt ein Paket beim Zoll hängen, schreiben Sie an hello@bylinsilk.com, das Büro in Genf kümmert sich darum, statt Sie darum zu bitten.',
  },
  returns: {
    title: 'Rückgabe',
    description: 'Warum Mass-Anfertigungen nicht zurückgenommen werden, was bei einem Mangel geschieht und wann eine Bestellung freigegeben werden kann.',
    lead: 'Ein nach den Massen einer einzelnen Person gefertigtes Kleidungsstück lässt sich nicht weiterverkaufen, deshalb bietet das Haus bei Mass-Anfertigungen kein allgemeines Rückgaberecht an.',
    write: 'Dem Haus schreiben',
    faultsH: 'Mängel',
    faults: 'Naturfasern knittern, werden weicher und bewegen sich, und nichts davon ist ein Mangel. Ein Herstellungsfehler – eine aufgegangene Naht, ein ausgefallener Saum oder ein abgerissener Knopf – wird repariert oder das Stück ersetzt, je nachdem, was die Werkstatt für richtig hält.',
    beforeH: 'Bevor etwas zugeschnitten wird',
    before: 'Es wird nichts zugeschnitten, bevor Sie Ihr Massblatt schriftlich bestätigt haben; deshalb kann eine Bestellung bis zu dieser Antwort jederzeit freigegeben werden, vollständig und ohne Begründung.',
  },
  measuring: {
    title: 'Massanleitung',
    metaTitle: 'So nehmen Sie Ihre Masse für ein Kleid: 15 Masse',
    description: 'Eine Schritt-für-Schritt-Anleitung zu den 15 Körpermassen für Mass-Anfertigungen: zehn Minuten, ein weiches Massband und eine Helferin oder ein Helfer, oder jede Schneiderei.',
    lead: 'Es gibt kein S, M oder L. Fünfzehn Masse bestimmen das Kleidungsstück, und sie sind der Teil der Bestellung, für den man sich Zeit nehmen sollte. Zehn Minuten mit einem weichen Massband und jemandem, der hilft, genügen.',
    enter: 'Zur Kollektion',
    help: 'Hilfe anfragen',
    beforeH: 'Bevor Sie beginnen',
    before: [
      'Tragen Sie eng anliegende Kleidung oder gar keine. Nie über einem Pullover messen.',
      'Verwenden Sie ein weiches Massband. Ein Metallbandmass vom Bau folgt dem Körper nicht.',
      'Halten Sie das Massband flach am Körper und rundum waagrecht – prüfen Sie den Rücken im Spiegel.',
      'Stehen Sie so, wie Sie normalerweise stehen. Wer die Schultern zurückzieht, verändert das Kleidungsstück.',
      'Lassen Sie, wenn möglich, jemand anderen Rücken und Schultern messen.',
      'Schreiben Sie Zentimeter, wenn Sie sie haben. Die Website rechnet Zoll um, aber das Massband lässt sich in cm leichter ablesen.',
    ],
    fifteenH: 'Die fünfzehn Masse',
    ratherH: 'Wenn Sie es lieber nicht selbst tun',
    rather: 'Jede Schneiderei oder Änderungsschneiderei nimmt diese fünfzehn Masse in wenigen Minuten, oft kostenlos. Drucken Sie diese Seite aus oder zeigen Sie die Liste auf dem Telefon.',
    wrongH: 'Wenn ein Mass falsch aussieht',
    wrong: 'Das Massblatt markiert einen Wert ausserhalb des üblichen Bereichs dieser Stelle. Das ist eine Aufforderung, das Massband zu prüfen, keine Ablehnung – Körper sind verschieden, und das Atelier schneidet lieber nach einem ungewöhnlichen Wert, den Sie bestätigt haben, als nach einem Tippfehler, den Sie nicht bemerkt haben.',
  },
  contact: {
    metaTitle: 'Das Haus kontaktieren',
    story: {
      title: 'Das Haus',
      lead: 'LINSILK wurde gegründet, um eine Sache richtig zu machen: Kleidung aus reiner Seide und reinem Leinen, für einen einzigen Körper zugeschnitten, in vier kleinen Kollektionen im Jahr.',
      a: 'Bestellungen und Kundenservice werden von Genf aus betreut. Die Preise verstehen sich in Schweizer Franken und enthalten den Zoll innerhalb der Schweiz und der EU. Ein Stück braucht ab dem bestätigten Massblatt zwei bis vier Wochen.',
      b: 'Schreiben Sie an hello@bylinsilk.com, wenn Sie Fragen zu einem Stück oder zu Ihrer Bestellung haben.',
    },
    help: 'Hilfe beim Messen',
  },
};

const FR: PagesText = {
  collection: {
    title: 'La collection : soie et lin sur mesure',
    description: (open) =>
      `${open}Pièces femme et homme en 100 % soie et 100 % lin, chacune coupée et cousue à vos mesures en 2 à 4 semaines.`,
    none: 'Aucune collection n’est ouverte pour le moment. Lorsque la prochaine saison sera coupée, ses pièces apparaîtront ici.',
    commission: 'Commander une pièce sur mesure',
    designs: (n) => `${n} modèles`,
    enter: (who) => `Entrer dans la collection ${who}`,
    women: 'Femme',
    men: 'Homme',
    womenAlt: 'Une femme dans une robe portefeuille en soie sur mesure, sur une loggia ensoleillée au-dessus de la mer',
    menAlt: 'Un homme en chemise et pantalon de lin sur mesure, assis sur des marches de calcaire au-dessus de la mer',
    aboutEyebrow: 'À propos de la collection',
    aboutTitle: 'Soie et lin sur mesure',
    about: (open) =>
      `${open}Chaque pièce LINSILK est coupée et cousue à vos propres mesures en 2 à 4 semaines, en 100 % soie ou 100 % lin. Choisissez une pièce, choisissez sa couleur parmi les échantillons de son tissu et saisissez vos mesures : pas de tailles, pas d’essayages. Quatre petites collections par an, depuis Genève.`,
    links: {
      '/collection/women/silk': 'Robes et robes longues en soie',
      '/collection/women/silk-separates': 'Jupes et chemisiers en soie',
      '/collection/women/linen': 'Ensembles femme en lin',
      '/collection/sleepwear': 'Vêtements de nuit en soie',
      '/collection/men/shirts': 'Chemises homme en lin',
      '/collection/men/trousers': 'Pantalons homme en lin',
      '/occasion/wedding-guest': 'Robes d’invitée de mariage',
    },
  },
  group: {
    women: 'Femme',
    men: 'Homme',
    crumb: 'Collection',
    titleWomen: 'Vêtements femme en soie et en lin, sur mesure',
    titleMen: 'Vêtements homme en lin, sur mesure',
    descWomen:
      'Robes, robes longues, jupes, chemisiers et vêtements de nuit en soie, et ensembles deux pièces en lin, chacun coupé et cousu à vos mesures en 2 à 4 semaines. Depuis Genève.',
    descMen:
      'Chemises, pantalons et tenues deux pièces en lin pour homme, chacun coupé et cousu à vos mesures en 2 à 4 semaines, en 100 % lin. Depuis Genève.',
    intro: (closes) =>
      `Chaque pièce est coupée à vos mesures et fabriquée en série limitée. ${
        closes
          ? `Lorsque la saison se clôt en ${closes}, ces modèles sont archivés et ne sont plus refaits.`
          : 'Lorsque la saison se clôt, ces modèles sont archivés et ne sont plus refaits.'
      }`,
    designs: (n) => `${n} modèles`,
    sleepwear: (label) => `${label} — vêtements de nuit`,
    aboutEyebrow: 'À propos de la collection',
    aboutTitle: 'Faite à vos mesures',
    aboutWomen:
      'Les pièces femme de LINSILK en 100 % soie et 100 % lin, chacune coupée et cousue à vos propres mesures en 2 à 4 semaines.',
    aboutMen: 'Les pièces homme de LINSILK en 100 % lin, chacune coupée et cousue à vos propres mesures en 2 à 4 semaines.',
    colour: 'Choisissez la couleur parmi les échantillons de son tissu, sur la page de la pièce.',
    wedding: 'Robes d’invitée de mariage en soie',
    sleep: 'Vêtements de nuit en soie',
  },
  design: {
    title: 'Concevoir votre robe ou chemise en soie ou en lin',
    description:
      'Concevez votre propre pièce : choisissez une silhouette de base et le tissu, rédigez un brief, ajoutez vos mesures. Un tailleur le lit et vous répond avec un prix. Soie ou lin uniquement.',
    aboutTitle: 'Concevoir sur mesure, à vos mesures',
    about:
      '« Concevoir sur mesure » est le service de commande de LINSILK : vous choisissez une silhouette de base et le tissu, rédigez un brief au tailleur et envoyez vos mesures ; l’atelier fabrique un seul vêtement d’après ce brief et répond avec un prix avant toute coupe. Chaque commande est réalisée en 100 % soie ou 100 % lin.',
    mtmLink: 'Comment fonctionne le sur-mesure',
    unreachablePre: 'Les commandes ne peuvent pas être envoyées pour le moment — le bureau de l’atelier est injoignable. Écrivez à ',
    unreachablePost: ' et un tailleur prendra votre brief par e-mail à la place.',
    questions: 'Questions',
    faq: [
      { q: 'Puis-je concevoir ma robe en ligne ?', a: 'Oui. Choisissez une silhouette de base et le tissu, écrivez une note au tailleur et saisissez vos mesures. L’atelier fabrique un vêtement d’après ce brief.' },
      { q: 'Comment une commande sur mesure est-elle chiffrée ?', a: 'Chaque silhouette affiche un chiffre de départ. Un tailleur lit chaque brief et répond avec le prix de votre pièce avant toute coupe.' },
      { q: 'Combien de temps prend une commande sur mesure ?', a: 'De deux à quatre semaines à l’établi à partir de votre fiche de mesures confirmée, comme pour une pièce de la collection, plus la livraison.' },
    ],
  },
  shipping: {
    title: 'Livraison',
    description: 'Tout est fabriqué sur commande et expédié depuis Genève. Délais, droits de douane et suivi.',
    lead: 'Chaque vêtement est coupé et terminé d’après votre fiche de mesures, contrôlé deux fois, puis expédié depuis Genève.',
    returns: 'Retours',
    questions: 'Questions',
    timeH: 'Combien de temps cela prend',
    time: 'Le délai commence lorsque votre fiche de mesures est confirmée par écrit, pas à la commande. Une pièce demande de deux à quatre semaines à l’établi, qu’elle vienne d’une collection ou d’une commande sur mesure.',
    rows: [
      ['Suisse', 'Deux à trois jours après l’expédition. Droits de douane inclus.'],
      ['Union européenne', 'Trois à six jours. Droits de douane inclus dans le prix.'],
      ['Royaume-Uni', 'Trois à six jours. TVA à l’importation à payer à l’arrivée.'],
      ['Reste du monde', 'Cinq à dix jours. Droits de douane et taxes à l’importation à payer à l’arrivée.'],
    ],
    dutyH: 'Droits de douane et taxes',
    duty: 'Les prix sont en francs suisses et comprennent les droits de douane en Suisse et dans l’Union européenne — le montant convenu est celui que vous payez. En dehors de ces marchés, le transporteur perçoit les droits et taxes à la livraison, fixés par votre propre administration douanière. La maison ne déclare pas les colis comme des cadeaux et ne sous-évalue pas leur valeur.',
    trackH: 'Suivi',
    track: 'Nous vous écrivons lorsque le patron est coupé, lorsque la pièce passe son second contrôle et lorsqu’elle est expédiée avec un numéro de suivi. Si un colis reste bloqué en douane, écrivez à hello@bylinsilk.com : le bureau de Genève s’en charge au lieu de vous le demander.',
  },
  returns: {
    title: 'Retours',
    description: 'Pourquoi le sur-mesure n’est pas repris, ce qui est fait en cas de défaut et quand une commande peut être annulée.',
    lead: 'Un vêtement coupé aux mesures d’une seule personne ne peut pas être revendu : la maison n’offre donc pas de droit de retour général sur le sur-mesure.',
    write: 'Écrire à la maison',
    faultsH: 'Défauts',
    faults: 'Les fibres naturelles se froissent, s’assouplissent et bougent, et rien de cela n’est un défaut. Un défaut de fabrication — une couture qui lâche, un ourlet qui tombe ou un bouton qui se détache — est réparé, ou la pièce remplacée, selon ce que l’atelier juge juste.',
    beforeH: 'Avant toute coupe',
    before: 'Rien n’est coupé tant que vous n’avez pas confirmé votre fiche par écrit : une commande peut donc être annulée à tout moment jusqu’à cette réponse, intégralement et sans motif.',
  },
  measuring: {
    title: 'Guide de mesures',
    metaTitle: 'Comment prendre vos mesures pour une robe : 15 mesures',
    description: 'Un guide pas à pas des 15 mesures du corps pour le sur-mesure : dix minutes, un mètre ruban souple et une aide, ou n’importe quel tailleur.',
    lead: 'Il n’y a ni S, ni M, ni L. Quinze mesures décident du vêtement, et c’est la partie de la commande pour laquelle il vaut la peine de ralentir. Dix minutes avec un mètre ruban souple et quelqu’un pour vous aider suffisent.',
    enter: 'Entrer dans la collection',
    help: 'Demander de l’aide',
    beforeH: 'Avant de commencer',
    before: [
      'Portez des vêtements près du corps, ou aucun. Ne mesurez jamais par-dessus un pull.',
      'Utilisez un mètre ruban souple. Un mètre de chantier en métal ne suit pas le corps.',
      'Gardez le ruban à plat contre vous et bien à l’horizontale tout autour — vérifiez le dos dans un miroir.',
      'Tenez-vous comme vous le faites d’habitude. Tirer les épaules en arrière change le vêtement.',
      'Demandez à quelqu’un de prendre les mesures du dos et des épaules si possible.',
      'Notez en centimètres si vous le pouvez. Le site convertit les pouces, mais le ruban se lit plus facilement en cm.',
    ],
    fifteenH: 'Les quinze mesures',
    ratherH: 'Si vous préférez ne pas le faire vous-même',
    rather: 'N’importe quel tailleur ou atelier de retouches prend ces quinze mesures en quelques minutes, souvent gratuitement. Imprimez cette page, ou montrez-leur la liste sur votre téléphone.',
    wrongH: 'Si une mesure paraît fausse',
    wrong: 'La fiche signale une valeur située hors de la plage habituelle pour cette zone. C’est une invitation à vérifier le ruban, pas un refus — les corps varient, et l’atelier préfère couper à une valeur inhabituelle que vous avez confirmée plutôt qu’à une faute de frappe que vous n’avez pas remarquée.',
  },
  contact: {
    metaTitle: 'Contacter la maison',
    story: {
      title: 'La maison',
      lead: 'LINSILK a été fondée pour faire une seule chose correctement : des vêtements en soie pure et en lin pur, coupés pour un seul corps, en quatre petites collections par an.',
      a: 'Les commandes et le service client sont assurés depuis Genève. Les prix sont en francs suisses et comprennent les droits de douane en Suisse et dans l’UE. Une pièce demande de deux à quatre semaines à partir de la fiche de mesures confirmée.',
      b: 'Écrivez à hello@bylinsilk.com pour toute question sur une pièce ou sur votre commande.',
    },
    help: 'Aide pour les mesures',
  },
};

export function pagesText(lang: Lang): PagesText {
  if (lang === 'en') return EN;
  if (lang === 'fr' || lang === 'fr-ch') return FR;
  return lang === 'de-ch' ? DE_CH : deepDe(DE_CH);
}
