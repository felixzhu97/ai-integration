"use client";

import { useState, useRef } from "react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/card";
import { Badge } from "@repo/ui/badge";
import { Skeleton } from "@repo/ui/skeleton";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            <span className="text-gradient">AI 图像识别</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            上传一张图片，AI将帮您识别图片中的内容
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upload Card */}
          <Card className="shadow-dribbble-md">
            <CardHeader>
              <CardTitle>上传图片</CardTitle>
              <CardDescription>支持 JPG、PNG 等常见图片格式</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {selectedImage ? (
                  <div className="space-y-4">
                    <div className="relative rounded-lg overflow-hidden border bg-muted">
                      <img
                        src={selectedImage}
                        alt="预览"
                        className="w-full h-auto max-h-[400px] object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleRecognize}
                        disabled={isProcessing}
                        className="flex-1"
                      >
                        {isProcessing ? "识别中..." : "开始识别"}
                      </Button>
                      <Button variant="outline" onClick={handleReset}>
                        重新选择
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer hover:border-primary transition-colors bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="text-5xl mb-4">📷</div>
                    <p className="text-muted-foreground mb-2">点击或拖拽上传图片</p>
                    <p className="text-sm text-muted-foreground">
                      支持 JPG、PNG、GIF 等格式
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Results Card */}
          <div className="space-y-4">
            {error && (
              <Card className="border-destructive shadow-dribbble-md">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <span>⚠️</span>
                    <p>{error}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {isProcessing && (
              <Card className="shadow-dribbble-md">
                <CardHeader>
                  <CardTitle>识别中...</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                </CardContent>
              </Card>
            )}

            {results.length > 0 && (
              <Card className="shadow-dribbble-md">
                <CardHeader>
                  <CardTitle>识别结果</CardTitle>
                  <CardDescription>识别到 {results.length} 个结果</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border bg-card space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">{result.label}</span>
                          <Badge variant="secondary">
                            {(result.confidence * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        {result.description && (
                          <p className="text-sm text-muted-foreground">
                            {result.description}
                          </p>
                        )}
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500"
                            style={{ width: `${result.confidence * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {!selectedImage && !isProcessing && !error && results.length === 0 && (
              <Card className="shadow-dribbble-md border-dashed">
                <CardContent className="pt-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-lg mb-2">等待上传图片</p>
                    <p className="text-sm">上传图片后将显示识别结果</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
