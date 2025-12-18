import * as tf from "@tensorflow/tfjs";
import type {
  TensorFlowInitOptions,
  ModelConfig,
  Model,
  PredictOptions,
} from "../types.js";
import { createModelManager } from "../utils/model.js";
import {
  imageElementToTensor,
  imageUrlToTensor,
  preprocessImage,
} from "../utils/image.js";

/**
 * 初始化TensorFlow.js（浏览器端）
 */
export async function initTensorFlow(
  options: TensorFlowInitOptions = {}
): Promise<void> {
  const { backend = "webgl", debug = false } = options;

  if (debug) {
    tf.enableDebugMode();
  }

  // 设置后端
  switch (backend) {
    case "webgl":
      await tf.setBackend("webgl");
      break;
    case "wasm":
      await tf.setBackend("wasm");
      break;
    case "cpu":
      await tf.setBackend("cpu");
      break;
    case "webgpu":
      // WebGPU后端需要额外检查
      if (await tf.findBackendFactory("webgpu")) {
        await tf.setBackend("webgpu");
      } else {
        console.warn("WebGPU后端不可用，使用WebGL后端");
        await tf.setBackend("webgl");
      }
      break;
    default:
      await tf.setBackend("webgl");
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
 * 创建模型实例（浏览器端）
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
 * 从图像元素预测
 */
export async function predictFromImageElement(
  model: Model,
  imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement,
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

  // 将图像转换为张量
  let tensor = imageElementToTensor(imageElement);

  // 预处理（返回可能是 Tensor3D 或 Tensor4D）
  const processed = preprocessImage(tensor, preprocessOptions);
  tensor = processed.shape.length === 4 ? processed : processed.expandDims(0);

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
 * 从图像URL预测
 */
export async function predictFromImageUrl(
  model: Model,
  imageUrl: string,
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

  // 从URL加载图像
  let tensor = await imageUrlToTensor(imageUrl);

  // 预处理（返回可能是 Tensor3D 或 Tensor4D）
  const processed = preprocessImage(tensor, preprocessOptions);
  tensor = processed.shape.length === 4 ? processed : processed.expandDims(0);

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
 * 获取内存使用情况（浏览器端）
 */
export function getMemoryInfo(): tf.MemoryInfo {
  return tf.memory();
}

/**
 * 浏览器端TensorFlow API
 */
export const browserTensorFlow = {
  init: initTensorFlow,
  getBackend,
  getBackendInfo,
  createModel,
  predictFromImageElement,
  predictFromImageUrl,
  disposeTensors,
  cleanup,
  getMemoryInfo,
  // 导出工具函数
  utils: {
    imageElementToTensor,
    imageUrlToTensor,
    preprocessImage,
  },
};

export default browserTensorFlow;

