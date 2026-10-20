# Backend API and Execution Integration Specification

**Status:** Handoff proposal. Existing frontend behavior is explicitly marked
separately from proposed backend behavior. No Spring Boot implementation was
found in this repository.

## 1. Executive summary

The frontend is a Next.js App Router application using TypeScript, React,
Supabase Auth/PostgreSQL, and Monaco Editor. Its HTTP helper targets
`NEXT_PUBLIC_API_BASE_URL`, defaulting to `http://localhost:8080/api`.
Supabase browser/server clients are configured with
`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

The problem editor currently calls one backend operation for both Run and
Submit: `POST /api/submissions/run`. The request contains a numeric Supabase
problem ID, selected language, source code, and an optional file list. The
frontend does not select test cases when making this request. The existing
Spring API source is not included, so its actual behavior, authentication,
database connectivity, and sandbox integration cannot be confirmed.

Problem browsing and editor setup also read Supabase directly. The checked-in
Two Sum/Single Number seed writes problem statements, Java function templates,
execution limits/configuration, and sample/hidden test cases to Supabase. It
does not mark a dedicated Run test set, provide runner-template rows, or
demonstrate that a Spring backend uses the same PostgreSQL database.

Recommended immediate contract: synchronous Run and Submit endpoints, with
distinct semantics and camelCase JSON matching the frontend's current type
style. Run evaluates exactly three explicitly designated public cases without
creating a submission. Submit evaluates the entire authoritative suite and
persists the result. The trusted backend owns test selection and verdicts.

## 2. Existing frontend audit

### Runtime and data access

- Next.js App Router pages are under `src/app/`; the problem list is
  `src/app/problems/page.tsx`, the slug detail route is
  `src/app/problems/[slug]/page.tsx`, and the Monaco interface is
  `src/components/editor/MonacoEditor.tsx`.
- `src/lib/api/client.ts` implements `apiRequest<T>`. Unless overridden, it
  uses GET, adds `Content-Type: application/json`, and sends a direct `fetch`.
  It does not set `Authorization`, `credentials`, timeout, or retry behavior.
  For 2xx responses it expects the response body itself to be `T`, not an
  `{success,data}` JSON envelope; `ApiResponse<T>` is an internal wrapper.
- Non-2xx response bodies are read as text and converted to
  `{success:false,data:null,error:"HTTP Error ..."}`. Network errors are also
  returned in that wrapper. Most API helper functions convert failures into
  empty arrays/null/default objects; the current execution helper throws on
  failure so the editor can display the error.
- `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` use the existing
  SSR client setup. The public anon key is browser configuration; do not use a
  service-role key in the browser.
- Supabase queries made by Server Components and browser code are not calls to
  the Spring API. They rely on Supabase RLS. The problem detail route currently
  queries a published problem by slug, allowed languages, public test cases,
  problem files, and submission records. The editor client separately fetches
  a language template by `problem_id` and `language`.
- Monaco language options shown in the editor are constrained by the problem
  type and `problem_execution_config.allowed_languages`. The seed script only
  enables Java for its two seeded problems. `cpp` is the frontend language
  identifier for C++; use `cpp` for C++17 only after backend execution is
  supported and configured.
- The editor's Run and Submit handlers both call `submitProblemSolution` with
  the same payload and same endpoint. Their UI labels/loading states differ,
  but their server-side semantics are currently indistinguishable.
- The HTTP API helpers for problems, contests, analysis, and submission
  history are present, but a repository-wide symbol search found no call sites
  for them beyond the editor's use of `submitProblemSolution`. Treat those
  routes as declared client contracts, not proof that a backend route exists
  or is currently exercised.
- The frontend uses Supabase Auth sign-in/sign-up and server cookies. No
  Supabase access token is forwarded by `apiRequest` to the Spring service.
  The logout endpoint is a Next.js route (`POST /api/auth/logout`) that signs
  out of Supabase and redirects to `/login`; it is not a Spring endpoint.

### Inventory of Spring API calls declared by frontend helpers

Paths below are relative to `NEXT_PUBLIC_API_BASE_URL`. With the default
`http://localhost:8080/api`, `/submissions/run` is the full URL
`http://localhost:8080/api/submissions/run`. Unless listed as POST, the helper
uses GET. All calls made through `apiRequest` send a JSON content-type header
and no explicit auth header. `T` response types describe the expected 2xx JSON
body. “No call site found” means only that the helper was not found imported
or called elsewhere in the inspected `src` tree.

