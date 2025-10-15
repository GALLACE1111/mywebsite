// 原有的功能
function sayHello() {
  alert("恭喜獲得一顆愛心！");
}

// 點擊小遊戲功能
let score = 0;

// 切換遊戲視窗
function toggleGame() {
  const game = document.querySelector('.click-game');
  game.classList.toggle('active');
}

// 增加分數
function incrementScore() {
  score++;
  document.getElementById('score').textContent = score;

  // 添加點擊動畫效果
  const scoreElement = document.getElementById('score');
  scoreElement.style.transform = 'scale(1.3)';
  setTimeout(() => {
    scoreElement.style.transform = 'scale(1)';
  }, 200);

  // 每10分顯示一次祝賀訊息
  if (score % 10 === 0) {
    alert(`太棒了！你已經獲得 ${score} 分！繼續加油！ 🎉`);
  }
}
