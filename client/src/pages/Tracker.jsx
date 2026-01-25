import { useState } from 'react';

const Tracker = () => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        place: '',
        foodType: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const foodTypes = [
        'Carbohydrates',
        'Proteins',
        'Vegetables',
        'Fruits',
        'Dairy',
        'Sweets',
        'Fats'
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) throw new Error('Failed to save');

            setMessage('Log saved successfully!');
            // Reset non-date fields
            setFormData(prev => ({ ...prev, place: '', foodType: '' }));

            // Clear message after 3s
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Error saving log.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-content">
            <div className="header">
                <h1>Track Food</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Log what you ate today.</p>
            </div>

            <form onSubmit={handleSubmit} className="card">
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Date</label>
                <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                />

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Place</label>
                <input
                    type="text"
                    name="place"
                    placeholder="e.g. Home, Ristorante Roma"
                    value={formData.place}
                    onChange={handleChange}
                    required
                />

                <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>Food Type</label>
                <select
                    name="foodType"
                    value={formData.foodType}
                    onChange={handleChange}
                    required
                >
                    <option value="" disabled>Select food type</option>
                    {foodTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>

                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Saving...' : 'Save Log'}
                </button>

                {message && (
                    <p style={{
                        textAlign: 'center',
                        color: message.includes('Error') ? 'var(--error-color)' : 'var(--secondary-color)'
                    }}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
};

export default Tracker;
