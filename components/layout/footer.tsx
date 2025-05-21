'use client';

import { Badge } from "@/components/ui/badge";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-gray-700 py-3 px-6 bg-gray-900/80 text-gray-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3 text-xs">
          <span>Version 1.0.0</span>
          <span className="text-gray-600 mx-1">•</span>
          <span>&copy; {currentYear} Smart Dustbin System</span>
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">Real-time</Badge>
          <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">IoT Enabled</Badge>
          <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">Smart Analytics</Badge>
          <Badge variant="secondary" className="text-xs bg-green-900/30 text-green-400">Eco-friendly</Badge>
        </div>
      </div>
    </footer>
  );
}