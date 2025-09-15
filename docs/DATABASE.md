# Database Schema

## Overview

The database is designed as a multi-tenant PostgreSQL system using Supabase, supporting multiple SME organizations with shared core functionality and template-specific features. The schema uses UUIDs for primary k### system_stats
Platform-wide statistics for admin dashboard.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Stats record identifier |
| date | date | NOT NULL | Date of statistics |
| total_users | integer | DEFAULT 0 | Total registered users |
| active_users | integer | DEFAULT 0 | Active users (last 30 days) |
| total_organizations | integer | DEFAULT 0 | Total organizations |
| active_organizations | integer | DEFAULT 0 | Active organizations |
| total_websites | integer | DEFAULT 0 | Total websites created |
| active_websites | integer | DEFAULT 0 | Active websites |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |

## Notifications & Communication Tables

### notifications
System-wide notification system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Notification identifier |
| title | text | NOT NULL | Notification title |
| message | text | NOT NULL | Notification content |
| type | notification_type | NOT NULL | Notification type |
| sender_id | uuid | REFERENCES users(id) | Sender user ID (null for system) |
| target_type | notification_target | NOT NULL | Target scope (all, organization, team) |
| target_id | uuid | | Target organization/team ID |
| priority | notification_priority | DEFAULT 'normal' | Notification priority |
| is_read | boolean | DEFAULT false | Read status |
| expires_at | timestamp with time zone | | Expiration date |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### user_notifications
User-specific notification delivery.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | User notification identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Target user |
| notification_id | uuid | NOT NULL, REFERENCES notifications(id) | Parent notification |
| is_read | boolean | DEFAULT false | Read status |
| read_at | timestamp with time zone | | Read timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### user_presence
Real-time user presence and online status.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | PRIMARY KEY, REFERENCES users(id) | User identifier |
| status | presence_status | NOT NULL, DEFAULT 'offline' | Current status |
| last_seen | timestamp with time zone | DEFAULT now() | Last activity timestamp |
| is_online | boolean | DEFAULT false | Online status |
| updated_at | timestamp with time zone | DEFAULT now() | Last status update |

### team_invitations
Team invitation system with email tokens.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Invitation identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Organization sending invitation |
| team_id | uuid | REFERENCES teams(id) | Target team (null for organization-wide) |
| inviter_id | uuid | NOT NULL, REFERENCES users(id) | User who sent invitation |
| email | text | NOT NULL | Invitee email address |
| role | user_role | NOT NULL | Assigned role for invitee |
| invitation_token | text | NOT NULL, UNIQUE | Secure invitation token |
| status | invitation_status | NOT NULL, DEFAULT 'pending' | Invitation status |
| expires_at | timestamp with time zone | NOT NULL | Token expiration time |
| accepted_at | timestamp with time zone | | Acceptance timestamp |
| accepted_by | uuid | REFERENCES users(id) | User who accepted invitation |
| message | text | | Personal message from inviter |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### email_templates
Reusable email templates for different scenarios.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Template identifier |
| organization_id | uuid | REFERENCES organizations(id) | Organization-specific template (null for system) |
| name | text | NOT NULL | Template name |
| subject | text | NOT NULL | Email subject line |
| html_content | text | NOT NULL | HTML email content |
| text_content | text | | Plain text fallback |
| template_type | email_template_type | NOT NULL | Template category |
| variables | jsonb | | Available template variables |
| is_active | boolean | DEFAULT true | Template active status |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### email_logs
Email delivery tracking and analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Email log identifier |
| organization_id | uuid | REFERENCES organizations(id) | Organization context |
| recipient_email | text | NOT NULL | Email recipient |
| sender_email | text | NOT NULL | Email sender |
| subject | text | NOT NULL | Email subject |
| template_type | email_template_type | | Template used |
| status | email_status | NOT NULL | Delivery status |
| provider_message_id | text | | Email provider's message ID |
| error_message | text | | Delivery error details |
| opened_at | timestamp with time zone | | Email opened timestamp |
| clicked_at | timestamp with time zone | | Link clicked timestamp |
| sent_at | timestamp with time zone | DEFAULT now() | Send timestamp |
| delivered_at | timestamp with time zone | | Delivery confirmation |

### password_reset_tokens
Secure password reset token management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Reset token identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Target user |
| reset_token | text | NOT NULL, UNIQUE | Secure reset token |
| expires_at | timestamp with time zone | NOT NULL | Token expiration |
| used_at | timestamp with time zone | | Token usage timestamp |
| ip_address | inet | | Request IP address |
| user_agent | text | | Request user agent |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### email_verification_tokens
Email verification token management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Verification token identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Target user |
| verification_token | text | NOT NULL, UNIQUE | Secure verification token |
| email | text | NOT NULL | Email being verified |
| expires_at | timestamp with time zone | NOT NULL | Token expiration |
| verified_at | timestamp with time zone | | Verification timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### activity_logs
Comprehensive activity logging for audit and analytics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Activity log identifier |
| user_id | uuid | REFERENCES users(id) | User who performed the action |
| organization_id | uuid | REFERENCES organizations(id) | Organization context |
| action | text | NOT NULL | Action performed (create, update, delete, etc.) |
| resource_type | text | NOT NULL | Type of resource (invoice, expense, user, etc.) |
| resource_id | uuid | | Specific resource identifier |
| details | jsonb | | Additional action details and metadata |
| ip_address | inet | | User's IP address |
| user_agent | text | | Browser/client user agent |
| session_id | text | | User session identifier |
| created_at | timestamp with time zone | DEFAULT now() | Action timestamp |

### user_preferences
User-specific preferences and settings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Preference identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | User owner |
| preference_key | text | NOT NULL | Preference key (theme, notifications, etc.) |
| preference_value | jsonb | NOT NULL | Preference value |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### saved_filters
User-saved filter combinations for quick access.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Filter identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | User owner |
| name | text | NOT NULL | Filter name |
| resource_type | text | NOT NULL | Type of resource being filtered |
| filters | jsonb | NOT NULL | Filter criteria and values |
| is_default | boolean | DEFAULT false | Whether this is the default filter |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### search_history
User search history for improved search experience.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Search history identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | User who performed search |
| search_query | text | NOT NULL | Search query text |
| search_type | text | DEFAULT 'global' | Type of search (global, invoices, etc.) |
| results_count | integer | DEFAULT 0 | Number of results found |
| filters_applied | jsonb | | Filters used in search |
| created_at | timestamp with time zone | DEFAULT now() | Search timestamp |

