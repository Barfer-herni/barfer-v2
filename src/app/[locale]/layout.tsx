import '@/styles/globals.css';
import { DesignSystemProvider } from '@/lib/utils/index';
import { fonts } from '@/lib/utils/fonts';
import { Toolbar } from '@/lib/feature-flags/components/toolbar';
import type { ReactNode } from 'react';

type RootLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{
    locale: string;
  }>;
};

const RootLayout = async ({ children, params }: RootLayoutProperties) => {
  const { locale } = await params;

  return (
    <html lang={locale} className={fonts} suppressHydrationWarning>
      <body>
        <DesignSystemProvider>{children}</DesignSystemProvider>
        <Toolbar />
      </body>
    </html>
  );
};

export default RootLayout;
