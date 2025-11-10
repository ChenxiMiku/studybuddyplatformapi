import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'

interface Course {
  id: number
  course_name: string
  created_at: string
}

interface Skill {
  id: number
  skill_id: number
  skill_name: string
  proficiency_level: string | null
  created_at: string
}

interface Availability {
  id: number
  weekday: number
  time_slot: string
  created_at: string
}

interface Group {
  id: number
  group_id: number
  group_name: string
  group_description: string | null
  role: string
  status: string
  joined_at: string
}

interface UserProfile {
  id: number
  username: string
  email: string
  bio?: string | null
  avatar_url?: string | null
  goals?: string | null
  study_preference?: string | null
  created_at: string
}

interface ProfileData {
  user: UserProfile
  courses: Course[]
  skills: Skill[]
  availability: Availability[]
  groups: Group[]
  stats: {
    groups_count: number
    messages_count: number
    average_rating: number | null
  }
}

const ProfilePage = () => {
  const { t } = useTranslation()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const response = await api.getUserProfile()
      setProfileData(response.data)
    } catch (error) {
      console.error('加载用户资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const weekdayNames = [
    t('common.sunday', 'Sunday'),
    t('common.monday', 'Monday'),
    t('common.tuesday', 'Tuesday'),
    t('common.wednesday', 'Wednesday'),
    t('common.thursday', 'Thursday'),
    t('common.friday', 'Friday'),
    t('common.saturday', 'Saturday')
  ]

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">{t('common.loading', 'Loading...')}</p>
      </div>
    )
  }

  if (!profileData) {
    return (
      <div className="text-center py-12">
        <p className="text-xl text-gray-600">{t('errors.loadProfileFailed', 'Failed to load profile')}</p>
      </div>
    )
  }

  const { user, courses, skills, availability, groups, stats } = profileData

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
              {user.avatar_url ? (
                <img 
                  src={user.avatar_url} 
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-indigo-600 font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            {/* Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">
                {user.username}
              </h1>
              <p className="text-gray-600 mb-3">{user.email}</p>
              {user.bio && (
                <p className="text-gray-700 max-w-xl">{user.bio}</p>
              )}
              {user.goals && (
                <p className="text-sm text-gray-600 mt-2">
                  🎯 {t('profile.goals', 'Goals')}: {user.goals}
                </p>
              )}
              {user.study_preference && (
                <p className="text-sm text-gray-600 mt-1">
                  � {t('profile.studyPreference', 'Study Preference')}: {user.study_preference}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                📅 {t('profile.joinedOn', 'Joined on')} {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <Link
            to="/profile/edit"
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            {t('profile.editProfile', 'Edit Profile')}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg text-2xl">
              👥
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.groups_count}</p>
              <p className="text-sm text-gray-600">{t('profile.groupsJoined', 'Groups Joined')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-lg text-2xl">
              💬
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.messages_count}</p>
              <p className="text-sm text-gray-600">{t('profile.messagesSent', 'Messages Sent')}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-yellow-100 rounded-lg text-2xl">
              ⭐
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.average_rating?.toFixed(1) || '0.0'}
              </p>
              <p className="text-sm text-gray-600">{t('profile.averageRating', 'Average Rating')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Courses */}
      {courses.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('profile.myCourses', 'My Courses')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {courses.map((course) => (
              <div key={course.id} className="p-3 bg-indigo-50 rounded-lg">
                <p className="font-medium text-indigo-900">{course.course_name}</p>
                <p className="text-xs text-indigo-600 mt-1">
                  {t('profile.addedOn', 'Added on')} {new Date(course.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('profile.mySkills', 'My Skills')}</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div key={skill.id} className="px-4 py-2 bg-green-50 text-green-700 rounded-full border border-green-200">
                <span className="font-medium">{skill.skill_name}</span>
                {skill.proficiency_level && (
                  <span className="ml-2 text-xs text-green-600">({skill.proficiency_level})</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Availability */}
      {availability.length > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('profile.availability', 'Availability')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {availability.map((slot) => (
              <div key={slot.id} className="p-3 bg-purple-50 rounded-lg">
                <p className="font-medium text-purple-900">
                  {weekdayNames[slot.weekday]} - {slot.time_slot}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* My Groups */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{t('profile.myGroups', 'My Groups')}</h2>
          <Link 
            to="/groups" 
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            {t('common.viewAll', 'View All')} →
          </Link>
        </div>
        {groups.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            <p>{t('profile.noGroups', 'You haven\'t joined any groups yet')}</p>
            <Link
              to="/groups"
              className="inline-block mt-4 px-6 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors font-medium"
            >
              {t('groups.browseGroups', 'Browse Groups')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.group_id}`}
                className="p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900">{group.group_name}</h3>
                    {group.group_description && (
                      <p className="text-sm text-blue-700 mt-1 line-clamp-2">
                        {group.group_description}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs px-2 py-1 bg-blue-200 text-blue-800 rounded">
                        {group.role}
                      </span>
                      <span className="text-xs px-2 py-1 bg-green-200 text-green-800 rounded">
                        {group.status}
                      </span>
                    </div>
                    <p className="text-xs text-blue-600 mt-2">
                      {t('profile.joinedOn', 'Joined on')} {new Date(group.joined_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfilePage
