import { useState, useRef, useEffect } from 'react';
import type { CatalogProduct } from '../../../types/catalogProduct';

interface CatalogSearchInputProps {
  catalog: CatalogProduct[];
  value: number | '';                   // selected product id ('' = none)
  onChange: (id: number | '') => void;
  disabled?: boolean;
  placeholder?: string;
}

const CatalogSearchInput = ({
  catalog,
  value,
  onChange,
  disabled = false,
  placeholder = '— Busca un producto —',
}: CatalogSearchInputProps) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display text when value changes externally
  const selectedProduct = catalog.find((p) => p.id === value) ?? null;

  // When the dropdown closes without a selection, restore the selected name or clear
  const handleBlurQuery = () => {
    // Small delay so click on option fires first
    setTimeout(() => {
      if (!open) return;
      setOpen(false);
      // Reset query to show current selection
      setQuery(selectedProduct?.name ?? '');
    }, 150);
  };

  // Filter catalog by query (case-insensitive, matches name or category)
  // Use optional chaining + fallback to '' to handle null fields from the backend
  const q = query.toLowerCase();
  const filtered = query.trim() === ''
    ? catalog
    : catalog.filter(
      (p) =>
        (p.name?.toLowerCase() ?? '').includes(q) ||
        (p.category?.toLowerCase() ?? '').includes(q)
    );

  // Close dropdown when clicking outside the component
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery(selectedProduct?.name ?? '');
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [selectedProduct]);

  const handleSelect = (product: CatalogProduct) => {
    onChange(product.id);
    setQuery(product.name ?? '');
    setOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setOpen(true);
    // Clear selection if user modifies the text
    if (value !== '') onChange('');
  };

  const handleFocus = () => {
    setQuery('');   // clear to show all options while typing
    setOpen(true);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="relative">
        <input
          ref={inputRef}
          id="pantry-product"
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-autocomplete="list"
          aria-controls="catalog-listbox"
          autoComplete="off"
          disabled={disabled}
          placeholder={disabled ? 'Cargando catálogo…' : placeholder}
          value={open ? query : (selectedProduct?.name ?? query)}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlurQuery}
          className="w-full border border-surface-300 rounded-lg pl-3 pr-8 py-2 font-body text-surface-900 focus:outline-none focus:ring-2 focus:ring-brand-500 transition disabled:opacity-60 disabled:bg-surface-100"
        />
        {/* Search icon */}
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-surface-400 pointer-events-none select-none text-sm">
          🔍
        </span>
      </div>

      {/* Dropdown list */}
      {open && (
        <ul
          id="catalog-listbox"
          role="listbox"
          className="absolute z-50 mt-1 w-full bg-white border border-surface-200 rounded-lg shadow-modal max-h-52 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-3 text-sm text-surface-400 font-body text-center">
              Sin resultados para &quot;{query}&quot;
            </li>
          ) : (
            filtered.map((product) => (
              <li
                key={product.id}
                role="option"
                aria-selected={product.id === value}
                onMouseDown={() => handleSelect(product)}   // mousedown fires before blur
                className={`px-3 py-2.5 cursor-pointer flex items-center justify-between gap-2 hover:bg-brand-50 transition-colors ${product.id === value ? 'bg-brand-50 font-semibold text-brand-700' : 'text-surface-800'
                  }`}
              >
                <span className="font-body text-sm">{product.name}</span>
                <span className="shrink-0 text-xs text-surface-400 font-body bg-surface-100 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default CatalogSearchInput;
