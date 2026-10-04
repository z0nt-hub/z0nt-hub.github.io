window.onload = function () {
    document.body.classList.add('loaded_hiding');
    setTimeout(function () {
        document.body.classList.add('loaded');
        document.body.classList.remove('loaded_hiding');
    }, 400);
};

document.addEventListener('DOMContentLoaded', function () {
    const header = document.querySelector('header');
    window.addEventListener('scroll', function () {
        header.classList.toggle('sticky', window.scrollY > 20);
    });
});

const faqs = document.querySelectorAll('.faq');
faqs.forEach(faq => {
    faq.addEventListener('click', () => {
        faq.classList.toggle('active');
    });
});

const imageModal = document.getElementById('imageModal');
const modalImg = document.getElementById('modalImg');
const closeImageModal = document.getElementById('closeImageModal');

function openPreview(src) {
    if (!imageModal || !modalImg) return;
    modalImg.src = src;
    imageModal.classList.add('active');
}

if (closeImageModal) {
    closeImageModal.addEventListener('click', () => {
        imageModal.classList.remove('active');
    });
}

if (imageModal) {
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            imageModal.classList.remove('active');
        }
    });
}

let allPresets = [];

async function loadCatalog() {
    try {
        const res = await fetch(`configs.json?t=${Date.now()}`);
        allPresets = await res.json();
        renderPresets(allPresets);
    } catch {
        document.getElementById('scriptsContainer').innerHTML = 
            '<p style="color: var(--danger-color); text-align: center; grid-column: 1/-1;">Не удалось загрузить configs.json</p>';
    }
}

function renderPresets(presets) {
    const container = document.getElementById('scriptsContainer');
    container.innerHTML = '';

    if (presets.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); text-align: center; grid-column: 1/-1;">Ничего не найдено</p>';
        return;
    }

    presets.forEach(item => {
        const isTheme = item.type === 'theme';
        const typeBadge = isTheme ? 'Тема' : 'Конфиг';

        const previewHtml = item.image ? `
            <div class="card-preview" onclick="openPreview('${item.image}')">
                <img src="${item.image}" alt="${item.name}">
            </div>
        ` : '';

        const card = document.createElement('div');
        card.className = 'script-card';
        card.innerHTML = `
            <div>
                ${previewHtml}
                <div class="card-header">
                    <span class="card-title">${item.name}</span>
                    <span class="card-version">${typeBadge}</span>
                </div>
                <div class="card-author">Автор: ${item.author} &bull; <span style="color: var(--main-color);">${item.tag}</span></div>
                <p class="card-desc">${item.description}</p>
            </div>
            <div class="card-actions">
                <button class="install-btn" id="copy-btn-${item.id}" onclick="copyCode('${item.id}', this)">
                    <i class='bx bx-copy'></i> Скопировать
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

async function copyCode(id, btnElement) {
    const preset = allPresets.find(p => p.id === id);
    if (!preset || !preset.code) return;

    try {
        await navigator.clipboard.writeText(preset.code);
        btnElement.classList.add('success');
        btnElement.innerHTML = `<i class='bx bx-check'></i> Скопировано!`;

        setTimeout(() => {
            btnElement.classList.remove('success');
            btnElement.innerHTML = `<i class='bx bx-copy'></i> Скопировать`;
        }, 1800);
    } catch {
        const textarea = document.createElement('textarea');
        textarea.value = preset.code;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);

        btnElement.classList.add('success');
        btnElement.innerHTML = `<i class='bx bx-check'></i> Скопировано!`;
        setTimeout(() => {
            btnElement.classList.remove('success');
            btnElement.innerHTML = `<i class='bx bx-copy'></i> Скопировать`;
        }, 1800);
    }
}

const searchInput = document.getElementById('searchInput');
let currentType = 'all';

function applyFilter() {
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const filtered = allPresets.filter(p => {
        const matchesType = currentType === 'all' || p.type === currentType;
        const matchesQuery = p.name.toLowerCase().includes(query) || 
                             p.author.toLowerCase().includes(query) || 
                             p.description.toLowerCase().includes(query) ||
                             p.tag.toLowerCase().includes(query);
        return matchesType && matchesQuery;
    });
    renderPresets(filtered);
}

if (searchInput) {
    searchInput.addEventListener('input', applyFilter);
}

const filterBtns = document.querySelectorAll('.filter-btn');
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        currentType = btn.getAttribute('data-type');
        applyFilter();
    });
});

loadCatalog();