
import { YoloModel, Session } from './types';

export const YOLO_MODELS: YoloModel[] = [
  {
    id: 'yolo-fde',
    name: 'YOLO-FDE (Our Model)',
    description: 'An advanced model with a novel Feature Decoupling and Enhancement (FDE) module for superior vehicle detection in complex traffic scenarios.',
    useCases: ['High-density traffic monitoring', 'Night-time surveillance', 'Adverse weather conditions'],
    performance: { mAP: 92.5, fps: 110, params: '8.1M', size: '16.5MB', flops: 18.2 },
    strengths: ['High accuracy in occluded scenes', 'Robust to lighting changes', 'Efficient computation'],
    weaknesses: ['Slightly higher complexity', 'Requires fine-tuning for non-vehicular objects'],
    architectureDiagramUrl: 'https://picsum.photos/seed/yolo-fde-arch/800/400'
  },
  {
    id: 'yolov8',
    name: 'YOLOv8',
    description: 'The latest version of the YOLO family, known for its balance of speed and accuracy, and a new anchor-free detection head.',
    useCases: ['General object detection', 'Real-time tracking', 'Mobile applications'],
    performance: { mAP: 89.2, fps: 150, params: '6.2M', size: '12.8MB', flops: 15.1 },
    strengths: ['State-of-the-art performance', 'Highly scalable', 'Easy to train and deploy'],
    weaknesses: ['Can struggle with very small objects', 'Less specialized for traffic analysis'],
    architectureDiagramUrl: 'https://picsum.photos/seed/yolov8-arch/800/400'
  },
  {
    id: 'yolov11',
    name: 'YOLOv11',
    description: 'A hypothetical next-generation model focusing on efficiency and enhanced feature fusion for multi-scale object detection.',
    useCases: ['IoT devices', 'Edge computing', 'Large-scale surveillance systems'],
    performance: { mAP: 90.5, fps: 135, params: '7.5M', size: '15.2MB', flops: 17.0 },
    strengths: ['Improved small object detection', 'Lower latency', 'Energy efficient'],
    weaknesses: ['Not yet released', 'Performance is speculative'],
    architectureDiagramUrl: 'https://picsum.photos/seed/yolov11-arch/800/400'
  },
  {
    id: 'yolov8-fdd',
    name: 'YOLOv8-FDD',
    description: 'A variant of YOLOv8 with a Feature Decoupling backbone for better representation learning in traffic scenes.',
    useCases: ['Urban traffic management', 'Highway speed monitoring'],
    performance: { mAP: 90.1, fps: 140, params: '6.8M', size: '14.1MB', flops: 16.5 },
    strengths: ['Better feature extraction for vehicles', 'Good trade-off between speed and accuracy'],
    weaknesses: ['Marginal improvement over baseline YOLOv8 for general tasks'],
    architectureDiagramUrl: 'https://picsum.photos/seed/yolov8-fdd-arch/800/400'
  }
];

export const SAVED_SESSIONS: Session[] = [
  {
    id: 'sess_001',
    date: '2023-10-27 14:30',
    modelUsed: 'YOLO-FDE',
    duration: '01:15:22',
    totalVehicles: 1245,
    vehicleCounts: [{type: 'Car', count: 800}, {type: 'Truck', count: 250}, {type: 'Bus', count: 100}, {type: 'Motorcycle', count: 95}],
    videoSource: 'Stream: Highway Cam 1',
    avgFps: 28.5,
  },
  {
    id: 'sess_002',
    date: '2023-10-27 09:00',
    modelUsed: 'YOLOv8',
    duration: '02:00:00',
    totalVehicles: 2103,
    vehicleCounts: [{type: 'Car', count: 1500}, {type: 'Truck', count: 350}, {type: 'Bus', count: 153}, {type: 'Motorcycle', count: 100}],
    videoSource: 'Local: morning_traffic.mp4',
    avgFps: 32.1,
  },
  {
    id: 'sess_003',
    date: '2023-10-26 18:45',
    modelUsed: 'YOLO-FDE',
    duration: '00:45:10',
    totalVehicles: 890,
    vehicleCounts: [{type: 'Car', count: 650}, {type: 'Truck', count: 120}, {type: 'Bus', count: 50}, {type: 'Motorcycle', count: 70}],
    videoSource: 'Stream: Downtown Intersection'
  },
    {
    id: 'sess_004',
    date: '2023-10-26 11:20',
    modelUsed: 'YOLOv8-FDD',
    duration: '03:30:00',
    totalVehicles: 4531,
    vehicleCounts: [{type: 'Car', count: 3200}, {type: 'Truck', count: 800}, {type: 'Bus', count: 331}, {type: 'Motorcycle', count: 200}],
    videoSource: 'Local: rush_hour_long.mp4',
    avgFps: 30.2,
  },
];