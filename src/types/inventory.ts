
export type InventoryCondition = 'Terpasang' | 'Tidak digunakan' | 'Rusak';

export type InventoryItem = {
  id: number;
  asset_number: string;
  nama_asset_1: string;
  nama_asset_2: string | null;
  alamat: string;
  kota: string;
  keterangan_lokasi: string | null;
  foto_depan: string | null;
  foto_kiri: string | null;
  foto_kanan: string | null;
  kondisi: InventoryCondition;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export type InventoryItemFormData = Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'created_by'>;
