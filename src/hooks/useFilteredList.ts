import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AxiosResponse } from 'axios';
import type { Paginated } from '../api/monitor';

/**
 * Filter state + fetching for a data screen.
 *
 * All four screens page, debounce their search and reset to page 1 whenever a
 * filter changes. Doing that once here keeps them from drifting - it is exactly
 * the kind of detail that gets fixed on one screen and forgotten on the others.
 */

const SEARCH_DEBOUNCE_MS = 350;

export interface ListFilters {
  search: string;
  state: string;
  dateFrom: string;
  dateTo: string;
  [key: string]: string;
}

export function useFilteredList<T>(
  fetcher: (params: Record<string, string | number>) => Promise<AxiosResponse<Paginated<T>>>,
  extraDefaults: Record<string, string> = {},
) {
  const [filters, setFilters] = useState<ListFilters>({
    search: '',
    state: '',
    dateFrom: '',
    dateTo: '',
    ...extraDefaults,
  });
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Typing a name should not fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(filters.search), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [filters.search]);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // A filtered-down result set almost never has the page you were on.
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setFilters({ search: '', state: '', dateFrom: '', dateTo: '', ...extraDefaults });
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(extraDefaults)]);

  const queryKey = useMemo(() => {
    // The live `search` is deliberately excluded — the debounced copy below is
    // what drives the request, so a keystroke alone must not retrigger it.
    const rest: Record<string, string> = {};
    for (const [key, value] of Object.entries(filters)) {
      if (key !== 'search') rest[key] = value;
    }
    return JSON.stringify({ ...rest, search: debouncedSearch, page });
  }, [filters, debouncedSearch, page]);

  // Guards against a slow early request landing after a faster later one and
  // painting stale rows over fresh ones.
  const requestRef = useRef(0);

  useEffect(() => {
    const requestId = ++requestRef.current;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, string | number> = {
          search: debouncedSearch,
          page,
        };
        for (const [key, value] of Object.entries(filters)) {
          // `search` is replaced by its debounced copy; the date fields are
          // renamed to the snake_case the API expects.
          if (key === 'search' || key === 'dateFrom' || key === 'dateTo') continue;
          params[key] = value;
        }
        if (filters.dateFrom) params.date_from = filters.dateFrom;
        if (filters.dateTo) params.date_to = filters.dateTo;

        const { data } = await fetcher(params);
        if (cancelled || requestId !== requestRef.current) return;

        setRows(data.results ?? []);
        setCount(data.count ?? 0);
        setTotalPages(data.total_pages ?? 1);
        if (data.facets?.states) setStateOptions(data.facets.states);
      } catch (err) {
        if (cancelled || requestId !== requestRef.current) return;
        console.error('[monitor] list request failed', err);
        setError('Could not load this list. Check your connection and try again.');
        setRows([]);
        setCount(0);
        setTotalPages(1);
      } finally {
        if (!cancelled && requestId === requestRef.current) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryKey]);

  // The server sends the full state list for the resource. Holding it in its
  // own state keeps the dropdown steady while a request is in flight, instead
  // of collapsing to whatever the last page happened to contain.
  const [stateOptions, setStateOptions] = useState<string[]>([]);

  return {
    filters,
    setFilter,
    reset,
    page,
    setPage,
    rows,
    count,
    totalPages,
    loading,
    error,
    stateOptions,
  };
}
