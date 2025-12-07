// app/page.tsx
import WPPage from "./[...slug]/page";

// Home route ("/") reuses the same logic as other WP pages,
// but with an "empty" slug → this becomes uri = "/" in your [...slug] file.
export default function HomePage() {
  return <WPPage params={Promise.resolve({ slug: [] })} />;
}