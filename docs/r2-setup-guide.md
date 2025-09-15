-- R2 Storage Configuration for Pot SaaS
-- This file contains the necessary configuration for Cloudflare R2 integration

-- Required Environment Variables for R2:
-- CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
-- CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key_id
-- CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_access_key
-- CLOUDFLARE_R2_BUCKET_NAME=pot-saas-documents
-- CLOUDFLARE_R2_PUBLIC_URL=https://your-account-id.r2.cloudflarestorage.com

-- Bucket Configuration:
-- Name: pot-saas-documents
-- Region: Auto (Cloudflare Global Network)
-- Storage Class: Standard
-- Public Access: Private (access via signed URLs)

-- CORS Configuration for R2 Bucket:
-- [
--   {
--     "AllowedOrigins": ["https://yourdomain.com", "http://localhost:3000"],
--     "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
--     "AllowedHeaders": ["*"],
--     "MaxAgeSeconds": 3000
--   }
-- ]

-- API Token Permissions (minimum required):
-- - Object: Read
-- - Object: Write
-- - Bucket: Read (for listing objects)
-- - Bucket: Write (for creating objects)

-- File Upload Limits:
-- Maximum file size: 100MB (configured in system_settings)
-- Allowed file types: All types supported
-- Storage path structure: /{organization_id}/{user_id}/{document_id}/{filename}

-- Security Features:
-- - Signed URLs for secure access
-- - Organization-based access control
-- - File type validation
-- - Size limits enforcement
-- - Audit logging for all operations
