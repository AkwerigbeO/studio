"use client";

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const fonts = [
  { label: 'Geist Sans', value: 'var(--font-geist-sans)' },
  { label: 'Geist Mono', value: 'var(--font-geist-mono)' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Helvetica', value: 'Helvetica, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
];

const FontSelector = () => {
  const [selectedFont, setSelectedFont] = useState(fonts[0].value);

  const handleFontChange = (fontValue: string) => {
    setSelectedFont(fontValue);
    document.documentElement.style.setProperty('--timer-font', fontValue);
  };

  return (
    <div className="mb-4">
      <Select value={selectedFont} onValueChange={handleFontChange}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font.value} value={font.value}>
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <style jsx global>{`
        :root {
          --timer-font: ${selectedFont};
        }
      `}</style>
    </div>
  );
};

export default FontSelector;