| Method and path | Source/function | Request | Expected 2xx body | Usage/status |
|---|---|---|---|---|
| GET `/problems` | `src/lib/api/problems.ts:21-33`, `fetchProblems` | Query: `search`, `category`, `type`, `difficulty`, `page`, `pageSize` (all optional) | `PaginatedResult<Problem>`: `items`, `total`, `page`, `pageSize`, `totalPages` | No call site found; failure becomes an empty pagination result. |
| GET `/problems/slug/{slug}` | `problems.ts:50-53`, `fetchProblemBySlug` | Slug path parameter | `Problem` | No call site found; failure becomes `null`. |
| GET `/categories` | `problems.ts:60-61`, `fetchCategories` | None | `Category[]` | No call site found; failure becomes `[]`. |
| GET `/problem-types` | `problems.ts:68-69`, `fetchProblemTypes` | None | `ProblemType[]` | No call site found; failure becomes `[]`. |
| GET `/tags` | `problems.ts:76-77`, `fetchProblemTags` | None | `Tag[]` | No call site found; failure becomes `[]`. |
| GET `/problems/{problemId}/test-cases` | `problems.ts:84-88`, `fetchProblemTestCases` | Numeric path parameter | `TestCase[]` | No call site found; failure becomes `[]`. Hidden-case safety depends on backend filtering. |
| GET `/problems/{problemId}/files` | `problems.ts:96-100`, `fetchProblemFiles` | Numeric path parameter | `ProblemFile[]` | No call site found; failure becomes `[]`. |
| POST `/submissions/run` | `src/lib/api/submissions.ts:16-20`, `submitProblemSolution`; called by `MonacoEditor.tsx:338-349` and `363-374` | `SubmissionPayload`: `problemId:number`, `language:string`, `code:string`, optional `files:[{file_path,file_content,language}]` | `ExecutionResult` (fields below) | **Used** by Run and Submit; not distinct today. Failure throws to editor. |
| GET `/submissions/user/{userId}/problem/{problemId}` | `submissions.ts:31-36`, `fetchUserLatestSubmission` | User ID and numeric problem ID in path | `{submission, scores, analysis}` | No call site found; failure becomes all-null response. User ID is client supplied. |
| GET `/submissions/problem/{problemId}` | `submissions.ts:50-54`, `fetchProblemSubmissions` | Numeric path parameter | `Submission[]` | No call site found; failure becomes `[]`. |
| GET `/submissions/{submissionId}/analysis` | `src/lib/api/analysis.ts:9-13`, `fetchSubmissionAnalysis` | Submission ID in path | `{analysis, feedback}` | No call site found; failure becomes `null`. |
| GET `/contests` | `src/lib/api/contests.ts:9-18`, `fetchContests` | None | `{upcoming,ongoing,past}` arrays of `Contest` | No call site found; failure becomes three empty arrays. |
| GET `/contests/slug/{slug}` | `contests.ts:27-28`, `fetchContestBySlug` | Slug path parameter | `Contest` | No call site found; failure becomes `null`. |
| GET `/contests/{contestId}/problems` | `contests.ts:35-39`, `fetchContestProblems` | Numeric contest ID | `ContestProblem[]` | No call site found; failure becomes `[]`. |
| GET `/contests/{contestId}/leaderboard` | `contests.ts:47-51`, `fetchContestLeaderboard` | Numeric contest ID | `ContestParticipant[]` | No call site found; failure becomes `[]`. |
| POST `/contests/{contestId}/register` | `contests.ts:59-66`, `registerForContest` | `{userId:string}` | `{registered:boolean}` | No call site found; returns `response.success` even if body says `registered:false`. |
| POST `/contests/{contestId}/submissions` | `contests.ts:73-84`, `submitContestProblem` | `{contestId,problemId,userId,code,language}` | `ContestSubmission` | No call site found; failure becomes `null`. |

