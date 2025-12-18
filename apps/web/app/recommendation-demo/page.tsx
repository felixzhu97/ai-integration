"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";

type ActiveTab =
  | "popular"
  | "personal"
  | "hybrid"
  | "behavior"
  | "analytics";

interface Recommendation {
  itemId: string;
  score: number;
  reason?: string;
}

interface Behavior {
  userId: string;
  itemId: string;
  behaviorType: "view" | "click" | "like" | "purchase" | "share";
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface Stats {
  totalBehaviors: number;
  totalUsers: number;
  totalItems: number;
}

export default function RecommendationDemoPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("popular");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 热门推荐状态
  const [popularRecommendations, setPopularRecommendations] = useState<
    Recommendation[]
  >([]);
  const [popularLimit, setPopularLimit] = useState(10);

  // 个性化推荐状态
  const [personalRecommendations, setPersonalRecommendations] = useState<
    Recommendation[]
  >([]);
  const [personalUserId, setPersonalUserId] = useState("user1");
  const [personalLimit, setPersonalLimit] = useState(10);

  // 混合推荐状态
  const [hybridRecommendations, setHybridRecommendations] = useState<
    Recommendation[]
  >([]);
  const [hybridUserId, setHybridUserId] = useState("user1");
  const [hybridLimit, setHybridLimit] = useState(10);

  // 行为追踪状态
  const [behaviorUserId, setBehaviorUserId] = useState("user1");
  const [behaviorItemId, setBehaviorItemId] = useState("item1");
  const [behaviorType, setBehaviorType] = useState<
    "view" | "click" | "like" | "purchase" | "share"
  >("view");
  const [behaviors, setBehaviors] = useState<Behavior[]>([]);

  // 数据分析状态
  const [stats, setStats] = useState<Stats | null>(null);

  // 更新统计数据
  useEffect(() => {
    if (behaviors.length > 0) {
      setStats({
        totalBehaviors: behaviors.length,
        totalUsers: new Set(behaviors.map((b) => b.userId)).size,
        totalItems: new Set(behaviors.map((b) => b.itemId)).size,
      });
    } else {
      setStats({
        totalBehaviors: 0,
        totalUsers: 0,
        totalItems: 0,
      });
    }
  }, [behaviors]);

  const loadStats = () => {
    if (behaviors.length > 0) {
      setStats({
        totalBehaviors: behaviors.length,
        totalUsers: new Set(behaviors.map((b) => b.userId)).size,
        totalItems: new Set(behaviors.map((b) => b.itemId)).size,
      });
    } else {
      setStats({
        totalBehaviors: 0,
        totalUsers: 0,
        totalItems: 0,
      });
    }
  };

