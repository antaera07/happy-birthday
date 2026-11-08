// =====================================================================
//  THE BIRTHDAY QUEST - main game script
//  World = a fixed 1672x941 "stage" scaled to fit any screen, so every
//  coordinate (paths, exits, collectibles) is identical on every device.
// =====================================================================

// ---------- Screens ----------
const startButton     = document.getElementById("start-button");
const welcomeScreen   = document.getElementById("welcome-screen");
const characterScreen = document.getElementById("character-screen");
const gameScreen      = document.getElementById("game-screen");
const continueButton  = document.getElementById("continue-button");

const stage        = document.getElementById("stage");
const forestBg     = document.getElementById("forest-bg");
const playerEl     = document.getElementById("player");
const guideEl      = document.getElementById("guide");
const playerSprite = document.getElementById("player-sprite");
const guideSprite  = document.getElementById("guide-sprite");
const ambientBox   = document.getElementById("ambient-dialogue");
const collectiblesLayer = document.getElementById("collectibles-container");
const exitsLayer   = document.getElementById("exits-container");
const worldEl      = document.getElementById("game-world");
const crystalGlow  = document.getElementById("crystal-glow");
const fadeOverlay  = document.getElementById("fade-overlay");
const flashEl      = document.getElementById("flash");
const surpriseScreen = document.getElementById("surprise-screen");
const countEl      = document.getElementById("collection-count");
const totalEl      = document.getElementById("collection-total");

// ---------- Settings ----------
const BOX = 40;                 // player / guide collision box (feet)
const PLAYER_SPEED = 230;       // stage px per second
const GUIDE_SPEED  = 250;
const FOLLOW_DIST  = 50;        // guide keeps this far from the player
const EXIT_RADIUS  = 48;
const PICKUP_RADIUS = 40;
const BASE_SPRITE_SCALE = 0.27;

const areaBackgrounds = {
    1: "forest-area1.png", 2: "forest-area2.png",
    3: "forest-area3.png", 4: "forest-area4.png"
};

// ---------- Sprites ----------
const P = n => `assets/characters/player_sprites/player4x4_${n}.png`;
const G = n => `assets/characters/guide_sprites/guide4x4_${n}.png`;

// [step frame A, step frame B] per direction (side frames face left/right as drawn)
const playerFrames = { right: ["01","06"], left: ["02","05"], up: ["03","07"], down: ["04","08"] };
const guideFrames  = { left: ["01","02"], right: ["01","02"], up: ["03","07"], down: ["04","08"] };

const spriteCache = {};
function preload(url) {
    if (!spriteCache[url]) { const i = new Image(); i.src = url; spriteCache[url] = i; }
    return spriteCache[url];
}
["01","02","03","04","05","06","07","08","15"].forEach(n => preload(P(n)));
["01","02","03","04","07","08"].forEach(n => preload(G(n)));

let spriteScale = BASE_SPRITE_SCALE;
function setSprite(imgEl, url, flip) {
    const img = preload(url);
    if (imgEl.dataset.url !== url) { imgEl.src = url; imgEl.dataset.url = url; }
    if (img.naturalWidth) {
        imgEl.style.width  = img.naturalWidth  * spriteScale + "px";
        imgEl.style.height = img.naturalHeight * spriteScale + "px";
    }
    imgEl.style.transform = flip ? "translateX(-50%) scaleX(-1)" : "translateX(-50%)";
}

Object.values(OBSTACLE_TYPES).forEach(t => preload(t.src));

// ---------- Fit the stage to the screen ----------
let stageScale = 1;
function fitStage() {
    const W = gameScreen.clientWidth  || window.innerWidth;
    const H = gameScreen.clientHeight || window.innerHeight;
    stageScale = Math.min(W / STAGE_W, H / STAGE_H);
    const offX = (W - STAGE_W * stageScale) / 2;
    const offY = (H - STAGE_H * stageScale) / 2;
    stage.style.transform = `translate(${offX}px, ${offY}px) scale(${stageScale})`;
    stage.style.setProperty("--inv", 1 / stageScale);
    // keep characters a readable size on small screens
    spriteScale = Math.min(0.5, Math.max(BASE_SPRITE_SCALE, 66 / (305 * stageScale)));
    ambientBox.style.setProperty("--bubble-bottom", Math.round(305 * spriteScale + 8) + "px");
    renderCharacters(performance.now());
}
window.addEventListener("resize", fitStage);

// ---------- Walkable path masks ----------
const walkMasks = {};
for (const area in WALK_MASK_DATA) {
    const bin = atob(WALK_MASK_DATA[area]);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    walkMasks[area] = bytes;
}

let currentArea = 1;

function isWalkableAt(x, y) {
    const ix = Math.floor(x / MASK_CELL), iy = Math.floor(y / MASK_CELL);
    if (ix < 0 || iy < 0 || ix >= MASK_W || iy >= MASK_H) return false;
    const bit = iy * MASK_W + ix;
    if (!((walkMasks[currentArea][bit >> 3] >> (7 - (bit & 7))) & 1)) return false;
    return !blockedByObstacle(x, y);
}

