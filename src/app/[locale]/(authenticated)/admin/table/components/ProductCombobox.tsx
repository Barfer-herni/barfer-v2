'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, Search } from 'lucide-react';
import { cn } from '@/lib/utils/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';

interface ProductComboboxProps {
    value: string;
    onChange: (value: string) => void;
    products: string[];
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    fontSize?: 'text-xs' | 'text-sm';
}

export function ProductCombobox({
    value,
    onChange,
    products,
    disabled = false,
    placeholder = 'Seleccionar producto...',
    className,
    fontSize = 'text-xs',
}: ProductComboboxProps) {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const displayValue = value || placeholder;

    // Filtro simple que busca si el producto CONTIENE el texto buscado
    const filteredProducts = React.useMemo(() => {
        if (!search.trim()) return products;
        const searchLower = search.toLowerCase().trim();
        return products.filter(product => 
            product.toLowerCase().includes(searchLower)
        );
    }, [products, search]);

    // Focus en el input cuando se abre el popover
    React.useEffect(() => {
        if (open) {
            setSearch('');
            setTimeout(() => {
                inputRef.current?.focus();
            }, 0);
        }
    }, [open]);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                        `justify-between ${fontSize} h-8 font-normal`,
                        !value && 'text-muted-foreground',
                        className
                    )}
                    disabled={disabled}
                >
                    <span className="truncate flex-1 text-left">
                        {displayValue}
                    </span>
                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[350px] p-0" align="start">
                <div className="flex flex-col">
                    {/* Input de búsqueda */}
                    <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <Input
                            ref={inputRef}
                            placeholder="Buscar producto..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className={`${fontSize} border-0 p-0 h-8 focus-visible:ring-0 focus-visible:ring-offset-0`}
                        />
                    </div>
                    
                    {/* Lista de productos */}
                    <div className="max-h-[300px] overflow-y-auto p-1">
                        {filteredProducts.length === 0 ? (
                            <div className="py-6 text-center text-sm text-muted-foreground">
                                No se encontró "{search}"
                            </div>
                        ) : (
                            filteredProducts.map((product) => (
                                <div
                                    key={product}
                                    onClick={() => {
                                        onChange(product);
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        `flex items-center gap-2 px-2 py-1.5 ${fontSize} rounded-sm cursor-pointer`,
                                        'hover:bg-accent hover:text-accent-foreground',
                                        value === product && 'bg-accent'
                                    )}
                                >
                                    <Check
                                        className={cn(
                                            'h-3 w-3 shrink-0',
                                            value === product ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    <span className="truncate">{product}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
