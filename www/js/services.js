(function() {
'use strict';
angular.module('tca')
.factory('API', function($http,$cordovaToast, $ionicLoading) {
  
  return {
    show: function() {
    return $ionicLoading.show({
      template: '<p>Loading...</p><ion-spinner></ion-spinner>'
    })
  },

  hide: function() {
    return  $ionicLoading.hide();
  },

  login: function(form) {
    return $http({
    method: 'POST',
    url: "https://stagetca.tronc.com/api/tca/IsLogin",
    headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
    },
      data: form
    })
  },
    
  get: function(data){
    return $http.get("https://stagetca.tronc.com/api/tca/get?token="+ data.token);
  },

  getGroupList: function(){
    return $http.get('https://stagetca.tronc.com/api/tca/grouplist/');
  },

  claim: function(data){
    return $http.get("https://stagetca.tronc.com/api/tca/claimInc?IncId=" + data.IncId + "&token=" + data.token);
  },

  showToast: function(message, duration, location) {
    $cordovaToast.show(message, duration, location).then(function(success) {
      console.log("The toast was shown");
    }, function (error) {
    });
  },

  viewIncidentDetail: function(data){
    var promise =  $http.get("https://stagetca.tronc.com/api/tca/get?token="+ data.token)
      .then(function(response) {
        var incidents = JSON.stringify(response.data);
        var incidentDtl = {};

        for (var i = 0; i < response.data.length; i++) {
          if (response.data[i].Id === parseInt(data.id)) {
            incidentDtl = response.data[i];
          }
        }
      return incidentDtl;
     })
  return promise;
  }
}
})

.factory('Auth', function () {
   if (localStorage['session']) {
      var _user = localStorage['session'];
   }
   var setUser = function (session) {
      _user = session;
      localStorage['session'] = JSON.stringify(_user);
   }

   return {
      setUser: setUser,
      isLoggedIn: function () {
         return _user ? true : false;
      },
      getUser: function () {
         return _user;
      },
      logout: function () {
         window.localStorage.removeItem("session");
         window.localStorage.removeItem("list_dependents");
         _user = null;
      }
   }
})

})();