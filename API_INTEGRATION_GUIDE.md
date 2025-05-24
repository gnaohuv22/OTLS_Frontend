# Hướng dẫn tích hợp API cho dự án OTLS

## Quy trình tích hợp API

Khi tích hợp một API mới hoặc cập nhật API hiện có, hãy tuân theo quy trình sau:

### 1. Xác định cấu trúc dữ liệu

Trước khi tích hợp API, cần hiểu rõ cấu trúc dữ liệu mà API trả về và nhận vào:

- **Request Body**: Dữ liệu gửi đến API
- **Response Body**: Dữ liệu nhận về từ API
- **URL và Method**: Đường dẫn và phương thức (GET, POST, PUT, DELETE)

### 2. Tạo interfaces

Định nghĩa các interfaces để mô tả cấu trúc dữ liệu:

```typescript
// Mô tả dữ liệu cơ bản
interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  isDelete: boolean;
}

// Mô tả request
interface CreateEntityRequest {
  name: string;
  description: string;
  // Thêm các thuộc tính khác
}

// Mô tả response
interface EntityResponse extends BaseEntity {
  name: string;
  description: string;
  // Thêm các thuộc tính khác
}
```

### 3. Định nghĩa hàm API

Thêm các hàm để gọi API, bảo đảm xử lý lỗi phù hợp:

```typescript
/**
 * Lấy danh sách entities
 */
export const getAllEntities = async (): Promise<ApiResponse<Entity[]>> => {
  try {
    const response = await api.get<ApiResponse<Entity[]>>("/entity/get-all");
    return response.data;
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    throw new Error(error.message || 'Failed to fetch entities');
  }
};
```

### 4. Xử lý lỗi

Luôn đảm bảo xử lý lỗi trong mỗi hàm API:

- Bắt và ghi log chi tiết lỗi
- Ném lại lỗi với thông báo rõ ràng
- Sử dụng try-catch để xử lý lỗi

## Cấu trúc API hiện tại

### 1. API Response chung

Tất cả API đều trả về cấu trúc `ApiResponse`:

```typescript
interface ApiResponse<T> {
  code: number;        // Mã trạng thái
  message: string;     // Thông báo
  errors: any[];       // Danh sách lỗi (nếu có)
  data: T;             // Dữ liệu trả về
  meta: any | null;    // Thông tin bổ sung
  isValid: boolean;    // Trạng thái hợp lệ
}
```

### 2. API Client

Dự án sử dụng `api` từ tệp `./client` để gọi API:

```typescript
import { api } from './client';
import { ApiResponse } from './auth';
```

### 3. Quy tắc đặt tên

- **Interface**: PascalCase (VD: `UserInfo`, `AddAssignmentRequest`)
- **Function**: camelCase (VD: `getAllAssignments`, `updateSubmission`)
- **Đường dẫn API**: kebab-case (VD: `/assignment/get-all-submissions`)

## Mẫu tích hợp API hoàn chỉnh

Dưới đây là mẫu tích hợp đầy đủ cho một module:

```typescript
import { api } from './client';
import { ApiResponse } from './auth';

// Types
interface Entity {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateEntityRequest {
  name: string;
}

interface UpdateEntityRequest {
  id: string;
  name: string;
}

// API functions
export const getAllEntities = async (): Promise<ApiResponse<Entity[]>> => {
  try {
    const response = await api.get<ApiResponse<Entity[]>>("/api/entities");
    return response.data;
  } catch (error: any) {
    console.error('Error fetching entities:', error);
    throw new Error(error.message || 'Failed to fetch entities');
  }
};

export const createEntity = async (data: CreateEntityRequest): Promise<ApiResponse<Entity>> => {
  try {
    const response = await api.post<ApiResponse<Entity>>("/api/entities", data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating entity:', error);
    throw new Error(error.message || 'Failed to create entity');
  }
};

export const updateEntity = async (data: UpdateEntityRequest): Promise<ApiResponse<Entity>> => {
  try {
    const response = await api.put<ApiResponse<Entity>>("/api/entities", data);
    return response.data;
  } catch (error: any) {
    console.error('Error updating entity:', error);
    throw new Error(error.message || 'Failed to update entity');
  }
};

export const deleteEntity = async (id: string): Promise<ApiResponse<boolean>> => {
  try {
    const response = await api.delete<ApiResponse<boolean>>(`/api/entities/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error deleting entity:', error);
    throw new Error(error.message || 'Failed to delete entity');
  }
};
```

## Lưu ý quan trọng

1. **Type safety**: Luôn sử dụng typings để đảm bảo an toàn kiểu dữ liệu
2. **Error handling**: Xử lý lỗi cẩn thận với try-catch
3. **Documentation**: Viết JSDoc cho mọi hàm API
4. **Consistency**: Duy trì sự nhất quán về cách đặt tên và cấu trúc

## Các module API đã tích hợp

- **auth**: Xác thực và phân quyền
- **user**: Quản lý người dùng
- **classroom**: Quản lý lớp học
- **assignment**: Quản lý bài tập và bài nộp
  - Assignment: Quản lý bài tập
  - Quiz: Quản lý câu hỏi trắc nghiệm
  - Submission: Quản lý bài nộp 