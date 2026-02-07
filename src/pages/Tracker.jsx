import { useState, useEffect } from 'react';
import { DndContext, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import {
    Salad, Apple, Leaf,
    Wheat, Square,
    Bean, Fish, Drumstick, Milk,
    Droplet, Nut,
    Cake, Ham,
    Egg, Beef,
    CircleSmall, Utensils, Coffee, IceCreamBowl, Disc // Portions
} from 'lucide-react';

const ICONS = {
    Salad,
    Apple,
    Wheat,
    Square,
    Droplet,
    Milk,
    Nut,
    Leaf,
    Bean,
    Drumstick,
    Fish,
    Egg,
    Beef,
    Ham,
    Cake
};

// Data rigenerati dalla piramide alimentare allegata (frequenze e porzioni)
const FOOD_PYRAMID = [
    {
        level: 'every_main_meal',
        foods: [
            { id: 'Verdure', label: 'Verdure', servings: '>=2p/die', icon: 'Salad', color: '#10b981' },
            { id: 'Frutta', label: 'Frutta', servings: '1-2p/die', icon: 'Apple', color: '#10b981' },
            { id: 'CerealiPatate', label: 'Pane/Pasta/Riso/Cereali integrali/Patate', servings: '1-2p/pasto', icon: 'Wheat', color: '#f59e0b' },
            { id: 'OlioOliva', label: 'Olio d oliva', servings: 'uso quotidiano', icon: 'Droplet', color: '#f59e0b' }
        ]
    },
    {
        level: 'every_day',
        foods: [
            { id: 'Latticini', label: 'Latticini (preferibilmente magri)', servings: '2p/die', icon: 'Milk', color: '#3b82f6' },
            { id: 'OliveNociSemi', label: 'Olive/Noci/Semi', servings: '1-2p/die', icon: 'Nut', color: '#eab308' },
            { id: 'ErbeSpezie', label: 'Erbe/Spezie/Aglio/Cipolla', servings: 'quotidiano', icon: 'Leaf', color: '#84cc16' },
            { id: 'Legumi', label: 'Legumi', servings: 'quotidiano', icon: 'Bean', color: '#84cc16' }
        ]
    },
    {
        level: 'occasional',
        foods: [
            { id: 'CarneProcessata', label: 'Carne processata', servings: '<=1p/settimana (occasionale)', icon: 'Ham', color: '#f97316' },
            { id: 'Dolci', label: 'Dolci', servings: '<=2p/settimana (occasionale)', icon: 'Cake', color: '#8b5cf6' },
            { id: 'CerealiRaffinati', label: 'Cereali raffinati', servings: 'occasionale', icon: 'Wheat', color: '#8b5cf6' }
        ]
    },
    {
        level: 'weekly',
        foods: [
            { id: 'CarneBianca', label: 'Carne bianca', servings: '2p/settimana', icon: 'Drumstick', color: '#ef4444' },
            { id: 'PesceFruttiMare', label: 'Pesce/Frutti di mare', servings: '>=2p/settimana', icon: 'Fish', color: '#ef4444' },
            { id: 'Uova', label: 'Uova', servings: '2-4p/settimana', icon: 'Egg', color: '#ef4444' },
            { id: 'CarneRossa', label: 'Carne rossa', servings: '<2p/settimana', icon: 'Beef', color: '#f97316' }
        ]
    }
];

const CATEGORIES = FOOD_PYRAMID.flatMap((band) =>
    band.foods.map((food) => ({
        id: food.id,
        label: food.label,
        icon: ICONS[food.icon] || Salad,
        color: food.color,
        level: band.level,
        servings: food.servings
    }))
);

const PYRAMID_LEVELS = ['occasional', 'weekly', 'every_day', 'every_main_meal'];

const PYRAMID_LEVEL_META = {
    occasional: { title: 'Occasional', subtitle: 'Rare foods' },
    weekly: { title: 'Weekly', subtitle: 'Moderate frequency' },
    every_day: { title: 'Every Day', subtitle: 'Daily balance' },
    every_main_meal: { title: 'Every Main Meal', subtitle: 'Foundation foods' }
};

const CATEGORIES_BY_LEVEL = PYRAMID_LEVELS.reduce((acc, level) => {
    acc[level] = CATEGORIES.filter((category) => category.level === level);
    return acc;
}, {});

const MEAL_SLOTS = ['Breakfast', 'Snack 1', 'Lunch', 'Snack 2', 'Dinner'];

const PORTIONS = [
    { id: 'teaspoon', label: 'Cucchiaino', icon: CircleSmall },
    { id: 'spoon', label: 'Cucchiaio', icon: Utensils },
    { id: 'cup', label: 'Tazzina', icon: Coffee },
    { id: 'bowl', label: 'Ciotola', icon: IceCreamBowl },
    { id: 'plate', label: 'Piatto', icon: Disc },
];

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
                    const categoryId = typeof item === 'string' ? item : item.id;
                    const portionId = typeof item === 'string' ? 'plate' : item.portion;

                    const cat = CATEGORIES.find(c => c.id === categoryId);
                    const portion = PORTIONS.find(p => p.id === portionId);

                    const Icon = cat ? cat.icon : Droplet;
                    const PortionIcon = portion ? portion.icon : Disc;
                    const label = cat ? cat.label : categoryId;

                    return (
                        <div key={idx} className="meal-item-chip" onClick={() => onRemove(id, idx)}>
                            <div className="chip-main">
                                <Icon size={16} />
                                <span>{label}</span>
                            </div>
                            <div className="chip-portion" title={portion ? portion.label : ''}>
                                <PortionIcon size={12} />
                            </div>
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

function PortionModal({ isOpen, onClose, onSelect }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>Seleziona Porzione</h3>
                <div className="portion-grid">
                    {PORTIONS.map(p => (
                        <div key={p.id} className="portion-item" onClick={() => onSelect(p.id)}>
                            <p.icon size={32} />
                            <span>{p.label}</span>
                        </div>
                    ))}
                </div>
                <button className="btn-cancel" onClick={onClose}>Annulla</button>
            </div>
        </div>
    );
}

// --- Main Tracker ---

const Tracker = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [dayLogs, setDayLogs] = useState({});
    const [activeDragId, setActiveDragId] = useState(null);
    const [pendingDrop, setPendingDrop] = useState(null); // { categoryId, mealId }

    // Mobile View State: 'foods' | 'meals'
    const [viewMode, setViewMode] = useState('foods');
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Load from LocalStorage & Migrate
    useEffect(() => {
        const stored = localStorage.getItem('foodTrackerLogs');
        if (stored) {
            const parsed = JSON.parse(stored);
            // Migration logic: convert strings to objects
            for (const d in parsed) {
                for (const m in parsed[d]) {
                    parsed[d][m] = parsed[d][m].map(item => {
                        if (typeof item === 'string') {
                            return { id: item, portion: 'plate' };
                        }
                        return item;
                    });
                }
            }
            setDayLogs(parsed);
        }
    }, []);

    // Save to LocalStorage
    const saveLogs = (newLogs) => {
        setDayLogs(newLogs);
        localStorage.setItem('foodTrackerLogs', JSON.stringify(newLogs));
    };

    const handleDragStart = (event) => {
        setActiveDragId(event.active.id);
        // Mobile: Auto-switch to meals view for drop target visibility
        if (window.innerWidth < 768) {
            setViewMode('meals');
        }
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveDragId(null);

        // Mobile: Could switch back to foods or stay on meals. 
        // Staying on meals (or the modal) might be better contextually.
        // For now, let's leave it as is, user can swipe back.

        if (over && MEAL_SLOTS.includes(over.id)) {
            setPendingDrop({
                categoryId: active.id,
                mealId: over.id
            });
        }
    };

    const confirmDrop = (portionId) => {
        if (!pendingDrop) return;

        const { categoryId, mealId } = pendingDrop;

        // Get current day's data or init
        const currentDayData = dayLogs[date] || {};
        const currentMealData = currentDayData[mealId] || [];

        const newItem = { id: categoryId, portion: portionId };

        const newDayData = {
            ...currentDayData,
            [mealId]: [...currentMealData, newItem]
        };

        const newLogs = {
            ...dayLogs,
            [date]: newDayData
        };

        saveLogs(newLogs);
        setPendingDrop(null);
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

    // Swipe Handlers
    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swiped Left -> Show Meals (Right side content)
            setViewMode('meals');
        } else if (isRightSwipe) {
            // Swiped Right -> Show Foods (Left side content)
            setViewMode('foods');
        }
    };

    const currentDayData = dayLogs[date] || {};

    return (
        <div
            className="page-content tracker-layout"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="date-picker-section">
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="date-input"
                />
            </div>

            {/* Mobile View Switcher Indicator */}
            <div className="mobile-view-tabs">
                <div
                    className={`tab ${viewMode === 'foods' ? 'active' : ''}`}
                    onClick={() => setViewMode('foods')}
                >
                    Foods
                </div>
                <div
                    className={`tab ${viewMode === 'meals' ? 'active' : ''}`}
                    onClick={() => setViewMode('meals')}
                >
                    Meals
                </div>
            </div>
            <div className="swipe-hint">Swipe ↔ to switch views</div>

            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <div className="tracker-columns">
                    {/* Source Column (Icons) */}
                    <div
                        className={`source-column card ${viewMode === 'meals' ? 'mobile-hidden' : ''}`}
                    >
                        <h2>Food Pyramid</h2>
                        <p className="pyramid-intro">Drag a food from the pyramid and drop it into a meal.</p>
                        <div className="pyramid-stack">
                            {PYRAMID_LEVELS.map((level) => (
                                <div key={level} className={`pyramid-tier level-${level}`}>
                                    <div className="tier-header">
                                        <span className="tier-title">{PYRAMID_LEVEL_META[level].title}</span>
                                        <span className="tier-subtitle">{PYRAMID_LEVEL_META[level].subtitle}</span>
                                    </div>
                                    <div className="tier-food-grid">
                                        {CATEGORIES_BY_LEVEL[level].map((cat) => (
                                            <DraggableSource key={cat.id} category={cat} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Target Column (Meals) */}
                    <div
                        className={`target-column ${viewMode === 'foods' ? 'mobile-hidden' : ''}`}
                    >
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

            <PortionModal
                isOpen={!!pendingDrop}
                onClose={() => setPendingDrop(null)}
                onSelect={confirmDrop}
            />
        </div>
    );
};

export default Tracker;
