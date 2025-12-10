import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface FactItem {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface FactSheetProps {
  title: string;
  facts: FactItem[];
  className?: string;
}

const FactSheet: React.FC<FactSheetProps> = ({ title, facts, className = '' }) => {
  return (
    <div className={`bg-slate-900/50 border border-slate-700 rounded-xl p-6 backdrop-blur-sm ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facts.map((fact, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="mt-1 text-blue-400 shrink-0">
              {fact.icon || <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <p className="text-sm text-slate-400 font-medium">{fact.label}</p>
              <p className="text-base text-white font-semibold">{fact.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FactSheet;
