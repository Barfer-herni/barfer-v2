import 'server-only';

// Export our own auth utilities
export { getCurrentUser } from '@/lib/services/services/barfer';

// Stub auth function for webhook compatibility
// TODO: Implement proper org-level auth when needed
export const auth = async () => ({ orgId: null as string | null });
