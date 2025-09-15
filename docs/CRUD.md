# CRUD Operations Documentation

## Overview

This document outlines all Create, Read, Update, Delete (CRUD) operations for the Pot SaaS platform. Each major entity includes detailed CRUD specifications including permissions, validation rules, and business logic.

## ✅ **CURRENTLY IMPLEMENTED APIs**

### Documents API

#### Read Documents (GET)
- **Endpoint**: `GET /api/documents`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Authenticated users
- **Response**: Array of document objects with metadata
- **Features**:
  - Returns all documents ordered by upload date
  - Includes file metadata (name, size, type, upload date)
  - Error handling for database failures

#### Create Documents (POST)
- **Endpoint**: `POST /api/documents`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Authenticated users
- **Required Fields**:
  - `files` (File array, max 100MB per file)
- **Business Logic**:
  - File size validation (100MB limit)
  - Cloudflare R2 storage integration
  - Secure file URL generation
  - Database record creation
- **Features**:
  - Multiple file upload support
  - Automatic file type detection
  - Secure storage with signed URLs

#### Delete Documents (DELETE)
- **Endpoint**: `DELETE /api/documents/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Document owner or organization admin
- **Business Logic**:
  - File deletion from Cloudflare R2
  - Database record removal
  - Permission validation

### Invoices API

#### List Invoices (GET)
- **Endpoint**: `GET /api/invoices`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Query Parameters**:
  - `status` (draft, sent, paid, overdue)
  - `limit` (default: 50)
  - `offset` (default: 0)
- **Response**: Paginated list of invoices with items and payments
- **Features**:
  - Filtering by status
  - Pagination support
  - Includes related data (items, payments, creator info)

#### Create Invoice (POST)
- **Endpoint**: `POST /api/invoices`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Required Fields**:
  - `organization_id`
  - `invoice_number`
  - `client_name`
  - `issue_date`
  - `due_date`
  - `items[]` (array of line items)
- **Optional Fields**:
  - `client_email`, `client_address`, `tax_rate`, `notes`
- **Business Logic**:
  - Automatic total calculation
  - Invoice item creation
  - Tax calculation
  - Validation of required fields

#### Get Invoice (GET)
- **Endpoint**: `GET /api/invoices/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Response**: Complete invoice with items, payments, and reminders
- **Features**:
  - Full invoice details
  - Related payments and reminders
  - Creator and assignee information

#### Update Invoice (PUT)
- **Endpoint**: `PUT /api/invoices/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Updatable Fields**: All invoice fields except ID
- **Business Logic**:
  - Automatic recalculation of totals
  - Invoice item updates
  - Status change validation

#### Delete Invoice (DELETE)
- **Endpoint**: `DELETE /api/invoices/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Business Logic**:
  - Prevents deletion of paid invoices
  - Cascade deletion of related records
  - Audit trail preservation

### Reminders API

#### List Reminders (GET)
- **Endpoint**: `GET /api/reminders`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Query Parameters**:
  - `type` (one_time, daily, weekly, monthly, yearly)
  - `status` (active/inactive)
  - `limit`, `offset`
- **Response**: Paginated list of reminders with execution history
- **Features**:
  - Filtering by type and status
  - Includes assigned user and creator info
  - Execution history tracking

#### Create Reminder (POST)
- **Endpoint**: `POST /api/reminders`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Required Fields**:
  - `organization_id`
  - `title`
  - `reminder_type`
- **Optional Fields**:
  - `description`, `scheduled_date`, `recurrence_pattern`, `assigned_to`
- **Business Logic**:
  - Automatic next_run calculation
  - Recurrence pattern validation
  - Default scheduling logic

#### Get Reminder (GET)
- **Endpoint**: `GET /api/reminders/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Response**: Complete reminder with execution history
- **Features**:
  - Full reminder details
  - Execution tracking
  - Assignment information

#### Update Reminder (PUT)
- **Endpoint**: `PUT /api/reminders/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Business Logic**:
  - Recalculates next_run for recurring reminders
  - Updates execution tracking
  - Status change handling

#### Delete Reminder (DELETE)
- **Endpoint**: `DELETE /api/reminders/{id}`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization members
- **Business Logic**:
  - Removes all associated executions
  - Cleans up related notifications

