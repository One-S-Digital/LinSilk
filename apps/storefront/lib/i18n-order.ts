/* The words of the ordering steps: the colour choice, the order panel and the
 * measurement sheet. English is the source; German and French are for a
 * native-speaker pass before they go live (docs/seo/SEO-GEO-PLAN.md §13.7).
 * What is sent to the atelier (fabric names, zone labels) stays English. */

import { deepDe, type Lang } from './i18n';
import { SWATCHES } from './swatches';

const ALL_SWATCHES = [...SWATCHES.silk, ...SWATCHES.linen];

const EN = {
  panel: {
    archivedH: 'Archived',
    archived: (season: string) =>
      `This design closed with ${season} and is not made again. The pattern is kept at the bench, and the record of the cloth stays with the piece — but nothing from a closed collection is cut a second time.`,
    itsSeason: 'its season',
    seeOpen: 'See what is open now',
    commission: 'Commission something like it',
    noCloth:
      'The cloth for this piece has not been confirmed yet, so it cannot be ordered just now. Write to hello@bylinsilk.com and the tailor will tell you what it is cut in.',
    steps: 'Ordering steps',
    stepColour: '01 Colour',
    stepMeasure: '02 Measurements',
    madeIn: (cloth: string) =>
      `This piece is made in ${cloth}. Choose your colour from the ${cloth} swatches, then take your measurements.`,
    selectColour: 'Select colour',
    changeColour: 'Change colour',
    useColour: 'Use this colour',
    toMeasure: 'Continue to measurements',
    moment: 'One moment…',
    checkout: 'Continue to checkout',
    unreachable:
      'The house cannot be reached just now, so nothing can be ordered. Write to hello@bylinsilk.com and the tailor will hold it by hand.',
    allNeeded: (n: number) =>
      `The sheet decides the garment, so all ${n} measurements are needed before a piece can be ordered.`,
    moreToTake: (n: number) => `${n} more to take. The tailor cannot cut from a partial sheet.`,
    note:
      'Ordering holds the design against the season’s capped run. The tailor writes to you within two days to confirm the sheet before cutting begins.',
  },
  swatch: {
    title: 'Choose your colour',
    lead: (n: number, cloth: string) => `${n} colours in ${cloth}. Choose the one this piece is cut in.`,
    close: 'Close',
    none: 'No colour chosen yet',
    group: (weave: string, cloth: string) => `${weave} ${cloth}`,
    colours: (cloth: string) => `${cloth} colours`,
  },
  sheet: {
    title: 'Your measurements',
    units: 'Units',
    intro: (n: number) =>
      `There is no small, medium or large. ${n} measurements, taken over close-fitting clothes, with the tape flat against the body. Some of them are drops rather than girths — they are what let a flat pattern sit on your body, and no amount of chest and waist substitutes for them. Take your time; this is the part of the order that decides the garment.`,
    guideWomen: 'Measurement guide, women',
    guideMen: 'Measurement guide, men',
    tapeSits: 'where the tape sits',
    showWomen: 'Show women’s guide',
    showMen: 'Show men’s guide',
    allTaken: (n: number) => `All ${n} taken`,
    progress: (i: number, n: number) => `Measurement ${i} of ${n}`,
    garmentH: 'The garment',
    garmentNote:
      'Not a fact about your body but a decision about the piece. Your measurements say how it should fit; this says how long it should be.',
    tailor: 'Have a tailor take your measurements',
    saveFail: 'Could not save just now. Try again in a moment.',
    saving: 'Saving…',
    save: 'Save this profile',
    savedAccount: 'Saved to your account',
    savedDevice: 'Saved to this device',
    review: 'Review',
    range: (lo: string, hi: string, unit: string) =>
      `Usually between ${lo} and ${hi} ${unit}. Check the tape, or write to the tailor if this is right.`,
  },
  zones: {
    neck: ['Neck', 'Around the base of the neck, one finger of ease.'],
    shoulder: ['Shoulder', 'Across the back, shoulder bone to shoulder bone.'],
    bust: ['Bust / chest', 'Fullest point, tape level all the way round.'],
    bustPoint: ['Bust point', 'From the top of the shoulder straight down to the fullest point of the bust.'],
    frontWaist: ['Front waist length', 'From the top of the shoulder, down over the bust, to the natural waist.'],
    backWaist: ['Back waist length', 'From the bone at the base of the neck, straight down the back, to the natural waist.'],
    waist: ['Waist', 'Narrowest point, usually just above the navel.'],
    hip: ['Hip', 'Fullest point of the seat, feet together.'],
    hipDepth: ['Hip depth', 'From the natural waist straight down to the fullest point of the seat.'],
    thigh: ['Thigh', 'Around the fullest part, standing.'],
    knee: ['Knee', 'Around the knee, leg straight.'],
    sleeve: ['Sleeve length', 'From the shoulder bone to the wrist bone, arm slightly bent.'],
    bicep: ['Upper arm', 'Around the widest part, arm relaxed.'],
    wrist: ['Wrist', 'Over the wrist bone.'],
    rise: ['Rise', 'Sitting on a hard chair: from the natural waist at the front, between the legs, to the natural waist at the back.'],
    lengthDress: ['Dress length', 'From the top of the shoulder, over the bust, straight down to where you want the hem to fall. Measure against a dress you already own and like.'],
    lengthSkirt: ['Skirt length', 'From the natural waist straight down to where you want the hem to fall.'],
    lengthTrouser: ['Trouser length', 'From the natural waist down the outside of the leg to where you want the hem to fall, without shoes.'],
    lengthTop: ['Desired length', 'From the top of the shoulder seam straight down to where you want the hem to fall. Measure against a garment you already own and like.'],
    lengthRobe: ['Robe length', 'From the top of the shoulder seam straight down to where you want the robe to fall. Measure against a robe you already own and like.'],
  } as Record<string, [string, string]>,
  cloth: { silk: 'Silk', linen: 'Linen' } as Record<string, string>,
  weave: { Plain: 'Plain', Jacquard: 'Jacquard', Brocade: 'Brocade' } as Record<string, string>,
  /* `name – cloth`, as the colour is shown beside a piece. */
  label: (name: string, cloth: string) => `${name} ${cloth.toLowerCase()}`,
};

