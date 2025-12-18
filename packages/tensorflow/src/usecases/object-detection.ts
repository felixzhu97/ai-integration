import * as cocoSsd from "@tensorflow-models/coco-ssd";
import type { DetectedObject, ImageInput } from "../domain/types";
import type { ObjectDetectionOptions } from "../domain/models";
import { BaseModelLoader } from "../infrastructure/model-loader";
import { ModelType } from "../domain/models";
import { modelRegistry } from "../infrastructure/model-loader";
import { getTensorFlow } from "../infrastructure/tf-loader";

/**
 * COCO-SSD 模型加载器
 */
class CocoSsdLoader extends BaseModelLoader<cocoSsd.ObjectDetection> {
  constructor(
    private base:
      | "mobilenet_v1"
      | "mobilenet_v2"
      | "lite_mobilenet_v2" = "lite_mobilenet_v2"
  ) {
    super(ModelType.COCO_SSD);
  }

  protected async loadModel(): Promise<cocoSsd.ObjectDetection> {
    await getTensorFlow();
    return await cocoSsd.load({ base: this.base });
  }

  protected disposeModel(model: cocoSsd.ObjectDetection): void {
    // COCO-SSD 模型会自动管理内存
  }
}

/**
 * 对象检测服务
 */
export class ObjectDetectionService {
  private loader: CocoSsdLoader;

  constructor(
    base:
      | "mobilenet_v1"
      | "mobilenet_v2"
      | "lite_mobilenet_v2" = "lite_mobilenet_v2"
  ) {
    this.loader = new CocoSsdLoader(base);
    modelRegistry.register(ModelType.COCO_SSD, this.loader);
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
   * 检测图像中的对象
   */
  async detectObjects(
    image: ImageInput,
    options: ObjectDetectionOptions = {}
  ): Promise<DetectedObject[]> {
    if (!this.loader.isLoaded()) {
      await this.loader.load();
    }

    const model = this.loader.getModel();
    const predictions = await model.detect(image, options.maxDetections || 20);

    const minScore = options.minScore ?? 0.5;

    return predictions
      .filter((pred) => pred.score >= minScore)
      .map((pred) => ({
        class: pred.class,
        score: pred.score,
        bbox: {
          x: pred.bbox[0],
          y: pred.bbox[1],
          width: pred.bbox[2],
          height: pred.bbox[3],
        },
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
