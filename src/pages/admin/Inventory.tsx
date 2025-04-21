import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/inventory";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash2, Search, RefreshCw, Eye, Plus } from "lucide-react";
import { Link } from "react-router-dom";
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
import InventoryDetail from "@/components/inventory/InventoryDetail";
import InventoryManage from "@/components/inventory/InventoryManage";

const Inventory = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);

  const fetchInventoryItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInventoryItems(data || []);
    } catch (error: any) {
      console.error("Error fetching inventory items:", error);
      toast.error(`Failed to load inventory: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const filteredItems = inventoryItems.filter((item) => {
    const searchString = searchTerm.toLowerCase();
    return (
      item.asset_number.toLowerCase().includes(searchString) ||
      item.nama_asset_1.toLowerCase().includes(searchString) ||
      (item.nama_asset_2 &&
        item.nama_asset_2.toLowerCase().includes(searchString)) ||
      item.alamat.toLowerCase().includes(searchString) ||
      item.kota.toLowerCase().includes(searchString)
    );
  });

  const confirmDelete = (item: InventoryItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const { error } = await supabase
        .from("inventory_items")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      setInventoryItems((prev) =>
        prev.filter((item) => item.id !== itemToDelete.id)
      );
      toast.success("Item deleted successfully");
    } catch (error: any) {
      console.error("Error deleting item:", error);
      toast.error(`Failed to delete: ${error.message}`);
    } finally {
      setItemToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const viewDetails = (item: InventoryItem) => {
    setSelectedItem(item);
    setShowDetailDialog(true);
  };

  const editInventoryItem = (item: InventoryItem) => {
    setEditItem(item);
    setShowManageDialog(true);
  };

  const addInventoryItem = () => {
    setEditItem(null);
    setShowManageDialog(true);
  };

  const handleImageClick = (imageUrl: string) => {
    console.log("Image clicked:", imageUrl);
    window.open(imageUrl, '_blank');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-[#0a192f]">Inventory Management</h1>
        <Button
          onClick={addInventoryItem}
          className="bg-[#FFF574] hover:bg-[#FFF574]"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Asset
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Button
            variant="outline"
            onClick={fetchInventoryItems}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="rounded-md border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">No</TableHead>
                  <TableHead>Asset Number</TableHead>
                  <TableHead>Nama Asset 1</TableHead>
                  <TableHead>Nama Asset 2</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Condition</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex justify-center items-center">
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Loading inventory items...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      {searchTerm
                        ? "No items match your search"
                        : "No inventory items found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{item.asset_number}</TableCell>
                      <TableCell>{item.nama_asset_1}</TableCell>
                      <TableCell>{item.nama_asset_2 || "-"}</TableCell>
                      <TableCell>{item.kota}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.kondisi === "Terpasang"
                              ? "bg-green-100 text-green-800"
                              : item.kondisi === "Tidak digunakan"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.kondisi}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => viewDetails(item)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => editInventoryItem(item)}
                            title="Edit item"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => confirmDelete(item)}
                            className="text-red-500"
                            title="Delete item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the asset{" "}
              <span className="font-semibold">
                {itemToDelete?.asset_number} - {itemToDelete?.nama_asset_1}
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setItemToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showDetailDialog && selectedItem && (
        <InventoryDetail
          item={selectedItem}
          onClose={() => setShowDetailDialog(false)}
          onImageClick={handleImageClick}
        />
      )}

      {showManageDialog && (
        <InventoryManage
          item={editItem}
          onClose={() => setShowManageDialog(false)}
          onSaved={fetchInventoryItems}
        />
      )}
    </div>
  );
};

export default Inventory;
