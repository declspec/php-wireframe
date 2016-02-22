(function (ng) {
    "use strict";

    function inherit(parent, extra) {
        return ng.extend(Object.create(parent), extra);
    }

    var module = ng.module("common");

    module.constant("DialogResult", {
        Success: 0,
        Cancelled: 1,
        Error: 2
    });

    module.directive("modalDialog", ["$modalDialog", "$document", "DialogResult", function ($modalDialog, $document, DialogResult) {
        return {
            restrict: "ECA",
            priority: 400,
            terminal: true,
            transclude: "element",
            link: function (scope, $element, attr, ctrl, $transclude) {
                var currentScope,
                    currentElement,
                    currentDialog;

                scope.$on("$dialogChangeSuccess", update);
                scope.$on("$dialogDestroyed", destroy);

                update();

                function cleanup() {
                    if (currentScope) {
                        currentScope.$destroy();
                        currentScope = null;
                    }

                    if (currentElement) {
                        currentElement.remove();
                        currentElement = null;
                    }
                }

                function destroy($event, dialog) {
                    // Handle the '$dialogDestroyed' event. Only need to do something
                    // if the destroyed dialog is our currently displayed dialog 
                    // (this indicates that the dialog was probably destroyed programatically and
                    //  not by direct user interaction)
                    if (dialog === currentDialog) 
                        currentDialog.scope.close(DialogResult.Cancelled);
                }

                function update() {
                    var current = currentDialog = $modalDialog.current,
                        locals = current && current.locals,
                        template = locals && locals.$template;

                    if (!current || ng.isUndefined(template))
                        cleanup();
                    else {
                        var newScope = scope.$new();

                        $transclude(newScope, function (clone) {
                            $element.after(currentElement = clone);
                        });

                        newScope.close = function () {
                            if (current === currentDialog) {
                                cleanup();
                                currentDialog = null;
                            }
                            current.$destroy.apply(null, arguments);
                        };

                        // Give the 'current' dialog a close method
                        // so that external code can manually close the dialog if needed
                        // current.close = newScope.close;
                        currentScope = current.scope = newScope;
                        currentScope.$emit("$dialogContentLoaded");
                    }
                }
            }
        };
    }]);

    module.directive("modalDialog", ["$modalDialog", "$document", "$controller", "$compile", "DialogResult",
        function ($modalDialog, $document, $controller, $compile, DialogResult) {
            return {
                restrict: "ECA",
                priority: -400,
                link: function (scope, $element) {
                    var current = $modalDialog.current;

                    if (typeof(current) !== "undefined" && current != null) {
                        var locals = current.locals,
                            cancellable = !!current.cancellable;

                        scope.cancel = function () {
                            scope.close(DialogResult.Cancelled);
                        };

                        $element.html(
                            '<div class="modal-dialog-shadow"' + (cancellable ? ' ng-click="cancel()"' : '') + '></div>' +
                            '<div class="modal-dialog-wrapper">' + (cancellable ? '<span class="modal-dialog-cancel" ng-click="cancel()"></span>' : '') + locals.$template + '</div>'
                        );

                        var link = $compile($element.contents());

                        if (current.controller) {
                            locals.$scope = scope;

                            var controller = $controller(current.controller, locals);
                            if (current.controllerAs)
                                scope[current.controllerAs] = controller;

                            // These are set to enable the jqLite 'controller' method to function correctly.
                            $element.data("$ngControllerController", controller);
                            $element.children().data("$ngControllerController", controller);
                        }

                        link(scope);
                    }
                }
            };
        }
    ]);

    module.provider("$modalDialogParams", function () {
        this.$get = function () { return {}; };
    });

    module.provider("$modalDialog", function () {
        var dialogs = {};

        this.register = function (name, config) {
            dialogs[name] = ng.copy(config);
            return this;
        };

        this.$get = ["$q", "$sce", "$rootScope", "$http", "$templateCache", "$modalDialogParams", "DialogResult", get];

        function get($q, $sce, $rootScope, $http, $templateCache, $modalDialogParams, DialogResult) {
            var prepared = null;

            var $modal = {
                dialogs: dialogs,
                current: null,
                show: show
            };

            return $modal;

            function prepare(name, params, callback) {
                var last = $modal.current,
                    current = $modal.dialogs[name];

                // Use inherit to clone the actual dialog config
                prepared = current && inherit(current, {
                    params: params,
                    callback: callback,
                    $$destroyed: false,

                    $destroy: function () {
                        if (prepared.$$destroyed)
                            return;
                        
                        // Flag $$destroyed early to prevent any further calls to $destroy
                        // from duplicating effort (in either 'callback' or '$broadcast')
                        prepared.$$destroyed = true;
                        if ("function" === typeof(prepared.callback))
                            prepared.callback.apply(null, arguments);
                        
                        if (prepared === $modal.current)
                            $modal.current = null;

                        $rootScope.$broadcast("$dialogDestroyed", prepared);
                    }
                });

                if (prepared)
                    prepared.$$dialog = prepared;

                return (last || prepared) &&
                  !$rootScope.$broadcast("$dialogChangeStart", prepared, last).defaultPrevented;
            }

            function show(name, params, callback) {
                if (ng.isUndefined(callback) && ng.isFunction(params)) {
                    callback = params;
                    params = {};
                }

                if (!prepare(name, params, callback))
                    return callback(DialogResult.Cancelled);

                var last = $modal.current,
                    next = $modal.current = prepared;

                // Run after 'prepare' as we only want to destroy
                // the last modal dialog after $dialogChangeStart
                if (last)
                    last.$destroy(DialogResult.Cancelled);

                $q.when(prepared).then(function () {
                    var locals = {},
                        template,
                        templateUrl;

                    if (ng.isDefined(template = next.template)) {
                        if (ng.isFunction(template))
                            template = template(params);
                    }
                    else if (ng.isDefined(templateUrl = next.templateUrl)) {
                        if (ng.isFunction(templateUrl))
                            templateUrl = templateUrl(params);

                        templateUrl = $sce.getTrustedResourceUrl(templateUrl);
                        if (ng.isDefined(templateUrl)) {
                            next.loadedTemplateUrl = templateUrl;
                            template = $http.get(templateUrl, { cache: $templateCache }).then(function (response) {
                                return response.data;
                            });
                        }
                    }

                    if (ng.isDefined(template))
                        locals.$template = template;

                    return $q.all(locals);
                }).then(function (locals) {
                    if (next !== $modal.current)
                        next.$destroy(DialogResult.Cancelled);
                    else {
                        next.locals = locals;
                        ng.copy(next.params, $modalDialogParams);
                        $rootScope.$broadcast("$dialogChangeSuccess", next, last);
                    }
                }, function (error) {
                    $rootScope.$broadcast("$dialogChangeError", next, last, error);
                    next.$destroy(DialogResult.Error, error);
                });

                return next.$destroy;
            }
        }
    });
}(angular));