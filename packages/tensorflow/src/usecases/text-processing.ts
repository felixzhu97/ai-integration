import * as use from "@tensorflow-models/universal-sentence-encoder";
import type { TextEmbedding } from "../domain/types";
import type { TextProcessingOptions } from "../domain/models";
import { BaseModelLoader } from "../infrastructure/model-loader";
import { ModelType } from "../domain/models";
import { modelRegistry } from "../infrastructure/model-loader";
import { getTensorFlow } from "../infrastructure/tf-loader";
import * as tf from "@tensorflow/tfjs";

/**
 * Universal Sentence Encoder 模型加载器
 */
class UniversalSentenceEncoderLoader extends BaseModelLoader<use.UniversalSentenceEncoder> {
  constructor(private modelType: "lite" | "normal" = "lite") {
    super(ModelType.UNIVERSAL_SENTENCE_ENCODER);
  }

  protected async loadModel(): Promise<use.UniversalSentenceEncoder> {
    await getTensorFlow();
    if (this.modelType === "lite") {
      return await use.load();
    } else {
      // loadQnA 返回的类型与 load 相同，使用 unknown 进行类型转换
      return (await use.loadQnA()) as unknown as use.UniversalSentenceEncoder;
    }
  }

  protected disposeModel(model: use.UniversalSentenceEncoder): void {
    // Universal Sentence Encoder 模型会自动管理内存
  }
}

/**
 * 文本处理服务
 */
export class TextProcessingService {
  private loader: UniversalSentenceEncoderLoader;

  constructor(modelType: "lite" | "normal" = "lite") {
    this.loader = new UniversalSentenceEncoderLoader(modelType);
    modelRegistry.register(ModelType.UNIVERSAL_SENTENCE_ENCODER, this.loader);
  }

  /**
   * 加载模型
   */
  async loadModel(): Promise<void> {
    await this.loader.load();
  }

  /**
   * 检查模型是否已加载
   */
  isModelLoaded(): boolean {
    return this.loader.isLoaded();
  }

  /**
   * 将文本转换为嵌入向量
   */
  async embedText(
    text: string | string[],
    options: TextProcessingOptions = {}
  ): Promise<TextEmbedding | TextEmbedding[]> {
    if (!this.loader.isLoaded()) {
      await this.loader.load();
    }

    const model = this.loader.getModel();
    const embeddings = await model.embed(text);

    // 如果 normalize 为 true，归一化嵌入向量
    let normalizedEmbeddings = embeddings;
    if (options.normalize !== false) {
      // 计算 L2 范数并归一化
      const norm = tf.norm(embeddings, "euclidean", -1, true);
      normalizedEmbeddings = tf.div(embeddings, norm);
    }

    const result = await normalizedEmbeddings.array();
    normalizedEmbeddings.dispose();
    embeddings.dispose();

    // 如果输入是单个字符串，返回单个向量；否则返回向量数组
    if (typeof text === "string") {
      return result[0] as TextEmbedding;
    }
    return result as TextEmbedding[];
  }

  /**
   * 计算两个文本的相似度（余弦相似度）
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    const embeddings = await this.embedText([text1, text2], {
      normalize: true,
    });

    if (
      Array.isArray(embeddings) &&
      embeddings.length === 2 &&
      Array.isArray(embeddings[0]) &&
      Array.isArray(embeddings[1])
    ) {
      const emb1 = tf.tensor1d(embeddings[0]);
      const emb2 = tf.tensor1d(embeddings[1]);

      const dotProduct = tf.dot(emb1, emb2);
      const similarity = await dotProduct.array();

      emb1.dispose();
      emb2.dispose();
      dotProduct.dispose();

      const simValue = Array.isArray(similarity) ? similarity[0] : similarity;
      return typeof simValue === "number" ? simValue : 0;
    }

    throw new Error("无法计算相似度：嵌入向量格式错误");
  }

  /**
   * 计算多个文本之间的相似度矩阵
   */
  async calculateSimilarityMatrix(texts: string[]): Promise<number[][]> {
    const embeddings = await this.embedText(texts, { normalize: true });

    if (!Array.isArray(embeddings)) {
      throw new Error("无法计算相似度矩阵：嵌入向量格式错误");
    }

    // 确保所有嵌入都是数组
    const embeddingArrays = embeddings
      .map((emb) => (Array.isArray(emb) ? emb : []))
      .filter((emb) => emb.length > 0);

    if (embeddingArrays.length === 0) {
      throw new Error("无法计算相似度矩阵：没有有效的嵌入向量");
    }

    const embeddingTensors = embeddingArrays.map((emb) => tf.tensor1d(emb));
    const similarityMatrix: number[][] = [];

    for (let i = 0; i < embeddingTensors.length; i++) {
      const row: number[] = [];
      const tensorI = embeddingTensors[i];
      if (!tensorI) continue;
      for (let j = 0; j < embeddingTensors.length; j++) {
        const tensorJ = embeddingTensors[j];
        if (!tensorJ) continue;
        const dotProduct = tf.dot(tensorI, tensorJ);
        const similarity = await dotProduct.array();
        const simValue = Array.isArray(similarity) ? similarity[0] : similarity;
        row.push(typeof simValue === "number" ? simValue : 0);
        dotProduct.dispose();
      }
      similarityMatrix.push(row);
    }

    // 清理张量
    embeddingTensors.forEach((tensor) => tensor.dispose());

    return similarityMatrix;
  }

  /**
   * 卸载模型
   */
  unloadModel(): void {
    this.loader.unload();
  }

  /**
   * 获取模型信息
   */
  getModelInfo() {
    return this.loader.getModelInfo();
  }
}
