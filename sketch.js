let capture;
let faceMesh;
let predictions = [];

function preload() {
  // 使用 ml5.js v1 寫法載入 FaceMesh 模型
  faceMesh = ml5.faceMesh();
}

function setup() {
  // 產生一個全螢幕的畫布
  createCanvas(windowWidth, windowHeight);
  
  // 擷取攝影機影像
  capture = createCapture(VIDEO);
  
  // 隱藏 p5.js 預設產生在畫布外的 HTML 影片元素
  capture.hide();
  
  // 啟動 FaceMesh 的即時辨識
  faceMesh.detectStart(capture, gotFaces);

  // 將影像的繪製模式設定為中心點 (CENTER)，這樣定位時會以影像中心為基準
  imageMode(CENTER);
}

function gotFaces(results) {
  predictions = results;
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

  // 如果 Facemesh 有辨識到臉部，則開始繪製特定點位連線
  if (predictions.length > 0) {
    let keypoints = predictions[0].keypoints;
    // 你所指定的編號，這剛好是嘴唇外圍的輪廓特徵點
    let indices = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    
    stroke(255, 0, 0); // 設定線條為紅色
    strokeWeight(15);  // 設定線條粗細為 15
    
    // 依序串聯各個點
    for (let i = 0; i < indices.length - 1; i++) {
      let p1 = keypoints[indices[i]];
      let p2 = keypoints[indices[i + 1]];
      
      // 將模型的原始影片座標，等比映射到我們畫布顯示的縮放影像範圍內
      let x1 = map(p1.x, 0, capture.width, -imgW / 2, imgW / 2);
      let y1 = map(p1.y, 0, capture.height, -imgH / 2, imgH / 2);
      let x2 = map(p2.x, 0, capture.width, -imgW / 2, imgW / 2);
      let y2 = map(p2.y, 0, capture.height, -imgH / 2, imgH / 2);
      
      line(x1, y1, x2, y2);
    }
    
    // 將最後一個點連回第一個點，讓嘴唇輪廓完美閉合
    let pLast = keypoints[indices[indices.length - 1]];
    let pFirst = keypoints[indices[0]];
    let xLast = map(pLast.x, 0, capture.width, -imgW / 2, imgW / 2);
    let yLast = map(pLast.y, 0, capture.height, -imgH / 2, imgH / 2);
    let xFirst = map(pFirst.x, 0, capture.width, -imgW / 2, imgW / 2);
    let yFirst = map(pFirst.y, 0, capture.height, -imgH / 2, imgH / 2);
    line(xLast, yLast, xFirst, yFirst);
  }

  // 恢復先前的座標與繪圖設定
  pop();
}

// 當瀏覽器視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
