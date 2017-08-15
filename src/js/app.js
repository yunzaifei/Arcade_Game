// 这是我们的玩家要躲避的敌人 
var Enemy = function() {
    // 要应用到每个敌人的实例的变量写在这里
    // 我们已经提供了一个来帮助你实现更多
    this.x = Math.floor(Math.random()*ctx.canvas.width) - 400;
    this.y = Math.ceil(Math.random()*3);
    this.isStop = false;

    // 敌人的图片或者雪碧图，用一个我们提供的工具函数来轻松的加载文件
    this.sprite = 'images/enemy-bug.png';
};

// 此为游戏必须的函数，用来更新敌人的位置
// 参数: dt ，表示时间间隙
Enemy.prototype.update = function(dt) {
    // 你应该给每一次的移动都乘以 dt 参数，以此来保证游戏在所有的电脑上
    // 都是以同样的速度运行的
    if(!this.isStop){
        this.x += Math.round(dt*100);
        if(this.x > ctx.canvas.width){
            this.x = Math.floor(Math.random()*-300);
            this.y = Math.ceil(Math.random()*3);
        }
        this.bump(player, bumpEnemie);
    }
};

// 此为游戏必须的函数，用来在屏幕上画出敌人，
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y*yStep - 10);
};

Enemy.prototype.bump = function(player, callback){
    if(this.y === player.y && Math.abs(this.x - player.x*xStep) < 80){
        //console.log("player: x-%s y-%s, enemy: x-%s y-%s", player.x*xStep, player.y, this.x, this.y);
        if(!player.invincible){
            player.herats -= 1;
            if(player.herats < 1){
                callback('isBump');
            }else{
                player.Invincible(500);
            }
        }
    }
}

// 现在实现你自己的玩家类
// 这个类需要一个 update() 函数， render() 函数和一个 handleInput()函数
var Player = function(type){
    this.x = 2;
    this.y = 5;
    this.lastX = 2;
    this.lastY = 5;
    this.isPass = false;
    this.isBump = false;
    this.herats = 1;
    this.scores = 0;
    this.level = 1;
    this.invincible = false;

    this.changePlayer();
};

// 此为游戏必须的函数，用来更新玩家的位置
Player.prototype.update = function() {
    if(this.y == 0){
        this.isPass = true;
    }else{
        this.checkProp();
    }
    document.getElementById('scores').innerHTML = this.scores;
    document.getElementById('hearts').innerHTML = this.herats;
    document.getElementById('level').innerHTML = this.level;
};

Player.prototype.changePlayer = function(type){
    type = type || 'boy';
    var type_img = {
        'boy': 'images/char-boy.png',
        'cat-girl': 'images/char-cat-girl.png',
        'horn-girl': 'images/char-horn-girl.png',
        'pink-girl': 'images/char-pink-girl.png',
        'princess-girl': 'images/char-princess-girl.png'
    };
    this.sprite = type_img[type];
}

//处理玩家碰到道具
Player.prototype.checkProp = function(){
    for(var i=0; i< allProps.length; i++){
        var prop = allProps[i];
        if(prop.show && prop.x == this.x && prop.y == this.y){
            switch(prop.propType){
                case 'Rock':
                    this.x = this.lastX;
                    this.y = this.lastY;
                    break;
                case 'Gem':
                    prop.show = false;
                    switch(prop.color){
                        case 'blue':
                            this.y -= 1;
                            break;
                        case 'green':
                            this.invincible = true;
                            countdown();
                            this.Invincible(2000);
                            break;
                        case 'orange':
                            allEnemies.pop();
                            break;
                    }
                    break;
                case 'Heart':
                    prop.show = false;
                    this.herats += 1;
                    break;
                case 'Star':
                    prop.show = false;
                    this.scores += 1000;
                    break;
                case 'Key':
                    prop.show = false;
                    this.y = 0;
                    break;
            }
        }
    }
}

/*玩家进入无敌状态，不会收到攻击
 *seconds-无敌时间（毫秒）
 */
Player.prototype.Invincible = function(seconds){
    this.invincible = true;
    var self = this;
    setTimeout(function() {
        self.invincible = false;
    }, seconds);
}

// 此为游戏必须的函数，用来在屏幕上画出玩家，
Player.prototype.render = function(){
    ctx.drawImage(Resources.get(this.sprite), this.x*xStep, this.y*yStep - 10);
};

//玩家移动事件
Player.prototype.handleInput = function(direction){
    if(this.isPass){
        window.alert("恭喜你过关！");
        reset();
    }else if(!this.isBump){
        this.lastX = this.x;
        this.lastY = this.y;
        switch(direction){
            case 'left':
                this.x = this.x < 1 ? 0 : this.x - 1;
                break;
            case 'up':
                this.y = this.y < 1 ? 0 : this.y - 1;
                break;
            case 'right':
                this.x = this.x > 3 ? 4 : this.x + 1;
                break;
            case 'down':
                this.y = this.y > 4 ? 5 : this.y + 1;
                break;
            default:
                break;
        }
    }
};

//道具类
var Prop = function(){
    this.x = Math.floor(Math.random()*5);
    this.y = Math.ceil(Math.random()*3);
    this.show = true;
}

Prop.prototype.render = function(){
    if(this.show){
        ctx.drawImage(Resources.get(this.sprite), this.x*xStep, this.y*yStep + 15, xStep, 121);
    }
};

//岩石
var Rock = function(){
    Prop.call(this);
    this.propType = 'Rock';
    this.sprite = 'images/Rock.png';
}
Rock.prototype = Object.create(Prop.prototype);
Rock.prototype.constructor = Rock;
//宝石
var Gem = function(color){
    Prop.call(this);

    this.propType = 'Gem';
    color = color || 'blue';
    this.color = color;
    var type_img = {
        blue: 'images/Gem Blue.png',
        green: 'images/Gem Green.png',
        orange: 'images/Gem Orange.png'
    };
    this.sprite = type_img[color];
}
Gem.prototype = Object.create(Prop.prototype);
Gem.prototype.constructor = Gem;
//心
var Heart = function(){
    Prop.call(this);

    this.propType = 'Heart';
    this.sprite = 'images/Heart.png';
}
Heart.prototype = Object.create(Prop.prototype);
Heart.prototype.constructor = Heart;
//星星
var Star = function(){
    Prop.call(this);

    this.propType = 'Star';
    this.sprite = 'images/Star.png';
}
Star.prototype = Object.create(Prop.prototype);
Star.prototype.constructor = Star;
//钥匙
var Key = function(){
    Prop.call(this);

    this.propType = 'Key';
    this.sprite = 'images/Key.png';
}
Key.prototype = Object.create(Prop.prototype);
Key.prototype.constructor = Key;

// 现在实例化你的所有对象
// 把所有敌人的对象都放进一个叫 allEnemies 的数组里面
// 把玩家对象放进一个叫 player 的变量里面
var player = new Player();
var allEnemies = [];
var allProps = [];
/*玩家通过或撞上敌人，所有敌人停止移动
 *status: 'isBump'-撞上敌人(默认值)， 'isPass'-通过
 */
var bumpEnemie = function(status){
    status = status || 'isBump';
    player[status] = true;
    allEnemies.forEach(function(enemy) {
        enemy.isStop = true;
    });
};


// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