### Team Invitations API

#### Create Team Invitation (POST)
- **Endpoint**: `POST /api/team/invite`
- **Status**: ✅ **IMPLEMENTED**
- **Permissions**: Organization Owner/Manager
- **Required Fields**:
  - `email` (valid email format)
  - `role` (enum: owner, manager, team_member)
- **Business Logic**:
  - Email validation and uniqueness checks
  - Invitation token generation
  - MailerSend email integration
  - Database record creation

## 📋 **PLANNED CRUD OPERATIONS**

## Core Business Entities

### Organizations

#### Create Organization
- **Endpoint**: `POST /api/organizations`
- **Permissions**: Any authenticated user
- **Required Fields**:
  - `name` (string, 2-100 chars)
  - `type` (enum: consultant, retail, restaurant, recruitment, car_dealership, general)
  - `email` (valid email format)
- **Business Logic**:
  - Auto-assign creator as Owner role
  - Generate unique organization code
  - Create default team structure
  - Send welcome email
- **Validation**: Name uniqueness, email format, type validation

#### Read Organization
- **Endpoint**: `GET /api/organizations/{id}`
- **Permissions**: Organization members only
- **Response**: Full organization details including settings, stats
- **Filters**: By type, status, creation date

#### Update Organization
- **Endpoint**: `PUT /api/organizations/{id}`
- **Permissions**: Owner or Manager roles
- **Updatable Fields**:
  - `name`, `description`, `address`, `phone`, `website`
  - `settings` (JSON object for preferences)
- **Business Logic**: Audit trail for changes

#### Delete Organization
- **Endpoint**: `DELETE /api/organizations/{id}`
- **Permissions**: Owner only
- **Business Logic**:
  - Soft delete (mark as inactive)
  - Preserve data for compliance
  - Notify all members
  - Cancel subscriptions

### Users

#### Create User
- **Endpoint**: `POST /api/users`
- **Permissions**: Organization Owner/Manager or self-registration
- **Required Fields**:
  - `email` (unique, valid format)
  - `full_name` (2-100 chars)
  - `password` (8+ chars, complexity requirements)
- **Business Logic**:
  - Email verification required
  - Default role assignment
  - Welcome email with setup instructions

#### Read User
- **Endpoint**: `GET /api/users/{id}` or `GET /api/users`
- **Permissions**: Self or organization admins
- **Response**: User profile, role, activity status
- **Filters**: By organization, role, status, last login

#### Update User
- **Endpoint**: `PUT /api/users/{id}`
- **Permissions**: Self or organization admins
- **Updatable Fields**:
  - `full_name`, `avatar_url`, `phone`
  - `preferences` (notification settings, theme, etc.)
  - `password` (with current password verification)
- **Business Logic**: Password change requires email confirmation

#### Delete User
- **Endpoint**: `DELETE /api/users/{id}`
- **Permissions**: Self or organization Owner
- **Business Logic**:
  - Transfer ownership of resources
  - Soft delete with data retention
  - Notify organization members

### Teams

#### Create Team
- **Endpoint**: `POST /api/teams`
- **Permissions**: Organization Owner/Manager
- **Required Fields**:
  - `name` (2-50 chars)
  - `description` (optional)
- **Business Logic**: Auto-add creator as team member

#### Read Team
- **Endpoint**: `GET /api/teams/{id}` or `GET /api/teams`
- **Permissions**: Organization members
- **Response**: Team details, member list, activity stats

#### Update Team
- **Endpoint**: `PUT /api/teams/{id}`
- **Permissions**: Team creator or organization admins
- **Updatable Fields**: `name`, `description`

#### Delete Team
- **Endpoint**: `DELETE /api/teams/{id}`
- **Permissions**: Team creator or organization Owner
- **Business Logic**: Reassign team members to default team

### Team Invitations

#### Create Team Invitation
- **Endpoint**: `POST /api/invitations`
- **Permissions**: Organization Owner/Manager
- **Required Fields**:
  - `email` (valid email format)
  - `role` (enum: owner, manager, team_member)
  - `team_id` (optional, for team-specific invitations)
