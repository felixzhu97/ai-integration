"use client";

import { useState, useRef } from "react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";
import styles from "./page.module.css";

interface RecognitionResult {
  label: string;
  confidence: number;
  description?: string;
}

export default function ImageRecognitionPage() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<RecognitionResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setResults([]);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRecognize = async () => {
    if (!selectedImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 将base64图像转换为blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("image", blob, "image.jpg");

      const result = await fetch("/api/image-recognition", {
        method: "POST",
        body: formData,
      });

      if (!result.ok) {
        throw new Error("图像识别失败");
      }

      const data = await result.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "发生未知错误");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setResults([]);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>AI 图像识别</h1>
        <p className={styles.description}>
          上传一张图片，AI将帮您识别图片中的内容
        </p>
      </div>

      <div className={styles.content}>
        <Card className={styles.uploadCard}>
          <div className={styles.uploadArea}>
            {selectedImage ? (
              <div className={styles.imagePreview}>
                <img
                  src={selectedImage}
                  alt="预览"
                  className={styles.previewImage}
                />
                <div className={styles.imageActions}>
                  <Button onClick={handleRecognize} disabled={isProcessing}>
                    {isProcessing ? "识别中..." : "开始识别"}
                  </Button>
                  <Button variant="outline" onClick={handleReset}>
                    重新选择
                  </Button>
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
        </Card>

        {error && (
          <Card className={styles.errorCard}>
            <div className={styles.errorMessage}>
              <span className={styles.errorIcon}>⚠️</span>
              <p>{error}</p>
            </div>
          </Card>
        )}

        {results.length > 0 && (
          <Card className={styles.resultsCard}>
            <h2 className={styles.resultsTitle}>识别结果</h2>
            <div className={styles.resultsList}>
              {results.map((result, index) => (
                <div key={index} className={styles.resultItem}>
                  <div className={styles.resultHeader}>
                    <span className={styles.resultLabel}>{result.label}</span>
                    <span className={styles.resultConfidence}>
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  {result.description && (
                    <p className={styles.resultDescription}>
                      {result.description}
                    </p>
                  )}
                  <div className={styles.confidenceBar}>
                    <div
                      className={styles.confidenceFill}
                      style={{ width: `${result.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
