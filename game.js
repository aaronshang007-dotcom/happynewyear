/**
 * 地图类 - 负责地图生成和渲染
 */
class Map {
    constructor(rows, cols, cellSize) {
        this.rows = rows;
        this.cols = cols;
        this.cellSize = cellSize;
        this.grid = [];
        this.colors = {
            0: '#fff1f1', // 空地 (淡红/粉白)
            1: '#4a0404', // 钢墙 (深紫红/古建柱色)
            2: '#b91c1c'  // 砖块 (春节大红)
        };
        this.generateMap();
    }

    /**
     * 生成地图数据
     * 0: 空地, 1: 钢墙, 2: 砖块
     */
    generateMap() {
        for (let r = 0; r < this.rows; r++) {
            this.grid[r] = [];
            for (let c = 0; c < this.cols; c++) {
                if (r === 0 || r === this.rows - 1 || c === 0 || c === this.cols - 1) {
                    this.grid[r][c] = 1;
                }
                else if (r % 2 === 0 && c % 2 === 0) {
                    this.grid[r][c] = 1;
                }
                else {
                    if ((r <= 2 && c <= 2)) {
                        this.grid[r][c] = 0;
                    } else {
                        this.grid[r][c] = Math.random() < 0.4 ? 2 : 0;
                    }
                }
            }
        }
    }

