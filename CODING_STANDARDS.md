# Coding standards

Judgement calls for the reviewer. Mechanical rules — import shape, banned APIs, file location, formatting — belong in ESLint, `tsc`, or CI, which already run on every PR.

## Tests assert one behaviour

A test whose failure names one behaviour is worth keeping; a test that fails with "line 47" and cannot say which of four behaviours broke is not.

Give each scenario its own `it`, named for the behaviour it locks down. Split a test when it covers more than one of:

- an invariant that holds before an action, and the effect of that action;
- two different user actions;
- a happy path and its cancellation or failure path.

The count of `expect` calls is not the measure — a single behaviour often needs several assertions to pin down. The measure is whether one cause explains every failure in the `it`.

Setup shared by several scenarios belongs in a `beforeEach` or a small helper, not in one long test that walks through all of them in sequence.

## Shipped data is never live state

Data that ships with the app — history presets, defaults, fixtures, anything described as immutable — is read-only reference data.

A component's mutable state must not hold the same object identity as shipped data. Seed state from a copy, and freeze the shipped value so an accidental in-place edit throws instead of silently rewriting the record for the rest of the session.

When a constant and a `useState` initial value are the same reference, an in-place edit reaches through the state into the shipped data. The bug is invisible until a second entry shares that data, which is exactly when it is expensive to find.
