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
    // 右眼外圍輪廓特徵點 (包含 247)
    let rightEyeOuter = [130, 25, 110, 24, 23, 22, 26, 112, 243, 190, 56, 28, 27, 29, 30, 247];
    // 右眼內圍輪廓特徵點 (包含 246)
    let rightEyeInner = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    // 左眼外圍輪廓特徵點
    let leftEyeOuter = [359, 255, 339, 254, 253, 252, 256, 341, 463, 414, 286, 258, 257, 259, 260, 467];
    // 左眼內圍輪廓特徵點
    let leftEyeInner = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];
    // 嘴唇外圍輪廓特徵點
    let lipsOuter = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
    // 嘴唇內圍輪廓特徵點
    let lipsInner = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
    // 臉部輪廓特徵點
    let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
    
    // 取得攝影機影像的實際解析度 (避免手機旋轉直向時 p5 預設長寬未更新的問題)
    let vw = capture.elt.videoWidth || capture.width;
    let vh = capture.elt.videoHeight || capture.height;

    // 繪製遮罩，將臉部輪廓以外的影像背景用 #fdf0d5 填滿
    fill('#fdf0d5');
    noStroke();
    beginShape();
    // 影像的外部邊界 (順時針方向)
    vertex(-imgW / 2, -imgH / 2);
    vertex(imgW / 2, -imgH / 2);
    vertex(imgW / 2, imgH / 2);
    vertex(-imgW / 2, imgH / 2);
    
    // 內部臉部輪廓挖空 (逆時針方向)
    beginContour();
    for (let i = faceOval.length - 1; i >= 0; i--) {
      let p = keypoints[faceOval[i]];
      let x = map(p.x, 0, vw, -imgW / 2, imgW / 2);
      let y = map(p.y, 0, vh, -imgH / 2, imgH / 2);
      vertex(x, y);
    }
    endContour();
    endShape(CLOSE);

    // 將不同部位的連線與樣式設定整理成群組
    let featureGroups = [
      {
        indicesList: [rightEyeInner, leftEyeInner, lipsOuter, lipsInner],
        col: [255, 0, 0], // 紅色
        weight: 1         // 粗細 1
      },
      {
        indicesList: [rightEyeOuter, leftEyeOuter],
        col: [60, 60, 60], // 灰色偏黑 (黑眼圈效果)
        weight: 15         // 粗細改為 15，讓黑眼圈效果更深更明顯
      },
      {
        indicesList: [faceOval],
        col: [0, 255, 255], // 螢光藍色
        weight: 2         // 粗細 2
      }
    ];

    // 依群組設定套用顏色與粗細，並畫出多組連線
    for (let g = 0; g < featureGroups.length; g++) {
      let grp = featureGroups[g];
      stroke(grp.col[0], grp.col[1], grp.col[2]);
      strokeWeight(grp.weight);
      
      let drawLines = grp.indicesList;
      for (let j = 0; j < drawLines.length; j++) {
        let indices = drawLines[j];
        
        // 依序串聯各個點
        for (let i = 0; i < indices.length - 1; i++) {
          let p1 = keypoints[indices[i]];
          let p2 = keypoints[indices[i + 1]];
          
          // 將模型的原始影片座標，等比映射到我們畫布顯示的縮放影像範圍內
          let x1 = map(p1.x, 0, vw, -imgW / 2, imgW / 2);
          let y1 = map(p1.y, 0, vh, -imgH / 2, imgH / 2);
          let x2 = map(p2.x, 0, vw, -imgW / 2, imgW / 2);
          let y2 = map(p2.y, 0, vh, -imgH / 2, imgH / 2);
          
          line(x1, y1, x2, y2);
        }
        
        // 將最後一個點連回第一個點，讓輪廓完美閉合
        let pLast = keypoints[indices[indices.length - 1]];
        let pFirst = keypoints[indices[0]];
        let xLast = map(pLast.x, 0, vw, -imgW / 2, imgW / 2);
        let yLast = map(pLast.y, 0, vh, -imgH / 2, imgH / 2);
        let xFirst = map(pFirst.x, 0, vw, -imgW / 2, imgW / 2);
        let yFirst = map(pFirst.y, 0, vh, -imgH / 2, imgH / 2);
        line(xLast, yLast, xFirst, yFirst);
      }
    }
  }

  // 恢復先前的座標與繪圖設定
  pop();
}

// 當瀏覽器視窗大小改變時，自動重新調整畫布大小以維持全螢幕
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