    render(ctx) {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cellType = this.grid[r][c];
                const x = c * this.cellSize;
                const y = r * this.cellSize;

                ctx.fillStyle = this.colors[cellType];
                ctx.fillRect(x, y, this.cellSize, this.cellSize);

                if (cellType === 1) {
                    this.drawWall(ctx, x, y);
                } else if (cellType === 2) {
                    this.drawLantern(ctx, x, y);
                } else {
                    this.drawEmpty(ctx, x, y);
                }
            }
        }
    }

    // 钢墙改为古建筑石柱风
    drawWall(ctx, x, y) {
        ctx.strokeStyle = '#2d0a0a';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 4, y + 4, this.cellSize - 8, this.cellSize - 8);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(x + 8, y + 8, this.cellSize - 16, this.cellSize - 16);
    }

    // 砖块改为红灯笼风格或贴福字的木箱
    drawLantern(ctx, x, y) {
        const center = x + this.cellSize / 2;
        const middle = y + this.cellSize / 2;

        // 绘制“福”字木箱背景
        ctx.fillStyle = '#991b1b';
        ctx.fillRect(x + 2, y + 2, this.cellSize - 4, this.cellSize - 4);

        // 绘制金色边框
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 6, y + 6, this.cellSize - 12, this.cellSize - 12);

        // 绘制福字（简化）
        ctx.fillStyle = '#fbbf24';
        ctx.font = `bold ${this.cellSize * 0.5}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('福', center, middle);
    }

    drawEmpty(ctx, x, y) {
        ctx.strokeStyle = 'rgba(185, 28, 28, 0.1)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, this.cellSize, this.cellSize);
    }
}

/**
 * 掉落物品类 (红包)
 */
class Item {
    constructor(row, col, cellSize, type = 'envelope') {
        this.cellSize = cellSize;
        this.gridX = col;
        this.gridY = row;
        this.pixelX = col * cellSize + cellSize / 2;
        this.pixelY = row * cellSize + cellSize / 2;
        this.type = type;
        this.timer = 0;
    }

    render(ctx) {
        this.timer += 0.1;
        const bounce = Math.sin(this.timer) * 5;
        ctx.save();

        // 绘制红包
        const w = this.cellSize * 0.5;
        const h = this.cellSize * 0.7;
        const x = this.pixelX - w / 2;
        const y = this.pixelY - h / 2 + bounce;

        ctx.fillStyle = '#ef4444'; // 鲜红
        ctx.fillRect(x, y, w, h);

        // 金边和封口
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);
        ctx.fillStyle = '#fbbf24';
        ctx.beginPath();
        ctx.arc(this.pixelX, y + h * 0.3, w * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }
}

/**
 * 漂浮文字类
 */
class FloatingText {
    constructor(x, y, text) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.alpha = 1.0;
        this.timer = 0;
    }

    update() {
        this.y -= 1;
        this.alpha -= 0.02;
        this.timer++;
    }

    render(ctx) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 20px "Kaiti", serif';
        ctx.textAlign = 'center';
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }
}

/**
 * 金币/元宝粒子类
 */
class GoldParticle {
    constructor(width, height) {
        this.x = Math.random() * width;
        this.y = -20 - Math.random() * 100;
        this.speed = 2 + Math.random() * 5;
        this.size = 10 + Math.random() * 10;
        this.rot = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.y += this.speed;
        this.rot += this.rotSpeed;
    }

    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rot);
        ctx.fillStyle = '#fbbf24';
        // 绘制元宝形状 (简化)
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size, this.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
}

/**
 * 玩家类 - 负责移动和渲染
 */
class Player {
    constructor(row, col, cellSize, map) {
        this.map = map;
        this.cellSize = cellSize;

        // 逻辑位置 (网格索引)
        this.gridX = col;
        this.gridY = row;

        // 实际渲染位置 (像素)
        this.pixelX = col * cellSize + cellSize / 2;
        this.pixelY = row * cellSize + cellSize / 2;

        // 目标渲染位置 (用于平滑移动)
        this.targetPixelX = this.pixelX;
        this.targetPixelY = this.pixelY;

        this.radius = cellSize * 0.4;
        this.baseSpeed = 0.15;
        this.speed = this.baseSpeed; // 平滑移动的插值速度

        this.speedBuffTimer = 0; // 提速计时器

        // 生成 SVG 图片资源
        this.sprite = new Image();
        this.sprite.src = this.generateSprite();
    }

    /**
     * 程序化生成“小马背炸弹”的 SVG 矢量图
     */
    generateSprite() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <!-- Horse Body -->
            <rect x="12" y="32" width="36" height="20" fill="#f8f9fa"/>
            <rect x="12" y="36" width="36" height="20" fill="#e9ecef"/>
            <!-- Horse Head -->
            <rect x="36" y="12" width="20" height="24" fill="#f8f9fa"/>
            <!-- Mane -->
            <rect x="32" y="12" width="4" height="24" fill="#ced4da"/>
            <!-- Eye -->
            <rect x="48" y="20" width="4" height="4" fill="#212529"/>
            <!-- Legs -->
            <rect x="12" y="52" width="8" height="8" fill="#f8f9fa"/>
            <rect x="40" y="52" width="8" height="8" fill="#f8f9fa"/>
            
            <!-- Heroic Bomb on back -->
            <rect x="16" y="18" width="20" height="20" fill="#6f42c1" rx="4"/>
            <rect x="20" y="22" width="6" height="6" fill="#a29bfe" rx="2"/>
            <rect x="24" y="10" width="4" height="8" fill="#fdcb6e"/>
            
            <!-- Straps -->
            <rect x="14" y="32" width="40" height="4" fill="#495057" opacity="0.3"/>
        </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    /**
     * 移动指令
     * @param {number} dRow 行偏移
     * @param {number} dCol 列偏移
     */
    move(dRow, dCol) {
        // 如果当前还在平滑移动中，不接受新指令（或者可以排队，这里由于是网格对齐，我们先判定是否到达目标）
        const isMoving = Math.abs(this.pixelX - this.targetPixelX) > 0.1 ||
            Math.abs(this.pixelY - this.targetPixelY) > 0.1;

        if (isMoving) return;

        const nextRow = this.gridY + dRow;
        const nextCol = this.gridX + dCol;

        // 碰撞检测：只能在空地 (0) 上移动
        if (this.map.grid[nextRow] && this.map.grid[nextRow][nextCol] === 0) {
            this.gridX = nextCol;
            this.gridY = nextRow;
            this.targetPixelX = this.gridX * this.cellSize + this.cellSize / 2;
            this.targetPixelY = this.gridY * this.cellSize + this.cellSize / 2;
        }
    }

    /**
     * 更新位置以实现平滑移动
     */
    update() {
        // 更新提速效果
        if (this.speedBuffTimer > 0) {
            this.speed = this.baseSpeed * 1.5;
            this.speedBuffTimer--;
        } else {
            this.speed = this.baseSpeed;
        }

        // 简单的线性插值 (LERP) 实现平滑位置更新
        this.pixelX += (this.targetPixelX - this.pixelX) * this.speed;
        this.pixelY += (this.targetPixelY - this.pixelY) * this.speed;
    }

    render(ctx) {
        ctx.save();

        // 渲染祥云特效 (Buff active)
        if (this.speedBuffTimer > 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.beginPath();
            const time = Date.now() / 100;
            ctx.ellipse(this.pixelX, this.pixelY + this.cellSize * 0.4, this.cellSize * 0.6 + Math.sin(time) * 5, this.cellSize * 0.2, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.stroke();
        }

        // 渲染生成的矢量图
        if (this.sprite.complete && this.sprite.naturalWidth !== 0) {
            // 保持像素清晰度
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this.sprite,
                this.pixelX - this.cellSize * 0.5,
                this.pixelY - this.cellSize * 0.5,
                this.cellSize,
                this.cellSize
            );
        } else {
            // 降级方案：高清 Emoji
            ctx.globalAlpha = 1.0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const fontSize = Math.floor(this.cellSize * 0.95);
            ctx.font = `bold ${fontSize}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
            ctx.fillText('🐎', this.pixelX, this.pixelY);
            ctx.font = `${Math.floor(this.cellSize * 0.5)}px "Segoe UI Emoji", sans-serif`;
            ctx.fillText('💣', this.pixelX + 12, this.pixelY - 12);
        }

        ctx.restore();
    }
}

