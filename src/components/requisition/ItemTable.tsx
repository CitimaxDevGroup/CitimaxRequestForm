import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Plus } from "lucide-react";

export interface ItemTableProps {
  items?: Item[];
  onChange?: (items: Item[]) => void;
}

export interface Item {
  id: string;
  type: string;
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
      type: "",
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

  const unitOptions = [
    "pcs",
    "kg",
    "ltr",
    "box",
    "set",
    "roll",
    "meter",
    "pack",
    "unit",
    "other",
  ];
  const typeOptions = ["Material", "Equipment", "Tool", "Service", "Other"];

  return (
    <div className="w-full bg-white border-2 border-black">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="w-[60px] border-r border-black text-center font-bold">
                Item
              </TableHead>
              <TableHead className="w-[60px] border-r border-black text-center font-bold">
                Qty
              </TableHead>
              <TableHead className="w-[80px] border-r border-black text-center font-bold">
                Unit
              </TableHead>
              <TableHead className="w-[300px] border-r border-black text-center font-bold">
                Particulars
              </TableHead>
              <TableHead className="w-[150px] border-r border-black text-center font-bold">
                Remarks
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableItems.map((item, index) => (
              <TableRow key={item.id} className="border-b border-black">
                <TableCell className="border-r border-black text-center p-2">
                  <div className="font-semibold">{index + 1}</div>
                </TableCell>
                <TableCell className="border-r border-black text-center p-2">
                  <Input
                    value={item.qty}
                    onChange={(e) =>
                      handleItemChange(item.id, "qty", e.target.value)
                    }
                    className="border-0 text-center h-8 p-1"
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="border-r border-black text-center p-2">
                  <Input
                    value={item.unit}
                    onChange={(e) =>
                      handleItemChange(item.id, "unit", e.target.value)
                    }
                    className="border-0 text-center h-8 p-1"
                    placeholder="-"
                  />
                </TableCell>
                <TableCell className="border-r border-black p-2">
                  <Input
                    value={item.particulars}
                    onChange={(e) =>
                      handleItemChange(item.id, "particulars", e.target.value)
                    }
                    className="border-0 h-8 p-1"
                    placeholder="Enter particulars"
                  />
                </TableCell>
                <TableCell className="border-r border-black p-2">
                  <Input
                    value={item.remarks}
                    onChange={(e) =>
                      handleItemChange(item.id, "remarks", e.target.value)
                    }
                    className="border-0 h-8 p-1"
                    placeholder="Enter remarks"
                  />
                </TableCell>
                <TableCell className="p-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveRow(item.id)}
                    disabled={tableItems.length === 1}
                    className="h-6 w-6"
                  >
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemTable;
