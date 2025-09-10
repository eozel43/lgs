import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, Check, X } from 'lucide-react';
import { Subject, DailyEntry, SubjectEntry } from '../types';

interface Props {
  entries: DailyEntry[];
  subjects: Subject[];
  onUpdateEntry: (entryId: string, entry: Partial<DailyEntry>) => Promise<{ error: string | null }>;
  onDeleteEntry: (entryId: string) => Promise<{ error: string | null }>;
  loading?: boolean;
}

const EntryList: React.FC<Props> = ({ entries, subjects, onUpdateEntry, onDeleteEntry, loading = false }) => {
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editData, setEditData] = useState<Record<string, SubjectEntry>>({});
  const [submitting, setSubmitting] = useState(false);

  const startEditing = (entry: DailyEntry) => {
    setEditingEntry(entry.id);
    setEditData({ ...entry.subjects });
  };

  const cancelEditing = () => {
    setEditingEntry(null);
    setEditData({});
  };

  const handleSubjectChange = (subjectId: string, field: keyof SubjectEntry, value: number) => {
    setEditData(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  const calculateTotal = (subjectId: string) => {
    const entry = editData[subjectId];
    if (!entry) return 0;
    return entry.correct + entry.wrong + entry.blank;
  };

  const saveChanges = async (entryId: string) => {
    setSubmitting(true);
    
    // Auto-calculate totals
    const updatedSubjects = { ...editData };
    Object.keys(updatedSubjects).forEach(subjectId => {
      updatedSubjects[subjectId].total = calculateTotal(subjectId);
    });

    try {
      const { error } = await onUpdateEntry(entryId, { subjects: updatedSubjects });
      if (!error) {
        setEditingEntry(null);
        setEditData({});
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (window.confirm('Bu girişi silmek istediğinizden emin misiniz?')) {
      await onDeleteEntry(entryId);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz giriş yapılmamış</h3>
        <p className="text-gray-500">İlk günlük girişinizi yapmak için "Günlük Giriş" sekmesini kullanın.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          Geçmiş Girişler
        </h2>

        <div className="space-y-4">
          {entries.map(entry => (
            <div key={entry.id} className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {new Date(entry.date).toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
                
                <div className="flex items-center space-x-2">
                  {editingEntry === entry.id ? (
                    <>
                      <button
                        onClick={() => saveChanges(entry.id)}
                        disabled={submitting}
                        className="flex items-center space-x-1 text-green-600 hover:text-green-700 disabled:opacity-50"
                      >
                        <Check className="h-4 w-4" />
                        <span>Kaydet</span>
                      </button>
                      <button
                        onClick={cancelEditing}
                        disabled={submitting}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-700 disabled:opacity-50"
                      >
                        <X className="h-4 w-4" />
                        <span>İptal</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => startEditing(entry)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="h-4 w-4" />
                        <span>Düzenle</span>
                      </button>
                      <button
                        onClick={() => deleteEntry(entry.id)}
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Sil</span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {subjects.map(subject => {
                  const subjectData = editingEntry === entry.id 
                    ? editData[subject.id] || { total: 0, correct: 0, wrong: 0, blank: 0 }
                    : entry.subjects[subject.id] || { total: 0, correct: 0, wrong: 0, blank: 0 };

                  return (
                    <div
                      key={subject.id}
                      className="bg-gray-50 rounded-lg p-4 border-l-4"
                      style={{ borderLeftColor: subject.color }}
                    >
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </h4>

                      {editingEntry === entry.id ? (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-green-700 mb-1">
                              Doğru
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={subjectData.correct}
                              onChange={(e) => handleSubjectChange(subject.id, 'correct', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-red-700 mb-1">
                              Yanlış
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={subjectData.wrong}
                              onChange={(e) => handleSubjectChange(subject.id, 'wrong', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Boş
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={subjectData.blank}
                              onChange={(e) => handleSubjectChange(subject.id, 'blank', parseInt(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-blue-700 mb-1">
                              Toplam
                            </label>
                            <div className="w-full px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 font-medium">
                              {calculateTotal(subject.id)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-4 gap-3">
                          <div className="text-center bg-green-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-green-600">{subjectData.correct}</div>
                            <div className="text-xs text-green-700">Doğru</div>
                          </div>
                          
                          <div className="text-center bg-red-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-red-600">{subjectData.wrong}</div>
                            <div className="text-xs text-red-700">Yanlış</div>
                          </div>
                          
                          <div className="text-center bg-gray-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-gray-600">{subjectData.blank}</div>
                            <div className="text-xs text-gray-700">Boş</div>
                          </div>
                          
                          <div className="text-center bg-blue-50 rounded-lg p-3">
                            <div className="text-lg font-bold text-blue-600">{subjectData.total}</div>
                            <div className="text-xs text-blue-700">Toplam</div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default EntryList;