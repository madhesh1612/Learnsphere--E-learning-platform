import React from 'react';
import { cn } from '@/lib/utils';

interface CircularProgressProps extends React.HTMLAttributes<HTMLDivElement> {
    value: number;
    max?: number;
    size?: number;
    strokeWidth?: number;
    circleClassName?: string;
    progressClassName?: string;
    showValue?: boolean;
    valueSuffix?: string;
    label?: string;
    subLabel?: string;
}

export function CircularProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 10,
    className,
    circleClassName,
    progressClassName,
    showValue = true,
    valueSuffix = '',
    label,
    subLabel,
    children,
    ...props
}: CircularProgressProps) {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(Math.max(value, 0), max);
    const dashoffset = circumference - (progress / max) * circumference;

    return (
        <div
            className={cn("relative flex items-center justify-center", className)}
            style={{ width: size, height: size }}
            {...props}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="rotate-[-90deg] transition-all duration-500"
            >
                {/* Background Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className={cn("text-muted/20", circleClassName)}
                />
                {/* Progress Circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashoffset}
                    strokeLinecap="round"
                    className={cn("text-primary transition-all duration-1000 ease-out", progressClassName)}
                />
            </svg>

            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                {children ? (
                    children
                ) : (
                    <>
                        {showValue && (
                            <span className="text-2xl font-bold leading-none">
                                {value}{valueSuffix}
                            </span>
                        )}
                        {label && <span className="text-sm font-medium text-muted-foreground mt-1">{label}</span>}
                        {subLabel && <span className="text-xs text-muted-foreground">{subLabel}</span>}
                    </>
                )}
            </div>
        </div>
    );
}
