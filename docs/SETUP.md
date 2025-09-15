# Initial Setup Plan

## Overview

This document outlines the step-by-step setup process for the Pot SaaS platform. We'll establish the core infrastructure first, then build functionalities incrementally. The focus is on SaaS features first, with Website as a Service (WaaS) coming later.

## Phase 0: Infrastructure Setup (1-2 weeks)

### Prerequisites
- [ ] GitHub account
- [ ] Vercel account
- [ ] Supabase account
- [ ] Cloudflare account
- [ ] Node.js 18+ installed locally
- [ ] Git installed locally

### Step 1: Create GitHub Repository
```bash
# Create new repository on GitHub
# Repository name: pot-saas
# Make it public or private (recommend private for now)
# Initialize with README.md
```

### Step 2: Local Project Setup
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/pot-saas.git
cd pot-saas

# Initialize Next.js project
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install @cloudflare/workers-types
npm install stripe
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install zustand react-hook-form @hookform/resolvers zod
npm install recharts
npm install @tanstack/react-query
```

### Step 3: Supabase Setup
1. **Create Supabase Project**
   - Go to https://supabase.com
   - Create new project
   - Choose region (closest to your users)
   - Set database password

2. **Database Configuration**
   - Copy project URL and anon key
   - Enable Row Level Security
   - Set up authentication settings

3. **Environment Variables**
   ```bash
   # Create .env.local file
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

### Step 4: Cloudflare R2 Setup
1. **Create R2 Bucket**
   - Go to Cloudflare Dashboard
   - Navigate to R2
   - Create new bucket: `pot-saas-files`
   - Generate API tokens

2. **Environment Variables**
   ```bash
   # Add to .env.local
   CLOUDFLARE_R2_ACCESS_KEY_ID=your_access_key
   CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_secret_key
   CLOUDFLARE_R2_BUCKET_NAME=pot-saas-files
   CLOUDFLARE_R2_ACCOUNT_ID=your_account_id
   ```

### Step 5: Vercel Deployment Setup
1. **Connect GitHub Repository**
   - Go to https://vercel.com
   - Import GitHub repository
   - Configure build settings:
     - Framework: Next.js
     - Root Directory: ./
     - Build Command: npm run build
     - Output Directory: .next

2. **Environment Variables**
   - Add all environment variables from .env.local to Vercel
   - Configure for production environment

3. **Domain Setup (Optional)**
   - Add custom domain if available
   - Configure DNS settings

### Step 6: Database Schema Setup
1. **Run Migrations**
   ```sql
   -- Execute the SQL schema from DATABASE.md
   -- Start with basic tables: organizations, users, etc.
   ```

2. **Seed Data**
   ```sql
   -- Add initial data for testing
   -- Create test organization and users
   ```

### Step 7: Basic Authentication Setup
1. **Supabase Auth Configuration**
   - Enable email/password authentication
   - Configure redirect URLs
   - Set up email templates

2. **Next.js Auth Integration**
   - Set up Supabase auth helpers
   - Create login/register pages
   - Implement protected routes

### Step 8: Testing Infrastructure
1. **Verify Connections**
   - Test Supabase connection
   - Test R2 bucket access
   - Test Vercel deployment

2. **Basic Functionality Test**
   - User registration
   - User login
   - Basic dashboard access

## Development Workflow

### Git Workflow
```bash
# Development branch
git checkout -b feature/basic-auth
# Make changes
git add .
git commit -m "feat: implement basic authentication"
git push origin feature/basic-auth
# Create pull request
# Merge to main after review
```

### Vercel Deployment
- Automatic deployments on push to main
- Preview deployments for pull requests
- Environment-specific builds

## Success Criteria

### Infrastructure Ready
- [ ] GitHub repository created and cloned
- [ ] Next.js project initialized with TypeScript
- [ ] Supabase project created and configured
- [ ] Cloudflare R2 bucket created
- [ ] Vercel project connected and deployed
- [ ] Environment variables configured
- [ ] Basic authentication working
- [ ] Database schema deployed

### Development Environment
- [ ] Local development server running
- [ ] Hot reload working
- [ ] Database connections working
- [ ] File upload to R2 working
- [ ] Basic user registration/login flow

## Next Steps

Once infrastructure is ready, we'll move to:

1. **Phase 1**: Core SaaS Features
   - Dashboard
   - User management
   - Organization setup

2. **Phase 2**: Business Features
   - Invoice management
   - Expense tracking
   - Document storage

3. **Phase 3**: Template System
   - Industry-specific templates
   - Paid plan restrictions

4. **Phase 4**: Advanced Features
   - Team management
   - Analytics
   - AI integration

5. **Phase 5**: Website as a Service
   - Domain management
   - Automated deployment
   - Template integration

## Troubleshooting

### Common Issues
- **Supabase Connection**: Check environment variables and project settings
- **R2 Access**: Verify API tokens and bucket permissions
- **Vercel Deployment**: Check build logs and environment variables
- **Database Errors**: Ensure RLS policies are correctly configured

### Support Resources
- Supabase Documentation: https://supabase.com/docs
- Vercel Documentation: https://vercel.com/docs
- Cloudflare R2 Documentation: https://developers.cloudflare.com/r2/
- Next.js Documentation: https://nextjs.org/docs
