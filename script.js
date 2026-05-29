// --- STATE MANAGEMENT ---
let appState = {
    currentCourseId: null,
    currentLessonId: null,
    progress: {} // { 'lesson-id': true/false }
};

// Elements
const DOM = {
    courseList: document.getElementById('course-list'),
    playlistItems: document.getElementById('playlist-items'),
    mainVideo: document.getElementById('main-video'),
    currentCourseTitle: document.getElementById('current-course-title'),
    currentLessonTitle: document.getElementById('current-lesson-title'),
    currentCourseName: document.getElementById('current-course-name'),
    lessonCount: document.getElementById('lesson-count'),
    overallProgress: document.getElementById('overall-progress'),
    overallProgressText: document.getElementById('overall-progress-text'),
    searchInput: document.getElementById('search-input'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    sidebar: document.getElementById('sidebar'),
    loadingOverlay: document.getElementById('loading-overlay'),
    markCompletedBtn: document.getElementById('mark-completed-btn'),
    // Custom player elements
    playerWrapper: document.getElementById('player-wrapper'),
    seekBar: document.getElementById('seek-bar'),
    seekBarWrapper: document.querySelector('.seek-bar-wrapper'),
    seekProgress: document.getElementById('seek-progress'),
    seekBuffered: document.getElementById('seek-buffered'),
    seekHandle: document.getElementById('seek-handle'),
    ctrlPlay: document.getElementById('ctrl-play'),
    ctrlPrev: document.getElementById('ctrl-prev'),
    ctrlNext: document.getElementById('ctrl-next'),
    ctrlMute: document.getElementById('ctrl-mute'),
    ctrlSpeed: document.getElementById('ctrl-speed'),
    ctrlFullscreen: document.getElementById('ctrl-fullscreen'),
    volumeSlider: document.getElementById('volume-slider'),
    timeDisplay: document.getElementById('time-display'),
    seekThumbnail: document.getElementById('seek-thumbnail'),
    seekThumbCanvas: document.getElementById('seek-thumb-canvas'),
    seekTimeLabel: document.getElementById('seek-time-label'),
};

// --- INITIALIZATION ---
function init() {
    loadState();
    renderCourses();
    setupEventListeners();
    
    if (appState.currentCourseId) {
        selectCourse(appState.currentCourseId, appState.currentLessonId);
    } else if (coursesData.length > 0) {
        selectCourse(coursesData[0].id);
    }
    
    updateOverallProgress();
}

function loadState() {
    const saved = localStorage.getItem('localSchoolState');
    if (saved) {
        appState = JSON.parse(saved);
    }
    if (!appState.progress) appState.progress = {};
}

function saveState() {
    localStorage.setItem('localSchoolState', JSON.stringify(appState));
    updateOverallProgress();
}

// --- RENDER FUNCTIONS ---
function renderCourses() {
    DOM.courseList.innerHTML = '';
    coursesData.forEach(course => {
        const li = document.createElement('li');
        li.className = `course-item ${appState.currentCourseId === course.id ? 'active' : ''}`;
        li.innerHTML = `
            <i class='${course.icon}' style='color: ${course.color}'></i>
            <span>${course.title}</span>
        `;
        li.onclick = () => selectCourse(course.id);
        DOM.courseList.appendChild(li);
    });
}

function selectCourse(courseId, lessonIdToSelect = null) {
    appState.currentCourseId = courseId;
    saveState();
    
    // Update UI active state
    renderCourses();
    
    const course = coursesData.find(c => c.id === courseId);
    if (!course) return;
    
    DOM.currentCourseTitle.textContent = course.title;
    DOM.lessonCount.textContent = `${course.lessons.length} Lessons`;
    
    renderPlaylist(course.lessons, course);
    
    if (lessonIdToSelect) {
        selectLesson(courseId, lessonIdToSelect);
    } else if (course.lessons.length > 0) {
        // Try to find first uncompleted lesson
        const uncompleted = course.lessons.find(l => !appState.progress[l.id]);
        selectLesson(courseId, uncompleted ? uncompleted.id : course.lessons[0].id);
    }
    
    // Close mobile sidebar on selection
    DOM.sidebar.classList.remove('open');
}

function renderPlaylist(lessons, course, searchTerm = '') {
    DOM.playlistItems.innerHTML = '';
    
    const filteredLessons = lessons.filter(l => 
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    if (filteredLessons.length === 0) {
        DOM.playlistItems.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-search-alt-2'></i>
                <p>No lessons found</p>
            </div>
        `;
        return;
    }
    
    filteredLessons.forEach(lesson => {
        const isCompleted = appState.progress[lesson.id];
        const isActive = appState.currentLessonId === lesson.id;
        
        const div = document.createElement('div');
        div.className = `lesson-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`;
        div.innerHTML = `
            <div class="lesson-status">
                <i class='bx ${isCompleted ? 'bx-check-circle' : isActive ? 'bx-play-circle' : 'bx-circle'}'></i>
            </div>
            <div class="lesson-details">
                <h4 class="lesson-title">${lesson.title}</h4>
                <div class="lesson-meta">
                    <i class='bx bx-time-five'></i>
                    <span>${lesson.duration}</span>
                </div>
            </div>
        `;
        div.onclick = () => selectLesson(course.id, lesson.id);
        DOM.playlistItems.appendChild(div);
    });
}

function selectLesson(courseId, lessonId) {
    appState.currentCourseId = courseId;
    appState.currentLessonId = lessonId;
    saveState();
    
    const course = coursesData.find(c => c.id === courseId);
    const lesson = course.lessons.find(l => l.id === lessonId);
    if (!lesson) return;
    
    // Update Header Info
    DOM.currentLessonTitle.textContent = lesson.title;
    DOM.currentCourseName.textContent = course.title;
    
    // Update Video Source
    const videoSrc = `${course.folder}/${lesson.file}`;
    DOM.mainVideo.src = videoSrc;
    DOM.loadingOverlay.style.display = 'flex';
    DOM.mainVideo.load();
    
    // Automatically play if not first load
    DOM.mainVideo.play().catch(e => console.log("Autoplay prevented or missing file:", e));
    
    // Update Playlist UI
    renderPlaylist(course.lessons, course, DOM.searchInput.value);
    
    // Update Completed Button
    updateCompletedButton(lessonId);
}

function updateCompletedButton(lessonId) {
    const isCompleted = appState.progress[lessonId];
    if (isCompleted) {
        DOM.markCompletedBtn.classList.add('is-completed');
        DOM.markCompletedBtn.innerHTML = "<i class='bx bx-check-circle'></i> Completed";
    } else {
        DOM.markCompletedBtn.classList.remove('is-completed');
        DOM.markCompletedBtn.innerHTML = "<i class='bx bx-circle'></i> Mark Completed";
    }
}

function toggleLessonCompleted() {
    if (!appState.currentLessonId) return;
    
    const isCompleted = appState.progress[appState.currentLessonId];
    appState.progress[appState.currentLessonId] = !isCompleted;
    saveState();
    
    updateCompletedButton(appState.currentLessonId);
    
    const course = coursesData.find(c => c.id === appState.currentCourseId);
    renderPlaylist(course.lessons, course, DOM.searchInput.value);
}

// --- VIDEO LOGIC ---
function playNextLesson() {
    if (!appState.currentCourseId || !appState.currentLessonId) return;
    
    const course = coursesData.find(c => c.id === appState.currentCourseId);
    const currentIndex = course.lessons.findIndex(l => l.id === appState.currentLessonId);
    
    if (currentIndex < course.lessons.length - 1) {
        selectLesson(course.id, course.lessons[currentIndex + 1].id);
    }
}

function playPrevLesson() {
    if (!appState.currentCourseId || !appState.currentLessonId) return;
    
    const course = coursesData.find(c => c.id === appState.currentCourseId);
    const currentIndex = course.lessons.findIndex(l => l.id === appState.currentLessonId);
    
    if (currentIndex > 0) {
        selectLesson(course.id, course.lessons[currentIndex - 1].id);
    }
}

// --- PROGRESS TRACKING ---
function updateOverallProgress() {
    let totalLessons = 0;
    let completedLessons = 0;
    
    coursesData.forEach(course => {
        totalLessons += course.lessons.length;
        course.lessons.forEach(lesson => {
            if (appState.progress[lesson.id]) completedLessons++;
        });
    });
    
    const percentage = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
    
    DOM.overallProgress.style.width = `${percentage}%`;
    DOM.overallProgressText.textContent = `${percentage}% Completed`;
}

// --- EVENT LISTENERS ---
function setupEventListeners() {
    // Video Events
    DOM.mainVideo.addEventListener('canplay', () => {
        DOM.loadingOverlay.style.display = 'none';
        updateTimeDisplay();
    });
    
    DOM.mainVideo.addEventListener('ended', () => {
        appState.progress[appState.currentLessonId] = true;
        saveState();
        updateCompletedButton(appState.currentLessonId);
        updatePlayBtn(true);
        playNextLesson();
    });

    DOM.mainVideo.addEventListener('error', () => {
        DOM.loadingOverlay.style.display = 'none';
        console.warn("Video failed to load. Ensure file exists:", DOM.mainVideo.src);
    });

    // timeupdate → update seek bar & time display
    DOM.mainVideo.addEventListener('timeupdate', () => {
        const pct = DOM.mainVideo.duration
            ? (DOM.mainVideo.currentTime / DOM.mainVideo.duration) * 100
            : 0;
        DOM.seekProgress.style.width = pct + '%';
        DOM.seekHandle.style.left = pct + '%';
        updateTimeDisplay();
    });

    // progress → update buffered bar
    DOM.mainVideo.addEventListener('progress', updateBuffered);

    // play / pause → update button icon
    DOM.mainVideo.addEventListener('play', () => updatePlayBtn(false));
    DOM.mainVideo.addEventListener('pause', () => updatePlayBtn(true));

    // Mark completed button
    DOM.markCompletedBtn.addEventListener('click', toggleLessonCompleted);
    
    // Search logic
    DOM.searchInput.addEventListener('input', (e) => {
        const course = coursesData.find(c => c.id === appState.currentCourseId);
        if (course) renderPlaylist(course.lessons, course, e.target.value);
    });
    
    // Mobile menu toggle
    DOM.mobileMenuBtn.addEventListener('click', () => {
        DOM.sidebar.classList.toggle('open');
    });

    // ---- AUTO-HIDE CONTROLS ----
    let hideControlsTimer = null;

    function showControls() {
        DOM.playerWrapper.classList.add('controls-visible');
        clearTimeout(hideControlsTimer);
    }

    function hideControls() {
        DOM.playerWrapper.classList.remove('controls-visible');
    }

    function scheduleHideControls() {
        clearTimeout(hideControlsTimer);
        if (!DOM.mainVideo.paused) {
            hideControlsTimer = setTimeout(hideControls, 2000);
        }
    }

    // Start with controls visible (before first play)
    showControls();

    // Show on any mouse activity inside player, then auto-hide
    DOM.playerWrapper.addEventListener('mousemove', () => {
        showControls();
        scheduleHideControls();
    });

    // When mouse leaves: hide immediately if video is playing
    DOM.playerWrapper.addEventListener('mouseleave', () => {
        clearTimeout(hideControlsTimer);
        if (!DOM.mainVideo.paused) hideControls();
    });

    // Video plays → schedule hide; paused → always show
    DOM.mainVideo.addEventListener('play', () => {
        scheduleHideControls();
    });
    DOM.mainVideo.addEventListener('pause', () => {
        clearTimeout(hideControlsTimer);
        showControls();
    });

    // ---- CUSTOM CONTROLS ----

    // Play / Pause button
    DOM.ctrlPlay.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlayPause();
        scheduleHideControls();
    });

    // Single click = play/pause | Double click = fullscreen
    let clickTimer = null;
    DOM.playerWrapper.addEventListener('click', (e) => {
        if (e.target.closest('.custom-controls')) return;
        clearTimeout(clickTimer);
        clickTimer = setTimeout(() => {
            togglePlayPause();
        }, 220);
    });
    DOM.playerWrapper.addEventListener('dblclick', (e) => {
        if (e.target.closest('.custom-controls')) return;
        clearTimeout(clickTimer); // cancel the single-click play/pause
        toggleFullscreen();
    });

    // Prev / Next
    DOM.ctrlPrev.addEventListener('click', (e) => { e.stopPropagation(); playPrevLesson(); });
    DOM.ctrlNext.addEventListener('click', (e) => { e.stopPropagation(); playNextLesson(); });

    // Mute button
    DOM.ctrlMute.addEventListener('click', (e) => {
        e.stopPropagation();
        DOM.mainVideo.muted = !DOM.mainVideo.muted;
        DOM.volumeSlider.value = DOM.mainVideo.muted ? 0 : DOM.mainVideo.volume;
        updateMuteIcon();
    });

    // Volume slider
    DOM.volumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        DOM.mainVideo.volume = parseFloat(e.target.value);
        DOM.mainVideo.muted = DOM.mainVideo.volume === 0;
        updateMuteIcon();
    });

    // Speed button
    const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
    let speedIdx = 2; // default 1x
    DOM.ctrlSpeed.addEventListener('click', (e) => {
        e.stopPropagation();
        speedIdx = (speedIdx + 1) % speeds.length;
        DOM.mainVideo.playbackRate = speeds[speedIdx];
        DOM.ctrlSpeed.textContent = speeds[speedIdx] + 'x';
    });

    // Fullscreen button
    DOM.ctrlFullscreen.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
    });
    document.addEventListener('fullscreenchange', () => {
        const isFs = !!document.fullscreenElement;
        DOM.ctrlFullscreen.innerHTML = isFs
            ? "<i class='bx bx-exit-fullscreen'></i>"
            : "<i class='bx bx-fullscreen'></i>";
        // Re-show controls briefly when entering/exiting fullscreen
        showControls();
        scheduleHideControls();
    });

    // ---- SEEK BAR + THUMBNAIL PREVIEW ----
    // Hidden offscreen video clone for thumbnail capture
    const thumbVideo = document.createElement('video');
    thumbVideo.src = '';
    thumbVideo.muted = true;
    thumbVideo.preload = 'auto';
    thumbVideo.style.display = 'none';
    document.body.appendChild(thumbVideo);
    const thumbCtx = DOM.seekThumbCanvas.getContext('2d');
    DOM.seekThumbCanvas.width = 320;
    DOM.seekThumbCanvas.height = 180;

    // Keep thumb video in sync with current source
    DOM.mainVideo.addEventListener('loadstart', () => {
        thumbVideo.src = DOM.mainVideo.src;
    });

    let isSeeking = false;

    function getSeekTime(e) {
        const rect = DOM.seekBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        return (x / rect.width) * (DOM.mainVideo.duration || 0);
    }

    function getPctFromEvent(e) {
        const rect = DOM.seekBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        return x / rect.width;
    }

    function showThumbnail(e) {
        if (!DOM.mainVideo.duration) return;

        const rect = DOM.seekBar.getBoundingClientRect();
        const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
        const pct = x / rect.width;
        const seekTime = pct * DOM.mainVideo.duration;

        // Position thumbnail above the hovered spot (clamped to player bounds)
        const playerRect = DOM.playerWrapper.getBoundingClientRect();
        const thumbWidth = 160; // matches CSS width
        const relX = e.clientX - playerRect.left;
        const clampedLeft = Math.max(thumbWidth / 2, Math.min(playerRect.width - thumbWidth / 2, relX));
        DOM.seekThumbnail.style.left = clampedLeft + 'px';

        // Show time label immediately
        DOM.seekTimeLabel.textContent = formatTime(seekTime);
        DOM.seekThumbnail.classList.add('visible');

        // Seek thumb video and capture frame
        thumbVideo.currentTime = seekTime;
    }

    thumbVideo.addEventListener('seeked', () => {
        try {
            thumbCtx.drawImage(thumbVideo, 0, 0, 320, 180);
        } catch(err) {
            // Cross-origin or decode error – silently ignore
        }
    });

    DOM.seekBarWrapper.addEventListener('mousemove', showThumbnail);
    DOM.seekBarWrapper.addEventListener('mouseleave', () => {
        DOM.seekThumbnail.classList.remove('visible');
    });

    // Seek on click
    DOM.seekBarWrapper.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isSeeking = true;
        const t = getSeekTime(e);
        DOM.mainVideo.currentTime = t;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isSeeking) return;
        const t = getSeekTime(e);
        DOM.mainVideo.currentTime = t;
        const pct = getPctFromEvent(e) * 100;
        DOM.seekProgress.style.width = pct + '%';
        DOM.seekHandle.style.left = pct + '%';
    });

    document.addEventListener('mouseup', () => { isSeeking = false; });

    // ---- KEYBOARD SHORTCUTS ----
    document.addEventListener('keydown', (e) => {
        if (document.activeElement === DOM.searchInput) return;
        switch(e.code) {
            case 'Space':
                e.preventDefault();
                showControls();
                togglePlayPause();
                scheduleHideControls();
                break;
            case 'ArrowRight':
                e.preventDefault();
                showControls();
                DOM.mainVideo.currentTime = Math.min(DOM.mainVideo.duration || 0, DOM.mainVideo.currentTime + 5);
                scheduleHideControls();
                break;
            case 'ArrowLeft':
                e.preventDefault();
                showControls();
                DOM.mainVideo.currentTime = Math.max(0, DOM.mainVideo.currentTime - 5);
                scheduleHideControls();
                break;
            case 'KeyM':
                DOM.mainVideo.muted = !DOM.mainVideo.muted;
                DOM.volumeSlider.value = DOM.mainVideo.muted ? 0 : DOM.mainVideo.volume;
                updateMuteIcon();
                break;
            case 'KeyF':
                toggleFullscreen();
                break;
        }
    });
}

// ---- PLAYER HELPERS ----
function togglePlayPause() {
    if (DOM.mainVideo.paused) DOM.mainVideo.play();
    else DOM.mainVideo.pause();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        DOM.playerWrapper.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function updatePlayBtn(isPaused) {
    DOM.ctrlPlay.innerHTML = isPaused
        ? "<i class='bx bx-play'></i>"
        : "<i class='bx bx-pause'></i>";
}

function updateMuteIcon() {
    const vol = DOM.mainVideo.volume;
    const muted = DOM.mainVideo.muted || vol === 0;
    DOM.ctrlMute.innerHTML = muted
        ? "<i class='bx bx-volume-mute'></i>"
        : vol < 0.5
            ? "<i class='bx bx-volume-low'></i>"
            : "<i class='bx bx-volume-full'></i>";
}

function updateTimeDisplay() {
    const cur = DOM.mainVideo.currentTime || 0;
    const dur = DOM.mainVideo.duration || 0;
    DOM.timeDisplay.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
}

function updateBuffered() {
    const video = DOM.mainVideo;
    if (!video.buffered.length || !video.duration) return;
    const end = video.buffered.end(video.buffered.length - 1);
    DOM.seekBuffered.style.width = (end / video.duration * 100) + '%';
}

function formatTime(secs) {
    if (isNaN(secs) || !isFinite(secs)) return '0:00';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
}

// Boot up
document.addEventListener('DOMContentLoaded', init);
