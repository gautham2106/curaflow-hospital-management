import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';

// Create client-side Supabase client for storage operations
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
  path?: string;
}

export class SupabaseStorageService {
  private static readonly BUCKET_NAME = 'ad-resources';

  /**
   * Upload a file to Supabase Storage
   * @param file - The file to upload
   * @param clinicId - The clinic ID for organization
   * @param folder - Optional folder name (defaults to clinic ID)
   * @returns UploadResult with success status and URL
   */
  static async uploadFile(
    file: File, 
    clinicId: string, 
    folder?: string
  ): Promise<UploadResult> {
    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop() || '';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const fileName = `${timestamp}_${randomId}.${fileExt}`;
      
      // Create folder path
      const folderPath = folder || clinicId;
      const filePath = `${folderPath}/${fileName}`;

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Storage upload error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        success: true,
        url: publicUrl,
        path: filePath
      };

    } catch (error: any) {
      console.error('File upload error:', error);
      return {
        success: false,
        error: error.message || 'Upload failed'
      };
    }
  }

  /**
   * Delete a file from Supabase Storage
   * @param filePath - The path of the file to delete
   * @returns UploadResult with success status
   */
  static async deleteFile(filePath: string): Promise<UploadResult> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([filePath]);

      if (error) {
        console.error('Storage delete error:', error);
        return {
          success: false,
          error: error.message
        };
      }

      return {
        success: true
      };

    } catch (error: any) {
      console.error('File delete error:', error);
      return {
        success: false,
        error: error.message || 'Delete failed'
      };
    }
  }

  /**
   * Extract file path from Supabase Storage URL
   * @param url - The public URL of the file
   * @returns The file path or null if invalid
   */
  static extractFilePath(url: string): string | null {
    try {
      // Extract path from URL like: https://project.supabase.co/storage/v1/object/public/ad-resources/clinic123/file.jpg
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');
      const bucketIndex = pathParts.indexOf(this.BUCKET_NAME);
      
      if (bucketIndex === -1 || bucketIndex >= pathParts.length - 1) {
        return null;
      }
      
      // Return the path after bucket name
      return pathParts.slice(bucketIndex + 1).join('/');
    } catch {
      return null;
    }
  }

  /**
   * Check if a URL is a Supabase Storage URL
   * @param url - The URL to check
   * @returns True if it's a Supabase Storage URL
   */
  static isSupabaseStorageUrl(url: string): boolean {
    return url.includes('supabase.co/storage/v1/object/public/') && 
           url.includes(this.BUCKET_NAME);
  }

  /**
   * Get file size limit for uploads
   * @returns File size limit in bytes (50MB)
   */
  static getFileSizeLimit(): number {
    return 50 * 1024 * 1024; // 50MB
  }

  /**
   * Get allowed MIME types for uploads
   * @returns Array of allowed MIME types
   */
  static getAllowedMimeTypes(): string[] {
    return [
      'image/jpeg',
      'image/png', 
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/webm',
      'video/quicktime'
    ];
  }

  /**
   * Validate file before upload
   * @param file - The file to validate
   * @returns Validation result
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Check file size
    if (file.size > this.getFileSizeLimit()) {
      return {
        valid: false,
        error: `File size must be less than ${this.getFileSizeLimit() / (1024 * 1024)}MB`
      };
    }

    // Check MIME type
    if (!this.getAllowedMimeTypes().includes(file.type)) {
      return {
        valid: false,
        error: `File type not supported. Allowed types: ${this.getAllowedMimeTypes().join(', ')}`
      };
    }

    return { valid: true };
  }
}