export type OrderText = typeof EN;

const DE_CH: OrderText = {
  panel: {
    archivedH: 'Archiviert',
    archived: (season) =>
      `Dieses Modell ist mit ${season} ausgelaufen und wird nicht mehr gefertigt. Das Schnittmuster bleibt in der Werkstatt, und die Angaben zum Stoff bleiben beim Stück – aber nichts aus einer abgeschlossenen Kollektion wird ein zweites Mal zugeschnitten.`,
    itsSeason: 'seiner Saison',
    seeOpen: 'Jetzt offene Modelle ansehen',
    commission: 'Etwas Ähnliches in Auftrag geben',
    noCloth:
      'Der Stoff für dieses Stück ist noch nicht bestätigt, es lässt sich deshalb im Moment nicht bestellen. Schreiben Sie an hello@bylinsilk.com, das Atelier teilt Ihnen mit, aus welchem Stoff es gefertigt wird.',
    steps: 'Bestellschritte',
    stepColour: '01 Farbe',
    stepMeasure: '02 Masse',
    madeIn: (cloth) =>
      `Dieses Stück wird aus ${cloth} gefertigt. Wählen Sie Ihre Farbe aus den ${cloth}-Stoffmustern und nehmen Sie dann Ihre Masse.`,
    selectColour: 'Farbe wählen',
    changeColour: 'Farbe ändern',
    useColour: 'Diese Farbe verwenden',
    toMeasure: 'Weiter zu den Massen',
    moment: 'Einen Moment…',
    checkout: 'Weiter zur Kasse',
    unreachable:
      'Das Atelier ist im Moment nicht erreichbar, deshalb kann nichts bestellt werden. Schreiben Sie an hello@bylinsilk.com, das Atelier reserviert das Stück von Hand für Sie.',
    allNeeded: (n) =>
      `Das Massblatt bestimmt das Kleidungsstück, deshalb braucht es alle ${n} Masse, bevor ein Stück bestellt werden kann.`,
    moreToTake: (n) => `Noch ${n} zu nehmen. Das Atelier kann nicht nach einem unvollständigen Massblatt zuschneiden.`,
    note:
      'Mit der Bestellung wird das Modell in der begrenzten Auflage der Saison für Sie reserviert. Das Atelier schreibt Ihnen innert zwei Tagen, um das Massblatt zu bestätigen, bevor der Zuschnitt beginnt.',
  },
  swatch: {
    title: 'Wählen Sie Ihre Farbe',
    lead: (n, cloth) => `${n} Farben in ${cloth}. Wählen Sie die Farbe, in der dieses Stück gefertigt wird.`,
    close: 'Schliessen',
    none: 'Noch keine Farbe gewählt',
    group: (weave, cloth) => `${cloth}, ${weave}`,
    colours: (cloth) => `${cloth}-Farben`,
  },
  sheet: {
    title: 'Ihre Masse',
    units: 'Einheiten',
    intro: (n) =>
      `Es gibt kein S, M oder L. ${n} Masse, über eng anliegender Kleidung genommen, das Massband flach am Körper. Einige davon sind Längen statt Umfänge – sie sorgen dafür, dass ein flaches Schnittmuster auf Ihrem Körper sitzt, und kein Brust- oder Taillenumfang ersetzt sie. Nehmen Sie sich Zeit; dieser Teil der Bestellung entscheidet über das Kleidungsstück.`,
    guideWomen: 'Massanleitung, Damen',
    guideMen: 'Massanleitung, Herren',
    tapeSits: 'wo das Massband liegt',
    showWomen: 'Damen-Anleitung zeigen',
    showMen: 'Herren-Anleitung zeigen',
    allTaken: (n) => `Alle ${n} genommen`,
    progress: (i, n) => `Mass ${i} von ${n}`,
    garmentH: 'Das Kleidungsstück',
    garmentNote:
      'Kein Mass Ihres Körpers, sondern eine Entscheidung über das Stück. Ihre Masse bestimmen, wie es sitzen soll; hier legen Sie fest, wie lang es sein soll.',
    tailor: 'Masse von einer Schneiderin oder einem Schneider nehmen lassen',
    saveFail: 'Speichern im Moment nicht möglich. Versuchen Sie es gleich noch einmal.',
    saving: 'Wird gespeichert…',
    save: 'Dieses Profil speichern',
    savedAccount: 'In Ihrem Konto gespeichert',
    savedDevice: 'Auf diesem Gerät gespeichert',
    review: 'Übersicht',
    range: (lo, hi, unit) =>
      `Üblich sind Werte zwischen ${lo} und ${hi} ${unit}. Prüfen Sie das Massband oder schreiben Sie dem Atelier, wenn der Wert stimmt.`,
  },
  zones: {
    neck: ['Hals', 'Um den Halsansatz, ein Finger Spielraum.'],
    shoulder: ['Schulter', 'Über den Rücken, von Schulterknochen zu Schulterknochen.'],
    bust: ['Brust / Oberweite', 'An der vollsten Stelle, das Massband rundum waagrecht.'],
    bustPoint: ['Brustpunkt', 'Von der Schulterhöhe senkrecht hinunter bis zur vollsten Stelle der Brust.'],
    frontWaist: ['Vordere Taillenlänge', 'Von der Schulterhöhe über die Brust bis zur natürlichen Taille.'],
    backWaist: ['Hintere Taillenlänge', 'Vom Knochen am Halsansatz senkrecht den Rücken hinunter bis zur natürlichen Taille.'],
    waist: ['Taille', 'An der schmalsten Stelle, meist knapp über dem Nabel.'],
    hip: ['Hüfte', 'An der vollsten Stelle des Gesässes, Füsse geschlossen.'],
    hipDepth: ['Hüfttiefe', 'Von der natürlichen Taille senkrecht hinunter bis zur vollsten Stelle des Gesässes.'],
    thigh: ['Oberschenkel', 'Um die kräftigste Stelle, im Stehen.'],
    knee: ['Knie', 'Um das Knie, Bein gestreckt.'],
    sleeve: ['Ärmellänge', 'Vom Schulterknochen bis zum Handgelenkknochen, Arm leicht gebeugt.'],
    bicep: ['Oberarm', 'Um die breiteste Stelle, Arm entspannt.'],
    wrist: ['Handgelenk', 'Über dem Handgelenkknochen.'],
    rise: ['Gabellänge', 'Auf einem harten Stuhl sitzend: von der natürlichen Taille vorn, zwischen den Beinen hindurch, bis zur natürlichen Taille hinten.'],
    lengthDress: ['Kleidlänge', 'Von der Schulterhöhe über die Brust senkrecht hinunter bis dorthin, wo der Saum fallen soll. Am besten an einem Kleid messen, das Sie schon besitzen und mögen.'],
    lengthSkirt: ['Rocklänge', 'Von der natürlichen Taille senkrecht hinunter bis dorthin, wo der Saum fallen soll.'],
    lengthTrouser: ['Hosenlänge', 'Von der natürlichen Taille aussen am Bein hinunter bis dorthin, wo der Saum fallen soll, ohne Schuhe.'],
    lengthTop: ['Gewünschte Länge', 'Von der Schulternaht senkrecht hinunter bis dorthin, wo der Saum fallen soll. Am besten an einem Kleidungsstück messen, das Sie schon besitzen und mögen.'],
    lengthRobe: ['Länge des Morgenmantels', 'Von der Schulternaht senkrecht hinunter bis dorthin, wo der Morgenmantel fallen soll. Am besten an einem Morgenmantel messen, den Sie schon besitzen und mögen.'],
  },
  cloth: { silk: 'Seide', linen: 'Leinen' },
  weave: { Plain: 'Uni', Jacquard: 'Jacquard', Brocade: 'Brokat' },
  label: (name, cloth) => `${cloth} – ${name}`,
};

