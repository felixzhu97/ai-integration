# AI 图像识别功能

## 功能概述

本项目新增了AI图像识别功能，允许用户上传图片并获取AI识别结果。

## 功能特性

- 🖼️ **图片上传**: 支持拖拽或点击上传图片
- 🤖 **AI识别**: 模拟AI图像识别，返回多种可能的识别结果
- 📊 **置信度显示**: 显示每个识别结果的置信度百分比
- 🎨 **美观界面**: 现代化的UI设计，响应式布局
- ⚡ **实时处理**: 快速处理图片并返回结果

## 技术实现

### 前端技术栈

- **Next.js 16**: React框架
- **TypeScript**: 类型安全
- **CSS Modules**: 样式管理
- **Sharp**: 图像处理库

### 后端API

- **Next.js API Routes**: 处理图像识别请求
- **Sharp**: 服务器端图像处理
- **模拟AI**: 基于图像特征的智能识别结果生成

## 使用方法

1. 启动开发服务器：

   ```bash
   pnpm dev --filter=web
   ```

2. 访问应用：
   - 主页: http://localhost:3000
   - 图像识别页面: http://localhost:3000/image-recognition

3. 使用图像识别功能：
   - 点击"🖼️ 图像识别"按钮进入功能页面
   - 上传一张图片（支持JPG、PNG等格式）
   - 点击"开始识别"按钮
   - 查看AI识别结果和置信度

## 项目结构

```
apps/web/
├── app/
│   ├── image-recognition/
│   │   ├── page.tsx          # 图像识别页面组件
│   │   └── page.module.css   # 页面样式
│   ├── api/
│   │   └── image-recognition/
│   │       └── route.ts      # API路由处理
│   ├── page.tsx              # 主页（已更新导航）
│   └── page.module.css       # 主页样式（已更新）
```

## API接口

### POST /api/image-recognition

上传图片进行AI识别

**请求参数:**

- `image`: 图片文件（FormData格式）

**响应格式:**

```json
{
  "success": true,
  "results": [
    {
      "label": "识别标签",
      "confidence": 0.95,
      "description": "详细描述"
    }
  ],
  "imageInfo": {
    "width": 1920,
    "height": 1080,
    "format": "jpeg",
    "size": 1024000
  }
}
```

## 未来扩展

- 集成真实的AI图像识别API（如Google Vision API、Azure Computer Vision等）
- 支持更多图片格式
- 添加图片编辑功能
- 实现批量图片识别
- 添加识别历史记录

## 开发说明

当前实现使用模拟的AI识别结果，主要目的是展示完整的图像识别功能流程。在实际生产环境中，可以替换为真实的AI服务API。
