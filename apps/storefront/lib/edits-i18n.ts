/* Translated category pages (docs/seo/SEO-GEO-PLAN.md §6.7, copy in
 * COPY-PAGES.md §3). Each is the English Edit with its words replaced, so the
 * pieces and the prices still come from the same place. German and French here
 * are written for a native-speaker pass before they go live (plan §13.7). */

import { money } from './catalog';
import { EDITS, type Edit, type EditUi } from './edits';
import { toDe, type Locale } from './i18n';
import { enPathOf, translatedPath } from './locale-routes';

type Copy = Pick<Edit, 'title' | 'h1' | 'sections' | 'faqs'> & {
  description: (from: string) => string;
  intro: (span: string) => string;
};

const DE_CH_UI: EditUi = {
  howH2: 'So funktioniert Nach-Mass bei LINSILK',
  howBody:
    'Wählen Sie das Stück, wählen Sie die Farbe aus den Mustern seines Stoffs und geben Sie Ihre Masse ein. Es wird innert 2–4 Wochen nach Ihrem bestätigten Massblatt zugeschnitten und genäht.',
  howLink: 'So funktioniert Nach-Mass',
  questions: 'Fragen',
};

const FR_UI: EditUi = {
  howH2: 'Comment fonctionne le sur-mesure chez LINSILK',
  howBody:
    'Choisissez la pièce, choisissez son coloris parmi les échantillons de son tissu, puis indiquez vos mesures. Elle est coupée et cousue en 2 à 4 semaines à partir de votre fiche de mesures confirmée.',
  howLink: 'Comment fonctionne le sur-mesure',
  questions: 'Questions',
};

const toDeCopy = (c: Copy): Copy => ({
  title: toDe(c.title),
  h1: toDe(c.h1),
  description: (f) => toDe(c.description(f)),
  intro: (s) => toDe(c.intro(s)),
  sections: c.sections.map((x) => ({ h2: toDe(x.h2), body: toDe(x.body) })),
  faqs: c.faqs.map((x) => ({ q: toDe(x.q), a: toDe(x.a) })),
});

type Entry = { copy: Copy; ui: EditUi };

/* One page in all four locales: the Swiss text is written, /de/ derives from
   it, and the French serves both fr-ch and fr. */
const page = (deCh: Copy, fr: Copy): Record<Locale, Entry> => ({
  'de-ch': { copy: deCh, ui: DE_CH_UI },
  de: {
    copy: toDeCopy(deCh),
    ui: Object.fromEntries(Object.entries(DE_CH_UI).map(([k, v]) => [k, toDe(v)])) as EditUi,
  },
  'fr-ch': { copy: fr, ui: FR_UI },
  fr: { copy: fr, ui: FR_UI },
});

const LEAD_DE = {
  q: 'Wie lange dauert es?',
  a: '2–4 Wochen ab Ihrem bestätigten Massblatt, plus Lieferung nach dem Versand aus Genf: 2–3 Tage in der Schweiz, 3–6 Tage in die EU und nach Grossbritannien, 5–10 Tage in andere Länder.',
};
const LEAD_FR = {
  q: 'Combien de temps cela prend-il ?',
  a: '2 à 4 semaines à partir de votre fiche de mesures confirmée, plus la livraison après l’expédition depuis Genève : 2 à 3 jours en Suisse, 3 à 6 jours vers l’UE et le Royaume-Uni, 5 à 10 jours ailleurs.',
};
const LINEN_HEAT_DE = {
  q: 'Ist Leinen gut für heisses Wetter?',
  a: 'Ja. Leinen ist fest, luftig und kühlend; es atmet in der Hitze und wird mit jedem Tragen weicher.',
};
const LINEN_HEAT_FR = {
  q: 'Le lin est-il adapté aux fortes chaleurs ?',
  a: 'Oui. Le lin est ferme, aéré et rafraîchissant ; il respire par forte chaleur et s’assouplit à chaque port.',
};
const CREASE_DE = {
  q: 'Knittert Leinen?',
  a: 'Ja. Natürliches Leinen knittert, wird weicher und altert mit dem Tragen; das ist der Stoff, kein Mangel.',
};
const CREASE_FR = {
  q: 'Le lin se froisse-t-il ?',
  a: 'Oui. Le lin naturel se froisse, s’assouplit et vieillit avec le port ; c’est le tissu, pas un défaut.',
};

