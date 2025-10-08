import { useNavigate } from 'react-router';
import { Button } from '@/components/ui/button';
import { logoutUser } from '@/lib/auth';
import { useUser, useAuthActions } from '@/stores/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const { logout } = useAuthActions();

  const handleLogout = () => {
    logoutUser({ logout });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
              <img 
                src="/tlu-logo.png" 
                alt="Logo Đại học Thủy lợi" 
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Tài liệu Đại học Thủy lợi
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Hệ thống quản lý tài liệu</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
            </div>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Xin chào, {user?.name}!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý tài liệu và cộng tác với nhóm của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Tài liệu của tôi</CardTitle>
              <CardDescription>Truy cập tài liệu cá nhân</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Chưa có tài liệu. Hãy bắt đầu bằng cách tạo tài liệu đầu tiên của bạn.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tài liệu được chia sẻ</CardTitle>
              <CardDescription>Tài liệu được chia sẻ với bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Hiện chưa có tài liệu được chia sẻ.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>Các hoạt động mới nhất của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Không có hoạt động gần đây để hiển thị.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
