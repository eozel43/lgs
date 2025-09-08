import React from 'react';
import { TrendingUp, Target } from 'lucide-react';
import { Subject, SubjectData } from '../types';

interface Props {
  subject: Subject;
  data: SubjectData;
}

const SubjectStats: React.FC<Props> = ({ subject, data }) => {
  const getProgressBarColor = (accuracy: number) => {
    if (accuracy >= 80) return 'bg-green-500';
    if (accuracy >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
      <div
        className="h-2"
        style={{ backgroundColor: subject.color }}
      />
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{subject.name}</h3>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Target className="h-4 w-4" />
            <span>{data.totalQuestions}</span>
          </div>
        </div>

        {/* Accuracy Rate */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Başarı Oranı</span>
            <span className="font-medium">{data.accuracyRate.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${getProgressBarColor(data.accuracyRate)}`}
              style={{ width: `${data.accuracyRate}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center bg-green-50 rounded-lg p-3">
            <div className="text-lg font-bold text-green-600">{data.correct}</div>
            <div className="text-xs text-green-700">Doğru</div>
          </div>
          
          <div className="text-center bg-red-50 rounded-lg p-3">
            <div className="text-lg font-bold text-red-600">{data.wrong}</div>
            <div className="text-xs text-red-700">Yanlış</div>
          </div>
          
          <div className="text-center bg-gray-50 rounded-lg p-3">
            <div className="text-lg font-bold text-gray-600">{data.blank}</div>
            <div className="text-xs text-gray-700">Boş</div>
          </div>
        </div>

        {/* Recent Trend */}
        {data.dailyEntries.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4" />
              <span>Son {data.dailyEntries.length} gün aktif</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectStats;