
import React from 'react';
import { Button } from "@/components/ui/button";
import { ImageIcon, PlusCircle, Camera } from "lucide-react";
import LoadingSpinner from '@/components/LoadingSpinner';

interface ProblemImageUploadProps {
  selectedImage: string | null;
  setSelectedImage: (image: string | null) => void;
  isLoading: boolean;
  onProcess: () => void;
  onCameraClick?: () => void;
}

const ProblemImageUpload: React.FC<ProblemImageUploadProps> = ({ 
  selectedImage, 
  setSelectedImage, 
  isLoading, 
  onProcess,
  onCameraClick 
}) => {
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 transition-colors hover:border-primary/50">
      {selectedImage ? (
        <div className="space-y-4 w-full">
          <div className="relative aspect-video w-full max-w-sm mx-auto overflow-hidden rounded-lg">
            <img 
              src={selectedImage} 
              alt="Uploaded problem" 
              className="object-contain w-full h-full"
            />
          </div>
          <div className="flex justify-center gap-4">
            <Button 
              variant="outline"
              onClick={() => setSelectedImage(null)}
            >
              删除
            </Button>
            <Button 
              onClick={onProcess}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" /> 
                  <span className="ml-2">处理中...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  解题
                </>
              )}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <ImageIcon className="w-12 h-12 mx-auto text-gray-400" />
          <div>
            <p className="text-lg font-medium">点击上传</p>
            <p className="text-sm text-muted-foreground">或拖放图片</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP 最大 10MB</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="outline" 
              className="relative"
              disabled={isLoading}
            >
              选择图片
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
            </Button>
            {onCameraClick && (
              <Button 
                variant="outline"
                onClick={onCameraClick}
                disabled={isLoading}
                className="flex items-center"
              >
                <Camera className="mr-2 h-4 w-4" />
                使用相机
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemImageUpload;