### user_sessions
Active user sessions for security and monitoring.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Session identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | User owner |
| session_token | text | NOT NULL, UNIQUE | Session token |
| device_info | jsonb | | Device and browser information |
| ip_address | inet | NOT NULL | Session IP address |
| location | text | | Approximate location based on IP |
| is_active | boolean | DEFAULT true | Session active status |
| expires_at | timestamp with time zone | NOT NULL | Session expiration |
| last_activity | timestamp with time zone | DEFAULT now() | Last activity timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Session creation timestamp |

## Recruitment Template Tables

### candidates
Candidate database for recruitment agencies.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Candidate identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| first_name | text | NOT NULL | Candidate first name |
| last_name | text | NOT NULL | Candidate last name |
| email | text | NOT NULL | Candidate email |
| phone | text | | Candidate phone |
| resume_url | text | | Resume file URL (Cloudflare R2) |
| skills | text[] | | Candidate skills |
| experience_years | integer | | Years of experience |
| current_salary | decimal(10,2) | | Current salary |
| expected_salary | decimal(10,2) | | Expected salary |
| location | text | | Candidate location |
| status | candidate_status | DEFAULT 'active' | Candidate status |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### job_postings
Job posting management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Job posting identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| title | text | NOT NULL | Job title |
| description | text | NOT NULL | Job description |
| requirements | text[] | | Job requirements |
| location | text | | Job location |
| salary_min | decimal(10,2) | | Minimum salary |
| salary_max | decimal(10,2) | | Maximum salary |
| job_type | job_type | DEFAULT 'full_time' | Employment type |
| status | job_status | DEFAULT 'open' | Job status |
| posted_at | timestamp with time zone | DEFAULT now() | Posting date |
| expires_at | timestamp with time zone | | Expiration date |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### placements
Placement tracking and commission management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Placement identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| candidate_id | uuid | NOT NULL, REFERENCES candidates(id) | Placed candidate |
| job_posting_id | uuid | REFERENCES job_postings(id) | Associated job |
| client_name | text | NOT NULL | Hiring client |
| placement_date | date | NOT NULL | Placement date |
| salary_offered | decimal(10,2) | NOT NULL | Offered salary |
| commission_amount | decimal(10,2) | | Commission earned |
| commission_percentage | decimal(5,2) | | Commission percentage |
| status | placement_status | DEFAULT 'completed' | Placement status |
| notes | text | | Additional notes |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

## Car Dealership Template Tables

### vehicles
Vehicle inventory for car dealerships.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Vehicle identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| vin | text | NOT NULL, UNIQUE | Vehicle identification number |
| make | text | NOT NULL | Vehicle make |
| model | text | NOT NULL | Vehicle model |
| year | integer | NOT NULL | Model year |
| mileage | integer | | Current mileage |
| price | decimal(10,2) | NOT NULL | Selling price |
| cost | decimal(10,2) | | Purchase cost |
| condition | vehicle_condition | DEFAULT 'used' | Vehicle condition |
| status | vehicle_status | DEFAULT 'available' | Availability status |
| images | text[] | | Vehicle image URLs |
| features | text[] | | Vehicle features |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### vehicle_history
Vehicle history and service records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | History record identifier |
| vehicle_id | uuid | NOT NULL, REFERENCES vehicles(id) | Associated vehicle |
| record_type | history_type | NOT NULL | Type of record |
| description | text | NOT NULL | Record description |
| date | date | NOT NULL | Record date |
| mileage | integer | | Mileage at time of record |
| cost | decimal(10,2) | | Associated cost |
| performed_by | text | | Service provider |
| notes | text | | Additional notes |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### financing_applications
Financing application tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Application identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| customer_name | text | NOT NULL | Customer name |
| customer_email | text | NOT NULL | Customer email |
| customer_phone | text | | Customer phone |
| vehicle_id | uuid | REFERENCES vehicles(id) | Associated vehicle |
| loan_amount | decimal(10,2) | NOT NULL | Requested loan amount |
| down_payment | decimal(10,2) | | Down payment amount |
| interest_rate | decimal(5,2) | | Interest rate |
| term_months | integer | | Loan term in months |
| status | financing_status | DEFAULT 'pending' | Application status |
| application_date | date | DEFAULT CURRENT_DATE | Application date |
| approved_date | date | | Approval date |
| notes | text | | Application notes |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |ormalization principles, and implements Row Level Security (RLS) for data isolation.

## Core Tables

### organizations
Primary table for multi-tenant architecture.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Unique organization identifier |
| name | text | NOT NULL | Organization name |
| type | organization_type | NOT NULL | SME type (consultant, retail, restaurant, general) |
| address | text | | Organization address |
| phone | text | | Contact phone |
| email | text | | Contact email |
| website | text | | Organization website |
| tax_id | text | | Tax identification number |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### users
Extends Supabase auth.users with organization-specific data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, REFERENCES auth.users(id) | User identifier (matches auth) |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Organization membership |
| email | text | NOT NULL | User email |
| full_name | text | NOT NULL | User's full name |
| role | user_role | NOT NULL, DEFAULT 'team_member' | User role in organization |
| system_role | system_role | DEFAULT 'user' | System-level role (for platform admins) |
| avatar_url | text | | Profile picture URL |
| phone | text | | User phone number |
| language | language_code | DEFAULT 'en' | User language preference |
| timezone | text | DEFAULT 'UTC' | User timezone |
| is_active | boolean | DEFAULT true | Account status |
| created_at | timestamp with time zone | DEFAULT now() | Account creation |
| updated_at | timestamp with time zone | DEFAULT now() | Last profile update |

### teams
Organizational structure for team management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Team identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Team name |
| description | text | | Team description |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Team creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### team_members
Junction table for team membership.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| team_id | uuid | NOT NULL, REFERENCES teams(id) | Team reference |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Member reference |
| role | text | DEFAULT 'member' | Role within team |
| joined_at | timestamp with time zone | DEFAULT now() | Membership start |
| PRIMARY KEY | (team_id, user_id) | | Composite primary key |

