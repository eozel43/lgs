import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, TrendingUp, Calendar, Award, Target } from 'lucide-react';
import DailyEntryForm from './components/DailyEntryForm';
import SubjectStats from './components/SubjectStats';
import ReportsSection from './components/ReportsSection';
import { Subject, DailyEntry, SubjectData } from './types';

const SUBJECTS: Subject[] = [
  { id: 'turkce', name: 'Türkçe', color: '#EF4444' },
  { id: 'matematik', name: 'Matematik', color: '#3B82F6' },
  { id: 'fen', name: 'Fen Bilgisi', color: '#10B981' },
  { id: 'sosyal', name: 'Sosyal Bilgiler', color: '#F59E0B' },
  { id: 'din', name: 'Din Kültürü ve Ahlak Bilgisi', color: '#8B5CF6' },
  { id: 'ingilizce', name: 'İngilizce', color: '#EC4899' }
];

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'reports'>('dashboard');
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [subjectStats, setSubjectStats] = useState<Record<string, SubjectData>>({});

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedEntries = localStorage.getItem('lgs-entries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  // Calculate subject statistics whenever entries change
  useEffect(() => {
    const stats: Record<string, SubjectData> = {};
    
    SUBJECTS.forEach(subject => {
      stats[subject.id] = {
        totalQuestions: 0,
        correct: 0,
        wrong: 0,
        blank: 0,
        accuracyRate: 0,
        dailyEntries: []
      };
    });

    entries.forEach(entry => {
      Object.keys(entry.subjects).forEach(subjectId => {
        const subjectEntry = entry.subjects[subjectId];
        if (stats[subjectId]) {
          stats[subjectId].totalQuestions += subjectEntry.total;
          stats[subjectId].correct += subjectEntry.correct;
          stats[subjectId].wrong += subjectEntry.wrong;
          stats[subjectId].blank += subjectEntry.blank;
          stats[subjectId].dailyEntries.push({
            date: entry.date,
            ...subjectEntry
          });
        }
      });
    });

    // Calculate accuracy rates
    Object.keys(stats).forEach(subjectId => {
      const stat = stats[subjectId];
      if (stat.totalQuestions > 0) {
        stat.accuracyRate = (stat.correct / stat.totalQuestions) * 100;
      }
    });

    setSubjectStats(stats);
  }, [entries]);

  const addEntry = (entry: DailyEntry) => {
    const newEntries = [...entries, entry];
    setEntries(newEntries);
    localStorage.setItem('lgs-entries', JSON.stringify(newEntries));
  };

  const getTotalStats = () => {
    const total = {
      totalQuestions: 0,
      correct: 0,
      wrong: 0,
      blank: 0,
      accuracyRate: 0
    };

    Object.values(subjectStats).forEach(stat => {
      total.totalQuestions += stat.totalQuestions;
      total.correct += stat.correct;
      total.wrong += stat.wrong;
      total.blank += stat.blank;
    });

    if (total.totalQuestions > 0) {
      total.accuracyRate = (total.correct / total.totalQuestions) * 100;
    }

    return total;
  };

  const totalStats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                <BookOpen className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LGS Takip Sistemi</h1>
                <p className="text-sm text-gray-600">Lise Giriş Sınavı Hazırlık Platformu</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{totalStats.totalQuestions}</div>
                <div className="text-xs text-gray-500">Toplam Soru</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{totalStats.accuracyRate.toFixed(1)}%</div>
                <div className="text-xs text-gray-500">Başarı Oranı</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'dashboard', label: 'Genel Görünüm', icon: TrendingUp },
              { id: 'entry', label: 'Günlük Giriş', icon: Calendar },
              { id: 'reports', label: 'Raporlar', icon: BarChart3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as typeof activeTab)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors ${
                  activeTab === id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Toplam Soru</p>
                    <p className="text-3xl font-bold text-gray-900">{totalStats.totalQuestions}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <Target className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Doğru Sayısı</p>
                    <p className="text-3xl font-bold text-green-600">{totalStats.correct}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-xl">
                    <Award className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Yanlış Sayısı</p>
                    <p className="text-3xl font-bold text-red-600">{totalStats.wrong}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-xl">
                    <div className="h-6 w-6 text-red-600 font-bold text-xl">✗</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Başarı Oranı</p>
                    <p className="text-3xl font-bold text-purple-600">{totalStats.accuracyRate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-xl">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Statistics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {SUBJECTS.map(subject => (
                <SubjectStats
                  key={subject.id}
                  subject={subject}
                  data={subjectStats[subject.id] || {
                    totalQuestions: 0,
                    correct: 0,
                    wrong: 0,
                    blank: 0,
                    accuracyRate: 0,
                    dailyEntries: []
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'entry' && (
          <DailyEntryForm subjects={SUBJECTS} onAddEntry={addEntry} />
        )}

        {activeTab === 'reports' && (
          <ReportsSection subjects={SUBJECTS} entries={entries} subjectStats={subjectStats} />
        )}
      </main>
    </div>
  );
}

export default App;