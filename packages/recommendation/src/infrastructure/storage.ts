import type {
  UserBehavior,
  ItemStats,
  UserStats,
  BehaviorType,
} from "../domain/types";
import { BEHAVIOR_WEIGHTS } from "../domain/models";

/**
 * 内存存储管理器
 * 用于存储用户行为数据和统计信息
 */
export class MemoryStorage {
  /** 用户行为历史记录 */
  private behaviors: UserBehavior[] = [];

  /** 用户行为索引：userId -> behaviors[] */
  private userBehaviorIndex: Map<string, UserBehavior[]> = new Map();

  /** 物品行为索引：itemId -> behaviors[] */
  private itemBehaviorIndex: Map<string, UserBehavior[]> = new Map();

  /**
   * 添加用户行为
   */
  addBehavior(behavior: UserBehavior): void {
    this.behaviors.push(behavior);

    // 更新用户索引
    const userBehaviors = this.userBehaviorIndex.get(behavior.userId) || [];
    userBehaviors.push(behavior);
    this.userBehaviorIndex.set(behavior.userId, userBehaviors);

    // 更新物品索引
    const itemBehaviors = this.itemBehaviorIndex.get(behavior.itemId) || [];
    itemBehaviors.push(behavior);
    this.itemBehaviorIndex.set(behavior.itemId, itemBehaviors);
  }

  /**
   * 获取用户的所有行为
   */
  getUserBehaviors(userId: string): UserBehavior[] {
    return this.userBehaviorIndex.get(userId) || [];
  }

  /**
   * 获取物品的所有行为
   */
  getItemBehaviors(itemId: string): UserBehavior[] {
    return this.itemBehaviorIndex.get(itemId) || [];
  }

  /**
   * 获取所有行为
   */
  getAllBehaviors(): UserBehavior[] {
    return [...this.behaviors];
  }

  /**
   * 获取物品统计信息
   */
  getItemStats(itemId: string): ItemStats | null {
    const behaviors = this.getItemBehaviors(itemId);
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

    let weightedScore = 0;

    for (const behavior of behaviors) {
      behaviorCounts[behavior.behaviorType]++;
      weightedScore += BEHAVIOR_WEIGHTS[behavior.behaviorType];
    }

    return {
      itemId,
      totalBehaviors: behaviors.length,
      behaviorCounts,
      weightedScore,
    };
  }

  /**
   * 获取所有物品的统计信息
   */
  getAllItemStats(): ItemStats[] {
    const itemStatsMap = new Map<string, ItemStats>();

    for (const behavior of this.behaviors) {
      const existing = itemStatsMap.get(behavior.itemId);
      if (existing) {
        existing.totalBehaviors++;
        existing.behaviorCounts[behavior.behaviorType]++;
        existing.weightedScore += BEHAVIOR_WEIGHTS[behavior.behaviorType];
      } else {
        const behaviorCounts: Record<BehaviorType, number> = {
          view: 0,
          click: 0,
          like: 0,
          purchase: 0,
          share: 0,
        };
        behaviorCounts[behavior.behaviorType] = 1;

        itemStatsMap.set(behavior.itemId, {
          itemId: behavior.itemId,
          totalBehaviors: 1,
          behaviorCounts,
          weightedScore: BEHAVIOR_WEIGHTS[behavior.behaviorType],
        });
      }
    }

    return Array.from(itemStatsMap.values());
  }

  /**
   * 获取用户统计信息
   */
  getUserStats(userId: string): UserStats | null {
    const behaviors = this.getUserBehaviors(userId);
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

    const itemSet = new Set<string>();

    for (const behavior of behaviors) {
      behaviorCounts[behavior.behaviorType]++;
      itemSet.add(behavior.itemId);
    }

    return {
      userId,
      totalBehaviors: behaviors.length,
      itemCount: itemSet.size,
      behaviorCounts,
    };
  }

  /**
   * 获取用户-物品矩阵
   * 返回 Map<userId, Map<itemId, weightedScore>>
   */
  getUserItemMatrix(): Map<string, Map<string, number>> {
    const matrix = new Map<string, Map<string, number>>();

    for (const behavior of this.behaviors) {
      let userMap = matrix.get(behavior.userId);
      if (!userMap) {
        userMap = new Map();
        matrix.set(behavior.userId, userMap);
      }

      const currentScore = userMap.get(behavior.itemId) || 0;
      userMap.set(
        behavior.itemId,
        currentScore + BEHAVIOR_WEIGHTS[behavior.behaviorType]
      );
    }

    return matrix;
  }

  /**
   * 获取所有用户ID
   */
  getAllUserIds(): string[] {
    return Array.from(this.userBehaviorIndex.keys());
  }

  /**
   * 获取所有物品ID
   */
  getAllItemIds(): string[] {
    return Array.from(this.itemBehaviorIndex.keys());
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.behaviors = [];
    this.userBehaviorIndex.clear();
    this.itemBehaviorIndex.clear();
  }

  /**
   * 获取数据统计
   */
  getStats(): {
    totalBehaviors: number;
    totalUsers: number;
    totalItems: number;
  } {
    return {
      totalBehaviors: this.behaviors.length,
      totalUsers: this.userBehaviorIndex.size,
      totalItems: this.itemBehaviorIndex.size,
    };
  }
}

