class Play extends Phaser.Scene {
    constructor() {
        super({key: "Play"});
    }

    preload() {
        this.load.path = "./assets/";
        //this.load.image("title", "image/title.png");
        //this.load.image('ground', 'image/background.png')
        //this.load.image('character', 'image/bobbytheMC.png')
        this.load.audio("bgm", "audio/bgm.mp3");
        this.load.image('ground', 'image/background.png')
        this.load.image('character', 'image/mc.png')
        this.load.image('cards', 'image/tfcard.png')
        this.load.image('enemy1', 'image/police.png')
        this.load.audio("atkhit", "audio/atkhit.mp3");
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');
        this.enemies = this.physics.add.group();
        this.cards = this.physics.add.group();
        this.ended = false;
        this.cameras.main.setBackgroundColor('#ffffff');
        this.sound.stopAll();
        let bgm = this.sound.add("bgm", {loop : true, autoPlay: true});
        bgm.play();
        bgm.setVolume(1);
        let isPlaying = true;
        let textConfig = {
            fontSize: Math.round(game.config.width * 0.025) + 'px', // Adjust the scaling factor as needed
            color: '#000000'
        };

        let background = this.add.image(0, 0, 'ground');
        background.setScale(desiredWidth / background.width, desiredHeight / background.height);
        background.setScale(15); // Set the scale to make it 10 times bigger
        background.setPosition(desiredWidth / 2, desiredHeight / 2);
        // Get the scaled dimensions of the background image
        const scaledWidth = background.width * background.scaleX;
        const scaledHeight = background.height * background.scaleY;

        // Set the size of the physics world to match the scaled background size
        this.physics.world.setBounds(0.43*(-scaledWidth/2), 0.35*(-scaledHeight/2), 0.5*(scaledWidth), 0.4*(scaledHeight));

        this.player = this.physics.add.sprite(desiredWidth / 2, desiredHeight / 2, 'character').setScale(1);
        this.cameras.main.startFollow(this.player);
        this.physics.world.enable(this.player);
        this.player.setCollideWorldBounds(true);

        this.time.addEvent({
            delay: 5000, // 5 seconds
            loop: true,
            callback: this.spawnEnemy,
            callbackScope: this
        });

        this.time.addEvent({
            delay: 15000, // 15 second
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.time.addEvent({
            delay: 20000, // 20 second
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.physics.add.collider(this.player, this.enemies, this.Playerhit, null, this);

        this.cursors = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });

        this.cardDelay = 1500; // Delay between card throws in milliseconds
        this.lastCardTime = 0; // Timestamp of the last card throw

        let countdownTextCreated = false;
        let countdownText = this.add.text(desiredWidth / 2, desiredHeight * 0.1, '', textConfig);

        if (!countdownTextCreated) {
            countdownText.setText('60');
            countdownText.setOrigin(0.5);
            countdownText.setScrollFactor(0);
            //countdownText.background("#FFFFFF");
            countdownTextCreated = true;
        }

        this.countdown = 60;

        this.time.addEvent({
            delay: 1000, // 1 second
            callback: updateCountdown,
            callbackScope: this,
            loop: true
        });

        function updateCountdown() {
            if (this.countdown <= 0) {
                this.scene.start('GoodEnd');
            }

            else {
                this.countdown--;
                countdownText.setText(this.countdown.toString());
            }
        }

        this.input.on('pointerdown', (pointer) => {
            const currentTime = this.time.now;

            if (currentTime - this.lastCardTime >= this.cardDelay) {
                this.lastCardTime = currentTime;

                const playerX = this.player.x;
                const playerY = this.player.y;
                const pointerX = pointer.worldX;
                const pointerY = pointer.worldY;
            
                // Calculate the angle between the player and the pointer
                const angle = Phaser.Math.Angle.Between(playerX, playerY, pointerX, pointerY);
            
                // Create the three cards with different angles
                for (let i = -1; i <= 1; i++) {
                    const card = this.physics.add.sprite(playerX, playerY, 'cards');
                    const cardAngle = angle + Phaser.Math.DegToRad(i * 15);
                    const cardSpeed = 500;
                    this.cards.add(card);
                    // Set the velocity of the card towards the pointer
                    card.setVelocity(
                        Math.cos(cardAngle) * cardSpeed,
                        Math.sin(cardAngle) * cardSpeed
                    );

                    card.setRotation(cardAngle);

                    this.time.delayedCall(3000, () => {
                        card.destroy();
                    }, [], this);

                    
                }
            }

            this.physics.add.collider(this.cards, this.enemies, this.Cardhit, null, this);
        });
    }

    spawnEnemy() {
        if (!this.ended) {
            //const spawnDistance = desiredWidth; // Adjust the distance from the player as needed
            const enemyCount = 5; // Number of enemies to spawn
            const spacing = 50; // Spacing between each enemy
        
            // Calculate the total width of all enemies and spacing
            const totalWidth = (enemyCount - 1) * spacing;
            // Get a random number between 0 and 1
            let randomValue = Phaser.Math.Between(0, 1);

            // Map the randomValue to a range of 1 and -1
            let randomSign = randomValue === 0 ? -1 : 1;

            // Calculate the starting X position
            const startX = this.player.x + (desiredWidth * 0.5 * randomSign);
        
            for (let i = 0; i < enemyCount; i++) {
                // Calculate the spawn position based on the current index
                const spawnX = startX + i * spacing;
                const spawnY = this.player.y * 0.5* randomSign;
        
                // Create the enemy sprite at the spawn position
                const enemy = this.physics.add.sprite(spawnX, spawnY, 'enemy1');
                enemy.setScale(1);
                this.enemies.add(enemy, true);

                enemy.body.setCollideWorldBounds(true);

                // ...
            }
        }
    }
    
    Cardhit(card, enemy) {
        // Destroy the card and enemy
        let sfx = this.sound.add("atkhit", {loop : false, autoplay: true});
        sfx.play();
        sfx.setVolume(1);

        card.destroy();
        enemy.destroy();
    }
    
    Playerhit(player, enemy) {
        this.ended = true;
        this.tweens.add({
            targets: player,
            angle: '+=' + 90, // Rotate by 90 degrees to the right
            duration: 1000,
            ease: 'Linear',
            onComplete: () => {
                this.scene.start('BadEnd');
            },
            callbackScope: this
        });
    }

    update() {
        if (!this.ended) { // Handle player movement
            let movingUp = false;
            let movingDown = false;
            let movingLeft = false;
            let movingRight = false;

            if (this.cursors.up.isDown) {
                this.movingUp = true;
                this.player.setVelocityY(-250);
            } else if (this.cursors.down.isDown) {
                this.movingDown = true;
                this.player.setVelocityY(250);
            } else {
                this.movingUp = false;
                this.movingDown = false;
                this.player.setVelocityY(0); // Stop vertical movement
            }
            
            if (this.cursors.left.isDown) {
                this.movingLeft = true;
                this.player.setVelocityX(-250);
            } else if (this.cursors.right.isDown) {
                this.movingRight = true;
                this.player.setVelocityX(250);
            } else {
                this.movingLeft = false;
                this.movingRight = false
                this.player.setVelocityX(0); // Stop horizontal movement
            }

            this.enemies.getChildren().forEach((enemy) => {
                // Move the enemy towards the player
                this.physics.moveToObject(enemy, this.player, 320);
            });
        }
    }
}

class BadEnd extends Phaser.Scene {
    constructor() {
        super({key: 'BadEnd'});
    }

    create() {
        this.cameras.main.fadeIn(1000, 255, 255, 255);
        this.cameras.main.setBackgroundColor('#ffffff');

        let textConfig = {
            fontSize: Math.round(game.config.width * 0.025) + 'px', // Adjust the scaling factor as needed
            color: '#000000'
        };

        let endText = this.add.text(desiredWidth / 2, desiredHeight / 2, "Bad Ending: You got caught\nLeft click to restart", textConfig).setOrigin(0.5);
        this.input.on('pointerdown', (pointer) => {
            // Check if left button was pressed
            if (pointer.leftButtonDown()) {
                // Transition to the Play scene
                this.scene.start('Play');
            }
        }); 
    }
}

class GoodEnd extends Phaser.Scene {
    constructor() {
        super({key: 'GoodEnd'});
    }

    create() {
        this.cameras.main.fadeIn(1000, 255, 255, 255);
        this.cameras.main.setBackgroundColor('#ffffff');
        
        let textConfig = {
            fontSize: Math.round(game.config.width * 0.025) + 'px', // Adjust the scaling factor as needed
            color: '#000000'
        };

        let endText = this.add.text(desiredWidth / 2, desiredHeight / 2, "Good Ending: You survived\nLeft click to restart", textConfig).setOrigin(0.5);
        this.input.on('pointerdown', (pointer) => {
            // Check if left button was pressed
            if (pointer.leftButtonDown()) {
                // Transition to the Play scene
                this.scene.start('Play');
            }
        }); 
    }
}

class Credit extends Phaser.Scene {
    constructor() {
        super({key: "Credit"});
    }

    create() {
        this.cameras.main.setBackgroundColor('#ffffff');
        let textConfig = {
            fontSize: Math.round(game.config.width * 0.025) + 'px', // Adjust the scaling factor as needed
            color: '#000000'
        };
        let tempSet = this.add.text(desiredWidth / 2, desiredHeight / 2, "Core gameplay: Nguyen Vu\nArt: Jeevithan Mahenthran\nConcepts and Cinematic: Gabriel Yunjia", textConfig).setOrigin(0.5);
        let textBack = this.add.text(desiredWidth * 0.1, desiredHeight * 0.9, "Back", textConfig).setOrigin(0.5);
        let back = this.add.rectangle(desiredWidth * 0.1, desiredHeight * 0.9, desiredWidth* (200/1080), desiredHeight * (100/600), 0x000000);
        back.setAlpha(0.001);
        back.setInteractive(); // Make the rectangle interactive for input events

        back.on('pointerup', function() {
            this.scene.start('Play');
        }, this);
    }
}
