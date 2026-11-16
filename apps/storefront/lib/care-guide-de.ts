/* Die Pflegeanleitung auf Deutsch. Geschrieben in der Sprache, wie ein Haus
 * für Seide, Leinen und Kaschmir sie einer Kundin oder einem Kunden gegenüber
 * spricht: Hochdeutsch mit ß, Sie-Form, kurze Sätze, die gängigen Wörter der
 * Textilpflege (Feinwaschmittel, Schonwaschgang, Wollprogramm, Reinigung).
 * Nicht aus dem Englischen übertragen; die Regeln dahinter sind dieselben wie
 * in care-guide.ts (docs/care/CARE-GUIDE-PLAN.md §0). */

import type { CareCopy, ClothCare } from './care-guide';

const silk: ClothCare = {
  name: 'Seide',
  forCloth: 'Seide',
  feel: 'Fließend, kühl, federleicht auf der Haut',
  texture: '/swatches/silk/LS-S07.webp',
  glance: [
    { icon: 'washHand', label: 'Handwäsche, 30°' },
    { icon: 'noBleach', label: 'Nicht bleichen' },
    { icon: 'dryFlatShade', label: 'Liegend, im Schatten' },
    { icon: 'noTumble', label: 'Kein Trockner' },
    { icon: 'iron1', label: 'Niedrig bügeln' },
    { icon: 'dryCleanP', label: 'Reinigung möglich' },
  ],
  rules: [
    'Immer kühles Wasser und ein Feinwaschmittel für Seide.',
    'Das Wasser ausdrücken, nie auswringen oder verdrehen.',
    'Parfum und Deodorant erst trocknen lassen, dann anziehen.',
  ],
  notice: {
    title: 'Jacquard- oder Brokatseide?',
    body: 'Seiden mit gewebtem Muster gehören ausschließlich in die professionelle Reinigung. Das Muster steckt im Gewebe selbst und kann sich beim Waschen zu Hause wellen oder verziehen. Die Schritte unten gelten für schlichte Seide.',
  },
  washH: 'Von Hand waschen',
  washIntro: 'Fünf ruhige Minuten am Waschbecken, mehr braucht schlichte Seide nicht.',
  wash: [
    { icon: 'basin', title: 'Kühles Wasser', body: 'Ein sauberes Becken mit kühlem Wasser füllen, höchstens 30 °C.' },
    { icon: 'bottle', title: 'Ein Schuss Seidenwaschmittel', body: 'Eine Kappe pH-neutrales Feinwaschmittel für Seide. Ohne Enzyme, ohne Bleichmittel, ohne Weichspüler.' },
    { icon: 'swirl', title: 'Auf links, ganz sanft', body: 'Das Stück auf links drehen und drei bis fünf Minuten durchs Wasser bewegen. Nicht reiben, nicht schrubben.' },
    { icon: 'rinse', title: 'Kühl nachspülen', body: 'In klarem, kühlem Wasser spülen, bis keine Seifenreste mehr da sind.' },
    { icon: 'pressPalms', title: 'Drücken statt wringen', body: 'Das Wasser zwischen flachen Händen ausdrücken. Nasse Seidenfasern reißen, wenn man sie wringt.' },
    { icon: 'towelRoll', title: 'Im Handtuch ausrollen', body: 'Auf ein sauberes Handtuch legen, aufrollen und einmal andrücken, damit die Restfeuchte herauszieht.' },
  ],
  washAlt: {
    title: 'In der Maschine, wenn es schnell gehen muss',
    body: 'Nicht die erste Wahl, aber bei schlichter Seide möglich: Schonwaschgang bei 30 °C, im Wäschenetz, mit niedrigster Schleuderzahl und nur zusammen mit anderer Seide. Gleich nach dem Programm herausnehmen.',
  },
  dry: [
    { icon: 'dryFlat', text: 'Liegend auf einem trockenen Handtuch oder auf einem gepolsterten Bügel trocknen.' },
    { icon: 'shade', text: 'Drinnen oder im Schatten, weg von Sonne und Heizkörpern.' },
    { icon: 'clock', text: 'Seide trocknet schnell, meist ist sie nach ein paar Stunden fertig.' },
  ],
  dryNever: 'Nie in den Wäschetrockner',
  heat: 1,
  heatLabel: 'Niedrig, Stufe für Seide',
  press: [
    { icon: 'insideOut', text: 'Auf links bügeln, und nur, wenn die Seide ganz trocken ist.' },
    { icon: 'pressCloth', text: 'Ein dünnes Baumwolltuch zwischen Bügeleisen und Seide legen.' },
    { icon: 'noSpray', text: 'Nicht mit Wasser besprühen: Tropfen können Flecken hinterlassen.' },
    { icon: 'steamer', text: 'Am einfachsten geht es mit dem Dampfglätter, eine Handbreit Abstand.' },
  ],
  wear: [
    { icon: 'perfume', text: 'Erst Parfum, Haarspray und Deodorant, dann das Kleid, wenn alles getrocknet ist.' },
    { icon: 'air', text: 'Nach einem Abend auf dem Bügel auslüften lassen, statt jedes Mal zu waschen.' },
    { icon: 'rest', text: 'Einen Tag Ruhe zwischen zwei Anlässen, dann erholen sich die Fasern.' },
    { icon: 'sun', text: 'Lange, direkte Sonne meiden: Sie lässt Seide mit der Zeit ausbleichen.' },
  ],
  store: {
    method: 'padded',
    label: 'Auf dem gepolsterten Bügel',
    tips: [
      { icon: 'hangerPadded', text: 'Kleider und Blusen auf gepolsterte Bügel hängen, Knöpfe geschlossen.' },
      { icon: 'bag', text: 'Abendkleider in eine atmungsaktive Baumwollhülle, nie in Plastik.' },
      { icon: 'dark', text: 'Kühl, dunkel und trocken, mit etwas Platz um jedes Stück.' },
    ],
  },
  keep: [
    'Kühles Wasser, höchstens 30 °C',
    'pH-neutrales Seidenwaschmittel',
    'Ausdrücken und im Handtuch ausrollen',
    'Niedrig bügeln, auf links, mit Tuch',
    'Gepolsterte Bügel und Baumwollhüllen',
  ],
  avoid: [
    'Heißes Wasser, Bleichmittel, Weichspüler, Enzyme',
    'Wringen, Schrubben, Reiben an Flecken',
    'Wäschetrockner und Heizkörper',
    'Wasser beim Bügeln aufsprühen',
    'Plastikhüllen und starke Sonne',
  ],
};

