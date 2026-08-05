/* ════════════════════════════════════════════════════════
   CV Forge - Live CV Builder
   Vanilla JS: state → editor form + live A4 preview.
   Autosaves to localStorage, exports/imports JSON,
   prints via the browser's "Save as PDF".
   ════════════════════════════════════════════════════════ */

'use strict';

const STORAGE_KEY = 'cvforge-data-v1';

/* ─── ICONS (stroke-style SVG, inherit currentColor) ──── */
const ICONS = {
    phone:    '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18" stroke-width="3"/></svg>',
    email:    '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 7l10 7 10-7"/></svg>',
    pin:      '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>',
    github:   '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>',
    linkedin: '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4V8h4v1.5"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>',
    globe:    '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>',
    car:      '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="7" width="22" height="10" rx="2"/><path d="M5 7V5a2 2 0 012-2h10a2 2 0 012 2v2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>',
    link:     '<svg class="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>'
};

const ICON_LABELS = {
    phone: 'Phone', email: 'Email', pin: 'Location', github: 'GitHub',
    linkedin: 'LinkedIn', globe: 'Website / Lang', car: 'License', link: 'Link'
};

const SECTION_ICONS = {
    summary:    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a7 7 0 0114 0v1"/></svg>',
    experience: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/><line x1="12" y1="12" x2="12" y2="12" stroke-width="3"/></svg>',
    education:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10l-10-6L2 10l10 6 10-6z"/><path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"/><line x1="22" y1="10" x2="22" y2="16"/></svg>',
    projects:   '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>',
    skills:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>',
    custom:     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
};

/* ─── COLOR THEMES ────────────────────────────────────── */
const THEMES = {
    navy:     { navy: '#1a2744', mid: '#2e4480', rule: '#c8ccda', tag: '#eef0f7' },
    burgundy: { navy: '#4a1a24', mid: '#7d2f42', rule: '#dac8cc', tag: '#f7eef0' },
    forest:   { navy: '#1a3324', mid: '#2e5c40', rule: '#c8d8cc', tag: '#eef5f0' },
    teal:     { navy: '#0f3a40', mid: '#20666f', rule: '#c5d6d8', tag: '#ecf4f5' },
    charcoal: { navy: '#262626', mid: '#4d4d4d', rule: '#cccccc', tag: '#f0f0f0' },
    black:    { navy: '#000000', mid: '#3a3a3a', rule: '#c9c9c9', tag: '#f1f1f1' },
    slate:    { navy: '#2b3947', mid: '#4d6478', rule: '#c9d0d6', tag: '#eef1f4' },
    ocean:    { navy: '#0f2f5c', mid: '#2059a8', rule: '#c5cfdd', tag: '#ecf1f8' },
    plum:     { navy: '#3a1f45', mid: '#68397c', rule: '#d5c8da', tag: '#f4eef7' },
    rust:     { navy: '#5c2b12', mid: '#96491f', rule: '#dccdc4', tag: '#f7f0ec' }
};

/* a full theme derived from one user-picked color */
function customTheme(hex) {
    const { h, s, l } = hexToHsl(hex);
    return {
        navy: hex,
        mid:  hslToHex(h, s, Math.min(Math.max(l + 16, 30), 62)),
        rule: hslToHex(h, Math.min(s, 30), 84),
        tag:  hslToHex(h, Math.min(s, 40), 95)
    };
}

function hexToHsl(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) {
        if (max === r) h = ((g - b) / d + 6) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h *= 60;
    }
    const l = (max + min) / 2;
    const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
    return { h, s: s * 100, l: l * 100 };
}

function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = k => {
        k = (k + h / 30) % 12;
        const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1));
        return Math.round(c * 255).toString(16).padStart(2, '0');
    };
    return '#' + f(0) + f(8) + f(4);
}

/* only embedded images may be used as the photo */
const SAFE_PHOTO = /^data:image\//;

