'use client';

import React from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SubjectDTO } from '@/lib/api/resource';

interface SubjectsTableProps {
  subjects: SubjectDTO[];
  loading: boolean;
  searchQuery: string;
  onEdit: (subject: SubjectDTO) => void;
  onDelete: (subject: SubjectDTO) => void;
}

export function SubjectsTable({
  subjects,
  loading,
  searchQuery,
  onEdit,
  onDelete
}: SubjectsTableProps) {
  // Filter subjects based on search query
  const filteredSubjects = subjects.filter(subject =>
    subject.subjectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách môn học</CardTitle>
        <CardDescription>
          Tổng số môn học: {filteredSubjects.length}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredSubjects.length > 0 ? (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">STT</TableHead>
                  <TableHead>Tên môn học</TableHead>
                  <TableHead className="w-[150px]">Ngày tạo</TableHead>
                  <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubjects.map((subject, index) => (
                  <TableRow key={subject.subjectId}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{subject.subjectName}</TableCell>
                    <TableCell>
                      {new Date(subject.createdAt).toLocaleDateString('vi-VN')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => onEdit(subject)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => onDelete(subject)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery ? 'Không tìm thấy môn học phù hợp' : 'Chưa có môn học nào'}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 