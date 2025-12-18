"use client";

import { useState, useRef, useEffect } from "react";
import {
  ImageClassificationService,
  ObjectDetectionService,
  PoseEstimationService,
  TextProcessingService,
  ModelManager,
  type ClassificationResult,
  type DetectedObject,
  type Pose,
} from "@repo/tensorflow";
import styles from "./page.module.css";

type ActiveTab = "classification" | "detection" | "pose" | "text" | "models";

export default function TensorFlowDemoPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("classification");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 图像分类状态
  const [classificationResults, setClassificationResults] = useState<
    ClassificationResult[]
  >([]);

  // 对象检测状态
  const [detectionResults, setDetectionResults] = useState<DetectedObject[]>(
    []
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // 姿态估计状态
  const [poseResults, setPoseResults] = useState<Pose[]>([]);
  const poseCanvasRef = useRef<HTMLCanvasElement>(null);

  // 文本处理状态
  const [text1, setText1] = useState("我喜欢机器学习");
  const [text2, setText2] = useState("人工智能很有趣");
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [textEmbedding, setTextEmbedding] = useState<number[] | null>(null);

  // 模型管理状态
  const [modelStatuses, setModelStatuses] = useState<Map<string, any>>(
    new Map()
  );
  const [loadingProgress, setLoadingProgress] = useState(0);

  // 服务实例
  const classificationService = useRef(new ImageClassificationService());
  const detectionService = useRef(new ObjectDetectionService());
  const poseService = useRef(new PoseEstimationService());
  const textService = useRef(new TextProcessingService());
  const modelManager = useRef(new ModelManager());

  // 初始化：更新模型状态
  useEffect(() => {
    updateModelStatuses();
    const interval = setInterval(updateModelStatuses, 1000);
    return () => clearInterval(interval);
  }, []);

  const updateModelStatuses = () => {
    const statuses = modelManager.current.getAllModelStatuses();
    setModelStatuses(
      new Map(Array.from(statuses.entries()).map(([k, v]) => [k.toString(), v]))
    );
    setLoadingProgress(modelManager.current.getLoadingProgress());
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setClassificationResults([]);
        setDetectionResults([]);
        setPoseResults([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClassification = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = selectedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      await classificationService.current.loadModel();
      const results = await classificationService.current.classifyImage(img, {
        topK: 5,
      });
      setClassificationResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "分类失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDetection = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = selectedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      await detectionService.current.loadModel();
      const detections = await detectionService.current.detectObjects(img, {
        minScore: 0.3,
        maxDetections: 10,
      });
      setDetectionResults(detections);

      // 绘制边界框
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.font = "16px Arial";
          ctx.fillStyle = "#00ff00";

          detections.forEach((det) => {
            ctx.strokeRect(
              det.bbox.x,
              det.bbox.y,
              det.bbox.width,
              det.bbox.height
            );
            ctx.fillText(
              `${det.class} (${(det.score * 100).toFixed(1)}%)`,
              det.bbox.x,
              det.bbox.y - 5
            );
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "检测失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePoseEstimation = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = selectedImage;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      await poseService.current.loadModel();
      const poses = await poseService.current.estimatePose(img, {
        multiPoseMaxDetections: 5,
        minPoseScore: 0.3,
      });
      setPoseResults(poses);

      // 绘制关键点
      if (poseCanvasRef.current) {
        const canvas = poseCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          poses.forEach((pose) => {
            // 绘制关键点
            pose.keypoints.forEach((kp) => {
              if (kp.score > 0.3) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = "#00ff00";
                ctx.fill();
                ctx.fillText(kp.part, kp.x + 8, kp.y);
              }
            });

            // 绘制连接线
            const connections = [
              ["leftShoulder", "rightShoulder"],
              ["leftShoulder", "leftElbow"],
              ["leftElbow", "leftWrist"],
              ["rightShoulder", "rightElbow"],
              ["rightElbow", "rightWrist"],
              ["leftShoulder", "leftHip"],
              ["rightShoulder", "rightHip"],
              ["leftHip", "rightHip"],
              ["leftHip", "leftKnee"],
              ["leftKnee", "leftAnkle"],
              ["rightHip", "rightKnee"],
              ["rightKnee", "rightAnkle"],
            ];

            ctx.strokeStyle = "#00ff00";
            ctx.lineWidth = 2;

            connections.forEach(([part1, part2]) => {
              const kp1 = pose.keypoints.find((kp) => kp.part === part1);
              const kp2 = pose.keypoints.find((kp) => kp.part === part2);
              if (kp1 && kp2 && kp1.score > 0.3 && kp2.score > 0.3) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
              }
            });
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "姿态估计失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSimilarity = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await textService.current.loadModel();
      const sim = await textService.current.calculateSimilarity(text1, text2);
      setSimilarity(sim);
    } catch (err) {
      setError(err instanceof Error ? err.message : "相似度计算失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextEmbedding = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      await textService.current.loadModel();
      const embedding = await textService.current.embedText(text1);
      // embedText 对于单个字符串返回单个向量（number[]）
      if (Array.isArray(embedding)) {
        // 如果返回的是数组的数组，取第一个
        if (embedding.length > 0 && Array.isArray(embedding[0])) {
          setTextEmbedding(embedding[0] as number[]);
        } else {
          // 如果返回的是单个向量数组
          setTextEmbedding(embedding as number[]);
        }
      } else {
        // 如果返回的是单个向量
        setTextEmbedding(embedding);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "文本嵌入失败");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadModel = async (modelType: string) => {
    try {
      await modelManager.current.loadModel(modelType as any);
      updateModelStatuses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "模型加载失败");
    }
  };

  const handleUnloadModel = (modelType: string) => {
    modelManager.current.unloadModel(modelType as any);
    updateModelStatuses();
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>TensorFlow.js 功能演示</h1>
        <p className={styles.description}>
          体验 TensorFlow.js 的完整功能：图像分类、对象检测、姿态估计和文本处理
        </p>
      </div>

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "classification" ? styles.active : ""}`}
          onClick={() => setActiveTab("classification")}
        >
          图像分类
        </button>
        <button
          className={`${styles.tab} ${activeTab === "detection" ? styles.active : ""}`}
          onClick={() => setActiveTab("detection")}
        >
          对象检测
        </button>
        <button
          className={`${styles.tab} ${activeTab === "pose" ? styles.active : ""}`}
          onClick={() => setActiveTab("pose")}
        >
          姿态估计
        </button>
        <button
          className={`${styles.tab} ${activeTab === "text" ? styles.active : ""}`}
          onClick={() => setActiveTab("text")}
        >
          文本处理
        </button>
        <button
          className={`${styles.tab} ${activeTab === "models" ? styles.active : ""}`}
          onClick={() => setActiveTab("models")}
        >
          模型管理
        </button>
      </div>

      {error && (
        <div className={styles.errorCard}>
          <div className={styles.errorMessage}>
            <span className={styles.errorIcon}>⚠️</span>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* 图像分类 */}
      {activeTab === "classification" && (
        <div className={styles.tabContent}>
          <div className={styles.uploadCard}>
            <div className={styles.uploadArea}>
              {selectedImage ? (
                <div className={styles.imagePreview}>
                  <img
                    src={selectedImage}
                    alt="预览"
                    className={styles.previewImage}
                  />
                  <div className={styles.imageActions}>
                    <button
                      className={styles.button}
                      onClick={handleClassification}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "分类中..." : "开始分类"}
                    </button>
                    <button
                      className={styles.buttonOutline}
                      onClick={() => setSelectedImage(null)}
                    >
                      重新选择
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.uploadIcon}>📷</div>
                  <p>点击或拖拽上传图片</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </div>
              )}
            </div>
          </div>

          {classificationResults.length > 0 && (
            <div className={styles.resultsCard}>
              <h2 className={styles.resultsTitle}>分类结果</h2>
              <div className={styles.resultsList}>
                {classificationResults.map((result, index) => (
                  <div key={index} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultLabel}>
                        {result.className}
                      </span>
                      <span className={styles.resultConfidence}>
                        {(result.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className={styles.confidenceBar}>
                      <div
                        className={styles.confidenceFill}
                        style={{ width: `${result.probability * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 对象检测 */}
      {activeTab === "detection" && (
        <div className={styles.tabContent}>
          <div className={styles.uploadCard}>
            <div className={styles.uploadArea}>
              {selectedImage ? (
                <div className={styles.imagePreview}>
                  <div className={styles.canvasContainer}>
                    <img
                      src={selectedImage}
                      alt="预览"
                      className={styles.previewImage}
                    />
                    <canvas ref={canvasRef} className={styles.overlayCanvas} />
                  </div>
                  <div className={styles.imageActions}>
                    <button
                      className={styles.button}
                      onClick={handleDetection}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "检测中..." : "开始检测"}
                    </button>
                    <button
                      className={styles.buttonOutline}
                      onClick={() => setSelectedImage(null)}
                    >
                      重新选择
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.uploadIcon}>🔍</div>
                  <p>点击或拖拽上传图片</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </div>
              )}
            </div>
          </div>

          {detectionResults.length > 0 && (
            <div className={styles.resultsCard}>
              <h2 className={styles.resultsTitle}>
                检测结果 ({detectionResults.length} 个对象)
              </h2>
              <div className={styles.resultsList}>
                {detectionResults.map((result, index) => (
                  <div key={index} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultLabel}>{result.class}</span>
                      <span className={styles.resultConfidence}>
                        {(result.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className={styles.resultDescription}>
                      位置: ({result.bbox.x.toFixed(0)},{" "}
                      {result.bbox.y.toFixed(0)}) 大小:{" "}
                      {result.bbox.width.toFixed(0)} ×{" "}
                      {result.bbox.height.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 姿态估计 */}
      {activeTab === "pose" && (
        <div className={styles.tabContent}>
          <div className={styles.uploadCard}>
            <div className={styles.uploadArea}>
              {selectedImage ? (
                <div className={styles.imagePreview}>
                  <div className={styles.canvasContainer}>
                    <img
                      src={selectedImage}
                      alt="预览"
                      className={styles.previewImage}
                    />
                    <canvas
                      ref={poseCanvasRef}
                      className={styles.overlayCanvas}
                    />
                  </div>
                  <div className={styles.imageActions}>
                    <button
                      className={styles.button}
                      onClick={handlePoseEstimation}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "估计中..." : "开始估计"}
                    </button>
                    <button
                      className={styles.buttonOutline}
                      onClick={() => setSelectedImage(null)}
                    >
                      重新选择
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <div className={styles.uploadIcon}>🧍</div>
                  <p>点击或拖拽上传图片</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className={styles.fileInput}
                  />
                </div>
              )}
            </div>
          </div>

          {poseResults.length > 0 && (
            <div className={styles.resultsCard}>
              <h2 className={styles.resultsTitle}>
                姿态估计结果 ({poseResults.length} 个姿态)
              </h2>
              <div className={styles.resultsList}>
                {poseResults.map((pose, index) => (
                  <div key={index} className={styles.resultItem}>
                    <div className={styles.resultHeader}>
                      <span className={styles.resultLabel}>
                        姿态 #{index + 1}
                      </span>
                      <span className={styles.resultConfidence}>
                        {(pose.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <p className={styles.resultDescription}>
                      检测到{" "}
                      {pose.keypoints.filter((kp) => kp.score > 0.3).length}{" "}
                      个关键点
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 文本处理 */}
      {activeTab === "text" && (
        <div className={styles.tabContent}>
          <div className={styles.textCard}>
            <h2 className={styles.sectionTitle}>文本相似度计算</h2>
            <div className={styles.textInputs}>
              <textarea
                className={styles.textArea}
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="输入第一段文本"
              />
              <textarea
                className={styles.textArea}
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                placeholder="输入第二段文本"
              />
            </div>
            <div className={styles.textActions}>
              <button
                className={styles.button}
                onClick={handleTextSimilarity}
                disabled={isProcessing}
              >
                {isProcessing ? "计算中..." : "计算相似度"}
              </button>
            </div>
            {similarity !== null && (
              <div className={styles.similarityResult}>
                <p>相似度: {(similarity * 100).toFixed(2)}%</p>
                <div className={styles.similarityBar}>
                  <div
                    className={styles.similarityFill}
                    style={{ width: `${similarity * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className={styles.textCard}>
            <h2 className={styles.sectionTitle}>文本嵌入</h2>
            <div className={styles.textInputs}>
              <textarea
                className={styles.textArea}
                value={text1}
                onChange={(e) => setText1(e.target.value)}
                placeholder="输入文本"
              />
            </div>
            <div className={styles.textActions}>
              <button
                className={styles.button}
                onClick={handleTextEmbedding}
                disabled={isProcessing}
              >
                {isProcessing ? "生成中..." : "生成嵌入向量"}
              </button>
            </div>
            {textEmbedding && (
              <div className={styles.embeddingResult}>
                <p>向量维度: {textEmbedding.length}</p>
                <p className={styles.embeddingPreview}>
                  前 10 维: [
                  {textEmbedding
                    .slice(0, 10)
                    .map((v) => v.toFixed(4))
                    .join(", ")}
                  ...]
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 模型管理 */}
      {activeTab === "models" && (
        <div className={styles.tabContent}>
          <div className={styles.modelsCard}>
            <h2 className={styles.sectionTitle}>模型状态管理</h2>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{ width: `${loadingProgress * 100}%` }}
              />
            </div>
            <p className={styles.progressText}>
              加载进度: {(loadingProgress * 100).toFixed(0)}%
            </p>

            <div className={styles.modelsList}>
              {Array.from(modelStatuses.entries()).map(([name, info]) => (
                <div key={name} className={styles.modelItem}>
                  <div className={styles.modelHeader}>
                    <span className={styles.modelName}>{name}</span>
                    <span
                      className={`${styles.modelStatus} ${styles[`status_${info.status}`]}`}
                    >
                      {info.status === "loaded"
                        ? "已加载"
                        : info.status === "loading"
                          ? "加载中"
                          : info.status === "error"
                            ? "错误"
                            : "未加载"}
                    </span>
                  </div>
                  {info.loadTime && (
                    <p className={styles.modelInfo}>
                      加载时间: {info.loadTime}ms
                    </p>
                  )}
                  {info.error && (
                    <p className={styles.modelError}>错误: {info.error}</p>
                  )}
                  <div className={styles.modelActions}>
                    {info.status === "loaded" ? (
                      <button
                        className={styles.buttonOutline}
                        onClick={() => handleUnloadModel(name)}
                      >
                        卸载
                      </button>
                    ) : (
                      <button
                        className={styles.button}
                        onClick={() => handleLoadModel(name)}
                        disabled={info.status === "loading"}
                      >
                        {info.status === "loading" ? "加载中..." : "加载"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
