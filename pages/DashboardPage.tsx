
import React, { useState, useEffect, useMemo } from 'react';
import Card from '../components/Card';
import { SAVED_SESSIONS } from '../constants';
import { DownloadIcon, TrashIcon } from '../components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Session } from '../types';
import { useTheme } from '../App';

const StatCard: React.FC<{ title: string; value: string | number; icon?: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon && <div className="text-primary-500">{icon}</div>}
    </Card>
);

const DashboardPage: React.FC = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const { theme } = useTheme();

    useEffect(() => {
        try {
            const storedSessions = localStorage.getItem('traffic_ai_sessions');
            if (storedSessions) {
                setSessions(JSON.parse(storedSessions));
            } else {
                localStorage.setItem('traffic_ai_sessions', JSON.stringify(SAVED_SESSIONS));
                setSessions(SAVED_SESSIONS);
            }
        } catch (error) {
            console.error("Failed to load sessions from localStorage:", error);
            setSessions(SAVED_SESSIONS);
        }
    }, []);
    
    const filteredSessions = useMemo(() => {
        if (!searchTerm) return sessions;
        return sessions.filter(s => 
            s.modelUsed.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.date.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.videoSource.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sessions, searchTerm]);

    const totalVehicles = filteredSessions.reduce((sum, s) => sum + s.totalVehicles, 0);
    const chartData = filteredSessions[0]?.vehicleCounts || [];
    
    const mostUsedModel = useMemo(() => {
        if (sessions.length === 0) return 'N/A';
        const modelCounts = sessions.reduce((acc, session) => {
            acc[session.modelUsed] = (acc[session.modelUsed] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);
        return Object.keys(modelCounts).reduce((a, b) => modelCounts[a] > modelCounts[b] ? a : b);
    }, [sessions]);

    const getFormattedDate = () => {
        const date = new Date();
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleExportJSON = () => {
        if (sessions.length === 0) {
            alert("No data to export.");
            return;
        }
        const dataStr = JSON.stringify(sessions, null, 2);
        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sessions-export-${getFormattedDate()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleExportCSV = () => {
        if (sessions.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = ['id', 'date', 'modelUsed', 'duration', 'avgFps', 'totalVehicles', 'videoSource', 'Car', 'Truck', 'Bus', 'Motorcycle'];
        
        const rows = sessions.map(session => {
            const vehicleCounts = { Car: 0, Truck: 0, Bus: 0, Motorcycle: 0 };
            session.vehicleCounts.forEach(vc => {
                if (vc.type in vehicleCounts) {
                    vehicleCounts[vc.type] = vc.count;
                }
            });

            return [
                session.id,
                session.date,
                session.modelUsed,
                session.duration,
                session.avgFps?.toFixed(1) ?? '',
                session.totalVehicles,
                `"${session.videoSource.replace(/"/g, '""')}"`,
                vehicleCounts.Car,
                vehicleCounts.Truck,
                vehicleCounts.Bus,
                vehicleCounts.Motorcycle,
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `sessions-export-${getFormattedDate()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleDeleteSession = (sessionId: string) => {
        if (window.confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
            try {
                const updatedSessions = sessions.filter(s => s.id !== sessionId);
                setSessions(updatedSessions);
                localStorage.setItem('traffic_ai_sessions', JSON.stringify(updatedSessions));
            } catch (error) {
                console.error('Failed to delete session:', error);
                alert('There was an error deleting the session.');
            }
        }
    };
    
    const themeColors = {
        light: { text: '#374151', grid: '#e5e7eb', tooltipBg: 'rgba(255, 255, 255, 0.9)', tooltipBorder: '#d1d5db' },
        dark: { text: '#d1d5db', grid: '#374151', tooltipBg: 'rgba(31, 41, 55, 0.9)', tooltipBorder: '#4b5563' },
    };
    const currentThemeColors = theme === 'dark' ? themeColors.dark : themeColors.light;


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Sessions" value={sessions.length} />
                <StatCard title="Total Vehicles Detected" value={sessions.reduce((sum, s) => sum + s.totalVehicles, 0).toLocaleString()} />
                <StatCard title="Most Used Model" value={mostUsedModel} />
                <StatCard title="Avg. Session Duration" value="01:52:48" />
            </div>

            <Card>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="w-full sm:w-1/2 lg:w-1/3">
                        <input type="text" placeholder="Search sessions..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-3 py-2 border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-dark-bg rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                    </div>
                    <div className="flex space-x-2">
                        <button 
                            onClick={handleExportJSON}
                            className="flex items-center space-x-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-white dark:focus:ring-offset-dark-card">
                            <DownloadIcon /><span>Export JSON</span>
                        </button>
                         <button 
                            onClick={handleExportCSV}
                            className="flex items-center space-x-2 bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 focus:ring-offset-white dark:focus:ring-offset-dark-card">
                            <DownloadIcon /><span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Saved Sessions</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs font-semibold text-gray-700 uppercase bg-slate-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                        <th scope="col" className="px-6 py-3">Model</th>
                                        <th scope="col" className="px-6 py-3">Avg. FPS</th>
                                        <th scope="col" className="px-6 py-3">Total Vehicles</th>
                                        <th scope="col" className="px-6 py-3">Source</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSessions.length > 0 ? (
                                        filteredSessions.map((session, index) => (
                                            <tr key={session.id} className={`border-b border-light-border dark:border-dark-border ${index % 2 === 0 ? 'bg-white dark:bg-dark-card' : 'bg-slate-100 dark:bg-dark-border'} hover:bg-slate-200 dark:hover:bg-gray-700`}>
                                                <td className="px-6 py-4 font-medium whitespace-nowrap">{session.date}</td>
                                                <td className="px-6 py-4">{session.modelUsed}</td>
                                                <td className="px-6 py-4">{session.avgFps?.toFixed(1) ?? 'N/A'}</td>
                                                <td className="px-6 py-4">{session.totalVehicles.toLocaleString()}</td>
                                                <td className="px-6 py-4">{session.videoSource}</td>
                                                <td className="px-6 py-4 text-right">
                                                    <button 
                                                        onClick={() => handleDeleteSession(session.id)}
                                                        className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
                                                        aria-label={`Delete session ${session.id}`}
                                                    >
                                                        <TrashIcon size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="text-center p-8 text-gray-500">
                                                No sessions found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-1">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">Vehicle Types (Latest Session)</h2>
                        <div style={{ width: '100%', height: 300 }}>
                           <ResponsiveContainer>
                                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.grid} />
                                    <XAxis dataKey="type" tick={{ fill: currentThemeColors.text }} fontSize={12} />
                                    <YAxis tick={{ fill: currentThemeColors.text }} fontSize={12} />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: currentThemeColors.tooltipBg,
                                            borderColor: currentThemeColors.tooltipBorder,
                                            color: currentThemeColors.text
                                        }}
                                        cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                                    />
                                    <Legend wrapperStyle={{fontSize: "12px"}} />
                                    <Bar dataKey="count" fill="#3b82f6" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
