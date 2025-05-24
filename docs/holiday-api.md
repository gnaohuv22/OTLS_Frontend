# Holiday API Documentation

This documentation outlines the Holiday API endpoints and their usage.

## Data Structure

### Holiday Object

```typescript
{
  id?: string;         // Optional for creation, required for updates
  name: string;        // Name of the holiday
  description?: string; // Optional description

  // Date information
  startDate: string;   // ISO format (YYYY-MM-DDT00:00:00.000Z)
  endDate?: string;    // Optional end date for multi-day holidays

  // Holiday type information
  isRecurring?: boolean; // Whether this holiday repeats yearly (default: false)
  type?: 'static' | 'dynamic'; // 'static' = fixed date (Jan 1, Apr 30...), 'dynamic' = varies by year (Lunar New Year)
  
  isActive?: boolean;   // Status of the holiday (default: true)
  createdAt?: string;   // Creation timestamp (ISO format)
  updatedAt?: string;   // Last update timestamp (ISO format)
}
```

## API Endpoints

### Get All Holidays

Retrieves all holidays from the database.

**URL**: `/api/holidays`

**Method**: `GET`

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of Holiday objects

**Error Response**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch holidays" }`

**Example Request**:
```
GET /api/holidays
```

### Get Holidays for a Year

Retrieves all holidays for a specified year, including recurring holidays adjusted to that year.

**URL**: `/api/holidays?year=YYYY`

**Method**: `GET`

**Query Parameters**:

- `year` (required): Year for which to retrieve holidays (format: YYYY)

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of Holiday objects

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid year format or out of range (1900-2100)" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch holidays" }`

**Example Request**:
```
GET /api/holidays?year=2023
```

**Example Response**:
```json
[
  {
    "id": "holiday1",
    "name": "New Year's Day",
    "description": "First day of the year",
    "startDate": "2023-01-01T00:00:00.000Z",
    "endDate": null,
    "isRecurring": true,
    "type": "static",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  },
  {
    "id": "holiday2",
    "name": "Christmas Day",
    "description": "Christmas celebration",
    "startDate": "2023-12-25T00:00:00.000Z",
    "endDate": null,
    "isRecurring": true,
    "type": "static",
    "isActive": true,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
]
```

### Get Upcoming Holidays

Retrieves holidays scheduled to occur within the next 3 months.

**URL**: `/api/holidays/upcoming`

**Method**: `GET`

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of Holiday objects

**Error Response**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch upcoming holidays" }`

**Example Request**:
```
GET /api/holidays/upcoming
```

### Get Holidays in Date Range

Retrieves holidays that fall within a specified date range.

**URL**: `/api/holidays/in-range`

**Method**: `GET`

**Query Parameters**:

- `start` (required): Start date in YYYY-MM-DD format
- `end` (required): End date in YYYY-MM-DD format

**Success Response**:

- **Code**: 200 OK
- **Content**: Array of Holiday objects

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Both start and end parameters are required" }`
  - **Content**: `{ "error": "Invalid date format. Use YYYY-MM-DD format" }`
  - **Content**: `{ "error": "Invalid date values" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch holidays in range" }`

**Example Request**:
```
GET /api/holidays/in-range?start=2023-01-01&end=2023-01-31
```

### Create a New Holiday

Creates a new holiday.

**URL**: `/api/holidays`

**Method**: `POST`

**Request Body**:
```json
{
  "name": "New Year's Day",           // Required
  "description": "First day of the year", // Optional
  "startDate": "2023-01-01T00:00:00.000Z", // Required
  "endDate": "2023-01-02T00:00:00.000Z", // Optional, for multi-day holidays
  "isRecurring": true,                // Optional, defaults to false
  "type": "static",                   // Optional, defaults to "dynamic"
  "isActive": true                    // Optional, defaults to true
}
```

**Success Response**:

- **Code**: 201 Created
- **Content**: Created Holiday object with ID

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Start date and name are required fields" }`
  - **Content**: `{ "error": "Invalid start date format. Use ISO 8601 format (YYYY-MM-DDT00:00:00.000Z)" }`
  - **Content**: `{ "error": "Invalid end date format. Use ISO 8601 format (YYYY-MM-DDT00:00:00.000Z)" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to create holiday" }`

### Import Static Holidays

Imports predefined static Vietnamese holidays into the database.

**URL**: `/api/holidays/import-static`

**Method**: `POST`

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "message": "Static holidays import completed",
  "results": [
    { "id": "holiday1", "name": "Tết Dương lịch", "status": "added" },
    { "id": "holiday2", "name": "Giải phóng miền Nam", "status": "already_exists" }
  ],
  "totalAdded": 1,
  "totalSkipped": 1
}
```

**Error Response**:

- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to import static holidays" }`

