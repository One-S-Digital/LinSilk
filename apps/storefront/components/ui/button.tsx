import Link from 'next/link';
import type { ComponentProps, ReactNode } from 'react';
import styles from './button.module.css';

type Variant = 'solid' | 'outline' | 'onDark' | 'rule' | 'ruleOnDark';

const classesFor = (variant: Variant, block?: boolean) => {
  const parts = [styles.base];
  if (variant === 'rule' || variant === 'ruleOnDark') {
    parts.push(styles.rule);
    if (variant === 'ruleOnDark') parts.push(styles.ruleOnDark);
  } else {
    parts.push(styles[variant]);
  }
  if (block) parts.push(styles.block);
  return parts.join(' ');
};

export function Button({
  variant = 'solid',
  block,
  className,
  children,
  ...rest
}: ComponentProps<'button'> & {
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      {...rest}
      className={`${classesFor(variant, block)}${className ? ` ${className}` : ''}`}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  href,
  variant = 'solid',
  block,
  className,
  children,
  ...rest
}: Omit<ComponentProps<typeof Link>, 'href'> & {
  href: string;
  variant?: Variant;
  block?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      {...rest}
      className={`${classesFor(variant, block)}${className ? ` ${className}` : ''}`}
    >
      {children}
    </Link>
  );
}
