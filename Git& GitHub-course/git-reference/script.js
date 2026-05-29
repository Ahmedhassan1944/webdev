document.addEventListener('DOMContentLoaded', () => {
  /* =========================================
     1. Particles System
     ========================================= */
  const particlesContainer = document.getElementById('particles-bg');
  const colors = ['#00f5ff', '#3b82f6', '#8b5cf6'];
  const particleCount = 60;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.classList.add('particle');
    
    // Randomize properties
    const size = Math.random() * 4 + 2; // 2px to 6px
    const posX = Math.random() * 100; // 0% to 100%
    const delay = Math.random() * 20; // 0s to 20s
    const duration = Math.random() * 15 + 10; // 10s to 25s
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = Math.random() * 0.3 + 0.1; // 0.1 to 0.4
    const drift = (Math.random() - 0.5) * 100; // -50px to 50px
    
    p.style.width = `${size}px`;
    p.style.height = `${size}px`;
    p.style.left = `${posX}vw`;
    p.style.animationDelay = `${delay}s`;
    p.style.animationDuration = `${duration}s`;
    p.style.backgroundColor = color;
    p.style.setProperty('--p-opacity', opacity);
    p.style.setProperty('--p-drift', `${drift}px`);
    
    particlesContainer.appendChild(p);
  }

  /* =========================================
     2. Typing Effect
     ========================================= */
  const typingText = document.getElementById('typing-text');
  const phrases = [
    'Master Version Control.',
    'Track Every Change.',
    'Collaborate Seamlessly.',
    'Branch. Merge. Deploy.',
    'Build with Confidence.'
  ];
  
  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 80;

  function type() {
    const currentPhrase = phrases[phraseIndex];
    
    if (isDeleting) {
      typingText.textContent = currentPhrase.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 40;
    } else {
      typingText.textContent = currentPhrase.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 80;
    }
    
    if (!isDeleting && charIndex === currentPhrase.length) {
      isDeleting = true;
      typeSpeed = 2000; // Pause before delete
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      typeSpeed = 500; // Pause before next type
    }
    
    setTimeout(type, typeSpeed);
  }
  
  // Start typing slightly after load
  setTimeout(type, 1000);

  /* =========================================
     3. Scroll Progress Bar & Navbar
     ========================================= */
  const progressBar = document.getElementById('progress-bar');
  const navbar = document.getElementById('navbar');
  const backToTopBtn = document.getElementById('back-to-top');
  
  window.addEventListener('scroll', () => {
    // Progress bar
    const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
    const scrollProgress = (window.scrollY / scrollTotal) * 100;
    progressBar.style.width = `${scrollProgress}%`;
    
    // Navbar style
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    
    // Back to top button
    if (window.scrollY > 500) {
      backToTopBtn.classList.add('show');
    } else {
      backToTopBtn.classList.remove('show');
    }
  });

  /* =========================================
     4. Mobile Menu
     ========================================= */
  const hamburger = document.getElementById('hamburger');
  const navLinksMenu = document.getElementById('nav-links');
  const navLinksItems = document.querySelectorAll('.nav-link');
  
  hamburger.addEventListener('click', () => {
    const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', !isExpanded);
    navLinksMenu.classList.toggle('active');
  });
  
  // Close menu when link clicked
  navLinksItems.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      navLinksMenu.classList.remove('active');
    });
  });

  /* =========================================
     5. Scroll Reveal Animation
     ========================================= */
  const revealElements = document.querySelectorAll('.reveal');
  
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optional: unobserve after reveal
        // observer.unobserve(entry.target);
      }
    });
  }, {
    root: null,
    threshold: 0.15,
    rootMargin: "0px 0px -50px 0px"
  });
  
  revealElements.forEach(el => revealObserver.observe(el));

  /* =========================================
     6. Active Nav Link on Scroll
     ========================================= */
  const sections = document.querySelectorAll('section[id]');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.scrollY;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 150;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinksItems.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  /* =========================================
     7. Command Search & Filter
     ========================================= */
  const searchInput = document.getElementById('cmd-search');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cmdCards = document.querySelectorAll('.cmd-card');
  const noResults = document.getElementById('no-results');
  
  let currentFilter = 'all';
  let searchQuery = '';
  
  function filterCommands() {
    let visibleCount = 0;
    
    cmdCards.forEach(card => {
      const category = card.getAttribute('data-category');
      const cmdName = card.getAttribute('data-cmd').toLowerCase();
      const desc = card.querySelector('.cmd-desc').textContent.toLowerCase();
      
      const matchesCategory = currentFilter === 'all' || category === currentFilter;
      const matchesSearch = cmdName.includes(searchQuery) || desc.includes(searchQuery);
      
      if (matchesCategory && matchesSearch) {
        card.style.display = 'flex';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    if (visibleCount === 0) {
      noResults.style.display = 'block';
    } else {
      noResults.style.display = 'none';
    }
  }
  
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    filterCommands();
  });
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.getAttribute('data-filter');
      filterCommands();
    });
  });

  /* =========================================
     8. Copy to Clipboard
     ========================================= */
  const copyBtns = document.querySelectorAll('.copy-btn');
  const toast = document.getElementById('copy-toast');
  let toastTimer;
  
  copyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy');
      
      navigator.clipboard.writeText(textToCopy).then(() => {
        // Change button briefly
        const originalText = btn.innerHTML;
        btn.innerHTML = '✓ Copied';
        
        // Show toast
        toast.classList.add('show');
        
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
          toast.classList.remove('show');
          btn.innerHTML = originalText;
        }, 2000);
      });
    });
  });

  /* =========================================
     9. Dark/Light Theme Toggle
     ========================================= */
  const themeToggle = document.getElementById('theme-toggle');
  const htmlEl = document.documentElement;
  
  // Check local storage or system pref
  const savedTheme = localStorage.getItem('git-ref-theme');
  if (savedTheme) {
    htmlEl.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    htmlEl.setAttribute('data-theme', 'light');
    updateThemeIcon('light');
  }
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    htmlEl.setAttribute('data-theme', newTheme);
    localStorage.setItem('git-ref-theme', newTheme);
    updateThemeIcon(newTheme);
  });
  
  function updateThemeIcon(theme) {
    themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
  }

  /* =========================================
     10. Back to Top Smooth Scroll
     ========================================= */
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  /* =========================================
     11. Interactive Terminal Simulation
     ========================================= */
  const termOutput = document.getElementById('terminal-output');
  const termBtns = document.querySelectorAll('.term-btn');
  const termClear = document.getElementById('term-clear');
  
  let isTyping = false;
  
  const terminalCommands = {
    'git init': {
      lines: [
        { text: '$ git init', color: 'white' },
        { text: 'Initialized empty Git repository in /project/.git/', color: 'green' },
        { text: 'hint: Using \'main\' as the name for the initial branch.', color: 'yellow' },
      ]
    },
    'git add': {
      lines: [
        { text: '$ git add .', color: 'white' },
        { text: '', color: 'white' },
        { text: '✓ Changes staged for commit:', color: 'green' },
        { text: '  modified:   index.html', color: 'cyan' },
        { text: '  new file:   style.css', color: 'cyan' },
        { text: '  modified:   script.js', color: 'cyan' },
      ]
    },
    'git commit': {
      lines: [
        { text: '$ git commit -m "feat: Add awesome feature"', color: 'white' },
        { text: '[main abc1234] feat: Add awesome feature', color: 'green' },
        { text: ' 3 files changed, 47 insertions(+), 2 deletions(-)', color: 'yellow' },
      ]
    },
    'git push': {
      lines: [
        { text: '$ git push origin main', color: 'white' },
        { text: 'Enumerating objects: 5, done.', color: 'cyan' },
        { text: 'Counting objects: 100% (5/5), done.', color: 'cyan' },
        { text: 'Writing objects: 100% (3/3), 712 bytes | 712.00 KiB/s, done.', color: 'cyan' },
        { text: 'To https://github.com/user/repo.git', color: 'yellow' },
        { text: '   a1b2c3d..abc1234  main -> main', color: 'green' },
        { text: '✓ Branch \'main\' pushed to GitHub successfully!', color: 'green' },
      ]
    },
    'git status': {
      lines: [
        { text: '$ git status', color: 'white' },
        { text: 'On branch main', color: 'white' },
        { text: 'Your branch is up to date with \'origin/main\'.', color: 'green' },
        { text: '', color: 'white' },
        { text: 'Changes not staged for commit:', color: 'red' },
        { text: '  (use "git add <file>..." to update what will be committed)', color: 'yellow' },
        { text: '\tmodified:   index.html', color: 'red' },
        { text: '', color: 'white' },
        { text: 'Untracked files:', color: 'red' },
        { text: '\tnew-feature.js', color: 'red' },
      ]
    },
    'git log': {
      lines: [
        { text: '$ git log --oneline', color: 'white' },
        { text: 'abc1234 (HEAD -> main, origin/main) feat: Add awesome feature', color: 'yellow' },
        { text: 'def5678 fix: Resolve merge conflict in style.css', color: 'yellow' },
        { text: 'ghi9012 docs: Update README with setup instructions', color: 'yellow' },
        { text: 'jkl3456 init: Initial project setup', color: 'yellow' },
      ]
    }
  };
  
  function scrollToBottom() {
    termOutput.scrollTop = termOutput.scrollHeight;
  }
  
  function createTermLine(content, colorClass) {
    const div = document.createElement('div');
    div.className = `term-line ${colorClass}`;
    div.innerHTML = content;
    return div;
  }
  
  async function simulateTerminal(cmdData) {
    if (isTyping) return;
    isTyping = true;
    
    // Disable buttons
    termBtns.forEach(b => b.style.opacity = '0.5');
    
    for (let i = 0; i < cmdData.lines.length; i++) {
      const line = cmdData.lines[i];
      const colorClass = `term-${line.color}`;
      
      // If it's a command typed by user, animate typing
      if (line.text.startsWith('$')) {
        const div = createTermLine('$ ', colorClass);
        termOutput.appendChild(div);
        scrollToBottom();
        
        const textToType = line.text.substring(2);
        for (let j = 0; j < textToType.length; j++) {
          div.innerHTML += textToType.charAt(j);
          scrollToBottom();
          await new Promise(r => setTimeout(r, 40)); // Typing speed
        }
      } else {
        // Output line, show instantly
        const div = createTermLine(line.text || '&nbsp;', colorClass);
        termOutput.appendChild(div);
        scrollToBottom();
        await new Promise(r => setTimeout(r, 150)); // Delay between output lines
      }
    }
    
    // Add extra empty line at end
    termOutput.appendChild(createTermLine('&nbsp;', 'term-white'));
    scrollToBottom();
    
    // Re-enable buttons
    termBtns.forEach(b => b.style.opacity = '1');
    isTyping = false;
  }
  
  termBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (isTyping) return;
      const cmd = btn.getAttribute('data-cmd');
      const data = terminalCommands[cmd];
      if (data) {
        simulateTerminal(data);
      }
    });
  });
  
  termClear.addEventListener('click', () => {
    if (isTyping) return;
    termOutput.innerHTML = `
      <div class="term-line">
        <span class="term-green">git-practice</span>
        <span class="term-white"> on </span>
        <span class="term-cyan">🌿 main</span>
        <span class="term-white"> ready</span>
      </div>
      <div class="term-line term-muted">Terminal cleared. Click a button below...</div>
      <div class="term-line">&nbsp;</div>
    `;
  });
});
