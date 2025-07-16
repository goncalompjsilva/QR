import * as React from 'react';
import { Text as RNText } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const textVariants = cva('text-base text-foreground', {
  variants: {
    variant: {
      default: '',
      destructive: 'text-red-500',
      muted: 'text-gray-500',
      success: 'text-green-500',
      warning: 'text-yellow-500',
    },
    size: {
      default: 'text-base',
      sm: 'text-sm',
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

interface TextProps
  extends React.ComponentPropsWithoutRef<typeof RNText>,
    VariantProps<typeof textVariants> {}

const Text = React.forwardRef<React.ElementRef<typeof RNText>, TextProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <RNText
        className={cn(textVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Text.displayName = 'Text';

export { Text, textVariants };
export type { TextProps };
