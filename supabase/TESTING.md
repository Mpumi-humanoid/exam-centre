# Supabase authorization checks

Run these checks with separate authenticated test accounts in a non-production project. Use the public Supabase URL and anon key in the browser. Keep service-role credentials out of the client.

Run the JavaScript snippets from a temporary authenticated test component/module that imports `supabase` from `src/lib/supabaseClient.js`; the app intentionally does not expose the client on `window`.

## Test setup

Provision:

- Student A and Student B, each with a `profiles` row and distinct auth user ID.
- Lecturer A and Lecturer B, each with a lecturer `profiles` row.
- Module A assigned to Lecturer A and enrolled by Student A.
- Module B assigned only to Lecturer B and enrolled by Student B.
- A released and an unreleased assessment in both modules, with result rows for the corresponding students.

The admin creates these records using the Supabase dashboard or a trusted server-side tool. Do not expose admin credentials in the app.

## 1. Student isolation

Sign in as Student A and run from the authenticated test module:

```js
const { data, error } = await supabase
  .from('results')
  .select('student_id, assessment_id, mark')
  .eq('student_id', 'STUDENT_B_AUTH_UUID');
console.log({ data, error });
```

Expected: no Student B rows are returned (`data` is empty). The RLS policy also restricts a query that omits the explicit filter.

## 2. Student write protection

While signed in as Student A, run this update attempt:

```js
const { data, error } = await supabase
  .from('results')
  .update({ mark: 1 })
  .eq('student_id', 'STUDENT_A_AUTH_UUID')
  .select();
console.log({ data, error });
```

Expected: the request is denied or affects zero rows. Confirm in the Supabase dashboard that the stored mark is unchanged. Student accounts have no insert, update, or delete policy for results.

## 3. Lecturer assignment boundary

Sign in as Lecturer A and run this update attempt for Module B:

```js
const { data, error } = await supabase
  .from('results')
  .update({ mark: 2 })
  .eq('assessment_id', 'MODULE_B_ASSESSMENT_UUID')
  .eq('student_id', 'STUDENT_B_AUTH_UUID')
  .select();
console.log({ data, error });
```

Expected: the request is denied or affects zero rows. Confirm the original mark is unchanged. Lecturer A must not be able to read, insert, update, or publish results for Module B.

## 4. Unreleased result masking

Sign in as the student enrolled in a module whose assessment is unreleased, then run:

```js
const { data, error } = await supabase
  .from('results')
  .select('id, mark, assessment:assessments!inner(id, is_released)')
  .eq('student_id', 'STUDENT_A_AUTH_UUID');
console.log({ data, error });
```

Expected: released results may be returned; no row whose assessment has `is_released = false` is returned, even when the result exists in the database.

## 5. End-to-end release flow

1. Sign in as the lecturer assigned to Module A.
2. Save a mark and feedback for Student A on a Module A assessment.
3. Verify a corresponding audit row was added to `result_history`.
4. Release the assessment.
5. Sign in as Student A and verify the released mark and feedback appear on the results/feedback pages.
6. Verify Student B cannot see Student A's result and Lecturer B cannot edit it.

The UI reports permission and network failures without displaying raw database errors. RLS is the security boundary; route guards are not a substitute.