  const handleGetPopularRecommendations = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/recommendation?type=popular&limit=${popularLimit}`
      );
      const data = await response.json();

      if (data.success) {
        setPopularRecommendations(data.recommendations || []);
      } else {
        throw new Error(data.error || "获取热门推荐失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取热门推荐失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetPersonalRecommendations = async () => {
    if (!personalUserId.trim()) {
      setError("请输入用户ID");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/recommendation?type=user&userId=${encodeURIComponent(
          personalUserId
        )}&limit=${personalLimit}`
      );
      const data = await response.json();

      if (data.success) {
        setPersonalRecommendations(data.recommendations || []);
      } else {
        throw new Error(data.error || "获取个性化推荐失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取个性化推荐失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGetHybridRecommendations = async () => {
    if (!hybridUserId.trim()) {
      setError("请输入用户ID");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/recommendation?type=hybrid&userId=${encodeURIComponent(
          hybridUserId
        )}&limit=${hybridLimit}`
      );
      const data = await response.json();

      if (data.success) {
        setHybridRecommendations(data.recommendations || []);
      } else {
        throw new Error(data.error || "获取混合推荐失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "获取混合推荐失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddBehavior = async () => {
    if (!behaviorUserId.trim() || !behaviorItemId.trim()) {
      setError("请输入用户ID和物品ID");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: behaviorUserId,
          itemId: behaviorItemId,
          behaviorType: behaviorType,
        }),
      });

      const data = await response.json();

      if (data.success) {
        const newBehavior: Behavior = {
          userId: behaviorUserId,
          itemId: behaviorItemId,
          behaviorType: behaviorType,
          timestamp: Date.now(),
        };
        setBehaviors((prev) => [newBehavior, ...prev]);
        setBehaviorItemId(`item${Math.floor(Math.random() * 100)}`);
        loadStats();
      } else {
        throw new Error(data.error || "记录用户行为失败");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "记录用户行为失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString("zh-CN");
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>推荐系统演示</h1>
        <p className={styles.description}>
          体验完整的推荐系统功能：热门推荐、个性化推荐、混合推荐、行为追踪和数据分析
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${
            activeTab === "popular" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("popular")}
        >
          🔥 热门推荐
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "personal" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("personal")}
        >
          👤 个性化推荐
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "hybrid" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("hybrid")}
        >
          🎯 混合推荐
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "behavior" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("behavior")}
        >
          📊 行为追踪
        </button>
        <button
          className={`${styles.tab} ${
            activeTab === "analytics" ? styles.active : ""
          }`}
          onClick={() => setActiveTab("analytics")}
        >
          📈 数据分析
        </button>
      </div>

      <div className={styles.tabContent}>
        {error && (
          <div className={styles.errorCard}>
            <p className={styles.errorMessage}>❌ {error}</p>
          </div>
        )}

        {/* 热门推荐标签页 */}
        {activeTab === "popular" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>热门推荐</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              基于全局用户行为统计，推荐最热门的物品
            </p>
            <div className={styles.inputGroup}>
              <label className={styles.label}>推荐数量</label>
              <input
                className={styles.input}
                type="number"
                value={popularLimit}
                onChange={(e) =>
                  setPopularLimit(parseInt(e.target.value) || 10)
                }
                min={1}
                max={50}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleGetPopularRecommendations}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className={styles.loading}></span>
                ) : (
                  "获取热门推荐"
                )}
              </button>
            </div>
            {popularRecommendations.length > 0 && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>
                  推荐结果 ({popularRecommendations.length} 项)
                </h3>
                <div className={styles.recommendationList}>
                  {popularRecommendations.map((rec, idx) => (
                    <div key={idx} className={styles.recommendationItem}>
                      <div className={styles.recommendationInfo}>
                        <div className={styles.recommendationItemId}>
                          {rec.itemId}
                        </div>
                        {rec.reason && (
                          <div className={styles.recommendationReason}>
                            {rec.reason}
                          </div>
                        )}
                      </div>
                      <div className={styles.recommendationScore}>
                        分数:
                        <span className={styles.recommendationScoreValue}>
                          {rec.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 个性化推荐标签页 */}
        {activeTab === "personal" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>个性化推荐</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              基于协同过滤算法，根据相似用户的偏好进行推荐
            </p>
            <div className={styles.inputGroup}>
              <label className={styles.label}>用户ID</label>
              <input
                className={styles.input}
                type="text"
                value={personalUserId}
                onChange={(e) => setPersonalUserId(e.target.value)}
                placeholder="例如: user1"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>推荐数量</label>
              <input
                className={styles.input}
                type="number"
                value={personalLimit}
                onChange={(e) =>
                  setPersonalLimit(parseInt(e.target.value) || 10)
                }
                min={1}
                max={50}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleGetPersonalRecommendations}
                disabled={isProcessing || !personalUserId.trim()}
              >
                {isProcessing ? (
                  <span className={styles.loading}></span>
                ) : (
                  "获取个性化推荐"
                )}
              </button>
            </div>
            {personalRecommendations.length > 0 && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>
                  推荐结果 ({personalRecommendations.length} 项)
                </h3>
                <div className={styles.recommendationList}>
                  {personalRecommendations.map((rec, idx) => (
                    <div key={idx} className={styles.recommendationItem}>
                      <div className={styles.recommendationInfo}>
                        <div className={styles.recommendationItemId}>
                          {rec.itemId}
                        </div>
                        {rec.reason && (
                          <div className={styles.recommendationReason}>
                            {rec.reason}
                          </div>
                        )}
                      </div>
                      <div className={styles.recommendationScore}>
                        分数:
                        <span className={styles.recommendationScoreValue}>
                          {rec.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 混合推荐标签页 */}
        {activeTab === "hybrid" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>混合推荐</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              结合热门推荐和个性化推荐，提供更全面的推荐结果
            </p>
            <div className={styles.inputGroup}>
              <label className={styles.label}>用户ID</label>
              <input
                className={styles.input}
                type="text"
                value={hybridUserId}
                onChange={(e) => setHybridUserId(e.target.value)}
                placeholder="例如: user1"
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>推荐数量</label>
              <input
                className={styles.input}
                type="number"
                value={hybridLimit}
                onChange={(e) => setHybridLimit(parseInt(e.target.value) || 10)}
                min={1}
                max={50}
              />
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleGetHybridRecommendations}
                disabled={isProcessing || !hybridUserId.trim()}
              >
                {isProcessing ? (
                  <span className={styles.loading}></span>
                ) : (
                  "获取混合推荐"
                )}
              </button>
            </div>
            {hybridRecommendations.length > 0 && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>
                  推荐结果 ({hybridRecommendations.length} 项)
                </h3>
                <div className={styles.recommendationList}>
                  {hybridRecommendations.map((rec, idx) => (
                    <div key={idx} className={styles.recommendationItem}>
                      <div className={styles.recommendationInfo}>
                        <div className={styles.recommendationItemId}>
                          {rec.itemId}
                        </div>
                        {rec.reason && (
                          <div className={styles.recommendationReason}>
                            {rec.reason}
                          </div>
                        )}
                      </div>
                      <div className={styles.recommendationScore}>
                        分数:
                        <span className={styles.recommendationScoreValue}>
                          {rec.score.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 行为追踪标签页 */}
        {activeTab === "behavior" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>用户行为追踪</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              记录用户行为数据，用于训练推荐模型
            </p>
            <div className={styles.behaviorForm}>
              <div className={styles.inputGroup}>
                <label className={styles.label}>用户ID</label>
                <input
                  className={styles.input}
                  type="text"
                  value={behaviorUserId}
                  onChange={(e) => setBehaviorUserId(e.target.value)}
                  placeholder="例如: user1"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>物品ID</label>
                <input
                  className={styles.input}
                  type="text"
                  value={behaviorItemId}
                  onChange={(e) => setBehaviorItemId(e.target.value)}
                  placeholder="例如: item1"
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label}>行为类型</label>
                <select
                  className={styles.input}
                  value={behaviorType}
                  onChange={(e) =>
                    setBehaviorType(
                      e.target.value as
                        | "view"
                        | "click"
                        | "like"
                        | "purchase"
                        | "share"
                    )
                  }
                >
                  <option value="view">查看 (view)</option>
                  <option value="click">点击 (click)</option>
                  <option value="like">喜欢 (like)</option>
                  <option value="purchase">购买 (purchase)</option>
                  <option value="share">分享 (share)</option>
                </select>
              </div>
            </div>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={handleAddBehavior}
                disabled={
                  isProcessing ||
                  !behaviorUserId.trim() ||
                  !behaviorItemId.trim()
                }
              >
                {isProcessing ? (
                  <span className={styles.loading}></span>
                ) : (
                  "记录行为"
                )}
              </button>
            </div>
            {behaviors.length > 0 && (
              <div className={styles.resultCard}>
                <h3 className={styles.resultTitle}>
                  行为记录 ({behaviors.length} 条)
                </h3>
                <div className={styles.behaviorList}>
                  {behaviors.map((behavior, idx) => (
                    <div key={idx} className={styles.behaviorItem}>
                      <div className={styles.behaviorItemHeader}>
                        <span className={styles.behaviorItemUser}>
                          {behavior.userId}
                        </span>
                        <span className={styles.behaviorItemTime}>
                          {formatTimestamp(behavior.timestamp)}
                        </span>
                      </div>
                      <div className={styles.behaviorItemDetails}>
                        <span
                          className={`${styles.behaviorType} ${styles[behavior.behaviorType]}`}
                        >
                          {behavior.behaviorType}
                        </span>
                        <span>物品: {behavior.itemId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 数据分析标签页 */}
        {activeTab === "analytics" && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>数据分析</h2>
            <p style={{ color: "#666", marginBottom: "1.5rem" }}>
              查看推荐系统的数据统计和效果分析
            </p>
            <div className={styles.buttonGroup}>
              <button
                className={styles.button}
                onClick={loadStats}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <span className={styles.loading}></span>
                ) : (
                  "刷新统计"
                )}
              </button>
            </div>
            {stats && (
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>总行为数</div>
                  <div className={styles.statValue}>{stats.totalBehaviors}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>总用户数</div>
                  <div className={styles.statValue}>{stats.totalUsers}</div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>总物品数</div>
                  <div className={styles.statValue}>{stats.totalItems}</div>
                </div>
              </div>
            )}
            {!stats && (
              <div className={styles.emptyState}>
                <p>暂无统计数据，请先记录一些用户行为</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

