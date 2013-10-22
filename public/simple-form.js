var simpleForm = angular.module('simpleForm', []);

simpleForm.directive('form', function() {
  return {
    restrict: 'E',
    require: '^form',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$name     = attrs.name || nameDefault() || attrs.ngForm;

      function nameDefault() {
        return attrs['for'] ? attrs['for'] + 'Form' : '';
      }

      ctrl.$model    = scope.$eval(attrs['for']);
      ctrl.$fields   = {};

      ctrl.$addControl = function(control) {
        // Breaking change - before, inputs whose name was "hasOwnProperty" were quietly ignored
        // and not added to the scope.  Now we throw an error.
        assertNotHasOwnProperty(control.$name, 'input');
        ctrl.controls.push(control);

        if (control.$name) {
          ctrl.$fields[control.$name] = control;
          ctrl[control.$name] = control;
        }
      };
    }
  };
});

simpleForm.directive('ngModel', function() {
  return {
    restrict: 'A',
    require: '^ngModel',
    link: function(scope, element, attrs, ctrl) {
      ctrl.$model = scope.$eval(attrs.ngModel.replace(/\.\w{0,}/g, ''));
      ctrl.$validates = ctrl.$model.validates[attrs.ngModel.replace(/\w{0,}\./, '')];

      for (var validator in ctrl.$validates){
        if (ctrl.$validates.hasOwnProperty(validator)) {
          addValidations(validator, ctrl.$validates[validator], ctrl);
        }
      }

      function addValidations(validator, validation, t) {
        var validators = {
          presence: { required: true },
          email:    { type: "email" }
        }
        var validationKey = validators[validator.toString()];
        if (validationKey) {
          element.attr(validationKey);
        } else {
          t.$parsers.push(function(value) {
            if (validation[0](value)) {
              t.$setValidity(validator, true);
            } else {
              t.$setValidity(validator, false);
            }
          });
          var attrs = {};
          attrs[validator] = true;
          element.attr({validates: Object.keys(t.$validates)});
        }
        
      }
    }
  };
});
