<script>
(function () {
  const STORAGE_KEY = 'exercise-skip:v1';

  function loadState() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
    catch { return {}; }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function pageKeyPrefix() {
    return location.pathname + '::';
  }

  function isSkipped(state, exId) {
    return !!state[pageKeyPrefix() + exId];
  }

  function setSkipped(state, exId, skipped) {
    const key = pageKeyPrefix() + exId;
    if (skipped) state[key] = true; else delete state[key];
    saveState(state);
  }

  function applySkipAttr(el, skipped) {
    if (skipped) {
      el.setAttribute('data-skip', 'true');
      el.setAttribute('data-complete', 'true');
    } else {
      el.removeAttribute('data-skip');
      // Only remove data-complete if this cell wasn't actually completed
      // by grading (has a success alert). If it was graded, leave complete.
      const graded = !!el.querySelector('.exercise-grade.alert-success');
      if (!graded) el.removeAttribute('data-complete');
    }
  }

  function checkCellsForExercise(exId) {
    return Array.from(document.querySelectorAll('.cell.wait[data-check="true"]'))
      .filter(function (cell) {
        return cell.getAttribute('data-exercise') === exId;
      });
  }

  function applySkipAttrToExercise(exId, skipped) {
    checkCellsForExercise(exId).forEach(function (cell) {
      applySkipAttr(cell, skipped);
    });
  }

  function buildButton(el, state, exId) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn btn-sm btn-outline-secondary skip-exercise-btn';
    const skipped = isSkipped(state, exId);
    btn.textContent = skipped ? 'Undo skip' : 'Skip exercise';
    btn.setAttribute('aria-pressed', skipped ? 'true' : 'false');
    btn.style.margin = '0.5rem 0';

    btn.addEventListener('click', function () {
      const nowSkipped = btn.getAttribute('aria-pressed') !== 'true';
      applySkipAttrToExercise(exId, nowSkipped);
      setSkipped(state, exId, nowSkipped);
      btn.textContent = nowSkipped ? 'Undo skip' : 'Skip exercise';
      btn.setAttribute('aria-pressed', nowSkipped ? 'true' : 'false');
    });
    return btn;
  }

  document.addEventListener('DOMContentLoaded', function () {
    const state = loadState();
    document.querySelectorAll('.cell.wait[data-check="true"]').forEach(function (cell) {
      const nestedInCheckCell = cell.parentElement && cell.parentElement.closest('.cell.wait[data-check="true"]');
      if (nestedInCheckCell || cell.dataset.skipButtonInitialized === 'true') return;

      const exId = cell.getAttribute('data-exercise');
      if (!exId) return;

      // Reapply stored skip state
      applySkipAttrToExercise(exId, isSkipped(state, exId));

      // Insert the button just before the exercise cell
      const btn = buildButton(cell, state, exId);
      cell.dataset.skipButtonInitialized = 'true';
      const parent = cell.parentElement || cell;
      parent.insertBefore(btn, cell);
    });
  });
})();
</script>

