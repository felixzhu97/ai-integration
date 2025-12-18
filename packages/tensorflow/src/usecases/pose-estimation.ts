import * as posenet from "@tensorflow-models/posenet";
import type { ImageInput, Keypoint, Pose } from "../domain/types";
import type { PoseEstimationOptions } from "../domain/models";
import { PoseNetArchitecture, PoseNetOutputStride } from "../domain/models";
import { BaseModelLoader } from "../infrastructure/model-loader";
import { ModelType } from "../domain/models";
import { modelRegistry } from "../infrastructure/model-loader";
import { getTensorFlow } from "../infrastructure/tf-loader";

/**
 * PoseNet 模型加载器
 */
class PoseNetLoader extends BaseModelLoader<posenet.PoseNet> {
  constructor(
    private architecture: PoseNetArchitecture = PoseNetArchitecture.MOBILENET_V1,
    private outputStride: PoseNetOutputStride = PoseNetOutputStride.STRIDE_16,
    private inputResolution: number = 257,
    private multiplier: number = 0.75
  ) {
    super(ModelType.POSENET);
  }

  protected async loadModel(): Promise<posenet.PoseNet> {
    await getTensorFlow();
    const config: any = {
      architecture: this.architecture,
      outputStride: this.outputStride,
      inputResolution: this.inputResolution,
    };
    if (this.architecture === PoseNetArchitecture.MOBILENET_V1) {
      config.multiplier = this.multiplier;
    }
    return await posenet.load(config);
  }

  protected disposeModel(model: posenet.PoseNet): void {
    // PoseNet 模型会自动管理内存
  }
}

/**
 * 姿态估计服务
 */
export class PoseEstimationService {
  private loader: PoseNetLoader;

  constructor(
    architecture: PoseNetArchitecture = PoseNetArchitecture.MOBILENET_V1,
    outputStride: PoseNetOutputStride = PoseNetOutputStride.STRIDE_16,
    inputResolution: number = 257
  ) {
    this.loader = new PoseNetLoader(
      architecture,
      outputStride,
      inputResolution
    );
    modelRegistry.register(ModelType.POSENET, this.loader);
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
   * 估计图像中的姿态
   */
  async estimatePose(
    image: ImageInput,
    options: PoseEstimationOptions = {}
  ): Promise<Pose[]> {
    if (!this.loader.isLoaded()) {
      await this.loader.load();
    }

    const model = this.loader.getModel();
    const minPoseScore = options.minPoseScore ?? 0.5;

    // 单姿态检测
    if (!options.multiPoseMaxDetections) {
      const pose = await model.estimateSinglePose(image, {
        flipHorizontal: false,
      });

      if (pose.score < minPoseScore) {
        return [];
      }

      return [
        {
          keypoints: pose.keypoints.map((kp) => ({
            part: kp.part,
            x: kp.position.x,
            y: kp.position.y,
            score: kp.score,
          })),
          score: pose.score,
        },
      ];
    }

    // 多姿态检测
    const poses = await model.estimateMultiplePoses(image, {
      flipHorizontal: false,
      maxDetections: options.multiPoseMaxDetections || 5,
      scoreThreshold: minPoseScore,
      nmsRadius: 20,
    });

    return poses.map((pose) => ({
      keypoints: pose.keypoints.map((kp) => ({
        part: kp.part,
        x: kp.position.x,
        y: kp.position.y,
        score: kp.score,
      })),
      score: pose.score,
    }));
  }

  /**
   * 获取关键点名称列表
   */
  getKeypointNames(): string[] {
    return [
      "nose",
      "leftEye",
      "rightEye",
      "leftEar",
      "rightEar",
      "leftShoulder",
      "rightShoulder",
      "leftElbow",
      "rightElbow",
      "leftWrist",
      "rightWrist",
      "leftHip",
      "rightHip",
      "leftKnee",
      "rightKnee",
      "leftAnkle",
      "rightAnkle",
    ];
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