/* Keyed by the English page's path. */
const COPY: Record<string, Record<Locale, Entry>> = {
  [EDITS.sleepwear.path]: page(
    {
      title: 'Seidenpyjama und Morgenmantel nach Mass',
      h1: 'Seidenpyjama, Morgenmantel und Slipkleid nach Mass',
      description: (f) =>
        `Seidenpyjamas, Morgenmäntel und Slipkleider nach Ihren Massen, gefertigt innert 2–4 Wochen. Ein persönliches Geschenk${f}. Masse bis 20. November bestätigen.`,
      intro: (s) =>
        `Die Schlafmode von LINSILK wird innert 2–4 Wochen nach Ihren Massen gefertigt, aus 100 % Seide. Pyjama-Sets, ein langer Wickel-Morgenmantel mit Slipkleid, ein dreiteiliges Kimono-Set und ein Slip-Minikleid gibt es in 48 Seidenfarben${s}.`,
      sections: [
        {
          h2: 'Als Geschenk',
          body: 'Ein Geschenk nach Mass braucht die Masse der beschenkten Person: Schicken Sie ihr die Messanleitung, oder bestellen Sie für sich selbst mit einer Geschenknotiz. Für die Lieferung vor den Festtagen bestätigen Sie das Massblatt bis zum 20. November in der Schweiz, bis zum 17. November in der EU und in Grossbritannien und bis zum 13. November für die Vereinigten Arabischen Emirate und den Rest der Welt.',
        },
        {
          h2: 'Warum Seide zum Schlafen',
          body: 'Seide ist glatt, atmungsaktiv und angenehm, ob die Nacht warm oder kühl ist.',
        },
      ],
      faqs: [
        {
          q: 'Ist ein Seidenpyjama ein gutes Geschenk?',
          a: 'Ja, mit einer Einschränkung: Er wird nach Mass gefertigt, daher braucht es die Masse der beschenkten Person. Schicken Sie ihr die Messanleitung, oder bitten Sie sie, die fünfzehn Masse bei einer Schneiderei nehmen zu lassen.',
        },
        LEAD_DE,
      ],
    },
    {
      title: 'Pyjamas et peignoirs en soie sur mesure',
      h1: 'Pyjamas, peignoirs et nuisettes en soie, sur mesure',
      description: (f) =>
        `Pyjamas, peignoirs et nuisettes en soie faits à vos mesures en 2 à 4 semaines. Un cadeau personnel${f}. Mesures à confirmer avant le 20 novembre.`,
      intro: (s) =>
        `Les vêtements de nuit en soie de LINSILK sont faits à vos mesures en 2 à 4 semaines, en 100 % soie. Ensembles pyjama, long peignoir portefeuille avec robe nuisette, ensemble kimono trois pièces et mini-robe nuisette existent en 48 coloris de soie${s}.`,
      sections: [
        {
          h2: 'À offrir',
          body: 'Un cadeau sur mesure demande les mesures de la personne qui le reçoit : envoyez-lui le guide de mesure, ou commandez pour vous-même avec un mot d’accompagnement. Pour une livraison avant les fêtes, confirmez la fiche de mesures avant le 20 novembre en Suisse, le 17 novembre dans l’UE et au Royaume-Uni, et le 13 novembre pour les Émirats arabes unis et le reste du monde.',
        },
        {
          h2: 'Pourquoi la soie pour dormir',
          body: 'La soie est lisse, respire et reste agréable que la nuit soit chaude ou fraîche.',
        },
      ],
      faqs: [
        {
          q: 'Un pyjama en soie est-il un bon cadeau ?',
          a: 'Oui, avec une réserve : il est fait sur mesure, il faut donc les mesures de la personne qui le reçoit. Envoyez-lui le guide de mesure, ou demandez-lui de faire prendre les quinze mesures chez un tailleur.',
        },
        LEAD_FR,
      ],
    },
  ),

  [EDITS['women/silk'].path]: page(
    {
      title: 'Seidenkleider und Abendkleider nach Mass',
      h1: 'Seidenkleider und Abendkleider nach Mass',
      description: (f) =>
        `Seidenkleider und Abendkleider nach Ihren Massen, gefertigt innert 2–4 Wochen. Wickel-, Slip- und Neckholderkleider in 48 Seidenfarben${f}.`,
      intro: (s) =>
        `Das sind die Kleider und Abendkleider von LINSILK, jedes aus 100 % Seide nach Ihren eigenen Massen zugeschnitten und genäht, innert 2–4 Wochen. Wickelkleider, Slipkleider, Neckholder- und bodenlange Abendkleider gibt es in 48 Seidenfarben${s}.`,
      sections: [
        {
          h2: 'Nach Anlass wählen',
          body: 'Abend und Gala: die Neckholder-, Wasserfall- und Stehkragen-Abendkleider, bodenlang mit Schlitz. Hochzeitsgast: die Wickel-, Midi- und Volantärmelkleider. Lange Ärmel und volle Länge: das Wickel-Maxikleid mit langen Ärmeln.',
        },
        {
          h2: 'Warum Seide',
          body: 'Reine Seide ist glatt und leicht, fällt, ohne zu kleben, und ist angenehm, ob es warm oder kühl ist. Jedes Kleid hier ist aus 100 % Seide gefertigt.',
        },
      ],
      faqs: [
        {
          q: 'Was ist ein Seidenkleid nach Mass?',
          a: 'Ein Seidenkleid, das nach Ihren eigenen Massen statt in einer Standardgrösse zugeschnitten und genäht wird. Bei LINSILK geben Sie fünfzehn Masse ein, wählen eine von 48 Seidenfarben, und das Kleid wird innert 2–4 Wochen für Sie gefertigt.',
        },
        LEAD_DE,
        {
          q: 'Welches Seidenkleid passt für Hochzeitsgäste?',
          a: 'Die Wickel-, Midi- und Volantärmelkleider passen zu den meisten Hochzeiten, die Neckholder- und Stehkragen-Abendkleider zu Black Tie. Bestellen Sie etwa sechs Wochen vorher.',
        },
      ],
    },
    {
      title: 'Robes en soie et robes de soirée sur mesure',
      h1: 'Robes en soie et robes de soirée sur mesure',
      description: (f) =>
        `Robes en soie et robes de soirée faites à vos mesures en 2 à 4 semaines. Portefeuille, nuisette, dos-nu, longues. 48 coloris de soie${f}.`,
      intro: (s) =>
        `Voici les robes en soie de LINSILK, chacune coupée et cousue en 100 % soie à vos propres mesures en 2 à 4 semaines. Robes portefeuille, robes nuisette, dos-nu et longues robes de soirée existent en 48 coloris de soie${s}.`,
      sections: [
        {
          h2: 'Choisir selon l’occasion',
          body: 'Soirée et gala : les robes dos-nu, col bénitier et col montant, longues avec fente. Invitée de mariage : les robes portefeuille, midi et à manches volantées. Manches longues et grande longueur : la robe maxi portefeuille à manches longues.',
        },
        {
          h2: 'Pourquoi la soie',
          body: 'La soie pure est lisse et légère, tombe sans coller et reste agréable qu’il fasse chaud ou frais. Chaque robe ici est en 100 % soie.',
        },
      ],
      faqs: [
        {
          q: 'Qu’est-ce qu’une robe en soie sur mesure ?',
          a: 'Une robe en soie coupée et cousue à vos propres mesures plutôt que dans une taille standard. Chez LINSILK, vous indiquez quinze mesures, choisissez l’un des 48 coloris de soie, et la robe est faite pour vous en 2 à 4 semaines.',
        },
        LEAD_FR,
        {
          q: 'Quelle robe en soie convient à une invitée de mariage ?',
          a: 'Les robes portefeuille, midi et à manches volantées conviennent à la plupart des mariages ; les robes dos-nu et à col montant conviennent à une tenue de cérémonie du soir. Commandez environ six semaines avant.',
        },
      ],
    },
  ),

  [EDITS['women/silk-separates'].path]: page(
    {
      title: 'Seidenröcke und Seidenblusen nach Mass',
      h1: 'Seidenröcke und Seidenblusen nach Mass',
      description: (f) =>
        `Schräg geschnittene Seidenröcke und Seidenblusen, nach Ihren Massen gefertigt innert 2–4 Wochen. 100 % Seide, 48 Farben${f}.`,
      intro: (s) =>
        `Die Seiden-Midi- und -Maxiröcke von LINSILK sind schräg geschnitten, die Seidenblusen gibt es mit Rüschenfront oder Stehkragen; jedes Stück wird innert 2–4 Wochen nach Ihren Massen zugeschnitten und genäht, aus 100 % Seide in 48 Seidenfarben${s}.`,
      sections: [
        {
          h2: 'Schräg geschnitten',
          body: 'Ein schräg geschnittener Rock wird diagonal zum Gewebe zugeschnitten, so fällt und bewegt sich die Seide mit Ihnen, statt gerade zu hängen.',
        },
      ],
      faqs: [
        {
          q: 'Welche Masse braucht ein Rock?',
          a: 'Nur Taille, Hüfte und Hüfttiefe, dazu die Rocklänge von Ihrer natürlichen Taille bis dorthin, wo der Saum fallen soll.',
        },
        LEAD_DE,
      ],
    },
    {
      title: 'Jupes et chemisiers en soie sur mesure',
      h1: 'Jupes et chemisiers en soie, sur mesure',
      description: (f) =>
        `Jupes en soie coupées dans le biais et chemisiers en soie, faits à vos mesures en 2 à 4 semaines. 100 % soie, 48 coloris${f}.`,
      intro: (s) =>
        `Les jupes midi et maxi en soie de LINSILK sont coupées dans le biais, et ses chemisiers en soie ont un devant à volants ou un col montant ; chaque pièce est coupée et cousue à vos mesures en 2 à 4 semaines, en 100 % soie, en 48 coloris de soie${s}.`,
      sections: [
        {
          h2: 'Coupée dans le biais',
          body: 'Une jupe coupée dans le biais est taillée en diagonale du tissage : la soie tombe et bouge avec vous au lieu de pendre droit.',
        },
      ],
      faqs: [
        {
          q: 'Quelles mesures faut-il pour une jupe ?',
          a: 'Seulement le tour de taille, le tour de hanches et la profondeur de hanches, plus la longueur de jupe depuis la taille naturelle jusqu’à l’endroit où l’ourlet doit tomber.',
        },
        LEAD_FR,
      ],
    },
  ),

  [EDITS['women/linen'].path]: page(
    {
      title: 'Leinen-Zweiteiler für Damen nach Mass',
      h1: 'Leinen-Zweiteiler für Damen nach Mass',
      description: (f) =>
        `Damen-Sets aus Leinen (Weste, Top und Hose), nach Ihren Massen gefertigt innert 2–4 Wochen. 100 % Leinen, 40 Farben${f}.`,
      intro: (s) =>
        `Die Leinen-Sets für Damen von LINSILK kombinieren Weste, Top oder Bluse mit Hose, jedes nach Ihren Massen zugeschnitten und genäht, innert 2–4 Wochen. Sie sind aus 100 % Leinen gefertigt, in 40 Leinenfarben${s}.`,
      sections: [
        {
          h2: 'Für warme Tage und Reisen',
          body: 'Leinen ist fest, luftig und kühlend; es atmet in der Hitze und wird mit jedem Tragen weicher. Natürliche Knitterfalten gehören zum Stoff.',
        },
        {
          h2: 'Zwei Teile, eine Bestellung',
          body: 'Ein Set besteht aus zwei Teilen in einer Bestellung, jedes mit eigener Länge auf demselben Massblatt.',
        },
      ],
      faqs: [LINEN_HEAT_DE, CREASE_DE, LEAD_DE],
    },
    {
      title: 'Ensembles en lin pour femme sur mesure',
      h1: 'Ensembles en lin pour femme, sur mesure',
      description: (f) =>
        `Ensembles gilet-pantalon et top-pantalon en lin pour femme, faits à vos mesures en 2 à 4 semaines. 100 % lin, 40 coloris${f}.`,
      intro: (s) =>
        `Les ensembles en lin de LINSILK associent un gilet, un top ou une chemise à un pantalon, chacun coupé et cousu à vos mesures en 2 à 4 semaines. Ils sont en 100 % lin, en 40 coloris${s}.`,
      sections: [
        {
          h2: 'Pour les beaux jours et les voyages',
          body: 'Le lin est ferme, aéré et rafraîchissant ; il respire par forte chaleur et s’assouplit à chaque port. Le froissement naturel fait partie du tissu.',
        },
        {
          h2: 'Deux pièces, une commande',
          body: 'Un ensemble compte deux pièces dans une même commande, chacune avec sa propre longueur sur la même fiche de mesures.',
        },
      ],
      faqs: [LINEN_HEAT_FR, CREASE_FR, LEAD_FR],
    },
  ),

  [EDITS['men/shirts'].path]: page(
    {
      title: 'Leinenhemden für Herren nach Mass',
      h1: 'Leinenhemden für Herren nach Mass',
      description: (f) =>
        `Leinenhemden für Herren: Camp-Kragen, Kentkragen, Stehkragen, Wickel- und Überziehhemd. Nach Ihren Massen gefertigt innert 2–4 Wochen${f}.`,
      intro: (s) =>
        `Die Leinenhemden für Herren von LINSILK werden innert 2–4 Wochen nach Ihren eigenen Massen zugeschnitten und genäht, aus 100 % Leinen. Wählen Sie Camp-Kragen-, Kentkragen-, Stehkragen-, Wickel- oder Überziehhemden in 40 Leinenfarben${s}.`,
      sections: [
        {
          h2: 'Leinen für Hitze und Reisen',
          body: 'Leinen atmet, darum bleibt ein Leinenhemd bei warmem Wetter luftig und wird mit jeder Wäsche weicher.',
        },
        {
          h2: 'Nach Mass, nicht nach Grösse',
          body: 'Ihr Hemd folgt Ihren Massen für Schulter, Brust, Ärmel und Länge, nicht dem nächsten S, M oder L.',
        },
      ],
      faqs: [
        {
          q: 'Kann ich ein Leinenhemd online nach Mass bestellen?',
          a: 'Ja. Wählen Sie das Hemd, wählen Sie die Farbe aus den Leinenmustern, geben Sie Ihre Masse ein, und es wird innert 2–4 Wochen für Sie zugeschnitten und genäht.',
        },
        LINEN_HEAT_DE,
        CREASE_DE,
      ],
    },
    {
      title: 'Chemises en lin pour homme sur mesure',
      h1: 'Chemises en lin pour homme, sur mesure',
      description: (f) =>
        `Chemises en lin pour homme : col cubain, col italien, col mao, modèle portefeuille et chemise à enfiler. Faites à vos mesures en 2 à 4 semaines${f}.`,
      intro: (s) =>
        `Les chemises en lin pour homme de LINSILK sont coupées et cousues à vos propres mesures en 2 à 4 semaines, en 100 % lin. Choisissez un col cubain, un col italien, un col mao, un modèle portefeuille ou une chemise à enfiler, en 40 coloris de lin${s}.`,
      sections: [
        {
          h2: 'Le lin pour la chaleur et les voyages',
          body: 'Le lin respire : une chemise en lin reste aérée par temps chaud et s’assouplit à chaque lavage.',
        },
        {
          h2: 'Sur mesure, pas une taille',
          body: 'Votre chemise suit vos mesures d’épaules, de poitrine, de manche et de longueur, pas le S, M ou L le plus proche.',
        },
      ],
      faqs: [
        {
          q: 'Puis-je commander une chemise en lin sur mesure en ligne ?',
          a: 'Oui. Choisissez la chemise, choisissez son coloris parmi les échantillons de lin, indiquez vos mesures, et elle est coupée et cousue pour vous en 2 à 4 semaines.',
        },
        LINEN_HEAT_FR,
        CREASE_FR,
      ],
    },
  ),

  [EDITS['men/trousers'].path]: page(
    {
      title: 'Leinenhosen und Leinen-Looks für Herren nach Mass',
      h1: 'Leinenhosen und Leinen-Looks für Herren nach Mass',
      description: (f) =>
        `Leinenhosen mit Bundfalten, gerade, weit und Gurkha sowie komplette Leinen-Looks für Herren, nach Ihren Massen gefertigt innert 2–4 Wochen. 100 % Leinen${f}.`,
      intro: (s) =>
        `LINSILK fertigt Leinenhosen für Herren, mit Bundfalten, gerade, weit und als Gurkha, sowie zweiteilige Leinen-Looks, jedes Stück innert 2–4 Wochen nach Ihren Massen zugeschnitten und genäht, aus 100 % Leinen in 40 Farben${s}.`,
      sections: [
        {
          h2: 'Sommerhochzeiten und Ferien',
          body: 'Ein kompletter Leinen-Look für eine Sommerhochzeit besteht aus Hemd und Hose, gemeinsam bestellt und jeweils nach Ihren Massen gefertigt.',
        },
      ],
      faqs: [
        {
          q: 'Wie wähle ich die Hosenlänge?',
          a: 'Messen Sie von Ihrer natürlichen Taille an der Aussenseite des Beins bis dorthin, wo der Saum fallen soll, ohne Schuhe.',
        },
        CREASE_DE,
        LEAD_DE,
      ],
    },
    {
      title: 'Pantalons en lin et tenues complètes pour homme, sur mesure',
      h1: 'Pantalons en lin et tenues complètes pour homme, sur mesure',
      description: (f) =>
        `Pantalons en lin à pinces, droits, larges et gurkha et tenues complètes en lin pour homme, faits à vos mesures en 2 à 4 semaines. 100 % lin${f}.`,
      intro: (s) =>
        `LINSILK réalise des pantalons en lin pour homme, à pinces, droits, larges et gurkha, ainsi que des tenues en lin deux pièces, chaque pièce coupée et cousue à vos mesures en 2 à 4 semaines, en 100 % lin et 40 coloris${s}.`,
      sections: [
        {
          h2: 'Mariages d’été et vacances',
          body: 'Une tenue complète en lin pour un mariage d’été, c’est une chemise et un pantalon commandés ensemble, chacun à vos mesures.',
        },
      ],
      faqs: [
        {
          q: 'Comment choisir la longueur du pantalon ?',
          a: 'Mesurez depuis la taille naturelle le long de l’extérieur de la jambe jusqu’à l’endroit où l’ourlet doit tomber, sans chaussures.',
        },
        CREASE_FR,
        LEAD_FR,
      ],
    },
  ),

  [EDITS['wedding-guest'].path]: page(
    {
      title: 'Kleid für Hochzeitsgäste aus Seide nach Mass',
      h1: 'Outfit für Hochzeitsgäste aus Seide, nach Mass',
      description: (f) =>
        `Elegante Kleider für Hochzeitsgäste aus 100 % Seide, nach Ihren Massen. 6 Wochen vorher bestellen: 2–4 Wochen Fertigung plus Versand${f}.`,
      intro: () =>
        'Ein Seidenkleid nach Ihren Massen sitzt an diesem Tag richtig: Es bewegt sich mit Ihnen, atmet durch eine lange Trauung und ist innert 2–4 Wochen ab bestätigtem Massblatt fertig. Bestellen Sie etwa sechs Wochen vor einer Hochzeit in Europa, acht Wochen vor einer weiter entfernten, und wählen Sie aus den Wickel-, Midi- und Volantärmelkleidern von LINSILK in 48 Seidenfarben.',
      sections: [
        {
          h2: 'Zeitplan',
          body: 'Die Fertigung dauert 2–4 Wochen ab Ihren bestätigten Massen; die Lieferung dauert nach dem Versand 2–3 Tage innerhalb der Schweiz, 3–6 Tage in die EU und nach Grossbritannien und 5–10 Tage in andere Länder.',
        },
        {
          h2: 'Nach Dresscode',
          body: 'Black Tie: die Neckholder- und Stehkragen-Abendkleider aus Seide. Cocktail: die Midi-Wickelkleider und Volantärmelkleider. Tagsüber und im Garten: ein Seiden-Midirock mit einer Seidenbluse.',
        },
        {
          h2: 'Persönlich gemacht',
          body: 'Wählen Sie aus glatter Seide, Jacquard oder Brokat und bestimmen Sie die Länge mit Ihrem eigenen Längenmass.',
        },
      ],
      faqs: [
        {
          q: 'Was zieht man als Hochzeitsgast an?',
          a: 'Ein Kleid, das zum Dresscode und zur Jahreszeit passt, aus einem Stoff, der den ganzen Tag atmet. Midi- und Wickelkleider aus Seide passen zu den meisten Hochzeiten, Abendkleider aus Seide zu Black Tie.',
        },
        {
          q: 'Ist Seide bei Sommerhitze angenehm?',
          a: 'Ja. Seide atmet und liegt leicht auf der Haut, und sie bleibt angenehm, wenn die Temperatur sinkt wie auch wenn sie steigt.',
        },
        {
          q: 'Kann ich sechs Wochen vor dem Termin bestellen?',
          a: 'Ja, in Europa: 2–4 Wochen Fertigung ab Ihrem bestätigten Massblatt, dann 2–6 Tage bis zur Ankunft. Rechnen Sie bei einer weiter entfernten Hochzeit mit acht Wochen.',
        },
      ],
    },
    {
      title: 'Robe d’invitée de mariage en soie sur mesure',
      h1: 'Tenue d’invitée de mariage en soie, sur mesure',
      description: (f) =>
        `Robes d’invitée de mariage en 100 % soie, faites à vos mesures. Commandez 6 semaines avant : 2 à 4 semaines de confection, plus la livraison${f}.`,
      intro: () =>
        'Une robe en soie faite à vos mesures tombe juste le jour J : elle suit vos mouvements, respire pendant toute la cérémonie et est prête en 2 à 4 semaines après validation de votre fiche de mesures. Commandez environ six semaines avant un mariage en Europe, huit semaines avant un mariage plus lointain, parmi les robes portefeuille, midi et à manches volantées de LINSILK en 48 coloris de soie.',
      sections: [
        {
          h2: 'Délais',
          body: 'La confection prend 2 à 4 semaines à partir de vos mesures confirmées ; la livraison prend, une fois la robe expédiée, 2 à 3 jours en Suisse, 3 à 6 jours vers l’UE et le Royaume-Uni et 5 à 10 jours ailleurs.',
        },
        {
          h2: 'Selon le code vestimentaire',
          body: 'Cérémonie du soir : les robes de soirée dos-nu et à col montant en soie. Cocktail : les robes portefeuille midi et à manches volantées. Journée et jardin : une jupe midi en soie avec un chemisier en soie.',
        },
        {
          h2: 'La rendre personnelle',
          body: 'Choisissez parmi les soies unies, jacquard ou brocart, et fixez la longueur avec votre propre mesure de longueur.',
        },
      ],
      faqs: [
        {
          q: 'Que porter comme invitée à un mariage ?',
          a: 'Une robe adaptée au code vestimentaire et à la saison, dans un tissu qui respire toute la journée. Les robes midi et portefeuille en soie conviennent à la plupart des mariages, les robes de soirée en soie à une tenue de cérémonie.',
        },
        {
          q: 'La soie est-elle agréable par forte chaleur ?',
          a: 'Oui. La soie respire et repose légèrement sur la peau, et reste agréable quand la température baisse comme quand elle monte.',
        },
        {
          q: 'Puis-je commander six semaines avant la date ?',
          a: 'Oui, en Europe : 2 à 4 semaines de confection à partir de votre fiche confirmée, puis 2 à 6 jours pour arriver. Prévoyez huit semaines pour un mariage plus lointain.',
        },
      ],
    },
  ),
};