/* only plain web/mail/phone links; bare domains get https:// */
function safeLink(url) {
    const u = String(url || '').trim();
    if (!u) return '';
    if (/^(https?:|mailto:|tel:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return '';
    return 'https://' + u;
}

/* ─── DEFAULT (EXAMPLE) DATA ──────────────────────────── */
function defaultState() {
    return {
        theme: 'navy',
        customColor: '#1a2744',
        fontScale: 100,
        showIcons: true,
        sectionOrder: ['summary', 'experience', 'education', 'projects', 'skills'],
        custom: [],
        personal: { name: 'Andrei Example', photo: '' },
        contacts: [
            { icon: 'phone', text: '0700 000 000', link: '' },
            { icon: 'email', text: 'andrei@example.com', link: 'mailto:andrei@example.com' },
            { icon: 'pin',   text: 'Bucharest, Romania', link: '' },
            { icon: 'github', text: 'github.com/andrei-example', link: 'https://github.com/andrei-example' },
            { icon: 'linkedin', text: 'linkedin.com/in/andrei-example', link: 'https://linkedin.com/in/andrei-example' },
            { icon: 'globe', text: 'English: C1', link: '' }
        ],
        titles: {
            summary: 'Profile',
            experience: 'Professional Experience',
            education: 'Education',
            projects: 'Projects',
            skills: 'Technical Skills'
        },
        summary: 'Detail-oriented engineer with hands-on experience in web development and process automation. Passionate about building tools that save people time.',
        experience: [
            {
                company: 'Example Tech SRL', role: 'Junior Developer',
                location: 'Bucharest, RO', date: 'Jan. 2024 - Present',
                bullets: 'Developing and maintaining internal web applications.\nWriting Python scripts to automate repetitive tasks.\nCollaborating with the QA team on test planning and bug triage.'
            },
            {
                company: 'Retail Group SA', role: 'IT Support Intern',
                location: 'Bucharest, RO', date: 'Jun. 2023 - Dec. 2023',
                bullets: 'Provided first-line technical support for 100+ employees.\nMaintained hardware inventory and workstation deployments.'
            }
        ],
        education: [
            {
                degree: "Bachelor's Degree: Computer Science",
                institution: 'Politehnica University of Bucharest',
                date: 'Oct. 2020 - Jul. 2024'
            }
        ],
        projects: [
            {
                name: 'CV Forge', tech: 'HTML, CSS, JavaScript', date: '2026',
                links: 'github.com/andrei-example/cv-forge\nLive demo | cvforge.example.com',
                bullets: 'Built a live CV builder with real-time A4 preview and print-to-PDF export.\nFeatures: photo upload, color themes, JSON import/export, localStorage autosave.'
            }
        ],
        skills: [
            { category: 'Programming', items: 'Python, JavaScript, SQL' },
            { category: 'Web', items: 'HTML, CSS, REST APIs' },
            { category: 'Tools', items: 'Git, VS Code, MS Office' },
            { category: 'Soft skills', items: 'Communication, teamwork, problem solving' }
        ]
    };
}

/* ─── STATE ───────────────────────────────────────────── */
let state = loadState();

function loadState() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return mergeWithDefaults(JSON.parse(raw));
    } catch (e) { /* corrupted data → start fresh */ }
    return defaultState();
}

function mergeWithDefaults(data) {
    const base = defaultState();
    if (!data || typeof data !== 'object') return base;
    const merged = { ...base, ...data };
    merged.personal = { ...base.personal, ...(data.personal || {}) };
    merged.titles = { ...base.titles, ...(data.titles || {}) };
    if (!THEMES[merged.theme] && merged.theme !== 'custom') merged.theme = base.theme;
    if (!/^#[0-9a-fA-F]{6}$/.test(String(merged.customColor || ''))) merged.customColor = base.customColor;
    merged.fontScale = Math.min(115, Math.max(85, Number(merged.fontScale) || 100));
    merged.showIcons = merged.showIcons !== false;
    if (!SAFE_PHOTO.test(String(merged.personal.photo || ''))) merged.personal.photo = '';
    for (const key of ['contacts', 'experience', 'education', 'projects', 'skills']) {
        if (!Array.isArray(merged[key])) merged[key] = base[key];
    }
    merged.custom = (Array.isArray(data.custom) ? data.custom : [])
        .filter(c => c && typeof c === 'object' && c.id)
        .map(c => ({
            id: String(c.id),
            title: c.title || 'Section',
            items: Array.isArray(c.items) ? c.items : []
        }));
    // section order: keep only known keys, append anything missing
    const valid = [...Object.keys(base.titles), ...merged.custom.map(c => c.id)];
    const order = (Array.isArray(data.sectionOrder) ? data.sectionOrder : base.sectionOrder)
        .filter(k => valid.includes(k));
    for (const k of valid) if (!order.includes(k)) order.push(k);
    merged.sectionOrder = order;
    return merged;
}

let saveTimer = null;
function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
        catch (e) { console.warn('Could not save to localStorage:', e); }
    }, 300);
}

/* ─── UNDO / REDO ─────────────────────────────────────── */
const HISTORY_MAX = 100;
const undoStack = [];
const redoStack = [];
/* consecutive keystrokes into the same field share one undo step */
let lastEditBind = null;
let lastEditTime = 0;

const snapshot = () => JSON.stringify(state);

function pushHistory(before) {
    undoStack.push(before);
    if (undoStack.length > HISTORY_MAX) undoStack.shift();
    redoStack.length = 0;
    updateUndoButtons();
}

function restore(json) {
    state = mergeWithDefaults(JSON.parse(json));
    lastEditBind = null;
    renderEditor();
    renderPreview();
    save();
    updateUndoButtons();
}

function undo() {
    if (!undoStack.length) return;
    redoStack.push(snapshot());
    restore(undoStack.pop());
}

function redo() {
    if (!redoStack.length) return;
    undoStack.push(snapshot());
    restore(redoStack.pop());
}

function updateUndoButtons() {
    document.getElementById('btn-undo').disabled = !undoStack.length;
    document.getElementById('btn-redo').disabled = !redoStack.length;
}

