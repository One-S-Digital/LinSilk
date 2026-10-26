/* The name glossary (docs/seo/SEO-GEO-PLAN.md §6.7, COPY-PAGES §6.1): every
 * piece's public title in German and French, keyed by its English title. A
 * native speaker reads this table once; the 66 piece pages follow from it.
 * Cloth leads, no colour word, never "satin". A title not listed here shows
 * in English until it is added. */

import type { Lang } from './i18n';

type Name = { de: string; fr: string };

const N: Record<string, Name> = {
  'Silk gathered-halter plunge gown': {
    de: 'Seiden-Abendkleid mit gerafftem Neckholder und tiefem Ausschnitt',
    fr: 'Robe de soirée en soie dos-nu froncée à décolleté plongeant',
  },
  'Silk keyhole-collar midi dress': {
    de: 'Seiden-Midikleid mit Schlüssellochkragen',
    fr: 'Robe midi en soie à col trou de serrure',
  },
  'Silk tie-neck halter gown': {
    de: 'Seiden-Abendkleid mit Neckholder zum Binden',
    fr: 'Robe de soirée en soie dos-nu à nouer',
  },
  'Silk cowl halter gown': {
    de: 'Seiden-Abendkleid mit Wasserfallausschnitt im Neckholder-Stil',
    fr: 'Robe de soirée en soie dos-nu à col bénitier',
  },
  'Silk wrap shirt dress': {
    de: 'Seiden-Hemdblusenkleid im Wickelstil',
    fr: 'Robe chemise portefeuille en soie',
  },
  'Silk long-sleeve wrap maxi dress': {
    de: 'Seiden-Wickelmaxikleid mit langen Ärmeln',
    fr: 'Robe maxi portefeuille en soie à manches longues',
  },
  'Silk short-sleeve wrap maxi dress with slit': {
    de: 'Seiden-Wickelmaxikleid mit kurzen Ärmeln und Schlitz',
    fr: 'Robe maxi portefeuille en soie à manches courtes et fente',
  },
  'Silk flutter-sleeve wrap midi dress': {
    de: 'Seiden-Wickelmidikleid mit Volantärmeln',
    fr: 'Robe midi portefeuille en soie à manches volantées',
  },
  'Silk one-shoulder wrap midi dress': {
    de: 'Seiden-Wickelmidikleid mit One-Shoulder-Schnitt',
    fr: 'Robe midi portefeuille en soie asymétrique à une épaule',
  },
  'Silk high-neck halter gown with thigh-high slit': {
    de: 'Seiden-Abendkleid mit hohem Neckholder und hohem Beinschlitz',
    fr: 'Robe de soirée en soie dos-nu à col montant et fente haute',
  },
  'Silk high-neck halter gown with slit and train': {
    de: 'Seiden-Abendkleid mit hohem Neckholder, Schlitz und Schleppe',
    fr: 'Robe de soirée en soie dos-nu à col montant, fente et traîne',
  },
  'Silk flutter-sleeve wrap hi-low dress': {
    de: 'Seiden-Wickelkleid mit Volantärmeln und Hi-Low-Saum',
    fr: 'Robe portefeuille en soie à manches volantées et ourlet asymétrique',
  },
  'Silk bias-cut midi skirt': {
    de: 'Schräg geschnittener Seiden-Midirock',
    fr: 'Jupe midi en soie coupée dans le biais',
  },
  'Silk bias-cut maxi skirt with godet hem': {
    de: 'Schräg geschnittener Seiden-Maxirock mit Godet-Saum',
    fr: 'Jupe maxi en soie coupée dans le biais, ourlet à godets',
  },
  'Linen shirt and wide-leg trousers set': {
    de: 'Leinen-Set aus Hemd und weiter Hose',
    fr: 'Ensemble en lin chemise et pantalon large',
  },
  'Linen tie-front vest and wide-leg trousers set': {
    de: 'Leinen-Set aus Weste zum Binden und weiter Hose',
    fr: 'Ensemble en lin gilet à nouer et pantalon large',
  },
  'Linen button-front waistcoat and patch-pocket trousers set': {
    de: 'Leinen-Set aus geknöpfter Weste und Hose mit aufgesetzten Taschen',
    fr: 'Ensemble en lin gilet boutonné et pantalon à poches plaquées',
  },
  'Linen crop top and drawstring trousers set': {
    de: 'Leinen-Set aus Crop-Top und Hose mit Kordelzug',
    fr: 'Ensemble en lin top court et pantalon à cordon',
  },
  'Linen waistcoat and pleated wide-leg trousers set': {
    de: 'Leinen-Set aus Weste und weiter Bundfaltenhose',
    fr: 'Ensemble en lin gilet et pantalon large à pinces',
  },
  'Linen wrap-tie waistcoat and relaxed trousers set': {
    de: 'Leinen-Set aus Wickelweste zum Binden und lockerer Hose',
    fr: 'Ensemble en lin gilet cache-cœur à nouer et pantalon ample',
  },
  'Linen longline duster vest and wide-leg trousers set': {
    de: 'Leinen-Set aus langer Duster-Weste und weiter Hose',
    fr: 'Ensemble en lin gilet long type duster et pantalon large',
  },
  'Linen deep-V waistcoat and wide-leg trousers set': {
    de: 'Leinen-Set aus Weste mit tiefem V-Ausschnitt und weiter Hose',
    fr: 'Ensemble en lin gilet à décolleté en V profond et pantalon large',
  },
  'Linen asymmetric-button waistcoat and wide-leg trousers set': {
    de: 'Leinen-Set aus Weste mit asymmetrischer Knopfleiste und weiter Hose',
    fr: 'Ensemble en lin gilet à boutonnage asymétrique et pantalon large',
  },
  'Linen mock-neck longline vest and pleated trousers set': {
    de: 'Leinen-Set aus langer Weste mit Stehkragen und Bundfaltenhose',
    fr: 'Ensemble en lin gilet long à col montant et pantalon à pinces',
  },
  'Linen wrap-tie waistcoat and pleated trousers set': {
    de: 'Leinen-Set aus Wickelweste zum Binden und Bundfaltenhose',
    fr: 'Ensemble en lin gilet cache-cœur à nouer et pantalon à pinces plissé',
  },
  'Linen cascade-panel top and cropped wide-leg trousers set': {
    de: 'Leinen-Set aus Top mit Kaskadenpartie und verkürzter weiter Hose',
    fr: 'Ensemble en lin top à panneau cascade et pantalon large court',
  },
  'Linen button-front waistcoat and slant-pocket trousers set': {
    de: 'Leinen-Set aus geknöpfter Weste und Hose mit Schrägtaschen',
    fr: 'Ensemble en lin gilet boutonné et pantalon à poches obliques',
  },
  'Silk slip mini dress': {
    de: 'Seiden-Slip-Minikleid',
    fr: 'Mini-robe nuisette en soie',
  },
  'Silk short-sleeve pyjama shirt and shorts set': {
    de: 'Seiden-Pyjama-Set aus kurzärmeligem Hemd und Shorts',
    fr: 'Pyjama en soie chemise à manches courtes et short',
  },
  'Silk tie-halter cami and shorts set': {
    de: 'Seiden-Set aus Neckholder-Cami zum Binden und Shorts',
    fr: 'Ensemble en soie caraco dos-nu à nouer et short',
  },
  'Silk tie-halter cami and wide-leg trousers set': {
    de: 'Seiden-Set aus Neckholder-Cami zum Binden und weiter Hose',
    fr: 'Ensemble en soie caraco dos-nu à nouer et pantalon large',
  },
  'Silk boxy tee and wide-leg trousers set': {
    de: 'Seiden-Set aus Boxy-Shirt und weiter Hose',
    fr: 'Ensemble en soie tee-shirt boxy et pantalon large',
  },
  'Silk tank and dolphin-hem shorts set': {
    de: 'Seiden-Set aus Tanktop und Shorts mit Delfin-Saum',
    fr: 'Ensemble en soie débardeur et short dauphin',
  },
  'Silk pyjama tee and dolphin-hem shorts set': {
    de: 'Seiden-Set aus Pyjama-Shirt und Shorts mit Delfin-Saum',
    fr: 'Ensemble en soie tee-shirt de pyjama et short dauphin',
  },
  'Silk three-piece set: kimono robe, cami and shorts': {
    de: 'Dreiteiliges Seiden-Set: Kimono-Morgenmantel, Cami und Shorts',
    fr: 'Ensemble trois pièces en soie : kimono, caraco et short',
  },
  'Silk long wrap robe and midi slip dress set': {
    de: 'Seiden-Set aus langem Wickel-Morgenmantel und Midi-Slipkleid',
    fr: 'Ensemble en soie long peignoir portefeuille et robe nuisette midi',
  },
  'Silk wrap-front pyjama shirt and trousers set': {
    de: 'Seiden-Pyjama-Set aus Wickelhemd und Hose',
    fr: 'Pyjama en soie chemise cache-cœur et pantalon',
  },
  'Linen camp-collar shirt and shorts set': {
    de: 'Leinen-Set aus Camp-Kragen-Hemd und Shorts',
    fr: 'Ensemble en lin chemise à col cubain et short',
  },
  'Linen spread-collar shirt': {
    de: 'Leinenhemd mit Kentkragen',
    fr: 'Chemise en lin à col italien',
  },
  'Linen cuffed trousers with side adjuster': {
    de: 'Leinenhose mit Umschlag und seitlichem Verstellband',
    fr: 'Pantalon en lin à revers avec serrage latéral',
  },
  'Linen popover shirt': {
    de: 'Leinen-Überziehhemd',
    fr: 'Chemise en lin à enfiler',
  },
  'Linen open camp-collar shirt': {
    de: 'Leinenhemd mit offenem Camp-Kragen',
    fr: 'Chemise en lin à col cubain ouvert',
  },
  'Linen gurkha trousers': {
    de: 'Leinen-Gurkhahose',
    fr: 'Pantalon gurkha en lin',
  },
  'Linen closed-collar camp shirt': {
    de: 'Leinenhemd mit geschlossenem Camp-Kragen',
    fr: 'Chemise cubaine en lin à col fermé',
  },
  'Linen high-waist trousers with double side buckles': {
    de: 'Leinenhose mit hohem Bund und doppelten seitlichen Schnallen',
    fr: 'Pantalon en lin taille haute à doubles boucles latérales',
  },
  'Linen textured camp-collar shirt': {
    de: 'Strukturiertes Leinenhemd mit Camp-Kragen',
    fr: 'Chemise en lin texturée à col cubain',
  },
  'Linen slim single-pleat trousers': {
    de: 'Schmale Leinenhose mit einer Bundfalte',
    fr: 'Pantalon en lin slim à un pli',
  },
  'Linen waffle-texture camp-collar shirt': {
    de: 'Leinenhemd mit Camp-Kragen in Waffelstruktur',
    fr: 'Chemise en lin à col cubain, texture gaufrée',
  },
  'Linen pleated trousers with double-button waist': {
    de: 'Leinen-Bundfaltenhose mit Doppelknopf-Bund',
    fr: 'Pantalon en lin à pinces, taille à double bouton',
  },
  'Linen utility camp-collar shirt': {
    de: 'Leinenhemd im Utility-Stil mit Camp-Kragen',
    fr: 'Chemise en lin utilitaire à col cubain',
  },
  'Linen pleated trousers with wide waistband': {
    de: 'Leinen-Bundfaltenhose mit breitem Bund',
    fr: 'Pantalon en lin à pinces, ceinture large',
  },
  'Linen camp-collar shirt with straight hem': {
    de: 'Leinenhemd mit Camp-Kragen und geradem Saum',
    fr: 'Chemise en lin à col cubain et ourlet droit',
  },
  'Linen high-rise straight-leg trousers': {
    de: 'Gerade Leinenhose mit hohem Bund',
    fr: 'Pantalon en lin droit taille haute',
  },
  'Linen pleated trousers with side adjuster tabs': {
    de: 'Leinen-Bundfaltenhose mit seitlichen Verstelllaschen',
    fr: 'Pantalon en lin à pinces avec pattes de serrage latérales',
  },
  'Linen wrap shirt with side tie': {
    de: 'Leinen-Wickelhemd mit seitlicher Schleife',
    fr: 'Chemise portefeuille en lin à nouer sur le côté',
  },
  'Linen lace-up polo shirt': {
    de: 'Leinen-Polohemd mit Schnürung',
    fr: 'Polo en lin à lacets',
  },
  'Linen short-sleeve band-collar shirt': {
    de: 'Kurzärmeliges Leinenhemd mit Stehkragen',
    fr: 'Chemise en lin à manches courtes et col mao',
  },
  'Linen double-breasted band-collar shirt': {
    de: 'Zweireihiges Leinenhemd mit Stehkragen',
    fr: 'Chemise en lin croisée à col mao',
  },
  'Linen straight-leg trousers with button-trim panels': {
    de: 'Gerade Leinenhose mit Einsätzen und Knopfbesatz',
    fr: 'Pantalon en lin droit à empiècements boutonnés',
  },
  'Linen wide-leg drawstring trousers with side buttons': {
    de: 'Weite Leinenhose mit Kordelzug und seitlichen Knöpfen',
    fr: 'Pantalon large en lin à cordon et boutons latéraux',
  },
  'Silk cowl slip midi dress': {
    de: 'Seiden-Slip-Midikleid mit Wasserfallausschnitt',
    fr: 'Robe midi nuisette en soie à col bénitier',
  },
  'Silk ruffle-shoulder fit-and-flare midi dress': {
    de: 'Ausgestelltes Seiden-Midikleid mit Rüschenschultern',
    fr: 'Robe midi en soie évasée à épaules volantées',
  },
  'Silk open-back slip midi dress': {
    de: 'Seiden-Slip-Midikleid mit offenem Rücken',
    fr: 'Robe midi nuisette en soie dos nu',
  },
  'Linen button-up shirt': {
    de: 'Leinenhemd mit Knopfleiste',
    fr: 'Chemise en lin boutonnée',
  },
  'Linen pleated tapered trousers': {
    de: 'Zulaufende Leinen-Bundfaltenhose',
    fr: 'Pantalon en lin à pinces fuselé',
  },
  'Silk ruffle-front blouse': {
    de: 'Seidenbluse mit Rüschenfront',
    fr: 'Chemisier en soie à devant volanté',
  },
  'Silk mock-neck blouse': {
    de: 'Seidenbluse mit Stehkragen',
    fr: 'Chemisier en soie à col montant',
  },
};

export const PIECE_NAMES = N;

/** A piece's name in a language; the English title when it is not listed. */
export function pieceName(title: string, lang: Lang): string {
  if (lang === 'en') return title;
  const n = N[title];
  return n ? (lang.startsWith('de') ? n.de : n.fr) : title;
}
