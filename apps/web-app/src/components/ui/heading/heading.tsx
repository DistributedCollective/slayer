import React, { type FC, type ReactNode } from 'react';

import { cn } from '@/lib/utils';
import styles from './heading.module.css';
import { HeadingType } from './heading.types';

export type HeadingProps = {
  children?: ReactNode;
  type?: HeadingType;
  className?: string;
};

export const Heading: FC<HeadingProps> = ({
  children,
  type = HeadingType.h1,
  className,
}) =>
  React.createElement(
    type,
    {
      className: cn(styles[type], className),
    },
    children,
  );
