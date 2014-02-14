angular.module("smartRegistry.controllers")
    .controller("listViewController", ["$scope", "$filter", function ($scope, $filter) {

        $scope.navigationBridge = new ANMNavigationBridge();
        $scope.formBridge = new FormBridge();
        $scope.villageBridge = new VillageBridge();

        $scope.sort = function (option) {
            $scope.currentSortOption = option;
            option.secondarySortKey = option.secondarySortKey || 'name';
            $scope.sortList = [$scope[option.handler], option.secondarySortKey];
            $scope.sortDescending = option.sortDescending || false;
        };

        $scope.sortByName = function (client) {
            return client.name;
        };

        $scope.sortByPriority = function (client) {
            return !client.isHighPriority;
        };

        $scope.sortByBPL = function (client) {
            return !client.isBPL;
        };

        $scope.sortBySC = function (client) {
            return !client.isSC;
        };

        $scope.sortByST = function (client) {
            return !client.isST;
        };

        $scope.filterVillage = function (option) {
            $scope.villageFilterOption = option;
        };

        var capitalize = function (text) {
            return text.slice(0, 1).toUpperCase() + text.slice(1);
        };

        var formatText = function (unformattedText) {
            if (typeof unformattedText === "undefined" || unformattedText === null) {
                return "";
            }
            return capitalize(unformattedText).replace(/_/g, " ");
        };

        $scope.getVillageFilterOptions = function () {
            var villageFilterOptions = {
                type: $scope.defaultVillageOptions.type,
                options: $scope.defaultVillageOptions.options.slice(0)
            };
            var villages = $scope.villageBridge.getVillages();
            villages.forEach(function (village) {
                villageFilterOptions.options.push({
                    label: formatText(village.name),
                    id: village.name,
                    handler: $scope.defaultVillageFilterHandler
                });
            });
            return  villageFilterOptions;
        };

        $scope.villageOptions = $scope.getVillageFilterOptions();

        $scope.filterList = function (client) {
            var searchCondition = true;
            var villageCondition = true;
            var serviceModeCondition = true;
            var handlerMethod;
            if ($scope.searchFilterString) {
                searchCondition = $scope.searchCriteria(client, $scope.searchFilterString);
            }
            if ($scope.villageFilterOption.handler) {
                handlerMethod = $scope[$scope.villageFilterOption.handler];
                villageCondition = handlerMethod(client, $scope.villageFilterOption);
            }
            if ($scope.serviceModeOption.handler) {
                handlerMethod = $scope[$scope.serviceModeOption.handler];
                serviceModeCondition = handlerMethod(client, $scope.serviceModeOption.id);
            }
            return villageCondition && searchCondition && serviceModeCondition;
        };

        $scope.onModalOptionClick = function (option, type) {
            $scope[type](option);
            $scope.isModalOpen = false;
        };

        $scope.openModal = function (option) {
            $scope.isModalOpen = true;
            $scope.currentOptions = option;
        };

        $scope.closeModal = function () {
            $scope.isModalOpen = false;
        };

        $scope.numberOfClientsToShow = 20;

        $scope.openForm = function (formName, entityId, metaData) {
            if (!metaData) {
                metaData = {};
            }
            $scope.formBridge.delegateToFormLaunchView(formName, entityId, JSON.stringify(metaData));
        };

        $scope.openFormWithFieldOverrides = function (formName, entityId, fields) {
            var fieldOverrides = {
                fieldOverrides: fields
            };
            $scope.formBridge.delegateToFormLaunchView(formName, entityId, JSON.stringify(fieldOverrides));
        };

        $scope.openMicroForm = function (formName, entityId, metaData) {
            if (!metaData) {
                metaData = {};
            }
            $scope.formBridge.delegateToMicroFormLaunchView(formName, entityId, JSON.stringify(metaData));
        };

        $scope.getReportPeriodStartDate = function (date_str) {
            var src_date;
            if (date_str === undefined)
                src_date = new Date();
            else
                src_date = new Date(Date.parse(date_str));

            var start_date = new Date(src_date.getTime());
            if (src_date.getDate() <= 25) {
                start_date.setMonth(start_date.getMonth() - 1, 26);
            }
            else {
                start_date.setMonth(start_date.getMonth(), 26);
            }
            return $filter('date')(start_date, 'dd/MM');
        };

        $scope.getReportingPeriodEnd = function (date_str) {
            var src_date;
            if (date_str === undefined)
                src_date = new Date();
            else
                src_date = new Date(Date.parse(date_str));

            var end_date = new Date(src_date.getTime());
            if (src_date.getDate() <= 25) {
                end_date.setMonth(end_date.getMonth(), 25);
            }
            else {
                end_date.setMonth(end_date.getMonth() + 1, 25);
            }
            return $filter('date')(end_date, 'dd/MM');
        };

        $scope.reportingPeriodStart = $scope.getReportPeriodStartDate();
        $scope.reportingPeriodEnd = $scope.getReportingPeriodEnd();

        pageView.onReload(function () {
            $scope.$apply(function () {
                $scope.clients = $scope.getClients();
                $scope.villageOptions = $scope.getVillageFilterOptions();
            });
        });

        $scope.goBack = function () {
            $scope.navigationBridge.goBack();
        };

        $scope.inSearchMode = false;

        $scope.cancelSearch = function () {
            $scope.searchFilterString = "";
            $scope.inSearchMode = false;
        };

        $scope.enterSearchMode = function () {
            $scope.inSearchMode = true;
        };

        $scope.locationStatusMapping = {
            "out_of_area": 1,
            "left_the_place": 2
        };

        $scope.changeContentBasedOnServiceMode = function (client, serviceModeOptionId) {
            $scope.contentTemplate = serviceModeOptionId;
            return true;
        };
    }]);