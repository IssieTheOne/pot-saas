// Feature Registry for Modular SaaS Platform
// This file defines all available features and business templates

export interface Feature {
  id: string
  name: string
  description: string
  category: 'core' | 'business' | 'addon'
  icon: string
  required?: boolean
  price?: number
  dependencies?: string[]
  // Trial and approval settings
  trialAvailable?: boolean
  trialDurationDays?: number
  requiresApproval?: boolean
  approvalRoles?: string[]
  popular?: boolean
  tags?: string[]
}

export interface BusinessTemplate {
  id: string
  name: string
  description: string
  icon: string
  features: string[]
  category: string
  trialAvailable?: boolean
  trialDurationDays?: number
}

// Core Features - Always available, cannot be disabled
export const CORE_FEATURES: Record<string, Feature> = {
  dashboard: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main dashboard with key metrics and insights',
    category: 'core',
    icon: 'Home',
    required: true
  },
  user_management: {
    id: 'user_management',
    name: 'User Management',
    description: 'Manage team members and permissions',
    category: 'core',
    icon: 'Users',
    required: true
  },
  settings: {
    id: 'settings',
    name: 'Settings',
    description: 'Organization and account settings',
    category: 'core',
    icon: 'Settings',
    required: true
  }
}

// Business Features - Main business functionality
export const BUSINESS_FEATURES: Record<string, Feature> = {
  consultant: {
    id: 'consultant',
    name: 'Consultant Dashboard',
    description: 'Complete consultant management system',
    category: 'business',
    icon: 'User',
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: true,
    tags: ['consulting', 'freelance', 'project-management']
  },
  hair_salon: {
    id: 'hair_salon',
    name: 'Hair Salon Management',
    description: 'Salon appointment and client management',
    category: 'business',
    icon: 'Scissors',
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: true,
    tags: ['beauty', 'appointments', 'retail']
  },
  retail: {
    id: 'retail',
    name: 'Retail Store',
    description: 'Point of sale and inventory management',
    category: 'business',
    icon: 'ShoppingCart',
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: true,
    tags: ['retail', 'pos', 'inventory']
  },
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant POS',
    description: 'Restaurant management and ordering system',
    category: 'business',
    icon: 'Briefcase',
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: true,
    tags: ['restaurant', 'pos', 'hospitality']
  },
  fitness: {
    id: 'fitness',
    name: 'Fitness Studio',
    description: 'Gym and fitness class management',
    category: 'business',
    icon: 'Rocket',
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: false,
    tags: ['fitness', 'gym', 'classes']
  },
  spa: {
    id: 'spa',
    name: 'Spa & Wellness',
    description: 'Spa service and appointment management',
    category: 'business',
    icon: 'Shield',
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: false,
    tags: ['spa', 'wellness', 'beauty']
  }
}

// Add-on Features - Premium features with pricing
export const ADDON_FEATURES: Record<string, Feature> = {
  time_tracking: {
    id: 'time_tracking',
    name: 'Time Tracking',
    description: 'Track time spent on projects and tasks',
    category: 'addon',
    icon: 'Clock',
    price: 15,
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: false,
    approvalRoles: ['admin', 'owner'],
    popular: true,
    tags: ['productivity', 'time-management', 'billing']
  },
  analytics: {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed reports and business intelligence',
    category: 'addon',
    icon: 'BarChart3',
    price: 25,
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: true,
    tags: ['analytics', 'reporting', 'business-intelligence']
  },
  crm: {
    id: 'crm',
    name: 'CRM Integration',
    description: 'Customer relationship management',
    category: 'addon',
    icon: 'Users',
    price: 20,
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: false,
    approvalRoles: ['admin', 'owner'],
    popular: true,
    tags: ['crm', 'customers', 'sales']
  },
  invoicing: {
    id: 'invoicing',
    name: 'Automated Invoicing',
    description: 'Generate and send invoices automatically',
    category: 'addon',
    icon: 'FileText',
    price: 18,
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: false,
    approvalRoles: ['admin', 'owner'],
    popular: true,
    tags: ['invoicing', 'billing', 'automation']
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing Tools',
    description: 'Email marketing and campaign management',
    category: 'addon',
    icon: 'Rocket',
    price: 22,
    dependencies: ['dashboard'],
    trialAvailable: true,
    trialDurationDays: 14,
    requiresApproval: true,
    approvalRoles: ['owner'],
    popular: false,
    tags: ['marketing', 'email', 'campaigns']
  }
}

// Combined features registry
export const FEATURES = {
  ...CORE_FEATURES,
  ...BUSINESS_FEATURES,
  ...ADDON_FEATURES
}

