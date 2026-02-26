import React from 'react';
import { KanbanBoard } from './components/KanbanBoard';
import './App.css';

function App() {
    return (
        <div className="App">
            <header className="app-header">
                <h1>Kanban Board</h1>
            </header>
            <main>
                <KanbanBoard />
            </main>
        </div>
    );
}

export default App;