/**
 * 炸弹类
 */
class Bomb {
    constructor(row, col, cellSize, onExplode) {
        this.row = row;
        this.col = col;
        this.cellSize = cellSize;
        this.timer = 3000; // 3秒倒计时
        this.onExplode = onExplode;
        this.isExploded = false;

        this.x = col * cellSize + cellSize / 2;
        this.y = row * cellSize + cellSize / 2;
    }

    update(dt) {
        if (this.isExploded) return;

        this.timer -= dt;
        if (this.timer <= 0) {
            this.isExploded = true;
            this.onExplode(this);
        }
    }

    render(ctx) {
        if (this.isExploded) return;

        ctx.save();
        // 绘制“串红鞭炮”
        const width = this.cellSize * 0.4;
        const height = this.cellSize * 0.7;
        const x = this.x - width / 2;
        const y = this.y - height / 2;

        // 鞭炮主体 (红色)
        ctx.fillStyle = '#dc2626';
        ctx.fillRect(x, y, width, height);

        // 鞭炮节 (金色边)
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            ctx.strokeRect(x, y + i * (height / 4), width, height / 4);
        }

        // 引信花火
        const pulse = Math.sin(Date.now() / 100) * 2;
        ctx.beginPath();
        ctx.arc(this.x, y - 2, 2 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.fill();

        ctx.restore();
    }
}

/**
 * 爆炸火花类
 */
class Explosion {
    constructor(cells, cellSize) {
        this.cells = cells; // [{row, col}, ...]
        this.cellSize = cellSize;
        this.timer = 500; // 0.5秒持续时间
        this.isFinished = false;
    }

    update(dt) {
        this.timer -= dt;
        if (this.timer <= 0) {
            this.isFinished = true;
        }
    }

