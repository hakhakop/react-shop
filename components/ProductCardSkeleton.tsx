import { Skeleton } from "./Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="product-card">
      <Skeleton className="h-[200px] w-full rounded-lg" />

      <div className="mt-2 flex flex-col gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}