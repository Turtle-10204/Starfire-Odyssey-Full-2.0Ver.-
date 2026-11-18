// =====================================================================
// World 2 沙漠大關卡地圖資料庫（4分鐘長關卡架構 + 2分鐘中繼存檔旗 + 雙終點）
// 地圖代號說明（完全相容原本 sketch.js 並擴充沙漠專屬機關）：
//   'G' = 沙漠砂岩地面    'B' = 砂岩磚塊      '?' = 金幣問號磚
//   'M' = 強化道具磚      '*' = 無敵星磚      'O' = 空中金幣
//   'S' = 遺跡石階梯      'P' = 沙漠綠洲水管  'Q' = 流沙坑（踩入會下沉）
//   'K' = 仙人掌刺柱（碰傷，可用刺甲菇蹲下反彈或飛針擊碎）
//   'W' = 隱藏雲端跳台（通往 2-1 隱藏高空終點）
//   'R' = 中繼存檔旗（約2分鐘處，首次觸碰變紅蘑菇大隻，死亡從此重生）
//   'F'/'|' = 正常終點旗杆（2-1 正常通關開啟 2-2）
//   'H' = 隱藏秘密終點旗杆（2-1 高空秘密通關開啟 2-4）
//   'A' = 2-5 魔王神殿機關斧頭   'L' = 沙漠熔岩/流沙深淵
// =====================================================================

const WORLD2_LEVEL_CONFIGS = {
  1: {
    id: "2-1",
    name: "流沙遺跡（雙終點分支）",
    totalCols: 640,        // 不含加速菇約 4 分鐘長度
    checkpointCol: 320,    // 約 2 分鐘處設置中繼存檔旗
    hasSecretGoal: true,   // 具備隱藏高空終點（開啟 2-4）
    theme: "desert_ruins",
    timeLimit: 500
  },
  2: {
    id: "2-2",
    name: "仙人掌峽谷",
    totalCols: 650,
    checkpointCol: 325,
    hasSecretGoal: false,
    theme: "cactus_canyon",
    timeLimit: 500
  },
  3: {
    id: "2-3",
    name: "熱浪金字塔",
    totalCols: 660,
    checkpointCol: 330,
    hasSecretGoal: false,
    theme: "pyramid_interior",
    timeLimit: 520
  },
  4: {
    id: "2-4",
    name: "時光秘道",
    totalCols: 620,
    checkpointCol: 310,
    hasSecretGoal: false,
    theme: "chrono_temple",
    timeLimit: 500
  },
  5: {
    id: "2-5",
    name: "沙暴巨獸神殿",
    totalCols: 640,
    checkpointCol: 320,
    hasSecretGoal: false,
    isBossStage: true,
    theme: "sandstorm_boss",
    timeLimit: 550
  }
};