    render(ctx) {
        ctx.save();
        const alpha = this.timer / 500;

        // 烟花绽放特效：多个不同颜色的粒子
        const colors = ['#f87171', '#fbbf24', '#34d399', '#60a5fa', '#f472b6'];

        this.cells.forEach((cell, idx) => {
            const centerX = cell.col * this.cellSize + this.cellSize / 2;
            const centerY = cell.row * this.cellSize + this.cellSize / 2;

            // 绘制核心光芒
            ctx.globalAlpha = alpha;
            ctx.fillStyle = colors[idx % colors.length];

            // 简单的十字烟花
            const size = (this.cellSize / 2) * (1 - alpha);
            ctx.fillRect(centerX - this.cellSize / 2 + 2, centerY - 2, this.cellSize - 4, 4);
            ctx.fillRect(centerX - 2, centerY - this.cellSize / 2 + 2, 4, this.cellSize - 4);

            // 粒子感
            for (let i = 0; i < 4; i++) {
                ctx.fillRect(
                    centerX + Math.cos(i * Math.PI / 2) * size * 2 - 2,
                    centerY + Math.sin(i * Math.PI / 2) * size * 2 - 2,
                    4, 4
                );
            }
        });
        ctx.restore();
    }
}

/**
 * 敌人类 - 随机游走 AI
 */
class Enemy {
    constructor(row, col, cellSize, map) {
        this.map = map;
        this.cellSize = cellSize;
        this.gridX = col;
        this.gridY = row;

        this.pixelX = col * cellSize + cellSize / 2;
        this.pixelY = row * cellSize + cellSize / 2;
        this.targetPixelX = this.pixelX;
        this.targetPixelY = this.pixelY;

        this.speed = 0.1;
        this.isDead = false;
        this.moveCooldown = 0;

        // Generate Enemy Sprite
        this.sprite = new Image();
        this.sprite.src = this.generateSprite();
    }