/* ─── HELPERS ─────────────────────────────────────────── */
const esc = s => String(s ?? '').replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function getPath(obj, path) {
    return path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

function setPath(obj, path, value) {
    const keys = path.split('.');
    const last = keys.pop();
    const target = keys.reduce((o, k) => o[k], obj);
    target[last] = value;
}

const bulletList = text =>
    String(text || '').split('\n').map(s => s.trim()).filter(Boolean);

/* one link per line, either "https://..." or "Label | https://..." */
function linkRow(text) {
    const links = bulletList(text).map(line => {
        const bar = line.indexOf('|');
        const label = bar === -1 ? '' : line.slice(0, bar).trim();
        const raw = bar === -1 ? line : line.slice(bar + 1).trim();
        const url = safeLink(raw);
        if (!url) return null;
        // without a label, show the bare address: readable on paper too
        const shown = label || raw.replace(/^https?:\/\//i, '').replace(/\/+$/, '');
        const icon = /\bgithub\.com/i.test(url) ? ICONS.github : ICONS.link;
        return { url, shown, icon };
    }).filter(Boolean);

    return links.length
        ? `<div class="item-links">${links.map(l =>
            `<a href="${esc(l.url)}">${state.showIcons ? l.icon : ''}${esc(l.shown)}</a>`).join('')}</div>`
        : '';
}

/* ═══════════════════════════════════════════════════════
   PREVIEW RENDERING
   ═══════════════════════════════════════════════════════ */
const cvPage = document.getElementById('cv-page');
const cvScale = document.getElementById('cv-scale');
const previewEl = document.getElementById('preview');

function renderPreview() {
    const t = state.theme === 'custom'
        ? customTheme(state.customColor)
        : (THEMES[state.theme] || THEMES.navy);
    cvPage.style.setProperty('--navy', t.navy);
    cvPage.style.setProperty('--navy-mid', t.mid);
    cvPage.style.setProperty('--cv-accent', t.mid);
    cvPage.style.setProperty('--rule', t.rule);
    cvPage.style.setProperty('--tag-bg', t.tag);
    cvPage.style.setProperty('--fs', (13 * state.fontScale / 100) + 'px');

    document.title = (state.personal.name ? state.personal.name + ' - CV' : 'CV Forge');

    const contacts = state.contacts.map(c => {
        const icon = state.showIcons ? (ICONS[c.icon] || ICONS.link) : '';
        const link = safeLink(c.link);
        const text = link
            ? `<a href="${esc(link)}">${esc(c.text)}</a>`
            : esc(c.text);
        return `<span>${icon}${text}</span>`;
    }).join('');

    const photoSrc = SAFE_PHOTO.test(state.personal.photo || '') ? state.personal.photo : '';
    const photo = photoSrc
        ? `<div class="photo-area"><img src="${esc(photoSrc)}" alt="${esc(state.personal.name)}"></div>`
        : `<div class="photo-area empty">Photo<br>(optional)</div>`;

    let html = `
    <header>
        <div class="header-info">
            <h1>${esc(state.personal.name) || '&nbsp;'}</h1>
            <div class="contact-grid">${contacts}</div>
        </div>
        ${photo}
    </header>`;

    for (const key of state.sectionOrder) html += sectionPreview(key);

    cvPage.innerHTML = html;
    updatePageMarkers();
    fitPreview();
}

/* dashed guides where each printed A4 page ends */
const PAGE_CONTENT_H = 1047; // 297mm − 2×10mm print margins @ 96dpi
const PAGE_PAD_TOP = 38;     // .cv-page top padding

function updatePageMarkers() {
    cvScale.querySelectorAll('.page-marker').forEach(m => m.remove());
    const h = cvPage.offsetHeight;
    for (let n = 1; PAGE_PAD_TOP + n * PAGE_CONTENT_H < h + 40; n++) {
        const m = document.createElement('div');
        m.className = 'page-marker';
        m.style.top = (PAGE_PAD_TOP + n * PAGE_CONTENT_H) + 'px';
        m.textContent = `A4 page ${n} ends here`;
        cvScale.appendChild(m);
    }
}

function sectionPreview(key) {
    if (key === 'summary') {
        return state.summary.trim()
            ? section('summary', `<p class="summary-text">${esc(state.summary)}</p>`)
            : '';
    }

    if (key === 'experience') {
        if (!state.experience.length) return '';
        return section('experience', state.experience.map(x => `
        <div class="item">
            <div class="item-header">
                <span>${esc(x.company)}</span>
                <span class="date">${esc(x.date)}</span>
            </div>
            <div class="item-subheader">
                <span>${esc(x.role)}</span>
                ${x.location ? `<span class="location">${state.showIcons ? ICONS.pin.replace('class="contact-icon"', 'width="10" height="10"') : ''}${esc(x.location)}</span>` : ''}
            </div>
            ${ulOf(x.bullets)}
        </div>`).join(''));
    }

    if (key === 'education') {
        if (!state.education.length) return '';
        return section('education', state.education.map(x => `
        <div class="item">
            <div class="item-header">
                <span>${esc(x.degree)}</span>
                <span class="date">${esc(x.date)}</span>
            </div>
            <div class="item-subheader"><span>${esc(x.institution)}</span></div>
        </div>`).join(''));
    }

    if (key === 'projects') {
        if (!state.projects.length) return '';
        return section('projects', state.projects.map(x => `
        <div class="item">
            <div class="item-header">
                <span>${esc(x.name)} ${x.tech ? `<span class="tech">(${esc(x.tech)})</span>` : ''}</span>
                <span class="date">${esc(x.date)}</span>
            </div>
            ${linkRow(x.links)}
            ${ulOf(x.bullets)}
        </div>`).join(''));
    }

    if (key === 'skills') {
        if (!state.skills.length) return '';
        return section('skills', `<div class="skills-grid">${
            state.skills.map(s =>
                `<div class="skill-cat"><strong>${esc(s.category)}:</strong>&nbsp;${esc(s.items)}</div>`
            ).join('')
        }</div>`);
    }

    /* custom section - shown once at least one entry has content */
    const c = state.custom.find(x => x.id === key);
    if (!c) return '';
    const items = c.items.filter(x =>
        (x.title || '').trim() || (x.sub || '').trim() || (x.date || '').trim() || bulletList(x.bullets).length);
    if (!items.length) return '';
    return `<section data-key="${esc(key)}"><h2>${state.showIcons ? SECTION_ICONS.custom : ''}${esc(c.title)}</h2>${items.map(x => `
        <div class="item">
            <div class="item-header">
                <span>${esc(x.title)}</span>
                <span class="date">${esc(x.date)}</span>
            </div>
            ${(x.sub || '').trim() ? `<div class="item-subheader"><span>${esc(x.sub)}</span></div>` : ''}
            ${ulOf(x.bullets)}
        </div>`).join('')}</section>`;
}

function section(key, inner) {
    return `<section data-key="${key}"><h2>${state.showIcons ? SECTION_ICONS[key] : ''}${esc(state.titles[key])}</h2>${inner}</section>`;
}

function ulOf(bullets) {
    const items = bulletList(bullets);
    return items.length ? `<ul>${items.map(b => `<li>${esc(b)}</li>`).join('')}</ul>` : '';
}

/* scale the A4 page down to fit narrow preview panes */
function fitPreview() {
    const available = previewEl.clientWidth - 48;
    const scale = Math.min(1, available / 794);
    cvScale.style.transform = `scale(${scale})`;
    cvScale.style.width = (794 * scale) + 'px';
    cvScale.style.height = (cvPage.offsetHeight * scale) + 'px';
}

window.addEventListener('resize', fitPreview);

/* ─── CLICK-TO-EDIT (preview → editor) ────────────────── */
/* open the editor panel for secKey, scroll to (and flash) the
   matching control; findTarget picks an element inside the panel */
function revealEditor(secKey, findTarget, focusSel) {
    const details = editorEl.querySelector(`details[data-sec="${secKey}"]`);
    if (!details) return;
    details.open = true;
    openSections.add(secKey);
    const target = (findTarget && findTarget(details)) || details;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('ed-flash');
    setTimeout(() => target.classList.remove('ed-flash'), 1400);
    if (focusSel) {
        const inp = target.querySelector(focusSel) || details.querySelector(focusSel);
        if (inp) inp.focus({ preventScroll: true });
    }
}

cvPage.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (a && (e.ctrlKey || e.metaKey)) return; // Ctrl/Cmd+click still follows the link
    if (a) e.preventDefault();

    if (e.target.closest('header')) {
        const span = e.target.closest('.contact-grid > span');
        if (span) {
            const i = [...span.parentNode.children].indexOf(span);
            return revealEditor('personal',
                d => d.querySelector(`.ed-contact[data-idx="${i}"]`),
                'input[data-bind$=".text"]');
        }
        if (e.target.closest('.photo-area'))
            return revealEditor('personal', d => d.querySelector('.photo-controls'));
        return revealEditor('personal', null, 'input[data-bind="personal.name"]');
    }

    const sec = e.target.closest('section[data-key]');
    if (!sec) return;
    const key = sec.dataset.key;

    if (e.target.closest('h2'))
        return revealEditor(key, null, 'input[data-bind^="titles."], input[data-bind$=".title"]');

    if (e.target.closest('.summary-text'))
        return revealEditor(key, null, 'textarea[data-bind="summary"]');

    const row = e.target.closest('.item, .skill-cat');
    if (row) {
        const i = [...sec.querySelectorAll('.item, .skill-cat')].indexOf(row);
        return revealEditor(key,
            d => d.querySelectorAll('.ed-item')[i],
            'input, textarea');
    }

    revealEditor(key);
});