- **Business Logic**:
  - Generate secure invitation token
  - Set expiration (24-72 hours)
  - Send invitation email with token link
  - Prevent duplicate pending invitations
- **Validation**: Email format, role validation, team membership

#### Read Team Invitations
- **Endpoint**: `GET /api/invitations` or `GET /api/invitations/{id}`
- **Permissions**: Organization Owner/Manager or invitation recipient
- **Response**: Invitation details, status, expiration
- **Filters**: By status, team, date range, inviter

#### Update Team Invitation
- **Endpoint**: `PUT /api/invitations/{id}`
- **Permissions**: Organization Owner/Manager
- **Updatable Fields**: `message`, `expires_at`
- **Business Logic**: Resend invitation email if requested

#### Delete Team Invitation
- **Endpoint**: `DELETE /api/invitations/{id}`
- **Permissions**: Organization Owner/Manager or invitation sender
- **Business Logic**: Cancel invitation, notify if possible

#### Accept Team Invitation
- **Endpoint**: `POST /api/invitations/{token}/accept`
- **Permissions**: Public (token-based)
- **Business Logic**:
  - Validate token and expiration
  - Create user account if doesn't exist
  - Add user to organization/team
  - Mark invitation as accepted
  - Send welcome email

### Email Templates

#### Create Email Template
- **Endpoint**: `POST /api/email-templates`
- **Permissions**: Organization Owner/Manager
- **Required Fields**:
  - `name`, `subject`, `html_content`
  - `template_type` (enum: welcome, invitation, etc.)
- **Business Logic**: Validate template variables and HTML

#### Read Email Templates
- **Endpoint**: `GET /api/email-templates` or `GET /api/email-templates/{id}`
- **Permissions**: Organization members
- **Response**: Template details, usage statistics

#### Update Email Template
- **Endpoint**: `PUT /api/email-templates/{id}`
- **Permissions**: Organization Owner/Manager
- **Business Logic**: Version control for template changes

#### Delete Email Template
- **Endpoint**: `DELETE /api/email-templates/{id}`
- **Permissions**: Organization Owner/Manager
- **Business Logic**: Prevent deletion of system templates

### Password Reset

#### Request Password Reset
- **Endpoint**: `POST /api/auth/password-reset`
- **Permissions**: Public
- **Required Fields**: `email`
- **Business Logic**:
  - Generate secure reset token
  - Send reset email with token link
  - Rate limit requests per email

#### Reset Password
- **Endpoint**: `POST /api/auth/password-reset/{token}`
- **Permissions**: Public (token-based)
- **Required Fields**: `password`, `password_confirmation`
- **Business Logic**:
  - Validate token and expiration
  - Update user password
  - Invalidate token
  - Send confirmation email

### Email Verification

#### Request Email Verification
- **Endpoint**: `POST /api/auth/verify-email`
- **Permissions**: Authenticated user
- **Business Logic**:
  - Generate verification token
  - Send verification email

#### Verify Email
- **Endpoint**: `POST /api/auth/verify-email/{token}`
- **Permissions**: Public (token-based)
- **Business Logic**:
  - Validate token and expiration
  - Mark email as verified
  - Update user status

### Invoices

#### Create Invoice
- **Endpoint**: `POST /api/invoices`
- **Permissions**: Organization members
- **Required Fields**:
  - `client_name`, `client_email`
  - `items` (array of line items)
  - `total_amount`, `due_date`
- **Business Logic**:
  - Auto-generate invoice number
  - Calculate taxes and totals
  - Send to client if requested

#### Read Invoice
- **Endpoint**: `GET /api/invoices/{id}` or `GET /api/invoices`
- **Permissions**: Invoice creator or organization admins
- **Filters**: By status, date range, client, amount

#### Update Invoice
- **Endpoint**: `PUT /api/invoices/{id}`
- **Permissions**: Invoice creator
- **Business Logic**:
  - Prevent updates after payment
  - Recalculate totals on changes
  - Send update notifications

#### Delete Invoice
- **Endpoint**: `DELETE /api/invoices/{id}`
- **Permissions**: Invoice creator or organization Owner
- **Business Logic**: Soft delete, maintain audit trail

### Expenses

