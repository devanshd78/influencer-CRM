// File: app/admin/layout.tsx
import { ReactNode } from "react";
import AdminSidebar from "../components/AdminSideBar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-white">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="pt-12 ml-0 md:ml-64 lg:ml-72 flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
