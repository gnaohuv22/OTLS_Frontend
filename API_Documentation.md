# API Documentation for OTLS

This document provides a comprehensive overview of all APIs used in the OTLS (Online Teaching and Learning Solution) project.

## Table of Contents

- [Overview](#overview)
- [Authentication APIs](#authentication-apis)
- [User Management APIs](#user-management-apis)
- [Classroom APIs](#classroom-apis)
- [Assignment APIs](#assignment-apis)
- [Resource APIs](#resource-apis)
- [Subject APIs](#subject-apis)
- [Holiday APIs](#holiday-apis)
- [Twilio Integration APIs](#twilio-integration-apis)
- [Jitsi Meeting Integration](#jitsi-meeting-integration)

## Overview

The OTLS project uses a RESTful API architecture. All API responses follow a standard format:

```typescript
interface ApiResponse<T> {
  code: number;        // Status code
  message: string | null;     // Message
  errors: any | null;       // Error list (if any)
  data: T;             // Response data
  meta: any | null;    // Additional information
  isValid: boolean;    // Validity status
}
```

The API client is configured to handle authentication, token refresh, and error handling automatically.

## Authentication APIs

### Register

- **Endpoint:** `/auth/register`
- **Method:** POST
- **Description:** Register a new user
- **Request:**
  ```typescript
  interface RegisterRequest {
    email: string;
    password: string;
    phoneNumber: string;
    fullname: string;
    username?: string;
    dateOfBirth?: string;
    roleName: string;
    gender?: string;
    avatar?: string;
  }
  ```
- **Response:** Authentication status

### Login

- **Endpoint:** `/auth/login`
- **Method:** POST
- **Description:** Authenticate user and get token
- **Request:**
  ```typescript
  interface LoginRequest {
    username: string;
    password: string;
  }
  ```
- **Response:**
  ```typescript
  interface LoginResponseData {
    userDTO: UserDTO;
    token: string;
    roleName: string;
  }
  ```

### Check Authentication Status

- **Endpoint:** `/auth/status`
- **Method:** GET
- **Description:** Check current authentication status
- **Response:** Authentication status with user data

### Change Password

- **Endpoint:** `/user/change-password`
- **Method:** POST
- **Description:** Change user password
- **Request:**
  ```typescript
  interface ChangePasswordRequest {
    oldPassword: string;
    newPassword: string;
  }
  ```
- **Response:** Operation status

### Check Phone Number and Username

- **Endpoint:** `/auth/check-phonenumber-and-username`
- **Method:** POST
- **Description:** Verify if phone number and username exist
- **Request:**
  ```typescript
  interface CheckPhoneNumberAndUsernameRequest {
    phoneNumber: string;
    userName: string;
  }
  ```
- **Response:** User information if found

## User Management APIs

### Get All Users

- **Endpoint:** `/user/get-all-users`
- **Method:** GET
- **Description:** Get all users in the system
- **Response:** List of user information

### Get User by ID

- **Endpoint:** `/user/get-user-by-id/{userId}`
- **Method:** GET
- **Description:** Get user information by ID
- **Response:** User details

### Update User

- **Endpoint:** `/user/update-user`
- **Method:** PUT
- **Description:** Update user information
- **Request:**
  ```typescript
  interface UpdateUserRequest {
    userID: string;
    username?: string;
    phoneNumber?: string;
    fullname?: string;
    email?: string;
    gender?: string;
    dateOfBirth?: string;
    avatar?: string;
    status?: string;
  }
  ```
- **Response:** Operation status

### Change User Status

- **Endpoint:** `/user/change-status-user`
- **Method:** POST
- **Description:** Change user status
- **Request:**
  ```typescript
  interface ChangeStatusUserRequest {
    userId: string;
    statusUser: 'Active' | 'Inactive' | 'Pending' | 'Bannned';
  }
  ```
- **Response:** Operation status

### Add User

- **Endpoint:** `/user/add-user`
- **Method:** POST
- **Description:** Add a new user (Admin function)
- **Request:**
  ```typescript
  interface AddUserRequest {
    username: string;
    phoneNumber: string;
    fullname: string;
    email: string;
    password: string;
    gender: string;
    dateOfBirth: string;
    avatar?: string;
    roleName: string;
    status: string;
  }
  ```
- **Response:** Created user information

### Delete User

- **Endpoint:** `/user/delete-user/{userId}`
- **Method:** DELETE
- **Description:** Delete a user (mark as deleted)
- **Response:** Operation status

### Upload Avatar

- **Endpoint:** `/user/upload-avatar/{userId}`
- **Method:** POST
- **Description:** Upload user avatar
- **Request:** Form data with avatar file
- **Response:** Avatar URL

## Classroom APIs

### Get All Classrooms

- **Endpoint:** `/classroom/get-all-classrooms`
- **Method:** GET
- **Description:** Get all classrooms
- **Response:** List of classrooms

### Get Classroom by ID

- **Endpoint:** `/classroom/get-classroom-by-id/{classroomId}`
- **Method:** GET
- **Description:** Get classroom details by ID
- **Response:** Classroom information

### Add Classroom

- **Endpoint:** `/classroom/add-classroom`
- **Method:** POST
- **Description:** Create a new classroom
- **Request:** Classroom data
- **Response:** Created classroom

### Update Classroom

- **Endpoint:** `/classroom/update-classroom`
- **Method:** PUT
- **Description:** Update classroom information
- **Request:** Updated classroom data
- **Response:** Updated classroom

### Delete Classroom

- **Endpoint:** `/classroom/delete-classroom/{classroomId}`
- **Method:** DELETE
- **Description:** Delete a classroom
- **Response:** Operation status

### Add Material

- **Endpoint:** `/classroom/add-material`
- **Method:** POST
- **Description:** Add material to a classroom
- **Request:** FormData with material details and files
- **Response:** Added material

## Assignment APIs

### Get All Assignments

- **Endpoint:** `/assignment/get-all-assignments`
- **Method:** GET
- **Description:** Get all assignments
- **Response:** List of assignments with details

### Get Assignment by ID

- **Endpoint:** `/assignment/get-assignment-by-id/{assignmentId}`
- **Method:** GET
- **Description:** Get assignment details by ID
- **Response:** Assignment details

### Add Assignment

- **Endpoint:** `/assignment/add-assignment`
- **Method:** POST
- **Description:** Create a new assignment
- **Request:**
  ```typescript
  interface AddAssignmentRequest {
    userId: string;
    subjectId: string;
    title: string;
    description: string;
    classIds: string[];
    dueDate: string;
    maxPoints: number;
    allowLateSubmissions: boolean;
    assignmentType: string;
    textContent: string;
    timer: string | null;
  }
  ```
- **Response:** Created assignment

### Update Assignment

- **Endpoint:** `/assignment/update-assignment`
- **Method:** PUT
- **Description:** Update an assignment
- **Request:** Assignment data with assignmentId
- **Response:** Updated assignment

### Delete Assignment

- **Endpoint:** `/assignment/delete-assignment/{assignmentId}`
- **Method:** DELETE
- **Description:** Delete an assignment
- **Response:** Operation status

### Get Assignments by Class ID

- **Endpoint:** `/assignment/get-assignments-by-classId/{classId}`
- **Method:** GET
- **Description:** Get assignments for a specific class
- **Response:** Class information with assignments

### Get Quiz by Assignment ID

- **Endpoint:** `/assignment/get-quiz-by-assignmentId/{assignmentId}`
- **Method:** GET
- **Description:** Get quiz details for an assignment
- **Response:** Assignment with quiz questions

### Quiz Question Management

- **Get All Quiz Questions:**
  - **Endpoint:** `/assignment/get-all-quiz-questions`
  - **Method:** GET

- **Create Quiz Question:**
  - **Endpoint:** `/assignment/create-quiz-question`
  - **Method:** POST

- **Update Quiz Question:**
  - **Endpoint:** `/assignment/update-quiz-question`
  - **Method:** PUT

- **Delete Quiz Question:**
  - **Endpoint:** `/assignment/delete-quiz-question/{quizQuestionId}`
  - **Method:** DELETE

### Submission Management

- **Get All Submissions:**
  - **Endpoint:** `/assignment/get-all-submissions`
  - **Method:** GET

- **Get Submission by ID:**
  - **Endpoint:** `/assignment/get-submission-by-id/{submissionId}`
  - **Method:** GET

- **Get Submissions by Assignment ID:**
  - **Endpoint:** `/assignment/get-submissions-by-assignmentId/{assignmentId}`
  - **Method:** GET

- **Get Submissions by User ID:**
  - **Endpoint:** `/assignment/get-submissions-by-userId/{userId}`
  - **Method:** GET

- **Add Submission:**
  - **Endpoint:** `/assignment/add-submission`
  - **Method:** POST

- **Update Submission:**
  - **Endpoint:** `/assignment/update-submission`
  - **Method:** PUT

- **Delete Submission:**
  - **Endpoint:** `/assignment/delete-submission/{submissionId}`
  - **Method:** DELETE

## Resource APIs

### Get All Resources

- **Endpoint:** `/resource/all-resources`
- **Method:** GET
- **Description:** Get all resources
- **Response:** List of resources

### Add Resource

- **Endpoint:** `/resource/add-resource`
- **Method:** POST
- **Description:** Add a new resource
- **Request:** FormData with resource details and files
- **Response:** Created resource

### Edit Resource

- **Endpoint:** `/resource/edit-resource`
- **Method:** PUT
- **Description:** Update an existing resource
- **Request:** FormData with updated resource data
- **Response:** Updated resource

### Delete Resource

- **Endpoint:** `/resource/delete-resource/{resourceId}`
- **Method:** DELETE
- **Description:** Delete a resource
- **Response:** Operation status

## Subject APIs

### Get All Subjects

- **Endpoint:** `/subject/all-subjects`
- **Method:** GET
- **Description:** Get all subjects
- **Response:** List of subjects

### Add Subject

- **Endpoint:** `/subject/add-subject`
- **Method:** POST
- **Description:** Add a new subject
- **Request:** Subject name
- **Response:** Operation status

### Delete Subject

- **Endpoint:** `/subject/delete-subject/{subjectId}`
- **Method:** DELETE
- **Description:** Delete a subject
- **Response:** Operation status

## Holiday APIs

The Holiday API is handled by an external service with its own base URL.

### Get All Holidays

- **Endpoint:** `/api/holidays`
- **Method:** GET
- **Description:** Get all holidays
- **Response:** List of holidays

### Get Holidays for Year

- **Endpoint:** `/api/holidays?year={year}`
- **Method:** GET
- **Description:** Get holidays for a specific year
- **Response:** List of holidays

### Get Upcoming Holidays

- **Endpoint:** `/api/holidays/upcoming`
- **Method:** GET
- **Description:** Get upcoming holidays
- **Response:** List of upcoming holidays

### Get Holidays in Range

- **Endpoint:** `/api/holidays/in-range?start={startDate}&end={endDate}`
- **Method:** GET
- **Description:** Get holidays within a date range
- **Response:** List of holidays

### Create Holiday

- **Endpoint:** `/api/holidays`
- **Method:** POST
- **Description:** Create a new holiday
- **Request:** Holiday data
- **Response:** Created holiday

### Update Holiday

- **Endpoint:** `/api/holidays/{holidayId}`
- **Method:** PUT
- **Description:** Update a holiday
- **Request:** Updated holiday data
- **Response:** Updated holiday

### Delete Holiday

- **Endpoint:** `/api/holidays/{holidayId}`
- **Method:** DELETE
- **Description:** Delete a holiday
- **Response:** Operation status

## Twilio Integration APIs

These APIs are internal API routes that interact with Twilio service.

### Send OTP

- **Endpoint:** `/api/twilio/send-otp`
- **Method:** POST
- **Description:** Send OTP to a phone number
- **Request:** Phone number
- **Response:** OTP sending status

### Verify OTP

- **Endpoint:** `/api/twilio/verify-otp`
- **Method:** POST
- **Description:** Verify OTP entered by user
- **Request:** Phone number and OTP code
- **Response:** Verification status

## Jitsi Meeting Integration

The Jitsi integration uses the Jitsi Meet External API to create and manage video meetings.

### Client-side Implementation

- Uses Jitsi Meet External API to create meeting rooms
- Connects to 8x8.vc service
- Monitors classroom status to handle meeting end events
- Provides a React component for embedding meetings in the application 