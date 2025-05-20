import { FormattedBin } from '@/lib/api/bins';
import CapacityIndicator from './capacity-indicator';

interface BinCardProps {
  bin: FormattedBin;
  onClick?: () => void;
}

export default function BinCard({ bin, onClick }: BinCardProps) {
  return (
    <div 
      className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <h3 className="font-bold">{bin.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">{bin.location}</p>
      
      <div className="mt-3">
        <CapacityIndicator capacity={bin.fillLevel} />
      </div>
      
      <div className="mt-4 flex justify-between text-sm">
        <div>
          <p className="text-gray-500 dark:text-gray-400">Status:</p>
          <p className={`font-medium ${bin.isActive ? 'text-green-500' : 'text-red-500'}`}>
            {bin.isActive ? 'Aktif' : 'Tidak Aktif'}
          </p>
        </div>
        <div>
          <p className="text-gray-500 dark:text-gray-400">Terakhir Diperbarui:</p>
          <p className="font-medium">{new Date(bin.lastUpdated).toLocaleString('id-ID', { 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}</p>
        </div>
      </div>
    </div>
  );
}