Other HTTP-facing route: `POST /api/auth/logout` is a Next.js route in
`src/app/api/auth/logout/route.ts:4`, submitted by a form in
`src/components/navbar/Navbar.tsx:189`. It does not use the Spring API utility.

### Direct Supabase reads relevant to execution

These are Supabase PostgREST/Auth calls through the SDK, not Spring routes:

- Problem list: `src/app/problems/page.tsx:67` queries published `problems`,
  relations for type/categories/tags, and applies search/filter/order/page.
- Problem detail: `src/app/problems/[slug]/page.tsx:20` reads the published
  problem; lines 64-78 read only `is_hidden = false` test cases, problem files,
  and execution languages; lines 81-95 read own/public submission records.
- Starter template: `src/lib/supabase/problems.ts:4-17` queries
  `problem_code_templates` by both `problem_id` and `language`.
- Authentication uses Supabase Auth SDK in login/signup and `auth.getUser()` in
  Server Components/middleware. Spring API calls do not currently forward that
  authenticated identity.

The detail route's public-submission query currently selects `*`. Before
shipping any database-backed service, verify RLS and response projection so
another user's source code or private submission fields are not exposed by
that direct browser read.

### Existing execution response type

`src/types/index.ts` defines `ExecutionResult` with:

```json
{
  "submissionId": "string",
  "status": "Accepted | Wrong Answer | Time Limit Exceeded | Memory Limit Exceeded | Runtime Error | Compilation Error | Pending",
  "testsPassed": 0,
  "testsTotal": 0,
  "accuracyScore": 0,
  "runtimeMs": 0,
  "memoryKb": 0,
  "testResults": [
    {
      "testCaseId": 0,
      "status": "string",
      "actualOutput": "string",
      "errorMessage": "optional string",
      "runtimeMs": 0,
      "memoryKb": 0
    }
  ],
  "analysis": "optional analysis object",
  "scores": "optional score object"
}
```

This type is currently used for both operations even though Run should not
create a submission. Split it into `RunResult` and `SubmissionResult` when
implementing distinct behavior; do not fabricate a `submissionId` for Run.

## 3. Proposed REST API

These contracts are proposals, not existing or verified backend routes. They
use the current frontend's numeric `problemId`, lowercase language keys, and
camelCase field convention. The server must resolve the numeric ID against
the authoritative problem store. If backend IDs differ from Supabase IDs,
introduce a stable shared ID or change the frontend and backend together;
never silently treat a slug as a numeric ID.

For the first integration, use synchronous completion because the current
editor expects an immediate completed result and has no polling/job-status
logic. If full evaluation is too slow, adopt the asynchronous alternative in
Section 8 as a separately agreed API/UI change.

### Run: `POST /api/submissions/run`

Evaluates exactly three designated Run cases. It must not create a persistent
submission or use a caller-supplied test collection.

Request DTO: `RunCodeRequest`

```json
{
  "problemId": 123,
  "language": "java",
  "code": "class Solution { /* implementation */ }",
  "files": [
    {
      "file_path": "Solution.java",
      "file_content": "class Solution { /* implementation */ }",
      "language": "java"
    }
  ]
}
```

`files` is optional for compatibility with the current `SubmissionPayload`;
for function-based problems, `code` is the submitted solution and any duplicate
file content must be reconciled deterministically. Validate that exactly one
authoritative source is selected. Reject oversized code/files, invalid paths,
empty language, unknown/unpublished problem, and unsupported language.

Response DTO: `RunResult`

```json
{
  "runId": "run-uuid",
  "status": "COMPLETED",
  "passedTests": 2,
  "totalTests": 3,
  "executionTimeMs": 35,
  "memoryUsedKb": 10240,
  "results": [
    {
      "testCaseNumber": 1,
      "status": "PASSED",
      "actualOutput": "[0,1]",
      "expectedOutput": "[0,1]",
      "executionTimeMs": 12,
      "errorMessage": null
    },
    {
      "testCaseNumber": 2,
      "status": "PASSED",
      "actualOutput": "[1,2]",
      "expectedOutput": "[1,2]",
      "executionTimeMs": 11,
      "errorMessage": null
    },
    {
      "testCaseNumber": 3,
      "status": "FAILED",
      "actualOutput": "[]",
      "expectedOutput": "[0,1]",
      "executionTimeMs": 9,
      "errorMessage": null
    }
  ]
}
```

