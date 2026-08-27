'use client';

import { type ReactNode, useEffect, useMemo, useState } from 'react';

import Image from 'next/image';

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';

import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Search, Trash2 } from 'lucide-react';

export interface Column {
    key: string;
    label: string;

    render?: (row: any) => ReactNode;
}

export type ServerFilters = {
    sort?: string;
    page?: number;
    order?: 'asc' | 'desc';
    year?: number | undefined;
    month?: number | undefined;
    commodity_id?: string;
    region_id?: string;
    start_date?: string;
    end_date?: string;
};

type DropdownOption = { value: string; label: string };

export interface DataTableProps {
    columns: Column[];
    data: any[];
    searchKey: string;
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;

    serverSide?: boolean;
    useDatePicker?: boolean;
    isSearch?: boolean;
    currentPage?: number;
    totalItems?: number;
    itemsPerPage?: number;
    role?: string;
    codeRegion?: string;
    searchValue?: string;
    onPageChange?: (page: number) => void;
    onSearchChange?: (value: string) => void;
    isLoading?: boolean;

    alwaysShowPagination?: boolean;

    emptyMessage?: ReactNode;

    nowrap?: boolean;

    filters?: ServerFilters;

    onFiltersChange?: (next: ServerFilters) => void;

    sortOptions?: { value: string; label: string }[];

    commodityOptions?: DropdownOption[];
    commoditiesLoading?: boolean;
    commoditiesError?: string | null;

    regionOptions?: DropdownOption[];
    regionsLoading?: boolean;
    regionsError?: string | null;
}

function getPaginationRange(currentPage: number, totalPages: number) {
    const range: (number | '...')[] = [];

    if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) range.push(i);

        return range;
    }

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, currentPage + 2);

    if (currentPage <= 3) {
        start = 1;
        end = 5;
    } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
        end = totalPages;
    }

    for (let i = start; i <= end; i++) {
        range.push(i);
    }

    return range;
}

const TablePagination = ({
    currentPage,
    totalPages,
    totalItems,
    onPageChange
}: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
}) => {
    const pages = getPaginationRange(currentPage, totalPages);
    const [jumpPage, setJumpPage] = useState(currentPage.toString());

    useEffect(() => {
        setJumpPage(currentPage.toString());
    }, [currentPage]);

    const handleJumpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setJumpPage(e.target.value);
    };

    const submitJump = () => {
        const page = parseInt(jumpPage);
        if (!isNaN(page) && page >= 1 && page <= totalPages) {
            onPageChange(page);
        } else {
            setJumpPage(currentPage.toString());
        }
    };

    return (
        <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
            <div className='text-muted-foreground text-sm'>
                Total: <span className='text-foreground font-medium'>{totalItems}</span> entries
            </div>

            <div className='flex items-center gap-4'>
                <div className='flex items-center gap-2'>
                    <span className='text-muted-foreground text-sm'>Jump to</span>
                    <Input
                        type='number'
                        value={jumpPage}
                        onChange={handleJumpChange}
                        onKeyDown={(e) => e.key === 'Enter' && submitJump()}
                        onBlur={submitJump}
                        className='h-8 w-14 [appearance:textfield] px-2 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                    />
                    <span className='text-muted-foreground text-sm'>of {totalPages}</span>
                </div>

                <div className='flex items-center gap-1'>
                    <Button
                        variant='outline'
                        size='sm'
                        className='h-8 w-8 p-0'
                        disabled={currentPage === 1}
                        onClick={() => onPageChange(currentPage - 1)}>
                        <ChevronLeft className='h-4 w-4' />
                    </Button>

                    {pages.map((p) => (
                        <Button
                            key={p}
                            size='sm'
                            className='h-8 w-8 p-0'
                            variant={p === currentPage ? 'default' : 'outline'}
                            onClick={() => onPageChange(p as number)}>
                            {p}
                        </Button>
                    ))}

                    <Button
                        variant='outline'
                        size='sm'
                        className='h-8 w-8 p-0'
                        disabled={currentPage === totalPages}
                        onClick={() => onPageChange(currentPage + 1)}>
                        <ChevronRight className='h-4 w-4' />
                    </Button>
                </div>
            </div>
        </div>
    );
};