### invoices
Core invoicing functionality.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Invoice identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| invoice_number | text | NOT NULL | Unique invoice number |
| client_name | text | NOT NULL | Client name |
| client_email | text | | Client email for sending |
| client_address | text | | Client billing address |
| status | invoice_status | NOT NULL, DEFAULT 'draft' | Invoice status |
| subtotal | decimal(10,2) | NOT NULL, DEFAULT 0 | Pre-tax total |
| tax_rate | decimal(5,2) | DEFAULT 0 | Tax percentage |
| tax_amount | decimal(10,2) | DEFAULT 0 | Calculated tax |
| discount_amount | decimal(10,2) | DEFAULT 0 | Applied discount |
| total_amount | decimal(10,2) | NOT NULL | Final total |
| currency | text | DEFAULT 'USD' | Currency code |
| issue_date | date | NOT NULL | Invoice date |
| due_date | date | NOT NULL | Payment due date |
| notes | text | | Additional notes |
| payment_terms | text | | Payment terms text |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Invoice creator |
| sent_at | timestamp with time zone | | When invoice was sent |
| paid_at | timestamp with time zone | | Payment timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### invoice_items
Line items for invoices.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Item identifier |
| invoice_id | uuid | NOT NULL, REFERENCES invoices(id) ON DELETE CASCADE | Parent invoice |
| description | text | NOT NULL | Item description |
| quantity | decimal(10,2) | NOT NULL, DEFAULT 1 | Quantity |
| unit_price | decimal(10,2) | NOT NULL | Price per unit |
| total | decimal(10,2) | NOT NULL | Line total |
| tax_rate | decimal(5,2) | DEFAULT 0 | Item-specific tax |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### expenses
Expense tracking and approval system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Expense identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Expense submitter |
| category | text | NOT NULL | Expense category |
| amount | decimal(10,2) | NOT NULL | Expense amount |
| currency | text | DEFAULT 'USD' | Currency code |
| description | text | NOT NULL | Expense description |
| receipt_url | text | | Cloudflare R2 receipt URL |
| receipt_file_name | text | | Original file name |
| expense_date | date | NOT NULL | When expense occurred |
| status | expense_status | NOT NULL, DEFAULT 'pending' | Approval status |
| approved_by | uuid | REFERENCES users(id) | Approver user ID |
| approved_at | timestamp with time zone | | Approval timestamp |
| rejection_reason | text | | Reason for rejection |
| tax_category | text | | Tax classification |
| is_reimbursable | boolean | DEFAULT true | Reimbursement eligibility |
| created_at | timestamp with time zone | DEFAULT now() | Submission timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### documents
Document storage and management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Document identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Document name |
| file_url | text | NOT NULL | Cloudflare R2 file URL |
| file_type | text | NOT NULL | MIME type |
| file_size | bigint | NOT NULL | File size in bytes |
| folder | text | DEFAULT 'root' | Organizational folder |
| tags | text[] | | Search tags |
| uploaded_by | uuid | NOT NULL, REFERENCES users(id) | Uploader |
| version | integer | DEFAULT 1 | Version number |
| is_public | boolean | DEFAULT false | Public access flag |
| expires_at | timestamp with time zone | | Expiration date |
| created_at | timestamp with time zone | DEFAULT now() | Upload timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

## Website as a Service (WaaS) Tables

### website_credits
Credit system for website creation.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Credit identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| total_credits | integer | NOT NULL, DEFAULT 1 | Total credits allocated |
| used_credits | integer | DEFAULT 0 | Credits used for websites |
| credit_type | credit_type | DEFAULT 'free' | Type of credit allocation |
| expires_at | timestamp with time zone | | Credit expiration date |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### websites
Website instances created through WaaS.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Website identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Website name |
| domain | text | NOT NULL | Primary domain (customerwebsite.com) |
| admin_subdomain | text | NOT NULL | Admin subdomain (admin.customerwebsite.com) |
| template_id | text | NOT NULL | Selected template identifier |
| vercel_project_id | text | | Vercel project ID for hosting |
| cloudflare_zone_id | text | | Cloudflare zone ID for DNS |
| status | website_status | NOT NULL, DEFAULT 'creating' | Website deployment status |
| is_active | boolean | DEFAULT true | Website active status |
| last_deployed | timestamp with time zone | | Last deployment timestamp |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### website_templates
Available website templates.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | text | PRIMARY KEY | Template identifier |
| name | text | NOT NULL | Template display name |
| description | text | | Template description |
| category | template_category | NOT NULL | Industry category |
| thumbnail_url | text | | Template preview image |
| demo_url | text | | Live demo URL |
| price | decimal(10,2) | DEFAULT 0 | Template price |
| is_active | boolean | DEFAULT true | Template availability |
| features | text[] | | Template features list |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### domains
Domain management for websites.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Domain identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| domain_name | text | NOT NULL | Domain name |
| cloudflare_zone_id | text | | Cloudflare zone ID |
| registration_date | timestamp with time zone | | Domain registration date |
| expiry_date | timestamp with time zone | | Domain expiry date |
| auto_renew | boolean | DEFAULT true | Auto-renewal setting |
| status | domain_status | NOT NULL, DEFAULT 'pending' | Domain status |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### website_deployments
Deployment history and logs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Deployment identifier |
| website_id | uuid | NOT NULL, REFERENCES websites(id) | Associated website |
| deployment_id | text | | Vercel deployment ID |
| status | deployment_status | NOT NULL | Deployment status |
| build_log | text | | Build log output |
| error_message | text | | Error details if failed |
| deployed_at | timestamp with time zone | | Deployment completion time |
| created_at | timestamp with time zone | DEFAULT now() | Deployment start time |

### admin_actions
Audit log for admin actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Action identifier |
| admin_id | uuid | NOT NULL, REFERENCES users(id) | Admin user ID |
| action_type | admin_action_type | NOT NULL | Type of admin action |
| target_type | text | NOT NULL | Target entity type (user, organization, etc.) |
| target_id | uuid | NOT NULL | Target entity ID |
| details | jsonb | | Action details and metadata |
| ip_address | text | | Admin's IP address |
| user_agent | text | | Admin's user agent |
| created_at | timestamp with time zone | DEFAULT now() | Action timestamp |

