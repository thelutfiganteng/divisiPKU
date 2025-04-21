
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem, InventoryCondition } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, PlusCircle, Search, Save, X } from "lucide-react";
import InventoryManage from "@/components/inventory/InventoryManage";
import InventoryDetail from "@/components/inventory/InventoryDetail";
import ImagePreview from "@/components/inventory/ImagePreview";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showManageModal, setShowManageModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [currentItem, setCurrentItem] = useState<InventoryItem | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('all');
  
  // Edit mode state
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editData, setEditData] = useState<InventoryItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchInventoryItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInventoryItems(data as InventoryItem[] || []);
    } catch (error: any) {
      console.error('Error fetching inventory:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const handleAddClick = () => {
    setCurrentItem(null);
    setShowManageModal(true);
  };

  const handleEditClick = (item: InventoryItem) => {
    if (editingItem === item.id) {
      // Cancel edit mode if clicking edit again on the same item
      setEditingItem(null);
      setEditData(null);
    } else {
      // Enable edit mode for this item
      setEditingItem(item.id);
      setEditData({...item});
    }
  };

  const handleViewClick = (item: InventoryItem) => {
    setCurrentItem(item);
    setShowDetailModal(true);
  };

  const handleImageClick = (url: string) => {
    setCurrentImage(url);
    setShowImagePreview(true);
  };

  const initiateDelete = (id: number) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDeleteClick = async () => {
    if (!itemToDelete) return;
    
    try {
      const { error } = await supabase
        .from('inventory_items')
        .delete()
        .eq('id', itemToDelete);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Item deleted successfully',
      });
      
      // Update the local state to reflect the deletion
      setInventoryItems(items => items.filter(item => item.id !== itemToDelete));
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    } catch (error: any) {
      console.error('Error deleting item:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to delete item: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const handleEditChange = (field: string, value: string) => {
    if (editData) {
      setEditData({
        ...editData,
        [field]: value
      });
    }
  };

  const handleSaveClick = async () => {
    if (!editData || !editingItem) return;

    try {
      // Update in Supabase
      const { error } = await supabase
        .from('inventory_items')
        .update({
          asset_number: editData.asset_number,
          nama_asset_1: editData.nama_asset_1,
          nama_asset_2: editData.nama_asset_2,
          alamat: editData.alamat,
          kota: editData.kota,
          keterangan_lokasi: editData.keterangan_lokasi,
          kondisi: editData.kondisi,
        })
        .eq('id', editingItem);

      if (error) throw error;

      // Update local state
      setInventoryItems(items => 
        items.map(item => 
          item.id === editingItem ? {...editData} : item
        )
      );

      // Exit edit mode
      setEditingItem(null);
      setEditData(null);

      toast({
        title: 'Success',
        description: 'Item updated successfully',
      });
    } catch (error: any) {
      console.error('Error updating item:', error.message);
      toast({
        title: 'Error',
        description: 'Failed to update item: ' + error.message,
        variant: 'destructive',
      });
    }
  };

  const filteredItems = inventoryItems.filter(item => {
    const matchesSearch = 
      searchTerm === '' || 
      item.nama_asset_1.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.nama_asset_2 && item.nama_asset_2.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.kota.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.keterangan_lokasi && item.keterangan_lokasi.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCondition = filterCondition === 'all' || item.kondisi === filterCondition;
    
    return matchesSearch && matchesCondition;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-2xl font-bold mb-6 text-[#0a192f]">Asset Vista Nexus - Inventory Management</h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search assets..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Conditions</SelectItem>
                  <SelectItem value="Terpasang">Terpasang</SelectItem>
                  <SelectItem value="Tidak digunakan">Tidak digunakan</SelectItem>
                  <SelectItem value="Rusak">Rusak</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isAdmin && (
              <Button 
                onClick={handleAddClick}
                className="bg-[#0a192f] hover:bg-[#172a46] w-full md:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Asset
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-[#0a192f]">
                <TableRow>
                  <TableHead className="text-white">No</TableHead>
                  <TableHead className="text-white">Asset Number</TableHead>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Location</TableHead>
                  <TableHead className="text-white">Condition</TableHead>
                  <TableHead className="text-white">Images</TableHead>
                  <TableHead className="text-white">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      <div className="animate-spin h-8 w-8 border-4 border-[#0a192f] rounded-full border-t-transparent mx-auto"></div>
                      <p className="mt-2 text-gray-600">Loading inventory...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10">
                      No inventory items found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Input 
                            value={editData?.asset_number || ''} 
                            onChange={(e) => handleEditChange('asset_number', e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          item.asset_number
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <div className="space-y-2">
                            <Input 
                              value={editData?.nama_asset_1 || ''} 
                              onChange={(e) => handleEditChange('nama_asset_1', e.target.value)}
                              className="w-full"
                              placeholder="Primary Asset Name"
                            />
                            <Input 
                              value={editData?.nama_asset_2 || ''} 
                              onChange={(e) => handleEditChange('nama_asset_2', e.target.value)}
                              className="w-full"
                              placeholder="Secondary Asset Name"
                            />
                          </div>
                        ) : (
                          <>
                            {item.nama_asset_1}
                            {item.nama_asset_2 && <div className="text-xs text-gray-500">{item.nama_asset_2}</div>}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <div className="space-y-2">
                            <Input 
                              value={editData?.kota || ''} 
                              onChange={(e) => handleEditChange('kota', e.target.value)}
                              className="w-full"
                              placeholder="City"
                            />
                            <Input 
                              value={editData?.alamat || ''} 
                              onChange={(e) => handleEditChange('alamat', e.target.value)}
                              className="w-full"
                              placeholder="Address"
                            />
                            <Input 
                              value={editData?.keterangan_lokasi || ''} 
                              onChange={(e) => handleEditChange('keterangan_lokasi', e.target.value)}
                              className="w-full"
                              placeholder="Location Details"
                            />
                          </div>
                        ) : (
                          <>
                            {item.kota}
                            <div className="text-xs text-gray-500">{item.alamat}</div>
                            {item.keterangan_lokasi && (
                              <div className="text-xs text-gray-400">{item.keterangan_lokasi}</div>
                            )}
                          </>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <Select 
                            value={editData?.kondisi || 'Terpasang'} 
                            onValueChange={(value) => handleEditChange('kondisi', value as InventoryCondition)}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select condition" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Terpasang">Terpasang</SelectItem>
                              <SelectItem value="Tidak digunakan">Tidak digunakan</SelectItem>
                              <SelectItem value="Rusak">Rusak</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.kondisi === 'Terpasang' ? 'bg-green-100 text-green-800' :
                            item.kondisi === 'Tidak digunakan' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {item.kondisi}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          {item.foto_depan && (
                            <Button
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleImageClick(item.foto_depan!)}
                              className="p-1 h-8 w-8"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {item.foto_kiri && (
                            <Button
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleImageClick(item.foto_kiri!)}
                              className="p-1 h-8 w-8"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                          {item.foto_kanan && (
                            <Button
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleImageClick(item.foto_kanan!)}
                              className="p-1 h-8 w-8"
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingItem === item.id ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={handleSaveClick}
                              className="bg-green-600 text-white hover:bg-green-700 border-0"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setEditingItem(null);
                                setEditData(null);
                              }}
                              className="bg-gray-600 text-white hover:bg-gray-700 border-0"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewClick(item)}
                              className="bg-[#0a192f] text-white hover:bg-[#172a46] border-0"
                            >
                              View
                            </Button>
                            {isAdmin && (
                              <>
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditClick(item)}
                                  className="bg-yellow-600 text-white hover:bg-yellow-700 border-0"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => initiateDelete(item.id)}
                                  className="bg-red-600 text-white hover:bg-red-700 border-0"
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showManageModal && (
        <InventoryManage
          item={currentItem}
          onClose={() => setShowManageModal(false)}
          onSaved={fetchInventoryItems}
        />
      )}
      
      {showDetailModal && currentItem && (
        <InventoryDetail
          item={currentItem}
          onClose={() => setShowDetailModal(false)}
          onImageClick={handleImageClick}
        />
      )}
      
      {showImagePreview && currentImage && (
        <ImagePreview
          url={currentImage}
          onClose={() => setShowImagePreview(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClick} className="bg-red-600 text-white hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