#### Create Expense
- **Endpoint**: `POST /api/expenses`
- **Permissions**: Organization members
- **Required Fields**:
  - `amount`, `description`, `category`
  - `expense_date`, `receipt_url` (optional)
- **Business Logic**:
  - Auto-categorization suggestions
  - Receipt OCR processing
  - Approval workflow trigger

#### Read Expense
- **Endpoint**: `GET /api/expenses/{id}` or `GET /api/expenses`
- **Permissions**: Expense creator or approvers
- **Filters**: By status, category, date, amount

#### Update Expense
- **Endpoint**: `PUT /api/expenses/{id}`
- **Permissions**: Expense creator (pending status only)
- **Business Logic**: Approval reset on changes

#### Delete Expense
- **Endpoint**: `DELETE /api/expenses/{id}`
- **Permissions**: Expense creator or organization Owner
- **Business Logic**: Maintain audit trail for compliance

### Documents

#### Create Document
- **Endpoint**: `POST /api/documents`
- **Permissions**: Organization members
- **Required Fields**:
  - `file` (upload)
  - `name`, `folder` (optional)
- **Business Logic**:
  - File type validation
  - Virus scanning
  - Auto-tagging and categorization

#### Read Document
- **Endpoint**: `GET /api/documents/{id}` or `GET /api/documents`
- **Permissions**: Organization members
- **Filters**: By folder, type, upload date, size

#### Update Document
- **Endpoint**: `PUT /api/documents/{id}`
- **Permissions**: Document uploader or organization admins
- **Updatable Fields**: `name`, `folder`, `tags`

#### Delete Document
- **Endpoint**: `DELETE /api/documents/{id}`
- **Permissions**: Document uploader or organization Owner
- **Business Logic**: Move to trash (soft delete)

## Template-Specific CRUD Operations

### Consultant Template - Projects

#### Create Project
- **Endpoint**: `POST /api/projects`
- **Permissions**: Organization members
- **Required Fields**: `name`, `client_name`, `budget`
- **Business Logic**: Auto-create default tasks

#### Read/Update/Delete Project
- Standard CRUD with permission checks
- Time tracking integration
- Budget vs actual calculations

### Consultant Template - Timesheets

#### Create Timesheet Entry
- **Endpoint**: `POST /api/timesheets`
- **Required Fields**: `project_id`, `date`, `hours`, `description`
- **Business Logic**: Prevent future dates, overlap checking

#### Read Timesheet
- **Filters**: By project, date range, user, billable status
- **Aggregations**: Total hours, billable amounts

### Retail Template - Products

#### Create Product
- **Endpoint**: `POST /api/products`
- **Required Fields**: `name`, `price`, `stock_quantity`
- **Business Logic**: SKU auto-generation, category suggestions

#### Update Product
- **Business Logic**: Stock level alerts, price change notifications

### Restaurant Template - Menu Items

#### Create Menu Item
- **Endpoint**: `POST /api/menu-items`
- **Required Fields**: `name`, `price`, `category`
- **Business Logic**: Duplicate prevention, allergen tracking

### Recruitment Template - Candidates

#### Create Candidate
- **Endpoint**: `POST /api/candidates`
- **Required Fields**: `first_name`, `last_name`, `email`
- **Business Logic**: Duplicate checking, resume parsing

#### Update Candidate
- **Business Logic**: Status change notifications, interview scheduling

### Recruitment Template - Job Postings

#### Create Job Posting
- **Endpoint**: `POST /api/job-postings`
- **Required Fields**: `title`, `description`, `requirements`
- **Business Logic**: Auto-post to integrated platforms

### Car Dealership Template - Vehicles

#### Create Vehicle
- **Endpoint**: `POST /api/vehicles`
- **Required Fields**: `vin`, `make`, `model`, `price`
- **Business Logic**: VIN validation, market data integration

#### Update Vehicle
- **Business Logic**: Price change tracking, status updates

## Communication & Notifications

### Notifications

#### Create Notification
- **Endpoint**: `POST /api/notifications`
- **Permissions**: Organization Owner/Manager or Admin
- **Types**: System, organization, team, user-specific
- **Business Logic**: Target audience filtering, priority handling

#### Read Notification
- **Endpoint**: `GET /api/notifications`
- **Filters**: By type, read status, date
- **Business Logic**: Mark as read on access

#### Update Notification
- **Business Logic**: Bulk read operations, preferences

### User Presence

#### Update Presence Status
- **Endpoint**: `PUT /api/presence`
- **Business Logic**: Real-time broadcasting, auto-timeout

#### Read Team Presence
- **Endpoint**: `GET /api/presence/team`
- **Response**: Online status for all team members

## Admin Operations

### Admin User Management

#### Create Admin User
- **Endpoint**: `POST /api/admin/users`
- **Permissions**: System Admin only
- **Business Logic**: Elevated permissions assignment

#### Update User Status
- **Endpoint**: `PUT /api/admin/users/{id}/status`
- **Operations**: Enable, disable, reset password
- **Business Logic**: Audit logging, notification sending

#### Delete User
- **Endpoint**: `DELETE /api/admin/users/{id}`
- **Business Logic**: Data retention compliance, resource cleanup

### System Administration

#### Create System Notification
- **Endpoint**: `POST /api/admin/notifications`
- **Business Logic**: Broadcast to all users, priority handling

#### Read System Statistics
- **Endpoint**: `GET /api/admin/stats`
- **Response**: Platform metrics, user counts, revenue data

#### Update System Settings
- **Endpoint**: `PUT /api/admin/settings`
- **Business Logic**: Configuration management, feature flags

## Google Reviews Integration

### Connect Google Business Profile
- **Endpoint**: `POST /api/integrations/google-business`
- **Business Logic**: OAuth flow, permission validation

### Fetch Reviews
- **Endpoint**: `GET /api/reviews`
- **Business Logic**: Rate limiting, caching, real-time sync

### Create Review Response
- **Endpoint**: `POST /api/reviews/{id}/response`
- **Business Logic**: Character limits, approval workflow

### Update Review Status
- **Endpoint**: `PUT /api/reviews/{id}/status`
- **Business Logic**: Internal tracking, notification triggers

## Subscription Management

### Create Subscription
- **Endpoint**: `POST /api/subscriptions`
- **Business Logic**: Stripe integration, plan validation

### Update Subscription
- **Endpoint**: `PUT /api/subscriptions/{id}`
- **Business Logic**: Plan changes, proration handling

### Cancel Subscription
- **Endpoint**: `DELETE /api/subscriptions/{id}`
- **Business Logic**: Grace period, data retention

## Data Export & GDPR

### Export User Data
- **Endpoint**: `GET /api/gdpr/export`
- **Business Logic**: Comprehensive data collection, format options

### Delete User Data
- **Endpoint**: `DELETE /api/gdpr/data`
- **Business Logic**: Right to erasure compliance, audit logging

### Update Consent
- **Endpoint**: `PUT /api/gdpr/consent`
- **Business Logic**: Preference tracking, legal compliance

## Validation Rules

### Common Validation Patterns
- **Email**: RFC 5322 compliant
- **Phone**: International format support
- **Dates**: ISO 8601 format, reasonable ranges
- **Amounts**: Positive values, decimal precision
- **Names**: Length limits, special character handling
- **Files**: Type, size, malware scanning

### Business Logic Validation
- **Invoice Totals**: Automatic calculation and verification
- **Expense Limits**: Configurable approval thresholds
- **User Permissions**: Role-based access control
- **Data Integrity**: Foreign key constraints, referential integrity

## Error Handling

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `409`: Conflict (duplicate data)
- `422`: Unprocessable Entity (business logic errors)
- `429`: Too Many Requests
- `500`: Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

## Rate Limiting

### API Rate Limits
- **Authenticated Users**: 1000 requests/hour
- **Admin Users**: 5000 requests/hour
- **File Uploads**: 50 uploads/hour
- **Email Sending**: 100 emails/hour

### Burst Handling
- Token bucket algorithm
- Graceful degradation
- Queue-based processing for high-volume operations

### Accountants

#### Create Accountant Profile
- **Endpoint**: `POST /api/accountants`
- **Permissions**: Authenticated user (becomes accountant)
- **Required Fields**:
  - `company_name`, `license_number`
  - `certifications` (array), `specializations` (array)
- **Business Logic**:
  - Verify license number format
  - Set verification status to false
  - Send verification request to admin

