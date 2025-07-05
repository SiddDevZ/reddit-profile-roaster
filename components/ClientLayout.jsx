'use client';

import { useEffect } from 'react';
import '../lib/i18n';

export default function ClientLayout({ children }) {
  useEffect(() => {
    // Initialize i18n on client side
    import('../lib/i18n');
  }, []);

  return <>{children}</>;
}