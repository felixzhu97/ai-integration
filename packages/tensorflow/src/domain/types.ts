/**
 * 图像输入类型
 */
export type ImageInput =
  | HTMLImageElement
  | HTMLCanvasElement
  | HTMLVideoElement
  | ImageData;

/**
 * 分类结果
 */
export interface ClassificationResult {
  /** 类别名称 */
  className: string;
  /** 置信度 (0-1) */
  probability: number;
}

/**
 * 检测到的对象
 */
export interface DetectedObject {
  /** 类别名称 */
  class: string;
  /** 置信度 (0-1) */
  score: number;
  /** 边界框 */
  bbox: BoundingBox;
}

/**
 * 边界框
 */
export interface BoundingBox {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
}

/**
 * 姿态关键点
 */
export interface Keypoint {
  /** 关键点名称 */
  part: string;
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 置信度 (0-1) */
  score: number;
}

/**
 * 姿态估计结果
 */
export interface Pose {
  /** 关键点数组 */
  keypoints: Keypoint[];
  /** 整体置信度 */
  score: number;
}

/**
 * 文本嵌入向量
 */
export type TextEmbedding = number[];

/**
 * 模型加载状态
 */
export type ModelLoadStatus = "not_loaded" | "loading" | "loaded" | "error";

/**
 * 模型信息
 */
export interface ModelInfo {
  /** 模型名称 */
  name: string;
  /** 加载状态 */
  status: ModelLoadStatus;
  /** 错误信息（如果有） */
  error?: string;
  /** 加载时间（毫秒） */
  loadTime?: number;
}


