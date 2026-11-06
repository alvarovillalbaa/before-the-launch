#!/usr/bin/env python3
"""Verify private original storage in one disposable public CI job."""
import base64
import hashlib
import gzip
import http.client
import json
import os
from pathlib import Path
import re
import shutil
import signal
import socket
import subprocess
import tempfile
import time

repo = Path.cwd()
source = os.environ["SOURCE_COMMIT"]
work_deadline = time.monotonic() + 900
assert re.fullmatch(r"[0-9a-f]{40}", source)
assert subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip() == source
assert os.environ.get("SOURCE_STORAGE_PUBLIC_REPOSITORY") == "true"
assert os.environ.get("CI") == "true"
fixture_url = "postgres://intake_ci:disposable_ci_only@127.0.0.1:54329/before_launch_intake_ci"
assert os.environ.get("DATABASE_URL") == fixture_url
assert os.environ.get("SOURCE_STORAGE_DISPOSABLE_DATABASE") == "true"
assert os.environ.get("GITHUB_REPOSITORY") == "alvarovillalbaa/before-the-launch"
assert os.environ.get("GITHUB_EVENT_NAME") == "create"
assert os.environ.get("GITHUB_REF") == "refs/heads/qa/source-storage-20261106-1"
paths = subprocess.check_output(["git", "ls-files", "-z"]).decode().split("\0")[:-1]


def digest(data):
    return hashlib.sha256(data).hexdigest()


def vector():
    return {name: digest(os.readlink(repo / name).encode() if (repo / name).is_symlink()
                         else (repo / name).read_bytes()) for name in paths}



before = vector()
preexisting = {}
for entry in Path("/proc").iterdir():
    if entry.name.isdigit():
        try:
            if entry.stat().st_uid != os.getuid():
                continue
            preexisting[entry.name] = (entry / "stat").read_text().rsplit(") ", 1)[1].split()[19]
        except (FileNotFoundError, ProcessLookupError, PermissionError):
            pass
root = Path(tempfile.mkdtemp(prefix="before-launch-intake-", dir=os.environ["RUNNER_TEMP"]))
root_identity = (root.stat().st_dev, root.stat().st_ino, root.stat().st_uid)
app = root / "app"
app.mkdir()
report = {"sourceCommit": source, "startedAt": time.time(), "commands": [],
          "scope": "23 authored unit and 9 disposable PostgreSQL cases; mocked Blob leaves, no server/browser/live storage/model"}
groups, selected = [], []
export_expected = {}
lock_generation = False
database_marked = False
status = 1
lock = None
env = {key: os.environ[key] for key in ["PATH", "RUNNER_TEMP"] if key in os.environ}
env.update({"CI": "true", "LANG": "C.UTF-8", "TZ": "UTC", "NO_COLOR": "1",
    "HOME": str(root / "home"), "npm_config_cache": str(root / "npm-cache"),
    "XDG_CACHE_HOME": str(root / "cache"), "XDG_CONFIG_HOME": str(root / "config"),
    "COREPACK_HOME": str(root / "corepack"), "PNPM_HOME": str(root / "pnpm"),
    "npm_config_userconfig": str(root / "npm-user"), "npm_config_globalconfig": str(root / "npm-global"),
    "TMPDIR": str(root / "tmp"), "NEXT_TELEMETRY_DISABLED": "1", "DO_NOT_TRACK": "1",
    "DATABASE_URL": fixture_url, "LOCAL_STORAGE_DIR": str(root / "storage"),
    "SOURCE_STORAGE_DRIVER": "local", "INTAKE_ACCEPTANCE_FIXTURES": "disposable", "SIMULATION_ENGINE": "fake",
    **{key: "" for key in ["VERCEL", "BLOB_READ_WRITE_TOKEN", "BLOB_STORE_ID", "VERCEL_OIDC_TOKEN",
        "AI_GATEWAY_API_KEY", "OPERATOR_ACCESS_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY"]}})
for name in ["home", "cache", "config", "corepack", "pnpm"]: (root / name).mkdir()
for name in ["npm-user", "npm-global"]: (root / name).write_text("")
(root / "tmp").mkdir()


def stream(data):
    complete = len(data) <= 4_000_000
    data = data[:4_000_000]
    return {"bytes": len(data), "sha256": digest(data), "base64": base64.b64encode(data).decode(), "complete": complete}


def file_stream(path):
    with path.open("rb") as handle:
        return stream(handle.read(4_000_001))


