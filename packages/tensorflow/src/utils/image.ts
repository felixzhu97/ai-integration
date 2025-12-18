import * as tf from "@tensorflow/tfjs";
import type { ImagePreprocessOptions } from "../types.js";

/**
 * 从图像元素创建张量
 */
export function imageElementToTensor(
  imageElement: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): tf.Tensor3D {
  return tf.browser.fromPixels(imageElement);
}

/**
 * 从图像URL创建张量
 */
export async function imageUrlToTensor(
  imageUrl: string
): Promise<tf.Tensor3D> {
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const tensor = tf.browser.fromPixels(img);
        resolve(tensor);
      } catch (error) {
        reject(error);
      }
    };
    img.onerror = reject;
    img.src = imageUrl;
  });
}

/**
 * 从Buffer创建张量（Node.js环境）
 */
export async function bufferToTensor(
  buffer: Buffer,
  width?: number,
  height?: number
): Promise<tf.Tensor3D> {
  // 在Node.js环境中，需要使用tf.node.decodeImage
  // 注意：这需要在服务端环境中使用
  const decoded = tf.node.decodeImage(buffer);
  if (width && height) {
    const resized = tf.image.resizeBilinear(decoded, [height, width]);
    decoded.dispose();
    return resized as tf.Tensor3D;
  }
  return decoded as tf.Tensor3D;
}

/**
 * 调整图像大小
 */
export function resizeImage(
  tensor: tf.Tensor3D | tf.Tensor4D,
  width: number,
  height: number
): tf.Tensor3D | tf.Tensor4D {
  return tf.image.resizeBilinear(tensor, [height, width]);
}

/**
 * 归一化图像（将像素值归一化到0-1范围或使用均值标准差归一化）
 */
export function normalizeImage(
  tensor: tf.Tensor3D | tf.Tensor4D,
  mean?: number,
  std?: number
): tf.Tensor3D | tf.Tensor4D {
  let normalized: tf.Tensor3D | tf.Tensor4D;

  if (mean !== undefined && std !== undefined) {
    // 使用均值和标准差归一化
    normalized = tensor.sub(mean).div(std);
  } else {
    // 简单归一化到0-1
    normalized = tensor.div(255.0);
  }

  return normalized;
}

/**
 * 图像预处理（完整的预处理流程）
 */
export function preprocessImage(
  tensor: tf.Tensor3D | tf.Tensor4D,
  options: ImagePreprocessOptions = {}
): tf.Tensor3D | tf.Tensor4D {
  let processed: tf.Tensor3D | tf.Tensor4D = tensor;

  // 调整大小
  if (options.width && options.height) {
    processed = resizeImage(processed, options.width, options.height);
  }

  // 转换为RGB（如果需要）
  if (options.convertToRgb !== false) {
    // TensorFlow.js默认处理RGB，如果输入是RGBA，需要转换
    if (processed.shape[processed.shape.length - 1] === 4) {
      processed = processed.slice(
        [0, 0, 0, 0],
        [-1, -1, -1, 3]
      ) as tf.Tensor3D | tf.Tensor4D;
    }
  }

  // 归一化
  if (options.normalize !== false) {
    processed = normalizeImage(
      processed,
      options.mean,
      options.std
    );
  }

  // 扩展维度（如果需要批次维度）
  if (processed.shape.length === 3) {
    processed = processed.expandDims(0);
  }

  return processed;
}

/**
 * 将张量转换为图像URL（用于显示）
 */
export async function tensorToImageUrl(
  tensor: tf.Tensor3D
): Promise<string> {
  const canvas = document.createElement("canvas");
  canvas.width = tensor.shape[1] ?? 0;
  canvas.height = tensor.shape[0] ?? 0;

  await tf.browser.toPixels(tensor, canvas);
  return canvas.toDataURL();
}