### Get a Single Holiday

Retrieves a specific holiday by ID.

**URL**: `/api/holidays/[id]`

**Method**: `GET`

**URL Parameters**:

- `id` (required): ID of the holiday

**Success Response**:

- **Code**: 200 OK
- **Content**: Holiday object

**Error Responses**:

- **Code**: 404 Not Found
  - **Content**: `{ "error": "Holiday not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to fetch holiday" }`

**Example Request**:
```
GET /api/holidays/holiday1
```

**Example Response**:
```json
{
  "id": "holiday1",
  "name": "New Year's Day",
  "description": "First day of the year",
  "startDate": "2023-01-01T00:00:00.000Z",
  "endDate": null,
  "isRecurring": true,
  "type": "static",
  "isActive": true,
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

### Update a Holiday

Updates an existing holiday.

**URL**: `/api/holidays/[id]`

**Method**: `PUT`

**URL Parameters**:

- `id` (required): ID of the holiday to update

**Request Body**:
```json
{
  "name": "New Year's Day Updated",    // Required
  "description": "Updated description", // Optional
  "startDate": "2023-01-01T00:00:00.000Z", // Required
  "endDate": "2023-01-02T00:00:00.000Z", // Optional
  "isRecurring": true,                // Optional
  "type": "static",                   // Optional
  "isActive": true                    // Optional
}
```

**Success Response**:

- **Code**: 200 OK
- **Content**: Updated Holiday object

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Start date and name are required fields" }`
- **Code**: 404 Not Found
  - **Content**: `{ "error": "Holiday not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to update holiday" }`

### Delete a Holiday

Deletes a specific holiday.

**URL**: `/api/holidays/[id]`

**Method**: `DELETE`

**URL Parameters**:

- `id` (required): ID of the holiday to delete

**Success Response**:

- **Code**: 200 OK
- **Content**: `{ "message": "Holiday deleted successfully", "id": "holiday1" }`

**Error Responses**:

- **Code**: 404 Not Found
  - **Content**: `{ "error": "Holiday not found" }`
- **Code**: 500 Internal Server Error
  - **Content**: `{ "error": "Failed to delete holiday" }`

## Integration Examples

### JavaScript/TypeScript Fetch API

```javascript
// Get all holidays
const getAllHolidays = async () => {
  const response = await fetch(`/api/holidays`);
  if (!response.ok) {
    throw new Error('Failed to fetch holidays');
  }
  return response.json();
};

// Get holidays for a specific year
const getHolidaysForYear = async (year) => {
  const response = await fetch(`/api/holidays?year=${year}`);
  if (!response.ok) {
    throw new Error('Failed to fetch holidays');
  }
  return response.json();
};

// Get upcoming holidays
const getUpcomingHolidays = async () => {
  const response = await fetch(`/api/holidays/upcoming`);
  if (!response.ok) {
    throw new Error('Failed to fetch upcoming holidays');
  }
  return response.json();
};

// Get holidays in a date range
const getHolidaysInRange = async (start, end) => {
  const response = await fetch(`/api/holidays/in-range?start=${start}&end=${end}`);
  if (!response.ok) {
    throw new Error('Failed to fetch holidays in range');
  }
  return response.json();
};

// Create a new holiday
const createHoliday = async (holidayData) => {
  const response = await fetch('/api/holidays', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(holidayData),
  });
  if (!response.ok) {
    throw new Error('Failed to create holiday');
  }
  return response.json();
};

// Import static holidays
const importStaticHolidays = async () => {
  const response = await fetch('/api/holidays/import-static', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to import static holidays');
  }
  return response.json();
};

// Get a single holiday
const getHoliday = async (id) => {
  const response = await fetch(`/api/holidays/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch holiday');
  }
  return response.json();
};

// Update a holiday
const updateHoliday = async (id, holidayData) => {
  const response = await fetch(`/api/holidays/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(holidayData),
  });
  if (!response.ok) {
    throw new Error('Failed to update holiday');
  }
  return response.json();
};

// Delete a holiday
const deleteHoliday = async (id) => {
  const response = await fetch(`/api/holidays/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete holiday');
  }
  return response.json();
};
```

## UI Form Structure

For creating or editing holidays, the UI should include the following form elements:

- **Name**: Text input (required)
- **Time Period**: Date range picker for `startDate` and optional `endDate`
- **Recurring Yearly**: Checkbox for `isRecurring`
- **Description**: Textarea for `description`
- **Type**: Dropdown with options:
  - "Static Holiday" (`type: 'static'`)
  - "Dynamic Holiday" (`type: 'dynamic'`)
- **Status**: Active/Inactive toggle for `isActive` 