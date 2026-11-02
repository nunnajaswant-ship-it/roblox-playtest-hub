import { useState } from 'react';
import { useDispatch } from '../state/context';
import { TestBuild } from '../game/TestBuild';

type Variant = '0.5.0' | '0.5.1';

export function PlaytestView() {
  const dispatch = useDispatch();
  const [variant, setVariant] = useState<Variant>('0.5.0');

  return (
    <div className="view">
      <div className="view-head">
        <div>
          <h1 className="view-title">Build 0.5.0 is live for testing</h1>
          <p className="view-sub">
            Play it. Something will feel wrong. File it, and the pipeline takes over.
          </p>
        </div>
        <div className="row">
          <select
            className="select"
            aria-label="Choose a build to play"
            value={variant}
            onChange={(event) => setVariant(event.target.value as Variant)}
          >
            <option value="0.5.0">0.5.0 - under test</option>
            <option value="0.5.1">0.5.1 - fixes applied</option>
          </select>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => dispatch({ type: 'form/open' })}
          >
            Report a bug
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => dispatch({ type: 'run/finish' })}
          >
            Open workspace
          </button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body">
          <TestBuild variant={variant} />
        </div>
      </div>

      <div className="banner">
        <span>
          <strong>0.5.0</strong> is the build under test and it ships with real defects.
          <strong> 0.5.1</strong> is the same scene after the agent team patched them.
          The old build stays playable - that is the point.
        </span>
      </div>
    </div>
  );
}
