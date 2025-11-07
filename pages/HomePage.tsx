
import React, { useState, useEffect, useRef } from 'react';
import Card from '../components/Card';
import { YOLO_MODELS } from '../constants';
import { XCircleIcon } from '../components/Icons';
import { Session, VehicleCount } from '../types';

const VEHICLE_COLORS: Record<VehicleCount['type'], { light: string; dark: string }> = {
    'Car': { light: '#2563eb', dark: '#60a5fa' },
    'Truck': { light: '#dc2626', dark: '#f87171' },
    'Bus': { light: '#16a34a', dark: '#4ade80' },
    'Motorcycle': { light: '#d97706', dark: '#facc15' },
};

interface DetectedObject {
    id: string;
    type: VehicleCount['type'];
    box: [number, number, number, number]; // [x, y, w, h] as percentages
    confidence: number;
}

const Spinner: React.FC = () => (
    <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);


const VideoStreamPlayer: React.FC<{
    index: number;
    stream: { url: string | null; isInferencing: boolean };
    onStop: (index: number) => void;
    modelName: string;
    skipFrames: number;
}> = ({ index, stream, onStop, modelName, skipFrames }) => {
    const [liveData, setLiveData] = useState<{
        total: number;
        breakdown: VehicleCount[];
        fps: number;
    }>({
        total: 0,
        breakdown: [
            { type: 'Car', count: 0 }, { type: 'Truck', count: 0 },
            { type: 'Bus', count: 0 }, { type: 'Motorcycle', count: 0 }
        ],
        fps: 0,
    });
    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    const [isInitializing, setIsInitializing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const activeVehicles = useRef<DetectedObject[]>([]);
    const prevIsInferencing = useRef(stream.isInferencing);

    useEffect(() => {
        if (stream.isInferencing && !prevIsInferencing.current) {
            setIsInitializing(true);
            setError(null);
            const timer = setTimeout(() => {
                setIsInitializing(false);
            }, 2500); 
            return () => clearTimeout(timer);
        }
        
        if (!stream.isInferencing) {
            setIsInitializing(false);
            setError(null);
        }

        prevIsInferencing.current = stream.isInferencing;
    }, [stream.isInferencing]);


    useEffect(() => {
        let intervalId: number;

        if (stream.isInferencing && !isInitializing && stream.url) {
            const model = YOLO_MODELS.find(m => m.name === modelName);
            if (!model) return;

            const baseCounts = { Car: 15 + index * 3, Truck: 4 + index, Bus: 2, Motorcycle: 3 + index };
            const stabilityFactor = model.performance.mAP / 100;

            const simulateDetection = () => {
                let currentVehicles = activeVehicles.current;

                currentVehicles = currentVehicles.map(v => {
                    const [x, y, w, h] = v.box;
                    const newX = Math.max(0, Math.min(1 - w, x + (Math.random() - 0.5) * 0.01));
                    const newY = Math.max(0, Math.min(1 - h, y + (Math.random() - 0.5) * 0.005));
                    const newConfidence = Math.max(0.4, Math.min(0.99, v.confidence + (Math.random() - 0.5) * 0.05 * (2 - stabilityFactor)));
                    return { ...v, box: [newX, newY, w, h] as [number, number, number, number], confidence: newConfidence };
                });

                const newBreakdown: VehicleCount[] = (['Car', 'Truck', 'Bus', 'Motorcycle'] as const).map(type => {
                    const base = baseCounts[type];
                    const fluctuation = (Math.random() - 0.5) * (base * (1.5 - stabilityFactor));
                    const targetCount = Math.max(0, Math.round(base + fluctuation));
                    let currentCount = currentVehicles.filter(v => v.type === type).length;

                    if (currentCount > targetCount) {
                        let toRemove = currentCount - targetCount;
                        currentVehicles = currentVehicles.filter(v => {
                            if (v.type === type && toRemove > 0 && Math.random() > stabilityFactor) {
                                toRemove--;
                                return false;
                            }
                            return true;
                        });
                    } else if (currentCount < targetCount) {
                        for (let i = 0; i < (targetCount - currentCount); i++) {
                            const confidence = stabilityFactor + (Math.random() * (1 - stabilityFactor));
                            const w = type === 'Bus' || type === 'Truck' ? 0.15 + Math.random() * 0.1 : 0.1 + Math.random() * 0.05;
                            const h = type === 'Bus' || type === 'Truck' ? 0.12 + Math.random() * 0.05 : 0.08 + Math.random() * 0.05;
                            const x = Math.random() * (1 - w);
                            const y = Math.random() * (1 - h);
                            currentVehicles.push({
                                id: `${type}-${i}-${Date.now()}-${Math.random()}`,
                                type,
                                box: [x, y, w, h],
                                confidence: parseFloat(confidence.toFixed(2)),
                            });
                        }
                    }
                    return { type, count: currentVehicles.filter(v => v.type === type).length };
                });

                activeVehicles.current = currentVehicles;
                setDetectedObjects(currentVehicles);

                const total = newBreakdown.reduce((sum, item) => sum + item.count, 0);
                const effectiveFps = model.performance.fps / (skipFrames + 1);
                const simulatedFps = effectiveFps + ((Math.random() - 0.5) * effectiveFps * 0.1);

                setLiveData({
                    total,
                    breakdown: newBreakdown,
                    fps: parseFloat(simulatedFps.toFixed(1)),
                });
            };
            
            const intervalDuration = (1000 / model.performance.fps) * (skipFrames + 1);
            intervalId = window.setInterval(simulateDetection, intervalDuration);

        } else {
             activeVehicles.current = [];
             setDetectedObjects([]);
        }

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [stream.isInferencing, isInitializing, stream.url, modelName, index, skipFrames]);

    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!canvas || !video) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        const resizeCanvas = () => {
          canvas.width = video.clientWidth;
          canvas.height = video.clientHeight;
        }

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!stream.isInferencing || isInitializing) return;

        const isDarkTheme = document.documentElement.classList.contains('dark');

        detectedObjects.forEach(obj => {
            const color = isDarkTheme ? VEHICLE_COLORS[obj.type].dark : VEHICLE_COLORS[obj.type].light;
            const [x, y, w, h] = obj.box;
            const rectX = x * canvas.width;
            const rectY = y * canvas.height;
            const rectW = w * canvas.width;
            const rectH = h * canvas.height;

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.strokeRect(rectX, rectY, rectW, rectH);

            const label = `${obj.type} ${(obj.confidence * 100).toFixed(0)}%`;
            ctx.font = 'bold 12px sans-serif';
            const textWidth = ctx.measureText(label).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(rectX, rectY - 18, textWidth + 8, 18);
            ctx.fillStyle = '#fff';
            ctx.fillText(label, rectX + 4, rectY - 5);
        });
        
        return () => window.removeEventListener('resize', resizeCanvas);

    }, [detectedObjects, stream.isInferencing, isInitializing]);

    if (!stream.url) {
        return (
            <div className="aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-light-border dark:border-dark-border">
                <p className="text-gray-500">Video Stream {index + 1}</p>
            </div>
        );
    }

    return (
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden group shadow-lg">
            <video ref={videoRef} src={stream.url} autoPlay muted loop playsInline className="w-full h-full object-cover" />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            
            {isInitializing && (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm">
                    <Spinner />
                    <p className="mt-4 text-lg font-semibold">Connecting to inference server...</p>
                    <p className="text-sm text-gray-300">Model: {modelName}</p>
                </div>
            )}

            {error && (
                 <div className="absolute inset-0 bg-red-900/80 flex flex-col items-center justify-center text-white z-20 backdrop-blur-sm p-4">
                    <XCircleIcon size={40} className="text-red-300 mb-2" />
                    <p className="text-lg font-bold">Connection Error</p>
                    <p className="text-sm text-red-200 text-center">{error}</p>
                </div>
            )}

            <div className={`absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent text-white transition-opacity duration-300 z-10 ${isInitializing || error ? 'opacity-0' : 'opacity-100'}`}>
                {stream.isInferencing ? (
                    <>
                        <p className="font-bold text-sm mb-1" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>Total Vehicles: {liveData.total}</p>
                        <div className="grid grid-cols-2 gap-x-3 text-xs" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>
                            {liveData.breakdown.map(v => (
                                <p key={v.type}>{v.type}: <strong>{v.count}</strong></p>
                            ))}
                        </div>
                        <p className="text-xs mt-1" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>FPS: <strong>{liveData.fps}</strong></p>
                    </>
                ) : (
                    <p className="text-yellow-400 font-semibold" style={{textShadow: '1px 1px 3px rgba(0,0,0,0.7)'}}>Inference Paused</p>
                )}
            </div>
             <button
                onClick={() => onStop(index)}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all duration-300 z-30 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black/50"
                aria-label={`Stop stream ${index + 1}`}
            >
                <XCircleIcon size={20} />
            </button>
        </div>
    );
};


const HomePage: React.FC = () => {
    const [confidence, setConfidence] = useState(50);
    const [imageSize, setImageSize] = useState(640);
    const [skipFrames, setSkipFrames] = useState(5);
    const [streams, setStreams] = useState<{ url: string | null; isInferencing: boolean }[]>(
        [...Array(4)].map(() => ({ url: null, isInferencing: false }))
    );
    const [videoUrlInput, setVideoUrlInput] = useState('https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4');
    const [localFileName, setLocalFileName] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState(YOLO_MODELS[0].name);
    const [isConfigOpen, setIsConfigOpen] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (videoUrlInput.startsWith('blob:')) {
                URL.revokeObjectURL(videoUrlInput);
            }
            const objectUrl = URL.createObjectURL(file);
            setVideoUrlInput(objectUrl);
            setLocalFileName(file.name);
        }
    };

    const handleUrlInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setVideoUrlInput(e.target.value);
        if (localFileName) {
            setLocalFileName(null);
        }
        if (e.target.value.startsWith('blob:') && fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleStartInference = () => {
        const newUrl = videoUrlInput.trim();
        if (!newUrl) {
            alert('Please enter a video stream URL or upload a local file.');
            return;
        }
        
        const firstEmptyIndex = streams.findIndex(s => s.url === null);

        if (firstEmptyIndex === -1) {
            alert('All video slots are in use. Stop a stream to add a new one.');
            return;
        }

        setStreams(prevStreams => {
            const newStreams = [...prevStreams];
            newStreams[firstEmptyIndex] = { url: newUrl, isInferencing: true };
            return newStreams;
        });
    };
    
    const handleStopInference = (index: number) => {
        setStreams(prevStreams => {
            const newStreams = [...prevStreams];
            const streamToStop = newStreams[index];
            if (streamToStop.url && streamToStop.url.startsWith('blob:')) {
                URL.revokeObjectURL(streamToStop.url);
            }
            newStreams[index] = { url: null, isInferencing: false };
            return newStreams;
        });
    };

    const handleStopAllInference = () => {
        const hasActiveStreams = streams.some(s => s.isInferencing);
        if (!hasActiveStreams) {
            alert('No active streams to stop.');
            return;
        }
        if (window.confirm('Are you sure you want to stop all active streams?')) {
            streams.forEach(stream => {
                if (stream.url && stream.url.startsWith('blob:')) {
                    URL.revokeObjectURL(stream.url);
                }
            });
            setStreams([...Array(4)].map(() => ({ url: null, isInferencing: false })));
        }
    };

    const handleSaveSession = () => {
        const activeStreams = streams.filter(s => s.url !== null);
        if (activeStreams.length === 0) {
            alert('No active streams to save.');
            return;
        }

        const sessionName = window.prompt('Enter a name for this session:', `Session ${new Date().toLocaleTimeString()}`);
        if (!sessionName) {
            return;
        }

        const totalVehicles = Math.floor(Math.random() * 500) + (100 * activeStreams.length);
        const vehicleCounts: VehicleCount[] = [
            { type: 'Car', count: Math.floor(totalVehicles * 0.6) },
            { type: 'Truck', count: Math.floor(totalVehicles * 0.2) },
            { type: 'Bus', count: Math.floor(totalVehicles * 0.1) },
            { type: 'Motorcycle', count: Math.floor(totalVehicles * 0.1) },
        ];

        const newSession: Session = {
            id: `sess_${Date.now()}`,
            date: new Date().toLocaleString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/,/, ''),
            modelUsed: selectedModel,
            duration: `00:${Math.floor(Math.random() * 50 + 10).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            totalVehicles,
            vehicleCounts,
            videoSource: sessionName,
            avgFps: parseFloat((Math.random() * 10 + 25).toFixed(1)),
        };

        try {
            const existingSessionsRaw = localStorage.getItem('traffic_ai_sessions');
            const existingSessions: Session[] = existingSessionsRaw ? JSON.parse(existingSessionsRaw) : [];
            const updatedSessions = [newSession, ...existingSessions];
            localStorage.setItem('traffic_ai_sessions', JSON.stringify(updatedSessions));
            alert(`Session "${sessionName}" saved successfully!`);
        } catch (error) {
            console.error('Failed to save session:', error);
            alert('There was an error saving the session.');
        }
    };
    
    const isStartDisabled = !videoUrlInput.trim();

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <Card>
                     <button
                        onClick={() => setIsConfigOpen(!isConfigOpen)}
                        className="w-full flex justify-between items-center text-left"
                        aria-expanded={isConfigOpen}
                    >
                        <h2 className="text-2xl font-bold">Configuration</h2>
                        <svg
                          className={`w-5 h-5 transition-transform transform ${isConfigOpen ? 'rotate-180' : ''}`}
                          xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                    
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isConfigOpen ? 'max-h-[1000px] mt-4 pt-4 border-t border-light-border dark:border-dark-border' : 'max-h-0'}`}>
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="model-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Choose Model</label>
                                <select 
                                    id="model-select" 
                                    value={selectedModel}
                                    onChange={e => setSelectedModel(e.target.value)}
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-dark-bg focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md appearance-none bg-no-repeat bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20fill%3d%22none%22%20viewBox%3d%220%200%2020%2020%22%3e%3cpath%20stroke%3d%22%236b7280%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%20stroke-width%3d%221.5%22%20d%3d%22m6%208%204%204%204-4%22/%3e%3c/svg%3e')] dark:bg-[url('data:image/svg+xml,%3csvg%20xmlns%3d%22http%3a//www.w3.org/2000/svg%22%20fill%3d%22none%22%20viewBox%3d%220%200%2020%2020%22%3e%3cpath%20stroke%3d%22%239ca3af%22%20stroke-linecap%3d%22round%22%20stroke-linejoin%3d%22round%22%20stroke-width%3d%221.5%22%20d%3d%22m6%208%204%204%204-4%22/%3e%3c/svg%3e')] [background-position:right_0.5rem_center] [background-size:1.5em_1.5em]">
                                    {YOLO_MODELS.map(model => <option key={model.id}>{model.name}</option>)}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="video-source" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Video Source URL</label>
                                <input 
                                    type="text" 
                                    id="video-source" 
                                    placeholder="Enter live stream URL or upload a file" 
                                    value={videoUrlInput}
                                    onChange={handleUrlInputChange}
                                    className="mt-1 block w-full pl-3 py-2 border-gray-300 dark:border-gray-600 bg-slate-50 dark:bg-dark-bg rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm" />
                                {localFileName && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Selected file: {localFileName}</p>}
                                <div className="relative flex items-center my-2">
                                    <div className="flex-grow border-t border-slate-200 dark:border-gray-600"></div>
                                    <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                                    <div className="flex-grow border-t border-slate-200 dark:border-gray-600"></div>
                                </div>
                                <label htmlFor="file-upload" className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-slate-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-dark-card hover:bg-slate-100 dark:hover:bg-dark-bg cursor-pointer transition-colors">
                                    Upload Local Video
                                </label>
                                <input ref={fileInputRef} id="file-upload" name="file-upload" type="file" className="sr-only" accept="video/*" onChange={handleFileChange} />
                            </div>

                            <div>
                                <label htmlFor="confidence" className="block text-sm font-medium">Confidence: {confidence}%</label>
                                <input type="range" id="confidence" min="0" max="100" value={confidence} onChange={(e) => setConfidence(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="imageSize" className="block text-sm font-medium">Image Size: {imageSize}px</label>
                                <input type="range" id="imageSize" min="320" max="1280" step="32" value={imageSize} onChange={(e) => setImageSize(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500" />
                            </div>
                            <div>
                                <label htmlFor="skipFrames" className="block text-sm font-medium">Skip Frames: {skipFrames}</label>
                                <input type="range" id="skipFrames" min="0" max="30" value={skipFrames} onChange={(e) => setSkipFrames(Number(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600 dark:accent-primary-500" />
                            </div>
                        </div>

                         <div className="mt-8 space-y-2">
                            <button 
                                onClick={handleStartInference}
                                disabled={isStartDisabled}
                                className="w-full bg-primary-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-primary-700 transition duration-300 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 focus:ring-offset-white dark:focus:ring-offset-dark-card">
                                Start Inference
                            </button>
                            <div className="flex space-x-2">
                                <button 
                                    onClick={handleSaveSession}
                                    className="flex-1 bg-gray-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-600 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 focus:ring-offset-white dark:focus:ring-offset-dark-card">
                                    Save Session
                                </button>
                                <button 
                                    onClick={handleStopAllInference}
                                    className="flex-1 bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-white dark:focus:ring-offset-dark-card">
                                    Stop All
                                </button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="lg:col-span-2">
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {streams.map((stream, i) => (
                        <VideoStreamPlayer
                            key={i}
                            index={i}
                            stream={stream}
                            onStop={handleStopInference}
                            modelName={selectedModel}
                            skipFrames={skipFrames}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomePage;