/* ═══════════════════════════════════════════════════════
   EDITOR RENDERING
   ═══════════════════════════════════════════════════════ */
const editorEl = document.getElementById('editor');
const openSections = new Set(['personal']);

/* unique id per field, derived from its (unique) data-bind path */
const fieldId = bind => 'ed-' + bind.replace(/\./g, '-');

function field(label, bind, value, placeholder = '') {
    const id = fieldId(bind);
    return `<div class="ed-field">
        <label for="${id}">${label}</label>
        <input type="text" id="${id}" name="${id}" data-bind="${bind}" value="${esc(value)}" placeholder="${esc(placeholder)}">
    </div>`;
}

function area(label, bind, value, placeholder = '') {
    const id = fieldId(bind);
    return `<div class="ed-field">
        <label for="${id}">${label}</label>
        <textarea id="${id}" name="${id}" data-bind="${bind}" placeholder="${esc(placeholder)}">${esc(value)}</textarea>
    </div>`;
}

function itemBar(list, i, len) {
    return `<div class="ed-item-bar">
        <button class="mini-btn" data-action="move" data-list="${list}" data-idx="${i}" data-dir="-1" title="Move up" ${i === 0 ? 'disabled' : ''}>↑</button>
        <button class="mini-btn" data-action="move" data-list="${list}" data-idx="${i}" data-dir="1" title="Move down" ${i === len - 1 ? 'disabled' : ''}>↓</button>
        <button class="mini-btn del" data-action="del" data-list="${list}" data-idx="${i}" title="Delete">✕</button>
    </div>`;
}

