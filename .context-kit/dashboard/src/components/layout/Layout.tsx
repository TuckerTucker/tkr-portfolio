import { ReactNode } from 'react';
import { ViewType, ServiceHealth } from '../../types/common';
import { Header } from './Header';

export interface LayoutProps {
  children: ReactNode;
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  serviceHealth: ServiceHealth[];
}

export function Layout({ children, currentView, onViewChange, serviceHealth }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentView={currentView}
        onViewChange={onViewChange}
        serviceHealth={serviceHealth}
      />
      <main className="container mx-auto px-6 py-6">
        {children}
      </main>
    </div>
  );
}