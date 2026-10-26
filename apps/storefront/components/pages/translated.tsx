import Link from 'next/link';
import { DocList, DocP, DocPage, DocRows, DocSection } from '@/components/doc-page';
import { JsonLd } from '@/components/json-ld';
import { CHROME } from '@/lib/chrome-i18n';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { getPieces, money } from '@/lib/catalog';
import { COLOURS, EMAIL, priceRange } from '@/lib/house';
import { LANG, type Locale } from '@/lib/i18n';
import { faqLd } from '@/lib/jsonld';
import { localHref } from '@/lib/locale-routes';
import { aboutCopy, bankCopy, clothCopy, mtmCopy } from '@/lib/pages-i18n';

/* The translated content pages (docs/seo/SEO-GEO-PLAN.md §6.7). Same layout
   as the English pages, with the words from lib/pages-i18n.ts. */

const range = (r: { from: number; to: number }) => `${money(r.from)}–${r.to}`;

export async function MadeToMeasureTranslated({ locale }: { locale: Locale }) {
  const c = mtmCopy(locale);
  const pieces = await getPieces();
  const all = priceRange(pieces);
  const silk = priceRange(pieces.filter((p) => p.cloth === 'silk'));
  const linen = priceRange(pieces.filter((p) => p.cloth === 'linen'));

  return (
    <div lang={LANG[locale]}>
      <DocPage
        eyebrow={c.eyebrow}
        title={c.h1}
        lead={c.lead}
        foot={
          <>
            <ButtonLink href="/collection" variant="outline">{c.see}</ButtonLink>
            <ButtonLink href="/care/measuring" variant="rule">{c.guide}</ButtonLink>
          </>
        }
      >
        <JsonLd data={faqLd(c.faq)} />

        <DocSection title={c.howH}>
          <DocList items={c.steps(COLOURS.silk, COLOURS.linen)} />
        </DocSection>

        {all && (
          <DocSection title={c.payH}>
            <DocP>
              {c.payLine(
                `${money(all.from)} – ${money(all.to)}`,
                silk && linen ? c.silkLinen(money(silk.from), money(linen.from)) : '',
              )}
              <Link href="/care/shipping">{c.dutyLink}</Link>
              {c.payDutyEnd}
            </DocP>
          </DocSection>
        )}

        <DocSection title={c.termsH}>
          <DocP>{c.terms}</DocP>
        </DocSection>

        <DocSection title={c.noFitH}>
          <DocP>{c.noFit}</DocP>
        </DocSection>

        <DocSection title={c.designH}>
          <DocP>
            {c.design}
            <Link href="/design">{c.designLink}</Link>
          </DocP>
        </DocSection>

        <DocSection title={c.questionsH}>
          {c.faq.map(({ q, a }) => (
            <div key={q}>
              <DocP>
                <strong>{q}</strong>
                <br />
                {a}
              </DocP>
            </div>
          ))}
        </DocSection>
      </DocPage>
    </div>
  );
}

export async function AboutTranslated({ locale }: { locale: Locale }) {
  const c = aboutCopy(locale);
  const r = priceRange(await getPieces());

  return (
    <div lang={LANG[locale]}>
      <DocPage
        eyebrow={c.eyebrow}
        title={c.h1}
        lead={c.entity}
        foot={
          <>
            <ButtonLink href="/collection" variant="outline">{c.see}</ButtonLink>
            <ButtonLink href="/contact" variant="rule">{c.contact}</ButtonLink>
          </>
        }
      >
        <DocSection title={c.meansH}>
          <DocP>
            {c.meansPre}
            <Link href="/care/measuring">{c.guideLink}</Link>
            {c.meansPost}
          </DocP>
        </DocSection>

        <DocSection title={c.whyH}>
          <DocP>{c.why}</DocP>
        </DocSection>

        <DocSection title={c.glanceH}>
          <DocRows
            rows={[
              c.rows.what,
              c.rows.where,
              c.rows.cloth,
              [c.rows.colours[0], c.rows.colours[1](COLOURS.silk, COLOURS.linen)],
              ...(r ? [[c.rows.price[0], c.rows.price[1](range(r))] as [string, string]] : []),
              c.rows.making,
              c.rows.order,
              c.rows.fittings,
              c.rows.delivery,
              c.rows.returns,
              [c.rows.contact[0], c.rows.contact[1](EMAIL)],
            ]}
          />
        </DocSection>
      </DocPage>
    </div>
  );
}

export function ClothTranslated({ locale }: { locale: Locale }) {
  const c = clothCopy(locale);
  return (
    <div lang={LANG[locale]}>
      <StoryPage storyKey="cloth" content={{ title: c.h1, lead: c.lead, a: c.a, b: c.b }}>
        <ButtonLink href={localHref(locale, '/care/questions')} variant="rule">
          {c.cta}
        </ButtonLink>
      </StoryPage>
    </div>
  );
}

export async function QuestionsTranslated({ locale }: { locale: Locale }) {
  const c = bankCopy(locale);
  const r = priceRange(await getPieces());
  /* The price and colour answers carry live numbers, so they are built here
     and slotted into the group they belong to. */
  const groups = c.groups.map((g, i) => ({
    ...g,
    items:
      i === 1
        ? [...g.items.slice(0, 5), c.colours(COLOURS.silk, COLOURS.linen), ...g.items.slice(5)]
        : i === 2 && r
          ? [...g.items.slice(0, 2), c.price(range(r)), ...g.items.slice(2)]
          : i === 3
            ? [g.items[0], c.contactQ(EMAIL), ...g.items.slice(1)]
            : g.items,
  }));

  return (
    <div lang={LANG[locale]}>
      <DocPage
        eyebrow={CHROME[locale].care}
        title={c.h1}
        lead={c.lead(EMAIL)}
        foot={
          <>
            <ButtonLink href="/care/measuring" variant="rule">{c.measuring}</ButtonLink>
            <ButtonLink href="/care/shipping" variant="rule">{c.shipping}</ButtonLink>
          </>
        }
      >
        <JsonLd data={faqLd(groups.flatMap((g) => g.items))} />
        {groups.map((group) => (
          <DocSection key={group.title} title={group.title}>
            {group.items.map(({ q, a }) => (
              <DocP key={q}>
                <strong>{q}</strong>
                <br />
                {a}
              </DocP>
            ))}
          </DocSection>
        ))}
      </DocPage>
    </div>
  );
}
