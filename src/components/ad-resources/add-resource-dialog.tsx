
'use client';
import { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, X, Film, FileImage, Timer, Loader2 } from 'lucide-react';
import type { AdResource } from '@/lib/types';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { SupabaseStorageService } from '@/lib/supabase/storage';

interface AddResourceDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onAddResource: (resource: Omit<AdResource, 'id'>) => void;
  onEditResource: (resource: AdResource) => void;
  existingResource: AdResource | null;
}

export function AddResourceDialog({ isOpen, onOpenChange, onAddResource, onEditResource, existingResource }: AddResourceDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'image' | 'video' | null>(null);
  const [duration, setDuration] = useState<number>(30);
  const [isUploading, setIsUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const isEditing = !!existingResource;

  useEffect(() => {
    if (isOpen && existingResource) {
      setTitle(existingResource.title);
      setPreviewUrl(existingResource.url);
      setDuration(existingResource.duration);
      setFileType(existingResource.type);
    } else {
      // Reset form when dialog opens for adding or closes
      setTitle('');
      setFile(null);
      setPreviewUrl(null);
      setFileType(null);
      setDuration(30);
    }
  }, [isOpen, existingResource]);


  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      const isImage = file.type.startsWith('image/');
      setFileType(isImage ? 'image' : 'video');
      setTitle(file.name);
      if(isImage) {
        setDuration(30); // Default to 30s for images
      }
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const droppedFile = event.dataTransfer.files?.[0];
    if (droppedFile) {
      setFile(droppedFile);
    }
  };
  
  const onVideoLoaded = () => {
    if(videoRef.current) {
        setDuration(Math.round(videoRef.current.duration));
    }
  }

  const handleSubmit = async () => {
    // For editing, a file is not required. For adding, it is.
    if (!isEditing && !file) {
      toast({ title: 'No file selected', description: 'Please select an image or video file.', variant: 'destructive' });
      return;
    }
     if (!previewUrl || !fileType) {
      toast({ title: 'File error', description: 'There was an issue with the selected file.', variant: 'destructive' });
      return;
    }
    if (!title) {
        toast({ title: 'Title is required', description: 'Please enter a title for the resource.', variant: 'destructive'});
        return;
    }

    // If we have a new file, upload it to Supabase Storage
    if (file) {
      setIsUploading(true);
      
      try {
        // Validate file
        const validation = SupabaseStorageService.validateFile(file);
        if (!validation.valid) {
          toast({ title: 'Invalid file', description: validation.error, variant: 'destructive' });
          return;
        }

        // Get clinic ID
        const clinicId = sessionStorage.getItem('clinicId');
        if (!clinicId) {
          toast({ title: 'Error', description: 'Clinic ID not found. Please refresh the page.', variant: 'destructive' });
          return;
        }

        // Upload file to Supabase Storage
        const uploadResult = await SupabaseStorageService.uploadFile(file, clinicId);
        
        if (!uploadResult.success) {
          toast({ title: 'Upload failed', description: uploadResult.error || 'Failed to upload file', variant: 'destructive' });
          return;
        }

        // Use the uploaded URL
        const finalUrl = uploadResult.url!;

        if (isEditing && existingResource) {
          // Delete old file if it exists and is a Supabase Storage URL
          if (existingResource.url && SupabaseStorageService.isSupabaseStorageUrl(existingResource.url)) {
            const oldFilePath = SupabaseStorageService.extractFilePath(existingResource.url);
            if (oldFilePath) {
              await SupabaseStorageService.deleteFile(oldFilePath);
            }
          }

          onEditResource({
            ...existingResource,
            title,
            duration,
            url: finalUrl,
            type: fileType,
          });
        } else {
          onAddResource({
            title,
            type: fileType,
            url: finalUrl,
            duration,
          });
        }

        toast({ title: 'Success', description: 'Resource uploaded successfully!' });
        onOpenChange(false);

      } catch (error: any) {
        console.error('Upload error:', error);
        toast({ title: 'Upload failed', description: error.message || 'Failed to upload file', variant: 'destructive' });
      } finally {
        setIsUploading(false);
      }
    } else {
      // No new file, just update existing resource
      if (isEditing && existingResource) {
        onEditResource({
          ...existingResource,
          title,
          duration,
        });
        onOpenChange(false);
      }
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Ad Resource' : 'Add New Ad Resource'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update the details for this resource.' : 'Select an image or video file from your device.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
            {(!file && !previewUrl) && (
                <div 
                    className="relative flex flex-col items-center justify-center w-full p-8 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <UploadCloud className="w-10 h-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-center text-muted-foreground">
                        <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">Image (PNG, JPG) or Video (MP4)</p>
                    <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*" onChange={handleFileChange} />
                </div>
            )}
            
            {(file || previewUrl) && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="relative w-full aspect-video border rounded-lg overflow-hidden bg-muted">
                        {fileType === 'image' && previewUrl && (
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                        )}
                        {fileType === 'video' && previewUrl && (
                            <video ref={videoRef} src={previewUrl} className="w-full h-full object-cover" controls onLoadedMetadata={onVideoLoaded} />
                        )}
                         {!isEditing && file && (
                          <button onClick={() => setFile(null)} className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white hover:bg-black/70">
                            <X className="w-4 h-4" />
                          </button>
                        )}
                        <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1">
                            {fileType === 'image' ? <FileImage className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                            <span className="truncate max-w-[200px]">{file?.name || (isEditing && 'Current Media')}</span>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="duration" className="flex items-center gap-2"><Timer className="w-4 h-4" /> Duration (seconds)</Label>
                        <Input 
                            id="duration"
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                            readOnly={fileType === 'video'}
                        />
                        {fileType === 'video' && <p className="text-xs text-muted-foreground">Duration is automatically detected for videos.</p>}
                    </div>
                </div>
            )}
        </div>
        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={!title || (!isEditing && !file) || isUploading}>
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              isEditing ? 'Save Changes' : 'Add Resource'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
