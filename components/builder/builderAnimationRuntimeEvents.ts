/**
 * Shared document event names for the builder's compositor-only animation
 * runtime. Keeping this in a dependency-free module lets the iframe bridge
 * observe animation frames without importing a client component.
 */
export const BUILDER_PARALLAX_FRAME_EVENT = "builder:parallax-frame";
