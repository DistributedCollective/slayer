import { Info } from 'lucide-react';
import type { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

type InfoButtonProps = {
  content?: ReactNode;
};

export const InfoButton = ({ content }: InfoButtonProps) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <div className="cursor-pointer leading-none flex items-center">
        <Info className="inline h-3 w-3 text-neutral-400 ml-1" />
      </div>
    </TooltipTrigger>
    <TooltipContent side="top" align="center" className="max-w-3xs">
      <p>{content}</p>
    </TooltipContent>
  </Tooltip>
);
