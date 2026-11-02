import type { Build, Category, Frequency, Platform, Report, Severity } from '../domain/types';
import { SEVERITY_LABEL } from '../domain/severity';

export type Route =
  | 'needs_more_info'
  | 'human_required'
  | 'agent_with_review'
  | 'agent_auto';

export type StageState = 'complete' | 'active' | 'blocked' | 'pending';

export interface PipelineStage {
  id: string;
  label: string;
  owner: 'tester' | 'pipeline' | 'developer' | 'agent';
  state: StageState;
  detail: string;
}

export interface TriageResult {
  score: number;
  suggested: Severity;
  confidence: number;
  rationale: string[];
  route: Route;
  routeLabel: string;
  routeDetail: string;
  branch: string;
  stages: PipelineStage[];
  workOrder: string;
}

const CATEGORY_RISK: Record<Category, number> = {
  shop: 20,
  data: 18,
  obby: 16,
  gameplay: 14,
  performance: 10,
  ui: 8,
  other: 6,
  audio: 4
};

const FREQUENCY_RISK: Record<Frequency, number> = {
  always: 20,
  often: 14,
  sometimes: 8,
  once: 3
};

const PLATFORM_RISK: Record<Platform, number> = {
  mobile: 10,
  console: 8,
  vr: 8,
  pc: 6
};

const IMPACT_WORDS = [
  'robux',
  'purchase',
  'money',
  'lost',
  'save',
  'progress',
  'crash',
  'freeze',
  'stuck',
  'every player',
  'all players'
];

const SEVERITY_ORDER: Severity[] = ['low', 'medium', 'high', 'blocker'];

export function branchName(report: Report): string {
  return `fix/${report.ref}`;
}

export function analyze(report: Report, build: Build | undefined): TriageResult {
  const rationale: string[] = [];
  let score = 30;

  rationale.push(`base 30`);
  score += CATEGORY_RISK[report.category];
  rationale.push(`${report.category} risk +${CATEGORY_RISK[report.category]}`);
  score += FREQUENCY_RISK[report.frequency];
  rationale.push(`reproduces ${report.frequency} +${FREQUENCY_RISK[report.frequency]}`);
  score += PLATFORM_RISK[report.platform];
  rationale.push(`${report.platform} exposure +${PLATFORM_RISK[report.platform]}`);

  const haystack = `${report.title} ${report.actual} ${report.area}`.toLowerCase();
  const hits = IMPACT_WORDS.filter((word) => haystack.includes(word));
  const impact = Math.min(24, hits.length * 8);
  if (impact > 0) {
    score += impact;
    rationale.push(`impact words (${hits.join(', ')}) +${impact}`);
  }

  score = Math.max(0, Math.min(100, score));

  const suggested: Severity =
    score >= 85 ? 'blocker' : score >= 70 ? 'high' : score >= 52 ? 'medium' : 'low';

  let confidence = 40;
  if (report.steps.length >= 2) confidence += 16;
  else if (report.steps.length === 1) confidence += 8;
  if (report.screenshotUrl !== '') confidence += 12;
  if (report.actual.length >= 80) confidence += 10;
  if (report.expected.length >= 40) confidence += 8;
  confidence = Math.min(96, confidence);

  const gap = Math.abs(
    SEVERITY_ORDER.indexOf(report.severity) - SEVERITY_ORDER.indexOf(suggested)
  );

  let route: Route;
  let routeLabel: string;
  let routeDetail: string;

  if (confidence < 60) {
    route = 'needs_more_info';
    routeLabel = 'Needs more information';
    routeDetail = 'The report is too thin to reproduce. One specific question goes back to the tester.';
  } else if (gap >= 2) {
    route = 'human_required';
    routeLabel = 'Human required - severity disagreement';
    routeDetail = `Tester said ${SEVERITY_LABEL[report.severity]}, the pipeline says ${SEVERITY_LABEL[suggested]}. A person breaks the tie before any code changes.`;
  } else if (suggested === 'blocker' || suggested === 'high') {
    route = 'human_required';
    routeLabel = 'Human required';
    routeDetail = 'A person decides the approach before an agent touches the code.';
  } else if (suggested === 'medium') {
    route = 'agent_with_review';
    routeLabel = 'Agent repair, human review after';
    routeDetail = 'The agent team fixes it on a branch. Nothing merges without a human check.';
  } else {
    route = 'agent_auto';
    routeLabel = 'Agent repair, auto';
    routeDetail = 'Low impact. The agent team fixes and self-tests it on a branch.';
  }

  const stages = buildStages(report, suggested, confidence, routeLabel);

  return {
    score,
    suggested,
    confidence,
    rationale,
    route,
    routeLabel,
    routeDetail,
    branch: branchName(report),
    stages,
    workOrder: renderWorkOrder(report, build, {
      score,
      suggested,
      confidence,
      rationale,
      route,
      routeLabel,
      routeDetail,
      branch: branchName(report),
      stages: [],
      workOrder: ''
    })
  };
}

