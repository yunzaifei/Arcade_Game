/* Engine.js
* 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出出事的游戏面板，然后调用玩家和敌人对象的 update / render 函数（在 app.js 中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕，和小时候你们做的 flipbook 有点像。当
 * 玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。但这都是表面现象。实际上是整个屏幕
 * 被重绘导致这样的动画产生的假象

 * 这个引擎是可以通过 Engine 变量公开访问的，而且它也让 canvas context (ctx) 对象也可以
 * 公开访问，以此使编写app.js的时候更加容易
 */

var Engine = (function(global) {
    /* 实现定义我们会在这个作用于用到的变量
     * 创建 canvas 元素，拿到对应的 2D 上下文
     * 设置 canvas 元素的高/宽 然后添加到dom中
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        xStep = 101,
        yStep = 83,
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.querySelector('#play').appendChild(canvas);

    /* 这个函数是整个游戏的主入口，负责适当的调用 update / render 函数 */
    function main() {
        /* 如果你想要更平滑的动画过度就需要获取时间间隙。因为每个人的电脑处理指令的
         * 速度是不一样的，我们需要一个对每个人都一样的常数（而不管他们的电脑有多快）
         * 就问你屌不屌！
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* 调用我们的 update / render 函数， 传递事件间隙给 update 函数因为这样
         * 可以使动画更加顺畅。
         */
        update(dt);
        render();

        /* 设置我们的 lastTime 变量，它会被用来决定 main 函数下次被调用的事件。 */
        lastTime = now;

        /* 在浏览准备好调用重绘下一个帧的时候，用浏览器的 requestAnimationFrame 函数
         * 来调用这个函数
         */
        win.requestAnimationFrame(main);
    }

    /* 这个函数调用一些初始化工作，特别是设置游戏必须的 lastTime 变量，这些工作只用
     * 做一次就够了
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* 这个函数被 main 函数（我们的游戏主循环）调用，它本身调用所有的需要更新游戏角色
     * 数据的函数，取决于你怎样实现碰撞检测（意思是如何检测两个角色占据了同一个位置，
     * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
     * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
     */
    function update(dt) {
        player.update();
        updateEntities(dt);
        // checkCollisions();
    }

    /* 这个函数会遍历在 app.js 定义的存放所有敌人实例的数组，并且调用他们的 update()
     * 函数，然后，它会调用玩家对象的 update 方法，最后这个函数被 update 函数调用。
     * 这些更新函数应该只聚焦于更新和对象相关的数据/属性。把重绘的工作交给 render 函数。
     */
    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
    }

    /* 这个函数做了一些游戏的初始渲染，然后调用 renderEntities 函数。记住，这个函数
     * 在每个游戏的时间间隙都会被调用一次（或者说游戏引擎的每个循环），因为这就是游戏
     * 怎么工作的，他们就像是那种每一页上都画着不同画儿的书，快速翻动的时候就会出现是
     * 动画的幻觉，但是实际上，他们只是不停的在重绘整个屏幕。
     */
    function render() {
        /* 这个数组保存着游戏关卡的特有的行对应的图片相对路径。 */
        var rowImages = [
                'images/water-block.png',   // 这一行是河。
                'images/stone-block.png',   // 第一行石头
                'images/stone-block.png',   // 第二行石头
                'images/stone-block.png',   // 第三行石头
                'images/grass-block.png',   // 第一行草地
                'images/grass-block.png'    // 第二行草地
            ],
            numRows = 6,
            numCols = 5,
            row, col;

        /* 便利我们上面定义的行和列，用 rowImages 数组，在各自的各个位置绘制正确的图片 */
        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                /* 这个 canvas 上下文的 drawImage 函数需要三个参数，第一个是需要绘制的图片
                 * 第二个和第三个分别是起始点的x和y坐标。我们用我们事先写好的资源管理工具来获取
                 * 我们需要的图片，这样我们可以享受缓存图片的好处，因为我们会反复的用到这些图片
                 */
                ctx.drawImage(Resources.get(rowImages[row]), col * xStep, row * yStep);
            }
        }

        renderEntities();   //绘制
    }

    /* 这个函数会在每个时间间隙被 render 函数调用。他的目的是分别调用你在 enemy 和 player 和 prop
     * 对象中定义的 render 方法。
     */
    function renderEntities() {
        player.render();

        allProps.forEach(function(p){
            p.render();
        })
        /* 遍历在 allEnemies 数组中存放的作于对象然后调用你事先定义的 render 函数 */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });
    }

    /* 这个函数现在没干任何事，但是这会是一个好地方让你来处理游戏重置的逻辑。可能是一个
     * 从新开始游戏的按钮，也可以是一个游戏结束的画面，或者其它类似的设计。它只会被 init()
     * 函数调用一次。
     */
    function reset(force) {
        allEnemies = createEnemies();
        allProps = createProps();
        if(!player || force){
            player = new Player();
        }else{
            player.level += 1;
            player.isPass = false;
            player.x = 2;
            player.y = 5;
        }
    }

    /*创建随机个数的敌人
     */
    function createEnemies(){
        var num = Math.ceil(Math.random()*4);
        var enemies = [];
        while(enemies.length < num){
            enemies.push(new Enemy());
        }
        return enemies;
    }

    /*创建道具
     */
    function createProps(){
        var props = [new Rock(), new Rock(), new Gem('blue'), new Gem('green'), new Gem('orange'), new Heart(), new Star(), new Key()];
        for(var i=0; i<props.length; i++){
            props[i].show = Math.random() > 0.5 + i*0.07;
            for(var j=0; j< i; j++){
                if(props[i].x == props[j].x && props[i].y == props[j].y){
                    props[i].show = false;
                    break;
                }
            }
        }
        return props;
    }

    /* 紧接着我们来加载我们知道的需要来绘制我们游戏关卡的图片。然后把 init 方法设置为回调函数。
     * 那么党这些图片都已经加载完毕的时候游戏就会开始。
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png',
        'images/char-cat-girl.png',
        'images/char-horn-girl.png',
        'images/char-pink-girl.png',
        'images/char-princess-girl.png',
        'images/Gem Blue.png',
        'images/Gem Green.png',
        'images/Gem Orange.png',
        'images/Heart.png',
        'images/Key.png',
        'images/Rock.png',
        'images/Selector.png',
        'images/Star.png'
    ]);
    Resources.onReady(init);

    /* 把 canvas 上下文对象绑定在 global 全局变量上（在浏览器运行的时候就是 window
     * 对象。从而开发者就可以在他们的app.js文件里面更容易的使用它。
     */
    global.ctx = ctx;
    global.xStep = xStep;
    global.yStep = yStep;
    global.reset = reset;
})(this);