function sectionTitleField(key) {
    return field('Section title', `titles.${key}`, state.titles[key]);
}

/* section <summary> row - drag handle to reorder, delete for custom */
function secSummary(label, key, deletable = false) {
    return `<summary><span class="drag-handle" data-drag="sec:${key}" title="Drag to reorder">⠿</span><span class="sum-label">${esc(label)}</span><span class="sum-actions">
        ${deletable ? `<button class="mini-btn del" data-action="sec-del" data-key="${key}" title="Delete section">✕</button>` : ''}
    </span></summary>`;
}

function renderEditor() {
    const s = key => openSections.has(key) ? 'open' : '';

    editorEl.innerHTML = `
    <details ${s('personal')} data-sec="personal">
        <summary>Personal Info</summary>
        <div class="ed-body">
            ${field('Full name', 'personal.name', state.personal.name)}
            <div class="ed-field"><span class="ed-label">Photo</span>
                <div class="photo-controls">
                    <div class="photo-thumb">${state.personal.photo ? `<img src="${esc(state.personal.photo)}" alt="photo">` : 'none'}</div>
                    <button class="mini-btn" data-action="photo-pick">Upload…</button>
                    ${state.personal.photo ? '<button class="mini-btn del" data-action="photo-remove">Remove</button>' : ''}
                </div>
            </div>
            <div class="ed-field"><span class="ed-label">Contact lines (icon · text · optional link)</span></div>
            ${state.contacts.map((c, i) => `
            <div class="ed-contact" data-idx="${i}">
                <span class="drag-handle" data-drag="contact:${i}" title="Drag to reorder">⠿</span>
                <select id="ed-contacts-${i}-icon" name="ed-contacts-${i}-icon" data-bind="contacts.${i}.icon" aria-label="Contact icon">
                    ${Object.keys(ICONS).map(k =>
                        `<option value="${k}" ${c.icon === k ? 'selected' : ''}>${ICON_LABELS[k]}</option>`).join('')}
                </select>
                <input type="text" id="ed-contacts-${i}-text" name="ed-contacts-${i}-text" data-bind="contacts.${i}.text" value="${esc(c.text)}" placeholder="text shown" aria-label="Contact text">
                <input type="text" class="contact-link" id="ed-contacts-${i}-link" name="ed-contacts-${i}-link" data-bind="contacts.${i}.link" value="${esc(c.link)}" placeholder="link (optional)" aria-label="Contact link">
                <button class="mini-btn del" data-action="del" data-list="contacts" data-idx="${i}" title="Delete">✕</button>
            </div>`).join('')}
            <button class="add-btn" data-action="add" data-list="contacts">+ Add contact line</button>
        </div>
    </details>

    ${state.sectionOrder.map(key => editorSection(key, s)).join('')}

    <button class="add-btn sec-add" data-action="sec-add">+ Add custom section</button>

    <details ${s('appearance')} data-sec="appearance">
        <summary>Appearance</summary>
        <div class="ed-body">
            <div class="ed-field"><span class="ed-label">Color theme</span>
                <div class="theme-swatches">
                    ${Object.entries(THEMES).map(([k, t]) =>
                        `<button class="swatch ${state.theme === k ? 'active' : ''}" data-action="theme" data-theme="${k}"
                                 style="background:${t.navy}" title="${k}"></button>`).join('')}
                    <label class="swatch swatch-custom ${state.theme === 'custom' ? 'active' : ''}" data-theme="custom"
                           title="Custom color…" style="background:${esc(state.customColor)}">
                        <input type="color" id="ed-customColor" name="ed-customColor" data-bind="customColor" value="${esc(state.customColor)}">
                    </label>
                </div>
            </div>
            <div class="ed-field">
                <label class="ed-check">
                    <input type="checkbox" id="ed-showIcons" name="ed-showIcons" data-bind="showIcons" ${state.showIcons ? 'checked' : ''}>
                    Show icons in the CV
                </label>
            </div>
            <div class="ed-field"><label for="ed-fontScale">Font size - shrink to fit one page</label>
                <div class="ed-range">
                    <input type="range" id="ed-fontScale" name="ed-fontScale" min="85" max="115" step="1" data-bind="fontScale" value="${state.fontScale}">
                    <output>${state.fontScale}%</output>
                </div>
            </div>
            <p class="ed-hint">Everything autosaves in your browser. Use Export to back up your data as JSON, and Print / PDF -> "Save as PDF" to get the final document.</p>
        </div>
    </details>

    <a class="source-link" href="https://github.com/andyhatestheworld/cv-forge/" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 00-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0020 4.77 5.07 5.07 0 0019.91 1S18.73.65 16 2.48a13.38 13.38 0 00-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 005 4.77a5.44 5.44 0 00-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 009 18.13V22"/></svg>
        View source code
    </a>`;
}

