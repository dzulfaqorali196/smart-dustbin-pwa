import { FormattedBin } from '@/lib/api/bins';
import { motion } from 'framer-motion';
import CapacityIndicator from './capacity-indicator';

interface BinCardProps {
  bin: FormattedBin;
  onClick?: () => void;
}

export default function BinCard({ bin }: BinCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.1 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      className="bg-white dark:bg-gray-800 p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-all border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white">{bin.name}</h3>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">{bin.location}</p>
        </div>
        
        <div className="flex items-center">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
            bin.isActive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {bin.isActive ? 'Aktif' : 'Tidak Aktif'}
          </span>
        </div>
      </div>
      
      <div className="mt-2 sm:mt-3">
        <CapacityIndicator capacity={bin.fillLevel} />
      </div>
      
      <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-4 text-xs sm:text-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Level Pengisian</p>
            <p className="font-medium text-gray-900 dark:text-white">{bin.fillLevel}%</p>
          </div>
        </div>
        
        <div className="flex items-center text-right sm:text-left">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Update Terakhir</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {new Date(bin.lastUpdated).toLocaleString('id-ID', { 
                day: 'numeric', 
                month: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