// Obstacles currently standing in this area (solved ones are removed)
let activeObstacles = [];
function blockedByObstacle(x, y) {
    for (const o of activeObstacles) {
        const dx = (x - o.x) / o.rx, dy = (y - o.y) / o.ry;
        if (dx * dx + dy * dy < 1) return true;
    }
    return false;
}
// A character stands on the path when the bottom of its box does
function canStand(x, y) {
    return isWalkableAt(x + 10, y + BOX) &&
           isWalkableAt(x + BOX / 2, y + BOX) &&
           isWalkableAt(x + BOX - 10, y + BOX);
}
// Nearest standable spot to (x, y)
function nearestStandable(x, y) {
    if (canStand(x, y)) return [x, y];
    for (let r = 8; r < 1200; r += 8) {
        for (let a = 0; a < 360; a += 15) {
            const nx = x + Math.cos(a * Math.PI / 180) * r;
            const ny = y + Math.sin(a * Math.PI / 180) * r;
            if (canStand(nx, ny)) return [nx, ny];
        }
    }
    return [x, y];
}

// ---------- Game state ----------
let playerX = 700, playerY = 480;
let guideX = 650,  guideY = 480;
let playerDir = "down", guideDir = "down";
let gameRunning = false;
let emoteUntil = 0;
let exitLock = null;           // feet point we just arrived at; ignore it until we step away
const collected = new Set();   // "area-index"
const solved = new Set();      // obstacle ids already cleared
const TOTAL_COLLECTIBLES = Object.values(AREAS).reduce((n, a) => n + a.collectibles.length, 0);
totalEl.textContent = TOTAL_COLLECTIBLES;

function place(el, x, y) {
    el.style.left = x + "px";
    el.style.top  = y + "px";
    el.style.zIndex = 100 + Math.floor(y + BOX);   // lower on screen = in front
}

function renderCharacters(now) {
    const step = Math.floor(now / 140) % 2;
    // player
    const emoting = now < emoteUntil;
    const pName = emoting ? "15" : playerFrames[playerDir][playerMoving ? step : 0];
    setSprite(playerSprite, P(pName), false);
    playerEl.classList.toggle("walking", playerMoving && !emoting);
    // guide
    setSprite(guideSprite, G(guideFrames[guideDir][guideMoving ? step : 0]), guideDir === "right");
    guideEl.classList.toggle("walking", guideMoving);
}

// ---------- Areas ----------
function buildArea(areaNumber) {
    forestBg.style.backgroundImage = `url("assets/backgrounds/${areaBackgrounds[areaNumber]}")`;

    exitsLayer.innerHTML = "";
    for (const to in AREAS[areaNumber].exits) {
        const [x, y] = AREAS[areaNumber].exits[to];
        const d = document.createElement("div");
        d.className = "exit-portal";
        d.style.left = x + "px";
        d.style.top  = y + "px";
        exitsLayer.appendChild(d);
    }

    buildObstacles(areaNumber);
    crystalGlow.style.display = areaNumber === 1 ? "block" : "none";   // the crystal lives in area 1

    collectiblesLayer.innerHTML = "";
    AREAS[areaNumber].collectibles.forEach(([x, y], i) => {
        if (collected.has(areaNumber + "-" + i)) return;
        const d = document.createElement("div");
        d.className = "collectible";
        d.id = `item-${areaNumber}-${i}`;
        d.style.left = x + "px";
        d.style.top  = y + "px";
        collectiblesLayer.appendChild(d);
    });
}

function buildObstacles(areaNumber) {
    worldEl.querySelectorAll(".obstacle").forEach(el => el.remove());
    activeObstacles = [];
    (OBSTACLES[areaNumber] || []).forEach(data => {
        if (solved.has(data.id)) return;
        const t = OBSTACLE_TYPES[data.type];
        const el = document.createElement("img");
        el.className = "obstacle";
        el.src = t.src;
        el.alt = "";
        el.style.width  = t.w + "px";
        el.style.height = t.h + "px";
        el.style.left = (data.x - t.w / 2) + "px";
        el.style.top  = (data.y + t.ry * 0.85 - t.h) + "px";
        el.style.zIndex = 100 + Math.floor(data.y + t.ry * 0.85);
        worldEl.appendChild(el);
        activeObstacles.push({ ...data, rx: t.rx, ry: t.ry, el, armed: true, hinted: false });
    });
}

function changeArea(areaNumber, fromArea, firstTime, quiet) {
    currentArea = areaNumber;
    buildArea(areaNumber);

    let fx, fy;   // feet point
    if (firstTime) { fx = 760; fy = 560; }
    else           { [fx, fy] = AREAS[areaNumber].exits[fromArea]; }

    [playerX, playerY] = nearestStandable(fx - BOX / 2, fy - BOX);
    exitLock = [playerX + BOX / 2, playerY + BOX];
    [guideX, guideY] = nearestStandable(playerX - 55, playerY + 10);
    place(playerEl, playerX, playerY);
    place(guideEl, guideX, guideY);
    guideEl.style.transition = "none";

    if (!firstTime && !quiet) setTimeout(() => say("exploration"), 900);
}

function checkExits() {
    const fx = playerX + BOX / 2, fy = playerY + BOX;
    if (exitLock) {
        if (Math.hypot(fx - exitLock[0], fy - exitLock[1]) < EXIT_RADIUS + 25) return;
        exitLock = null;
    }
    for (const to in AREAS[currentArea].exits) {
        const [ex, ey] = AREAS[currentArea].exits[to];
        if (Math.hypot(fx - ex, fy - ey) < EXIT_RADIUS) {
            changeArea(Number(to), currentArea, false);
            return;
        }
    }
}

