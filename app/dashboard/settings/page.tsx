export const dynamic = 'force-dynamic';

import React, { Suspense } from 'react';
import SettingsClient from './SettingsClient';

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="py-8 text-center">Loading settings...</div>}>
      <SettingsClient />
    </Suspense>
  );
}