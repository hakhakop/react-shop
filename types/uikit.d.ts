declare module "uikit" {
  const UIkit: {
   accordion: (
     element: HTMLElement,
     options?: Record<string, unknown>,
   ) => { $destroy?: (destroy: boolean) => void };
    icon?: (element: HTMLElement) => unknown;
  };
  export default UIkit;
}