// Business Templates - Pre-configured feature sets
export const BUSINESS_TEMPLATES: Record<string, BusinessTemplate> = {
  consultant_template: {
    id: 'consultant_template',
    name: 'Consultant',
    description: 'Perfect for consultants and freelancers',
    icon: 'User',
    category: 'professional_services',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'consultant',
      'time_tracking',
      'invoicing'
    ]
  },
  hair_salon_template: {
    id: 'hair_salon_template',
    name: 'Hair Salon',
    description: 'Complete salon management solution',
    icon: 'Scissors',
    category: 'beauty_wellness',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'hair_salon',
      'crm',
      'invoicing'
    ]
  },
  retail_template: {
    id: 'retail_template',
    name: 'Retail Store',
    description: 'Point of sale and inventory management',
    icon: 'ShoppingCart',
    category: 'retail',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'retail',
      'analytics',
      'invoicing'
    ]
  },
  restaurant_template: {
    id: 'restaurant_template',
    name: 'Restaurant',
    description: 'Restaurant POS and management system',
    icon: 'Briefcase',
    category: 'hospitality',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'restaurant',
      'analytics',
      'crm'
    ]
  },
  fitness_template: {
    id: 'fitness_template',
    name: 'Fitness Studio',
    description: 'Gym and fitness class management',
    icon: 'Rocket',
    category: 'fitness',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'fitness',
      'crm',
      'marketing'
    ]
  },
  spa_template: {
    id: 'spa_template',
    name: 'Spa & Wellness',
    description: 'Spa service and appointment management',
    icon: 'Shield',
    category: 'beauty_wellness',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'spa',
      'crm',
      'marketing'
    ]
  },
  enterprise_template: {
    id: 'enterprise_template',
    name: 'Enterprise',
    description: 'Full-featured enterprise solution',
    icon: 'Crown',
    category: 'enterprise',
    features: [
      'dashboard',
      'user_management',
      'settings',
      'consultant',
      'hair_salon',
      'retail',
      'restaurant',
      'fitness',
      'spa',
      'time_tracking',
      'analytics',
      'crm',
      'invoicing',
      'marketing'
    ]
  }
}

// Helper functions
export const getFeaturesByCategory = (category: string): Feature[] => {
  return Object.values(FEATURES).filter(feature => feature.category === category)
}

export const getFeatureById = (id: string): Feature | undefined => {
  return FEATURES[id]
}

export const getTemplateById = (id: string): BusinessTemplate | undefined => {
  return BUSINESS_TEMPLATES[id]
}

export const getFeaturesForTemplate = (templateId: string): Feature[] => {
  const template = BUSINESS_TEMPLATES[templateId]
  if (!template) return []

  return template.features
    .map(featureId => FEATURES[featureId])
    .filter(feature => feature !== undefined)
}

export const validateFeatureDependencies = (featureId: string, enabledFeatures: string[]): boolean => {
  const feature = FEATURES[featureId]
  if (!feature || !feature.dependencies) return true

  return feature.dependencies.every(dep => enabledFeatures.includes(dep))
}

export const getRequiredFeatures = (): string[] => {
  return Object.values(FEATURES)
    .filter(feature => feature.required)
    .map(feature => feature.id)
}

export const getFeaturesByTag = (tag: string): Feature[] => {
  return Object.values(FEATURES).filter(feature =>
    'tags' in feature && Array.isArray((feature as any).tags) && (feature as any).tags.includes(tag)
  )
}

export const canUserRequestFeature = (featureId: string, userRole: string): boolean => {
  const feature = FEATURES[featureId]
  if (!feature) return false

  // Core features are always available
  if (feature.required) return true

  // If no approval required, anyone can request
  if (!('requiresApproval' in feature) || !(feature as any).requiresApproval) return true

  // Check if user's role can approve this feature
  return ('approvalRoles' in feature && (feature as any).approvalRoles?.includes(userRole)) || false
}

export const isFeatureTrialEligible = (featureId: string): boolean => {
  const feature = FEATURES[featureId]
  return ('trialAvailable' in feature && (feature as any).trialAvailable) || false
}

export const getFeaturePricing = (featureId: string): { price: number; currency: string } | null => {
  const feature = FEATURES[featureId]
  if (!feature || !('price' in feature)) return null

  return {
    price: (feature as any).price,
    currency: 'USD'
  }
}

export const getFeaturesByPriceRange = (minPrice?: number, maxPrice?: number): Feature[] => {
  return Object.values(FEATURES).filter(feature => {
    if (!('price' in feature)) return false
    const price = (feature as any).price
    if (minPrice !== undefined && price < minPrice) return false
    if (maxPrice !== undefined && price > maxPrice) return false
    return true
  })
}

// Template enhancements
export const getTemplatesWithTrials = (): BusinessTemplate[] => {
  return Object.values(BUSINESS_TEMPLATES).filter(template => template.trialAvailable)
}

export const getTemplateTrialDuration = (templateId: string): number => {
  const template = BUSINESS_TEMPLATES[templateId]
  return template?.trialDurationDays || 14
}

// Feature recommendation system
export const getRecommendedFeatures = (enabledFeatures: string[]): Feature[] => {
  const enabledSet = new Set(enabledFeatures)

  return Object.values(FEATURES).filter(feature => {
    // Don't recommend already enabled features
    if (enabledSet.has(feature.id)) return false

    // Don't recommend core features (always available)
    if (feature.required) return false

    // Recommend popular features
    if ('popular' in feature && (feature as any).popular) return true

    // Recommend features that complement enabled ones
    const complementsEnabled = ('dependencies' in feature && (feature as any).dependencies?.some((dep: string) => enabledSet.has(dep)))
    if (complementsEnabled) return true

    return false
  })
}

// Usage analytics helpers
export const getFeatureUsageStats = (featureId: string): {
  category: string
  isPopular: boolean
  hasTrial: boolean
  requiresApproval: boolean
  price?: number
} => {
  const feature = FEATURES[featureId]
  if (!feature) {
    return {
      category: 'unknown',
      isPopular: false,
      hasTrial: false,
      requiresApproval: false
    }
  }

  return {
    category: feature.category,
    isPopular: ('popular' in feature && (feature as any).popular) || false,
    hasTrial: ('trialAvailable' in feature && (feature as any).trialAvailable) || false,
    requiresApproval: ('requiresApproval' in feature && (feature as any).requiresApproval) || false,
    price: ('price' in feature ? (feature as any).price : undefined)
  }
}

export const getPopularFeatures = (): Feature[] => {
  return Object.values(FEATURES).filter(feature => 'popular' in feature && (feature as any).popular)
}