const linen: ClothCare = {
  name: 'Leinen',
  forCloth: 'Leinen',
  feel: 'Luftig, knackig, mit jeder Wäsche weicher',
  texture: '/swatches/linen/LS-L04.webp',
  glance: [
    { icon: 'dryCleanP', label: 'Erste Wäsche: Reinigung' },
    { icon: 'wash30Gentle', label: 'Danach 30°, schonend' },
    { icon: 'noBleach', label: 'Nicht bleichen' },
    { icon: 'lineDryShade', label: 'Aufhängen' },
    { icon: 'noTumble', label: 'Kein Trockner' },
    { icon: 'iron2', label: 'Mittel bügeln' },
  ],
  rules: [
    'Die erste Wäsche übernimmt eine professionelle Reinigung.',
    'Danach: 30 °C, Schonwaschgang, kein Trockner.',
    'Leinen bügelt man, solange es noch leicht feucht ist.',
  ],
  notice: {
    title: 'Die erste Wäsche gehört in die Reinigung',
    body: 'Leinen geht beim ersten Waschen am meisten ein, und das Leinen von LINSILK ist nicht vorgewaschen. Zu Hause gewaschen, kann es dabei einige Zentimeter verlieren, und damit auch den Sitz, der nach Ihren Maßen gearbeitet wurde. Lassen Sie es beim ersten Mal schonend reinigen. Ab der zweiten Wäsche geht es bequem zu Hause.',
  },
  washH: 'Ab der zweiten Wäsche',
  washIntro: 'Leinen ist das unkomplizierteste der drei Gewebe und wird mit jeder Wäsche weicher.',
  wash: [
    { icon: 'insideOut', title: 'Schließen und wenden', body: 'Knöpfe schließen, Taschen leeren und das Stück auf links drehen.' },
    { icon: 'meshBag', title: 'Ins Wäschenetz', body: 'Im Netz bleiben Knöpfe und Nähte nicht an der Trommel hängen.' },
    { icon: 'wash30Gentle', title: 'Schonend, 30 °C', body: 'Schon- oder Pflegeleichtprogramm bei 30 °C mit mildem Waschmittel. Kein Bleichmittel.' },
    { icon: 'similar', title: 'Mit Ähnlichem', body: 'Zusammen mit Leinen oder Baumwolle in ähnlichem Farbton waschen und die Trommel nicht überfüllen.' },
    { icon: 'shake', title: 'Ausschütteln', body: 'Direkt nach dem Waschen kräftig ausschütteln und die Nähte mit den Händen glattstreichen.' },
    { icon: 'hangerWide', title: 'Im Schatten aufhängen', body: 'Auf einem breiten Bügel im Schatten trocknen. Auch Handwäsche in kühlem Wasser ist völlig in Ordnung.' },
  ],
  dry: [
    { icon: 'hangerWide', text: 'Hemden und Jacken auf einen breiten Bügel, Hosen am Bund aufhängen.' },
    { icon: 'shade', text: 'Im Schatten oder drinnen: Starke Sonne kann dunkles Leinen ausbleichen.' },
    { icon: 'clock', text: 'Wer bügeln möchte, nimmt es ab, solange es noch leicht feucht ist.' },
  ],
  dryNever: 'Nie in den Wäschetrockner',
  heat: 2,
  heatLabel: 'Mittel, solange es noch leicht feucht ist',
  press: [
    { icon: 'insideOut', text: 'Von links bügeln, dunkles Leinen unbedingt, damit es nicht glänzt.' },
    { icon: 'spray', text: 'Schon trocken? Leicht besprühen und fünf Minuten ziehen lassen.' },
    { icon: 'steamer', text: 'Der Dampfglätter lockert Falten schnell, macht Leinen aber nicht glatt wie ein Bügeleisen.' },
    { icon: 'crease', text: 'Manche Falten sind mittags wieder da. So ist Leinen eben.' },
  ],
  wear: [
    { icon: 'crease', text: 'Knitterfalten gehören zu Leinen; sie werden beim Tragen weicher.' },
    { icon: 'air', text: 'Über Nacht auslüften, dann ist Leinen schnell wieder frisch.' },
    { icon: 'sun', text: 'Gemacht für warme Tage, Terrassen und lange Mittagessen.' },
    { icon: 'perfume', text: 'Parfum erst trocknen lassen, besonders bei hellem Leinen.' },
  ],
  store: {
    method: 'wide',
    label: 'Auf dem breiten Bügel',
    tips: [
      { icon: 'hangerWide', text: 'Hemden und Jacken auf breite Bügel, die die Schulter stützen.' },
      { icon: 'fold', text: 'Hosen locker in der Bügelfalte legen, nicht eng stapeln.' },
      { icon: 'bag', text: 'Über den Winter: sauber in einen Baumwollbeutel, nie in luftdichtes Plastik.' },
    ],
  },
  keep: [
    'Eine professionelle erste Wäsche',
    '30 °C, Schonwaschgang, Wäschenetz',
    'Ausschütteln und im Schatten trocknen',
    'Feucht auf der Rückseite bügeln',
    'Breite Bügel und etwas Luft im Schrank',
  ],
  avoid: [
    'Die erste Wäsche zu Hause',
    'Heißwäsche und Bleichmittel',
    'Der Wäschetrockner',
    'Dunkles Leinen auf der Vorderseite bügeln',
    'Luftdichtes Plastik bei langer Lagerung',
  ],
};

