import numpy as np
import cv2
from typing import Dict, List, Tuple, Optional
from collections import deque
import math

class AdvancedPersonTracker:
    """Продвинутый трекер людей с улучшенным сопоставлением"""
    
    def __init__(self, max_disappeared: int = 30, min_trajectory_length: int = 10):
        self.next_person_id = 1
        self.trackers = {}  # person_id -> PersonTracker
        self.disappeared = {}  # person_id -> frames_disappeared
        self.max_disappeared = max_disappeared
        self.min_trajectory_length = min_trajectory_length
        
    def update(self, detections: List[Tuple[int, int, int, int]], frame_number: int) -> Dict:
        """Обновляет трекер с новыми детекциями"""
        
        # Если нет трекеров, создаем новые для всех детекций
        if len(self.trackers) == 0:
            for detection in detections:
                self._create_tracker(detection, frame_number)
            return self._get_current_positions()
        
        # Получаем текущие позиции всех трекеров
        current_positions = self._get_current_positions()
        
        # Если нет детекций, помечаем всех как исчезнувших
        if len(detections) == 0:
            for person_id in list(self.disappeared.keys()):
                self.disappeared[person_id] += 1
                if self.disappeared[person_id] > self.max_disappeared:
                    self._delete_tracker(person_id)
            return current_positions
        
        # Сопоставляем детекции с существующими трекерами
        matched_detections, matched_trackers = self._match_detections_to_trackers(
            detections, current_positions
        )
        
        # Обновляем существующие трекеры
        for detection_idx, person_id in matched_detections.items():
            self.trackers[person_id].update(detections[detection_idx], frame_number)
            self.disappeared[person_id] = 0
        
        # Создаем новые трекеры для неиспользованных детекций
        for i, detection in enumerate(detections):
            if i not in matched_detections:
                self._create_tracker(detection, frame_number)
        
        # Обрабатываем исчезнувших людей
        for person_id in list(self.disappeared.keys()):
            if person_id not in matched_trackers:
                self.disappeared[person_id] += 1
                if self.disappeared[person_id] > self.max_disappeared:
                    self._delete_tracker(person_id)
        
        # Логируем состояние трекинга
        if frame_number % 30 == 0:  # Каждые 30 кадров
            active_trackers = len(self.trackers)
            total_detections = len(detections)
            matched_count = len(matched_detections)
            print(f"🎯 Трекинг: кадр={frame_number}, детекций={total_detections}, сопоставлено={matched_count}, трекеров={active_trackers}")
        
        return self._get_current_positions()
    
    def _create_tracker(self, detection: Tuple[int, int, int, int], frame_number: int):
        """Создает новый трекер для человека"""
        person_id = f"person_{self.next_person_id}"
        self.next_person_id += 1
        
        self.trackers[person_id] = PersonTracker(detection, frame_number)
        self.disappeared[person_id] = 0
        
        print(f"🆕 Создан трекер {person_id} для детекции {detection}")
    
    def _delete_tracker(self, person_id: str):
        """Удаляет трекер человека"""
        if person_id in self.trackers:
            del self.trackers[person_id]
        if person_id in self.disappeared:
            del self.disappeared[person_id]
        print(f"🗑️ Удален трекер {person_id}")
    
    def _match_detections_to_trackers(self, detections: List[Tuple[int, int, int, int]], 
                                    current_positions: Dict) -> Tuple[Dict, set]:
        """Сопоставляет детекции с существующими трекерами"""
        
        if len(current_positions) == 0:
            return {}, set()
        
        # Вычисляем матрицу расстояний
        distance_matrix = np.zeros((len(detections), len(current_positions)))
        person_ids = list(current_positions.keys())
        
        for i, detection in enumerate(detections):
            detection_center = self._get_detection_center(detection)
            for j, person_id in enumerate(person_ids):
                tracker_center = current_positions[person_id]
                distance = self._calculate_distance(detection_center, tracker_center)
                distance_matrix[i, j] = distance
        
        # Венгерский алгоритм для оптимального сопоставления
        matched_detections = {}
        matched_trackers = set()
        
        # Простое жадное сопоставление с порогом расстояния (оптимизировано для YOLO)
        max_distance = 200  # пиксели (увеличили для YOLO - люди могут двигаться быстрее)
        
        for i in range(len(detections)):
            best_match = None
            min_distance = float('inf')
            
            for j, person_id in enumerate(person_ids):
                if person_id not in matched_trackers and distance_matrix[i, j] < max_distance:
                    if distance_matrix[i, j] < min_distance:
                        min_distance = distance_matrix[i, j]
                        best_match = person_id
            
            if best_match is not None:
                matched_detections[i] = best_match
                matched_trackers.add(best_match)
        
        return matched_detections, matched_trackers
    
    def _get_detection_center(self, detection: Tuple[int, int, int, int]) -> Tuple[int, int]:
        """Получает центр детекции"""
        x, y, w, h = detection
        return (x + w // 2, y + h // 2)
    
    def _calculate_distance(self, point1: Tuple[int, int], point2: Tuple[int, int]) -> float:
        """Вычисляет евклидово расстояние между точками"""
        return math.sqrt((point1[0] - point2[0])**2 + (point1[1] - point2[1])**2)
    
    def _get_current_positions(self) -> Dict:
        """Получает текущие позиции всех трекеров"""
        positions = {}
        for person_id, tracker in self.trackers.items():
            positions[person_id] = tracker.get_current_position()
        return positions
    
    def get_trajectories(self) -> Dict:
        """Получает траектории всех людей"""
        trajectories = {}
        for person_id, tracker in self.trackers.items():
            if len(tracker.trajectory) >= self.min_trajectory_length:
                trajectories[person_id] = tracker.get_trajectory()
        return trajectories
    
    def get_people_per_frame(self) -> List[int]:
        """Получает количество людей в каждом кадре"""
        max_frame = max([tracker.get_max_frame() for tracker in self.trackers.values()], default=0)
        people_per_frame = []
        
        for frame in range(max_frame + 1):
            count = 0
            for tracker in self.trackers.values():
                if tracker.has_frame(frame):
                    count += 1
            people_per_frame.append(count)
        
        return people_per_frame


class PersonTracker:
    """Трекер для одного человека"""
    
    def __init__(self, initial_detection: Tuple[int, int, int, int], frame_number: int):
        self.trajectory = deque(maxlen=1000)  # Ограничиваем память
        self.current_detection = initial_detection
        self.add_detection(initial_detection, frame_number)
    
    def update(self, detection: Tuple[int, int, int, int], frame_number: int):
        """Обновляет трекер новым детекцией"""
        self.current_detection = detection
        self.add_detection(detection, frame_number)
    
    def add_detection(self, detection: Tuple[int, int, int, int], frame_number: int):
        """Добавляет детекцию в траекторию"""
        x, y, w, h = detection
        center_x = x + w // 2
        center_y = y + h // 2
        
        self.trajectory.append({
            'x': center_x,
            'y': center_y,
            'frame': frame_number,
            'timestamp': frame_number / 30.0,  # Предполагаем 30 FPS
            'width': w,
            'height': h
        })
    
    def get_current_position(self) -> Tuple[int, int]:
        """Получает текущую позицию"""
        x, y, w, h = self.current_detection
        return (x + w // 2, y + h // 2)
    
    def get_trajectory(self) -> List[Dict]:
        """Получает траекторию"""
        return list(self.trajectory)
    
    def get_max_frame(self) -> int:
        """Получает максимальный номер кадра"""
        if not self.trajectory:
            return 0
        return max(point['frame'] for point in self.trajectory)
    
    def has_frame(self, frame_number: int) -> bool:
        """Проверяет, есть ли точка в указанном кадре"""
        return any(point['frame'] == frame_number for point in self.trajectory)
