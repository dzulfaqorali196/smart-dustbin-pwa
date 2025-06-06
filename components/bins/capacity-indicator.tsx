interface CapacityIndicatorProps {
  capacity: number; // 0-100
}

export default function CapacityIndicator({ capacity }: CapacityIndicatorProps) {
  const getColorClass = () => {
    if (capacity < 30) return 'bg-green-500';
    if (capacity < 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLabel = () => {
    if (capacity < 30) return 'Rendah';
    if (capacity < 70) return 'Sedang';
    return 'Penuh';
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">Kapasitas</span>
        <span className="text-sm font-medium">{capacity}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`${getColorClass()} h-2.5 rounded-full`} 
          style={{ width: `${capacity}%` }}
        ></div>
      </div>
      <div className="mt-1">
        <span className="text-xs text-gray-500 dark:text-gray-400">{getLabel()}</span>
      </div>
    </div>
  );
} 