/* ============================================
   MysTech Mock Lab — MockControls
   ============================================
   Interactive control panel for tweaking animation
   parameters in real-time. Used by all standalone mocks.

   Usage:
     const controls = new MockControls('Animation Name');
     controls.addSlider('speed', 'Speed', { min: 0.1, max: 3, step: 0.1, default: 1 }, (val) => { ... });
     controls.addCheckbox('glow', 'Enable Glow', true, (checked) => { ... });
     controls.addSegmented('mode', 'Mode', [{ label: 'A', value: 'a' }, ...], (val) => { ... });
   ============================================ */

class MockControls {
  constructor(title) {
    this.title = title;
    this.controls = {};
    this._buildPanel();
  }

  _buildPanel() {
    // Create panel container
    this.panel = document.createElement('div');
    this.panel.className = 'controls-panel';

    // Toggle button
    const toggle = document.createElement('button');
    toggle.className = 'controls-panel__toggle';
    toggle.innerHTML = '<span class="controls-panel__toggle-icon">\u25B2</span> Controls';
    toggle.addEventListener('click', () => {
      this.panel.classList.toggle('is-open');
    });
    this.panel.appendChild(toggle);

    // Body grid
    this.body = document.createElement('div');
    this.body.className = 'controls-panel__body';
    this.panel.appendChild(this.body);

    document.body.appendChild(this.panel);
  }

  /**
   * Add a slider control.
   * @param {string} id - Unique control identifier
   * @param {string} label - Display label
   * @param {object} opts - { min, max, step, default }
   * @param {function} onChange - Callback with new numeric value
   */
  addSlider(id, label, opts, onChange) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const labelRow = document.createElement('div');
    labelRow.style.display = 'flex';
    labelRow.style.justifyContent = 'space-between';
    labelRow.style.alignItems = 'baseline';

    const labelEl = document.createElement('span');
    labelEl.className = 'control-group__label';
    labelEl.textContent = label;

    const valueEl = document.createElement('span');
    valueEl.className = 'control-group__value';
    valueEl.textContent = opts.default;

    labelRow.appendChild(labelEl);
    labelRow.appendChild(valueEl);

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.className = 'control-slider';
    slider.min = opts.min;
    slider.max = opts.max;
    slider.step = opts.step;
    slider.value = opts.default;

    slider.addEventListener('input', () => {
      const val = parseFloat(slider.value);
      valueEl.textContent = val;
      if (onChange) onChange(val);
    });

    group.appendChild(labelRow);
    group.appendChild(slider);
    this.body.appendChild(group);

    this.controls[id] = {
      type: 'slider',
      element: slider,
      getValue: () => parseFloat(slider.value),
      setValue: (v) => { slider.value = v; valueEl.textContent = v; }
    };

    return this;
  }

  /**
   * Add a checkbox control.
   * @param {string} id - Unique control identifier
   * @param {string} label - Display label
   * @param {boolean} defaultChecked - Initial state
   * @param {function} onChange - Callback with boolean
   */
  addCheckbox(id, label, defaultChecked, onChange) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const labelEl = document.createElement('span');
    labelEl.className = 'control-group__label';
    labelEl.textContent = label;

    const wrapper = document.createElement('label');
    wrapper.className = 'control-checkbox';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = defaultChecked;

    const checkLabel = document.createElement('span');
    checkLabel.className = 'control-checkbox__label';
    checkLabel.textContent = defaultChecked ? 'On' : 'Off';

    checkbox.addEventListener('change', () => {
      checkLabel.textContent = checkbox.checked ? 'On' : 'Off';
      if (onChange) onChange(checkbox.checked);
    });

    wrapper.appendChild(checkbox);
    wrapper.appendChild(checkLabel);

    group.appendChild(labelEl);
    group.appendChild(wrapper);
    this.body.appendChild(group);

    this.controls[id] = {
      type: 'checkbox',
      element: checkbox,
      getValue: () => checkbox.checked,
      setValue: (v) => { checkbox.checked = v; checkLabel.textContent = v ? 'On' : 'Off'; }
    };

    return this;
  }

  /**
   * Add a segmented control (radio-button group).
   * @param {string} id - Unique control identifier
   * @param {string} label - Display label
   * @param {Array<{label: string, value: string}>} options - Choices
   * @param {function} onChange - Callback with selected value string
   */
  addSegmented(id, label, options, onChange) {
    const group = document.createElement('div');
    group.className = 'control-group';

    const labelEl = document.createElement('span');
    labelEl.className = 'control-group__label';
    labelEl.textContent = label;

    const segmented = document.createElement('div');
    segmented.className = 'control-segmented';

    let activeValue = options[0].value;

    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'control-segmented__option';
      btn.textContent = opt.label;
      btn.dataset.value = opt.value;
      if (i === 0) btn.classList.add('is-active');

      btn.addEventListener('click', () => {
        segmented.querySelectorAll('.control-segmented__option').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        activeValue = opt.value;
        if (onChange) onChange(opt.value);
      });

      segmented.appendChild(btn);
    });

    group.appendChild(labelEl);
    group.appendChild(segmented);
    this.body.appendChild(group);

    this.controls[id] = {
      type: 'segmented',
      element: segmented,
      getValue: () => activeValue,
      setValue: (v) => {
        activeValue = v;
        segmented.querySelectorAll('.control-segmented__option').forEach(btn => {
          btn.classList.toggle('is-active', btn.dataset.value === v);
        });
      }
    };

    return this;
  }

  /**
   * Get a control's current value by ID.
   */
  get(id) {
    return this.controls[id]?.getValue();
  }

  /**
   * Set a control's value by ID.
   */
  set(id, value) {
    this.controls[id]?.setValue(value);
  }

  /**
   * Open the controls panel.
   */
  open() {
    this.panel.classList.add('is-open');
  }

  /**
   * Close the controls panel.
   */
  close() {
    this.panel.classList.remove('is-open');
  }

  /**
   * Toggle the controls panel.
   */
  toggle() {
    this.panel.classList.toggle('is-open');
  }
}
