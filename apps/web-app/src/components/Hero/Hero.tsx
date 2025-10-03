import type { FC, PropsWithChildren, ReactNode } from 'react';

type HeroProps = {
  title?: ReactNode;
};

export const Hero: FC<PropsWithChildren<HeroProps>> = ({ title, children }) => {
  return (
    <div className="mt-12 mb-9">
      <h1 className="inline-block mb-4 font-bold text-5xl bg-gradient-to-r from-black dark:from-white to-[#989898] bg-clip-text text-transparent">
        {title}
      </h1>
      <div className="font-medium text-neutral-500">{children}</div>
    </div>
  );
};
