"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Search, ChevronDown, Check, Upload, X } from "lucide-react";
import type { BuilderShellSettings } from "@/lib/builderShell";
import { GLOBAL_STYLE_TOKEN_DEFAULTS } from "@/lib/globalStyleTokens";

// Helper to convert hex to HSL
function hexToHsl(hexStr: string): { h: number; s: number; l: number } {
  let hex = hexStr.replace(/^#/, "");
  if (hex.length === 3) hex = hex.split("").map((c) => c + c).join("");
  const num = parseInt(hex, 16);
  if (isNaN(num)) return { h: 0, s: 0, l: 100 };
  const r = ((num >> 16) & 255) / 255;
  const g = ((num >> 8) & 255) / 255;
  const b = (num & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Helper to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

type ColorPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function YoothemeColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hexInput, setHexInput] = useState(value || "#ffffff");
  const swatchRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const [popoverPos, setPopoverPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });

  useEffect(() => {
    setMounted(true);
  }, []);

  const displayColor = value || "#ffffff";
  const initialHsl = hexToHsl(displayColor);
  const [hue, setHue] = useState(initialHsl.h);
  const [sat, setSat] = useState(initialHsl.s);
  const [light, setLight] = useState(initialHsl.l);

  useEffect(() => {
    setHexInput(value || "#ffffff");
    const hsl = hexToHsl(value || "#ffffff");
    setHue(hsl.h);
    setSat(hsl.s);
    setLight(hsl.l);
  }, [value]);

  const updateColorFromHsl = useCallback((newH: number, newS: number, newL: number) => {
    setHue(newH);
    setSat(newS);
    setLight(newL);
    const hex = hslToHex(newH, newS, newL);
    setHexInput(hex);
    onChange(hex);
  }, [onChange]);

  const handleOpen = () => {
    if (swatchRef.current) {
      const rect = swatchRef.current.getBoundingClientRect();
      const popoverWidth = 250;
      const popoverHeight = 310;

      // Smart vertical placement: drop down or flip up depending on viewport space
      let top = rect.bottom + 6;
      if (top + popoverHeight > window.innerHeight) {
        top = rect.top - popoverHeight - 6;
      }
      top = Math.max(10, Math.min(top, window.innerHeight - popoverHeight - 10));

      // Smart horizontal placement: keep inside viewport
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth) {
        left = window.innerWidth - popoverWidth - 12;
      }
      left = Math.max(10, left);

      setPopoverPos({ top, left });
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        swatchRef.current &&
        !swatchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="builder-design-control builder-design-color-yootheme" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0" }}>
      <span style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{label}</span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <button
          ref={swatchRef}
          type="button"
          onClick={handleOpen}
          className="yootheme-color-swatch-btn"
          style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            backgroundColor: displayColor,
            border: "2px solid rgba(255,255,255,0.2)",
            cursor: "pointer",
            boxShadow: "0 2px 5px rgba(0,0,0,0.3)",
            padding: 0,
            transition: "transform 0.15s ease",
          }}
          title={`Choose ${label}`}
        />
      </div>

      {isOpen && mounted && createPortal(
        <div
          ref={popoverRef}
          className="yootheme-color-popover-fixed"
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            zIndex: 999999,
            width: "250px",
            padding: "14px",
            backgroundColor: "#1e293b",
            borderRadius: "12px",
            boxShadow: "0 12px 35px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.12)",
            color: "#f8fafc",
          }}
        >
          {/* Saturation/Lightness 2D Color Box */}
          <div
            style={{
              width: "100%",
              height: "120px",
              borderRadius: "8px",
              background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, hsl(${hue}, 100%, 50%))`,
              position: "relative",
              cursor: "crosshair",
              marginBottom: "12px",
              overflow: "hidden",
            }}
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
              const newS = Math.round(x * 100);
              const newL = Math.round((1 - y) * 50);
              updateColorFromHsl(hue, newS, newL);
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${sat}%`,
                top: `${100 - light * 2}%`,
                transform: "translate(-50%, -50%)",
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "2px solid #ffffff",
                boxShadow: "0 0 4px rgba(0,0,0,0.6)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* Rainbow Hue Slider */}
          <div style={{ marginBottom: "12px" }}>
            <input
              type="range"
              min="0"
              max="360"
              value={hue}
              onChange={(e) => updateColorFromHsl(Number(e.target.value), sat, light)}
              style={{
                width: "100%",
                height: "10px",
                borderRadius: "5px",
                appearance: "none",
                background: "linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)",
                cursor: "pointer",
                outline: "none",
              }}
            />
          </div>

          {/* Color Preview Swatches */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px" }}>
            {["#6f40f1", "#111827", "#ffffff", "#38bdf8", "#16a34a", "#dc2626", "#d97706", "#64748b"].map((swatchHex) => (
              <button
                key={swatchHex}
                type="button"
                onClick={() => {
                  setHexInput(swatchHex);
                  onChange(swatchHex);
                  const hsl = hexToHsl(swatchHex);
                  setHue(hsl.h); setSat(hsl.s); setLight(hsl.l);
                }}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: swatchHex,
                  border: swatchHex === displayColor ? "2px solid #38bdf8" : "1px solid rgba(255,255,255,0.2)",
                  cursor: "pointer",
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Hex Input */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <input
              type="text"
              value={hexInput}
              onChange={(e) => {
                const val = e.target.value;
                setHexInput(val);
                if (/^#[0-9a-f]{3,8}$/i.test(val)) {
                  onChange(val);
                  const hsl = hexToHsl(val);
                  setHue(hsl.h); setSat(hsl.s); setLight(hsl.l);
                }
              }}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: "12px",
                fontFamily: "monospace",
                textAlign: "center",
                border: "1px solid #334155",
                borderRadius: "6px",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                textTransform: "uppercase",
              }}
              placeholder="#HEX / KEYWORD"
            />
            <span style={{ fontSize: "9px", color: "#94a3b8", textAlign: "center", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              HEX / KEYWORD
            </span>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

type FontPickerProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

const SYSTEM_FONTS = [
  "Inherit",
  "Manrope",
  "Inter",
  "system-ui",
  "Default System Font",
  "Consolas/Monaco",
  "Georgia",
  "Helvetica/Arial",
  "Lucida",
  "Times New Roman",
  "Trebuchet",
  "Verdana",
];

const GOOGLE_FONTS = [
  "42dot Sans",
  "ABeeZee",
  "Outfit",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Poppins",
  "Lato",
];

export function YoothemeFontPicker({ label, value, onChange }: FontPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const query = search.trim().toLowerCase();
  const filteredSystem = SYSTEM_FONTS.filter((f) => f.toLowerCase().includes(query));
  const filteredGoogle = GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(query));

  const currentValueDisplay = value || "Inherit";

  return (
    <div className="builder-design-control builder-design-font-yootheme" style={{ position: "relative" }}>
      <span style={{ fontSize: "13px", color: "#e2e8f0", fontWeight: 500 }}>{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "6px 10px",
          fontSize: "13px",
          border: "1px solid #334155",
          borderRadius: "6px",
          backgroundColor: "#0f172a",
          cursor: "pointer",
          color: "#f8fafc",
          marginTop: "4px",
        }}
      >
        <span style={{ fontFamily: currentValueDisplay === "Inherit" ? "inherit" : currentValueDisplay }}>
          {currentValueDisplay}
        </span>
        <ChevronDown size={14} style={{ opacity: 0.6 }} />
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 9999,
            marginTop: "4px",
            maxHeight: "240px",
            backgroundColor: "#1e293b",
            borderRadius: "8px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.1)",
            overflowY: "auto",
            padding: "8px",
            color: "#f8fafc",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", marginBottom: "8px" }}>
            <Search size={14} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search font..."
              style={{
                width: "100%",
                padding: "6px 8px 6px 28px",
                fontSize: "12px",
                border: "1px solid #334155",
                borderRadius: "6px",
                backgroundColor: "#0f172a",
                color: "#f8fafc",
                outline: "none",
              }}
              autoFocus
            />
          </div>

          {/* System Fonts */}
          {filteredSystem.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "4px 6px", letterSpacing: "0.5px" }}>
                SYSTEM FONTS
              </div>
              {filteredSystem.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    onChange(font === "Inherit" ? "inherit" : font);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "13px",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: font === "Inherit" ? "inherit" : font,
                    color: font === currentValueDisplay ? "#38bdf8" : "#e2e8f0",
                    fontWeight: font === currentValueDisplay ? 600 : 400,
                  }}
                >
                  <span>{font}</span>
                  {font === currentValueDisplay && <Check size={14} />}
                </button>
              ))}
            </div>
          )}

          {/* Google Fonts */}
          {filteredGoogle.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", padding: "4px 6px", letterSpacing: "0.5px" }}>
                GOOGLE FONTS
              </div>
              {filteredGoogle.map((font) => (
                <button
                  key={font}
                  type="button"
                  onClick={() => {
                    onChange(font);
                    setIsOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "6px 8px",
                    fontSize: "13px",
                    textAlign: "left",
                    border: "none",
                    background: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontFamily: font,
                    color: font === currentValueDisplay ? "#38bdf8" : "#e2e8f0",
                    fontWeight: font === currentValueDisplay ? 600 : 400,
                  }}
                >
                  <span>{font}</span>
                  {font === currentValueDisplay && <Check size={14} />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * YOOtheme LESS Variable Importer Modal
 */
export function YoothemeLessImportModal({
  isOpen,
  onClose,
  onImport,
}: {
  isOpen: boolean;
  onClose: () => void;
  onImport: (patch: Partial<BuilderShellSettings>) => void;
}) {
  const [lessText, setLessText] = useState("");

  if (!isOpen) return null;

  const handleParse = () => {
    const patch: Record<string, string> = {};
    const lines = lessText.split("\n");
    for (const line of lines) {
      const match = line.match(/^\s*@([a-z0-9-]+)\s*:\s*([^;]+);/i);
      if (match) {
        const varName = match[1].toLowerCase();
        const varVal = match[2].trim();
        if (varName.includes("primary-color") || varName === "global-color") patch.primaryColor = varVal;
        if (varName.includes("text-color") || varName === "global-text-color") patch.textColor = varVal;
        if (varName.includes("background") || varName === "global-background") patch.backgroundColor = varVal;
        if (varName.includes("font-family") || varName === "global-font-family") patch.fontFamilyBody = varVal;
        if (varName.includes("card-background")) patch.cardBackground = varVal;
        if (varName.includes("button-primary-background")) patch.buttonPrimaryBackground = varVal;
      }
    }
    onImport(patch);
    onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, backgroundColor: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
      <div style={{ width: "100%", maxWidth: "500px", backgroundColor: "#1e293b", borderRadius: "12px", padding: "20px", boxShadow: "0 20px 40px rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.1)", color: "#f8fafc" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700 }}>Import YOOtheme LESS Styles</h3>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>
          Paste your YOOtheme LESS theme variables below (e.g. <code>@global-color: #6F40F1; @global-font-family: Inter;</code>).
        </p>
        <textarea
          value={lessText}
          onChange={(e) => setLessText(e.target.value)}
          placeholder="@global-color: #6F40F1;\n@global-background: #ffffff;\n@global-font-family: Manrope;"
          rows={8}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", backgroundColor: "#0f172a", border: "1px solid #334155", color: "#f8fafc", fontFamily: "monospace", fontSize: "12px", outline: "none", resize: "vertical" }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "16px" }}>
          <button type="button" onClick={onClose} style={{ padding: "8px 14px", borderRadius: "6px", border: "1px solid #334155", backgroundColor: "transparent", color: "#cbd5e1", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Cancel</button>
          <button type="button" onClick={handleParse} style={{ padding: "8px 16px", borderRadius: "6px", border: "none", backgroundColor: "#6f40f1", color: "#ffffff", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>Import Style Tokens</button>
        </div>
      </div>
    </div>
  );
}
