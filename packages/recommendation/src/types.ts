/**
 * 用户行为类型
 */
export type BehaviorType = "view" | "click" | "like" | "purchase" | "share";

/**
 * 用户行为数据
 */
export interface UserBehavior {
  /** 用户ID */
  userId: string;
  /** 物品ID */
  itemId: string;
  /** 行为类型 */
  behaviorType: BehaviorType;
  /** 时间戳（毫秒） */
  timestamp: number;
  /** 额外元数据（可选） */
  metadata?: Record<string, unknown>;
}

/**
 * 推荐项
 */
export interface RecommendationItem {
  /** 物品ID */
  itemId: string;
  /** 推荐得分（0-1之间，越高越推荐） */
  score: number;
  /** 推荐原因 */
  reason: string;
  /** 额外信息（可选） */
  metadata?: Record<string, unknown>;
}

/**
 * 推荐配置选项
 */
export interface RecommendationOptions {
  /** 推荐数量限制 */
  limit?: number;
  /** 排除的物品ID列表 */
  excludeItemIds?: string[];
  /** 最小得分阈值 */
  minScore?: number;
  /** 是否包含已交互的物品 */
  includeInteracted?: boolean;
}

/**
 * 用户行为统计
 */
export interface BehaviorStats {
  /** 用户ID */
  userId: string;
  /** 物品ID */
  itemId: string;
  /** 行为类型统计 */
  behaviorCounts: Record<BehaviorType, number>;
  /** 最后交互时间 */
  lastInteractionTime: number;
  /** 总交互次数 */
  totalInteractions: number;
}

/**
 * 物品热度统计
 */
export interface ItemPopularity {
  /** 物品ID */
  itemId: string;
  /** 总访问次数 */
  totalViews: number;
  /** 总点击次数 */
  totalClicks: number;
  /** 总点赞次数 */
  totalLikes: number;
  /** 总购买次数 */
  totalPurchases: number;
  /** 总分享次数 */
  totalShares: number;
  /** 热度得分（综合所有行为） */
  popularityScore: number;
  /** 最后交互时间 */
  lastInteractionTime: number;
}
