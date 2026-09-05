export type NodeStatus = 'COMPLETED' | 'CURRENT' | 'LOCKED';

export type NodeType = 'LESSON' | 'VIDEO' | 'QUIZ' | 'SPEAKING' | 'CHEST' | 'TROPHY';

export interface LessonNodeData {
  id: string;
  title: string;
  description?: string | null;
  videoUrl?: string | null;
  content?: string | null;
  order: number;
  isFree?: boolean;
  status: NodeStatus;
  type: NodeType;
  xpReward: number;
  durationMinutes: number;
  slug: string;
  moduleId: string;
}

export interface UnitData {
  id: string;
  title: string;
  description?: string | null;
  order: number;
  colorTheme: 'emerald' | 'blue' | 'purple' | 'amber' | 'rose';
  lessons: LessonNodeData[];
  completedCount: number;
  totalCount: number;
}

export interface QuestData {
  id: string;
  title: string;
  target: number;
  current: number;
  xpReward: number;
  icon: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  xp: number;
  isCurrentUser?: boolean;
}
