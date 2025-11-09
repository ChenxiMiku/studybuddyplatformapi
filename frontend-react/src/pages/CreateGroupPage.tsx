import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

const CreateGroupPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    max_members: '',
    is_public: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('请输入小组名称')
      return
    }

    try {
      setLoading(true)
      const data: any = {
        name: formData.name.trim(),
        is_public: formData.is_public
      }

      if (formData.description.trim()) {
        data.description = formData.description.trim()
      }

      if (formData.max_members) {
        data.max_members = parseInt(formData.max_members)
      }

      const response = await api.createStudyGroup(data)
      navigate(`/groups/${response.data.id}`)
    } catch (error: any) {
      setError(error.message || '创建小组失败')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">创建学习小组</h1>
        <p className="text-gray-600 mb-6">填写以下信息创建一个新的学习小组</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              小组名称 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="例如: 算法学习小组"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              小组描述
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="简单介绍一下这个小组的目标和活动..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Max Members */}
          <div>
            <label htmlFor="max_members" className="block text-sm font-medium text-gray-700 mb-2">
              最大成员数
            </label>
            <input
              type="number"
              id="max_members"
              name="max_members"
              value={formData.max_members}
              onChange={handleChange}
              placeholder="留空表示不限制"
              min="2"
              max="1000"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="mt-1 text-sm text-gray-500">设置小组可容纳的最大成员数量</p>
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              小组类型
            </label>
            <div className="space-y-3">
              <label className="flex items-start space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="is_public"
                  checked={formData.is_public === true}
                  onChange={() => setFormData(prev => ({ ...prev, is_public: true }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">🌍 公开小组</p>
                  <p className="text-sm text-gray-600">任何人都可以搜索并加入此小组</p>
                </div>
              </label>
              
              <label className="flex items-start space-x-3 p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="is_public"
                  checked={formData.is_public === false}
                  onChange={() => setFormData(prev => ({ ...prev, is_public: false }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-gray-900">🔒 私密小组</p>
                  <p className="text-sm text-gray-600">只有受邀请的用户才能加入此小组</p>
                </div>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '创建中...' : '创建小组'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/groups')}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroupPage
