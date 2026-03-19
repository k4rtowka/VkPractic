import InlineSVG from 'react-inlinesvg';
import cn from 'classnames';

export type SvgProps = {
  name: string;
  width?: number | string;
  height?: number | string;
  className?: string;
};

export const Svg = ({ name, width = 20, height = 20, className }: SvgProps) => {
  return (
    <InlineSVG
      src={`/icons/${name}.svg`}
      width={width}
      height={height}
      className={cn(className)}
      aria-hidden
    />
  );
};