### system_stats
Platform-wide statistics for admin dashboard.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Stats record identifier |
| date | date | NOT NULL | Date of statistics |
| total_users | integer | DEFAULT 0 | Total registered users |
| active_users | integer | DEFAULT 0 | Active users (last 30 days) |
| total_organizations | integer | DEFAULT 0 | Total organizations |
| active_organizations | integer | DEFAULT 0 | Active organizations |
| total_websites | integer | DEFAULT 0 | Total websites created |
| active_websites | integer | DEFAULT 0 | Active websites |
| total_revenue | decimal(15,2) | DEFAULT 0 | Total revenue |
| monthly_revenue | decimal(15,2) | DEFAULT 0 | Current month revenue |
| created_at | timestamp with time zone | DEFAULT now() | Record creation timestamp |

## Template-Specific Tables

### Consultant Template

#### projects
Project management for consultants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Project identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Project name |
| client_name | text | NOT NULL | Client name |
| client_email | text | | Client contact email |
| description | text | | Project description |
| status | project_status | NOT NULL, DEFAULT 'active' | Project status |
| priority | project_priority | DEFAULT 'medium' | Project priority |
| budget | decimal(10,2) | | Project budget |
| hourly_rate | decimal(10,2) | | Billing rate |
| estimated_hours | decimal(10,2) | | Estimated hours |
| actual_hours | decimal(10,2) | DEFAULT 0 | Logged hours |
| start_date | date | | Project start |
| end_date | date | | Project end |
| completion_percentage | integer | DEFAULT 0 | Progress percentage |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Project creator |
| assigned_team | uuid | REFERENCES teams(id) | Assigned team |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

#### timesheets
Time tracking for consultants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Timesheet entry ID |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Time logger |
| project_id | uuid | REFERENCES projects(id) | Associated project |
| date | date | NOT NULL | Work date |
| start_time | time | | Start time |
| end_time | time | | End time |
| hours | decimal(5,2) | NOT NULL | Hours worked |
| description | text | NOT NULL | Work description |
| billable | boolean | DEFAULT true | Billable status |
| billable_rate | decimal(10,2) | | Override billing rate |
| status | timesheet_status | DEFAULT 'draft' | Approval status |
| approved_by | uuid | REFERENCES users(id) | Approver |
| approved_at | timestamp with time zone | | Approval timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Entry timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### Retail Template

#### products
Product catalog for retail businesses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Product identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Product name |
| description | text | | Product description |
| sku | text | UNIQUE | Stock keeping unit |
| barcode | text | | Product barcode |
| category | text | | Product category |
| subcategory | text | | Product subcategory |
| brand | text | | Product brand |
| price | decimal(10,2) | NOT NULL | Selling price |
| cost_price | decimal(10,2) | | Purchase cost |
| stock_quantity | integer | DEFAULT 0 | Current stock |
| min_stock_level | integer | DEFAULT 0 | Reorder point |
| max_stock_level | integer | | Maximum stock |
| unit | text | DEFAULT 'piece' | Unit of measure |
| weight | decimal(10,2) | | Product weight |
| dimensions | text | | Product dimensions |
| image_url | text | | Product image URL |
| is_active | boolean | DEFAULT true | Active status |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

#### stock_movements
Inventory tracking for retail.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Movement identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| product_id | uuid | NOT NULL, REFERENCES products(id) | Affected product |
| type | stock_movement_type | NOT NULL | Movement type |
| quantity | integer | NOT NULL | Quantity changed |
| previous_stock | integer | NOT NULL | Stock before movement |
| new_stock | integer | NOT NULL | Stock after movement |
| reference_type | text | | Related record type |
| reference_id | uuid | | Related record ID |
| reason | text | | Movement reason |
| notes | text | | Additional notes |
| created_by | uuid | NOT NULL, REFERENCES users(id) | User who made change |
| created_at | timestamp with time zone | DEFAULT now() | Movement timestamp |

### Restaurant Template

#### menus
Menu management for restaurants.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Menu identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Menu name |
| description | text | | Menu description |
| type | menu_type | DEFAULT 'regular' | Menu type (lunch, dinner, etc.) |
| is_active | boolean | DEFAULT true | Active status |
| valid_from | date | | Menu validity start |
| valid_to | date | | Menu validity end |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

#### menu_items
Individual menu items.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Item identifier |
| menu_id | uuid | NOT NULL, REFERENCES menus(id) ON DELETE CASCADE | Parent menu |
| name | text | NOT NULL | Item name |
| description | text | | Item description |
| category | text | NOT NULL | Food category |
| subcategory | text | | Food subcategory |
| price | decimal(10,2) | NOT NULL | Item price |
| cost_price | decimal(10,2) | | Ingredient cost |
| image_url | text | | Item image URL |
| allergens | text[] | | Allergen information |
| preparation_time | integer | | Prep time in minutes |
| calories | integer | | Calorie count |
| is_vegetarian | boolean | DEFAULT false | Dietary flag |
| is_vegan | boolean | DEFAULT false | Dietary flag |
| is_gluten_free | boolean | DEFAULT false | Dietary flag |
| is_spicy | boolean | DEFAULT false | Dietary flag |
| is_available | boolean | DEFAULT true | Availability |
| sort_order | integer | DEFAULT 0 | Display order |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

