
import { InventoryItem } from "@/types/inventory";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";

interface InventoryDetailProps {
  item: InventoryItem;
  onClose: () => void;
  onImageClick: (url: string) => void;
}

const InventoryDetail: React.FC<InventoryDetailProps> = ({
  item,
  onClose,
  onImageClick,
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#0a192f]">
            {item.nama_asset_1}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Asset Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold text-[#0a192f] text-lg mb-3">Asset Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-500">Asset Number:</span>
                  <span className="ml-2">{item.asset_number}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Primary Name:</span>
                  <span className="ml-2">{item.nama_asset_1}</span>
                </div>
                {item.nama_asset_2 && (
                  <div>
                    <span className="font-medium text-gray-500">Secondary Name:</span>
                    <span className="ml-2">{item.nama_asset_2}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-gray-500">Condition:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                    item.kondisi === 'Terpasang' ? 'bg-green-100 text-green-800' :
                    item.kondisi === 'Tidak digunakan' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>{item.kondisi}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Added:</span>
                  <span className="ml-2">{formatDate(item.created_at)}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Last Updated:</span>
                  <span className="ml-2">{formatDate(item.updated_at)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-[#0a192f] text-lg mb-3">Location Information</h3>
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-gray-500">City:</span>
                  <span className="ml-2">{item.kota}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-500">Address:</span>
                  <span className="ml-2">{item.alamat}</span>
                </div>
                {item.keterangan_lokasi && (
                  <div>
                    <span className="font-medium text-gray-500">Location Details:</span>
                    <p className="mt-1 text-gray-700">{item.keterangan_lokasi}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="font-semibold text-[#0a192f] text-lg mb-3">Asset Images</h3>
            {(!item.foto_depan && !item.foto_kiri && !item.foto_kanan) ? (
              <p className="text-gray-500">No images available</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {item.foto_depan && (
                  <div className="space-y-1">
                    <div className="aspect-square relative border rounded-md overflow-hidden">
                      <img 
                        src={item.foto_depan} 
                        alt="Front view" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                        size="sm"
                        onClick={() => onImageClick(item.foto_depan!)}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-center">Front View</p>
                  </div>
                )}
                
                {item.foto_kiri && (
                  <div className="space-y-1">
                    <div className="aspect-square relative border rounded-md overflow-hidden">
                      <img 
                        src={item.foto_kiri} 
                        alt="Left view" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                        size="sm"
                        onClick={() => onImageClick(item.foto_kiri!)}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-center">Left View</p>
                  </div>
                )}
                
                {item.foto_kanan && (
                  <div className="space-y-1">
                    <div className="aspect-square relative border rounded-md overflow-hidden">
                      <img 
                        src={item.foto_kanan} 
                        alt="Right view" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        variant="secondary"
                        className="absolute bottom-2 right-2 bg-white/80 hover:bg-white"
                        size="sm"
                        onClick={() => onImageClick(item.foto_kanan!)}
                      >
                        <ImageIcon className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                    <p className="text-sm text-center">Right View</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-4">
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryDetail;
