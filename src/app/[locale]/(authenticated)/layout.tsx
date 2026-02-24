import { env } from '@/config/env';
import { getCurrentUser } from '@/lib/auth/server';
import { SidebarProvider } from '@/components/ui/sidebar';
import { showBetaFeature } from '@/lib/feature-flags';
import { NotificationsProvider } from '@/providers/notifications/components/provider';
import { AuthProvider } from '@/lib/auth/provider';
import { secure } from '@/lib/security';
import type { ReactNode } from 'react';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AppLayout = async ({ children }: AppLayoutProperties) => {
  if (env.ARCJET_KEY) {
    await secure(['CATEGORY:PREVIEW']);
  }

  const betaFeature = await showBetaFeature();
  // Obtener usuario actual usando nuestra implementación local
  // const user = await getCurrentUser();

  return (
    // <NotificationsProvider userId={user.id}>
    //   <AuthProvider>
    <SidebarProvider>
      {children}
    </SidebarProvider>
    //   </AuthProvider>
    // </NotificationsProvider>
  );
};

export default AppLayout;
