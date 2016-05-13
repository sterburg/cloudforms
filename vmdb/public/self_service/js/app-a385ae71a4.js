/**
 * manageiq_self_service - ManageIQ Self Service dependencies
 * @authors Michael Stack,Allen Wight
 * @version v0.0.1
 * @link 
 * @license Apache 2.0
 */
(function() {
  'use strict';
  angular.module('app', [
    'app.core',
    'app.config',
    'app.states',
    'ngProgress'
  ]);
  angular.module('app').controller('AppController', ['$rootScope', '$scope', 'ngProgressFactory',
    function($rootScope, $scope, ngProgressFactory) {
      $scope.progressbar = ngProgressFactory.createInstance();
      $scope.progressbar.setColor('#0088ce');
      $scope.progressbar.setHeight('3px');
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
        if (toState.resolve) {
          $scope.progressbar.start();
        }
      });
      $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
        if (toState.resolve) {
          $scope.progressbar.complete();
        }
      });
    }]);
})();

(function() {
  'use strict';

  angular.module('blocks.bind-attrs', []);
})();

(function() {
  'use strict';

  angular.module('blocks.directive-options', []);
})();

(function() {
  'use strict';

  angular.module('blocks.exception', [
    'blocks.logger'
  ]);
})();

(function() {
  'use strict';

  angular.module('blocks.logger', []);
})();

(function() {
  'use strict';

  angular.module('blocks.multi-transclude', [
    'blocks.logger'
  ]);
})();

(function() {
  'use strict';

  angular.module('blocks.pub-sub', [
    'blocks.logger'
  ]);
})();

(function() {
  'use strict';

  angular.module('blocks.recursion', []);
})();

(function() {
  'use strict';

  angular.module('blocks.router', [
    'ui.router',
    'blocks.logger'
  ]);
})();

(function() {
  'use strict';

  angular.module('app.components', [
    'app.core',

    'ui.bootstrap',
    'patternfly'
  ]);
})();

(function() {
  'use strict';

  angular.module('app.config', []);
})();

(function() {
  'use strict';

  angular.module('app.core', [
    // Angular modules
    'ngAnimate',
    'ngSanitize',
    'ngMessages',

    // Blocks modules
    'blocks.exception',
    'blocks.logger',
    'blocks.router',
    'blocks.multi-transclude',
    'blocks.pub-sub',
    'blocks.bind-attrs',
    'blocks.directive-options',
    'blocks.recursion',

    'app.skin',
    'app.resources',
    'app.services',

    // Third party modules
    'ui.router',
    'base64'
  ]);
})();

(function() {
  'use strict';

  angular.module('app.resources', ['ngResource']);
})();

(function() {
  'use strict';

  angular.module('app.services', []);
})();

(function() {
  'use strict';

  var text = {
    app: {
      name: 'ManageIQ Self Service'
    },
    login: {
      brand: '<strong>ManageIQ</strong> Self Service'
    }
  };

  angular.module('app.skin', [])
    .value('Text', text)
    .config(configure);

  /** @ngInject */
  function configure(routerHelperProvider, exceptionHandlerProvider) {
    exceptionHandlerProvider.configure('[ManageIQ] ');
    routerHelperProvider.configure({docTitle: 'ManageIQ: '});
  }
})();

(function() {
  'use strict';

  angular.module('app.states', [
    'app.core',
    'app.components'
  ]);
})();

