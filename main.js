let desiredWidth, desiredHeight;
// Create the Phaser game configuration
var browserWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
var browserHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

// Check if the device is in portrait mode (height > width)
var isPortrait = browserHeight > browserWidth;

// Calculate the desired width and height based on the aspect ratio
desiredWidth = isPortrait ? browserHeight * (1080 / 600) : browserWidth;
desiredHeight = isPortrait ? browserHeight : browserWidth * (600 / 1080);

desiredHeight *= 0.85;
desiredWidth *= 0.9;

const config = {
  type: Phaser.AUTO,
  width: desiredWidth,
  height: desiredHeight,
  physics: {
    default: 'arcade',
    arcade: {
        debug: false
    }
},
  scene: [Play, Credit, BadEnd, GoodEnd],
  scale: {autoCenter: Phaser.Scale.CENTER_BOTH}
};

// Create the Phaser game instance
const game = new Phaser.Game(config);

