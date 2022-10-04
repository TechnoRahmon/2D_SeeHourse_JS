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
                this.speed=3;
                this.mrakedForDeletion = false;
            }
            update(){
                this.x += this.speed;
                if ( this.x > this.game.width * 0.8 ) this.mrakedForDeletion = true;
            }
            draw(context){
                context.fillStyle = 'yellow';
                context.fillRect(this.x , this.y , this.width , this.height)
            }
        }

        class Particle{

        }

        class Player{
            constructor(game){
                this.game= game;
                this.width = 120;
                this.height = 190;
                this.x=20;
                this.y=100;
                this.speedY =0;
                this.MaxSpeed = 5;
                this.projectiles= [];
            }

            update(){
                if ( this.game.keys.includes(EUNM.ARROW_UP)) 
                    this.speedY = -this.MaxSpeed
                else if ( this.game.keys.includes(EUNM.ARROW_DOWN)) 
                    this.speedY = this.MaxSpeed
                else 
                    this.speedY =0;

                this.y += this.speedY;
                // handle  Projectile
                this.projectiles.forEach((projectile)=>{
                    projectile.update();
                });
               this.projectiles = this.projectiles.filter((projectile)=> !projectile.mrakedForDeletion)

            }

            draw(context){
                context.fillStyle = 'black';
                context.fillRect(this.x,this.y,this.width ,this.height);
                // handle  Projectile
                this.projectiles.forEach((projectile)=>{
                    projectile.draw(context);
                });
                
            }

            shootTop(){
                if ( this.game.ammo > 0 ){
                    this.projectiles.push(new Projectile(this.game ,this.x , this.y))
                    this.game.ammo-- ;
                }
            }
        }

        class Enemy{
            constructor(game){
                this.game = game;
                this.x = game.width;
                this.speedX = Math.random() * -1.5 - 0.5;
                this.mrakedForDeletion = false;
                this.lives =5;
                this.score = this.lives;
            }

            update(){
                this.x += this.speedX;
                if ( this.x + this.width < 0) this.mrakedForDeletion = true;

            }

            draw(context){
                context.fillStyle = 'red';
                context.fillRect(this.x,this.y,this.width , this.height);
                context.fillStyle = 'black';
                context.font = '20px Helvetica';
                context.fillText(this.lives , this.x , this.y);
            }
        }

        class Angler1 extends Enemy {
            constructor(game){
                super(game);
                this.width = 228 * 0.5;
                this.height = 169 * 0.5;
                // the start y point is random between 0 and 90% of the game height and offseted of its height 
                this.y = Math.random() * (this.game.height * 0.9 - this.height );
            }
        }

        class Layer{

        }
        class Background{

        }
        class UI{
            constructor(game){
                this.game = game;
                this.fontSize = 25;
                this.fontFamily = 'Helvetica';
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
                // ammo
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
                this.enemies = [];
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
            }

            update(deltaTime){
                this.player.update();
                // charge one ammo every 500 ms
                if ( this.ammoTimer > this.ammoIntreval){
                    if (this.ammo < this.ammoMax) this.ammo++ ;
                    this.ammoTimer =0;
                }else{
                    this.ammoTimer += deltaTime;
                }
                /************************ */

                // check Collision between player and enemies
                this.enemies.forEach(enemy =>{
                    enemy.update();
                    if ( this.checkCollision(this.player , enemy))
                        enemy.mrakedForDeletion = true; 

                    // check Collision between projectile and enemies
                    this.player.projectiles.forEach(prjectrile=>{
                        if (this.checkCollision(prjectrile,enemy)){
                            enemy.lives--;
                            // delete projectile
                            prjectrile.mrakedForDeletion = true;
                            // delete an enemy if its live is 0 
                            if ( enemy.lives <= 0 ){
                                enemy.mrakedForDeletion = true;
                                // update game score
                                this.score += enemy.score;
                                if ( this.score > this.winningScore ) this.gameOver = true;
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

            draw(context){
                this.player.draw(context);
                this.UI.draw(context);
                this.enemies.forEach(enemy =>{
                    enemy.draw(context);
                })
            }

            addEnemy(){
                this.enemies.push(new Angler1(this));
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