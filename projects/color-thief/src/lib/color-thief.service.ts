import { Injectable } from '@angular/core';
import * as quantize from 'quantize';

interface ColorValidateOptions {
  colorCount: number;
  quality: number;
}

@Injectable({
  providedIn: 'root'
})
export class ColorThiefService {
  private readonly canvas: HTMLCanvasElement = document.createElement('canvas');
  private readonly context: CanvasRenderingContext2D;
  private width = 0;
  private height = 0;

  constructor() {
    this.context = this.canvas.getContext('2d')!;
  }

  private initCanvasImage(image: HTMLImageElement): void {
    this.width = this.canvas.width = image.naturalWidth;
    this.height = this.canvas.height = image.naturalHeight;
    this.context.drawImage(image, 0, 0, this.width, this.height);
  }

  private getCanvasImageData(): ImageData {
    return this.context.getImageData(0, 0, this.width, this.height);
  }

  private createPixelArray(imgData: ImageData, pixelCount: number, quality: number): [number, number, number][] {
    const pixels = imgData.data;
    const pixelArray: [number, number, number][] = [];

    for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
      offset = i * 4;
      r = pixels[offset + 0];
      g = pixels[offset + 1];
      b = pixels[offset + 2];
      a = pixels[offset + 3];

      if (typeof a === 'undefined' || a >= 125) {
        if (!(r > 250 && g > 250 && b > 250)) {
          pixelArray.push([r, g, b]);
        }
      }
    }
    return pixelArray;
  }

  private validateOptions(options: Partial<ColorValidateOptions>): ColorValidateOptions {
    let { colorCount, quality } = options;

    if (typeof colorCount === 'undefined' || !Number.isInteger(colorCount)) {
      colorCount = 10;
    } else if (colorCount === 1) {
      throw new Error('colorCount should be between 2 and 20. To get one color, call getColor() instead of getPalette()');
    } else {
      colorCount = Math.max(colorCount, 2);
      colorCount = Math.min(colorCount, 20);
    }

    if (typeof quality === 'undefined' || !Number.isInteger(quality) || quality < 1) {
      quality = 10;
    }

    return {
      colorCount,
      quality
    };
  }

  getColor(img: HTMLImageElement, quality = 10): [number, number, number] {
    const palette = this.getPalette(img, 5, quality);
    return palette[0];
  }

  getPalette(img: HTMLImageElement, colorCount: number, quality = 10): [number, number, number][] {
    const options = this.validateOptions({
      colorCount,
      quality
    });

    this.initCanvasImage(img);
    const imgData = this.getCanvasImageData();
    const pixelCount = this.width * this.height;
    const pixelArray = this.createPixelArray(imgData, pixelCount, options.quality);
    const cmap = quantize(pixelArray, options.colorCount);
    const palette = cmap ? cmap.palette() : null;
    return palette as [number, number, number][];
  }

  async getPaletteFromUrl(imageUrl: string, count = 5, quality = 10): Promise<[number, number, number][]> {
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
