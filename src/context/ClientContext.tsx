"use client";

import React, { createContext, useContext } from 'react';

type ClientContextType = {
  client?: any;
  logoUrl?: string | null;
};

const ClientContext = createContext<ClientContextType>({});

export const ClientProvider: React.FC<ClientContextType & { children: React.ReactNode }> = ({ client, logoUrl, children }) => {
  // Expose the client slug globally for client-side helpers that compute
  // per-client localStorage keys. This is a convenience for the browser only.
  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (client && (client.slug || client.id)) {
          (window as any).__CLIENT_SLUG__ = client.slug || (`client-${client.id}`);
        } else {
          // If no client provided, ensure we don't leak previous value
          delete (window as any).__CLIENT_SLUG__;
        }
      }
    } catch (e) {
      // ignore
    }
    return () => {
      try {
        if (typeof window !== 'undefined') delete (window as any).__CLIENT_SLUG__;
      } catch (e) {}
    };
  }, [client]);

  return <ClientContext.Provider value={{ client, logoUrl }}>{children}</ClientContext.Provider>;
};

export const useClient = () => useContext(ClientContext);

export default ClientContext;
