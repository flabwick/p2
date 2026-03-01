export type TabType = 'pocket' | 'file' | 'role' | 'welcome'

export interface Tab {
  id: string
  type: TabType
  title: string
}
