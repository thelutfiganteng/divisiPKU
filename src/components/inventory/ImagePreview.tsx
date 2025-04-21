
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ImagePreviewProps {
  url: string;
  onClose: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ url, onClose }) => {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-transparent border-none shadow-none">
        <div className="relative rounded-lg overflow-hidden bg-black/90">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 text-white hover:bg-black/20"
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="flex items-center justify-center h-[80vh]">
            <img 
              src={url} 
              alt="Preview" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImagePreview;