    generateSprite() {
        const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
            <!-- Nian Monster Body (Blue/Purple) -->
            <rect x="10" y="12" width="44" height="40" fill="#4834d4" rx="10"/>
            <rect x="10" y="44" width="44" height="8" fill="#30336b" rx="5"/>
            <!-- Eyes (Angry) -->
            <rect x="18" y="22" width="10" height="10" fill="white"/>
            <rect x="36" y="22" width="10" height="10" fill="white"/>
            <rect x="22" y="25" width="4" height="4" fill="#eb4d4b"/>
            <rect x="40" y="25" width="4" height="4" fill="#eb4d4b"/>
            <!-- Teeth -->
            <rect x="22" y="42" width="4" height="6" fill="white"/>
            <rect x="38" y="42" width="4" height="6" fill="white"/>
            <!-- Horns (Gold) -->
            <path d="M10,12 L10,2 L25,12 Z" fill="#f9ca24"/>
            <path d="M54,12 L54,2 L39,12 Z" fill="#f9ca24"/>
        </svg>
        `;
        return 'data:image/svg+xml;base64,' + btoa(svg);
    }

    update(dt) {
        if (this.isDead) return;

        // 平滑移动
        this.pixelX += (this.targetPixelX - this.pixelX) * this.speed;
        this.pixelY += (this.targetPixelY - this.pixelY) * this.speed;

        // 如果到达目标，考虑下一步移动
        const isMoving = Math.abs(this.pixelX - this.targetPixelX) > 0.5 ||
            Math.abs(this.pixelY - this.targetPixelY) > 0.5;

        if (!isMoving) {
            this.moveCooldown -= dt;
            if (this.moveCooldown <= 0) {
                this.chooseNextMove();
                this.moveCooldown = 200; // 稍微停顿一下
            }
        }
    }

    chooseNextMove() {
        const dirs = [
            { r: -1, c: 0 }, { r: 1, c: 0 },
            { r: 0, c: -1 }, { r: 0, c: 1 }
        ];

        // 过滤出可通行的方向
        const availableDirs = dirs.filter(d => {
            const nr = this.gridY + d.r;
            const nc = this.gridX + d.c;
            return this.map.grid[nr] && this.map.grid[nr][nc] === 0;
        });

        if (availableDirs.length > 0) {
            // 随机选一个方向
            const dir = availableDirs[Math.floor(Math.random() * availableDirs.length)];
            this.gridX += dir.c;
            this.gridY += dir.r;
            this.targetPixelX = this.gridX * this.cellSize + this.cellSize / 2;
            this.targetPixelY = this.gridY * this.cellSize + this.cellSize / 2;
        }
    }

    render(ctx) {
        if (this.isDead) return;
        ctx.save();

        // 强制不透明
        ctx.globalAlpha = 1.0;

        if (this.sprite.complete && this.sprite.naturalWidth !== 0) {
            // 保持像素锐利
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(
                this.sprite,
                this.pixelX - this.cellSize * 0.45,
                this.pixelY - this.cellSize * 0.45,
                this.cellSize * 0.9,
                this.cellSize * 0.9
            );
        } else {
            // 降级方案
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const fontSize = Math.floor(this.cellSize * 0.95);
            ctx.font = `bold ${fontSize}px "Segoe UI Emoji", sans-serif`;
            ctx.fillText('👹', this.pixelX, this.pixelY);
        }

        ctx.restore();
    }
}

/**
 * 游戏类 - 驱动程序
 */
class Game {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('game-overlay');
        this.statusText = document.getElementById('status-text');

        // 对联库
        this.coupletLibrary = [
            ['天增岁月人增寿', '春满乾坤福满门'],
            ['门迎百福福星照', '户纳千祥祥云开'],
            ['一帆风顺年年好', '万事如意步步高'],
            ['春临大地百花艳', '节至人间万象新'],
            ['事事如意大吉祥', '家家顺心长安康'],
            ['和顺一门有百福', '平安二字值千金'],
            ['喜居宝地千年旺', '福照家门万事兴'],
            ['新年有福随心到', '好岁无虞顺意来'],
            ['金马奔腾开胜局', '神龙起舞展宏图'],
            ['四海迎春千卉放', '九州庆节万家欢']
        ];

        const baseRows = 9;
        const baseCols = 11;
        const baseCellSize = 40;

        const dpr = window.devicePixelRatio || 1;
        this.rows = baseRows;
        this.cols = baseCols;
        this.cellSize = baseCellSize;

        this.canvas.width = (this.cols * this.cellSize) * dpr;
        this.canvas.height = (this.rows * this.cellSize) * dpr;
        this.canvas.style.width = (this.cols * this.cellSize) + 'px';
        this.canvas.style.height = (this.rows * this.cellSize) + 'px';

        this.ctx.scale(dpr, dpr);
        this.ctx.imageSmoothingEnabled = false;

        this.map = new Map(this.rows, this.cols, this.cellSize);
        this.player = new Player(1, 1, this.cellSize, this.map);

        this.enemies = this.initEnemies();
        this.bombs = [];
        this.explosions = [];
        this.items = [];
        this.floatingTexts = [];
        this.particles = [];

        this.score = 0;
        this.lastTime = 0;
        this.gameState = 'playing'; // playing, lost, won, paused

        this.handleInput();
        this.init();
    }

    initEnemies() {
        const enemies = [];
        let count = 0;
        while (count < 3) {
            const r = Math.floor(Math.random() * (this.rows - 2)) + 1;
            const c = Math.floor(Math.random() * (this.cols - 2)) + 1;
            const dist = Math.abs(r - 1) + Math.abs(c - 1);
            if (this.map.grid[r][c] === 0 && dist > 5) {
                enemies.push(new Enemy(r, c, this.cellSize, this.map));
                count++;
            }
        }
        return enemies;
    }

    handleInput() {
        window.addEventListener('keydown', (e) => {
            if (this.gameState !== 'playing') return;
            switch (e.key) {
                case 'ArrowUp': this.player.move(-1, 0); break;
                case 'ArrowDown': this.player.move(1, 0); break;
                case 'ArrowLeft': this.player.move(0, -1); break;
                case 'ArrowRight': this.player.move(0, 1); break;
                case ' ': this.placeBomb(); break;
            }
        });
    }

    placeBomb() {
        const r = this.player.gridY;
        const c = this.player.gridX;
        if (this.bombs.some(b => b.row === r && b.col === c)) return;
        this.bombs.push(new Bomb(r, c, this.cellSize, (bomb) => this.explode(bomb)));
    }

    explode(bomb) {
        const affectedCells = [{ row: bomb.row, col: bomb.col }];
        const directions = [{ r: -1, c: 0 }, { r: 1, c: 0 }, { r: 0, c: -1 }, { r: 0, c: 1 }];

        directions.forEach(dir => {
            for (let i = 1; i <= 2; i++) {
                const nr = bomb.row + dir.r * i;
                const nc = bomb.col + dir.c * i;
                if (nr < 0 || nr >= this.rows || nc < 0 || nc >= this.cols) break;
                const cellType = this.map.grid[nr][nc];
                if (cellType === 1) break;
                affectedCells.push({ row: nr, col: nc });
                if (cellType === 2) {
                    this.map.grid[nr][nc] = 0;
                    break;
                }
            }
        });

        this.explosions.push(new Explosion(affectedCells, this.cellSize));
    }

    init() {
        requestAnimationFrame((time) => this.gameLoop(time));
    }

    gameLoop(time) {
        const dt = time - (this.lastTime || time);
        this.lastTime = time;

        if (this.gameState === 'playing' || this.gameState === 'won') {
            this.update(dt);
            if (this.gameState === 'playing') {
                this.checkCollisions();
                this.checkGameState();
            }
        }

        this.render();
        requestAnimationFrame((t) => this.gameLoop(t));
    }

    update(dt) {
        this.player.update();
        if (this.gameState === 'playing') {
            this.enemies.forEach(e => e.update(dt));
        }

        this.bombs.forEach(b => b.update(dt));
        this.bombs = this.bombs.filter(b => !b.isExploded);
        this.explosions.forEach(e => e.update(dt));
        this.explosions = this.explosions.filter(e => !e.isFinished);

        this.floatingTexts.forEach(t => t.update());
        this.floatingTexts = this.floatingTexts.filter(t => t.alpha > 0);

        if (this.gameState === 'won') {
            if (this.particles.length < 50) {
                this.particles.push(new GoldParticle(this.cols * this.cellSize, this.rows * this.cellSize));
            }
            this.particles.forEach(p => p.update());
        }
    }

    checkCollisions() {
        this.explosions.forEach(exp => {
            exp.cells.forEach(cell => {
                if (this.player.gridX === cell.col && this.player.gridY === cell.row) {
                    this.gameState = 'lost';
                }
                this.enemies.forEach(enemy => {
                    if (!enemy.isDead && enemy.gridX === cell.col && enemy.gridY === cell.row) {
                        enemy.isDead = true;
                        // 掉落红包
                        this.items.push(new Item(cell.row, cell.col, this.cellSize));
                        // 变身特效：提速
                        this.player.speedBuffTimer = 300; // 约5秒 (60fps * 5)
                        this.showCouplet();
                    }
                });
            });
        });

        // 捡红包检测
        this.items.forEach((item, idx) => {
            const dist = Math.sqrt(Math.pow(this.player.pixelX - item.pixelX, 2) + Math.pow(this.player.pixelY - item.pixelY, 2));
            if (dist < this.cellSize * 0.5) {
                this.score += 888;
                this.floatingTexts.push(new FloatingText(item.pixelX, item.pixelY, '大吉大利 +888'));
                this.items.splice(idx, 1);
            }
        });

        this.enemies.forEach(enemy => {
            if (!enemy.isDead) {
                const dist = Math.sqrt(
                    Math.pow(this.player.pixelX - enemy.pixelX, 2) +
                    Math.pow(this.player.pixelY - enemy.pixelY, 2)
                );
                if (dist < this.cellSize * 0.6) {
                    this.gameState = 'lost';
                }
            }
        });

        this.enemies = this.enemies.filter(e => !e.isDead);
    }

    showCouplet() {
        if (this.gameState !== 'playing') return;

        this.gameState = 'paused';
        const couplet = this.coupletLibrary[Math.floor(Math.random() * this.coupletLibrary.length)];
        this.currentCouplet = couplet;

        setTimeout(() => {
            if (this.gameState === 'paused') {
                this.gameState = 'playing';
                this.currentCouplet = null;
            }
        }, 2000);
    }

    checkGameState() {
        if (this.enemies.length === 0 && this.gameState === 'playing') {
            this.gameState = 'won';
        }

        if (this.gameState === 'won' || this.gameState === 'lost') {
            this.overlay.style.display = 'flex';
            this.statusText.innerText = this.gameState === 'won' ? '祥龙献瑞，新春大吉！' : '大限将至，卷土重来';
            this.statusText.style.color = this.gameState === 'won' ? '#f59e0b' : '#e74c3c';
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.map.render(this.ctx);
        this.items.forEach(i => i.render(this.ctx));
        this.bombs.forEach(b => b.render(this.ctx));
        this.explosions.forEach(e => e.render(this.ctx));
        this.enemies.forEach(e => e.render(this.ctx));
        this.player.render(this.ctx);
        this.floatingTexts.forEach(t => t.render(this.ctx));

        if (this.gameState === 'won') {
            this.particles.forEach(p => p.render(this.ctx));
        }

        // 渲染 UI 分数
        this.ctx.fillStyle = '#b91c1c';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`福气值: ${this.score}`, 20, 30);

        if (this.gameState === 'paused' && this.currentCouplet) {
            this.renderCoupletUI();
        }
    }

    renderCoupletUI() {
        const width = this.cols * this.cellSize;
        const height = this.rows * this.cellSize;

        this.ctx.save();

        // 暗角背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        this.ctx.fillRect(0, 0, width, height);

        // 绘制红色画卷 (Scroll)
        const scrollWidth = width * 0.6;
        const scrollHeight = height * 0.7;
        const x = (width - scrollWidth) / 2;
        const y = (height - scrollHeight) / 2;

        // 画卷主体
        this.ctx.fillStyle = '#b91c1c'; // 深红
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = 'black';
        this.ctx.fillRect(x, y, scrollWidth, scrollHeight);

        // 金色边框
        this.ctx.strokeStyle = '#f59e0b';
        this.ctx.lineWidth = 4;
        this.ctx.strokeRect(x + 10, y + 10, scrollWidth - 20, scrollHeight - 20);

        // 终极横幅 (横批)
        this.ctx.fillStyle = '#f59e0b';
        const bannerW = scrollWidth * 0.4;
        const bannerH = 40;
        this.ctx.fillRect(width / 2 - bannerW / 2, y + 25, bannerW, bannerH);
        this.ctx.fillStyle = '#b91c1c';
        this.ctx.font = 'bold 24px "Kaiti", serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('新春大吉', width / 2, y + 55);

        // 绘制对联文字
        this.ctx.shadowBlur = 0;
        this.ctx.fillStyle = '#f59e0b'; // 金色书法
        this.ctx.font = `bold ${Math.floor(this.cellSize * 0.8)}px "Kaiti", "STKaiti", serif`;
        this.ctx.textAlign = 'center';

        const leftX = x + scrollWidth * 0.25;
        const rightX = x + scrollWidth * 0.75;
        const startY = y + 110;
        const lineSpacing = this.cellSize * 1.0;

        // 右联（上联）
        const upper = this.currentCouplet[0];
        for (let i = 0; i < upper.length; i++) {
            this.ctx.fillText(upper[i], rightX, startY + i * lineSpacing);
        }

        // 左联（下联）
        const lower = this.currentCouplet[1];
        for (let i = 0; i < lower.length; i++) {
            this.ctx.fillText(lower[i], leftX, startY + i * lineSpacing);
        }

        // 提示小字
        this.ctx.font = `14px Arial`;
        this.ctx.fillText('年兽已除，对联送福', width / 2, y + scrollHeight - 40);

        this.ctx.restore();
    }
}

window.onload = () => {
    window.game = new Game('gameCanvas');
};