#### Read Accountant Profile
- **Endpoint**: `GET /api/accountants/{id}` or `GET /api/accountants`
- **Permissions**: Own profile or admin
- **Response**: Full profile with verification status

#### Update Accountant Profile
- **Endpoint**: `PUT /api/accountants/{id}`
- **Permissions**: Own profile
- **Business Logic**: Re-verification required for license changes

#### Delete Accountant Profile
- **Endpoint**: `DELETE /api/accountants/{id}`
- **Permissions**: Own profile or admin
- **Business Logic**: Terminate all client relationships

### Accountant-Client Relationships

#### Create Client Relationship
- **Endpoint**: `POST /api/accountant-clients`
- **Permissions**: Organization Owner/Manager or Accountant
- **Required Fields**:
  - `accountant_id`, `organization_id`
  - `access_level` (enum: read, write, full)
- **Business Logic**:
  - Generate invitation token
  - Send invitation email
  - Set status to pending

#### Read Client Relationships
- **Endpoint**: `GET /api/accountant-clients` or `GET /api/accountant-clients/{id}`
- **Permissions**: Involved parties or admin
- **Filters**: By status, accountant, organization

#### Update Client Relationship
- **Endpoint**: `PUT /api/accountant-clients/{id}`
- **Permissions**: Involved parties
- **Updatable Fields**: `access_level`, `status`, `notes`

#### Delete Client Relationship
- **Endpoint**: `DELETE /api/accountant-clients/{id}`
- **Permissions**: Involved parties or admin
- **Business Logic**: Log termination reason, notify parties

### Accountant Invitations

#### Create Accountant Invitation
- **Endpoint**: `POST /api/accountant-invitations`
- **Permissions**: Organization Owner/Manager
- **Required Fields**:
  - `accountant_email`, `message`
  - `access_level` (proposed level)
- **Business Logic**:
  - Generate secure token
  - Send invitation email
  - Set expiration (7 days)

#### Read Accountant Invitations
- **Endpoint**: `GET /api/accountant-invitations`
- **Permissions**: Organization Owner/Manager
- **Filters**: By status, date, accountant

#### Update Accountant Invitation
- **Endpoint**: `PUT /api/accountant-invitations/{id}`
- **Permissions**: Organization Owner/Manager
- **Business Logic**: Resend invitation if requested

#### Delete Accountant Invitation
- **Endpoint**: `DELETE /api/accountant-invitations/{id}`
- **Permissions**: Organization Owner/Manager
- **Business Logic**: Cancel invitation

#### Accept Accountant Invitation
- **Endpoint**: `POST /api/accountant-invitations/{token}/accept`
- **Permissions**: Public (token-based)
- **Business Logic**:
  - Validate token and expiration
  - Create accountant profile if needed
  - Establish client relationship
  - Set status to active

### Accountant Access Logs

#### Read Access Logs
- **Endpoint**: `GET /api/accountant-access-logs`
- **Permissions**: Admin or involved parties
- **Filters**: By date, accountant, organization, action
- **Business Logic**: Comprehensive audit trail

### Language Preferences

#### Update User Language
- **Endpoint**: `PUT /api/users/{id}/language`
- **Permissions**: Own profile or admin
- **Required Fields**: `language` (enum: en, nl, fr)
- **Business Logic**:
  - Update user preference
  - Log language change
  - Apply immediately to session

#### Read User Language
- **Endpoint**: `GET /api/users/{id}/language`
- **Permissions**: Own profile or admin
- **Response**: Current language preference

### User Preferences

#### Create/Update User Preference
- **Endpoint**: `PUT /api/user-preferences`
- **Permissions**: Own preferences
- **Required Fields**: `preference_key`, `preference_value`
- **Business Logic**: Upsert preference, validate preference format

#### Read User Preferences
- **Endpoint**: `GET /api/user-preferences`
- **Permissions**: Own preferences
- **Response**: All user preferences as key-value pairs

#### Delete User Preference
- **Endpoint**: `DELETE /api/user-preferences/{key}`
- **Permissions**: Own preferences
- **Business Logic**: Reset to default value

### Saved Filters

