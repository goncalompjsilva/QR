import * as React from 'react';
import { View } from 'react-native';
import { Text } from './text';
import { cn } from '../../lib/utils';

interface FormControlProps extends React.ComponentPropsWithoutRef<typeof View> {
  isInvalid?: boolean;
  isRequired?: boolean;
}

const FormControl = React.forwardRef<React.ElementRef<typeof View>, FormControlProps>(
  ({ className, isInvalid, isRequired, ...props }, ref) => {
    return (
      <View
        className={cn('flex flex-col space-y-2', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
FormControl.displayName = 'FormControl';

interface LabelProps extends React.ComponentPropsWithoutRef<typeof Text> {}

const Label = React.forwardRef<React.ElementRef<typeof Text>, LabelProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        className={cn('text-sm font-medium text-foreground', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Label.displayName = 'Label';

interface FormHelperTextProps extends React.ComponentPropsWithoutRef<typeof Text> {}

const FormHelperText = React.forwardRef<React.ElementRef<typeof Text>, FormHelperTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        className={cn('text-sm text-muted-foreground', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
FormHelperText.displayName = 'FormHelperText';

interface FormErrorTextProps extends React.ComponentPropsWithoutRef<typeof Text> {}

const FormErrorText = React.forwardRef<React.ElementRef<typeof Text>, FormErrorTextProps>(
  ({ className, ...props }, ref) => {
    return (
      <Text
        className={cn('text-sm text-red-500', className)}
        ref={ref}
        {...props}
      />
    );
  }
);
FormErrorText.displayName = 'FormErrorText';

export { FormControl, Label, FormHelperText, FormErrorText };
export type { FormControlProps, LabelProps, FormHelperTextProps, FormErrorTextProps };
