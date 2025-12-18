import { NextRequest, NextResponse } from "next/server";
import {
  RecommendationEngine,
  UserBehaviorTracker,
  type UserBehavior,
  type RecommendationOptions,
} from "@repo/recommendation";

// 创建全局推荐引擎实例（内存存储）
// 在生产环境中，应该使用持久化存储或数据库
let recommendationEngine: RecommendationEngine | null = null;

function getRecommendationEngine(): RecommendationEngine {
  if (!recommendationEngine) {
    recommendationEngine = new RecommendationEngine();
  }
  return recommendationEngine;
}

/**
 * GET /api/recommendation
 * 获取推荐结果
 * 
 * 查询参数:
 * - userId: 用户ID（可选，用于个性化推荐）
 * - type: 推荐类型 (popular|user|hybrid，默认hybrid)
 * - limit: 推荐数量（默认10）
 * - excludeItemIds: 排除的物品ID（逗号分隔）
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || undefined;
    const type = searchParams.get("type") || "hybrid";
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const excludeItemIds = searchParams
      .get("excludeItemIds")
      ?.split(",")
      .filter((id) => id.trim()) || [];

    const engine = getRecommendationEngine();
    const options: RecommendationOptions = {
      limit,
      excludeItemIds,
    };

    let recommendations;

    switch (type) {
      case "popular":
        recommendations = engine.getPopularRecommendations(options);
        break;
      case "user":
        if (!userId) {
          return NextResponse.json(
            { error: "用户ID是必需的（type=user时）" },
            { status: 400 }
          );
        }
        recommendations = engine.getUserBasedRecommendations(userId, options);
        break;
      case "hybrid":
        if (!userId) {
          // 如果没有用户ID，返回热门推荐
          recommendations = engine.getPopularRecommendations(options);
        } else {
          recommendations = engine.getHybridRecommendations(userId, options);
        }
        break;
      default:
        return NextResponse.json(
          { error: `不支持的推荐类型: ${type}` },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      type,
      recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    console.error("推荐系统错误:", error);
    return NextResponse.json(
      { error: "获取推荐失败，请重试" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/recommendation
 * 记录用户行为
 * 
 * 请求体:
 * {
 *   userId: string,
 *   itemId: string,
 *   behaviorType: "view" | "click" | "like" | "purchase" | "share",
 *   metadata?: Record<string, unknown>
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, itemId, behaviorType, metadata } = body;

    // 验证必需字段
    if (!userId || !itemId || !behaviorType) {
      return NextResponse.json(
        {
          error: "缺少必需字段: userId, itemId, behaviorType",
        },
        { status: 400 }
      );
    }

    // 验证行为类型
    const validBehaviorTypes = ["view", "click", "like", "purchase", "share"];
    if (!validBehaviorTypes.includes(behaviorType)) {
      return NextResponse.json(
        {
          error: `无效的行为类型: ${behaviorType}`,
        },
        { status: 400 }
      );
    }

    const behavior: UserBehavior = {
      userId,
      itemId,
      behaviorType,
      timestamp: Date.now(),
      metadata,
    };

    const engine = getRecommendationEngine();
    engine.getTracker().addBehavior(behavior);

    return NextResponse.json({
      success: true,
      message: "用户行为已记录",
      behavior,
    });
  } catch (error) {
    console.error("记录用户行为错误:", error);
    return NextResponse.json(
      { error: "记录用户行为失败，请重试" },
      { status: 500 }
    );
  }
}