#### reservations
Table reservation system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Reservation identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| customer_name | text | NOT NULL | Customer name |
| customer_phone | text | | Customer phone |
| customer_email | text | | Customer email |
| party_size | integer | NOT NULL | Number of guests |
| reservation_date | date | NOT NULL | Reservation date |
| reservation_time | time | NOT NULL | Reservation time |
| duration | integer | DEFAULT 120 | Duration in minutes |
| table_number | text | | Assigned table |
| status | reservation_status | NOT NULL, DEFAULT 'pending' | Reservation status |
| special_requests | text | | Customer requests |
| notes | text | | Internal notes |
| source | text | DEFAULT 'phone' | Reservation source |
| created_by | uuid | REFERENCES users(id) | Staff who took reservation |
| confirmed_by | uuid | REFERENCES users(id) | Staff who confirmed |
| confirmed_at | timestamp with time zone | | Confirmation timestamp |
| cancelled_at | timestamp with time zone | | Cancellation timestamp |
| cancellation_reason | text | | Cancellation reason |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### accountants
Professional accountant profiles and certifications.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Accountant identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Associated user account |
| company_name | text | | Accounting firm name |
| license_number | text | | Professional license number |
| certifications | text[] | | List of certifications |
| specializations | text[] | | Areas of specialization |
| years_experience | integer | | Years of experience |
| bio | text | | Professional biography |
| website | text | | Professional website |
| phone | text | | Business phone |
| address | text | | Business address |
| is_verified | boolean | DEFAULT false | Verification status |
| verification_documents | text[] | | Verification document URLs |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### accountant_clients
Accountant-client relationship management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Relationship identifier |
| accountant_id | uuid | NOT NULL, REFERENCES accountants(id) | Accountant |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Client organization |
| access_level | accountant_access_level | NOT NULL, DEFAULT 'read' | Access permissions |
| status | accountant_client_status | NOT NULL, DEFAULT 'pending' | Relationship status |
| invitation_token | text | | Secure invitation token |
| expires_at | timestamp with time zone | | Token expiration |
| granted_by | uuid | REFERENCES users(id) | Who granted access |
| granted_at | timestamp with time zone | | Access granted timestamp |
| revoked_by | uuid | REFERENCES users(id) | Who revoked access |
| revoked_at | timestamp with time zone | | Access revoked timestamp |
| notes | text | | Relationship notes |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### accountant_access_logs
Audit trail for accountant access and actions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Log entry identifier |
| accountant_id | uuid | NOT NULL, REFERENCES accountants(id) | Accountant |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Client organization |
| action | text | NOT NULL | Action performed |
| resource_type | text | NOT NULL | Type of resource accessed |
| resource_id | uuid | | Specific resource identifier |
| ip_address | inet | | Access IP address |
| user_agent | text | | Browser/client information |
| details | jsonb | | Additional action details |
| created_at | timestamp with time zone | DEFAULT now() | Action timestamp |

### accountant_invitations
Accountant invitation and onboarding system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Invitation identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Inviting organization |
| accountant_email | text | NOT NULL | Accountant email |
| accountant_name | text | | Accountant name |
| message | text | | Personal message |
| access_level | accountant_access_level | DEFAULT 'read' | Proposed access level |
| invitation_token | text | NOT NULL, UNIQUE | Secure invitation token |
| status | invitation_status | NOT NULL, DEFAULT 'pending' | Invitation status |
| expires_at | timestamp with time zone | NOT NULL | Token expiration |
| accepted_by | uuid | REFERENCES accountants(id) | Accepting accountant |
| accepted_at | timestamp with time zone | | Acceptance timestamp |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Invitation sender |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### projects
Project management for teams with kanban boards and task tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Project identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| name | text | NOT NULL | Project name |
| description | text | | Project description |
| status | project_status | NOT NULL, DEFAULT 'planning' | Project status |
| priority | project_priority | NOT NULL, DEFAULT 'medium' | Project priority |
| start_date | date | | Planned start date |
| end_date | date | | Planned end date |
| actual_start_date | date | | Actual start date |
| actual_end_date | date | | Actual completion date |
| budget | decimal(12,2) | | Project budget |
| progress_percentage | integer | DEFAULT 0 | Completion percentage (0-100) |
| color | text | DEFAULT '#3B82F6' | Project color for UI |
| is_template | boolean | DEFAULT false | Template project flag |
| template_name | text | | Template name if applicable |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Project creator |
| assigned_to | uuid | REFERENCES users(id) | Project manager |
| team_members | uuid[] | | Team member user IDs |
| tags | text[] | | Project tags |
| metadata | jsonb | | Additional project data |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### project_members
Project team member assignments and roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Membership identifier |
| project_id | uuid | NOT NULL, REFERENCES projects(id) | Associated project |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Team member |
| role | text | DEFAULT 'member' | Member role (owner, manager, member) |
| permissions | text[] | | Specific permissions |
| joined_at | timestamp with time zone | DEFAULT now() | Join timestamp |
| invited_by | uuid | REFERENCES users(id) | Who invited the member |
| is_active | boolean | DEFAULT true | Active membership status |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### kanban_boards
Kanban boards for project task management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Board identifier |
| project_id | uuid | NOT NULL, REFERENCES projects(id) | Associated project |
| name | text | NOT NULL | Board name |
| description | text | | Board description |
| is_default | boolean | DEFAULT false | Default board for project |
| column_config | jsonb | | Custom column configuration |
| swimlane_field | text | | Field for swimlanes (assignee, priority, etc.) |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Board creator |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### kanban_columns
Columns within kanban boards (To Do, In Progress, Done, etc.).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Column identifier |
| board_id | uuid | NOT NULL, REFERENCES kanban_boards(id) | Parent board |
| name | text | NOT NULL | Column name |
| column_type | kanban_column_type | NOT NULL | Column type |
| position | integer | NOT NULL | Display position |
| wip_limit | integer | | Work in progress limit |
| color | text | DEFAULT '#E5E7EB' | Column color |
| is_active | boolean | DEFAULT true | Active status |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### tasks
Individual tasks within projects and kanban boards.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Task identifier |
| project_id | uuid | NOT NULL, REFERENCES projects(id) | Parent project |
| board_id | uuid | REFERENCES kanban_boards(id) | Associated kanban board |
| column_id | uuid | REFERENCES kanban_columns(id) | Current kanban column |
| parent_task_id | uuid | REFERENCES tasks(id) | Parent task for subtasks |
| title | text | NOT NULL | Task title |
| description | text | | Task description |
| status | task_status | NOT NULL, DEFAULT 'todo' | Task status |
| priority | project_priority | NOT NULL, DEFAULT 'medium' | Task priority |
| assignee_id | uuid | REFERENCES users(id) | Assigned user |
| reporter_id | uuid | NOT NULL, REFERENCES users(id) | Task creator |
| labels | text[] | | Task labels/tags |
| due_date | date | | Due date |
| estimated_hours | decimal(6,2) | | Estimated hours |
| actual_hours | decimal(6,2) | | Actual hours logged |
| progress_percentage | integer | DEFAULT 0 | Completion percentage |
| attachments | text[] | | File attachment URLs |
| checklist_items | jsonb | | Task checklist |
| dependencies | uuid[] | | Dependent task IDs |
| metadata | jsonb | | Additional task data |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### task_comments
Comments and discussion on tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Comment identifier |
| task_id | uuid | NOT NULL, REFERENCES tasks(id) | Associated task |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Comment author |
| content | text | NOT NULL | Comment content |
| is_edited | boolean | DEFAULT false | Edit status |
| edited_at | timestamp with time zone | | Edit timestamp |
| parent_comment_id | uuid | REFERENCES task_comments(id) | Parent comment for replies |
| mentions | uuid[] | | Mentioned user IDs |
| attachments | text[] | | Comment attachments |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### task_attachments
File attachments for tasks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Attachment identifier |
| task_id | uuid | NOT NULL, REFERENCES tasks(id) | Associated task |
| uploaded_by | uuid | NOT NULL, REFERENCES users(id) | Uploader |
| file_name | text | NOT NULL | Original file name |
| file_path | text | NOT NULL | Storage path |
| file_size | bigint | NOT NULL | File size in bytes |
| mime_type | text | NOT NULL | MIME type |
| thumbnail_path | text | | Thumbnail path for images |
| created_at | timestamp with time zone | DEFAULT now() | Upload timestamp |

