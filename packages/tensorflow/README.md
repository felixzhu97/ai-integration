# @repo/tensorflow

通用的 TensorFlow.js 工具库，支持浏览器端和服务端使用。

## 特性

- 🌐 **跨环境支持**: 自动检测运行环境（浏览器/Node.js），使用对应的实现
- 🚀 **统一API**: 浏览器端和服务端提供相同的API接口，便于切换
- 📦 **类型安全**: 完整的 TypeScript 类型定义
- 🎯 **易于使用**: 简化的API，封装常用功能
- 🧹 **整洁架构**: 清晰的目录结构，分离浏览器端和服务端实现

## 安装

```bash
pnpm add @repo/tensorflow
```

## 依赖

- `@tensorflow/tfjs`: TensorFlow.js 核心库
- `@tensorflow/tfjs-node`: Node.js 后端支持（服务端使用）

## 使用方法

### 基础用法（自动环境检测）

```typescript
import { init, createModel } from "@repo/tensorflow";

// 初始化（自动检测环境）
await init();

// 创建模型
const model = createModel("https://model-url/model.json");

// 加载模型
await model.load();

// 进行预测
const input = tf.tensor2d([[1, 2, 3]]);
const result = await model.predict(input);

// 清理
model.dispose();
input.dispose();
```

### 浏览器端使用

```typescript
import {
  initTensorFlow,
  createModel,
  predictFromImageElement,
  predictFromImageUrl,
} from "@repo/tensorflow";

// 初始化浏览器端TensorFlow
await initTensorFlow({ backend: "webgl" });

// 创建并加载模型
const model = createModel("https://model-url/model.json");
await model.load();

// 从图像元素预测
const imgElement = document.getElementById("my-image") as HTMLImageElement;
const result = await predictFromImageElement(model, imgElement, {
  width: 224,
  height: 224,
  normalize: true,
});

// 从图像URL预测
const result2 = await predictFromImageUrl(model, "https://image-url.jpg", {
  width: 224,
  height: 224,
  normalize: true,
});
```

### 服务端使用

```typescript
import {
  initTensorFlow,
  createModel,
  predictFromBuffer,
  predictFromFile,
} from "@repo/tensorflow/server";

// 初始化服务端TensorFlow
await initTensorFlow();

// 创建并加载模型
const model = createModel("https://model-url/model.json");
await model.load();

// 从Buffer预测
import fs from "fs/promises";
const buffer = await fs.readFile("image.jpg");
const result = await predictFromBuffer(model, buffer, {
  width: 224,
  height: 224,
  normalize: true,
});

// 从文件路径预测
const result2 = await predictFromFile(model, "image.jpg", {
  width: 224,
  height: 224,
  normalize: true,
});
```

### 图像预处理

```typescript
import { preprocessImage, imageElementToTensor } from "@repo/tensorflow";

// 从图像元素创建张量
const tensor = imageElementToTensor(imgElement);

// 预处理图像
const processed = preprocessImage(tensor, {
  width: 224,
  height: 224,
  normalize: true,
  mean: 127.5,
  std: 127.5,
});
```

### 模型管理

```typescript
import { createModelManager, loadLayersModel } from "@repo/tensorflow";

// 使用模型管理器
const manager = createModelManager("https://model-url/model.json");
await manager.load();

// 或直接加载模型
const model = await loadLayersModel("https://model-url/model.json");
```

## API 参考

### 核心函数

#### `init(options?: TensorFlowInitOptions)`

初始化 TensorFlow.js（自动检测环境）

#### `createModel(modelUrl?: string): Model`

创建模型实例

#### `detectEnvironment(): RuntimeEnvironment`

检测当前运行环境（"browser" | "server"）

### 浏览器端API

- `initTensorFlow(options?)`: 初始化浏览器端
- `predictFromImageElement(model, element, options?)`: 从图像元素预测
- `predictFromImageUrl(model, url, options?)`: 从图像URL预测

### 服务端API

- `initTensorFlow(options?)`: 初始化服务端
- `initTensorFlowGPU(options?)`: 初始化GPU后端（需要@tensorflow/tfjs-node-gpu）
- `predictFromBuffer(model, buffer, options?)`: 从Buffer预测
- `predictFromFile(model, filePath, options?)`: 从文件预测

### 工具函数

- `preprocessImage(tensor, options)`: 图像预处理
- `resizeImage(tensor, width, height)`: 调整图像大小
- `normalizeImage(tensor, mean?, std?)`: 归一化图像
- `createModelManager(modelUrl?)`: 创建模型管理器

## 类型定义

```typescript
interface Model {
  model: tf.LayersModel | tf.GraphModel | null;
  loaded: boolean;
  load(config?: ModelConfig): Promise<void>;
  predict(input: tf.Tensor | tf.Tensor[]): Promise<tf.Tensor | tf.Tensor[]>;
  dispose(): void;
}

interface RecognitionResult {
  label: string;
  confidence: number;
  description?: string;
}

interface ImagePreprocessOptions {
  width?: number;
  height?: number;
  normalize?: boolean;
  mean?: number;
  std?: number;
  convertToRgb?: boolean;
}
```

## 注意事项

1. **内存管理**: 使用完张量后记得调用 `dispose()` 释放内存
2. **环境检测**: 浏览器端和服务端使用不同的实现，确保在正确的环境中使用
3. **模型格式**: 支持 TensorFlow.js Layers 模型和 Graph 模型
4. **后端选择**: 浏览器端可以使用 WebGL、WASM 或 CPU 后端；服务端使用 CPU 后端（或安装 GPU 包使用 GPU）

## 开发

```bash
# 安装依赖
pnpm install

# 类型检查
pnpm check-types

# 代码检查
pnpm lint
```

## 许可证

私有包，仅供内部使用。

