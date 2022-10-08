(()=>{
    window.addEventListener('load',function(){
    
        //setup canvas    
        const canvas = this.document.getElementById("canvas1");
        const ctx = canvas.getContext('2d');
        canvas.width =1500;
        canvas.height=500;

        const EUNM = { 
            ARROW_UP : 'ArrowUp',
            ARROW_DOWN : 'ArrowDown'
        }

        // Classes
        class InputHandler{
            constructor(game){
                    this.game = game;
                    window.addEventListener('keydown',e => {
                    if ( (  (EUNM.ARROW_UP == e.key) || 
                            (EUNM.ARROW_DOWN == e.key)
                        ) && this.game.keys.indexOf(e.key) === -1 ){
                        this.game.keys.push(e.key)
                    }else if (e.key === ' '){
                        this.game.player.shootTop();
                    }else if( e.key =='d'){
                        this.game.debug = !this.game.debug;
                    }
                })


                window.addEventListener('keyup',e => {
                    const index = this.game.keys.indexOf(e.key);
                    if(index > -1 ){
                        this.game.keys.splice(index,1);
                    }
                })
            }
        }

        class Projectile{
            constructor(game , x, y){
                this.game = game;
                this.width= 10;
                this.height=2;
                this.x=x;
                this.y = y;
                this.speed=5;
                this.mrakedForDeletion = false;
                this.image=document.getElementById('projectile');
            }
            update(){
                this.x += this.speed;
                if ( this.x > this.game.width * 0.8 ) 
                    this.mrakedForDeletion = true;
            }
            draw(context){
                context.drawImage(this.image,this.x,this.y)
            }
        }

        class Particle{
            constructor(game,x,y){
                this.game= game;
                this.x=x;
                this.y=y;
                this.image = document.getElementById('gears')
                this.frameX=Math.floor(Math.random() * 3);
                this.frameY =Math.floor(Math.random()*3);
                this.spriteSize  = 50;
                this.sizeModifer = (Math.random() * 0.5 +0.5).toFixed(1);
                this.size = this.spriteSize * this.sizeModifer;
                this.speedX = Math.random() * 6 -3;
                this.speedY = Math.random() * -15;
                this.garvity = 0.5;
                this.mrakedForDeletion =false;
                this.angle =0;
                this.va = Math.random() *0.2 -0.1;
                this.bounced=0;
                this.bottomBouncedBoundary =Math.random()* 100 +60;
            }
            update(){
                this.angle += this.va;
                this.speedY += this.garvity;
                this.x -= this.speedX + this.game.speed;
                this.y += this.speedY;
                if ( this.y > this.game.height + this.size  || this.x < 0-this.size) 
                    this.mrakedForDeletion =true;
                
                // bouncing particles
                if( this.y > this.game.height - this.bottomBouncedBoundary && 
                    this.bounced < 5 ){
                    this.bounced++;
                    this.speedY *= -0.5;
                }
            }
            draw(context){
                context.save();
                // set the coordinate (x,y) to the x,y of the particle object
                context.translate(this.x, this.y);
                context.rotate(this.angle);
                context.drawImage(this.image,this.frameX,this.frameY*this.spriteSize,
                                this.spriteSize,this.spriteSize ,this.size* -0.5 ,this.size*-0.5 , this.size , this.size)
                context.restore();
            }
        }

        class Player{
            constructor(game){
                this.game= game;
                this.width = 120;
                this.height = 190;
                this.x=20;
                this.y=100;
                this.frameX= 0;
                this.frameY= 0;
                this.maxFrame=37;
                this.speedY =0;
                this.MaxSpeed = 5;
                this.projectiles= [];
                this.image = document.getElementById('player');
                this.powerUp=false;
                this.powerUpTimer=0;
                this.powerUpLimit= 10000;
            }

            update(deltaTime){
                if ( this.game.keys.includes(EUNM.ARROW_UP)) 
                    this.speedY = -this.MaxSpeed
                else if ( this.game.keys.includes(EUNM.ARROW_DOWN)) 
                    this.speedY = this.MaxSpeed
                else 
                    this.speedY =0;

                this.y += this.speedY;

                //vertical boundaries
                const BottomBoundary = this.game.height - this.height*0.5 ;
                const TopBoundary = -this.height*0.5;
                if ( this.y > BottomBoundary ) this.y = BottomBoundary;
                else if (this.y < TopBoundary) this.y=TopBoundary;
                /************************** */

                // handle  Projectile
                this.projectiles.forEach((projectile)=>{
                    projectile.update();
                });
               this.projectiles = this.projectiles.filter((projectile)=> !projectile.mrakedForDeletion)
                // sprite animtions
                if ( this.frameX < this.maxFrame){
                    this.frameX++;
                }else{
                    this.frameX =0;
                }
                // power up
                if ( this.powerUp){
                    if (this.powerUpTimer > this.powerUpLimit){
                        this.powerUpTimer = 0;
                        this.powerUp = false;
                        this.frameY=0;
                    }else{
                        this.powerUpTimer += deltaTime;
                        this.frameY=1;
                        this.game.ammo += 0.1;
                    }
                }
            }

            draw(context){
                context.fillStyle = 'black';
                // debug mode
               if(this.game.debug) 
                    context.strokeRect(this.x,this.y,this.width ,this.height);
                // **********

                // handle  Projectile
                this.projectiles.forEach((projectile)=>{
                    projectile.draw(context);
                });
                context.drawImage(this.image, this.frameX * this.width , this.frameY * this.height , this.width , this.height, this.x , this.y , this.width , this.height );

                
            }

            shootTop(){
                if ( this.game.ammo > 0 ){
                    this.projectiles.push(new Projectile(this.game ,this.x+80 , this.y+35))
                    this.game.ammo-- ;
                }
                if (this.powerUp) this.shootBottom();
            }

            shootBottom(){
                if ( this.game.ammo > 0 ){
                    this.projectiles.push(new Projectile(this.game ,this.x+80 , this.y+175))
                    this.game.ammo-- ;
                }
            }
            enterPowerUp(){
                this.powerUpTimer=0;
                this.powerUp=true;
                this.game.ammo = this.game.ammoMax;
            }
        }

        class Enemy{
            constructor(game){
                this.game = game;
                this.x = game.width;
                this.speedX = Math.random() * -1.5 - 0.5;
                this.mrakedForDeletion = false;
                this.frameY=0;
                this.frameX=10;
                this.maxFrame=37;
            }

            update(){
                this.x += this.speedX - this.game.speed;
                if ( this.x + this.width < 0) this.mrakedForDeletion = true;

                // sprite animation
                if ( this.frameX < this.maxFrame )
                    this.frameX++;
                else 
                    this.frameX=0;

            }

            draw(context){
                if ( this.game.debug ){
                    context.strokeRect(this.x,this.y,this.width , this.height);
                    context.font = '20px Helvetica';
                    context.fillText(this.lives , this.x , this.y);
                }
                    
                context.drawImage(this.image ,this.frameX*this.width , this.frameY*this.height,
                                this.width , this.height, this.x, this.y, this.width , this.height)

            }
        }

        class Angler1 extends Enemy {
            constructor(game){
                super(game);
                this.width = 228 ;
                this.height = 169 ;
                // the start y point is random between 0 and 90% of the game height and offseted of its height 
                this.y = Math.random() * (this.game.height * 0.9 - this.height );
                this.image=document.getElementById('angler1');
                this.frameY = Math.floor(Math.random() * 3);
                this.lives =2;
                this.score = this.lives;
            }
        }


        class Angler2 extends Enemy {
            constructor(game){
                super(game);
                this.width = 213
                this.height = 165 ;
                // the start y point is random between 0 and 90% of the game height and offseted of its height 
                this.y = Math.random() * (this.game.height * 0.9 - this.height );
                this.image=document.getElementById('angler2');
                this.frameY = Math.floor(Math.random() * 2);
                this.lives =3;
                this.score = this.lives;
            }
        }

        class LuckyFish extends Enemy {
            constructor(game){
                super(game);
                this.maxFrame=37;
                this.width = 98.95 ;
                this.height = 95 ;
                // the start y point is random between 0 and 90% of the game height and offseted of its height 
                this.y = Math.random() * (this.game.height * 0.9 - this.height );
                this.image=document.getElementById('lucky');
                this.frameY = Math.floor(Math.random() * 2);
                this.lives =3;
                this.score = 15;
                this.type='lucky'
            }
        }

        class Layer{
            constructor(game, image ,speedModifier){
                this.game = game ;
                this.image = image ;
                this.speedModifier = speedModifier;
                this.width = 1768;
                this.height = 500;
                this.x=0;
                this.y=0;
            }

            update(){
                if( this.x <= -this.width ) this.x=0;
                 this.x -= this.game.speed * this.speedModifier;
            }

            draw(context){
                context.drawImage(this.image, this.x , this.y);
                context.drawImage(this.image, this.x + this.width, this.y);
            }
        }
        class Background{
            constructor(game){
                this.game= game;
                this.image1 = document.getElementById('layer1');
                this.image2 = document.getElementById('layer2');
                this.image3 = document.getElementById('layer3');
                this.image4 = document.getElementById('layer4');
                this.layer1 = new Layer(this.game, this.image1 ,0.2);
                this.layer2 = new Layer(this.game, this.image2 ,0.4);
                this.layer3 = new Layer(this.game, this.image3 , 1);
                this.layer4 = new Layer(this.game, this.image4 , 1.5);
                this.layers=[this.layer1 , this.layer2 , this.layer3 ];
            }

            update(){
                this.layers.forEach(layer => layer.update() );
            }
            draw(context){
                this.layers.forEach(layer => layer.draw(context) );
            }
        }
        class UI{
            constructor(game){
                this.game = game;
                this.fontSize = 25;
                this.fontFamily = 'Bangers';
                this.color = 'white';
            }
            draw(context){
                // UI style
                // in order to apply shadow only on text in canvas , should but the shadow between (save()  and restore())
                context.save();
                context.font = this.fontSize + 'px '+ this.fontFamily;
                context.shadowOffsetX =2;
                context.shadowOffsetY =2;
                context.shadowColor ='black';
                context.fillStyle=this.color;

                // score
                context.fillText(`Score: ${this.game.score}` , 20 ,40);

                // game timer
                const formatedTime = (this.game.gameTime * 0.001).toFixed(1);
                context.fillText(`Timer : ${formatedTime}`, 20 , 100);

                // game over messages
                if ( this.game.gameOver){
                    // align text
                    context.textAlign = 'center';
                    let message1 , message2;
                    if ( this.game.score > this.game.winningScore ){
                        message1 = 'Most Wondrous!';
                        message2 = 'Well done explorer!';
                    }else{
                        message1 ='Blazes!';
                        message2 = 'Get my repair kit and try again!';
                    }
                    context.font = `70px ${this.fontFamily}` ;
                    context.fillText(message1 , this.game.width * 0.5 , this.game.height * 0.5  -20 )
                    context.font = `25px ${this.fontFamily}` ;
                    context.fillText(message2 , this.game.width * 0.5 , this.game.height * 0.5 + 20 )
                }

                // ammo
                if ( this.game.player.powerUp) context.fillStyle="#ffffbd";
                for(let i =0 ; i < this.game.ammo; i++){
                    context.fillRect(20+8*i, 50 , 3 , 20);
                }

                context.restore();
            }
        }
        class Game{
            constructor(width,height){
                this.width = width;
                this.height = height;
                this.player = new Player(this);
                this.input = new InputHandler(this);
                this.UI = new UI(this);
                this.Background= new Background(this)
                this.enemies = [];
                this.particles=[];
                this.enemyTimer= 0;
                this.enemyIntreval=1000;
                this.keys=[];
                this.ammo=20;
                this.ammoMax=50;
                this.ammoTimer =0;
                this.ammoIntreval=500;
                this.gameOver=false;
                this.score =0;
                this.winningScore = 10;
                this.gameTime = 0;
                this.timeLimit = 15000 ;
                this.speed = 1;
                this.debug= true;
            }

            update(deltaTime){
                if (!this.gameOver) this.gameTime += deltaTime;
                // if player loses.
                if ( this.gameTime > this.timeLimit ) {
                    this.gameOver = true;
                    this.deleteAllEnemies()
                }
                // update background
                this.Background.update();
                this.Background.layer4.update();
                // update player
                this.player.update(deltaTime);
                // charge one ammo every 500 ms
                if ( this.ammoTimer > this.ammoIntreval){
                    if (this.ammo < this.ammoMax) this.ammo++ ;
                    this.ammoTimer =0;
                }else{
                    this.ammoTimer += deltaTime;
                }
                /************************ */
                // update particles 
                this.particles.forEach(particle => particle.update());
                //check if the particle is marked as deleted
                this.particles = this.particles.filter(particle => !particle.mrakedForDeletion );

                // check Collision between player and enemies
                this.enemies.forEach(enemy =>{
                    enemy.update();
                    if ( this.checkCollision(this.player , enemy)){
                        enemy.mrakedForDeletion = true;
                        // create ten particles each time projectile collied with player
                        for (let i=0 ; i < 10 ; i++){
                            this.particles.push(new Particle(this,enemy.x+enemy.width
                                *0.5 , enemy.y+ enemy.height *0.5))
                        }
                        if (enemy.type == 'lucky') this.player.enterPowerUp();
                        else this.score-- ; 
                    }
                         

                    // check Collision between projectile and enemies
                    this.player.projectiles.forEach(prjectrile=>{
                        if (this.checkCollision(prjectrile,enemy)){
                            enemy.lives--;
                            // delete projectile
                            prjectrile.mrakedForDeletion = true;
                            // create one particle each time projectile collied with enemy
                            this.particles.push(new Particle(this,enemy.x+enemy.width
                                *0.5 , enemy.y+ enemy.height *0.5))
                            // delete an enemy if its live is 0 
                            if ( enemy.lives <= 0 ){
                                enemy.mrakedForDeletion = true;
                            // create ten particles each time enemy distroyed
                            for (let i=0 ; i < 10 ; i++){
                                this.particles.push(new Particle(this,enemy.x+enemy.width
                                    *0.5 , enemy.y+ enemy.height *0.5))
                            }
                                // update game score
                                if (!this.gameOver) this.score += enemy.score;
                                // if player wins
                                if ( this.score > this.winningScore ) {
                                    this.gameOver = true;
                                    this.deleteAllEnemies()
                                }
                            }
                        }
                    })
                })
                /***************************************** */

                this.enemies = this.enemies.filter((enemy)=> !enemy.mrakedForDeletion)
                
                // add one enemy every 1 sec
                if ( this.enemyTimer > this.enemyIntreval && !this.gameOver){
                    this.addEnemy();
                    this.enemyTimer = 0;
                }else{
                    this.enemyTimer += deltaTime;
                }
                /************************ */

            }
             deleteAllEnemies(){
                this.enemies=[];
            }
            draw(context){
                this.Background.draw(context)
                this.player.draw(context);
                this.UI.draw(context);
                this.particles.forEach(particle=>particle.draw(context))
                this.enemies.forEach(enemy =>{
                    enemy.draw(context);
                });
                this.Background.layer4.draw(context)
            }

            addEnemy(){
                 const randomize = Math.random();
                if ( randomize < 0.3 )
                    this.enemies.push(new Angler1(this));
                else if (randomize < 0.6)
                    this.enemies.push(new Angler2(this));
                else
                    this.enemies.push(new LuckyFish(this));

                    
            }

            checkCollision(react1 , react2){
                return( react1.x < react2.x+ react2.width && 
                        react1.x + react1.width >  react2.x &&
                        react1.y < react2.y + react2.height &&
                        react1.y + react1.height > react2.y 

                )
            }
        }

        const game = new Game(canvas.width,canvas.height);
        let lastTime = 0;
        // animation loop
        function animate(timeStamp){
            const deltaTime = timeStamp - lastTime;
            lastTime = timeStamp;
            ctx.clearRect(0,0,canvas.width , canvas.height)
            game.update(deltaTime);
            game.draw(ctx);
            // requst an animation before next repaint 
            requestAnimationFrame(animate)
        }
        animate(0);

        /************************************ */
    })
})()