const cashmere: ClothCare = {
  name: 'Kaschmir',
  forCloth: 'Kaschmir',
  feel: 'Weich, warm, klar geschnitten',
  texture: '/swatches/cashmere/LS-C05.webp',
  glance: [
    { icon: 'washHand', label: 'Handwäsche, 30°' },
    { icon: 'wash30Wool', label: 'Oder Wollprogramm, 30°' },
    { icon: 'noBleach', label: 'Nicht bleichen' },
    { icon: 'dryFlat', label: 'Liegend trocknen' },
    { icon: 'noTumble', label: 'Kein Trockner' },
    { icon: 'iron2', label: 'Mit Tuch bügeln' },
  ],
  rules: [
    'Zwischen dem Tragen bürsten und lüften, nur bei Bedarf waschen.',
    'Vom Waschen bis zum Spülen dieselbe kühle Temperatur.',
    'Liegend trocknen, die Bügelfalte danach mit einem Tuch nachziehen.',
  ],
  washH: 'Von Hand waschen',
  washIntro: 'Kaschmir muss viel seltener gewaschen werden, als man denkt. Wenn es doch sein muss: kühles Wasser, sanfte Hände.',
  wash: [
    { icon: 'basin', title: 'Kühles Wasser', body: 'Ein Becken mit kühlem Wasser, höchstens 30 °C, und die Hose auf links drehen.' },
    { icon: 'bottle', title: 'Woll- und Kaschmirwaschmittel', body: 'Ein mildes Waschmittel für Wolle. Gewöhnliche Waschmittel mit Enzymen greifen die Faser an.' },
    { icon: 'soak', title: 'Einweichen, dann drücken', body: 'Zehn Minuten einweichen, dann das Wasser sanft durchdrücken. Nicht reiben.' },
    { icon: 'rinse', title: 'Gleich temperiert spülen', body: 'Mit Wasser derselben Temperatur spülen. Ein plötzlicher Wechsel zieht die Faser zusammen.' },
    { icon: 'towelRoll', title: 'Im Handtuch ausrollen', body: 'Mit beiden Händen herausheben, auf ein Handtuch legen und aufrollen, um das Wasser herauszudrücken.' },
    { icon: 'dryFlat', title: 'Liegend trocknen, in Form ziehen', body: 'Flach hinlegen, an der Bügelfalte ausrichten und Bund und Taschen mit den Händen glätten.' },
  ],
  washAlt: {
    title: 'In der Maschine',
    body: 'Wollprogramm bei 30 °C, im Wäschenetz, mit niedriger Schleuderzahl, danach liegend trocknen. Handwäsche schont Bügelfalte und Bund mehr; die Maschine ist für Tage, an denen die Zeit knapp ist.',
  },
  dry: [
    { icon: 'dryFlat', text: 'Liegend auf einem trockenen Handtuch, einmal wenden; nie nass aufhängen.' },
    { icon: 'shade', text: 'Fern von Heizkörpern und Sonne, beides macht die Faser hart.' },
    { icon: 'clock', text: 'Einen Tag oder länger einplanen und erst wegräumen, wenn es ganz trocken ist.' },
  ],
  dryNever: 'Nie in den Wäschetrockner',
  heat: 2,
  heatLabel: 'Wollstufe, mit feuchtem Tuch',
  press: [
    { icon: 'pressCloth', text: 'Immer ein feuchtes Baumwolltuch zwischen Bügeleisen und Kaschmir legen.' },
    { icon: 'crease', text: 'Die Bügelfalte an ihrer Linie nachziehen; das Eisen anheben, nicht schieben.' },
    { icon: 'steamer', text: 'Zwischen dem Tragen mit dem Dampfglätter von der Rückseite aus, eine Handbreit Abstand.' },
    { icon: 'noShine', text: 'Ein heißes Eisen direkt auf dem Stoff macht ihn glänzend und drückt den Flor platt.' },
  ],
  wear: [
    { icon: 'brush', text: 'Nach dem Tragen mit dem Strich leicht ausbürsten, das nimmt Staub auf.' },
    { icon: 'rest', text: 'Ein Ruhetag zwischen zwei Anlässen, dann findet der Stoff in Form zurück.' },
    { icon: 'comb', text: 'Kleine Knötchen an den Oberschenkeln sind natürlich; ein Kaschmirkamm nimmt sie ab, aber nur gelegentlich.' },
    { icon: 'air', text: 'Lüften statt waschen: Am offenen Fenster auf dem Bügel wird Kaschmir wieder frisch.' },
  ],
  store: {
    method: 'clip',
    label: 'Am Saum im Klammerbügel',
    tips: [
      { icon: 'hangerClip', text: 'Am Saum in einen Klammerbügel hängen; kleine Falten hängen sich über Nacht aus.' },
      { icon: 'cedar', text: 'Zedernholz oder Lavendel im Schrank hält Motten fern.' },
      { icon: 'bag', text: 'Für den Sommer: erst reinigen, dann in einen Baumwollbeutel. Im Frühjahr nachsehen.' },
    ],
  },
  keep: [
    'Bürsten und Lüften zwischen dem Tragen',
    'Kühles Wasser und Wollwaschmittel',
    'Liegend, fern von Wärme trocknen',
    'Mit feuchtem Tuch bügeln',
    'Zedernholz und saubere Lagerung',
  ],
  avoid: [
    'Nach jedem Tragen waschen',
    'Heißes Wasser oder Temperaturwechsel',
    'Wringen und Wäschetrockner',
    'Ein heißes Eisen direkt auf dem Stoff',
    'Getragenes ungewaschen einlagern',
  ],
};

