import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { formatNumber } from "@/lib/utils";
import type { Course, Teacher, Assignment } from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "./ui/dialog";

interface TeacherAssignmentDialogProps {
  course: Course;
  teachers: Teacher[];
  isLoading: boolean;
}

export function TeacherAssignmentDialog({ course, teachers, isLoading }: TeacherAssignmentDialogProps) {
  const [open, setOpen] = useState(false);
  const [allocationMode, setAllocationMode] = useState<'students' | 'quantity'>('students');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [newStudents, setNewStudents] = useState<number>(0);
  const [newQuantity, setNewQuantity] = useState<number>(0);

  useEffect(() => {
    if (open) {
      setAssignments([{
        teacherId: course.teacherId ?? 'chua-phan-cong',
        teacherName: course.teacherName ?? 'Giảng viên hiện tại',
        numberStudent: course.numberStudent,
        quantity: course.quantity,
        isOriginal: true
      }]);
      setSelectedTeacherId('');
      setNewStudents(0);
      setNewQuantity(0);
      setAllocationMode('students');
    }
  }, [open, course]);

  const availableTeachers = useMemo(() => {
    const assignedIds = new Set(assignments.map((item) => item.teacherId));
    return teachers.filter((teacher) => teacher.id && !assignedIds.has(teacher.id));
  }, [teachers, assignments]);

  const initialStudents = course.numberStudent;
  const initialQuantity = course.quantity;

  const currentStudents = assignments.reduce((sum, item) => sum + item.numberStudent, 0);
  const currentQuantity = assignments.reduce((sum, item) => sum + item.quantity, 0);

  const handleAddTeacher = () => {
    if (!selectedTeacherId) {
      toast.warning('Vui lòng chọn giảng viên cần thêm.');
      return;
    }

    const teacher = teachers.find((item) => item.id === selectedTeacherId);
    if (!teacher) {
      toast.error('Không tìm thấy thông tin giảng viên.');
      return;
    }

    const baseIndex = assignments.findIndex((item) => item.isOriginal);
    if (baseIndex === -1) {
      toast.error('Không tìm thấy dữ liệu phân công gốc.');
      return;
    }

    const baseAssignment = assignments[baseIndex];

    if (allocationMode === 'students' && newStudents <= 0) {
      toast.warning('Vui lòng nhập sĩ số lớn hơn 0.');
      return;
    }

    if (allocationMode === 'quantity' && newQuantity <= 0) {
      toast.warning('Vui lòng nhập số tiết lớn hơn 0.');
      return;
    }

    const updated = [...assignments];
    const adjustedBase = { ...baseAssignment };

    if (allocationMode === 'students') {
      if (newStudents > baseAssignment.numberStudent) {
        toast.error('Sĩ số vượt quá phần hiện tại của giảng viên gốc.');
        return;
      }
      adjustedBase.numberStudent = baseAssignment.numberStudent - newStudents;
    }

    if (allocationMode === 'quantity') {
      if (newQuantity > baseAssignment.quantity) {
        toast.error('Số lượng tiết vượt quá phần hiện tại của giảng viên gốc.');
        return;
      }
      adjustedBase.quantity = baseAssignment.quantity - newQuantity;
    }

    updated[baseIndex] = adjustedBase;
    updated.push({
      teacherId: teacher.id,
      teacherName: teacher.name ?? teacher.email ?? 'Giảng viên mới',
      numberStudent: allocationMode === 'students' ? newStudents : 0,
      quantity: allocationMode === 'quantity' ? newQuantity : 0,
      isOriginal: false
    });

    setAssignments(updated);
    setSelectedTeacherId('');
    setNewStudents(0);
    setNewQuantity(0);
  };

  const handleSubmit = () => {
    toast.info('Yêu cầu điều chỉnh sẽ được gửi khi tính năng hoàn thiện.');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={isLoading}>
          {isLoading ? 'Đang tải...' : 'Yêu cầu điều chỉnh'}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Điều chỉnh phân công giảng viên</DialogTitle>
          <DialogDescription>
            Phân bổ lại sĩ số hoặc số tiết cho học phần: {course.courseName || course.subjectName || 'Không xác định'}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="allocation-mode"
                value="students"
                checked={allocationMode === 'students'}
                onChange={() => setAllocationMode('students')}
                className="h-4 w-4 accent-emerald-600"
              />
              Điều chỉnh theo sĩ số
            </label>
            <label className="flex items-center gap-2 text-sm font-medium">
              <input
                type="radio"
                name="allocation-mode"
                value="quantity"
                checked={allocationMode === 'quantity'}
                onChange={() => setAllocationMode('quantity')}
                className="h-4 w-4 accent-emerald-600"
              />
              Điều chỉnh theo số tiết quy đổi
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-100 text-slate-700">
                <tr>
                  <th className="px-3 py-2 text-left font-semibold">Giảng viên</th>
                  <th className="px-3 py-2 text-right font-semibold">Sĩ số</th>
                  <th className="px-3 py-2 text-right font-semibold">Số tiết</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
                  <tr key={item.teacherId} className="border-t border-slate-200">
                    <td className="px-3 py-2">
                      {item.teacherName}
                      {item.isOriginal && (
                        <span className="ml-2 inline-flex items-center rounded bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          Gốc
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">{formatNumber(item.numberStudent)}</td>
                    <td className="px-3 py-2 text-right">{formatNumber(item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-slate-50">
                <tr>
                  <td className="px-3 py-2 font-semibold">Tổng hiện tại</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatNumber(currentStudents)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{formatNumber(currentQuantity)}</td>
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
              <Select value={selectedTeacherId} onValueChange={setSelectedTeacherId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn giảng viên" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {availableTeachers.length === 0 && <SelectItem value="" disabled>Đã phân bổ đủ giảng viên</SelectItem>}
                  {availableTeachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name ?? teacher.email ?? teacher.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700">
                {allocationMode === 'students' ? 'Sĩ số cho giảng viên mới' : 'Số tiết quy đổi cho giảng viên mới'}
              </span>
              <Input
                type="number"
                min={0}
                value={allocationMode === 'students' ? newStudents : newQuantity}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  if (allocationMode === 'students')
                    setNewStudents(value);
                  else
                    setNewQuantity(value);
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Lưu ý: Giá trị bạn chọn sẽ tự động trừ vào phần của giảng viên gốc theo tiêu chí đã chọn.
            </p>
            <Button variant="secondary" size="sm" onClick={handleAddTeacher} disabled={availableTeachers.length === 0}>
              Thêm giảng viên
            </Button>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <DialogClose asChild>
            <Button variant="outline">Hủy</Button>
          </DialogClose>
          <Button onClick={handleSubmit}>Gửi yêu cầu</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
