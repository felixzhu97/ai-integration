import * as tf from "@tensorflow/tfjs";
// 在Node.js环境中，@tensorflow/tfjs-node会自动注册后端
// 使用动态导入以避免在浏览器环境中加载Node.js模块
let tfnode: typeof import("@tensorflow/tfjs-node") | null = null;

// 尝试加载Node.js后端（仅在服务端环境中）
if (typeof window === "undefined") {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    tfnode = require("@tensorflow/tfjs-node");
  } catch {
    // 如果加载失败，将在初始化时处理
  }
}

import type {
  TensorFlowInitOptions,
  ModelConfig,
  Model,
  PredictOptions,
} from "../types.js";
import { createModelManager } from "../utils/model.js";
import { bufferToTensor, preprocessImage } from "../utils/image.js";

/**
 * 初始化TensorFlow.js（服务端）
 */
export async function initTensorFlow(
  options: TensorFlowInitOptions = {}
): Promise<void> {
  if (typeof window !== "undefined") {
    throw new Error("此函数只能在Node.js环境中使用");
  }

  if (!tfnode) {
    throw new Error("@tensorflow/tfjs-node未安装或无法加载");
  }

  const { debug = false } = options;

  if (debug) {
    tf.enableDebugMode();
  }

  // @tensorflow/tfjs-node会自动注册CPU后端
  // 如果需要GPU支持，可以使用@tensorflow/tfjs-node-gpu
  await tf.ready();
}

/**
 * 使用GPU后端初始化（需要安装@tensorflow/tfjs-node-gpu）
 */
export async function initTensorFlowGPU(
  options: TensorFlowInitOptions = {}
): Promise<void> {
  if (typeof window !== "undefined") {
    throw new Error("此函数只能在Node.js环境中使用");
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const tfnodeGpu = require("@tensorflow/tfjs-node-gpu");
    // GPU后端会自动注册
  } catch {
    throw new Error(
      "@tensorflow/tfjs-node-gpu未安装。请运行: npm install @tensorflow/tfjs-node-gpu"
    );
  }

  const { debug = false } = options;

  if (debug) {
    tf.enableDebugMode();
  }

  await tf.ready();
}

/**
 * 获取当前后端
 */
export function getBackend(): string {
  return tf.getBackend();
}

/**
 * 获取后端信息
 */
export async function getBackendInfo(): Promise<{
  backend: string;
  version: string;
}> {
  await tf.ready();
  return {
    backend: tf.getBackend() || "unknown",
    version: tf.version.tfjs,
  };
}

/**
 * 创建模型实例（服务端）
 */
export function createModel(modelUrl?: string): Model {
  const manager = createModelManager(modelUrl);

  return {
    get model() {
      return manager.model;
    },
    get loaded() {
      return manager.loaded;
    },
    async load(config?: ModelConfig) {
      await manager.load(config);
    },
    async predict(input: tf.Tensor | tf.Tensor[]) {
      return manager.predict(input);
    },
    dispose() {
      manager.dispose();
    },
  };
}

/**
 * 从Buffer预测（服务端）
 */
export async function predictFromBuffer(
  model: Model,
  buffer: Buffer,
  preprocessOptions?: {
    width?: number;
    height?: number;
    normalize?: boolean;
  },
  predictOptions?: PredictOptions
): Promise<tf.Tensor | tf.Tensor[]> {
  if (!model.loaded || !model.model) {
    throw new Error("模型尚未加载");
  }

  if (typeof window !== "undefined") {
    throw new Error("此函数只能在Node.js环境中使用");
  }

  // 从Buffer加载图像
  let tensor = await bufferToTensor(
    buffer,
    preprocessOptions?.width,
    preprocessOptions?.height
  );

  // 预处理
  tensor = preprocessImage(tensor, preprocessOptions) as tf.Tensor4D;

  try {
    // 预测
    const result = await model.predict(tensor);

    // 清理中间张量
    tensor.dispose();

    return result;
  } catch (error) {
    tensor.dispose();
    throw error;
  }
}

/**
 * 从文件路径预测（服务端）
 */
export async function predictFromFile(
  model: Model,
  filePath: string,
  preprocessOptions?: {
    width?: number;
    height?: number;
    normalize?: boolean;
  },
  predictOptions?: PredictOptions
): Promise<tf.Tensor | tf.Tensor[]> {
  if (typeof window !== "undefined") {
    throw new Error("此函数只能在Node.js环境中使用");
  }

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs").promises;
  const buffer = await fs.readFile(filePath);

  return predictFromBuffer(model, buffer, preprocessOptions, predictOptions);
}

/**
 * 释放所有张量
 */
export function disposeTensors(...tensors: tf.Tensor[]): void {
  tensors.forEach((tensor) => {
    if (tensor && !tensor.isDisposed) {
      tensor.dispose();
    }
  });
}

/**
 * 清理TensorFlow.js缓存
 */
export function cleanup(): void {
  tf.disposeVariables();
  tf.engine().startScope();
  tf.engine().endScope();
}

/**
 * 获取内存使用情况（服务端）
 */
export function getMemoryInfo(): tf.MemoryInfo {
  return tf.memory();
}

/**
 * 服务端TensorFlow API
 */
export const serverTensorFlow = {
  init: initTensorFlow,
  initGPU: initTensorFlowGPU,
  getBackend,
  getBackendInfo,
  createModel,
  predictFromBuffer,
  predictFromFile,
  disposeTensors,
  cleanup,
  getMemoryInfo,
  // 导出工具函数
  utils: {
    bufferToTensor,
    preprocessImage,
  },
};

export default serverTensorFlow;

