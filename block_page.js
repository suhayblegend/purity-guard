document.addEventListener('DOMContentLoaded', function() {
    // --- DECLARE ALL DOM ELEMENTS FIRST ---
    const timerEl = document.getElementById('timer');
    const counterEl = document.getElementById('counter');
    const achievementEl = document.getElementById('achievement');
    const streakEl = document.getElementById('streak');
    const audioStatus = document.getElementById('audioStatus');
    const reminderTextEl = document.getElementById('reminderText');
    const reminderSourceEl = document.getElementById('reminderSource');
    const arabicTextEl = document.getElementById('arabicText');
    const translationTextEl = document.getElementById('translationText');
    const goalSetup = document.getElementById('goalSetup');
    const goalProgress = document.getElementById('goalProgress');
    const goalValueEl = document.getElementById('goalValue');
    const goalDecrementBtn = document.getElementById('goalDecrement');
    const goalIncrementBtn = document.getElementById('goalIncrement');
    const setGoalBtn = document.getElementById('setGoalBtn');
    const cancelGoalBtn = document.getElementById('cancelGoalBtn');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const logVictoryBtn = document.getElementById('logVictoryBtn');
    const viewJournalBtn = document.getElementById('viewJournalBtn');
    const victoryToast = document.getElementById('victoryToast');
    const debtWarning = document.getElementById('debtWarning');
    const debtAmount = document.getElementById('debtAmount');
    const payNowBtn = document.getElementById('payNowBtn');
    const remindLaterBtn = document.getElementById('remindLaterBtn');
    
    let currentGoalValue = 10;
    
    // --- READ URL PARAMS IMMEDIATELY (instant data, no race condition) ---
    const urlParams = new URLSearchParams(window.location.search);
    const streakFromUrl = parseInt(urlParams.get('streak')) || null;
    const countFromUrl = parseInt(urlParams.get('count')) || null;
    const firstVictoryFromUrl = urlParams.get('firstVictory') === 'true';
    
    console.log('📊 Stats from URL:', { streak: streakFromUrl, count: countFromUrl, firstVictory: firstVictoryFromUrl });
    
    // --- HELPER FUNCTIONS ---
    function formatNumber(num) {
        return num.toString();
    }
    
    function updateStats(count, streakCount) {
        if (counterEl) {
            counterEl.textContent = formatNumber(count);
        }

        if (streakEl) {
            streakEl.textContent = `${formatNumber(streakCount)}`;
        }

        // Rank system based on BLOCKS (not streak)
        let rank = "🌟 Pure Guardian"; // 0-9 blocks
        
        if (count >= 500) {
            rank = "⚠️ Struggling Soul";
        } else if (count >= 250) {
            rank = "😔 Frequent Faller";
        } else if (count >= 100) {
            rank = "🔄 Seeker";
        } else if (count >= 50) {
            rank = "💪 Fighter";
        } else if (count >= 25) {
            rank = "🛡️ Protected";
        } else if (count >= 10) {
            rank = "✨ Strong";
        }
        
        if (achievementEl) {
            achievementEl.textContent = rank;
        }
    }
    
    // --- CELEBRATION FUNCTION ---
    function showCelebration(customTitle = null, customMessage = null) {
        const overlay = document.getElementById('celebrationOverlay');
        const titleEl = document.querySelector('.celebration-title');
        const msgEl = document.querySelector('.celebration-subtitle');
        const canvas = document.getElementById('celebrationCanvas');
        
        if (!overlay) {
            console.error('❌ Celebration overlay not found!');
            return;
        }
        
        console.log('🎊 Showing celebration overlay!');
        
        // Get current streak for the celebration message
        const streak = streakFromUrl || 1;
        
        // Use custom title/message if provided, otherwise use default streak celebration
        let title, message;
        if (customTitle && customMessage) {
            title = customTitle;
            message = customMessage;
        } else {
            title = "🎉 First Victory!";
            message = "Congratulations! May Allah strengthen you! You just earned your first streak. This is the beginning of your journey to purity!";
        }
        
        if(titleEl) titleEl.textContent = title;
        if(msgEl) msgEl.textContent = message;
        
        overlay.style.display = 'flex';
        
        // Click to close
        overlay.onclick = () => {
            overlay.style.display = 'none';
        };

        // Auto-close after 5 seconds
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 5000);
        
        if (!canvas) return;
        
        // Simple Confetti Implementation
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        const particles = [];
        const colors = ['#fbbf24', '#10b981', '#3b82f6', '#ef4444', '#f472b6'];
        
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: Math.random() * 10 + 5,
                speed: Math.random() * 5 + 2,
                angle: Math.random() * 6.28
            });
        }
        
        function animateConfetti() {
            if (overlay.style.display === 'none') return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.y += p.speed;
                p.x += Math.sin(p.angle) * 2;
                p.angle += 0.1;
                
                if (p.y > canvas.height) {
                    p.y = -20;
                    p.x = Math.random() * canvas.width;
                }
                
                ctx.fillStyle = p.color;
                ctx.fillRect(p.x, p.y, p.size, p.size);
            });
            
            requestAnimationFrame(animateConfetti);
        }
        
        animateConfetti();
    }
    
    // If URL params exist, use them immediately (fixes "0 streak" bug)
    if (streakFromUrl !== null && countFromUrl !== null) {
        updateStats(countFromUrl, streakFromUrl);
    }
    
    // If this is a FIRST VICTORY, trigger celebration immediately
    if (firstVictoryFromUrl) {
        console.log('🎉 First Victory detected from URL - triggering celebration!');
        setTimeout(() => {
            showCelebration();
        }, 1000); // Brief delay for page to render
    }
    
    // --- APPLY THEME FIRST ---
    chrome.storage.local.get(['blockPageTheme'], function(result) {
        const theme = result.blockPageTheme || 'dark';
        
        // Remove any existing theme classes
        document.body.classList.remove('light-theme', 'islamic-theme', 'ocean-theme', 'sunset-theme', 'forest-theme', 'royal-theme', 'rose-theme');
        
        // Apply the selected theme
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'islamic') {
            document.body.classList.add('islamic-theme');
        } else if (theme === 'ocean') {
            document.body.classList.add('ocean-theme');
        } else if (theme === 'sunset') {
            document.body.classList.add('sunset-theme');
        } else if (theme === 'forest') {
            document.body.classList.add('forest-theme');
        } else if (theme === 'royal') {
            document.body.classList.add('royal-theme');
        } else if (theme === 'rose') {
            document.body.classList.add('rose-theme');
        }
        // 'dark' is the default, no class needed
        
        // --- UPDATE HERO CONTENT BASED ON THEME ---
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        
        const themeContent = {
            dark: {
                title: '🚫 You Hit A Dangerous Detour',
                subtitle: 'Pause, breathe, and step away for two minutes. Allah loves those who restrain their desires (Qur\'an 3:134).'
            },
            light: {
                title: '🚦 Slow Down & Reset',
                subtitle: 'Take two minutes to breathe and choose the better path—your future self will thank you.'
            },
            islamic: {
                title: '🕌 Guard Your Heart',
                subtitle: 'Allah loves those who restrain their anger and desires. Step away, recite a dua, and reclaim your peace.'
            },
            ocean: {
                title: '🌊 Drift Back To Calm',
                subtitle: 'Let the tide pull you toward serenity. Breathe deeply and choose the habit that honours your values.'
            },
            sunset: {
                title: '🌅 Choose Strength Now',
                subtitle: 'This decision shapes tomorrow. Pause, reset, and log the win you just earned.'
            },
            forest: {
                title: '🌲 Return To Purity',
                subtitle: 'Step away for two minutes and let your soul breathe in clean air again.'
            },
            royal: {
                title: '👑 Protect Your Dignity',
                subtitle: 'You are worth more than a fleeting impulse. Breathe, step back, and honour your crown.'
            },
            rose: {
                title: '🌹 Preserve Your Light',
                subtitle: 'Guard the beauty of your heart—pause, pray, and let this moment become a victory.'
            }
        };
        
        const content = themeContent[theme] || themeContent.dark;
        if (heroTitle) heroTitle.textContent = content.title;
        if (heroSubtitle) heroSubtitle.textContent = content.subtitle;
    });
    
    // --- COMPLETE REMINDERS LIBRARY ---
    const reminders = [
        // --- QURAN ---
        { type: 'Quran', surah: 24, ayah: 30, arabic: "قُلْ لِلْمُؤْمِنِينَ يَغُضُّوا۟ مِنْ أَبْصَـٰرِهِمْ وَيَحْفَظُوا۟ فُرُوجَهُمْ ۚ ذَٰلِكَ أَزْكَىٰ لَهُمْ ۗ إِنَّ ٱللَّهَ خَبِيرٌۢ بِمَا يَصْنَعُونَ", translation: "Tell the believing men to lower their gaze and guard their private parts. That is purer for them. Indeed, Allah is Acquainted with what they do.", source: "An-Nur 24:30" },
        { type: 'Quran', surah: 17, ayah: 32, arabic: "وَلَا تَقْرَبُوا۟ ٱلزِّنَىٰٓ ۖ إِنَّهُۥ كَانَ فَـٰحِشَةًۭ ۭ وَسَآءَ سَبِيلًۭا", translation: "And do not approach unlawful sexual intercourse. Indeed, it is ever an immorality and evil as a way.", source: "Al-Isra 17:32" },
        { type: 'Quran', surah: 17, ayah: 36, arabic: "إِنَّ ٱلسَّمْعَ وَٱلْبَصَرَ وَٱلْفُؤَادَ كُلُّ أُو۟لَـٰٓئِكَ كَانَ عَنْهُ مَسْـُٔولًۭا", translation: "Indeed, the hearing, the sight and the heart – about all those [one] will be questioned.", source: "Al-Isra 17:36" },
        { type: 'Quran', surah: 40, ayah: 19, arabic: "يَعْلَمُ خَآئِنَةَ ٱلْأَعْيُنِ وَمَا تُخْفِى ٱلصُّدُورُ", translation: "He knows the treachery of the eyes and what the breasts conceal.", source: "Ghafir 40:19" },
        { type: 'Quran', surah: 23, ayah: 5, arabic: "وَٱلَّذِينَ هُمْ لِفُرُوجِهِمْ حَـٰفِظُونَ", translation: "And they who guard their private parts.", source: "Al-Mu'minun 23:5" },
        { type: 'Quran', surah: 96, ayah: 14, arabic: "أَلَمْ يَعْلَمْ بِأَنَّ ٱللَّهَ يَرَىٰ", translation: "Does he not know that Allah sees?", source: "Al-'Alaq 96:14" },
        { type: 'Quran', surah: 23, ayah: 1, arabic: "قَدْ أَفْلَحَ ٱلْمُؤْمِنُونَ", translation: "Successful indeed are the believers.", source: "Al-Mu'minun 23:1" },
        { type: 'Quran', surah: 2, ayah: 45, arabic: "وَٱسْتَعِينُوا۟ بِٱلصَّبْرِ وَٱلصَّلَوٰةِ ۚ", translation: "Seek help through patience and prayer.", source: "Al-Baqarah 2:45" },

        // --- HADITH ---
        { type: 'Hadith', text: "The Prophet ﷺ said: 'The zina of the eyes is looking (at that which is unlawful).'", source: "Sahih al-Bukhari 6243" },
        { type: 'Hadith', text: "The Messenger of Allah ﷺ said: 'Modesty is part of faith.'", source: "Sahih al-Bukhari 24" },
        { type: 'Hadith', text: "The Prophet ﷺ said: 'Whoever guarantees me (control of) what is between his jaws and what is between his legs, I guarantee him Paradise.'", source: "Sahih al-Bukhari 6474" },
        { type: 'Hadith', text: "Jarir ibn ‘Abdullah said: I asked the Messenger of Allah ﷺ about the sudden glance, and he commanded me to turn my eyes away.", source: "Sunan Abi Dawud 2148" },
        { type: 'Hadith', text: "The Prophet ﷺ said: 'Shyness and modesty bring nothing except good.'", source: "Sahih al-Bukhari 6117" },
        { type: 'Hadith', text: "The Messenger of Allah ﷺ said: 'If you feel no shame, then do as you wish.'", source: "Sahih al-Bukhari 3483" },
        { type: 'Hadith', text: "The Prophet ﷺ said: 'The world is a prison for the believer and a paradise for the disbeliever.'", source: "Sahih Muslim 2956" }
    ];

    // --- TIMER LOGIC ---
    if (timerEl) {
        let timeLeft = 120; // 2 minutes
        
        const updateTimer = () => {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (timeLeft > 0) {
                timeLeft--;
                setTimeout(updateTimer, 1000);
            } else {
                // Auto-close the tab when timer finishes
                timerEl.textContent = "Time to reflect...";
                timerEl.style.borderColor = "#10b981";
                timerEl.style.color = "#10b981";
                
                // Close the tab after a brief moment
                setTimeout(() => {
                    window.close();
                }, 1000);
            }
        };
        
        updateTimer();
    }

    // --- AUDIO LOGIC ---
    const playAudioBtn = document.getElementById('playAudioBtn');
    const audioStatusEl = document.getElementById('audioStatus');
    const audioControlsContainer = document.querySelector('.audio-controls');
    
    // Store current reminder globally so audio button can access it
    let currentReminder = null;

    if (playAudioBtn && audioControlsContainer) {
        playAudioBtn.addEventListener('click', async () => {
            if (currentAudio && !currentAudio.paused) {
                currentAudio.pause();
                playAudioBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                if(audioStatusEl) audioStatusEl.textContent = "Paused";
                return;
            }
            
            // If we have audio but it's paused, play it
            if (currentAudio) {
                currentAudio.play();
                playAudioBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                if(audioStatusEl) audioStatusEl.textContent = "Playing...";
                return;
            }

            // Otherwise fetch new audio
            try {
                playAudioBtn.disabled = true;
                if(audioStatusEl) audioStatusEl.textContent = "Loading...";
                
                if (!currentReminder || currentReminder.type !== 'Quran') {
                    if(audioStatusEl) audioStatusEl.textContent = "Audio only for Quran verses";
                    playAudioBtn.disabled = false;
                    return;
                }

                const apiUrl = `https://api.alquran.cloud/v1/ayah/${currentReminder.surah}:${currentReminder.ayah}/ar.alafasy`;
                console.log('Fetching audio from:', apiUrl);
                
                const response = await fetch(apiUrl);
                const data = await response.json();
                
                console.log('Audio API Response:', data);
                
                if (data.code === 200 && data.data && data.data.audio) {
                    const audioUrl = data.data.audio;
                    currentAudio = new Audio(audioUrl);
                    
                    await currentAudio.play();
                    
                    playAudioBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                    if(audioStatusEl) audioStatusEl.textContent = "Playing...";
                    
                    currentAudio.onended = () => {
                        playAudioBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                        if(audioStatusEl) audioStatusEl.textContent = "Finished";
                    };
                } else {
                    if(audioStatusEl) audioStatusEl.textContent = "Audio not found";
                    console.error('Audio not in response:', data);
                }
            } catch (e) {
                console.error('Audio error:', e);
                if(audioStatusEl) audioStatusEl.textContent = "Error loading audio";
            } finally {
                playAudioBtn.disabled = false;
            }
        });
    }

    // --- DOM ELEMENT SELECTION (already declared at top) ---
    const verseArabic = document.querySelector('.verse-arabic');
    const verseTranslation = document.querySelector('.verse-translation');
    const verseSource = document.querySelector('.verse-source');
    const messagePartnerBtn = document.getElementById('messagePartnerBtn');
    const victoryCelebrationEl = document.getElementById('victoryCelebration');

    function openOptionsSection(hash = '') {
        try {
            const targetUrl = chrome.runtime.getURL('options.html' + (hash || ''));
            chrome.tabs.create({ url: targetUrl });
        } catch (error) {
            console.warn('Could not open options page:', error && error.message ? error.message : error);
            window.open(chrome.runtime.getURL('options.html' + (hash || '')));
        }
    }

    if (victoryCelebrationEl) {
        victoryCelebrationEl.innerHTML = '';
    }

    if (victoryToast) {
        victoryToast.style.display = 'none';
    }

    if (logVictoryBtn) {
        const originalVictoryText = logVictoryBtn.textContent;
        logVictoryBtn.addEventListener('click', async () => {
            if (!victoryLogged) {
                logVictoryBtn.disabled = true;
                logVictoryBtn.textContent = 'Logging your victory...';

                try {
                    await registerVictory();
                    victoryLogged = true;
                    logVictoryBtn.disabled = false;
                    logVictoryBtn.textContent = '✅ Victory Logged!';
                    logVictoryBtn.classList.remove('btn-outline');
                    logVictoryBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                    
                    // Show celebration animation when logging victory!
                    showCelebration(
                        "🎊 Victory Logged!",
                        "May Allah make this the first of many victories! Keep your streak alive!"
                    );
                } catch (error) {
                    console.error('Could not log victory:', error);
                    logVictoryBtn.disabled = false;
                    logVictoryBtn.textContent = originalVictoryText;
                }
                return;
            }

            openOptionsSection('#victory');
        });
    }
    
    if (viewJournalBtn) {
        viewJournalBtn.addEventListener('click', () => {
            // Open options page with hash to auto-open Victory Journal
            const targetUrl = chrome.runtime.getURL('options.html#victory-journal');
            chrome.tabs.create({ url: targetUrl });
        });
    }

    if (messagePartnerBtn) {
        messagePartnerBtn.addEventListener('click', () => openOptionsSection('#accountability'));
    }

    let currentAudio = null;
    let currentAudioKey = null;
    let pendingAudioInteractionHandler = null;
    let victoryLogged = false;
    let verseChangeInterval = null;
    let currentReminderIndex = 0;
    let filteredRemindersGlobal = [];
    let victoryToastTimer = null;
    const CONFETTI_COLORS = ['#38bdf8', '#f97316', '#22c55e', '#facc15', '#ec4899', '#a855f7'];
    const numberFormatter = new Intl.NumberFormat();

    // Stop any existing audio
    function stopCurrentAudio() {
        if (currentAudio) {
            try {
                currentAudio.pause();
                currentAudio.currentTime = 0;
                currentAudio = null;
            } catch (e) {
                console.log('Error stopping audio:', e);
            }
        }
    }

    function formatNumber(value) {
        try {
            return numberFormatter.format(value);
        } catch (error) {
            return String(value);
        }
    }

    // --- CORE LOGIC FUNCTIONS ---
    function setRandomReminder(autoplay = true) {
        // Stop any previous audio before loading new reminder
        stopCurrentAudio();
        
        chrome.storage.local.get(['reminderType', 'enableAudio', 'autoplayAudio'], function(result) {
            const reminderType = result.reminderType || 'both'; // 'quran', 'hadith', or 'both'
            const enableAudio = result.enableAudio !== false; // default true
            const autoplayAudio = result.autoplayAudio !== false; // default true (autoplay enabled)
            
            filteredRemindersGlobal = reminders;
            if (reminderType === 'quran') {
                filteredRemindersGlobal = reminders.filter(r => r.type === 'Quran');
            } else if (reminderType === 'hadith') {
                filteredRemindersGlobal = reminders.filter(r => r.type === 'Hadith');
            }
            
            const randomReminder = filteredRemindersGlobal[Math.floor(Math.random() * filteredRemindersGlobal.length)];
            currentReminder = randomReminder; // Store globally for audio button
            
            // Add fade-out effect
            verseArabic.style.opacity = '0';
            verseTranslation.style.opacity = '0';
            verseSource.style.opacity = '0';
            
            setTimeout(() => {
                // Display reminder
                if (randomReminder.arabic) {
                    verseArabic.textContent = randomReminder.arabic;
                    verseArabic.style.display = 'block';
                } else {
                    verseArabic.style.display = 'none';
                }
                
                verseTranslation.textContent = randomReminder.translation || randomReminder.text;
                verseSource.textContent = `— ${randomReminder.source}`;
                
                // Fade-in effect
                verseArabic.style.opacity = '1';
                verseTranslation.style.opacity = '1';
                verseSource.style.opacity = '1';
                
                // Setup audio controls and AUTOPLAY
                const audioControls = document.querySelector('.audio-controls');
                if (audioControls) {
                    if (enableAudio && randomReminder.type === 'Quran') {
                        audioControls.style.display = 'flex';
                        console.log('Audio controls shown for verse:', randomReminder.surah + ':' + randomReminder.ayah);
                        
                        // AUTOPLAY THE AUDIO IF ENABLED
                        if (autoplay && autoplayAudio) {
                            console.log('🎵 Attempting autoplay...');
                            setTimeout(async () => {
                                try {
                                    if (playAudioBtn && audioStatusEl) {
                                        audioStatusEl.textContent = "Loading audio...";
                                        
                                        const apiUrl = `https://api.alquran.cloud/v1/ayah/${randomReminder.surah}:${randomReminder.ayah}/ar.alafasy`;
                                        console.log('Fetching audio from:', apiUrl);
                                        
                                        const response = await fetch(apiUrl);
                                        const data = await response.json();
                                        
                                        if (data.code === 200 && data.data && data.data.audio) {
                                            const audioUrl = data.data.audio;
                                            currentAudio = new Audio(audioUrl);
                                            
                                            await currentAudio.play();
                                            
                                            playAudioBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';
                                            audioStatusEl.textContent = "Playing...";
                                            console.log('✅ Autoplay started!');
                                            
                                            currentAudio.onended = () => {
                                                playAudioBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
                                                audioStatusEl.textContent = "Finished";
                                            };
                                        } else {
                                            audioStatusEl.textContent = "";
                                            console.error('Audio not in response:', data);
                                        }
                                    }
                                } catch (e) {
                                    // Silently fail autoplay (browser blocked it)
                                    if (audioStatusEl) audioStatusEl.textContent = "";
                                }
                            }, 500); // Small delay to ensure DOM is ready
                        }
                    } else {
                        audioControls.style.display = 'none';
                        if (currentAudio) {
                            currentAudio.pause();
                            currentAudio = null;
                        }
                    }
                }
            }, 300);
        });
    }
    
    // Function to start automatic verse rotation
    function startVerseRotation() {
        // Change verse every 30 seconds
        verseChangeInterval = setInterval(() => {
            console.log('🔄 Auto-changing verse...');
            setRandomReminder(true); // Auto-play each new verse
        }, 30000); // 30 seconds
    }
    
    // Function to stop verse rotation
    function stopVerseRotation() {
        if (verseChangeInterval) {
            clearInterval(verseChangeInterval);
            verseChangeInterval = null;
        }
    }
    
    function registerVictory() {
        if (!victoryToast) {
            return Promise.resolve(false);
        }

        const blockedTarget = new URLSearchParams(window.location.search).get('blocked') || '';
        const now = Date.now();

        return new Promise((resolve) => {
            chrome.storage.local.get(['victoryLog'], (result) => {
                const victoryLog = Array.isArray(result.victoryLog) ? result.victoryLog : [];

                let shouldPersist = true;
                if (victoryLog.length > 0) {
                    const lastEntry = victoryLog[0];
                    // Check if this exact URL was logged in the last 5 minutes (prevents duplicates)
                    if (lastEntry && lastEntry.blockedUrl === blockedTarget && lastEntry.timestamp) {
                        const lastTime = Date.parse(lastEntry.timestamp);
                        if (!Number.isNaN(lastTime) && now - lastTime < 300000) { // 5 minutes = 300000ms
                            shouldPersist = false;
                        }
                    }
                }

                const completeCelebration = () => {
                    showVictoryToast();
                    triggerVictoryCelebration();
                };

                if (shouldPersist) {
                    const entry = {
                        timestamp: new Date(now).toISOString(),
                        blockedUrl: blockedTarget,
                        userNote: null
                    };

                    const updatedLog = [entry, ...victoryLog].slice(0, 50);
                    chrome.storage.local.set({ victoryLog: updatedLog }, () => {
                        completeCelebration();
                        resolve(true);
                    });
                } else {
                    // Already logged recently - don't add duplicate
                    completeCelebration();
                    resolve(false);
                }
            });
        });
    }

    function showVictoryToast() {
        if (!victoryToast) {
            return;
        }

        if (victoryToastTimer) {
            clearTimeout(victoryToastTimer);
        }

        victoryToast.style.display = 'block';
        victoryToastTimer = setTimeout(() => {
            victoryToast.style.display = 'none';
            victoryToastTimer = null;
        }, 6000);
    }

    function triggerVictoryCelebration() {
        if (!victoryCelebrationEl) {
            return;
        }

        const fragment = document.createDocumentFragment();
        const confettiCount = 30;
        for (let i = 0; i < confettiCount; i += 1) {
            const piece = document.createElement('div');
            piece.className = 'confetti-piece';
            const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.2;
            const duration = 1.4 + Math.random() * 0.8;

            piece.style.left = `${left}vw`;
            piece.style.animationDelay = `${delay}s`;
            piece.style.setProperty('--confetti-color', color);
            piece.style.setProperty('--confetti-duration', `${duration}s`);
            piece.style.transform = `translateY(-20px) rotate(${Math.random() * 45}deg)`;

            piece.addEventListener('animationend', () => {
                piece.remove();
            });

            fragment.appendChild(piece);
        }

        victoryCelebrationEl.appendChild(fragment);

        setTimeout(() => {
            victoryCelebrationEl.innerHTML = '';
        }, 2200);
    }

    async function setupAudioControls(reminder, autoplayAudio = true) {
        const audioControls = document.querySelector('.audio-controls');
        const audioStatus = document.getElementById('audioStatus');

        if (!(audioControls && audioStatus)) {
            return;
        }

        if (!reminder.surah || !reminder.ayah) {
            audioControls.style.display = 'none';
            return;
        }

        audioControls.style.display = 'flex';

        const apiUrl = `https://api.alquran.cloud/v1/ayah/${reminder.surah}:${reminder.ayah}/ar.alafasy`;
        const ayahKey = `${reminder.surah}:${reminder.ayah}`;

        if (currentAudio && currentAudioKey !== ayahKey) {
            currentAudio.pause();
            currentAudio = null;
            currentAudioKey = null;
        }

        const clearInteractionListener = () => {
            if (!pendingAudioInteractionHandler) {
                return;
            }

            document.removeEventListener('pointerdown', pendingAudioInteractionHandler, true);
            document.removeEventListener('keydown', pendingAudioInteractionHandler, true);
            pendingAudioInteractionHandler = null;
        };

        const armInteractionListener = () => {
            if (pendingAudioInteractionHandler) {
                return;
            }

            pendingAudioInteractionHandler = () => {
                clearInteractionListener();
                startPlayback('interaction');
            };

            document.addEventListener('pointerdown', pendingAudioInteractionHandler, { once: true, capture: true });
            document.addEventListener('keydown', pendingAudioInteractionHandler, { once: true, capture: true });
        };

        clearInteractionListener();

        const loadAudio = async () => {
            if (currentAudio && currentAudioKey === ayahKey) {
                return currentAudio;
            }

            const response = await fetch(apiUrl, { cache: 'no-store' });
            if (!response.ok) {
                throw new Error(`http-${response.status}`);
            }

            const data = await response.json();

            if (data.code === 200 && data.data && data.data.audio) {
                const audioUrl = data.data.audio;

                if (currentAudio) {
                    currentAudio.pause();
                }

                currentAudio = new Audio(audioUrl);
                currentAudioKey = ayahKey;

                currentAudio.preload = 'auto';

                currentAudio.onended = () => {
                    audioStatus.textContent = 'Recitation finished.';
                    clearInteractionListener();
                };

                currentAudio.onerror = () => {
                    audioStatus.textContent = 'Audio unavailable right now.';
                    console.error('Audio playback error');
                    clearInteractionListener();
                };

                return currentAudio;
            }

            throw new Error('no-audio');
        };

        const startPlayback = async (source = 'auto') => {
            try {
                audioStatus.textContent = 'Loading recitation...';

                const audio = await loadAudio();
                const playPromise = audio.play();
                if (playPromise && typeof playPromise.then === 'function') {
                    await playPromise;
                }

                audioStatus.textContent = 'Recitation playing...';
                clearInteractionListener();
            } catch (error) {
                if (error && (error.name === 'NotAllowedError' || error.name === 'AbortError')) {
                    audioStatus.textContent = 'Tap anywhere on the page to allow the recitation.';
                    armInteractionListener();
                } else if (error && error.message === 'no-audio') {
                    audioStatus.textContent = 'Audio not available for this verse.';
                    currentAudio = null;
                    currentAudioKey = null;
                    clearInteractionListener();
                } else {
                    audioStatus.textContent = 'Audio unavailable. Try again shortly.';
                    currentAudio = null;
                    currentAudioKey = null;
                    console.error('Error fetching audio:', error);
                    clearInteractionListener();
                }
            }
        };

        audioStatus.textContent = 'Preparing your recitation...';

        if (autoplayAudio) {
            setTimeout(() => {
                startPlayback('auto');
            }, 400);
        }
    }

    function updateGoalUI(goalData) {
        if (!goalSetup || !goalProgress || !progressText || !progressBar) return;
        
        if (goalData && goalData.limit !== undefined) {
            goalSetup.style.display = 'none';
            goalProgress.style.display = 'block';
            const progress = goalData.count || 0;
            const limit = goalData.limit;
            const percentage = limit > 0 ? Math.min((progress / limit) * 100, 100) : 0;
            progressText.textContent = `Redirected ${progress} out of your ${limit} time goal.`;
            progressBar.style.width = `${percentage}%`;
            progressBar.classList.toggle('bg-red-500', percentage >= 100);
            progressBar.classList.toggle('bg-green-500', percentage < 100);
        } else {
            goalSetup.style.display = 'block';
            goalProgress.style.display = 'none';
        }
    }
    
    // --- INITIALIZATION & EVENT LISTENERS ---
    setRandomReminder(true); // Start with autoplay
    startVerseRotation(); // Start automatic verse rotation
    
    // Only init goal UI if elements exist
    if (goalValueEl) {
        goalValueEl.textContent = currentGoalValue;
    }
    if (goalDecrementBtn) {
        goalDecrementBtn.disabled = currentGoalValue === 1;
    }

    // FALLBACK: Load from storage only if URL params didn't provide data
    if (streakFromUrl === null || countFromUrl === null) {
        chrome.storage.local.get(['blockCount', 'monthlyGoal', 'streak'], function(result) {
            const count = result.blockCount || 0;
            // Force 1 if streak is 0 or missing (matches the new victory logic)
            let streakData = result.streak;
            if (!streakData || !streakData.count || streakData.count === 0) {
                streakData = { count: 1, lastUpdate: new Date().toDateString(), longestStreak: 1 };
                // Save the corrected streak back to storage
                chrome.storage.local.set({ streak: streakData });
            }
            const streakCount = streakData.count;
            updateStats(count, streakCount);
            updateGoalUI(result.monthlyGoal);
        });
    } else {
        // URL params provided stats, just load goal UI from storage
        chrome.storage.local.get(['monthlyGoal'], function(result) {
            updateGoalUI(result.monthlyGoal);
        });
    }

    if (goalDecrementBtn) {
        goalDecrementBtn.addEventListener('click', () => {
            if (currentGoalValue > 1) {
                currentGoalValue--;
                if (goalValueEl) goalValueEl.textContent = currentGoalValue;
                if (goalDecrementBtn) goalDecrementBtn.disabled = currentGoalValue === 1;
            }
        });
    }

    if (goalIncrementBtn) {
        goalIncrementBtn.addEventListener('click', () => {
            currentGoalValue++;
            if (goalValueEl) goalValueEl.textContent = currentGoalValue;
            if (goalDecrementBtn) goalDecrementBtn.disabled = false;
        });
    }

    if (setGoalBtn) {
        setGoalBtn.addEventListener('click', () => {
            const limit = currentGoalValue;
            chrome.storage.local.get('monthlyGoal', function(result) {
                const currentMonth = new Date().getMonth();
                const existingGoal = result.monthlyGoal;
                let currentCount = 0;

                if (existingGoal && existingGoal.month === currentMonth) {
                    currentCount = existingGoal.count || 0;
                }

                const goalData = { limit: limit, count: currentCount, month: currentMonth };
                chrome.storage.local.set({ monthlyGoal: goalData }, () => {
                    updateGoalUI(goalData);
                });
            });
        });
    }
    
    if (cancelGoalBtn) {
        cancelGoalBtn.addEventListener('click', () => {
            chrome.storage.local.remove('monthlyGoal', () => {
                updateGoalUI(null);
            });
        });
    }
    
    // --- SADAQAH DEBT WARNING ---
    // Check if user has enabled Sadaqah and owes money
    chrome.storage.local.get(['enableSadaqah', 'sadaqahOwed'], function(result) {
        const isSadaqahEnabled = result.enableSadaqah === true;
        const amountOwed = result.sadaqahOwed || 0;
        
        console.log('💰 Sadaqah Check:', { enabled: isSadaqahEnabled, owed: amountOwed });
        
        if (isSadaqahEnabled && amountOwed > 0 && debtWarning && debtAmount) {
            // Show the debt warning
            debtWarning.classList.remove('hidden');
            debtAmount.textContent = `$${amountOwed.toFixed(2)}`;
            
            // "Pay Now" button - open Sadaqah Tracker page
            if (payNowBtn) {
                payNowBtn.addEventListener('click', () => {
                    chrome.tabs.create({ url: chrome.runtime.getURL('sadaqah_tracker.html') });
                });
            }
            
            // "Remind Later" button - just hide the warning
            if (remindLaterBtn) {
                remindLaterBtn.addEventListener('click', () => {
                    debtWarning.classList.add('hidden');
                });
            }
        }
    });
    
    // Note: Celebration is now triggered directly from URL params (firstVictory=true)
    // No need for separate storage check - this eliminates race conditions
});