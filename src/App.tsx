import React, { useState, useEffect } from 'react';
import { BookOpen, BarChart3, TrendingUp, Calendar, Award, Target, LogOut } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useEntries } from './hooks/useEntries';
import { isSupabaseConfigured } from './lib/supabase';
import AuthForm from './components/AuthForm';
import DailyEntryForm from './components/DailyEntryForm';
import SubjectStats from './components/SubjectStats';
import ReportsSection from './components/ReportsSection';
import EntryList from './components/EntryList';
import { Subject, SubjectData } from './types';

const SUBJECTS: Subject[] = [
  { id: 'turkce', name: 'Türkçe', color: '#EF4444' },
  { id: 'matematik', name: 'Matematik', color: '#3B82F6' },
  { id: 'fen', name: 'Fen Bilgisi', color: '#10B981' },
  { id: 'sosyal', name: 'Sosyal Bilgiler', color: '#F59E0B' },
  { id: 'din', name: 'Din Kültürü ve Ahlak Bilgisi', color: '#8B5CF6' },
  { id: 'ingilizce', name: 'İngilizce', color: '#EC4899' }
];

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { entries, loading: entriesLoading, addEntry, updateEntry, deleteEntry } = useEntries(user?.id);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entry' | 'reports' | 'history'>('dashboard');
  const [subjectStats, setSubjectStats] = useState<Record<string, SubjectData>>({});

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

  // Show Supabase connection warning if not configured
  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-200 p-8 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl mb-6">
            <BookOpen className="h-12 w-12 text-white mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Supabase Bağlantısı Gerekli</h2>
          <p className="text-gray-600 mb-6">
            LGS Takip Sistemi'ni kullanmak için mevcut "lgs" Supabase projenize bağlanmanız gerekiyor.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              1. Sağ üstteki <strong>"Connect to Supabase"</strong> butonuna tıklayın<br/>
              2. Mevcut <strong>"lgs"</strong> projenizi seçin<br/>
              3. Bağlantı kurulduktan sonra sayfa yenilenecektir
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              <strong>Not:</strong> Mevcut "lgs" projenizde gerekli tablolar otomatik olarak oluşturulacaktır.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading screen while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-xl mb-4">
            <BookOpen className="h-12 w-12 text-white mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">LGS Takip Sistemi</h2>
          <p className="text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show auth form if not logged in
  if (!user) {
    return <AuthForm />;
  }

  const handleSignOut = async () => {
    await signOut();
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
            <div className="flex items-center space-x-6">
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
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1">Hoş geldin,</p>
                <p className="font-medium text-gray-900">{user.user_metadata?.full_name || user.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="h-5 w-5" />
              </button>
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
              { id: 'reports', label: 'Raporlar', icon: BarChart3 },
              { id: 'history', label: 'Geçmiş Girişler', icon: Calendar }
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
          <DailyEntryForm 
            subjects={SUBJECTS} 
            onAddEntry={addEntry}
            loading={entriesLoading}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsSection subjects={SUBJECTS} entries={entries} subjectStats={subjectStats} />
        )}

        {activeTab === 'history' && (
          <EntryList 
            entries={entries}
            subjects={SUBJECTS}
            onUpdateEntry={updateEntry}
            onDeleteEntry={deleteEntry}
            loading={entriesLoading}
          />
        )}
      </main>
    </div>
  );
}

export default App;