const FR: OrderText = {
  panel: {
    archivedH: 'Archivé',
    archived: (season) =>
      `Ce modèle s’est clos avec ${season} et n’est plus fabriqué. Le patron est conservé à l’atelier et la fiche du tissu reste avec la pièce, mais rien d’une collection close n’est coupé une seconde fois.`,
    itsSeason: 'sa saison',
    seeOpen: 'Voir ce qui est ouvert maintenant',
    commission: 'Commander quelque chose de semblable',
    noCloth:
      'Le tissu de cette pièce n’est pas encore confirmé, elle ne peut donc pas être commandée pour le moment. Écrivez à hello@bylinsilk.com : l’atelier vous dira dans quel tissu elle est coupée.',
    steps: 'Étapes de la commande',
    stepColour: '01 Couleur',
    stepMeasure: '02 Mesures',
    madeIn: (cloth) =>
      `Cette pièce est confectionnée en ${cloth}. Choisissez votre couleur parmi les échantillons de ${cloth}, puis prenez vos mesures.`,
    selectColour: 'Choisir la couleur',
    changeColour: 'Changer de couleur',
    useColour: 'Utiliser cette couleur',
    toMeasure: 'Continuer vers les mesures',
    moment: 'Un instant…',
    checkout: 'Passer à la caisse',
    unreachable:
      'L’atelier est injoignable pour le moment, rien ne peut donc être commandé. Écrivez à hello@bylinsilk.com : l’atelier réservera la pièce à la main.',
    allNeeded: (n) =>
      `La fiche de mesures détermine le vêtement : les ${n} mesures sont nécessaires avant de pouvoir commander une pièce.`,
    moreToTake: (n) => `Encore ${n} à prendre. L’atelier ne peut pas couper à partir d’une fiche incomplète.`,
    note:
      'La commande réserve le modèle dans la série limitée de la saison. L’atelier vous écrit sous deux jours pour confirmer la fiche avant le début de la coupe.',
  },
  swatch: {
    title: 'Choisissez votre couleur',
    lead: (n, cloth) => `${n} couleurs en ${cloth}. Choisissez celle dans laquelle cette pièce est coupée.`,
    close: 'Fermer',
    none: 'Aucune couleur choisie',
    group: (weave, cloth) => `${cloth}, ${weave}`,
    colours: (cloth) => `Couleurs de ${cloth.toLowerCase()}`,
  },
  sheet: {
    title: 'Vos mesures',
    units: 'Unités',
    intro: (n) =>
      `Il n’y a ni S, ni M, ni L. ${n} mesures, prises sur des vêtements près du corps, le mètre ruban à plat contre le corps. Certaines sont des hauteurs plutôt que des tours : ce sont elles qui permettent à un patron plat de tomber sur votre corps, et aucun tour de poitrine ni de taille ne les remplace. Prenez votre temps ; c’est cette étape de la commande qui décide du vêtement.`,
    guideWomen: 'Guide de mesures, femmes',
    guideMen: 'Guide de mesures, hommes',
    tapeSits: 'où se place le mètre ruban',
    showWomen: 'Afficher le guide femmes',
    showMen: 'Afficher le guide hommes',
    allTaken: (n) => `Les ${n} sont prises`,
    progress: (i, n) => `Mesure ${i} sur ${n}`,
    garmentH: 'Le vêtement',
    garmentNote:
      'Ce n’est pas une donnée de votre corps mais une décision sur la pièce. Vos mesures disent comment elle doit tomber ; ceci dit quelle longueur elle doit avoir.',
    tailor: 'Faire prendre vos mesures par un tailleur',
    saveFail: 'Enregistrement impossible pour le moment. Réessayez dans un instant.',
    saving: 'Enregistrement…',
    save: 'Enregistrer ce profil',
    savedAccount: 'Enregistré dans votre compte',
    savedDevice: 'Enregistré sur cet appareil',
    review: 'Récapitulatif',
    range: (lo, hi, unit) =>
      `En général entre ${lo} et ${hi} ${unit}. Vérifiez le mètre ruban, ou écrivez au tailleur si la valeur est exacte.`,
  },
  zones: {
    neck: ['Cou', 'Autour de la base du cou, un doigt d’aisance.'],
    shoulder: ['Épaules', 'Sur le dos, d’un os de l’épaule à l’autre.'],
    bust: ['Poitrine', 'Au point le plus fort, le mètre ruban bien à l’horizontale tout autour.'],
    bustPoint: ['Pointe de poitrine', 'Du haut de l’épaule, droit jusqu’au point le plus fort de la poitrine.'],
    frontWaist: ['Longueur devant jusqu’à la taille', 'Du haut de l’épaule, sur la poitrine, jusqu’à la taille naturelle.'],
    backWaist: ['Longueur dos jusqu’à la taille', 'De l’os à la base du cou, droit le long du dos, jusqu’à la taille naturelle.'],
    waist: ['Taille', 'Au point le plus étroit, en général juste au-dessus du nombril.'],
    hip: ['Hanches', 'Au point le plus fort des hanches, pieds joints.'],
    hipDepth: ['Hauteur de hanche', 'De la taille naturelle, droit jusqu’au point le plus fort des hanches.'],
    thigh: ['Cuisse', 'Autour de la partie la plus forte, debout.'],
    knee: ['Genou', 'Autour du genou, jambe tendue.'],
    sleeve: ['Longueur de manche', 'De l’os de l’épaule à l’os du poignet, bras légèrement plié.'],
    bicep: ['Haut du bras', 'Autour de la partie la plus large, bras détendu.'],
    wrist: ['Poignet', 'Au-dessus de l’os du poignet.'],
    rise: ['Fourche', 'Assis sur une chaise dure : de la taille naturelle devant, entre les jambes, à la taille naturelle derrière.'],
    lengthDress: ['Longueur de la robe', 'Du haut de l’épaule, sur la poitrine, droit jusqu’à l’endroit où l’ourlet doit tomber. Mesurez sur une robe que vous possédez déjà et aimez.'],
    lengthSkirt: ['Longueur de la jupe', 'De la taille naturelle, droit jusqu’à l’endroit où l’ourlet doit tomber.'],
    lengthTrouser: ['Longueur du pantalon', 'De la taille naturelle, le long de l’extérieur de la jambe, jusqu’à l’endroit où l’ourlet doit tomber, sans chaussures.'],
    lengthTop: ['Longueur souhaitée', 'De la couture d’épaule, droit jusqu’à l’endroit où l’ourlet doit tomber. Mesurez sur un vêtement que vous possédez déjà et aimez.'],
    lengthRobe: ['Longueur du peignoir', 'De la couture d’épaule, droit jusqu’à l’endroit où le peignoir doit tomber. Mesurez sur un peignoir que vous possédez déjà et aimez.'],
  },
  cloth: { silk: 'Soie', linen: 'Lin' },
  weave: { Plain: 'Uni', Jacquard: 'Jacquard', Brocade: 'Brocart' },
  label: (name, cloth) => `${cloth} – ${name}`,
};

