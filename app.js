angular.module('dressCode', ['ngRoute','ng-token-auth'])
.controller('dressCodeCtrl', DressCodeCtrl)
.controller('authCtrl',AuthCtrl)
.config(function ($routeProvider) {

 $routeProvider.
 when('/posts', {
   templateUrl: '/posts.html',
   controller: 'dressCodeCtrl'
  }).
 when('/signin', {
   templateUrl: '/signin.html',
   controller: 'authCtrl'
 }).
 when('/signup', {
   templateUrl: '/signup.html',
   controller: 'authCtrl'
 }).
 otherwise({
   redirectTo: '/'
 });
})
.config(function ($authProvider) {
  $authProvider.configure({
    apiUrl:    'http://localhost:3000',
    authProviderPaths: {
        facebook: '/auth/facebook',
        google: '/auth/google_oauth2',
        twitter: '/auth/twitter'
      }
  });
})
.factory('dressCodeApi', dressCodeApi)
.constant('DCAPI',
  'http://localhost:3000/api')

function AuthCtrl($scope, $auth, $location) {

  $scope.loginForm = {};
  $scope.registrationForm = {};

  $scope.handleLoginBtnClick = function() {
    $auth.submitLogin($scope.loginForm)
    .then(function(resp) {
        // handle success response
        $location.path('/posts')
      })
    .catch(function(resp) {
        // handle error response
        $location.path('/signin')
      });
  };

  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm)
    .then(function(resp) {
        // handle success response
        var login_info = {
          email: $scope.registrationForm.email,
          password: $scope.registrationForm.password
        }
        $auth.submitLogin(login_info)
        $location.path('/posts')
      })
    .catch(function(resp) {
        // handle error response
        $location.path('/register')
      });
  };

  $scope.handleSignOutBtnClick = function() {
    $auth.signOut()
    .then(function(resp) {
          // handle success response
        })
    .catch(function(resp) {
          // handle error response
        });
  };

  $scope.OauthBtnClick = function(provider) {
      $auth.authenticate(provider)
        .then(function(resp) {
          // handle success
          $location.path('/posts')
        })
        .catch(function(resp) {
          // handle errors
          $location.path('/register')
        });
    };

}

function DressCodeCtrl($scope, $http, dressCodeApi) {
  $scope.posts = [];
  $scope.errorMessage = '';
  $scope.success = '';
  $scope.isLoading = isLoading;
  $scope.caption = '';
  $scope.refreshPosts = refreshPosts;
  $scope.addTag = addTag;
  $scope.sendPost = sendPost;
  $scope.removePost = removePost;
  $scope.showPost = showPost;
  $scope.savePost = savePost;
  $scope.back = back;
  $scope.current = {};
  $scope.tag = '';
  $scope.tags = [];

  var loading = false;
  var selected = -1;
  setView('list');

  function setView(view) {
    $scope.view = view;
  }

  function isLoading() {
    return loading;
  }

  function addTag() {
    $scope.tags.push($scope.tag);
    $scope.tag = '';
  }

  function refreshPosts() {
    loading = true;
    $scope.posts = [];
    $scope.success = '';
    $scope.errorMessage = '';
    dressCodeApi.getPosts()
    .success(function (data) {
      $scope.posts = data.posts;
      loading = false;
    })
    .error(function () {
      $scope.errorMessage = "GET Request failed";
      loading = false;
    });
  }

  function sendPost() {
    loading = true;
    var newpost = { 'post': {
      'caption': $scope.caption,
      'location': '',
      'vote_type': 'updown',
      'anonymous': true,
      'active': true,
      'photo_count': 1
    },
    'other': {
      'images' : '',
      'post_tags': $scope.tags,
    }
  };

  $scope.success = '';
  $scope.errorMessage = '';
  dressCodeApi.addPost(newpost).success(
    function() {
      $scope.success = 'Post sent.';
      loading = false;
    })
  .error(function () {
    $scope.errorMessage = "POST Request failed";
    loading = false;
  });
}

function removePost(index) {
  loading = true;
  tmp = $scope.posts[index];
  $scope.success = '';
  $scope.errorMessage = '';
  dressCodeApi.deletePost(tmp).success(
    function() {
      $scope.success = 'Post removed.';
      loading = false;
    })
  .error(function () {
    $scope.errorMessage = "DELETE Request failed";
    loading = false;
  });
}

function showPost(index) {
  selected = index;
  $scope.current = $scope.posts[selected];
  setView('post');
}

function savePost() {
  var update = { 'post': {
    'caption': $scope.caption,
  },
};

dressCodeApi.updatePost(update,$scope.current.id).success(
  function() {
    $scope.success = 'Post updated.';
    $scope.current = {};
    setView('list');
  })
.error(function () {
  $scope.errorMessage = "UPDATE request failed";
});
}

function back() {
  setView('list');
}
}

function dressCodeApi($http, DCAPI) {

  var posturl = DCAPI + '/posts';
  var userurl = DCAPI + '/users';

  return {

    getPosts: function () {
      return $http.get(posturl);
    },

    addPost: function (post) {
      return $http.post(posturl,post)
    },

    deletePost: function (post) {
      var delurl = posturl + '/' + post.id;
      return $http.delete(delurl);
    },

    updatePost: function (post,id) {
      var puturl = posturl + '/' + id;
      return $http.put(puturl,post)
    }
  }
}
