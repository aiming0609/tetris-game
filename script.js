/**
 * Gemini Tetris - 现代化俄罗斯方块游戏
 * 优化版本：包含游戏状态管理、等级系统、移动端支持等
 */

class TetrisGame {
  constructor() {
    this.initializeElements();
    this.initializeConstants();
    this.initializeGameState();
    this.initializeBoard();
    this.initializeNextPieceDisplay();
    this.bindEvents();
    this.loadHighScore();
    this.updateDisplay();
    this.detectMobile();
  }

  initializeElements() {
    this.gameBoard = document.querySelector(".game-board");
    this.scoreDisplay = document.getElementById("score");
    this.levelDisplay = document.getElementById("level");
    this.linesDisplay = document.getElementById("lines");
    this.highScoreDisplay = document.getElementById("highscore");
    this.nextPieceDisplay = document.querySelector(".next-piece");
    this.gameOverlay = document.getElementById("game-overlay");
    this.overlayTitle = document.getElementById("overlay-title");
    this.overlayMessage = document.getElementById("overlay-message");

    // 控制按钮
    this.startButton = document.getElementById("start-button");
    this.pauseButton = document.getElementById("pause-button");
    this.restartButton = document.getElementById("restart-button");

    // 移动端控制
    this.mobileControls = document.getElementById("mobile-controls");
    this.touchLeft = document.getElementById("touch-left");
    this.touchRight = document.getElementById("touch-right");
    this.touchDown = document.getElementById("touch-down");
    this.touchRotate = document.getElementById("touch-rotate");
  }

  initializeConstants() {
    this.BOARD_WIDTH = 10;
    this.BOARD_HEIGHT = 20;
    this.LINES_PER_LEVEL = 10;
    this.BASE_FALL_TIME = 1000;
    this.MIN_FALL_TIME = 100;
    this.SCORE_VALUES = {
      1: 40, // 单行消除
      2: 100, // 双行消除
      3: 300, // 三行消除
      4: 1200, // 四行消除（Tetris）
    };

    // 方块定义 - 所有7种标准俄罗斯方块
    this.PIECES = {
      I: {
        shape: [
          [[1, 1, 1, 1]],
          [[1], [1], [1], [1]],
          [[1, 1, 1, 1]],
          [[1], [1], [1], [1]],
        ],
        color: "piece-i",
      },
      O: {
        shape: [
          [
            [1, 1],
            [1, 1],
          ],
          [
            [1, 1],
            [1, 1],
          ],
          [
            [1, 1],
            [1, 1],
          ],
          [
            [1, 1],
            [1, 1],
          ],
        ],
        color: "piece-o",
      },
      T: {
        shape: [
          [
            [0, 1, 0],
            [1, 1, 1],
          ],
          [
            [1, 0],
            [1, 1],
            [1, 0],
          ],
          [
            [1, 1, 1],
            [0, 1, 0],
          ],
          [
            [0, 1],
            [1, 1],
            [0, 1],
          ],
        ],
        color: "piece-t",
      },
      S: {
        shape: [
          [
            [0, 1, 1],
            [1, 1, 0],
          ],
          [
            [1, 0],
            [1, 1],
            [0, 1],
          ],
          [
            [0, 1, 1],
            [1, 1, 0],
          ],
          [
            [1, 0],
            [1, 1],
            [0, 1],
          ],
        ],
        color: "piece-s",
      },
      Z: {
        shape: [
          [
            [1, 1, 0],
            [0, 1, 1],
          ],
          [
            [0, 1],
            [1, 1],
            [1, 0],
          ],
          [
            [1, 1, 0],
            [0, 1, 1],
          ],
          [
            [0, 1],
            [1, 1],
            [1, 0],
          ],
        ],
        color: "piece-z",
      },
      J: {
        shape: [
          [
            [1, 0, 0],
            [1, 1, 1],
          ],
          [
            [1, 1],
            [1, 0],
            [1, 0],
          ],
          [
            [1, 1, 1],
            [0, 0, 1],
          ],
          [
            [0, 1],
            [0, 1],
            [1, 1],
          ],
        ],
        color: "piece-j",
      },
      L: {
        shape: [
          [
            [0, 0, 1],
            [1, 1, 1],
          ],
          [
            [1, 0],
            [1, 0],
            [1, 1],
          ],
          [
            [1, 1, 1],
            [1, 0, 0],
          ],
          [
            [1, 1],
            [0, 1],
            [0, 1],
          ],
        ],
        color: "piece-l",
      },
    };

    this.PIECE_TYPES = Object.keys(this.PIECES);
  }