export function orderText(lang: Lang): OrderText {
  if (lang === 'en') return EN;
  if (lang === 'fr' || lang === 'fr-ch') return FR;
  return lang === 'de-ch' ? DE_CH : deepDe(DE_CH);
}

/* ---- Colour names, by library code ---- */

type Names = Record<string, [string, string]>; // key -> [German (Swiss), French]

const NAMES: Names = {
  'LS-S01': ['Silberflieder', 'Lilas argenté'], 'LS-S02': ['Kobalt', 'Cobalt'], 'LS-S03': ['Olive', 'Olive'],
  'LS-S04': ['Marine', 'Marine'], 'LS-S05': ['Karmesin', 'Cramoisi'], 'LS-S06': ['Schwarz', 'Noir'],
  'LS-S07': ['Champagner', 'Champagne'], 'LS-S08': ['Zinnober', 'Vermillon'], 'LS-S09': ['Elfenbein', 'Ivoire'],
  'LS-S10': ['Himmelblau', 'Ciel'], 'LS-S11': ['Schokolade', 'Chocolat'], 'LS-S12': ['Burgunder', 'Bordeaux'],
  'LS-S13': ['Aubergine', 'Aubergine'], 'LS-S14': ['Puderblau', 'Bleu poudré'], 'LS-S15': ['Karamell', 'Caramel'],
  'LS-J01': ['Smaragd-Rose', 'Rose émeraude'], 'LS-J02': ['Limetten-Rose', 'Rose citron vert'],
  'LS-J03': ['Aquanebel', 'Brume aqua'], 'LS-J04': ['Pfauen-Rose', 'Rose paon'],
  'LS-J05': ['Königsblaue Rose', 'Rose bleu roi'], 'LS-J06': ['Minze, geblümt', 'Floral menthe'],
  'LS-J07': ['Petrol-Ring', 'Anneau bleu canard'], 'LS-J08': ['Apfelgrün', 'Vert pomme'],
  'LS-J09': ['Pfirsich-Rose', 'Rose pêche'], 'LS-J10': ['Kobalt-Drache', 'Dragon cobalt'],
  'LS-J11': ['Aprikosen-Laterne', 'Lanterne abricot'], 'LS-J12': ['Elektroblau, Ranke', 'Volute bleu électrique'],
  'LS-J13': ['Leuchtpink', 'Rose vif'], 'LS-J14': ['Schwarzer Drache', 'Dragon noir'],
  'LS-J15': ['Vergissmeinnicht-Paisley', 'Paisley pervenche'], 'LS-J16': ['Perl-Paisley', 'Paisley perle'],
  'LS-J17': ['Weisser Drache', 'Dragon blanc'], 'LS-J18': ['Himbeer-Laterne', 'Lanterne framboise'],
  'LS-J19': ['Mitternachts-Drache', 'Dragon minuit'], 'LS-J20': ['Tiefes Petrol', 'Bleu canard profond'],
  'LS-B01': ['Schiefer-Gold-Drache', 'Dragon or ardoise'], 'LS-B02': ['Karmesin-Phönix', 'Phénix cramoisi'],
  'LS-B03': ['Olive-Gold-Drache', 'Dragon or olive'], 'LS-B04': ['Türkis-Gold-Drache', 'Dragon or turquoise'],
  'LS-B05': ['Stein-Gold-Drache', 'Dragon or pierre'], 'LS-B06': ['Nebel-Gold-Laterne', 'Lanterne or brume'],
  'LS-B07': ['Sonnenblumen-Laterne', 'Lanterne tournesol'], 'LS-B08': ['Korall-Himmel-Laterne', 'Lanterne corail ciel'],
  'LS-B09': ['Smaragd-Magenta-Blatt', 'Feuille émeraude magenta'], 'LS-B10': ['Violettrote Laterne', 'Lanterne rouge violet'],
  'LS-B11': ['Schiefer-Silber-Drache', 'Dragon argent ardoise'], 'LS-B12': ['Pflaumen-Magenta-Laterne', 'Lanterne prune magenta'],
  'LS-B13': ['Champagner-Gold-Drache', 'Dragon or champagne'],
  'LS-L01': ['Weiss', 'Blanc'], 'LS-L02': ['Elfenbein', 'Ivoire'], 'LS-L03': ['Gebrochenes Weiss, Noppen', 'Blanc cassé flammé'],
  'LS-L04': ['Haferflocke', 'Avoine'], 'LS-L05': ['Sand', 'Sable'], 'LS-L06': ['Heller Stein', 'Pierre claire'],
  'LS-L07': ['Hellgrau', 'Gris clair'], 'LS-L08': ['Anthrazit', 'Anthracite'], 'LS-L09': ['Schwarz', 'Noir'],
  'LS-L10': ['Tintenblau', 'Bleu encre'], 'LS-L11': ['Marine', 'Marine'], 'LS-L12': ['Meerblau', 'Bleu océan'],
  'LS-L13': ['Königsblau', 'Bleu roi'], 'LS-L14': ['Azur', 'Azur'], 'LS-L15': ['Kornblume', 'Bleuet'],
  'LS-L16': ['Denim', 'Denim'], 'LS-L17': ['Türkis', 'Turquoise'], 'LS-L18': ['Petrol', 'Bleu pétrole'],
  'LS-L19': ['Schieferviolett', 'Violet ardoise'], 'LS-L20': ['Tannengrün', 'Vert pin'], 'LS-L21': ['Salbei', 'Sauge'],
  'LS-L22': ['Jade', 'Jade'], 'LS-L23': ['Moosgrün', 'Vert mousse'], 'LS-L24': ['Olive', 'Olive'],
  'LS-L25': ['Khaki', 'Kaki'], 'LS-L26': ['Senf', 'Moutarde'], 'LS-L27': ['Ocker', 'Ocre'],
  'LS-L28': ['Bernstein', 'Ambre'], 'LS-L29': ['Camel', 'Camel'], 'LS-L30': ['Rost', 'Rouille'],
  'LS-L31': ['Walnuss', 'Noyer'], 'LS-L32': ['Kakao', 'Cacao'], 'LS-L33': ['Umbra', 'Terre d’ombre'],
  'LS-L34': ['Mokka-Taupe', 'Taupe moka'], 'LS-L35': ['Schokolade', 'Chocolat'], 'LS-L36': ['Espresso', 'Expresso'],
  'LS-L37': ['Rot', 'Rouge'], 'LS-L38': ['Altrosa', 'Vieux rose'], 'LS-L39': ['Burgunder', 'Bordeaux'],
  'LS-L40': ['Zartes Flieder', 'Lilas rosé'],
};

/** The library codes that have a German and French name. */
export const NAMED_SWATCHES = Object.keys(NAMES);

/** A colour's name in the reader's language; English when it has none. */
export function swatchName(swatch: { key: string; name: string }, lang: Lang): string {
  if (lang === 'en') return swatch.name;
  const pair = NAMES[swatch.key];
  if (!pair) return swatch.name;
  const fr = lang === 'fr' || lang === 'fr-ch';
  const name = fr ? pair[1] : pair[0];
  return lang === 'de' ? deepDe(name) : name;
}

/** 'Cobalt silk', in the reader's language, for display. */
export function swatchLabelIn(swatch: { key: string; name: string; cloth: string }, lang: Lang): string {
  const t = orderText(lang);
  return t.label(swatchName(swatch, lang), t.cloth[swatch.cloth] ?? swatch.cloth);
}

/** A body or garment measurement's label and hint, in the reader's language. */
export function zoneText(zone: { key: string; label: string; hint: string }, lang: Lang) {
  const z = orderText(lang).zones[zone.key];
  return { label: z?.[0] ?? zone.label, hint: z?.[1] ?? zone.hint };
}

/** The cloth line of an order, from its swatch code when it has one; otherwise
    the words it was written with. */
export function fabricLabel(key: string, fallback: string, lang: Lang): string {
  if (lang === 'en') return fallback;
  const swatch = ALL_SWATCHES.find((w) => w.key === key);
  return swatch ? swatchLabelIn(swatch, lang) : fallback;
}
