import { type FC, type ReactNode, useCallback } from 'react';

import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';
import { Heading } from '../heading/heading';
import { HeadingType } from '../heading/heading.types';
import styles from './Accordion.module.css';
import { AccordionStyle } from './accordion.types';

export interface IAccordionProps {
  label: ReactNode;
  labelClassName?: string;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  open?: boolean;
  onClick?: (toOpen: boolean) => void;
  style?: AccordionStyle;
  flatMode?: boolean;
  alwaysMounted?: boolean;
}

export const Accordion: FC<IAccordionProps> = ({
  label,
  children,
  className,
  disabled = false,
  open = false,
  onClick,
  labelClassName,
  style = AccordionStyle.primary,
  flatMode,
  alwaysMounted = false,
}) => {
  const onClickCallback = useCallback(
    () => !disabled && !flatMode && onClick?.(!open),
    [disabled, flatMode, onClick, open],
  );

  return (
    <div className={cn(styles.accordion, styles[style], className)}>
      <button
        className={cn(
          styles.label,
          {
            [styles.disabled]: disabled,
          },
          labelClassName,
        )}
        onClick={onClickCallback}
      >
        <>
          {typeof label === 'string' ? (
            <Heading type={HeadingType.h3}>{label}</Heading>
          ) : (
            label
          )}
        </>
        {!flatMode && (
          <div className={styles.arrow}>
            <ChevronDown
              className={cn(styles.icon, 'w-5 h-5', {
                [styles.isOpen]: open,
              })}
            />
          </div>
        )}
      </button>
      {alwaysMounted && (
        <div className={cn(styles.content, open && styles.isOpen)}>
          {children}
        </div>
      )}

      {!alwaysMounted && open && (
        <div className={cn(styles.content, styles.isOpen)}>{children}</div>
      )}
    </div>
  );
};
