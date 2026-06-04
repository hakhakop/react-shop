import os

path = "/Users/hakobjaghatspanyan/Projects/react-shop/components/dashboard/DashboardInspector.tsx"
with open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Helper to replace using normalized line matching
def replace_normalized(content, target, replacement, search_from_end=False):
    lines = content.splitlines()
    source_non_blank = [(line_idx, l.strip()) for line_idx, l in enumerate(lines) if l.strip()]
    target_lines = [l.strip() for l in target.splitlines() if l.strip()]
    
    found_idx = -1
    
    # We can search forwards or backwards
    iterator = range(len(source_non_blank) - len(target_lines) + 1)
    if search_from_end:
        iterator = reversed(iterator)
        
    for i in iterator:
        match = True
        for j in range(len(target_lines)):
            if source_non_blank[i+j][1] != target_lines[j]:
                match = False
                break
        if match:
            found_idx = source_non_blank[i][0]
            end_line_idx = source_non_blank[i + len(target_lines) - 1][0]
            break
            
    if found_idx != -1:
        indent = lines[found_idx][:len(lines[found_idx]) - len(lines[found_idx].lstrip())]
        replacement_lines = []
        for rl in replacement.splitlines():
            if rl.strip() == "":
                replacement_lines.append("")
            else:
                # Add proper indent to replacement lines
                replacement_lines.append(indent + rl.strip())
        
        new_lines = lines[:found_idx] + replacement_lines + lines[end_line_idx + 1:]
        return "\n".join(new_lines), True
    return content, False

# 1. Alignment target
alignment_target = """<label className="builder-field">
  <span>Alignment</span>
  <select
    value={block.headingAlign ?? "left"}
    onChange={(event) =>
      updateSelectedLayoutBlock(
        index,
        blockIndex,
        { headingAlign: event.target.value as "left" | "center" | "right" },
      )
    }
  >
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>
  </select>
</label>"""