const TableHeaderComponent = ({ columns }: { columns: Column[] }) => {
    return (
        <TableHeader>
            <TableRow>
                {columns.map((column) => (
                    <TableHead
                        key={column.key}
                        className={column.key === 'action' ? 'w-20' : 'text-muted-foreground font-medium'}>
                        {column.label}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
};

const TableRowComponent = ({
    item,
    columns,
    onEdit,
    onDelete
}: {
    item: any;
    columns: Column[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
}) => {
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const handleConfirmDelete = () => {
        if (onDelete) onDelete(item);
        setIsAlertOpen(false);
    };

    return (
        <TableRow>
            {columns.map((column, index) => {
                if (column.render) {
                    return <TableCell key={column.key}>{column.render(item)}</TableCell>;
                }

                if (column.key === 'logo') {
                    return (
                        <TableCell key={column.key}>
                            <div className='bg-muted relative h-10 w-10 overflow-hidden rounded-full'>
                                <Image
                                    src={item.logo}
                                    alt={item.name || item.nama || 'Logo'}
                                    fill
                                    sizes='20'
                                    className='object-contain'
                                />
                            </div>
                        </TableCell>
                    );
                }

                if (column.key === 'icon_url') {
                    return (
                        <TableCell key={column.key}>
                            <div className='bg-muted relative h-10 w-10 overflow-hidden rounded-full'>
                                <Image
                                    src={item.icon_url}
                                    alt={item.name || item.nama || 'Icon'}
                                    fill
                                    sizes='20'
                                    className='object-contain'
                                />
                            </div>
                        </TableCell>
                    );
                }

                if (column.key === 'is_active') {
                    return (
                        <TableCell key={column.key}>
                            {item.is_active ? (
                                <Badge className='bg-green-500 text-white hover:bg-green-600'>Active</Badge>
                            ) : (
                                <Badge className='bg-red-500 text-white hover:bg-red-600'>Inactive</Badge>
                            )}
                        </TableCell>
                    );
                }

                if (column.key === 'action') {
                    return (
                        <TableCell key={column.key}>
                            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align='end' className='dashboard-theme dark'>
                                        <DropdownMenuItem
                                            className='cursor-pointer'
                                            onClick={() => onEdit && onEdit(item)}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className='cursor-pointer'
                                            onClick={() => setIsAlertOpen(true)}>
                                            <Trash2 className='mr-2 h-4 w-4' />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                <AlertDialogContent className='dashboard-theme dark'>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle className='text-white'>Delete this record?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. Deleted data cannot be recovered.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className='text-white'>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleConfirmDelete}>Yes, delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </TableCell>
                    );
                }
                if (column.key === 'actionOnlyEdit') {
                    return (
                        <TableCell key={column.key} width={80}>
                            <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                                            <MoreHorizontal className='h-4 w-4' />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className='dashboard-theme dark'>
                                        <DropdownMenuItem
                                            className='cursor-pointer'
                                            onClick={() => onEdit && onEdit(item)}>
                                            <Pencil className='mr-2 h-4 w-4' />
                                            Edit
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </AlertDialog>
                        </TableCell>
                    );
                }

                return (
                    <TableCell key={column.key} className={index === 1 ? 'font-medium' : ''}>
                        {item[column.key] ?? '-'}
                    </TableCell>
                );
            })}
        </TableRow>
    );
};

export function DataTable({
    columns,
    data,
    searchKey,
    onEdit,
    onDelete,
    serverSide = false,
    isSearch = true,
    useDatePicker = false,
    currentPage: externalPage,
    totalItems: externalTotal,
    itemsPerPage: externalLimit,
    searchValue,
    onPageChange,
    onSearchChange,
    isLoading,
    alwaysShowPagination = false,
    emptyMessage,
    nowrap = false,
    onFiltersChange,
    filters,
    sortOptions,
    commodityOptions,
    regionOptions,
    role,
    codeRegion
}: DataTableProps) {
    const [currentPage, setCurrentPage] = useState(externalPage ?? 1);
    const [search, setSearch] = useState(searchValue ?? '');

    const itemsPerPage = externalLimit ?? 10;

    const filteredData = useMemo(() => {
        if (serverSide) return data;

        const s = search.toLowerCase();

        return data.filter((item) => item[searchKey]?.toString().toLowerCase().includes(s));
    }, [search, data, searchKey, serverSide]);

    const totalItems = serverSide ? (externalTotal ?? data.length) : filteredData.length;

    const totalPages = Math.ceil(totalItems / itemsPerPage) === 0 ? 1 : Math.ceil(totalItems / itemsPerPage);

    const paginatedData = useMemo(() => {
        if (serverSide) return filteredData;

        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;

        return filteredData.slice(start, end);
    }, [currentPage, filteredData, itemsPerPage, serverSide]);

    useEffect(() => {
        if (serverSide && externalPage) {
            setCurrentPage(externalPage);
        }
    }, [externalPage, serverSide]);

    useEffect(() => {
        if (serverSide && searchValue !== undefined) {
            setSearch(searchValue);
        }
    }, [searchValue, serverSide]);

    useEffect(() => {
        if (!serverSide) {
            setCurrentPage(1);
        }
    }, [search, serverSide]);

    const handleInternalPageChange = (page: number) => {
        if (serverSide && onPageChange) {
            onPageChange(page);
        } else {
            setCurrentPage(page);
        }
    };

    const handleInternalSearchChange = (value: string) => {
        setSearch(value);

        if (serverSide && onSearchChange) {
            onSearchChange(value);
        }
    };

    const MONTHS = [
        { value: '1', label: 'Januari' },
        { value: '2', label: 'Februari' },
        { value: '3', label: 'Maret' },
        { value: '4', label: 'April' },
        { value: '5', label: 'Mei' },
        { value: '6', label: 'Juni' },
        { value: '7', label: 'Juli' },
        { value: '8', label: 'Agustus' },
        { value: '9', label: 'September' },
        { value: '10', label: 'Oktober' },
        { value: '11', label: 'November' },
        { value: '12', label: 'Desember' }
    ];

    const YEARS = Array.from({ length: 2050 - 2020 + 1 }, (_, i) => {
        const y = 2020 + i;

        return { value: String(y), label: String(y) };
    });

    return (
        <div className='w-full'>
            {isSearch && (
                <div className='mb-6'>
                    <div className='relative'>
                        <Search className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform' />
                        <Input
                            placeholder={`Search ${searchKey}...`}
                            value={search}
                            onChange={(e) => handleInternalSearchChange(e.target.value)}
                            className='pl-10'
                        />
                    </div>
                </div>
            )}

            {serverSide && onFiltersChange && (
                <div className='mb-4 flex w-full flex-col items-start justify-between gap-4 xl:flex-row xl:items-center'>
                    <div className='flex w-full flex-col items-start gap-2 xl:flex-row xl:items-center'>
                        <span>Filter</span>
                        <div className='grid w-full shrink-0 grid-cols-2 flex-col items-start gap-2 xl:flex xl:w-fit xl:flex-row xl:items-center'>
                            {commodityOptions && (
                                <Select
                                    value={filters?.commodity_id ?? 'all'}
                                    onValueChange={(v) =>
                                        onFiltersChange({
                                            ...filters,
                                            commodity_id: v === 'all' ? undefined : v,
                                            page: 1
                                        })
                                    }>
                                    <SelectTrigger className='w-full min-w-45 xl:w-45'>
                                        <SelectValue placeholder='Pilih Komoditas' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value='all'>Semua Komoditas</SelectItem>
                                        {commodityOptions.map((c) => (
                                            <SelectItem key={c.value} value={c.value}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {regionOptions && (
                                <Select
                                    value={
                                        role && codeRegion && role !== 'ROLE_SUPER_ADMIN'
                                            ? String(codeRegion)
                                            : (filters?.region_id ?? 'all')
                                    }
                                    onValueChange={(v) =>
                                        onFiltersChange({
                                            ...filters,
                                            region_id: v === 'all' ? undefined : v,
                                            page: 1
                                        })
                                    }
                                    disabled={Boolean(role && codeRegion && role !== 'ROLE_SUPER_ADMIN')}>
                                    <SelectTrigger className='w-full min-w-54 xl:w-54'>
                                        <SelectValue placeholder='Pilih Wilayah' />
                                    </SelectTrigger>

                                    <SelectContent>
                                        <SelectItem value='all'>Semua Wilayah</SelectItem>
                                        {regionOptions.map((c) => (
                                            <SelectItem key={c.value} value={String(c.value)}>
                                                {c.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {!useDatePicker && (
                                <Select
                                    value={filters?.year ? String(filters.year) : 'all'}
                                    onValueChange={(v) => {
                                        onFiltersChange?.({
                                            ...filters,
                                            year: v === 'all' ? undefined : Number(v),
                                            page: 1
                                        });
                                    }}>
                                    <SelectTrigger className='w-full min-w-45 xl:w-45'>
                                        <SelectValue placeholder='Pilih Tahun' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>Semua Tahun</SelectItem>
                                        {YEARS.map((y) => (
                                            <SelectItem key={y.value} value={y.value}>
                                                {y.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}

                            {!useDatePicker && (
                                <Select
                                    value={filters?.month ? String(filters.month) : 'all'}
                                    onValueChange={(v) => {
                                        onFiltersChange?.({
                                            ...filters,
                                            month: v === 'all' ? undefined : Number(v),
                                            page: 1
                                        });
                                    }}>
                                    <SelectTrigger className='w-full min-w-45 xl:w-45'>
                                        <SelectValue placeholder='Pilih Bulan' />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>Semua Bulan</SelectItem>
                                        {MONTHS.map((m) => (
                                            <SelectItem key={m.value} value={m.value}>
                                                {m.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                    </div>

                    <div className='flex items-center gap-2'>
                        <span>Urutkan</span>

                        <Select
                            value={filters?.sort ?? 'created_at'}
                            onValueChange={(v) => onFiltersChange({ ...filters, sort: v })}>
                            <SelectTrigger>
                                <SelectValue placeholder='Sort by' />
                            </SelectTrigger>
                            <SelectContent>
                                {(sortOptions ?? []).map((opt) => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}

            <div className={cn('rounded-md border', nowrap && '[&_td]:whitespace-nowrap [&_th]:whitespace-nowrap')}>
                <Table>
                    <TableHeaderComponent columns={columns} />

                    <TableBody>
                        {isLoading ? (
                            Array.from({ length: itemsPerPage }).map((_, i) => (
                                <TableRow key={`loading-${i}`}>
                                    {columns.map((col, j) => (
                                        <TableCell key={`cell-${i}-${j}`}>
                                            <div className='bg-muted h-6 w-full animate-pulse rounded' />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : paginatedData.length > 0 ? (
                            paginatedData.map((item, i) => (
                                <TableRowComponent
                                    key={item.id || i}
                                    item={item}
                                    columns={columns}
                                    onEdit={onEdit}
                                    onDelete={onDelete}
                                />
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className='text-muted-foreground py-8 text-center'>
                                    {emptyMessage ?? 'No data found'}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {(alwaysShowPagination || totalItems > itemsPerPage) && (
                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handleInternalPageChange}
                    totalItems={totalItems}
                />
            )}
        </div>
    );
}
