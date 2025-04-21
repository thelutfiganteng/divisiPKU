
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Database, Package, Users, PieChart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { InventoryItem } from "@/types/inventory";
import { PieChart as ReChartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const Dashboard = () => {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    installed: 0,
    unused: 0,
    damaged: 0
  });

  const fetchInventoryItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("inventory_items")
        .select("*");

      if (error) throw error;
      
      const items = data || [];
      setInventoryItems(items);
      
      const totalItems = items.length;
      const installed = items.filter(item => item.kondisi === 'Terpasang').length;
      const unused = items.filter(item => item.kondisi === 'Tidak digunakan').length;
      const damaged = items.filter(item => item.kondisi === 'Rusak').length;
      
      setStats({
        total: totalItems,
        installed,
        unused,
        damaged
      });
      
    } catch (error: any) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const chartData = [
    { name: 'Terpasang', value: stats.installed, color: '#10b981' },
    { name: 'Tidak digunakan', value: stats.unused, color: '#f59e0b' },
    { name: 'Rusak', value: stats.damaged, color: '#ef4444' },
  ];

  const chartConfig = {
    terpasang: { 
      label: 'Terpasang',
      theme: { light: '#10b981', dark: '#10b981' }
    },
    tidak_digunakan: { 
      label: 'Tidak digunakan',
      theme: { light: '#f59e0b', dark: '#f59e0b' }
    },
    rusak: { 
      label: 'Rusak',
      theme: { light: '#ef4444', dark: '#ef4444' }
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-[#0a192f]">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Inventory items in system</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terpasang</CardTitle>
            <div className="h-4 w-4 rounded-full bg-green-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.installed}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.installed / stats.total) * 100) : 0}% of total inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tidak digunakan</CardTitle>
            <div className="h-4 w-4 rounded-full bg-yellow-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.unused}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.unused / stats.total) * 100) : 0}% of total inventory</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rusak</CardTitle>
            <div className="h-4 w-4 rounded-full bg-red-500"></div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.damaged}</div>
            <p className="text-xs text-muted-foreground">{stats.total > 0 ? Math.round((stats.damaged / stats.total) * 100) : 0}% of total inventory</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Inventory by Condition
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : stats.total === 0 ? (
              <div className="flex justify-center items-center h-64 text-muted-foreground">
                No inventory data available
              </div>
            ) : (
              <ChartContainer className="h-64" config={chartConfig}>
                <ReChartsPieChart margin={{ top: 20, right: 0, bottom: 20, left: 0 }}>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <ChartTooltip
                    content={
                      <ChartTooltipContent 
                        labelClassName="text-xs font-medium"
                        className="bg-background border border-border/50 shadow-lg"
                      />
                    }
                  />
                </ReChartsPieChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>User Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">User statistics will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
