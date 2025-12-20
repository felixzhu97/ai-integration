# TOGAF 架构图文档

本目录包含AI集成平台的TOGAF（The Open Group Architecture Framework）架构视图，使用PlantUML格式绘制。

## 架构图文件

### 1. 业务架构图 (business-architecture.puml)

描述系统的业务能力、业务流程和业务价值。

**主要内容：**
- 业务角色：最终用户、系统管理员
- 业务能力：AI图像识别、智能对话、个性化推荐、文档处理
- 业务流程：用户交互流程、数据处理流程
- 业务价值：提升用户体验、增强业务智能、优化运营效率

### 2. 应用架构图 (application-architecture.puml)

描述应用组件、应用交互和API接口。

**主要内容：**
- 前端应用层：apps/web（AI集成平台）、apps/docs（文档应用）
- API服务层：Next.js API Routes（包含所有RESTful API端点）
- 业务服务包层：
  - packages/langchain：聊天、RAG、代理、工具、记忆、链服务
  - packages/tensorflow：图像分类、对象检测、姿态估计、文本处理、模型管理
  - packages/recommendation：推荐引擎、行为追踪
- 基础设施包层：packages/ui、packages/eslint-config、packages/typescript-config

### 3. 数据架构图 (data-architecture.puml)

描述数据实体、数据流和数据存储。

**主要内容：**
- 数据源层：用户输入数据、外部数据源
- 数据处理层：数据预处理、AI处理引擎
- 数据存储层：
  - 用户行为数据存储
  - 文档数据存储
  - 向量嵌入存储
  - 模型数据存储
  - 会话记忆存储
  - 配置数据存储
- 数据服务层：各种数据管理服务

### 4. 技术架构图 (technology-architecture.puml)

描述技术栈、Monorepo结构和构建部署。

**主要内容：**
- 开发工具层：Turborepo、pnpm、TypeScript、ESLint、Prettier
- 前端技术栈：Next.js 16、React 19、TypeScript、Tailwind CSS、Sharp
- AI框架层：TensorFlow.js、LangChain
- Monorepo结构：apps/和packages/目录结构
- 构建和部署：开发环境、生产环境、模型管理

## 如何查看架构图

### 方法1：使用PlantUML在线编辑器

1. 访问 [PlantUML在线编辑器](http://www.plantuml.com/plantuml/uml/)
2. 复制`.puml`文件内容
3. 粘贴到编辑器中即可查看渲染后的图表

### 方法2：使用VS Code插件

1. 安装VS Code插件：`PlantUML` 或 `Markdown Preview Mermaid Support`
2. 打开`.puml`文件
3. 使用快捷键预览（通常是 `Alt+D` 或 `Cmd+Shift+P` 搜索 "PlantUML: Preview")

### 方法3：使用本地工具

1. 安装Java运行环境
2. 下载 [PlantUML JAR文件](http://plantuml.com/download)
3. 使用命令行生成图片：
   ```bash
   java -jar plantuml.jar business-architecture.puml
   ```

### 方法4：使用Docker

```bash
docker run -d -p 8080:8080 plantuml/plantuml-server:jetty
# 然后访问 http://localhost:8080
```

## 架构图关系

四个架构视图之间的关系：

```
业务架构
  ↓ (驱动)
应用架构
  ↓ (使用)
数据架构
  ↓ (运行在)
技术架构
```

- **业务架构**定义了业务需求和能力
- **应用架构**实现了业务能力，定义了应用组件
- **数据架构**支持应用架构的数据需求
- **技术架构**提供了应用和数据架构运行的技术基础

## 项目结构说明

本项目是一个基于Turborepo的Monorepo项目，包含：

- **apps/web**: AI集成平台主应用，提供TensorFlow、LangChain、推荐系统、图像识别等功能
- **apps/docs**: 文档应用
- **packages/langchain**: LangChain服务包，基于整洁架构设计
- **packages/tensorflow**: TensorFlow.js服务包，基于整洁架构设计
- **packages/recommendation**: 推荐系统服务包，基于整洁架构设计
- **packages/ui**: 共享UI组件库
- **packages/eslint-config**: ESLint配置包
- **packages/typescript-config**: TypeScript配置包

## 更新说明

架构图基于项目当前状态生成，当项目结构发生变化时，请及时更新相应的架构图文件。

## 参考资源

- [TOGAF标准](https://www.opengroup.org/togaf)
- [PlantUML文档](https://plantuml.com/)
- [Turborepo文档](https://turborepo.org/docs)