### time_entries
Time tracking for tasks and projects.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Time entry identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | User logging time |
| task_id | uuid | REFERENCES tasks(id) | Associated task |
| project_id | uuid | REFERENCES projects(id) | Associated project |
| date | date | NOT NULL | Work date |
| start_time | time | | Start time |
| end_time | time | | End time |
| duration_hours | decimal(6,2) | NOT NULL | Hours worked |
| description | text | | Work description |
| billable | boolean | DEFAULT true | Billable status |
| billable_rate | decimal(8,2) | | Hourly rate |
| is_manual | boolean | DEFAULT false | Manual entry flag |
| approved_by | uuid | REFERENCES users(id) | Approver |
| approved_at | timestamp with time zone | | Approval timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### calendar_events
Calendar events for scheduling and meetings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Event identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Owning organization |
| project_id | uuid | REFERENCES projects(id) | Associated project |
| task_id | uuid | REFERENCES tasks(id) | Associated task |
| title | text | NOT NULL | Event title |
| description | text | | Event description |
| event_type | text | DEFAULT 'meeting' | Event type (meeting, deadline, reminder) |
| start_date | date | NOT NULL | Event start date |
| start_time | time | | Event start time |
| end_date | date | NOT NULL | Event end date |
| end_time | time | | Event end time |
| all_day | boolean | DEFAULT false | All-day event |
| location | text | | Event location |
| virtual_link | text | | Virtual meeting link |
| attendees | uuid[] | | Attendee user IDs |
| organizer_id | uuid | NOT NULL, REFERENCES users(id) | Event organizer |
| recurrence_rule | text | | Recurrence pattern (RRULE) |
| recurrence_id | uuid | REFERENCES calendar_events(id) | Parent recurring event |
| reminders | jsonb | | Reminder settings |
| color | text | DEFAULT '#3B82F6' | Event color |
| is_private | boolean | DEFAULT false | Private event |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### calendar_event_attendees
Event attendee management and responses.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Attendance identifier |
| event_id | uuid | NOT NULL, REFERENCES calendar_events(id) | Associated event |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Attendee |
| response | text | DEFAULT 'pending' | Response status (pending, accepted, declined, tentative) |
| responded_at | timestamp with time zone | | Response timestamp |
| notes | text | | Attendee notes |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### team_invitations
Team member invitation system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Invitation identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Inviting organization |
| project_id | uuid | REFERENCES projects(id) | Associated project |
| email | text | NOT NULL | Invitee email |
| name | text | | Invitee name |
| role | user_role | DEFAULT 'team_member' | Assigned role |
| message | text | | Personal invitation message |
| invitation_token | text | NOT NULL, UNIQUE | Secure invitation token |
| status | invitation_status | NOT NULL, DEFAULT 'pending' | Invitation status |
| expires_at | timestamp with time zone | NOT NULL | Token expiration |
| accepted_by | uuid | REFERENCES users(id) | Accepting user |
| accepted_at | timestamp with time zone | | Acceptance timestamp |
| created_by | uuid | NOT NULL, REFERENCES users(id) | Invitation sender |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update |

### notifications
In-app notifications for team collaboration.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Notification identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | Recipient |
| organization_id | uuid | REFERENCES organizations(id) | Associated organization |
| type | text | NOT NULL | Notification type |
| title | text | NOT NULL | Notification title |
| message | text | NOT NULL | Notification message |
| data | jsonb | | Additional data |
| is_read | boolean | DEFAULT false | Read status |
| read_at | timestamp with time zone | | Read timestamp |
| action_url | text | | Action URL |
| priority | text | DEFAULT 'normal' | Priority level |
| expires_at | timestamp with time zone | | Expiration timestamp |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### activity_logs
Audit trail for team activities and changes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Activity identifier |
| user_id | uuid | NOT NULL, REFERENCES users(id) | User performing action |
| organization_id | uuid | REFERENCES organizations(id) | Associated organization |
| project_id | uuid | REFERENCES projects(id) | Associated project |
| task_id | uuid | REFERENCES tasks(id) | Associated task |
| action | activity_action | NOT NULL | Action performed |
| resource_type | text | NOT NULL | Resource type affected |
| resource_id | uuid | | Specific resource identifier |
| old_values | jsonb | | Previous values |
| new_values | jsonb | | New values |
| description | text | | Human-readable description |
| ip_address | inet | | Action IP address |
| user_agent | text | | Browser/client information |
| metadata | jsonb | | Additional metadata |
| created_at | timestamp with time zone | DEFAULT now() | Action timestamp |

## Enums and Types

