<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Perfil — Monitor de Estudos</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <style>
    :root {
      --accent: #8b5cf6;
      --accent2: #06b6d4;
      --accent-muted: rgba(139,92,246,0.15);
      --accent-glow: rgba(139,92,246,0.25);
      --accent-text: #c4b5fd;
      --banner-from: #0f0f14;
      --banner-mid: #1a0a2e;
      --banner-to: #0d1a2a;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Inter', sans-serif;
      background: #0a0a0f;
      color: #e2e8f0;
      min-height: 100vh;
    }

    /* ── THEME SWITCHER ── */
    .theme-cyberpunk {
      --accent: #8b5cf6;
      --accent2: #06b6d4;
      --accent-muted: rgba(139,92,246,0.15);
      --accent-glow: rgba(139,92,246,0.25);
      --accent-text: #c4b5fd;
      --banner-from: #0f0f14;
      --banner-mid: #1a0a2e;
      --banner-to: #0d1a2a;
    }
    .theme-lofi {
      --accent: #f59e0b;
      --accent2: #fb7185;
      --accent-muted: rgba(245,158,11,0.15);
      --accent-glow: rgba(245,158,11,0.25);
      --accent-text: #fcd34d;
      --banner-from: #0f0a05;
      --banner-mid: #1f1208;
      --banner-to: #180810;
    }
    .theme-minimal {
      --accent: #6ee7b7;
      --accent2: #818cf8;
      --accent-muted: rgba(110,231,183,0.12);
      --accent-glow: rgba(110,231,183,0.2);
      --accent-text: #a7f3d0;
      --banner-from: #050f0a;
      --banner-mid: #0a1a12;
      --banner-to: #050814;
    }

    /* ── BANNER ── */
    .banner {
      height: 220px;
      background: linear-gradient(135deg, var(--banner-from) 0%, var(--banner-mid) 50%, var(--banner-to) 100%);
      position: relative;
      overflow: hidden;
    }
    .banner::before {
      content: '';
      position: absolute; inset: 0;
      background: 
        radial-gradient(ellipse 60% 80% at 30% 50%, var(--accent-muted) 0%, transparent 70%),
        radial-gradient(ellipse 40% 60% at 75% 30%, rgba(6,182,212,0.08) 0%, transparent 70%);
      pointer-events: none;
    }
    .banner-noise {
      position: absolute; inset: 0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
      opacity: 0.5;
    }

    /* Grid lines on banner */
    .banner-grid {
      position: absolute; inset: 0;
      background-image: 
        linear-gradient(var(--accent-muted) 1px, transparent 1px),
        linear-gradient(90deg, var(--accent-muted) 1px, transparent 1px);
      background-size: 40px 40px;
      opacity: 0.3;
      mask-image: linear-gradient(to bottom, transparent, rgba(0,0,0,0.5) 40%, transparent);
    }

    .accent-text { color: var(--accent-text); }
    .accent-border { border-color: var(--accent); }

    /* ── AVATAR FRAME ── */
    .avatar-frame {
      width: 108px; height: 108px;
      border-radius: 50%;
      padding: 3px;
      background: linear-gradient(135deg, var(--accent), var(--accent2));
      flex-shrink: 0;
    }
    .avatar-inner {
      width: 100%; height: 100%;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid #0a0a0f;
    }
    .avatar-img {
      width: 100%; height: 100%;
      object-fit: cover;
      display: flex; align-items: center; justify-content: center;
      font-size: 40px;
      background: #1e1e2e;
    }

    /* ── TIER BADGE ── */
    .tier-badge {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      padding: 2px 8px;
      border-radius: 99px;
      border: 1px solid var(--accent);
      color: var(--accent-text);
      background: var(--accent-muted);
      text-transform: uppercase;
    }

    /* ── THEME PICKER ── */
    .theme-dot {
      width: 18px; height: 18px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
      transition: border-color 0.2s, transform 0.2s;
    }
    .theme-dot:hover { transform: scale(1.2); }
    .theme-dot.active { border-color: #fff; }

    /* ── SHOWCASE CARDS ── */
    .showcase-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 16px;
      padding: 20px;
      transition: border-color 0.25s, background 0.25s, transform 0.25s;
      cursor: default;
    }
    .showcase-card:hover {
      border-color: var(--accent);
      background: var(--accent-muted);
      transform: translateY(-2px);
    }

    /* ── STREAK FIRE ── */
    .streak-num {
      font-size: 64px;
      font-weight: 900;
      font-family: 'Space Grotesk', sans-serif;
      line-height: 1;
      color: var(--accent-text);
      letter-spacing: -3px;
    }

    /* ── SUBJECT SCROBBLE ── */
    .subject-row {
      display: flex; align-items: center; gap: 14px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      transition: background 0.2s;
      border-radius: 8px;
      padding-left: 8px; padding-right: 8px;
    }
    .subject-row:last-child { border-bottom: none; }
    .subject-row:hover { background: rgba(255,255,255,0.04); }
    .subject-cover {
      width: 44px; height: 44px;
      border-radius: 8px;
      flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px;
    }
    .subject-rank {
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.25);
      width: 20px;
      text-align: center;
    }
    .hours-bar-bg {
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 99px;
      flex: 1;
      min-width: 60px;
    }
    .hours-bar-fill {
      height: 100%;
      border-radius: 99px;
      background: linear-gradient(90deg, var(--accent), var(--accent2));
      transition: width 0.8s cubic-bezier(0.16,1,0.3,1);
    }

    /* ── HEATMAP ── */
    .heat-cell {
      width: 13px; height: 13px;
      border-radius: 3px;
      background: rgba(255,255,255,0.06);
      transition: transform 0.15s, background 0.15s;
      cursor: default;
    }
    .heat-cell:hover { transform: scale(1.4); z-index: 10; position: relative; }
    .heat-1 { background: color-mix(in srgb, var(--accent) 20%, rgba(255,255,255,0.06)); }
    .heat-2 { background: color-mix(in srgb, var(--accent) 40%, rgba(255,255,255,0.06)); }
    .heat-3 { background: color-mix(in srgb, var(--accent) 65%, rgba(255,255,255,0.06)); }
    .heat-4 { background: color-mix(in srgb, var(--accent) 90%, rgba(255,255,255,0.06)); }

    /* ── SESSION CARDS (mini-feed) ── */
    .session-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      overflow: hidden;
      transition: border-color 0.2s, transform 0.2s;
      cursor: default;
      aspect-ratio: 1;
      display: flex; flex-direction: column;
      justify-content: flex-end;
      padding: 14px;
      position: relative;
    }
    .session-card:hover {
      border-color: var(--accent);
      transform: translateY(-2px);
    }
    .session-card-bg {
      position: absolute; inset: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 56px;
      opacity: 0.1;
    }

    /* ── ACHIEVEMENT BADGES ── */
    .badge-card {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 14px;
      padding: 16px;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      text-align: center;
      transition: border-color 0.2s, background 0.2s, transform 0.2s;
      cursor: default;
    }
    .badge-card:hover {
      border-color: var(--accent);
      background: var(--accent-muted);
      transform: translateY(-2px);
    }
    .badge-icon {
      width: 52px; height: 52px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      font-size: 24px;
      border: 2px solid var(--accent);
      background: var(--accent-muted);
    }
    .badge-locked { opacity: 0.3; filter: grayscale(1); }

    /* ── STAT PILL ── */
    .stat-pill {
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.09);
      border-radius: 99px;
      padding: 6px 14px;
      font-size: 12px;
      display: flex; align-items: center; gap: 6px;
    }
    .stat-pill span:first-child {
      font-weight: 700;
      color: var(--accent-text);
    }

    /* ── SECTION LABEL ── */
    .section-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.35);
      margin-bottom: 16px;
      display: flex; align-items: center; gap: 8px;
    }
    .section-label::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(255,255,255,0.07);
    }

    /* ── QUOTE CARD ── */
    .quote-card {
      background: var(--accent-muted);
      border: 1px solid var(--accent);
      border-left: 3px solid var(--accent);
      border-radius: 12px;
      padding: 16px 20px;
    }

    /* ── SCROLLBAR ── */
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }

    /* Tooltip */
    [data-tip] { position: relative; }
    [data-tip]:hover::after {
      content: attr(data-tip);
      position: absolute; bottom: calc(100% + 6px); left: 50%;
      transform: translateX(-50%);
      background: #1e1e2e;
      color: #e2e8f0;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
      white-space: nowrap;
      pointer-events: none;
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 100;
    }

    .transition-all { transition: all 0.3s ease; }
  </style>
