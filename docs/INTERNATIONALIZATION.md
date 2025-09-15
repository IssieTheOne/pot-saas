# Internationalization (i18n) Strategy

## Overview

This document outlines the internationalization strategy for the Pot SaaS platform, including the transition from a single-language application to a fully internationalized, multi-language platform that supports user preferences and geolocation-based language detection.

## Current State

- **Language**: English (en)
- **Framework**: Next.js 14 with App Router
- **UI Library**: React with custom components
- **Styling**: Tailwind CSS

## Target State

- **Supported Languages**: English, Spanish, French, German, Portuguese, Arabic, Chinese
- **Language Detection**: Browser preferences, geolocation, user settings
- **Fallback**: English for unsupported content
- **RTL Support**: Arabic language support
- **Date/Number Formatting**: Locale-specific formatting

## Implementation Phases

### Phase 1: Foundation Setup (Week 1-2)

#### 1.1 Install Dependencies
```bash
npm install next-intl @formatjs/intl-localematcher negotiator
```

#### 1.2 Project Structure Setup
```
src/
├── i18n/
│   ├── locales/
│   │   ├── en.json
│   │   ├── es.json
│   │   ├── fr.json
│   │   └── ...
│   ├── middleware.ts
│   ├── config.ts
│   └── types.ts
├── components/
│   └── LanguageSwitcher.tsx
└── app/
    └── [locale]/
        ├── layout.tsx
        ├── page.tsx
        └── ...
```

#### 1.3 Configuration Files

**i18n/config.ts**
```typescript
export const locales = ['en', 'es', 'fr', 'de', 'pt', 'ar', 'zh'] as const
export const defaultLocale = 'en' as const

export type Locale = typeof locales[number]

export const localeNames: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  pt: 'Português',
  ar: 'العربية',
  zh: '中文'
}
```

**i18n/middleware.ts**
```typescript
import createMiddleware from 'next-intl/middleware'
import { locales, defaultLocale } from './config'

export default createMiddleware({
  locales,
  defaultLocale,
  localeDetection: true
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
```

### Phase 2: Core Translation Files (Week 3-4)

#### 2.1 Create Base Translation Files

**locales/en.json**
```json
{
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "An error occurred",
    "success": "Success"
  },
  "navigation": {
    "dashboard": "Dashboard",
    "marketplace": "Marketplace",
    "documents": "Documents",
    "settings": "Settings"
  },
  "auth": {
    "login": "Login",
    "logout": "Logout",
    "email": "Email",
    "password": "Password"
  }
}
```

#### 2.2 Update Layout for i18n

**app/[locale]/layout.tsx**
```typescript
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales } from '@/i18n/config'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  )
}
```

### Phase 3: Component Translation (Week 5-6)

#### 3.1 Create Translation Hooks

**hooks/useTranslation.ts**
```typescript
import { useTranslations } from 'next-intl'

export function useTranslation(namespace?: string) {
  return useTranslations(namespace)
}
```

#### 3.2 Update Components

**components/LanguageSwitcher.tsx**
```typescript
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { locales, localeNames } from '@/i18n/config'

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()

  const switchLanguage = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`)
    router.push(newPath)
  }

  return (
    <select
      value={currentLocale}
      onChange={(e) => switchLanguage(e.target.value)}
      className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white"
    >
      {locales.map((locale) => (
        <option key={locale} value={locale} className="text-black">
          {localeNames[locale]}
        </option>
      ))}
    </select>
  )
}
```

### Phase 4: Database & API Internationalization (Week 7-8)

#### 4.1 Database Schema Updates

**SQL Migration for Multi-language Support**
```sql
-- Add language support to organizations
ALTER TABLE organizations
ADD COLUMN default_language VARCHAR(5) DEFAULT 'en',
ADD COLUMN supported_languages JSONB DEFAULT '["en"]';

-- Add language to user preferences
ALTER TABLE user_profiles
ADD COLUMN language VARCHAR(5) DEFAULT 'en',
ADD COLUMN timezone VARCHAR(50) DEFAULT 'UTC';

-- Create translation tables
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  locale VARCHAR(5) NOT NULL,
  value TEXT NOT NULL,
  namespace VARCHAR(100) DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(key, locale, namespace)
);

-- Index for fast lookups
CREATE INDEX idx_translations_key_locale ON translations(key, locale);
CREATE INDEX idx_translations_namespace ON translations(namespace);
```

#### 4.2 API Updates

**api/translations/route.ts**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const locale = searchParams.get('locale') || 'en'
  const namespace = searchParams.get('namespace')

  let query = supabase
    .from('translations')
    .select('key, value')
    .eq('locale', locale)

  if (namespace) {
    query = query.eq('namespace', namespace)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Convert to key-value object
  const translations = data.reduce((acc, item) => {
    acc[item.key] = item.value
    return acc
  }, {})

  return NextResponse.json(translations)
}
```

### Phase 5: Content Management (Week 9-10)

#### 5.1 Admin Translation Interface

**pages/admin/translations.tsx**
```typescript
// Admin interface for managing translations
// CRUD operations for translation keys
// Bulk import/export functionality
// Translation validation
```