// 動態建構 15 列高、620~660 格寬的完整沙漠關卡地圖與怪物配置
function buildWorld2Level(lvlNum) {
  let cfg = WORLD2_LEVEL_CONFIGS[lvlNum] || WORLD2_LEVEL_CONFIGS[1];
  let cols = cfg.totalCols;
  let rows = 15;
  let grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  let enemySpawns = [];
  let platformSpawns = [];

  // 1. 鋪設基礎沙漠地面（第 13、14 列）
  for (let c = 0; c < cols; c++) {
    grid[13][c] = 'G';
    grid[14][c] = 'G';
  }

  // 金字塔室內（2-3）與神殿（2-5）加上天花板
  if (lvlNum === 3 || lvlNum === 5) {
    for (let c = 0; c < cols - 25; c++) {
      grid[0][c] = 'G';
    }
  }

  // 2. 依照關卡主題，每隔 28 格配置一組特色地形與怪物（從第 18 格鋪到倒數 35 格）
  let endBuildCol = cols - 38;
  for (let c = 18; c < endBuildCol; c += 28) {
    // 避開中繼存檔旗前後安全區（checkpointCol ± 10 格）
    if (abs(c - cfg.checkpointCol) < 12) continue;

    let pattern = (c / 28) % 5;

    if (lvlNum === 1) {
      // === 2-1 流沙遺跡：流沙坑 + 遺跡石階 + 隱藏高空路徑入口 ===
      if (pattern === 0) {
        // 4格寬流沙坑（有沙漏菇可如履平地，否則需連跳通過）
        for (let q = 0; q < 4; q++) { grid[13][c + q] = 'Q'; grid[14][c + q] = 'Q'; }
        grid[9][c + 1] = '?'; grid[9][c + 2] = 'M';
        enemySpawns.push({ type: "goomba", col: c + 7, row: 13 });
      } else if (pattern === 1) {
        // 雙層磚塊＋金幣弧線
        grid[9][c] = 'B'; grid[9][c + 1] = '?'; grid[9][c + 2] = 'B'; grid[9][c + 3] = '?'; grid[9][c + 4] = 'B';
        grid[5][c + 2] = 'M';
        grid[7][c + 1] = 'O'; grid[7][c + 2] = 'O'; grid[7][c + 3] = 'O';
        enemySpawns.push({ type: "koopa", col: c + 3, row: 13 });
      } else if (pattern === 2) {
        // 深淵跳台 + 綠洲水管
        grid[13][c + 2] = ' '; grid[14][c + 2] = ' ';
        grid[13][c + 3] = ' '; grid[14][c + 3] = ' ';
        grid[11][c + 7] = 'P'; grid[12][c + 7] = 'P';
        enemySpawns.push({ type: "goomba", col: c + 10, row: 13 });
        enemySpawns.push({ type: "goomba", col: c + 12, row: 13 });
      } else if (pattern === 3) {
        // 寬流沙地帶 + 上方木板橋
        for (let q = 0; q < 6; q++) { grid[13][c + q] = 'Q'; grid[14][c + q] = 'Q'; }
        for (let t = 0; t < 4; t++) grid[9][c + 1 + t] = 'T';
        grid[6][c + 2] = '*';
      } else {
        // 階梯跳台
        grid[12][c] = 'S';
        grid[11][c + 1] = 'S'; grid[12][c + 1] = 'S';
        grid[10][c + 2] = 'S'; grid[11][c + 2] = 'S'; grid[12][c + 2] = 'S';
        enemySpawns.push({ type: "parakoopa", col: c + 6, row: 8 });
      }

    } else if (lvlNum === 2) {
      // === 2-2 仙人掌峽谷：大量仙人掌刺柱(K) + 峽谷高台 ===
      if (pattern === 0 || pattern === 3) {
        grid[12][c + 2] = 'K'; grid[11][c + 2] = 'K';
        grid[12][c + 8] = 'K'; grid[11][c + 8] = 'K'; grid[10][c + 8] = 'K';
        grid[8][c + 5] = 'M';
        enemySpawns.push({ type: "koopa", col: c + 5, row: 13 });
      } else if (pattern === 1) {
        for (let b = 0; b < 6; b++) grid[9][c + b] = (b === 2 ? 'M' : 'B');
        grid[12][c + 3] = 'K';
        enemySpawns.push({ type: "goomba", col: c + 2, row: 9 });
        enemySpawns.push({ type: "goomba", col: c + 4, row: 9 });
      } else if (pattern === 2) {
        for (let g = 0; g < 4; g++) { grid[13][c + g] = ' '; grid[14][c + g] = ' '; }
        platformSpawns.push({ x: (c - 1) * 40, y: 10 * 40, w: 120, h: 16, minX: (c - 1) * 40, maxX: (c + 5) * 40, speed: 2.2, dx: 0 });
      } else {
        grid[11][c] = 'P'; grid[12][c] = 'P';
        grid[12][c + 4] = 'K'; grid[12][c + 5] = 'K';
        grid[9][c + 4] = '?'; grid[9][c + 5] = '?';
        enemySpawns.push({ type: "parakoopa", col: c + 9, row: 7 });
      }

    } else if (lvlNum === 3) {
      // === 2-3 熱浪金字塔：石階迷宮 + 流沙陷阱 + 岩漿池 ===
      if (pattern === 0) {
        for (let q = 0; q < 5; q++) { grid[13][c + q] = 'Q'; grid[14][c + q] = 'Q'; }
        grid[9][c + 2] = 'M';
        enemySpawns.push({ type: "goomba", col: c + 8, row: 13 });
      } else if (pattern === 1) {
        // 金字塔雙層石橋
        for (let s = 0; s < 8; s++) grid[8][c + s] = 'S';
        grid[5][c + 3] = '?'; grid[5][c + 4] = 'M';
        enemySpawns.push({ type: "koopa", col: c + 4, row: 8 });
        enemySpawns.push({ type: "goomba", col: c + 3, row: 13 });
      } else if (pattern === 2) {
        for (let l = 0; l < 4; l++) { grid[13][c + l] = 'L'; grid[14][c + l] = 'L'; }
        grid[10][c + 1] = 'T'; grid[10][c + 2] = 'T';
      } else {
        grid[12][c] = 'S'; grid[11][c + 1] = 'S'; grid[12][c + 1] = 'S';
        grid[12][c + 6] = 'K';
        enemySpawns.push({ type: "parakoopa", col: c + 4, row: 7 });
      }

    } else if (lvlNum === 4) {
      // === 2-4 時光秘道（隱藏捷徑關）：大面積流沙＋空中浮島挑戰 ===
      if (pattern % 2 === 0) {
        for (let q = 0; q < 8; q++) { grid[13][c + q] = 'Q'; grid[14][c + q] = 'Q'; }
        grid[9][c + 2] = 'T'; grid[9][c + 3] = 'M'; grid[9][c + 4] = 'T';
        enemySpawns.push({ type: "parakoopa", col: c + 4, row: 6 });
      } else {
        for (let g = 0; g < 5; g++) { grid[13][c + g] = ' '; grid[14][c + g] = ' '; }
        platformSpawns.push({ x: c * 40, y: 9 * 40, w: 120, h: 16, minX: (c - 1) * 40, maxX: (c + 6) * 40, speed: 2.6, dx: 0 });
        grid[6][c + 2] = 'O'; grid[6][c + 3] = 'O';
        enemySpawns.push({ type: "koopa", col: c + 8, row: 13 });
      }

    } else if (lvlNum === 5) {
      // === 2-5 沙暴巨獸神殿：流沙走廊 + 岩漿吊橋 + 最終 BOSS ===
      if (pattern === 0 || pattern === 3) {
        for (let q = 0; q < 5; q++) { grid[13][c + q] = 'Q'; grid[14][c + q] = 'Q'; }
        grid[9][c + 2] = 'M';
        enemySpawns.push({ type: "koopa", col: c + 7, row: 13 });
      } else if (pattern === 1) {
        for (let l = 0; l < 5; l++) { grid[13][c + l] = 'L'; grid[14][c + l] = 'L'; }
        platformSpawns.push({ x: c * 40, y: 10 * 40, w: 120, h: 16, minX: (c - 1) * 40, maxX: (c + 6) * 40, speed: 2.5, dx: 0 });
      } else {
        grid[12][c + 2] = 'K'; grid[11][c + 2] = 'K';
        grid[8][c + 2] = '?'; grid[8][c + 3] = 'M';
        enemySpawns.push({ type: "parakoopa", col: c + 6, row: 7 });
      }
    }
  }

  // 3. 約 2 分鐘處設置「中繼存檔點旗子 ('R')」與補給磚
  let cp = cfg.checkpointCol;
  for (let clearC = cp - 4; clearC <= cp + 4; clearC++) {
    grid[13][clearC] = 'G';
    grid[14][clearC] = 'G';
  }
  grid[12][cp] = 'R'; // 中繼存檔旗底座
  grid[11][cp] = 'R'; // 中繼存檔旗桿身
  grid[9][cp - 2] = 'M'; // 存檔點旁貼心放一顆強化磚

  // 4. 關卡終點區域設計
  if (cfg.isBossStage) {
    // === 2-5 沙暴巨獸神殿 BOSS 競技場 ===
    let arenaStart = cols - 34;
    for (let c = arenaStart; c < cols; c++) {
      grid[13][c] = 'L';
      grid[14][c] = 'L';
    }
    // 橋梁左側安全平台
    for (let c = arenaStart - 4; c < arenaStart; c++) {
      grid[13][c] = 'G'; grid[14][c] = 'G';
    }
    // 可坍塌神殿石橋（'D'）
    for (let c = arenaStart; c <= cols - 12; c++) {
      grid[11][c] = 'D';
    }
    // 機關斧頭（'A'）與神殿出口
    grid[9][cols - 10] = 'A';
    grid[10][cols - 10] = 'S';
    for (let c = cols - 9; c < cols; c++) {
      grid[11][c] = 'G'; grid[12][c] = 'G'; grid[13][c] = 'G'; grid[14][c] = 'G';
    }
  } else {
    // === 2-1 ~ 2-4 正常終點旗杆 ('|' / 'F') 與砂岩神殿城堡 ('C') ===
    let goalCol = cols - 16;
    for (let c = goalCol - 10; c < cols; c++) {
      grid[13][c] = 'G';
      grid[14][c] = 'G';
    }
    // 終點前經典助跑石階
    for (let step = 0; step < 5; step++) {
      for (let h = 0; h <= step; h++) {
        grid[12 - h][goalCol - 9 + step] = 'S';
      }
    }
    // 正常終點旗杆
    grid[3][goalCol] = '|';
    for (let r = 4; r <= 11; r++) grid[r][goalCol] = 'F';
    grid[12][goalCol] = 'S';

    // 終點城堡
    for (let r = 8; r <= 12; r++) {
      for (let cc = goalCol + 5; cc <= goalCol + 9; cc++) {
        grid[r][cc] = 'C';
      }
    }

    // === 2-1 專屬：隱藏高空終點（開啟 2-4 時光秘道！） ===
    if (cfg.hasSecretGoal) {
      // 在終點前 35 格處設置通往高空雲端的彈簧/階梯跳台
      let secretStart = goalCol - 36;
      grid[9][secretStart] = 'T'; grid[9][secretStart + 1] = 'T';
      grid[6][secretStart + 4] = 'T'; grid[6][secretStart + 5] = 'T';
      // 高空雲端秘道平台（第 4 列）
      for (let sc = secretStart + 8; sc <= goalCol - 4; sc++) {
        grid[4][sc] = 'W';
        if (sc % 3 === 0) grid[3][sc] = 'O'; // 引導玩家的金幣線
      }
      // 隱藏紅色秘密旗杆 ('H')！摸到即觸發秘密通關（開啟 2-4）
      let secretFlagCol = goalCol - 5;
      grid[1][secretFlagCol] = 'H';
      grid[2][secretFlagCol] = 'H';
      grid[3][secretFlagCol] = 'H';
    }
  }

  return {
    config: cfg,
    mapStrings: grid.map(row => row.join('')),
    enemySpawns: enemySpawns,
    platformSpawns: platformSpawns
  };
}