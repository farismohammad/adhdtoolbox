# Design System Notes

ADHDToolbox uses a dense, local-tool interface with restrained contrast and large targets.

- Keep tool panels inside `.section-card__body` and compose controls with `.section-stack`, `.preview-grid`, and `.control-row`.
- Use `.ui-button`, `.ui-input`, `.ui-textarea`, `.toggle-row`, and `.empty-state` before adding one-off control styles.
- Keep keyboard focus visible with the shared `:focus-visible` ring; new inputs and selects should inherit `.ui-input`.
- Keep state messages in `aria-live="polite"` regions, and use `role="alert"` only for blocking or error feedback.
- Preserve `prefers-reduced-motion` behavior by keeping hover and transition effects CSS-based and nonessential.
- Below `64rem` (tablets and phones) the layout stacks into one scrolling column; at `64rem` and up it is a fixed-height workspace, so long lists must scroll inside their own card rather than be clipped.
- Below `42rem` (phones) the header and tool picker compact to a single row each.
- Size list rows to their container with `@container` queries (see `.task-row`) instead of window breakpoints, because the same list can sit in a narrow column on desktop.
- On narrow screens, allow action rows to wrap and stack metadata so button text does not overlap neighboring content.
- Timers pass a `storageKey` to `useCountdown` so they survive a refresh, and report their state to the tab title with `useDocumentTitlePart`.
