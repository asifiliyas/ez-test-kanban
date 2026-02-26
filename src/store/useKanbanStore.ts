import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Card, ColumnId } from '../types/kanban';

interface KanbanState {
  cards: Card[];
  addCard: (columnId: ColumnId, title: string) => void;
  deleteCard: (id: string) => void;
  updateCard: (id: string, title: string) => void;
  moveCard: (id: string, toColumnId: ColumnId, newIndex?: number) => void;
  reorderCards: (activeId: string, overId: string) => void;
}

const initialCards: Card[] = [
  { id: '1', columnId: 'todo', title: 'Create initial project plan' },
  { id: '2', columnId: 'todo', title: 'Design landing page' },
  { id: '3', columnId: 'todo', title: 'Review codebase structure' },
  { id: '4', columnId: 'in-progress', title: 'Implement authentication' },
  { id: '5', columnId: 'in-progress', title: 'Set up database schema' },
  { id: '6', columnId: 'in-progress', title: 'Fix navbar bugs' },
  { id: '7', columnId: 'done', title: 'Organize project repository' },
  { id: '8', columnId: 'done', title: 'Write API documentation' },
];

export const useKanbanStore = create<KanbanState>()(
  persist(
    (set) => ({
      cards: initialCards,
      addCard: (columnId, title) =>
        set((state) => ({
          cards: [
            ...state.cards,
            { id: Math.random().toString(36).substring(2, 9), columnId, title },
          ],
        })),
      deleteCard: (id) =>
        set((state) => ({
          cards: state.cards.filter((card) => card.id !== id),
        })),
      updateCard: (id, title) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === id ? { ...card, title } : card
          ),
        })),
      moveCard: (id, toColumnId, newIndex) =>
        set((state) => {
          const cardIndex = state.cards.findIndex((card) => card.id === id);
          if (cardIndex === -1) return state;

          const newCards = [...state.cards];
          const [movedCard] = newCards.splice(cardIndex, 1);
          const updatedCard = { ...movedCard, columnId: toColumnId };

          if (newIndex !== undefined) {
            newCards.splice(newIndex, 0, updatedCard);
          } else {
            newCards.push(updatedCard);
          }

          return { cards: newCards };
        }),
      reorderCards: (activeId, overId) =>
        set((state) => {
          const oldIndex = state.cards.findIndex((c) => c.id === activeId);
          const newIndex = state.cards.findIndex((c) => c.id === overId);

          if (oldIndex === -1 || newIndex === -1) return state;

          const newCards = [...state.cards];
          const [movedCard] = newCards.splice(oldIndex, 1);

          newCards.splice(newIndex, 0, movedCard);
          return { cards: newCards };
        }),
    }),
    {
      name: 'kanban-storage',
    }
  )
);