function editorSection(key, s) {
    if (key === 'summary') return `
    <details ${s('summary')} data-sec="summary">
        ${secSummary('Summary', 'summary')}
        <div class="ed-body">
            ${sectionTitleField('summary')}
            ${area('Short profile text (leave empty to hide the section)', 'summary', state.summary)}
        </div>
    </details>`;

    if (key === 'experience') return `
    <details ${s('experience')} data-sec="experience">
        ${secSummary('Experience', 'experience')}
        <div class="ed-body">
            ${sectionTitleField('experience')}
            ${state.experience.map((x, i, arr) => `
            <div class="ed-item">
                ${itemBar('experience', i, arr.length)}
                <div class="ed-row">
                    ${field('Company', `experience.${i}.company`, x.company)}
                    ${field('Period', `experience.${i}.date`, x.date, 'Jan. 2024 - Present')}
                </div>
                <div class="ed-row">
                    ${field('Role', `experience.${i}.role`, x.role)}
                    ${field('Location', `experience.${i}.location`, x.location)}
                </div>
                ${area('Responsibilities - one bullet per line', `experience.${i}.bullets`, x.bullets)}
            </div>`).join('')}
            <button class="add-btn" data-action="add" data-list="experience">+ Add experience</button>
        </div>
    </details>`;

    if (key === 'education') return `
    <details ${s('education')} data-sec="education">
        ${secSummary('Education', 'education')}
        <div class="ed-body">
            ${sectionTitleField('education')}
            ${state.education.map((x, i, arr) => `
            <div class="ed-item">
                ${itemBar('education', i, arr.length)}
                ${field('Degree / program', `education.${i}.degree`, x.degree)}
                <div class="ed-row">
                    ${field('Institution', `education.${i}.institution`, x.institution)}
                    ${field('Period', `education.${i}.date`, x.date)}
                </div>
            </div>`).join('')}
            <button class="add-btn" data-action="add" data-list="education">+ Add education</button>
        </div>
    </details>`;

    if (key === 'projects') return `
    <details ${s('projects')} data-sec="projects">
        ${secSummary('Projects', 'projects')}
        <div class="ed-body">
            ${sectionTitleField('projects')}
            ${state.projects.map((x, i, arr) => `
            <div class="ed-item">
                ${itemBar('projects', i, arr.length)}
                <div class="ed-row">
                    ${field('Project name', `projects.${i}.name`, x.name)}
                    ${field('Year', `projects.${i}.date`, x.date)}
                </div>
                ${field('Tech stack', `projects.${i}.tech`, x.tech, 'PHP, SQLite, Stripe API')}
                ${area('Links - one per line, or "Label | link"', `projects.${i}.links`, x.links,
                       'github.com/you/project\nLive demo | myproject.com')}
                ${area('Description - one bullet per line', `projects.${i}.bullets`, x.bullets)}
            </div>`).join('')}
            <button class="add-btn" data-action="add" data-list="projects">+ Add project</button>
        </div>
    </details>`;

    if (key === 'skills') return `
    <details ${s('skills')} data-sec="skills">
        ${secSummary('Skills', 'skills')}
        <div class="ed-body">
            ${sectionTitleField('skills')}
            ${state.skills.map((x, i, arr) => `
            <div class="ed-item">
                ${itemBar('skills', i, arr.length)}
                <div class="ed-row">
                    ${field('Category', `skills.${i}.category`, x.category)}
                    ${field('Items', `skills.${i}.items`, x.items, 'Python, SQL, Git')}
                </div>
            </div>`).join('')}
            <button class="add-btn" data-action="add" data-list="skills">+ Add skill category</button>
        </div>
    </details>`;

    /* custom section editor */
    const ci = state.custom.findIndex(c => c.id === key);
    if (ci === -1) return '';
    const c = state.custom[ci];
    return `
    <details ${s(key)} data-sec="${key}">
        ${secSummary(c.title || 'Custom section', key, true)}
        <div class="ed-body">
            ${field('Section title', `custom.${ci}.title`, c.title)}
            <p class="ed-hint">The section appears in the CV once at least one entry below has content. Leave "Subtitle" and "Details" empty for simple one-line entries.</p>
            ${c.items.map((x, i, arr) => `
            <div class="ed-item">
                ${itemBar(`custom.${ci}.items`, i, arr.length)}
                <div class="ed-row">
                    ${field('Title', `custom.${ci}.items.${i}.title`, x.title)}
                    ${field('Date / period', `custom.${ci}.items.${i}.date`, x.date)}
                </div>
                ${field('Subtitle (optional)', `custom.${ci}.items.${i}.sub`, x.sub)}
                ${area('Details - one bullet per line', `custom.${ci}.items.${i}.bullets`, x.bullets)}
            </div>`).join('')}
            <button class="add-btn" data-action="add" data-list="custom.${ci}.items">+ Add entry</button>
        </div>
    </details>`;
}

/* new-item templates */
const NEW_ITEM = {
    contacts:   () => ({ icon: 'link', text: '', link: '' }),
    experience: () => ({ company: '', role: '', location: '', date: '', bullets: '' }),
    education:  () => ({ degree: '', institution: '', date: '' }),
    projects:   () => ({ name: '', tech: '', date: '', links: '', bullets: '' }),
    skills:     () => ({ category: '', items: '' })
};

/* lists like "custom.0.items" get the generic custom-entry template */
function newItemFor(list) {
    return NEW_ITEM[list] ? NEW_ITEM[list]() : { title: '', sub: '', date: '', bullets: '' };
}

