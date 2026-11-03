"use client";

import { useState } from "react";

const ORIGINAL_COLOR = "#75947b";
const PRESET_COLORS = [
  { name: "Azul", value: "#5b8def" },
  { name: "Violeta", value: "#9a70b2" },
  { name: "Coral", value: "#d87968" },
  { name: "Dourado", value: "#c49a3a" },
  { name: "Turquesa", value: "#3d9991" },
];

export function ProgressColorPicker({ initialColor }: { initialColor: string }) {
  const [color, setColor] = useState(initialColor);

  return <div className="progress-color-picker">
    <div className="progress-color-heading">
      <label htmlFor="progress-color">Cor da barra</label>
      <input id="progress-color" aria-label="Escolha uma cor personalizada" name="progress_color" type="color" value={color} onChange={(event) => setColor(event.currentTarget.value)} />
    </div>
    <div className="progress-color-presets" aria-label="Cores predefinidas">
      {PRESET_COLORS.map((preset) => <button key={preset.value} type="button" className="progress-color-swatch" title={preset.name} aria-label={`Selecionar cor ${preset.name}`} aria-pressed={color === preset.value} style={{ backgroundColor: preset.value }} onClick={() => setColor(preset.value)} />)}
    </div>
    <button type="button" className="progress-color-reset" onClick={() => setColor(ORIGINAL_COLOR)}>Restaurar verde original</button>
  </div>;
}
