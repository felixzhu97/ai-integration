import type { ModelInfo, ModelLoadStatus } from "../domain/types";
import { ModelType } from "../domain/models";

/**
 * 模型加载器接口
 */
export interface IModelLoader<T> {
  load(): Promise<T>;
  isLoaded(): boolean;
  unload(): void;
  getModelInfo(): ModelInfo;
}

/**
 * 模型加载器基类
 */
export abstract class BaseModelLoader<T> implements IModelLoader<T> {
  protected model: T | null = null;
  protected loadStatus: ModelLoadStatus = "not_loaded";
  protected error?: string;
  protected loadTime?: number;
  protected loadPromise: Promise<T> | null = null;

  constructor(protected modelName: string) {}

  /**
   * 加载模型
   */
  async load(): Promise<T> {
    if (this.model) {
      return this.model;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.loadStatus = "loading";
    const startTime = Date.now();

    this.loadPromise = (async () => {
      try {
        this.model = await this.loadModel();
        this.loadStatus = "loaded";
        this.loadTime = Date.now() - startTime;
        this.error = undefined;
        return this.model;
      } catch (err) {
        this.loadStatus = "error";
        this.error = err instanceof Error ? err.message : String(err);
        this.model = null;
        this.loadPromise = null;
        throw err;
      }
    })();

    return this.loadPromise;
  }

  /**
   * 检查模型是否已加载
   */
  isLoaded(): boolean {
    return this.model !== null;
  }

  /**
   * 卸载模型
   */
  unload(): void {
    if (this.model) {
      this.disposeModel(this.model);
      this.model = null;
    }
    this.loadStatus = "not_loaded";
    this.loadPromise = null;
    this.error = undefined;
    this.loadTime = undefined;
  }

  /**
   * 获取模型信息
   */
  getModelInfo(): ModelInfo {
    return {
      name: this.modelName,
      status: this.loadStatus,
      error: this.error,
      loadTime: this.loadTime,
    };
  }

  /**
   * 获取模型实例
   */
  getModel(): T {
    if (!this.model) {
      throw new Error(`模型 ${this.modelName} 尚未加载`);
    }
    return this.model;
  }

  /**
   * 抽象方法：加载模型的具体实现
   */
  protected abstract loadModel(): Promise<T>;

  /**
   * 抽象方法：释放模型资源
   */
  protected abstract disposeModel(model: T): void;
}

/**
 * 模型注册表
 */
class ModelRegistry {
  private loaders = new Map<ModelType, BaseModelLoader<unknown>>();

  /**
   * 注册模型加载器
   */
  register<T>(type: ModelType, loader: BaseModelLoader<T>): void {
    this.loaders.set(type, loader as BaseModelLoader<unknown>);
  }

  /**
   * 获取模型加载器
   */
  getLoader<T>(type: ModelType): BaseModelLoader<T> | undefined {
    return this.loaders.get(type) as BaseModelLoader<T> | undefined;
  }

  /**
   * 获取所有已注册的模型类型
   */
  getRegisteredTypes(): ModelType[] {
    return Array.from(this.loaders.keys());
  }

  /**
   * 卸载所有模型
   */
  unloadAll(): void {
    for (const loader of this.loaders.values()) {
      loader.unload();
    }
  }
}

/**
 * 全局模型注册表实例
 */
export const modelRegistry = new ModelRegistry();
