import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useEffect, useMemo, useState } from 'react';
import type { Role } from '@/lib/types';
import { fetchCourses, fetchTeachers } from '@/lib/api';
import { useUser, useAuthActions, useAuthToken } from '@/stores/auth-store';
import { logoutUser } from '@/lib/auth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { formatNumber } from '@/lib/utils';
import { TeacherAssignmentDialog } from '@/components/assign-dialog';

const roleLabels: Record<Role, string> = {
  admin: 'Quản trị viên',
  head: 'Trưởng khoa',
  teacher: 'Giảng viên'
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const token = useAuthToken();
  const { logout } = useAuthActions();

  const coursesQuery = useQuery({
    queryKey: ['dashboard-courses', token],
    queryFn: () => fetchCourses(token!),
    enabled: Boolean(token),
    retry: 1
  });

  const teachersQuery = useQuery({
    queryKey: ['teacher-options', token],
    queryFn: () => fetchTeachers(token!),
    enabled: Boolean(token) && user?.role === 'head',
    retry: 1
  });

  const handleLogout = () => {
    logoutUser({ logout });
    navigate('/login');
  };

  const roleLabel = user ? roleLabels[user.role] : '';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-neutral-100 border-b border-slate-200 shadow-xs">
        <div className="container mx-auto px-4 py-1.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center overflow-hidden shadow-md">
              <img
                src="/tlu-logo.png"
                alt="Logo Đại học Thủy lợi"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Hệ thống quản lý đào tạo</h2>
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
            <Button onClick={handleLogout} variant="default" size="sm">
              Đăng xuất
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <section className="bg-white border border-emerald-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-100">
                  <TableHead className="font-semibold text-emerald-900">Học kỳ</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Giai đoạn</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Tên lớp</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Kỹ năng</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Sĩ số</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Số nhóm</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">ĐVT</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Số lượng</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Hệ số</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">CTTT</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Xa trường</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Ngoài giờ</TableHead>
                  <TableHead className="font-semibold text-emerald-900 text-right">Số tiết quy đổi</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Ghi chú</TableHead>
                  <TableHead className="font-semibold text-emerald-900">Giảng viên</TableHead>
                  {user?.role === 'head' && <TableHead className="font-semibold text-emerald-900 text-center">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {coursesQuery.isLoading && (
                  <TableRow>
                    <TableCell colSpan={user?.role === 'head' ? 16 : 15} className="py-10 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                )}

                {coursesQuery.isError && (
                  <TableRow>
                    <TableCell colSpan={user?.role === 'head' ? 16 : 15} className="py-10 text-center text-red-600">
                      Không thể tải dữ liệu. Vui lòng thử lại sau.
                    </TableCell>
                  </TableRow>
                )}

                {!coursesQuery.isLoading && !coursesQuery.isError && coursesQuery.data && coursesQuery.data.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={user?.role === 'head' ? 16 : 15} className="py-10 text-center text-slate-500">
                      Chưa có dữ liệu cho kỳ này.
                    </TableCell>
                  </TableRow>
                )}

                {coursesQuery.data?.map((course, index) => (
                  <TableRow key={`${course.courseYear}-${course.courseName}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-emerald-50/40'}>
                    <TableCell className="">{course.semesterName || '—'}</TableCell>
                    <TableCell className="">{course.registerPeriod || '—'}</TableCell>
                    <TableCell className="">{course.courseName || course.subjectName || '—'}</TableCell>
                    <TableCell className="">{course.skillName || '—'}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.numberStudent)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.numberGroup)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.unit)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.quantity)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.coef)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.coefCttt)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.coefFar)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.numOutHours)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.standardHours)}</TableCell>
                    <TableCell className="">{course.note || '—'}</TableCell>
                    <TableCell className="">{course.teacherName || 'Chưa phân công'}</TableCell>
                    {user?.role === 'head' && (
                      <TableCell className="text-center">
                        <TeacherAssignmentDialog
                          course={course}
                          teachers={teachersQuery.data ?? []}
                          isLoading={teachersQuery.isLoading}
                        />
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      </main>
    </div>
  );
}
