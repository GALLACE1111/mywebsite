// 原有的功能
function sayHello() {
  alert("恭喜獲得一顆愛心！");
}

// 愛心接籃子遊戲
let score = 0;

// 切換遊戲視窗
function toggleGame() {
  const game = document.querySelector('.click-game');
  game.classList.toggle('active');
}

// 丟愛心功能
function throwHeart() {
  const heartsContainer = document.getElementById('heartsContainer');
  const heart = document.createElement('img');
  heart.src = 'images/heart.svg';
  heart.className = 'flying-heart';
  heart.alt = '愛心';

  heartsContainer.appendChild(heart);

  // 2秒後檢查是否接住
  setTimeout(() => {
    checkCatch(heart);
  }, 1900);
}

// 檢查是否接住愛心
function checkCatch(heart) {
  const basket = document.getElementById('basket');
  const heartRect = heart.getBoundingClientRect();
  const basketRect = basket.getBoundingClientRect();

  // 檢測碰撞
  const isCaught = !(
    heartRect.right < basketRect.left ||
    heartRect.left > basketRect.right ||
    heartRect.bottom < basketRect.top ||
    heartRect.top > basketRect.bottom
  );

  if (isCaught) {
    // 成功接住
    score++;
    document.getElementById('score').textContent = score;

    // 添加成功效果
    heart.classList.add('heart-caught');

    // 分數動畫
    const scoreElement = document.getElementById('score');
    scoreElement.style.transform = 'scale(1.3)';
    scoreElement.style.transition = 'transform 0.2s ease';
    setTimeout(() => {
      scoreElement.style.transform = 'scale(1)';
    }, 200);

    // 籃子跳動效果
    basket.style.transform = 'scale(1.2)';
    setTimeout(() => {
      basket.style.transform = 'scale(1)';
    }, 200);

    // 每5分顯示一次祝賀訊息
    if (score % 5 === 0) {
      setTimeout(() => {
        alert(`太棒了！你已經接住 ${score} 顆愛心！繼續加油！ 💕`);
      }, 300);
    }

    // 移除愛心
    setTimeout(() => {
      heart.remove();
    }, 500);
  } else {
    // 沒接住，直接移除
    setTimeout(() => {
      heart.remove();
    }, 100);
  }
}
