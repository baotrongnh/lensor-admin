# Refund Management System

## Overview

A comprehensive refund management system for handling buyer reports, with approval, rejection, and information request capabilities.

## Files Created

### 1. Types (`src/types/report.ts`)

TypeScript type definitions for the report system:

- `Report`: Main report interface
- `ReportStatus`: Status types (pending, approved, rejected, need_more_info)
- `ReportAction`: Action types for admin operations
- `ReportActionPayload`: Request payload structure
- `ReportsResponse`: API response structure

### 2. Service (`src/services/report.service.ts`)

API service layer with the following methods:

- `getAllReports()`: Fetch all reports
- `getReportsByStatus(status)`: Filter reports by status
- `getPendingReports()`: Get pending reports
- `getApprovedReports()`: Get approved reports
- `getRejectedReports()`: Get rejected reports
- `getNeedMoreInfoReports()`: Get reports needing more info
- `performAction(reportId, payload)`: Execute admin action
- `approveReport(reportId, response)`: Approve and refund
- `rejectReport(reportId, response)`: Reject and restore order
- `requestMoreInfo(reportId, response)`: Request additional evidence

### 3. Page (`src/app/(dashboard-layout)/refund/page.tsx`)

Full-featured refund management interface with:

- Tabbed navigation (All, Pending, Approved, Rejected, Need More Info)
- Data table with report details
- Action buttons (Approve, Reject, Request More Info)
- Confirmation dialogs with admin response input
- Real-time status updates
- Toast notifications for success/error feedback

### 4. Layout Update (`src/app/layout.tsx`)

Added Toaster component for toast notifications.

## Features

### 1. Report Listing

- **Tabs**: Filter reports by status (All, Pending, Approved, Rejected, Need More Info)
- **Table**: Display report ID, order ID, status, reason, and creation date
- **Status Badges**: Visual indicators with icons for each status
- **Auto-refresh**: Data refreshes when switching tabs

### 2. Admin Actions

- **Approve Report**: Processes refund to buyer
- **Reject Report**: Restores order to seller
- **Request More Info**: Asks reporter for additional evidence

### 3. Confirmation Flow

Each action requires:

1. Click action button
2. Review report details in dialog
3. Enter admin response (required)
4. Confirm action
5. Receive success/error notification

### 4. Action Restrictions

- Actions only available for "pending" and "need_more_info" reports
- Processed reports (approved/rejected) display admin response instead

## API Integration

### Base URL

Configured in `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://14.169.52.232:3005
```

### Endpoints Used

#### Get All Reports

```
GET /admin/reports
Response: { data: Report[] }
```

#### Get Reports by Status

```
GET /admin/reports?status={status}
Query params: pending | approved | rejected | need_more_info
Response: { data: Report[] }
```

#### Perform Action

```
POST /admin/reports/{reportId}/action
Body: {
  action: "approved" | "rejected" | "need_more_info",
  adminResponse: string
}
Response: {
  message: string,
  data: Report
}
```

## Usage

### Access the Page

Navigate to `/refund` in the admin dashboard.

### Approve a Report

1. Click "Approve" button on a pending report
2. Review report details
3. Enter verification notes (e.g., "Verified evidence. Product does not match description...")
4. Click "Confirm Approval"
5. System processes refund to buyer

### Reject a Report

1. Click "Reject" button on a pending report
2. Review report details
3. Enter rejection reason (e.g., "After reviewing evidence, product matches description...")
4. Click "Confirm Rejection"
5. System restores order to seller

### Request More Information

1. Click "More Info" button on a pending report
2. Review report details
3. Specify required information (e.g., "Evidence is not clear enough. Please provide...")
4. Click "Confirm Request"
5. Reporter receives notification to provide additional evidence

## UI Components Used

- **Card**: Container for report tables
- **Table**: Display report data
- **Badge**: Status indicators
- **Button**: Action triggers
- **Tabs**: Status filtering
- **Dialog**: Confirmation modals
- **Input/Textarea**: Admin response entry
- **Toast (Sonner)**: Success/error notifications
- **Icons (Lucide)**: CheckCircle, XCircle, AlertCircle, Loader2

## Error Handling

- API errors caught and displayed via toast notifications
- Loading states with spinner animations
- Form validation for required fields
- Disabled buttons during submission

## Security

- All API calls include authentication token (from `api-client.ts`)
- Admin responses are required and validated
- Confirmation step prevents accidental actions

## Code Structure

```
src/
├── types/
│   └── report.ts              # TypeScript definitions
├── services/
│   └── report.service.ts      # API service layer
├── app/
│   ├── layout.tsx             # Added Toaster
│   └── (dashboard-layout)/
│       └── refund/
│           └── page.tsx       # Main refund page
└── components/
    └── ui/                    # Shadcn UI components
```

## Notes

- All text is in English as requested
- Code follows existing patterns from other services (auth.service.ts, product.service.ts)
- API configuration is centralized in `lib/api-client.ts`
- All actions have confirmation dialogs for safety
- Toast notifications provide clear feedback
- Responsive design works on mobile and desktop