#### 5.2 Dynamic Content Translation

**utils/translate.ts**
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function translate(key: string, locale: string, namespace = 'common'): Promise<string> {
  const { data, error } = await supabase
    .from('translations')
    .select('value')
    .eq('key', key)
    .eq('locale', locale)
    .eq('namespace', namespace)
    .single()

  if (error || !data) {
    // Fallback to English
    const { data: fallback } = await supabase
      .from('translations')
      .select('value')
      .eq('key', key)
      .eq('locale', 'en')
      .eq('namespace', namespace)
      .single()

    return fallback?.value || key
  }

  return data.value
}
```

### Phase 6: Testing & Quality Assurance (Week 11-12)

#### 6.1 Translation Testing

**tests/i18n.test.ts**
```typescript
describe('Internationalization', () => {
  test('should load correct translations', async () => {
    // Test translation loading
  })

  test('should fallback to English', async () => {
    // Test fallback behavior
  })

  test('should format dates correctly', async () => {
    // Test date/number formatting
  })
})
```

#### 6.2 RTL Support Testing

**components/RTLWrapper.tsx**
```typescript
import { ReactNode } from 'react'
import { useLocale } from 'next-intl'

interface RTLWrapperProps {
  children: ReactNode
}

export default function RTLWrapper({ children }: RTLWrapperProps) {
  const locale = useLocale()
  const isRTL = ['ar'].includes(locale)

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </div>
  )
}
```

## Language Detection Strategy

### 1. Browser Language Detection
```typescript
// middleware.ts
function getLocale(request: NextRequest): string {
  const acceptLanguage = request.headers.get('accept-language')
  // Parse and match against supported locales
  return matchLocale(acceptLanguage, locales, defaultLocale)
}
```

### 2. Geolocation Fallback
```typescript
// Use IP geolocation API for language suggestions
async function getGeoLanguage(ip: string): Promise<string> {
  const response = await fetch(`https://ipapi.co/${ip}/json/`)
  const data = await response.json()
  return mapCountryToLanguage(data.country_code)
}
```

### 3. User Preferences
```typescript
// Store user language preference in database
interface UserPreferences {
  language: string
  timezone: string
  dateFormat: string
  currency: string
}
```

## Content Translation Workflow

### 1. Content Identification
- Static text in components
- Dynamic content from database
- Error messages and notifications
- Email templates
- Documentation

### 2. Translation Process
1. Extract strings to translation files
2. Send to professional translators
3. Review and validate translations
4. Test in application
5. Deploy to production

### 3. Translation Management
- Use translation management system (e.g., Crowdin, Lokalise)
- Implement version control for translations
- Set up automated testing for missing translations
- Monitor translation coverage

## Performance Considerations

### 1. Bundle Splitting
```typescript
// Load translations dynamically
const messages = await import(`@/i18n/locales/${locale}.json`)
```

### 2. Caching Strategy
- Cache translations in Redis/CDN
- Implement stale-while-revalidate
- Preload critical translations

### 3. Code Splitting
```typescript
// Lazy load locale-specific components
const AdminPanel = lazy(() => import(`./admin/${locale}/AdminPanel`))
```

## Migration Strategy

### Phase 1: Preparation (Current)
- [ ] Set up i18n infrastructure
- [ ] Create translation files structure
- [ ] Add language switcher component
- [ ] Update build configuration

### Phase 2: Core Translation (Week 1-2 after prep)
- [ ] Translate common UI elements
- [ ] Update authentication flows
- [ ] Translate navigation and menus
- [ ] Add RTL support for Arabic

### Phase 3: Feature Translation (Week 3-4)
- [ ] Translate marketplace content
- [ ] Update document management
- [ ] Translate admin interfaces
- [ ] Update email templates

### Phase 4: Content & Testing (Week 5-6)
- [ ] Translate dynamic content
- [ ] Implement automated testing
- [ ] Performance optimization
- [ ] User acceptance testing

### Phase 5: Launch & Monitoring (Week 7-8)
- [ ] Gradual rollout by region
- [ ] Monitor performance metrics
- [ ] Collect user feedback
- [ ] Iterate on translations

## Success Metrics

- **Translation Coverage**: >95% of UI strings translated
- **Performance**: <100ms translation load time
- **User Adoption**: >70% of international users use non-English
- **Error Rate**: <0.1% missing translation errors
- **SEO Impact**: Improved search rankings in target markets

## Risk Mitigation

1. **Fallback Strategy**: Always fallback to English
2. **Progressive Enhancement**: Add languages incrementally
3. **Testing**: Comprehensive i18n testing suite
4. **Monitoring**: Real-time translation error monitoring
5. **Support**: Localized customer support

## Resources

- [Next.js Internationalization](https://nextjs.org/docs/advanced-features/i18n-routing)
- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [Unicode CLDR](https://cldr.unicode.org/)
- [W3C Internationalization](https://www.w3.org/International/)

This internationalization strategy ensures a smooth transition to a global, multi-language platform while maintaining performance and user experience.
