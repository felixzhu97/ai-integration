import type { UserBehavior, UserStats, ItemStats } from "../domain/types";
import { MemoryStorage } from "../infrastructure/storage";

/**
 * 用户行为追踪器
 * 负责记录和查询用户行为数据
 */
export class UserBehaviorTracker {
  private storage: MemoryStorage;

  constructor() {
    this.storage = new MemoryStorage();
  }

  /**
   * 添加用户行为
   */
  addBehavior(behavior: UserBehavior): void {
    this.storage.addBehavior(behavior);
  }

  /**
   * 获取用户的所有行为
   */
  getUserBehaviors(userId: string): UserBehavior[] {
    return this.storage.getUserBehaviors(userId);
  }

  /**
   * 获取物品的所有行为
   */
  getItemBehaviors(itemId: string): UserBehavior[] {
    return this.storage.getItemBehaviors(itemId);
  }

  /**
   * 获取所有行为
   */
  getAllBehaviors(): UserBehavior[] {
    return this.storage.getAllBehaviors();
  }

  /**
   * 获取用户统计信息
   */
  getUserStats(userId: string): UserStats | null {
    return this.storage.getUserStats(userId);
  }

  /**
   * 获取物品统计信息
   */
  getItemStats(itemId: string): ItemStats | null {
    return this.storage.getItemStats(itemId);
  }

  /**
   * 获取所有物品统计信息
   */
  getAllItemStats(): ItemStats[] {
    return this.storage.getAllItemStats();
  }

  /**
   * 获取用户-物品矩阵
   */
  getUserItemMatrix(): Map<string, Map<string, number>> {
    return this.storage.getUserItemMatrix();
  }

  /**
   * 获取所有用户ID
   */
  getAllUserIds(): string[] {
    return this.storage.getAllUserIds();
  }

  /**
   * 获取所有物品ID
   */
  getAllItemIds(): string[] {
    return this.storage.getAllItemIds();
  }

  /**
   * 获取存储统计信息
   */
  getStats(): {
    totalBehaviors: number;
    totalUsers: number;
    totalItems: number;
  } {
    return this.storage.getStats();
  }

  /**
   * 清空所有数据
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * 获取存储实例（用于高级操作）
   */
  getStorage(): MemoryStorage {
    return this.storage;
  }
}

