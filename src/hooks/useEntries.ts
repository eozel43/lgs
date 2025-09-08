import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { DailyEntry, SubjectEntry } from '../types';

export const useEntries = (userId: string | undefined) => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = async () => {
    if (!userId) {
      setEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch daily entries with subject entries
      const { data: dailyEntries, error: dailyError } = await supabase
        .from('daily_entries')
        .select(`
          id,
          entry_date,
          subject_entries (
            subject_id,
            total_questions,
            correct_answers,
            wrong_answers,
            blank_answers
          )
        `)
        .eq('user_id', userId)
        .order('entry_date', { ascending: false });

      if (dailyError) throw dailyError;

      // Transform data to match our types
      const transformedEntries: DailyEntry[] = (dailyEntries || []).map(entry => ({
        id: entry.id,
        date: entry.entry_date,
        subjects: entry.subject_entries.reduce((acc, subjectEntry) => ({
          ...acc,
          [subjectEntry.subject_id]: {
            total: subjectEntry.total_questions,
            correct: subjectEntry.correct_answers,
            wrong: subjectEntry.wrong_answers,
            blank: subjectEntry.blank_answers,
          }
        }), {} as Record<string, SubjectEntry>)
      }));

      setEntries(transformedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry: Omit<DailyEntry, 'id'>) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      // Insert daily entry
      const { data: dailyEntry, error: dailyError } = await supabase
        .from('daily_entries')
        .insert({
          user_id: userId,
          entry_date: entry.date,
        })
        .select()
        .single();

      if (dailyError) throw dailyError;

      // Insert subject entries
      const subjectEntries = Object.entries(entry.subjects).map(([subjectId, subjectData]) => ({
        daily_entry_id: dailyEntry.id,
        subject_id: subjectId,
        total_questions: subjectData.total,
        correct_answers: subjectData.correct,
        wrong_answers: subjectData.wrong,
        blank_answers: subjectData.blank,
      }));

      const { error: subjectError } = await supabase
        .from('subject_entries')
        .insert(subjectEntries);

      if (subjectError) throw subjectError;

      // Refresh entries
      await fetchEntries();
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const updateEntry = async (entryId: string, entry: Partial<DailyEntry>) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      // Update daily entry if date changed
      if (entry.date) {
        const { error: dailyError } = await supabase
          .from('daily_entries')
          .update({ entry_date: entry.date })
          .eq('id', entryId)
          .eq('user_id', userId);

        if (dailyError) throw dailyError;
      }

      // Update subject entries if provided
      if (entry.subjects) {
        // Delete existing subject entries
        const { error: deleteError } = await supabase
          .from('subject_entries')
          .delete()
          .eq('daily_entry_id', entryId);

        if (deleteError) throw deleteError;

        // Insert new subject entries
        const subjectEntries = Object.entries(entry.subjects).map(([subjectId, subjectData]) => ({
          daily_entry_id: entryId,
          subject_id: subjectId,
          total_questions: subjectData.total,
          correct_answers: subjectData.correct,
          wrong_answers: subjectData.wrong,
          blank_answers: subjectData.blank,
        }));

        const { error: subjectError } = await supabase
          .from('subject_entries')
          .insert(subjectEntries);

        if (subjectError) throw subjectError;
      }

      // Refresh entries
      await fetchEntries();
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!userId) return { error: 'User not authenticated' };

    try {
      const { error } = await supabase
        .from('daily_entries')
        .delete()
        .eq('id', entryId)
        .eq('user_id', userId);

      if (error) throw error;

      // Refresh entries
      await fetchEntries();
      
      return { error: null };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { error: errorMessage };
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [userId]);

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: fetchEntries,
  };
};