import type {
  RuntimeEnvironment,
  RecognitionResult,
  ImageInfo,
  ModelConfig,
  ImagePreprocessOptions,
  TensorFlowInitOptions,
  PredictOptions,
  Model,
} from "./types.js";
import { createModelManager } from "./utils/model.js";

/**
 * 检测当前运行环境
 */
export function detectEnvironment(): RuntimeEnvironment {
  return typeof window !== "undefined" ? "browser" : "server";
}

// 导出类型
export type {
  RuntimeEnvironment,
  RecognitionResult,
  ImageInfo,
  ModelConfig,
  ImagePreprocessOptions,
  TensorFlowInitOptions,
  PredictOptions,
  Model,
};

// 导出工具函数（通用）
export {
  createModelManager,
  loadLayersModel,
  loadGraphModel,
  isModelLoaded,
  validateModelInput,
} from "./utils/model.js";

export {
  resizeImage,
  normalizeImage,
  preprocessImage,
  tensorToImageUrl,
  imageElementToTensor,
  imageUrlToTensor,
  bufferToTensor,
} from "./utils/image.js";

/**
 * 统一的初始化函数（自动检测环境）
 */
export async function init(
  options: TensorFlowInitOptions = {}
): Promise<void> {
  const env = detectEnvironment();

  if (env === "browser") {
    const { initTensorFlow } = await import("./browser/tensorflow.js");
    await initTensorFlow(options);
  } else {
    const { initTensorFlow } = await import("./server/tensorflow.js");
    await initTensorFlow(options);
  }
}

/**
 * 统一创建模型函数（自动检测环境）
 */
export async function createModelForEnvironment(
  modelUrl?: string
): Promise<Model> {
  const env = detectEnvironment();

  if (env === "browser") {
    const { createModel } = await import("./browser/tensorflow.js");
    return createModel(modelUrl);
  } else {
    const { createModel } = await import("./server/tensorflow.js");
    return createModel(modelUrl);
  }
}

/**
 * 获取后端信息（自动检测环境）
 */
export async function getBackendInfoForEnvironment(): Promise<{
  backend: string;
  version: string;
  environment: RuntimeEnvironment;
}> {
  const env = detectEnvironment();
  let backendInfo: { backend: string; version: string };

  if (env === "browser") {
    const { getBackendInfo } = await import("./browser/tensorflow.js");
    backendInfo = await getBackendInfo();
  } else {
    const { getBackendInfo } = await import("./server/tensorflow.js");
    backendInfo = await getBackendInfo();
  }

  return {
    ...backendInfo,
    environment: env,
  };
}

/**
 * 统一创建模型函数（同步版本，使用工厂函数）
 */
export function createModelForEnvironmentSync(
  modelUrl?: string
): Model {
  const env = detectEnvironment();

  if (env === "browser") {
    // 使用动态导入，但在同步上下文中返回一个异步初始化的模型
    // 这需要调用者先初始化
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
      async predict(input: Parameters<Model["predict"]>[0]) {
        return manager.predict(input);
      },
      dispose() {
        manager.dispose();
      },
    };
  } else {
    // 服务端同样处理
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
      async predict(input: Parameters<Model["predict"]>[0]) {
        return manager.predict(input);
      },
      dispose() {
        manager.dispose();
      },
    };
  }
}

/**
 * 主导出对象（包含所有功能）
 */
export const tensorflowLib = {
  detectEnvironment,
  init,
  createModel: createModelForEnvironmentSync,
  getBackendInfo: getBackendInfoForEnvironment,
};

export default tensorflowLib;

