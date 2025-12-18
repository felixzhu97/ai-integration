import * as tf from "@tensorflow/tfjs";

/**
 * TensorFlow.js 加载器
 * 负责初始化和管理 TensorFlow.js 环境
 */
export class TensorFlowLoader {
  private static instance: TensorFlowLoader | null = null;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  /**
   * 获取单例实例
   */
  static getInstance(): TensorFlowLoader {
    if (!TensorFlowLoader.instance) {
      TensorFlowLoader.instance = new TensorFlowLoader();
    }
    return TensorFlowLoader.instance;
  }

  /**
   * 初始化 TensorFlow.js
   * 确保只初始化一次
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = (async () => {
      try {
        // 设置后端（优先使用 WebGL，回退到 CPU）
        await tf.setBackend("webgl");
        await tf.ready();

        // 启用内存管理
        tf.engine().startScope();
        
        this.isInitialized = true;
      } catch (error) {
        // 如果 WebGL 失败，尝试使用 CPU
        try {
          await tf.setBackend("cpu");
          await tf.ready();
          tf.engine().startScope();
          this.isInitialized = true;
        } catch (cpuError) {
          throw new Error(
            `TensorFlow.js 初始化失败: ${error instanceof Error ? error.message : String(error)}`
          );
        }
      }
    })();

    return this.initPromise;
  }

  /**
   * 检查是否已初始化
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * 获取 TensorFlow.js 命名空间
   */
  getTensorFlow(): typeof tf {
    if (!this.isInitialized) {
      throw new Error("TensorFlow.js 尚未初始化，请先调用 initialize()");
    }
    return tf;
  }

  /**
   * 清理资源
   */
  dispose(): void {
    if (this.isInitialized) {
      tf.engine().endScope();
      tf.disposeVariables();
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

/**
 * 便捷函数：获取 TensorFlow.js 实例
 */
export async function getTensorFlow(): Promise<typeof tf> {
  const loader = TensorFlowLoader.getInstance();
  await loader.initialize();
  return loader.getTensorFlow();
}

