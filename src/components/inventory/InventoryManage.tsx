import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, InventoryItemFormData, InventoryCondition } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImagePlus, X } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

interface InventoryManageProps {
  item?: InventoryItem | null;
  onClose: () => void;
  onSaved: () => void;
}

const InventoryManage: React.FC<InventoryManageProps> = ({ 
  item, 
  onClose, 
  onSaved 
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<InventoryItemFormData>({
    asset_number: '',
    nama_asset_1: '',
    nama_asset_2: null,
    alamat: '',
    kota: '',
    keterangan_lokasi: null,
    foto_depan: null,
    foto_kiri: null,
    foto_kanan: null,
    kondisi: 'Terpasang',
  });

  // Preview images
  const [previewFotoDpn, setPreviewFotoDpn] = useState<string | null>(null);
  const [previewFotoKiri, setPreviewFotoKiri] = useState<string | null>(null);
  const [previewFotoKanan, setPreviewFotoKanan] = useState<string | null>(null);

  // File upload states
  const [fileFotoDpn, setFileFotoDpn] = useState<File | null>(null);
  const [fileFotoKiri, setFileFotoKiri] = useState<File | null>(null);
  const [fileFotoKanan, setFileFotoKanan] = useState<File | null>(null);

  useEffect(() => {
    if (item) {
      setFormData({
        asset_number: item.asset_number,
        nama_asset_1: item.nama_asset_1,
        nama_asset_2: item.nama_asset_2,
        alamat: item.alamat,
        kota: item.kota,
        keterangan_lokasi: item.keterangan_lokasi,
        foto_depan: item.foto_depan,
        foto_kiri: item.foto_kiri,
        foto_kanan: item.foto_kanan,
        kondisi: item.kondisi,
      });

      // Set preview images
      if (item.foto_depan) setPreviewFotoDpn(item.foto_depan);
      if (item.foto_kiri) setPreviewFotoKiri(item.foto_kiri);
      if (item.foto_kanan) setPreviewFotoKanan(item.foto_kanan);
    }
  }, [item]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: string) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "File size must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onloadend = () => {
      if (fileType === 'fotoDpn') {
        setPreviewFotoDpn(reader.result as string);
        setFileFotoDpn(file);
      } else if (fileType === 'fotoKiri') {
        setPreviewFotoKiri(reader.result as string);
        setFileFotoKiri(file);
      } else if (fileType === 'fotoKanan') {
        setPreviewFotoKanan(reader.result as string);
        setFileFotoKanan(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeImage = (imageType: string) => {
    if (imageType === 'fotoDpn') {
      setPreviewFotoDpn(null);
      setFileFotoDpn(null);
      setFormData(prev => ({ ...prev, foto_depan: null }));
    } else if (imageType === 'fotoKiri') {
      setPreviewFotoKiri(null);
      setFileFotoKiri(null);
      setFormData(prev => ({ ...prev, foto_kiri: null }));
    } else if (imageType === 'fotoKanan') {
      setPreviewFotoKanan(null);
      setFileFotoKanan(null);
      setFormData(prev => ({ ...prev, foto_kanan: null }));
    }
  };

  const uploadFile = async (file: File, path: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `${path}/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from('inventory_images')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Upload error: ${uploadError.message}`);
      }

      const { data: urlData } = supabase.storage
        .from('inventory_images')
        .getPublicUrl(filePath);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw new Error(`File upload failed: ${error.message}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Validate required fields
      if (!formData.asset_number || !formData.nama_asset_1 || !formData.alamat || !formData.kota) {
        toast({
          title: "Validation Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to save assets",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Upload images if new ones are selected
      let fotoDpnUrl = formData.foto_depan;
      let fotoKiriUrl = formData.foto_kiri;
      let fotoKananUrl = formData.foto_kanan;

      try {
        if (fileFotoDpn) {
          fotoDpnUrl = await uploadFile(fileFotoDpn, 'front');
        }

        if (fileFotoKiri) {
          fotoKiriUrl = await uploadFile(fileFotoKiri, 'left');
        }

        if (fileFotoKanan) {
          fotoKananUrl = await uploadFile(fileFotoKanan, 'right');
        }
      } catch (uploadError: any) {
        toast({
          title: "Image Upload Error",
          description: uploadError.message,
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }

      // Prepare data for saving
      const updatedData = {
        ...formData,
        foto_depan: fotoDpnUrl,
        foto_kiri: fotoKiriUrl,
        foto_kanan: fotoKananUrl,
        created_by: user.id
      };

      // Save to database
      let result;
      if (item) {
        // Update existing item
        result = await supabase
          .from('inventory_items')
          .update({
            asset_number: updatedData.asset_number,
            nama_asset_1: updatedData.nama_asset_1,
            nama_asset_2: updatedData.nama_asset_2,
            alamat: updatedData.alamat,
            kota: updatedData.kota,
            keterangan_lokasi: updatedData.keterangan_lokasi,
            foto_depan: updatedData.foto_depan,
            foto_kiri: updatedData.foto_kiri,
            foto_kanan: updatedData.foto_kanan,
            kondisi: updatedData.kondisi,
            updated_at: new Date().toISOString()
          })
          .eq('id', item.id);
      } else {
        // Insert new item
        result = await supabase
          .from('inventory_items')
          .insert([{
            asset_number: updatedData.asset_number,
            nama_asset_1: updatedData.nama_asset_1,
            nama_asset_2: updatedData.nama_asset_2,
            alamat: updatedData.alamat,
            kota: updatedData.kota,
            keterangan_lokasi: updatedData.keterangan_lokasi,
            foto_depan: updatedData.foto_depan,
            foto_kiri: updatedData.foto_kiri,
            foto_kanan: updatedData.foto_kanan,
            kondisi: updatedData.kondisi,
            created_by: updatedData.created_by
          }]);
      }

      if (result.error) {
        console.error('Database error:', result.error);
        throw new Error(`Database error: ${result.error.message}`);
      }

      toast({
        title: "Success",
        description: item ? "Item updated successfully" : "Item added successfully"
      });
      
      onSaved();
      onClose();
    } catch (error: any) {
      console.error('Error saving inventory item:', error);
      toast({
        title: "Error",
        description: `Failed to save: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Asset' : 'Add New Asset'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="asset_number" className="text-sm font-medium">
                Asset Number *
              </Label>
              <Input
                id="asset_number"
                name="asset_number"
                value={formData.asset_number}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kondisi" className="text-sm font-medium">
                Condition *
              </Label>
              <Select
                value={formData.kondisi}
                onValueChange={value => handleSelectChange('kondisi', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Terpasang">Terpasang</SelectItem>
                  <SelectItem value="Tidak digunakan">Tidak digunakan</SelectItem>
                  <SelectItem value="Rusak">Rusak</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_asset_1" className="text-sm font-medium">
                Primary Asset Name *
              </Label>
              <Input
                id="nama_asset_1"
                name="nama_asset_1"
                value={formData.nama_asset_1}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama_asset_2" className="text-sm font-medium">
                Secondary Asset Name
              </Label>
              <Input
                id="nama_asset_2"
                name="nama_asset_2"
                value={formData.nama_asset_2 || ''}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="alamat" className="text-sm font-medium">
                Address *
              </Label>
              <Input
                id="alamat"
                name="alamat"
                value={formData.alamat}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="kota" className="text-sm font-medium">
                City *
              </Label>
              <Input
                id="kota"
                name="kota"
                value={formData.kota}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="keterangan_lokasi" className="text-sm font-medium">
              Location Details
            </Label>
            <Textarea
              id="keterangan_lokasi"
              name="keterangan_lokasi"
              value={formData.keterangan_lokasi || ''}
              onChange={handleInputChange}
              className="w-full"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Front Photo</Label>
              <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                {previewFotoDpn ? (
                  <div className="relative w-full h-40">
                    <img 
                      src={previewFotoDpn} 
                      alt="Front preview" 
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage('fotoDpn')}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Label
                      htmlFor="foto_depan"
                      className="w-full h-40 flex flex-col items-center justify-center cursor-pointer"
                    >
                      <ImagePlus className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Upload photo</span>
                    </Label>
                    <Input
                      id="foto_depan"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'fotoDpn')}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Left Photo</Label>
              <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                {previewFotoKiri ? (
                  <div className="relative w-full h-40">
                    <img 
                      src={previewFotoKiri} 
                      alt="Left preview" 
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage('fotoKiri')}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Label
                      htmlFor="foto_kiri"
                      className="w-full h-40 flex flex-col items-center justify-center cursor-pointer"
                    >
                      <ImagePlus className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Upload photo</span>
                    </Label>
                    <Input
                      id="foto_kiri"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'fotoKiri')}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Right Photo</Label>
              <div className="border border-dashed rounded-md p-4 flex flex-col items-center justify-center">
                {previewFotoKanan ? (
                  <div className="relative w-full h-40">
                    <img 
                      src={previewFotoKanan} 
                      alt="Right preview" 
                      className="w-full h-full object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeImage('fotoKanan')}
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Label
                      htmlFor="foto_kanan"
                      className="w-full h-40 flex flex-col items-center justify-center cursor-pointer"
                    >
                      <ImagePlus className="h-10 w-10 text-gray-400" />
                      <span className="text-sm text-gray-500 mt-2">Upload photo</span>
                    </Label>
                    <Input
                      id="foto_kanan"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'fotoKanan')}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-[#0a192f] hover:bg-[#172a46]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                'Saving...' : 
                item ? 'Update Asset' : 'Add Asset'
              }
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InventoryManage;
