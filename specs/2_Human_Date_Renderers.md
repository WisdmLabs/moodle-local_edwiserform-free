
# 2. Human Date Renderers

**Change Summary:**
Moodle 5.0 introduces `humandate` and `humantimeperiod` classes for rendering dates and time periods in a human-readable format, replacing deprecated functions.

**Required Developer Action:**
- Utilize `humandate` for single timestamps and `humantimeperiod` for date/time ranges.
- Replace deprecated functions like `calendar_format_event_time` with the new classes.

**Compatibility Checkpoints:**
- Search for and replace deprecated date rendering functions.
- Implement the new classes as per the updated API.
