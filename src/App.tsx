import { useEffect } from 'react';
import { StoreProvider } from './state/StoreProvider';
import { useApp, useDispatch } from './state/context';
import { AppHeader } from './components/AppHeader';
import { Nav } from './components/Nav';
import { Toast } from './components/Toast';
import { ReportForm } from './components/ReportForm';
import { ReportDrawer } from './components/ReportDrawer';
import { OverviewView } from './views/OverviewView';
import { PlaytestView } from './views/PlaytestView';
import { TriageView } from './views/TriageView';
import { ReportsView } from './views/ReportsView';
import { PipelineView } from './views/PipelineView';
import { ReadinessView } from './views/ReadinessView';
import { DataView } from './views/DataView';

import { PipelineRunView } from './views/PipelineRunView';

function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' ||
    target.tagName === 'TEXTAREA' ||
    target.tagName === 'SELECT' ||
    target.isContentEditable
  );
}

function Workspace() {
  const { view, formOpen } = useApp();
  const dispatch = useDispatch();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTyping(event.target) || formOpen) return;

      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault();
        dispatch({ type: 'form/open' });
        return;
      }

      if (event.key === '/') {
        const search = document.querySelector<HTMLInputElement>('[data-search]');
        if (search) {
          event.preventDefault();
          search.focus();
        }
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dispatch, formOpen]);

  if (view === 'run') {
    return (
      <>
        <PipelineRunView />
        <ReportForm />
        <Toast />
      </>
    );
  }

  return (
    <div className="app">
      <AppHeader />
      <Nav />
      <main className="main" id="main">
        {view === 'overview' ? <OverviewView /> : null}
        {view === 'playtest' ? <PlaytestView /> : null}
        {view === 'triage' ? <TriageView /> : null}
        {view === 'reports' ? <ReportsView /> : null}
        {view === 'pipeline' ? <PipelineView /> : null}
        {view === 'readiness' ? <ReadinessView /> : null}
        {view === 'data' ? <DataView /> : null}
      </main>

      <ReportForm />
      <ReportDrawer />
      <Toast />
    </div>
  );
}

export function App() {
  return (
    <StoreProvider>
      <Workspace />
    </StoreProvider>
  );
}