/* ─── EDITOR EVENTS (delegated) ───────────────────────── */
editorEl.addEventListener('input', e => {
    const bind = e.target.dataset.bind;
    if (!bind) return;
    const before = snapshot();
    let value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    if (bind === 'fontScale') {
        value = Number(value);
        e.target.closest('.ed-range').querySelector('output').textContent = value + '%';
    }
    const now = Date.now();
    if (bind !== lastEditBind || now - lastEditTime > 1200) pushHistory(before);
    lastEditBind = bind;
    lastEditTime = now;
    setPath(state, bind, value);
    if (bind === 'customColor') {
        state.theme = 'custom';
        e.target.closest('.swatch').style.background = value;
        editorEl.querySelectorAll('.swatch').forEach(b =>
            b.classList.toggle('active', b.dataset.theme === 'custom'));
    }
    if (/^custom\.\d+\.title$/.test(bind)) {
        // keep the panel header label in sync while typing
        const label = e.target.closest('details').querySelector('.sum-label');
        label.textContent = value || 'Custom section';
    }
    renderPreview();
    save();
});

editorEl.addEventListener('click', e => {
    if (e.target.closest('.drag-handle')) { e.preventDefault(); return; }
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.closest('summary')) e.preventDefault(); // don't toggle the panel
    const { action, list, idx, dir, theme, key } = btn.dataset;

    if (action === 'photo-pick') {
        document.getElementById('photo-file').click();
        return;
    }

    const before = snapshot();

    if (action === 'add') {
        getPath(state, list).push(newItemFor(list));
    } else if (action === 'del') {
        getPath(state, list).splice(Number(idx), 1);
    } else if (action === 'move') {
        const i = Number(idx), j = i + Number(dir);
        const arr = getPath(state, list);
        if (j < 0 || j >= arr.length) return;
        [arr[i], arr[j]] = [arr[j], arr[i]];
    } else if (action === 'sec-add') {
        const id = 'custom-' + Date.now().toString(36);
        state.custom.push({
            id, title: 'New Section',
            items: [{ title: '', sub: '', date: '', bullets: '' }]
        });
        state.sectionOrder.push(id);
        openSections.add(id);
    } else if (action === 'sec-del') {
        if (!confirm('Delete this section and all its entries?')) return;
        state.custom = state.custom.filter(c => c.id !== key);
        state.sectionOrder = state.sectionOrder.filter(k => k !== key);
        openSections.delete(key);
    } else if (action === 'theme') {
        state.theme = theme;
    } else if (action === 'photo-remove') {
        state.personal.photo = '';
    } else {
        return;
    }
    pushHistory(before);
    lastEditBind = null;
    renderEditor();
    renderPreview();
    save();
});

/* ─── DRAG & DROP (sections + contact lines, mouse and touch) ── */
let dragInfo = null;      // { type: 'sec' | 'contact', id, pointerId, startY, x, active }
let dragSnapshot = null;  // state before the drag, pushed on a real drop

function moveInArray(arr, from, to) {
    const [item] = arr.splice(from, 1);
    if (from < to) to--;
    arr.splice(Math.max(0, Math.min(arr.length, to)), 0, item);
}

function clearDropMarks() {
    editorEl.querySelectorAll('.drop-above, .drop-below')
        .forEach(el => el.classList.remove('drop-above', 'drop-below'));
}

const isBelow = (y, el) => {
    const r = el.getBoundingClientRect();
    return y >= r.top + r.height / 2;
};

/* the drop target under a screen point (HTML5 drag events never fire on
   touch, so the whole drag runs on pointer events instead) */
function targetAtPoint(x, y, type) {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    if (type === 'sec') {
        const d = el.closest('details[data-sec]');
        return d && state.sectionOrder.includes(d.dataset.sec) ? d : null;
    }
    return el.closest('.ed-contact');
}

/* keep scrolling the editor while the pointer rests near its edges */
let lastPointerY = 0;
let scrollRAF = null;

function autoScroll() {
    if (!dragInfo || !dragInfo.active) { scrollRAF = null; return; }
    const r = editorEl.getBoundingClientRect();
    const edge = 46;
    if (lastPointerY < r.top + edge) editorEl.scrollTop -= 9;
    else if (lastPointerY > r.bottom - edge) editorEl.scrollTop += 9;
    scrollRAF = requestAnimationFrame(autoScroll);
}

function endDrag(commit, y) {
    const info = dragInfo;
    dragInfo = null;
    if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = null; }
    clearDropMarks();
    editorEl.querySelectorAll('.dragging').forEach(el => el.classList.remove('dragging'));
    if (!info || !info.active) return;

    const t = commit ? targetAtPoint(info.x, y, info.type) : null;
    if (t) {
        if (info.type === 'sec') {
            const order = state.sectionOrder;
            const from = order.indexOf(info.id);
            const to = order.indexOf(t.dataset.sec) + (isBelow(y, t) ? 1 : 0);
            if (from !== -1) moveInArray(order, from, to);
        } else {
            moveInArray(state.contacts, Number(info.id), Number(t.dataset.idx) + (isBelow(y, t) ? 1 : 0));
        }
    }

    if (snapshot() !== dragSnapshot) {
        pushHistory(dragSnapshot);
        lastEditBind = null;
        renderEditor();
        renderPreview();
        save();
    }
}

