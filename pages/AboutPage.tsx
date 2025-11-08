import React from 'react';
import Card from '../components/Card';

const AboutPage: React.FC = () => {
    const teamMembers = [
        { name: 'Dev', role: 'AI Engineer' },
        { name: 'Nihal', role: 'Frontend Developer' },
        { name: 'Pratyush', role: 'Backend Developer' },
        { name: 'Dattatrey', role: 'Data Scientist' },
        { name: 'Shivalik', role: 'Project Manager' },
    ];

    const milestones = [
        { date: 'Q1 2023', event: 'Project Inception & Data Collection' },
        { date: 'Q2 2023', event: 'Baseline Model (YOLOv8) Implementation' },
        { date: 'Q3 2023', event: 'Development of FDE Module' },
        { date: 'Q4 2023', event: 'YOLO-FDE Model Training & Validation' },
        { date: 'Q1 2024', event: 'UI Dashboard Development & Deployment' },
        { date: 'Q2 2024', event: 'Future: Real-time Cloud Integration' },
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-4xl font-bold text-center">About the Traffic AI Project</h1>

            <Card>
                <h2 className="text-2xl font-bold mb-3">What Problem We Solve (Traffic AI)</h2>
                <p className="text-gray-600 dark:text-gray-300">
                    Modern cities face unprecedented traffic congestion, leading to increased travel times, fuel consumption, and pollution. Traditional traffic monitoring systems often lack the accuracy and real-time analytical capabilities to effectively manage these complex networks. This project introduces an advanced Traffic AI dashboard, leveraging state-of-the-art YOLO-based object detection models to provide accurate, real-time vehicle counting, classification, and directional flow analysis. Our goal is to empower city planners and traffic managers with actionable data to optimize traffic flow, enhance road safety, and build smarter cities.
                </p>
            </Card>

            <Card>
                <h2 className="text-2xl font-bold mb-4">Team & Research Background</h2>
                <div className="flex flex-wrap gap-8 justify-center">
                    {teamMembers.map(member => (
                        <div key={member.name} className="text-center">
                            <div className="w-24 h-24 rounded-full mx-auto mb-2 shadow-lg bg-slate-200 dark:bg-gray-700 flex items-center justify-center">
                                <span className="text-3xl font-bold text-gray-600 dark:text-gray-300">{member.name.charAt(0)}</span>
                            </div>
                            <h3 className="font-semibold">{member.name}</h3>
                            <p className="text-sm text-primary-500 dark:text-primary-400">{member.role}</p>
                        </div>
                    ))}
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-2xl font-bold mb-3">Build Journey & Tech Stack</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">
                        Our journey began with extensive research into existing object detection frameworks. After benchmarking several models, we developed our custom YOLO-FDE architecture to address specific challenges in traffic video analysis.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {['PyTorch', 'YOLOv8', 'React', 'TypeScript', 'TailwindCSS', 'Recharts', 'Docker'].map(tech => (
                             <span key={tech} className="bg-primary-100 dark:bg-primary-900/50 text-primary-700 dark:text-primary-300 text-xs font-medium px-2.5 py-0.5 rounded-full">{tech}</span>
                        ))}
                    </div>
                </Card>
                <Card>
                    <h2 className="text-2xl font-bold mb-3">Future Roadmap & Milestones</h2>
                     <ul className="space-y-2">
                        {milestones.map(item => (
                            <li key={item.event} className="flex items-center">
                                <span className="font-semibold text-primary-500 w-20">{item.date}</span>
                                <span className="text-gray-600 dark:text-gray-300">{item.event}</span>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>

            <Card>
                <h2 className="text-2xl font-bold mb-3 text-center">Contact, GitHub & Credits</h2>
                <div className="flex justify-center space-x-6">
                    <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Contact Us</a>
                    <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">GitHub Repository</a>
                    <a href="#" className="font-medium text-primary-600 dark:text-primary-400 hover:underline">Credits</a>
                </div>
            </Card>
        </div>
    );
};

export default AboutPage;
