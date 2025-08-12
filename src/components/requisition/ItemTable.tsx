import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Plus } from "lucide-react";

export interface ItemTableProps {
  items?: Item[];
  onChange?: (items: Item[]) => void;
}

export interface Item {
  id: string;
  item: string;
  qty: string;
  unit: string;
  particulars: string;
  remarks: string;
}

const ItemTable = ({ items = [], onChange }: ItemTableProps) => {
  const tableItems = items;

  const handleAddRow = () => {
    const newItem: Item = {
      id: `${Date.now()}`,
      item: "",
      qty: "",
      unit: "",
      particulars: "",
      remarks: "",
    };

    const updatedItems = [...tableItems, newItem];
    if (onChange) onChange(updatedItems);
  };

  const handleRemoveRow = (id: string) => {
    if (tableItems.length === 1) return;
    const updatedItems = tableItems.filter((item) => item.id !== id);
    if (onChange) onChange(updatedItems);
  };

  const handleItemChange = (id: string, field: keyof Item, value: string) => {
    const updatedItems = tableItems.map((item) => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    });
    if (onChange) onChange(updatedItems);
  };

  return (
    <div className="w-full bg-white text-xs">
      {/* Grid-based table header */}
      <div 
        className="grid grid-cols-[5%_10%_10%_1fr_1fr] border border-gray-800 rounded-t-sm"
        style={{ gridTemplateColumns: "5% 10% 10% 37.5% 37.5%" }}
      >
        <div className="p-1 border-r border-gray-800 text-center font-bold">No.</div>
        <div className="p-1 border-r border-gray-800 text-center font-bold">Qty</div>
        <div className="p-1 border-r border-gray-800 text-center font-bold">Unit</div>
        <div className="p-1 border-r border-gray-800 text-center font-bold">Particulars</div>
        <div className="p-1 text-center font-bold">Remarks</div>
      </div>

      {/* Grid-based table body */}
      <div className="border border-gray-800 border-t-0 rounded-b-sm">
        {tableItems.map((item, index) => (
          <div 
            key={item.id}
            className="grid grid-cols-[5%_10%_10%_1fr_1fr]"
            style={{ gridTemplateColumns: "5% 10% 10% 37.5% 37.5%" }}
          >
            {/* Row Number */}
            <div className="p-1 border-r border-gray-800 flex items-center justify-center h-8">
              {index + 1}
            </div>
            
            {/* Quantity */}
            <div className="p-0 border-r border-gray-800">
              <Input
                value={item.qty}
                onChange={(e) => handleItemChange(item.id, "qty", e.target.value)}
                className="h-8 px-1 border-0 rounded-none w-full text-center text-xs focus-visible:ring-0 print:border-0 print:border-b-0"
                placeholder="-"
              />
            </div>
            
            {/* Unit */}
            <div className="p-0 border-r border-gray-800">
              <Input
                value={item.unit}
                onChange={(e) => handleItemChange(item.id, "unit", e.target.value)}
                className="h-8 px-1 border-0 rounded-none w-full text-center text-xs focus-visible:ring-0 print:border-0 print:border-b-0"
                placeholder="Unit"
              />
            </div>
            
            {/* Particulars */}
            <div className="p-0 border-r border-gray-800">
              <Input
                value={item.particulars}
                onChange={(e) => handleItemChange(item.id, "particulars", e.target.value)}
                className="h-8 px-1 border-0 rounded-none w-full text-xs focus-visible:ring-0 print:border-0 print:border-b-0"
                placeholder="Description"
              />
            </div>
            
            {/* Remarks */}
            <div className="p-0 flex">
              <Input
                value={item.remarks}
                onChange={(e) => handleItemChange(item.id, "remarks", e.target.value)}
                className="h-8 px-1 border-0 rounded-none w-full text-xs focus-visible:ring-0 print:border-0 print:border-b-0"
                placeholder="Notes"
              />
    
            </div>
          </div>
        ))}
      </div>

 
    </div>
  );
};

export default ItemTable;