(function() {
  'use strict';

  angular.module('blocks.bind-attrs')
    .directive('bindAttrs', BindAttrsDirective);

  /** @ngInject */
  function BindAttrsDirective() {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element, attrs) {
      scope.$watch(attrs.bindAttrs, watch, true);

      function watch(value) {
        angular.forEach(value, set);
      }

      function set(value, key) {
        attrs.$set(key, value);
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('blocks.directive-options')
    .factory('DirectiveOptions', DirectiveOptionsFactory);

  /** @ngInject */
  function DirectiveOptionsFactory($interpolate) {
    var service = {
      load: load
    };

    var converters = {};

    converters[String] = stringConverter;
    converters[Number] = numberConverter;
    converters[Boolean] = booleanConverter;
    converters[RegExp] = regExpConverter;

    return service;

    function load(scope, attrs, options) {
      scope.options = {};

      angular.forEach(options, loadValues);

      function loadValues(value, key) {
        var type = value[0];
        var localDefault = value[1];
        var validator = value[2] || defaultValidator;
        var converter = converters[type];

        setValue(attrs[key] && $interpolate(attrs[key])(scope.$parent));

        function setValue(value) {
          scope.options[key] = value && validator(value) ? converter(value) : localDefault;
        }
      }
    }

    function stringConverter(value) {
      return value;
    }

    function numberConverter(value) {
      return parseInt(value, 10);
    }

    function booleanConverter(value) {
      return 'true' === value.toLowerCase();
    }

    function regExpConverter(value) {
      return new RegExp(value);
    }

    function defaultValidator() {
      return true;
    }
  }
})();

// Include in index.html so that app level exceptions are handled.
// Exclude from testRunner.html which should run exactly what it wants to run
(function() {
  'use strict';

  angular
    .module('blocks.exception')
    .provider('exceptionHandler', exceptionHandlerProvider)
    .config(config);

  /**
   * Must configure the exception handling
   * @return {[type]}
   */
  function exceptionHandlerProvider() {
    /* jshint validthis:true */
    this.config = {
      appErrorPrefix: undefined
    };

    this.configure = function(appErrorPrefix) {
      this.config.appErrorPrefix = appErrorPrefix;
    };

    this.$get = function() {
      return {config: this.config};
    };
  }

  config.$inject = ['$provide'];

  /**
   * Configure by setting an optional string value for appErrorPrefix.
   * Accessible via config.appErrorPrefix (via config value).
   * @param  {[type]} $provide
   * @return {[type]}
   * @ngInject
   */
  function config($provide) {
    $provide.decorator('$exceptionHandler', extendExceptionHandler);
  }

  extendExceptionHandler.$inject = ['$delegate', 'exceptionHandler', 'logger'];

  /**
   * Extend the $exceptionHandler service to also display a toast.
   * @param  {Object} $delegate
   * @param  {Object} exceptionHandler
   * @param  {Object} logger
   * @return {Function} the decorated $exceptionHandler service
   */
  function extendExceptionHandler($delegate, exceptionHandler, logger) {
    return function(exception, cause) {
      var appErrorPrefix = exceptionHandler.config.appErrorPrefix || '';
      var errorData = {exception: exception, cause: cause};
      exception.message = appErrorPrefix + exception.message;
      $delegate(exception, cause);
      /**
       * Could add the error to a service's collection,
       * add errors to $rootScope, log errors to remote web server,
       * or log locally. Or throw hard. It is entirely up to you.
       * throw exception;
       *
       * @example
       *     throw { message: 'error message we added' };
       */
      logger.error(exception.message, errorData);
    };
  }
})();

(function() {
  'use strict';

  angular.module('blocks.exception')
    .factory('exception', exception);

  /** @ngInject */
  function exception(logger) {
    var service = {
      catcher: catcher
    };

    return service;

    function catcher(message) {
      return function(reason) {
        logger.error(message, reason);
      };
    }
  }
})();

(function() {
  'use strict';

  angular.module('blocks.logger')
    .factory('logger', logger);

  /** @ngInject */
  function logger($log, toastr) {
    var service = {
      showToasts: true,

      error: error,
      info: info,
      success: success,
      warning: warning,

      // straight to console; bypass toastr
      log: $log.log
    };

    var options = {
      positionClass: 'toast-bottom-right'
    };

    return service;

    function error(message, data, title) {
      if (service.showToasts) {
        toastr.error(message, title, options);
      }
      $log.error('Error: ' + message, data);
    }

    function info(message, data, title) {
      if (service.showToasts) {
        toastr.info(message, title, options);
      }
      $log.info('Info: ' + message, data);
    }

    function success(message, data, title) {
      if (service.showToasts) {
        toastr.success(message, title, options);
      }
      $log.info('Success: ' + message, data);
    }

    function warning(message, data, title) {
      if (service.showToasts) {
        toastr.warning(message, title, options);
      }
      $log.warn('Warning: ' + message, data);
    }
  }
}());

(function() {
  'use strict';

  angular.module('blocks.multi-transclude')
    .factory('MultiTransclude', MultiTranscludeFactory);

  /** @ngInject */
  function MultiTranscludeFactory() {
    var service = {
      transclude: transclude
    };

    return service;

    function transclude(element, transcludeFn, removeEmptyTranscludeTargets) {
      transcludeFn(transcluder);

      if (!!removeEmptyTranscludeTargets) {
        removeEmptyTargets();
      }

      function transcluder(clone) {
        angular.forEach(clone, cloner);
      }

      /**
       * Transclude in content from transclude-to sources to transclude-id targets
       *
       * @param cloneEl
       */
      function cloner(cloneEl) {
        var $cloneEl = angular.element(cloneEl);
        var transcludeId = $cloneEl.attr('transclude-to');
        var selector = '[transclude-id="' + transcludeId + '"]';
        var target = element.find(selector);

        if (!transcludeId) {
          return;
        }
        if (target.length) {
          target.append($cloneEl);
        } else {
          $cloneEl.remove();
          throw new Error('`transclude-to="' + transcludeId + '"` target not found.');
        }
      }

      /**
       * Locate all transclude targets and check for children.
       */
      function removeEmptyTargets() {
        var targets = element.find('[transclude-id]');

        angular.forEach(targets, removeIfEmpty);
      }

      /**
       * Removes transclude targets that have no child elements or text.
       *
       * @param target Transclude target with transclude-id attribute
       */
      function removeIfEmpty(target) {
        var $target = angular.element(target);

        if (0 === $target.children().length) {
          $target.remove();
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('blocks.pub-sub')
    .factory('PubSub', PubSubFactory);

  /** @ngInject */
  function PubSubFactory(logger) {
    var service = {
      events: events
    };

    return service;

    function events() {
      return new PubSub();
    }

    function PubSub() {
      var self = this;

      var events = {};

      self.on = onEvent;
      self.trigger = triggerEvent;

      function onEvent(keys, handler) {
        if (!angular.isFunction(handler)) {
          logger.error('Handler for `' + keys + '` is not a function. `' + typeof handler + '`');

          return;
        }
        keys.split(' ').forEach(function(key) {
          if (!events[key]) {
            events[key] = [];
          }
          events[key].push(handler);
        });

        return self;
      }

      function triggerEvent(key, args) {
        var handlers = events[key] || [];

        handlers.every(handle);

        return self;

        function handle(handler) {
          var result = handler(args);

          return angular.isUndefined(result) ? true : result;
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('blocks.recursion')
    .factory('RecursionHelper', RecursionHelperFactory);

  /** @ngInject */
  function RecursionHelperFactory($compile) {
    var service = {
      compile: compile
    };

    return service;

    /**
     * Manually compiles the element, fixing the recursion loop.
     * @param element
     * @param [link] A post-link function, or an object with function(s) registered via pre and post properties.
     * @returns object An object containing the linking functions.
     */
    function compile(element, link) {
      // Break the recursion loop by removing the contents
      var contents = element.contents().remove();
      var compiledContents;

      // Normalize the link parameter
      if (angular.isFunction(link)) {
        link = {post: link};
      }

      return {
        pre: (link && link.pre) ? link.pre : null,
        post: post
      };

      /**
       * Compiles and re-adds the contents
       */
      function post(scope, element) {
        // Compile the contents
        if (!compiledContents) {
          compiledContents = $compile(contents);
        }
        // Re-add the compiled contents to the element
        compiledContents(scope, function(clone) {
          element.append(clone);
        });

        // Call the post-linking function, if any
        if (link && link.post) {
          link.post.apply(null, arguments);
        }
      }
    }
  }
})();

/* Help configure the state-base ui.router */
(function() {
  'use strict';

  angular.module('blocks.router')
    .provider('routerHelper', routerHelperProvider);

  /** @ngInject */
  function routerHelperProvider($locationProvider, $stateProvider, $urlRouterProvider, $injector) {
    /* jshint validthis:true */
    var config = {
      docTitle: undefined,
      resolveAlways: {}
    };

    var provider = {
      configure: configure,
      $get: RouterHelper
    };

    $locationProvider.html5Mode(true);

    return provider;

    function configure(cfg) {
      angular.extend(config, cfg);
    }

    /** @ngInject */
    function RouterHelper($location, $rootScope, $state, logger) {
      var handlingStateChangeError = false;
      var hasOtherwise = false;
      var stateCounts = {
        errors: 0,
        changes: 0
      };

      var service = {
        configureStates: configureStates,
        getStates: getStates,
        stateCounts: stateCounts
      };

      init();

      return service;

      function configureStates(states, otherwisePath) {
        angular.forEach(states, buildState);

        if (otherwisePath && !hasOtherwise) {
          hasOtherwise = true;
          $urlRouterProvider.otherwise(otherwisePath);
        }

        function buildState(stateConfig, state) {
          stateConfig.resolve = angular.extend(stateConfig.resolve || {}, config.resolveAlways);
          $stateProvider.state(state, stateConfig);
        }
      }

      function init() {
        // Route cancellation:
        // On routing error, go to the dashboard.
        // Provide an exit clause if it tries to do it twice.
        $rootScope.$on('$stateChangeError', handleRoutingErrors);
        $rootScope.$on('$stateChangeSuccess', updateTitle);
        // Hack in redirect to default children
        // Discussions: https://github.com/angular-ui/ui-router/issues/1235
        // https://github.com/angular-ui/ui-router/issues/27
        $rootScope.$on('$stateChangeStart', redirectTo);
      }

      function getStates() {
        return $state.get();
      }

      // Private

      function handleRoutingErrors(event, toState, toParams, fromState, fromParams, error) {
        var destination;
        var msg;

        if (handlingStateChangeError) {
          return;
        }
        stateCounts.errors++;
        handlingStateChangeError = true;
        destination = (toState && (toState.title || toState.name || toState.loadedTemplateUrl)) || 'unknown target';
        msg = 'Error routing to ' + destination + '. '
          + (error.data || '') + '. <br/>' + (error.statusText || '')
          + ': ' + (error.status || '');
        logger.warning(msg, [toState]);
        $location.path('/');
      }

      function updateTitle(event, toState) {
        stateCounts.changes++;
        handlingStateChangeError = false;
        $rootScope.title = config.docTitle + ' ' + (toState.title || ''); // data bind to <title>
      }

      function redirectTo(event, toState, toParams) {
        var redirect = toState.redirectTo;
        var newState;

        if (redirect) {
          if (angular.isString(redirect)) {
            event.preventDefault();
            $state.go(redirect, toParams);
          } else {
            newState = $injector.invoke(redirect, null, {toState: toState, toParams: toParams});
            if (newState) {
              if (angular.isString(newState)) {
                event.preventDefault();
                $state.go(newState);
              } else if (newState.state) {
                event.preventDefault();
                $state.go(newState.state, newState.params);
              }
            }
          }
        }
      }
    }
  }
})();

(function() {
  'use strict';

  /*
  A few browsers still in use today do not fully support HTML5s 'autofocus'.

  This directive is redundant for browsers that do but has no negative effects.
   */
  angular.module('app.components')
    .directive('autofocus', AutofocusDirective);

  /** @ngInject */
  function AutofocusDirective($timeout) {
    var directive = {
      restrict: 'A',
      link: link
    };

    return directive;

    function link(scope, element) {
      $timeout(setFocus, 1);

      function setFocus() {
        element[0].focus();
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('confirmation', ConfirmationDirective);

  /** @ngInject */
  function ConfirmationDirective($position, $window) {
    var directive = {
      restrict: 'AE',
      scope: {
        position: '@?confirmationPosition',
        title: '@?confirmationTitle',
        message: '@?confirmationMessage',
        trigger: '@?confirmationTrigger',
        ok: '@?confirmationOkText',
        cancel: '@?confirmationCancelText',
        onOk: '&confirmationOnOk',
        onCancel: '&?confirmationOnCancel',
        okStyle: '@?confirmationOkStyle',
        confirmIf: '=?confirmationIf',
        showCancel: '=?confirmationShowCancel'
      },
      link: link,
      controller: ConfirmationController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate({
        getOffset: getOffset,
        getPosition: getPosition,
        size: getSizeOfConfirmation()
      });

      element.on(attrs.confirmationTrigger || 'click', vm.onTrigger);

      function getOffset() {
        return $window.pageYOffset;
      }

      function getPosition() {
        return $position.offset(element);
      }

      // Private

      function getSizeOfConfirmation() {
        var height;
        var width;
        var sizerMessage = attrs.confirmationMessage || 'For Sizing';
        var sizer = angular.element('<div class="confirmation__dialog"><div class="confirmation__content">' +
          '<div class="confirmation__body"><p class="confirmation_message">' + sizerMessage +
          '</p><div class="confirmation_buttons">' +
          '<button type="button" class="confirmation__button btn-rounded">For Sizing</button>' +
          '</div></div></div></div>');

        sizer.css('visibility', 'hidden');
        element.parent().append(sizer);
        height = sizer.prop('offsetHeight');
        width = sizer.prop('offsetWidth');
        sizer.detach();

        return {
          height: height,
          width: width
        };
      }
    }

    /** @ngInject */
    function ConfirmationController($scope, $modal) {
      var vm = this;

      var modalOptions = {
        templateUrl: 'app/components/confirmation/confirmation.html',
        scope: $scope
      };

      vm.top = 0;
      vm.left = 0;

      vm.activate = activate;
      vm.onTrigger = onTrigger;

      function activate(api) {
        angular.extend(vm, api);
        vm.position = angular.isDefined(vm.position) ? vm.position : 'top-center';
        vm.title = angular.isDefined(vm.title) ? vm.title : false;
        vm.message = angular.isDefined(vm.message) ? vm.message : 'Are you sure you wish to proceed?';
        vm.ok = angular.isDefined(vm.ok) ? vm.ok : 'Ok';
        vm.cancel = angular.isDefined(vm.cancel) ? vm.cancel : 'Cancel';
        vm.onCancel = angular.isDefined(vm.onCancel) ? vm.onCancel : angular.noop;
        vm.okClass = angular.isDefined(vm.okStyle) ? 'btn-' + vm.okStyle : '';
        vm.confirmIf = angular.isDefined(vm.confirmIf) ? vm.confirmIf : true;
        vm.showCancel = angular.isDefined(vm.showCancel) ? vm.showCancel : true;
      }

      function onTrigger() {
        var position = getModalPosition();
        var modal;

        if (vm.confirmIf) {
          vm.left = position.left;
          vm.top = position.top - vm.getOffset();

          modal = $modal.open(modalOptions);
          modal.result.then(onOk, onCancel);
        } else {
          vm.onOk();
        }

        function onOk() {
          vm.onOk();
        }

        function onCancel() {
          vm.onCancel();
        }
      }

      // Grafted in from ui.bootstraps $position.positionElements()
      function getModalPosition() {
        var posParts = vm.position.split('-');
        var pos0 = posParts[0];
        var pos1 = posParts[1] || 'center';
        var hostElPos = vm.getPosition();
        var targetElPos = {};

        var targetElWidth = vm.size.width;
        var targetElHeight = vm.size.height;

        var shiftWidth = {
          center: widthCenter,
          left: widthLeft,
          right: widthRight
        };

        var shiftHeight = {
          center: heightCenter,
          top: heightTop,
          bottom: heightBottom
        };

        switch (pos0) {
          case 'right':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: shiftWidth[pos0]()
            };
            break;
          case 'left':
            targetElPos = {
              top: shiftHeight[pos1](),
              left: hostElPos.left - targetElWidth
            };
            break;
          case 'bottom':
            targetElPos = {
              top: shiftHeight[pos0](),
              left: shiftWidth[pos1]()
            };
            break;
          default:
            targetElPos = {
              top: hostElPos.top - targetElHeight,
              left: shiftWidth[pos1]()
            };
            break;
        }

        return targetElPos;

        function widthRight() {
          return hostElPos.left + hostElPos.width;
        }

        function widthLeft() {
          return hostElPos.left;
        }

        function widthCenter() {
          return hostElPos.left + hostElPos.width / 2 - targetElWidth / 2;
        }

        function heightBottom() {
          return hostElPos.top + hostElPos.height;
        }

        function heightTop() {
          return hostElPos.top;
        }

        function heightCenter() {
          return hostElPos.top + hostElPos.height / 2 - targetElHeight / 2;
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('customButton', CustomButtonDirective);

  /** @ngInject */
  function CustomButtonDirective($window, $timeout) {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {
        customActions: '=',
        actions: '=?'
      },
      link: link,
      templateUrl: 'app/components/custom-button/custom-button.html',
      controller: CustomButtonController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
      
      var win = angular.element($window);
      win.bind('resize', function() { 
        scope.$apply();
      });

      scope.$watch(getWindowWidth, function(newWidth, oldWidth) {
        if (newWidth !== oldWidth) {
          checkRoomForButtons();
        }
      });

      // Set inital button state
      checkRoomForButtons();

      function checkRoomForButtons() {
        // Allow the buttons to render to calculate width
        vm.collapseCustomButtons = false;

        $timeout(function() {
          var outerWidth = document.querySelectorAll('.ss-details-header__actions')[0].offsetWidth;
          var innerWidth = document.querySelectorAll('.ss-details-header__actions__inner')[0].offsetWidth;
          if (innerWidth >= outerWidth) {
            // Not enough room - collapse them down
            vm.collapseCustomButtons = true;
          }
        }, 0);
      }

      function getWindowWidth() {
        return win.width();
      }
    }

    /** @ngInject */
    function CustomButtonController(Notifications, CollectionsApi) {
      var vm = this;

      vm.activate = activate;
      vm.customButtonAction = customButtonAction;
      vm.collapseCustomButtons = false;

      function activate() {
        angular.forEach(vm.actions, processActionButtons);
      }

      function processActionButtons(buttonAction) {
        var temp = buttonAction.href.split('/api/')[1];
        buttonAction.collection = temp.split('/')[0];
        buttonAction.id = temp.split('/')[1];
      }

      function customButtonAction(button) {
        var assignedButton = {};
        angular.forEach(vm.actions, actionButtonMapping);

        if (assignedButton.method === 'post') {
          var data = {action: button.name};
          CollectionsApi.post(assignedButton.collection, assignedButton.id, {}, data).then(postSuccess, postFailure);
        } else if (assignedButton.method === 'delete') {
          CollectionsApi.delete(assignedButton.collection, assignedButton.id, {}).then(deleteSuccess, deleteFailure);
        } else {
          Notifications.error('Button action not supported.');
        }

        // Private functions
        function actionButtonMapping(buttonMatched) {
          if (buttonMatched.name.toLowerCase() === button.name.toLowerCase()) {
            assignedButton = buttonMatched;
          }
        }

        function postSuccess(response) {
          if (response.success === false) {
            Notifications.error(response.message);
          } else {
            Notifications.success(response.message);
          }
        }

        function postFailure() {
          Notifications.error('Action not able to submit.');
        }

        function deleteSuccess(response) {
          if (response.success === false) {
            Notifications.error(response.message);
          } else {
            Notifications.success(response.message);
          }
        }

        function deleteFailure() {
          Notifications.error('Action not able to submit.');
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('dialogContent', DialogContentDirective);

  /** @ngInject */
  function DialogContentDirective() {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {
        dialog: '=',
        options: '=?',
        inputDisabled: '=?'
      },
      link: link,
      templateUrl: 'app/components/dialog-content/dialog-content.html',
      controller: DialogContentController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
    }

    /** @ngInject */
    function DialogContentController(API_BASE, lodash) {
      var vm = this;
      vm.parsedOptions = {};
      vm.activate = activate;
      vm.dateOptions = {
        autoclose: true,
        todayBtn: 'linked',
        todayHighlight: true
      };
      vm.supportedDialog = true;
      vm.API_BASE = API_BASE;

      function activate() {
        if (vm.options) {
          angular.forEach(vm.options, parseOptions);
        }
        if (angular.isDefined(vm.dialog)) {
          vm.dialog.dialog_tabs.forEach(iterateBGroups);
        }
      }

      // Private functions
      function parseOptions(value, key) {
        vm.parsedOptions[key.replace('dialog_', '')] = value;
      }

      function iterateBGroups(item) {
        item.dialog_groups.forEach(iterateBFields);
      }

      function iterateBFields(item) {
        if (lodash.result(lodash.find(item.dialog_fields, {'dynamic': true}), 'name') ||
        lodash.result(lodash.find(item.dialog_fields, {'type': 'DialogFieldTagControl'}), 'name')) {
          vm.supportedDialog = false;
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .factory('EditServiceModal', EditServiceFactory);

  /** @ngInject */
  function EditServiceFactory($modal) {
    var modalService = {
      showModal: showModal
    };

    return modalService;

    function showModal(serviceDetails) {
      var modalOptions = {
        templateUrl: 'app/components/edit-service-modal/edit-service-modal.html',
        controller: EditServiceModalController,
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
          serviceDetails: resolveServiceDetails
        }
      };
      var modal = $modal.open(modalOptions);

      return modal.result;

      function resolveServiceDetails() {
        return serviceDetails;
      }
    }
  }

  /** @ngInject */
  function EditServiceModalController(serviceDetails, $state, $modalInstance, CollectionsApi, Notifications) {
    var vm = this;

    vm.service = serviceDetails;
    vm.saveServiceDetails = saveServiceDetails;

    vm.modalData = {
      'action': 'edit',
      'resource': {
        'name': vm.service.name || '',
        'description': vm.service.description || ''
      }
    };

    activate();

    function activate() {
    }

    function saveServiceDetails() {
      CollectionsApi.post('services', vm.service.id, {}, vm.modalData).then(saveSuccess, saveFailure);

      function saveSuccess() {
        $modalInstance.close();
        Notifications.success(vm.service.name + ' was edited.');
        $state.go($state.current, {}, {reload: true});
      }

      function saveFailure() {
        Notifications.error('There was an error editing this service.');
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('footerContent', FooterContentDirective);

  /** @ngInject */
  function FooterContentDirective() {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {},
      link: link,
      templateUrl: 'app/components/footer/footer-content.html',
      controller: FooterController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
    }

    /** @ngInject */
    function FooterController(Navigation) {
      var vm = this;

      vm.activate = activate;
      vm.dateTime = new Date();

      function activate() {
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('mainContent', MainContentDirective);

  /** @ngInject */
  function MainContentDirective() {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {},
      link: link,
      templateUrl: 'app/components/main-content/main-content.html',
      controller: MainContentController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
    }

    /** @ngInject */
    function MainContentController(Navigation) {
      var vm = this;

      vm.activate = activate;

      function activate() {
        vm.state = Navigation.state;
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('headerNav', HeaderNavDirective);

  /** @ngInject */
  function HeaderNavDirective() {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {},
      link: link,
      templateUrl: 'app/components/navigation/header-nav.html',
      controller: HeaderNavController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
    }

    /** @ngInject */
    function HeaderNavController(Text, Navigation, Messages, Session, API_BASE) {
      var vm = this;

      vm.text = Text.app;
      vm.user = Session.currentUser;

      vm.activate = activate;
      vm.toggleNavigation = toggleNavigation;
      vm.clearMessages = clearMessages;
      vm.API_BASE = API_BASE;

      function activate() {
        vm.messages = Messages.items;
      }

      function toggleNavigation() {
        if (!Navigation.state.isMobileNav) {
          Navigation.state.isCollapsed = !Navigation.state.isCollapsed;
          Navigation.state.forceCollapse = true;
        } else {
          Navigation.state.showMobileNav = !Navigation.state.showMobileNav;
        }
      }

      function clearMessages() {
        Messages.clear();
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('sidebarNav', SidebarNavDirective);

  /** @ngInject */
  function SidebarNavDirective() {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {},
      link: link,
      templateUrl: 'app/components/navigation/sidebar-nav.html',
      controller: SidebarNavController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
    }

    /** @ngInject */
    function SidebarNavController(Navigation) {
      var vm = this;

      vm.activate = activate;
      vm.navigate = navigate;

      function activate() {
        vm.state = Navigation.state;
        vm.items = Navigation.items;
      }

      function navigate(item) {
        Navigation.state.showMobileNav = false;
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .factory('RetireServiceModal', RetireServiceFactory);

  /** @ngInject */
  function RetireServiceFactory($modal) {
    var modalService = {
      showModal: showModal
    };

    return modalService;

    function showModal(serviceDetails) {
      var modalOptions = {
        templateUrl: 'app/components/retire-service-modal/retire-service-modal.html',
        controller: RetireServiceModalController,
        controllerAs: 'vm',
        size: 'lg',
        resolve: {
          serviceDetails: resolveServiceDetails
        }
      };
      var modal = $modal.open(modalOptions);

      return modal.result;

      function resolveServiceDetails() {
        return serviceDetails;
      }
    }
  }

  /** @ngInject */
  function RetireServiceModalController(serviceDetails, $state, $modalInstance, CollectionsApi, Notifications) {
    var vm = this;

    vm.service = serviceDetails;
    vm.retireService = retireService;
    var existingDate = new Date(vm.service.retires_on);
    var existingUTCDate = new Date(existingDate.getTime() + existingDate.getTimezoneOffset() * 60000);
    vm.modalData = {
      action: 'retire',
      resource: {
        date: vm.service.retires_on ? existingUTCDate : new Date(),
        warn: vm.service.retirement_warn || 0
      }
    };

    vm.dateOptions = {
      autoclose: true,
      todayBtn: 'linked',
      todayHighlight: true
    };

    activate();

    function activate() {
    }

    function retireService() {
      CollectionsApi.post('services', vm.service.id, {}, vm.modalData).then(retireSuccess, retireFailure);

      function retireSuccess() {
        $modalInstance.close();
        Notifications.success('Scheduling retirement for' + vm.service.name  + '.');
        $state.go($state.current, {}, {reload: true});
      }

      function retireFailure() {
        Notifications.error('There was an error retiring this service.');
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .directive('ssCard', SsCardDirective);

  /** @ngInject */
  function SsCardDirective() {
    var directive = {
      restrict: 'AE',
      replace: true,
      scope: {
        title: '@heading',
        description: '@',
        more: '@',
        img: '@?'
      },
      link: link,
      templateUrl: 'app/components/ss-card/ss-card.html',
      controller: SsCardController,
      controllerAs: 'vm',
      bindToController: true
    };

    return directive;

    function link(scope, element, attrs, vm, transclude) {
      vm.activate();
    }

    /** @ngInject */
    function SsCardController() {
      var vm = this;

      vm.activate = activate;

      function activate() {
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.components')
    .factory('Toasts', ToastsFactory);

  /** @ngInject */
  function ToastsFactory(toastr) {
    var service = {
      toast: toast,
      info: info,
      success: success,
      error: error,
      warning: warning
    };

    var defaults = {
      containerId: 'toasts__container',
      positionClass: 'toasts--top-center',
      // Timing
      extendedTimeOut: 1000,
      timeOut: 5000,
      showDuration: 500,
      hideDuration: 500,
      // Classes
      toastClass: 'toasts',
      titleClass: 'toasts__title',
      messageClass: 'toasts__message'
    };

    return service;

    function toast(message, title, options) {
      toastr.info(message, title, angular.extend({}, defaults, options || {iconClass: 'toasts--default'}));
    }

    function info(message, title, options) {
      toastr.info(message, title, angular.extend({}, defaults, options || {iconClass: 'toasts--info'}));
    }

    function success(message, title, options) {
      toastr.success(message, title, angular.extend({}, defaults, options || {iconClass: 'toasts--success'}));
    }

    function error(message, title, options) {
      toastr.error(message, title, angular.extend({}, defaults, options || {iconClass: 'toasts--danger'}));
    }

    function warning(message, title, options) {
      toastr.warning(message, title, angular.extend({}, defaults, options || {iconClass: 'toasts--warning'}));
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.config')
    .constant('API_BASE', location.protocol + '//' + location.host)
    .constant('API_LOGIN', '')
    .constant('API_PASSWORD', '');
})();

(function() {
  'use strict';

  angular.module('app.services')
    .config(configure)
    .run(init);

  /** @ngInject */
  function configure($httpProvider) {
    $httpProvider.interceptors.push(interceptor);

    /** @ngInject */
    function interceptor($injector, $q) {
      return {
        response: response,
        responseError: responseError
      };

      function response(res) {
        if (401 === res.status) {
          endSession();

          return $q.reject(res);
        }

        return $q.resolve(res);
      }

      function responseError(rej) {
        if (401 === rej.status) {
          endSession();

          return $q.reject(rej);
        }

        return $q.reject(rej);
      }

      function endSession() {
        var $state = $injector.get('$state');

        if ('login' !== $state.current.name) {
          $injector.get('Notifications').message('danger', '', 'Your session has timed out.', true);
          $injector.get('Session').destroy();
          $state.go('login');
        }
      }
    }
  }

  /** @ngInject */
  function init($rootScope, $state, Session, jQuery) {
    $rootScope.$on('$stateChangeStart', changeStart);
    $rootScope.$on('$stateChangeError', changeError);
    $rootScope.$on('$stateChangeSuccess', changeSuccess);

    function changeStart(event, toState, toParams, fromState, fromParams) {
      if (toState.data && !toState.data.requireUser) {
        return;
      }

      if (!Session.active()) {
        event.preventDefault();
        $state.transitionTo('login');
      }
    }

    function changeError(event, toState, toParams, fromState, fromParams, error) {
      // If a 401 is encountered during a state change, then kick the user back to the login
      if (401 === error.status) {
        event.preventDefault();
        if (Session.active()) {
          $state.transitionTo('logout');
        } else if ('login' !== toState.name) {
          $state.transitionTo('login');
        }
      }
    }

    function changeSuccess() {
      jQuery('html, body').animate({scrollTop: 0}, 200);
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.config')
    .run(init);

  /** @ngInject */
  function init(routerHelper) {
    routerHelper.configureStates(getLayouts());
  }

  function getLayouts() {
    return {
      'blank': {
        abstract: true,
        templateUrl: 'app/layouts/blank.html'
      },
      'application': {
        abstract: true,
        templateUrl: 'app/layouts/application.html',
        onEnter: enterApplication,
        onExit: exitApplication
      }
    };
  }

  /** @ngInject */
  function enterApplication(Polling, NavCounts) {
    // Application layout displays the navigation which might have items that require polling to update the counts
    angular.forEach(NavCounts.counts, updateCount);

    function updateCount(count, key) {
      count.func();
      if (count.interval) {
        Polling.start(key, count.func, count.interval);
      }
    }
  }

  /** @ngInject */
  function exitApplication(lodash, Polling, NavCounts) {
    // Remove all of the navigation polls
    angular.forEach(lodash.keys(NavCounts.counts), Polling.stop);
  }
})();

(function() {
  'use strict';

  angular.module('app.config')
    .config(navigation)
    .run(init);

  /** @ngInject */
  function navigation(NavigationProvider) {
    NavigationProvider.configure({
      items: {
        primary: {
          dashboard: {
            title: 'Dashboard',
            state: 'dashboard',
            icon: 'fa fa-dashboard'
          },
          services: {
            title: 'My Services',
            state: 'services',
            icon: 'fa fa-file-o',
            tooltip: 'The total number of services that you have ordered, both active and retired'
          },
          requests: {
            title: 'My Requests',
            state: 'requests',
            icon: 'fa fa-file-text-o',
            tooltip: 'The total number of requests that you have submitted'
          },
          marketplace: {
            title: 'Service Catalog',
            state: 'marketplace',
            icon: 'fa fa-copy',
            tooltip: 'The total number of available catalog items'
          }
        },
        secondary: {
        }
      }
    });
  }

  /** @ngInject */
  function init(lodash, CollectionsApi, Navigation, NavCounts) {
    NavCounts.add('services', fetchServices, 60 * 1000);
    NavCounts.add('requests', fetchRequests, 60 * 1000);
    NavCounts.add('marketplace', fetchServiceTemplates, 60 * 1000);

    function fetchRequests() {
      CollectionsApi.query('service_requests').then(lodash.partial(updateCount, 'requests'));
    }

    function fetchServices() {
      var options = {expand: false, filter: ['service_id>0'] };
      CollectionsApi.query('services', options).then(lodash.partial(updateServicesCount, 'services'));
    }

    function fetchServiceTemplates() {
      var options = {expand: false, filter: ['service_template_catalog_id>0', 'display=true'] };
      CollectionsApi.query('service_templates', options).then(
        lodash.partial(updateServiceTemplatesCount, 'marketplace'));
    }

    function updateCount(item, data) {
      Navigation.items.primary[item].count = data.count;
    }

    function updateServicesCount(item, data) {
      Navigation.items.primary[item].count = data.count - data.subcount;
    }

    function updateServiceTemplatesCount(item, data) {
      Navigation.items.primary[item].count = data.subcount;
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.core')
    .config(configure)
    .run(init);

  /** @ngInject */
  function configure($logProvider, $compileProvider) {
    $logProvider.debugEnabled(true);
    $compileProvider.debugInfoEnabled(false);
  }

  /** @ngInject */
  function init(logger) {
    logger.showToasts = false;
  }
})();

/* global toastr:false, moment:false, _:false, $:false */
(function() {
  'use strict';

  angular.module('app.core')
    .constant('lodash', _)
    .constant('jQuery', $)
    .constant('toastr', toastr)
    .constant('moment', moment);
})();

(function() {
  'use strict';
  angular.module('app.services').filter('formatBytes', function() {
    return function(bytes) {
      if (bytes === 0) {
        return '0 Bytes';
      }
      if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) {
        return '-';
      }
      var availableUnits = ['Bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
      var unit = Math.floor(Math.log(bytes) / Math.log(1024));
      var val = (bytes / Math.pow(1024, Math.floor(unit))).toFixed(1);

      return (val.match(/\.0*$/) ? val.substr(0, val.indexOf('.')) : val) + ' ' + availableUnits[unit];
    };
  });
})();

(function() {
  'use strict';

  var text = {
    app: {
      name: 'Red Hat CloudForms Management Engine Self Service'
    },
    login: {
      brand: '<strong>Red Hat CloudForms Management Engine</strong> Self Service'
    }
  };

  angular.module('app.skin', [])
    .constant('Text', text)
    .config(configure);

  /** @ngInject */
  function configure(routerHelperProvider, exceptionHandlerProvider) {
    exceptionHandlerProvider.configure('[Red Hat CloudForms Management Engine] ');
    routerHelperProvider.configure({docTitle: 'Red Hat CloudForms Management Engine: '});
  }
})();

(function() {
  'use strict';

  angular.module('app.resources')
    .factory('AuthenticationApi', AuthenticationApiFactory);

  /** @ngInject */
  function AuthenticationApiFactory($http, $base64, API_BASE, Session, Notifications) {
    var service = {
      login: login
    };

    return service;

    function login(userLogin, password) {
      return $http.get(API_BASE + '/api/auth?requester_type=ui', {
        headers: {
          'Authorization': 'Basic ' + $base64.encode([userLogin, password].join(':')),
          'X-Auth-Token': void 0
        }
      }).then(loginSuccess, loginFailure);

      function loginSuccess(response) {
        Session.create(response.data);
      }

      function loginFailure(response) {
        Session.destroy();
        Notifications.message('danger', '', 'Incorrect username or password.', false);

        return response;
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.resources')
    .factory('CollectionsApi', CollectionsApiFactory);

  /** @ngInject */
  function CollectionsApiFactory($http, API_BASE) {
    var service = {
      query: query,
      get: get,
      post: post
    };

    return service;

    function query(collection, options) {
      var url = API_BASE + '/api/' + collection;

      return $http.get(url + buildQuery(options)).then(handleSuccess);

      function handleSuccess(response) {
        return response.data;
      }
    }

    function get(collection, id, options) {
      var url = API_BASE + '/api/' + collection + '/' + id;

      return $http.get(url + buildQuery(options)).then(handleSuccess);

      function handleSuccess(response) {
        return response.data;
      }
    }

    function post(collection, id, options, data) {
      var url = API_BASE + '/api/' + collection + '/' + id + buildQuery(options);

      return $http.post(url, data).then(handleSuccess);

      function handleSuccess(response) {
        return response.data;
      }
    }

    // Private

    function buildQuery(options) {
      var params = [];

      options = options || {};

      if (options.expand) {
        params.push('expand=' + options.expand);
      }

      if (options.attributes) {
        if (angular.isArray(options.attributes)) {
          options.attributes = options.attributes.join(',');
        }
        params.push('attributes=' + options.attributes);
      }

      if (options.filter) {
        angular.forEach(options.filter, function(filter) {
          params.push('filter[]=' + filter);
        });
      }

      if (0 < params.length) {
        return '?' + params.join('&');
      }

      return '';
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .factory('MarketplaceState', MarketplaceStateFactory);

  /** @ngInject */
  function MarketplaceStateFactory() {
    var service = {};   
    
    service.filters = [];

    service.setFilters = function(filterArray) {
      service.filters = filterArray;
    };

    service.getFilters = function() {
      return service.filters;
    };

    return service;
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .factory('Messages', MessagesFactory);

  /** @ngInject */
  function MessagesFactory() {
    var model = {
      messages: []
    };

    var service = {
      items: model.messages,
      clear: clear
    };

    init();

    return service;

    function clear() {
      model.messages.length = 0;
    }

    // Private

    function init() {
      // TODO perhaps use $timeout to fetch new notifications from the server
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .factory('NavCounts', NavCountsFactory);

  /** @ngInject */
  function NavCountsFactory() {
    var counts = {};

    var service = {
      add: add,
      counts: counts
    };

    return service;

    function add(key, func, interval) {
      if (!counts[key]) {
        counts[key] = {
          func: func,
          interval: interval
        };
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .provider('Navigation', NavigationProvider);

  /** @ngInject */
  function NavigationProvider() {
    var provider = {
      $get: Navigation,
      configure: configure
    };

    var model = {
      resizeThrottle: 150,
      breakpoints: {
        tablet: 768,
        desktop: 1024
      },
      items: {
        primary: {},
        secondary: {}
      },
      state: {
        isCollapsed: false,
        forceCollapse: false,
        showMobileNav: false,
        isMobileNav: false
      }
    };

    return provider;

    function configure(value) {
      angular.extend(model, value);
    }

    /** @ngInject */
    function Navigation($rootScope, $window, lodash) {
      var service = {
        items: model.items,
        state: model.state
      };
      var win;

      init();

      return service;

      // Private
      function init() {
        win = angular.element($window);
        // Throttle firing of resize checks to reduce application digests
        win.bind('resize', lodash.throttle(onResize, model.resizeThrottle));
        $rootScope.$watch(windowWidth, processWindowWidth, true);
        // Set the initial state
        processWindowWidth(null, win.width());
      }

      function onResize() {
        $rootScope.$apply();
      }

      function windowWidth() {
        return $window.innerWidth;
      }

      function processWindowWidth(oldValue, newValue) {
        var width = newValue;

        // Always remove the hidden & peek class
        model.state.isMobileNav = false;
        model.state.showMobileNav = false;

        // Force collapsed nav state based on developer state
        if (model.state.forceCollapse) {
          model.state.isCollapsed = true;
        } else {
          model.state.isCollapsed = width < model.breakpoints.desktop;
        }

        // Mobile state - must always hide
        if (width < model.breakpoints.tablet) {
          model.state.isMobileNav = true;
          model.state.isCollapsed = false;
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .factory('Polling', PollingFactory);

  /** @ngInject */
  function PollingFactory($interval, lodash) {
    var service = {
      start: start,
      stop: stop,
      stopAll: stopAll
    };

    var polls = {};

    return service;

    function start(key, func, interval, limit) {
      var poll;

      if (!polls[key]) {
        poll = $interval(func, interval, limit);
        polls[key] = poll;
      }
    }

    function stop(key) {
      if (polls[key]) {
        $interval.cancel(polls[key]);
        delete polls[key];
      }
    }

    function stopAll() {
      angular.forEach(lodash.keys(polls), stop);
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .factory('RequestsState', RequestsStateFactory);

  /** @ngInject */
  function RequestsStateFactory() {
    var service = {};   

    service.sort = {
      isAscending: false,
      currentField: { id: 'requested', title: 'Request Date', sortType: 'numeric' }
    };
    
    service.filters = [];

    service.setSort = function(currentField, isAscending) {
      service.sort.isAscending = isAscending;
      service.sort.currentField = currentField;
    };

    service.getSort = function() {
      return service.sort;
    };

    service.setFilters = function(filterArray) {
      service.filters = filterArray;
    };

    service.getFilters = function() {
      return service.filters;
    };

    return service;
  }
})();


(function() {
  'use strict';

  angular.module('app.services')
    .factory('ServicesState', ServicesStateFactory);

  /** @ngInject */
  function ServicesStateFactory() {
    var service = {};   

    service.sort = {
      isAscending: true,
      currentField: { id: 'name', title:  'Name', sortType: 'alpha' }
    };
    
    service.filters = [];

    service.setSort = function(currentField, isAscending) {
      service.sort.isAscending = isAscending;
      service.sort.currentField = currentField;
    };

    service.getSort = function() {
      return service.sort;
    };

    service.setFilters = function(filterArray) {
      service.filters = filterArray;
    };

    service.getFilters = function() {
      return service.filters;
    };

    return service;
  }
})();

(function() {
  'use strict';

  angular.module('app.services')
    .factory('Session', SessionFactory);

  /** @ngInject */
  function SessionFactory($http, moment) {
    var model = {
      token: null,
      expiresOn: moment().subtract(1, 'seconds'),
      user: {}
    };

    var service = {
      current: model,
      create: create,
      destroy: destroy,
      active: active,
      currentUser: currentUser
    };

    destroy();

    return service;

    function create(data) {
      model.token = data.auth_token;
      model.expiresOn = moment(data.expires_on);
      $http.defaults.headers.common['X-Auth-Token'] = model.token;
    }

    function destroy() {
      model.token = null;
      model.expiresOn = moment().subtract(1, 'seconds');
      model.user = {};
      delete $http.defaults.headers.common['X-Auth-Token'];
    }

    function currentUser(user) {
      if (angular.isDefined(user)) {
        model.user = user;
      }

      return model.user;
    }

    // Helpers

    function active() {
      return model.token && model.expiresOn.isAfter();
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    var otherwise = '/404';
    routerHelper.configureStates(getStates(), otherwise);
  }

  function getStates() {
    return {
      '404': {
        parent: 'blank',
        url: '/404',
        templateUrl: 'app/states/404/404.html',
        title: '404',
        data: {
          layout: 'blank'
        }
      }
    };
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'about-me': {
        parent: 'application',
        url: '/about-me',
        templateUrl: 'app/states/about-me/about-me.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'About Me'
      }
    };
  }

  /** @ngInject */
  function StateController() {
    var vm = this;

    vm.title = 'About Me';
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'dashboard': {
        parent: 'application',
        url: '/',
        templateUrl: 'app/states/dashboard/dashboard.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Dashboard',
        data: {
          requireUser: true
        },
        resolve: {
          definedServiceIdsServices: resolveServicesWithDefinedServiceIds,
          retiredServices: resolveRetiredServices,
          nonRetiredServices: resolveNonRetiredServices,
          expiringServices: resolveExpiringServices,
          pendingRequests: resolvePendingRequests,
          approvedRequests: resolveApprovedRequests,
          deniedRequests: resolveDeniedRequests
        }
      }
    };
  }

  /** @ngInject */
  function resolvePendingRequests(CollectionsApi) {
    var options = {expand: false, filter: ['approval_state=pending'] };

    return CollectionsApi.query('service_requests', options);
  }

  /** @ngInject */
  function resolveApprovedRequests(CollectionsApi) {
    var options = {expand: false, filter: ['approval_state=approved'] };

    return CollectionsApi.query('service_requests', options);
  }

  /** @ngInject */
  function resolveDeniedRequests(CollectionsApi) {
    var options = {expand: false, filter: ['approval_state=denied'] };

    return CollectionsApi.query('service_requests', options);
  }

  /** @ngInject */
  function resolveExpiringServices(CollectionsApi, $filter) {
    var currentDate = new Date();
    var date1 = 'retires_on>=' + $filter('date')(currentDate, 'yyyy-MM-dd');

    var days30 = currentDate.setDate(currentDate.getDate() + 30);
    var date2 = 'retires_on<=' + $filter('date')(days30, 'yyyy-MM-dd');
    var options = {expand: false, filter: [date1, date2]};

    return CollectionsApi.query('services', options);
  }

  /** @ngInject */
  function resolveRetiredServices(CollectionsApi) {
    var options = {expand: false, filter: ['retired=true'] };

    return CollectionsApi.query('services', options);
  }

  /** @ngInject */
  function resolveNonRetiredServices(CollectionsApi) {
    var options = {expand: false, filter: ['retired=false'] };

    return CollectionsApi.query('services', options);
  }

  /** @ngInject */
  function resolveServicesWithDefinedServiceIds(CollectionsApi) {
    var options = {expand: false, filter: ['service_id>0'] };

    return CollectionsApi.query('services', options);
  }

  /** @ngInject */
  function StateController($state, RequestsState, ServicesState, definedServiceIdsServices, retiredServices,
    nonRetiredServices, expiringServices, pendingRequests, approvedRequests, deniedRequests) {
    var vm = this;
    vm.servicesCount = {};
    vm.servicesCount.total = definedServiceIdsServices.count - definedServiceIdsServices.subcount;

    vm.servicesCount.current = definedServiceIdsServices.subcount === 0 ? nonRetiredServices.count :
      retiredServices.subcount + nonRetiredServices.subcount;

    vm.servicesCount.retired = vm.servicesCount.total - vm.servicesCount.current;

    vm.servicesCount.soon = expiringServices.subcount;

    vm.requestsCount = {};
    vm.requestsCount.total = pendingRequests.count;
    vm.requestsCount.pending = pendingRequests.subcount;
    vm.requestsCount.approved = approvedRequests.subcount;
    vm.requestsCount.denied = deniedRequests.subcount;

    vm.title = 'Dashboard';

    vm.navigateToRequestsList = function(filterValue) {
      RequestsState.setFilters([{'id': 'approval_state', 'title': 'Request Status', 'value': filterValue}]);
      $state.go('requests.list');
    };

    vm.navigateToServicesList = function(filterValue) {
      ServicesState.setFilters([{'id': 'retirement', 'title': 'Retirement Date', 'value': filterValue}]);
      $state.go('services.list');
    };
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    var otherwise = '/error';
    routerHelper.configureStates(getStates(), otherwise);
  }

  function getStates() {
    return {
      'error': {
        parent: 'blank',
        url: '/error',
        templateUrl: 'app/states/error/error.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Error',
        data: {
          layout: 'blank'
        },
        params: {
          error: null
        }
      }
    };
  }

  /** @ngInject */
  function StateController($stateParams) {
    var vm = this;

    vm.error = $stateParams.error;
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'help': {
        parent: 'application',
        url: '/',
        templateUrl: 'app/states/help/help.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Help'
      }
    };
  }

  /** @ngInject */
  function StateController() {
    var vm = this;

    vm.title = 'Help';
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'login': {
        parent: 'blank',
        url: '/login',
        templateUrl: 'app/states/login/login.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Login',
        data: {
          layout: 'blank'
        }
      }
    };
  }

  /** @ngInject */
  function StateController($state, Text, API_LOGIN, API_PASSWORD, AuthenticationApi, CollectionsApi, Session) {
    var vm = this;

    vm.title = 'Login';
    vm.text = Text.login;

    vm.credentials = {
      login: API_LOGIN,
      password: API_PASSWORD
    };

    vm.onSubmit = onSubmit;

    function onSubmit() {
      AuthenticationApi.login(vm.credentials.login, vm.credentials.password).then(handleSuccess);

      function handleSuccess() {
        var options = {expand: 'resources', filter: ['userid=' + vm.credentials.login]};

        CollectionsApi.query('users', options).then(handleUserInfo);
        $state.go('dashboard');

        function handleUserInfo(data) {
          if (!data.resources || 0 === data.resources.length) {
            return Session.currentUser({name: 'Unknown User', email: ''});
          }

          Session.currentUser({name: data.resources[0].name, email: data.resources[0].email});
        }
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'logout': {
        url: '/logout',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Logout'
      }
    };
  }

  /** @ngInject */
  function StateController($state, Session) {
    var vm = this;

    vm.title = 'Logout';

    activate();

    function activate() {
      Session.destroy();
      $state.go('login');
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'marketplace.details': {
        url: '/:serviceTemplateId',
        templateUrl: 'app/states/marketplace/details/details.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Service Template Details',
        resolve: {
          dialogs: resolveDialogs,
          serviceTemplate: resolveServiceTemplate
        }
      }
    };
  }

  /** @ngInject */
  function resolveServiceTemplate($stateParams, CollectionsApi) {
    var options = {attributes: ['picture', 'picture.image_href']};

    return CollectionsApi.get('service_templates', $stateParams.serviceTemplateId, options);
  }

  /** @ngInject */
  function resolveDialogs($stateParams, CollectionsApi) {
    var options = {expand: 'resources', attributes: 'content'};

    return CollectionsApi.query('service_templates/' + $stateParams.serviceTemplateId + '/service_dialogs', options);
  }

  /** @ngInject */
  function StateController($state, CollectionsApi, dialogs, serviceTemplate, Notifications) {
    var vm = this;

    vm.title = 'Service Template Details';
    vm.serviceTemplate = serviceTemplate;

    if (dialogs.subcount > 0) {
      vm.dialogs = dialogs.resources[0].content;
    }

    vm.submitDialog = submitDialog;

    function submitDialog() {
      var dialogFieldData = {
        href: '/api/service_templates/' + serviceTemplate.id
      };

      angular.forEach(vm.dialogs, function(dialog) {
        angular.forEach(dialog.dialog_tabs, function(dialogTab) {
          angular.forEach(dialogTab.dialog_groups, function(dialogGroup) {
            angular.forEach(dialogGroup.dialog_fields, function(dialogField) {
              dialogFieldData[dialogField.name] = dialogField.default_value;
            });
          });
        });
      });

      CollectionsApi.post(
        'service_catalogs/' + serviceTemplate.service_template_catalog_id + '/service_templates',
        serviceTemplate.id,
        {},
        JSON.stringify({action: 'order', resource: dialogFieldData})
      ).then(submitSuccess, submitFailure);

      function submitSuccess(result) {
        Notifications.success(result.message);
        $state.go('requests.list');
      }

      function submitFailure(result) {
        Notifications.error('There was an error submitting this request: ' + result);
      }
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'marketplace.list': {
        url: '',
        templateUrl: 'app/states/marketplace/list/list.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Service Catalog',
        resolve: {
          serviceTemplates: resolveServiceTemplates
        }
      }
    };
  }

  /** @ngInject */
  function resolveServiceTemplates(CollectionsApi) {
    var attributes = ['picture', 'picture.image_href', 'service_template_catalog.name'];
    var options = {expand: 'resources',
                   filter: ['service_template_catalog_id>0', 'display=true'],
                   attributes: attributes};

    return CollectionsApi.query('service_templates', options);
  }

  /** @ngInject */
  function StateController($state, serviceTemplates, MarketplaceState) {
    var vm = this;

    vm.title = 'Service Catalog';
    vm.serviceTemplates = serviceTemplates.resources;
    vm.serviceTemplatesList = angular.copy(vm.serviceTemplates);

    vm.showDetails = showDetails;

    function showDetails(template) {
      $state.go('marketplace.details', {serviceTemplateId: template});
    }

    function addCategoryFilter(item) {
      if (angular.isDefined(item.service_template_catalog) 
        && angular.isDefined(item.service_template_catalog.name)
        && categoryNames.indexOf(item.service_template_catalog.name) === -1) {
        categoryNames.push(item.service_template_catalog.name); 
      }
    }

    var categoryNames = [];
    angular.forEach(vm.serviceTemplates, addCategoryFilter);

    vm.toolbarConfig = {
      filterConfig: {
        fields: [
          {
            id: 'template_name',
            title: 'Service Name',
            placeholder: 'Filter by Name',
            filterType: 'text'
          },
          {
            id: 'template_description',
            title: 'Service Description',
            placeholder: 'Filter by Description',
            filterType: 'text'
          },
          {
            id: 'catalog_name',
            title: 'Catalog Name',
            placeholder: 'Filter by Catalog Name',
            filterType: 'select',
            filterValues: categoryNames
          }
        ],
        resultsCount: vm.serviceTemplatesList.length,
        appliedFilters: MarketplaceState.getFilters(),
        onFilterChange: filterChange
      }
    };

    /* Apply the filtering to the data list */
    filterChange(MarketplaceState.getFilters());

    function filterChange(filters) {
      vm.filtersText = '';
      angular.forEach(filters, filterTextFactory);

      function filterTextFactory(filter) {
        vm.filtersText += filter.title + ' : ' + filter.value + '\n';
      }

      applyFilters(filters);
      vm.toolbarConfig.filterConfig.resultsCount = vm.serviceTemplatesList.length;
    }

    function applyFilters(filters) {
      vm.serviceTemplatesList = [];
      if (filters && filters.length > 0) {
        angular.forEach(vm.serviceTemplates, filterChecker);
      } else {
        vm.serviceTemplatesList = vm.serviceTemplates;
      }

      /* Keep track of the current filtering state */
      MarketplaceState.setFilters(filters);

      /* Apply Default Sorting */
      vm.serviceTemplatesList.sort(compareFn);

      function filterChecker(item) {
        if (matchesFilters(item, filters)) {
          vm.serviceTemplatesList.push(item);
        }
      }
    }

    function matchesFilters(item, filters) {
      var matches = true;
      angular.forEach(filters, filterMatcher);

      function filterMatcher(filter) {
        if (!matchesFilter(item, filter)) {
          matches = false;

          return false;
        }
      }
      
      return matches;
    }

    function matchesFilter(item, filter) {
      var match = false;
      if (filter.id === 'template_name') {
        match = (String(item.name).toLowerCase().indexOf(String(filter.value).toLowerCase()) > -1 );
      } else if (filter.id === 'template_description') {
        match = (String(item.long_description).toLowerCase().indexOf(String(filter.value).toLowerCase()) > -1 );
      } else if (filter.id === 'catalog_name' && angular.isDefined(item.service_template_catalog) ) {
        match = item.service_template_catalog.name === filter.value;
      }

      return match;
    }

    function compareFn(item1, item2) {
      var compValue = item1.name.localeCompare(item2.name);
      
      return compValue;
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'marketplace': {
        parent: 'application',
        url: '/marketplace',
        redirectTo: 'marketplace.list',
        template: '<ui-view></ui-view>'
      }
    };
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'products.details': {
        url: 'product/:productId',
        templateUrl: 'app/states/products/details/details.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Products Details'
      }
    };
  }

  /** @ngInject */
  function StateController(logger) {
    var vm = this;

    vm.title = 'Service Details';

    vm.activate = activate;

    activate();

    function activate() {
      logger.info('Activated Products Details View');
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'products': {
        url: '/',
        redirectTo: 'marketplace',
        template: '<ui-view></ui-view>'
      }
    };
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'requests.details': {
        url: '/:requestId',
        templateUrl: 'app/states/requests/details/details.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Requests Details',
        resolve: {
          request: resolveRequest
        }
      }
    };
  }

  /** @ngInject */
  function resolveRequest($stateParams, CollectionsApi) {
    var options = {attributes: ['provision_dialog', 'picture', 'picture.image_href']};

    return CollectionsApi.get('service_requests', $stateParams.requestId, options);
  }

  /** @ngInject */
  function StateController(request) {
    var vm = this;

    vm.title = 'Service Template Details';
    vm.request = request;
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'requests.list': {
        url: '',
        templateUrl: 'app/states/requests/list/list.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Request List',
        resolve: {
          requests: resolveRequests
        }
      }
    };
  }

  /** @ngInject */
  function resolveRequests(CollectionsApi) {
    var attributes = ['picture', 'picture.image_href', 'approval_state', 'created_on', 'description'];
    var options = {expand: 'resources', attributes: attributes};

    return CollectionsApi.query('service_requests', options);
  }

  /** @ngInject */
  function StateController($state, requests, RequestsState, $filter) {
    var vm = this;

    vm.title = 'Request List';
    vm.requests = requests.resources;
    vm.requestsList = angular.copy(vm.requests);

    vm.listConfig = {
      selectItems: false,
      showSelectBox: false,
      selectionMatchProp: 'request_status',
      onClick: handleClick
    };

    vm.toolbarConfig = {
      filterConfig: {
        fields: [
           {
            id: 'description',
            title:  'Description',
            placeholder: 'Filter by Description',
            filterType: 'text'
          },
          {
            id: 'request_id',
            title: 'Request ID',
            placeholder: 'Filter by ID',
            filterType: 'text'
          },
          {
            id: 'request_date',
            title: 'Request Date',
            placeholder: 'Filter by Request Date',
            filterType: 'text'
          },
          {
            id: 'approval_state',
            title: 'Request Status',
            placeholder: 'Filter by Status',
            filterType: 'select',
            filterValues: ['Pending', 'Denied', 'Approved']
          }
        ],
        resultsCount: vm.requestsList.length,
        appliedFilters: RequestsState.getFilters(),
        onFilterChange: filterChange
      },
      sortConfig: {
        fields: [
          {
            id: 'description',
            title: 'Description',
            sortType: 'alpha'
          },
          {
            id: 'id',
            title: 'Request ID',
            sortType: 'numeric'
          },
          {
            id: 'requested',
            title: 'Request Date',
            sortType: 'numeric'
          },
          {
            id: 'status',
            title: 'Request Status',
            sortType: 'alpha'
          }
        ],
        onSortChange: sortChange,
        isAscending: RequestsState.getSort().isAscending,
        currentField: RequestsState.getSort().currentField
      }
    };

    /* Apply the filtering to the data list */
    filterChange(RequestsState.getFilters());

    function handleClick(item, e) {
      $state.go('requests.details', {requestId: item.id});
    }

    function sortChange(sortId, direction) {
      vm.requestsList.sort(compareFn);

      /* Keep track of the current sorting state */
      RequestsState.setSort(sortId, vm.toolbarConfig.sortConfig.isAscending);
    }

    function compareFn(item1, item2) {
      var compValue = 0;
      if (vm.toolbarConfig.sortConfig.currentField.id === 'description') {
        compValue = item1.description.localeCompare(item2.description);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'id') {
        compValue = item1.id - item2.id;
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'requested') {
        compValue = new Date(item1.created_on) - new Date(item2.created_on);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'status') {
        compValue = item1.approval_state.localeCompare(item2.approval_state);
      }

      if (!vm.toolbarConfig.sortConfig.isAscending) {
        compValue = compValue * -1;
      }

      return compValue;
    }

    function filterChange(filters) {
      vm.filtersText = '';
      angular.forEach(filters, filterTextFactory);

      function filterTextFactory(filter) {
        vm.filtersText += filter.title + ' : ' + filter.value + '\n';
      }

      applyFilters(filters);
      vm.toolbarConfig.filterConfig.resultsCount = vm.requestsList.length;
    }

    function applyFilters(filters) {
      vm.requestsList = [];
      if (filters && filters.length > 0) {
        angular.forEach(vm.requests, filterChecker);
      } else {
        vm.requestsList = vm.requests;
      }

      /* Keep track of the current filtering state */
      RequestsState.setFilters(filters);

      /* Make sure sorting direction is maintained */
      sortChange(RequestsState.getSort().currentField, RequestsState.getSort().isAscending);

      function filterChecker(item) {
        if (matchesFilters(item, filters)) {
          vm.requestsList.push(item);
        }
      }
    }

    function matchesFilters(item, filters) {
      var matches = true;
      angular.forEach(filters, filterMatcher);

      function filterMatcher(filter) {
        if (!matchesFilter(item, filter)) {
          matches = false;

          return false;
        }
      }

      return matches;
    }

    function matchesFilter(item, filter) {
      if ('description' === filter.id) {
        return item.description.toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if (filter.id === 'approval_state') {
        return item.approval_state.toLowerCase() === filter.value.toLowerCase();
      } else if (filter.id === 'request_id') {
        return String(item.id).toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if ('request_date' === filter.id) {
        return $filter('date')(item.created_on).toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      }

      return false;
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'requests': {
        parent: 'application',
        url: '/requests',
        redirectTo: 'requests.list',
        template: '<ui-view></ui-view>'
      }
    };
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'services.details': {
        url: '/:serviceId',
        templateUrl: 'app/states/services/details/details.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Service Details',
        resolve: {
          service: resolveService
        }
      }
    };
  }

  /** @ngInject */
  function resolveService($stateParams, CollectionsApi) {
    var requestAttributes = [
      'picture', 
      'picture.image_href',
      'evm_owner.name',
      'miq_group.description',
      'vms',
      'aggregate_all_vm_cpus',
      'aggregate_all_vm_memory',
      'aggregate_all_vm_disk_count',
      'aggregate_all_vm_disk_space_allocated',
      'aggregate_all_vm_disk_space_used',
      'aggregate_all_vm_memory_on_disk',
      'actions',
      'custom_actions',
      'provision_dialog'
    ];
    var options = {attributes: requestAttributes};

    return CollectionsApi.get('services', $stateParams.serviceId, options);
  }

  /** @ngInject */
  function StateController($state, service, CollectionsApi, EditServiceModal, RetireServiceModal, Notifications) {
    var vm = this;

    vm.title = 'Service Details';
    vm.service = service;

    vm.activate = activate;
    vm.removeService = removeService;
    vm.editServiceModal = editServieModal;
    vm.retireServiceNow = retireServiceNow;
    vm.retireServiceLater = retireServiceLater;

    vm.listConfig = {
      selectItems: false,
      showSelectBox: false
    };

    activate();

    function activate() {
    }

    function removeService() {
      var removeAction = {action: 'retire'};
      CollectionsApi.post('services', vm.service.id, {}, removeAction).then(removeSuccess, removeFailure);

      function removeSuccess() {
        Notifications.success(vm.service.name + ' was removed.');
        $state.go('services.list');
      }

      function removeFailure(data) {
        Notifications.error('There was an error removing this service.');
      }
    }

    function editServieModal() {
      EditServiceModal.showModal(vm.service);
    }

    function retireServiceNow() {
      var data = {action: 'retire'};
      CollectionsApi.post('services', vm.service.id, {}, data).then(retireSuccess, retireFailure);

      function retireSuccess() {
        Notifications.success(vm.service.name + ' was retired.');
        $state.go('services.list');
      }

      function retireFailure() {
        Notifications.error('There was an error retiring this service.');
      }
    }

    function retireServiceLater() {
      RetireServiceModal.showModal(vm.service);
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'services.list': {
        url: '', // No url, this state is the index of projects
        templateUrl: 'app/states/services/list/list.html',
        controller: StateController,
        controllerAs: 'vm',
        title: 'Service List',
        resolve: {
          services: resolveServices
        }
      }
    };
  }

  /** @ngInject */
  function resolveServices(CollectionsApi) {
    var options = {expand: 'resources', attributes: ['picture', 'picture.image_href', 'evm_owner.name', 'v_total_vms']};

    return CollectionsApi.query('services', options);
  }

  /** @ngInject */
  function StateController($state, services, ServicesState, $filter) {
    /* jshint validthis: true */
    var vm = this;

    vm.title = 'Service List';
    vm.services = [];
    angular.forEach(services.resources, function(item) {
      if (!angular.isDefined(item.service_id)) {
        vm.services.push(item);
      }
    });

    vm.servicesList = angular.copy(vm.services);

    vm.listConfig = {
      selectItems: false,
      showSelectBox: false,
      selectionMatchProp: 'service_status',
      onClick: handleClick
    };

    vm.toolbarConfig = {
      filterConfig: {
        fields: [
          {
            id: 'name',
            title: 'Service Name',
            placeholder: 'Filter by Service Name',
            filterType: 'text'
          },
          {
            id: 'retirement',
            title: 'Retirement Date',
            placeholder: 'Filter by Retirement Date',
            filterType: 'select',
            filterValues: ['Current', 'Soon', 'Retired']
          },
          {
            id: 'vms',
            title: 'Number of VMs',
            placeholder: 'Filter by VMs',
            filterType: 'text'
          },
          {
            id: 'owner',
            title: 'Owner',
            placeholder: 'Filter by Owner',
            filterType: 'text'
          },
          {
            id: 'created',
            title: 'Created',
            placeholder: 'Filter by Created On',
            filterType: 'text'
          }
        ],
        resultsCount: vm.servicesList.length,
        appliedFilters: ServicesState.getFilters(),
        onFilterChange: filterChange
      },
      sortConfig: {
        fields: [
          {
            id: 'name',
            title:  'Name',
            sortType: 'alpha'
          },
          {
            id: 'retires',
            title:  'Retirement Date',
            sortType: 'numeric'
          },
          {
            id: 'vms',
            title:  'Number of VMs',
            sortType: 'numeric'
          },
          {
            id: 'owner',
            title:  'Owner',
            sortType: 'alpha'
          },
          {
            id: 'created',
            title:  'Created',
            sortType: 'numeric'
          }
        ],
        onSortChange: sortChange,
        isAscending: ServicesState.getSort().isAscending,
        currentField: ServicesState.getSort().currentField
      }
    };

    /* Apply the filtering to the data list */
    filterChange(ServicesState.getFilters());

    function handleClick(item, e) {
      $state.go('services.details', {serviceId: item.id});
    }

    function sortChange(sortId, isAscending) {
      vm.servicesList.sort(compareFn);

      /* Keep track of the current sorting state */
      ServicesState.setSort(sortId, vm.toolbarConfig.sortConfig.isAscending);
    }
    
    function compareFn(item1, item2) {
      var compValue = 0;
      if (vm.toolbarConfig.sortConfig.currentField.id === 'name') {
        compValue = item1.name.localeCompare(item2.name);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'vms') {
        compValue = item1.v_total_vms - item2.v_total_vms;
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'owner') {
        compValue = item1.evm_owner.name.localeCompare(item2.evm_owner.name);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'created') {
        compValue = new Date(item1.created_at) - new Date(item2.created_at);
      } else if (vm.toolbarConfig.sortConfig.currentField.id === 'retires') {
        compValue = getRetirementDate(item1.retires_on) - getRetirementDate(item2.retires_on);
      } 

      if (!vm.toolbarConfig.sortConfig.isAscending) {
        compValue = compValue * -1;
      }

      return compValue;
    }

    /* Date 10 years into the future */
    var neverRetires = new Date();
    neverRetires.setDate(neverRetires.getYear() + 10);

    function getRetirementDate(value) {
      if (angular.isDefined(value)) {
        return new Date(value);
      } else {
        return neverRetires;
      }
    }

    function filterChange(filters) {
      vm.filtersText = '';
      angular.forEach(filters, filterTextFactory);

      function filterTextFactory(filter) {
        vm.filtersText += filter.title + ' : ' + filter.value + '\n';
      }

      applyFilters(filters);
      vm.toolbarConfig.filterConfig.resultsCount = vm.servicesList.length;
    }

    function applyFilters(filters) {
      vm.servicesList = [];
      if (filters && filters.length > 0) {
        angular.forEach(vm.services, filterChecker);
      } else {
        vm.servicesList = vm.services;
      }

      /* Keep track of the current filtering state */
      ServicesState.setFilters(filters);

      /* Make sure sorting direction is maintained */
      sortChange(ServicesState.getSort().currentField, ServicesState.getSort().isAscending);

      function filterChecker(item) {
        if (matchesFilters(item, filters)) {
          vm.servicesList.push(item);
        }
      }
    }

    function matchesFilters(item, filters) {
      var matches = true;
      angular.forEach(filters, filterMatcher);

      function filterMatcher(filter) {
        if (!matchesFilter(item, filter)) {
          matches = false;

          return false;
        }
      }

      return matches;
    }

    function matchesFilter(item, filter) {
      if ('name' === filter.id) {
        return item.name.toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if ('vms' === filter.id) {
        return String(item.v_total_vms).toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if ('owner' === filter.id && angular.isDefined(item.evm_owner)) {
        return item.evm_owner.name.toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      } else if ('retirement' === filter.id) {
        return checkRetirementDate(item, filter.value.toLowerCase());
      } else if ('created' === filter.id) {
        return $filter('date')(item.created_at).toLowerCase().indexOf(filter.value.toLowerCase()) !== -1;
      }

      return false;
    }

    function checkRetirementDate(item, filterValue) {
      var currentDate = new Date();

      if (filterValue === 'retired' && angular.isDefined(item.retires_on)) {
        return angular.isDefined(item.retired) && item.retired === true;
      } else if (filterValue === 'current') {
        return !angular.isDefined(item.retired) || item.retired === false;
      } else if (filterValue === 'soon' && angular.isDefined(item.retires_on)) {
        return new Date(item.retires_on) >= currentDate 
          && new Date(item.retires_on) <= currentDate.setDate(currentDate.getDate() + 30);
      }

      return false;
    }
  }
})();

(function() {
  'use strict';

  angular.module('app.states')
    .run(appRun);

  /** @ngInject */
  function appRun(routerHelper) {
    routerHelper.configureStates(getStates());
  }

  function getStates() {
    return {
      'services': {
        parent: 'application',
        url: '/services',
        redirectTo: 'services.list',
        template: '<ui-view></ui-view>'
      }
    };
  }
})();

angular.module("app.core").run(["$templateCache", function($templateCache) {$templateCache.put("app/layouts/application.html","<div class=layout-application><header-nav></header-nav><sidebar-nav></sidebar-nav><main-content></main-content></div>");
$templateCache.put("app/layouts/blank.html","<ui-view></ui-view>");
$templateCache.put("app/components/confirmation/confirmation.html","<div class=modal-header ng-if=::vm.title><button type=button class=close ng-click=$dismiss() aria-hidden=true><span class=\"pficon pficon-close\"></span></button><h4 class=modal-title id=myModalLabel>{{ ::vm.title }}</h4></div><div class=modal-body><p class=confirmation__message>{{ ::vm.message }}</p></div><div class=modal-footer><div class=confirmation__buttons><button ng-if=vm.showCancel type=button class=\"confirmation__button btn btn-default\" ng-click=$dismiss()>{{ ::vm.cancel }}</button> <button type=button class=\"confirmation__button btn btn-rounded\" ng-class=::vm.okClass ng-click=$close()>{{ ::vm.ok }}</button></div></div>");
$templateCache.put("app/components/custom-button/custom-button.html","<span><span ng-if=!vm.collapseCustomButtons><span ng-repeat=\"button in vm.customActions.buttons\"><button class=\"btn btn-default custom-button\" title={{button.description}} type=button ng-click=vm.customButtonAction(button)>{{button.name }}</button></span><div class=\"btn-group dropdown\" ng-repeat=\"buttonGroup in vm.customActions.button_groups\"><button class=\"btn btn-default dropdown-toggle custom-button\" title={{buttonGroup.description}} type=button id={{buttonGroup.id}} data-toggle=dropdown>{{ buttonGroup.name}} <span class=caret></span></button><ul class=dropdown-menu role=menu aria-labelledby={{buttonGroup.id}}><li ng-repeat=\"button in buttonGroup.buttons\" role=presentation><a role=menuitem tabindex=-1 ng-click=vm.customButtonAction(button)>{{ button.name }}</a></li></ul></div></span> <span ng-if=vm.collapseCustomButtons><div class=\"btn-group dropdown custom_actions_menu\" ng-if=\"vm.customActions.buttons.length >=1 || vm.customActions.button_groups >=1\"><button class=\"btn btn-default dropdown-toggle custom-button\" title=Actions type=button id=button_custom_actions data-toggle=dropdown>Actions <span class=caret></span></button><ul class=dropdown-menu role=menu aria-labelledby=button_custom_actions><li ng-repeat=\"button in vm.customActions.buttons\" role=presentation><a role=menuitem tabindex=-1 ng-click=vm.customButtonAction(button)>{{ button.name }}</a></li><div ng-repeat=\"buttonGroup in vm.customActions.button_groups\"><li ng-repeat=\"button in buttonGroup.buttons\" role=presentation><a role=menuitem tabindex=-1 ng-click=vm.customButtonAction(button)>{{ buttonGroup.name}} - {{ button.name }}</a></li></div></ul></div></span></span>");
$templateCache.put("app/components/dialog-content/dialog-content.html","<div><div ng-if=!vm.supportedDialog><h2>Service Template Contains Unsupported Provision Dialog Types.</h2><p>To request this service, continue <a ng-href=\"{{ vm.API_BASE }}/catalog/explorer\">to the full administrative UI</a>.</p></div><div ng-if=\"!vm.dialog.label && vm.supportedDialog\"><h2>No Provisioning Dialog Available.</h2></div><div ng-if=\"vm.dialog.label && vm.supportedDialog\"><div><h2 class=\"text-capitalize no-wrap\">{{ ::vm.dialog.label }}</h2><p ng-if=\"vm.dialog.label != vm.dialog.description\">{{ ::vm.dialog.description }}</p></div><tabset><tab ng-repeat=\"dialogTab in ::vm.dialog.dialog_tabs\" heading=\"{{ ::dialogTab.label }}\"><div ng-repeat=\"dialogGroup in ::dialogTab.dialog_groups\"><div class=\"panel panel-default\"><div class=panel-heading><strong>{{ ::dialogGroup.label }}</strong></div><div class=panel-body><form ng-if=!vm.options ng-repeat=\"dialogField in ::dialogGroup.dialog_fields\" ng-init=\"inputTitle = dialogField.description\" class=form-horizontal><div class=form-group><label class=\"control-label col-sm-2\">{{ ::dialogField.label }}</label><div ng-switch on=dialogField.type class=col-sm-5><input ng-switch-when=DialogFieldTextBox ng-model=dialogField.default_value ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" class=form-control type=\"{{ dialogField.options.protected ? \'password\' : \'text\' }}\" title=\"{{ ::inputTitle }}\" value=\"{{ dialogField.default_value }}\"> <textarea ng-switch-when=DialogFieldTextAreaBox ng-model=dialogField.default_value ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" class=form-control title=\"{{ ::inputTitle }}\" rows=4>{{ dialogField.default_value }}\n                    </textarea> <input ng-switch-when=DialogFieldCheckBox ng-model=dialogField.default_value ng-true-value=\"\'t\'\" ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" class=form-control type=checkbox title=\"{{ ::inputTitle }}\" ng-checked=\"dialogField.default_value == \'t\'\"><select ng-switch-when=DialogFieldDropDownList ng-model=dialogField.default_value ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled}}\" class=form-control><option ng-repeat=\"fieldValue in ::dialogField.values\" value=\"{{ ::fieldValue[0] }}\">{{ ::fieldValue[1] }}</option></select><span ng-switch-when=DialogFieldRadioButton class=btn-group><label class=\"btn btn-primary\" ng-repeat=\"fieldValue in dialogField.values\"><input type=radio ng-model=dialogField.default_value name=\"{{ dialogField.name }}\" ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" value=\"{{ ::fieldValue[0] }}\"> {{ ::fieldValue[1] }}</label></span> <input ng-switch-when=DialogFieldDateControl ng-model=dialogField.default_value pf-datepicker options=vm.dateOptions date=dialogField.default_value><div ng-switch-when=DialogFieldDateTimeControl><div class=\"col-sm-6 dateTimePadding\"><input ng-model=dialogField.default_value pf-datepicker options=vm.dateOptions date=dialogField.default_value></div><div class=col-sm-6><timepicker ng-model=dialogField.default_value></timepicker></div></div><span ng-switch-default ng-hide=true></span></div></div></form><form ng-if=vm.options ng-repeat=\"dialogField in ::dialogGroup.dialog_fields\" ng-init=\"inputTitle = dialogField.description\" class=form-horizontal><div class=form-group><div class=col-sm-3>{{ ::dialogField.label }}</div><div ng-switch on=dialogField.type class=col-sm-5><input ng-switch-when=DialogFieldTextBox ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" class=form-control type=\"{{ dialogField.options.protected ? \'password\' : \'text\' }}\" title=\"{{ ::inputTitle }}\" value=\"{{ vm.parsedOptions[dialogField.name] }}\"> <textarea ng-switch-when=DialogFieldTextAreaBox ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" class=form-control title=\"{{ ::inputTitle }}\" rows=4>{{ vm.parsedOptions[dialogField.name] }}\n                    </textarea> <input ng-switch-when=DialogFieldCheckBox ng-true-value=\"\'t\'\" ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled }}\" class=form-control type=checkbox title=\"{{ ::inputTitle }}\" ng-checked=\"vm.parsedOptions[dialogField.name] == \'t\'\"><select ng-switch-when=DialogFieldDropDownList ng-disabled=\"{{ ::dialogField.read_only || vm.inputDisabled}}\" class=form-control><option>{{vm.parsedOptions[dialogField.name]}}</option></select><span ng-switch-when=DialogFieldRadioButton class=btn-group><label>{{ vm.parsedOptions[dialogField.name] }}</label></span> <input ng-switch-when=DialogFieldDateControl ng-if=\"vm.inputDisabled || dialogField.read_only\" ng-disabled=true class=form-control value=\"{{ vm.parsedOptions[dialogField.name] | date:\'shortDate\' }}\"> <input ng-switch-when=DialogFieldDateTimeControl ng-if=\"vm.inputDisabled || dialogField.read_only\" ng-disabled=true class=form-control value=\"{{ vm.parsedOptions[dialogField.name] | date:\'medium\' }}\"> <span ng-switch-default ng-hide=true></span></div></div></form></div></div></div></tab></tabset></div></div>");
$templateCache.put("app/components/edit-service-modal/edit-service-modal.html","<div class=modal-header><button type=button class=close ng-click=$dismiss() aria-hidden=true><span class=\"pficon pficon-close\"></span></button><h4 class=modal-title id=myModalLabel>Edit Service</h4></div><div class=modal-body><form class=form-horizontal><div pf-form-group pf-label=Name required><input id=name name=name ng-model=vm.modalData.resource.name type=text required></div><div pf-form-group pf-input-class=col-sm-9 pf-label=Description><textarea id=description name=description ng-model=vm.modalData.resource.description>\n          {{ vm.modalData.resource.description }}\n        </textarea></div></form></div><div class=modal-footer><button type=button class=\"btn btn-default\" ng-click=$dismiss()>Cancel</button> <button type=button class=\"btn btn-primary\" ng-click=vm.saveServiceDetails() ng-disabled=\"vm.modalData.resource.name == vm.service.name && vm.modalData.resource.description == vm.service.description\">Save</button></div>");
$templateCache.put("app/components/footer/footer-content.html","<footer class=footer-pf-alt><p class=text-center>{{ vm.dateTime | date: \'MM/dd/yyyy HH:mm\' : timezone}}</p></footer>");
$templateCache.put("app/components/main-content/main-content.html","<div class=container-pf-alt-nav-pf-vertical-alt ng-class=\"{\'collapsed-nav\': vm.state.isCollapsed, \'hidden-nav\': vm.state.isMobileNav }\"><div class=main-content ui-view></div></div>");
$templateCache.put("app/components/navigation/header-nav.html","<header class=\"navbar navbar-pf-alt\" role=navigation><div class=navbar-header><button type=button class=navbar-toggle ng-click=vm.toggleNavigation()><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <a ui-sref=dashboard class=navbar-brand><img class=navbar-brand-name src=images/brand.svg alt=\"{{ :: vm.text.name }}\"></a></div><nav class=\"collapse navbar-collapse\"><ul class=\"nav navbar-nav\"><li><a ng-href={{vm.API_BASE}} target=_blank class=\"nav-item-iconic nav-item-iconic-new-window\"><i class=\"fa fa-external-link\" tooltip=\"Log into the full administrative UI\" tooltip-placement=bottom tooltip-append-to-body=true></i></a></li></ul><ul class=\"nav navbar-nav navbar-right navbar-iconic\"><li dropdown><a dropdown-toggle class=nav-item-iconic><i title=\"{{ ::vm.user().name }}\" class=\"fa pficon-user\"></i> <span class=caret></span></a><ul class=dropdown-menu><li class=action><a ui-sref=logout>Logout</a></li></ul></li></ul></nav></header>");
$templateCache.put("app/components/navigation/sidebar-nav.html","<nav class=nav-pf-vertical-alt ng-class=\"{collapsed: vm.state.isCollapsed, hidden: vm.state.isMobileNav, \'show-mobile-nav\': vm.state.showMobileNav}\"><ul class=list-group><li ng-repeat=\"item in vm.items.primary\" class=list-group-item ui-sref-active=active><a ng-click=vm.navigate(item) ui-sref=\"{{ ::item.state }}\"><i class=\"{{ ::item.icon }}\" title=\"{{ ::item.title }}\"></i> <span class=list-group-item-value>{{ ::item.title }}</span> <span ng-if=item.count class=badge tooltip=\"{{ item.tooltip }}\" tooltip-placement=right tooltip-append-to-body=true>{{ item.count }}</span></a></li><div ng-if=vm.state.showMobileNav class=list-group-item-secondary><li ng-repeat=\"item in items.secondary\" class=list-group-item ui-sref-active=active><a ng-click=vm.navigate(item) ui-sref=\"{{ ::item.state }}\"><i class=\"{{ ::item.icon }}\" title=\"{{ ::item.title }}\"></i> <span class=list-group-item-value>{{ ::item.title }}</span> <span ng-if=item.count class=badge tooltip=\"{{ item.tooltip }}\" tooltip-placement=right tooltip-append-to-body=true>{{ item.count }}</span></a></li></div></ul></nav>");
$templateCache.put("app/components/retire-service-modal/retire-service-modal.html","<div class=modal-header><button type=button class=close ng-click=$dismiss() aria-hidden=true><span class=\"pficon pficon-close\"></span></button><h4 class=modal-title id=myModalLabel>Schedule Service Retirement</h4></div><div class=modal-body><form class=form-horizontal><div pf-form-group pf-input-class=col-sm-8 pf-label-class=col-sm-3 pf-label=\"Retirement Warning\"><select pf-select ng-model=vm.modalData.resource.warn><option value=0>No Warning</option><option value=7>1 Week</option><option value=14>2 Weeks</option><option value=21>3 Weeks</option><option value=28>4 Weeks</option></select></div><div pf-form-group pf-input-class=col-sm-8 pf-label-class=col-sm-3 pf-label=\"Retirement Date\"><div pf-datepicker options=vm.dateOptions date=vm.modalData.resource.date></div></div></form></div><div class=modal-footer><button type=button class=\"btn btn-default\" ng-click=$dismiss()>Cancel</button> <button type=button class=\"btn btn-primary\" ng-click=vm.retireService() ng-disabled=\"vm.modalData.resource.name == vm.service.name && vm.modalData.resource.description == vm.service.description\">Save</button></div>");
$templateCache.put("app/components/ss-card/ss-card.html","<div class=ss-card><h3 class=ss-card__title>{{ ::vm.title }}</h3><h4 class=ss-card__description>{{ ::vm.description }}</h4><div class=ss-card__logo_wrapper><img ng-if=vm.img class=ss-card__logo alt=\"{{ ::vm.title }}\" ng-src=\"{{ ::vm.img }}\"> <img ng-if=!vm.img class=ss-card__logo alt=\"{{ ::vm.title }}\" src=images/service.png></div><a class=ss-card__more popover-placement=right popover-html=::vm.more popover-trigger=mouseenter><i class=\"fa fa-info-circle\"></i> More</a></div>");
$templateCache.put("app/states/404/404.html","<div class=blank-slate-pf><div class=blank-slate-pf-icon><img src=/images/miq_logo_transparent.png alt=Logo></div><h1>The page you requested cannot be found.</h1><p>The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.</p><p>We apologize for the inconvenience.</p></div>");
$templateCache.put("app/states/about-me/about-me.html","About Me");
$templateCache.put("app/states/dashboard/dashboard.html","<div class=\"container-fluid container-cards-pf ss-dashboard\"><div class=\"row row-cards-pf\"><div class=\"col-xs-6 col-sm-6 col-md-6\"><div class=\"card-pf card-pf-accented ss-dashboard__card-primary\" ui-sref=services.list><div class=card-pf-body><span class=\"fa fa-file-o\"></span><div class=ss-dashboard__card-primary__count><h2>{{ ::vm.servicesCount.total }}</h2><h3>Total Services</h3></div></div></div></div><div class=\"col-xs-6 col-sm-6 col-md-6\"><div class=\"card-pf card-pf-accented ss-dashboard__card-primary\" ui-sref=requests.list><div class=card-pf-body><span class=\"fa fa-file-text-o\"></span><div class=ss-dashboard__card-primary__count><h2>{{ ::vm.requestsCount.total }}</h2><h3>Total Requests</h3></div></div></div></div></div><div class=\"row row-cards-pf\"><div class=\"col-xs-6 col-sm-6 col-md-6\"><div class=card-pf><div class=\"row row-cards-pf\"><div class=\"card-pf card-pf-aggregate-status card-divider\"><div class=card-pf-body><h2 class=card-pf-title>Retiring Soon</h2><p class=card-pf-aggregate-status-notifications><span class=card-pf-aggregate-status-notification><span class=\"pficon pficon-warning-triangle-o\" tooltip=\"The number of services retiring within the next 30 days\" tooltip-placement=bottom></span></span> <span class=card-pf-aggregate-status-notification><a ng-click=\"vm.navigateToServicesList(\'Soon\')\">{{ ::vm.servicesCount.soon }}</a></span></p></div></div><div class=\"card-pf card-pf-aggregate-status card-divider\"><div class=card-pf-body><h2 class=card-pf-title>Current Services</h2><p class=card-pf-aggregate-status-notifications><span class=card-pf-aggregate-status-notification><span class=\"pficon fa fa-check\" tooltip=\"The number of active services\" tooltip-placement=bottom></span></span> <span class=card-pf-aggregate-status-notification><a ng-click=\"vm.navigateToServicesList(\'Current\')\">{{ ::vm.servicesCount.current }}</a></span></p></div></div><div class=\"card-pf card-pf-aggregate-status\"><div class=card-pf-body><h2 class=card-pf-title>Retired Services</h2><p class=card-pf-aggregate-status-notifications><span class=card-pf-aggregate-status-notification><span class=\"pficon pficon-close\" tooltip=\"The number of services which have hit their retirement period or been retired\" tooltip-placement=bottom></span></span> <span class=card-pf-aggregate-status-notification><a ng-click=\"vm.navigateToServicesList(\'Retired\')\">{{ ::vm.servicesCount.retired }}</a></span></p></div></div></div></div></div><div class=\"col-xs-6 col-sm-6 col-md-6\"><div class=card-pf><div class=\"row row-cards-pf\"><div class=\"card-pf card-pf-aggregate-status card-divider\"><div class=card-pf-body><h2 class=card-pf-title>Pending Requests</h2><p class=card-pf-aggregate-status-notifications><span class=card-pf-aggregate-status-notification><span class=\"pficon pficon-warning-triangle-o\"></span></span> <span class=card-pf-aggregate-status-notification><a ng-click=\"vm.navigateToRequestsList(\'Pending\')\">{{ ::vm.requestsCount.pending }}</a></span></p></div></div><div class=\"card-pf card-pf-aggregate-status card-divider\"><div class=card-pf-body><h2 class=card-pf-title>Approved Requests</h2><p class=card-pf-aggregate-status-notifications><span class=card-pf-aggregate-status-notification><span class=\"pficon fa fa-check\"></span></span> <span class=card-pf-aggregate-status-notification><a ng-click=\"vm.navigateToRequestsList(\'Approved\')\">{{ ::vm.requestsCount.approved }}</a></span></p></div></div><div class=\"card-pf card-pf-aggregate-status\"><div class=card-pf-body><h2 class=card-pf-title>Denied Requests</h2><p class=card-pf-aggregate-status-notifications><span class=card-pf-aggregate-status-notification><span class=\"pficon pficon pficon-close\"></span></span> <span class=card-pf-aggregate-status-notification><a ng-click=\"vm.navigateToRequestsList(\'Denied\')\">{{ ::vm.requestsCount.denied }}</a></span></p></div></div></div></div></div></div></div>");
$templateCache.put("app/states/error/error.html","<div class=four0four><div class=navigation><a class=navigation__brand ui-sref=dashboard>ManageIQ Self Service</a></div><div class=four0four__window><img class=four0four__logo src=/images/jelly_alone.png alt=Logo><div class=four0four__title>There was a problem loading the page.</div><p>We apologize for the inconvenience.</p><div><div>{{vm.error.status}}</div><div>{{vm.error.statusText}}</div></div></div></div>");
$templateCache.put("app/states/help/help.html","Help");
$templateCache.put("app/states/login/login.html","<div class=login-pf><div class=container><div class=row><div class=col-sm-12><h1 id=brand ng-bind-html=vm.text.brand></h1></div><div class=\"col-sm-8 col-md-6 col-lg-5 login\"><form class=form-horizontal role=form ng-submit=vm.onSubmit()><pf-notification-list></pf-notification-list><div class=form-group><label for=inputUsername class=\"col-sm-2 col-md-2 control-label\">Username</label><div class=\"col-sm-10 col-md-10\"><input type=text ng-model=vm.credentials.login class=form-control id=inputUsername autofocus></div></div><div class=form-group><label for=inputPassword class=\"col-sm-2 col-md-2 control-label\">Password</label><div class=\"col-sm-10 col-md-10\"><input type=password ng-model=vm.credentials.password class=form-control id=inputPassword></div></div><div class=form-group><div class=\"col-xs-4 col-sm-4 col-md-4 pull-right submit\"><button type=submit class=\"btn btn-primary btn-lg\" tabindex=4>Log In</button></div></div></form></div><div class=\"col-sm-5 col-md-6 col-lg-7 details\"><p ng-bind-html=vm.text.message></p></div></div></div></div>");
$templateCache.put("app/states/marketplace/details/details.html","<ol class=breadcrumb><li><a ui-sref=^><span class=\"fa fa-angle-double-left\">&nbsp;Back to Service Catalog</span></a></li><li class=active><strong>Service:</strong> {{ ::vm.serviceTemplate.name }}</li></ol><pf-notification-list></pf-notification-list><div class=ss-details-wrapper><div class=\"panel panel-default ss-details-panel\"><div class=panel-body><section><div class=\"col-md-12 ss-details-header ss-marketplace-details-header\"><div class=row><div class=\"col-lg-8 col-md-8 col-sm-8 col-xs-8\"><div class=ss-details-header__title-img><span class=ss-details-header__title-img__center></span> <img class=ss-details-header__title-img__logo ng-if=!vm.serviceTemplate.picture.image_href alt=\"{{ ::vm.serviceTemplate.name }}\" src=images/service.png> <img class=ss-details-header__title-img__logo ng-if=vm.serviceTemplate.picture.image_href alt=\"{{ ::vm.serviceTemplate.name }}\" ng-src=\"{{ ::vm.serviceTemplate.picture.image_href }}\"></div><div class=ss-details-header__title><h2>{{ ::vm.serviceTemplate.name }}</h2><h4 ng-bind-html=\"::vm.serviceTemplate.long_description || vm.serviceTemplate.description\"></h4></div></div><div class=\"col-lg-4 col-md-4 col-sm-4 col-xs-4 ss-details-header__actions\"><button type=button class=\"btn btn-primary\" ng-click=vm.submitDialog()>Submit Request</button></div></div></div></section></div></div><div class=\"panel panel-default ss-details-panel ss-marketplace-details-form\"><div class=panel-body><section><div class=col-md-12><div class=row><div ng-repeat=\"dialog in ::vm.dialogs\"><dialog-content dialog=dialog></dialog-content></div></div></div></section></div></div></div>");
$templateCache.put("app/states/marketplace/list/list.html","<div class=ss-marketplace><div pf-data-toolbar id=templatesToolbar config=vm.toolbarConfig></div><div class=ss-card-view><div ng-repeat=\"template in vm.serviceTemplatesList\"><ss-card heading=\"{{ ::template.name }}\" description=\"{{ ::template.service_template_catalog.name }}\" more=\"{{ ::template.long_description || template.description }}\" ng-click=vm.showDetails(template.id) img=\"{{ ::template.picture.image_href }}\"></ss-card></div></div></div>");
$templateCache.put("app/states/products/details/details.html","<content-header short=true><div class=product-details-heading><img ng-if=vm.product.img class=product-details-heading__icon ng-src=\"/images/assets/{{ ::vm.product.img }}\"> <span class=content-header__title>{{ ::vm.product.name }}</span></div></content-header><details-table heading=Details><div class=details-table__row><div class=details-table__label>Product</div><div class=details-table__detail><product-description product=vm.product link-to=\"products.details({productId: {{vm.product.id}}})\"></product-description></div></div><div class=details-table__row><div class=details-table__label>Product Status</div><div class=details-table__detail ng-if=vm.product.active>Active</div><div class=details-table__detail ng-if=!vm.product.active>Inactive</div></div><div class=details-table__row><div class=details-table__label>Product Type</div><div class=details-table__detail>{{ ::vm.product.product_type }}</div></div><div class=details-table__row><div class=details-table__label>Product Tags</div><div class=details-table__detail ng-bind-html=vm.tagList(vm.product.tags)></div></div><div class=details-table__row><div class=details-table__label>Creation Date</div><div class=details-table__detail>{{ ::vm.product.created_at | date:\'medium\' }}</div></div><div class=details-table__row><div class=details-table__label>Last Updated</div><div class=details-table__detail>{{ ::vm.product.updated_at | date:\'medium\' }}</div></div></details-table><details-table heading=\"Provisioning Answers\"><div class=details-table__row ng-repeat=\"(key, value) in vm.product.provisioning_answers\"><div class=details-table__label>{{ ::key}}</div><div class=details-table__detail>{{ ::value}}</div></div></details-table><region heading=Pricing><table class=product-pricing><thead><tr><th class=product-pricing__heading></th><th class=product-pricing__heading>Setup</th><th class=product-pricing__heading>Hourly</th><th class=product-pricing__heading>Monthly</th></tr></thead><tbody><tr class=selectRow><td class=\"product-pricing__cell product-pricing__cell--padding\"></td><td class=\"product-pricing__cell product-pricing__cell\">{{ ::vm.product.setup_price | currency }}</td><td class=\"product-pricing__cell product-pricing__cell\">{{ ::vm.product.monthly_price | currency }}</td><td class=\"product-pricing__cell product-pricing__cell\">{{ ::vm.product.hourly_price | currency }}</td></tr></tbody></table></region>");
$templateCache.put("app/states/requests/details/details.html","<ol class=breadcrumb><li><a ui-sref=^><span class=\"fa fa-angle-double-left\">&nbsp;Back to My Requests</span></a></li><li class=active><strong>Request:</strong> {{ ::vm.request.description }}</li></ol><div class=ss-details-wrapper><div class=\"panel panel-default ss-details-panel\"><div class=panel-body><section><div class=\"col-md-12 ss-details-header\"><div class=row><div class=col-md-12><div class=ss-details-header__title-img><span class=ss-details-header__title-img__center></span> <img class=ss-details-header__title-img__logo ng-src=\"{{ ::vm.request.picture.image_href }}\" ng-if=::vm.request.picture.image_href> <img class=ss-details-header__title-img__logo src=images/service.png ng-if=::!vm.request.picture.image_href></div><div class=ss-details-header__title><h2>{{ ::vm.request.description }}</h2><h4>{{ ::vm.request.options.long_description || vm.request.description }}</h4></div></div></div></div></section><section class=ss-form-readonly><div class=col-md-12><div class=row><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6\"><div class=form-horizontal><div class=form-group><label class=\"control-label col-sm-4\">Request Id</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.id }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Request State</label><div class=col-sm-8><div class=ss-request-state><span class=\"spinner spinner-xs spinner-inline\" ng-if=\"vm.request.request_state == \'pending\'\"></span> <span class=pficon-error-circle-o ng-if=\"vm.request.request_state == \'denied\'\"></span> <span class=pficon-ok ng-if=\"vm.request.request_state == \'approved\'\"></span> {{ ::item.request_state }} {{ ::vm.request.request_state }}</div></div></div><div class=form-group><label class=\"control-label col-sm-4\">Request Date</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.created_on | date:\'medium\' }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Requested By</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.requester_name }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Request Approval State</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.approval_state }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Approver</label><div class=col-sm-8><input class=form-control disabled value=N/A></div></div></div></div><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6\"><div class=form-horizontal><div class=form-group><label class=\"control-label col-sm-4\">Last Message</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.message}}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Last Updated</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.updated_on | date:\'medium\' }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Request Type</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.request.request_type }}\"></div></div></div></div></div></div></section></div></div><div class=\"panel panel-default ss-details-panel\"><div class=panel-body><section class=ss-details-section><dialog-content dialog=vm.request.provision_dialog input-disabled=true options=vm.request.options.dialog></dialog-content></section></div></div></div>");
$templateCache.put("app/states/requests/list/list.html","<div class=row><div class=col-md-12><div pf-data-toolbar id=requestToolbar config=vm.toolbarConfig></div></div></div><pf-notification-list></pf-notification-list><div class=\"col-md-12 list-view-container\"><div pf-data-list id=requestList config=vm.listConfig items=vm.requestsList><div class=row><div class=\"col-lg-5 col-md-5 col-sm-8 col-xs-8\"><span class=no-wrap><span class=ss-list-view__title-img><span class=ss-list-view__title-img__center></span> <img class=ss-list-view__title-img__logo ng-src=\"{{ ::item.picture.image_href }}\" ng-if=::item.picture.image_href> <img class=ss-list-view__title-img__logo src=images/service.png ng-if=::!item.picture.image_href></span> {{ item.description }}</span></div><div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-4\"><span class=no-wrap><strong>ID</strong>{{ item.id }}</span></div><div class=\"col-lg-3 hidden-md hidden-sm hidden-xs\"><span class=no-wrap><strong>Requested</strong>{{ item.created_on | date }}</span></div><div class=\"col-lg-2 col-md-4 hidden-sm hidden-xs\"><span class=\"text-capitalize no-wrap\"><span class=\"spinner spinner-xs spinner-inline\" ng-if=\"item.approval_state == \'pending\'\" tooltip=\"The current approval status of the request\" tooltip-placement=bottom></span> <span class=pficon-error-circle-o ng-if=\"item.approval_state == \'denied\'\" tooltip=\"The current approval status of the request\" tooltip-placement=bottom></span> <span class=pficon-ok ng-if=\"item.approval_state == \'approved\'\" tooltip=\"The current approval status of the request\" tooltip-placement=bottom></span> {{ item.approval_state }}</span></div></div></div></div>");
$templateCache.put("app/states/services/details/details.html","<ol class=breadcrumb><li><a ui-sref=^><span class=\"fa fa-angle-double-left\">&nbsp;Back to My Services</span></a></li><li class=active><strong>Service:</strong> {{ ::vm.service.name }}</li></ol><div class=ss-details-wrapper><pf-notification-list></pf-notification-list><div class=\"panel panel-default ss-details-panel\"><div class=panel-body><section><div class=\"col-md-12 ss-details-header\"><div class=row><div class=\"col-lg-5 col-md-6 col-sm-6 col-xs-6\"><div class=ss-details-header__title-img><span class=ss-details-header__title-img__center></span> <img class=ss-details-header__title-img__logo ng-src=\"{{ ::vm.service.picture.image_href }}\" ng-if=::vm.service.picture.image_href> <img class=ss-details-header__title-img__logo ng-src=images/service.png ng-if=::!vm.service.picture.image_href></div><div class=ss-details-header__title><h2>{{ ::vm.service.name }}</h2><h4>{{ ::vm.service.long_description || vm.service.description }}</h4></div></div><div class=\"col-lg-7 col-md-6 col-sm-6 col-xs-6 ss-details-header__actions\"><div class=ss-details-header__actions__inner><custom-button custom-actions=vm.service.custom_actions actions=vm.service.actions></custom-button><button class=\"btn btn-default\" type=button tooltip=\"Permanently delete the service\" tooltip-placement=bottom confirmation confirmation-if=true confirmation-title=\"Remove Service\" confirmation-message=\"Confirm, would you like to remove this service?\" confirmation-ok-text=\"Yes, Remove Service\" confirmation-on-ok=vm.removeService() confirmation-ok-style=primary confirmation-show-cancel=true>Remove Service</button><div class=btn-group dropdown><button id=single-button type=button class=\"btn btn-default\" dropdown-toggle tooltip=\"Inactivate the service\" tooltip-placement=bottom>Retire <span class=caret></span></button><ul class=dropdown-menu role=menu><li role=menuitem><a href=# confirmation confirmation-if=true confirmation-title=\"Retire Service Now\" confirmation-message=\"Confirm, would you like to retire this service?\" confirmation-ok-text=\"Yes, Retire Service Now\" confirmation-on-ok=vm.retireServiceNow() confirmation-ok-style=primary confirmation-show-cancel=true>Retire Now</a></li><li role=menuitem><a href=# ng-click=vm.retireServiceLater()>Schedule Retirement</a></li></ul></div><button class=\"btn btn-primary\" type=button ng-click=vm.editServiceModal()>Edit Service</button></div></div></div></div></section><section class=ss-form-readonly><div class=col-md-12><div class=row><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6\"><div class=form-horizontal><div class=form-group><label class=\"control-label col-sm-4\">Service Id</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.id }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Retirement Date</label><div class=col-sm-8><input ng-if=(vm.service.retires_on) class=form-control disabled value=\"{{ ::vm.service.retires_on | date }}\"> <input ng-if=!(vm.service.retires_on) class=form-control disabled value=Never></div></div><div class=form-group><label class=\"control-label col-sm-4\">Owner</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.evm_owner.name }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Group</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.miq_group.description }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Created On</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.created_at | date:\'medium\' }}\"></div></div></div></div><div class=\"col-lg-6 col-md-6 col-sm-6 col-xs-6\"><div class=form-horizontal><div class=form-group><label class=\"control-label col-sm-4\">CPU</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.aggregate_all_vm_cpus }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Memory</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.aggregate_all_vm_memory | formatBytes }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Disk Count</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.aggregate_all_vm_disk_count}}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Disk Space Allocated</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.aggregate_all_vm_disk_space_allocated | formatBytes }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Disk Space Used</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.aggregate_all_vm_disk_space_used | formatBytes }}\"></div></div><div class=form-group><label class=\"control-label col-sm-4\">Memory on Disk</label><div class=col-sm-8><input class=form-control disabled value=\"{{ ::vm.service.aggregate_all_vm_memory_on_disk | formatBytes }}\"></div></div></div></div></div></div></section></div></div><div class=\"panel panel-default ss-details-panel\"><div class=panel-body><section class=ss-details-section><h2>Virtual Machines ({{ ::vm.service.vms.length }})</h2><p ng-if=\"vm.service.vms.length === 0\">This service has no associated VMs</p><div pf-data-list id=serviceList config=vm.listConfig items=vm.service.vms ng-if=\"vm.service.vms.length > 0\"><div class=row><div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-6\"><span class=no-wrap><i class=\"pficon pficon-screen\" tooltip=\"Instance name\" tooltip-placement=right></i>&nbsp;{{ item.name }}</span></div><div class=\"col-lg-2 col-md-3 col-sm-4 col-xs-6\"><span class=no-wrap><strong>Vendor</strong>&nbsp;{{ item.vendor }}</span></div><div class=\"col-lg-2 col-md-3 col-sm-4 hidden-xs\"><span class=no-wrap><strong>Size</strong>&nbsp;{{ item.memory_shares | formatBytes }}</span></div><div class=\"col-lg-3 hidden-md hidden-sm hidden-xs\"><span class=no-wrap><strong tooltip=\"The last heartbeat received from the instances\" tooltip-placement=bottom>Last Scan</strong>&nbsp;{{ item.last_scan_on | date:\'medium\' }}</span></div><div class=\"col-lg-2 col-md-3 hidden-sm hidden-xs\"><span class=no-wrap><i class=\"fa pficon fa-power-off\" ng-if=\"item.power_state == \'off\'\" tooltip=\"Power State\" tooltip-placement=bottom></i> <i class=\"pficon pficon-ok\" ng-if=\"item.request_state == \'on\'\" tooltip=\"Power State\" tooltip-placement=bottom></i> <i class=\"fa pficon fa-pause\" ng-if=\"item.request_state == \'suspended\'\" tooltip=\"Power State\" tooltip-placement=bottom></i> {{ item.power_state }}</span></div></div></div></section></div></div><div class=\"panel panel-default ss-details-panel ss-details-panel-bottom\"><div class=panel-body><section class=ss-details-section><dialog-content dialog=vm.service.provision_dialog input-disabled=true options=vm.service.options.dialog></dialog-content></section></div></div></div>");
$templateCache.put("app/states/services/list/list.html","<div class=row><div class=col-md-12><div pf-data-toolbar id=serviceToolbar config=vm.toolbarConfig></div></div></div><div class=\"col-md-12 list-view-container\"><pf-notification-list></pf-notification-list><div pf-data-list id=serviceList config=vm.listConfig items=vm.servicesList><div class=row><div class=\"col-lg-3 col-md-4 col-sm-6 col-xs-6\"><span class=no-wrap><span class=ss-list-view__title-img><span class=ss-list-view__title-img__center></span> <img class=ss-list-view__title-img__logo ng-src=\"{{ ::item.picture.image_href }}\" ng-if=::item.picture.image_href> <img class=ss-list-view__title-img__logo src=images/service.png ng-if=::!item.picture.image_href></span> {{ item.name }}</span></div><div class=\"col-lg-3 col-md-4 col-sm-6 col-xs-6\"><span class=no-wrap><strong>Retirement Date</strong>&nbsp; <span ng-if=(item.retires_on)>{{ item.retires_on | date }}</span> <span ng-if=!(item.retires_on)>Never</span></span></div><div class=\"col-lg-2 col-md-2 hidden-sm hidden-xs\"><span class=no-wrap><i class=\"pficon pficon-screen\" tooltip=\"The number of instances running this service\" tooltip-placement=bottom></i> <span><strong>{{ item.v_total_vms}}</strong> VMs</span></span></div><div class=\"col-lg-2 col-md-2 hidden-sm hidden-xs\"><span class=no-wrap><i class=\"pficon pficon-user\" tooltip=Owner tooltip-placement=bottom></i>{{ item.evm_owner.name }}</span></div><div class=\"col-lg-2 hidden-md hidden-sm hidden-xs\"><span class=no-wrap><strong>Created On</strong>&nbsp;{{ item.created_at | date }}</span></div></div></div></div>");}]);