export const fromIn = (low: number | undefined, locale: Locale) =>
  low === undefined ? '' : locale.startsWith('de') ? `, ab ${money(low)}` : `, dès ${money(low)}`;

const span = (r: { from: number; to: number } | null, locale: Locale) =>
  !r
    ? ''
    : r.from === r.to
      ? `, ${money(r.from)}`
      : locale.startsWith('de')
        ? `, ab ${money(r.from)} bis ${money(r.to)}`
        : `, dès ${money(r.from)} jusqu’à ${money(r.to)}`;

/** The translated Edit for a locale and slug, or undefined. */
export function editForSlug(locale: Locale, slug: string): Edit | undefined {
  const enPath = enPathOf(locale, slug);
  const entry = enPath && COPY[enPath]?.[locale];
  if (!enPath || !entry) return undefined;
  const en = Object.values(EDITS).find((e) => e.path === enPath)!;
  const { copy, ui } = entry;
  return {
    ...en,
    path: translatedPath(locale, enPath)!,
    title: copy.title,
    h1: copy.h1,
    description: (r) => copy.description(fromIn(r?.from, locale)),
    intro: (r) => copy.intro(span(r, locale)),
    sections: copy.sections,
    faqs: copy.faqs,
    crumb: [],
    locale,
    enPath,
    ui,
  };
}
