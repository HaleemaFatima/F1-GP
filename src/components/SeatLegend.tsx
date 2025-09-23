import React from 'react';

export const SeatLegend: React.FC = () => {
  return (
    <div className="bg-f1-dark rounded-lg p-4 space-y-4">
      <h3 className="font-display font-semibold text-white mb-3">Seat Legend</h3>
      
      <div className="space-y-3">
        <LegendItem
          color="seat-available"
          label="Available"
          description="Ready to book"
        />
        <LegendItem
          color="seat-selected"
          label="Selected"
          description="In your selection"
        />
        <LegendItem
          color="seat-held"
          label="Held"
          description="Reserved by others"
        />
        <LegendItem
          color="seat-sold"
          label="Sold"
          description="No longer available"
        />
      </div>

      <div className="border-t border-white/10 pt-3 mt-4">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded border border-f1-red bg-f1-red/20 flex items-center justify-center">
            <div className="w-1 h-1 bg-f1-red rounded-full"></div>
          </div>
          <span className="text-sm text-f1-gray">Wheelchair Accessible</span>
        </div>
      </div>
    </div>
  );
};

interface LegendItemProps {
  color: string;
  label: string;
  description: string;
}

const LegendItem: React.FC<LegendItemProps> = ({ color, label, description }) => (
  <div className="flex items-center space-x-3">
    <div className={`w-6 h-6 rounded ${color} border flex-shrink-0`}></div>
    <div>
      <div className="text-sm font-medium text-white">{label}</div>
      <div className="text-xs text-f1-gray">{description}</div>
    </div>
  </div>
);