const ties: ClothCare = {
  name: 'Seidenkrawatten',
  forCloth: 'Seidenkrawatten',
  feel: 'Gerollte Kanten, ein klarer Knoten',
  texture: '/swatches/silk/LS-J16.webp',
  glance: [
    { icon: 'noWash', label: 'Nicht waschen' },
    { icon: 'noBleach', label: 'Nicht bleichen' },
    { icon: 'noTumble', label: 'Kein Trockner' },
    { icon: 'noIron', label: 'Nicht bügeln' },
    { icon: 'steamer', label: 'Dämpfen, mit Abstand' },
    { icon: 'dryCleanP', label: 'Fachreinigung' },
  ],
  rules: [
    'Den Knoten so lösen, wie man ihn gebunden hat.',
    'Über Nacht flach oder locker gerollt ruhen lassen.',
    'Nie waschen: Flecken gehören in die Fachreinigung.',
  ],
  washH: 'Wenn etwas daneben geht',
  washIntro: 'Eine Seidenkrawatte wird nie gewaschen. Schnell handeln, dann übernimmt eine Fachreinigung.',
  wash: [
    { icon: 'blot', title: 'Sofort abtupfen', body: 'Mit einem sauberen weißen Tuch oder einer Serviette aufnehmen. Tupfen, nie reiben.' },
    { icon: 'noSpray', title: 'Kein Wasser', body: 'Weder Wasser noch Sprudel auf den Fleck geben: Auf Seide bleibt ein Rand zurück.' },
    { icon: 'dryCleanP', title: 'Zur Fachreinigung', body: 'Eine Reinigung wählen, die mit Krawatten umgeht, und darum bitten, dass die Kanten gerollt bleiben und nicht plattgebügelt werden.' },
  ],
  dryH: 'Nach dem Tragen',
  dry: [
    { icon: 'roll', text: 'Nach dem Tragen locker aufrollen oder über Nacht flach hinlegen.' },
    { icon: 'shade', text: 'Vor Sonnenlicht schützen, es lässt die Seide ausbleichen.' },
    { icon: 'rest', text: 'Die Krawatten abwechseln: Eine ausgeruhte Krawatte behält ihre Form.' },
  ],
  dryNever: 'Nie gewaschen, nie gewrungen',
  heat: 0,
  heatLabel: 'Nicht bügeln: nur dämpfen',
  press: [
    { icon: 'steamer', text: 'Den Dampfglätter eine Handbreit entfernt halten und den Dampf wirken lassen.' },
    { icon: 'shower', text: 'Kein Dampfglätter zur Hand? Im Bad aufhängen, während Sie heiß duschen.' },
    { icon: 'noIron', text: 'Ein Bügeleisen drückt die gerollten Kanten für immer platt.' },
  ],
  wear: [
    { icon: 'tie', text: 'Den Knoten rückwärts lösen; wer das schmale Ende durchzieht, dehnt die Seide.' },
    { icon: 'perfume', text: 'Erst das Parfum, dann die Krawatte.' },
    { icon: 'rest', text: 'Auch eine Krawatte, die jeden Tag getragen wird, braucht ab und zu einen freien Tag.' },
  ],
  store: {
    method: 'roll',
    label: 'Locker gerollt in der Schublade',
    tips: [
      { icon: 'roll', text: 'Vom schmalen Ende her locker aufrollen und in die Schublade legen.' },
      { icon: 'tie', text: 'Oder über einen Krawattenhalter legen, nie an der Schlaufe an einen Haken.' },
      { icon: 'travel', text: 'Auf Reisen: aufrollen und in einen Schuh oder in das Fach eines Koffers stecken.' },
    ],
  },
  keep: [
    'Den Knoten rückwärts lösen',
    'Gerollt oder flach ruhen lassen',
    'Flecken sofort abtupfen',
    'Mit Abstand dämpfen',
    'Eine Reinigung für Krawatten',
  ],
  avoid: [
    'Waschen, von Hand oder in der Maschine',
    'Das schmale Ende durch den Knoten ziehen',
    'Wasser oder Sprudel auf Flecken',
    'Ein heißes Bügeleisen',
    'An der Schlaufe an einen Haken hängen',
  ],
};

