"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AdminHeaderProps {
  onMenuToggle: () => void;
}

export function AdminHeader({ onMenuToggle }: AdminHeaderProps) {
  return (
    <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-6 shadow-lg">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onMenuToggle}
          className="text-white hover:bg-gray-700 p-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Hệ Thống Quản Lý</h1>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <div className="text-sm font-medium">LENSOR</div>
          <div className="text-xs text-gray-300">ADMIN PANEL</div>
        </div>
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center">
          <span className="text-white font-bold text-sm">L</span>
        </div>
      </div>
    </header>
  );
}
