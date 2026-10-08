import { useCallback, useEffect, useState } from 'react';
import { friendlyDataError } from '../lib/academicData';

export default function useRemoteData(loadData) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    let active = true;
    loadData().then((nextData) => {
      if (active) setData(nextData);
    }).catch((requestError) => {
      if (active) {
        setData(null);
        setError(friendlyDataError(requestError));
      }
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [loadData, requestId]);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    setRequestId((currentId) => currentId + 1);
  }, []);
  return { data, loading, error, refresh };
}
