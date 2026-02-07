import { useMemo, useState } from 'react';

const FOOD_META = {
    Verdure: { label: 'Vegetables', color: '#10b981' },
    Frutta: { label: 'Fruit', color: '#10b981' },
    CerealiPatate: { label: 'Whole grains or potatoes', color: '#f59e0b' },
    OlioOliva: { label: 'Olive oil', color: '#f59e0b' },
    Latticini: { label: 'Dairy (preferably low-fat)', color: '#3b82f6' },
    OliveNociSemi: { label: 'Vegetable oils/Nuts/Seeds', color: '#eab308' },
    ErbeSpezie: { label: 'Herbs/Spices/Garlic/Onion', color: '#84cc16' },
    Legumi: { label: 'Legumes', color: '#84cc16' },
    CarneProcessata: { label: 'Processed meat', color: '#f97316' },
    Dolci: { label: 'Sweets', color: '#8b5cf6' },
    CerealiRaffinati: { label: 'Refined grains', color: '#8b5cf6' },
    CarneBianca: { label: 'White meat', color: '#ef4444' },
    PesceFruttiMare: { label: 'Fish/Seafood', color: '#ef4444' },
    Uova: { label: 'Eggs', color: '#ef4444' },
    CarneRossa: { label: 'Red meat', color: '#f97316' }
};

const PORTION_SCORE = {
    teaspoon: 1,
    spoon: 2,
    cup: 3,
    bowl: 4,
    plate: 5
};

const formatDateISO = (date) => date.toISOString().slice(0, 10);

const getISOWeekStart = (date) => {
    const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = utcDate.getUTCDay() || 7; // Sunday -> 7
    utcDate.setUTCDate(utcDate.getUTCDate() - day + 1);
    return utcDate;
};

const getISOWeekValue = (date = new Date()) => {
    const weekStart = getISOWeekStart(date);
    const yearStart = new Date(Date.UTC(weekStart.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((weekStart - yearStart) / 86400000) + 1) / 7);
    return `${weekStart.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
};

const getWeekRange = (weekValue) => {
    const [yearRaw, weekRaw] = weekValue.split('-W');
    const year = Number(yearRaw);
    const week = Number(weekRaw);

    const jan4 = new Date(Date.UTC(year, 0, 4));
    const jan4Day = jan4.getUTCDay() || 7;
    const week1Monday = new Date(jan4);
    week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1);

    const start = new Date(week1Monday);
    start.setUTCDate(week1Monday.getUTCDate() + (week - 1) * 7);

    const end = new Date(start);
    end.setUTCDate(start.getUTCDate() + 6);

    return { start: formatDateISO(start), end: formatDateISO(end) };
};

const readTrackerLogs = () => {
    try {
        const raw = localStorage.getItem('foodTrackerLogs');
        return raw ? JSON.parse(raw) : {};
    } catch (error) {
        console.error('Error loading tracker logs from localStorage:', error);
        return {};
    }
};

const aggregateWeek = (dayLogs, startDate, endDate) => {
    const bucket = {};
    let totalItems = 0;

    Object.entries(dayLogs).forEach(([date, meals]) => {
        if (date < startDate || date > endDate) return;

        Object.values(meals || {}).forEach((mealItems) => {
            (mealItems || []).forEach((item) => {
                const normalized = typeof item === 'string' ? { id: item, portion: 'plate' } : item;
                const foodId = normalized.id;
                const portion = normalized.portion || 'plate';
                const score = PORTION_SCORE[portion] || 1;
                const meta = FOOD_META[foodId] || { label: foodId, color: '#64748b' };

                if (!bucket[foodId]) {
                    bucket[foodId] = {
                        id: foodId,
                        label: meta.label,
                        color: meta.color,
                        timesEaten: 0,
                        weightedScore: 0
                    };
                }

                bucket[foodId].timesEaten += 1;
                bucket[foodId].weightedScore += score;
                totalItems += 1;
            });
        });
    });

    const ranking = Object.values(bucket).sort((a, b) =>
        b.weightedScore - a.weightedScore ||
        b.timesEaten - a.timesEaten ||
        a.label.localeCompare(b.label)
    );

    return { ranking, totalItems };
};

const Stats = () => {
    const [selectedWeek, setSelectedWeek] = useState(getISOWeekValue());
    const { start: weekStart, end: weekEnd } = getWeekRange(selectedWeek);

    const dayLogs = useMemo(() => readTrackerLogs(), []);
    const { ranking, totalItems } = useMemo(
        () => aggregateWeek(dayLogs, weekStart, weekEnd),
        [dayLogs, weekStart, weekEnd]
    );

    const maxScore = ranking[0]?.weightedScore || 1;

    return (
        <div className="page-content">
            <div className="header">
                <h1>Weekly Statistics</h1>
                <p style={{ color: 'var(--text-secondary)' }}>
                    Aggregated from tracker drag-and-drop logs.
                </p>
            </div>

            <div className="card">
                <h3>Week Filter</h3>
                <input
                    type="week"
                    value={selectedWeek}
                    onChange={(e) => setSelectedWeek(e.target.value)}
                    className="stats-week-input"
                />
                <p className="stats-week-range">
                    {weekStart} to {weekEnd}
                </p>
                <p className="stats-total-items">
                    Total foods logged: <strong>{totalItems}</strong>
                </p>
            </div>

            <div className="card">
                <h3>Real Frequency Pyramid</h3>
                <p className="stats-note">
                    Portion scoring used for ranking: teaspoon=1, spoon=2, cup=3, bowl=4, plate=5.
                </p>

                {ranking.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>
                        No tracker data found for this week.
                    </p>
                ) : (
                    <div className="stats-pyramid">
                        {ranking
                            .slice()
                            .reverse()
                            .map((entry, index) => {
                                const rank = ranking.length - index;
                                const widthPct = Math.max(32, (entry.weightedScore / maxScore) * 100);
                                return (
                                    <div
                                        key={entry.id}
                                        className="stats-pyramid-tier"
                                        style={{ width: `${widthPct}%`, borderColor: entry.color }}
                                    >
                                        <div className="stats-pyramid-main">
                                            <span className="stats-rank">#{rank}</span>
                                            <span>{entry.label}</span>
                                        </div>
                                        <div className="stats-pyramid-values">
                                            <span>{entry.weightedScore} pts</span>
                                            <span>{entry.timesEaten}x</span>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>

            <div className="card">
                <h3>Ranking (Most to Least Frequent)</h3>
                {ranking.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>
                ) : (
                    ranking.map((entry, index) => (
                        <div key={entry.id} className="stat-row">
                            <span>{index + 1}. {entry.label}</span>
                            <span style={{ color: 'var(--primary-color)', fontWeight: 700 }}>
                                {entry.weightedScore} pts
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Stats;
