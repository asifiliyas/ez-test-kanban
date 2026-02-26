import React from 'react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { Card as CardType, Column as ColumnType } from '../../types/kanban';
import { Card } from './Card';
import { useKanbanStore } from '../../store/useKanbanStore';

interface ColumnProps {
    column: ColumnType;
    cards: CardType[];
}

export const Column: React.FC<ColumnProps> = ({ column, cards }) => {
    const addCard = useKanbanStore((state) => state.addCard);
    const { setNodeRef } = useDroppable({
        id: column.id,
        data: {
            type: 'Column',
            columnId: column.id,
        },
    });

    return (
        <div className="kanban-column">
            <div className={`column-header ${column.id}`}>
                <div className="header-left">
                    <span>{column.title}</span>
                    <span className={`badge ${column.id}`}>{cards.length}</span>
                </div>
                <button className="add-column-btn" onClick={() => addCard(column.id, 'New Task')}>
                    <Plus size={16} />
                </button>
            </div>

            <div className="add-card-wrapper">
                <button className="add-card-btn" onClick={() => addCard(column.id, 'New Task')}>
                    <Plus size={14} /> Add Card
                </button>
            </div>

            <div ref={setNodeRef} className="cards-container">
                <SortableContext items={cards.map(c => c.id)} strategy={verticalListSortingStrategy}>
                    {cards.map((card) => (
                        <Card key={card.id} card={card} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};
