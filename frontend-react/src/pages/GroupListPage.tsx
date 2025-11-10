import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'

interface StudyGroup {
  id: string
  name: string
  description: string
  member_count: number
  max_members: number
  is_public: boolean
  created_at: string
}

const GroupListPage = () => {
  const { t } = useTranslation()
  const [groups, setGroups] = useState<StudyGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'public' | 'private'>('all')

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = async () => {
    try {
      setLoading(true)
      console.log('🔍 开始加载小组列表...')
      const response = await api.getStudyGroups()
      console.log('📦 API 响应:', response)
      console.log('📊 小组数据:', response.data)
      setGroups(response.data || [])
      console.log('✅ 小组加载完成，数量:', response.data?.length || 0)
    } catch (error) {
      console.error('❌ 加载小组失败:', error)
      alert('加载小组失败: ' + (error instanceof Error ? error.message : '未知错误'))
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filter === 'all' || 
                         (filter === 'public' && group.is_public) ||
                         (filter === 'private' && !group.is_public)
    return matchesSearch && matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('groups.title')}</h1>
          <p className="text-gray-600 mt-1">{t('groups.discover')}</p>
        </div>
        <Link
          to="/groups/create"
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          ➕ {t('groups.create')}
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder={t('groups.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('groups.all')}
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'public'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('groups.public')}
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'private'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('groups.private')}
            </button>
          </div>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-xl text-gray-600">📭 {t('groups.noGroups')}</p>
          <p className="text-gray-500 mt-2">{t('groups.tryCreate')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {group.name}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>👥 {group.member_count || 0}/{group.max_members || '∞'} 成员</span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  group.is_public 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {group.is_public ? t('groups.public') : t('groups.private')}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {group.description || t('groups.noDescription')}
              </p>

              <div className="pt-4 border-t border-gray-100">
                <button className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors">
                  {t('groups.viewDetails')}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default GroupListPage
