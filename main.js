const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const n = 15 //矩阵高
const m = 10 //矩阵宽
let ballNums = 0   //发射球的数量
let balls = new Array() //已发射的球
let readyBalls = new Array()    //待发射的球
let pasue = false
let framcount = 0   //渲染帧计数
const interval = 3 //小球发射间隔帧数
const martix = Array.from(new Array(n), ()=>new Array(m).fill(0))
let startColor = "#FFC600"    //发射球的颜色
let WIDTH, HEIGHT, blockSize, RADIUS, vel, startX, startY, deadline
let eleBoard, eleRound, eleScore, eleBalls

function dataInit() {
    eleBoard = document.querySelector('.board')
    eleRound = document.getElementById('round')
    eleScore = document.getElementById('score')
    eleBalls = document.getElementById('balls')
    //自适应窗口
    let windowWidth = document.documentElement.clientWidth || document.body.clientWidth
    let windowHeight = document.documentElement.clientHeight || document.body.clientHeight
    if (windowHeight/windowWidth>5.2/3) {
        WIDTH = Math.floor(windowWidth)
        HEIGHT = Math.floor(WIDTH/3*5)
        eleBoard.style = `width: ${WIDTH}px;`
    } else {  
        WIDTH = Math.floor(windowHeight/2)
        HEIGHT = Math.floor(WIDTH/3*5)
        eleBoard.style = `width: ${WIDTH}px;` + "border-left: 2px solid #eee;border-right: 2px solid #eee;"
        document.getElementsByTagName('canvas')[0].style = "border-left: 2px solid #eee;border-right: 2px solid #eee;";
    }
    document.documentElement.style.fontSize = Math.floor(WIDTH/30) + 'px'
        
    // WIDTH = 480
    // HEIGHT = Math.floor(WIDTH/3*5)
    // console.log(windowHeight,windowWidth,WIDTH,HEIGHT)
    canvas.width = WIDTH
    canvas.height = HEIGHT
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, WIDTH, HEIGHT)
    ctx.strokeStyle = "#eee"
    
    blockSize = WIDTH/m
    RADIUS = blockSize/6 //球半径
    vel = 1.5*RADIUS //运动方向上的速度
    startX = Math.floor(WIDTH/2)    //发射点
    startY = HEIGHT - RADIUS
    deadline = n*blockSize
}

const blockColor = ['#33691E','#1B5E20','#004D40','#006064','#0D47A1','#1A237E','#311B92','#4A148C','#880E4F','#B71C1C']
const getBlockColor = (num)=>{
    num = Math.floor((num%50)/5)    //每5变化一次颜色
    return blockColor[num]
}

const random = (l,h)=>Math.floor(Math.random()*(h-l)) + l
const YtoI = (y) => Math.floor(y/blockSize)
const XtoJ = (x) => Math.floor(x/blockSize)


//更新视图
function updateView() {
    ctx.fillStyle = "#000"
    ctx.fillRect(0, 0, WIDTH, HEIGHT)

    for (let i=0; i<n; i++) {
        for (let j=0; j<m; j++) {
            //方块
            if (martix[i][j] > 0) {
                ctx.fillStyle = getBlockColor(martix[i][j])
                ctx.fillRect(j * blockSize, i * blockSize, blockSize, blockSize)
                ctx.strokeRect(j * blockSize, i * blockSize, blockSize, blockSize)
                ctx.fillStyle = "#eee"
                ctx.font= Math.floor(blockSize/2)+"px"+" Arial"
                ctx.textBaseline = "middle"
                ctx.textAlign = "center"
                ctx.fillText(martix[i][j], (j+0.5) * blockSize, (i+0.5) * blockSize)
            }
            //奖励球
            if (martix[i][j] < 0) {
                ctx.beginPath()
                ctx.fillStyle = "#222"
                ctx.arc((j+0.5) * blockSize, (i+0.5) * blockSize,  blockSize/3, 0, 2*Math.PI)
                ctx.fill()
                ctx.closePath()
                ctx.fillStyle = "#ddd"
                ctx.font= Math.floor(blockSize/3)+"px"+" Arial"
                ctx.textBaseline = "middle"
                ctx.textAlign = "center"
                ctx.fillText('+'+(-martix[i][j]), (j+0.5) * blockSize, (i+0.5) * blockSize)
            }
        }
    }

    ctx.beginPath()
    ctx.moveTo(0, deadline)
    ctx.lineTo(WIDTH, deadline)
    ctx.stroke()
    ctx.closePath()

    // ctx.fillStyle = "#ddd"
    // ctx.font= Math.floor(blockSize/3)+"px"+" Arial"
    // ctx.textBaseline = "top"
    // ctx.textAlign = "left"
    // ctx.fillText(`Round:${round}   Score:${score}   Balls:${ballNums}`, 0.1*blockSize, deadline+0.1*blockSize)

    eleRound.innerText = round
    eleScore.innerText = score
    eleBalls.innerText = ballNums

    if (!pasue) {
        new Ball(startX, startY-RADIUS, RADIUS, 0, 0, startColor).draw()
    } else {
        balls.forEach(ball=>ball.draw())
    }
    
}

let round = 0 //回合数记录
let score = 0
let pBlock = 0.3
let pReward = 0.1
let nReward = 0
let nBlock = 0

function generateLayer() {
    if (martix[martix.length-1].some((num)=>num>0)) return false //还有未消除的方块
    martix.pop()
    const layer = new Array(m).fill(0)
    if (round % 3 == 0) layer[Math.floor(Math.random()*10)] = -nReward //每3层生成奖励球
    for (let j=0; j<m; j++) {
        if (layer[j]<0) continue
        if (Math.random()<pBlock) { //生成方块
            layer[j] = nBlock
        }
    }
    martix.unshift(layer)
    return true
}

function nextRound() {
    pBlock = Math.min(0.6, pBlock+0.02)
    nBlock++
    nReward = Math.floor(round/50) + 1
    round++
    ballNums++
    if (!generateLayer()) {
        alert('Game Over! score:'+score)
        history.go(0)
        return
    }
    updateView()
}

class Ball {
    constructor(x, y, r, velX, velY, color) {
        this.x = x
        this.y = y
        this.r = r
        this.velX = velX
        this.velY = velY
        this.color = color
    }
    draw() {
        ctx.beginPath()
        ctx.fillStyle = this.color
        ctx.arc(this.x, this.y, this.r, 0, 2*Math.PI)
        ctx.fill()
        ctx.closePath()
    }
    move() {
        // this.x += this.velX
        // this.y += this.velY
        // if(this.x - this.r < 0 || this.x + this.r > WIDTH) {
        //     this.velX = -this.velX
        // }
        // if(this.y - this.r < 0 || this.y + this.r > HEIGHT) {
        //     this.velY = -this.velY
        // }

        let x = this.x
        let y = this.y
        let r = this.r
        let dx = this.velX 
        let dy = this.velY 

        if (x+dx-r<0) {
            this.x = Math.abs(dx) + 2*r - x
            this.velX = -this.velX
        } else if (x+dx+r>WIDTH) {
            this.x = 2*WIDTH - 2*r - x - Math.abs(dx)
            this.velX = -this.velX
        } else if (YtoI(y)<n && dx<0 && martix[YtoI(y)][XtoJ(x+dx-r)]>0) {
            martix[YtoI(y)][XtoJ(x+dx-r)]--
            score += 10
            this.x = Math.abs(dx) + 2*r - x + 2*(XtoJ(x+dx-r)+1)*blockSize
            this.velX = -this.velX
        } else if (YtoI(y)<n && dx>0 && martix[YtoI(y)][XtoJ(x+dx+r)]>0) {
            martix[YtoI(y)][XtoJ(x+dx+r)]--
            score += 10
            this.x = 2*(XtoJ(x+dx+r))*blockSize - 2*r - x - Math.abs(dx)
            this.velX = -this.velX
        } else {
            this.x = x + dx
        }
        
        if (y+dy-r<0) {
            this.y = Math.abs(dy) + 2*r - y
            this.velY = -this.velY
        } else if (y+dy+r>HEIGHT) {
            this.y = y + dy
        } else if (YtoI(y+dy-r)<n && dy<0 && martix[YtoI(y+dy-r)][XtoJ(x)]>0) {
            martix[YtoI(y+dy-r)][XtoJ(x)]--
            score += 10
            this.y = Math.abs(dy) + 2*r - y + 2*(YtoI(y+dy-r)+1)*blockSize
            this.velY = -this.velY
        } else if (YtoI(y+dy+r)<n && dy>0 && martix[YtoI(y+dy+r)][XtoJ(x)]>0) {
            martix[YtoI(y+dy+r)][XtoJ(x)]--
            score += 10
            this.y = 2*(YtoI(y+dy+r))*blockSize - 2*r - y - Math.abs(dy)
            this.velY = -this.velY
        } else {
            this.y = y + dy
        } 

        //奖励球
        let i = YtoI(this.y)
        let j = XtoJ(this.x)
        if (0<=i && i<n && 0<=j && j<m && martix[i][j]<0) {
            ballNums += Math.abs(martix[i][j])
            martix[i][j] = 0
        }
    }
}

// let prev = 0

function loop() {
    // let curr = Date.now()
    // if (curr-prev>18) console.log(curr-prev)
    // prev = curr
    
    // console.log(readyBalls)
    // console.log(balls)
    //每interval帧发射一个小球  
    if (readyBalls.length>0 && framcount == 0) {
        balls.push(readyBalls.pop())
    }
    framcount = (framcount + 1) % interval

    //移动小球 并去除碰撞底部的小球
    balls = balls.filter(ball=>{
        ball.move()
        if (ball.y+ball.r<HEIGHT) {
            startX = ball.x
            startColor = ball.color
            return true
        } else 
            return false
    })



    if (balls.length>0 || readyBalls.length>0) {
        updateView()
        requestAnimationFrame(loop)
    }
    else {
        framcount = 0
        pasue = false
        nextRound()
    }
}

function shoot(event) {
    // console.log(YtoI(event.offsetY),XtoJ(event.offsetX))
    // console.log(event.offsetY,HEIGHT)
    // return
    if (pasue) return
    //排除角度太小的情况
    if (event.offsetY > deadline) return
    //点击的点 与 发射点（底部中间） 的距离
    
    const dX = event.offsetX - startX
    const dY = event.offsetY - startY
    const velX = vel * dX / Math.sqrt(dX*dX + dY*dY)
    const velY = vel * dY / Math.sqrt(dX*dX + dY*dY)
    
    for (let i=0; i<ballNums; i++) {
        readyBalls.unshift(new Ball(
            startX,
            startY,
            RADIUS,
            velX,
            velY,
            i==0? startColor : `rgb(${random(32, 255)},${random(32, 255)},${random(32, 255)})`
        ))
    }

    pasue = true
    loop()
}

window.onload = ()=>{
    dataInit()
    canvas.onclick = shoot
    // //test
    // for (let i=0; i<n/2; i++) 
    //     for (let j=0; j<m; j++) {
    //         martix[i][j] = random(-100,100)
    //         if (martix[i][j] < 0) {
    //             if (Math.random()<0.2) martix[i][j] = -1
    //                 else martix[i][j] = 0
    //         }
    //     }
    nextRound()
}
