# Design System Notes

ADHDToolbox uses a dense, local-tool interface with restrained contrast and large targets.

- Keep tool panels inside `.section-card__body` and compose controls with `.section-stack`, `.preview-grid`, and `.control-row`.
- Use `.ui-button`, `.ui-input`, `.ui-textarea`, `.toggle-row`, and `.empty-state` before adding one-off control styles.
- Keep keyboard focus visible with the shared `:focus-visible` ring; new inputs and selects should inherit `.ui-input`.
- Keep state messages in `aria-live="polite"` regions, and use `role="alert"` only for blocking or error feedback.
- Preserve `prefers-reduced-motion` behavior by keeping hover and transition effects CSS-based and nonessential.
- On narrow screens, allow action rows to wrap and stack metadata so button text does not overlap neighboring content.
