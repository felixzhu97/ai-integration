# @repo/tensorflow

TensorFlow.js 集成包，提供完整的机器学习功能。

## 功能特性

- 🖼️ **图像分类**: 使用 MobileNet 模型进行图像分类
- 🔍 **对象检测**: 使用 COCO-SSD 模型检测图像中的对象
- 🧍 **姿态估计**: 使用 PoseNet 模型估计人体姿态
- 📝 **文本处理**: 使用 Universal Sentence Encoder 进行文本嵌入和相似度计算
- 🛠️ **模型管理**: 统一的模型加载、缓存和管理

## 架构

基于整洁架构原则，分为三层：

- **领域层 (Domain)**: 类型定义和接口
- **基础设施层 (Infrastructure)**: TensorFlow.js 封装
- **用例层 (Use Cases)**: 业务逻辑实现

## 安装

```bash
pnpm add @repo/tensorflow
```

## 使用示例

### 图像分类

```typescript
import { ImageClassificationService } from "@repo/tensorflow";

const service = new ImageClassificationService();
await service.loadModel();
const results = await service.classifyImage(imageElement);
```

### 对象检测

```typescript
import { ObjectDetectionService } from "@repo/tensorflow";

const service = new ObjectDetectionService();
await service.loadModel();
const detections = await service.detectObjects(imageElement);
```

### 姿态估计

```typescript
import { PoseEstimationService } from "@repo/tensorflow";

const service = new PoseEstimationService();
await service.loadModel();
const poses = await service.estimatePose(imageElement);
```

### 文本处理

```typescript
import { TextProcessingService } from "@repo/tensorflow";

const service = new TextProcessingService();
await service.loadModel();
const embedding = await service.embedText("Hello world");
const similarity = await service.calculateSimilarity("text1", "text2");
```

## 模型管理

```typescript
import { ModelManager } from "@repo/tensorflow";

const manager = new ModelManager();
await manager.loadModel("mobilenet");
const status = manager.getModelStatus("mobilenet");
manager.unloadModel("mobilenet");
```



