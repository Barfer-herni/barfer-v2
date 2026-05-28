'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ExternalLink } from 'lucide-react';
import { removeFromBlacklistAction } from '../actions';

interface BlacklistedUserAddress {
    address?: string;
    city?: string;
    floorNumber?: string;
    departmentNumber?: string;
    phone?: string;
}

interface BlacklistedUser {
    _id: string;
    email: string;
    name: string;
    lastName?: string;
    phoneNumber?: string;
    addresses?: BlacklistedUserAddress[];
}

interface BlacklistedUsersTableProps {
    users: BlacklistedUser[];
    total: number;
    page: number;
    totalPages: number;
    search: string;
    canEdit: boolean;
    locale: string;
}

export function BlacklistedUsersTable({
    users,
    total,
    page,
    totalPages,
    search,
    canEdit,
    locale,
}: BlacklistedUsersTableProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [searchInput, setSearchInput] = useState(search);
    const [loadingEmail, setLoadingEmail] = useState<string | null>(null);

    const updateParams = (updates: Record<string, string | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(updates).forEach(([key, value]) => {
            if (value) params.set(key, value);
            else params.delete(key);
        });
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleSearch = () => {
        updateParams({ search: searchInput || undefined, page: '1' });
    };

    const handleRemove = async (email: string) => {
        if (!window.confirm(`¿Quitar a ${email} de la lista negra?`)) return;
        setLoadingEmail(email);
        try {
            const result = await removeFromBlacklistAction(email);
            if (result.success) {
                startTransition(() => router.refresh());
            } else {
                alert(result.message || 'No se pudo quitar de la lista negra.');
            }
        } finally {
            setLoadingEmail(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por email, nombre o teléfono..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        className="pl-8"
                    />
                </div>
                <Button onClick={handleSearch} disabled={isPending}>
                    Buscar
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Direcciones vinculadas</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                                    No hay usuarios en la lista negra.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id} className="bg-red-50/50 dark:bg-red-950/20">
                                    <TableCell className="font-medium">
                                        {[user.name, user.lastName].filter(Boolean).join(' ') || '—'}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell className="max-w-xs text-sm">
                                        {user.addresses && user.addresses.length > 0 ? (
                                            <ul className="space-y-1">
                                                {user.addresses.map((addr, i) => (
                                                    <li key={i} className="whitespace-normal break-words">
                                                        {[addr.address, addr.city].filter(Boolean).join(', ')}
                                                        {addr.floorNumber ? ` · Piso ${addr.floorNumber}` : ''}
                                                        {addr.departmentNumber ? ` · Dto ${addr.departmentNumber}` : ''}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-muted-foreground">Sin direcciones guardadas</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{user.phoneNumber || '—'}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm" asChild>
                                                <Link
                                                    href={`/${locale}/admin/table?search=${encodeURIComponent(user.email)}`}
                                                    className="gap-1"
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Ver órdenes
                                                </Link>
                                            </Button>
                                            {canEdit && (
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    disabled={loadingEmail === user.email || isPending}
                                                    onClick={() => handleRemove(user.email)}
                                                >
                                                    Quitar de lista negra
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-muted-foreground">
                <span>{total} usuario{total !== 1 ? 's' : ''} en lista negra</span>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1 || isPending}
                        onClick={() => updateParams({ page: String(page - 1) })}
                    >
                        Anterior
                    </Button>
                    <span>
                        Página {page} de {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages || isPending}
                        onClick={() => updateParams({ page: String(page + 1) })}
                    >
                        Siguiente
                    </Button>
                </div>
            </div>
        </div>
    );
}
