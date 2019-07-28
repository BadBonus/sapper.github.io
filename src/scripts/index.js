let
Application = PIXI.Application,
loader = PIXI.loader,
resources = PIXI.loader.resources,
Sprite = PIXI.Sprite,
Text = PIXI.Text;
TextStyle = PIXI.TextStyle;

const gameOptions =
    {
        widthBoard:660,
        heightBoard:660,
        widthEl:33,
        heigthEl:33,
        countOfMines:1,
    };

//создаём окно canvas
const
    app = new Application({
        width: gameOptions.widthBoard,
        height: gameOptions.heightBoard,
        antialiasing: true,
        transparent: false,
        resolution: 1,
        backgroundColor:'#000'
    }
);

const
startMenuContainer = new PIXI.Container(),
gameContainer = new PIXI.Container(),
pauseContainer = new PIXI.Container(),
gameOverContainerWin = new PIXI.Container(),
gameOverContainerLoose = new PIXI.Container(),
timerDom = document.body.querySelector('.timerDom'),
pauseButton = document.body.querySelector('.pauseButton'),
style = new TextStyle({
    fontFamily: "Futura",
    fontSize: 52,
    fill: "white"
});

gameOverContainerWin.visible=false;
gameOverContainerLoose.visible=false;
pauseContainer.visible=false;
pauseButton.onclick=pause;

//присваиваем имена для навигации
startMenuContainer.name='startMenuContainer';
let
timer,
texture;

document.body.appendChild(app.view);

loader
.add("images/texture.json")
.load(setup);

function setup(){
    texture = loader.resources["images/texture.json"].textures;
    makingStartMenu();
    makingFinishDisplay('Вы нашли все мины!', gameOverContainerWin);
    makingFinishDisplay('ВЫ подорвали мину =(', gameOverContainerLoose);
    makingPauseMenu();
    app.stage.addChild(startMenuContainer,gameContainer,pauseContainer,gameOverContainerWin,gameOverContainerLoose);
}

//creator scenes functions

function makingStartMenu(){
    const
    menuButtonStart = new Sprite(texture['play.png']),
    menuButtonOneMine = new Sprite(texture['oneMine_off.png']),
    menuButtonTenMine = new Sprite(texture['tenMine_off.png']),
    menuButtonHundredMine = new Sprite(texture['hundredMine_off.png']),
    menu_welcome_text = new Text("Найдешь ли все мины?", style);
    menu_options_text = new Text("Выберите количество мин", {...style, fontSize:36});

    menuButtonOneMine.name='oneMine';
    menuButtonTenMine.name='tenMine';
    menuButtonHundredMine.name='hundredMine';

    defaultOptionsToButton(menuButtonStart, funcStartGame);
    defaultOptionsToButton(menuButtonOneMine, ()=>{changeCountMines.call(menuButtonOneMine,1)});
    defaultOptionsToButton(menuButtonTenMine, ()=>{changeCountMines.call(menuButtonOneMine,10)});
    defaultOptionsToButton(menuButtonHundredMine, ()=>{changeCountMines.call(menuButtonOneMine,100)});

    menuButtonStart.y=gameOptions.heightBoard/2-menuButtonStart.height;
    menuButtonStart.x=gameOptions.widthBoard/2-menuButtonStart.width/2;
    menuButtonOneMine.y=gameOptions.heightBoard / 2-menu_welcome_text.height*-1.4;
    menuButtonOneMine.x=gameOptions.widthBoard/2-menuButtonOneMine.width*1.5;
    menuButtonTenMine.y=gameOptions.heightBoard / 2-menu_welcome_text.height*-1.4;
    menuButtonTenMine.x=gameOptions.widthBoard/2-menuButtonTenMine.width/2;
    menuButtonHundredMine.y=gameOptions.heightBoard / 2-menu_welcome_text.height*-1.4;
    menuButtonHundredMine.x=gameOptions.widthBoard/2+menuButtonHundredMine.width/2;

    menu_welcome_text.x = gameOptions.widthBoard / 2 -menu_welcome_text.width/2;
    menu_welcome_text.y = gameOptions.heightBoard / 2-menu_welcome_text.height*2.5;
    menu_options_text.x = gameOptions.widthBoard / 2 -menu_options_text.width/2;
    menu_options_text.y = gameOptions.heightBoard / 2-menu_welcome_text.height*-0.5;
    startMenuContainer.addChild(menuButtonStart, menu_welcome_text, menu_options_text, menuButtonOneMine,menuButtonTenMine,menuButtonHundredMine);
    changeCountMines(1);
    }

function fullGameContainer()
        {
            const
            countOfHorizontal=gameOptions.widthBoard/gameOptions.widthEl,
            countOfVertical=gameOptions.heightBoard/gameOptions.heigthEl;
            gameContainer.removeChildren();
            let arrayAreaItems=gameContainer.arrayAreaItems=[],
            countOfFindedMines=gameContainer.countOfFindedMines=0;
            gameContainer.visible=true;

            // заполняем gameContainer элементами
            for (let y=0; y<countOfVertical;y++)
            {
                arrayAreaItems.push([]);
                for (let x=0; x<countOfHorizontal;x++)
                {
                    let areaItem = new Sprite(texture["empty.png"]);
                    areaItem.width = gameOptions.widthEl;
                    areaItem.heigth = gameOptions.heigthEl;
                    areaItem.y=gameOptions.heigthEl*y;
                    areaItem.x=gameOptions.widthEl*x;
                    areaItem.interactive = true;
                    areaItem.buttonMode = true;
                    areaItem.mine = false;
                    areaItem.row=y;
                    areaItem.el=x;
                    areaItem.rightdown=()=>{
                        rightClick.call(areaItem);
                    };
                    areaItem.on('click', onClickGameElement);
                    arrayAreaItems[y].push(areaItem);
                    gameContainer.addChild(areaItem);
                }
            }

            //Расставляем в game элементы-мины
            for (let i=0; i<gameOptions.countOfMines;)
            {
                let randomX = Math.round(Math.random()*(countOfHorizontal-1));
                let randomY = Math.round(Math.random()*(countOfVertical-1));
                if(!arrayAreaItems[randomY][randomX].mine)
                {
                    arrayAreaItems[randomY][randomX].mine=true;
                    i++;
                }
            }

            //настраиваем в game-счетчики мин
            for (let y=0; y<countOfVertical; y++)
            {
                for (let x=0; x<countOfVertical; x++)
                {
                    const check_el_start = x>0?x-1:x;
                    const check_row_start = y>0?y-1:y;
                    const check_el_end=x<countOfHorizontal-1?x+1:x;
                    const check_row_end=y<countOfVertical-1?y+1:x;
                    let count = 0;
                    if(!arrayAreaItems[y][x].mine)
                    {
                        for(let y2=check_row_start;y2<=check_row_end;y2++)
                        {
                            for(let x2=check_el_start;x2<=check_el_end;x2++)
                            {
                                if(arrayAreaItems[y2][x2].mine && !(x2===x && y2 === y))
                                {
                                    count++;
                                }
                            }
                        }
                        arrayAreaItems[y][x].mineCounter=count;
                    }
                }
            }

            function checkNulls(el, row)
            {
                const check_el_start = el>0?el-1:el;
                const check_row_start = row>0?row-1:row;
                const check_el_end=el<countOfHorizontal-1?el+1:el;
                const check_row_end=row<countOfVertical-1?row+1:el;
                const arrayElOfNulls=[];
                if(arrayAreaItems[row][el].mineCounter === 0)
                {
                    for(let y=check_row_start;y<=check_row_end;y++)
                    {
                        for(let x=check_el_start;x<=check_el_end;x++)
                        {
                            let textureName = arrayAreaItems[y][x].texture.textureCacheIds[0];
                            if(arrayAreaItems[y][x].mineCounter===0 && !(el===x && row === y) && textureName === 'empty.png')
                            {
                                arrayElOfNulls.push(arrayAreaItems[y][x]);
                            }
                        }
                    }
                }
                if (arrayElOfNulls.length>2)
                {
                    arrayElOfNulls.forEach(el=>{
                        el.texture = texture["null.png"];
                        checkNulls(el.el, el.row);
                    });
                }
            }

            // конец фичи для нулевого элемента
            function onClickGameElement(){
                if(this.mineCounter !== undefined) {
                    if (this.texture.textureCacheIds[0] !== 'flag.png')
                        switch (this.mineCounter) {
                            case 1:
                                this.texture = texture["one.png"];
                                break;
                            case 2:
                                this.texture = texture["two.png"];
                                break;
                            case 3:
                                this.texture = texture["three.png"];
                                break;
                            case 4:
                                this.texture = texture["four.png"];
                                break;
                            case 5:
                                this.texture = texture["five.png"];
                                break;
                            case 6:
                                this.texture = texture["six.png"];
                                break;
                            case 7:
                                this.texture = texture["seven.png"];
                                break;
                            case 8:
                                this.texture = texture["eight.png"];
                                break;
                            default:
                                this.texture = texture["null.png"];
                                checkNulls(this.el, this.row);
                                break;
                        }
                }
                else if(this.mine && this.texture.textureCacheIds[0] !== 'flag.png')
                {
                    this.texture = texture["bomb.png"];
                    endGame(false);
                }
            }
        }

// создаём экран паузы
function makingPauseMenu()
{
    const bg = bground();
    const buttonContinueGame = new Sprite(texture['play.png']);
    defaultOptionsToButton(buttonContinueGame, gameContinue,);
    buttonContinueGame.y=gameOptions.heightBoard/2-buttonContinueGame.height;
    buttonContinueGame.x=gameOptions.widthBoard/2-buttonContinueGame.width/2-70;
    const buttonReturnMenu = new Sprite(texture['options.png']);
    defaultOptionsToButton(buttonReturnMenu, gameExit);
    buttonReturnMenu.y=gameOptions.heightBoard/2-buttonReturnMenu.height;
    buttonReturnMenu.x=gameOptions.widthBoard/2-buttonReturnMenu.width/2+70;
    pauseContainer.addChild(bg,buttonContinueGame,buttonReturnMenu);
}

// Создаём экран финального экрана
function makingFinishDisplay(text, gameOverContainer)
{
    //затемнение на заднем фоне
    const bg = bground();
    let gameOverText = new Text(text, style);
    gameOverText.x=gameOptions.widthBoard/2-gameOverText.width/2;
    gameOverText.y=gameOptions.heightBoard/2-gameOverText.height;
    let buttonRepeat = new Sprite(texture["repeat.png"]);
    defaultOptionsToButton(buttonRepeat, repeatGameFunc);
    buttonRepeat.x=gameOptions.widthBoard/2-buttonRepeat.width/2;
    buttonRepeat.y=gameOptions.heightBoard/2+15;
    gameOverContainer.addChild(bg, buttonRepeat, gameOverText);
}

//helperFunctions
function defaultOptionsToButton(button, clickFun) {
    button.width= 75;
    button.height= 75;
    button.interactive = true;
    button.buttonMode = true;
    button.on('click', clickFun);
}

const bground = () => {
    let bg = new Sprite(PIXI.Texture.WHITE);
    bg.width = gameOptions.widthBoard;
    bg.height = gameOptions.heightBoard;﻿
    bg.tint = 0x000000;
    bg.alpha=0.5;
    bg.interactive = true;
    bg.buttonMode = true;
    bg.cursor = 'default';
    bg.role='pause';
    return bg;
};
// Отключаем стандартный вызов ПКМ
        const canvas = document.body.getElementsByTagName('canvas')[0];
        canvas.oncontextmenu=(e)=>{
          e.preventDefault();
        };

//Controller functions
function funcStartGame()
{
    timerDom.textContent=0;
    timer = setInterval(()=>{
                timerDom.textContent=+timerDom.textContent+1;
            },1000);
    startMenuContainer.visible=false;
    fullGameContainer();
    pauseButton.hidden=false;
}

function changeCountMines(number)
{
    gameOptions.countOfMines = number;
    switch (number)
    {
        case 1:
            startMenuContainer.getChildByName('oneMine').texture=texture['oneMine_on.png'];
            startMenuContainer.getChildByName('tenMine').texture=texture['tenMine_off.png'];
            startMenuContainer.getChildByName('hundredMine').texture=texture['hundredMine_off.png'];
            break;
        case 10:
            startMenuContainer.getChildByName('oneMine').texture=texture['oneMine_off.png'];
            startMenuContainer.getChildByName('tenMine').texture=texture['tenMine_on.png'];
            startMenuContainer.getChildByName('hundredMine').texture=texture['hundredMine_off.png'];
            break;
        case 100:
            startMenuContainer.getChildByName('oneMine').texture=texture['oneMine_off.png'];
            startMenuContainer.getChildByName('tenMine').texture=texture['tenMine_off.png'];
            startMenuContainer.getChildByName('hundredMine').texture=texture['hundredMine_on.png'];
            break;
        default:
            break;
    }
}

function endGame(bool)
{
    clearInterval(timer);
    pauseButton.hidden=false;
    return bool?gameOverContainerWin.visible=true:gameOverContainerLoose.visible=true;
}

function rightClick()
{

    if (this.texture.textureCacheIds[0].includes('empty.png')) {
        this.texture = texture['flag.png'];
        if (this.mine) {
            gameContainer.countOfFindedMines++;

            if (gameContainer.countOfFindedMines === gameOptions.countOfMines) {
                endGame(true);
            }
        }
    }
    else if (this.texture.textureCacheIds[0].includes('flag.png')) {
        this.texture = texture['empty.png'];
        if (this.mine) {
            gameContainer.countOfFindedMines--;
        }
    }
}

function repeatGameFunc(){
    gameOverContainerWin.visible=false;
    gameOverContainerLoose.visible=false;
    gameContainer.visible=false;
    startMenuContainer.visible=true;
}

function gameContinue(){
    timer = setInterval(()=>{
        timerDom.textContent=+timerDom.textContent+1;
    },1000);
    pauseContainer.visible=false;
}

function gameExit(){
    clearInterval(timer);
    gameContainer.visible=false;
    pauseContainer.visible=false;
    startMenuContainer.visible=true;
    pauseButton.hidden=true;
}

function pause()
{
    if (!pauseContainer.visible)
    {
        clearInterval(timer);
        pauseContainer.visible=true;
        console.log(pauseContainer.visible);
    }
    else
    {
        gameContinue();
    }
}