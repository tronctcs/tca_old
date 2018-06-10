(function () {
  'use strict';
  angular.module('tca')

    .controller('LoginCtrl', function ($scope, $http, $location, API, $ionicModal, $filter, $ionicLoading, $cordovaToast) {

      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
      };

      $scope.hide = function () {
        $ionicLoading.hide();
      };
      $scope.user = {
        userid: "",
        password: "",
        deviceid: ""
      }

      $scope.login = function () {

        if (window.Connection) {
          if (navigator.connection.type != Connection.NONE) {
            var encodedPassword = btoa($scope.user.password);
            API.show($ionicLoading);
            API.login({
              userid: $scope.user.userid.toLowerCase(),
              password: encodedPassword,
              deviceid: localStorage.getItem("tokenid")
            }).then(function (data) {

              if (data.data != '') {
                API.hide($ionicLoading);
                API.showToast('Welcome', 'short', 'center');
                localStorage['session'] = data.data;
                localStorage.setItem("token", data.data);
                $scope.user = {}
                $location.path("/home");
              }
              else {
                API.showToast('Wrong Credential - Please try again', 'short', 'center');
                $scope.hide($ionicLoading);
              }
            }).timeout(1000, function () {
              alert("timmed out");
            })
          } else {
            API.showToast('Network is not available - Please connect to internet and try again', 'short', 'center');
          }
        }
      }

    })

    .controller('HomeCtrl', function ($scope, $http, $window, API, $rootScope, $ionicLoading) {
      $scope.incidents = [];
      $scope.loaded = false;
      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
      };

      $scope.hide = function () {
        $ionicLoading.hide();
      };

      var token = localStorage.getItem("token");
      API.get({ token: token }).then(function (response) {
        $scope.loaded = true;
        var tempIncidents = [];
        if (response.data.length > 0) {
          if (response.data.length == 1) {
            if (response.data[0].Priority == 'EE') {
              $rootScope.logout();
            } else {
              tempIncidents = $scope.assignPriority(response);
            }
          } else {
            tempIncidents = $scope.assignPriority(response);
          }
          $scope.incidents = tempIncidents.data;

        } else {
          $scope.incidents = '';
          API.showToast('No Incident in the list', 'short', 'center');
        }

      });


      $scope.assignPriority = function (response) {
        for (var i = 0; i < response.data.length; i++) {
          if (response.data[i].Priority == "Priority 1") {
            response.data[i].Priority = "P1";
          } else if (response.data[i].Priority == "Priority 2") {
            response.data[i].Priority = "P2";
          } else if (response.data[i].Priority == "Priority 3") {
            response.data[i].Priority = "P3";
          } else if (response.data[i].Priority == "Priority 4") {
            response.data[i].Priority = "P4";
          }
        }
        return response;
      };

      $scope.doRefresh = function () {
        var token = localStorage.getItem("token");

        API.get({ token: token }).then(function (response) {
          var tempIncidents = [];
          if (response.data.length > 0) {
            if (response.data.length == 1) {
              if (response.data[0].Priority == 'EE') {
                $rootScope.logout();
              } else {
                tempIncidents = $scope.assignPriority(response);
              }
            } else {
              tempIncidents = $scope.assignPriority(response)
            }
            $scope.incidents = tempIncidents.data;
          } else {
            $scope.incidents = '';
            API.showToast('No Incident in the list', 'short', 'center');
          }
        }).finally(function () {
          $scope.$broadcast('scroll.refreshComplete');
        });
        return;
      };

      $scope.claim = function (IncId) {
        var token = localStorage.getItem("token");
        if (window.Connection) {
          if (navigator.connection.type != Connection.NONE) {
            $scope.show($ionicLoading);
            API.claim({
              IncId: IncId,
              token: token
            }).then(function (response) {

              if (response.data === 1) {
                $scope.doRefresh();
                $scope.hide($ionicLoading);
                API.showToast(IncId + ' ' + 'Claimed - Check Cloud Plus', 'short', 'center');
              } else if (response.data === 2) {
                $scope.doRefresh();
                $scope.hide($ionicLoading);
                API.showToast('Not authorized to claim the incident', 'short', 'center');
              } else if (response.data === 3) {
                $scope.doRefresh();
                API.showToast('Some error occoured', 'short', 'center');
              } else {
                $scope.doRefresh();
                $scope.hide($ionicLoading);
                API.showToast(IncId + ' ' + 'Already Claimed', 'short', 'center');
              }
            })
          } else {
            API.showToast('Network is not available - Please connect to internet and try again', 'short', 'center');
          }
        }
      }

      $rootScope.logout = function () {
        $http.get('https://stagetca.tronc.com/api/tca/logout?authkey=' + localStorage.getItem("token"));
        localStorage.removeItem('token');
        localStorage.removeItem("session");
        localStorage.removeItem("list_dependents");
        $window.location.href = '#/login';


      };

    })

    .controller('TicketCtrl', function (API, $scope, $state, $http, $window, $stateParams, $ionicLoading, $location, $rootScope) {

      $scope.show = function () {
        $ionicLoading.show({
          template: '<p>Loading...</p><ion-spinner></ion-spinner>'
        });
      };

      $scope.hide = function () {
        $ionicLoading.hide();
      };

      $scope.incidentId = $stateParams.incidentId;
      var token = localStorage.getItem("token");

      $scope.name = "";
      $scope.viewDetails = function (id) {
        var token = localStorage.getItem("token");
        if (window.Connection) {
          if (navigator.connection.type != Connection.NONE) {
            $scope.show($ionicLoading);
            API.viewIncidentDetail({ id: id, token: token })
              .then(function (response) {
                $rootScope.incident = response;
                if ($scope.incident) {
                  $location.path("/ticket/" + id);
                  $scope.hide($ionicLoading);
                }
              })
          } else {
            API.showToast('Network is not available - Please connect to internet and try again', 'short', 'center');
          }
        }
      }


      $scope.claim = function (IncId) {
        var token = localStorage.getItem("token");
        if (window.Connection) {
          if (navigator.connection.type != Connection.NONE) {
            $scope.show($ionicLoading);
            API.claim({
              IncId: IncId,
              token: token
            }).then(function (response) {
              if (response.data === 1) {
                $state.go('home');
                $scope.hide($ionicLoading);
                API.showToast(IncId + ' ' + 'Claimed - Check Cloud Plus', 'short', 'center');
              } else if (response.data === 2) {
                $scope.hide($ionicLoading);
                API.showToast('Not authorized to claim the incident', 'short', 'center');
              } else if (response.data === 3) {
                API.showToast('Some error occoured', 'short', 'center');
              } else {
                console.log(response.data);
                $state.go('home');
                $scope.hide($ionicLoading);
                API.showToast(IncId + ' ' + 'Already Claimed', 'short', 'center');
              }
            })
          } else {
            API.showToast('Network is not available - Please connect to internet and try again', 'short', 'center');
          }
        }
      }

    })

})();
