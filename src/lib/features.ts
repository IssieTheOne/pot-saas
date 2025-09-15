// Feature Registry - Central configuration for all features
export const FEATURES = {
  // Core Features (Always Available)
  DASHBOARD: {
    id: 'dashboard',
    name: 'Dashboard',
    description: 'Main business overview and analytics',
    category: 'core',
    icon: 'Home',
    required: true,
    permissions: ['view']
  },

  // Business Type Features
  CONSULTANT: {
    id: 'consultant',
    name: 'Consultant Tools',
    description: 'Client management, project tracking, time tracking',
    category: 'business',
    icon: 'Briefcase',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete'],
    subFeatures: ['clients', 'projects', 'time_tracking', 'reports']
  },

  HAIR_SALON: {
    id: 'hair_salon',
    name: 'Salon Management',
    description: 'Appointment booking, stylist management, inventory',
    category: 'business',
    icon: 'Scissors',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete'],
    subFeatures: ['appointments', 'stylists', 'inventory', 'customers']
  },

  RETAIL: {
    id: 'retail',
    name: 'Retail Management',
    description: 'Inventory, POS, customer management',
    category: 'business',
    icon: 'ShoppingCart',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete'],
    subFeatures: ['inventory', 'pos', 'customers', 'reports']
  },

  // Add-on Features (Can be purchased separately)
  TIME_TRACKING: {
    id: 'time_tracking',
    name: 'Time Tracking',
    description: 'Advanced time tracking and productivity analytics',
    category: 'addon',
    icon: 'Clock',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete'],
    price: 15
  },

  INVOICE_GENERATION: {
    id: 'invoice_generation',
    name: 'Invoice Generation',
    description: 'Automated invoice creation and management',
    category: 'addon',
    icon: 'FileText',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete'],
    price: 25
  },

  ANALYTICS: {
    id: 'analytics',
    name: 'Advanced Analytics',
    description: 'Detailed business intelligence and reporting',
    category: 'addon',
    icon: 'BarChart3',
    required: false,
    permissions: ['view', 'create', 'edit'],
    price: 35
  },

  CRM: {
    id: 'crm',
    name: 'CRM System',
    description: 'Customer relationship management',
    category: 'addon',
    icon: 'Users',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete'],
    price: 45
  },

  // Admin Features
  ADMIN: {
    id: 'admin',
    name: 'Admin Panel',
    description: 'System administration and user management',
    category: 'admin',
    icon: 'Shield',
    required: false,
    permissions: ['view', 'create', 'edit', 'delete']
  }
}

// Business Templates - Pre-configured feature sets
export const BUSINESS_TEMPLATES = {
  CONSULTANT: {
    name: 'Consultant',
    description: 'Perfect for consultants, freelancers, and service providers',
    features: ['DASHBOARD', 'CONSULTANT', 'TIME_TRACKING', 'INVOICE_GENERATION', 'ANALYTICS'],
    icon: 'Briefcase'
  },

  HAIR_SALON: {
    name: 'Hair Salon',
    description: 'Complete salon management with booking and inventory',
    features: ['DASHBOARD', 'HAIR_SALON', 'CRM', 'ANALYTICS'],
    icon: 'Scissors'
  },

  RETAIL: {
    name: 'Retail Store',
    description: 'Inventory management and point of sale system',
    features: ['DASHBOARD', 'RETAIL', 'INVOICE_GENERATION', 'ANALYTICS'],
    icon: 'ShoppingCart'
  },

  FREELANCER: {
    name: 'Freelancer',
    description: 'Simple tools for individual freelancers',
    features: ['DASHBOARD', 'TIME_TRACKING', 'INVOICE_GENERATION'],
    icon: 'User'
  },

  STARTUP: {
    name: 'Startup',
    description: 'Essential tools for growing businesses',
    features: ['DASHBOARD', 'CRM', 'ANALYTICS', 'TIME_TRACKING'],
    icon: 'Rocket'
  }
}

// Permission levels
export const PERMISSION_LEVELS = {
  VIEW: 'view',
  CREATE: 'create',
  EDIT: 'edit',
  DELETE: 'delete',
  ADMIN: 'admin'
}

// Helper functions
export const getFeatureById = (id: string) => {
  return Object.values(FEATURES).find(feature => feature.id === id)
}

export const getFeaturesByCategory = (category: string) => {
  return Object.values(FEATURES).filter(feature => feature.category === category)
}

export const getTemplateFeatures = (templateId: string) => {
  const template = BUSINESS_TEMPLATES[templateId as keyof typeof BUSINESS_TEMPLATES]
  if (!template) return []

  return template.features.map(featureId => FEATURES[featureId as keyof typeof FEATURES])
}

export const hasFeaturePermission = (userPermissions: string[], featureId: string, permission: string) => {
  const feature = getFeatureById(featureId)
  if (!feature) return false

  return userPermissions.includes(`${featureId}:${permission}`) ||
         userPermissions.includes(`${featureId}:admin`) ||
         userPermissions.includes('admin')
}
