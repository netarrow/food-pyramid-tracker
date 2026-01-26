import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import {
    Salad, Apple, Carrot, Leaf, // Base
    Wheat, Croissant, Square, Grip, // Energy (using Square for Tubers/Potatoes as block, Grip for Pseudocereals)
    Bean, Fish, Drumstick, Milk, Layers, // Structural
    Droplet, Nut, Cuboid, Pipette, // Fats (Cuboid for Animal Fats/Butter)
    Cake, Ham, Cookie, Wine, // Apex
    Egg, Steak
} from 'lucide-react';

const CATEGORIES = [
    // 1. Base (Vegetali e Fibre) - Green/Teal
    { id: 'Verdure', label: 'Verdure Foglia', icon: Salad, color: '#10b981' },
    { id: 'Frutta', label: 'Frutta Fresca', icon: Apple, color: '#10b981' },
    { id: 'Ortaggi', label: 'Ortaggi/Radici', icon: Carrot, color: '#10b981' },
    { id: 'Aromi', label: 'Erbe/Spezie', icon: Leaf, color: '#10b981' },

    // 2. Energetico (Carboidrati) - Yellow/Orange
    { id: 'Cereali', label: 'Cereali', icon: Wheat, color: '#f59e0b' },
    { id: 'Grano', label: 'Pane/Pasta', icon: Croissant, color: '#f59e0b' },
    { id: 'Tuberi', label: 'Patate/Tuberi', icon: Square, color: '#f59e0b' },
    { id: 'Pseudo', label: 'Pseudocereali', icon: Grip, color: '#f59e0b' },

    // 3. Strutturale (Proteine) - Red/Blue
    { id: 'Legumi', label: 'Legumi', icon: Bean, color: '#ef4444' },
    { id: 'Pesce', label: 'Pesce', icon: Fish, color: '#ef4444' },
    { id: 'CarneB', label: 'Carne Bianche', icon: Drumstick, color: '#ef4444' },
    { id: 'Uova', label: 'Uova', icon: Egg, color: '#ef4444' },
    { id: 'Latticini', label: 'Latticini', icon: Milk, color: '#3b82f6' },
    { id: 'VegProt', label: 'Alt. Vegetali', icon: Layers, color: '#ef4444' },

    // 4. Grassi (Lipidi) - Gold
    { id: 'Oli', label: 'Oli Vegetali', icon: Droplet, color: '#eab308' },
    { id: 'Noci', label: 'Frutta Guscio', icon: Nut, color: '#eab308' },
    { id: 'GrassiA', label: 'Grassi Animali', icon: Cuboid, color: '#eab308' },
    { id: 'Salse', label: 'Salse Grasse', icon: Pipette, color: '#eab308' },

    // 5. Occasionali (Apice) - Purple
    { id: 'Dolci', label: 'Dolci', icon: Cake, color: '#8b5cf6' },
    { id: 'CarneR', label: 'Carni Rosse', icon: Steak, color: '#8b5cf6' },
    { id: 'Insaccati', label: 'Insaccati', icon: Ham, color: '#8b5cf6' },
    { id: 'Snack', label: 'Snack Salati', icon: Cookie, color: '#8b5cf6' },
    { id: 'Bevande', label: 'Bev. Zuccherate', icon: Wine, color: '#8b5cf6' },
];

const MEAL_SLOTS = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];

// --- Components ---

function DraggableSource({ category }) {
    const { attributes, listeners, setNodeRef } = useDraggable({
        id: category.id,
        data: { type: 'source', category }
    });

    return (
        <div ref={setNodeRef} {...listeners} {...attributes} className="draggable-source" style={{ backgroundColor: category.color }}>
            <category.icon size={24} color="#fff" />
            <span className="source-label">{category.label}</span>
        </div>
    );
}

function MealSlot({ id, title, items, onRemove }) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
        data: { type: 'meal', mealId: id }
    });

    return (
        <div ref={setNodeRef} className={`meal-slot ${isOver ? 'highlight' : ''}`}>
            <h3>{title}</h3>
            <div className="meal-items">
                {items.length === 0 && <span className="placeholder">Drop food here</span>}
                {items.map((item, idx) => {
                    const cat = CATEGORIES.find(c => c.id === item);
                    const Icon = cat ? cat.icon : Droplet;
                    const label = cat ? cat.label : item;
                    return (
                        <div key={idx} className="meal-item-chip" onClick={() => onRemove(id, idx)}>
                            <Icon size={16} />
                            <span>{label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function DragItemOverlay({ id }) {
    const cat = CATEGORIES.find(c => c.id === id);
    if (!cat) return null;
    return (
        <div className="draggable-source overlay" style={{ backgroundColor: cat.color }}>
            <cat.icon size={24} color="#fff" />
        </div>
    );
}

// --- Main Tracker ---

const Tracker = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayLogs, setDayLogs] = useState({});
    const [activeDragId, setActiveDragId] = useState(null);

    // Load from LocalStorage
    useEffect(() => {
        const stored = localStorage.getItem('foodTrackerLogs');
        if (stored) {
            setDayLogs(JSON.parse(stored));
        }
    }, []);

    // Save to LocalStorage
    const saveLogs = (newLogs) => {
        setDayLogs(newLogs);
        localStorage.setItem('foodTrackerLogs', JSON.stringify(newLogs));
    };

    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);

        if (over && MEAL_SLOTS.includes(over.id)) {
            const categoryId = active.id;
            const mealId = over.id;

            // Get current day's data or init
            const currentDayData = dayLogs[date] || {};
            const currentMealData = currentDayData[mealId] || [];

            const newDayData = {
                ...currentDayData,
                [mealId]: [...currentMealData, categoryId]
            };

            const newLogs = {
                ...dayLogs,
                [date]: newDayData
            };

            saveLogs(newLogs);
        }
    };

    const removeItem = (mealId, index) => {
        const currentDayData = dayLogs[date] || {};
        const currentMealData = currentDayData[mealId] || [];

        const newMealData = [...currentMealData];
        newMealData.splice(index, 1);

        const newLogs = {
            ...dayLogs,
            [date]: {
                ...currentDayData,
                [mealId]: newMealData
            }
        };
        saveLogs(newLogs);
    };

    const currentDayData = dayLogs[date] || {};

    return (
        <div className="page-content tracker-layout">
            <div className="date-picker-section">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                />
            </div>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="tracker-columns">
                    {/* Source Column (Icons) */}
                    <div className="source-column card">
                        <h2>Foods</h2>
                        <div className="sources-grid">
                            {CATEGORIES.map(cat => (
                                <DraggableSource key={cat.id} category={cat} />
                            ))}
                        </div>
                    </div>

                    {/* Target Column (Meals) */}
                    <div className="target-column">
                        {MEAL_SLOTS.map(meal => (
                            <MealSlot
                                key={meal}
                                id={meal}
                                title={meal}
                                items={currentDayData[meal] || []}
                                onRemove={removeItem}
                            />
                        ))}
                    </div>
                </div>

                <DragOverlay>
                    {activeDragId ? <DragItemOverlay id={activeDragId} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default Tracker;
