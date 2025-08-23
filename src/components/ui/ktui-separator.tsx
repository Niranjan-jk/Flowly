import React from 'react';
import { cn } from '@/lib/utils';

interface KTUISeparatorProps {
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function KTUISeparator({ 
  className, 
  orientation = 'horizontal' 
}: KTUISeparatorProps) {
  return (
    <div 
      className={cn(
        'kt-separator',
        orientation === 'vertical' && 'kt-separator-vertical',
        className
      )} 
    />
  );
}

// Example usage component for demo
export function KTUIDemo() {
  return (
    <div className="text-foreground">
      <div className="space-y-1">
        <h4 className="text-sm font-medium leading-none">KTUI</h4>
        <p className="text-sm text-muted-foreground">A free KTUI component library.</p>
      </div>
      <KTUISeparator className="my-2.5" />
      <div className="flex h-5 items-center space-x-4 text-sm">
        <a
          href="https://ktui.io"
          className="hover:text-primary hover:underline hover:underline-offset-2"
        >
          Components
        </a>
        <KTUISeparator orientation="vertical" />
        <a
          href="https://ktui.io/docs"
          className="hover:text-primary hover:underline hover:underline-offset-2"
        >
          Docs
        </a>
        <KTUISeparator orientation="vertical" />
        <a
          href="https://github.com/keenthemes/ktui"
          className="hover:text-primary hover:underline hover:underline-offset-2"
        >
          Source
        </a>
      </div>
    </div>
  );
}