</head>
<body class="theme-cyberpunk" id="root">

  <!-- ── FLOATING THEME SWITCHER ── -->
  <div style="position: fixed; top: 20px; right: 20px; z-index: 50; background: rgba(10,10,15,0.85); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 8px 12px; display: flex; align-items: center; gap: 10px;">
    <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(255,255,255,0.4);">Tema</span>
    <button class="theme-dot active" id="dot-cyber" style="background: linear-gradient(135deg, #8b5cf6, #06b6d4);" onclick="setTheme('cyberpunk', this)" data-tip="Cyberpunk"></button>
    <button class="theme-dot" id="dot-lofi" style="background: linear-gradient(135deg, #f59e0b, #fb7185);" onclick="setTheme('lofi', this)" data-tip="Lo-Fi Café"></button>
    <button class="theme-dot" id="dot-minimal" style="background: linear-gradient(135deg, #6ee7b7, #818cf8);" onclick="setTheme('minimal', this)" data-tip="Minimalista"></button>
  </div>

  <!-- ── BANNER ── -->
  <div class="banner" id="banner">
    <div class="banner-noise"></div>
    <div class="banner-grid"></div>
    <!-- Decorative floating elements -->
    <div style="position:absolute; top:30px; right:15%; font-size:11px; font-family:'Space Grotesk',sans-serif; font-weight:700; letter-spacing:0.15em; color:rgba(255,255,255,0.08); text-transform:uppercase; user-select:none;">MONITOR DE ESTUDOS</div>
    <div style="position:absolute; bottom:20px; left:5%; font-size:80px; font-weight:900; font-family:'Space Grotesk',sans-serif; color:rgba(255,255,255,0.02); user-select:none; line-height:1;">2025</div>
  </div>

  <!-- ── MAIN CONTENT ── -->
  <div style="max-width: 900px; margin: 0 auto; padding: 0 20px 80px;">

    <!-- ── PROFILE HEADER ── -->
    <div style="display: flex; align-items: flex-end; gap: 20px; margin-top: -54px; margin-bottom: 32px; flex-wrap: wrap;">

      <!-- Avatar -->
      <div class="avatar-frame">
        <div class="avatar-inner">
          <div class="avatar-img">🦊</div>
        </div>
      </div>

      <!-- Identity block -->
      <div style="flex: 1; min-width: 200px; padding-bottom: 4px;">
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px;">
          <h1 style="font-size: 26px; font-weight: 900; font-family: 'Space Grotesk', sans-serif; letter-spacing: -0.5px; line-height: 1;">Pedro Almeida</h1>
          <span class="tier-badge">★ Elite III</span>
        </div>
        <div style="font-size: 13px; color: rgba(255,255,255,0.4); margin-bottom: 10px;">@pedroalmeida</div>

        <!-- Status -->
        <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 99px; padding: 6px 14px; margin-bottom: 12px;">
          <span>🎧</span>
          <span style="font-size: 13px; color: rgba(255,255,255,0.7);">Ouvindo Lo-Fi e destruindo em Matemática</span>
        </div>

        <!-- Stat pills -->
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
          <div class="stat-pill"><span>1.240h</span><span style="color:rgba(255,255,255,0.45);">estudadas</span></div>
          <div class="stat-pill"><span>89%</span><span style="color:rgba(255,255,255,0.45);">consistência</span></div>
          <div class="stat-pill"><span>312</span><span style="color:rgba(255,255,255,0.45);">dias registrados</span></div>
          <!-- Objetivo / Goal Badge -->
          <div style="display:inline-flex; align-items:center; gap:6px; border:1px solid rgba(255,255,255,0.15); border-radius:99px; padding:5px 12px; font-size:12px; background: rgba(255,255,255,0.03);">
            <span>🩺</span><span style="font-weight:600; color:rgba(255,255,255,0.7);">Medicina — FURG 2026</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── QUOTE / MANIFESTO ── -->
    <div class="quote-card" style="margin-bottom: 36px;">
      <p style="font-size: 14px; font-style: italic; color: rgba(255,255,255,0.6); line-height: 1.6;">"Cada hora estudada é um tijolo. Não vejo o muro ainda, mas sei que estou construindo."</p>
      <p style="font-size: 11px; color: var(--accent-text); margin-top: 8px; font-weight: 600;">— Meu lema pessoal</p>
    </div>

    <!-- ── SHOWCASES ── -->
    <div class="section-label">Vitrine</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-bottom: 40px;">

      <!-- Streak showcase -->
      <div class="showcase-card" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3);">🔥 Ofensiva Atual</div>
        <div style="display: flex; align-items: baseline; gap: 6px;">
          <span class="streak-num">47</span>
          <span style="font-size: 14px; font-weight: 600; color: rgba(255,255,255,0.4);">dias</span>
        </div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.45);">Não perca amanhã ↗</div>
      </div>

      <!-- Rarest badge showcase -->
      <div class="showcase-card" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3);">🏆 Medalha Mais Rara</div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #fbbf24, #f59e0b); display: flex; align-items: center; justify-content: center; font-size: 22px; border: 2px solid rgba(251,191,36,0.5);">🌙</div>
          <div>
            <div style="font-size: 14px; font-weight: 700; line-height: 1.2;">Coruja da Madrugada</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.35); margin-top: 2px;">30 sessões após 23h</div>
          </div>
        </div>
        <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: rgba(251,191,36,0.7);">⚡ Ultra Rara · 2.1% alcançaram</div>
      </div>

      <!-- Best week showcase -->
      <div class="showcase-card" style="display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3);">📅 Melhor Semana</div>
        <div style="display: flex; align-items: baseline; gap: 6px;">
          <span class="streak-num" style="font-size: 52px;">52h</span>
        </div>
        <div style="font-size: 12px; color: rgba(255,255,255,0.45);">Semana 18/11 — 24/11</div>
        <div style="font-size: 11px; color: var(--accent-text);">↑ +12h acima da média</div>
      </div>

      <!-- Current target showcase -->
      <div class="showcase-card" style="display: flex; flex-direction: column; gap: 10px;">
        <div style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(255,255,255,0.3);">🎯 Meta da Semana</div>
        <div style="font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.8);">40h estudadas</div>
        <div style="background: rgba(255,255,255,0.07); border-radius: 99px; height: 6px; overflow: hidden;">
          <div style="height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--accent2)); width: 74%;"></div>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px; color: rgba(255,255,255,0.35);">
          <span>29.6h / 40h</span>
          <span style="color: var(--accent-text); font-weight: 700;">74%</span>
        </div>
      </div>

    </div>

    <!-- ── TOP SUBJECTS (Last.fm scrobble style) ── -->
    <div class="section-label">Top Matérias — Esta Semana</div>
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; overflow: hidden; margin-bottom: 40px;">
      <div style="padding: 6px 16px; background: rgba(255,255,255,0.03); border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 600;">#</span>
        <span style="font-size: 11px; color: rgba(255,255,255,0.25); font-weight: 600;">HORAS</span>
      </div>
      <div style="padding: 4px 8px;" id="subjects-list">
        <!-- JS will render -->
      </div>
    </div>

    <!-- ── HEATMAP ── -->
    <div class="section-label">Diário de Bordo · Últimos 6 meses</div>
    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 18px; padding: 24px; margin-bottom: 40px; overflow-x: auto;">
      <!-- Month labels -->
      <div id="heatmap-months" style="display: flex; gap: 2px; margin-bottom: 6px; padding-left: 22px;"></div>
      <div style="display: flex; gap: 6px;">
        <!-- Day labels -->
        <div style="display: flex; flex-direction: column; gap: 2px; justify-content: space-around; padding-top: 4px;">
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;">Seg</span>
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;"></span>
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;">Qua</span>
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;"></span>
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;">Sex</span>
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;"></span>
          <span style="font-size: 9px; color: rgba(255,255,255,0.2); height: 13px; display: flex; align-items: center;">Dom</span>
        </div>
        <!-- Grid -->
        <div id="heatmap-grid" style="display: flex; gap: 2px; flex-wrap: nowrap;"></div>
      </div>
      <div style="display: flex; align-items: center; gap: 6px; margin-top: 14px;">
        <span style="font-size: 10px; color: rgba(255,255,255,0.25);">Menos</span>
        <div class="heat-cell"></div>
        <div class="heat-cell heat-1"></div>
        <div class="heat-cell heat-2"></div>
        <div class="heat-cell heat-3"></div>
        <div class="heat-cell heat-4"></div>
        <span style="font-size: 10px; color: rgba(255,255,255,0.25);">Mais</span>
      </div>
    </div>

    <!-- ── SESSION MINI-FEED (3×3 Grid) ── -->
    <div class="section-label">Sessões Recentes</div>
    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 40px;" id="sessions-grid">
      <!-- JS renders -->
    </div>

    <!-- ── ACHIEVEMENTS WALL ── -->
    <div class="section-label">Conquistas</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 10px; margin-bottom: 40px;" id="badges-grid">
      <!-- JS renders -->
    </div>

    <!-- ── READING LIST / PINNED RESOURCES ── -->
    <div class="section-label">Na Prateleira — O que estou usando</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-bottom: 40px;" id="shelf-grid">
      <!-- JS renders -->
    </div>

    <!-- ── FOOTER ── -->
    <div style="text-align: center; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05);">
      <p style="font-size: 12px; color: rgba(255,255,255,0.2);">Monitor de Estudos · Perfil público de Pedro Almeida</p>
    </div>

  </div><!-- /main -->

