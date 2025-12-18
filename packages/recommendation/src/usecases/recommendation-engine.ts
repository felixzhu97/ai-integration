import type {
  RecommendationResult,
  RecommendationOptions,
} from "../domain/types";
import { DEFAULT_CONFIG } from "../domain/models";
import { UserBehaviorTracker } from "./behavior-tracker";
import { SimilarityCalculator } from "../infrastructure/similarity";

/**
 * 推荐引擎
 * 实现多种推荐算法
 */
export class RecommendationEngine {
  private tracker: UserBehaviorTracker;

  constructor(tracker?: UserBehaviorTracker) {
    this.tracker = tracker || new UserBehaviorTracker();
  }

  /**
   * 获取行为追踪器
   */
  getTracker(): UserBehaviorTracker {
    return this.tracker;
  }

  /**
   * 获取热门推荐
   * 基于物品的全局行为统计
   */
  getPopularRecommendations(
    options: RecommendationOptions = {}
  ): RecommendationResult[] {
    const limit = options.limit || DEFAULT_CONFIG.DEFAULT_RECOMMENDATION_LIMIT;
    const excludeItemIds = new Set(options.excludeItemIds || []);

    const allItemStats = this.tracker.getAllItemStats();

    // 按加权分数排序
    const sortedItems = allItemStats
      .filter(
        (stats) =>
          stats.totalBehaviors >= DEFAULT_CONFIG.MIN_POPULAR_BEHAVIORS &&
          !excludeItemIds.has(stats.itemId)
      )
      .sort((a, b) => b.weightedScore - a.weightedScore)
      .slice(0, limit);

    return sortedItems.map((stats) => ({
      itemId: stats.itemId,
      score: stats.weightedScore,
      reason: `热门物品，共 ${stats.totalBehaviors} 次交互`,
    }));
  }