def owned_processes():
    owned, uncertain = [], []
    for entry in Path("/proc").iterdir():
        if not entry.name.isdigit(): continue
        try:
            uid = entry.stat().st_uid
            if uid != os.getuid(): continue
            fields = (entry / "stat").read_text().rsplit(") ", 1)[1].split()
            if preexisting.get(entry.name) == fields[19] or fields[0] == "Z": continue
            cwd = os.readlink(entry / "cwd")
            pgid = int(fields[2])
            if pgid in groups or cwd == str(root) or cwd.startswith(str(root) + "/"):
                command = (entry / "cmdline").read_bytes()[:4096].replace(b"\0", b" ").decode("utf-8", "replace")
                owned.append({"pid": int(entry.name), "startTime": fields[19], "uid": uid,
                    "pgid": pgid, "cwd": cwd, "command": command})
        except (FileNotFoundError, ProcessLookupError): pass
        except PermissionError: uncertain.append(int(entry.name))
    return owned, uncertain


def signal_owned(identity, selected_signal):
    current, _ = owned_processes()
    if any(row == identity for row in current):
        try: os.kill(identity["pid"], selected_signal)
        except ProcessLookupError: pass


def run(argv, timeout=120, accepted=(0,)):
    timeout = min(timeout, max(1, work_deadline - time.monotonic()))
    started = time.time()
    out_path = root / f"command-{len(report['commands'])}.stdout"
    err_path = root / f"command-{len(report['commands'])}.stderr"
    with out_path.open("wb") as out, err_path.open("wb") as err:
        proc = subprocess.Popen(argv, cwd=app, env=env, stdout=out, stderr=err, start_new_session=True)
        groups.append(proc.pid)
        timed_out = False
        while proc.poll() is None:
            if time.time() - started >= timeout or out_path.stat().st_size + err_path.stat().st_size > 4_000_000:
                timed_out = True
                os.killpg(proc.pid, signal.SIGTERM)
                try:
                    proc.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    os.killpg(proc.pid, signal.SIGKILL); proc.wait(timeout=10)
                break
            time.sleep(0.1)
        proc.wait(timeout=10)
    report["commands"].append({"argv": argv, "exitCode": proc.returncode, "timedOut": timed_out,
        "seconds": round(time.time() - started, 3), "stdout": file_stream(out_path), "stderr": file_stream(err_path)})
    assert all((lock_generation and name == "pnpm-lock.yaml") or digest((app / name).read_bytes()) == export_expected[name] for name in selected), "Export source changed"
    if proc.returncode not in accepted or timed_out:
        raise RuntimeError("Focused command failed: " + " ".join(argv))
    return base64.b64decode(report["commands"][-1]["stdout"]["base64"])


pnpm = ["npm", "exec", "--yes", "--package=pnpm@10.24.0", "--", "pnpm"]


def database_guard(operation):
    # This task's fixed CI service database only. Never force-disconnect users.
    code = r'''
import pg from 'pg';
const pool = new pg.Pool({connectionString:'postgres://intake_ci:disposable_ci_only@127.0.0.1:54329/postgres', max:1});
try {
 const row=(await pool.query("SELECT shobj_description(oid,'pg_database') AS marker FROM pg_database WHERE datname=$1",['before_launch_intake_ci'])).rows[0];
 if (process.argv[1]==='mark') {
   if(!row || row.marker!==null)throw Error('CI database was not fresh');
   await pool.query("COMMENT ON DATABASE before_launch_intake_ci IS 'before-launch-source-storage-ci-v1'");
 } else {
   if(row?.marker!=='before-launch-source-storage-ci-v1')throw Error('CI database ownership marker mismatch');
   const active=(await pool.query('SELECT count(*)::int AS count FROM pg_stat_activity WHERE datname=$1',['before_launch_intake_ci'])).rows[0].count;
   if(active!==0)throw Error('CI database still has active clients');
   await pool.query('DROP DATABASE before_launch_intake_ci');
 }
 console.log(JSON.stringify({operation:process.argv[1],database:'before_launch_intake_ci',marker:'before-launch-source-storage-ci-v1',passed:true}));
} finally {await pool.end();}
'''
    return run(["node", "--input-type=module", "-e", code, operation], 30)