The completed response contains exactly three results, one per designated
case. `expectedOutput` may only be returned for a public case. Designate all
three interactive Run cases public so the client can show their input and
expected values. Do not return hidden inputs or expected outputs, including
when an operation fails.

### Submit: `POST /api/submissions/submit`

Evaluates the complete test suite, including hidden cases, and persists one
submission and its permitted result summary. Request fields and validation are
the same as `RunCodeRequest`; the authenticated identity comes from verified
credentials, never a `userId` in the body.

Response DTO: `SubmissionResult`

```json
{
  "submissionId": "submission-uuid",
  "status": "COMPLETED",
  "verdict": "WRONG_ANSWER",
  "passedTests": 8,
  "totalTests": 12,
  "executionTimeMs": 35,
  "memoryUsedKb": 10240,
  "submittedAt": "2026-10-19T12:00:00Z"
}
```

Do not include hidden input/expected output or secret per-case details in
Submit responses. Return only user-authorized diagnostics. A submission may
be `Accepted` only after every required case has completed and passed.

### Optional persisted-submission retrieval

`GET /api/submissions/{submissionId}` returns the authenticated user's
persisted submission, verdict, permitted summary, and visible test results.
It is proposed for page refresh/history, not currently called by the editor.
Authorize ownership (or an explicit admin/leaderboard policy) before returning
source code or detailed diagnostics.

### Status codes

| Code | Meaning |
|---|---|
| 200 | Run or Submit completed synchronously; also successful retrieval. |
| 400 | Invalid JSON or validation failure. |
| 401 | Missing, invalid, or expired authentication. |
| 403 | Authenticated caller is not permitted to access the resource. |
| 404 | Problem or submission does not exist or is not visible. |
| 409 | Conflicting state, such as a duplicate idempotency key. |
| 413 | Source/file payload exceeds configured size. |
| 422 | Unsupported language or problem execution mode/signature. |
| 429 | Rate or concurrency limit exceeded. |
| 500 | Backend persistence or unexpected internal failure. |
| 502/503/504 | Worker/sandbox unavailable, failed, or timed out. |

Compilation error, runtime error, wrong answer, and time/memory limit exceeded
are completed user-code outcomes, not HTTP infrastructure failures. Return
HTTP 200 with a completed verdict and safe diagnostics for these outcomes.

## 4. DTO and error conventions

Use one JSON style consistently. The sample contracts use camelCase to match
existing TypeScript types.

Recommended error body:

```json
{
  "code": "UNSUPPORTED_LANGUAGE",
  "message": "The selected language is not enabled for this problem.",
  "details": {
    "supportedLanguages": ["java"]
  },
  "requestId": "trace-id"
}
```

Never return stack traces, host paths, container internals, secret values,
hidden test inputs/expected outputs, or another user's source. Include a stable
`code`; `details` should be safe and optional. The frontend should render
`message` and a request ID where present.

Suggested state/verdict distinction:

- Operation `status`: `COMPLETED` (and only if asynchronous mode is later
  adopted: `PENDING`, `RUNNING`, `FAILED`).
- `verdict`: `ACCEPTED`, `WRONG_ANSWER`, `COMPILATION_ERROR`, `RUNTIME_ERROR`,
  `TIME_LIMIT_EXCEEDED`, `MEMORY_LIMIT_EXCEEDED`.
- Individual result `status`: `PASSED`, `FAILED`, or an appropriate execution
  failure.
- An infrastructure failure is an HTTP error, not a user verdict.

## 5. Data model proposal and existing Supabase data

The following describes a logical model; reconcile it with the actual database
chosen by the Spring service before implementing migrations.

