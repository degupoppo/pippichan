

version = "v0.1.0";


//===global variants========================================================----
turn = 0;



//### draw_star
function draw_star(scene, _x, _y) {
    let _lifespan = 400;
    const emitterConfig = {
        alpha: 0.5,
        angle: { min: 0, max: 360 },
        //blendMode: 'ADD',
        gravityY: 400,
        lifespan: { min:_lifespan*0.7, max:_lifespan},
        quantity: 15,
        stopAfter: 15,
        timeScale: 0.9,
        rotate: { min:0, max:360 },
        scale: { min: 0.05, max: 0.08 },
        speed: { min: 50, max: 300 },
        frame: [0,1,2,3,4,5,6,7],
    };
    const emitter = scene.add.particles(_x, _y, "par_stars", emitterConfig);
    emitter.setDepth(9000);
}


//===class====================================================================================


//---Pippichan
class Pippichan extends Phaser.GameObjects.Sprite{
    
    constructor(scene, x, y) {
        super(scene, x, y, "pippichan_walking_01");
        this.x = x;
        this.y = y;
        this.scene.add.existing(this);
        this.anims.play("pippichan_walking", true);
        this.mode = "resting";
        this.submode = 0;
        this.count = 0;
        this.subcount = 0;
        this.dist = "left";
        this.setInteractive({useHandCursor: true});
        this.on("pointerdown", function (pointer) {
            this.on_click();
        }, this);
        this.scale = 0.2;
    }
    
    on_click() {
        let heart = this.scene.add.image(this.x, this.y-60, "heart")
            .setOrigin(0.5)
            .setScale(0.1);
        setTimeout( () => {
            heart.destroy();
        }, 3000);
    }
    
    resting() {
        this.subcount += 1;
        if (this.subcount == 1) {
            this.resting_count = 150 + Math.random() * 30;
        } else if (this.subcount >= this.resting_count) {
            let tmp = Math.random() * 100;
            if (tmp <= 100) {
                this.mode = "walking";
                this.submode = 0;
                this.subcount = 0;
            }
        }
    }
    
    walking() {
        this.subcount += 1;
        //determine direction
        if (this.subcount == 1){
            //determine degree, 0-30, 150-210, 330-360
            var li = [0,10,20,30,150,160,170,180,190,200,210,330,340,350]
            this.moving_degree = li[Math.floor(Math.random() * li.length)];
            //out of area check, x
            if (this.x < 50 && this.moving_degree > 90 && this.moving_degree < 270) {
                this.moving_degree += 180;
            } else if (this.x > 850 && (this.moving_degree < 90 || this.moving_degree > 270)) {
                this.moving_degree += 180;
            }
            //360 over check
            this.moving_degree = this.moving_degree % 360;
            //out of area check, y
            if (this.y > 950 && this.moving_degree > 180) {
                this.moving_degree = 360 - this.moving_degree;
            }else if (this.y < 1200 && this.moving_degree < 180) {
                this.moving_degree = 360 - this.moving_degree;
            }
            //determine speed, count
            this.moving_speed = 0.3 + Math.random() * 0.4;  //0.5-0.8
            this.moving_count = 70 + Math.random() * 30;    //70-100
            //determine left or right
            if (this.moving_degree > 90 && this.moving_degree <= 270) {
                this.dist = "left";
                this.flipX = false;
                this.anims.play("pippichan_walking", true);
            }else {
                this.dist = "right";
                this.flipX = true;
                this.anims.play("pippichan_walking", true);
            }
        //moving
        } else if (this.subcount < this.moving_count) {
            this.x += Math.cos(this.moving_degree * (Math.PI/180)) * this.moving_speed;
            this.y -= Math.sin(this.moving_degree * (Math.PI/180)) * this.moving_speed;

        //return to resting
        } else if (this.subcount >= this.moving_count) {
            this.mode = "resting";
            this.subcount = 0;
        }
    }
    
    update() {
        this.count += 1;
        if (this.mode == "resting") {this.resting();}
        else if (this.mode == "walking") {this.walking();}
    }
}


//===<Phaser3>:preload=============================================================================
function preload(scene) {
    
    //---image
    scene.load.image("back", "assets/images/back.png");
    scene.load.image("pippichan_01", "assets/images/pippichan_01.png");
    scene.load.image("pippichan_02", "assets/images/pippichan_02.png");
    scene.load.image("heart", "assets/images/icon_system_heart.png");
    
    //particles
    scene.load.spritesheet("par_stars", "assets/particles/stars.png", {frameWidth: 200, frameHeight: 191});
}


//===<Phaser3>:create=============================================================================
function create(scene) {
    scene.add.image(490, 640, "back");

    //---animation
    scene.anims.create({
        key: "pippichan_walking",
        frames: [
            {key: "pippichan_01"},
            {key: "pippichan_02"}
        ],
        frameRate: 1,
        repeat: -1
    });
    
    pippichan = new Pippichan(scene, 500, 1000);

    //---pointer


    scene.input.on("pointermove", (pointer, PointerEvent) => {
        pointer_x = game.input.activePointer.x;
        pointer_y = game.input.activePointer.y;
    });

    scene.input.on("pointerdown", () => {
        console.log(
            Math.round(pointer_x), 
            Math.round(pointer_y)
        );
        draw_star(scene, pointer_x, pointer_y);
    });

}


//===phaser3:update=============================================================================
function update(scene) {
    turn += 1;
    pippichan.update();
}


//===phaser3:scene=============================================================================


//---FirstCheck

class FirstCheck extends Phaser.Scene {

    constructor() {
        super({ key:"FirstCheck", active:true });
        this.flag_start = 0;
        console.log("scene: FirstCheck");
    }
    
    preload() {
        this.load.image("icon_error", "src/png/icon_error.png");
        this.load.image("icon_wrong", "src/png/icon_wrong.png");
        //this.load.image("logo", "src/png/logo.png");
        this.load.spritesheet("logolist", "src/icon/logolist.png", {frameWidth: 370, frameHeight: 320});
        this.load.spritesheet("logolist2", "src/icon/logolist2.png", {frameWidth: 370, frameHeight: 320});
        this.load.spritesheet("logolist3", "src/icon/logolist3.png", {frameWidth: 370, frameHeight: 320});
        this.load.spritesheet("logolist4", "src/icon/logolist4.png", {frameWidth: 370, frameHeight: 320});
    }
    
    create(){
        
        //system messages
        let _msg1 = this.add.text(490, 640, 'Check Network')
            .setFontSize(80)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#047a00");
        let _msg2 = this.add.text(490, 720, 'Connecting...')
            .setFontSize(40)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#047a00");
        let _errImg = this.add.image(490, 360, "icon_error")
            .setOrigin(0.5)
            .setScale(0.5)
            .setVisible(false);
            
        //function for loop
        async function runAll(scene, _flag_demo=0) {
            
            // when demo, flag_start=1 and return 0
            if (_flag_demo == 1) {
                _msg1.setText("Check Network");
                _msg2.setText("Connecting...OK!");
                _errImg.setVisible(false);
                //prevent duplicated starting
                if (scene.flag_start == 0) {
                    setTimeout( () => {scene.scene.start("Loading")}, 500, scene);
                    setTimeout( () => {scene.scene.launch("Loading_overlap")}, 100, scene);
                    scene.flag_start = 1;
                }
                return 0;
            }
            
            let _chainId = 0;
            let _wallet = 0;
            //get metamask info
            try {
                let _wallets = await window.ethereum.request({method:"eth_requestAccounts"});
                _wallet = _wallets[0];
                let _hexCahinId = await window.ethereum.request({method:"eth_chainId"});
                _chainId = parseInt(_hexCahinId);
            //when error = no metamask or not yet connect
            } catch (err) {
                console.log("error");
                console.error(err);
                if (_wallet == 0) {
                    _msg1.setText("Connect Wallet");
                    _msg2.setText("Please install Metamask and allow wallet connection.");
                }
            }
            //check metamask info
            //when wallet and chainId are good, start Main scene
            if (_wallet != 0 && _chainId == CORRECT_CHAINID) {
                _msg1.setText("Check Network");
                _msg2.setText("Connecting...OK!");
                _errImg.setVisible(false);
                //prevent duplicated starting
                if (scene.flag_start == 0) {
                    setTimeout( () => {scene.scene.start("Loading")}, 500, scene);
                    setTimeout( () => {scene.scene.launch("Loading_overlap")}, 100, scene);
                    scene.flag_start = 1;
                }
                //clearInterval(timerId);
                return 0;
            //when not connect yet
            } else if (_wallet == 0) {
                _msg1.setText("Connect Wallet");
                _msg2.setText("Please install Metamask and allow wallet connection.");
                _errImg.setVisible(true);
            //when wrong network
            } else if (_chainId != CORRECT_CHAINID && flag_demo == 0) {
                _msg1.setText("Wrong Network");
                _msg2.setText("Please connect to the Astar Network RPC.");
                _errImg.setVisible(true);
            }
            setTimeout(runAll, 5000, scene);
        }
        
        //loop checking wallet and chain id
        // when demo, start Main scene
        if (flag_demo == 1) {
            runAll(this, 1);    // _flag_mdeo=1
        } else {
            runAll(this);
        }
    }
}


//---Loading


class Loading extends Phaser.Scene {

    constructor() {
        super({ key:"Loading", active:false });
        //this.flag_start = 0;
    }
    
    //load wallet, contract, status here
    async update_web3() {
        let _start = Date.now();
        this.count_web3Loading = 0;
        console.log("load: web3");
        if (flag_demo == 0) {
            await init_web3();
        } else {
            await init_web3(1); // _flag_demo=1
        }
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        console.log("load: summoner");
        await contract_update_summoner_of_wallet();
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        console.log("load: static");
        await contract_update_static_status(summoner);
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        console.log("load: dynamic");
        await contract_update_dynamic_status(summoner);
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        console.log("load: item");
        local_myListsAt_withItemType = await get_myListsAt_withItemType(local_owner);
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        console.log("load: festival");
        await contract_update_festival_info(summoner);
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        // count ToM and ToM
        console.log("load: ToM and ToM");
        await init_sideNft();
        flag_MoM = Number(await contract_mom.methods.balanceOf(local_owner).call());
        flag_ToM = Number(await contract_tom.methods.balanceOf(local_owner).call());
        console.log("  OK", Date.now() - _start);
        this.count_web3Loading += 1;
        this.flag_start = 1;
    }

    preload() {
        //loading web3 and preload parallely
        console.log("scene: Loading");
        this.update_web3(); // start loading web3 without async
        preload(this);

        //load plugin here
        //this plugin can acces as game.scene.scenes[1].rexUI
        //in other scenes
        this.load.scenePlugin({
            key: 'rexuiplugin',
            url: "lib/rexuiplugin.min.js",
            sceneKey: 'rexUI'
        });
    }
    
    create() {
        //web3 loading msg
        this._msg1 = this.add.text(640, 480, '')
            .setFontSize(30)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#ffebf7");
    }
    
    update() {
        //check web3 loading, wait for complete
        if (this.flag_start == 1) {
            this._msg1.setText("");
            this.scene.stop("Loading_overlap");
            
            //this.scene.start("Opeaning");

            this.cameras.main.fadeOut(250, 255, 255, 255);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start("Opeaning");
            });
            this.flag_start = 2;


        } else {
            let _text = "Loading On-Chain Data... (";
            _text += this.count_web3Loading + "/7)";
            this._msg1.setText(_text);
        }
    }
}


//---Loading_overlap


class Loading_overlap extends Phaser.Scene {

    constructor() {
        super({ key:"Loading_overlap", active:false });
        this.turn = 0;
        this.flowerCount_present = 0;
        this.flag_happyNyui = 0;
    }
    
    preload() {
        this.load.spritesheet("nyui_loading", "src/png/nyui_moving.png", {frameWidth: 370, frameHeight: 320});
        this.load.spritesheet("nyui_loading2", "src/png/nyui_happy.png", {frameWidth: 370, frameHeight: 320});
        this.load.spritesheet("ohana_loading", "src/particle/flowers.png", {frameWidth: 370, frameHeight: 320});
        this.load.image("opening_logo", "src/png/opening_logo.png");
    }
    
    create() {

        // version text
        this.version_text = this.add.text(1275, 955, version, {font: "16px Arial", fill: "#3D3D3D"})
            .setOrigin(1)
            .setDepth(2000);

        let _x = 400 + Math.random()*300;
        let _y = 800 + Math.random()*20;
        this.nyui_text = this.add.text(_x, _y-50, "")
            .setFontSize(20)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#ff1694")
            .setVisible(false);
        let _text = "";
        //_text += "This count is not affect gameplay :)";
        _text += "This count is stored locally\n";
        _text += "and does not affect gameplay :)";
        this.nyui_text2 = this.add.text(_x, _y+60, _text)
            .setFontSize(16)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#888888")
            .setVisible(false);
        this.nyui = this.add.sprite(_x, _y, "nyui_loading")
            .setOrigin(0.5)
            .setScale(0.25)
            .setDepth(1000)
            .setInteractive({useHandCursor: true })
            .on("pointerdown", () => {
                //this.flowerCount += 1;
                this.flowerCount_present += 1;
                localStorage_flowerCount += 1;
                this.nyui_text.setText(localStorage_flowerCount + " flowers");
                this.nyui_text.setVisible(true);
                this.nyui_text2.setVisible(true);
                let _ohana = this.add.image(
                    _x-150+Math.random()*300,
                    _y-20+Math.random()*40,
                    "ohana_loading"
                )
                    .setFrame(Math.floor(Math.random()*5))
                    .setOrigin(0.5)
                    .setScale(0.1)
                    .setAngle(Math.random()*360)
                    .setDepth(1000-1);
                localStorage.setItem("flowerCount_inGame", JSON.stringify(localStorage_flowerCount));
            });
    }
    
    update() {
        this.turn += 1;
        if (this.flowerCount_present >= 10) {
            this.nyui.setTexture("nyui_loading2");
            if (this.flag_happyNyui == 0) {
                this.flag_happyNyui = 1;
            }
        } else if (this.turn % 80 == 40) {
            this.nyui.setFrame(1);
        } else if (this.turn % 80 == 0) {
            this.nyui.setFrame(0);
        }
        if (this.flag_happyNyui == 1) {
            this.add.image(640,285,"ohana_loading").setFrame(Math.floor(Math.random()*5)).setOrigin(0.5).setScale(0.1).setAngle(Math.random()*360).setDepth(1000-1);
            this.add.image(615,296,"ohana_loading").setFrame(Math.floor(Math.random()*5)).setOrigin(0.5).setScale(0.1).setAngle(Math.random()*360).setDepth(1000-1);
            this.add.image(590,308,"ohana_loading").setFrame(Math.floor(Math.random()*5)).setOrigin(0.5).setScale(0.1).setAngle(Math.random()*360).setDepth(1000-1);
            this.add.image(665,296,"ohana_loading").setFrame(Math.floor(Math.random()*5)).setOrigin(0.5).setScale(0.1).setAngle(Math.random()*360).setDepth(1000-1);
            this.add.image(690,308,"ohana_loading").setFrame(Math.floor(Math.random()*5)).setOrigin(0.5).setScale(0.1).setAngle(Math.random()*360).setDepth(1000-1);
            this.flag_happyNyui = 2;
        }
    }
}


//---Opeaning


class Opeaning extends Phaser.Scene {

    constructor() {
        super({ key:"Opeaning", active:false });
    }

    preload() {
        console.log("scene: Opeaning");
    }
    
    create(){

        //fade in
        this.cameras.main.fadeIn(500, 255, 255, 255);

        //opening logo
        this.add.image(640, 480, "opening_logo").setScale(0.8);

        //wait and fade out
        setTimeout( () => {
            this.cameras.main.fadeOut(250, 255, 255, 255);
            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start("Main");
            });
        }, 1000);

        /*
        this.cameras.main.fadeOut(300, 255, 255, 255);
        this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
            this.scene.start("Main");
        });
        */
    }
}


//---Something Wrong


class SomethingWrong extends Phaser.Scene {

    constructor() {
        super({ key:"SomethingWrong", active:false });
    }

    create(){
        //system messages
        let _errImg = this.add.image(640, 360, "icon_wrong")
            .setOrigin(0.5)
            .setScale(0.5)
            .setVisible(false);
        let _msg1 = this.add.text(640, 480, 'Something Wrong')
            .setFontSize(80)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#ff1694");
        let _msg2 = this.add.text(640, 560, 'Please reload the page.')
            .setFontSize(40)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#ffebf7");
        let _msg3 = this.add.text(640, 660, '>> Click Here <<')
            .setFontSize(40)
            .setFontFamily("Arial")
            .setOrigin(0.5)
            .setFill("#0000FF")
            .setInteractive({useHandCursor: true })
            .on("pointerdown", () => {
                window.location.reload();
            });
        _errImg.setVisible(true);
    }
}


//---Main


class Main extends Phaser.Scene {

    constructor() {
        super({ key:"Main", active:false });
    }

    preload() {
        preload(this);
    }

    create(){
        let _start = Date.now();
        console.log("create...");
        create(this);
        console.log("  OK", Date.now() - _start);
        //updateFirst(this);
    }

    update(){
        //fade in
        /*
        if (flag_fadein == 0) {
            this.cameras.main.fadeIn(500, 255, 255, 255);
            flag_fadein = 1;
        }
        */
        update(this);
    }
}

//===phaser3:config=============================================================================

//---config
let config = {
    type: Phaser.CANVAS,
    parent: "canvas",
    backgroundColor: "fffec9",
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 980,
        height: 1280,
    },
    /* ***TODO*** scene
    scene: [
        FirstCheck, 
        Loading, 
        Loading_overlap, 
        Opeaning, 
        SomethingWrong, 
        Main
    ],
    */
    scene: [Main],
    fps: {
        target: 60,
        //forceSetTimeOut: true
    },
    //nedd for rexUI plugin
    dom: {
        createContainer: true
    },
};

game = new Phaser.Game(config);

