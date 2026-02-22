// Skeleton placeholder rows for the shopping list while loading
const ShoppingListSkeleton = () => (
  <ul className="flex flex-col gap-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <li
        key={i}
        className="flex items-center gap-3 bg-white rounded-xl border border-surface-200 px-4 py-3 animate-pulse"
      >
        <div className="w-8 h-8 rounded-full bg-surface-200 shrink-0" />
        <div className="flex-1 flex flex-col gap-1.5">
          <div className="h-3.5 bg-surface-200 rounded w-2/3" />
          <div className="h-2.5 bg-surface-100 rounded w-1/2" />
        </div>
        <div className="w-8 h-8 rounded-lg bg-surface-100 shrink-0" />
      </li>
    ))}
  </ul>
);

export default ShoppingListSkeleton;