alignment_replacement = """<label className="builder-field">
  <span>Alignment</span>
  <select
    value={block.headingAlign ?? "left"}
    onChange={(event) =>
      updateSelectedLayoutBlock(
        index,
        blockIndex,
        { headingAlign: event.target.value as "left" | "center" | "right" },
      )
    }
  >
    <option value="left">Left</option>
    <option value="center">Center</option>
    <option value="right">Right</option>
  </select>
</label>

<label className="builder-field">
  <span>Heading Gradient Preset</span>
  <select
    value={block.textGradientPreset ?? "none"}
    onChange={(event) =>
      updateSelectedLayoutBlock(
        index,
        blockIndex,
        { textGradientPreset: event.target.value as any },
      )
    }
  >
    <option value="none">None (Solid color)</option>
    <option value="indigo-purple">Indigo Purple</option>
    <option value="cyan-blue">Cyan Blue</option>
    <option value="emerald-teal">Emerald Teal</option>
    <option value="sunset-orange">Sunset Orange</option>
    <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
    <option value="sunset-pink">Sunset Pink</option>
    <option value="gold-amber">Gold Amber</option>
    <option value="custom">Custom Gradient</option>
  </select>
</label>

{block.textGradientPreset && block.textGradientPreset !== "none" && (() => {
  const currentPreset = block.textGradientPreset;
  const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#ffffff", "#60a5fa", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
  const startColor = block.textGradientCustomStart ?? defaultColors[0];
  const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
  const endColor = block.textGradientCustomEnd ?? defaultColors[2];
  const startOffset = block.textGradientCustomStartOffset ?? 0;
  const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
  const endOffset = block.textGradientCustomEndOffset ?? 100;
  const angle = block.textGradientCustomAngle ?? 135;

  return (
    <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <label className="builder-field" style={{ flex: 1 }}>
          <span>Start Color</span>
          <input
            type="color"
            value={startColor}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStart: e.target.value });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
        </label>
        <label className="builder-field" style={{ flex: 1 }}>
          <span>Middle Color</span>
          <input
            type="color"
            value={middleColor}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddle: e.target.value });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
        </label>
        <label className="builder-field" style={{ flex: 1 }}>
          <span>End Color</span>
          <input
            type="color"
            value={endColor}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEnd: e.target.value });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
        </label>
      </div>
      
      <label className="builder-field">
        <span>Start Color Weight (Offset)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            style={{ flex: 1 }}
            value={startOffset}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Middle Color Weight (Offset)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            style={{ flex: 1 }}
            value={middleOffset}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
        </div>
      </label>

      <label className="builder-field">
        <span>End Color Weight (Offset)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            style={{ flex: 1 }}
            value={endOffset}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Angle (degrees)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            style={{ flex: 1 }}
            value={angle}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
        </div>
      </label>
    </div>
  );
})()}

<details className="builder-collapse">
  <summary>
    <InspectorGroupSummary
      title="Typewriter Text Animation"
      description="Configure typewriter dynamic cycles on title/body text."
      meta={block.typewriterEnabled ? "enabled" : "disabled"}
    />
  </summary>
  <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
    <input
      type="checkbox"
      checked={block.typewriterEnabled ?? false}
      onChange={(event) =>
        updateSelectedLayoutBlock(
          index,
          blockIndex,
          {
            typewriterEnabled:
              event.target.checked,
          },
        )
      }
    />
    <span>Enable Typewriter Animation</span>
  </label>

  {block.typewriterEnabled && (
    <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
      <div className="builder-contrast-note" style={{ fontSize: '12px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
        <strong>Bracket format instruction:</strong> Use square brackets with pipe separators to cycle multiple phrases. Example: <code>Build the future with [dynamic animations|interactive particles|typewriter effects|premium aesthetics]</code>
      </div>

      <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={block.typewriterLoop !== false}
          onChange={(event) =>
            updateSelectedLayoutBlock(
              index,
              blockIndex,
              {
                typewriterLoop:
                  event.target.checked,
              },
            )
          }
        />
        <span>Loop typing animation</span>
      </label>

      <label className="builder-field">
        <span>Typing Speed (ms)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="30"
            max="250"
            step="5"
            style={{ flex: 1 }}
            value={block.typewriterSpeed ?? 80}
            onChange={(event) =>
              updateSelectedLayoutBlock(
                index,
                blockIndex,
                {
                  typewriterSpeed:
                    Number(event.target.value),
                },
              )
            }
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterSpeed ?? 80}ms</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Erase Speed (ms)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            style={{ flex: 1 }}
            value={block.typewriterEraseSpeed ?? 40}
            onChange={(event) =>
              updateSelectedLayoutBlock(
                index,
                blockIndex,
                {
                  typewriterEraseSpeed:
                    Number(event.target.value),
                },
              )
            }
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterEraseSpeed ?? 40}ms</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Pause Delay (ms)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            style={{ flex: 1 }}
            value={block.typewriterDelay ?? 2000}
            onChange={(event) =>
              updateSelectedLayoutBlock(
                index,
                blockIndex,
                {
                  typewriterDelay:
                    Number(event.target.value),
                },
              )
            }
          />
          <span style={{ minWidth: '50px', textAlign: 'right' }}>{block.typewriterDelay ?? 2000}ms</span>
        </div>
      </label>

      <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={block.typewriterUseGradient !== false}
          onChange={(event) =>
            updateSelectedLayoutBlock(
              index,
              blockIndex,
              {
                typewriterUseGradient:
                  event.target.checked,
              },
            )
          }
        />
        <span>Apply gradient preset to text</span>
      </label>

      {block.typewriterUseGradient !== false && (
        <>
          <label className="builder-field">
            <span>Gradient Preset Theme</span>
            <select
              value={block.typewriterGradientPreset ?? "indigo-purple-cyan"}
              onChange={(event) =>
                updateSelectedLayoutBlock(
                  index,
                  blockIndex,
                  {
                    typewriterGradientPreset:
                      event.target.value,
                  },
                )
              }
            >
              <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
              <option value="emerald-teal">Emerald Teal</option>
              <option value="sunset-pink">Sunset Pink</option>
              <option value="gold-amber">Gold Amber</option>
              <option value="indigo-purple">Indigo Purple</option>
              <option value="cyan-blue">Cyan Blue</option>
              <option value="sunset-orange">Sunset Orange</option>
              <option value="custom">Custom Gradient</option>
            </select>
          </label>
          {block.typewriterGradientPreset !== "none" && (() => {
            const currentPreset = block.typewriterGradientPreset ?? "indigo-purple-cyan";
            const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#60a5fa", "#818cf8", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
            const startColor = block.textGradientCustomStart ?? defaultColors[0];
            const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
            const endColor = block.textGradientCustomEnd ?? defaultColors[2];
            const startOffset = block.textGradientCustomStartOffset ?? 0;
            const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
            const endOffset = block.textGradientCustomEndOffset ?? 100;
            const angle = block.textGradientCustomAngle ?? 135;

            return (
              <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginTop: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <label className="builder-field" style={{ flex: 1 }}>
                    <span>Start Color</span>
                    <input
                      type="color"
                      value={startColor}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomStart: e.target.value });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                  </label>
                  <label className="builder-field" style={{ flex: 1 }}>
                    <span>Middle Color</span>
                    <input
                      type="color"
                      value={middleColor}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomMiddle: e.target.value });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                  </label>
                  <label className="builder-field" style={{ flex: 1 }}>
                    <span>End Color</span>
                    <input
                      type="color"
                      value={endColor}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomEnd: e.target.value });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                  </label>
                </div>
                
                <label className="builder-field">
                  <span>Start Color Weight (Offset)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      style={{ flex: 1 }}
                      value={startOffset}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>Middle Color Weight (Offset)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      style={{ flex: 1 }}
                      value={middleOffset}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>End Color Weight (Offset)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      style={{ flex: 1 }}
                      value={endOffset}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>Angle (degrees)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      style={{ flex: 1 }}
                      value={angle}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
                  </div>
                </label>
              </div>
            );
          })()}
        </>
      )}
    </div>
  )}
</details>"""

