
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import InventoryManage from "@/components/inventory/InventoryManage";

const AddAsset = () => {
  const navigate = useNavigate();
  const [showManageDialog, setShowManageDialog] = useState(true);
  
  const handleClose = () => {
    setShowManageDialog(false);
    navigate('/inventory');
  };
  
  const handleSaved = () => {
    toast.success("Asset added successfully");
    navigate('/inventory');
  };
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#FFF574]">Add New Asset</h1>
      
      {showManageDialog && (
        <InventoryManage
          item={null}
          onClose={handleClose}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
};

export default AddAsset;