<script>
  // ── THEME SWITCHER ──
  function setTheme(name, btn) {
    document.getElementById('root').className = 'theme-' + name;
    document.querySelectorAll('.theme-dot').forEach(d => d.classList.remove('active'));
    btn.classList.add('active');
    buildHeatmap(); // rebuild so heat colours update
  }

  // ── MOCK DATA ──
  const subjects = [
    { emoji: '🧮', name: 'Matemática', sub: 'Cálculo & Álgebra', hours: 18.5, color: '#4f46e5' },
    { emoji: '⚗️', name: 'Química', sub: 'Orgânica & Inorgânica', hours: 14.0, color: '#0891b2' },
    { emoji: '🧬', name: 'Biologia', sub: 'Citologia & Genética', hours: 11.5, color: '#16a34a' },
    { emoji: '⚡', name: 'Física', sub: 'Mecânica Clássica', hours: 9.0, color: '#b45309' },
    { emoji: '📖', name: 'Português', sub: 'Gramática & Redação', hours: 7.5, color: '#be185d' },
  ];
  const maxHours = subjects[0].hours;

  function buildSubjects() {
    const el = document.getElementById('subjects-list');
    el.innerHTML = subjects.map((s, i) => `
      <div class="subject-row">
        <span class="subject-rank">${i + 1}</span>
        <div class="subject-cover" style="background: ${s.color}22; border: 1px solid ${s.color}44;">${s.emoji}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:14px; font-weight:700; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.35);">${s.sub}</div>
        </div>
        <div style="min-width: 100px; display: flex; flex-direction: column; gap: 4px; align-items: flex-end;">
          <span style="font-size:13px; font-weight:800; font-family:'Space Grotesk',sans-serif; color: var(--accent-text);">${s.hours}h</span>
          <div class="hours-bar-bg">
            <div class="hours-bar-fill" style="width: ${(s.hours / maxHours) * 100}%;"></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  // ── HEATMAP ──
  function buildHeatmap() {
    const grid = document.getElementById('heatmap-grid');
    const monthsEl = document.getElementById('heatmap-months');
    grid.innerHTML = ''; monthsEl.innerHTML = '';

    const weeks = 26;
    const monthNames = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    let lastMonth = -1;
    let monthTracker = [];

    for (let w = 0; w < weeks; w++) {
      const col = document.createElement('div');
      col.style.cssText = 'display:flex; flex-direction:column; gap:2px;';

      // Fake date: go back ~26 weeks from "today"
      const colDate = new Date(2025, 10, 15); // Nov 15, 2025 as "today"
      colDate.setDate(colDate.getDate() - (weeks - w) * 7);
      const m = colDate.getMonth();
      if (m !== lastMonth) { monthTracker.push({ w, name: monthNames[m] }); lastMonth = m; }

      for (let d = 0; d < 7; d++) {
        const cell = document.createElement('div');
        cell.className = 'heat-cell';
        const rand = Math.random();
        let level = 0;
        // Bias: more recent weeks have more activity
        const recency = w / weeks;
        if (rand < 0.15) level = 0;
        else if (rand < 0.35) level = 1;
        else if (rand < 0.6 + recency * 0.1) level = 2;
        else if (rand < 0.8 + recency * 0.1) level = 3;
        else level = 4;
        // Weekend slightly less likely
        if (d >= 5 && Math.random() > 0.6) level = Math.max(0, level - 1);
        if (level > 0) cell.classList.add('heat-' + level);
        const hrs = [0, '1–2h', '3–4h', '5–7h', '8h+'][level];
        cell.setAttribute('data-tip', hrs ? hrs + ' estudadas' : 'Sem sessões');
        col.appendChild(cell);
      }
      grid.appendChild(col);
    }

    // Month labels
    monthTracker.forEach((m, i) => {
      const span = document.createElement('span');
      span.style.cssText = `font-size:9px; color:rgba(255,255,255,0.25); font-weight:600; width:${(weeks - m.w) > 3 ? 'auto' : '0'}; margin-left:${m.w === 0 ? 0 : 2}px; flex: 0 0 auto; min-width: 28px;`;
      span.textContent = m.name;
      monthsEl.appendChild(span);
    });
  }

  // ── SESSIONS MINI-FEED ──
  const sessions = [
    { emoji: '📐', subject: 'Matemática', duration: '4h 20min', time: '23:00', note: 'Limites e Derivadas', color: '#4f46e5' },
    { emoji: '🧬', subject: 'Biologia', duration: '2h 45min', time: '15:30', note: 'Mitose & Meiose', color: '#16a34a' },
    { emoji: '⚗️', subject: 'Química', duration: '3h 00min', time: '09:00', note: 'Reações Orgânicas', color: '#0891b2' },
    { emoji: '📖', subject: 'Redação', duration: '1h 30min', time: '20:00', note: 'Tema: Tecnologia', color: '#be185d' },
    { emoji: '⚡', subject: 'Física', duration: '2h 15min', time: '14:00', note: 'Dinâmica — Força', color: '#b45309' },
    { emoji: '🧮', subject: 'Matemática', duration: '3h 50min', time: '22:00', note: 'Funções & Gráficos', color: '#4f46e5' },
    { emoji: '🌍', subject: 'Geografia', duration: '1h 20min', time: '11:00', note: 'Geopolítica Global', color: '#7c3aed' },
    { emoji: '📜', subject: 'História', duration: '2h 00min', time: '16:00', note: 'Brasil República', color: '#92400e' },
    { emoji: '⚗️', subject: 'Química', duration: '4h 10min', time: '10:00', note: 'Eletroquímica', color: '#0891b2' },
  ];

  function buildSessions() {
    const el = document.getElementById('sessions-grid');
    el.innerHTML = sessions.map(s => `
      <div class="session-card" style="border-color: ${s.color}33; min-height: 130px;">
        <div class="session-card-bg">${s.emoji}</div>
        <div style="position:relative; z-index:1;">
          <div style="font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:rgba(255,255,255,0.35); margin-bottom:4px;">${s.subject}</div>
          <div style="font-size:20px; font-weight:900; font-family:'Space Grotesk',sans-serif; line-height:1; color:#fff;">${s.duration}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.45); margin-top:4px;">${s.note}</div>
          <div style="font-size:10px; color:rgba(255,255,255,0.25); margin-top:6px;">às ${s.time}</div>
        </div>
      </div>
    `).join('');
  }

  // ── ACHIEVEMENT BADGES ──
  const badges = [
    { emoji: '🌙', name: 'Coruja da Madrugada', desc: '30 sessões after 23h', rarity: 'Ultra Rara', locked: false },
    { emoji: '🔥', name: 'Em Chamas', desc: 'Streak de 30 dias', rarity: 'Rara', locked: false },
    { emoji: '⚡', name: 'Relâmpago', desc: '10h em um dia', rarity: 'Épica', locked: false },
    { emoji: '📚', name: 'Polímata', desc: '5 matérias no mesmo dia', rarity: 'Incomum', locked: false },
    { emoji: '🏆', name: 'Centenário', desc: '100 dias de estudo', rarity: 'Rara', locked: false },
    { emoji: '🌅', name: 'Madrugador', desc: '20 sessões antes das 6h', rarity: 'Incomum', locked: false },
    { emoji: '💎', name: 'Diamante', desc: '500 horas totais', rarity: 'Lendária', locked: false },
    { emoji: '🚀', name: 'Lançamento', desc: '1000 horas totais', rarity: 'Lendária', locked: true },
    { emoji: '👑', name: 'Coroa', desc: 'Top 1% na plataforma', rarity: 'Mítica', locked: true },
  ];

  const rarityColor = { 'Ultra Rara': '#fbbf24', 'Rara': '#a78bfa', 'Épica': '#f472b6', 'Incomum': '#34d399', 'Lendária': '#60a5fa', 'Mítica': '#f43f5e' };

  function buildBadges() {
    const el = document.getElementById('badges-grid');
    el.innerHTML = badges.map(b => `
      <div class="badge-card ${b.locked ? 'badge-locked' : ''}">
        <div class="badge-icon" style="border-color: ${b.locked ? 'rgba(255,255,255,0.2)' : (rarityColor[b.rarity] || 'var(--accent)')+'66'}; background: ${b.locked ? 'rgba(255,255,255,0.05)' : (rarityColor[b.rarity] || 'var(--accent)')+'22'};">
          ${b.locked ? '🔒' : b.emoji}
        </div>
        <div style="font-size:12px; font-weight:700; line-height:1.3;">${b.name}</div>
        <div style="font-size:10px; color:rgba(255,255,255,0.35); line-height:1.4;">${b.desc}</div>
        <div style="font-size:9px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:${b.locked ? 'rgba(255,255,255,0.2)' : (rarityColor[b.rarity] || 'var(--accent)')}">${b.rarity}</div>
      </div>
    `).join('');
  }

  // ── SHELF (Pinned resources) ──
  const shelf = [
    { emoji: '📕', title: 'Osvaldo Frota', sub: 'Química — Vol. 2', type: 'Livro', progress: 68 },
    { emoji: '🎧', title: 'Lo-Fi Study Beats', sub: 'Spotify Playlist', type: 'Playlist', progress: null },
    { emoji: '📹', title: 'Equaciona', sub: 'Canal no YouTube', type: 'Canal', progress: null },
    { emoji: '📒', title: 'Caderno de Erros', sub: 'Revisão pessoal', type: 'Anotação', progress: 45 },
  ];

  function buildShelf() {
    const el = document.getElementById('shelf-grid');
    el.innerHTML = shelf.map(s => `
      <div class="showcase-card" style="display:flex; align-items:flex-start; gap:12px; padding:16px;">
        <div style="font-size:28px; line-height:1; flex-shrink:0;">${s.emoji}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.1em; color:var(--accent-text); margin-bottom:3px;">${s.type}</div>
          <div style="font-size:14px; font-weight:700; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.title}</div>
          <div style="font-size:11px; color:rgba(255,255,255,0.35); margin-top:2px;">${s.sub}</div>
          ${s.progress != null ? `
          <div style="margin-top:8px;">
            <div style="background:rgba(255,255,255,0.07); border-radius:99px; height:4px; overflow:hidden;">
              <div style="height:100%; border-radius:99px; background:linear-gradient(90deg, var(--accent), var(--accent2)); width:${s.progress}%;"></div>
            </div>
            <div style="font-size:10px; color:rgba(255,255,255,0.3); margin-top:3px; text-align:right;">${s.progress}% lido</div>
          </div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // ── INIT ──
  buildSubjects();
  buildHeatmap();
  buildSessions();
  buildBadges();
  buildShelf();

  // Animate hours bars in on load
  window.addEventListener('load', () => {
    document.querySelectorAll('.hours-bar-fill').forEach(el => {
      const target = el.style.width;
      el.style.width = '0%';
      setTimeout(() => { el.style.width = target; }, 200);
    });
  });
</script>
</body>
</html>