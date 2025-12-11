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
        primary: "bg-custom-taupe-grey text-white hover:bg-custom-taupe-grey/90 hover:shadow-lg hover:shadow-custom-taupe-grey/20 focus:ring-custom-taupe-grey border border-transparent shadow-sm",
        secondary: "bg-white text-custom-taupe-grey hover:bg-custom-beige/30 hover:text-custom-taupe-grey border border-gray-200 shadow-sm",
        outline: "bg-white/50 backdrop-blur-sm text-custom-taupe-grey border-2 border-custom-taupe-grey/20 hover:border-custom-taupe-grey hover:text-custom-taupe-grey hover:bg-custom-beige/30",
        ghost: "bg-transparent text-custom-taupe-grey hover:bg-custom-celadon/20 hover:text-custom-taupe-grey",
        danger: "bg-custom-cotton-candy/20 text-red-600 hover:bg-custom-cotton-candy/40 border border-transparent"
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
