import type { ReactNode } from 'react';
import { Parallax, Reveal, RuleDraw } from '@/components/motion';
import { ShotFrame } from '@/components/shot';
import type { StoryKey } from '@/lib/catalog';
import { getStoryPage } from '@/lib/payload';
import styles from './story-page.module.css';

const PLATES: Record<StoryKey, { note: string; weave: 'bone' | 'sand' }[]> = {
  atelier: [
    { note: 'needle mid-stitch', weave: 'bone' },
    { note: 'pinning a shoulder', weave: 'sand' },
    { note: 'paper pattern, chalked', weave: 'bone' },
  ],
  cloth: [
    { note: 'bolt end, mill ticket', weave: 'bone' },
    { note: 'silk, raking light', weave: 'sand' },
    { note: 'wet-spun flax, close', weave: 'bone' },
  ],
  contact: [
    { note: 'the room, morning', weave: 'bone' },
    { note: 'Zürich desk, order book', weave: 'sand' },
    { note: 'finished ticket, signed', weave: 'bone' },
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
