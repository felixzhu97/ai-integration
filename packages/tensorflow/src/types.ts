import * as tf from "@tensorflow/tfjs";

/**
 * 运行环境类型
 */
export type RuntimeEnvironment = "browser" | "server";

/**
 * 图像识别结果
 */
export interface RecognitionResult {
  /** 识别标签 */
  label: string;
  /** 置信度（0-1之间） */
  confidence: number;
  /** 详细描述（可选） */
  description?: string;
}

/**
 * 图像信息
 */
export interface ImageInfo {
  /** 宽度 */
  width: number;
  /** 高度 */
  height: number;
  /** 格式（jpeg, png等） */
  format?: string;
  /** 文件大小（字节） */
  size?: number;
}

/**
 * 模型配置选项
 */
export interface ModelConfig {
  /** 模型URL或路径 */
  modelUrl?: string;
  /** 是否启用CPU后端 */
  useCpuBackend?: boolean;
  /** 是否启用WASM后端 */
  useWasmBackend?: boolean;
  /** 其他TensorFlow.js配置 */
  backendOptions?: Record<string, unknown>;
}

/**
 * 图像预处理选项
 */
export interface ImagePreprocessOptions {
  /** 目标宽度 */
  width?: number;
  /** 目标高度 */
  height?: number;
  /** 是否归一化（将像素值归一化到0-1） */
  normalize?: boolean;
  /** 均值（用于归一化） */
  mean?: number;
  /** 标准差（用于归一化） */
  std?: number;
  /** 是否转换为RGB */
  convertToRgb?: boolean;
}

/**
 * TensorFlow初始化选项
 */
export interface TensorFlowInitOptions {
  /** 后端类型 */
  backend?: "cpu" | "webgl" | "wasm" | "webgpu";
  /** 是否启用调试模式 */
  debug?: boolean;
}

/**
 * 预测选项
 */
export interface PredictOptions {
  /** 批次大小 */
  batchSize?: number;
  /** 是否返回原始张量 */
  returnTensors?: boolean;
}

/**
 * 模型接口
 */
export interface Model {
  /** 模型对象 */
  model: tf.LayersModel | tf.GraphModel | null;
  /** 模型是否已加载 */
  loaded: boolean;
  /** 加载模型 */
  load(config?: ModelConfig): Promise<void>;
  /** 预测 */
  predict(input: tf.Tensor | tf.Tensor[]): Promise<tf.Tensor | tf.Tensor[]>;
  /** 释放模型资源 */
  dispose(): void;
}
