/**
 * Navigation - Legacy Component (Redirect to MainNavigation)
 * 
 * DEPRECATED: Use MainNavigation instead.
 * This component now renders MainNavigation for consistency.
 * 
 * Keeping the old interface for backwards compatibility with legacy views:
 * - LongTermSimulator
 * - SimulationView
 * - WheelStrategyView
 * - Dashboard
 * - SettingsView
 * etc.
 */

import { MainNavigation } from './navigation/MainNavigation';
import type { View } from '../types/navigation';

interface NavigationProps {
  currentView: View;
  onNavigate: (view: View) => void;
  onMascotToggle?: () => void;  // Legacy prop, ignored
  mascotVisible?: boolean;       // Legacy prop, ignored
}

export function Navigation({ currentView, onNavigate }: NavigationProps) {
  // Just render the new MainNavigation component
  // This ensures all legacy views have the new consistent navigation
  return <MainNavigation currentView={currentView} onNavigate={onNavigate} />;
}

export default Navigation;
