import { keys } from '../keys';

export const Toolbar = () => {
  if (!keys().FLAGS_SECRET) return null;
  // @vercel/toolbar is only available in Vercel deployments
  return null;
};
