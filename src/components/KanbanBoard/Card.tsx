import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, GripVertical } from 'lucide-react';
import { Card as CardType } from '../../types/kanban';
import { useKanbanStore } from '../../store/useKanbanStore';

interface CardProps {
    card: CardType;
}

const ConfirmationModal: React.FC<{
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}> = ({ message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="custom-modal" onClick={(e) => e.stopPropagation()}>
                <p>{message}</p>
                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>Cancel</button>
                    <button className="btn-confirm" onClick={onConfirm}>Confirm</button>
                </div>
            </div>
        </div>
    );
};

export const Card: React.FC<CardProps> = ({ card }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [tempTitle, setTempTitle] = useState(card.title);
    const [modalType, setModalType] = useState<'edit' | 'delete' | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: card.id,
        disabled: isEditing,
        data: {
            type: 'Card',
            card,
        },
    });

    const deleteCard = useKanbanStore((state) => state.deleteCard);
    const updateCard = useKanbanStore((state) => state.updateCard);

    useEffect(() => {
        if (!isEditing) setTempTitle(card.title);
    }, [card.title, isEditing]);

    const style = {
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTempTitle(e.target.value);
    };

    const handleBlur = () => {
        if (tempTitle !== card.title) {
            setModalType('edit');
        } else {
            setIsEditing(false);
        }
    };

    const confirmEdit = () => {
        updateCard(card.id, tempTitle);
        setIsEditing(false);
        setModalType(null);
        toast.success('Task edit successfully', {
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
    };

    const cancelEdit = () => {
        setTempTitle(card.title);
        setIsEditing(false);
        setModalType(null);
    };

    const confirmDelete = () => {
        deleteCard(card.id);
        setModalType(null);
        toast.success('Deleted successfully', {
            style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
            }
        });
    };

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        setModalType('delete');
    };

    const handleCardClick = () => {
        if (isEditing) return;
        setIsEditing(true);
        setTimeout(() => inputRef.current?.focus(), 50);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            inputRef.current?.blur();
        } else if (e.key === 'Escape') {
            setTempTitle(card.title);
            setIsEditing(false);
        }
    };

    return (
        <>
            <div
                ref={setNodeRef}
                style={style}
                className={`kanban-card ${isEditing ? 'editing' : ''}`}
                onClick={handleCardClick}
            >
                {/* Drag handle - ONLY this area triggers drag */}
                <div
                    className="drag-handle"
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                >
                    <GripVertical size={16} />
                </div>

                <div className={`card-indicator ${card.columnId}`} />
                <div className="card-content">
                    <input
                        ref={inputRef}
                        className="card-title"
                        value={tempTitle}
                        onChange={handleTitleChange}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        readOnly={!isEditing}
                        onPointerDown={(e) => {
                            if (isEditing) e.stopPropagation();
                        }}
                    />
                    <div className="card-placeholder-bar" />
                </div>
                <button
                    className="delete-card-btn"
                    onClick={handleDeleteClick}
                    onPointerDown={(e) => e.stopPropagation()}
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {modalType === 'edit' && (
                <ConfirmationModal
                    message="Do you want to edit this?"
                    onConfirm={confirmEdit}
                    onCancel={cancelEdit}
                />
            )}

            {modalType === 'delete' && (
                <ConfirmationModal
                    message="Are you sure you want to delete this card?"
                    onConfirm={confirmDelete}
                    onCancel={() => setModalType(null)}
                />
            )}
        </>
    );
};
