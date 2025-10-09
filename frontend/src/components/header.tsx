import type { User } from "@/lib/types";
import { Button } from "./ui/button";

interface HeaderProps {
  user: User | null;
  roleLabel: "" | "Quản trị viên" | "Trưởng khoa" | "Giảng viên";
  handleLogout: () => void;
}

export function Header({ user, roleLabel, handleLogout }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 shadow-xs">
      <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
            <img
              src="/tlu-logo.png"
              alt="Logo Đại học Thủy lợi"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Hệ thống quản lý đào tạo</h2>
            {roleLabel && (
              <p className="text-sm text-slate-500">Vai trò: {roleLabel}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-slate-500">{user?.email}</p>
          </div>
          <Button onClick={handleLogout} size="sm">
            Đăng xuất
          </Button>
        </div>
      </div>
    </header>
  )
}
