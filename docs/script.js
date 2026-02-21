// ========================================
// DevLab Landing Page - Multi-Layer 3D Interactive Canvas
// Optimized with layers, depth effect, and card avoidance
// ========================================

(function() {
    'use strict';

    // ========================================
    // Configuration
    // ========================================

    const CONFIG = {
        layers: [
            { name: 'back', count: 140, speedMultiplier: 0.25, opacity: 0.06, sizeMultiplier: 0.7, zIndex: 0 },
            { name: 'middle', count: 200, speedMultiplier: 0.45, opacity: 0.12, sizeMultiplier: 1.0, zIndex: 1 },
            { name: 'front', count: 100, speedMultiplier: 0.7, opacity: 0.22, sizeMultiplier: 1.3, zIndex: 2 }
        ],
        connectionDistance: 180,
        crossLayerConnection: 130,
        mouseConnectionDistance: 250,
        baseSpeed: 0.4,
        colors: {
            teal: '#22D3EE',
            tealRGB: '34, 211, 238',
            purple: '#7C3AED',
            purpleRGB: '124, 58, 237',
            tealDark: '#0D9488'
        },
        avoidanceZones: [] // Will be populated with card positions
    };

    // ========================================
    // Code Symbols & Elements
    // ========================================

    const CODE_SYMBOLS = [
        // Syntax
        '</>', '{;}', '[]', '()', '&&', '||', '=>', '::', '++', '--',
        'var', 'let', 'const', 'fn', 'def', 'class', 'pub', 'mod',
        '$_', '#!', '@@', '/*', '*/', '<?', '?>', '/>', '<!',
        '~/', './', '../', '|>', '->', '<-', '>>>', '<<<', '??',

        // Package managers & CLI
        'sudo', 'npm', 'npx', 'cargo', 'pip', 'yarn', 'pnpm', 'git',
        'build', 'deploy', 'push', 'pull', 'fetch', 'merge', 'init',
        'brew', 'apt', 'dnf', 'snap', 'wget', 'curl', 'ssh', 'scp',

        // Keywords
        'async', 'await', 'return', 'export', 'import', 'from', 'use',
        'if', 'else', 'for', 'loop', 'match', 'try', 'catch', 'throw',
        'run', 'test', 'dev', 'prod', 'env', 'src', 'lib', 'pkg',

        // Protocols & APIs
        '0x', '0b', '#!/', 'API', 'GET', 'POST', 'PUT', 'SQL', 'SSH',
        'REST', 'gRPC', 'WS', 'TCP', 'UDP', 'HTTP', 'DNS', 'TLS',

        // Extensions
        '.js', '.ts', '.rs', '.py', '.go', '.vue', '.jsx', '.tsx',
        '.cpp', '.rb', '.php', '.kt', '.swift', '.cs', '.java', '.sql',

        // Frameworks & Libraries
        'React', 'Vue', 'Next', 'Nuxt', 'Svelte', 'Solid', 'Astro',
        'Node', 'Deno', 'Bun', 'Express', 'Fastify', 'Nest', 'Hono',
        'Django', 'Flask', 'FastAPI', 'Rails', 'Laravel', 'Spring',
        'Prisma', 'Drizzle', 'TypeORM', 'Mongoose', 'Redis', 'Kafka',

        // DevOps & Cloud
        'Docker', 'K8s', 'AWS', 'GCP', 'Azure', 'Vercel', 'Netlify',
        'CI/CD', 'Nginx', 'Linux', 'Bash', 'Zsh', 'Vim', 'Neovim',
        'Terraform', 'Ansible', 'Pulumi', 'Helm', 'ArgoCD', 'Jenkins',

        // Languages
        'Rust', 'Go', 'Python', 'TypeScript', 'Kotlin', 'Swift', 'Zig',
        'C++', 'C#', 'Java', 'Scala', 'Elixir', 'Haskell', 'OCaml',

        // Databases
        'Postgres', 'MySQL', 'MongoDB', 'SQLite', 'Supabase', 'Firebase',
        'DynamoDB', 'Cassandra', 'Neo4j', 'ClickHouse', 'Elastic',

        // AI/ML
        'GPT', 'LLM', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy',
        'Scikit', 'Keras', 'Hugging', 'OpenAI', 'LangChain', 'Vector',

        // Tools
        'ESLint', 'Prettier', 'Webpack', 'Vite', 'Turbo', 'esbuild',
        'Jest', 'Vitest', 'Cypress', 'Playwright', 'Storybook', 'Figma',
        'GitHub', 'GitLab', 'Jira', 'Notion', 'Slack', 'Discord'
    ];

    const ELEMENT_TYPES = ['symbol', 'symbol', 'symbol', 'symbol', 'dot', 'flask', 'molecule', 'hexagon', 'bracket'];

    // ========================================
    // Multi-Layer Canvas System
    // ========================================

    class MultiLayerCanvas {
        constructor() {
            this.canvas = null;
            this.ctx = null;
            this.layers = { back: [], middle: [], front: [] };
            this.mouse = { x: null, y: null };
            this.dpr = Math.min(window.devicePixelRatio || 1, 2);
            this.width = 0;
            this.height = 0;
            this.frameCount = 0;
            this.isVisible = true;

            this.init();
        }

        init() {
            this.createCanvas();
            this.updateAvoidanceZones();
            this.createAllLayers();
            this.setupEvents();
            this.animate();
        }

        createCanvas() {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'interactive-canvas';
            this.canvas.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 1;
            `;
            document.body.insertBefore(this.canvas, document.body.firstChild);
            this.ctx = this.canvas.getContext('2d', { alpha: true });
            this.resize();
        }

        resize() {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
            this.canvas.width = this.width * this.dpr;
            this.canvas.height = this.height * this.dpr;
            this.ctx.scale(this.dpr, this.dpr);
            this.canvas.style.width = this.width + 'px';
            this.canvas.style.height = this.height + 'px';
        }

        updateAvoidanceZones() {
            CONFIG.avoidanceZones = [];
            const selectors = ['.benefit-card', '.module-card', '.testimonial-card', '.video-frame', '.signup-form', '.cta-content'];

            selectors.forEach(selector => {
                document.querySelectorAll(selector).forEach(el => {
                    const rect = el.getBoundingClientRect();
                    CONFIG.avoidanceZones.push({
                        x: rect.left - 30,
                        y: rect.top + window.scrollY - 30,
                        width: rect.width + 60,
                        height: rect.height + 60
                    });
                });
            });
        }

        isInAvoidanceZone(x, y) {
            const scrollY = window.scrollY;
            const screenY = y - scrollY;

            for (const zone of CONFIG.avoidanceZones) {
                const zoneScreenY = zone.y - scrollY;
                if (x >= zone.x && x <= zone.x + zone.width &&
                    screenY >= zoneScreenY && screenY <= zoneScreenY + zone.height) {
                    return true;
                }
            }
            return false;
        }

        createAllLayers() {
            CONFIG.layers.forEach(layerConfig => {
                this.layers[layerConfig.name] = [];
                for (let i = 0; i < layerConfig.count; i++) {
                    this.layers[layerConfig.name].push(this.createElement(layerConfig));
                }
            });
        }

        createElement(layerConfig) {
            const type = ELEMENT_TYPES[Math.floor(Math.random() * ELEMENT_TYPES.length)];

            // Base sizes per type
            const baseSizes = {
                dot: 5,
                symbol: 18,
                flask: 36,
                molecule: 34,
                hexagon: 32,
                bracket: 28
            };
            const baseSize = baseSizes[type] || 14;

            // Size variation: small (0.5-0.8), medium (0.9-1.4), large (1.5-2.2)
            const sizeCategory = Math.random();
            let sizeVariation;
            if (sizeCategory < 0.3) {
                sizeVariation = 0.5 + Math.random() * 0.3; // Small: 30%
            } else if (sizeCategory < 0.7) {
                sizeVariation = 0.9 + Math.random() * 0.5; // Medium: 40%
            } else {
                sizeVariation = 1.5 + Math.random() * 0.7; // Large: 30%
            }

            return {
                x: Math.random() * this.width,
                y: Math.random() * this.height * 4, // Spread over more scrollable area
                vx: (Math.random() - 0.5) * CONFIG.baseSpeed * layerConfig.speedMultiplier,
                vy: (Math.random() - 0.5) * CONFIG.baseSpeed * layerConfig.speedMultiplier,
                type: type,
                content: type === 'symbol' ? CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)] : null,
                size: baseSize * layerConfig.sizeMultiplier * sizeVariation,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.004 * layerConfig.speedMultiplier,
                baseOpacity: layerConfig.opacity * (0.7 + sizeVariation * 0.3), // Larger = slightly more visible
                opacity: layerConfig.opacity,
                layer: layerConfig.name,
                zIndex: layerConfig.zIndex,
                pulsePhase: Math.random() * Math.PI * 2,
                sizeMultiplier: sizeVariation
            };
        }

        setupEvents() {
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    this.resize();
                    this.updateAvoidanceZones();
                }, 200);
            });

            window.addEventListener('scroll', () => {
                this.updateAvoidanceZones();
            }, { passive: true });

            window.addEventListener('mousemove', (e) => {
                this.mouse.x = e.clientX;
                this.mouse.y = e.clientY + window.scrollY;
            }, { passive: true });

            window.addEventListener('mouseout', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });

            // Touch support for mobile
            window.addEventListener('touchstart', (e) => {
                if (e.touches.length > 0) {
                    this.mouse.x = e.touches[0].clientX;
                    this.mouse.y = e.touches[0].clientY + window.scrollY;
                }
            }, { passive: true });

            window.addEventListener('touchmove', (e) => {
                if (e.touches.length > 0) {
                    this.mouse.x = e.touches[0].clientX;
                    this.mouse.y = e.touches[0].clientY + window.scrollY;
                }
            }, { passive: true });

            window.addEventListener('touchend', () => {
                // Keep the connection visible for a moment after touch ends
                setTimeout(() => {
                    this.mouse.x = null;
                    this.mouse.y = null;
                }, 500);
            }, { passive: true });

            // Visibility API for performance
            document.addEventListener('visibilitychange', () => {
                this.isVisible = !document.hidden;
            });
        }

        drawElement(el) {
            const scrollY = window.scrollY;
            const screenY = el.y - scrollY;

            // Skip if not visible on screen
            if (screenY < -100 || screenY > this.height + 100) return;

            // Reduce opacity in avoidance zones
            const inZone = this.isInAvoidanceZone(el.x, el.y);
            const targetOpacity = inZone ? el.baseOpacity * 0.2 : el.baseOpacity;
            el.opacity += (targetOpacity - el.opacity) * 0.1;

            this.ctx.save();
            this.ctx.translate(el.x, screenY);
            this.ctx.rotate(el.rotation);
            this.ctx.globalAlpha = el.opacity;

            // Color based on layer depth
            const layerColors = {
                back: `rgba(${CONFIG.colors.purpleRGB}, 1)`,
                middle: `rgba(${CONFIG.colors.tealRGB}, 1)`,
                front: CONFIG.colors.teal
            };

            const color = layerColors[el.layer];

            switch(el.type) {
                case 'symbol':
                    this.ctx.font = `500 ${el.size}px 'JetBrains Mono', 'Fira Code', monospace`;
                    this.ctx.fillStyle = color;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    this.ctx.fillText(el.content, 0, 0);
                    break;

                case 'dot':
                    this.ctx.beginPath();
                    this.ctx.arc(0, 0, el.size, 0, Math.PI * 2);
                    this.ctx.fillStyle = color;
                    this.ctx.fill();
                    break;

                case 'flask':
                    this.drawFlask(el.size, color);
                    break;

                case 'molecule':
                    this.drawMolecule(el.size, color);
                    break;

                case 'hexagon':
                    this.drawHexagon(el.size, color);
                    break;

                case 'bracket':
                    this.drawBracket(el.size, color);
                    break;
            }

            this.ctx.restore();
        }

        drawFlask(size, color) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1.5;

            this.ctx.beginPath();
            this.ctx.moveTo(-size * 0.15, -size * 0.4);
            this.ctx.lineTo(-size * 0.15, -size * 0.1);
            this.ctx.lineTo(-size * 0.35, size * 0.35);
            this.ctx.quadraticCurveTo(-size * 0.35, size * 0.45, -size * 0.2, size * 0.45);
            this.ctx.lineTo(size * 0.2, size * 0.45);
            this.ctx.quadraticCurveTo(size * 0.35, size * 0.45, size * 0.35, size * 0.35);
            this.ctx.lineTo(size * 0.15, -size * 0.1);
            this.ctx.lineTo(size * 0.15, -size * 0.4);
            this.ctx.stroke();

            // Neck
            this.ctx.strokeRect(-size * 0.15, -size * 0.5, size * 0.3, size * 0.12);
        }

        drawMolecule(size, color) {
            this.ctx.strokeStyle = color;
            this.ctx.fillStyle = color;
            this.ctx.lineWidth = 1.5;

            // Bonds
            const points = [
                { x: -size * 0.3, y: 0 },
                { x: 0, y: -size * 0.25 },
                { x: size * 0.3, y: 0 },
                { x: 0, y: size * 0.25 }
            ];

            this.ctx.beginPath();
            points.forEach((p, i) => {
                const next = points[(i + 1) % points.length];
                this.ctx.moveTo(p.x, p.y);
                this.ctx.lineTo(next.x, next.y);
            });
            this.ctx.stroke();

            // Atoms
            points.forEach((p, i) => {
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, size * 0.08, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }

        drawHexagon(size, color) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 1.5;
            this.ctx.beginPath();

            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const x = Math.cos(angle) * size * 0.4;
                const y = Math.sin(angle) * size * 0.4;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
            this.ctx.stroke();
        }

        drawBracket(size, color) {
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.lineCap = 'round';

            // Left bracket <
            this.ctx.beginPath();
            this.ctx.moveTo(size * 0.1, -size * 0.3);
            this.ctx.lineTo(-size * 0.2, 0);
            this.ctx.lineTo(size * 0.1, size * 0.3);
            this.ctx.stroke();

            // Right bracket >
            this.ctx.beginPath();
            this.ctx.moveTo(size * 0.25, -size * 0.3);
            this.ctx.lineTo(size * 0.55, 0);
            this.ctx.lineTo(size * 0.25, size * 0.3);
            this.ctx.stroke();

            // Slash /
            this.ctx.beginPath();
            this.ctx.moveTo(size * 0.22, size * 0.25);
            this.ctx.lineTo(size * 0.08, -size * 0.25);
            this.ctx.stroke();
        }

        drawConnections() {
            const scrollY = window.scrollY;
            const allElements = [...this.layers.back, ...this.layers.middle, ...this.layers.front];

            // Pre-filter visible elements
            const visibleElements = allElements.filter(el => {
                const screenY = el.y - scrollY;
                return screenY > -100 && screenY < this.height + 100;
            });

            // Limit connections for performance - sample elements if too many
            const maxElements = 100;
            const elementsToProcess = visibleElements.length > maxElements
                ? visibleElements.filter((_, i) => i % Math.ceil(visibleElements.length / maxElements) === 0)
                : visibleElements;

            // Same layer connections
            for (let i = 0; i < elementsToProcess.length; i++) {
                const el1 = elementsToProcess[i];
                const screenY1 = el1.y - scrollY;

                for (let j = i + 1; j < elementsToProcess.length; j++) {
                    const el2 = elementsToProcess[j];
                    const screenY2 = el2.y - scrollY;

                    const dx = el1.x - el2.x;
                    const dy = screenY1 - screenY2;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    // Same layer = stronger connection
                    const maxDist = el1.layer === el2.layer ? CONFIG.connectionDistance : CONFIG.crossLayerConnection;

                    if (dist < maxDist) {
                        // Calculate depth-based properties
                        const avgZIndex = (el1.zIndex + el2.zIndex) / 2;
                        const baseOpacity = (1 - dist / maxDist) * 0.15;
                        const depthOpacity = baseOpacity * (0.3 + avgZIndex * 0.35);

                        // Cross-layer connections have gradient effect (3D depth)
                        if (el1.layer !== el2.layer) {
                            const gradient = this.ctx.createLinearGradient(el1.x, screenY1, el2.x, screenY2);
                            gradient.addColorStop(0, `rgba(${CONFIG.colors.tealRGB}, ${depthOpacity})`);
                            gradient.addColorStop(1, `rgba(${CONFIG.colors.purpleRGB}, ${depthOpacity * 0.7})`);
                            this.ctx.strokeStyle = gradient;
                            this.ctx.lineWidth = 1 + avgZIndex * 0.5;
                        } else {
                            const layerColor = el1.layer === 'front' ? CONFIG.colors.tealRGB : CONFIG.colors.purpleRGB;
                            this.ctx.strokeStyle = `rgba(${layerColor}, ${depthOpacity})`;
                            this.ctx.lineWidth = 0.5 + el1.zIndex * 0.5;
                        }

                        this.ctx.beginPath();
                        this.ctx.moveTo(el1.x, screenY1);
                        this.ctx.lineTo(el2.x, screenY2);
                        this.ctx.stroke();

                        // Draw connection node at midpoint for cross-layer connections
                        if (el1.layer !== el2.layer && dist < maxDist * 0.5) {
                            const midX = (el1.x + el2.x) / 2;
                            const midY = (screenY1 + screenY2) / 2;
                            this.ctx.beginPath();
                            this.ctx.arc(midX, midY, 2, 0, Math.PI * 2);
                            this.ctx.fillStyle = `rgba(${CONFIG.colors.tealRGB}, ${depthOpacity * 2})`;
                            this.ctx.fill();
                        }
                    }
                }

                // Mouse connections
                if (this.mouse.x !== null && this.mouse.y !== null) {
                    const mouseScreenY = this.mouse.y - scrollY;
                    const dx = el1.x - this.mouse.x;
                    const dy = screenY1 - mouseScreenY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CONFIG.mouseConnectionDistance) {
                        const opacity = (1 - dist / CONFIG.mouseConnectionDistance) * 0.4 * (0.5 + el1.zIndex * 0.25);
                        const lineWidth = 1 + el1.zIndex;

                        // Gradient line to mouse
                        const gradient = this.ctx.createLinearGradient(el1.x, screenY1, this.mouse.x, mouseScreenY);
                        gradient.addColorStop(0, `rgba(${CONFIG.colors.tealRGB}, ${opacity})`);
                        gradient.addColorStop(1, `rgba(${CONFIG.colors.purpleRGB}, ${opacity * 0.5})`);

                        this.ctx.beginPath();
                        this.ctx.strokeStyle = gradient;
                        this.ctx.lineWidth = lineWidth;
                        this.ctx.moveTo(el1.x, screenY1);
                        this.ctx.lineTo(this.mouse.x, mouseScreenY);
                        this.ctx.stroke();

                        // Glow on connected element
                        if (dist < 100) {
                            el1.opacity = Math.min(el1.baseOpacity * 2, 0.5);
                        }
                    }
                }
            }

            // Draw mouse glow
            if (this.mouse.x !== null && this.mouse.y !== null) {
                const mouseScreenY = this.mouse.y - scrollY;
                if (mouseScreenY > 0 && mouseScreenY < this.height) {
                    const glow = this.ctx.createRadialGradient(
                        this.mouse.x, mouseScreenY, 0,
                        this.mouse.x, mouseScreenY, 100
                    );
                    glow.addColorStop(0, `rgba(${CONFIG.colors.tealRGB}, 0.15)`);
                    glow.addColorStop(0.5, `rgba(${CONFIG.colors.purpleRGB}, 0.08)`);
                    glow.addColorStop(1, 'rgba(0,0,0,0)');

                    this.ctx.fillStyle = glow;
                    this.ctx.beginPath();
                    this.ctx.arc(this.mouse.x, mouseScreenY, 100, 0, Math.PI * 2);
                    this.ctx.fill();
                }
            }
        }

        updateElements() {
            const allElements = [...this.layers.back, ...this.layers.middle, ...this.layers.front];
            const scrollY = window.scrollY;
            const maxY = this.height * 4; // Total scrollable area

            for (const el of allElements) {
                el.x += el.vx;
                el.y += el.vy;
                el.rotation += el.rotationSpeed;

                // Pulse effect
                el.pulsePhase += 0.02;

                // Wrap around edges
                if (el.x < -50) el.x = this.width + 50;
                if (el.x > this.width + 50) el.x = -50;
                if (el.y < -100) el.y = maxY;
                if (el.y > maxY) el.y = -100;

                // Mouse repulsion (front layer more affected)
                if (this.mouse.x !== null && this.mouse.y !== null) {
                    const screenY = el.y - scrollY;
                    const mouseScreenY = this.mouse.y - scrollY;
                    const dx = el.x - this.mouse.x;
                    const dy = screenY - mouseScreenY;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 120 && dist > 0) {
                        const force = (120 - dist) / 120 * 0.3 * (0.5 + el.zIndex * 0.25);
                        el.x += (dx / dist) * force;
                        el.y += (dy / dist) * force;
                    }
                }
            }
        }

        animate() {
            if (!this.isVisible) {
                requestAnimationFrame(() => this.animate());
                return;
            }

            this.frameCount++;

            this.ctx.clearRect(0, 0, this.width, this.height);

            // Draw back layer first, then middle, then front (depth order)
            this.drawConnections();

            this.layers.back.forEach(el => this.drawElement(el));
            this.layers.middle.forEach(el => this.drawElement(el));
            this.layers.front.forEach(el => this.drawElement(el));

            // Update less frequently for performance
            if (this.frameCount % 1 === 0) {
                this.updateElements();
            }

            requestAnimationFrame(() => this.animate());
        }
    }

    // ========================================
    // Dynamic Text Typewriter
    // ========================================

    function initDynamicText() {
        const element = document.getElementById('dynamicText');
        if (!element) return;

        const words = [
            'programação',
            'tecnologia',
            'código',
            'desenvolvimento',
            'inovação',
            'carreira tech',
            'web dev',
            'futuro'
        ];

        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let currentWord = words[0];

        function type() {
            currentWord = words[wordIndex];

            if (isDeleting) {
                element.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
                element.classList.add('typing');
            } else {
                element.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
                element.classList.add('typing');
            }

            let typeSpeed = isDeleting ? 50 : 100;

            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000; // Pause at end
                isDeleting = true;
                element.classList.remove('typing');
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500; // Pause before next word
                element.classList.remove('typing');
            }

            setTimeout(type, typeSpeed);
        }

        setTimeout(type, 1500); // Start after page load
    }

    // ========================================
    // UI Initializations
    // ========================================

    function initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    setTimeout(() => entry.target.classList.add('visible'), index * 80);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.benefit-card, .module-card, .testimonial-card, .animate-on-scroll').forEach(el => observer.observe(el));
    }

    function initCounters() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.dataset.animated) {
                    entry.target.dataset.animated = 'true';
                    const target = parseInt(entry.target.dataset.count);
                    const duration = 2000;
                    const start = performance.now();

                    function update(time) {
                        const progress = Math.min((time - start) / duration, 1);
                        entry.target.textContent = Math.floor((1 - Math.pow(1 - progress, 3)) * target).toLocaleString('pt-BR');
                        if (progress < 1) requestAnimationFrame(update);
                    }
                    requestAnimationFrame(update);
                }
            });
        }, { threshold: 0.5 });

        document.querySelectorAll('.stat-number[data-count]').forEach(el => observer.observe(el));
    }

    function initNavbar() {
        const navbar = document.querySelector('.navbar');
        let ticking = false;

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    navbar.classList.toggle('scrolled', window.scrollY > 50);
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                document.querySelector(this.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth' });
            });
        });
    }

    function initForm() {
        const form = document.getElementById('signupForm');
        if (!form) return;

        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('button[type="submit"]');
            const original = btn.innerHTML;
            btn.innerHTML = '<span>✓ Inscrito!</span>';
            btn.style.background = '#10B981';
            btn.disabled = true;
            setTimeout(() => { btn.innerHTML = original; btn.style.background = ''; btn.disabled = false; form.reset(); }, 3000);
        });
    }

    // ========================================
    // Theme Toggle
    // ========================================

    function initThemeToggle() {
        const toggle = document.getElementById('themeToggle');
        if (!toggle) return;

        // Check for saved theme or system preference
        const savedTheme = localStorage.getItem('devlab-theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Default to dark theme (our design is dark-first)
        if (savedTheme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        }

        toggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            if (newTheme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', 'light');
            }

            localStorage.setItem('devlab-theme', newTheme);

            // Add a subtle animation
            toggle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                toggle.style.transform = '';
            }, 150);
        });
    }

    // ========================================
    // Initialize
    // ========================================

    document.addEventListener('DOMContentLoaded', () => {
        // Wait for layout to settle
        setTimeout(() => {
            new MultiLayerCanvas();
            initScrollAnimations();
            initCounters();
            initNavbar();
            initSmoothScroll();
            initForm();
            initThemeToggle();
            initDynamicText();
            console.log('🧪 DevLab Multi-Layer Canvas v3 Loaded');
        }, 100);
    });

})();