def direct_resolutions(data):
    result, section, package = {}, None, None
    for line in data.decode().splitlines():
        if line.startswith("packages:"): break
        if line in ["    dependencies:", "    devDependencies:"]:
            section = line.strip()[:-1]
        elif section and re.fullmatch(r"      \S.*:", line):
            package = line.strip()[:-1].strip("'\"")
        elif section and package and re.fullmatch(r"        (specifier|version): .+", line):
            key, value = line.strip().split(": ", 1)
            result.setdefault((section, package), {})[key] = value.strip("'\"")
    assert result and all(set(value) == {"specifier", "version"} for value in result.values())
    return result


def check_cases(file, count, names):
    data = json.loads(file.read_bytes())
    assert data["success"] and data["numTotalTests"] == data["numPassedTests"] == count
    assert data["numFailedTests"] == data["numPendingTests"] == data["numFailedTestSuites"] == 0
    rows = [row for suite in data["testResults"] for row in suite["assertionResults"]]
    assert len(rows) == count and all(row["status"] == "passed" for row in rows)
    assert sorted(row["fullName"] for row in rows) == sorted(names)
    return data


try:
    tests = ["tests/unit/source-storage.test.ts", "tests/unit/source-storage-services.test.ts", "tests/integration/product-intake.test.ts"]
    selected = [name for name in paths if name.startswith(("app/", "components/", "hooks/", "lib/", "agent/", "workflows/", "public/"))
        or name in {*tests, "package.json", "pnpm-lock.yaml", "tsconfig.json", "eslint.config.mjs", "next.config.ts", "postcss.config.mjs", "drizzle.config.ts"}]
    for name in selected:
        assert not (repo / name).is_symlink(), name
        destination = app / name
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(repo / name, destination)
        export_expected[name] = before[name]
    report["sourceExport"] = {"files": len(selected), "bytes": sum((app / name).stat().st_size for name in selected), "sha256": dict(export_expected)}
    expected = {}
    for name, count in zip(tests, [13, 10, 9]):
        content = (app / name).read_text()
        assert not re.search(r"\b(?:it|test|describe)\.(?:only|skip|todo)\b", content)
        suites = re.findall(r'describe(?:\.sequential)?\("([^"]+)"', content)
        titles = re.findall(r'\bit\("([^"]+)"', content)
        assert len(suites) == 1 and len(titles) == count and len(set(titles)) == count
        expected[name] = [suites[0] + " " + title for title in titles]
    assert run(["node", "--version"]).strip() == b"v24.21.0"
    package = json.loads((app / "package.json").read_text())
    assert package["packageManager"] == "pnpm@10.24.0" and package["dependencies"]["@vercel/blob"] == "2.8.2"
    old_direct = direct_resolutions((app / "pnpm-lock.yaml").read_bytes())
    lock_generation = True
    run(pnpm + ["install", "--lockfile-only", "--ignore-scripts", "--store-dir", str(root / "store")], 180)
    lock_generation = False
    lock = (app / "pnpm-lock.yaml").read_bytes()
    report["generatedLock"] = {"bytes": len(lock), "sha256": digest(lock), "gzipBase64": base64.b64encode(gzip.compress(lock, mtime=0)).decode()}
    new_direct = direct_resolutions(lock)
    report["directResolutionChanges"] = [{"section": key[0], "package": key[1], "before": old_direct.get(key), "after": new_direct.get(key)}
        for key in sorted(set(old_direct) | set(new_direct)) if old_direct.get(key) != new_direct.get(key)]
    assert set(old_direct) == set(new_direct)
    blob = ("dependencies", "@vercel/blob")
    assert new_direct[blob] == {"specifier": "2.8.2", "version": "2.8.2"}
    assert all(value == new_direct[key] for key, value in old_direct.items() if key != blob), "Unrelated direct resolution changed"
    report["generatedLock"]["otherDirectResolutionsUnchanged"] = len(old_direct) - 1
    export_expected["pnpm-lock.yaml"] = digest(lock)
    report["testedExport"] = dict(export_expected)
    run(pnpm + ["install", "--frozen-lockfile", "--ignore-scripts", "--store-dir", str(root / "store")], 240)
    fresh = run(["node", "--input-type=module", "-e", "import pg from 'pg';const p=new pg.Pool({connectionString:process.env.DATABASE_URL});try{const r=await p.query(\"SELECT count(*)::int n FROM pg_tables WHERE schemaname='public'\");if(r.rows[0].n!==0)throw Error('CI public schema was not empty');console.log('fresh-database');}finally{await p.end();}"])
    assert fresh.strip() == b"fresh-database"
    database_guard("mark")
    database_marked = True
    scoped = ["app/settings/page.tsx", "lib/server/config/env.ts", "lib/server/storage/source-storage.ts",
        "lib/server/services/source-ingestion.ts", "lib/server/services/product-intake-service.ts", *tests]
    run(pnpm + ["exec", "eslint", *scoped])
    (app / "tsconfig.storage-checks.json").write_text(json.dumps({"extends": "./tsconfig.json", "include": scoped, "exclude": ["node_modules"], "compilerOptions": {"incremental": False, "plugins": []}}))
    run(pnpm + ["exec", "tsc", "--noEmit", "-p", "tsconfig.storage-checks.json"])
    for phase, files, count in [("unit", tests[:2], 23), ("postgres", tests[2:], 9)]:
        config = "import {defineConfig} from 'vitest/config';export default defineConfig(" + json.dumps({
            "resolve": {"alias": {"@": str(app)}}, "test": {"environment": "node", "include": files, "maxWorkers": 1,
            "fileParallelism": False, "retry": 0, "testTimeout": 30000, "hookTimeout": 30000}}) + ");"
        (app / ("vitest." + phase + ".storage.ts")).write_text(config)
        if phase == "postgres": run(pnpm + ["exec", "drizzle-kit", "push", "--force"], 120)
        result = root / (phase + ".json")
        run(pnpm + ["exec", "vitest", "run", "--config", "vitest." + phase + ".storage.ts", "--reporter=json", "--outputFile", str(result)], 120, accepted=(0, 1))
        if result.exists():
            raw_result = result.read_bytes()
            report[phase + "OriginalJson"] = stream(raw_result)
            report[phase] = json.loads(raw_result)
        assert report["commands"][-1]["exitCode"] == 0, phase + " CLI failed"
        report[phase] = check_cases(result, count, [title for file in files for title in expected[file]])
    status = 0
