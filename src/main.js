'use strict';

angular.module('scDateTime', []).value('scDateTimeConfig', {
  defaultTheme: 'material',
  autosave: false,
  defaultMode: 'date',
  defaultDate: undefined,
  displayMode: undefined,
  defaultOrientation: false,
  displayTwentyfour: false,
  compact: false
}).value('scDateTimeI18n', {
  previousMonth: 'Previous Month',
  nextMonth: 'Next Month',
  incrementHours: 'Increment Hours',
  decrementHours: 'Decrement Hours',
  incrementMinutes: 'Increment Minutes',
  decrementMinutes: 'Decrement Minutes',
  switchAmPm: 'Switch AM/PM',
  now: 'Now',
  cancel: 'Cancel',
  save: 'Save',
  weekdays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  switchTo: 'Switch to',
  clock: 'Clock',
  calendar: 'Calendar'
}).directive('timeDatePicker', ['$filter', '$sce', '$rootScope', '$parse', 'scDateTimeI18n', 'scDateTimeConfig',
  function($filter, $sce, $rootScope, $parse, scDateTimeI18n, scDateTimeConfig) {
    var _dateFilter;
    _dateFilter = $filter('date');
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        _weekdays: '=?tdWeekdays'
      },
      require: 'ngModel',
      templateUrl: function(tElement, tAttrs) {
        if ((tAttrs.theme == null) || tAttrs.theme === '') {
          tAttrs.theme = scDateTimeConfig.defaultTheme;
        }
        if (tAttrs.theme.indexOf('/') <= 0) {
          return 'scDateTime-' + tAttrs.theme + '.tpl';
        } else {
          return tAttrs.theme;
        }
      },
      link: function(scope, element, attrs, ngModel) {
        var cancelFn, saveFn;
        attrs.$observe('defaultMode', function(val) {
          if (val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.defaultMode;
          }
          scope._mode = val;
          return val;
        });
        attrs.$observe('defaultDate', function(val) {
          scope._defaultDate = (val != null) && Date.parse(val) ? Date.parse(val) : scDateTimeConfig.defaultDate;
          return scope._defaultDate;
        });
        attrs.$observe('displayMode', function(val) {
          if (val !== 'full' && val !== 'time' && val !== 'date') {
            val = scDateTimeConfig.displayMode;
          }
          scope._displayMode = val;
          return scope._displayMode;
        });
        attrs.$observe('orientation', function(val) {
          scope._verticalMode = val != null ? val === 'true' : scDateTimeConfig.defaultOrientation;
          return scope._verticalMode;
        });
        attrs.$observe('compact', function(val) {
          scope._compact = val != null ? val === 'true' : scDateTimeConfig.compact;
          return scope._compact;
        });
        attrs.$observe('displayTwentyfour', function(val) {
          scope._hours24 = val != null ? val : scDateTimeConfig.displayTwentyfour;
          return scope._hours24;
        });
        attrs.$observe('mindate', function(val) {
          if ((val != null) && Date.parse(val)) {
            scope.restrictions.mindate = new Date(val);
            return scope.restrictions.mindate.setHours(0, 0, 0, 0);
          }
        });
        attrs.$observe('maxdate', function(val) {
          if ((val != null) && Date.parse(val)) {
            scope.restrictions.maxdate = new Date(val);
            return scope.restrictions.maxdate.setHours(23, 59, 59, 999);
          }
        });
        scope._weekdays = scope._weekdays || scDateTimeI18n.weekdays;
        scope.$watch('_weekdays', function(value) {
          if ((value == null) || !angular.isArray(value)) {
            scope._weekdays = scDateTimeI18n.weekdays;
            return scope._weekdays;
          }
        });
        ngModel.$render = function() {
          var ref;
          return scope.setDate((ref = ngModel.$modelValue) != null ? ref : scope._defaultDate, ngModel.$modelValue != null);
        };
        angular.forEach(element.find('input'), function(input) {
          return angular.element(input).on('focus', function() {
            return setTimeout(input.select(), 10);
          });
        });
        scope.autosave = false;
        if ((attrs['autosave'] != null) || scDateTimeConfig.autosave) {
          scope.saveUpdateDate = function() {
            return ngModel.$setViewValue(scope.date);
          };
          scope.autosave = true;
          return scope.autosave;
        } else {
          saveFn = $parse(attrs.onSave);
          cancelFn = $parse(attrs.onCancel);
          scope.saveUpdateDate = function() {
            return true;
          };
          scope.save = function() {
            ngModel.$setViewValue(new Date(scope.date));
            return saveFn(scope.$parent, {
              $value: new Date(scope.date)
            });
          };
          scope.cancel = function() {
            cancelFn(scope.$parent, {});
            return ngModel.$render();
          };
          return scope.cancel;
        }
      },
      controller: [
        '$scope', 'scDateTimeI18n',
        function(scope, scDateTimeI18n) {
          var i;
          scope._defaultDate = scDateTimeConfig.defaultDate;
          scope._mode = scDateTimeConfig.defaultMode;
          scope._displayMode = scDateTimeConfig.displayMode;
          scope._verticalMode = scDateTimeConfig.defaultOrientation;
          scope._hours24 = scDateTimeConfig.displayTwentyfour;
          scope._compact = scDateTimeConfig.compact;
          scope.translations = scDateTimeI18n;
          scope.restrictions = {
            mindate: void 0,
            maxdate: void 0
          };
          scope.setDate = function(newVal, save) {
            if (save == null) {
              save = true;
            }
            scope.date = newVal ? new Date(newVal) : new Date();
            scope.calendar._year = scope.date.getFullYear();
            scope.calendar._month = scope.date.getMonth();
            scope.clock._minutes = scope.date.getMinutes();
            scope.clock._hours = scope._hours24 ? scope.date.getHours() : scope.date.getHours() % 12;
            if (!scope._hours24 && scope.clock._hours === 0) {
              scope.clock._hours = 12;
            }
            return scope.calendar.yearChange(save);
          };
          scope.display = {
            fullTitle: function() {
              var _timeString;
              _timeString = scope._hours24 ? 'HH:mm' : 'h:mm a';
              if (scope._displayMode === 'full' && !scope._verticalMode) {
                return _dateFilter(scope.date, 'EEEE d MMMM yyyy, ' + _timeString);
              } else if (scope._displayMode === 'time') {
                return _dateFilter(scope.date, _timeString);
              } else if (scope._displayMode === 'date') {
                return _dateFilter(scope.date, 'EEE d MMM yyyy');
              } else {
                return _dateFilter(scope.date, 'd MMM yyyy, ' + _timeString);
              }
            },
            title: function() {
              if (scope._mode === 'date') {
                return _dateFilter(scope.date, (scope._displayMode === 'date' ? 'EEEE' : 'EEEE ' + (scope._hours24 ? 'HH:mm' : 'h:mm a')));
              } else {
                return _dateFilter(scope.date, 'MMMM d yyyy');
              }
            },
            'super': function() {
              if (scope._mode === 'date') {
                return _dateFilter(scope.date, 'MMM');
              } else {
                return '';
              }
            },
            main: function() {
              return $sce.trustAsHtml(scope._mode === 'date' ? _dateFilter(scope.date, 'd') : scope._hours24 ? _dateFilter(scope.date, 'HH:mm') : (_dateFilter(scope.date, 'h:mm')) + '<small>' + (_dateFilter(scope.date, 'a')) + '</small>');
            },
            sub: function() {
              if (scope._mode === 'date') {
                return _dateFilter(scope.date, 'yyyy');
              } else {
                return _dateFilter(scope.date, 'HH:mm');
              }
            }
          };
          scope.calendar = {
            _month: 0,
            _year: 0,
            _months: [],
            _allMonths: (function() {
              var j, results;
              results = [];
              for (i = j = 0; j <= 11; i = ++j) {
                results.push(_dateFilter(new Date(0, i), 'MMMM'));
              }
              return results;
            })(),
            offsetMargin: function() {
              return (new Date(this._year, this._month).getDay() * 2.7) + 'rem';
            },
            isVisible: function(d) {
              return new Date(this._year, this._month, d).getMonth() === this._month;
            },
            isDisabled: function(d) {
              var currentDate, maxdate, mindate;
              currentDate = new Date(this._year, this._month, d);
              mindate = scope.restrictions.mindate;
              maxdate = scope.restrictions.maxdate;
              return ((mindate != null) && currentDate < mindate) || ((maxdate != null) && currentDate > maxdate);
            },
            isPrevMonthButtonHidden: function() {
              var date;
              date = scope.restrictions['mindate'];
              return (date != null) && this._month <= date.getMonth() && this._year <= date.getFullYear();
            },
            isNextMonthButtonHidden: function() {
              var date;
              date = scope.restrictions['maxdate'];
              return (date != null) && this._month >= date.getMonth() && this._year >= date.getFullYear();
            },
            'class': function(d) {
              var classString;
              classString = '';
              if ((scope.date != null) && new Date(this._year, this._month, d).getTime() === new Date(scope.date.getTime()).setHours(0, 0, 0, 0)) {
                classString += 'selected';
              }
              if (new Date(this._year, this._month, d).getTime() === new Date().setHours(0, 0, 0, 0)) {
                classString += ' today';
              }
              return classString;
            },
            select: function(d) {
              scope.date.setFullYear(this._year, this._month, d);
              return scope.saveUpdateDate();
            },
            monthChange: function(save) {
              var maxdate, mindate;
              if (save == null) {
                save = true;
              }
              if ((this._year == null) || isNaN(this._year)) {
                this._year = new Date().getFullYear();
              }
              mindate = scope.restrictions.mindate;
              maxdate = scope.restrictions.maxdate;
              if ((mindate != null) && mindate.getFullYear() === this._year && mindate.getMonth() >= this._month) {
                this._month = Math.max(mindate.getMonth(), this._month);
              }
              if ((maxdate != null) && maxdate.getFullYear() === this._year && maxdate.getMonth() <= this._month) {
                this._month = Math.min(maxdate.getMonth(), this._month);
              }
              scope.date.setFullYear(this._year, this._month);
              if (scope.date.getMonth() !== this._month) {
                scope.date.setDate(0);
              }
              if ((mindate != null) && scope.date < mindate) {
                scope.date.setDate(mindate.getTime());
                scope.calendar.select(mindate.getDate());
              }
              if ((maxdate != null) && scope.date > maxdate) {
                scope.date.setDate(maxdate.getTime());
                scope.calendar.select(maxdate.getDate());
              }
              if (save) {
                return scope.saveUpdateDate();
              }
            },
            _incMonth: function(months) {
              this._month += months;
              while (this._month < 0 || this._month > 11) {
                if (this._month < 0) {
                  this._month += 12;
                  this._year--;
                } else {
                  this._month -= 12;
                  this._year++;
                }
              }
              return this.monthChange();
            },
            yearChange: function(save) {
              var len, maxdate, mindate;
              if (save == null) {
                save = true;
              }
              if ((scope.calendar._year == null) || scope.calendar._year === '') {
                return;
              }
              mindate = scope.restrictions.mindate;
              maxdate = scope.restrictions.maxdate;
              i = (mindate != null) && mindate.getFullYear() === scope.calendar._year ? mindate.getMonth() : 0;
              len = (maxdate != null) && maxdate.getFullYear() === scope.calendar._year ? maxdate.getMonth() : 11;
              scope.calendar._months = scope.calendar._allMonths.slice(i, len + 1);
              return scope.calendar.monthChange(save);
            }
          };
          scope.clock = {
            _minutes: 0,
            _hours: 0,
            _incHours: function(inc) {
              this._hours = scope._hours24 ? Math.max(0, Math.min(23, this._hours + inc)) : Math.max(1, Math.min(12, this._hours + inc));
              if (isNaN(this._hours)) {
                this._hours = 0;
                return this._hours;
              }
            },
            _incMinutes: function(inc) {
              this._minutes = Math.max(0, Math.min(59, this._minutes + inc));
              if (isNaN(this._minutes)) {
                this._minutes = 0;
                return this._minutes;
              }
            },
            setAM: function(b) {
              if (b == null) {
                b = !this.isAM();
              }
              if (b && !this.isAM()) {
                scope.date.setHours(scope.date.getHours() - 12);
              } else if (!b && this.isAM()) {
                scope.date.setHours(scope.date.getHours() + 12);
              }
              return scope.saveUpdateDate();
            },
            isAM: function() {
              return scope.date.getHours() < 12;
            }
          };
          scope.$watch('clock._minutes', function(val, oldVal) {
            if ((val != null) && val !== scope.date.getMinutes() && !isNaN(val) && (0 <= val && val <= 59)) {
              scope.date.setMinutes(val);
              return scope.saveUpdateDate();
            }
          });
          scope.$watch('clock._hours', function(val) {
            if ((val != null) && !isNaN(val)) {
              if (!scope._hours24) {
                if (val === 24) {
                  val = 12;
                } else if (val === 12) {
                  val = 0;
                } else if (!scope.clock.isAM()) {
                  val += 12;
                }
              }
              if (val !== scope.date.getHours()) {
                scope.date.setHours(val);
                return scope.saveUpdateDate();
              }
            }
          });
          scope.setNow = function() {
            scope.setDate();
            return scope.saveUpdateDate();
          };
          scope.modeClass = function() {
            if (scope._displayMode != null) {
              scope._mode = scope._displayMode;
            }
            var modeClass = '' + (scope._verticalMode ? 'vertical ' : '') +
              (scope._displayMode === 'full' ? 'full-mode' : scope._displayMode === 'time' ? 'time-only' : scope._displayMode === 'date' ? 'date-only' : scope._mode === 'date' ? 'date-mode' : 'time-mode') +
              ' ' + (scope._compact ? 'compact' : '');
            return modeClass;
          };
          scope.modeSwitch = function() {
            var ref;
            scope._mode = (ref = scope._displayMode) != null ? ref : scope._mode === 'date' ? 'time' : 'date';
            return scope._mode;
          };
          scope.modeSwitchText = function() {
            var modeSwitchText = scDateTimeI18n.switchTo + ' ' + (scope._mode === 'date' ? scDateTimeI18n.clock : scDateTimeI18n.calendar);
            return modeSwitchText;
          };
        }
      ]
    };
  }
]);
