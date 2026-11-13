# Durable saved simulation dispatch

13 November 2026. Eight distinct identities are qualified across two originals:
D01-D06 at `d5a868d04e3d90801e75860ad7f7c77aade93155`, then D07/D08 at
`d54207ba6ec2d1184c9b5acfa5d37c19308c329c`. This is not one green eight-case
invocation. The complete receipts, command hashes, source seals, failures and
limits are in [workflow-dispatch.json](workflow-dispatch.json).

Saved runs now use real Workflow5.4 starts and a Node step instead of Next
`after()`. An atomic domain Hook and SQL compare-and-set retain one owner across
concurrent calls or an uncertain response. The worker reads frozen SQL inputs;
Workflow arguments contain only the saved run ID, and the step returns its ID
and status. SQL remains authoritative for
admission, a single execution claim, coverage, stop/deadline, unknown charges
and partial results. The execution body has zero automatic retries. A shared
process startup promise explicitly starts the World when a saved request is
reopened, including local queue recovery. No schema migration was added.

The monitor retains the saved run on response uncertainty and exposes a check/
retry action. Local listeners bind127.0.0.1; SDK internal routes bypass the
operator-cookie proxy for queue delivery. Local World has no authentication and
must not be exposed publicly or shared between simultaneous workers. Hosted
configuration rejects an explicit non-Vercel World. These are single-operator
controls, not account/workspace isolation.

| Qualified identity | Actual result |
| --- | --- |
| D01 | Unauthenticated reads/execute refused401; authenticated cross-origin write refused403 |
| D02 | API creation, compiled Workflow/step, two deterministic free findings and one PostgreSQL report |
| D03 | Four concurrent requests recover the same actual Hook owner after controlled loss of an owned queued SQL binding; one execution/finding set |
| D04 | An actual completed execute HTTP response is dropped; retry retains its saved owner and report |
| D05 | Kill/reap the owned server with queue delivery held; restart with the same journal/PG, reopen the saved request, recover and finish with the same owner |
| D06 | Queued stop plus an authored expired claim remain terminal with zero persona attempts |
| D07 | Desktop1280×844 shows uncertainty, retries the saved request, finishes and reloads; zero page errors/external requests/overflow |
| D08 | The same at390×844 with Chromium touch emulation; zero page errors/external requests/overflow |

The six runtime identities passed in
[43508517484](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/43508517484).
That original still failed overall on the subsequent browser-path setup. The
two remaining browser identities passed alone in
[43510133974](https://github.com/alvarovillalbaa/before-the-launch/actions/runs/43510133974).
Only two fixture files and two docs changed between those checked sources;
every application, Workflow, dependency and lock byte is identical. The older
137 execution-control and48 provenance cases were not replayed or borrowed.

The browser fault validates the original empty POST, cookie and origin, forwards
it to the actual endpoint with the authored CA, waits for its real202 response,
then aborts that one browser response. SDK and SQL results are never fabricated.
Chromium trusts only the authored certificate SPKI. No HAR, video, screenshot,
keys, private journal or database payload is retained. The Node-only D04 uses
an actual proxy/socket response drop instead.

| Original | Outcome and retained limit |
| --- | --- |
| Prerequisite43501105419 | Exact pin/frozen install and actual bundled-guide capture passed; no product/runtime check |
| Runtime1/43506370496 | PG readiness failed before build/checks; original connection cause unobserved; source/owned cleanup passed |
| Runtime2/43506996062 | PG/schema/seed/lint passed; compiler exposed an optional conflict owner; remaining compiler group prevented final cleanup/source verification |
| Runtime3/43507480438 | D01-D04 passed; D05 timed out because reading the World did not start its queue; source/owned cleanup passed |
| Runtime4/43508517484 | D01-D06 passed after explicit World startup; browser installation path failed; source/owned cleanup passed |
| Runtime5/43509180543 | Chromium launched; D07 did not observe the retry control after an actual proxy drop; cause unobserved, D08 unrun; source/owned cleanup passed |
| Runtime6/43510133974 | D07/D08 only passed after deterministic browser fault; source/browser/owned cleanup passed |

The type repair preserves uncertainty if a Hook error omits its owner. The CI
wrapper adopts/reaps orphaned compiler children; leader exit is not accepted as
group cleanup. Accepted originals passed full source vectors, targeted ESLint,
production Next/Workflow compilation, real disposable PG and owned process/
container/network/scratch cleanup. Node22.23.4, pnpm10.24.0, Next16.2.9,
Workflow5.4.0 and Playwright1.61.1 were recorded. The lock prerequisite kept all
other direct dependency versions fixed. Seven temporary workflows are disabled;
their SHA-checked task QA refs are absent. Uploaded proof copies were removed
after upload; original archives/receipts remain retained locally with matching
GitHub artifact digests. Runtime2's missing cleanup proof remains missing.

Production remains gated by the existing denied environment write. No operator
key, hosted World configuration, database/Blob service or main/production change
was made. A READY source preview proves compilation, not hosted access or
persistence. No real model call/charge or interrupted paid body was tested.
D03 is controlled binding loss, not failed-COMMIT proof; D05 recovery starts on
reopening, not autonomous idle boot; D06 expiry is authored free state. Mac
Storage Guard failed, so no local installation, build, database or browser ran.
