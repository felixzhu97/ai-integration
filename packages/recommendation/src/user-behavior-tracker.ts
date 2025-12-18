import type {
  UserBehavior,
  BehaviorType,
  BehaviorStats,
  ItemPopularity,
} from "./types.js";

/**
 * 用户行为追踪器
 * 使用内存存储用户行为数据
 */
export class UserBehaviorTracker {
  /** 存储所有用户行为数据 */
  private behaviors: UserBehavior[] = [];

  /** 用户行为索引：userId -> behaviors[] */
  private userIndex: Map<string, UserBehavior[]> = new Map();

  /** 物品行为索引：itemId -> behaviors[] */
  private itemIndex: Map<string, UserBehavior[]> = new Map();

  /** 用户-物品行为索引：userId-itemId -> behaviors[] */
  private userItemIndex: Map<string, UserBehavior[]> = new Map();

  /**
   * 添加用户行为
   */
  addBehavior(behavior: UserBehavior): void {
    // 验证行为数据
    if (!behavior.userId || !behavior.itemId || !behavior.behaviorType) {
      throw new Error("用户行为数据不完整");
    }

    // 设置时间戳（如果未提供）
    if (!behavior.timestamp) {
      behavior.timestamp = Date.now();
    }

    // 添加到主列表
    this.behaviors.push(behavior);

    // 更新用户索引
    const userBehaviors = this.userIndex.get(behavior.userId) || [];
    userBehaviors.push(behavior);
    this.userIndex.set(behavior.userId, userBehaviors);

    // 更新物品索引
    const itemBehaviors = this.itemIndex.get(behavior.itemId) || [];
    itemBehaviors.push(behavior);
    this.itemIndex.set(behavior.itemId, itemBehaviors);

    // 更新用户-物品索引
    const userItemKey = `${behavior.userId}-${behavior.itemId}`;
    const userItemBehaviors = this.userItemIndex.get(userItemKey) || [];
    userItemBehaviors.push(behavior);
    this.userItemIndex.set(userItemKey, userItemBehaviors);
  }

  /**
   * 批量添加用户行为
   */
  addBehaviors(behaviors: UserBehavior[]): void {
    behaviors.forEach((behavior) => this.addBehavior(behavior));
  }

  /**
   * 获取用户的所有行为
   */
  getUserBehaviors(userId: string): UserBehavior[] {
    return this.userIndex.get(userId) || [];
  }

  /**
   * 获取物品的所有行为
   */
  getItemBehaviors(itemId: string): UserBehavior[] {
    return this.itemIndex.get(itemId) || [];
  }

  /**
   * 获取用户对特定物品的行为
   */
  getUserItemBehaviors(userId: string, itemId: string): UserBehavior[] {
    const key = `${userId}-${itemId}`;
    return this.userItemIndex.get(key) || [];
  }

  /**
   * 根据行为类型筛选行为
   */
  filterBehaviorsByType(
    behaviors: UserBehavior[],
    behaviorType: BehaviorType
  ): UserBehavior[] {
    return behaviors.filter((b) => b.behaviorType === behaviorType);
  }

  /**
   * 获取用户行为统计
   */
  getUserBehaviorStats(userId: string, itemId: string): BehaviorStats | null {
    const behaviors = this.getUserItemBehaviors(userId, itemId);
    if (behaviors.length === 0) {
      return null;
    }

    const behaviorCounts: Record<BehaviorType, number> = {
      view: 0,
      click: 0,
      like: 0,
      purchase: 0,
      share: 0,
    };

    let lastInteractionTime = 0;

    behaviors.forEach((behavior) => {
      behaviorCounts[behavior.behaviorType]++;
      if (behavior.timestamp > lastInteractionTime) {
        lastInteractionTime = behavior.timestamp;
      }
    });

    return {
      userId,
      itemId,
      behaviorCounts,
      lastInteractionTime,
      totalInteractions: behaviors.length,
    };
  }

  /**
   * 获取用户交互过的所有物品ID
   */
  getUserInteractedItems(userId: string): string[] {
    const behaviors = this.getUserBehaviors(userId);
    const itemSet = new Set<string>();
    behaviors.forEach((behavior) => itemSet.add(behavior.itemId));
    return Array.from(itemSet);
  }

  /**
   * 获取物品热度统计
   */
  getItemPopularity(itemId: string): ItemPopularity | null {
    const behaviors = this.getItemBehaviors(itemId);
    if (behaviors.length === 0) {
      return null;
    }

    const stats = {
      totalViews: 0,
      totalClicks: 0,
      totalLikes: 0,
      totalPurchases: 0,
      totalShares: 0,
      lastInteractionTime: 0,
    };

    behaviors.forEach((behavior) => {
      switch (behavior.behaviorType) {
        case "view":
          stats.totalViews++;
          break;
        case "click":
          stats.totalClicks++;
          break;
        case "like":
          stats.totalLikes++;
          break;
        case "purchase":
          stats.totalPurchases++;
          break;
        case "share":
          stats.totalShares++;
          break;
      }

      if (behavior.timestamp > stats.lastInteractionTime) {
        stats.lastInteractionTime = behavior.timestamp;
      }
    });

    // 计算热度得分（加权计算）
    const popularityScore =
      stats.totalViews * 0.1 +
      stats.totalClicks * 0.3 +
      stats.totalLikes * 0.4 +
      stats.totalPurchases * 1.0 +
      stats.totalShares * 0.5;

    return {
      itemId,
      ...stats,
      popularityScore,
    };
  }

  /**
   * 获取所有物品的热度统计
   */
  getAllItemsPopularity(): ItemPopularity[] {
    const itemSet = new Set<string>();
    this.behaviors.forEach((behavior) => itemSet.add(behavior.itemId));

    const popularities: ItemPopularity[] = [];
    itemSet.forEach((itemId) => {
      const popularity = this.getItemPopularity(itemId);
      if (popularity) {
        popularities.push(popularity);
      }
    });

    return popularities;
  }

  /**
   * 清空所有行为数据
   */
  clear(): void {
    this.behaviors = [];
    this.userIndex.clear();
    this.itemIndex.clear();
    this.userItemIndex.clear();
  }

  /**
   * 获取所有行为数据（用于调试）
   */
  getAllBehaviors(): UserBehavior[] {
    return [...this.behaviors];
  }

  /**
   * 获取行为总数
   */
  getTotalBehaviorsCount(): number {
    return this.behaviors.length;
  }
}
