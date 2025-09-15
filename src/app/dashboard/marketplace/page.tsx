'use client'

import { useAuth } from '../../../../lib/auth-context'

export default function MarketplacePage() {
  const { user } = useAuth()

  const featuredServices = [
    {
      id: 1,
      title: 'Business Consulting',
      provider: 'Expert Advisors Inc.',
      rating: 4.9,
      reviews: 127,
      price: '$150/hour',
      category: 'Consulting',
      icon: '💼',
      featured: true
    },
    {
      id: 2,
      title: 'Financial Planning',
      provider: 'FinancePro Solutions',
      rating: 4.8,
      reviews: 89,
      price: '$120/hour',
      category: 'Finance',
      icon: '💰',
      featured: true
    },
    {
      id: 3,
      title: 'Legal Services',
      provider: 'LegalEase Partners',
      rating: 4.7,
      reviews: 156,
      price: '$200/hour',
      category: 'Legal',
      icon: '⚖️',
      featured: true
    },
    {
      id: 4,
      title: 'IT Support',
      provider: 'TechHelp 24/7',
      rating: 4.6,
      reviews: 203,
      price: '$80/hour',
      category: 'Technology',
      icon: '🖥️',
      featured: false
    }
  ]

  const categories = [
    { name: 'Consulting', count: 45, icon: '💼', color: 'from-blue-500 to-cyan-500' },
    { name: 'Finance', count: 32, icon: '💰', color: 'from-green-500 to-emerald-500' },
    { name: 'Legal', count: 28, icon: '⚖️', color: 'from-purple-500 to-pink-500' },
    { name: 'Technology', count: 67, icon: '🖥️', color: 'from-orange-500 to-red-500' },
    { name: 'Marketing', count: 41, icon: '📢', color: 'from-pink-500 to-rose-500' },
    { name: 'HR', count: 23, icon: '👥', color: 'from-indigo-500 to-purple-500' }
  ]

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐')
    }
    if (hasHalfStar) {
      stars.push('⭐')
    }
    while (stars.length < 5) {
      stars.push('☆')
    }
    return stars.join('')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
        <p className="text-white/70">Discover and connect with professional services</p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search services..."
              className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4">
            <select className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Categories</option>
              <option>Consulting</option>
              <option>Finance</option>
              <option>Legal</option>
              <option>Technology</option>
              <option>Marketing</option>
              <option>HR</option>
            </select>
            <select className="bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Sort by: Rating</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Most Reviews</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => (
            <div key={index} className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200 transform hover:scale-105 cursor-pointer">
              <div className={`w-12 h-12 bg-gradient-to-r ${category.color} rounded-lg flex items-center justify-center mb-3 mx-auto`}>
                <span className="text-xl">{category.icon}</span>
              </div>
              <h3 className="text-white font-medium text-center mb-1">{category.name}</h3>
              <p className="text-white/60 text-sm text-center">{category.count} services</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Services */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Featured Services</h2>
          <button className="text-blue-400 hover:text-blue-300 transition-colors">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredServices.map((service) => (
            <div key={service.id} className="bg-white/10 backdrop-blur-xl rounded-xl p-6 border border-white/20 shadow-xl hover:bg-white/15 transition-all duration-200 transform hover:scale-105 cursor-pointer group">
              {service.featured && (
                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1 rounded-full mb-4 w-fit">
                  ⭐ Featured
                </div>
              )}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-xl">{service.icon}</span>
                </div>
                <div>
                  <h3 className="text-white font-bold group-hover:text-blue-400 transition-colors">{service.title}</h3>
                  <p className="text-white/60 text-sm">{service.provider}</p>
                </div>
              </div>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <span className="text-yellow-400 mr-2">{renderStars(service.rating)}</span>
                  <span className="text-white/70 text-sm">({service.reviews})</span>
                </div>
                <p className="text-green-400 font-bold">{service.price}</p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/50 text-sm">{service.category}</span>
                <button className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm">
                  Contact
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl p-8 text-center">
        <h2 className="text-white text-2xl font-bold mb-4">Become a Service Provider</h2>
        <p className="text-white/90 mb-6">Join our marketplace and connect with businesses looking for your expertise</p>
        <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 rounded-lg font-bold transition-all duration-200 transform hover:scale-105">
          Get Started
        </button>
      </div>
    </div>
  )
}
