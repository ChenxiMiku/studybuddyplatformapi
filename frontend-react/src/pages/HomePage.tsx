import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import { api } from '../services/api'

interface StudyGroup {
  id: string
  name: string
  description: string
  member_count: number
  max_members: number
  is_public: boolean
}

const HomePage = () => {
  const { token } = useAuthStore()
  const [recommendedGroups, setRecommendedGroups] = useState<StudyGroup[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalMessages: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      loadData()
    }
  }, [token])

  const loadData = async () => {
    try {
      setLoading(true)
      // Load study groups
      const groupsResponse = await api.getStudyGroups()
      const groups = groupsResponse.data || []
      
      // Get top 3 groups by member count
      const topGroups = groups
        .sort((a: StudyGroup, b: StudyGroup) => (b.member_count || 0) - (a.member_count || 0))
        .slice(0, 3)
      
      setRecommendedGroups(topGroups)
      
      // Update stats
      setStats({
        totalUsers: groups.reduce((sum: number, g: StudyGroup) => sum + (g.member_count || 0), 0),
        totalGroups: groups.length,
        totalMessages: 0 // 可以从后端获取
      })
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const features = [
    {
      icon: '👥',
      title: '学习小组',
      description: '加入或创建学习小组,与志同道合的伙伴一起学习',
      link: '/groups',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: '💬',
      title: '实时聊天',
      description: '与小组成员实时交流,分享学习心得和资源',
      link: '/chat',
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: '🔔',
      title: '通知中心',
      description: '及时接收小组动态、消息提醒和系统通知',
      link: '/notifications',
      color: 'bg-purple-100 text-purple-600'
    },
    {
      icon: '⭐',
      title: '用户评价',
      description: '查看和发布对学习伙伴的评价,建立信任关系',
      link: '/reviews',
      color: 'bg-yellow-100 text-yellow-600'
    }
  ]

  const displayStats = [
    { label: '活跃用户', value: stats.totalUsers.toString(), icon: '🎓' },
    { label: '学习小组', value: stats.totalGroups.toString(), icon: '👥' },
    { label: '今日消息', value: stats.totalMessages > 0 ? stats.totalMessages.toString() : '-', icon: '💬' },
  ]

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-white">
        <div className="max-w-3xl">
          <h1 className="text-5xl font-bold mb-4">
            欢迎来到 StudyBuddy
          </h1>
          <p className="text-xl mb-8 text-indigo-100">
            一个帮助你找到学习伙伴、组建学习小组、提升学习效率的智能平台
          </p>
          {!token ? (
            <div className="flex space-x-4">
              <Link
                to="/register"
                className="px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                立即注册
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 bg-indigo-700 text-white rounded-lg font-semibold hover:bg-indigo-800 transition-colors border-2 border-white"
              >
                登录账号
              </Link>
            </div>
          ) : (
            <Link
              to="/groups"
              className="inline-block px-8 py-3 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              开始探索
            </Link>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {displayStats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-indigo-100 rounded-lg text-2xl">
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Features Section */}
      <section>
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          核心功能
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Link
              key={index}
              to={token ? feature.link : '/login'}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all hover:-translate-y-1"
            >
              <div className={`w-12 h-12 ${feature.color} rounded-lg flex items-center justify-center mb-4 text-2xl`}>
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-600">
                {feature.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Groups Section */}
      {token && (
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              推荐小组
            </h2>
            <Link 
              to="/groups" 
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              查看全部 →
            </Link>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : recommendedGroups.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-600">暂无推荐小组</p>
              <Link 
                to="/groups/create"
                className="inline-block mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                创建第一个小组
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recommendedGroups.map((group) => (
                <Link
                  key={group.id}
                  to={`/groups/${group.id}`}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {group.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {group.member_count || 0} 位成员
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      group.is_public 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {group.is_public ? '公开' : '私密'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {group.description || '暂无描述'}
                  </p>
                  <div className="w-full py-2 bg-indigo-50 text-indigo-600 rounded-lg font-medium text-center">
                    查看详情
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  )
}

export default HomePage
