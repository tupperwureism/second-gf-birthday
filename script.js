/**
 * MYCITYPOPGURL — 20TH BIRTHDAY (28 OKTOBER)
 * Interactive Engine: Vinyl Player, Scratch Seal, 3D Tilt, Candle Blow & VIP Tickets
 */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. STATE & AUDIO SYSTEM
  // ==========================================
  const bgMusic = document.getElementById('bg-music');
  const miniDisc = document.getElementById('mini-disc');
  const spinningVinyl = document.getElementById('spinning-vinyl');
  const toggleAudioBtn = document.getElementById('toggle-audio-btn');
  const playIcon = document.getElementById('play-icon');
  const pauseIcon = document.getElementById('pause-icon');

  let isAudioPlaying = false;
  let isSideAUnlocked = false;
  let isCandleExtinguished = false;
  let tracksDiscovered = new Set([1]); // Track 1 is initial
  let audioCtx = null;

  // Web Audio Synthesizer for interaction feedback chimes
  function playSynthChime(frequency = 587.33, type = 'sine', duration = 0.4) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === 'suspended') audioCtx.resume();

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.2, audioCtx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // AudioContext not supported or restricted
    }
  }

  function updateAudioUI(playing) {
    isAudioPlaying = playing;
    if (playing) {
      playIcon.classList.add('hidden');
      pauseIcon.classList.remove('hidden');
      miniDisc.classList.remove('paused-spin');
      miniDisc.classList.add('spinning');
      if (spinningVinyl) {
        spinningVinyl.classList.remove('paused-spin');
        spinningVinyl.classList.add('spinning');
      }
    } else {
      playIcon.classList.remove('hidden');
      pauseIcon.classList.add('hidden');
      miniDisc.classList.add('paused-spin');
      if (spinningVinyl) spinningVinyl.classList.add('paused-spin');
    }
  }

  function startMusic() {
    bgMusic.volume = 0.85;
    bgMusic.play().then(() => {
      updateAudioUI(true);
    }).catch(() => {
      // Autoplay blocked; waits for user gesture
      updateAudioUI(false);
    });
  }

  toggleAudioBtn.addEventListener('click', () => {
    if (bgMusic.paused) {
      bgMusic.play().then(() => updateAudioUI(true));
    } else {
      bgMusic.pause();
      updateAudioUI(false);
    }
  });


  // ==========================================
  // 2. SCRATCH SEAL CANVAS ENGINE (Babak 1)
  // ==========================================
  const scratchCanvas = document.getElementById('scratch-seal');
  const dropNeedleBtn = document.getElementById('drop-needle-btn');
  let ctx = null;
  let isScratching = false;
  let scratchedPixels = 0;
  let totalPixels = 0;

  if (scratchCanvas) {
    ctx = scratchCanvas.getContext('2d', { willReadFrequently: true });
    
    // Fit canvas resolution to parent
    function resizeCanvas() {
      const rect = scratchCanvas.getBoundingClientRect();
      scratchCanvas.width = rect.width * (window.devicePixelRatio || 1);
      scratchCanvas.height = rect.height * (window.devicePixelRatio || 1);
      totalPixels = scratchCanvas.width * scratchCanvas.height;

      // Draw Kraft & Gold foil seal texture
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
      
      const grad = ctx.createLinearGradient(0, 0, rect.width, rect.height);
      grad.addColorStop(0, '#D8C7AF');
      grad.addColorStop(0.5, '#EFE5D4');
      grad.addColorStop(1, '#C87D4B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, rect.width, rect.height);

      // Seal border & text
      ctx.strokeStyle = '#7A1C2E';
      ctx.lineWidth = 3;
      ctx.strokeRect(6, 6, rect.width - 12, rect.height - 12);

      ctx.fillStyle = '#7A1C2E';
      ctx.font = 'bold 12px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('★ 20TH ANNIVERSARY SEAL ★', rect.width / 2, rect.height / 2 - 10);
      
      ctx.fillStyle = '#1E1A1B';
      ctx.font = '11px "Bricolage Grotesque", sans-serif';
      ctx.fillText('Gosok segel ini untuk buka kejutan ✨', rect.width / 2, rect.height / 2 + 12);
    }

    window.addEventListener('resize', resizeCanvas);
    setTimeout(resizeCanvas, 50);

    function scratch(e) {
      if (!isScratching) return;
      const rect = scratchCanvas.getBoundingClientRect();
      const clientX = e.clientX || (e.touches && e.touches[0].clientX);
      const clientY = e.clientY || (e.touches && e.touches[0].clientY);

      const x = (clientX - rect.left);
      const y = (clientY - rect.top);

      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();

      checkScratchPercentage();
    }

    function checkScratchPercentage() {
      if (isSideAUnlocked) return;
      scratchedPixels += 1;
      // Sampling check every few strokes
      if (scratchedPixels % 12 === 0) {
        const imgData = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height);
        let clearCount = 0;
        // Sample every 16th pixel for performance
        for (let i = 3; i < imgData.data.length; i += 64) {
          if (imgData.data[i] === 0) clearCount++;
        }
        const ratio = clearCount / (imgData.data.length / 64);
        if (ratio > 0.35) {
          unlockSideA();
        }
      }
    }

    scratchCanvas.addEventListener('pointerdown', (e) => {
      isScratching = true;
      scratch(e);
    });
    window.addEventListener('pointermove', scratch);
    window.addEventListener('pointerup', () => { isScratching = false; });
  }

  // Instant Unlock Trigger (Either from Scratch or Button)
  function unlockSideA() {
    if (isSideAUnlocked) return;
    isSideAUnlocked = true;

    playSynthChime(659.25, 'triangle', 0.5);

    // Fade out canvas
    if (scratchCanvas) {
      gsap.to(scratchCanvas, {
        opacity: 0,
        duration: 0.6,
        onComplete: () => { scratchCanvas.style.display = 'none'; }
      });
    }

    // Confetti burst: Velvet Burgundy, Amber Gold & Cream
    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.35 },
      colors: ['#7A1C2E', '#C87D4B', '#FAF7F2', '#3B628B']
    });

    // Start jazz audio
    startMusic();

    // Reveal Gatefold & Candle Sections
    const gatefoldSection = document.getElementById('gatefold-section');
    const candleSection = document.getElementById('candle-section');

    gsap.to([gatefoldSection, candleSection], {
      opacity: 1,
      filter: 'blur(0px)',
      duration: 0.9,
      stagger: 0.2,
      onStart: () => {
        gatefoldSection.style.pointerEvents = 'auto';
        candleSection.style.pointerEvents = 'auto';
      }
    });

    // Smooth scroll down to Gatefold Section
    setTimeout(() => {
      gatefoldSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 700);
  }

  if (dropNeedleBtn) {
    dropNeedleBtn.addEventListener('click', unlockSideA);
  }


  // ==========================================
  // 3. 3D VINYL SLEEVE TILT & TRACK HOTSPOTS (Babak 2)
  // ==========================================
  const vinylCard3D = document.getElementById('vinyl-card-3d');
  
  if (vinylCard3D) {
    vinylCard3D.addEventListener('pointermove', (e) => {
      const rect = vinylCard3D.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      vinylCard3D.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });

    vinylCard3D.addEventListener('pointerleave', () => {
      vinylCard3D.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
    });
  }

  const trackData = {
    1: {
      badge: "Track 01 • The White Dress",
      quote: `"The prettiest girl in the white broderie dress 🤍"`,
      badgeColor: "bg-denim"
    },
    2: {
      badge: "Track 02 • Favorite Pout",
      quote: `"Muka gemes favoritku tiap foto bareng 😘"`,
      badgeColor: "bg-amber"
    },
    3: {
      badge: "Track 03 • Lucky Guy in Denim",
      quote: `"Cowok paling beruntung di tanggal 28 Oktober 😁"`,
      badgeColor: "bg-denim-dark"
    },
    4: {
      badge: "Track 04 • Burgundy Roses",
      quote: `"Bunga ini kalah cantik sama yang gandeng tanganku 🌹"`,
      badgeColor: "bg-burgundy"
    }
  };

  const trackBadge = document.getElementById('track-badge');
  const trackQuote = document.getElementById('track-quote');
  const trackProgress = document.getElementById('track-progress');
  const hotspotPins = document.querySelectorAll('.hotspot-pin');

  hotspotPins.forEach(pin => {
    pin.addEventListener('click', () => {
      const trackId = parseInt(pin.getAttribute('data-track'));
      tracksDiscovered.add(trackId);

      playSynthChime(523.25 + (trackId * 60), 'sine', 0.3);

      const data = trackData[trackId];
      if (data) {
        gsap.to('#track-card', {
          y: -4,
          duration: 0.15,
          yoyo: true,
          repeat: 1,
          onStart: () => {
            trackBadge.textContent = data.badge;
            trackBadge.className = `px-2 py-0.5 ${data.badgeColor} text-ivory font-mono text-[10px] font-bold rounded uppercase`;
            trackQuote.textContent = data.quote;
            trackProgress.textContent = `${tracksDiscovered.size} of 4 Discovered`;
          }
        });
      }
    });
  });


  // ==========================================
  // 4. CANDLE RITUAL ENGINE (Babak 3)
  // ==========================================
  const candleFlame = document.getElementById('candle-flame');
  const micBlowBtn = document.getElementById('mic-blow-btn');
  const micBtnText = document.getElementById('mic-btn-text');
  const micStatus = document.getElementById('mic-status');
  const smoke1 = document.getElementById('smoke-1');
  const smoke2 = document.getElementById('smoke-2');

  let isListeningBlow = false;
  let micStream = null;

  function extinguishCandle() {
    if (isCandleExtinguished) return;
    isCandleExtinguished = true;

    if (micStream) {
      micStream.getTracks().forEach(track => track.stop());
    }

    // Extinguish Flame & Spawn Smoke
    candleFlame.classList.add('flame-extinguished');
    smoke1.classList.add('animate-smoke');
    smoke2.classList.add('animate-smoke');

    playSynthChime(880, 'sine', 0.6);

    // Double Grand Confetti Explosion!
    const end = Date.now() + 1500;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7A1C2E', '#C87D4B', '#FAF7F2', '#3B628B']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7A1C2E', '#C87D4B', '#FAF7F2', '#3B628B']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());

    if (micBtnText) micBtnText.textContent = "✨ Lilin Padam • Make A Wish Terkabul!";
    if (micBlowBtn) {
      micBlowBtn.classList.remove('bg-burgundy', 'hover:bg-burgundy-light');
      micBlowBtn.classList.add('bg-amber', 'cursor-default');
    }
    if (micStatus) {
      micStatus.textContent = "Hembusan tiupan terdeteksi! Doamu sedang menuju semesta 🤍";
      micStatus.classList.remove('hidden');
    }

    // Reveal Love Letter Section (Babak 4)
    const letterSection = document.getElementById('letter-section');
    letterSection.classList.remove('hidden');

    gsap.fromTo(letterSection, 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1.2, ease: "power2.out" }
    );

    setTimeout(() => {
      letterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 800);
  }

  // Primary Microphone Blow Detection Button
  if (micBlowBtn) {
    micBlowBtn.addEventListener('click', async () => {
      if (isCandleExtinguished) return;

      // If already listening, allow tap to blow as instant fallback
      if (isListeningBlow) {
        extinguishCandle();
        return;
      }

      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        isListeningBlow = true;
        if (micBtnText) micBtnText.textContent = "Mendengarkan Tiupan... Tiup Sekarang! 💨";
        if (micStatus) micStatus.classList.remove('hidden');

        const Ctx = window.AudioContext || window.webkitAudioContext;
        const audioInputCtx = new Ctx();
        const analyser = audioInputCtx.createAnalyser();
        const microphone = audioInputCtx.createMediaStreamSource(micStream);
        analyser.fftSize = 256;
        microphone.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function checkAudioBlow() {
          if (isCandleExtinguished) {
            if (micStream) micStream.getTracks().forEach(track => track.stop());
            return;
          }
          analyser.getByteFrequencyData(dataArray);
          let sum = 0;
          for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
          }
          const average = sum / bufferLength;

          // Detect puff / blow volume threshold
          if (average > 55) {
            extinguishCandle();
          } else {
            requestAnimationFrame(checkAudioBlow);
          }
        }
        checkAudioBlow();
      } catch (err) {
        // Fallback if mic permission is denied
        extinguishCandle();
      }
    });
  }


  // ==========================================
  // 5. PAWANG HUJAN WIDGET (Babak 4)
  // ==========================================
  const pawangBtn = document.getElementById('pawang-btn');
  const pawangIcon = document.getElementById('pawang-icon');
  const pawangBtnText = document.getElementById('pawang-btn-text');
  const pawangStamp = document.getElementById('pawang-stamp');
  const weatherText = document.getElementById('weather-text');

  let isPawangActive = false;

  pawangBtn.addEventListener('click', () => {
    if (isPawangActive) return;
    isPawangActive = true;

    playSynthChime(698.46, 'sine', 0.4);

    pawangIcon.textContent = '☀️';
    pawangBtnText.textContent = 'Pawang Aktif!';
    pawangBtn.classList.remove('bg-denim');
    pawangBtn.classList.add('bg-amber');

    weatherText.textContent = 'Langit aman! Siap meluncur ke Olive Manor malam ini tanpa ragu ✨';
    pawangStamp.classList.remove('hidden');

    confetti({
      particleCount: 35,
      spread: 60,
      colors: ['#F3A066', '#FAF7F2', '#3B628B']
    });
  });


  // ==========================================
  // 6. VIP BIRTHDAY TICKETS & WHATSAPP CLAIM
  // ==========================================
  const ticketCards = document.querySelectorAll('.ticket-card');
  const redeemedTickets = new Set();

  ticketCards.forEach(card => {
    card.addEventListener('click', () => {
      const ticketId = card.getAttribute('data-ticket');
      const stamp = card.querySelector('.ticket-stamp');
      const tapHint = card.querySelector('.tap-hint');

      if (!redeemedTickets.has(ticketId)) {
        redeemedTickets.add(ticketId);
        playSynthChime(440, 'square', 0.15);

        if (tapHint) tapHint.classList.add('hidden');
        if (stamp) stamp.classList.remove('hidden');

        confetti({
          particleCount: 20,
          spread: 45,
          origin: {
            x: card.getBoundingClientRect().left / window.innerWidth,
            y: card.getBoundingClientRect().top / window.innerHeight
          },
          colors: ['#7A1C2E', '#C87D4B']
        });
      }
    });
  });

  const whatsappClaimBtn = document.getElementById('whatsapp-claim-btn');
  const shareToast = document.getElementById('share-toast');

  whatsappClaimBtn.addEventListener('click', () => {
    // Automatically redeem all tickets if not already redeemed
    ticketCards.forEach(card => {
      const ticketId = card.getAttribute('data-ticket');
      const stamp = card.querySelector('.ticket-stamp');
      const tapHint = card.querySelector('.tap-hint');
      redeemedTickets.add(ticketId);
      if (tapHint) tapHint.classList.add('hidden');
      if (stamp) stamp.classList.remove('hidden');
    });

    const message = "already opened the suprise";
    const encodedMsg = encodeURIComponent(message);

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(message).then(() => {
        shareToast.classList.remove('hidden');
        setTimeout(() => shareToast.classList.add('hidden'), 4000);
      });
    }

    // Open WhatsApp
    window.open(`https://api.whatsapp.com/send?text=${encodedMsg}`, '_blank');
  });

});
