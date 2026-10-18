import type { ReactNode } from 'react';
import { Parallax, Reveal, RuleDraw } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import type { StoryKey } from '@/lib/catalog';
import { getStoryPage } from '@/lib/payload';
import styles from './story-page.module.css';

const PLATES: Record<StoryKey, { note: string; weave: 'bone' | 'sand'; src?: string; alt?: string }[]> = {
  cloth: [
    { note: 'cloth, folded', weave: 'bone', src: '/images/cloth-folded.webp', alt: 'Folded lengths of silk in woven dragon, rose, lantern and paisley designs, fanned out on an oak table' },
    { note: 'silk, raking light', weave: 'sand', src: '/images/cloth-silk.webp', alt: 'Ivory and peach silk in deep folds beside a basket of cocoons and a wooden spool of silk thread' },
    { note: 'linen, close', weave: 'bone', src: '/images/cloth-linen.webp', alt: 'A bolt of oatmeal linen with a frayed edge, unrolled beside a pair of brass shears' },
  ],
  contact: [
    { note: 'hand finishing', weave: 'bone', src: '/images/atelier-needle.webp', alt: 'Hands hand-stitching a silk garment' },
    { note: 'pattern, marked on cloth', weave: 'sand', src: '/images/commission.webp', alt: 'Pattern lines marked on cloth beside scissors and pins' },
    { note: 'fitting, on the form', weave: 'bone', src: '/images/atelier-pin.webp', alt: 'A silk blouse being pinned on a dress form' },
  ],
};

export async function StoryPage({
  storyKey,
  children,
}: {
  storyKey: StoryKey;
  children?: ReactNode;
}) {
  const story = await getStoryPage(storyKey);
  const plates = PLATES[storyKey];

  return (
    <article className={styles.page}>
      <h1 className={styles.title}>{story.title}</h1>
      <Reveal y={18}>
        <p className={styles.lead}>{story.lead}</p>
      </Reveal>

      <div className={styles.plates}>
        {plates.map((plate, i) => (
          <Parallax
            key={plate.note}
            distance={i === 1 ? -28 : 28 - i * 8}
            className={i === 1 ? styles.plateLower : undefined}
            style={{ aspectRatio: '3 / 4' }}
          >
            <ShotFrame
              note={plate.note}
              weave={plate.weave}
              src={plate.src}
              alt={plate.alt}
              ratio="auto"
              style={{ height: '130%', marginTop: '-15%' }}
            />
          </Parallax>
        ))}
      </div>

      <div className={styles.rule}>
        <RuleDraw />
      </div>

      <div className={styles.columns}>
        <Reveal>
          <p className={styles.prose}>{story.a}</p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className={styles.prose}>{story.b}</p>
        </Reveal>
      </div>

      {children && <div className={styles.foot}>{children}</div>}
    </article>
  );
}
