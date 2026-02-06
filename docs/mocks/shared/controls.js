/**
 * MysTech Mock Lab — MockControls
 *
 * Floating control panel for experiment variants.
 * Sets CSS custom properties on :root for instant reactivity.
 *
 * Usage:
 *   const controls = new MockControls('Experiment Name');
 *   controls.addSegmented('shimmer', 'Shimmer Intensity', [
 *     { label: 'Subtle', value: '0.3' },
 *     { label: 'Medium', value: '0.6' },
 *     { label: 'Bold',   value: '1.0' },
 *   ]);
 *   controls.addSlider('tilt', 'Max Tilt', { min: 5, max: 30, step: 1, default: 15, unit: 'deg' });
 *   controls.addCheckbox('particles', 'Particle Aura', true);
 *   controls.render();
 */
class MockControls {
  constructor(title) {
    this.title = title;
    this._controls = [];
    this._isOpen = false;
  }

  /**
   * Add a segmented (button group) control.
   * @param {string} id - CSS custom property name (e.g. 'shimmer' → --ctrl-shimmer)
   * @param {string} label - Display label
   * @param {Array<{label: string, value: string}>} options - Button options
   * @param {Function} [onChange] - Optional callback(value)
   */
  addSegmented(id, label, options, onChange) {
    this._controls.push({ type: 'segmented', id, label, options, onChange });
  }

  /**
   * Add a range slider control.
   * @param {string} id - CSS custom property name
   * @param {string} label - Display label
   * @param {{min: number, max: number, step: number, default: number, unit?: string}} config
   * @param {Function} [onChange] - Optional callback(value)
   */
  addSlider(id, label, config, onChange) {
    this._controls.push({ type: 'slider', id, label, config, onChange });
  }

  /**
   * Add a checkbox toggle.
   * @param {string} id - CSS custom property name
   * @param {string} label - Display label
   * @param {boolean} [defaultChecked=false]
   * @param {Function} [onChange] - Optional callback(checked)
   */
  addCheckbox(id, label, defaultChecked, onChange) {
    this._controls.push({ type: 'checkbox', id, label, defaultChecked: !!defaultChecked, onChange });
  }

  /** Build and mount the control panel to the DOM. Fires initial values. */
  render() {
    const root = document.createElement('div');
    root.className = 'mock-controls';

    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'mock-controls__toggle';
    toggle.innerHTML = '&#9881;'; // gear icon
    toggle.title = 'Toggle controls';
    toggle.setAttribute('aria-label', 'Toggle variant controls');

    // Panel
    const panel = document.createElement('div');
    panel.className = 'mock-controls__panel';

    // Header
    const header = document.createElement('div');
    header.className = 'mock-controls__header';
    header.textContent = this.title;
    panel.appendChild(header);

    // Build controls
    this._controls.forEach(ctrl => {
      const group = document.createElement('div');
      group.className = 'mock-control-group';

      const labelEl = document.createElement('span');
      labelEl.className = 'mock-control-group__label';
      labelEl.textContent = ctrl.label;
      group.appendChild(labelEl);

      switch (ctrl.type) {
        case 'segmented':
          group.appendChild(this._buildSegmented(ctrl));
          break;
        case 'slider':
          group.appendChild(this._buildSlider(ctrl));
          break;
        case 'checkbox':
          group.appendChild(this._buildCheckbox(ctrl));
          break;
      }

      panel.appendChild(group);
    });

    // Toggle behavior
    toggle.addEventListener('click', () => {
      this._isOpen = !this._isOpen;
      panel.classList.toggle('is-open', this._isOpen);
      toggle.innerHTML = this._isOpen ? '&#10005;' : '&#9881;';
    });

    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);

    // Fire initial values
    this._controls.forEach(ctrl => {
      switch (ctrl.type) {
        case 'segmented': {
          const defaultOpt = ctrl.options[0];
          this._setCSSVar(ctrl.id, defaultOpt.value);
          if (ctrl.onChange) ctrl.onChange(defaultOpt.value);
          break;
        }
        case 'slider': {
          const val = ctrl.config.default;
          this._setCSSVar(ctrl.id, val + (ctrl.config.unit || ''));
          if (ctrl.onChange) ctrl.onChange(val);
          break;
        }
        case 'checkbox': {
          const checked = ctrl.defaultChecked;
          this._setCSSVar(ctrl.id, checked ? '1' : '0');
          if (ctrl.onChange) ctrl.onChange(checked);
          break;
        }
      }
    });
  }

  // --- Private builders ---

  _buildSegmented(ctrl) {
    const container = document.createElement('div');
    container.className = 'mock-segmented';

    ctrl.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'mock-segmented__btn';
      if (i === 0) btn.classList.add('is-active');
      btn.textContent = opt.label;
      btn.addEventListener('click', () => {
        container.querySelectorAll('.mock-segmented__btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        this._setCSSVar(ctrl.id, opt.value);
        if (ctrl.onChange) ctrl.onChange(opt.value);
      });
      container.appendChild(btn);
    });

    return container;
  }

  _buildSlider(ctrl) {
    const container = document.createElement('div');
    container.className = 'mock-slider';

    const input = document.createElement('input');
    input.className = 'mock-slider__input';
    input.type = 'range';
    input.min = ctrl.config.min;
    input.max = ctrl.config.max;
    input.step = ctrl.config.step;
    input.value = ctrl.config.default;

    const valueDisplay = document.createElement('span');
    valueDisplay.className = 'mock-slider__value';
    valueDisplay.textContent = ctrl.config.default + (ctrl.config.unit || '');

    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      valueDisplay.textContent = val + (ctrl.config.unit || '');
      this._setCSSVar(ctrl.id, val + (ctrl.config.unit || ''));
      if (ctrl.onChange) ctrl.onChange(val);
    });

    container.appendChild(input);
    container.appendChild(valueDisplay);
    return container;
  }

  _buildCheckbox(ctrl) {
    const container = document.createElement('label');
    container.className = 'mock-checkbox';

    const input = document.createElement('input');
    input.className = 'mock-checkbox__input';
    input.type = 'checkbox';
    input.checked = ctrl.defaultChecked;

    const label = document.createElement('span');
    label.className = 'mock-checkbox__label';
    label.textContent = ctrl.label;

    input.addEventListener('change', () => {
      this._setCSSVar(ctrl.id, input.checked ? '1' : '0');
      if (ctrl.onChange) ctrl.onChange(input.checked);
    });

    container.appendChild(input);
    container.appendChild(label);
    return container;
  }

  _setCSSVar(id, value) {
    document.documentElement.style.setProperty('--ctrl-' + id, value);
  }
}