// ---------- Collectibles ----------
function checkCollectibles() {
    const fx = playerX + BOX / 2, fy = playerY + BOX;
    AREAS[currentArea].collectibles.forEach(([x, y], i) => {
        const key = currentArea + "-" + i;
        if (collected.has(key) || memoryOpen) return;
        if (Math.hypot(fx - x, fy - y) < PICKUP_RADIUS) {
            collected.add(key);
            countEl.textContent = collected.size;
            const el = document.getElementById(`item-${key}`);
            let from = null;
            if (el) {
                const r = el.getBoundingClientRect();
                from = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
                el.classList.add("collected"); setTimeout(() => el.remove(), 450);
            }
            // the photo zooms in with its letter; the finale starts after the very last one
            openMemory(memoryFor(currentArea, i), from, () => {
                if (collected.size === TOTAL_COLLECTIBLES) startFinale();
            });
        }
    });
}

// ---------- Guide dialogue ----------
let ambientTimeout = null;
function showAmbientDialogue(message, duration = 4200) {
    if (typeof vnOpen !== "undefined" && vnOpen) return;      // the dialogue box has the floor
    clearTimeout(ambientTimeout);
    ambientBox.textContent = message;
    ambientBox.style.display = "block";
    guideEl.classList.add("speaking");
    ambientTimeout = setTimeout(() => { ambientBox.style.display = "none"; guideEl.classList.remove("speaking"); }, duration);
}
function say(category) {
    const lines = ambientDialogues[category];
    if (lines && lines.length) showAmbientDialogue(lines[Math.floor(Math.random() * lines.length)]);
}

// =====================================================================
//  MEMORY CARDS: the photo zooms out of the orb, a letter slides from behind
// =====================================================================
const mcEl = document.getElementById("memory-card"), mcStage = document.getElementById("mc-stage");
const mcPolaroid = document.getElementById("mc-polaroid"), mcPhoto = document.getElementById("mc-photo");
const mcImg = document.getElementById("mc-img"), mcFrame = document.getElementById("mc-frame");
const mcLetter = document.getElementById("mc-letter"), mcTitle = document.getElementById("mc-title");
const mcText = document.getElementById("mc-text"), mcCount = document.getElementById("mc-count");
const mcContinue = document.getElementById("mc-continue");
let memoryOpen = false, mcReadyAt = 0, mcDone = null;

// memory number for an orb: areas are numbered in order, six orbs each
function memoryFor(area, orbIndex) {
    let idx = 0;
    for (let a = 1; a < area; a++) idx += AREAS[a].collectibles.length;
    return MEMORIES[idx + orbIndex] || { photo: "", frame: 1, title: "A memory", note: "" };
}

