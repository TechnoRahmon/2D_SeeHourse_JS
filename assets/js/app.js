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
                this.color = 'yellow';
            }
            draw(context){
                context.fillStyle=this.color;
                for(let i =0 ; i < this.game.ammo; i++){
                    context.fillRect(20+8*i, 50 , 3 , 20);
                }
            }
        }
        class Game{
            constructor(width,height){
                this.width = width;
                this.height = height;
                this.player = new Player(this);
                this.input = new InputHandler(this);
                this.UI = new UI(this);
                this.keys=[];
                this.ammo=20;
                this.ammoMax=50;
                this.ammoTimer =0;
                this.ammoIntreval=500;
                
            }

            update(deltaTime){
                this.player.update();
                if ( this.ammoTimer > this.ammoIntreval){
                    if (this.ammo < this.ammoMax) this.ammo++ ;
                    this.ammoTimer =0;
                }else{
                    this.ammoTimer += deltaTime;
                }
            }

            draw(context){
                this.player.draw(context);
                this.UI.draw(context);
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