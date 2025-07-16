import * as React from 'react';
import { View } from 'react-native';
import { cn } from '../../lib/utils';

interface ViewProps extends React.ComponentPropsWithoutRef<typeof View> {}

const Box = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        className={cn('', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Box.displayName = 'Box';

// VStack - Vertical Stack
const VStack = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        className={cn('flex flex-col', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
VStack.displayName = 'VStack';

// HStack - Horizontal Stack
const HStack = React.forwardRef<React.ElementRef<typeof View>, ViewProps>(
  ({ className, ...props }, ref) => {
    return (
      <View
        className={cn('flex flex-row', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
HStack.displayName = 'HStack';

export { Box, VStack, HStack };
export type { ViewProps };
