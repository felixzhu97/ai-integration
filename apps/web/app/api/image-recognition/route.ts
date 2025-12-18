import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

// 模拟的图像识别结果数据
const mockRecognitionData = [
  {
    label: "猫",
    confidence: 0.95,
    description: "一只可爱的家猫，可能是橘猫或三花猫",
  },
  {
    label: "狗",
    confidence: 0.87,
    description: "一只友好的宠物狗，看起来是金毛或拉布拉多",
  },
  {
    label: "风景",
    confidence: 0.82,
    description: "美丽的自然风景，包含山脉和湖泊",
  },
  {
    label: "建筑",
    confidence: 0.78,
    description: "现代建筑或历史建筑",
  },
  {
    label: "食物",
    confidence: 0.75,
    description: "美味的食物，可能是中餐或西餐",
  },
  {
    label: "汽车",
    confidence: 0.73,
    description: "现代汽车，可能是轿车或SUV",
  },
  {
    label: "人物",
    confidence: 0.71,
    description: "人物肖像或群体照片",
  },
  {
    label: "植物",
    confidence: 0.68,
    description: "绿色植物或花卉",
  },
];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return NextResponse.json({ error: "未找到图像文件" }, { status: 400 });
    }

    // 验证文件类型
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "请上传有效的图像文件" },
        { status: 400 }
      );
    }

    // 验证文件大小 (限制为10MB)
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图像文件过大，请上传小于10MB的文件" },
        { status: 400 }
      );
    }

    // 将文件转换为Buffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 使用Sharp处理图像
    const imageInfo = await sharp(buffer).metadata();

    // 模拟AI识别过程
    await new Promise((resolve) => setTimeout(resolve, 1500)); // 模拟处理时间

    // 根据图像特征生成模拟结果
    const results = generateMockResults(imageInfo);

    return NextResponse.json({
      success: true,
      results,
      imageInfo: {
        width: imageInfo.width,
        height: imageInfo.height,
        format: imageInfo.format,
        size: imageFile.size,
      },
    });
  } catch (error) {
    console.error("图像识别错误:", error);
    return NextResponse.json(
      { error: "图像处理失败，请重试" },
      { status: 500 }
    );
  }
}

function generateMockResults(imageInfo: any) {
  // 根据图像特征生成更真实的结果
  const results = [];
  const numResults = Math.floor(Math.random() * 3) + 2; // 2-4个结果

  // 随机选择一些结果
  const shuffled = [...mockRecognitionData].sort(() => 0.5 - Math.random());

  for (let i = 0; i < numResults; i++) {
    const baseResult = shuffled[i];
    // 添加一些随机性
    const confidence = Math.max(
      0.3,
      baseResult.confidence + (Math.random() - 0.5) * 0.2
    );

    results.push({
      label: baseResult.label,
      confidence: Math.round(confidence * 100) / 100,
      description: baseResult.description,
    });
  }

  // 按置信度排序
  return results.sort((a, b) => b.confidence - a.confidence);
}
