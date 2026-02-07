import { useState, useEffect } from 'react';

const Stats = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const res = await fetch('/api/logs');
            if (res.ok) {
                const data = await res.json();
                // Sort by date desc
                setLogs(data.reverse());
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        } finally {
            setLoading(false);
        }
    };

    // Simple aggregation
    const stats = logs.reduce((acc, log) => {
        acc[log.foodType] = (acc[log.foodType] || 0) + 1;
        return acc;
    }, {});

    return (
        <div className="page-content">
            <div className="header">
                <h1>Statistics</h1>
                <p style={{ color: 'var(--text-secondary)' }}>Your food history.</p>
            </div>

            <div className="card">
                <h3>Summary</h3>
                {Object.keys(stats).length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)' }}>No data yet.</p>
                ) : (
                    Object.entries(stats).map(([type, count]) => (
                        <div key={type} className="stat-row">
                            <span>{type}</span>
                            <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{count}</span>
                        </div>
                    ))
                )}
            </div>

            <h3 style={{ marginLeft: '20px', marginBottom: '10px' }}>Recent Logs</h3>
            <div style={{ paddingBottom: '20px' }}>
                {loading ? (
                    <p style={{ padding: '0 20px' }}>Loading...</p>
                ) : logs.length === 0 ? (
                    <p style={{ padding: '0 20px', color: 'var(--text-secondary)' }}>No logs found.</p>
                ) : (
                    logs.map(log => (
                        <div key={log.id} className="card" style={{ padding: '16px', margin: '0 20px 16px 20px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 600 }}>{log.foodType}</span>
                                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{log.date}</span>
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                📍 {log.place}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Stats;