| Entity | Minimum authoritative fields and relationships |
|---|---|
| `problems` | PK `id`; unique public `problem_number`; unique `slug`; `title`, `description`, `difficulty`, `type_id`, `constraints`, `is_published`; timestamps. Existing frontend `Problem` also expects categories/tags/type relations. |
| `problem_execution_config` | PK/FK `problem_id`; `time_limit_ms`, `memory_limit_mb`, canonical `allowed_languages`; execution mode and comparison configuration. `execution_config` JSONB currently appears in the seed; validate its structure instead of treating arbitrary JSON as executable instructions. |
| `problem_code_templates` | PK `id`; FK `problem_id`; `language`; exact `starter_code`; nullable `entry_class`, `entry_method`; `execution_mode`; timestamps; unique `(problem_id, language)`. Never transform stored starter code to add a driver. |
| `problem_runner_templates` (optional) | If runner generation cannot be fully metadata-driven: PK, FK problem, language, versioned trusted runner template, configuration/schema version. Keep trusted runner source admin-controlled and separate from user code. No such table is present in the inspected schema/seed. |
| `test_cases` | PK `id`; FK `problem_id`; JSON/text `input_data`, `expected_output`; visibility; deterministic `display_order`; weight; explicit Run eligibility or role. The seed uses JSON text, `is_hidden`, and `weight`; it does not explicitly designate Run cases. |
| `submissions` | PK `id`; authenticated `user_id`; FK `problem_id`; language, source snapshot, final verdict, passed/total counts, aggregate runtime/memory, created/submitted timestamps. Never accept `user_id` as authoritative request data. |
| `submission_test_results` | PK `id`; FK `submission_id`; optional FK `test_case_id`; safe test ordinal, status, actual output/error, runtime/memory, timestamp. Keep hidden expected input/output private even in history. |

The repository schema contains tables for `problems`, `problem_execution_config`,
`problem_code_templates`, `test_cases`, `submissions`, and
`submission_test_results`; its exact columns should be confirmed in the live
Supabase project before assuming migration state. The attached
`seed_two_sum_single_number.sql` sets JSONB allowed-language/config fields,
seeds Java function templates for `Solution.twoSum(int[],int)` and
`Solution.singleNumber(int[])`, and writes three visible plus two hidden cases
for each problem. It does not seed Python/C++ templates or an explicit
three-case Run selector. Its JSON inputs/outputs require typed decoding by the
backend.

### Test-case roles and visibility

Do not infer Run membership from database row order. Add an explicit stable
designation such as `is_run_case BOOLEAN NOT NULL DEFAULT false` plus
`display_order`, or a constrained role/group field. Mark exactly three cases
per Run-enabled problem and make those cases public if input/expected values
are displayed to the user. The role may overlap with public examples.

- **Examples:** problem-page content allowed to be read by anonymous users.
- **Run set:** exactly three deterministic cases selected by server-side
  designation; never selected by browser parameters.
- **Submit set:** every applicable case, public and hidden.
- **Hidden:** no input or expected output in any browser-facing API response.
  Submit responses should not disclose hidden data; run details should be
  restricted to the designated public Run set.

If keeping the current schema without a new field, the current seed's first
three visible rows could be made a backend convention only by adding a stable
ordering/selection rule. That is less safe and less maintainable than explicit
Run eligibility and is not currently encoded by the seed.

### Database ownership decision

The Next.js frontend currently reads Supabase directly, while HTTP helpers
target a separate Spring Boot API. Do not assume the Spring service reads the
same Supabase project or database. Choose and document one authority:

1. Spring Boot and the frontend use the same PostgreSQL data, with public reads
   constrained by RLS and evaluation performed only by trusted backend roles;
   or
2. Spring Boot owns a separate authoritative store, with a defined import/sync
   process and stable IDs that map the frontend's numeric `problemId`.

Avoid dual writes and conflicting sources for problem IDs, templates,
execution configuration, test cases, and submissions.

## 6. Function and standard-input execution

### Function-based problems

The function signature and invocation must come from trusted per-problem,
per-language configuration. At minimum define language, execution mode,
class/module, method/function name, parameter types, return type, input
decoding, output serialization, and comparison strategy. The current template
table only has `entry_class`, `entry_method`, and `execution_mode`; additional
signature metadata or versioned runner configuration is needed for generic
driver generation.

