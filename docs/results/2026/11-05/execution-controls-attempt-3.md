# Execution controls: third attempt

[CI run 41947477194](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/41947477194),
job 126983151134, checked source `8ddd35202f2ad1d1f53b433a574bfd62b4d9c0d3`.
All **130 unit/PostgreSQL cases passed** again with exact identities, actual CLI
exit zero and retry zero. Next type generation passed; its original process
group disappeared naturally within 26 ms of the observed leader close. The
bounded grace resolved the prior immediate-observation race without a teardown
exception or forced termination.

TypeScript then exited 2 with two test-infrastructure diagnostics: the Vitest
configuration used unsupported `forbidOnly`, and a spread fixture's inferred type
lacked its `agentRunId` property. Production build and browser checks were not
reached. No production key changed. The fixes must retain all assertions and use
the pinned Vitest `allowOnly: false` option, preserving the focused-test guard.

All four reached full source guards and owned cleanup passed. The
[JSON receipt](execution-controls-attempt-3.json) retains the complete controller
result, raw Vitest report and lossless compressed job log. Earlier attempts are
unchanged. These disposable/mocked outcomes establish no hosted persistence,
production access configuration, provider behavior or real charges.
