(function () {
  var APP;

  class App {
    constructor() {

      // The first in each set is the default unit to use.
      this.units = {
        distance: {
          'AU': 1,
          'km': 149597870.7
        },
        angle: {
          'deg': 1,
          'rad': Math.PI / 180,
          'tau': 1/360
        },
        temperature: {
          '&deg;C': 1,
          '&deg;F': [9/5, 32],
          'K': [1, -273.15]
        },
        time: {
          'hours': 1,
          'ms': 360000,
          's': 360,
          'min': 60,
          'd<sub>&#128808;</sub>': 1/24,
          'yr<sub>&#128808;</sub>': 1/8766.15264
        }
      };
      this.ranges = {
        'deg': [0, 360],
        'rad': [0, 2*Math.PI, Math.PI/500],
        'tau': [0, 1, 0.01],
        '&deg;C': [-273.15],
        '&deg;F': [-459.67],
        'K': [0],
        'ms': [0],
        's': [0],
        'min': [0],
        'hours': [0],
        'd<sub>&#128808;</sub>': [0],
        'yr<sub>&#128808;</sub>': [0]
      };

      this.prop = {
        'Apoapsis': {
          value: 1,
          unitSet: 'distance'
        },
        'Periapsis': {
          value: 1,
          unitSet: 'distance'
        },
        'Semi-Major Axis': {
          value: 1,
          unitSet: 'distance'
        },
        'Semi-Minor Axis': {
          value: 1,
          unitSet: 'distance'
        },
        'Eccentricity': {
          value: 0,
          range: [0, 1, 0.01]
        },
        'Inclination': {
          value: 0,
          unitSet: 'angle',
          unitDef: 'tau'
        },
        'True Anomaly': {
          value: 0,
          unitSet: 'angle'
        },
        'Argument of Periapsis': {
          value: 0,
          unitSet: 'angle'
        },
        'Longitude of Ascending Node': {
          value: 0,
          unitSet: 'angle'
        },
        'Orbital Period': {
          value: 8766.15264,
          unitSet: 'time',
          unitDef: 'd<sub>&#128808;</sub>'
        },
        'test': {
          value: 0,
          unitSet: 'temperature'
        }
      };

      this.initInput();

    }

    convert(value, unitSet, from, to) {
      value *= 1;
      if (from === to) return value;
      let set = this.units[unitSet],
          numTo = set[to],
          numFr = set[from],
          add = 0;
      if (Array.isArray(numFr)) {
        add = numFr[1];
        numFr = numFr[0];
      } else if (Array.isArray(numTo)) {
        add = -numTo[1];
        numTo = numTo[0];
      }
      return value * numTo/numFr + add;
    }

    initInput() {
      // Initialize DOM elements.
      let app = this,
          divControls = document.getElementById('controls'),
          newDOM = function (n, parent, prop) {
            let element = document.createElement(n.toUpperCase());
            if (prop) {
              $.each(prop, (key, value) => {
                element[key] = value;
              });
            }
            if (parent) parent.appendChild(element);
            return element;
          },
          setRange = function (input, range) {
            if (!range) return;
            //if (!isNaN(range[0])) input.min = Math.trunc(range[0]);
            //if (!isNaN(range[1])) input.max = Math.trunc(range[1]);
            input.step = range[2] || 1;
          };
      $.each(this.prop, (name, prop) => {
        newDOM('LABEL', newDOM('DIV', divControls), {innerHTML: name});
        let inputDiv = newDOM('DIV', divControls),
            input = newDOM('INPUT', inputDiv),
            unitSet = prop.unitSet,
            select;
        input.type = 'number';
        input.value = prop.value;
        if (unitSet) {
          select = newDOM('SELECT', inputDiv);
          $.each(app.units[unitSet], (key, value) => {
            newDOM('OPTION', select, {
              value: key,
              innerHTML: key
            });
          });
          select.value = select.options[0].value;
          if (prop.unitDef) {
            select.value = prop.unitDef;
            input.value = app.convert(
              app.prop[name].value,
              unitSet,
              select.options[0].value,
              select.value);
          }
          setRange(input, app.ranges[select.value]);
          input.style.width = parseFloat(inputDiv.offsetWidth) - parseFloat(select.offsetWidth) + 'px';
          select.addEventListener('change', function () {
            input.value = app.convert(
              app.prop[name].value,
              unitSet,
              select.options[0].value,
              select.value);
            setRange(input, app.ranges[select.value]);
          });
        } else {
          setRange(input, prop.range);
        }
        if (unitSet === 'angle') {
          let f = function () {
            let rNpt = app.ranges[select.value],
                a = rNpt[0], b = rNpt[1];
            while (input.value < 0) input.value -= -b;
            input.value = input.value % b;
            console.log(input.value);
          };
          input.addEventListener('input', f);
          input.addEventListener('change', f);
        }
        input.addEventListener('input', function () {
          let v = input.value,
              rVal = prop.range;
          if (unitSet) {
            v = app.convert(
              input.value,
              unitSet,
              select.value,
              select.options[0].value);
            rVal = app.ranges[select.options[0].value];
          }
          if (rVal && !isNaN(input.value)) {
            if (!isNaN(rVal[0])) v = Math.max(v, rVal[0]);
            if (!isNaN(rVal[1])) v = Math.min(v, rVal[1]);
          }
          app.prop[name].value = v
        });
        input.addEventListener('change', function () {
          let rNpt = prop.range;
          if (unitSet) rNpt = app.ranges[select.value];
          if (rNpt) {
            if (!isNaN(rNpt[0])) input.value = Math.max(input.value, rNpt[0]);
            if (!isNaN(rNpt[1])) input.value = Math.min(input.value, rNpt[1]);
          }
        });
      });
    }
  }

  $(document).ready(() => {
    document.fonts.load('1rem "Raleway"').then(() => {
      APP = new App();
    });
  });
})();
