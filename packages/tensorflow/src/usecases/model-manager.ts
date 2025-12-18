import type { ModelInfo } from "../domain/types";
import { ModelType } from "../domain/models";
import { modelRegistry } from "../infrastructure/model-loader";
import type { BaseModelLoader } from "../infrastructure/model-loader";

/**
 * 模型管理器
 * 统一管理所有模型的加载、状态和缓存
 */
export class ModelManager {
  /**
   * 加载指定类型的模型
   */
  async loadModel(type: ModelType): Promise<void> {
    const loader = modelRegistry.getLoader(type);
    if (!loader) {
      throw new Error(`模型类型 ${type} 未注册`);
    }
    await loader.load();
  }

  /**
   * 卸载指定类型的模型
   */
  unloadModel(type: ModelType): void {
    const loader = modelRegistry.getLoader(type);
    if (loader) {
      loader.unload();
    }
  }

  /**
   * 检查模型是否已加载
   */
  isModelLoaded(type: ModelType): boolean {
    const loader = modelRegistry.getLoader(type);
    return loader?.isLoaded() ?? false;
  }

  /**
   * 获取模型状态
   */
  getModelStatus(type: ModelType): ModelInfo | null {
    const loader = modelRegistry.getLoader(type);
    if (!loader) {
      return null;
    }
    return loader.getModelInfo();
  }

  /**
   * 获取所有已注册模型的状态
   */
  getAllModelStatuses(): Map<ModelType, ModelInfo> {
    const statuses = new Map<ModelType, ModelInfo>();
    const types = modelRegistry.getRegisteredTypes();

    for (const type of types) {
      const loader = modelRegistry.getLoader(type);
      if (loader) {
        statuses.set(type, loader.getModelInfo());
      }
    }

    return statuses;
  }

  /**
   * 卸载所有模型
   */
  unloadAllModels(): void {
    modelRegistry.unloadAll();
  }

  /**
   * 预加载所有模型
   */
  async preloadAllModels(): Promise<void> {
    const types = modelRegistry.getRegisteredTypes();
    const loadPromises = types.map((type) => this.loadModel(type));
    await Promise.allSettled(loadPromises);
  }

  /**
   * 获取已加载模型的数量
   */
  getLoadedModelCount(): number {
    const types = modelRegistry.getRegisteredTypes();
    return types.filter((type) => this.isModelLoaded(type)).length;
  }

  /**
   * 获取模型加载进度（0-1）
   */
  getLoadingProgress(): number {
    const types = modelRegistry.getRegisteredTypes();
    if (types.length === 0) {
      return 1;
    }

    const loadedCount = types.filter((type) => {
      const status = this.getModelStatus(type);
      return status?.status === "loaded";
    }).length;

    return loadedCount / types.length;
  }
}