function openMemory(mem, from, onClose) {
    memoryOpen = true; mcDone = onClose || null;
    for (const k in held) held[k] = false;
    ambientBox.style.display = "none";

    const fm = FRAME_META[(mem.frame || 1) - 1] || FRAME_META[0];
    mcFrame.src = `assets/frames/frame${String(mem.frame || 1).padStart(2, "0")}.png`;
    mcPolaroid.style.aspectRatio = fm.w + " / " + fm.h;
    Object.assign(mcPhoto.style, {
        left: (fm.cx / fm.w * 100) + "%", top: (fm.cy / fm.h * 100) + "%",
        width: (fm.pw / fm.w * 100) + "%", height: (fm.ph / fm.h * 100) + "%",
        transform: `translate(-50%, -50%) rotate(${fm.ang}deg)`
    });
    mcImg.style.display = ""; mcImg.onerror = () => { mcImg.style.display = "none"; };
    mcImg.src = mem.photo;
    mcTitle.textContent = mem.title || "";
    mcText.textContent = mem.note || "";
    mcText.scrollTop = 0;
    const n = collected.size;
    mcCount.textContent = `Memory ${n} of ${TOTAL_COLLECTIBLES}`;

    gameScreen.classList.add("mem-active");
    mcEl.classList.remove("closing"); mcEl.classList.add("open");
    mcContinue.classList.remove("show");
    mcReadyAt = performance.now() + 1500;
    setTimeout(() => mcContinue.classList.add("show"), 1500);

    // zoom out of the orb the photo was found at
    const r = mcStage.getBoundingClientRect(), pr = mcPolaroid.getBoundingClientRect();
    const dx = from ? from.x - (pr.left + pr.width / 2) : 0, dy = from ? from.y - (pr.top + pr.height / 2) : 40;
    mcPolaroid.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(0.06) rotate(-30deg)`, opacity: 0 },
        { transform: "translate(0,0) scale(1.06) rotate(-2deg)", opacity: 1, offset: 0.72 },
        { transform: "translate(0,0) scale(1) rotate(-4deg)", opacity: 1 }
    ], { duration: 780, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
    mcLetter.animate([
        { transform: "translateX(-38%) rotate(-1deg)", opacity: 0 },
        { transform: "translateX(0) rotate(2.5deg)", opacity: 1 }
    ], { duration: 760, delay: 640, easing: "cubic-bezier(.2,.8,.3,1)", fill: "backwards" });
}

function closeMemory() {
    if (!memoryOpen || performance.now() < mcReadyAt) return;
    mcEl.classList.add("closing");
    setTimeout(() => {
        mcEl.classList.remove("open", "closing");
        gameScreen.classList.remove("mem-active");
        memoryOpen = false;
        emoteUntil = performance.now() + 1100;
        const done = mcDone; mcDone = null; done && done();
    }, 280);
}
mcContinue.addEventListener("click", closeMemory);

// =====================================================================
//  VISUAL-NOVEL DIALOGUE: guide (left) and him (right) around a text box.
//  vnSay([{ who: "guide" | "player", mood: "...", text: "..." }, ...])
//  returns a promise that resolves when the last line is dismissed.
//  moods: joy, point, think, surprise, calm, wink, love, shy (see PORTRAITS below)
// =====================================================================
const vnEl = document.getElementById("vn"), vnTextEl = document.getElementById("vn-text");
const vnNameEl = document.getElementById("vn-name"), vnNextEl = document.getElementById("vn-next");
const vnPortraits = { guide: document.getElementById("vn-guide"), player: document.getElementById("vn-player") };
// Each mood picks one of the expression close-ups cut from your character sheets
const PORTRAITS = {
    guide:  { joy: "happy", point: "happy", think: "glasses", surprise: "oh", calm: "calm", wink: "laugh", love: "calm", shy: "laugh" },
    player: { joy: "wink",  point: "speak", think: "think",   surprise: "speak", calm: "calm", wink: "wink", love: "wink", shy: "look" }
};
const portraitSrc = (who, mood) =>
    `assets/characters/portraits/${who}_${PORTRAITS[who][mood] || PORTRAITS[who].calm}.png`;
["guide", "player"].forEach(w => Object.keys(PORTRAITS[w]).forEach(k => preload(portraitSrc(w, k))));

let vnOpen = false, vnQueue = [], vnResolve = null, vnTyping = false, vnTimer = null, vnLineText = "";

function vnSay(lines) {
    return new Promise(resolve => {
        vnQueue = lines.slice(); vnResolve = resolve; vnOpen = true;
        for (const k in held) held[k] = false;
        ambientBox.style.display = "none";
        if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
        vnEl.classList.add("open");
        gameScreen.classList.add("vn-active");
        vnShowLine();
    });
}

function vnShowLine() {
    const line = vnQueue.shift();
    const other = line.who === "guide" ? "player" : "guide";
    vnNameEl.textContent = SPEAKER_NAMES[line.who];
    vnPortraits[line.who].src = portraitSrc(line.who, line.mood);
    vnPortraits[other].src = portraitSrc(other, "calm");
    vnPortraits[line.who].classList.remove("dim");
    vnPortraits[other].classList.add("dim");
    vnPortraits[line.who].classList.remove("talking"); void vnPortraits[line.who].offsetWidth;
    vnPortraits[line.who].classList.add("talking");
    vnLineText = line.text; vnTextEl.textContent = ""; vnNextEl.classList.add("hide");
    vnTyping = true; let i = 0;
    clearInterval(vnTimer);
    vnTimer = setInterval(() => {
        vnTextEl.textContent = vnLineText.slice(0, ++i);
        if (i >= vnLineText.length) vnFinishTyping();
    }, 24);
}

function vnFinishTyping() {
    clearInterval(vnTimer); vnTyping = false;
    vnTextEl.textContent = vnLineText; vnNextEl.classList.remove("hide");
}

function vnAdvance() {
    if (!vnOpen) return;
    if (vnTyping) { vnFinishTyping(); return; }
    if (vnQueue.length) { vnShowLine(); return; }
    vnOpen = false; vnEl.classList.remove("open");
    gameScreen.classList.remove("vn-active");
    const done = vnResolve; vnResolve = null; done && done();
}
document.getElementById("vn-catch").addEventListener("click", vnAdvance);

// ---------- Obstacles: approach, question, dissolve ----------
const popupEl    = document.getElementById("memory-popup");
const questionEl = document.getElementById("memory-question");
const answerEl   = document.getElementById("memory-answer");
const feedbackEl = document.getElementById("memory-feedback");
const submitBtn  = document.getElementById("submit-memory-answer");
const closeBtn   = document.getElementById("close-memory-popup");
const hintBtn    = document.getElementById("hint-memory");
const TRIGGER = 40;                       // how close he must get to be asked
let popupOpen = false, currentObstacle = null, wrongTries = 0;

const approachLines = [
    "Hmm, something's blocking the way...",
    "That's not going to move by itself. Go on, try it!",
    "Uh oh. I think this one wants an answer."
];
const solvedLines = [
    "Knew you'd get that one. Path's clear!",
    "Show-off. Fine, go on through.",
    "And it's gone! Is there anything you can't remember?",
    "Look at you, remembering things. Keep going!"
];

function normalise(s) {
    return s.toLowerCase().normalize("NFKD")
        .replace(/[^\p{L}\p{N}\s]/gu, "").replace(/\s+/g, " ").trim();
}

function checkObstacles() {
    const fx = playerX + BOX / 2, fy = playerY + BOX;
    for (const o of activeObstacles) {
        const d = Math.hypot((fx - o.x) / (o.rx + TRIGGER), (fy - o.y) / (o.ry + TRIGGER));
        if (d < 1) {
            if (o.armed) { openQuestion(o); return; }
        } else if (d > 1.4) {
            o.armed = true;                          // walked away: ask again next time
        }
        // guide reacts when he gets close (a generic line - the real hint comes after wrong answers)
        const near = Math.hypot((fx - o.x) / (o.rx + 130), (fy - o.y) / (o.ry + 130));
        if (!o.hinted && near < 1) {
            o.hinted = true;
            if (obstacleIntroSeen) showAmbientDialogue(approachLines[Math.floor(Math.random() * approachLines.length)]);
        }
    }
}

let obstacleIntroSeen = false;
const obstacleIntro = [
    { who: "guide",  mood: "think", text: "Something's blocking the way..." },
    { who: "guide",  mood: "point", text: "I think it wants us to answer a question first. Think hard!" },
    { who: "player", mood: "calm",  text: "...Challenge accepted." }
];

function openQuestion(o) {
    popupOpen = true; currentObstacle = o; wrongTries = 0;
    for (const k in held) held[k] = false;
    questionEl.textContent = o.question;
    answerEl.value = ""; feedbackEl.textContent = "";
    hintBtn.style.display = "none";
    const show = () => { popupEl.style.display = "flex"; setTimeout(() => answerEl.focus(), 60); };
    if (!obstacleIntroSeen) { obstacleIntroSeen = true; vnSay(obstacleIntro).then(show); }
    else show();
}

function showHint() {
    if (!currentObstacle) return;
    answerEl.blur();
    vnSay([{ who: "guide", mood: "think", text: currentObstacle.hint }]).then(() => answerEl.focus());
}

function closeQuestion() {
    popupEl.style.display = "none";
    popupOpen = false;
    if (currentObstacle) currentObstacle.armed = false;
    currentObstacle = null;
    answerEl.blur();
}

function submitAnswer() {
    if (!currentObstacle) return;
    const guess = normalise(answerEl.value);
    if (!guess) return;
    if (currentObstacle.answers.some(a => normalise(a) === guess)) {
        feedbackEl.textContent = "✨ Correct!";
        const o = currentObstacle;
        setTimeout(() => { closeQuestion(); clearObstacle(o); }, 650);
        currentObstacle.armed = false;
        submitBtn.disabled = true;
        setTimeout(() => { submitBtn.disabled = false; }, 800);
    } else {
        wrongTries++;
        feedbackEl.textContent = wrongTries === 3 ? "Not quite... hold on, let me help."
                               : wrongTries > 3   ? "Still not it - tap the hint button!"
                               : "Not quite - try again!";
        if (wrongTries >= 3) hintBtn.style.display = "";
        if (wrongTries === 3) showHint();
        popupEl.classList.remove("shake"); void popupEl.offsetWidth; popupEl.classList.add("shake");
        answerEl.select();
    }
}

function clearObstacle(o, quiet) {
    solved.add(o.id);
    activeObstacles = activeObstacles.filter(x => x !== o);      // path opens at once
    o.el.classList.add("dissolve");
    const cx = o.x, cy = o.y - o.el.offsetHeight * 0.25;
    for (let i = 0; i < 10; i++) {                                // sparkle burst
        const s = document.createElement("span");
        s.className = "spark"; s.textContent = "✦";
        const ang = (i / 10) * Math.PI * 2, dist = 50 + Math.random() * 70;
        s.style.left = cx + "px"; s.style.top = cy + "px";
        s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
        s.style.setProperty("--dy", Math.sin(ang) * dist * 0.7 + "px");
        s.style.zIndex = 4000;
        worldEl.appendChild(s);
        setTimeout(() => s.remove(), 900);
    }
    setTimeout(() => o.el.remove(), 900);
    if (!quiet) {
        emoteUntil = performance.now() + 1300;
        showAmbientDialogue(solvedLines[Math.floor(Math.random() * solvedLines.length)]);
    }
}

submitBtn.addEventListener("click", submitAnswer);
closeBtn.addEventListener("click", closeQuestion);
hintBtn.addEventListener("click", showHint);

// ---------- Input ----------
const held = { up: false, down: false, left: false, right: false };
const keyMap = {
    ArrowUp: "up", w: "up", W: "up",
    ArrowDown: "down", s: "down", S: "down",
    ArrowLeft: "left", a: "left", A: "left",
    ArrowRight: "right", d: "right", D: "right"
};
document.addEventListener("keydown", e => {
    if (vnOpen) {
        if (["Enter", " ", "ArrowRight", "z", "Z"].includes(e.key)) { e.preventDefault(); vnAdvance(); }
        else e.preventDefault();
        return;
    }
    if (memoryOpen) {
        if (["Enter", " ", "Escape"].includes(e.key)) { e.preventDefault(); closeMemory(); }
        return;
    }
    if (popupOpen) {
        if (e.key === "Enter") { e.preventDefault(); submitAnswer(); }
        else if (e.key === "Escape") closeQuestion();
        return;                                   // let him type normally
    }
    if (keyMap[e.key] && gameRunning) { held[keyMap[e.key]] = true; e.preventDefault(); }
    if ((e.key === "m" || e.key === "M") && gameRunning) toggleMaskDebug();
});
document.addEventListener("keyup", e => { if (keyMap[e.key]) held[keyMap[e.key]] = false; });
window.addEventListener("blur", () => { for (const k in held) held[k] = false; });

// 8-way pad: diagonal buttons press two directions at once
function setupPad(id, dirs) {
    const btn = document.getElementById(id);
    const release = () => dirs.forEach(d => { held[d] = false; });
    btn.addEventListener("pointerdown", e => { e.preventDefault(); dirs.forEach(d => { held[d] = true; }); });
    btn.addEventListener("pointerup", release);
    btn.addEventListener("pointercancel", release);
    btn.addEventListener("pointerleave", release);
}
setupPad("up-btn", ["up"]);       setupPad("down-btn", ["down"]);
setupPad("left-btn", ["left"]);   setupPad("right-btn", ["right"]);
setupPad("upleft-btn", ["up", "left"]);     setupPad("upright-btn", ["up", "right"]);
setupPad("downleft-btn", ["down", "left"]); setupPad("downright-btn", ["down", "right"]);

// ---------- Movement ----------
let playerMoving = false, guideMoving = false;
let movingSince = null, idleSince = null, lastTalk = 0;

// Move a character toward (dx, dy). If that is blocked, slide around the obstacle
// by trying directions rotated up to 75 degrees either way. This makes diagonal
// paths and curved edges easy to follow with any input.
const STEER_ANGLES = [0, 20, -20, 40, -40, 60, -60, 75, -75].map(d => d * Math.PI / 180);
function steer(x, y, dx, dy, dist) {
    const base = Math.atan2(dy, dx);
    for (const a of STEER_ANGLES) {
        const nx = x + Math.cos(base + a) * dist * Math.cos(a);
        const ny = y + Math.sin(base + a) * dist * Math.cos(a);
        if (canStand(nx, ny)) return [nx, ny];
    }
    return null;
}

function movePlayer(dt) {
    let dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
    let dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
    if (!dx && !dy) return false;

    // face the way he is trying to go; side-on sprites win on diagonals
    playerDir = dx !== 0 ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");

    const len = Math.hypot(dx, dy);
    const r = steer(playerX, playerY, dx / len, dy / len, PLAYER_SPEED * dt);
    if (!r) return false;
    [playerX, playerY] = r;
    return true;
}

function moveGuide(dt) {
    const px = playerX + BOX / 2, py = playerY + BOX;
    const gx = guideX + BOX / 2, gy = guideY + BOX;
    const dist = Math.hypot(px - gx, py - gy);

    if (dist > 280) {                       // got left behind: catch up
        [guideX, guideY] = nearestStandable(playerX - 45, playerY + 8);
        return false;
    }
    if (dist <= FOLLOW_DIST) return false;

    const dx = (px - gx) / dist, dy = (py - gy) / dist;
    const r = steer(guideX, guideY, dx, dy, GUIDE_SPEED * dt);
    if (!r) return false;
    [guideX, guideY] = r;
    // only turn when clearly heading one way, so she doesn't flicker on diagonals
    if (Math.abs(dx) > 1.25 * Math.abs(dy))      guideDir = dx > 0 ? "right" : "left";
    else if (Math.abs(dy) > 1.25 * Math.abs(dx)) guideDir = dy > 0 ? "down" : "up";
    return true;
}

// ---------- Main loop ----------
let lastFrame = performance.now();
function loop(now) {
    const dt = Math.min(0.05, (now - lastFrame) / 1000);
    lastFrame = now;

    if (gameRunning && cinematic) {
        if (cineStep) cineStep(dt);
        place(playerEl, playerX, playerY);
        place(guideEl, guideX, guideY);
        renderCharacters(now);
    } else if (gameRunning && (popupOpen || vnOpen || memoryOpen)) {
        playerMoving = false; guideMoving = false;
        renderCharacters(now);
    } else if (gameRunning) {
        playerMoving = movePlayer(dt);
        guideMoving  = moveGuide(dt);
        place(playerEl, playerX, playerY);
        place(guideEl, guideX, guideY);

        if (playerMoving) { checkCollectibles(); checkExits(); }
        checkObstacles();
        renderCharacters(now);

        // ambient chatter
        if (playerMoving) {
            idleSince = null;
            if (movingSince === null) movingSince = now;
            if (now - movingSince > 9000 && now - lastTalk > 6000) { say("movement"); lastTalk = now; movingSince = now; }
        } else {
            movingSince = null;
            if (idleSince === null) idleSince = now;
            if (now - idleSince > 7000 && now - lastTalk > 6000) { say("idle"); lastTalk = now; idleSince = now; }
        }
    }
    requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

// ---------- Debug: press M to see the walkable area and doorways ----------
let maskDebug = null;
function toggleMaskDebug() {
    if (maskDebug) { maskDebug.remove(); maskDebug = null; return; }
    maskDebug = document.createElement("canvas");
    maskDebug.width = STAGE_W; maskDebug.height = STAGE_H;
    maskDebug.style.cssText = "position:absolute;inset:0;z-index:1;pointer-events:none;";
    const ctx = maskDebug.getContext("2d");
    ctx.fillStyle = "rgba(0,255,120,0.33)";
    for (let y = 0; y < MASK_H; y++) for (let x = 0; x < MASK_W; x++) {
        const bit = y * MASK_W + x;
        if ((walkMasks[currentArea][bit >> 3] >> (7 - (bit & 7))) & 1)
            ctx.fillRect(x * MASK_CELL, y * MASK_CELL, MASK_CELL, MASK_CELL);
    }
    stage.appendChild(maskDebug);
}

// =====================================================================
//  THE FINALE: guide leads him to the crystal, it ignites, surprise page
// =====================================================================
let cinematic = false, cineStep = null, finaleStarted = false;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const standFeet = (fx, fy) => canStand(fx - BOX / 2, fy - BOX);
const guideFeet = () => [guideX + BOX / 2, guideY + BOX];

// Shortest walk between two feet points: BFS on an 8px grid, then straightened
function findPath(from, to) {
    const S = 8, W = Math.ceil(STAGE_W / S), H = Math.ceil(STAGE_H / S);
    const cellOk = (cx, cy) => cx >= 0 && cy >= 0 && cx < W && cy < H && standFeet(cx * S, cy * S);
    const snap = p => {
        const cx = Math.round(p[0] / S), cy = Math.round(p[1] / S);
        if (cellOk(cx, cy)) return [cx, cy];
        for (let r = 1; r < 40; r++)
            for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++)
                if (Math.max(Math.abs(dx), Math.abs(dy)) === r && cellOk(cx + dx, cy + dy)) return [cx + dx, cy + dy];
        return [cx, cy];
    };
    const [sx, sy] = snap(from), [tx, ty] = snap(to);
    const prev = new Int32Array(W * H).fill(-1);
    const q = [sy * W + sx]; prev[sy * W + sx] = sy * W + sx;
    const nb = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
    for (let h = 0; h < q.length && prev[ty * W + tx] < 0; h++) {
        const cx = q[h] % W, cy = (q[h] / W) | 0;
        for (const [ox, oy] of nb) {
            const nx = cx + ox, ny = cy + oy, k = ny * W + nx;
            if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[k] >= 0 || !cellOk(nx, ny)) continue;
            if (ox && oy && !(cellOk(cx + ox, cy) && cellOk(cx, cy + oy))) continue;   // no corner cutting
            prev[k] = q[h]; q.push(k);
        }
    }
    if (prev[ty * W + tx] < 0) return [to];                       // unreachable: go straight
    const cells = []; let k = ty * W + tx;
    while (k !== sy * W + sx) { cells.push([(k % W) * S, ((k / W) | 0) * S]); k = prev[k]; }
    cells.push([sx * S, sy * S]); cells.reverse();
    const clear = (a, b) => {                                     // straight line stays on the path?
        const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 6);
        for (let i = 1; i < n; i++) if (!standFeet(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n)) return false;
        return true;
    };
    const out = []; let anchor = 0;
    while (anchor < cells.length - 1) {
        let j = cells.length - 1;
        while (j > anchor + 1 && !clear(cells[anchor], cells[j])) j--;
        out.push(cells[j]); anchor = j;
    }
    return out;
}

// The guide walks the points; he trails about 85px behind her. No collisions here:
// the route is already on the path (and the last few steps climb the stone steps).
function walkPath(points, speed = 235) {
    return new Promise(resolve => {
        const GAP = 85, trail = [guideFeet()], cum = [0];
        let i = 0, ptr = 0, quiet = 0;
        const turn = (cur, dx, dy) =>
            Math.abs(dx) > 1.25 * Math.abs(dy) ? (dx > 0 ? "right" : "left")
          : Math.abs(dy) > 1.25 * Math.abs(dx) ? (dy > 0 ? "down" : "up") : cur;
        cineStep = dt => {
            // guide
            let [gx, gy] = guideFeet(); const ox = gx, oy = gy; let budget = speed * dt;
            while (budget > 0 && i < points.length) {
                const [tx, ty] = points[i], d = Math.hypot(tx - gx, ty - gy);
                if (d <= budget) { gx = tx; gy = ty; budget -= d; i++; }
                else { gx += (tx - gx) / d * budget; gy += (ty - gy) / d * budget; budget = 0; }
            }
            const gMoved = Math.hypot(gx - ox, gy - oy) > 0.01;
            if (gMoved) guideDir = turn(guideDir, gx - ox, gy - oy);
            guideX = gx - BOX / 2; guideY = gy - BOX; guideMoving = gMoved;
            const last = trail[trail.length - 1], step = Math.hypot(gx - last[0], gy - last[1]);
            if (step >= 6) { trail.push([gx, gy]); cum.push(cum[cum.length - 1] + step); }
            // him
            let px = playerX + BOX / 2, py = playerY + BOX; const px0 = px, py0 = py;
            let pb = speed * 1.05 * dt; const guideCum = cum[cum.length - 1];
            while (pb > 0 && ptr < trail.length) {
                const behind = guideCum - (cum[ptr] - Math.hypot(trail[ptr][0] - px, trail[ptr][1] - py));
                if (behind <= GAP) break;
                const [tx, ty] = trail[ptr], d = Math.hypot(tx - px, ty - py);
                if (d <= pb) { px = tx; py = ty; pb -= d; ptr++; }
                else { px += (tx - px) / d * pb; py += (ty - py) / d * pb; pb = 0; }
            }
            const pMoved = Math.hypot(px - px0, py - py0) > 0.01;
            if (pMoved) playerDir = turn(playerDir, px - px0, py - py0);
            playerX = px - BOX / 2; playerY = py - BOX; playerMoving = pMoved;
            // done once she has arrived and he has caught up behind her
            if (i >= points.length && !pMoved && !gMoved) { if (++quiet > 6) { cineStep = null; resolve(); } } else quiet = 0;
        };
    });
}

const fade = on => { fadeOverlay.classList.toggle("on", on); return sleep(480); };

// which neighbouring area to head for on the way to area 1
function nextHopToArea1(from) {
    const prev = { [from]: null }, q = [from];
    while (q.length) {
        const a = q.shift();
        for (const n of Object.keys(AREAS[a].exits).map(Number))
            if (!(n in prev)) { prev[n] = a; q.push(n); }
    }
    let a = 1; while (prev[a] !== from && prev[a] !== null) a = prev[a];
    return a;
}

function clearEverything() {                       // the forest opens up for the walk
    for (const area in OBSTACLES) OBSTACLES[area].forEach(o => solved.add(o.id));
    [...activeObstacles].forEach(o => clearObstacle(o, true));
}

async function startFinale() {
    if (finaleStarted) return;
    finaleStarted = true; cinematic = true;
    for (const k in held) held[k] = false;
    if (popupOpen) closeQuestion();
    clearEverything();
    emoteUntil = 0;

    await vnSay([
        { who: "guide",  mood: "surprise", text: "That's ALL of them!! 24 out of 24!" },
        { who: "player", mood: "joy",      text: "Wait... really? All of them?" },
        { who: "guide",  mood: "point",    text: "Come on... follow me. There's something I need to show you." }
    ]);

    // lead him back to area 1, hopping through doorways if he is elsewhere
    while (currentArea !== 1) {
        const next = nextHopToArea1(currentArea), door = AREAS[currentArea].exits[next];
        await walkPath(findPath(guideFeet(), door));
        await fade(true);
        changeArea(next, currentArea, false, true);
        await sleep(120);
        await fade(false);
    }

    // area 1: across the clearing, then up to the crystal
    await walkPath(findPath(guideFeet(), [1250, 335]).concat([[1252, 318], [1264, 292], [1282, 262]]));
    guideDir = "up"; playerDir = "up"; guideMoving = playerMoving = false;
    await sleep(500);
    await vnSay([{ who: "guide", mood: "calm", text: "Here it is..." }]);

    crystalGlow.classList.add("on");               // the glow fades in over ~2.6s
    await sleep(2400);
    emoteUntil = performance.now() + 4000;
    await vnSay([
        { who: "guide",  mood: "joy",      text: "Look at it glow!" },
        { who: "guide",  mood: "love",     text: "Great! You've unlocked it!" }, 
        { who: "player", mood: "surprise", text: "...You planned all of this?" },
        { who: "guide",  mood: "wink",     text: "You found every single memory. I knew you would, my baby." },
        { who: "guide",  mood: "love",     text: "Happy birthday my cutie. Now go on... open your surprise!! I hope you like it hehe." }
    ]);

    crystalGlow.classList.add("burst");            // light swallows everything
    await sleep(900);
    flashEl.classList.add("on");
    await sleep(1250);
    showSurprise();
    flashEl.classList.remove("on");
}

function showSurprise() {
    gameScreen.style.display = "none";
    surpriseScreen.style.display = "flex";
    surpriseScreen.classList.remove("show"); void surpriseScreen.offsetWidth; surpriseScreen.classList.add("show");
    ambientBox.style.display = "none";
}

// If the video file is missing, show a friendly placeholder instead of a broken player
const surpriseVideo = document.getElementById("surprise-video");
document.getElementById("surprise-source").addEventListener("error", () => {
    surpriseVideo.style.display = "none";
    document.getElementById("video-placeholder").style.display = "flex";
});

document.getElementById("back-to-forest").addEventListener("click", () => {
    surpriseVideo.pause();
    surpriseScreen.style.display = "none";
    gameScreen.style.display = "block";
    crystalGlow.classList.remove("burst");
    fitStage();
    cinematic = false; cineStep = null;
    for (const k in held) held[k] = false;
});

// Testing shortcut - only active when the address ends in ?debug
if (location.search.includes("debug")) {
    document.addEventListener("keydown", e => {
        if (e.shiftKey && (e.key === "F" || e.key === "f") && gameRunning && !finaleStarted) {
            AREAS_KEYS_ALL().forEach(k => collected.add(k));
            countEl.textContent = collected.size;
            startFinale();
        }
    });
}
function AREAS_KEYS_ALL() {
    const keys = [];
    for (const a in AREAS) AREAS[a].collectibles.forEach((_, i) => keys.push(a + "-" + i));
    return keys;
}

// ---------- Menus and the opening conversation ----------
const introDialogue = [
    { who: "guide",  mood: "wink", text: "Ah Finally! Took you long enough, princess." },
    { who: "guide",  mood: "joy",  text: "Are you ready to unlock your birthday surprise?" },
    { who: "player", mood: "wink", text: "Always." }
];

startButton.addEventListener("click", () => {
    welcomeScreen.style.display = "none";
    characterScreen.style.display = "flex";
});

const characterCards = document.querySelectorAll(".character-card");
let selectedCharacter = null;
characterCards.forEach(card => {
    card.addEventListener("click", () => {
        characterCards.forEach(c => c.classList.remove("selected"));
        card.classList.add("selected");
        selectedCharacter = card;
        continueButton.disabled = false;
    });
});

continueButton.addEventListener("click", async () => {
    if (!selectedCharacter) return;
    characterScreen.style.display = "none";
    gameScreen.style.display = "block";
    fitStage();
    changeArea(1, null, true);
    renderCharacters(performance.now());
    gameScreen.classList.add("intro");            // forest softly blurred behind the conversation
    await vnSay(introDialogue);
    gameScreen.classList.remove("intro");
    
    gameRunning = true;
    setTimeout(() => showAmbientDialogue("Go on, explore! Follow the glowing orbs ✨"), 600);
});
