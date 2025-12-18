import type { BehaviorType } from "./types";

/**
 * 行为类型权重配置
 * 权重越高，表示该行为对推荐的影响越大
 */
export const BEHAVIOR_WEIGHTS: Record<BehaviorType, number> = {
  view: 1,
  click: 2,
  like: 3,
  purchase: 5,
  share: 4,
} as const;

/**
 * 默认配置
 */
export const DEFAULT_CONFIG = {
  /** 默认推荐数量 */
  DEFAULT_RECOMMENDATION_LIMIT: 10,
  /** 热门推荐最小行为次数 */
  MIN_POPULAR_BEHAVIORS: 1,
  /** 协同过滤最小相似用户数 */
  MIN_SIMILAR_USERS: 1,
  /** 混合推荐中热门推荐的权重 */
  HYBRID_POPULAR_WEIGHT: 0.3,
  /** 混合推荐中个性化推荐的权重 */
  HYBRID_PERSONAL_WEIGHT: 0.7,
  /** 相似度阈值 */
  SIMILARITY_THRESHOLD: 0.1,
} as const;

