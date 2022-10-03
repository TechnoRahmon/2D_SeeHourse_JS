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
                if ( this.game.amo > 0 ){
                    this.projectiles.push(new Projectile(this.game ,this.x , this.y))
                    this.game.amo-- ;
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

        }
        class Game{
            constructor(width,height){
                this.width = width;
                this.height = height;
                this.player = new Player(this);
                this.input = new InputHandler(this);
                this.keys=[];
                this.amo=20;
            }

            update(){
                this.player.update();
            }

            draw(context){
                this.player.draw(context);
            }
        }

        const game = new Game(canvas.width,canvas.height);
        // animation loop
        function animate(){
            ctx.clearRect(0,0,canvas.width , canvas.height)
            game.update();
            game.draw(ctx);
            // requst an animation before next repaint 
            requestAnimationFrame(animate)
        }
        animate();

        /************************************ */
    })
})()