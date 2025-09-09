import React, { useState, useMemo } from 'react';
import { BarChart3, Calendar, Download, TrendingUp } from 'lucide-react';
import { Subject, DailyEntry, SubjectData } from '../types';

interface Props {
  subjects: Subject[];
  entries: DailyEntry[];
  subjectStats: Record<string, SubjectData>;
}

const ReportsSection: React.FC<Props> = ({ subjects, entries, subjectStats }) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'7' | '30' | '90' | 'all'>('30');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Filter entries based on selected period
  const filteredEntries = useMemo(() => {
    if (selectedPeriod === 'all') return entries;
    
    const days = parseInt(selectedPeriod);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return entries.filter(entry => new Date(entry.date) >= cutoffDate);
  }, [entries, selectedPeriod]);

  // Calculate period statistics
  const periodStats = useMemo(() => {
    const stats = {
      totalQuestions: 0,
      correct: 0,
      wrong: 0,
      blank: 0,
      accuracyRate: 0,
      dailyAverages: {
        questions: 0,
        accuracy: 0
      }
    };

    filteredEntries.forEach(entry => {
      Object.values(entry.subjects).forEach(subjectEntry => {
        stats.totalQuestions += subjectEntry.total;
        stats.correct += subjectEntry.correct;
        stats.wrong += subjectEntry.wrong;
        stats.blank += subjectEntry.blank;
      });
    });

    if (stats.totalQuestions > 0) {
      stats.accuracyRate = (stats.correct / stats.totalQuestions) * 100;
    }

    if (filteredEntries.length > 0) {
      stats.dailyAverages.questions = stats.totalQuestions / filteredEntries.length;
      stats.dailyAverages.accuracy = stats.accuracyRate;
    }

    return stats;
  }, [filteredEntries]);

  // Get subject performance comparison
  const subjectComparison = useMemo(() => {
    return subjects.map(subject => {
      const data = subjectStats[subject.id] || {
        totalQuestions: 0,
        correct: 0,
        wrong: 0,
        blank: 0,
        accuracyRate: 0,
        dailyEntries: []
      };

      return {
        ...subject,
        ...data
      };
    }).sort((a, b) => b.accuracyRate - a.accuracyRate);
  }, [subjects, subjectStats]);

  // Calculate daily trends
  const dailyTrends = useMemo(() => {
    const trends = filteredEntries.map(entry => {
      let totalQuestions = 0;
      let correct = 0;

      Object.values(entry.subjects).forEach(subjectEntry => {
        totalQuestions += subjectEntry.total;
        correct += subjectEntry.correct;
      });

      return {
        date: entry.date,
        totalQuestions,
        accuracy: totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return trends;
  }, [filteredEntries]);

  return (
    <div className="space-y-8">
      {/* Header with Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Detaylı Raporlar</h2>
          </div>
          
          <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
            <Download className="h-5 w-5" />
            <span>Raporu İndir</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {/* Period Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dönem</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as '7' | '30' | '90' | 'all')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="7">Son 7 Gün</option>
              <option value="30">Son 30 Gün</option>
              <option value="90">Son 90 Gün</option>
              <option value="all">Tüm Zamanlar</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ders</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">Tüm Dersler</option>
              {subjects.map(subject => (
                <option key={subject.id} value={subject.id}>{subject.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Toplam Soru</h3>
          <p className="text-3xl font-bold text-blue-600">{periodStats.totalQuestions}</p>
          <p className="text-sm text-gray-500 mt-1">
            Günlük ortalama: {periodStats.dailyAverages.questions.toFixed(1)}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Ortalama Başarı</h3>
          <p className="text-3xl font-bold text-green-600">{periodStats.accuracyRate.toFixed(1)}%</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredEntries.length} gün verisi
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">En İyi Ders</h3>
          <p className="text-lg font-bold text-purple-600">
            {subjectComparison[0]?.name || 'Veri Yok'}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {subjectComparison[0]?.accuracyRate.toFixed(1) || 0}% başarı oranı
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Çalışma Günü</h3>
          <p className="text-3xl font-bold text-orange-600">{filteredEntries.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            Seçilen dönemde
          </p>
        </div>
      </div>

      {/* Subject Performance Comparison */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Ders Performans Karşılaştırması
        </h3>

        <div className="space-y-4">
          {subjectComparison.map((subject, index) => (
            <div key={subject.id} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-8">
                <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
              </div>
              
              <div className="flex-shrink-0 w-40">
                <span className="text-sm font-medium text-gray-900">{subject.name}</span>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-3">
                    <div
                      className="h-3 rounded-full transition-all"
                      style={{ 
                        width: `${subject.accuracyRate}%`,
                        backgroundColor: subject.color 
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12">
                    {subject.accuracyRate.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex-shrink-0 text-right">
                <span className="text-sm text-gray-500">{subject.totalQuestions} soru</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Trends Chart */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Günlük İlerleme Trendi
        </h3>

        {dailyTrends.length > 0 ? (
          <div className="space-y-4">
            {dailyTrends.map((trend) => (
              <div key={trend.date} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-24 text-sm text-gray-600">
                  {new Date(trend.date).toLocaleDateString('tr-TR')}
                </div>
                
                <div className="flex-1 flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                      style={{ width: `${trend.accuracy}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-600 w-12">
                    {trend.accuracy.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <span className="text-sm text-gray-500">{trend.totalQuestions} soru</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            Henüz veri bulunmuyor. Günlük giriş yaparak raporları görmeye başlayın.
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsSection;