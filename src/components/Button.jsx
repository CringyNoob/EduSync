import React from 'react';
import { cn } from '../utils/cn';
import { Loader2 } from 'lucide-react';

const Button = ({
    className,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    children,
    ...props
}) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

    const variants = {
        primary: "bg-primary text-white hover:bg-primary-hover hover:shadow-lg hover:shadow-primary/20 focus:ring-primary border border-transparent shadow-sm",
        secondary: "bg-secondary text-white hover:bg-secondary-light hover:shadow-lg hover:shadow-secondary/20 focus:ring-secondary border border-transparent shadow-sm",
        outline: "bg-white/50 backdrop-blur-sm text-text-main border-2 border-gray-200 hover:border-primary hover:text-primary hover:bg-white",
        ghost: "bg-transparent text-text-main hover:bg-primary/10 hover:text-primary",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-transparent"
    };

    const sizes = {
        sm: "h-8 px-3 text-sm",
        md: "h-10 px-4 py-2",
        lg: "h-12 px-6 text-lg",
        icon: "h-10 w-10",
    };

    return (
        <button
            className={cn(
                baseStyles,
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {children}
        </button>
    );
};

export default Button;
