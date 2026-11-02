import { useEffect } from 'react';
import { useApp, useDispatch } from '../state/context';

export function Toast() {
  const { toast } = useApp();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dispatch({ type: 'toast/dismiss' }), 4000);
    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  return (
    <div className={`toast tone-${toast.tone}`} role="status" aria-live="polite">
      <span>{toast.message}</span>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => dispatch({ type: 'toast/dismiss' })}
        aria-label="Dismiss notification"
      >
        x
      </button>
    </div>
  );
}
