import { useState } from 'react';
import { setUserActive } from '../../lib/adminData';

export function StatusBadge({ active }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${active ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'}`}>
      {active ? 'Active' : 'Deactivated'}
    </span>
  );
}

function describeStatusError(error) {
  console.error('Status change failed:', error);
  if (error?.code === '42501' || error?.status === 401 || error?.status === 403) {
    return 'You do not have permission to change this account.';
  }
  return 'Could not update the account status. Check your connection and try again.';
}

// Activate / deactivate button. Calls onChanged(userId, newStatus) once the database accepts it.
export function StatusButton({ person, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const nextActive = !person.is_active;

  async function toggle() {
    const warning = nextActive ? '' : ' They will lose access to the portal until you reactivate them.';
    const question = `${nextActive ? 'Activate' : 'Deactivate'} ${person.full_name}?${warning}`;
    if (!window.confirm(question)) return;
    setBusy(true);
    setError('');
    try {
      await setUserActive(person.id, nextActive);
      onChanged(person.id, nextActive);
    } catch (statusError) {
      setError(describeStatusError(statusError));
    } finally {
      setBusy(false);
    }
  }

  const style = nextActive
    ? 'bg-emerald-800 text-white hover:bg-emerald-900'
    : 'border border-red-200 text-red-800 hover:bg-red-50';

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button type="button" onClick={toggle} disabled={busy} className={`rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-50 ${style}`}>
        {busy ? 'Saving…' : nextActive ? 'Activate' : 'Deactivate'}
      </button>
      {error && <span className="max-w-[220px] text-right text-xs text-red-700" role="alert">{error}</span>}
    </div>
  );
}
