import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchTeacherQuestions } from '../api/chat.js';

export function useTeacher() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [topicFilter, setTopicFilter] = useState('all');
  const [flagFilter, setFlagFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [reviewed, setReviewed] = useState(() => new Set());

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { items } = await fetchTeacherQuestions();
      setItems(items || []);
    } catch (err) {
      setError(err.message || 'Không tải được danh sách');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const sorted = useMemo(() => {
    const arr = items.slice();
    arr.sort((a, b) => {
      const aFailed = !a.answer;
      const bFailed = !b.answer;
      if (aFailed !== bFailed) return aFailed ? -1 : 1;

      const aTime = new Date(a.question.created_at).getTime();
      const bTime = new Date(b.question.created_at).getTime();
      const dayA = Math.floor(aTime / 86400000);
      const dayB = Math.floor(bTime / 86400000);
      if (dayA !== dayB) return dayB - dayA;

      const aLow = (a.answer?.confidence ?? 100) < 60 ? 0 : 1;
      const bLow = (b.answer?.confidence ?? 100) < 60 ? 0 : 1;
      if (aLow !== bLow) return aLow - bLow;

      return bTime - aTime;
    });
    return arr;
  }, [items]);

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return sorted.filter(it => {
      if (topicFilter !== 'all') {
        const topics = it.answer?.topics || [];
        if (!topics.includes(topicFilter)) return false;
      }
      if (flagFilter === 'flagged' && !it.flag) return false;
      if (flagFilter === 'unflagged' && it.flag) return false;
      if (needle && !it.question.text.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [sorted, topicFilter, flagFilter, search]);

  const capped = useMemo(() => filtered.slice(0, 50), [filtered]);
  const truncated = filtered.length > capped.length;

  const counts = useMemo(() => {
    let flagged = 0;
    let lowConf = 0;
    let failed = 0;
    for (const it of items) {
      if (it.flag) flagged++;
      if (!it.answer) failed++;
      else if ((it.answer.confidence ?? 100) < 60) lowConf++;
    }
    return { total: items.length, flagged, lowConf, failed };
  }, [items]);

  const selected = useMemo(
    () => capped.find(it => it.question.id === selectedId) || capped[0] || null,
    [capped, selectedId]
  );

  const markReviewed = useCallback((questionId) => {
    setReviewed(prev => {
      const next = new Set(prev);
      next.add(questionId);
      return next;
    });
  }, []);

  const unmarkReviewed = useCallback((questionId) => {
    setReviewed(prev => {
      const next = new Set(prev);
      next.delete(questionId);
      return next;
    });
  }, []);

  const removeFlagLocal = useCallback((questionId) => {
    setItems(prev => prev.map(it => (
      it.question.id === questionId ? { ...it, flag: null } : it
    )));
  }, []);

  const restoreFlagLocal = useCallback((questionId, flag) => {
    setItems(prev => prev.map(it => (
      it.question.id === questionId ? { ...it, flag } : it
    )));
  }, []);

  return {
    loading,
    error,
    items,
    filtered,
    capped,
    truncated,
    counts,
    selected,
    setSelectedId,
    topicFilter,
    setTopicFilter,
    flagFilter,
    setFlagFilter,
    search,
    setSearch,
    reviewed,
    markReviewed,
    unmarkReviewed,
    removeFlagLocal,
    restoreFlagLocal,
    reload: load,
  };
}
