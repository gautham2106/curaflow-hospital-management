
'use client';
import { useState, useEffect, createContext } from 'react';

export const IsClientCtx = createContext(false);

export function IsClientCtxProvider({ children }: { children: React.ReactNode }) {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    return (
        <IsClientCtx.Provider value={isClient}>
            {children}
        </IsClientCtx.Provider>
    )
}
