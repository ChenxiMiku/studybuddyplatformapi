import { create } from 'zustand'

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

interface GroupState {
  groups: StudyGroup[]
  currentGroup: StudyGroup | null
  loading: boolean
  setGroups: (groups: StudyGroup[]) => void
  setCurrentGroup: (group: StudyGroup | null) => void
  addGroup: (group: StudyGroup) => void
  updateGroup: (groupId: string, updates: Partial<StudyGroup>) => void
  removeGroup: (groupId: string) => void
  setLoading: (loading: boolean) => void
}

export const useGroupStore = create<GroupState>((set) => ({
  groups: [],
  currentGroup: null,
  loading: false,
  
  setGroups: (groups) => set({ groups }),
  
  setCurrentGroup: (group) => set({ currentGroup: group }),
  
  addGroup: (group) => set((state) => ({
    groups: [...state.groups, group]
  })),
  
  updateGroup: (groupId, updates) => set((state) => ({
    groups: state.groups.map(g => 
      g.id === groupId ? { ...g, ...updates } : g
    ),
    currentGroup: state.currentGroup?.id === groupId 
      ? { ...state.currentGroup, ...updates }
      : state.currentGroup
  })),
  
  removeGroup: (groupId) => set((state) => ({
    groups: state.groups.filter(g => g.id !== groupId),
    currentGroup: state.currentGroup?.id === groupId ? null : state.currentGroup
  })),
  
  setLoading: (loading) => set({ loading })
}))
