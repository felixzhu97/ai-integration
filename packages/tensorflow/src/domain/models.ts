/**
 * 支持的模型类型
 */
export enum ModelType {
  /** MobileNet 图像分类模型 */
  MOBILENET = "mobilenet",
  /** COCO-SSD 对象检测模型 */
  COCO_SSD = "coco-ssd",
  /** PoseNet 姿态估计模型 */
  POSENET = "posenet",
  /** Universal Sentence Encoder 文本处理模型 */
  UNIVERSAL_SENTENCE_ENCODER = "universal-sentence-encoder",
}

/**
 * MobileNet 模型版本
 */
export enum MobileNetVersion {
  V1 = 1,
  V2 = 2,
}

/**
 * MobileNet 模型大小
 */
export enum MobileNetSize {
  /** 0.25x */
  SMALL = 0.25,
  /** 0.5x */
  MEDIUM = 0.5,
  /** 0.75x */
  LARGE = 0.75,
  /** 1.0x (默认) */
  DEFAULT = 1.0,
}

/**
 * PoseNet 模型架构
 */
export enum PoseNetArchitecture {
  /** MobileNetV1 架构 */
  MOBILENET_V1 = "MobileNetV1",
  /** ResNet50 架构 */
  RESNET_50 = "ResNet50",
}

/**
 * PoseNet 输出步长
 */
export enum PoseNetOutputStride {
  /** 8 步长，更快但精度较低 */
  STRIDE_8 = 8,
  /** 16 步长，平衡速度和精度 */
  STRIDE_16 = 16,
  /** 32 步长，更慢但精度更高 */
  STRIDE_32 = 32,
}

/**
 * 图像分类选项
 */
export interface ImageClassificationOptions {
  /** 返回前 N 个结果，默认 3 */
  topK?: number;
}

/**
 * 对象检测选项
 */
export interface ObjectDetectionOptions {
  /** 最小置信度阈值，默认 0.5 */
  minScore?: number;
  /** 最大检测数量，默认 20 */
  maxDetections?: number;
}

/**
 * 姿态估计选项
 */
export interface PoseEstimationOptions {
  /** 模型架构，默认 MobileNetV1 */
  architecture?: PoseNetArchitecture;
  /** 输出步长，默认 16 */
  outputStride?: PoseNetOutputStride;
  /** 输入分辨率，默认 257 */
  inputResolution?: number;
  /** 多姿态检测，默认 false */
  multiPoseMaxDetections?: number;
  /** 最小姿态置信度，默认 0.5 */
  minPoseScore?: number;
}

/**
 * 文本处理选项
 */
export interface TextProcessingOptions {
  /** 是否返回归一化的嵌入向量，默认 true */
  normalize?: boolean;
}


