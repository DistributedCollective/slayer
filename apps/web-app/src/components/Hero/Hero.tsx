import { cn } from '@/lib/utils';
import type { FC, PropsWithChildren, ReactNode } from 'react';

type HeroProps = {
  title?: ReactNode;
  className?: string;
};

export const Hero: FC<PropsWithChildren<HeroProps>> = ({
  title,
  children,
  className,
}) => (
  <div className={cn('mt-12 mb-9', className)}>
    <h1 className="inline-block mb-4 font-bold text-3xl lg:text-5xl bg-gradient-to-r from-black dark:from-white to-[#989898] bg-clip-text text-transparent">
      {title}
    </h1>
    <div className="font-medium text-neutral-400">{children}</div>
  </div>
);
