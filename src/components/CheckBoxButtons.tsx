"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

type CheckBoxButtonsProps = {
  options: string[];
  onChange?: (selected: string[]) => void;
  defaultSelected?: string[];
};

export default function CheckBoxButtons({
  options,
  onChange,
  defaultSelected = [],
}: CheckBoxButtonsProps) {
  const [selected, setSelected] = useState<string[]>(defaultSelected);

  const handleToggle = (option: string) => {
    const updated = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];

    setSelected(updated);
    onChange?.(updated); // notify parent
  };

  return (
    <div className="flex gap-4">
      {options.map((option, i) => (
        <div key={option + i} className="flex items-center space-x-2">
          <Checkbox
            id={option + i}
            checked={selected.includes(option)}
            onCheckedChange={() => handleToggle(option)}
          />
          <Label htmlFor={option + i} className="cursor-pointer">
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
}
