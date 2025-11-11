'use client';

import { useAppContext } from '@/context/AppContext';

export default function LayoutWrapper({ children }) {
  const { layoutStyle } = useAppContext();

  const layoutClasses =
    layoutStyle === 'compact'
      ? 'max-w-3xl px-4 py-2'
      : layoutStyle === 'spacious'
      ? 'max-w-screen-xl px-8 py-6'
      : 'px-6 py-4';

  return (
    <div className={`transition-all duration-500 ease-in-out mx-auto ${layoutClasses}`}>
      {children}
    </div>
  );
}