#### Create Saved Filter
- **Endpoint**: `POST /api/saved-filters`
- **Permissions**: Authenticated user
- **Required Fields**: `name`, `resource_type`, `filters`
- **Business Logic**: Validate filter structure, prevent duplicates

#### Read Saved Filters
- **Endpoint**: `GET /api/saved-filters`
- **Permissions**: Own filters
- **Filters**: By resource_type, usage frequency

#### Update Saved Filter
- **Endpoint**: `PUT /api/saved-filters/{id}`
- **Permissions**: Own filter
- **Business Logic**: Update filter criteria and metadata

#### Delete Saved Filter
- **Endpoint**: `DELETE /api/saved-filters/{id}`
- **Permissions**: Own filter

### Activity Logs

#### Read Activity Logs
- **Endpoint**: `GET /api/activity-logs`
- **Permissions**: Own logs or admin
- **Filters**: By date range, action type, resource type
- **Business Logic**: Pagination for large result sets

### User Sessions

#### Read Active Sessions
- **Endpoint**: `GET /api/user-sessions`
- **Permissions**: Own sessions
- **Response**: Active sessions with device information

#### Revoke Session
- **Endpoint**: `DELETE /api/user-sessions/{id}`
- **Permissions**: Own session
- **Business Logic**: Invalidate session token, log revocation

### Data Export

#### Request Data Export
- **Endpoint**: `POST /api/data-export`
- **Permissions**: Organization Owner
- **Required Fields**: `export_type`, `date_range`
- **Business Logic**: Queue export job, send completion notification

#### Read Export Status
- **Endpoint**: `GET /api/data-export/{id}`
- **Permissions**: Export requester
- **Response**: Export progress and download link when complete

### Global Search

#### Perform Global Search
- **Endpoint**: `GET /api/search`
- **Permissions**: Authenticated user
- **Required Fields**: `query`
- **Optional Fields**: `resource_types`, `filters`, `limit`
- **Business Logic**: Search across multiple resource types, rank results

#### Get Search Suggestions
- **Endpoint**: `GET /api/search/suggestions`
- **Permissions**: Authenticated user
- **Required Fields**: `query`
- **Business Logic**: Return autocomplete suggestions based on user history

### Documents

#### Create Document (Upload)
- **Endpoint**: `POST /api/documents/upload`
- **Permissions**: Authenticated user
- **Required Fields**:
  - `files` (File[], max 100MB per file)
- **Optional Fields**:
  - `category` (string: contracts, reports, images, videos, other)
  - `tags` (string[])
- **Business Logic**:
  - Validate file size (100MB limit)
  - Generate secure filename
  - Upload to R2/Cloudflare storage
  - Create database record with metadata
  - Extract file type and size information
- **Validation**: File type, size limits, user permissions
- **Response**: Upload confirmation with document metadata

#### Read Documents
- **Endpoint**: `GET /api/documents`
- **Permissions**: Authenticated user
- **Optional Fields**:
  - `category` (filter by category)
  - `search` (search in name/tags)
  - `limit`, `offset` (pagination)
- **Response**: Array of document metadata (name, size, type, upload date, tags)
- **Business Logic**: Filter by user ownership, apply search filters

#### Read Single Document
- **Endpoint**: `GET /api/documents/{id}`
- **Permissions**: Document owner or shared users
- **Response**: Full document metadata and download URL
- **Business Logic**: Generate temporary access token for secure download

#### Update Document
- **Endpoint**: `PUT /api/documents/{id}`
- **Permissions**: Document owner
- **Updatable Fields**:
  - `name` (string)
  - `category` (string)
  - `tags` (string[])
- **Business Logic**: Update metadata in database, maintain audit trail

#### Delete Document
- **Endpoint**: `DELETE /api/documents/{id}`
- **Permissions**: Document owner
- **Business Logic**:
  - Remove from R2/Cloudflare storage
  - Soft delete from database (mark as deleted)
  - Clean up related records
  - Log deletion for compliance

#### Download Document
- **Endpoint**: `GET /api/documents/{id}/download`
- **Permissions**: Document owner or shared users
- **Business Logic**:
  - Generate temporary signed URL
  - Track download for analytics
  - Apply rate limiting if needed

### Features (Marketplace)

