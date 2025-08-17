import numpy as np
from scipy.interpolate import splprep, splev
from typing import List, Dict, Tuple
import cv2

class TrajectorySmoother:
    """Сглаживание траекторий движения людей"""
    
    def __init__(self, smoothness_factor: float = 0.1):
        """
        Args:
            smoothness_factor: Коэффициент плавности (0.01 - очень плавно, 1.0 - почти прямые)
        """
        self.smoothness_factor = max(0.01, min(1.0, smoothness_factor))
        print(f"🎨 TrajectorySmoother инициализирован с плавностью: {self.smoothness_factor}")
    
    def smooth_trajectory(self, trajectory: List[Dict]) -> List[Dict]:
        """
        Сглаживает траекторию движения
        
        Args:
            trajectory: Список точек траектории [{'x': x, 'y': y, 'frame': frame}, ...]
            
        Returns:
            Сглаженная траектория с интерполированными точками
        """
        if len(trajectory) < 3:
            return trajectory  # Нечего сглаживать
        
        try:
            # Проверяем и фильтруем валидные точки
            valid_points = []
            for point in trajectory:
                if isinstance(point, dict) and 'x' in point and 'y' in point:
                    try:
                        x = float(point['x'])
                        y = float(point['y'])
                        if not (np.isnan(x) or np.isnan(y) or np.isinf(x) or np.isinf(y)):
                            valid_points.append(point)
                    except (ValueError, TypeError):
                        continue
            
            if len(valid_points) < 3:
                print(f"⚠️ Недостаточно валидных точек для сглаживания: {len(valid_points)}")
                return trajectory
            
            # Извлекаем координаты
            x_coords = [float(point['x']) for point in valid_points]
            y_coords = [float(point['y']) for point in valid_points]
            
            # Проверяем, что координаты не все одинаковые
            if len(set(x_coords)) < 2 or len(set(y_coords)) < 2:
                print(f"⚠️ Все точки имеют одинаковые координаты")
                return trajectory
            
            # Создаем параметр t для интерполяции
            t = np.linspace(0, 1, len(valid_points))
            
            # B-spline интерполяция
            try:
                tck, u = splprep([x_coords, y_coords], 
                                s=self.smoothness_factor * len(valid_points),  # Параметр сглаживания
                                k=min(3, len(valid_points)-1),  # Степень сплайна
                                per=False,  # Не периодическая
                                quiet=True)  # Тихий режим
                
                # Генерируем больше точек для плавности
                num_points = max(len(valid_points) * 3, 50)
                u_new = np.linspace(0, 1, num_points)
                
                # Вычисляем сглаженные координаты
                smoothed_coords = splev(u_new, tck)
                x_smooth, y_smooth = smoothed_coords
                
                # Создаем сглаженную траекторию
                smoothed_trajectory = []
                for i in range(len(x_smooth)):
                    # Интерполируем frame и timestamp
                    if i == 0:
                        frame = valid_points[0].get('frame', 0)
                        timestamp = valid_points[0].get('timestamp', 0)
                    elif i == len(x_smooth) - 1:
                        frame = valid_points[-1].get('frame', 0)
                        timestamp = valid_points[-1].get('timestamp', 0)
                    else:
                        # Линейная интерполяция frame и timestamp
                        progress = i / (len(x_smooth) - 1)
                        frame = int(valid_points[0].get('frame', 0) + progress * (valid_points[-1].get('frame', 0) - valid_points[0].get('frame', 0)))
                        timestamp = valid_points[0].get('timestamp', 0) + progress * (valid_points[-1].get('timestamp', 0) - valid_points[0].get('timestamp', 0))
                    
                    smoothed_trajectory.append({
                        'x': int(x_smooth[i]),
                        'y': int(y_smooth[i]),
                        'frame': frame,
                        'timestamp': timestamp
                    })
                
                print(f"✨ Траектория сглажена: {len(trajectory)} → {len(smoothed_trajectory)} точек")
                return smoothed_trajectory
                
            except Exception as spline_error:
                print(f"⚠️ Ошибка B-spline интерполяции: {spline_error}")
                # Fallback: простое сглаживание
                return self._simple_smoothing(valid_points)
            
        except Exception as e:
            print(f"⚠️ Ошибка сглаживания: {e}, возвращаем исходную траекторию")
            return trajectory
    
    def _simple_smoothing(self, points: List[Dict]) -> List[Dict]:
        """Простое сглаживание как fallback"""
        try:
            if len(points) < 2:
                return points
            
            # Простое сглаживание: добавляем промежуточные точки
            smoothed = []
            for i in range(len(points) - 1):
                current = points[i]
                next_point = points[i + 1]
                
                # Добавляем текущую точку
                smoothed.append(current)
                
                # Добавляем промежуточную точку
                mid_x = (current['x'] + next_point['x']) // 2
                mid_y = (current['y'] + next_point['y']) // 2
                mid_frame = (current.get('frame', 0) + next_point.get('frame', 0)) // 2
                mid_timestamp = (current.get('timestamp', 0) + next_point.get('timestamp', 0)) / 2
                
                smoothed.append({
                    'x': mid_x,
                    'y': mid_y,
                    'frame': mid_frame,
                    'timestamp': mid_timestamp
                })
            
            # Добавляем последнюю точку
            smoothed.append(points[-1])
            
            print(f"🔄 Простое сглаживание: {len(points)} → {len(smoothed)} точек")
            return smoothed
            
        except Exception as e:
            print(f"⚠️ Ошибка простого сглаживания: {e}")
            return points
    
    def adjust_smoothness(self, new_smoothness: float):
        """Изменяет коэффициент плавности"""
        self.smoothness_factor = max(0.01, min(1.0, new_smoothness))
        print(f"🎛️ Плавность изменена на: {self.smoothness_factor}")
    
    def get_smoothness_info(self) -> Dict:
        """Возвращает информацию о текущих настройках плавности"""
        return {
            'smoothness_factor': self.smoothness_factor,
            'description': self._get_smoothness_description()
        }
    
    def _get_smoothness_description(self) -> str:
        """Описание уровня плавности"""
        if self.smoothness_factor < 0.05:
            return "Очень плавные линии"
        elif self.smoothness_factor < 0.2:
            return "Плавные линии"
        elif self.smoothness_factor < 0.5:
            return "Умеренно плавные линии"
        else:
            return "Почти прямые линии"
