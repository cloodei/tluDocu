import { useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { logoutUser } from '@/lib/auth';
import { formatNumber } from '@/lib/utils';
import { TeacherAssignmentDialog, CourseRequestsViewer } from '@/components/assign-dialog';
import { fetchCourses, fetchTeachers } from '@/lib/api';
import { useUser, useAuthActions, useAuthToken } from '@/stores/auth-store';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Header } from '@/components/header';

const roleLabels = {
  admin: 'Quản trị viên',
  head: 'Trưởng khoa',
  teacher: 'Giảng viên'
} as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useUser();
  const token = useAuthToken();
  const { logout } = useAuthActions();
  const canSubmitRequests = user?.role === 'head';
  const canViewRequests = user?.role === 'head' || user?.role === 'admin';
  const hasToken = Boolean(token);
  const showActionsColumn = canViewRequests && hasToken;

  const containerRef = useRef<HTMLTableSectionElement | null>(null);
  let isDown = false;
  let startX: number;
  let scrollLeft: number;

  const handleMouseDown = (e: React.MouseEvent<HTMLTableSectionElement>) => {
    isDown = true;
    startX = e.pageX - (containerRef.current?.offsetLeft || 0);
    scrollLeft = containerRef.current?.scrollLeft || 0;
  };

  const handleMouseLeave = () => { isDown = false; };
  const handleMouseUp = () => { isDown = false; };

  const handleMouseMove = (e: React.MouseEvent<HTMLTableSectionElement>) => {
    if (!containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = x - startX;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const coursesQuery = useQuery({
    queryKey: ['dashboard-courses', token],
    queryFn: () => fetchCourses(token!),
    enabled: Boolean(token),
    retry: 1
  });

  const teachersQuery = useQuery({
    queryKey: ['teacher-options', token],
    queryFn: () => fetchTeachers(token!),
    enabled: hasToken && canSubmitRequests,
    retry: 1
  });

  const handleLogout = () => {
    logoutUser(logout);
    navigate('/login');
  };

  if (coursesQuery.isError && coursesQuery.error.message === "1")
    handleLogout();

  const roleLabel = user ? roleLabels[user.role] : "";

  return (
    <div className="min-h-screen">
      <Header user={user} roleLabel={roleLabel} handleLogout={handleLogout} />

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
                  {showActionsColumn && <TableHead className="font-semibold text-emerald-900 text-center">Thao tác</TableHead>}
                </TableRow>
              </TableHeader>

              <TableBody
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
              >
                {coursesQuery.isPending ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 16 : 15} className="py-10 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : coursesQuery.isError ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 16 : 15} className="py-10 text-center text-red-600">
                      {coursesQuery.error.message}
                    </TableCell>
                  </TableRow>
                ) : coursesQuery.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={showActionsColumn ? 16 : 15} className="py-10 text-center text-slate-500">
                      Chưa có dữ liệu cho kỳ này.
                    </TableCell>
                  </TableRow>
                ) : coursesQuery.data.map((course, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-emerald-100/40'}>
                    <TableCell className="">{course.semesterName || '—'}</TableCell>
                    <TableCell className="">{course.registerPeriod || '—'}</TableCell>
                    <TableCell className="">{course.courseName || course.subjectName || '—'}</TableCell>
                    <TableCell className="">{course.skillName || '—'}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.numberStudent)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.numberGroup)}</TableCell>
                    <TableCell className="text-right">Tiết</TableCell>
                    <TableCell className="text-right">{formatNumber(course.quantity)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.coef)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.coefCttt)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.coefFar)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.numOutHours)}</TableCell>
                    <TableCell className="text-right">{formatNumber(course.standardHours)}</TableCell>
                    <TableCell className="">{course.note || '—'}</TableCell>
                    <TableCell className="">{course.teacherName || 'Chưa phân công'}</TableCell>
                    {showActionsColumn && token && (
                      <TableCell className="text-center">
                        {canSubmitRequests ? (
                          <TeacherAssignmentDialog
                            course={course}
                            teachers={teachersQuery.data ?? []}
                            isLoading={teachersQuery.isLoading}
                            token={token}
                          />
                        ) : user?.role === 'admin' ? (
                          <CourseRequestsViewer course={course} token={token} />
                        ) : null}
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
