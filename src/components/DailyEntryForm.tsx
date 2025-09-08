import React, { useState } from 'react';
import { Plus, Save, Calendar } from 'lucide-react';
import { Subject, DailyEntry, SubjectEntry } from '../types';

interface Props {
  subjects: Subject[];
  onAddEntry: (entry: DailyEntry) => void;
}

const DailyEntryForm: React.FC<Props> = ({ subjects, onAddEntry }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subjectEntries, setSubjectEntries] = useState<Record<string, SubjectEntry>>(
    subjects.reduce((acc, subject) => ({
      ...acc,
      [subject.id]: { total: 0, correct: 0, wrong: 0, blank: 0 }
    }), {})
  );

  const handleSubjectChange = (subjectId: string, field: keyof SubjectEntry, value: number) => {
    setSubjectEntries(prev => ({
      ...prev,
      [subjectId]: {
        ...prev[subjectId],
        [field]: value
      }
    }));
  };

  const calculateTotal = (subjectId: string) => {
    const entry = subjectEntries[subjectId];
    return entry.correct + entry.wrong + entry.blank;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const entry: DailyEntry = {
      id: Date.now().toString(),
      date,
      subjects: { ...subjectEntries }
    };

    // Auto-calculate totals
    Object.keys(entry.subjects).forEach(subjectId => {
      entry.subjects[subjectId].total = calculateTotal(subjectId);
    });

    onAddEntry(entry);
    
    // Reset form
    setSubjectEntries(subjects.reduce((acc, subject) => ({
      ...acc,
      [subject.id]: { total: 0, correct: 0, wrong: 0, blank: 0 }
    }), {}));
    
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Günlük Soru Girişi</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Date Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarih Seçin
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Subject Entries */}
          <div className="space-y-6">
            {subjects.map(subject => (
              <div
                key={subject.id}
                className="bg-gray-50 rounded-xl p-4 border-l-4"
                style={{ borderLeftColor: subject.color }}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: subject.color }}
                  />
                  {subject.name}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-green-700 mb-1">
                      Doğru
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={subjectEntries[subject.id]?.correct || 0}
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
                      value={subjectEntries[subject.id]?.wrong || 0}
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
                      value={subjectEntries[subject.id]?.blank || 0}
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
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className="mt-8 flex justify-end">
            <button
              type="submit"
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-colors shadow-lg"
            >
              <Save className="h-5 w-5" />
              <span>Kaydet</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DailyEntryForm;