```sql
-- Organization types
CREATE TYPE organization_type AS ENUM ('consultant', 'retail', 'restaurant', 'general');

-- User roles (organization-level)
CREATE TYPE user_role AS ENUM ('owner', 'manager', 'team_member');

-- System admin role (separate from organization roles)
CREATE TYPE system_role AS ENUM ('user', 'admin');

-- Language support
CREATE TYPE language_code AS ENUM ('en', 'nl', 'fr');

-- Accountant integration enums
CREATE TYPE accountant_access_level AS ENUM ('read', 'write', 'full');
CREATE TYPE accountant_client_status AS ENUM ('pending', 'active', 'suspended', 'terminated');

-- Common features enums
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'system');
CREATE TYPE activity_action AS ENUM ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'share');
CREATE TYPE notification_frequency AS ENUM ('immediate', 'hourly', 'daily', 'weekly', 'never');

-- Invoice status
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');

-- Expense status
CREATE TYPE expense_status AS ENUM ('pending', 'approved', 'rejected', 'reimbursed');

-- Project status and priority
CREATE TYPE project_status AS ENUM ('planning', 'active', 'on_hold', 'completed', 'cancelled');
CREATE TYPE project_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Timesheet status
CREATE TYPE timesheet_status AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- Stock movement types
CREATE TYPE stock_movement_type AS ENUM ('purchase', 'sale', 'adjustment', 'transfer', 'return', 'damage');

-- Menu types
CREATE TYPE menu_type AS ENUM ('breakfast', 'lunch', 'dinner', 'drinks', 'dessert', 'regular');

-- Reservation status
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');

-- Website as a Service enums
CREATE TYPE credit_type AS ENUM ('free', 'purchased', 'promotional');
CREATE TYPE website_status AS ENUM ('creating', 'active', 'suspended', 'deleted');
CREATE TYPE template_category AS ENUM ('consultant', 'retail', 'restaurant', 'general');
CREATE TYPE domain_status AS ENUM ('pending', 'active', 'expired', 'suspended');
CREATE TYPE deployment_status AS ENUM ('pending', 'building', 'success', 'failed');
CREATE TYPE admin_action_type AS ENUM ('user_enable', 'user_disable', 'user_delete', 'password_reset', 'organization_suspend', 'organization_delete', 'system_config', 'bulk_action');

-- Notification enums
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error', 'system');
CREATE TYPE notification_target AS ENUM ('all', 'organization', 'team', 'user');
CREATE TYPE notification_priority AS ENUM ('low', 'normal', 'high', 'urgent');

-- Presence enums
CREATE TYPE presence_status AS ENUM ('online', 'away', 'busy', 'offline');

-- Recruitment enums
CREATE TYPE candidate_status AS ENUM ('active', 'inactive', 'placed', 'rejected');
CREATE TYPE job_type AS ENUM ('full_time', 'part_time', 'contract', 'freelance');
CREATE TYPE job_status AS ENUM ('draft', 'open', 'closed', 'filled');
CREATE TYPE placement_status AS ENUM ('pending', 'completed', 'cancelled', 'failed');

-- Car dealership enums
CREATE TYPE vehicle_condition AS ENUM ('new', 'used', 'certified');
CREATE TYPE vehicle_status AS ENUM ('available', 'sold', 'reserved', 'maintenance');
CREATE TYPE history_type AS ENUM ('service', 'accident', 'ownership', 'modification');

-- Google Reviews enums
CREATE TYPE review_template_category AS ENUM ('general', 'positive', 'negative', 'neutral', 'service', 'product', 'complaint');
CREATE TYPE review_alert_type AS ENUM ('new_review', 'low_rating', 'no_response', 'response_time', 'rating_drop', 'volume_spike');

-- Team Invitation enums
CREATE TYPE invitation_status AS ENUM ('pending', 'accepted', 'expired', 'cancelled');

-- Email enums
CREATE TYPE email_template_type AS ENUM ('welcome', 'invitation', 'password_reset', 'email_verification', 'invoice', 'notification', 'system_announcement');
CREATE TYPE email_status AS ENUM ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'complained', 'unsubscribed');
```
```
CREATE TYPE financing_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
```

-- Team Management enums
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done', 'cancelled');
CREATE TYPE kanban_column_type AS ENUM ('todo', 'in_progress', 'review', 'done', 'backlog', 'blocked');

## Indexes and Performance Optimization

```sql
-- Core indexes for performance
CREATE INDEX idx_organizations_type ON organizations(type);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_expenses_organization_id ON expenses(organization_id);
CREATE INDEX idx_expenses_user_id ON expenses(user_id);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_documents_organization_id ON documents(organization_id);

-- Full-text search indexes
CREATE INDEX idx_invoices_client_search ON invoices USING gin(to_tsvector('english', client_name || ' ' || coalesce(client_email, '')));
CREATE INDEX idx_expenses_description_search ON expenses USING gin(to_tsvector('english', description));
CREATE INDEX idx_documents_name_search ON documents USING gin(to_tsvector('english', name));

-- Template-specific indexes
CREATE INDEX idx_projects_organization_id ON projects(organization_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_timesheets_user_id ON timesheets(user_id);
CREATE INDEX idx_timesheets_project_id ON timesheets(project_id);
CREATE INDEX idx_timesheets_date ON timesheets(date);
CREATE INDEX idx_products_organization_id ON products(organization_id);
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX idx_menu_items_menu_id ON menu_items(menu_id);
CREATE INDEX idx_reservations_date_time ON reservations(reservation_date, reservation_time);

-- Team Management indexes
CREATE INDEX idx_projects_organization_id_status ON projects(organization_id, status);
CREATE INDEX idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_project_members_project_id ON project_members(project_id);
CREATE INDEX idx_project_members_user_id ON project_members(user_id);
CREATE INDEX idx_kanban_boards_project_id ON kanban_boards(project_id);
CREATE INDEX idx_kanban_columns_board_id ON kanban_columns(board_id);
CREATE INDEX idx_kanban_columns_position ON kanban_columns(board_id, position);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_board_id ON tasks(board_id);
CREATE INDEX idx_tasks_column_id ON tasks(column_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_parent_task_id ON tasks(parent_task_id);
CREATE INDEX idx_task_comments_task_id ON task_comments(task_id);
CREATE INDEX idx_task_comments_user_id ON task_comments(user_id);
CREATE INDEX idx_task_attachments_task_id ON task_attachments(task_id);
CREATE INDEX idx_time_entries_user_id ON time_entries(user_id);
CREATE INDEX idx_time_entries_task_id ON time_entries(task_id);
CREATE INDEX idx_time_entries_project_id ON time_entries(project_id);
CREATE INDEX idx_time_entries_date ON time_entries(date);
CREATE INDEX idx_calendar_events_organization_id ON calendar_events(organization_id);
CREATE INDEX idx_calendar_events_project_id ON calendar_events(project_id);
CREATE INDEX idx_calendar_events_task_id ON calendar_events(task_id);
CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);
CREATE INDEX idx_calendar_events_end_date ON calendar_events(end_date);
CREATE INDEX idx_calendar_event_attendees_event_id ON calendar_event_attendees(event_id);
CREATE INDEX idx_calendar_event_attendees_user_id ON calendar_event_attendees(user_id);
CREATE INDEX idx_team_invitations_organization_id ON team_invitations(organization_id);
CREATE INDEX idx_team_invitations_email ON team_invitations(email);
CREATE INDEX idx_team_invitations_token ON team_invitations(invitation_token);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(user_id, is_read);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX idx_activity_logs_project_id ON activity_logs(project_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Full-text search indexes for team management
CREATE INDEX idx_projects_name_description_search ON projects USING gin(to_tsvector('english', name || ' ' || coalesce(description, '')));
CREATE INDEX idx_tasks_title_description_search ON tasks USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));
CREATE INDEX idx_task_comments_content_search ON task_comments USING gin(to_tsvector('english', content));
CREATE INDEX idx_calendar_events_title_description_search ON calendar_events USING gin(to_tsvector('english', title || ' ' || coalesce(description, '')));

```

