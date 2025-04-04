import { Injectable } from '@angular/core';
import quantize from 'quantize';

type RGB = [number, number, number];

@Injectable({
  providedIn: 'root'
})
export class ColorThiefService {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private pixelCount: number;
  private quality: number;

  constructor() {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d')!;
    this.pixelCount = 10000;
    this.quality = 10;
  }

  getColor(sourceImage: HTMLImageElement, quality: number = 10): RGB {
    const palette = this.getPalette(sourceImage, 5, quality);
    return palette[0];
  }

  getPalette(sourceImage: HTMLImageElement, colorCount: number = 10, quality: number = 10): RGB[] {
    if (typeof colorCount === 'undefined' || colorCount < 2 || colorCount > 256) {
      colorCount = 10;
    }
    if (typeof quality === 'undefined' || quality < 1) {
      quality = 10;
    }

    // Create custom CanvasRenderingContext2D from the image
    const imageWidth = sourceImage.naturalWidth || sourceImage.width;
    const imageHeight = sourceImage.naturalHeight || sourceImage.height;
    this.canvas.width = imageWidth;
    this.canvas.height = imageHeight;
    this.context.clearRect(0, 0, imageWidth, imageHeight);
    this.context.drawImage(sourceImage, 0, 0, imageWidth, imageHeight);

    const imageData = this.context.getImageData(0, 0, imageWidth, imageHeight);
    const pixels = imageData.data;
    const pixelCount = imageWidth * imageHeight;

    const pixelArray: RGB[] = [];
    for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
      offset = i * 4;
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];

      // If pixel is mostly opaque and not white
      if (a >= 125) {
        if (!(r > 250 && g > 250 && b > 250)) {
          pixelArray.push([r, g, b]);
        }
      }
    }

    // Use quantize to build the color palette
    const cmap = quantize(pixelArray, colorCount);
    const palette = cmap ? cmap.palette() as RGB[] : [];

    return palette;
  }

  async getPaletteFromUrl(imageUrl: string, count = 5, quality = 10): Promise<RGB[]> {
    try {
      const img = new Image();
      img.src = imageUrl;

      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });

      return this.getPalette(img, count, quality);
    } catch (error) {
      throw new Error(`Failed to load image: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