export const CARE_DE: CareCopy = {
  CARE: { silk, linen, cashmere, ties },

  STAINS: [
    {
      key: 'wine',
      icon: 'wine',
      label: 'Rotwein',
      linen: [
        'Sofort mit einem sauberen weißen Tuch abtupfen. Nicht reiben.',
        'Den Fleck von der Rückseite her unter kaltem, fließendem Wasser ausspülen, damit er nicht tiefer in den Stoff gedrückt wird.',
        'Danach bei 30 °C wie gewohnt waschen, bevor der Fleck antrocknet.',
      ],
      delicate: [
        'Sofort mit einem sauberen weißen Tuch abtupfen. Nicht reiben und kein Wasser dazugeben.',
        'Antrocknen lassen, ohne Salz, Sprudel oder Hausmittel.',
        'Innerhalb von ein, zwei Tagen in die Reinigung bringen und sagen, dass es Rotwein ist.',
      ],
    },
    {
      key: 'coffee',
      icon: 'coffee',
      label: 'Kaffee oder Tee',
      linen: [
        'Verschüttetes sofort abtupfen.',
        'Von der Rückseite her kalt ausspülen.',
        'Mit mildem Waschmittel bei 30 °C waschen, nie heißer: Hitze fixiert die Gerbstoffe.',
      ],
      delicate: [
        'Sofort mit einem sauberen, trockenen Tuch abtupfen.',
        'Kein Wasser und kein Reiben: Beides verteilt den Fleck auf Seide und Kaschmir.',
        'In die Reinigung bringen und sagen, was es war.',
      ],
    },
    {
      key: 'oil',
      icon: 'oil',
      label: 'Fett oder Essen',
      linen: [
        'Grobe Reste mit dem Rücken eines Löffels abnehmen.',
        'Eine Stunde lang Speisestärke oder Talkum aufstreuen, damit es das Fett aufsaugt, dann abbürsten.',
        'Wie gewohnt waschen. Fett, das im Stoff bleibt, kann nachdunkeln, deshalb nicht lange warten.',
      ],
      delicate: [
        'Grobe Reste mit dem Rücken eines Löffels abnehmen.',
        'Eine Stunde lang Speisestärke oder Talkum aufstreuen und danach vorsichtig abbürsten.',
        'Was bleibt, gehört in die Reinigung.',
      ],
    },
    {
      key: 'makeup',
      icon: 'makeup',
      label: 'Make-up',
      linen: [
        'Puder abklopfen, nicht abwischen.',
        'Make-up oder Lippenstift mit einem Tropfen mildem Waschmittel auf einem feuchten weißen Tuch von außen nach innen betupfen.',
        'Kühl ausspülen und wie gewohnt waschen.',
      ],
      delicate: [
        'Puder ausschütteln oder abklopfen, nicht einreiben.',
        'Bei Lippenstift oder Make-up überlassen Sie es besser der Reinigung.',
        'Fürs nächste Mal: erst anziehen, dann schminken, mit einem Tuch über dem Ausschnitt.',
      ],
    },
    {
      key: 'deodorant',
      icon: 'deodorant',
      label: 'Deodorant',
      linen: [
        'Frische weiße Spuren lassen sich oft mit einer trockenen, sauberen Socke abreiben.',
        'Sonst bald nach dem Tragen auf links kühl waschen.',
        'Das nächste Mal das Deodorant ganz trocknen lassen, bevor Sie sich anziehen.',
      ],
      delicate: [
        'Frische weiße Spuren mit einer trockenen, sauberen Socke oder einer weichen Bürste sanft abreiben.',
        'Seide bald danach waschen: Salze, die in der Faser bleiben, schwächen sie unter den Armen.',
        'Was nicht mehr hergeht, gehört in die Reinigung.',
      ],
    },
    {
      key: 'water',
      icon: 'droplet',
      label: 'Wasserflecken',
      linen: [
        'Wasser hinterlässt auf Leinen keine Spuren; es trocknet und ist unsichtbar.',
        'Bleibt eine Falte, bügeln Sie sie glatt, solange das Leinen noch feucht ist.',
        'Mehr ist nicht nötig.',
      ],
      delicate: [
        'Ein Tropfen kann auf Seide einen Rand hinterlassen. Nicht tupfen und nicht reiben.',
        'Die ganze Fläche gleichmäßig aus einer Handbreit Abstand dämpfen; der Rand verläuft meist von selbst.',
        'Bleibt er, hilft gleichmäßiges Waschen des ganzen Stücks oder die Reinigung.',
      ],
    },
  ],

  TABLE: [
    { label: 'Waschen zu Hause', values: { silk: 'Von Hand, schlichte Seide', linen: 'Ab der zweiten Wäsche', cashmere: 'Von Hand', ties: 'Nie' } },
    { label: 'Maschine', values: { silk: 'Schonwaschgang, 30 °C, Wäschenetz', linen: 'Schonend, 30 °C', cashmere: 'Wollprogramm, 30 °C', ties: 'Nie' } },
    { label: 'Waschmittel', values: { silk: 'pH-neutral, für Seide', linen: 'Mild, ohne Bleichmittel', cashmere: 'Woll- und Kaschmirwaschmittel', ties: '–' } },
    { label: 'Trocknen', values: { silk: 'Liegend oder auf gepolstertem Bügel', linen: 'Breiter Bügel, Schatten', cashmere: 'Liegend, fern von Wärme', ties: 'Gerollt oder flach' } },
    { label: 'Bügeln', values: { silk: '• Niedrig, trocken, mit Tuch', linen: '•• Mittel, noch feucht', cashmere: '•• Wolle, feuchtes Tuch', ties: 'Nicht bügeln' } },
    { label: 'Dämpfen', values: { silk: 'Ja, mit Abstand', linen: 'Ja', cashmere: 'Ja, von der Rückseite', ties: 'Ja, mit Abstand' } },
    { label: 'Aufbewahren', values: { silk: 'Gepolsterter Bügel, Baumwollhülle', linen: 'Breiter Bügel, locker gelegt', cashmere: 'Klammerbügel, Zedernholz', ties: 'Gerollt, in der Schublade' } },
    { label: 'Reinigung', values: { silk: 'Willkommen; bei Jacquard und Brokat Pflicht', linen: 'Für die erste Wäsche', cashmere: 'Willkommen', ties: 'Bei jedem Fleck' } },
  ],

  SYMBOLS: [
    {
      family: 'Waschen',
      items: [
        { icon: 'wash30', title: '30 °C', body: 'Normalwaschgang bis höchstens 30 °C.' },
        { icon: 'wash30Gentle', title: '30 °C, schonend', body: 'Ein Balken unter dem Waschbottich heißt Schonwaschgang mit geringerer Schleuderzahl.' },
        { icon: 'wash30Wool', title: '30 °C, sehr schonend', body: 'Zwei Balken: besonders schonendes Programm, wie für Wolle oder Seide.' },
        { icon: 'washHand', title: 'Handwäsche', body: 'Von Hand waschen, bis höchstens 40 °C. LINSILK empfiehlt 30 °C.' },
        { icon: 'noWash', title: 'Nicht waschen', body: 'Weder von Hand noch in der Maschine waschen.' },
      ],
    },
    {
      family: 'Bleichen',
      items: [
        { icon: 'bleachAny', title: 'Bleichen erlaubt', body: 'Jedes Bleichmittel darf verwendet werden.' },
        { icon: 'noBleach', title: 'Nicht bleichen', body: 'Kein Bleichmittel, in keiner Form. Gilt für jedes Stück von LINSILK.' },
      ],
    },
    {
      family: 'Trocknen',
      items: [
        { icon: 'tumble', title: 'Wäschetrockner', body: 'Der Kreis im Quadrat heißt: Trocknen im Wäschetrockner ist erlaubt.' },
        { icon: 'noTumble', title: 'Nicht in den Trockner', body: 'Nie in den Wäschetrockner. Gilt für jedes Stück von LINSILK.' },
        { icon: 'lineDry', title: 'Aufhängen', body: 'An der Leine oder auf dem Bügel trocknen.' },
        { icon: 'dryFlat', title: 'Liegend trocknen', body: 'Flach hinlegen, damit das Stück seine Form behält.' },
        { icon: 'dripDry', title: 'Tropfnass aufhängen', body: 'Nass aufhängen, ohne zu schleudern oder zu wringen.' },
        { icon: 'dryFlatShade', title: 'Im Schatten trocknen', body: 'Der Strich in der Ecke heißt: nicht in der prallen Sonne.' },
      ],
    },
    {
      family: 'Bügeln',
      items: [
        { icon: 'iron1', title: 'Niedrig', body: 'Ein Punkt: bis 110 °C. Für Seide, ohne Dampf.' },
        { icon: 'iron2', title: 'Mittel', body: 'Zwei Punkte: bis 150 °C. Für Wolle und Kaschmir, bei Leinen im feuchten Zustand.' },
        { icon: 'iron3', title: 'Hoch', body: 'Drei Punkte: bis 200 °C. Für kräftiges Leinen und Baumwolle.' },
        { icon: 'noIron', title: 'Nicht bügeln', body: 'Nicht bügeln. Wo erlaubt, stattdessen mit Abstand dämpfen.' },
      ],
    },
    {
      family: 'Professionelle Pflege',
      items: [
        { icon: 'dryCleanP', title: 'Reinigung (P)', body: 'Professionelle Reinigung mit üblichen Lösungsmitteln. Der Buchstabe ist für die Reinigung gedacht.' },
        { icon: 'dryCleanF', title: 'Reinigung (F)', body: 'Professionelle Reinigung, nur mit mildem Lösungsmittel.' },
        { icon: 'wetCleanW', title: 'Nassreinigung (W)', body: 'Professionelle Nassreinigung mit Wasser.' },
        { icon: 'noDryClean', title: 'Nicht chemisch reinigen', body: 'Keine professionelle chemische Reinigung.' },
      ],
    },
  ],

  TRAVEL: [
    { icon: 'roll', title: 'Leinen, gerollt', body: 'Leinen lieber rollen als falten, dann knittert es weniger. Der Rest erledigt ein Bügel im Bad.' },
    { icon: 'tissue', title: 'Seide, in Seidenpapier', body: 'Seide um ein Blatt Seidenpapier falten und ganz oben einpacken, wo nichts darauf drückt.' },
    { icon: 'steamer', title: 'Kaschmir, gleich nach der Ankunft', body: 'Kaschmirhosen am Saum aufhängen, sobald Sie ankommen; der Dampf der Dusche richtet sie wieder.' },
  ],

  PAGE: {
    metaTitle: 'Pflege für Seide, Leinen und Kaschmir',
    description:
      'So waschen, trocknen, bügeln und lagern Sie Seide, Leinen, Kaschmir und Seidenkrawatten von LINSILK: die Pflegeregeln des Hauses Schritt für Schritt, mit erster Hilfe bei Flecken und Pflegesymbolen erklärt.',
    kicker: 'Pflege',
    title: 'Damit es schön bleibt',
    lead: 'Seide, Leinen und Kaschmir sind Naturfasern: Sie atmen, werden mit der Zeit weicher und halten lange, wenn man sie sanft behandelt. Wählen Sie Ihren Stoff, und Sie erfahren, wie er gewaschen, getrocknet, gebügelt und aufbewahrt wird.',
    chooseH: 'Wählen Sie Ihren Stoff',
    switcherLabel: 'Stoff',
    glanceH: 'Auf einen Blick',
    dryH: 'Trocknen',
    pressH: 'Bügeln und Dämpfen',
    heatCaption: 'Bügelstufe',
    steamDistance: 'eine Handbreit',
    wearH: 'Tragen und Auffrischen',
    storeH: 'Aufbewahren',
    keepH: 'Gut so',
    avoidH: 'Besser nicht',
    stainsH: 'Erste Hilfe bei Flecken',
    stainsLead: 'Wählen Sie, was passiert ist. Die Schritte richten sich nach dem Stoff, den Sie oben gewählt haben.',
    stainsFor: 'Für',
    stainsLinenFirst:
      'Leinen, das noch nicht zur ersten Reinigung war: abtupfen und dann in die Reinigung bringen, statt es zu Hause zu waschen.',
    stainsStop:
      'Im Zweifel lieber aufhören und in die Reinigung gehen. Ein Fleck, den man in Ruhe lässt, lässt sich leichter entfernen als einer, an dem schon gerieben wurde.',
    tableH: 'Die Stoffe im Vergleich',
    symbolsH: 'Pflegesymbole verstehen',
    symbolsLead: 'Reinigungen und Waschmaschinen sprechen in diesen Symbolen. Tippen Sie eines an, um zu sehen, was es bedeutet.',
    travelH: 'Auf Reisen',
    helpH: 'Eine Frage ist offen geblieben?',
    helpBody: 'Schreiben Sie uns zu Ihrem Stück, einem Fleck oder einer Frage Ihrer Reinigung, und nennen Sie dazu das Stück.',
    helpWrite: 'Schreiben Sie uns',
    helpContact: 'Kontaktseite',
    print: 'Anleitung drucken',
    more: 'Weitere Hilfe',
    steam: 'Dampf',
    methods: { padded: 'Gepolsterter Bügel', wide: 'Breiter Bügel', clip: 'Klammerbügel', roll: 'Gerollt' },
    moreLinks: [
      ['/care/questions', 'Fragen'],
      ['/care/shipping', 'Versand'],
      ['/care/returns', 'Rückgabe'],
      ['/care/measuring', 'Messanleitung'],
    ],
    howTo: (cloth) => `So waschen Sie ${cloth} von LINSILK`,
  },
};