1. Validate problem/language/configuration and create an isolated temporary
   job directory.
2. Store submitted solution bytes as the expected source file. Do not append a
   `Main` class or edit the solution signature.
3. Generate a separate trusted driver from validated problem metadata and
   typed test inputs.
4. Compile and execute inside the sandbox, collect bounded stdout/stderr,
   return value, exit status, time and memory.
5. Compare the function result using the configured comparator, then remove
   the job workspace.

For Java, write the user's package-private `class Solution` to `Solution.java`
and a generated `public class Main` driver to `Main.java`. Compile both
(`javac Solution.java Main.java`); the driver instantiates `Solution`, calls
the configured method, and serializes the return value. Use deep comparison
for arrays such as Two Sum's `int[]`.

For C++17, write the submitted class/function into a source/header artifact
that the generated driver can include, then compile with a fixed command such
as `g++ -std=c++17 -O2 Main.cpp -o program`. The driver decodes inputs, invokes
the configured symbol, and serializes the return value. Define ownership of
includes/headers and avoid compiling the same implementation twice.

For Python 3, store the solution in a fixed module such as `solution.py` and
have a separate generated driver import it, instantiate the configured class
if required, invoke the configured callable, and serialize the result.

Do not build drivers by unsafe string interpolation of user-controlled
metadata. Generate from validated typed metadata and escape literals safely.
Run each case in a clean process or reset all state between cases.

### Standard-input problems

For `STDIN` mode, provide the case input on stdin and compare normalized
stdout against the expected output. Do not assume stdout represents a
function return value in `FUNCTION` mode. The editor currently includes SQL
and Bash problem-type branches, but the provided seed enables Java only and
there is no inspected backend implementation proving those languages execute.
Only advertise modes/languages actually enabled by backend configuration.

## 7. Backend and sandbox responsibilities

- **Controller:** authenticate, validate request shape/size, call service, map
  stable errors/status codes. Do not compile or execute user code in the web
  process.
- **DTOs:** validate numeric problem ID, allowed language, bounded code/files,
  and file paths; never accept caller-supplied authoritative test cases or
  user identity.
- **Service/repositories:** load published problem, execution config, template
  metadata, and server-selected cases; persist Submit only after the full
  required evaluation completes.
- **Worker adapter:** dispatch a constrained job to an execution worker and
  return typed outcomes. Define request/result schema, timeouts, retries,
  idempotency, correlation IDs, and cleanup.
- **Worker:** prepare solution/driver files and invoke the sandbox adapter.
- **Sandbox:** execute untrusted code using a non-root identity, resource and
  process limits, bounded output, restricted filesystem, no unnecessary
  network, hard wall-clock timeout, and cleanup. Do not run arbitrary submitted
  code in the Spring service process or expose host Docker control to clients.

The Spring service coordinates and authorizes work; the worker manages a job;
the isolated sandbox is the only environment that executes untrusted code.
Failures in any infrastructure layer must not be converted into `ACCEPTED`.
Persist enough state for audit/retry without leaking hidden test data.

## 8. Authentication, CORS, async alternative, and security

The current API helper sends no Spring authentication token. Before enabling
user-specific submissions, agree on a trust mechanism:

- Preferred small change: obtain a Supabase access token in the browser and
  send `Authorization: Bearer <access-token>` to the API; Spring validates the
  JWT signature/issuer/audience and derives the user ID from verified claims.
- Alternatively, add a same-origin Next.js server proxy/BFF that validates
  the Supabase session and forwards identity securely.

Never trust body `userId`, never expose the Supabase service-role key, and
allow only the deployed Vercel origin(s) in backend CORS. Use TLS. Do not log
source or hidden inputs by default; redact tokens and secrets. Rate-limit
execution, enforce concurrency and source-size quotas, validate language
against per-problem configuration, and ensure users can only retrieve their
own submission details.

If synchronous execution is too slow, Submit can instead return `202 Accepted`
with `{submissionId,status:"PENDING"}` and the client can poll
`GET /api/submissions/{submissionId}` (or a dedicated status route). This is
not currently supported by the frontend. Add polling, cancellation/timeout
UX, and a stable state machine before choosing this option. Redis is not
required unless the chosen worker architecture needs it.

## 9. Frontend work required to adopt the proposal

1. Keep problem browse/detail/template reads consistent with the chosen
   database authority and public RLS policy.
2. Change the editor's Run and Submit handlers to call distinct endpoints;
   currently both call `/submissions/run`.
3. Define separate `RunResult` and `SubmissionResult` TypeScript types.
   Current `ExecutionResult` requires `submissionId` and does not model a
   returned expected output.
4. Decide whether Run test inputs/examples are sourced by the problem page or
   returned per-result by Run. Continue to fetch only public examples.
5. Forward verified auth to the backend, or use a server-side proxy. Do not
   send a trusted identity in the payload.
6. Handle API error `code`, completed verdicts, and optional async statuses
   without displaying infrastructure failures as user-code verdicts.
7. Keep the existing API base environment variable. The default already ends
   in `/api`, so helper paths should remain `/submissions/run` and
   `/submissions/submit`, not `/api/api/...`.

## 10. Example end-to-end flow

### Run

1. The client selects a problem and language enabled by its execution config.
2. It sends `POST /api/submissions/run` with `problemId`, `language`, `code`,
   and optional editor files.
3. Spring authenticates and validates, loads exactly the three designated
   Run cases from trusted storage, and dispatches a job.
4. The worker constructs a configured driver and executes in the sandbox.
5. Spring returns a completed `RunResult`; it does not create a submission.
6. The UI displays the three statuses, permitted output/details, and timings.

### Submit

1. The client sends `POST /api/submissions/submit` with the same source fields.
2. Spring authenticates and selects the complete server-side test suite.
3. Worker/sandbox evaluates each case; hidden inputs and expected values stay
   server-side.
4. Spring persists the source snapshot, final verdict, summary and authorized
   test results. `ACCEPTED` is possible only if all required cases pass.
5. The client displays the verdict and can retrieve the persisted record using
   the authenticated user's `submissionId`.

## 11. Backend implementation checklist

- [ ] Confirm the authoritative database and map frontend numeric problem IDs.
- [ ] Confirm canonical language identifiers (`java`, `cpp`, `python`) and
  which runtimes are actually installed and enabled.
- [ ] Add explicit deterministic Run-case designation; validate exactly three
  per Run-enabled problem.
- [ ] Keep hidden inputs and expected outputs inaccessible to browser roles
  and excluded from all client responses.
- [ ] Define signature/input/output/comparison metadata for function problems.
- [ ] Implement separate Run and Submit controller/service methods and DTOs.
- [ ] Derive user identity from validated authentication, not request JSON.
- [ ] Generate trusted drivers for Java, C++17 and Python 3 without changing
  user starter code/signatures.
- [ ] Enforce sandbox isolation, time/memory/process/output limits and cleanup.
- [ ] Persist only Submit results; test transactional behavior on partial
  worker failure and prevent success-shaped fallbacks.
- [ ] Define stable HTTP error bodies/status codes and request correlation IDs.
- [ ] Test accepted, wrong answer, compile/runtime error, timeout, memory limit,
  unsupported language, hidden-case privacy, and worker/persistence failures.
- [ ] Coordinate frontend changes for distinct endpoint calls and auth.

## 12. Open decisions for the backend developer

1. Does Spring Boot read the same Supabase PostgreSQL database or a separate
   data store? Which system assigns and owns `problemId`?
2. What authentication mechanism will Spring validate, and how will the
   current frontend forward credentials?
3. What exact signature metadata/config format drives each language's
   function runner and comparator?
4. Which three cases are designated Run cases? Will the three cases be public
   examples with inputs/expected outputs shown in the UI?
5. Should Run results persist in a separate audit/history table, or remain
   transient as proposed?
6. Is synchronous Submit fast enough for the complete suite? If not, define
   async states/polling before implementation.
7. Which API helper routes in Section 2 are intended to be supported by the
   Spring service, and which should be removed/replaced by direct Supabase
   access? Several are declared but have no call site in the inspected code.
