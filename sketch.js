let capture;

function setup() {
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏 p5.js 預設產生在畫布外的 HTML 影片元素
  capture.hide();
  
  // 將影像的繪製模式設定為中心點 (CENTER)，這樣定位時會以影像中心為基準
  imageMode(CENTER);
}

function draw() {
  // 設定畫布背景顏色為 #e7c6ff
  background('#e7c6ff');
  
  // 在影像上方的背景區域繪製文字
  fill(0); // 設定文字顏色為黑色
  textSize(32); // 設定文字大小
  textAlign(CENTER, CENTER); // 設定文字對齊方式為左右與上下置中
  text('教科123456789', width / 2, height * 0.125); // 放置在畫布上方 1/8 處（確保不與影像重疊）

  // 計算顯示影像的寬度與高度 (整個畫布寬高的 50%)
  let imgW = width * 0.5;
  let imgH = height * 0.5;
  
  // 儲存目前的座標與繪圖設定
  push();
  // 將座標原點平移至畫布中心
  translate(width / 2, height / 2);
  // 進行左右水平翻轉
  scale(-1, 1);
  // 由於原點已移至中心，且使用 imageMode(CENTER)，因此將影像繪製於 (0, 0)
  image(capture, 0, 0, imgW, imgH);
  // 恢復先前的座標與繪圖設定
  pop();
}

// 當瀏覽器視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
