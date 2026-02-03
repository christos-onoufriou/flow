'use client';

import React, { useState, useRef, useEffect } from 'react';

interface DropdownProps {
    label: React.ReactNode;
    children: React.ReactNode;
    isActive?: boolean;
    className?: string;
}

export function Dropdown({ label, children, isActive, className }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={className}
                data-active={isActive}
                data-open={isOpen}
                style={{
                    // Only keeping layout styles that might be specific if class isn't sufficient, but toolButton covers most
                    // Keeping minimal reset just in case or relying fully on class
                }}
            >
                {label}
                <span style={{ fontSize: '0.7em', opacity: 0.7 }}>▼</span>
            </button>
            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '4px',
                    backgroundColor: "hsl(var(--color-bg-panel))",
                    border: "1px solid hsl(var(--color-border))",
                    borderRadius: "var(--radius-md)",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    zIndex: 50,
                    minWidth: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '4px'
                }}>
                    <div onClick={() => setIsOpen(false)}>
                        {children}
                    </div>
                </div>
            )}
        </div>
    );
}
