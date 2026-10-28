import { DocList, DocP, DocPage, DocRows, DocSection } from '@/components/doc-page';
import { StoryPage } from '@/components/story-page';
import { ButtonLink } from '@/components/ui/button';
import { ZONES } from '@/lib/catalog';
import { LANG, type Lang } from '@/lib/i18n';
import { zoneText } from '@/lib/i18n-order';
import { pagesText } from '@/lib/i18n-pages';
import { localHref } from '@/lib/locale-routes';

/* Shipping, returns, the measurement guide and contact, in any language. */

const wrap = (lang: Lang, children: React.ReactNode) => (
  <div lang={lang === 'en' ? undefined : LANG[lang]}>{children}</div>
);

export function ShippingView({ lang }: { lang: Lang }) {
  const t = pagesText(lang).shipping;
  const to = (p: string) => localHref(lang, p);
  return wrap(
    lang,
    <DocPage
      eyebrow={lang === 'en' ? undefined : eyebrow(lang)}
      title={t.title}
      lead={t.lead}
      foot={
        <>
          <ButtonLink href={to('/care/returns')} variant="rule">{t.returns}</ButtonLink>
          <ButtonLink href={to('/care/questions')} variant="rule">{t.questions}</ButtonLink>
        </>
      }
    >
      <DocSection title={t.timeH}>
        <DocP>{t.time}</DocP>
        <DocRows rows={t.rows} />
      </DocSection>
      <DocSection title={t.dutyH}>
        <DocP>{t.duty}</DocP>
      </DocSection>
      <DocSection title={t.trackH}>
        <DocP>{t.track}</DocP>
      </DocSection>
    </DocPage>,
  );
}

export function ReturnsView({ lang }: { lang: Lang }) {
  const t = pagesText(lang).returns;
  return wrap(
    lang,
    <DocPage
      eyebrow={lang === 'en' ? undefined : eyebrow(lang)}
      title={t.title}
      lead={t.lead}
      foot={<ButtonLink href="mailto:hello@bylinsilk.com" variant="outline">{t.write}</ButtonLink>}
    >
      <DocSection title={t.faultsH}>
        <DocP>{t.faults}</DocP>
      </DocSection>
      <DocSection title={t.beforeH}>
        <DocP>{t.before}</DocP>
      </DocSection>
    </DocPage>,
  );
}

export function MeasuringView({ lang }: { lang: Lang }) {
  const t = pagesText(lang).measuring;
  return wrap(
    lang,
    <DocPage
      eyebrow={lang === 'en' ? undefined : eyebrow(lang)}
      title={t.title}
      lead={t.lead}
      foot={
        <>
          <ButtonLink href={localHref(lang, '/collection')} variant="outline">{t.enter}</ButtonLink>
          <ButtonLink href="mailto:hello@bylinsilk.com" variant="rule">{t.help}</ButtonLink>
        </>
      }
    >
      <DocSection title={t.beforeH}>
        <DocList items={t.before} />
      </DocSection>
      <DocSection title={t.fifteenH}>
        <DocList
          items={ZONES.map((z) => {
            const text = zoneText(z, lang);
            return (
              <>
                <strong style={{ fontWeight: 400 }}>{text.label}</strong> — {text.hint}
              </>
            );
          })}
        />
      </DocSection>
      <DocSection title={t.ratherH}>
        <DocP>{t.rather}</DocP>
      </DocSection>
      <DocSection title={t.wrongH}>
        <DocP>{t.wrong}</DocP>
      </DocSection>
    </DocPage>,
  );
}

export async function ContactView({ lang }: { lang: Lang }) {
  const t = pagesText(lang).contact;
  return wrap(
    lang,
    <StoryPage storyKey="contact" content={lang === 'en' ? undefined : t.story}>
      <ButtonLink href="mailto:hello@bylinsilk.com" variant="outline">
        hello@bylinsilk.com
      </ButtonLink>
      <ButtonLink href={localHref(lang, '/care/measuring')} variant="rule">
        {t.help}
      </ButtonLink>
    </StoryPage>,
  );
}

/* DocPage's default eyebrow is English ("Client care"). */
function eyebrow(lang: Lang) {
  return lang === 'fr' || lang === 'fr-ch' ? 'Service client' : 'Kundenservice';
}