# 2. Fallback Title target
title_target = """<label className="builder-field">
  <span>Title</span>
  <input
    value={block.title ?? ""}
    onChange={(event) =>
      updateSelectedLayoutBlock(
        index,
        blockIndex,
        {
          title:
            event.target.value,
        },
      )
    }
  />
</label>"""

title_replacement = """<label className="builder-field">
  <span>Title</span>
  <input
    value={block.title ?? ""}
    onChange={(event) =>
      updateSelectedLayoutBlock(
        index,
        blockIndex,
        {
          title:
            event.target.value,
        },
      )
    }
  />
</label>

<label className="builder-field">
  <span>Title Gradient Preset</span>
  <select
    value={block.textGradientPreset ?? "none"}
    onChange={(event) =>
      updateSelectedLayoutBlock(
        index,
        blockIndex,
        {
          textGradientPreset:
            event.target.value as any,
        },
      )
    }
  >
    <option value="none">None (Solid color)</option>
    <option value="indigo-purple">Indigo Purple</option>
    <option value="cyan-blue">Cyan Blue</option>
    <option value="emerald-teal">Emerald Teal</option>
    <option value="sunset-orange">Sunset Orange</option>
    <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
    <option value="sunset-pink">Sunset Pink</option>
    <option value="gold-amber">Gold Amber</option>
    <option value="custom">Custom Gradient</option>
  </select>
</label>

{block.textGradientPreset && block.textGradientPreset !== "none" && (() => {
  const currentPreset = block.textGradientPreset;
  const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#ffffff", "#60a5fa", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
  const startColor = block.textGradientCustomStart ?? defaultColors[0];
  const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
  const endColor = block.textGradientCustomEnd ?? defaultColors[2];
  const startOffset = block.textGradientCustomStartOffset ?? 0;
  const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
  const endOffset = block.textGradientCustomEndOffset ?? 100;
  const angle = block.textGradientCustomAngle ?? 135;

  return (
    <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginBottom: '12px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
        <label className="builder-field" style={{ flex: 1 }}>
          <span>Start Color</span>
          <input
            type="color"
            value={startColor}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStart: e.target.value });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
        </label>
        <label className="builder-field" style={{ flex: 1 }}>
          <span>Middle Color</span>
          <input
            type="color"
            value={middleColor}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddle: e.target.value });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
        </label>
        <label className="builder-field" style={{ flex: 1 }}>
          <span>End Color</span>
          <input
            type="color"
            value={endColor}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEnd: e.target.value });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
        </label>
      </div>
      
      <label className="builder-field">
        <span>Start Color Weight (Offset)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            style={{ flex: 1 }}
            value={startOffset}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Middle Color Weight (Offset)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            style={{ flex: 1 }}
            value={middleOffset}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
        </div>
      </label>

      <label className="builder-field">
        <span>End Color Weight (Offset)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            style={{ flex: 1 }}
            value={endOffset}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Angle (degrees)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="0"
            max="360"
            step="5"
            style={{ flex: 1 }}
            value={angle}
            onChange={(e) => {
              const patch = getCustomGradientPatch(block, "textGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
              updateSelectedLayoutBlock(index, blockIndex, patch);
            }}
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
        </div>
      </label>
    </div>
  );
})()}

<details className="builder-collapse">
  <summary>
    <InspectorGroupSummary
      title="Typewriter Text Animation"
      description="Configure typewriter dynamic cycles on title/body text."
      meta={block.typewriterEnabled ? "enabled" : "disabled"}
    />
  </summary>
  <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
    <input
      type="checkbox"
      checked={block.typewriterEnabled ?? false}
      onChange={(event) =>
        updateSelectedLayoutBlock(
          index,
          blockIndex,
          {
            typewriterEnabled:
              event.target.checked,
          },
        )
      }
    />
    <span>Enable Typewriter Animation</span>
  </label>

  {block.typewriterEnabled && (
    <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 0' }}>
      <div className="builder-contrast-note" style={{ fontSize: '12px', padding: '8px', background: 'rgba(0,0,0,0.03)', borderRadius: '4px', borderLeft: '3px solid #6366f1' }}>
        <strong>Bracket format instruction:</strong> Use square brackets with pipe separators to cycle multiple phrases. Example: <code>Build the future with [dynamic animations|interactive particles|typewriter effects|premium aesthetics]</code>
      </div>

      <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={block.typewriterLoop !== false}
          onChange={(event) =>
            updateSelectedLayoutBlock(
              index,
              blockIndex,
              {
                typewriterLoop:
                  event.target.checked,
              },
            )
          }
        />
        <span>Loop typing animation</span>
      </label>

      <label className="builder-field">
        <span>Typing Speed (ms)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="30"
            max="250"
            step="5"
            style={{ flex: 1 }}
            value={block.typewriterSpeed ?? 80}
            onChange={(event) =>
              updateSelectedLayoutBlock(
                index,
                blockIndex,
                {
                  typewriterSpeed:
                    Number(event.target.value),
                },
              )
            }
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterSpeed ?? 80}ms</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Erase Speed (ms)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="10"
            max="150"
            step="5"
            style={{ flex: 1 }}
            value={block.typewriterEraseSpeed ?? 40}
            onChange={(event) =>
              updateSelectedLayoutBlock(
                index,
                blockIndex,
                {
                  typewriterEraseSpeed:
                    Number(event.target.value),
                },
              )
            }
          />
          <span style={{ minWidth: '40px', textAlign: 'right' }}>{block.typewriterEraseSpeed ?? 40}ms</span>
        </div>
      </label>

      <label className="builder-field">
        <span>Pause Delay (ms)</span>
        <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            style={{ flex: 1 }}
            value={block.typewriterDelay ?? 2000}
            onChange={(event) =>
              updateSelectedLayoutBlock(
                index,
                blockIndex,
                {
                  typewriterDelay:
                    Number(event.target.value),
                },
              )
            }
          />
          <span style={{ minWidth: '50px', textAlign: 'right' }}>{block.typewriterDelay ?? 2000}ms</span>
        </div>
      </label>

      <label className="builder-check" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input
          type="checkbox"
          checked={block.typewriterUseGradient !== false}
          onChange={(event) =>
            updateSelectedLayoutBlock(
              index,
              blockIndex,
              {
                typewriterUseGradient:
                  event.target.checked,
              },
            )
          }
        />
        <span>Apply gradient preset to text</span>
      </label>

      {block.typewriterUseGradient !== false && (
        <>
          <label className="builder-field">
            <span>Gradient Preset Theme</span>
            <select
              value={block.typewriterGradientPreset ?? "indigo-purple-cyan"}
              onChange={(event) =>
                updateSelectedLayoutBlock(
                  index,
                  blockIndex,
                  {
                    typewriterGradientPreset:
                      event.target.value,
                  },
                )
              }
            >
              <option value="indigo-purple-cyan">Indigo Purple Cyan</option>
              <option value="emerald-teal">Emerald Teal</option>
              <option value="sunset-pink">Sunset Pink</option>
              <option value="gold-amber">Gold Amber</option>
              <option value="indigo-purple">Indigo Purple</option>
              <option value="cyan-blue">Cyan Blue</option>
              <option value="sunset-orange">Sunset Orange</option>
              <option value="custom">Custom Gradient</option>
            </select>
          </label>
          {block.typewriterGradientPreset !== "none" && (() => {
            const currentPreset = block.typewriterGradientPreset ?? "indigo-purple-cyan";
            const defaultColors = currentPreset !== "custom" ? (GRADIENT_PRESETS[currentPreset] ?? ["#60a5fa", "#818cf8", "#c084fc"]) : ["#ffffff", "#60a5fa", "#c084fc"];
            const startColor = block.textGradientCustomStart ?? defaultColors[0];
            const middleColor = block.textGradientCustomMiddle ?? defaultColors[1];
            const endColor = block.textGradientCustomEnd ?? defaultColors[2];
            const startOffset = block.textGradientCustomStartOffset ?? 0;
            const middleOffset = block.textGradientCustomMiddleOffset ?? 50;
            const endOffset = block.textGradientCustomEndOffset ?? 100;
            const angle = block.textGradientCustomAngle ?? 135;

            return (
              <div className="builder-effect-settings-subpanel" style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px 0', borderLeft: '3px solid #6366f1', paddingLeft: '8px', marginTop: '8px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <label className="builder-field" style={{ flex: 1 }}>
                    <span>Start Color</span>
                    <input
                      type="color"
                      value={startColor}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomStart: e.target.value });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                  </label>
                  <label className="builder-field" style={{ flex: 1 }}>
                    <span>Middle Color</span>
                    <input
                      type="color"
                      value={middleColor}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomMiddle: e.target.value });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                  </label>
                  <label className="builder-field" style={{ flex: 1 }}>
                    <span>End Color</span>
                    <input
                      type="color"
                      value={endColor}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomEnd: e.target.value });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                  </label>
                </div>
                
                <label className="builder-field">
                  <span>Start Color Weight (Offset)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      style={{ flex: 1 }}
                      value={startOffset}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomStartOffset: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{startOffset}%</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>Middle Color Weight (Offset)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      style={{ flex: 1 }}
                      value={middleOffset}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomMiddleOffset: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{middleOffset}%</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>End Color Weight (Offset)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      style={{ flex: 1 }}
                      value={endOffset}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomEndOffset: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{endOffset}%</span>
                  </div>
                </label>

                <label className="builder-field">
                  <span>Angle (degrees)</span>
                  <div className="builder-range-row" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      style={{ flex: 1 }}
                      value={angle}
                      onChange={(e) => {
                        const patch = getCustomGradientPatch(block, "typewriterGradientPreset", { textGradientCustomAngle: Number(e.target.value) });
                        updateSelectedLayoutBlock(index, blockIndex, patch);
                      }}
                    />
                    <span style={{ minWidth: '40px', textAlign: 'right' }}>{angle}°</span>
                  </div>
                </label>
              </div>
            );
          })()}
        </>
      )}
    </div>
  )}
</details>"""

# Run replacements
content, ok1 = replace_normalized(content, alignment_target, alignment_replacement)
print(f"Alignment replaced: {ok1}")

content, ok2 = replace_normalized(content, title_target, title_replacement, search_from_end=True)
print(f"Fallback title replaced: {ok2}")

if ok1 or ok2:
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("Successfully updated DashboardInspector.tsx!")
else:
    print("Error: Replaces failed.")
