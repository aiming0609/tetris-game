/**
 * Gemini Tetris - 现代化俄罗斯方块游戏
 * 优化版本：包含游戏状态管理、等级系统、移动端支持等
 */

class TetrisGame {
  constructor() {
    this.initializeElements();
    this.initializeConstants();
    // 先初始化highScore为0，然后再加载存储的值
    this.highScore = 0;
    this.initializeGameState();
    this.initializeBoard();
    this.initializeNextPieceDisplay();
    this.initializeKeyboardControls(); // 初始化键盘控制
    this.bindEvents();
    this.loadHighScore(); // 这里会覆盖上面的默认值
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
    // 不要重置highScore，保持历史最高分
    // this.highScore = 0; // 移除这行，避免清零历史最高分
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

    // 创建底部边界（隐藏行）- 不再添加到DOM中，只在逻辑上使用
    // 这样可以避免底部边界方块显示问题
    this.bottomBoundary = [];
    for (let i = 0; i < this.BOARD_WIDTH; i++) {
      this.bottomBoundary.push({
        classList: {
          add: () => {}, // 空函数，因为这些元素不在DOM中
          remove: () => {}, // 空函数
          contains: () => true, // 始终视为已占用
        },
      });
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
    // 按钮事件
    this.startButton.addEventListener("click", this.startGame.bind(this));
    this.pauseButton.addEventListener("click", this.togglePause.bind(this));
    this.restartButton.addEventListener("click", this.restartGame.bind(this));

    // 移动端触摸事件
    if (this.touchLeft) {
      // 左移按钮 - 长按效果
      let leftInterval = null;

      // 按下开始
      this.touchLeft.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.movePiece(-1, 0); // 立即移动一次

        // 设置长按间隔，每150毫秒左移一格
        leftInterval = setInterval(() => {
          if (this.gameState === "playing") {
            this.movePiece(-1, 0);
          }
        }, 150);

        // 添加按下状态样式
        this.touchLeft.classList.add("active");
      });

      // 触摸结束或离开时清除间隔
      const clearLeftInterval = () => {
        if (leftInterval) {
          clearInterval(leftInterval);
          leftInterval = null;
          this.touchLeft.classList.remove("active");
        }
      };

      this.touchLeft.addEventListener("touchend", clearLeftInterval);
      this.touchLeft.addEventListener("touchcancel", clearLeftInterval);

      // 右移按钮 - 长按效果
      let rightInterval = null;

      // 按下开始
      this.touchRight.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.movePiece(1, 0); // 立即移动一次

        // 设置长按间隔，每150毫秒右移一格
        rightInterval = setInterval(() => {
          if (this.gameState === "playing") {
            this.movePiece(1, 0);
          }
        }, 150);

        // 添加按下状态样式
        this.touchRight.classList.add("active");
      });

      // 触摸结束或离开时清除间隔
      const clearRightInterval = () => {
        if (rightInterval) {
          clearInterval(rightInterval);
          rightInterval = null;
          this.touchRight.classList.remove("active");
        }
      };

      this.touchRight.addEventListener("touchend", clearRightInterval);
      this.touchRight.addEventListener("touchcancel", clearRightInterval);

      // 向下按钮 - 长按效果
      let downInterval = null;

      // 按下开始
      this.touchDown.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.movePiece(0, 1); // 立即移动一次

        // 设置长按间隔，每100毫秒下降一格
        downInterval = setInterval(() => {
          if (this.gameState === "playing") {
            this.movePiece(0, 1);
          }
        }, 100);

        // 添加按下状态样式
        this.touchDown.classList.add("active");
      });

      // 触摸结束或离开时清除间隔
      const clearDownInterval = () => {
        if (downInterval) {
          clearInterval(downInterval);
          downInterval = null;
          this.touchDown.classList.remove("active");
        }
      };

      this.touchDown.addEventListener("touchend", clearDownInterval);
      this.touchDown.addEventListener("touchcancel", clearDownInterval);

      // 旋转按钮 - 单击事件
      this.touchRotate.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.rotatePiece();
      });
    }

    // 移动端控制拖拽功能
    this.initializeDragControls();

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
    // 检测移动设备 - 使用更全面的检测方法
    this.isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      ) ||
      window.innerWidth <= 768 ||
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    // 检测设备方向
    this.isLandscape = window.innerWidth > window.innerHeight;

    // 根据设备类型和方向优化游戏体验
    if (this.isMobile && this.mobileControls) {
      this.mobileControls.style.display = "block";

      // 在移动设备上调整游戏速度和响应性
      this.BASE_FALL_TIME = 800; // 稍微加快初始下落速度

      // 添加窗口大小变化监听器，以便在旋转设备时调整布局
      window.addEventListener("resize", () => {
        this.isLandscape = window.innerWidth > window.innerHeight;
        // 可以在这里添加特定于方向的调整
      });
    }
  }

  /**
   * 初始化移动端控制拖拽功能
   * 优化版本：解决拖动不流畅和落点变化问题
   */
  initializeDragControls() {
    if (!this.mobileControls) return;

    let isDragging = false;
    let startX, startY;
    let offsetX, offsetY; // 改为使用偏移量而不是初始位置
    let animationId = null;
    let controlWidth, controlHeight; // 缓存控制面板尺寸

    // 获取并缓存控制面板尺寸
    const updateControlDimensions = () => {
      const rect = this.mobileControls.getBoundingClientRect();
      controlWidth = rect.width;
      controlHeight = rect.height;
    };

    // 优化的位置设置函数，使用requestAnimationFrame
    const setControlPosition = (x, y) => {
      // 边界检查
      const maxX = window.innerWidth - controlWidth;
      const maxY = window.innerHeight - controlHeight;

      x = Math.max(0, Math.min(x, maxX));
      y = Math.max(0, Math.min(y, maxY));

      // 使用transform代替left/top以获得更好的性能
      this.mobileControls.style.transform = `translate(${x}px, ${y}px)`;
      this.mobileControls.style.left = '0';
      this.mobileControls.style.top = '0';
      this.mobileControls.style.right = 'auto';
      this.mobileControls.style.bottom = 'auto';
    };

    // 平滑的拖拽更新函数
    const updateDragPosition = (clientX, clientY) => {
      if (!isDragging) return;

      if (animationId) {
        cancelAnimationFrame(animationId);
      }

      animationId = requestAnimationFrame(() => {
        const newX = clientX - offsetX;
        const newY = clientY - offsetY;
        setControlPosition(newX, newY);
      });
    };

    // 触摸开始事件处理
    const handleTouchStart = (e) => {
      // 检查是否点击在控制面板上
      if (!e.target.closest('.mobile-controls')) return;

      const touch = e.touches[0];
      const rect = this.mobileControls.getBoundingClientRect();

      // 检查是否点击在拖拽区域（控制面板顶部40px区域或空白区域）
      const relativeY = touch.clientY - rect.top;
      const isInDragArea = relativeY <= 40 || !e.target.closest('button');
      
      if (!isInDragArea) return;

      isDragging = true;
      
      // 更新控制面板尺寸缓存
      updateControlDimensions();
      
      // 计算触摸点相对于控制面板的偏移量
      offsetX = touch.clientX - rect.left;
      offsetY = touch.clientY - rect.top;

      this.mobileControls.classList.add('dragging');
      e.preventDefault();
      e.stopPropagation();
    };

    // 触摸移动事件处理
    const handleTouchMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();
      
      const touch = e.touches[0];
      updateDragPosition(touch.clientX, touch.clientY);
    };

    // 触摸结束事件处理
    const handleTouchEnd = (e) => {
      if (!isDragging) return;

      isDragging = false;
      this.mobileControls.classList.remove('dragging');

      // 取消任何待处理的动画
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      // 保存最终位置到本地存储
      const transform = this.mobileControls.style.transform;
      const matches = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      
      if (matches) {
        const x = parseFloat(matches[1]);
        const y = parseFloat(matches[2]);
        
        localStorage.setItem(
          'tetris-control-position',
          JSON.stringify({ x, y })
        );
      }
    };

    // 鼠标事件处理（用于桌面测试）
    const handleMouseDown = (e) => {
      if (!e.target.closest('.mobile-controls')) return;

      const rect = this.mobileControls.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const isInDragArea = relativeY <= 40 || !e.target.closest('button');
      
      if (!isInDragArea) return;

      isDragging = true;
      updateControlDimensions();
      
      offsetX = e.clientX - rect.left;
      offsetY = e.clientY - rect.top;

      this.mobileControls.classList.add('dragging');
      e.preventDefault();
      e.stopPropagation();
    };

    const handleMouseMove = (e) => {
      if (!isDragging) return;

      e.preventDefault();
      e.stopPropagation();
      updateDragPosition(e.clientX, e.clientY);
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;

      isDragging = false;
      this.mobileControls.classList.remove('dragging');

      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }

      // 保存位置
      const transform = this.mobileControls.style.transform;
      const matches = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      
      if (matches) {
        const x = parseFloat(matches[1]);
        const y = parseFloat(matches[2]);
        
        localStorage.setItem(
          'tetris-control-position',
          JSON.stringify({ x, y })
        );
      }
    };

    // 窗口大小变化时重新计算边界
    const handleResize = () => {
      if (isDragging) return; // 拖拽时不调整
      
      updateControlDimensions();
      
      // 确保控制面板仍在可见区域内
      const transform = this.mobileControls.style.transform;
      const matches = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
      
      if (matches) {
        const currentX = parseFloat(matches[1]);
        const currentY = parseFloat(matches[2]);
        
        const maxX = window.innerWidth - controlWidth;
        const maxY = window.innerHeight - controlHeight;
        
        const newX = Math.max(0, Math.min(currentX, maxX));
        const newY = Math.max(0, Math.min(currentY, maxY));
        
        if (newX !== currentX || newY !== currentY) {
          setControlPosition(newX, newY);
        }
      }
    };

    // 绑定事件监听器
    this.mobileControls.addEventListener('touchstart', handleTouchStart, {
      passive: false,
    });
    document.addEventListener('touchmove', handleTouchMove, { 
      passive: false 
    });
    document.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('touchcancel', handleTouchEnd); // 处理触摸取消

    // 桌面鼠标事件
    this.mobileControls.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    // 窗口大小变化事件
    window.addEventListener('resize', handleResize);

    // 初始化控制面板尺寸
    updateControlDimensions();
    
    // 恢复保存的位置
    this.restoreControlPosition();
  }

  /**
   * 恢复保存的控制面板位置
   * 更新为配合transform定位方式
   */
  restoreControlPosition() {
    const savedPosition = localStorage.getItem('tetris-control-position');
    if (savedPosition) {
      try {
        const position = JSON.parse(savedPosition);
        const x = position.x || 0;
        const y = position.y || 0;
        
        // 确保位置在有效范围内
        const rect = this.mobileControls.getBoundingClientRect();
        const maxX = window.innerWidth - rect.width;
        const maxY = window.innerHeight - rect.height;
        
        const validX = Math.max(0, Math.min(x, maxX));
        const validY = Math.max(0, Math.min(y, maxY));
        
        // 使用transform设置位置
        this.mobileControls.style.transform = `translate(${validX}px, ${validY}px)`;
        this.mobileControls.style.left = '0';
        this.mobileControls.style.top = '0';
        this.mobileControls.style.right = 'auto';
        this.mobileControls.style.bottom = 'auto';
        
        // 如果位置被调整了，更新存储的值
        if (validX !== x || validY !== y) {
          localStorage.setItem(
            'tetris-control-position',
            JSON.stringify({ x: validX, y: validY })
          );
        }
      } catch (e) {
        console.warn('无法恢复控制位置:', e);
        // 设置默认位置
        this.mobileControls.style.transform = 'translate(20px, 20px)';
        this.mobileControls.style.left = '0';
        this.mobileControls.style.top = '0';
        this.mobileControls.style.right = 'auto';
        this.mobileControls.style.bottom = 'auto';
      }
    } else {
      // 首次使用，设置默认位置
      this.mobileControls.style.transform = 'translate(20px, 20px)';
      this.mobileControls.style.left = '0';
      this.mobileControls.style.top = '0';
      this.mobileControls.style.right = 'auto';
      this.mobileControls.style.bottom = 'auto';
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

          // 检查左右边界
          if (newX < 0 || newX >= this.BOARD_WIDTH) {
            return true;
          }

          // 检查底部边界
          if (newY >= this.BOARD_HEIGHT) {
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
      // 先播放消行动画，动画完成后再执行实际删除
      this.animateLineClears(completedLines, () => {
        // 移除完整行 - 从高索引到低索引删除，避免索引偏移
        // 由于completedLines是从下往上扫描得到的，已经是降序排列
        // 但为了确保安全，我们显式排序
        completedLines.sort((a, b) => b - a); // 降序排列

        // 先批量删除所有完整行，避免在同一循环中插入导致索引再次变化
        completedLines.forEach((lineY) => {
          this.board.splice(lineY, 1);
        });

        // 统一在顶部补充相同数量的空行
        for (let i = 0; i < completedLines.length; i++) {
          this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
        }

        // 更新UI
        this.updateBoardDisplay();

        // 更新得分和等级
        this.updateScore(completedLines.length);
        this.updateLevel();
      });
    }
  }

  animateLineClears(lines, callback) {
    // 为要消除的行添加动画效果
    lines.forEach((lineY) => {
      for (let x = 0; x < this.BOARD_WIDTH; x++) {
        const index = lineY * this.BOARD_WIDTH + x;
        this.squares[index].classList.add("line-complete");
      }
    });

    // 动画持续时间后执行回调
    setTimeout(() => {
      // 先移除动画类
      lines.forEach((lineY) => {
        for (let x = 0; x < this.BOARD_WIDTH; x++) {
          const index = lineY * this.BOARD_WIDTH + x;
          this.squares[index].classList.remove("line-complete");
        }
      });

      // 执行回调函数（实际删除行和更新显示）
      if (callback && typeof callback === "function") {
        callback();
      }
    }, 300); // 减少动画时间，提升游戏体验
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

    // 添加视觉效果，使方块更容易区分
    this.squares.forEach((square, index) => {
      if (square.classList.contains("taken")) {
        // 为固定方块添加边框效果
        square.classList.add("locked");
      }
    });
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

  // 键盘长按状态跟踪
  initializeKeyboardControls() {
    this.keyState = {
      ArrowDown: false,
      interval: null,
    };

    // 键盘按下事件
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    // 键盘释放事件
    document.addEventListener("keyup", (event) => {
      if (event.code === "ArrowDown") {
        // 清除向下键的长按间隔
        if (this.keyState.interval) {
          clearInterval(this.keyState.interval);
          this.keyState.interval = null;
        }
        this.keyState.ArrowDown = false;
      }
    });
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
        // 避免重复触发
        if (!this.keyState.ArrowDown) {
          this.keyState.ArrowDown = true;
          this.movePiece(0, 1); // 立即移动一次

          // 设置长按间隔，每100毫秒下降一格
          this.keyState.interval = setInterval(() => {
            if (this.gameState === "playing") {
              this.movePiece(0, 1);
            } else {
              // 如果游戏状态改变，清除间隔
              clearInterval(this.keyState.interval);
              this.keyState.interval = null;
              this.keyState.ArrowDown = false;
            }
          }, 100);
        }
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
