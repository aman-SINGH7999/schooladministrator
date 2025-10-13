"use client";

import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PropOptions {
  label: string;
  values: string[];
  onChange?: (value: string) => void; // 👈 callback prop for parent
  disabled?: boolean;
}

export default function SelectFilter({ label, values, onChange, disabled=false }: PropOptions) {
  const [selected, setSelected] = React.useState<string>("");

  const handleChange = (value: string) => {
    setSelected(value);
    if (onChange) onChange(value); // 👈 send value to parent
  };

  return (
    <Select onValueChange={handleChange} value={selected} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder={label} />
      </SelectTrigger>

      <SelectContent>
        {values.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
