/**
 * 相似度计算器
 * 提供各种相似度计算算法
 */
export class SimilarityCalculator {
  /**
   * 计算余弦相似度
   * @param vecA 向量A
   * @param vecB 向量B
   * @returns 相似度分数 (0-1)
   */
  static cosineSimilarity(
    vecA: Map<string, number>,
    vecB: Map<string, number>
  ): number {
    const allKeys = new Set([...vecA.keys(), ...vecB.keys()]);

    if (allKeys.size === 0) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (const key of allKeys) {
      const a = vecA.get(key) || 0;
      const b = vecB.get(key) || 0;

      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * 计算 Jaccard 相似度
   * @param setA 集合A
   * @param setB 集合B
   * @returns 相似度分数 (0-1)
   */
  static jaccardSimilarity(setA: Set<string>, setB: Set<string>): number {
    const intersection = new Set([...setA].filter((x) => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    if (union.size === 0) {
      return 0;
    }

    return intersection.size / union.size;
  }

  /**
   * 计算皮尔逊相关系数
   * @param vecA 向量A
   * @param vecB 向量B
   * @returns 相关系数 (-1 到 1)
   */
  static pearsonCorrelation(
    vecA: Map<string, number>,
    vecB: Map<string, number>
  ): number {
    const commonKeys = [...vecA.keys()].filter((key) => vecB.has(key));

    if (commonKeys.length === 0) {
      return 0;
    }

    const valuesA = commonKeys.map((key) => vecA.get(key) || 0);
    const valuesB = commonKeys.map((key) => vecB.get(key) || 0);

    const meanA = valuesA.reduce((a, b) => a + b, 0) / valuesA.length;
    const meanB = valuesB.reduce((a, b) => a + b, 0) / valuesB.length;

    let numerator = 0;
    let sumSqA = 0;
    let sumSqB = 0;

    for (let i = 0; i < commonKeys.length; i++) {
      const diffA = valuesA[i] - meanA;
      const diffB = valuesB[i] - meanB;

      numerator += diffA * diffB;
      sumSqA += diffA * diffA;
      sumSqB += diffB * diffB;
    }

    const denominator = Math.sqrt(sumSqA * sumSqB);

    if (denominator === 0) {
      return 0;
    }

    return numerator / denominator;
  }
}



