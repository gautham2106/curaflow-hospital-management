
'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TableRow, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, UserX } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { QueueItem } from '@/lib/types';
import { useState, useEffect } from 'react';

const getStatusBadge = (status: QueueItem['status'], checkInTime: Date) => {
    switch (status) {
        case 'In-consultation':
            return <Badge className="bg-green-500 hover:bg-green-600 text-white shadow-md">🟢 NOW ({formatDistanceToNow(checkInTime)})</Badge>;
        case 'Waiting':
            return <Badge variant="outline" className="text-amber-600 border-amber-500 shadow-sm">⏳ WAITING</Badge>;
        case 'Completed':
            return <Badge variant="secondary" className="shadow-sm">✓ Completed</Badge>;
        case 'Cancelled':
            return <Badge variant="destructive" className="shadow-sm">✗ No-Show</Badge>;
        default:
            return <Badge variant="secondary" className="shadow-sm">{status}</Badge>;
    }
};

interface SortableTableRowProps {
    id: string;
    item: QueueItem;
    onMarkNoShow: (id: string) => void;
}

export function SortableTableRow({ id, item, onMarkNoShow }: SortableTableRowProps) {
    const isSortable = item.status === 'Waiting';
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id,
        disabled: !isSortable,
    });

    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1 : 0,
        position: 'relative',
    };

    return (
        <TableRow
            ref={setNodeRef}
            style={style}
            className={cn(
                item.status === 'In-consultation' && 'bg-green-50 font-bold',
                isDragging && 'bg-muted shadow-lg'
            )}
        >
            <TableCell className="w-[50px]">
                {isSortable ? (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-grab h-8 w-8"
                        {...listeners}
                        {...attributes}
                    >
                        <GripVertical className="h-4 w-4" />
                    </Button>
                ) : (
                    <div className="h-8 w-8" />
                )}
            </TableCell>
            <TableCell className="font-mono text-base">#{item.tokenNumber}</TableCell>
            <TableCell className="font-medium">{item.patientName}</TableCell>
            <TableCell>{isClient ? getStatusBadge(item.status, item.checkInTime) : ''}</TableCell>
            <TableCell className="text-right">
                {item.status === 'Waiting' && (
                     <Button variant="link" size="sm" className="text-destructive h-auto p-0" onClick={() => onMarkNoShow(item.id)}>
                        <UserX className="w-3 h-3 mr-1" />
                        No-Show
                    </Button>
                )}
            </TableCell>
        </TableRow>
    );
}

    