## Row Level Security (RLS) Policies

RLS is enabled on all tables to ensure data isolation between organizations.

### Example RLS Policies

```sql
-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... enable on all tables

-- Organizations: Users can only see their own organization
CREATE POLICY "Users can view their organization" ON organizations
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM users WHERE organization_id = organizations.id
    ));

-- Users: Users can only see users in their organization
CREATE POLICY "Users can view organization members" ON users
    FOR SELECT USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Invoices: Users can only access invoices from their organization
CREATE POLICY "Users can access organization invoices" ON invoices
    FOR ALL USING (organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
    ));

-- Similar policies for all other tables...
```

## Google Reviews Integration Tables

### google_business_profiles
Stores connected Google Business Profile information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Profile identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Organization owner |
| google_account_id | text | NOT NULL | Google account identifier |
| business_name | text | NOT NULL | Business name from Google |
| place_id | text | NOT NULL | Google Places API place ID |
| address | text | | Business address |
| phone | text | | Business phone number |
| website | text | | Business website |
| rating | decimal(2,1) | | Current average rating |
| total_reviews | integer | DEFAULT 0 | Total number of reviews |
| access_token | text | | OAuth access token (encrypted) |
| refresh_token | text | | OAuth refresh token (encrypted) |
| token_expires_at | timestamp with time zone | | Token expiration time |
| is_connected | boolean | DEFAULT true | Connection status |
| last_sync_at | timestamp with time zone | | Last data synchronization |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### google_reviews
Individual Google reviews data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Review identifier |
| profile_id | uuid | NOT NULL, REFERENCES google_business_profiles(id) | Associated business profile |
| google_review_id | text | NOT NULL | Google review ID |
| author_name | text | NOT NULL | Review author name |
| author_photo_url | text | | Author profile photo URL |
| rating | integer | NOT NULL, CHECK (rating >= 1 AND rating <= 5) | Star rating (1-5) |
| text | text | | Review text content |
| time | timestamp with time zone | NOT NULL | Review timestamp |
| reply_text | text | | Business reply text |
| reply_time | timestamp with time zone | | Reply timestamp |
| is_read | boolean | DEFAULT false | Read status in platform |
| is_responded | boolean | DEFAULT false | Response status |
| sentiment_score | decimal(3,2) | | AI-generated sentiment score |
| language | text | DEFAULT 'en' | Review language code |
| created_at | timestamp with time zone | DEFAULT now() | Platform creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### review_response_templates
Pre-built response templates for reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Template identifier |
| organization_id | uuid | NOT NULL, REFERENCES organizations(id) | Organization owner |
| name | text | NOT NULL | Template name |
| template_text | text | NOT NULL | Template content with placeholders |
| category | review_template_category | DEFAULT 'general' | Template category |
| rating_min | integer | CHECK (rating_min >= 1 AND rating_min <= 5) | Minimum rating for template |
| rating_max | integer | CHECK (rating_max >= 1 AND rating_max <= 5) | Maximum rating for template |
| is_active | boolean | DEFAULT true | Template active status |
| usage_count | integer | DEFAULT 0 | Number of times used |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |
| updated_at | timestamp with time zone | DEFAULT now() | Last update timestamp |

### review_analytics
Analytics and insights for reviews.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Analytics record identifier |
| profile_id | uuid | NOT NULL, REFERENCES google_business_profiles(id) | Associated business profile |
| date | date | NOT NULL | Analytics date |
| total_reviews | integer | DEFAULT 0 | Total reviews received |
| average_rating | decimal(3,2) | | Average rating for the period |
| rating_5_star | integer | DEFAULT 0 | Number of 5-star reviews |
| rating_4_star | integer | DEFAULT 0 | Number of 4-star reviews |
| rating_3_star | integer | DEFAULT 0 | Number of 3-star reviews |
| rating_2_star | integer | DEFAULT 0 | Number of 2-star reviews |
| rating_1_star | integer | DEFAULT 0 | Number of 1-star reviews |
| response_rate | decimal(5,2) | | Percentage of reviews responded to |
| average_response_time | interval | | Average time to respond |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

### review_alerts
Automated alerts for review events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PRIMARY KEY, DEFAULT gen_random_uuid() | Alert identifier |
| profile_id | uuid | NOT NULL, REFERENCES google_business_profiles(id) | Associated business profile |
| alert_type | review_alert_type | NOT NULL | Type of alert |
| threshold_value | integer | | Threshold value for alert |
| is_active | boolean | DEFAULT true | Alert active status |
| last_triggered | timestamp with time zone | | Last time alert was triggered |
| created_at | timestamp with time zone | DEFAULT now() | Creation timestamp |

## Data Migration and Seeding

- Use Supabase CLI for schema migrations
- Maintain migration files in version control
- Include seed data for development and testing
- Implement data validation in migrations
- Plan for zero-downtime deployments

## Backup and Recovery

- Automated daily backups via Supabase
- Point-in-time recovery capabilities
- Encrypted backup storage
- Regular backup testing and validation

This comprehensive database schema provides a solid foundation for the multi-tenant SaaS platform, supporting all core features and template-specific functionality while ensuring data security and performance.
