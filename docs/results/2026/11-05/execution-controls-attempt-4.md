# Execution controls: fourth attempt

[CI run 41948005615](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/41948005615),
job 126984909209, checked source `5e19971d514990e03d780eeb533314e6fe9fe186`.
All **130 unit/PostgreSQL cases passed** with exact identities and actual CLI
exit zero. Next type generation, TypeScript checking, the production build and
the client-asset scan for the authored operator fixture also passed.

All **six actual Chromium cases failed** at legitimate login: the app returned
403 where 200 was required. This is a real HTTP/browser integration failure;
the checks must retain the successful-login assertion and cross-origin denial.
No browser case is accepted from earlier unit/SSR/build outcomes. Production
configuration and actual provider behavior/charges remain unverified.

All five full source guards and owned process/filesystem cleanup passed.
GitHub's Stop containers step succeeded. No production key changed. The
[JSON receipt](execution-controls-attempt-4.json) retains every browser failure,
the full raw unit/browser reports and the lossless compressed job log. All prior
failures remain separate and unchanged.