  initializeGameState() {
    this.gameState = "stopped"; // stopped, playing, paused, gameover
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.highScore = 0;
    this.fallTimer = null;
    this.fallTime = this.BASE_FALL_TIME;

    this.currentPiece = null;
    this.currentPosition = { x: 0, y: 0 };
    this.currentRotation = 0;
    this.nextPieceType = this.getRandomPieceType();

    this.board = [];
    this.isMobile = false;
  }

  initializeBoard() {
    // 创建游戏板格子
    this.gameBoard.innerHTML = "";
    this.squares = [];

    for (let i = 0; i < this.BOARD_WIDTH * this.BOARD_HEIGHT; i++) {
      const square = document.createElement("div");
      square.classList.add("block");
      this.gameBoard.appendChild(square);
      this.squares.push(square);
    }

    // 创建底部边界（隐藏行）
    for (let i = 0; i < this.BOARD_WIDTH; i++) {
      const square = document.createElement("div");
      square.classList.add("taken", "block");
      this.gameBoard.appendChild(square);
      this.squares.push(square);
    }

    // 初始化逻辑板
    this.board = Array(this.BOARD_HEIGHT)
      .fill()
      .map(() => Array(this.BOARD_WIDTH).fill(0));
  }

  initializeNextPieceDisplay() {
    this.nextPieceDisplay.innerHTML = "";
    this.nextSquares = [];

    for (let i = 0; i < 16; i++) {
      // 4x4 网格
      const square = document.createElement("div");
      this.nextPieceDisplay.appendChild(square);
      this.nextSquares.push(square);
    }
  }

  bindEvents() {
    // 键盘事件
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    // 按钮事件
    this.startButton.addEventListener("click", this.startGame.bind(this));
    this.pauseButton.addEventListener("click", this.togglePause.bind(this));
    this.restartButton.addEventListener("click", this.restartGame.bind(this));

    // 移动端触摸事件
    if (this.touchLeft) {
      this.touchLeft.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.movePiece(-1, 0);
      });

