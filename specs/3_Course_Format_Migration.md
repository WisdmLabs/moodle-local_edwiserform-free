
# 3. Course Format Migration

**Change Summary:**
Course formats relying on YUI libraries are deprecated. The new course editor uses output classes and Mustache templates.

**Required Developer Action:**
- Ensure course format plugins extend `core_courseformatase`.
- Implement renderers extending `core_courseformat\output\section_renderer`.
- Use Mustache templates for rendering UI elements.
- Replace YUI-based logic with the new course editor's reactive state and data attributes.

**Compatibility Checkpoints:**
- Verify the use of `core_courseformatase` and `section_renderer`.
- Ensure Mustache templates are used for rendering.
- Check for the removal of YUI dependencies.
