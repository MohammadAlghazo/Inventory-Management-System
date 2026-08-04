import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ImageCroppedEvent, ImageCropperComponent } from 'ngx-image-cropper';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-picture-modal',
  standalone: true,
  imports: [CommonModule, ImageCropperComponent, TranslatePipe],
  templateUrl: './profile-picture-modal.component.html',
  styleUrls: ['./profile-picture-modal.component.css']
})
export class ProfilePictureModalComponent {
  @Input() title: string = 'PROFILE.UPLOAD_PICTURE';
  @Input() cloudName: string = ''; // to be provided
  @Input() uploadPreset: string = ''; // to be provided
  @Output() close = new EventEmitter<void>();
  @Output() imageUploaded = new EventEmitter<string>();

  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  isUploading = false;
  uploadError = '';

  constructor(private http: HttpClient, private translate: TranslateService) {}

  fileChangeEvent(event: Event): void {
    this.imageChangedEvent = event;
    this.uploadError = '';
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.objectUrl || event.base64 || '';
  }

  imageLoaded() {
    // show cropper
  }

  cropperReady() {
    // cropper ready
  }

  loadImageFailed() {
    this.uploadError = this.translate.instant('PROFILE.IMAGE_LOAD_FAILED');
  }

  cancel() {
    this.close.emit();
  }

  async upload() {
    if (!this.croppedImage) {
      this.uploadError = this.translate.instant('PROFILE.IMAGE_CROP_REQUIRED');
      return;
    }
    
    if (!this.cloudName || !this.uploadPreset) {
      this.uploadError = this.translate.instant('PROFILE.IMAGE_CONFIG_MISSING');
      return;
    }

    this.isUploading = true;
    this.uploadError = '';

    try {
      // Convert base64/blob url to blob
      const blob = await fetch(this.croppedImage).then(r => r.blob());
      const formData = new FormData();
      formData.append('file', blob, 'profile.png');
      formData.append('upload_preset', this.uploadPreset);

      const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
      
      this.http.post<any>(url.replace(/"/g, ''), formData).subscribe({
        next: (response) => {
          this.imageUploaded.emit(response.secure_url);
          this.isUploading = false;
        },
        error: (err) => {
          this.uploadError = this.translate.instant('PROFILE.IMAGE_UPLOAD_FAILED');
          this.isUploading = false;
        }
      });
    } catch (e) {
      this.uploadError = this.translate.instant('PROFILE.IMAGE_PROCESS_FAILED');
      this.isUploading = false;
    }
  }
}
