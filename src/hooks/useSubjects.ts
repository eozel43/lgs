import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Subject } from '../types';

interface UseSubjectsResult {
  subjects: Subject[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useSubjects = (): UseSubjectsResult => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('subjects')
        .select('id, name, color')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setSubjects(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  return {
    subjects,
    loading,
    error,
    refetch: fetchSubjects,
  };
};

export default useSubjects;