#### Create Feature Request
- **Endpoint**: `POST /api/admin/feature-requests`
- **Permissions**: Authenticated user
- **Required Fields**:
  - `featureId` (string)
  - `reason` (string, optional)
- **Optional Fields**:
  - `requestTrial` (boolean)
  - `priority` (enum: low, medium, high)
- **Business Logic**:
  - Validate feature exists and is available
  - Check user permissions for the feature
  - Create request record with status 'pending'
  - Notify administrators
  - If trial requested, start trial period
- **Validation**: Feature availability, user eligibility

#### Read Feature Requests
- **Endpoint**: `GET /api/admin/feature-requests`
- **Permissions**: Organization admins
- **Optional Fields**:
  - `status` (filter by status)
  - `featureId` (filter by feature)
  - `userId` (filter by requester)
- **Response**: Array of feature requests with details
- **Business Logic**: Filter by organization, apply user permissions

#### Update Feature Request
- **Endpoint**: `PUT /api/admin/feature-requests/{id}`
- **Permissions**: Organization admins
- **Updatable Fields**:
  - `status` (enum: pending, approved, rejected, completed)
  - `adminNotes` (string)
  - `approvedAt` (timestamp)
- **Business Logic**:
  - Update request status
  - Send notifications to requester
  - If approved, enable feature for user
  - Log approval/rejection reasons

#### Delete Feature Request
- **Endpoint**: `DELETE /api/admin/feature-requests/{id}`
- **Permissions**: Request creator or organization Owner
- **Business Logic**: Cancel pending request, clean up related data

#### Start Feature Trial
- **Endpoint**: `POST /api/admin/trials`
- **Permissions**: Authenticated user
- **Required Fields**:
  - `featureId` (string)
- **Business Logic**:
  - Validate feature supports trials
  - Check trial eligibility
  - Create trial record with expiration
  - Enable feature temporarily
  - Schedule trial expiration job
- **Validation**: Trial availability, user hasn't exceeded trial limits

#### Read Feature Trials
- **Endpoint**: `GET /api/admin/trials`
- **Permissions**: Authenticated user
- **Response**: User's active and expired trials
- **Business Logic**: Filter by user, include trial status and expiration

#### Extend Feature Trial
- **Endpoint**: `POST /api/admin/trials/{id}/extend`
- **Permissions**: Organization admins
- **Required Fields**:
  - `days` (number, extension duration)
- **Business Logic**:
  - Validate trial exists and is active
  - Extend trial expiration date
  - Update trial record
  - Notify user of extension

#### Convert Trial to Paid
- **Endpoint**: `POST /api/admin/trials/{id}/convert`
- **Permissions**: Trial owner
- **Business Logic**:
  - Validate trial is active and eligible for conversion
  - Enable permanent feature access
  - Cancel trial (mark as converted)
  - Process payment if required
  - Update user subscription

### Feature Management (Admin)

#### Create Feature
- **Endpoint**: `POST /api/admin/features`
- **Permissions**: System administrators
- **Required Fields**:
  - `id` (string, unique identifier)
  - `name` (string)
  - `description` (string)
  - `category` (string)
  - `icon` (string)
- **Optional Fields**:
  - `price` (number)
  - `trialAvailable` (boolean)
  - `trialDurationDays` (number)
  - `requiresApproval` (boolean)
  - `approvalRoles` (string[])
  - `popular` (boolean)
  - `tags` (string[])
- **Business Logic**: Create feature in registry, set up permissions

#### Read Features
- **Endpoint**: `GET /api/admin/features`
- **Permissions**: Authenticated users
- **Response**: All available features with metadata
- **Business Logic**: Filter by user permissions, include trial status

#### Update Feature
- **Endpoint**: `PUT /api/admin/features/{id}`
- **Permissions**: System administrators
- **Updatable Fields**: All feature properties
- **Business Logic**: Update feature registry, notify affected users

#### Delete Feature
- **Endpoint**: `DELETE /api/admin/features/{id}`
- **Permissions**: System administrators
- **Business Logic**:
  - Mark feature as deprecated
  - Disable for existing users
  - Preserve data for compliance

This CRUD documentation serves as the API specification for the Pot SaaS platform, ensuring consistent implementation across all features and maintaining data integrity throughout the system.
