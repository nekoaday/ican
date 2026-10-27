import { HomePage } from './pages/HomePage';
import type { ReactNode } from 'react';

export interface RouteConfig {
  name: string;
  path: string;
  element: ReactNode;
  visible?: boolean;
  public?: boolean;
}

export const routes: RouteConfig[] = [
  {
    name: '保额罗盘',
    path: '/',
    element: <HomePage />,
    public: true,
  },
];