editorEl.addEventListener('pointerdown', e => {
    const h = e.target.closest && e.target.closest('.drag-handle');
    if (!h || (e.pointerType === 'mouse' && e.button !== 0)) return;
    const [type, id] = h.dataset.drag.split(':');
    dragInfo = { type, id, pointerId: e.pointerId, startY: e.clientY, x: e.clientX, active: false };
    dragSnapshot = snapshot();
    lastPointerY = e.clientY;
    h.setPointerCapture(e.pointerId);
});

editorEl.addEventListener('pointermove', e => {
    if (!dragInfo || e.pointerId !== dragInfo.pointerId) return;
    lastPointerY = e.clientY;
    dragInfo.x = e.clientX;

    /* a few pixels of movement separate a drag from a stray tap */
    if (!dragInfo.active) {
        if (Math.abs(e.clientY - dragInfo.startY) < 6) return;
        dragInfo.active = true;
        const h = e.target.closest('.drag-handle');
        const block = dragInfo.type === 'sec' ? h.closest('details') : h.closest('.ed-contact');
        if (block) block.classList.add('dragging');
        if (!scrollRAF) scrollRAF = requestAnimationFrame(autoScroll);
    }
    e.preventDefault();

    const t = targetAtPoint(e.clientX, e.clientY, dragInfo.type);
    clearDropMarks();
    if (t) t.classList.add(isBelow(e.clientY, t) ? 'drop-below' : 'drop-above');
});

editorEl.addEventListener('pointerup', e => {
    if (!dragInfo || e.pointerId !== dragInfo.pointerId) return;
    endDrag(true, e.clientY);
});

editorEl.addEventListener('pointercancel', e => {
    if (!dragInfo || e.pointerId !== dragInfo.pointerId) return;
    endDrag(false, e.clientY);
});

/* remember which editor sections are open across re-renders */
editorEl.addEventListener('toggle', e => {
    const sec = e.target.dataset && e.target.dataset.sec;
    if (!sec) return;
    if (e.target.open) openSections.add(sec);
    else openSections.delete(sec);
}, true);

/* ─── PHOTO UPLOAD (resized via canvas → dataURL) ─────── */
document.getElementById('photo-file').addEventListener('change', e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const img = new Image();
    img.onload = () => {
        const MAX_W = 440; // 4× display size, plenty for print
        const scale = Math.min(1, MAX_W / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        pushHistory(snapshot());
        lastEditBind = null;
        state.personal.photo = canvas.toDataURL('image/jpeg', 0.88);
        URL.revokeObjectURL(img.src);
        renderEditor();
        renderPreview();
        save();
    };
    img.onerror = () => {
        URL.revokeObjectURL(img.src);
        alert('Could not read that image file.');
    };
    img.src = URL.createObjectURL(file);
});

/* ─── TOOLBAR ─────────────────────────────────────────── */
document.getElementById('btn-print').addEventListener('click', () => window.print());

/* overflow menu - holds Import/Export/Reset on narrow screens */
const moreBtn = document.getElementById('btn-more');
const overflowMenu = document.getElementById('tb-overflow');

function closeOverflow() {
    if (!overflowMenu.classList.contains('open')) return;
    overflowMenu.classList.remove('open');
    moreBtn.setAttribute('aria-expanded', 'false');
}

moreBtn.addEventListener('click', e => {
    e.stopPropagation();
    const open = overflowMenu.classList.toggle('open');
    moreBtn.setAttribute('aria-expanded', String(open));
});

/* close after picking an action, on an outside click, on Escape or resize */
overflowMenu.addEventListener('click', e => { if (e.target.closest('.tb-btn')) closeOverflow(); });
document.addEventListener('click', e => { if (!overflowMenu.contains(e.target)) closeOverflow(); });
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverflow(); });
window.addEventListener('resize', closeOverflow);

document.getElementById('btn-undo').addEventListener('click', undo);
document.getElementById('btn-redo').addEventListener('click', redo);

/* Ctrl/Cmd+Z / +Y - outside form fields, where native undo applies */
window.addEventListener('keydown', e => {
    if (!(e.ctrlKey || e.metaKey)) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
    const k = e.key.toLowerCase();
    if (k === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
    else if (k === 'y' || (k === 'z' && e.shiftKey)) { e.preventDefault(); redo(); }
});

document.getElementById('btn-export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const name = (state.personal.name || 'cv').trim().replace(/\s+/g, '_');
    a.download = `cvforge_${name}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
});

document.getElementById('btn-import').addEventListener('click', () =>
    document.getElementById('import-file').click());

document.getElementById('import-file').addEventListener('change', e => {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
        try {
            const imported = mergeWithDefaults(JSON.parse(reader.result));
            pushHistory(snapshot());
            lastEditBind = null;
            state = imported;
            renderEditor();
            renderPreview();
            save();
        } catch (err) {
            alert('That file is not a valid CV Forge JSON export.');
        }
    };
    reader.readAsText(file);
});

document.getElementById('btn-reset').addEventListener('click', () => {
    if (!confirm('Reset everything to the example CV? Your current data will be lost.')) return;
    pushHistory(snapshot());
    lastEditBind = null;
    state = defaultState();
    renderEditor();
    renderPreview();
    save();
});

/* ─── INIT ────────────────────────────────────────────── */
renderEditor();
renderPreview();
updateUndoButtons();
