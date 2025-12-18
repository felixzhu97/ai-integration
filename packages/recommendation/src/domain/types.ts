/**
 * 行为类型
 */
export type BehaviorType = "view" | "click" | "like" | "purchase" | "share";

/**
 * 推荐类型
 */
export type RecommendationType = "popular" | "user" | "hybrid";

/**
 * 用户行为接口
 */
export interface UserBehavior {
  /** 用户ID */
  userId: string;
  /** 物品ID */
  itemId: string;
  /** 行为类型 */
  behaviorType: BehaviorType;
  /** 时间戳 */
  timestamp: number;
  /** 元数据 */
  metadata?: Record<string, unknown>;
}

/**
 * 推荐选项
 */
export interface RecommendationOptions {
  /** 推荐数量限制 */
  limit?: number;
  /** 排除的物品ID列表 */
  excludeItemIds?: string[];
}

/**
 * 推荐结果
 */
export interface RecommendationResult {
  /** 物品ID */
  itemId: string;
  /** 推荐分数 */
  score: number;
  /** 推荐原因 */
  reason?: string;
}

/**
 * 物品统计信息
 */
export interface ItemStats {
  /** 物品ID */
  itemId: string;
  /** 总行为次数 */
  totalBehaviors: number;
  /** 各类型行为次数 */
  behaviorCounts: Record<BehaviorType, number>;
  /** 加权分数 */
  weightedScore: number;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  /** 用户ID */
  userId: string;
  /** 总行为次数 */
  totalBehaviors: number;
  /** 交互过的物品数量 */
  itemCount: number;
  /** 各类型行为次数 */
  behaviorCounts: Record<BehaviorType, number>;
}



