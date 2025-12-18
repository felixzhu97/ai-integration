import type {
  RecommendationItem,
  RecommendationOptions,
  UserBehavior,
  BehaviorType,
} from "./types";
import { UserBehaviorTracker } from "./user-behavior-tracker";

/**
 * 推荐引擎
 * 提供基于用户行为的推荐算法
 */
export class RecommendationEngine {
  private tracker: UserBehaviorTracker;

  constructor(tracker?: UserBehaviorTracker) {
    this.tracker = tracker || new UserBehaviorTracker();
  }

  /**
   * 获取行为追踪器实例
   */
  getTracker(): UserBehaviorTracker {
    return this.tracker;
  }

  /**
   * 热门度推荐
   * 基于物品被访问/交互的总次数进行推荐
   */
  getPopularRecommendations(
    options: RecommendationOptions = {}
  ): RecommendationItem[] {
    const { limit = 10, excludeItemIds = [], minScore = 0 } = options;

    const allStats = this.tracker.getAllItemsStats();

    // 计算得分：总交互次数作为基础得分
    // 可以给不同行为类型设置权重
    const items = allStats
      .filter((stats) => !excludeItemIds.includes(stats.itemId))
      .map((stats) => {
        // 计算加权得分
        const score = this.calculatePopularityScore(stats);
        return {
          itemId: stats.itemId,
          score,
          reason: `热门物品，共 ${stats.totalInteractions} 次交互`,
        };
      })
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return items;
  }

  /**
   * 基于用户历史的推荐
   * 根据用户历史行为推荐相似物品
   */
  getUserBasedRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationItem[] {
    const { limit = 10, excludeItemIds = [], minScore = 0 } = options;

    // 获取用户交互过的物品
    const userInteractedItems = this.tracker.getUserInteractedItems(userId);

    if (userInteractedItems.length === 0) {
      // 如果用户没有历史行为，返回热门推荐
      return this.getPopularRecommendations(options);
    }

    // 获取用户的行为数据
    const userBehaviors = this.tracker.getUserBehaviors(userId);

    // 找到与用户交互物品相似的其他物品
    // 简单策略：找到与用户交互物品有共同用户的其他物品
    const candidateItems = this.findSimilarItems(
      userInteractedItems,
      excludeItemIds
    );

    // 计算推荐得分
    const recommendations = candidateItems
      .map((itemId) => {
        const score = this.calculateUserBasedScore(userId, itemId, userBehaviors);
        const stats = this.tracker.getItemStats(itemId);
        return {
          itemId,
          score,
          reason: `基于您的浏览历史，与您喜欢的物品相似`,
        };
      })
      .filter((item) => item.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * 混合推荐
   * 结合热门度和用户历史
   */
  getHybridRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationItem[] {
    const { limit = 10 } = options;

    // 获取用户推荐和热门推荐
    const userBased = this.getUserBasedRecommendations(userId, {
      ...options,
      limit: Math.ceil(limit * 0.7), // 70% 基于用户
    });

    const popular = this.getPopularRecommendations({
      ...options,
      excludeItemIds: [
        ...(options.excludeItemIds || []),
        ...userBased.map((item) => item.itemId),
      ],
      limit: Math.ceil(limit * 0.3), // 30% 热门
    });

    // 合并并去重
    const itemMap = new Map<string, RecommendationItem>();

    userBased.forEach((item) => {
      itemMap.set(item.itemId, { ...item, score: item.score * 1.2 }); // 用户推荐加权
    });

    popular.forEach((item) => {
      if (!itemMap.has(item.itemId)) {
        itemMap.set(item.itemId, item);
      }
    });

    return Array.from(itemMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * 计算热门度得分
   */
  private calculatePopularityScore(stats: {
    totalInteractions: number;
    behaviorCounts: Record<BehaviorType, number>;
    lastInteractionTime: number;
  }): number {
    // 基础得分：总交互次数
    let score = stats.totalInteractions;

    // 行为类型权重
    const weights: Record<BehaviorType, number> = {
      view: 1,
      click: 2,
      like: 3,
      purchase: 5,
      share: 4,
    };

    // 加权计算
    let weightedScore = 0;
    Object.entries(stats.behaviorCounts).forEach(([type, count]) => {
      weightedScore += count * (weights[type as BehaviorType] || 1);
    });

    // 时间衰减：最近交互的物品得分更高
    const now = Date.now();
    const daysSinceLastInteraction =
      (now - stats.lastInteractionTime) / (1000 * 60 * 60 * 24);
    const timeDecay = Math.max(0.5, 1 - daysSinceLastInteraction / 30); // 30天衰减

    return weightedScore * timeDecay;
  }

  /**
   * 找到与用户交互物品相似的其他物品
   */
  private findSimilarItems(
    userInteractedItems: string[],
    excludeItemIds: string[]
  ): string[] {
    // 获取所有与用户交互物品有共同用户的其他物品
    const similarItems = new Set<string>();

    userInteractedItems.forEach((itemId) => {
      const itemBehaviors = this.tracker.getItemBehaviors(itemId);
      const usersWhoInteracted = new Set(
        itemBehaviors.map((b) => b.userId)
      );

      // 找到这些用户还交互了哪些其他物品
      usersWhoInteracted.forEach((userId) => {
        const userItems = this.tracker.getUserInteractedItems(userId);
        userItems.forEach((otherItemId) => {
          if (
            !userInteractedItems.includes(otherItemId) &&
            !excludeItemIds.includes(otherItemId)
          ) {
            similarItems.add(otherItemId);
          }
        });
      });
    });

    return Array.from(similarItems);
  }

  /**
   * 计算基于用户的推荐得分
   */
  private calculateUserBasedScore(
    userId: string,
    itemId: string,
    userBehaviors: UserBehavior[]
  ): number {
    // 找到与用户交互物品有共同用户的数量
    const itemBehaviors = this.tracker.getItemBehaviors(itemId);
    const usersWhoInteracted = new Set(itemBehaviors.map((b) => b.userId));

    // 计算共同用户数量
    const commonUsers = userBehaviors.filter((b) =>
      usersWhoInteracted.has(b.userId)
    ).length;

    // 获取物品统计
    const stats = this.tracker.getItemStats(itemId);

    // 得分 = 共同用户数量 * 物品热门度
    return commonUsers * Math.log(stats.totalInteractions + 1);
  }
}

