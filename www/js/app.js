//Author: TCS
angular.module('tca', ['ionic', 'ngCordova'])

  .run(function ($state, $ionicPlatform, $rootScope, API, $location, Auth, $ionicPopup, $ionicLoading) {

    if (Auth.isLoggedIn()) {
      $location.path("/home");
    } else {
      $location.path("/login");
    }

    $ionicPlatform.registerBackButtonAction(function (event) {
      if (true) {
        $ionicPopup.confirm({
          title: 'TCA',
          template: 'Are you sure you want to exit?'
        }).then(function (res) {
          if (res) {
            ionic.Platform.exitApp();
          }
        })
      }
    }, 100);

    $ionicPlatform.ready(function () {

      if (window.Connection) {
        if (navigator.connection.type == Connection.NONE) {
          $ionicPopup.confirm({
            title: "Internet Disconnected",
            content: "The internet is disconnected on your device."
          })
            .then(function (result) {
              if (!result) {
                ionic.Platform.exitApp();
              }
            });
        }
      }


      if (typeof (FCMPlugin) !== "undefined") {
        FCMPlugin.getToken(function (t) {
          localStorage.setItem("tokenid", t);
        }, function (e) {
          API.showToast('some error occoured');
        });

        FCMPlugin.onNotification(function (d) {
          var token = localStorage.getItem("token");
          if (d.wasTapped) {
            localStorage.setItem("pushTapped", d.wasTapped);
            if (Auth.isLoggedIn()) {
              API.show($ionicLoading);
              API.viewIncidentDetail({ id: d.ID, token: token })
                .then(function (response) {
                  API.showToast('Going to Detail Page', 'short', 'center');
                  $rootScope.incident = response;
                  if ($rootScope.incident) {
                    API.hide($ionicLoading);
                    $location.path("/ticket/" + d.ID);
                  }
                  else {
                    API.hide($ionicLoading);
                    $location.path("/home");
                    API.showToast(incident.IncId + ' ' + 'is Already claimed', 'short', 'center');
                  }
                })
            }
          }
          else {
            API.showToast('A new Incident has come');
            API.showToast('A new Incident has came', 'short', 'center');
            API.showToast('Refresh Page', 'long', 'center');
          }
        }, function (msg) {
        }, function (err) {
          API.showToast('some error occoured');
        });
      } else API.showToast("Notifications disabled, only provided in Android/iOS environment");

      var deviceInformation = ionic.Platform.device();
      localStorage.setItem("deviceid", deviceInformation.uuid);

      if (window.cordova && window.cordova.plugins.Keyboard) {

        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

        cordova.plugins.Keyboard.disableScroll(true);
      }
      if (window.StatusBar) {
        StatusBar.styleDefault();
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('home', {
        url: '/home',
        templateUrl: 'templates/home.html',
        controller: 'HomeCtrl',
        cache: false,
      })
      .state('ticket', {
        url: '/ticket/:incidentId',
        templateUrl: 'templates/ticket.html',
        controller: 'TicketCtrl'
      })
  });

