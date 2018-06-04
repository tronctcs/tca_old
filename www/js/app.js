//Author: Abhishek Sharma
angular.module('tca', ['ionic','ngCordova'])

.run(function($state, $ionicPlatform, $rootScope,API,$location,Auth,$ionicPopup,$ionicLoading) {

  if(Auth.isLoggedIn()){
    $location.path("/home"); 
  } else{
    $location.path("/login");
   // API.showToast('Not Loggedin - Please Login again', 'short', 'center');
  }


  $ionicPlatform.registerBackButtonAction(function(event) {
    if (true) { 
      $ionicPopup.confirm({
        title: 'TCA',
        template: 'Are you sure you want to exit?'
      }).then(function(res) {
        if (res) {
          ionic.Platform.exitApp();
        }
      })
    }
  }, 100);

$ionicPlatform.ready(function() {

    if(window.Connection) {
    if(navigator.connection.type == Connection.NONE) {
        $ionicPopup.confirm({
        title: "Internet Disconnected",
        content: "The internet is disconnected on your device."
        })
        .then(function(result) {
          if(!result) {
            ionic.Platform.exitApp();
          }
        });
      }
    }


    if(typeof(FCMPlugin) !== "undefined"){
     // alert("Inside FCM Plugin if block");
        FCMPlugin.getToken(function(t){
         //  alert("Inside Get Token block b4 store localstorage");
          localStorage.setItem("tokenid", t);
          // alert("Inside Get Token block after store localstorage");
          // alert(localStorage.getItem("tokenid"));
        }, function(e){
          alert("Uh-Oh!\n"+e);
    });

    FCMPlugin.onNotification(function(d){
     // alert("Inside onNotification b4 trapped");
      var token = localStorage.getItem("token");
     // var userid = localStorage.getItem("userid");
      if(d.wasTapped){ 
     // alert("Inside onNotification d.wasTrapped "); 
        localStorage.setItem("pushTapped",d.wasTapped);
        if(Auth.isLoggedIn()){
          API.show($ionicLoading);
          API.viewIncidentDetail({id: d.ID, token: token})
            .then(function(response) {
              API.showToast('Going to Detail Page', 'short', 'center');
              $rootScope.incident = response;
              if ($rootScope.incident){
                API.hide($ionicLoading);
                $location.path("/ticket/"+ d.ID);
              }
              else{
                API.hide($ionicLoading);
                $location.path("/home");
                API.showToast(incident.IncId +' ' + 'is Already claimed', 'short', 'center');
              }
          })
        }
      } 
      else {
         API.showToast('A new Incident has come');
        // Foreground recieval, update UI or what have you...
        API.showToast('A new Incident has came', 'short', 'center');
        API.showToast('Refresh Page', 'long', 'center');
      }
    }, function(msg){
    //  alert("message:",msg);
    }, function(err){
      alert("Arf, no good mate... " + err);
    });
  } else alert("Notifications disabled, only provided in Android/iOS environment");

    var deviceInformation = ionic.Platform.device();
    localStorage.setItem("deviceid", deviceInformation.uuid);

    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
        
  
$stateProvider
.state('login',{
       url: '/login',
       templateUrl: 'templates/login.html',
       controller: 'LoginCtrl'
     })

.state('home',{
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
 // $urlRouterProvider.otherwise('/login');
});