function buildStages(
  report: Report,
  suggested: Severity,
  confidence: number,
  routeLabel: string
): PipelineStage[] {
  const reproducible = report.steps.length >= 2 && report.expected !== '' && report.actual !== '';
  const fixed = report.status === 'fixed' || report.status === 'verified';
  const verified = report.status === 'verified';
  const inProgress = report.status === 'in_progress';
  const closed = report.status === 'wont_fix';

  const stages: PipelineStage[] = [
    {
      id: 'intake',
      label: 'Intake',
      owner: 'pipeline',
      state: 'complete',
      detail: `${report.ref} received from ${report.reporter} against ${
        report.area || 'an unnamed area'
      }.`
    },
    {
      id: 'reproduce',
      label: 'Reproducible report',
      owner: 'tester',
      state: reproducible ? 'complete' : 'blocked',
      detail: reproducible
        ? `${report.steps.length} steps, expected and actual present.`
        : 'Missing steps or expected/actual. The report cannot be reproduced as written.'
    },
    {
      id: 'severity',
      label: 'Severity',
      owner: 'pipeline',
      state: 'complete',
      detail: `Suggested ${SEVERITY_LABEL[suggested]} at ${confidence}% confidence.`
    },
    {
      id: 'route',
      label: 'Route',
      owner: 'pipeline',
      state: closed ? 'blocked' : 'complete',
      detail: closed ? 'Closed as wont-fix. Pipeline stops here.' : routeLabel
    },
    {
      id: 'repair',
      label: 'Agent repair',
      owner: 'agent',
      state: closed ? 'blocked' : verified || fixed ? 'complete' : inProgress ? 'active' : 'pending',
      detail: verified || fixed
        ? `Patch on ${branchName(report)}.`
        : inProgress
          ? `Agent team working on ${branchName(report)}.`
          : `Queued for ${branchName(report)}. main is untouched.`
    },
    {
      id: 'selftest',
      label: 'Agent self-test',
      owner: 'agent',
      state: closed ? 'blocked' : verified ? 'complete' : fixed ? 'active' : 'pending',
      detail: verified
        ? 'Fix verified on the newer build, no regressions reported.'
        : fixed
          ? 'Testing the fix against the next build.'
          : 'Runs after the patch exists.'
    },
    {
      id: 'review',
      label: 'Human review',
      owner: 'developer',
      state: verified ? 'complete' : 'pending',
      detail: verified
        ? 'A person confirmed it on a build.'
        : 'A person must confirm before this can merge.'
    },
    {
      id: 'release',
      label: 'Release',
      owner: 'developer',
      state: verified ? 'complete' : 'pending',
      detail: verified
        ? 'Eligible to merge to main. Previous build stays available.'
        : 'Blocked until human review passes.'
    }
  ];

  return stages;
}

function renderWorkOrder(
  report: Report,
  build: Build | undefined,
  triage: TriageResult
): string {
  return [
    `# Work order ${report.ref}`,
    '',
    `Branch: ${triage.branch}`,
    `Build: ${build ? `${build.version} ${build.name}` : 'unknown'}`,
    `Title: ${report.title}`,
    `Area: ${report.area}`,
    `Category: ${report.category}`,
    `Pipeline severity: ${SEVERITY_LABEL[triage.suggested]} (${triage.score}/100, ${triage.confidence}% confidence)`,
    `Tester severity: ${SEVERITY_LABEL[report.severity]}`,
    `Route: ${triage.routeLabel}`,
    '',
    '## Reproduce',
    ...(report.steps.length > 0 ? report.steps.map((step, i) => `${i + 1}. ${step}`) : ['No steps supplied.']),
    '',
    '## Expected',
    report.expected,
    '',
    '## Actual',
    report.actual,
    '',
    '## Severity reasoning',
    ...triage.rationale.map((line) => `- ${line}`),
    '',
    '## Agent assignments',
    '1. reproducer - shortest exact reproduction',
    '2. severity - challenge the score against the written definitions',
    '3. fixer - smallest patch on this branch only',
    '4. selftest - verify the fix and check regressions',
    '5. reviewer - gate the merge',
    '',
    '## Hard rules',
    '- Never commit to main.',
    '- Never widen the change beyond this defect.',
    '- A human marks Verified before merge.',
    ''
  ].join('\n');
}
