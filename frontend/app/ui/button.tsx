import * as React from 'react';
import { Pressable } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'flex-row items-center justify-center rounded-md',
  {
    variants: {
      variant: {
        default: 'bg-primary-500 active:bg-primary-600',
        destructive: 'bg-red-500 active:bg-red-600',
        outline: 'border border-gray-200 bg-transparent active:bg-gray-100',
        secondary: 'bg-gray-100 active:bg-gray-200',
        ghost: 'active:bg-gray-100',
        link: 'underline-offset-4 active:underline',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-14 rounded-md px-8',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

interface ButtonProps
  extends React.ComponentPropsWithoutRef<typeof Pressable>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<
  React.ElementRef<typeof Pressable>,
  ButtonProps
>(({ className, variant, size, ...props }, ref) => {
  return (
    <Pressable
      className={cn(
        buttonVariants({ variant, size }),
        props.disabled && 'opacity-50',
        className
      )}
      ref={ref}
      role="button"
      {...props}
    />
  );
});
Button.displayName = 'Button';

export { Button, buttonVariants };
export type { ButtonProps };
