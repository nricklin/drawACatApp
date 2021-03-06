/**
 * Created by Michael on 10/03/14.
 */

angular.module('drawACat.cat.services')
/**
 * Te actuator service is responsible for all the macro behaviours of the cat such as blinking, meowing, and so on.
 */
    .factory('actuator', function($timeout, noiseFactory, audioPlayer) {

        var cat;
        var actuatorFunctions = [];
        var timeoutRef;
        audioPlayer.init();

        //noinspection JSClosureCompilerSyntax
        /**
         * Helper function to return the behaviour object of the specified partName
         * @param partName
         * returns {.head.behaviour|*|.eyesOpen.behaviour|.eyesClosed.behaviour|.mouthOpen.behaviour|.mouthClosed.behaviour}
         */
        var b = function(partName) {
            return cat.bodyParts[partName].behaviour;
        };

        /**
         * Master loop that runs all the actuator() functions that have been added to the actuatorFunctions array.
         */
        var actuatorLoop = function() {
            angular.forEach(actuatorFunctions, function(functionName) {
                functionName.actuate();
            });

            timeoutRef = $timeout(actuatorLoop, 16);
        };

        var actuateEmotions = function() {
            var expressionTimeOutId;
            var isPurring = false;
            return {
                actuate: function() {
                    if (cat.emotion.isHappy()) {
                        if (!isPurring) {
                            $timeout.cancel(expressionTimeOutId);
                            isPurring = true;
                            purr();
                            audioPlayer.purrStart();
                        } else {
                            audioPlayer.setPurrVolume(cat.emotion.getMoodValue().happy);
                        }
                    } else {
                        if (isPurring) {
                            isPurring = false;
                            audioPlayer.purrStop();
                            backToNormal();
                            //console.log('stopped purring');
                        }

                        var expression = ['blink'];
                        if (cat.emotion.isExcited()) {
                            expression.push('excited');
                        }
                        if (cat.emotion.isBored()) {
                            expression.push('bored');
                        }
                        if (cat.emotion.isAngry()) {
                            expression.push('angry');
                        }

                        if (Math.random() < 0.01) {
                            var emotionToExpress = expression[getRandomInt(0, expression.length - 1)];
                            if (emotionToExpress === 'blink') {
                                closeEyes();
                                expressionTimeOutId = $timeout(openEyes, 200);
                            } else if (emotionToExpress === 'bored') {
                                yawn();
                                expressionTimeOutId = $timeout(backToNormal, 1000);
                            } else if (emotionToExpress === 'angry') {
                                angryMeow();
                                expressionTimeOutId = $timeout(backToNormal, 500);
                            } else if (emotionToExpress === 'excited') {
                                excitedMeow();
                                expressionTimeOutId = $timeout(backToNormal, 500);
                            }
                        }
                    }
                }
            };
        };
        //http://stackoverflow.com/a/1527820/772859
        function getRandomInt (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }


        /**
         * Cause the range value of the legs to be randomly modulated according to the noise generator.
         * This creates the effect of natural movement of the legs.
         */
        var actuateLegs = function() {
            // store the original range value for each leg, so we can multiply it by the
            // noise factor to get a modulated value.
            b('leftLeg').rangeOriginal = b('leftLeg').range;
            b('rightLeg').rangeOriginal = b('rightLeg').range;

            var i = 1;

            var leftLegNoise = noiseFactory.newGenerator();
            leftLegNoise.setFrequency(0.1);
            var rightLegNoise = noiseFactory.newGenerator();
            rightLegNoise.setFrequency(0.1);

            return {
                actuate: function() {
                    b('leftLeg').range = leftLegNoise.getVal(i) * b('leftLeg').rangeOriginal;
                    b('rightLeg').range = rightLegNoise.getVal(i) * b('rightLeg').rangeOriginal;
                    i ++;
                }
            };
        };

        var actuateHead = function() {
            b('head').rangeOriginal = b('head').range;
            var i = 1;

            var headNoise = noiseFactory.newGenerator();
            headNoise.setFrequency(0.05);

            return {
                actuate: function() {
                    var dampenedNoise = headNoise.getVal(i)/2 + 0.5;
                    b('head').range = dampenedNoise * b('head').rangeOriginal;
                    i++;
                }
            };
        };

        var purr = function() {
            closeEyes();
            closeMouth();
        };
        var yawn = function() {
            closeEyes();
            openMouth();
            //audioPlayer.yawn(cat.emotion.getMoodValue().bored); // sounds weird to hear a cat yawn.
        };
        var angryMeow = function() {
            openEyes();
            openMouth();
            audioPlayer.angryMeow(cat.emotion.getMoodValue().angry);
        };
        var excitedMeow = function() {
            closeEyes();
            openMouth();
            audioPlayer.excitedMeow(cat.emotion.getMoodValue().excited);
        };
        var backToNormal = function() {
            openEyes();
            closeMouth();
        };
        var closeEyes = function() {
            b('eyesOpen').visible = false;
            b('eyesClosed').visible = true;
        };
        var openEyes = function() {
            b('eyesOpen').visible = true;
            b('eyesClosed').visible = false;
        };

        var closeMouth = function(){
            b('mouthOpen').visible = false;
            b('mouthClosed').visible = true;
        };
        var openMouth = function(){
            b('mouthOpen').visible = true;
            b('mouthClosed').visible = false;
        };


        return {
            init: function(newCat) {
                cat = newCat;
                // set the initial state of the cat
                openEyes();
                closeMouth();

                // register the functions that will run the in main actuatorLoop
                actuatorFunctions.push(actuateLegs());
                actuatorFunctions.push(actuateHead());
                actuatorFunctions.push(actuateEmotions());

                actuatorLoop();
            },
            destroy: function() {
                $timeout.cancel(timeoutRef);
                audioPlayer.reset();
            }
        };

    });