import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Column } from './Column';
import { Card } from './Card';
import { useKanbanStore } from '../../store/useKanbanStore';
import { ColumnId, Column as ColumnType, Card as CardType } from '../../types/kanban';
import './styles.css';

const columns: ColumnType[] = [
    { id: 'todo', title: 'Todo' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
];

export const KanbanBoard: React.FC = () => {
    const { cards, moveCard } = useKanbanStore();
    const [activeCard, setActiveCard] = useState<CardType | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5,
            }
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Bug Fix: Reset active state when editing starts or stops
    useEffect(() => {
        const handleFocus = () => setActiveCard(null);
        window.addEventListener('focusin', handleFocus);
        return () => window.removeEventListener('focusin', handleFocus);
    }, []);

    const getCardsByColumn = (columnId: ColumnId) => {
        return cards.filter((card) => card.columnId === columnId);
    };

    const onDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === 'Card') {
            setActiveCard(event.active.data.current.card);
        }
    };

    const onDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveACard = active.data.current?.type === 'Card';
        const isOverACard = over.data.current?.type === 'Card';

        if (!isActiveACard) return;

        // Dropping a Card over another Card
        if (isActiveACard && isOverACard && active.data.current && over.data.current) {
            const activeCardData = active.data.current.card;
            const overCardData = over.data.current.card;

            if (activeCardData.columnId !== overCardData.columnId) {
                // Change column and position
                moveCard(activeId as string, overCardData.columnId);
            }
        }

        // Dropping a Card over a Column
        const isOverAColumn = over.data.current?.type === 'Column';
        if (isActiveACard && isOverAColumn && active.data.current && over.data.current) {
            const activeCardData = active.data.current.card;
            const overColumnId = over.data.current.columnId;

            if (activeCardData.columnId !== overColumnId) {
                moveCard(activeId as string, overColumnId);
            }
        }
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const previousActiveCard = activeCard;
        setActiveCard(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const activeCardData = active.data.current?.card as CardType;
        const overData = over.data.current;

        let targetColumnName = "";
        if (overData?.type === 'Column') {
            targetColumnName = overData.columnId;
        } else if (overData?.type === 'Card') {
            targetColumnName = overData.card.columnId;
        }

        if (previousActiveCard && previousActiveCard.columnId !== targetColumnName) {
            const fromTitle = columns.find(c => c.id === previousActiveCard.columnId)?.title;
            const toTitle = columns.find(c => c.id === targetColumnName)?.title;

            toast.success(`Moved from ${fromTitle} to ${toTitle}`, {
                position: 'top-right',
                duration: 2500,
                style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '10px',
                    fontWeight: 600
                },
                iconTheme: {
                    primary: '#00c388',
                    secondary: '#fff',
                }
            });
        }

        useKanbanStore.getState().reorderCards(activeId as string, overId as string);
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDragEnd={onDragEnd}
        >
            <Toaster />
            <div className="kanban-board">
                {columns.map((column) => (
                    <Column
                        key={column.id}
                        column={column}
                        cards={getCardsByColumn(column.id)}
                    />
                ))}
            </div>

            <DragOverlay>
                {activeCard ? <Card card={activeCard} /> : null}
            </DragOverlay>
        </DndContext>
    );
};
