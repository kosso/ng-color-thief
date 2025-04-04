# @soarlin/ng-color-thief

An Angular service for extracting dominant colors and color palettes from images. Rewritten based on the concept of [Color Thief](http://lokeshdhakar.com/projects/color-thief/).

## Features

- Extract dominant color from images
- Generate color palette from images
- Support loading images from URLs
- Full TypeScript support
- Angular v19+ support

## Installation

```bash
# Using npm
npm install @soarlin/ng-color-thief

# Using yarn
yarn add @soarlin/ng-color-thief
```

## Usage

### 1. Import Module

```typescript
import { ColorThiefModule } from '@soarlin/ng-color-thief';

@NgModule({
  imports: [ColorThiefModule]
})
export class AppModule { }

// Or in a standalone component
@Component({
  // ...
  imports: [ColorThiefModule]
})
```

### 2. Use in Component

```typescript
import { Component } from '@angular/core';
import { ColorThiefService } from '@soarlin/ng-color-thief';

@Component({
  selector: 'app-root',
  template: `
    <img #sourceImage [src]="imageUrl" (load)="onImageLoad(sourceImage)">
    <div *ngIf="dominantColor" [style.background-color]="'rgb(' + dominantColor.join(',') + ')'">
      Dominant Color
    </div>
    <div *ngFor="let color of palette"
         [style.background-color]="'rgb(' + color.join(',') + ')'">
      Palette Color
    </div>
  `
})
export class AppComponent {
  imageUrl = 'your-image-url.jpg';
  dominantColor: [number, number, number] | null = null;
  palette: [number, number, number][] | null = null;

  constructor(private colorThief: ColorThiefService) {}

  onImageLoad(imageElement: HTMLImageElement) {
    // Get dominant color
    this.dominantColor = this.colorThief.getColor(imageElement);

    // Get color palette (default 10 colors)
    this.palette = this.colorThief.getPalette(imageElement);
  }

  // Or get palette directly from URL
  async loadPaletteFromUrl() {
    try {
      this.palette = await this.colorThief.getPaletteFromUrl(this.imageUrl);
    } catch (error) {
      console.error('Failed to load image:', error);
    }
  }
}
```

## API

### ColorThiefService

#### getColor(sourceImage: HTMLImageElement, quality?: number): [number, number, number]

Extract the dominant color from an image. Returns an RGB color array.

- `sourceImage`: The image element
- `quality`: Sampling quality (1 is highest quality, 10 is default)

#### getPalette(sourceImage: HTMLImageElement, colorCount?: number, quality?: number): [number, number, number][]

Extract a color palette from an image. Returns an array of RGB color arrays.

- `sourceImage`: The image element
- `colorCount`: Number of colors to extract (default is 10)
- `quality`: Sampling quality (1 is highest quality, 10 is default)

#### getPaletteFromUrl(imageUrl: string, count?: number, quality?: number): Promise<[number, number, number][]>

Extract a color palette from an image URL. Returns a Promise that resolves to an array of RGB color arrays.

- `imageUrl`: URL of the image
- `count`: Number of colors to extract (default is 5)
- `quality`: Sampling quality (1 is highest quality, 10 is default)

## Important Notes

- Images must be from the same domain or have appropriate CORS settings
- It's recommended to call color extraction methods after the image is fully loaded
- Lower quality values result in longer processing time but more accurate results

## License

MIT

## Author

Soar Lin (https://github.com/SoarLin)
