import { toast } from "sonner";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { formatNumber } from "@/lib/utils";
import type { Course, Teacher, CourseRequestRecord, AssignmentRequest } from "@/lib/types";
import { fetchCourseRequests, submitCourseRequests } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";

interface TeacherAssignmentDialogProps {
  course: Course;
  teachers: Teacher[];
  isLoading: boolean;
  token: string;
}

interface CourseRequestsViewerProps {
  course: Course;
  token: string;
}

export function CourseRequestsViewer({ course, token }: CourseRequestsViewerProps) {
  const [open, setOpen] = useState(false);

  const {
    data: requestsData,
    isPending: isRequestsPending,
    isFetching: isRequestsFetching,
    refetch: refetchRequests,
  } = useQuery<CourseRequestRecord[]>({
    queryKey: ["course-requests", course.courseId, token],
    queryFn: () => fetchCourseRequests(token, course.courseId),
    staleTime: 90 * 1000,
    retry: 1,
  });

  const requests = requestsData ?? [];
  const requestCount = requests.length;
  const isLoading = isRequestsPending || isRequestsFetching;

  useEffect(() => {
    if (open)
      refetchRequests();
  }, [open, refetchRequests]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={isLoading || requestCount === 0}
        className={requestCount === 0 ? "text-emerald-500 border-emerald-500" : undefined}
      >
        {isLoading
          ? "Đang tải..."
          : requestCount === 0
            ? "Chưa có yêu cầu"
            : `Xem ${requestCount} yêu cầu`}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yêu cầu đã gửi</DialogTitle>
            <DialogDescription>
              Danh sách yêu cầu điều chỉnh đã gửi cho học phần này.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : requestCount === 0 ? (
            <p className="text-sm text-slate-500">Chưa có yêu cầu nào.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Giảng viên</th>
                    <th className="px-3 py-2 text-right font-semibold">Sĩ số</th>
                    <th className="px-3 py-2 text-right font-semibold">Số tiết</th>
                    <th className="px-3 py-2 text-right font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.requestId} className="border-t border-slate-200">
                      <td className="px-3 py-2">{request.teacherName ?? request.teacherId}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(request.numberStudent)}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(request.quantity)}</td>
                      <td className="px-3 py-2 text-right text-xs text-slate-500">{new Date(request.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

type AllocationMode = "students" | "quantity";

type ExtraAssignment = {
  teacherId: string;
  teacherName: string;
  students: number;
  quantity: number;
};

type AssignmentRow = ExtraAssignment & { isOriginal: boolean };

export function TeacherAssignmentDialog({ course, teachers, isLoading, token }: TeacherAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [allocationMode, setAllocationMode] = useState<AllocationMode>("students");
  const [extras, setExtras] = useState<ExtraAssignment[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [newStudents, setNewStudents] = useState(0);
  const [newQuantity, setNewQuantity] = useState(0);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [requestsDialogOpen, setRequestsDialogOpen] = useState(false);

  const initialStudents = course.numberStudent;
  const initialQuantity = course.quantity;

  const queryClient = useQueryClient();

  const {
    data: requestsData,
    isPending: isRequestsPending,
    isFetching: isRequestsFetching,
    refetch: refetchRequests,
  } = useQuery<CourseRequestRecord[]>({
    queryKey: ["course-requests", course.courseId, token],
    queryFn: () => fetchCourseRequests(token, course.courseId),
    enabled: open,
  });

  const requests = requestsData ?? [];
  const requestCount = requests.length;

  useEffect(() => {
    if (requestsDialogOpen)
      refetchRequests();
  }, [requestsDialogOpen, refetchRequests]);

  const submitMutation = useMutation({
    mutationFn: (payload: AssignmentRequest[]) => submitCourseRequests(token, course.courseId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["course-requests", course.courseId, token] });
      toast.success("Đã gửi yêu cầu điều chỉnh.");
      setOpen(false);
    },
    onError: (error: Error) => {
      if (error.message === "1") {
        toast.error("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
      }
      else {
        toast.error(error.message || "Không thể gửi yêu cầu");
      }
    },
  });

  useEffect(() => {
    if (!open)
      return;

    resetDialogState("students");
  }, [open, course]);

  const resetDialogState = (mode: AllocationMode) => {
    setExtras([]);
    setSelectedTeacherId("");
    setNewStudents(0);
    setNewQuantity(0);
    setEditingIndex(null);
    setAllocationMode(mode);
  };

  const editingEntry = editingIndex !== null ? extras[editingIndex] : null;
  const editingStudents = editingEntry?.students ?? 0;
  const editingQuantity = editingEntry?.quantity ?? 0;

  const studentsAllocated = extras.reduce((sum, item) => sum + item.students, 0) - editingStudents;
  const quantityAllocated = extras.reduce((sum, item) => sum + item.quantity, 0) - editingQuantity;

  const remainingStudents = Math.max(initialStudents - studentsAllocated, 0);
  const remainingQuantity = Math.max(initialQuantity - quantityAllocated, 0);

  const extrasTotalStudents = extras.reduce((sum, item) => sum + item.students, 0);
  const extrasTotalQuantity = extras.reduce((sum, item) => sum + item.quantity, 0);

  const baseNumberStudent = allocationMode === "students"
    ? Math.max(initialStudents - extrasTotalStudents, 0)
    : initialStudents;
  const baseQuantity = allocationMode === "quantity"
    ? Math.max(initialQuantity - extrasTotalQuantity, 0)
    : initialQuantity;

  const baseTeacherName = course.teacherName
    ?? teachers.find((teacher) => teacher.id === course.teacherId)?.name
    ?? course.teacherId
    ?? "Giảng viên hiện tại";

  const currentTab = allocationMode === "students"
    ? {
        label: "Đang phân bổ theo sĩ số",
        helper: `Đã phân bổ ${formatNumber(extrasTotalStudents)} / ${formatNumber(initialStudents)} sinh viên. Còn lại ${formatNumber(baseNumberStudent)} sinh viên.`,
      }
    : {
        label: "Đang phân bổ theo số tiết quy đổi",
        helper: `Đã phân bổ ${formatNumber(extrasTotalQuantity)} / ${formatNumber(initialQuantity)} tiết. Còn lại ${formatNumber(baseQuantity)} tiết.`,
      };

  const editingTeacherId = editingEntry?.teacherId ?? null;

  const availableTeachers = useMemo(() => {
    const taken = new Set<string>();
    if (course.teacherId)
      taken.add(course.teacherId);

    extras.forEach((entry, idx) => {
      if (idx !== editingIndex)
        taken.add(entry.teacherId);
    });

    return teachers.filter((teacher) => {
      if (!teacher.id)
        return false;
      if (editingTeacherId && teacher.id === editingTeacherId)
        return true;

      return !taken.has(teacher.id);
    });
  }, [course.teacherId, editingIndex, editingTeacherId, extras, teachers]);

  const resetDraftValues = () => {
    setSelectedTeacherId("");
    setNewStudents(0);
    setNewQuantity(0);
    setEditingIndex(null);
  };

  const handleAddOrUpdate = () => {
    if (!selectedTeacherId) {
      toast.warning("Vui lòng chọn giảng viên cần thêm.");
      return;
    }

    const teacher = teachers.find((item) => item.id === selectedTeacherId);
    if (!teacher) {
      toast.error("Không tìm thấy thông tin giảng viên.");
      return;
    }

    const teacherName = teacher.name ?? teacher.email ?? teacher.id;

    if (allocationMode === "students") {
      if (remainingStudents <= 0) {
        toast.error("Sĩ số đã được phân bổ hết.");
        return;
      }
      if (newStudents <= 0) {
        toast.warning("Vui lòng nhập sĩ số lớn hơn 0.");
        return;
      }
      if (newStudents > remainingStudents) {
        toast.error("Tổng sĩ số sau phân bổ vượt quá số sinh viên ban đầu.");
        return;
      }

      const entry: ExtraAssignment = {
        teacherId: selectedTeacherId,
        teacherName,
        students: newStudents,
        quantity: initialQuantity,
      };

      setExtras((prev) => editingIndex !== null ? prev.map((item, idx) => (idx === editingIndex ? entry : item)) : [...prev, entry]);
    }
    else {
      if (remainingQuantity <= 0) {
        toast.error("Số tiết đã được phân bổ hết.");
        return;
      }
      if (newQuantity <= 0) {
        toast.warning("Vui lòng nhập số tiết lớn hơn 0.");
        return;
      }
      if (newQuantity > remainingQuantity) {
        toast.error("Tổng số tiết sau phân bổ vượt quá số tiết ban đầu.");
        return;
      }

      const entry: ExtraAssignment = {
        teacherId: selectedTeacherId,
        teacherName,
        students: initialStudents,
        quantity: newQuantity,
      };

      setExtras((prev) => editingIndex !== null ? prev.map((item, idx) => (idx === editingIndex ? entry : item)) : [...prev, entry]);
    }

    resetDraftValues();
  };

  const handleEdit = (index: number) => {
    const entry = extras[index];
    if (!entry)
      return;

    setEditingIndex(index);
    setSelectedTeacherId(entry.teacherId);
    setNewStudents(entry.students);
    setNewQuantity(entry.quantity);
  };

  const handleRemove = (index: number) => {
    setExtras((prev) => prev.filter((_, idx) => idx !== index));
    resetDraftValues();
  };

  const handleSubmit = () => {
    if (extras.length === 0) {
      toast.warning("Vui lòng thêm ít nhất một giảng viên trước khi gửi yêu cầu.");
      return;
    }

    const payload: AssignmentRequest[] = extras.map((entry) => ({
      teacherId: entry.teacherId,
      numberStudent: entry.students,
      quantity: entry.quantity,
    }));

    submitMutation.mutate(payload);
  };

  const baseRow: AssignmentRow = {
    teacherId: course.teacherId ?? "unassigned",
    teacherName: baseTeacherName,
    students: baseNumberStudent,
    quantity: baseQuantity,
    isOriginal: true,
  };

  const rows: AssignmentRow[] = [
    baseRow,
    ...extras.map((entry) => ({ ...entry, isOriginal: false })),
  ];

  const totalStudents = rows.reduce((sum, item) => sum + item.students, 0);
  const totalQuantity = rows.reduce((sum, item) => sum + item.quantity, 0);

  const isDraftInvalid = allocationMode === "students"
    ? newStudents <= 0 || newStudents > remainingStudents
    : newQuantity <= 0 || newQuantity > remainingQuantity;

  const isAddDisabled = (availableTeachers.length === 0 && editingIndex === null)
    || !selectedTeacherId
    || isDraftInvalid;

  return (
    <>
      <Dialog open={open} onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          resetDialogState("students");
        }
      }}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading}>
            {isLoading ? "Đang tải..." : "Yêu cầu điều chỉnh"}
          </Button>
        </DialogTrigger>
        <DialogContent className="md:max-w-3xl md:max-h-[90vh] md:overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Điều chỉnh phân công giảng viên</DialogTitle>
            <DialogDescription>
              Phân bổ lại sĩ số hoặc số tiết cho học phần: {course.courseName || course.subjectName || "Không xác định"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <Tabs
              value={allocationMode}
              onValueChange={(value) => {
                const mode = value as AllocationMode;
                resetDialogState(mode);
              }}
            >
              <TabsList>
                <TabsTrigger value="students">Theo sĩ số</TabsTrigger>
                <TabsTrigger value="quantity">Theo số tiết quy đổi</TabsTrigger>
              </TabsList>
              <TabsContent value="students">
                <p className="text-xs font-semibold text-slate-600">{currentTab.label}</p>
                <p className="text-xs text-slate-500">{currentTab.helper}</p>
              </TabsContent>
              <TabsContent value="quantity">
                <p className="text-xs font-semibold text-slate-600">{currentTab.label}</p>
                <p className="text-xs text-slate-500">{currentTab.helper}</p>
              </TabsContent>
            </Tabs>

            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Giảng viên</th>
                    <th className="px-3 py-2 text-right font-semibold">Sĩ số</th>
                    <th className="px-3 py-2 text-right font-semibold">Số tiết</th>
                    <th className="px-3 py-2 text-right font-semibold">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      {baseRow.teacherName}
                      <span className="ml-2 inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Gốc
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">{formatNumber(baseRow.students)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(baseRow.quantity)}</td>
                    <td className="px-3 py-2 text-right text-slate-300">—</td>
                  </tr>
                  {extras.map((item, index) => (
                    <tr key={`${item.teacherId}-${index}`} className="border-t border-slate-200">
                      <td className="px-3 py-2">{item.teacherName}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(item.students)}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(item.quantity)}</td>
                      <td className="px-3 py-2 text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handleEdit(index)}>
                          Sửa
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleRemove(index)}>
                          Xóa
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="px-3 py-2 font-semibold">Tổng hiện tại</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatNumber(totalStudents)}</td>
                    <td className="px-3 py-2 text-right font-semibold">{formatNumber(totalQuantity)}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-slate-500">Giá trị ban đầu</td>
                    <td className="px-3 py-2 text-right text-slate-500">{formatNumber(initialStudents)}</td>
                    <td className="px-3 py-2 text-right text-slate-500">{formatNumber(initialQuantity)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">Chọn giảng viên bổ sung</span>
                {availableTeachers.length > 0 ? (
                  <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Chọn giảng viên" />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {availableTeachers.map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.name ?? teacher.email ?? teacher.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-xs text-slate-500">Đã phân bổ đủ giảng viên</p>
                )}
              </div>

              <div className="space-y-2">
                <span className="text-sm font-medium text-slate-700">
                  {allocationMode === "students" ? "Sĩ số cho giảng viên mới" : "Số tiết quy đổi cho giảng viên mới"}
                </span>
                <Input
                  type="number"
                  min={0}
                  max={allocationMode === "students" ? remainingStudents : remainingQuantity}
                  value={allocationMode === "students" ? newStudents : newQuantity}
                  onChange={(event) => {
                    const value = Number(event.target.value);
                    if (allocationMode === "students") {
                      setNewStudents(value);
                    } else {
                      setNewQuantity(value);
                    }
                  }}
                  placeholder={allocationMode === "students"
                    ? `Còn lại ${formatNumber(remainingStudents)} sinh viên`
                    : `Còn lại ${formatNumber(remainingQuantity)} tiết`}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500">
                Lưu ý: Giá trị bạn chọn sẽ tự động trừ vào phần của giảng viên gốc theo tiêu chí đã chọn.
              </p>
              <div className="flex items-center gap-2">
                {editingIndex !== null && (
                  <Button variant="outline" size="sm" onClick={resetDraftValues}>
                    Hủy chỉnh sửa
                  </Button>
                )}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleAddOrUpdate}
                  disabled={isAddDisabled}
                >
                  {editingIndex !== null ? "Cập nhật" : "Thêm giảng viên"}
                </Button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRequestsDialogOpen(true)}
              disabled={isRequestsPending || isRequestsFetching}
              className={(requestCount === 0) ? "text-emerald-500 hover:text-emerald-600 border-emerald-500" : undefined}
            >
              {(isRequestsPending || isRequestsFetching)
                ? "Đang tải yêu cầu..."
                : requestCount === 0
                  ? "Chưa có yêu cầu"
                  : `Xem ${requestCount} yêu cầu`}
            </Button>

            <div className="flex items-center gap-2">
              <DialogClose asChild>
                <Button variant="outline" onClick={() => resetDialogState(allocationMode)}>
                  Hủy
                </Button>
              </DialogClose>
              <Button onClick={handleSubmit} disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={requestsDialogOpen} onOpenChange={setRequestsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yêu cầu đã gửi</DialogTitle>
            <DialogDescription>
              Danh sách yêu cầu điều chỉnh đã gửi cho học phần này.
            </DialogDescription>
          </DialogHeader>

          {(isRequestsPending || isRequestsFetching) ? (
            <p className="text-sm text-slate-500">Đang tải...</p>
          ) : requestCount === 0 ? (
            <p className="text-sm text-slate-500">Chưa có yêu cầu nào.</p>
          ) : (
            <div className="max-h-72 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-slate-700">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold">Giảng viên</th>
                    <th className="px-3 py-2 text-right font-semibold">Sĩ số</th>
                    <th className="px-3 py-2 text-right font-semibold">Số tiết</th>
                    <th className="px-3 py-2 text-right font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.requestId} className="border-t border-slate-200">
                      <td className="px-3 py-2">{request.teacherName ?? request.teacherId}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(request.numberStudent)}</td>
                      <td className="px-3 py-2 text-right">{formatNumber(request.quantity)}</td>
                      <td className="px-3 py-2 text-right text-xs text-slate-500">{new Date(request.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setRequestsDialogOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
