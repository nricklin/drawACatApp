angular.module( 'drawACat', [
        'templates-app',
        'templates-common',
        'ui.router',
        'drawACat.home',
        'drawACat.cat',
        'drawACat.draw',
        'drawACat.common.services',
        'drawACat.common.directives',
        'drawACat.common.filters'
    ])

    .value('CONFIG', {
        API_URL: 'http://192.168.0.10/GitHub/drawACatApp/api/',
        THUMBNAILS_URL: 'http://192.168.0.10/GitHub/drawACatApp/api/thumbnails/',
        AUDIO_FILES_URL: 'assets/audio/',
        FILL_COLOUR: '#f5f5f5',
        STROKE_COLOUR: '#333333'
    })

    .config( function myAppConfig ( $stateProvider, $urlRouterProvider, $locationProvider ) {
        $locationProvider.hashPrefix("!");
        $urlRouterProvider.otherwise( 'home' );
    })

    .run( function run (rafPolyfill) {
        rafPolyfill.run();// polyfill the $window.requestAnimationFrame, cancelAnimationFrame methods
    })

    .controller( 'AppController', function AppController ( $scope, $state, $location, $anchorScroll, audioPlayer, renderer ) {
        $scope.$on('$stateChangeSuccess', function(event, toState){
            if ( angular.isDefined( toState.data.pageTitle ) ) {
                $scope.pageTitle = toState.data.pageTitle ;
            }
            $anchorScroll();
        });

        $scope.$on('metadata:updated', function(event, metaData) {
            $scope.metaData = metaData;
        });

        $scope.scrollTo = function(id) {
            var old = $location.hash();
            $location.hash(id);
            $anchorScroll();
            //reset to old to keep any additional routing logic from kicking in
            $location.hash(old);
        };

        $scope.audioSetting = "on";
        $scope.toggleAudio = function() {
            if ($scope.audioSetting == "on") {
                audioPlayer.setAudio(false);
                $scope.audioSetting = "off";
            } else {
                audioPlayer.setAudio(true);
                $scope.audioSetting = "on";
            }
        };
    })

;