except Exception as error:
    report["error"] = str(error)
finally:
    report["sourceUnchanged"] = before == vector()
    residual, uncertain = owned_processes()
    report["residualBeforeTermination"] = residual
    report["residualSignals"] = []
    if residual or uncertain: status = 1
    for identity in residual:
        signal_owned(identity, signal.SIGTERM)
        report["residualSignals"].append({"pid": identity["pid"], "signal": "TERM", "startTime": identity["startTime"]})
    deadline = time.monotonic() + 5
    while residual and time.monotonic() < deadline:
        time.sleep(0.1); residual, uncertain = owned_processes()
    if residual:
        status = 1
        for identity in residual:
            signal_owned(identity, signal.SIGKILL)
            report["residualSignals"].append({"pid": identity["pid"], "signal": "KILL", "startTime": identity["startTime"]})
        deadline = time.monotonic() + 3
        while residual and time.monotonic() < deadline:
            time.sleep(0.1); residual, uncertain = owned_processes()
    report["databaseRemoved"] = False
    if database_marked:
        try:
            database_guard("drop")
            report["databaseRemoved"] = True
        except Exception as error:
            report["databaseCleanupError"] = str(error)
    residual, uncertain = owned_processes()
    live = [row["pid"] for row in residual]
    report["liveOwnedBeforeScratchRemoval"] = live
    report["uncertainNewProcesses"] = uncertain
    current = root.lstat()
    report["scratchIdentityMatches"] = not root.is_symlink() and (current.st_dev, current.st_ino, current.st_uid) == root_identity
    # Descendants may retain a command's file handles after its parent exits.
    # Read final stream bytes only after all attributed processes have stopped.
    for index, command in enumerate(report["commands"]):
        command["stdout"] = file_stream(root / f"command-{index}.stdout")
        command["stderr"] = file_stream(root / f"command-{index}.stderr")
    report["streamClosureVerified"] = not live and not uncertain
    if not live and not uncertain and report["scratchIdentityMatches"]:
        shutil.rmtree(root)
    report["scratchRemoved"] = not root.exists()
    report["finishedAt"] = time.time()
    captures = [item[label] for item in report["commands"] for label in ["stdout", "stderr"]]
    report["passed"] = status == 0 and report["sourceUnchanged"] and report["scratchRemoved"] and report["databaseRemoved"] and report["streamClosureVerified"] and all(item["complete"] for item in captures)
    print("SOURCE_STORAGE_RESULT=" + json.dumps(report, separators=(",", ":")), flush=True)
raise SystemExit(0 if report["passed"] else 1)
