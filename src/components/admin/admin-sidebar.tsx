"use client";

import { Users, Building2, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-64 bg-gray-100 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6">
          {/* System Info */}
          <div className="flex items-center gap-3 mb-8">
            <Building2 className="h-6 w-6 text-gray-600" />
            <div>
              <h2 className="text-sm font-medium text-gray-900">
                Hệ Thống Quản Lý
              </h2>
              <p className="text-xs text-gray-500">LENSOR Admin</p>
            </div>
          </div>

          {/* Management Categories */}
          <div className="mb-8">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              DANH MỤC QUẢN LÝ
            </h3>

            <div className="space-y-2">
              {/* User Management - Active */}
              <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-md">
                <div className="flex items-center gap-3 px-4 py-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    Quản Lý Người Dùng
                  </span>
                </div>
                <div className="ml-8 space-y-1 pb-3">
                  <div className="text-xs text-blue-700 px-4 py-1 hover:bg-blue-100 rounded cursor-pointer">
                    Danh sách người dùng
                  </div>
                  <div className="text-xs text-blue-700 px-4 py-1 hover:bg-blue-100 rounded cursor-pointer">
                    Thêm người dùng mới
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Login */}
          <div>
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
              ĐĂNG NHẬP HỆ THỐNG
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-3 px-4 py-2 hover:bg-gray-200 rounded cursor-pointer">
                <LogIn className="h-4 w-4 text-gray-600" />
                <span className="text-sm text-gray-700">Tài Khoản</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
