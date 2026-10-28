import { CommissionFlow } from '@/components/commission-flow';
import { JsonLd } from '@/components/json-ld';
import { SeoFaq, SeoLinks, SeoText } from '@/components/seo-text';
import listing from '@/app/collection/[group]/listing.module.css';
import styles from '@/app/design/design.module.css';
import { LANG, type Lang } from '@/lib/i18n';
import { commissionText } from '@/lib/i18n-commission';
import { pagesText } from '@/lib/i18n-pages';
import { faqLd } from '@/lib/jsonld';
import { localHref } from '@/lib/locale-routes';
import { getFabricCatalogues, getSilhouettes } from '@/lib/medusa';
import { fromLineItemMetadata } from '@/lib/measurements';
import { getCustomer } from '@/lib/session';

/* Design Your Own, in any language. The silhouettes and their opening figures
   are set in the backend, so the house can change a price without a deploy. */
export async function DesignView({ lang }: { lang: Lang }) {
  const t = pagesText(lang).design;
  const [silhouettes, catalogues, customer] = await Promise.all([
    getSilhouettes(),
    getFabricCatalogues(),
    getCustomer(),
  ]);
  /* A signed-in client's own measurements, if they saved any — carried into
     the sheet below so starting a commission on another device does not mean
     typing all fifteen points over again. Anonymous, this stays undefined,
     and the sheet falls back to whatever this browser has, as before. */
  const profile = customer ? fromLineItemMetadata(customer.metadata) : null;

  if (!silhouettes?.length) {
    const c = commissionText(lang);
    return (
      <div className={styles.page} lang={lang === 'en' ? undefined : LANG[lang]}>
        <h1 className={styles.title}>{c.title}</h1>
        <p className={styles.lede}>
          {t.unreachablePre}
          <a href="mailto:hello@bylinsilk.com">hello@bylinsilk.com</a>
          {t.unreachablePost}
        </p>
      </div>
    );
  }

  return (
    <div lang={lang === 'en' ? undefined : LANG[lang]}>
      <CommissionFlow
        silhouettes={silhouettes}
        catalogues={catalogues ?? []}
        initialMeasurements={profile?.values}
        initialUnit={profile?.unit}
      />
      <div className={listing.page}>
        <JsonLd data={faqLd(t.faq)} />
        <SeoText title={t.aboutTitle}>
          <p>{t.about}</p>
          <SeoLinks links={[{ href: localHref(lang, '/made-to-measure'), label: t.mtmLink }]} />
          <SeoFaq title={t.questions} items={t.faq} />
        </SeoText>
      </div>
    </div>
  );
}
