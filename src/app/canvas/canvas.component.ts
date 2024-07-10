import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
  interface ImageObject {
    src: string;
    x: number;
    y: number;
    width: number;
    height: number;
    isDragging: boolean;
    offsetX: number;
    offsetY: number;
    layer: number;
  }
@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.css']
})
export class CanvasComponent implements OnInit {
  @ViewChild('canva', { static: false }) canvasRef?: ElementRef<HTMLCanvasElement>;
  private canv?: CanvasRenderingContext2D | null;
  private images: ImageObject[] = [];
  private selectedImageIndex: number = -1;

  constructor() {}
  ngOnInit(): void {
  }
  ngAfterViewInit() {
    this.canv = this.canvasRef?.nativeElement.getContext('2d');
    const savedImages = localStorage.getItem('savedImages');
    if (savedImages) {
      this.images = JSON.parse(savedImages);
      this.loadImages(); 
    }
  }
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.loadAndDrawImage(file);
    }
  }

  loadAndDrawImage(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: ProgressEvent<FileReader>) => {
      const src = e.target?.result as string;
      const imageObj: ImageObject = {
        src: src,
        x: 100,   
        y: 100,
        width: 0,
        height: 0,
        isDragging: false,
        offsetX: 0,
        offsetY: 0,
        layer: this.images.length + 1 
      }

      const img = new Image();
      img.onload = () => {
        imageObj.width = img.width;
        imageObj.height = img.height;
        this.images.push(imageObj);
        this.saveImagesToLocalStorage();
        this.drawImages();
      };
      img.src = src;
    };

    reader.readAsDataURL(file);
  }

  private drawImages(): void {
    if (this.canv) {
      this.canv.clearRect(0, 0, this.canv.canvas.width, this.canv.canvas.height);
      this.images.sort((a, b) => a.layer - b.layer);

      this.images.forEach(imageObj => {
        const img = new Image();
        img.onload = () => {
          this.canv?.drawImage(img, imageObj.x, imageObj.y, imageObj.width, imageObj.height);
        };
        img.src = imageObj.src;
      });
    }
  }
  onCanvasMouseDown(event: MouseEvent): void {
    if (this.canv) {
      const mouseX = event.offsetX;
      const mouseY = event.offsetY;
      for (let i = this.images.length - 1; i >= 0; i--) {
        const imageObj = this.images[i];
        if (mouseX >= imageObj.x && mouseX <= imageObj.x + imageObj.width &&
            mouseY >= imageObj.y && mouseY <= imageObj.y + imageObj.height) {
          this.selectedImageIndex = i;
          imageObj.isDragging = true;
          imageObj.offsetX = mouseX - imageObj.x;
          imageObj.offsetY = mouseY - imageObj.y;
          break;
        }
      }
      if (this.selectedImageIndex !== -1) {
        const selectedImage = this.images[this.selectedImageIndex];
        this.images.splice(this.selectedImageIndex, 1); 
        this.images.push(selectedImage); 
        this.selectedImageIndex = this.images.length - 1;
        this.saveImagesToLocalStorage();
      }
    }
  }

  onCanvasMouseMove(event: MouseEvent): void {
    if (this.canv && this.selectedImageIndex !== -1 && this.images[this.selectedImageIndex].isDragging) {
      const imageObj = this.images[this.selectedImageIndex];
      imageObj.x = event.offsetX - imageObj.offsetX;
      imageObj.y = event.offsetY - imageObj.offsetY;
      this.drawImages();
    }
  }
  onCanvasMouseUp(event: MouseEvent): void {
    if (this.canv && this.selectedImageIndex !== -1) {
      this.images[this.selectedImageIndex].isDragging = false;
      this.selectedImageIndex = -1;
      this.saveImagesToLocalStorage();
    }
  }
  onCanvasMouseLeave(event: MouseEvent): void {
    this.onCanvasMouseUp(event);
  }
  saveImagesToLocalStorage(): void {
    localStorage.setItem('savedImages', JSON.stringify(this.images));
  }

  loadImages(): void {
    if (this.canv) {
      this.images.forEach(imageObj => {
        const img = new Image();
        img.onload = () => {
          this.canv?.drawImage(img, imageObj.x, imageObj.y, imageObj.width, imageObj.height);
        };
        img.src = imageObj.src;
      });
    }
  }
}
