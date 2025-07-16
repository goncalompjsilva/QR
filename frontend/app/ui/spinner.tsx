import * as React from 'react';
import { ActivityIndicator } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const spinnerVariants = cva('', {
  variants: {
    variant: {
      default: '',
    },
    spinnerSize: {
      small: '',
      large: '',
    },
  },
  defaultVariants: {
    variant: 'default',
    spinnerSize: 'small',
  },
});

interface SpinnerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof ActivityIndicator>, 'size'>,
    VariantProps<typeof spinnerVariants> {}

const Spinner = React.forwardRef<React.ElementRef<typeof ActivityIndicator>, SpinnerProps>(
  ({ className, spinnerSize, ...props }, ref) => {
    return (
      <ActivityIndicator
        size={spinnerSize === 'large' ? 'large' : 'small'}
        className={cn(spinnerVariants({ spinnerSize }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Spinner.displayName = 'Spinner';

export { Spinner, spinnerVariants };
export type { SpinnerProps };
