import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import { useAuthStore } from '../stores/authStore'

interface StudyGroup {
  id: string
  name: string
  description: string
  member_count: number
  max_members: number
  is_public: boolean
  creator_id: string
  created_at: string
}

interface Member {
  id: string
  username: string
  email: string
  role: 'owner' | 'admin' | 'member'
  joined_at: string
}

const GroupDetailPage = () => {
  const { groupId } = useParams<{ groupId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  
  const [group, setGroup] = useState<StudyGroup | null>(null)
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [isMember, setIsMember] = useState(false)
  const [isOwner, setIsOwner] = useState(false)

  useEffect(() => {
    if (groupId && user) {
      loadData()
    }
  }, [groupId, user])

  const loadData = async () => {
    if (!user) {
      console.log('⚠️ User not loaded yet')
      return
    }

    try {
      setLoading(true)
      console.log('📦 Loading group data for user:', user.id)
      
      // Load both in parallel
      const [groupResponse, membersResponse] = await Promise.all([
        api.getStudyGroup(groupId!),
        api.getStudyGroupMembers(groupId!)
      ])
      
      console.log('👥 Members:', membersResponse.data)
      console.log('🔍 Checking membership for user:', user.id)
      
      setGroup(groupResponse.data)
      setIsOwner(String(groupResponse.data.creator_id) === String(user.id))
      
      setMembers(membersResponse.data || [])
      const memberCheck = membersResponse.data.some((m: Member) => {
        console.log(`  Comparing member ${m.id} with user ${user.id}:`, String(m.id) === String(user.id))
        return String(m.id) === String(user.id)
      })
      
      console.log('✅ Is member:', memberCheck)
      setIsMember(memberCheck)
    } catch (error) {
      console.error('加载小组信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadGroupDetails = async () => {
    try {
      const response = await api.getStudyGroup(groupId!)
      setGroup(response.data)
      setIsOwner(String(response.data.creator_id) === String(user?.id))
    } catch (error) {
      console.error('加载小组详情失败:', error)
    }
  }

  const loadMembers = async () => {
    try {
      const response = await api.getStudyGroupMembers(groupId!)
      setMembers(response.data || [])
      setIsMember(response.data.some((m: Member) => String(m.id) === String(user?.id)))
    } catch (error) {
      console.error('加载成员列表失败:', error)
    }
  }

  const handleJoinGroup = async () => {
    try {
      await api.joinStudyGroup(groupId!)
      await loadMembers()
      await loadGroupDetails()
      setIsMember(true)
    } catch (error: any) {
      alert(error.message || '加入小组失败')
    }
  }

  const handleLeaveGroup = async () => {
    if (!confirm('确定要离开这个小组吗?')) return
    
    try {
      await api.leaveStudyGroup(groupId!)
      await loadMembers()
      await loadGroupDetails()
      setIsMember(false)
    } catch (error: any) {
      alert(error.message || '离开小组失败')
    }
  }

  const handleDeleteGroup = async () => {
    if (!confirm('确定要删除这个小组吗?此操作不可撤销!')) return
    
    try {
      await api.deleteStudyGroup(groupId!)
      navigate('/groups')
    } catch (error: any) {
      alert(error.message || '删除小组失败')
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('确定要移除此成员吗?')) return
    
    try {
      await api.manageStudyGroupMember(groupId!, memberId, 'remove')
      await loadMembers()
      await loadGroupDetails()
    } catch (error: any) {
      alert(error.message || '移除成员失败')
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">加载中...</p>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">小组不存在</p>
        <Link to="/groups" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
          返回小组列表
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{group.name}</h1>
              <span className={`px-3 py-1 text-sm rounded-full ${
                group.is_public 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {group.is_public ? '🌍 公开' : '🔒 私密'}
              </span>
            </div>
            <p className="text-gray-600 mb-4">{group.description || '暂无描述'}</p>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>👥 {group.member_count}/{group.max_members || '∞'} 成员</span>
              <span>📅 创建于 {new Date(group.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            {!isMember ? (
              <button
                onClick={handleJoinGroup}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                加入小组
              </button>
            ) : !isOwner ? (
              <>
                <button
                  disabled
                  className="px-6 py-2 bg-gray-100 text-gray-500 rounded-lg cursor-not-allowed font-medium"
                >
                  ✓ 已加入
                </button>
                <button
                  onClick={handleLeaveGroup}
                  className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  离开小组
                </button>
              </>
            ) : null}
            
            {isOwner && (
              <>
                <Link
                  to={`/groups/${groupId}/edit`}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  编辑
                </Link>
                <button
                  onClick={handleDeleteGroup}
                  className="px-6 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors font-medium"
                >
                  删除
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">成员列表 ({members.length})</h2>
        
        {members.length === 0 ? (
          <p className="text-gray-600 text-center py-8">暂无成员</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {member.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.username}</p>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 text-xs rounded-full ${
                    member.role === 'owner' 
                      ? 'bg-purple-100 text-purple-700'
                      : member.role === 'admin'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {member.role === 'owner' ? '👑 创建者' : 
                     member.role === 'admin' ? '⭐ 管理员' : '👤 成员'}
                  </span>
                  
                  {isOwner && member.id !== String(user?.id) && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      移除
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Group Chat Section */}
      {isMember && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">小组聊天</h2>
          <Link
            to={`/chat?group=${groupId}`}
            className="block w-full py-3 bg-indigo-50 text-indigo-600 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-center"
          >
            💬 进入小组聊天室
          </Link>
        </div>
      )}
    </div>
  )
}

export default GroupDetailPage
