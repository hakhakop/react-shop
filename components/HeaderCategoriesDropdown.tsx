"use client";

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

type HeaderCategoriesDropdownProps = {
  children: ReactNode;
};

export default function HeaderCategoriesDropdown({
  children,
}: HeaderCategoriesDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isHoverEnabled, setIsHoverEnabled] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsHoverEnabled(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node | null;
      if (target && rootRef.current?.contains(target)) return;
      setIsOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [isOpen]);

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setIsOpen(true);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`site-header-categories${isOpen ? " is-open" : ""}`}
      onMouseEnter={() => isHoverEnabled && setIsOpen(true)}
      onMouseLeave={() => isHoverEnabled && setIsOpen(false)}
    >
      <button
        type="button"
        className="site-header-nav-link site-header-categories-toggle"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={handleKeyDown}
      >
        <span>Categories</span>
      </button>
      <div className="site-header-categories-panel">{children}</div>
    </div>
  );
}
