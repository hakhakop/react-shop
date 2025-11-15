import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="breadcrumbs">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;

        return (
          <span key={i} className="breadcrumb-item">
            {item.href && !isLast ? (
              <Link href={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className="breadcrumb-current">{item.label}</span>
            )}

            {!isLast && <span className="breadcrumb-separator">›</span>}
          </span>
        );
      })}
    </nav>
  );
}