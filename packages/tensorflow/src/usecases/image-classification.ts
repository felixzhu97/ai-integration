import * as mobilenet from "@tensorflow-models/mobilenet";
import type { ClassificationResult, ImageInput } from "../domain/types";
import type { ImageClassificationOptions } from "../domain/models";
import { MobileNetSize, MobileNetVersion } from "../domain/models";
import { BaseModelLoader } from "../infrastructure/model-loader";
import { ModelType } from "../domain/models";
import { modelRegistry } from "../infrastructure/model-loader";
import { getTensorFlow } from "../infrastructure/tf-loader";

/**
 * MobileNet 模型加载器
 */
class MobileNetLoader extends BaseModelLoader<mobilenet.MobileNet> {
  constructor(
    private version: MobileNetVersion = MobileNetVersion.V2,
    private size: MobileNetSize = MobileNetSize.DEFAULT,
    private alpha: number = 1.0
  ) {
    super(ModelType.MOBILENET);
  }

  protected async loadModel(): Promise<mobilenet.MobileNet> {
    await getTensorFlow();
    return await mobilenet.load({
      version: this.version,
      alpha: this.size,
    });
  }

  protected disposeModel(model: mobilenet.MobileNet): void {
    // MobileNet 模型会自动管理内存
    // 如果需要，可以在这里添加清理逻辑
  }
}

/**
 * 图像分类服务
 */
export class ImageClassificationService {
  private loader: MobileNetLoader;

  constructor(
    version: MobileNetVersion = MobileNetVersion.V2,
    size: MobileNetSize = MobileNetSize.DEFAULT
  ) {
    this.loader = new MobileNetLoader(version, size);
    modelRegistry.register(ModelType.MOBILENET, this.loader);
  }

  /**
   * 加载模型
   */
  async loadModel(): Promise<void> {
    await this.loader.load();
  }

  /**
   * 检查模型是否已加载
   */
  isModelLoaded(): boolean {
    return this.loader.isLoaded();
  }

  /**
   * 对图像进行分类
   */
  async classifyImage(
    image: ImageInput,
    options: ImageClassificationOptions = {}
  ): Promise<ClassificationResult[]> {
    if (!this.loader.isLoaded()) {
      await this.loader.load();
    }

    const model = this.loader.getModel();
    const predictions = await model.classify(image, options.topK || 3);

    return predictions.map((pred) => ({
      className: pred.className,
      probability: pred.probability,
    }));
  }

  /**
   * 卸载模型
   */
  unloadModel(): void {
    this.loader.unload();
  }

  /**
   * 获取模型信息
   */
  getModelInfo() {
    return this.loader.getModelInfo();
  }
}
