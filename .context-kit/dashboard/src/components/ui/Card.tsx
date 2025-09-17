import { HTMLAttributes, forwardRef } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const baseClasses = 'rounded-lg bg-white';
    
    const variants = {
      default: 'border border-gray-200',
      outlined: 'border-2 border-gray-300',
      elevated: 'shadow-md border border-gray-100'
    };

    const classes = `${baseClasses} ${variants[variant]} ${className || ''}`;

    return (
      <div
        ref={ref}
        className={classes}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 border-b border-gray-200 ${className || ''}`}
        {...props}
      />
    );
  }
);

CardHeader.displayName = 'CardHeader';

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 ${className || ''}`}
        {...props}
      />
    );
  }
);

CardContent.displayName = 'CardContent';

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`p-6 pt-0 ${className || ''}`}
        {...props}
      />
    );
  }
);

CardFooter.displayName = 'CardFooter';