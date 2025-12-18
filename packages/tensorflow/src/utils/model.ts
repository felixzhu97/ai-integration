import * as tf from "@tensorflow/tfjs";
import type { Model, ModelConfig } from "../types.js";

/**
 * 从URL加载Layers模型
 */
export async function loadLayersModel(
  modelUrl: string,
  config?: ModelConfig
): Promise<tf.LayersModel> {
  const loadOptions = config?.backendOptions || {};
  return tf.loadLayersModel(modelUrl, loadOptions);
}

/**
 * 从URL加载Graph模型
 */
export async function loadGraphModel(
  modelUrl: string,
  config?: ModelConfig
): Promise<tf.GraphModel> {
  const loadOptions = config?.backendOptions || {};
  return tf.loadGraphModel(modelUrl, loadOptions);
}

/**
 * 创建模型管理器
 */
export function createModelManager(
  modelUrl?: string
): {
  model: Model["model"];
  loaded: boolean;
  load: (config?: ModelConfig) => Promise<void>;
  predict: (input: tf.Tensor | tf.Tensor[]) => Promise<tf.Tensor | tf.Tensor[]>;
  dispose: () => void;
} {
  let model: tf.LayersModel | tf.GraphModel | null = null;
  let loaded = false;
  let defaultModelUrl = modelUrl;

  return {
    get model() {
      return model;
    },
    get loaded() {
      return loaded;
    },
    async load(config?: ModelConfig) {
      const url = config?.modelUrl || defaultModelUrl;
      if (!url) {
        throw new Error("模型URL未提供");
      }

      try {
        // 尝试加载为Layers模型
        model = await loadLayersModel(url, config);
        loaded = true;
      } catch {
        // 如果失败，尝试加载为Graph模型
        try {
          model = await loadGraphModel(url, config);
          loaded = true;
        } catch (error) {
          throw new Error(`无法加载模型: ${String(error)}`);
        }
      }
    },
    async predict(input: tf.Tensor | tf.Tensor[]) {
      if (!model || !loaded) {
        throw new Error("模型尚未加载");
      }

      if (model instanceof tf.LayersModel) {
        return model.predict(input) as tf.Tensor | tf.Tensor[];
      } else if (model instanceof tf.GraphModel) {
        return model.execute(input) as tf.Tensor | tf.Tensor[];
      }

      throw new Error("不支持的模型类型");
    },
    dispose() {
      if (model) {
        model.dispose();
        model = null;
        loaded = false;
      }
    },
  };
}

/**
 * 检查模型是否已加载
 */
export function isModelLoaded(model: Model): boolean {
  return model.loaded && model.model !== null;
}

/**
 * 验证模型输入形状
 */
export function validateModelInput(
  model: tf.LayersModel | tf.GraphModel,
  input: tf.Tensor | tf.Tensor[]
): boolean {
  try {
    if (model instanceof tf.LayersModel) {
      const inputs = Array.isArray(input) ? input : [input];
      const inputShape = model.inputs.map((input) => input.shape);

      if (inputs.length !== inputShape.length) {
        return false;
      }

      for (let i = 0; i < inputs.length; i++) {
        const shape = inputs[i]?.shape;
        const expectedShape = inputShape[i];

        if (shape && expectedShape) {
          // 检查除批次维度外的形状是否匹配
          for (let j = 1; j < shape.length; j++) {
            if (expectedShape[j] !== null && shape[j] !== expectedShape[j]) {
              return false;
            }
          }
        }
      }
    }

    return true;
  } catch {
    return false;
  }
}

