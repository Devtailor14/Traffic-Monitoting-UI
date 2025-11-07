
import React from 'react';
import Card from '../components/Card';
import { YOLO_MODELS } from '../constants';
import { YoloModel } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '../App';

const ModelCard: React.FC<{ model: YoloModel }> = ({ model }) => (
    <Card className="flex flex-col h-full">
        <h3 className="text-xl font-bold text-primary-500 dark:text-primary-400">{model.name}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 mb-3 flex-grow">{model.description}</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm border-t border-b border-light-border dark:border-dark-border py-3 my-3">
            <div><strong>mAP:</strong> {model.performance.mAP}%</div>
            <div><strong>FPS:</strong> {model.performance.fps}</div>
            <div><strong>Params:</strong> {model.performance.params}</div>
            <div><strong>Size:</strong> {model.performance.size}</div>
        </div>
        <div>
            <h4 className="font-semibold mb-1">Strengths:</h4>
            <ul className="list-disc list-inside text-xs text-green-600 dark:text-green-400 space-y-1">
                {model.strengths.slice(0, 2).map(s => <li key={s}>{s}</li>)}
            </ul>
        </div>
    </Card>
);

const YoloFdeSection: React.FC<{ model: YoloModel }> = ({ model }) => (
    <Card className="!border-primary-500 border-2">
        <h2 className="text-3xl font-bold mb-4 text-center">{model.name} - In-depth</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
                <h3 className="text-xl font-semibold mb-2">Custom Architecture & FDE Module</h3>
                <p className="mb-4 text-gray-600 dark:text-gray-300">{model.description} The FDE module allows the model to differentiate between foreground vehicle features and complex backgrounds, leading to significant improvements in detection accuracy, especially in crowded or poorly lit conditions.</p>
                <img src={model.architectureDiagramUrl} alt="YOLO-FDE Architecture" className="rounded-lg shadow-lg w-full" />
            </div>
            <div>
                <h3 className="text-xl font-semibold mb-2">Performance Comparison</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs font-semibold uppercase bg-slate-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-2">Metric</th>
                                <th className="px-4 py-2 text-center text-primary-500 dark:text-primary-400">{model.name}</th>
                                <th className="px-4 py-2 text-center">YOLOv8</th>
                                <th className="px-4 py-2 text-center">YOLOv11 (Est.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-light-border dark:border-dark-border hover:bg-slate-100 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 font-medium">mAP</td>
                                <td className="px-4 py-2 text-center font-bold text-green-500">{model.performance.mAP}%</td>
                                <td className="px-4 py-2 text-center">89.2%</td>
                                <td className="px-4 py-2 text-center">90.5%</td>
                            </tr>
                            <tr className="border-b border-light-border dark:border-dark-border bg-slate-100 dark:bg-dark-border hover:bg-slate-200 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 font-medium">FPS</td>
                                <td className="px-4 py-2 text-center">{model.performance.fps}</td>
                                <td className="px-4 py-2 text-center font-bold text-green-500">150</td>
                                <td className="px-4 py-2 text-center">135</td>
                            </tr>
                            <tr className="border-b-0 dark:border-dark-border hover:bg-slate-100 dark:hover:bg-gray-700">
                                <td className="px-4 py-2 font-medium">FLOPs (G)</td>
                                <td className="px-4 py-2 text-center">{model.performance.flops}</td>
                                <td className="px-4 py-2 text-center">15.1</td>
                                <td className="px-4 py-2 text-center">17.0</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <h3 className="text-xl font-semibold mt-6 mb-2">Visual Detection Samples</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-center mb-1">Before (YOLOv8)</p>
                        <img src="https://picsum.photos/seed/before/400/225" alt="Before detection" className="rounded-lg" />
                    </div>
                    <div>
                        <p className="text-sm text-center mb-1">After (YOLO-FDE)</p>
                        <img src="https://picsum.photos/seed/after/400/225" alt="After detection" className="rounded-lg" />
                    </div>
                </div>
            </div>
        </div>
    </Card>
);

const ModelsPage: React.FC = () => {
    const { theme } = useTheme();
    const ourModel = YOLO_MODELS.find(m => m.id === 'yolo-fde')!;
    const otherModels = YOLO_MODELS.filter(m => m.id !== 'yolo-fde');
    const chartData = YOLO_MODELS.map(m => ({ name: m.name.replace(/ /g, '\n'), mAP: m.performance.mAP, FPS: m.performance.fps }));
    const colors = ['#3b82f6', '#8884d8', '#82ca9d', '#ffc658'];

    const themeColors = {
        light: { text: '#374151', grid: '#e5e7eb', tooltipBg: 'rgba(255, 255, 255, 0.9)', tooltipBorder: '#d1d5db' },
        dark: { text: '#d1d5db', grid: '#374151', tooltipBg: 'rgba(31, 41, 55, 0.9)', tooltipBorder: '#4b5563' },
    };
    const currentThemeColors = theme === 'dark' ? themeColors.dark : themeColors.light;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-center">YOLO Models Comparison</h1>
            
            <Card>
                 <h2 className="text-2xl font-bold mb-4 text-center">Performance Overview</h2>
                 <div style={{ width: '100%', height: 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={currentThemeColors.grid} />
                            <XAxis dataKey="name" interval={0} tick={{ fill: currentThemeColors.text, fontSize: 12 }} />
                            <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" tick={{ fill: currentThemeColors.text }} />
                            <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" tick={{ fill: currentThemeColors.text }}/>
                            <Tooltip 
                                contentStyle={{
                                    backgroundColor: currentThemeColors.tooltipBg,
                                    borderColor: currentThemeColors.tooltipBorder,
                                    color: currentThemeColors.text
                                }}
                                cursor={{fill: 'rgba(128, 128, 128, 0.1)'}}
                            />
                            <Legend wrapperStyle={{paddingTop: '20px'}} />
                            <Bar yAxisId="left" dataKey="mAP" name="mAP (%)">
                               {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                              ))}
                            </Bar>
                             <Bar yAxisId="right" dataKey="FPS" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
            </Card>

            <YoloFdeSection model={ourModel} />

            <div>
                <h2 className="text-2xl font-bold mb-4 text-center">Other Models Tested</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {otherModels.map(model => (
                        <ModelCard key={model.id} model={model} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ModelsPage;