      this.touchRight.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.movePiece(1, 0);
      });

      this.touchDown.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.movePiece(0, 1);
      });

      this.touchRotate.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.rotatePiece();
      });
    }

    // 防止页面滚动
    document.addEventListener(
      "touchmove",
      (e) => {
        if (e.target.closest(".mobile-controls")) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  }

  detectMobile() {
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) || window.innerWidth <= 768;

    if (this.isMobile && this.mobileControls) {
      this.mobileControls.style.display = "block";
    }
  }

  getRandomPieceType() {
    return this.PIECE_TYPES[
      Math.floor(Math.random() * this.PIECE_TYPES.length)
    ];
  }

  createNewPiece() {
    const pieceType = this.nextPieceType;
    this.nextPieceType = this.getRandomPieceType();

    this.currentPiece = {
      type: pieceType,
      shape: this.PIECES[pieceType].shape[0],
      color: this.PIECES[pieceType].color,
    };

    this.currentPosition = {
      x: Math.floor((this.BOARD_WIDTH - this.currentPiece.shape[0].length) / 2),
      y: 0,
    };
    this.currentRotation = 0;

    this.displayNextPiece();

    // 检查游戏结束
    if (
      this.isCollision(
        this.currentPiece.shape,
        this.currentPosition.x,
        this.currentPosition.y
      )
    ) {
      this.gameOver();
      return false;
    }

    this.drawPiece();
    return true;
  }

  drawPiece() {
    this.clearPiece();

    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardX = this.currentPosition.x + x;
          const boardY = this.currentPosition.y + y;

          if (
            boardY >= 0 &&
            boardY < this.BOARD_HEIGHT &&
            boardX >= 0 &&
            boardX < this.BOARD_WIDTH
          ) {
            const index = boardY * this.BOARD_WIDTH + boardX;
            this.squares[index].classList.add(this.currentPiece.color);
          }
        }
      }
    }
  }

  clearPiece() {
    this.squares.forEach((square) => {
      this.PIECE_TYPES.forEach((type) => {
        square.classList.remove(this.PIECES[type].color);
      });
    });

    // 重新绘制已固定的方块
    for (let y = 0; y < this.BOARD_HEIGHT; y++) {
      for (let x = 0; x < this.BOARD_WIDTH; x++) {
        if (this.board[y][x]) {
          const index = y * this.BOARD_WIDTH + x;
          this.squares[index].classList.add(this.board[y][x]);
        }
      }
    }
  }

  isCollision(shape, x, y) {
    for (let py = 0; py < shape.length; py++) {
      for (let px = 0; px < shape[py].length; px++) {
        if (shape[py][px]) {
          const newX = x + px;
          const newY = y + py;

          // 检查边界
          if (
            newX < 0 ||
            newX >= this.BOARD_WIDTH ||
            newY >= this.BOARD_HEIGHT
          ) {
            return true;
          }

          // 检查已有方块
          if (newY >= 0 && this.board[newY][newX]) {
            return true;
          }
        }
      }
    }
    return false;
  }

  movePiece(deltaX, deltaY) {
    if (this.gameState !== "playing") return;

    const newX = this.currentPosition.x + deltaX;
    const newY = this.currentPosition.y + deltaY;

    if (!this.isCollision(this.currentPiece.shape, newX, newY)) {
      this.currentPosition.x = newX;
      this.currentPosition.y = newY;
      this.drawPiece();

      // 如果是向下移动且成功，重置下落计时器
      if (deltaY > 0) {
        this.resetFallTimer();
      }
    } else if (deltaY > 0) {
      // 如果向下移动失败，则固定方块
      this.lockPiece();
    }
  }

  rotatePiece() {
    if (this.gameState !== "playing") return;

    const nextRotation = (this.currentRotation + 1) % 4;
    const rotatedShape =
      this.PIECES[this.currentPiece.type].shape[nextRotation];

    // 尝试在当前位置旋转
    if (
      !this.isCollision(
        rotatedShape,
        this.currentPosition.x,
        this.currentPosition.y
      )
    ) {
      this.currentRotation = nextRotation;
      this.currentPiece.shape = rotatedShape;
      this.drawPiece();
      return;
    }

    // 尝试壁踢（Wall Kick）
    const kicks = [
      { x: -1, y: 0 }, // 左移
      { x: 1, y: 0 }, // 右移
      { x: 0, y: -1 }, // 上移
      { x: -1, y: -1 }, // 左上移
      { x: 1, y: -1 }, // 右上移
    ];

    for (const kick of kicks) {
      const newX = this.currentPosition.x + kick.x;
      const newY = this.currentPosition.y + kick.y;

      if (!this.isCollision(rotatedShape, newX, newY)) {
        this.currentPosition.x = newX;
        this.currentPosition.y = newY;
        this.currentRotation = nextRotation;
        this.currentPiece.shape = rotatedShape;
        this.drawPiece();
        return;
      }
    }
  }

  lockPiece() {
    // 将当前方块固定到板上
    for (let y = 0; y < this.currentPiece.shape.length; y++) {
      for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
        if (this.currentPiece.shape[y][x]) {
          const boardX = this.currentPosition.x + x;
          const boardY = this.currentPosition.y + y;

          if (
            boardY >= 0 &&
            boardY < this.BOARD_HEIGHT &&
            boardX >= 0 &&
            boardX < this.BOARD_WIDTH
          ) {
            this.board[boardY][boardX] = this.currentPiece.color;
            const index = boardY * this.BOARD_WIDTH + boardX;
            this.squares[index].classList.add("taken");
          }
        }
      }
    }

    // 检查并清除完整行
    this.clearLines();

    // 创建新方块
    if (!this.createNewPiece()) {
      return; // 游戏结束
    }
  }

  clearLines() {
    const completedLines = [];

    // 查找完整行
    for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
      if (this.board[y].every((cell) => cell !== 0)) {
        completedLines.push(y);
      }
    }

    if (completedLines.length > 0) {
      // 播放消行动画
      this.animateLineClears(completedLines);

      // 移除完整行
      completedLines.forEach((lineY) => {
        this.board.splice(lineY, 1);
        this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
      });

      // 更新UI
      this.updateBoardDisplay();

      // 更新得分和等级
      this.updateScore(completedLines.length);
      this.updateLevel();
    }
  }

  animateLineClears(lines) {
    lines.forEach((lineY) => {
      for (let x = 0; x < this.BOARD_WIDTH; x++) {
        const index = lineY * this.BOARD_WIDTH + x;
        this.squares[index].classList.add("line-complete");
      }
    });

    // 移除动画类
    setTimeout(() => {
      lines.forEach((lineY) => {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
          const index = lineY * this.BOARD_WIDTH + x;
          this.squares[index].classList.remove("line-complete");
        }
      });
    }, 500);
  }

  updateBoardDisplay() {
    // 清除所有方块样式
    this.squares.forEach((square) => {
      square.className = "block";
    });

    // 重新绘制所有固定方块
    for (let y = 0; y < this.BOARD_HEIGHT; y++) {
      for (let x = 0; x < this.BOARD_WIDTH; x++) {
        if (this.board[y][x]) {
          const index = y * this.BOARD_WIDTH + x;
          this.squares[index].classList.add("taken", this.board[y][x]);
        }
      }
    }

    // 重新绘制当前方块
    if (this.currentPiece) {
      this.drawPiece();
    }
  }

  updateScore(linesCleared) {
    if (linesCleared > 0) {
      const baseScore = this.SCORE_VALUES[linesCleared] || 0;
      const levelMultiplier = this.level;
      const scoreGain = baseScore * levelMultiplier;

      this.score += scoreGain;
      this.lines += linesCleared;

      // 动画效果
      this.scoreDisplay.classList.add("updated");
      setTimeout(() => {
        this.scoreDisplay.classList.remove("updated");
      }, 300);

      this.updateDisplay();
      this.updateHighScore();
    }
  }

  updateLevel() {
    const newLevel = Math.floor(this.lines / this.LINES_PER_LEVEL) + 1;
    if (newLevel > this.level) {
      this.level = newLevel;
      this.fallTime = Math.max(
        this.MIN_FALL_TIME,
        this.BASE_FALL_TIME - (this.level - 1) * 50
      );
      this.resetFallTimer();
      this.updateDisplay();
    }
  }

  updateHighScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      this.saveHighScore();
      this.updateDisplay();
    }
  }

  displayNextPiece() {
    // 清除显示区域
    this.nextSquares.forEach((square) => {
      square.className = "";
    });

    const nextPiece = this.PIECES[this.nextPieceType];
    const shape = nextPiece.shape[0];
    const color = nextPiece.color;

    // 计算居中位置
    const offsetX = Math.floor((4 - shape[0].length) / 2);
    const offsetY = Math.floor((4 - shape.length) / 2);

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const index = (offsetY + y) * 4 + (offsetX + x);
          if (index >= 0 && index < 16) {
            this.nextSquares[index].classList.add(color);
          }
        }
      }
    }
  }

  updateDisplay() {
    this.scoreDisplay.textContent = this.score.toLocaleString();
    this.levelDisplay.textContent = this.level;
    this.linesDisplay.textContent = this.lines;
    this.highScoreDisplay.textContent = this.highScore.toLocaleString();
  }

  loadHighScore() {
    const saved = localStorage.getItem("tetris-highscore");
    this.highScore = saved ? parseInt(saved) : 0;
  }

  saveHighScore() {
    localStorage.setItem("tetris-highscore", this.highScore.toString());
  }

  showOverlay(title, message) {
    this.overlayTitle.textContent = title;
    this.overlayMessage.textContent = message;
    this.gameOverlay.classList.remove("hidden");
  }

  hideOverlay() {
    this.gameOverlay.classList.add("hidden");
  }

  resetFallTimer() {
    if (this.fallTimer) {
      clearInterval(this.fallTimer);
    }

    if (this.gameState === "playing") {
      this.fallTimer = setInterval(() => {
        this.movePiece(0, 1);
      }, this.fallTime);
    }
  }

  startGame() {
    if (this.gameState === "stopped" || this.gameState === "gameover") {
      this.initializeGameState();
      this.initializeBoard();
      this.updateDisplay();
      this.gameState = "playing";

      this.startButton.textContent = "游戏中";
      this.startButton.disabled = true;
      this.pauseButton.disabled = false;

      this.hideOverlay();
      this.createNewPiece();
      this.resetFallTimer();
    }
  }

  togglePause() {
    if (this.gameState === "playing") {
      this.gameState = "paused";
      this.pauseButton.textContent = "继续";
      this.showOverlay("游戏暂停", "点击继续按钮恢复游戏");
      clearInterval(this.fallTimer);
    } else if (this.gameState === "paused") {
      this.gameState = "playing";
      this.pauseButton.textContent = "暂停";
      this.hideOverlay();
      this.resetFallTimer();
    }
  }

  restartGame() {
    this.gameState = "stopped";
    clearInterval(this.fallTimer);

    this.startButton.textContent = "开始游戏";
    this.startButton.disabled = false;
    this.pauseButton.textContent = "暂停";
    this.pauseButton.disabled = true;

    this.initializeGameState();
    this.initializeBoard();
    this.updateDisplay();
    this.showOverlay("准备开始", "点击开始按钮开始游戏");
  }

  gameOver() {
    this.gameState = "gameover";
    clearInterval(this.fallTimer);

    this.startButton.textContent = "开始游戏";
    this.startButton.disabled = false;
    this.pauseButton.textContent = "暂停";
    this.pauseButton.disabled = true;

    const isNewRecord = this.score === this.highScore && this.score > 0;
    const title = isNewRecord ? "🎉 新纪录！" : "游戏结束";
    const message = `得分: ${this.score.toLocaleString()}\n等级: ${
      this.level
    }\n消除行数: ${this.lines}`;

    this.showOverlay(title, message);
  }

  handleKeyDown(event) {
    if (this.gameState !== "playing") {
      // 在非游戏状态下允许的快捷键
      if (event.code === "Space") {
        event.preventDefault();
        if (this.gameState === "paused") {
          this.togglePause();
        } else if (
          this.gameState === "stopped" ||
          this.gameState === "gameover"
        ) {
          this.startGame();
        }
      }
      return;
    }

    event.preventDefault();

    switch (event.code) {
      case "ArrowLeft":
        this.movePiece(-1, 0);
        break;
      case "ArrowRight":
        this.movePiece(1, 0);
        break;
      case "ArrowDown":
        this.movePiece(0, 1);
        break;
      case "ArrowUp":
        this.rotatePiece();
        break;
      case "Space":
        this.togglePause();
        break;
    }
  }
}

// 游戏初始化
document.addEventListener("DOMContentLoaded", () => {
  window.tetrisGame = new TetrisGame();

  // 添加页面可见性API支持，当页面隐藏时自动暂停游戏
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && window.tetrisGame.gameState === "playing") {
      window.tetrisGame.togglePause();
    }
  });

  console.log("🎮 Gemini Tetris 游戏已加载完成！");
  console.log("使用箭头键控制方块，空格键暂停/继续游戏");
});