  /**
   * 获取基于用户的协同过滤推荐
   * 找到相似用户，推荐他们喜欢的物品
   */
  getUserBasedRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationResult[] {
    const limit = options.limit || DEFAULT_CONFIG.DEFAULT_RECOMMENDATION_LIMIT;
    const excludeItemIds = new Set(options.excludeItemIds || []);

    const userItemMatrix = this.tracker.getUserItemMatrix();
    const targetUserItems = userItemMatrix.get(userId);

    if (!targetUserItems || targetUserItems.size === 0) {
      // 如果用户没有行为历史，返回热门推荐
      return this.getPopularRecommendations(options);
    }

    // 计算与所有其他用户的相似度
    const userSimilarities: Array<{ userId: string; similarity: number }> = [];

    for (const [otherUserId, otherUserItems] of userItemMatrix.entries()) {
      if (otherUserId === userId) {
        continue;
      }

      const similarity = SimilarityCalculator.cosineSimilarity(
        targetUserItems,
        otherUserItems
      );

      if (similarity >= DEFAULT_CONFIG.SIMILARITY_THRESHOLD) {
        userSimilarities.push({ userId: otherUserId, similarity });
      }
    }

    // 按相似度排序
    userSimilarities.sort((a, b) => b.similarity - a.similarity);

    // 收集推荐物品及其分数
    const itemScores = new Map<string, number>();

    for (const { userId: similarUserId, similarity } of userSimilarities.slice(
      0,
      DEFAULT_CONFIG.MIN_SIMILAR_USERS + 10
    )) {
      const similarUserItems = userItemMatrix.get(similarUserId);
      if (!similarUserItems) continue;

      for (const [itemId, score] of similarUserItems.entries()) {
        // 跳过用户已经交互过的物品
        if (targetUserItems.has(itemId)) {
          continue;
        }

        // 跳过排除的物品
        if (excludeItemIds.has(itemId)) {
          continue;
        }

        const currentScore = itemScores.get(itemId) || 0;
        itemScores.set(itemId, currentScore + score * similarity);
      }
    }

    // 转换为推荐结果并排序
    const recommendations: RecommendationResult[] = Array.from(
      itemScores.entries()
    )
      .map(([itemId, score]) => ({
        itemId,
        score,
        reason: `基于相似用户的偏好`,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 如果推荐结果不足，补充热门推荐
    if (recommendations.length < limit) {
      const popularItems = this.getPopularRecommendations({
        limit: limit - recommendations.length,
        excludeItemIds: [
          ...excludeItemIds,
          ...recommendations.map((r) => r.itemId),
        ],
      });
      recommendations.push(...popularItems);
    }

    return recommendations;
  }

  /**
   * 获取混合推荐
   * 结合热门推荐和个性化推荐
   */
  getHybridRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationResult[] {
    const limit = options.limit || DEFAULT_CONFIG.DEFAULT_RECOMMENDATION_LIMIT;
    const excludeItemIds = new Set(options.excludeItemIds || []);

    // 获取热门推荐
    const popularRecommendations = this.getPopularRecommendations({
      limit: limit * 2,
      excludeItemIds: Array.from(excludeItemIds),
    });

    // 获取个性化推荐
    const personalRecommendations = this.getUserBasedRecommendations(userId, {
      limit: limit * 2,
      excludeItemIds: Array.from(excludeItemIds),
    });

    // 合并推荐结果
    const itemScores = new Map<string, { score: number; reason: string }>();

    // 添加热门推荐（加权）
    for (const rec of popularRecommendations) {
      const weightedScore =
        rec.score * DEFAULT_CONFIG.HYBRID_POPULAR_WEIGHT;
      itemScores.set(rec.itemId, {
        score: weightedScore,
        reason: rec.reason || "热门推荐",
      });
    }

    // 添加个性化推荐（加权并合并）
    for (const rec of personalRecommendations) {
      const existing = itemScores.get(rec.itemId);
      if (existing) {
        existing.score += rec.score * DEFAULT_CONFIG.HYBRID_PERSONAL_WEIGHT;
        existing.reason = "混合推荐（热门+个性化）";
      } else {
        itemScores.set(rec.itemId, {
          score: rec.score * DEFAULT_CONFIG.HYBRID_PERSONAL_WEIGHT,
          reason: rec.reason || "个性化推荐",
        });
      }
    }

    // 转换为推荐结果并排序
    const recommendations: RecommendationResult[] = Array.from(
      itemScores.entries()
    )
      .map(([itemId, { score, reason }]) => ({
        itemId,
        score,
        reason,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return recommendations;
  }

  /**
   * 获取基于物品的协同过滤推荐
   * 找到相似物品，推荐给用户
   */
  getItemBasedRecommendations(
    userId: string,
    options: RecommendationOptions = {}
  ): RecommendationResult[] {
    const limit = options.limit || DEFAULT_CONFIG.DEFAULT_RECOMMENDATION_LIMIT;
    const excludeItemIds = new Set(options.excludeItemIds || []);

    const userBehaviors = this.tracker.getUserBehaviors(userId);
    if (userBehaviors.length === 0) {
      return this.getPopularRecommendations(options);
    }

    // 获取用户交互过的物品
    const userItems = new Set(userBehaviors.map((b) => b.itemId));
    const userItemMatrix = this.tracker.getUserItemMatrix();
    const targetUserItems = userItemMatrix.get(userId) || new Map();

    // 计算物品相似度
    const allItemIds = this.tracker.getAllItemIds();
    const itemScores = new Map<string, number>();

    for (const userItemId of userItems) {
      const userItemBehaviors = this.tracker.getItemBehaviors(userItemId);
      const userItemVector = new Map<string, number>();

      // 构建物品向量（基于用户交互）
      for (const behavior of userItemBehaviors) {
        const current = userItemVector.get(behavior.userId) || 0;
        userItemVector.set(behavior.userId, current + 1);
      }

      // 与其他物品计算相似度
      for (const itemId of allItemIds) {
        if (userItems.has(itemId) || excludeItemIds.has(itemId)) {
          continue;
        }

        const itemBehaviors = this.tracker.getItemBehaviors(itemId);
        const itemVector = new Map<string, number>();

        for (const behavior of itemBehaviors) {
          const current = itemVector.get(behavior.userId) || 0;
          itemVector.set(behavior.userId, current + 1);
        }

        const similarity = SimilarityCalculator.cosineSimilarity(
          userItemVector,
          itemVector
        );

        if (similarity > 0) {
          const userScore = targetUserItems.get(userItemId) || 0;
          const currentScore = itemScores.get(itemId) || 0;
          itemScores.set(itemId, currentScore + similarity * userScore);
        }
      }
    }

    // 转换为推荐结果并排序
    const recommendations: RecommendationResult[] = Array.from(
      itemScores.entries()
    )
      .map(([itemId, score]) => ({
        itemId,
        score,
        reason: "基于相似物品的推荐",
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    // 如果推荐结果不足，补充热门推荐
    if (recommendations.length < limit) {
      const popularItems = this.getPopularRecommendations({
        limit: limit - recommendations.length,
        excludeItemIds: [
          ...excludeItemIds,
          ...recommendations.map((r) => r.itemId),
        ],
      });
      recommendations.push(...popularItems);
    }

    return recommendations;
  }
}

