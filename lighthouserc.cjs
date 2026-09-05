// lighthouserc.js — T-QA-10 WS-4 Lighthouse CI config
// Perf metrics: SOFT-WARN (report-only) first cycle → ratchet to hard-fail.
// A11y + BP: hard-fail from day one.
/** @type {import('@lhci/cli').LhciConfig} */
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      numberOfRuns: 1,
      url: ['/', '/kuldeep-portfolio', '/admin'],
      settings: {
        // Mobile emulation: explicit formFactor + throttling only. Do NOT add
        // preset: 'desktop' here -- it conflicts with formFactor: 'mobile' and
        // newer Lighthouse versions hard-error on the mismatch (T-PR13-L1).
        formFactor: 'mobile',
        throttling: {
          rttMs: 40,
          throughputKbps: 10240,
          cpuSlowdownMultiplier: 4,
        },
      },
    },
    assert: {
      assertions: {
        // Hard-fail thresholds — a11y and best-practices from day one
        'categories:accessibility':   ['error', { minScore: 0.95 }],
        'categories:best-practices':  ['error', { minScore: 0.95 }],

        // Soft-warn on perf metrics (report-only, first cycle)
        // Switch 'warn' → 'error' after first real cycle of numbers.
        'categories:performance':     ['warn',  { minScore: 0.90 }],
        'largest-contentful-paint':   ['warn',  { maxNumericValue: 2500 }],
        'cumulative-layout-shift':    ['warn',  { maxNumericValue: 0.1  }],
        'total-blocking-time':        ['warn',  { maxNumericValue: 200  }],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
