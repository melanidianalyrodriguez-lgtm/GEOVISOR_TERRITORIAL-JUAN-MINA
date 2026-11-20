// Pega aquí un token personal de Jawg para habilitar el mapa Sunny.
var JAWG_TOKEN = '';

var map = L.map('map', {
  zoomControl: false,
  minZoom: 3,
  attributionControl: true,
  preferCanvas: true
}).setView([10.9594, -74.8897], 16);
var initialTerritoryCenter = L.latLng(10.9594, -74.8897);

var welcomeNotice = document.getElementById('welcome-notice');
var functionalityNotice = document.getElementById('functionality-notice');
var guidedTour = document.getElementById('guided-tour');
var welcomeClose = document.getElementById('close-welcome-notice');
var welcomeOpener = document.getElementById('open-welcome-guide');
var tourSteps = [
  { icon: '▤', target: '#basemap-gallery-toggle', title: 'Capas y mapas base', description: 'En el panel derecho activa las capas territoriales y abre “Mapa base” para elegir Imágenes, Calles, National Geographic, Topográfico o Sunny.' },
  { icon: '⌖', target: '.earth-navigation-control', title: 'Navega por el mapa', description: 'La brújula desplaza el mapa hacia los puntos cardinales y lo centra en Juan Mina. Usa los botones o la barra para acercar y alejar.' },
  { icon: '✎', target: '.drawing-toolbar', title: 'Dibuja y mide', description: 'Crea puntos, líneas o polígonos; usa Medir para calcular distancias y áreas y selecciona sus unidades en la misma barra.' },
  { icon: '↔', target: '#split-toggle', title: 'Compara mapas', description: 'Activa “Divisor” para comparar Imágenes y Calles. Cambia la orientación y arrastra la línea para ajustar la comparación.' },
  { icon: '◉', target: '#street-view-toggle', title: 'Street View', description: 'Abre Street View en su propia pestaña del panel inferior. Selecciona una ubicación en el mapa y navega por las panorámicas disponibles.' },
  { icon: '✦', target: '#drawing-style-toggle', title: 'Estilo del dibujo', description: 'Abre su pestaña para personalizar color, grosor, patrón, relleno y tamaño de los elementos que dibujaste.' },
  { icon: 'Aa', target: '#labels-toggle', title: 'Etiquetas', description: 'Configura rótulos por campo o expresión, su estilo y posición. El botón abre una pestaña independiente.' },
  { icon: '▦', target: '#attributes-toggle', title: 'Tabla y paneles', description: 'Consulta, filtra y selecciona atributos en la Tabla. Street View, Tabla, Exportar mapa, Estilo dibujo y Etiquetas abren pestañas independientes.' },
  { icon: '⌁', target: '#vector-layer', title: 'Análisis del territorio', description: 'En Herramientas GIS ajusta color y opacidad, clasificación, buffer e intersección. El Análisis estadístico está en “Funciones avanzadas” del panel derecho; el botón Manual permite volver a esta guía.' }
];
var tourStepIndex = 0;
var tourSpotlight = document.createElement('div');
tourSpotlight.id = 'tour-spotlight';
tourSpotlight.setAttribute('aria-hidden', 'true');
tourSpotlight.hidden = true;
document.body.appendChild(tourSpotlight);
function positionGuidedTour() {
  if (guidedTour.hidden) return;
  var card = guidedTour.querySelector('.tour-card');
  var step = tourSteps[tourStepIndex];
  var target = step.target ? document.querySelector(step.target) : null;
  if (target && !target.closest('[hidden]')) {
    var targetRect = target.getBoundingClientRect();
    if (!targetRect.width || !targetRect.height || targetRect.bottom < 0 || targetRect.right < 0 || targetRect.top > window.innerHeight || targetRect.left > window.innerWidth) target = null;
  } else target = null;
  if (!target) {
    tourSpotlight.hidden = true;
    card.dataset.placement = 'center';
    card.style.left = '50%'; card.style.top = '50%'; card.style.transform = 'translate(-50%, -50%)';
    return;
  }
  var rect = target.getBoundingClientRect();
  var pad = 7;
  tourSpotlight.hidden = false;
  tourSpotlight.style.left = Math.max(5, rect.left - pad) + 'px';
  tourSpotlight.style.top = Math.max(5, rect.top - pad) + 'px';
  tourSpotlight.style.width = Math.min(window.innerWidth - 10, rect.width + pad * 2) + 'px';
  tourSpotlight.style.height = Math.min(window.innerHeight - 10, rect.height + pad * 2) + 'px';
  card.style.transform = 'none';
  var cardRect = card.getBoundingClientRect();
  var gap = 16;
  var placeAbove = rect.top >= cardRect.height + gap + 18;
  var top = placeAbove ? rect.top - cardRect.height - gap : rect.bottom + gap;
  if (top + cardRect.height > window.innerHeight - 12) { top = rect.top - cardRect.height - gap; placeAbove = true; }
  top = Math.max(12, Math.min(window.innerHeight - cardRect.height - 12, top));
  var centerX = rect.left + rect.width / 2;
  var left = Math.max(12, Math.min(window.innerWidth - cardRect.width - 12, centerX - cardRect.width / 2));
  card.style.left = left + 'px'; card.style.top = top + 'px';
  card.dataset.placement = placeAbove ? 'above' : 'below';
  card.style.setProperty('--tour-arrow-x', Math.max(20, Math.min(cardRect.width - 20, centerX - left)) + 'px');
}
function scheduleGuidedTourPosition() { window.requestAnimationFrame(positionGuidedTour); }
function closeWelcomeNotice() {
  welcomeNotice.hidden = true;
  welcomeOpener.focus();
}
function openFunctionalityNotice() {
  welcomeNotice.hidden = true;
  functionalityNotice.hidden = false;
  document.getElementById('close-functionality-notice').focus();
}
function closeFunctionalityNotice() {
  functionalityNotice.hidden = true;
  if (typeof closeToolPanel === 'function') closeToolPanel(functionalityNotice);
  welcomeOpener.focus();
}
function renderTourStep() {
  var step = tourSteps[tourStepIndex];
  document.getElementById('tour-step-count').textContent = 'Paso ' + (tourStepIndex + 1) + ' de ' + tourSteps.length;
  document.getElementById('tour-step-icon').textContent = step.icon;
  document.getElementById('tour-step-title').textContent = step.title;
  document.getElementById('tour-step-description').textContent = step.description;
  document.getElementById('tour-progress-fill').style.width = ((tourStepIndex + 1) / tourSteps.length * 100) + '%';
  document.getElementById('tour-back').disabled = tourStepIndex === 0;
  document.getElementById('tour-next').textContent = tourStepIndex === tourSteps.length - 1 ? 'Terminar ✓' : 'Siguiente →';
  var card = guidedTour.querySelector('.tour-card');
  if (card.animate) card.animate([{ opacity: .72, transform: 'translateY(7px) scale(.985)' }, { opacity: 1, transform: 'translateY(0) scale(1)' }], { duration: 220, easing: 'ease-out' });
  scheduleGuidedTourPosition();
}
function openGuidedTour() {
  welcomeNotice.hidden = true;
  functionalityNotice.hidden = true;
  if (typeof closeToolPanel === 'function') closeToolPanel(functionalityNotice);
  tourStepIndex = 0;
  renderTourStep();
  guidedTour.hidden = false;
  scheduleGuidedTourPosition();
  document.getElementById('close-guided-tour').focus();
}
function closeGuidedTour() {
  guidedTour.hidden = true;
  tourSpotlight.hidden = true;
  welcomeOpener.focus();
}
document.getElementById('tour-close-action').addEventListener('click', closeGuidedTour);
window.addEventListener('resize', scheduleGuidedTourPosition);
window.addEventListener('scroll', scheduleGuidedTourPosition, true);
document.getElementById('tour-back').addEventListener('click', function () {
  if (tourStepIndex > 0) { tourStepIndex--; renderTourStep(); }
});
document.getElementById('tour-next').addEventListener('click', function () {
  if (tourStepIndex < tourSteps.length - 1) { tourStepIndex++; renderTourStep(); }
  else closeGuidedTour();
});
welcomeNotice.hidden = false;
welcomeClose.focus();
welcomeClose.addEventListener('click', closeWelcomeNotice);
document.getElementById('skip-to-map').addEventListener('click', closeWelcomeNotice);
document.getElementById('show-tutorial').addEventListener('click', openGuidedTour);
document.getElementById('start-exploring').addEventListener('click', closeFunctionalityNotice);
document.getElementById('close-functionality-notice').addEventListener('click', closeFunctionalityNotice);
document.getElementById('start-guided-tour').addEventListener('click', openGuidedTour);
document.getElementById('close-guided-tour').addEventListener('click', closeGuidedTour);
welcomeOpener.addEventListener('click', function () {
  openFunctionalityNotice();
  openToolPanel(functionalityNotice);
});
welcomeNotice.addEventListener('click', function (event) { if (event.target === welcomeNotice) closeWelcomeNotice(); });
functionalityNotice.addEventListener('click', function (event) { if (event.target === functionalityNotice) closeFunctionalityNotice(); });
guidedTour.addEventListener('click', function (event) { if (event.target === guidedTour) closeGuidedTour(); });
document.addEventListener('keydown', function (event) {
  if (event.key !== 'Escape') return;
  if (!guidedTour.hidden) closeGuidedTour();
  else if (!functionalityNotice.hidden) closeFunctionalityNotice();
  else if (!welcomeNotice.hidden) closeWelcomeNotice();
  else if (!labelsPanel.hidden) { toggleLabelsPanel(false); labelsToggle.focus(); }
});

var dashboard = document.getElementById('project-dashboard');
var dashboardToggle = document.getElementById('dashboard-toggle');
var leftPanelToggle = document.getElementById('left-panel-toggle');
var mapOverlayPanel = document.getElementById('map-overlay');
if (window.matchMedia('(max-width: 720px)').matches) {
  dashboard.hidden = true;
  document.body.classList.add('dashboard-hidden', 'left-panel-hidden');
  dashboardToggle.setAttribute('aria-expanded', 'false');
  dashboardToggle.setAttribute('aria-label', 'Mostrar capas y panel del proyecto');
  dashboardToggle.title = 'Mostrar capas y panel del proyecto';
  leftPanelToggle.setAttribute('aria-expanded', 'false');
  leftPanelToggle.setAttribute('aria-label', 'Mostrar panel izquierdo');
  leftPanelToggle.title = 'Mostrar panel izquierdo';
  leftPanelToggle.textContent = '\u203a';
}
dashboardToggle.addEventListener('click', function () {
  dashboard.hidden = !dashboard.hidden;
  dashboardToggle.setAttribute('aria-expanded', String(!dashboard.hidden));
  dashboardToggle.setAttribute('aria-label', dashboard.hidden ? 'Mostrar capas y panel del proyecto' : 'Ocultar capas y panel del proyecto');
  dashboardToggle.title = dashboard.hidden ? 'Mostrar capas y panel del proyecto' : 'Ocultar capas y panel del proyecto';
  document.body.classList.toggle('dashboard-hidden', dashboard.hidden);
  layoutToolDock();
  window.setTimeout(function () { map.invalidateSize(); }, 220);
});
leftPanelToggle.addEventListener('click', function () {
  var isHidden = document.body.classList.toggle('left-panel-hidden');
  leftPanelToggle.setAttribute('aria-expanded', String(!isHidden));
  leftPanelToggle.setAttribute('aria-label', isHidden ? 'Mostrar panel izquierdo' : 'Ocultar panel izquierdo');
  leftPanelToggle.title = isHidden ? 'Mostrar panel izquierdo' : 'Ocultar panel izquierdo';
  leftPanelToggle.textContent = isHidden ? '\u203a' : '\u2039';
  layoutToolDock();
  window.setTimeout(function () { map.invalidateSize(); }, 220);
});


var sideToolPanelIds = ['street-view-panel', 'map-export-panel', 'labels-panel', 'drawing-style-panel', 'attribute-table', 'functionality-notice', 'statistics-chart-panel'];
var sideToolButtons = {
  'street-view-panel': 'street-view-toggle', 'map-export-panel': 'save-map',
  'labels-panel': 'labels-toggle', 'drawing-style-panel': 'drawing-style-toggle',
  'attribute-table': 'attributes-toggle',
  'functionality-notice': 'open-welcome-guide', 'spatial-analysis-panel': 'spatial-info-expand'
};
var toolPanelLabels = {
  'street-view-panel': 'Street View', 'map-export-panel': 'Exportar mapa',
  'labels-panel': 'Etiquetas', 'drawing-style-panel': 'Estilo dibujo',
  'functionality-notice': 'Manual', 'statistics-chart-panel': 'Gráfico'
};
var toolPanelIcons = {
  'street-view-panel': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20v-2a7 7 0 0 1 14 0v2M12 11v7"/></svg>',
  'map-export-panel': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/></svg>',
  'labels-panel': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16M4 10h11M4 15h16M4 20h11"/><circle cx="19" cy="10" r="1"/></svg>',
  'drawing-style-panel': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 6 4 4M4 20l4-.8L19 8a2.8 2.8 0 0 0-4-4L4 15zM4 20h16"/></svg>',
  'attribute-table': '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M9 9v11m6-11v11"/></svg>',
  'functionality-notice': '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5m0-8h.01"/></svg>',
  'statistics-chart-panel': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5m0 14h17M8 15l3-4 3 2 5-7"/><circle cx="8" cy="15" r="1"/><circle cx="11" cy="11" r="1"/><circle cx="14" cy="13" r="1"/><circle cx="19" cy="6" r="1"/></svg>',
  'spatial-analysis-panel': '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5h18v14H3zM8 5v14m8-14v14M3 10h18m-18 5h18"/></svg>'
};
toolPanelLabels['spatial-analysis-panel'] = 'Análisis espacial';
var openToolPanelIds = [];
var activeToolPanelId = null;
var toolDock = document.createElement('section');
toolDock.className = 'tool-panels-dock'; toolDock.id = 'tool-panels-dock'; toolDock.hidden = true;
toolDock.setAttribute('role', 'dialog'); toolDock.setAttribute('aria-label', 'Paneles de herramientas');
var toolDockResize = document.createElement('div');
toolDockResize.className = 'tool-panels-dock-resize'; toolDockResize.setAttribute('role', 'separator');
toolDockResize.setAttribute('aria-orientation', 'horizontal'); toolDockResize.setAttribute('aria-label', 'Arrastrar para cambiar la altura del panel');
var toolDockHeader = document.createElement('header'); toolDockHeader.className = 'tool-panels-dock-header';
var toolDockTabs = document.createElement('div'); toolDockTabs.className = 'tool-panels-tabs'; toolDockTabs.setAttribute('role', 'tablist');
var toolDockExpand = document.createElement('button'); toolDockExpand.type = 'button'; toolDockExpand.className = 'tool-panels-dock-expand';
toolDockExpand.textContent = '\u2922'; toolDockExpand.title = 'Ampliar panel a todo el ancho'; toolDockExpand.setAttribute('aria-label', toolDockExpand.title);
var toolDockReduce = document.createElement('button'); toolDockReduce.type = 'button'; toolDockReduce.className = 'tool-panels-dock-reduce';
toolDockReduce.textContent = '\u2212'; toolDockReduce.title = 'Volver al tamaño normal'; toolDockReduce.setAttribute('aria-label', toolDockReduce.title);
var toolDockMinimize = document.createElement('button'); toolDockMinimize.type = 'button'; toolDockMinimize.className = 'tool-panels-dock-minimize';
toolDockMinimize.textContent = '\u25a1'; toolDockMinimize.title = 'Minimizar panel'; toolDockMinimize.setAttribute('aria-label', toolDockMinimize.title);
var toolDockClose = document.createElement('button'); toolDockClose.type = 'button'; toolDockClose.className = 'tool-panels-dock-close';
toolDockClose.textContent = '\u00d7'; toolDockClose.setAttribute('aria-label', 'Cerrar panel activo');
toolDockHeader.appendChild(toolDockTabs); toolDockHeader.appendChild(toolDockExpand); toolDockHeader.appendChild(toolDockReduce); toolDockHeader.appendChild(toolDockMinimize); toolDockHeader.appendChild(toolDockClose);
var toolDockContent = document.createElement('div'); toolDockContent.className = 'tool-panels-dock-content';
toolDock.appendChild(toolDockResize); toolDock.appendChild(toolDockHeader); toolDock.appendChild(toolDockContent);
document.body.appendChild(toolDock);
sideToolPanelIds.forEach(function (id) { var panel = document.getElementById(id); if (panel) toolDockContent.appendChild(panel); });

function layoutToolDock() {
  if (toolDock.hidden) return;
  var desktop = window.innerWidth > 720;
  var left = desktop && mapOverlayPanel && !document.body.classList.contains('left-panel-hidden')
    ? mapOverlayPanel.getBoundingClientRect().right : 0;
  var rightEdge = desktop && dashboard && !dashboard.hidden
    ? dashboard.getBoundingClientRect().left : window.innerWidth;
  var width = Math.max(0, rightEdge - left);
  toolDock.style.left = left + 'px';
  toolDock.style.right = 'auto';
  toolDock.style.width = width + 'px';
  if (toolDock.classList.contains('is-minimized')) toolDock.style.height = '78px';
  else if (!toolDock.dataset.userHeight) toolDock.style.height = toolDock.classList.contains('is-expanded') ? '70dvh' : '50dvh';
  toolDock.style.top = 'auto'; toolDock.style.bottom = '0px'; toolDock.style.transform = 'none';
  document.body.style.setProperty('--tool-dock-height', toolDock.getBoundingClientRect().height + 'px');
}
function setInitialTerritoryView(center) {
  var target = center || initialTerritoryCenter;
  var zoom = 16;
  var size = map.getSize();
  if (!size.x || !size.y) { map.setView(target, zoom, { animate: false }); return; }

  var leftEdge = 0;
  var rightEdge = size.x;
  var mapRect = map.getContainer().getBoundingClientRect();
  if (window.innerWidth > 720 && mapOverlayPanel && !document.body.classList.contains('left-panel-hidden')) {
    leftEdge = Math.max(leftEdge, Math.min(size.x, mapOverlayPanel.getBoundingClientRect().right - mapRect.left));
  }
  if (window.innerWidth > 720 && dashboard && !dashboard.hidden) {
    rightEdge = Math.max(0, Math.min(size.x, dashboard.getBoundingClientRect().left - mapRect.left));
  }
  if (rightEdge - leftEdge < 80) { leftEdge = 0; rightEdge = size.x; }

  var desiredScreenPoint = L.point((leftEdge + rightEdge) / 2, size.y * 0.46);
  var viewportCenter = size.divideBy(2);
  var geographicCenterPoint = map.project(target, zoom).subtract(desiredScreenPoint.subtract(viewportCenter));
  map.setView(map.unproject(geographicCenterPoint, zoom), zoom, { animate: false });
}
window.addEventListener('resize', layoutToolDock);
document.addEventListener('geovisor:dock-changed', function () {
  window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); });
});

var toolDockResizeState = null;
toolDockResize.addEventListener('pointerdown', function (event) {
  var rect = toolDock.getBoundingClientRect();
  toolDockResizeState = { y: event.clientY, height: rect.height };
  toolDock.dataset.userHeight = 'true';
  if (toolDock.classList.contains('is-minimized')) {
    toolDock.classList.remove('is-minimized');
    toolDock.style.height = '50dvh';
    toolDockResizeState.height = toolDock.getBoundingClientRect().height;
  }
  toolDockResize.setPointerCapture(event.pointerId);
  event.preventDefault();
});
toolDockResize.addEventListener('pointermove', function (event) {
  if (!toolDockResizeState) return;
  var maxHeight = Math.floor(window.innerHeight * .7);
  toolDock.style.height = Math.max(150, Math.min(maxHeight, toolDockResizeState.height + toolDockResizeState.y - event.clientY)) + 'px';
  document.body.style.setProperty('--tool-dock-height', toolDock.style.height);
  document.dispatchEvent(new Event('geovisor:dock-changed'));
});
function stopToolDockResize() { toolDockResizeState = null; }
toolDockResize.addEventListener('pointerup', stopToolDockResize);
toolDockResize.addEventListener('pointercancel', stopToolDockResize);

function renderToolPanelTabs() {
  toolDockTabs.innerHTML = '';
  openToolPanelIds.forEach(function (id) {
    var tab = document.createElement('div'); tab.className = 'tool-panel-tab' + (id === activeToolPanelId ? ' is-active' : '');
    var select = document.createElement('button'); select.type = 'button'; select.className = 'tool-panel-tab-select';
    var icon = document.createElement('span'); icon.className = 'tool-panel-tab-icon'; icon.innerHTML = toolPanelIcons[id];
    var label = document.createElement('span'); label.textContent = toolPanelLabels[id];
    select.appendChild(icon); select.appendChild(label);
    select.id = 'tool-tab-' + id; select.setAttribute('role', 'tab'); select.setAttribute('aria-selected', String(id === activeToolPanelId)); select.setAttribute('aria-controls', id);
    select.addEventListener('click', function () { openToolPanel(document.getElementById(id)); });
    var close = document.createElement('button'); close.type = 'button'; close.className = 'tool-panel-tab-close';
    close.textContent = '\u00d7'; close.setAttribute('aria-label', 'Cerrar ' + toolPanelLabels[id]);
    close.addEventListener('click', function () { closeToolPanel(document.getElementById(id)); });
    tab.appendChild(select); tab.appendChild(close); toolDockTabs.appendChild(tab);
  });
  sideToolPanelIds.forEach(function (id) {
    var panel = document.getElementById(id);
    if (panel) { panel.hidden = id !== activeToolPanelId; if (id === activeToolPanelId) panel.setAttribute('aria-labelledby', 'tool-tab-' + id); }
    var button = document.getElementById(sideToolButtons[id]);
    if (button) { var isOpen = openToolPanelIds.indexOf(id) >= 0; button.setAttribute('aria-expanded', String(isOpen)); button.classList.toggle('active', isOpen); }
  });
  toolDock.hidden = openToolPanelIds.length === 0;
  document.body.classList.toggle('tool-dock-open', !toolDock.hidden);
  if (toolDock.hidden) {
    toolDock.dataset.userHeight = '';
    toolDock.style.height = ''; toolDock.style.width = ''; toolDock.style.left = ''; toolDock.style.right = ''; toolDock.style.top = ''; toolDock.style.bottom = ''; toolDock.style.transform = '';
    toolDock.classList.remove('is-expanded', 'is-minimized');
    document.body.style.removeProperty('--tool-dock-height');
  }
  toolDockExpand.textContent = toolDock.classList.contains('is-expanded') ? '\u2921' : '\u2922';
  toolDockExpand.title = toolDock.classList.contains('is-expanded') ? 'Volver al tamaño normal' : 'Ampliar panel a todo el ancho';
  toolDockExpand.setAttribute('aria-label', toolDockExpand.title);
  toolDockMinimize.title = toolDock.classList.contains('is-minimized') ? 'Restaurar panel' : 'Minimizar panel';
  toolDockMinimize.setAttribute('aria-label', toolDockMinimize.title);
  layoutToolDock();
  window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); document.dispatchEvent(new Event('geovisor:dock-changed')); });
}
function openToolPanel(panel) {
  if (!panel) return;
  document.dispatchEvent(new Event('geovisor:open-tool-panel'));
  if (openToolPanelIds.indexOf(panel.id) < 0) openToolPanelIds.push(panel.id);
  activeToolPanelId = panel.id;
  renderToolPanelTabs();
}
function closeToolPanel(panel) {
  if (!panel) return;
  if (panel.id === 'statistics-panel') {
    toolDock.classList.remove('is-expanded');
    var chartExpandButton = document.getElementById('statistics-chart-expand');
    if (chartExpandButton) chartExpandButton.setAttribute('aria-expanded', 'false');
  }
  document.dispatchEvent(new CustomEvent('geovisor:close-tool-panel', { detail: { id: panel.id } }));
  openToolPanelIds = openToolPanelIds.filter(function (id) { return id !== panel.id; });
  if (activeToolPanelId === panel.id) activeToolPanelId = openToolPanelIds.length ? openToolPanelIds[openToolPanelIds.length - 1] : null;
  renderToolPanelTabs();
}
toolDockClose.addEventListener('click', function () { if (activeToolPanelId) closeToolPanel(document.getElementById(activeToolPanelId)); });
toolDockExpand.addEventListener('click', function () {
  var wasExpanded = toolDock.classList.contains('is-expanded');
  toolDock.classList.remove('is-minimized');
  toolDock.classList.toggle('is-expanded', !wasExpanded);
  toolDock.dataset.userHeight = 'true';
  if (!wasExpanded) toolDock.style.height = Math.floor(window.innerHeight * .7) + 'px';
  else { toolDock.dataset.userHeight = ''; }
  layoutToolDock();
  var chartExpandButton = document.getElementById('statistics-chart-expand');
  if (chartExpandButton && activeToolPanelId === 'statistics-panel') chartExpandButton.setAttribute('aria-expanded', String(toolDock.classList.contains('is-expanded')));
  window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); document.dispatchEvent(new Event('geovisor:dock-changed')); });
});
toolDockReduce.addEventListener('click', function () {
  toolDock.classList.remove('is-expanded', 'is-minimized');
  toolDock.dataset.userHeight = '';
  layoutToolDock();
  window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); document.dispatchEvent(new Event('geovisor:dock-changed')); });
});
toolDockMinimize.addEventListener('click', function () {
  var minimizing = !toolDock.classList.contains('is-minimized');
  toolDock.classList.remove('is-expanded');
  toolDock.classList.toggle('is-minimized', minimizing);
  toolDock.dataset.userHeight = minimizing ? 'true' : '';
  if (!minimizing) toolDock.style.height = '';
  layoutToolDock();
  window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); document.dispatchEvent(new Event('geovisor:dock-changed')); });
});
document.getElementById('split-panel-toggle').addEventListener('click', function () { toggleSplitMapTool(); });
document.addEventListener('geovisor:close-tool-panel', function (event) {
  if (event.detail && event.detail.id === 'split-panel') document.getElementById('split-panel-status').textContent = 'El divisor puede seguir activo en el mapa.';
});
L.control.scale({ position: 'bottomleft', metric: true, imperial: false }).addTo(map);

var Esri_WorldImagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  crossOrigin: true,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var Esri_WorldStreetMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
  crossOrigin: true,
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
});

var Esri_NatGeoWorldMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
  crossOrigin: true,
  maxZoom: 12,
  maxNativeZoom: 12,
  attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
});
var Esri_WorldTopoMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
  crossOrigin: true,
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
});
var Jawg_Sunny = JAWG_TOKEN.trim() ? L.tileLayer('https://tile.jawg.io/jawg-sunny/{z}/{x}/{y}.png?access-token=' + encodeURIComponent(JAWG_TOKEN.trim()), {
  crossOrigin: true,
  maxZoom: 22,
  attribution: '&copy; <a href="https://jawg.io" target="_blank">Jawg Maps</a> | &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap contributors</a>'
}) : null;

var baseMaps = {
  'Imágenes': Esri_WorldImagery,
  'Calles': Esri_WorldStreetMap,
  'National Geographic': Esri_NatGeoWorldMap,
  'Topográfico': Esri_WorldTopoMap
};
if (Jawg_Sunny) baseMaps.Sunny = Jawg_Sunny;

var overlayLayers = {};
var drawnItems = new L.FeatureGroup();
// El control de Leaflet queda solo para capas territoriales.
var layerControl = L.control.layers({}, overlayLayers, { collapsed: false, position: 'topright' });
var activeBaseLayer = Esri_WorldImagery;
var activeBaseKey = 'imagery';
var activeBaseName = 'Imágenes';
var basemapGallery = document.getElementById('basemap-gallery');
var basemapGalleryToggle = document.getElementById('basemap-gallery-toggle');
var basemapCurrentName = document.getElementById('basemap-current-name');
var basemapCards = Array.prototype.slice.call(document.querySelectorAll('.basemap-card'));
var basemapLayers = {
  imagery: Esri_WorldImagery,
  streets: Esri_WorldStreetMap,
  natgeo: Esri_NatGeoWorldMap,
  topo: Esri_WorldTopoMap,
  sunny: Jawg_Sunny
};
var basemapNames = { imagery: 'Imágenes', streets: 'Calles', natgeo: 'National Geographic', topo: 'Topográfico', sunny: 'Sunny' };

function tileCoordinates(lat, lon, zoom) {
  var scale = Math.pow(2, zoom);
  var latRadians = lat * Math.PI / 180;
  return {
    x: Math.floor((lon + 180) / 360 * scale),
    y: Math.floor((1 - Math.log(Math.tan(latRadians) + 1 / Math.cos(latRadians)) / Math.PI) / 2 * scale)
  };
}
function setBasemapGalleryOpen(open) {
  basemapGallery.hidden = !open;
  basemapGalleryToggle.setAttribute('aria-expanded', String(open));
  if (open) {
    var activeCard = basemapGallery.querySelector('.basemap-card:not(:disabled)[data-basemap="' + activeBaseKey + '"]');
    if (activeCard) activeCard.focus();
  } else if (basemapGallery.contains(document.activeElement)) {
    basemapGalleryToggle.focus();
  }
}
function updateBasemapGallerySelection() {
  basemapCurrentName.textContent = activeBaseName;
  basemapCards.forEach(function (card) {
    var selected = card.dataset.basemap === activeBaseKey;
    card.classList.toggle('is-active', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
}
function selectBasemap(key) {
  var nextLayer = basemapLayers[key];
  if (!nextLayer) return;
  if (typeof splitUI !== 'undefined' && splitUI) closeSplit(true);
  if (activeBaseLayer && map.hasLayer(activeBaseLayer)) map.removeLayer(activeBaseLayer);
  nextLayer.addTo(map);
  activeBaseLayer = nextLayer;
  activeBaseKey = key;
  activeBaseName = basemapNames[key];
  if (key === 'natgeo' && map.getZoom() > 12) map.setZoom(12);
  updateBasemapGallerySelection();
  setBasemapGalleryOpen(false);
}
function setupBasemapGallery() {
  var tile = tileCoordinates(10.956, -74.890, 12);
  var thumbUrls = {
    imagery: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/12/' + tile.y + '/' + tile.x,
    streets: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/12/' + tile.y + '/' + tile.x,
    natgeo: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/12/' + tile.y + '/' + tile.x,
    topo: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/12/' + tile.y + '/' + tile.x
  };
  basemapCards.forEach(function (card) {
    var key = card.dataset.basemap;
    var image = card.querySelector('img');
    var thumb = card.querySelector('.basemap-thumb');
    if (key === 'sunny' && Jawg_Sunny) {
      thumbUrls.sunny = 'https://tile.jawg.io/jawg-sunny/12/' + tile.x + '/' + tile.y + '.png?access-token=' + encodeURIComponent(JAWG_TOKEN.trim());
    }
    if (thumbUrls[key]) {
      image.addEventListener('error', function () { image.hidden = true; thumb.classList.add('is-fallback'); });
      image.src = thumbUrls[key];
    } else {
      image.hidden = true;
      thumb.classList.add('is-fallback');
    }
    if (key === 'sunny' && !Jawg_Sunny) {
      card.disabled = true;
      card.setAttribute('aria-disabled', 'true');
      card.querySelector('.basemap-card-note').hidden = false;
    }
    card.addEventListener('click', function () { if (!card.disabled) selectBasemap(key); });
  });
  basemapGalleryToggle.addEventListener('click', function () { setBasemapGalleryOpen(basemapGallery.hidden); });
  document.getElementById('basemap-gallery-close').addEventListener('click', function () { setBasemapGalleryOpen(false); });
  document.addEventListener('click', function (event) {
    if (!basemapGallery.hidden && !basemapGallery.contains(event.target) && !basemapGalleryToggle.contains(event.target)) setBasemapGalleryOpen(false);
  });
  document.addEventListener('keydown', function (event) { if (event.key === 'Escape' && !basemapGallery.hidden) setBasemapGalleryOpen(false); });
  updateBasemapGallerySelection();
}
setupBasemapGallery();

// Configuración de etiquetas para las capas SHP cargadas en el visor.
var labelStates = {};
var labelLayerSelect = document.getElementById('label-layer');
var labelClassSelect = document.getElementById('label-class-select');
var labelsStatus = document.getElementById('labels-status');
var labelsPanel = document.getElementById('labels-panel');
var labelsToggle = document.getElementById('labels-toggle');
function newLabelState() {
  return {
    enabled: false, source: 'field', field: '', expressionLanguage: 'python', expression: '',
    font: 'Segoe UI', size: 12, color: '#2d0f1d',
    fillEnabled: true, fillColor: '#fffaf5', fillOpacity: 92,
    outlineEnabled: true, outlineColor: '#2d0f1d', outlineOpacity: 35,
    positions: { point: 'auto', line: 'center', polygon: 'center' },
    scaleMin: 0, scaleMax: 1000000000, activeClass: 0,
    classes: [{ name: 'General', field: '', operator: 'equals', value: '' }]
  };
}
function walkLabelFeatures(layer, callback) {
  if (!layer) return;
  if (layer.feature && typeof layer.bindTooltip === 'function') { callback(layer); return; }
  if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) { walkLabelFeatures(child, callback); });
}
function getLabelFields(layer) {
  var fields = new Set();
  walkLabelFeatures(layer, function (featureLayer) {
    Object.keys((featureLayer.feature && featureLayer.feature.properties) || {}).forEach(function (field) { fields.add(field); });
  });
  return Array.from(fields).sort(function (a, b) { return a.localeCompare(b); });
}
function fillLabelFieldSelect(select, fields, selectedValue, includeAny) {
  select.innerHTML = '';
  var empty = document.createElement('option');
  empty.value = '';
  empty.textContent = includeAny ? 'Sin filtro' : 'Selecciona un campo';
  select.appendChild(empty);
  fields.forEach(function (field) {
    var option = document.createElement('option'); option.value = field; option.textContent = field; select.appendChild(option);
  });
  if (fields.indexOf(selectedValue) >= 0) select.value = selectedValue;
}
function refreshLabelLayerOptions() {
  var previous = labelLayerSelect.value;
  var names = Object.keys(overlayLayers).filter(function (name) { return overlayLayers[name] && overlayLayers[name]._tipo; });
  labelLayerSelect.innerHTML = '';
  var placeholder = document.createElement('option'); placeholder.value = ''; placeholder.textContent = names.length ? 'Selecciona una capa' : 'Carga una capa vectorial'; labelLayerSelect.appendChild(placeholder);
  names.forEach(function (name) { var option = document.createElement('option'); option.value = name; option.textContent = name; labelLayerSelect.appendChild(option); });
  if (names.indexOf(previous) >= 0) labelLayerSelect.value = previous;
  else if (names.length) labelLayerSelect.value = names[0];
  populateLabelPanel();
}
function saveLabelClassDraft(state) {
  var index = Number(state.activeClass) || 0;
  var rule = state.classes[index];
  if (!rule) return;
  rule.name = document.getElementById('label-class-name').value.trim() || 'Clase ' + (index + 1);
  rule.field = document.getElementById('label-filter-field').value;
  rule.operator = document.getElementById('label-filter-operator').value;
  rule.value = document.getElementById('label-filter-value').value;
  state.activeClass = index;
}
function renderLabelClassEditor(state) {
  labelClassSelect.innerHTML = '';
  state.classes.forEach(function (rule, index) { var option = document.createElement('option'); option.value = String(index); option.textContent = rule.name || 'Clase ' + (index + 1); labelClassSelect.appendChild(option); });
  var active = Math.max(0, Math.min(state.classes.length - 1, Number(state.activeClass) || 0));
  state.activeClass = active;
  labelClassSelect.value = String(active);
  var rule = state.classes[active] || state.classes[0];
  document.getElementById('label-class-name').value = rule.name;
  document.getElementById('label-filter-field').value = rule.field || '';
  document.getElementById('label-filter-operator').value = rule.operator || 'equals';
  document.getElementById('label-filter-value').value = rule.value || '';
  document.getElementById('remove-label-class').disabled = state.classes.length <= 1;
}
function populateLabelPanel() {
  var name = labelLayerSelect.value;
  labelLayerSelect.dataset.currentName = name;
  var root = overlayLayers[name];
  var fields = root ? getLabelFields(root) : [];
  if (!name || !root) {
    document.getElementById('label-field').innerHTML = '<option value="">Selecciona una capa primero</option>';
    fillLabelFieldSelect(document.getElementById('label-filter-field'), [], '', true);
    renderLabelClassEditor(newLabelState());
    labelsStatus.textContent = 'Selecciona una capa shapefile para configurar sus etiquetas.';
    return;
  }
  if (!labelStates[name]) labelStates[name] = newLabelState();
  var state = labelStates[name];
  fillLabelFieldSelect(document.getElementById('label-field'), fields, state.field, false);
  fillLabelFieldSelect(document.getElementById('label-filter-field'), fields, '', true);
  document.getElementById('labels-enabled').checked = state.enabled;
  document.getElementById('label-source').value = state.source;
  document.getElementById('label-expression-language').value = state.expressionLanguage;
  document.getElementById('label-expression').value = state.expression;
  document.getElementById('label-font').value = state.font;
  document.getElementById('label-size').value = state.size;
  document.getElementById('label-size-value').textContent = state.size + ' px';
  document.getElementById('label-color').value = state.color;
  document.getElementById('label-fill-enabled').checked = state.fillEnabled;
  document.getElementById('label-fill-color').value = state.fillColor;
  document.getElementById('label-fill-opacity').value = state.fillOpacity;
  document.getElementById('label-fill-opacity-value').textContent = state.fillOpacity + '%';
  document.getElementById('label-outline-enabled').checked = state.outlineEnabled;
  document.getElementById('label-outline-color').value = state.outlineColor;
  document.getElementById('label-outline-opacity').value = state.outlineOpacity;
  document.getElementById('label-outline-opacity-value').textContent = state.outlineOpacity + '%';
  document.getElementById('label-position-point').value = state.positions.point;
  document.getElementById('label-position-line').value = state.positions.line;
  document.getElementById('label-position-polygon').value = state.positions.polygon;
  document.getElementById('label-scale-min').value = state.scaleMin;
  document.getElementById('label-scale-max').value = state.scaleMax;
  document.getElementById('label-field-row').hidden = state.source !== 'field';
  document.getElementById('label-expression-section').hidden = state.source !== 'expression';
  renderLabelClassEditor(state);
  labelsStatus.textContent = fields.length + ' campos disponibles en ' + name + '.';
}
function splitLabelExpression(expression, separator) {
  var parts = [], start = 0, quote = '', escaped = false, depth = 0;
  for (var i = 0; i < expression.length; i++) {
    var character = expression[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === '\\') escaped = true;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") quote = character;
    else if (character === '(') depth++;
    else if (character === ')') depth--;
    else if (character === separator && depth === 0) { parts.push(expression.slice(start, i).trim()); start = i + 1; }
  }
  parts.push(expression.slice(start).trim());
  return parts;
}
function unquoteLabelText(term) {
  var quote = term[0];
  var value = term.slice(1, -1);
  return value.replace(/\\([\\"'nrt])/g, function (match, character) { return character === 'n' ? '\n' : character === 'r' ? '\r' : character === 't' ? '\t' : character; });
}
function evaluateLabelTerm(term, properties, language) {
  term = term.trim();
  while (term[0] === '(' && term[term.length - 1] === ')') term = term.slice(1, -1).trim();
  if (!term) return '';
  if ((term[0] === '"' || term[0] === "'") && term[term.length - 1] === term[0]) return unquoteLabelText(term);
  var wrapper = term.match(/^(str|CStr|UCase|LCase|upper|lower)\s*\(([\s\S]*)\)$/i);
  if (wrapper) {
    var wrapped = evaluateLabelExpression(wrapper[2], properties, language);
    if (/^(UCase|upper)$/i.test(wrapper[1])) return wrapped.toUpperCase();
    if (/^(LCase|lower)$/i.test(wrapper[1])) return wrapped.toLowerCase();
    return wrapped;
  }
  var field = '';
  if (language === 'python') {
    var pythonField = term.match(/^(?:feature\s*\[\s*["']properties["']\s*\]\s*)?properties\s*\[\s*["']([^"']+)["']\s*\]$/) || term.match(/^feature\s*\[\s*["']properties["']\s*\]\s*\[\s*["']([^"']+)["']\s*\]$/);
    if (pythonField) field = pythonField[1];
  } else {
    var vbField = term.match(/^\[([^\]]+)\]$/) || term.match(/^Fields!?\s*\[?([\w ]+)\]?\.Value$/i);
    if (vbField) field = vbField[1];
  }
  if (field) return properties[field] == null ? '' : String(properties[field]);
  throw new Error('No se reconoce esta parte de la expresión: ' + term);
}
function evaluateLabelExpression(expression, properties, language) {
  var separator = language === 'vbscript' ? '&' : '+';
  return splitLabelExpression(expression, separator).map(function (term) { return evaluateLabelTerm(term, properties, language); }).join('').trim();
}
function evaluateFeatureLabel(featureLayer, state) {
  var properties = (featureLayer.feature && featureLayer.feature.properties) || {};
  var raw = state.source === 'field' ? properties[state.field] : evaluateLabelExpression(state.expression, properties, state.expressionLanguage);
  return raw == null ? '' : String(raw).trim();
}
function labelClassMatches(properties, rule) {
  if (!rule || !rule.field) return true;
  var raw = properties[rule.field];
  var value = raw == null ? '' : String(raw);
  var expected = String(rule.value || '');
  switch (rule.operator) {
    case 'contains': return value.toLocaleLowerCase().indexOf(expected.toLocaleLowerCase()) >= 0;
    case 'starts': return value.toLocaleLowerCase().indexOf(expected.toLocaleLowerCase()) === 0;
    case 'gt': return Number(raw) > Number(expected);
    case 'lt': return Number(raw) < Number(expected);
    case 'not-empty': return value.trim() !== '';
    default: return value.toLocaleLowerCase() === expected.toLocaleLowerCase();
  }
}
function featureGeometryPosition(featureLayer, state) {
  var geometryType = featureLayer.feature && featureLayer.feature.geometry ? featureLayer.feature.geometry.type : '';
  if (/Point/i.test(geometryType) || featureLayer instanceof L.Marker) return state.positions.point;
  if (/Line/i.test(geometryType)) return state.positions.line;
  return state.positions.polygon;
}
function currentLabelScale() {
  var latitude = map.getCenter().lat * Math.PI / 180;
  return 591657550.5 * Math.cos(latitude) / Math.pow(2, map.getZoom());
}
function labelOutlineRgba(color, opacity) {
  var hex = String(color || '#2d0f1d').replace('#', '');
  var red = parseInt(hex.slice(0, 2), 16) || 0;
  var green = parseInt(hex.slice(2, 4), 16) || 0;
  var blue = parseInt(hex.slice(4, 6), 16) || 0;
  var alpha = Math.max(0, Math.min(100, Number(opacity) || 0)) / 100;
  return 'rgba(' + red + ', ' + green + ', ' + blue + ', ' + alpha + ')';
}
function removeFeatureLabel(featureLayer) {
  if (featureLayer._geovisorLabelStyleHandler && featureLayer.off) {
    featureLayer.off('tooltipopen', featureLayer._geovisorLabelStyleHandler);
    featureLayer._geovisorLabelStyleHandler = null;
  }
  var tooltipClass = featureLayer._tooltip && featureLayer._tooltip.options && featureLayer._tooltip.options.className;
  var hasGeovisorTooltip = String(tooltipClass || '').split(/\s+/).indexOf('geovisor-feature-label') >= 0;
  if ((featureLayer._geovisorLabelBound || hasGeovisorTooltip) && featureLayer.unbindTooltip) featureLayer.unbindTooltip();
  featureLayer._geovisorLabelBound = false;
  featureLayer._geovisorLabelSignature = '';
}
function applyLabelsToLayer(name) {
  var root = overlayLayers[name];
  var state = labelStates[name];
  if (!root || !state) return { count: 0, error: '' };
  var scale = currentLabelScale();
  var count = 0, expressionError = '';
  walkLabelFeatures(root, function (featureLayer) {
    var properties = (featureLayer.feature && featureLayer.feature.properties) || {};
    var inScale = scale >= Number(state.scaleMin || 0) && scale <= Number(state.scaleMax || 1000000000);
    var filteredClasses = (state.classes || []).filter(function (rule) { return rule.field; });
    var classMatches = !filteredClasses.length || filteredClasses.some(function (rule) { return labelClassMatches(properties, rule); });
    if (!state.enabled || !inScale || !classMatches || (state.source === 'field' && !state.field)) { removeFeatureLabel(featureLayer); return; }
    var text;
    try { text = evaluateFeatureLabel(featureLayer, state); }
    catch (error) { expressionError = error.message; removeFeatureLabel(featureLayer); return; }
    if (!text) { removeFeatureLabel(featureLayer); return; }
    var direction = featureGeometryPosition(featureLayer, state);
    var signature = JSON.stringify([text, direction, state.font, state.size, state.color, state.fillEnabled, state.fillColor, state.fillOpacity, state.outlineEnabled, state.outlineColor, state.outlineOpacity]);
    if (featureLayer._geovisorLabelBound && featureLayer._geovisorLabelSignature === signature) { count++; return; }
    removeFeatureLabel(featureLayer);
    var content = document.createElement('span'); content.textContent = text;
    featureLayer._geovisorLabelStyle = { font: state.font, size: state.size, color: state.color, fillEnabled: state.fillEnabled, fillColor: state.fillColor, fillOpacity: state.fillOpacity, outlineEnabled: state.outlineEnabled, outlineColor: state.outlineColor, outlineOpacity: state.outlineOpacity };
    if (!featureLayer._geovisorLabelStyleHandler) {
      featureLayer._geovisorLabelStyleHandler = function (event) {
        var element = event.tooltip && event.tooltip.getElement();
        var style = featureLayer._geovisorLabelStyle;
        if (!element || !style) return;
        element.style.fontFamily = style.font;
        element.style.fontSize = style.size + 'px';
        element.style.color = style.color;
        element.style.backgroundColor = style.fillEnabled ? labelOutlineRgba(style.fillColor, style.fillOpacity) : 'transparent';
        element.style.borderStyle = 'solid';
        element.style.borderWidth = style.outlineEnabled ? '1px' : '0';
        element.style.borderColor = style.outlineEnabled ? labelOutlineRgba(style.outlineColor, style.outlineOpacity) : 'transparent';
        element.style.boxShadow = style.outlineEnabled && Number(style.outlineOpacity) > 0 ? '0 1px 4px rgba(0,0,0,.25)' : 'none';
      };
      featureLayer.on('tooltipopen', featureLayer._geovisorLabelStyleHandler);
    }
    try {
      featureLayer.bindTooltip(L.tooltip({ permanent: true, direction: direction, className: 'geovisor-feature-label', opacity: 1 }).setContent(content));
      featureLayer._geovisorLabelBound = true;
      featureLayer._geovisorLabelSignature = signature;
      if (featureLayer._map) featureLayer.openTooltip();
    } catch (error) {
      expressionError = 'No se pudo dibujar la etiqueta: ' + error.message;
      removeFeatureLabel(featureLayer);
      return;
    }
    count++;
  });
  return { count: count, error: expressionError };
}
function refreshVisibleLabels() {
  Object.keys(labelStates).forEach(function (name) { if (labelStates[name].enabled) applyLabelsToLayer(name); });
}
function readLabelPanel(nameOverride) {
  var name = nameOverride || labelLayerSelect.value;
  var state = labelStates[name];
  if (!name || !state) return null;
  saveLabelClassDraft(state);
  state.enabled = document.getElementById('labels-enabled').checked;
  state.source = document.getElementById('label-source').value;
  state.field = document.getElementById('label-field').value;
  state.expressionLanguage = document.getElementById('label-expression-language').value;
  state.expression = document.getElementById('label-expression').value.trim();
  state.font = document.getElementById('label-font').value;
  state.size = Number(document.getElementById('label-size').value);
  state.color = document.getElementById('label-color').value;
  state.fillEnabled = document.getElementById('label-fill-enabled').checked;
  state.fillColor = document.getElementById('label-fill-color').value;
  state.fillOpacity = Number(document.getElementById('label-fill-opacity').value);
  state.outlineEnabled = document.getElementById('label-outline-enabled').checked;
  state.outlineColor = document.getElementById('label-outline-color').value;
  state.outlineOpacity = Number(document.getElementById('label-outline-opacity').value);
  state.positions = {
    point: document.getElementById('label-position-point').value,
    line: document.getElementById('label-position-line').value,
    polygon: document.getElementById('label-position-polygon').value
  };
  state.scaleMin = Number(document.getElementById('label-scale-min').value) || 0;
  state.scaleMax = Number(document.getElementById('label-scale-max').value) || 1000000000;
  return { name: name, state: state };
}
function applyLabelPanel() {
  var selected = readLabelPanel();
  if (!selected) { labelsStatus.textContent = 'Primero selecciona una capa shapefile.'; return; }
  if (selected.state.scaleMin > selected.state.scaleMax) { labelsStatus.textContent = 'La escala más detallada debe tener un denominador menor que la escala menos detallada.'; return; }
  if (selected.state.enabled && selected.state.source === 'field' && !selected.state.field) { labelsStatus.textContent = 'Selecciona el campo que se usará como etiqueta.'; return; }
  if (selected.state.enabled && selected.state.source === 'expression' && !selected.state.expression) { labelsStatus.textContent = 'Escribe una expresión para generar las etiquetas.'; return; }
  var layer = overlayLayers[selected.name];
  var layerWasVisible = map.hasLayer(layer);
  if (selected.state.enabled && !layerWasVisible) layer.addTo(map);
  var result = applyLabelsToLayer(selected.name);
  if (result.error) labelsStatus.textContent = 'No se pudo aplicar la etiqueta: ' + result.error;
  else if (!selected.state.enabled) labelsStatus.textContent = 'Etiquetas desactivadas para ' + selected.name + '.';
  else if (!result.count) labelsStatus.textContent = 'No hay etiquetas visibles. Revisa que el campo tenga valores y que los filtros y el rango de escala incluyan estas entidades.';
  else labelsStatus.textContent = result.count + ' etiquetas aplicadas en ' + selected.name + (layerWasVisible ? '.' : '. La capa se activó en el mapa para mostrarlas.');
}
function toggleLabelsPanel(open) {
  if (open === false) closeToolPanel(labelsPanel); else openToolPanel(labelsPanel);
  labelsToggle.setAttribute('aria-expanded', String(!labelsPanel.hidden));
  labelsToggle.classList.toggle('active', !labelsPanel.hidden);
  if (!labelsPanel.hidden) { refreshLabelLayerOptions(); labelLayerSelect.focus(); }
}
labelsToggle.addEventListener('click', function () { toggleLabelsPanel(); });
document.getElementById('close-labels-panel').addEventListener('click', function () { toggleLabelsPanel(false); labelsToggle.focus(); });
labelLayerSelect.addEventListener('change', function () {
  var previous = labelLayerSelect.dataset.currentName;
  if (previous && labelStates[previous]) readLabelPanel(previous);
  populateLabelPanel();
});
document.getElementById('label-field').addEventListener('change', function () {
  if (this.value) document.getElementById('labels-enabled').checked = true;
});
document.getElementById('labels-enabled').addEventListener('change', function () {
  // Al reactivar, limpia cualquier tooltip residual antes de volver a enlazarlo.
  if (this.checked && labelLayerSelect.value) {
    walkLabelFeatures(overlayLayers[labelLayerSelect.value], function (featureLayer) { removeFeatureLabel(featureLayer); });
  }
  applyLabelPanel();
});
document.getElementById('label-expression').addEventListener('input', function () {
  if (this.value.trim()) document.getElementById('labels-enabled').checked = true;
});
document.getElementById('label-source').addEventListener('change', function (event) {
  document.getElementById('label-field-row').hidden = event.target.value !== 'field';
  document.getElementById('label-expression-section').hidden = event.target.value !== 'expression';
});
document.getElementById('label-expression-language').addEventListener('change', function (event) {
  document.getElementById('label-expression').placeholder = event.target.value === 'python'
    ? 'str(properties["nombre"]) + " - " + str(properties["sector"])'
    : 'CStr([nombre]) & " - " & CStr([sector])';
});
document.getElementById('label-size').addEventListener('input', function (event) { document.getElementById('label-size-value').textContent = event.target.value + ' px'; });
document.getElementById('label-outline-opacity').addEventListener('input', function (event) { document.getElementById('label-outline-opacity-value').textContent = event.target.value + '%'; });
document.getElementById('label-fill-opacity').addEventListener('input', function (event) { document.getElementById('label-fill-opacity-value').textContent = event.target.value + '%'; });
var labelOutlineApplyTimer;
function applyLabelOutlineChanges() {
  window.clearTimeout(labelOutlineApplyTimer);
  labelOutlineApplyTimer = window.setTimeout(function () {
    if (labelLayerSelect.value) applyLabelPanel();
  }, 120);
}
['label-outline-enabled', 'label-outline-color', 'label-outline-opacity', 'label-fill-enabled', 'label-fill-color', 'label-fill-opacity'].forEach(function (id) {
  var control = document.getElementById(id);
  control.addEventListener('input', applyLabelOutlineChanges);
  control.addEventListener('change', applyLabelOutlineChanges);
});
labelClassSelect.addEventListener('change', function () {
  var state = labelStates[labelLayerSelect.value]; if (!state) return;
  saveLabelClassDraft(state); state.activeClass = Number(labelClassSelect.value); renderLabelClassEditor(state);
});
document.getElementById('add-label-class').addEventListener('click', function () {
  var state = labelStates[labelLayerSelect.value]; if (!state) return;
  saveLabelClassDraft(state);
  state.classes.push({ name: 'Clase ' + (state.classes.length + 1), field: '', operator: 'equals', value: '' });
  state.activeClass = state.classes.length - 1; renderLabelClassEditor(state);
  document.getElementById('label-class-name').focus();
});
document.getElementById('remove-label-class').addEventListener('click', function () {
  var state = labelStates[labelLayerSelect.value]; if (!state || state.classes.length <= 1) return;
  saveLabelClassDraft(state); state.classes.splice(state.activeClass, 1); state.activeClass = Math.max(0, state.activeClass - 1); renderLabelClassEditor(state);
});
document.getElementById('apply-labels').addEventListener('click', applyLabelPanel);
map.on('zoomend moveend', refreshVisibleLabels);

Esri_WorldImagery.addTo(map);

function mostrarAtributos(feature, layer) {
  const contenido = document.createElement('pre');
  contenido.textContent = Object.entries(feature.properties || {})
    .map(([campo, valor]) => campo + ': ' + valor)
    .join('\n');
  layer.bindPopup(contenido);
}

var paletteTerritorial = ['#5f1f2d', '#a14e3d', '#c96e57', '#7e6872', '#d49a73', '#8f6b52', '#b47d6b', '#6e525d'];

// Paleta normativa compartida y editable por las capas temáticas y los gráficos.
var coloresNormativos = {
  residencial: '#F2C94C',
  comercial: '#E53935',
  dotacional: '#2F80ED',
  servicios: '#8D6E63',
  industrial: '#8E44AD',
  espacioPublicoProyectado: '#8BC34A',
  espacioPublicoExistente: '#1B5E20'
};
var coloresTratamientos = {
  desarrollo: '#FFB366',
  consolidacion: '#87CEEB',
  mejoramientoIntegral: '#8B5A2B',
  sueloProteccion: '#1B5E20',
  espacioPublico: '#A4DE02'
};
var ordenPaletaNormativa = [
  ['residencial', 'Residencial'], ['comercial', 'Comercial'], ['dotacional', 'Dotacional'],
  ['servicios', 'Servicios'], ['industrial', 'Industrial'],
  ['espacioPublicoProyectado', 'Espacio público proyectado'], ['espacioPublicoExistente', 'Espacio público existente']
];
var claveAlmacenamientoPaleta = 'geovisor-barr-paleta-normativa-v1';
try {
  var paletaGuardada = JSON.parse(localStorage.getItem(claveAlmacenamientoPaleta) || 'null');
  if (paletaGuardada && typeof paletaGuardada === 'object') ordenPaletaNormativa.forEach(function (item) {
    var color = paletaGuardada[item[0]];
    if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) coloresNormativos[item[0]] = color;
  });
} catch (ignored) {}

function categoriaNormativa(value) {
  var text = normalizarCategoria(value);
  if (!text) return null;
  if (/espacio publico/.test(text)) {
    if (/proyect|propuest|futur/.test(text)) return 'espacioPublicoProyectado';
    if (/exist|actual|consolid/.test(text)) return 'espacioPublicoExistente';
  }
  if (/residencial|vivienda|habitacional/.test(text)) return 'residencial';
  if (/comercial|comercio/.test(text)) return 'comercial';
  if (/dotacional|equipamiento|institucional/.test(text)) return 'dotacional';
  if (/servicio|servicios/.test(text)) return 'servicios';
  if (/industrial|industria/.test(text)) return 'industrial';
  return null;
}

function normalizarCategoria(value) {
  return String(value == null ? '' : value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function colorNormativo(value) {
  var key = categoriaNormativa(value);
  return key ? coloresNormativos[key] : null;
}

function colorTratamiento(value) {
  var text = normalizarCategoria(value);
  if (/mejoramiento integral/.test(text)) return coloresTratamientos.mejoramientoIntegral;
  if (/consolidacion/.test(text)) return coloresTratamientos.consolidacion;
  if (/desarrollo/.test(text)) return coloresTratamientos.desarrollo;
  if (/suelo de proteccion|proteccion/.test(text)) return coloresTratamientos.sueloProteccion;
  if (/espacio publico/.test(text)) return coloresTratamientos.espacioPublico;
  return null;
}

function aplicarPaletaCompartidaEnMapa() {
  Object.keys(overlayLayers).forEach(function (name) {
    var layer = overlayLayers[name];
    if (!layer) return;
    if (layer._geovisorUniformColor) {
      if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) {
        if (child.feature && child.setStyle) child.setStyle({ color: layer._geovisorUniformColor, fillColor: layer._geovisorUniformColor });
      });
      return;
    }
    if (layer._geovisorActiveClassField && typeof layer.eachLayer === 'function') {
      layer.eachLayer(function (child) {
        if (!child.feature || !child.setStyle) return;
        var value = (child.feature.properties || {})[layer._geovisorActiveClassField];
        var color = layer._tipo === 'tratamientos' ? (colorTratamiento(value) || colorPorCategoria(value)) : colorPorCategoria(value);
        child.setStyle({ color: color, fillColor: color });
      });
      return;
    }
    if (layer._tipo && typeof layer.setStyle === 'function') {
      layer.setStyle(function (feature) { return estiloShapefile(layer._tipo, feature); });
      return;
    }
    if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) {
      if (child.feature && child.setStyle && child._geovisorClassField) {
        var value = (child.feature.properties || {})[child._geovisorClassField];
        var color = colorPorCategoria(value);
        child.setStyle({ color: color, fillColor: color });
      }
    });
  });
}

function configurarPaletaCompartida() {
  var container = document.getElementById('shared-color-palette');
  if (!container) return;
  ordenPaletaNormativa.forEach(function (item) {
    var input = container.querySelector('[data-palette-key="' + item[0] + '"]');
    if (!input) return;
    input.value = coloresNormativos[item[0]];
    input.addEventListener('input', function () {
      coloresNormativos[item[0]] = input.value.toUpperCase();
      try { localStorage.setItem(claveAlmacenamientoPaleta, JSON.stringify(coloresNormativos)); } catch (ignored) {}
      aplicarPaletaCompartidaEnMapa();
      document.dispatchEvent(new Event('geovisor:palettechanged'));
    });
  });
  var reset = document.getElementById('palette-reset');
  if (reset) reset.addEventListener('click', function () {
    var defaults = { residencial: '#F2C94C', comercial: '#E53935', dotacional: '#2F80ED', servicios: '#8D6E63', industrial: '#8E44AD', espacioPublicoProyectado: '#8BC34A', espacioPublicoExistente: '#1B5E20' };
    ordenPaletaNormativa.forEach(function (item) { coloresNormativos[item[0]] = defaults[item[0]]; var input = container.querySelector('[data-palette-key="' + item[0] + '"]'); if (input) input.value = defaults[item[0]]; });
    try { localStorage.removeItem(claveAlmacenamientoPaleta); } catch (ignored) {}
    aplicarPaletaCompartidaEnMapa();
    document.dispatchEvent(new Event('geovisor:palettechanged'));
  });
  window.addEventListener('storage', function (event) {
    if (event.key !== claveAlmacenamientoPaleta) return;
    var saved = {};
    try { saved = JSON.parse(event.newValue || '{}'); } catch (ignored) {}
    ordenPaletaNormativa.forEach(function (item) {
      var defaults = { residencial: '#F2C94C', comercial: '#E53935', dotacional: '#2F80ED', servicios: '#8D6E63', industrial: '#8E44AD', espacioPublicoProyectado: '#8BC34A', espacioPublicoExistente: '#1B5E20' };
      var color = saved[item[0]];
      coloresNormativos[item[0]] = typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color) ? color : defaults[item[0]];
      var input = container.querySelector('[data-palette-key="' + item[0] + '"]');
      if (input) input.value = coloresNormativos[item[0]];
    });
    aplicarPaletaCompartidaEnMapa();
    document.dispatchEvent(new Event('geovisor:palettechanged'));
  });
}

configurarPaletaCompartida();

function colorPorCategoria(value) {
  var normative = colorNormativo(value);
  if (normative) return normative;
  var text = String(value == null ? 'Sin categoría' : value);
  var hash = 0;
  for (var i = 0; i < text.length; i++) hash = ((hash << 5) - hash + text.charCodeAt(i)) | 0;
  return paletteTerritorial[Math.abs(hash) % paletteTerritorial.length];
}

function estiloShapefile(tipo, feature) {
  var properties = feature && feature.properties ? feature.properties : {};
  if (tipo === 'limite') return { color: '#000000', weight: 3, opacity: 1, fillColor: '#000000', fillOpacity: 0.08, dashArray: null };
  if (tipo === 'manzanas') return { color: '#3F4348', weight: 1, opacity: 0.95, fillColor: '#3F4348', fillOpacity: 0.38, dashArray: null };
  if (tipo === 'vias') return { color: '#FFD700', weight: 2.8, opacity: 1, lineCap: 'round', lineJoin: 'round', dashArray: null };
  function propertyValue(candidates) {
    var wanted = candidates.map(normalizarCategoria);
    var key = Object.keys(properties).find(function (name) { return wanted.indexOf(normalizarCategoria(name)) >= 0; });
    return key ? properties[key] : null;
  }
  var category = tipo === 'tratamientos'
    ? propertyValue(['tratamient', 'tratamiento', 'tipo_trata', 'tratam', 'clase'])
    : propertyValue(['nombre_uso', 'nombre uso', 'actividad', 'etiqueta', 'uso', 'tipo_uso', 'clase', 'destino']);
  var color = tipo === 'tratamientos' ? (colorTratamiento(category) || colorPorCategoria(category)) : colorPorCategoria(category);
  return { color: color, weight: 1, opacity: 0.82, fillColor: color, fillOpacity: 0.38, dashArray: null };
}

function cargarCapasJuanMina() {
  var capas = [
    { nombre: 'Límite de Juan Mina', archivo: 'CORREGIMIENTO_JUAN', tipo: 'limite', visible: true },
    { nombre: 'Manzanas', archivo: 'MANZANAS', tipo: 'manzanas', visible: false },
    { nombre: 'Tratamientos urbanísticos', archivo: 'TRATAM_JUAN', tipo: 'tratamientos', visible: false },
    { nombre: 'Usos del suelo', archivo: 'USOS_SUELO', tipo: 'usos', visible: true },
    { nombre: 'Vías de Juan Mina', archivo: 'VIAS_JUAN_MINA', tipo: 'vias', visible: true }
  ];
  var loadedCount = 0;
  var failedCount = 0;
  var layerStatus = document.getElementById('layer-status');
  var toolStatus = document.getElementById('tool-status');
  if (window.location.protocol === 'file:') {
    if (layerStatus) layerStatus.textContent = 'Abre con Live Server';
    if (toolStatus) toolStatus.textContent = 'El navegador bloquea la lectura de SHP desde file://. Inicia Live Server y abre la página desde http://localhost.';
    return;
  }
  capas.forEach(function (config) {
    var ruta = new URL('DATA/SHP_GEOVISOR/' + config.archivo + '.shp', document.baseURI).href;
    if (typeof window.shp !== 'function') {
      failedCount++;
      if (layerStatus) layerStatus.textContent = 'No cargó shpjs';
      console.error('No está disponible shpjs para cargar ' + config.archivo + '.');
      return;
    }
    Promise.resolve().then(function () { return window.shp(ruta); }).then(function (geojson) {
      if (Array.isArray(geojson)) {
        geojson = { type: 'FeatureCollection', features: geojson.reduce(function (all, item) { return all.concat(item.features || []); }, []) };
      }
      if (!geojson || !Array.isArray(geojson.features)) throw new Error('El archivo no produjo una colección de entidades válida.');
      var layer = L.geoJSON(geojson, {
        style: function (feature) { return estiloShapefile(config.tipo, feature); },
        pointToLayer: function (feature, latlng) {
          var pointStyle = estiloShapefile(config.tipo, feature);
          return L.circleMarker(latlng, { radius: 6, ...pointStyle });
        },
        onEachFeature: mostrarAtributos
      });
      layer._tipo = config.tipo;
      overlayLayers[config.nombre] = layer;
      document.dispatchEvent(new Event('geovisor:layerschanged'));
      refreshLabelLayerOptions();
      refreshDrawingStyleTargets();
      layerControl.addOverlay(layer, config.nombre);
      if (config.visible) layer.addTo(map);
      if (config.tipo === 'limite' || config.tipo === 'usos' || config.tipo === 'vias') layer.bringToFront();
      if (config.tipo === 'usos') {
        var bounds = layer.getBounds();
        if (bounds.isValid()) {
          initialTerritoryCenter = bounds.getCenter();
          setInitialTerritoryView(initialTerritoryCenter);
        }
      }
      loadedCount++;
      var count = document.getElementById('shapefile-count');
      if (count) count.textContent = loadedCount;
      if (layerStatus) layerStatus.textContent = loadedCount + ' de ' + capas.length + ' capas';
      if (toolStatus) toolStatus.textContent = 'Capas de Juan Mina cargadas: ' + loadedCount + ' de ' + capas.length + '.';
    }).catch(function (error) {
      failedCount++;
      console.error('No se pudo cargar ' + config.nombre + ' desde ' + ruta + ':', error);
      if (layerStatus) layerStatus.textContent = loadedCount + ' listas · ' + failedCount + ' error(es)';
      if (toolStatus) toolStatus.textContent = 'Error en ' + config.nombre + ': ' + (error.message || 'No se pudo leer el shapefile.') + ' Revisa la ruta DATA/SHP_GEOVISOR y sus archivos .dbf.';
    });
  });
}

function cargarGeoTiff(ruta, nombre, opciones) {
  opciones = opciones || {};
  var grupo = L.layerGroup();
  overlayLayers[nombre] = grupo;
  if (layerControl) {
    layerControl.addOverlay(grupo, nombre);
  }

  fetch(ruta)
    .then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.arrayBuffer();
    })
    .then(function (buffer) {
      return parseGeoraster(buffer, { readOnDemand: true });
    })
    .then(function (georaster) {
      if (georaster.numberOfRasters < 3) {
        throw new Error('Se necesitan al menos tres bandas para mostrar color natural.');
      }

      var capa = new GeoRasterLayer({
        georaster: georaster,
        resolution: 256,
        opacity: 0.82,
        pixelValuesToColorFn: function (values) {
          if (values.slice(0, 3).some(function (value) { return value == null || Number.isNaN(value); })) return null;
          if (values.length > 3 && values[3] === 0) return null;

          var r, g, b;
          if (opciones.ycbcr) {
            var y = values[0], cb = values[1] - 128, cr = values[2] - 128;
            r = Math.round(y + 1.402 * cr);
            g = Math.round(y - 0.34414 * cb - 0.71414 * cr);
            b = Math.round(y + 1.772 * cb);
          } else {
            r = values[0]; g = values[1]; b = values[2];
          }

          if (opciones.fondoNegro && r <= 5 && g <= 5 && b <= 5) return null;
          if (values.length > 3) return 'rgba(' + r + ', ' + g + ', ' + b + ', ' + values[3] / 255 + ')';
          return 'rgb(' + r + ', ' + g + ', ' + b + ')';
        }
      });

      grupo.addLayer(capa);
      var bounds = capa.getBounds();
      if (bounds && bounds.isValid && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    })
    .catch(function (error) {
      console.error('No se pudo cargar ' + ruta + ':', error);
    });

  return grupo;
}

layerControl.addTo(map);
var dashboardLayerControl = document.getElementById('dashboard-layer-control');
if (dashboardLayerControl && layerControl.getContainer()) dashboardLayerControl.appendChild(layerControl.getContainer());
var hideAllLayersButton = document.getElementById('hide-all-layers');
if (hideAllLayersButton) hideAllLayersButton.addEventListener('click', function () {
  Object.keys(overlayLayers).forEach(function (name) {
    var layer = overlayLayers[name];
    if (layer && map.hasLayer(layer)) map.removeLayer(layer);
  });
});

// La leyenda refleja solo las capas territoriales que están visibles en el mapa.
var mapLayerLegend = L.control({ position: 'bottomleft' });
var mapLayerLegendFrame = 0;
var sharedNormativePalette = document.getElementById('shared-color-palette');

function visibleLegendLayers() {
  if (!sharedNormativePalette || !sharedNormativePalette.open) return [];
  return Object.keys(overlayLayers).filter(function (name) {
    return overlayLayers[name] && map.hasLayer(overlayLayers[name]);
  });
}

function legendFeatureRows(layer) {
  if (layer._geovisorUniformColor) return [{ label: 'Color uniforme', color: layer._geovisorUniformColor }];
  var features = [];
  if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) {
    if (child.feature) features.push(child.feature);
  });
  var field = layer._geovisorActiveClassField || '';
  var kind = layer._tipo || '';
  var candidates = kind === 'tratamientos'
    ? ['tratamient', 'tratamiento', 'tipo_trata', 'tratam', 'clase']
    : ['nombre_uso', 'nombre uso', 'actividad', 'etiqueta', 'uso', 'tipo_uso', 'clase'];
  if (!field && features.length) {
    var propertyNames = Object.keys(features[0].properties || {});
    field = propertyNames.find(function (name) {
      return candidates.map(normalizarCategoria).indexOf(normalizarCategoria(name)) >= 0;
    }) || '';
  }
  if (!field) return [];

  var seen = Object.create(null);
  var rows = [];
  features.forEach(function (feature) {
    var value = (feature.properties || {})[field];
    var label = String(value == null || value === '' ? '' : value).trim();
    var key = normalizarCategoria(label);
    if (!key || seen[key]) return;
    seen[key] = true;
    var color = kind === 'tratamientos' ? (colorTratamiento(label) || colorPorCategoria(label)) : colorPorCategoria(label);
    rows.push({ label: label, color: color });
  });
  return rows.slice(0, 12);
}

function layerLegendColor(layer) {
  if (layer._tipo === 'vias') return { color: '#B49A54', line: true };
  if (layer._tipo === 'limite') return { color: '#58615B', line: true };
  if (layer._tipo === 'manzanas') return { color: '#818982', line: false };
  var sample = null;
  if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) { if (!sample && child.options) sample = child.options; });
  return { color: sample && (sample.fillColor || sample.color) || '#718D78', line: !!(sample && sample.fill === false) };
}

function renderMapLayerLegend() {
  var container = mapLayerLegend.getContainer();
  if (!container) return;
  var names = visibleLegendLayers();
  container.replaceChildren();
  container.hidden = names.length === 0;
  if (!names.length) return;

  var title = document.createElement('h2');
  title.className = 'map-layer-legend-title';
  title.textContent = 'Leyenda';
  container.appendChild(title);

  names.forEach(function (name) {
    var layer = overlayLayers[name];
    var group = document.createElement('section');
    group.className = 'map-layer-legend-group';
    var heading = document.createElement('h3');
    heading.textContent = name;
    group.appendChild(heading);

    var rows = legendFeatureRows(layer);
    if (!rows.length) rows = [{ label: name, ...layerLegendColor(layer) }];
    rows.forEach(function (row) {
      var item = document.createElement('div');
      item.className = 'map-layer-legend-item';
      var symbol = document.createElement('span');
      symbol.className = 'map-layer-legend-symbol' + (row.line ? ' is-line' : '');
      symbol.style.setProperty('--legend-color', row.color || '#718D78');
      var label = document.createElement('span');
      label.textContent = row.label;
      item.append(symbol, label);
      group.appendChild(item);
    });
    container.appendChild(group);
  });
}

function queueMapLayerLegend() {
  if (mapLayerLegendFrame) cancelAnimationFrame(mapLayerLegendFrame);
  mapLayerLegendFrame = requestAnimationFrame(function () {
    mapLayerLegendFrame = 0;
    renderMapLayerLegend();
  });
}

mapLayerLegend.onAdd = function () {
  var container = L.DomUtil.create('aside', 'leaflet-control map-layer-legend');
  container.hidden = true;
  L.DomEvent.disableClickPropagation(container);
  L.DomEvent.disableScrollPropagation(container);
  this._container = container;
  return container;
};
mapLayerLegend.addTo(map);
map.on('overlayadd overlayremove layeradd layerremove', queueMapLayerLegend);
document.addEventListener('geovisor:layerschanged', queueMapLayerLegend);
document.addEventListener('geovisor:mapstyleschanged', queueMapLayerLegend);
document.addEventListener('geovisor:palettechanged', queueMapLayerLegend);
if (sharedNormativePalette) sharedNormativePalette.addEventListener('toggle', queueMapLayerLegend);
queueMapLayerLegend();

map.addLayer(drawnItems);

var drawOptions = {
  shapeOptions: {
    color: '#000000',
    weight: 3,
    opacity: 0.9,
    fillColor: '#c96e57',
    fillOpacity: 0.28,
    renderer: L.canvas()
  },
  metric: true
};

var drawHandlers = {
  marker: new L.Draw.CircleMarker(map, drawOptions),
  polyline: new L.Draw.Polyline(map, drawOptions),
  polygon: new L.Draw.Polygon(map, drawOptions)
};

var activeDrawTool = null;
var selectedDrawing = null;
var stylePanel = document.getElementById('drawing-style-panel');
var styleToggle = document.getElementById('drawing-style-toggle');
var styleTargetSelect = document.getElementById('drawing-style-target');

function collectStyleablePaths(layer, result) {
  if (!layer) return;
  if (layer instanceof L.GeoJSON || layer instanceof L.FeatureGroup || layer instanceof L.LayerGroup) {
    layer.eachLayer(function (child) { collectStyleablePaths(child, result); });
    return;
  }
  if (layer instanceof L.Path && typeof layer.setStyle === 'function') result.push(layer);
}

function refreshDrawingStyleTargets() {
  if (!styleTargetSelect) return;
  var previous = styleTargetSelect.value || 'drawing';
  styleTargetSelect.innerHTML = '<option value="drawing">Dibujo seleccionado</option>';
  Object.keys(overlayLayers).forEach(function (name) {
    var paths = []; collectStyleablePaths(overlayLayers[name], paths);
    if (!paths.length) return;
    var option = document.createElement('option');
    option.value = 'layer:' + name;
    option.textContent = name + ' (' + paths.length + ')';
    styleTargetSelect.appendChild(option);
  });
  if (Array.from(styleTargetSelect.options).some(function (option) { return option.value === previous; })) styleTargetSelect.value = previous;
  else styleTargetSelect.value = 'drawing';
  syncDrawingStylePanel();
}

function getActiveStyleTargets() {
  if (styleTargetSelect.value === 'drawing') return selectedDrawing ? [selectedDrawing] : [];
  var name = styleTargetSelect.value.slice(6);
  var paths = []; collectStyleablePaths(overlayLayers[name], paths);
  return paths;
}

function selectDrawing(layer) {
  selectedDrawing = layer;
  styleTargetSelect.value = 'drawing';
  document.getElementById('style-feature-name').textContent = layer instanceof L.Polygon ? 'Polígono' : (layer instanceof L.CircleMarker ? 'Punto' : 'Línea');
  document.getElementById('drawing-style-status').textContent = 'Editando el estilo del elemento seleccionado.';
  syncDrawingStylePanel();
}

function syncDrawingStylePanel() {
  var targets = getActiveStyleTargets();
  var targetValue = styleTargetSelect.value;
  var targetName = targetValue === 'drawing' ? (selectedDrawing ? (selectedDrawing instanceof L.Polygon ? 'Polígono' : (selectedDrawing instanceof L.CircleMarker ? 'Punto' : 'Línea')) : 'Selecciona un dibujo') : targetValue.slice(6);
  document.getElementById('style-feature-name').textContent = targetName;
  if (!targets.length) {
    document.querySelector('.style-fill-options').style.display = 'none';
    document.querySelector('.point-size-row').style.display = 'none';
    document.getElementById('drawing-style-status').textContent = 'Selecciona un dibujo o una capa vectorial.';
    return;
  }
  var first = targets[0];
  var polygon = targets.some(function (layer) { return layer instanceof L.Polygon; });
  var point = targets.some(function (layer) { return layer instanceof L.CircleMarker; });
  document.querySelector('.style-fill-options').style.display = polygon || point ? '' : 'none';
  document.querySelector('.point-size-row').style.display = point ? '' : 'none';
  document.getElementById('drawing-stroke-color').value = first.options.color || '#000000';
  document.getElementById('drawing-stroke-width').value = first.options.weight || 3;
  document.getElementById('stroke-width-value').textContent = (first.options.weight || 3) + ' px';
  document.getElementById('drawing-fill-color').value = first._drawingFillColor || (typeof first.options.fillColor === 'string' ? first.options.fillColor : '#c96e57');
  document.getElementById('drawing-fill-opacity').value = Math.round((first.options.fillOpacity == null ? .28 : first.options.fillOpacity) * 100);
  document.getElementById('fill-opacity-value').textContent = document.getElementById('drawing-fill-opacity').value + '%';
  document.getElementById('drawing-point-size').value = first.getRadius ? first.getRadius() : 8;
  document.getElementById('point-size-value').textContent = document.getElementById('drawing-point-size').value + ' px';
  document.getElementById('drawing-fill-enabled').checked = first.options.fill !== false;
  var dashPattern = String(first.options.dashArray || '').replace(/\s+/g, ' ').trim();
  var dashPatterns = { '': 'solid', '8 5': 'dash', '2 5': 'dot', '8 4 2 4': 'dashdot' };
  document.getElementById('drawing-line-pattern').value = dashPatterns[dashPattern] || 'solid';
}

function addCanvasPattern(layer, type, color) {
  var renderer = layer._renderer || map.getRenderer(layer);
  var context = renderer && renderer._ctx;
  if (!context || !context.createPattern) {
    document.getElementById('drawing-style-status').textContent = 'No se pudo iniciar el relleno tramado en el renderer Canvas.';
    return false;
  }
  var tile = document.createElement('canvas'); tile.width = 12; tile.height = 12;
  var brush = tile.getContext('2d'); brush.strokeStyle = color; brush.fillStyle = color; brush.lineWidth = 1.3;
  if (type === 'hatch' || type === 'cross') { brush.beginPath(); brush.moveTo(-2, 2); brush.lineTo(2, -2); brush.moveTo(0, 12); brush.lineTo(12, 0); brush.moveTo(10, 14); brush.lineTo(14, 10); brush.stroke(); }
  if (type === 'horizontal' || type === 'cross') { brush.beginPath(); brush.moveTo(0, 3); brush.lineTo(12, 3); brush.moveTo(0, 9); brush.lineTo(12, 9); brush.stroke(); }
  if (type === 'vertical') { brush.beginPath(); brush.moveTo(3, 0); brush.lineTo(3, 12); brush.moveTo(9, 0); brush.lineTo(9, 12); brush.stroke(); }
  if (type === 'dots') { brush.beginPath(); brush.arc(3, 3, 1.4, 0, Math.PI * 2); brush.arc(9, 9, 1.4, 0, Math.PI * 2); brush.fill(); }
  if (type === 'dash') { brush.beginPath(); brush.moveTo(0, 5); brush.lineTo(4, 5); brush.moveTo(8, 5); brush.lineTo(12, 5); brush.stroke(); }
  if (type === 'dotdash') { brush.beginPath(); brush.moveTo(0, 6); brush.lineTo(7, 6); brush.stroke(); brush.beginPath(); brush.arc(10, 6, 1, 0, Math.PI * 2); brush.fill(); }
  layer.options.fillColor = context.createPattern(tile, 'repeat');
  layer.redraw();
  return true;
}

function applySelectedDrawingStyle() {
  var targets = getActiveStyleTargets();
  if (!targets.length) {
    document.getElementById('drawing-style-status').textContent = 'Selecciona primero un dibujo o una capa vectorial.';
    return;
  }
  var pattern = document.getElementById('drawing-fill-pattern').value;
  var dashes = { solid: null, dash: '8 5', dot: '2 5', dashdot: '8 4 2 4' };
  var strokeColor = document.getElementById('drawing-stroke-color').value;
  var fillColor = document.getElementById('drawing-fill-color').value;
  var patternReady = true;
  targets.forEach(function (layer) {
    var polygon = layer instanceof L.Polygon;
    var point = layer instanceof L.CircleMarker;
    var fillOn = (polygon || point) && document.getElementById('drawing-fill-enabled').checked && pattern !== 'none';
    var style = { color: strokeColor, weight: Number(document.getElementById('drawing-stroke-width').value), opacity: 1, dashArray: dashes[document.getElementById('drawing-line-pattern').value], fill: fillOn, fillColor: fillColor, fillOpacity: Number(document.getElementById('drawing-fill-opacity').value) / 100 };
    if (point) layer.setRadius(Number(document.getElementById('drawing-point-size').value));
    layer.setStyle(style);
    layer._drawingFillColor = fillColor;
    if (polygon && fillOn && pattern !== 'solid' && !addCanvasPattern(layer, pattern, fillColor)) patternReady = false;
  });
  if (patternReady) document.getElementById('drawing-style-status').textContent = 'Estilo aplicado a ' + targets.length + ' entidad(es).';
  document.dispatchEvent(new Event('geovisor:mapstyleschanged'));
}

styleToggle.addEventListener('click', function () { openToolPanel(stylePanel); syncDrawingStylePanel(); });
document.getElementById('close-style-panel').addEventListener('click', function () { closeToolPanel(stylePanel); });
styleTargetSelect.addEventListener('change', syncDrawingStylePanel);
['drawing-stroke-color','drawing-stroke-width','drawing-line-pattern','drawing-fill-enabled','drawing-fill-color','drawing-fill-opacity','drawing-fill-pattern','drawing-point-size'].forEach(function (id) {
  var input = document.getElementById(id);
  input.addEventListener('input', function () { document.getElementById('stroke-width-value').textContent = document.getElementById('drawing-stroke-width').value + ' px'; document.getElementById('fill-opacity-value').textContent = document.getElementById('drawing-fill-opacity').value + '%'; document.getElementById('point-size-value').textContent = document.getElementById('drawing-point-size').value + ' px'; applySelectedDrawingStyle(); });
  input.addEventListener('change', applySelectedDrawingStyle);
});

var mapOverlayWorkspace = document.querySelector('.map-overlay');
document.addEventListener('wheel', function (event) {
  if (!mapOverlayWorkspace || mapOverlayWorkspace.scrollHeight <= mapOverlayWorkspace.clientHeight) return;
  var bounds = mapOverlayWorkspace.getBoundingClientRect();
  if (event.clientX >= bounds.left && event.clientX <= bounds.right && event.clientY >= bounds.top && event.clientY <= bounds.bottom) {
    mapOverlayWorkspace.scrollTop += event.deltaY;
    event.preventDefault();
  }
}, { passive: false, capture: true });
map.on(L.Draw.Event.CREATED, function (event) {
  var layer = event.layer;
  layer.feature = layer.feature || { type: 'Feature', properties: {}, geometry: layer.toGeoJSON().geometry };
  drawnItems.addLayer(layer);
  var drawingCount = document.getElementById('drawing-count');
  if (drawingCount) drawingCount.textContent = drawnItems.getLayers().length;

  if (layer instanceof L.Polygon) layer.bindPopup('Pol?gono');
  else if (layer instanceof L.CircleMarker || layer instanceof L.Marker) layer.bindPopup('Punto');
  else if (layer instanceof L.Polyline) layer.bindPopup('L?nea');
  layer.on('click', function () { selectDrawing(layer); });
  selectDrawing(layer);
  openToolPanel(stylePanel);
  syncDrawingStylePanel();

  Object.keys(drawHandlers).forEach(function (key) {
    if (drawHandlers[key] && drawHandlers[key].enabled()) drawHandlers[key].disable();
  });
  activeDrawTool = null;
  document.querySelectorAll('.draw-tool').forEach(function (tool) { tool.classList.remove('active'); });
});

document.querySelectorAll('.draw-tool').forEach(function (button) {
  button.addEventListener('click', function () {
    var toolName = button.dataset.draw;
    Object.keys(drawHandlers).forEach(function (key) {
      if (drawHandlers[key] && drawHandlers[key].enabled()) {
        drawHandlers[key].disable();
      }
    });

    document.querySelectorAll('.draw-tool').forEach(function (tool) {
      tool.classList.remove('active');
    });

    if (activeDrawTool === toolName) {
      activeDrawTool = null;
      return;
    }

    if (drawHandlers[toolName]) {
      drawHandlers[toolName].enable();
      activeDrawTool = toolName;
      button.classList.add('active');
    }
  });
});

// ---------- Divisor de mapas base (cortina) ----------
// Compara los mapas base con un divisor vertical u horizontal que se arrastra.
var splitButton = document.getElementById('split-toggle');
var splitUI = null;
var splitSavedBases = null;

function splitLayerContainer(layer) {
  return layer && typeof layer.getContainer === 'function' ? layer.getContainer() : null;
}

function updateSplitClip() {
  if (!splitUI) return;
  var size = map.getSize();
  var nw = map.containerPointToLayerPoint([0, 0]);
  var se = map.containerPointToLayerPoint(size);
  var left = splitLayerContainer(Esri_WorldImagery);
  var right = splitLayerContainer(Esri_WorldStreetMap);
  if (splitUI.orientation === 'vertical') {
    var x = Math.max(0, Math.min(size.x, splitUI.ratio * size.x));
    var clipX = nw.x + x;
    if (left) left.style.clip = 'rect(' + [nw.y, clipX, se.y, nw.x].join('px,') + 'px)';
    if (right) right.style.clip = 'rect(' + [nw.y, se.x, se.y, clipX].join('px,') + 'px)';
    splitUI.divider.style.left = x + 'px';
    splitUI.divider.style.top = '0';
    splitUI.divider.style.width = '4px';
    splitUI.divider.style.height = '100%';
    splitUI.handle.style.left = x + 'px';
    splitUI.handle.style.top = '50%';
    splitUI.handle.style.cursor = 'ew-resize';
    splitUI.handle.textContent = '◀ ▶';
    splitUI.handle.setAttribute('aria-orientation', 'vertical');
    splitUI.handle.setAttribute('aria-valuetext', Math.round(splitUI.ratio * 100) + '% desde la izquierda');
    splitUI.labelLeft.style.left = '';
    splitUI.labelLeft.style.top = '';
    splitUI.labelLeft.style.bottom = '64px';
    splitUI.labelLeft.style.right = (size.x - x + 12) + 'px';
    splitUI.labelRight.style.top = '';
    splitUI.labelRight.style.bottom = '64px';
    splitUI.labelRight.style.right = '';
    splitUI.labelRight.style.left = (x + 12) + 'px';
  } else {
    var y = Math.max(0, Math.min(size.y, splitUI.ratio * size.y));
    var clipY = nw.y + y;
    if (left) left.style.clip = 'rect(' + [nw.y, se.x, clipY, nw.x].join('px,') + 'px)';
    if (right) right.style.clip = 'rect(' + [clipY, se.x, se.y, nw.x].join('px,') + 'px)';
    splitUI.divider.style.left = '0';
    splitUI.divider.style.top = y + 'px';
    splitUI.divider.style.width = '100%';
    splitUI.divider.style.height = '4px';
    splitUI.handle.style.left = '50%';
    splitUI.handle.style.top = y + 'px';
    splitUI.handle.style.cursor = 'ns-resize';
    splitUI.handle.textContent = '▲ ▼';
    splitUI.handle.setAttribute('aria-orientation', 'horizontal');
    splitUI.handle.setAttribute('aria-valuetext', Math.round(splitUI.ratio * 100) + '% desde arriba');
    splitUI.labelLeft.style.left = '12px';
    splitUI.labelLeft.style.right = '';
    splitUI.labelLeft.style.top = '12px';
    splitUI.labelLeft.style.bottom = '';
    splitUI.labelRight.style.left = '12px';
    splitUI.labelRight.style.right = '';
    splitUI.labelRight.style.top = '';
    splitUI.labelRight.style.bottom = '64px';
  }
  splitUI.handle.setAttribute('aria-valuenow', String(Math.round(splitUI.ratio * 100)));
}

function onSplitLayerRemoved(event) {
  // Si la persona cambia de mapa base desde el panel de capas, el divisor se cierra solo.
  if (splitUI && (event.layer === Esri_WorldImagery || event.layer === Esri_WorldStreetMap)) closeSplit(false);
}

function openSplit() {
  splitSavedBases = { imagery: map.hasLayer(Esri_WorldImagery), street: map.hasLayer(Esri_WorldStreetMap) };
  if (!splitSavedBases.imagery) Esri_WorldImagery.addTo(map);
  if (!splitSavedBases.street) Esri_WorldStreetMap.addTo(map);

  var root = L.DomUtil.create('div', 'split-compare', map.getContainer());
  var divider = L.DomUtil.create('div', 'split-compare-divider', root);
  var labelLeft = L.DomUtil.create('span', 'split-compare-label', root);
  var labelRight = L.DomUtil.create('span', 'split-compare-label', root);
  var handle = L.DomUtil.create('div', 'split-compare-handle', root);
  var orientationToggle = L.DomUtil.create('button', 'split-compare-orientation', root);
  orientationToggle.type = 'button';
  labelLeft.textContent = 'Imágenes';
  labelRight.textContent = 'Calles';
  handle.textContent = '◀ ▶';
  handle.setAttribute('role', 'slider');
  handle.setAttribute('tabindex', '0');
  handle.setAttribute('aria-label', 'Mover el divisor de mapas');
  handle.setAttribute('aria-valuemin', '0');
  handle.setAttribute('aria-valuemax', '100');
  splitUI = { root: root, divider: divider, handle: handle, labelLeft: labelLeft, labelRight: labelRight, orientationToggle: orientationToggle, orientation: 'vertical', ratio: 0.5 };

  function updateOrientationButton() {
    var nextOrientation = splitUI.orientation === 'vertical' ? 'horizontal' : 'vertical';
    orientationToggle.textContent = 'Orientación: ' + (splitUI.orientation === 'vertical' ? 'vertical' : 'horizontal');
    orientationToggle.title = 'Cambiar a orientación ' + nextOrientation;
    orientationToggle.setAttribute('aria-label', 'Cambiar divisor a orientación ' + nextOrientation);
  }
  updateOrientationButton();
  orientationToggle.addEventListener('click', function () {
    splitUI.orientation = splitUI.orientation === 'vertical' ? 'horizontal' : 'vertical';
    updateOrientationButton();
    updateSplitClip();
  });
  L.DomEvent.disableClickPropagation(orientationToggle);
  L.DomEvent.disableScrollPropagation(orientationToggle);

  var dragging = false;
  function moveTo(clientX, clientY) {
    var rect = map.getContainer().getBoundingClientRect();
    var position = splitUI.orientation === 'vertical'
      ? (clientX - rect.left) / rect.width
      : (clientY - rect.top) / rect.height;
    splitUI.ratio = Math.max(0, Math.min(1, position));
    updateSplitClip();
  }
  handle.addEventListener('pointerdown', function (event) {
    event.preventDefault();
    dragging = true;
    if (handle.setPointerCapture) handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', function (event) { if (dragging) moveTo(event.clientX, event.clientY); });
  function stopDrag() { dragging = false; }
  handle.addEventListener('pointerup', stopDrag);
  handle.addEventListener('pointercancel', stopDrag);
  handle.addEventListener('lostpointercapture', stopDrag);
  handle.addEventListener('keydown', function (event) {
    var step = event.shiftKey ? 0.1 : 0.02;
    if (splitUI.orientation === 'vertical' && event.key === 'ArrowLeft') splitUI.ratio = Math.max(0, splitUI.ratio - step);
    else if (splitUI.orientation === 'vertical' && event.key === 'ArrowRight') splitUI.ratio = Math.min(1, splitUI.ratio + step);
    else if (splitUI.orientation === 'horizontal' && event.key === 'ArrowUp') splitUI.ratio = Math.max(0, splitUI.ratio - step);
    else if (splitUI.orientation === 'horizontal' && event.key === 'ArrowDown') splitUI.ratio = Math.min(1, splitUI.ratio + step);
    else if (event.key === 'Home') splitUI.ratio = 0;
    else if (event.key === 'End') splitUI.ratio = 1;
    else return;
    event.preventDefault();
    updateSplitClip();
  });
  L.DomEvent.disableClickPropagation(handle);
  L.DomEvent.disableScrollPropagation(handle);

  map.on('move zoom zoomend moveend resize viewreset layeradd', updateSplitClip);
  map.on('layerremove', onSplitLayerRemoved);
  updateSplitClip();
  splitButton.classList.add('active');
  splitButton.setAttribute('aria-pressed', 'true');
  var toolStatus = document.getElementById('tool-status');
  if (toolStatus) toolStatus.textContent = 'Divisor activo: cambia su orientación con el botón del mapa y arrastra la barra para comparar los mapas base.';
}

function closeSplit(restoreBases) {
  if (!splitUI) return;
  map.off('move zoom zoomend moveend resize viewreset layeradd', updateSplitClip);
  map.off('layerremove', onSplitLayerRemoved);
  [Esri_WorldImagery, Esri_WorldStreetMap].forEach(function (layer) {
    var container = splitLayerContainer(layer);
    if (container) container.style.clip = '';
  });
  L.DomUtil.remove(splitUI.root);
  splitUI = null;
  splitButton.classList.remove('active');
  splitButton.setAttribute('aria-pressed', 'false');
  if (restoreBases && splitSavedBases) {
    if (!splitSavedBases.street && map.hasLayer(Esri_WorldStreetMap)) map.removeLayer(Esri_WorldStreetMap);
    if (!splitSavedBases.imagery && map.hasLayer(Esri_WorldImagery)) map.removeLayer(Esri_WorldImagery);
  }
  splitSavedBases = null;
  var toolStatus = document.getElementById('tool-status');
  if (toolStatus) toolStatus.textContent = 'Divisor cerrado.';
}

function toggleSplitMapTool() {
  try {
    if (splitUI) closeSplit(true); else openSplit();
    document.getElementById('split-panel-status').textContent = splitUI ? 'El divisor está activo en el mapa.' : 'El divisor está cerrado.';
  } catch (error) {
    console.error('Error en el divisor:', error);
    try { closeSplit(true); } catch (ignored) {}
  }
}

if (splitButton) {
  splitButton.setAttribute('aria-pressed', 'false');
  splitButton.addEventListener('click', toggleSplitMapTool);
}

// ---------- Limpiar ----------
// Quita dibujos, resultados de análisis, selecciones y cambios de estilo.

function updateDrawingCount() {
  var drawingCount = document.getElementById('drawing-count');
  if (drawingCount) drawingCount.textContent = String(drawnItems.getLayers().length);
}

var clearDrawingsButton = document.getElementById('clear-drawings');
if (clearDrawingsButton) {
  clearDrawingsButton.addEventListener('click', function () {
    // 1. Cancelar la herramienta de dibujo que esté activa
    Object.keys(drawHandlers).forEach(function (key) {
      if (drawHandlers[key] && drawHandlers[key].enabled()) drawHandlers[key].disable();
    });
    activeDrawTool = null;
    document.querySelectorAll('.draw-tool').forEach(function (tool) { tool.classList.remove('active'); });
    // 2. Borrar todos los dibujos
    drawnItems.clearLayers();
    selectedDrawing = null;
    // 3. Quitar selección de la tabla, resultados del análisis y estilos cambiados
    map.fire('geovisor:clear-selection');
    map.fire('geovisor:clear-analysis');
    map.closePopup();
    // 5. Dejar los paneles en su estado inicial
    styleTargetSelect.value = 'drawing';
    syncDrawingStylePanel();
    document.getElementById('style-feature-name').textContent = 'Selecciona un dibujo';
    document.getElementById('drawing-style-status').textContent = 'Dibuja o haz clic en un elemento para cambiar su estilo.';
    updateDrawingCount();
  });
}

// Borra solo el dibujo seleccionado (botón dentro del panel "Estilo dibujo").
var deleteDrawingButton = document.getElementById('delete-selected-drawing');
if (deleteDrawingButton) {
  deleteDrawingButton.addEventListener('click', function () {
    var status = document.getElementById('drawing-style-status');
    if (selectedDrawing && drawnItems.hasLayer(selectedDrawing)) {
      drawnItems.removeLayer(selectedDrawing);
        selectedDrawing = null;
      styleTargetSelect.value = 'drawing';
      syncDrawingStylePanel();
      document.getElementById('style-feature-name').textContent = 'Selecciona un dibujo';
      status.textContent = 'Dibujo eliminado.';
      updateDrawingCount();
    } else {
      status.textContent = 'Haz clic en un dibujo para seleccionarlo y luego elimínalo.';
    }
  });
}

cargarCapasJuanMina();

window.addEventListener('load', function () {
  window.requestAnimationFrame(function () {
    map.invalidateSize({ pan: false });
    setInitialTerritoryView(initialTerritoryCenter);
  });
});
window.addEventListener('resize', function () {
  window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); });
});

// Herramientas vectoriales y navegación del geovisor.
(function () {
  var selector = document.getElementById('vector-layer');
  var tableLayerSelector = document.getElementById('attribute-layer');
  var tableStatus = document.getElementById('attribute-table-status');
  var overlaySelector = document.getElementById('overlay-layer');
  var status = document.getElementById('tool-status');
  var selected = [];
  var vectorEntries = [];
  var layerSignature = '';
  var resultLayers = L.featureGroup().addTo(map);
  var resultNames = [];
  var table = document.getElementById('attribute-table');
  var attributeEditing = false;
  var geometryEditingEntry = null;
  var attributeEditStatus = document.getElementById('attribute-edit-status');
  function say(message) { if (status) status.textContent = message; }
  function collectFeatures(layer, into) {
    if (!layer) return;
    if (layer instanceof L.GeoJSON) { layer.eachLayer(function (child) { collectFeatures(child, into); }); return; }
    if (layer instanceof L.FeatureGroup || layer instanceof L.LayerGroup) { layer.eachLayer(function (child) { collectFeatures(child, into); }); return; }
    if (layer.feature && layer.toGeoJSON) into.push(layer);
  }
  function refreshLayers() {
    var previous = selector.value;
    vectorEntries = [];
    Object.keys(overlayLayers).forEach(function (name) {
      var features = []; collectFeatures(overlayLayers[name], features);
      if (features.length) vectorEntries.push({ name: name, layer: overlayLayers[name], features: features });
    });
    var signature = vectorEntries.map(function (entry) { return entry.name + ':' + entry.features.length; }).join('|');
    if (signature === layerSignature) return;
    layerSignature = signature;
    selector.innerHTML = '<option value="">Selecciona capa vectorial</option>';
    tableLayerSelector.innerHTML = vectorEntries.length ? '' : '<option value="">No hay capas vectoriales cargadas</option>';
    vectorEntries.forEach(function (entry, index) {
      var option = document.createElement('option'); option.value = String(index); option.textContent = entry.name; selector.appendChild(option);
      var tableOption = document.createElement('option'); tableOption.value = String(index); tableOption.textContent = entry.name; tableLayerSelector.appendChild(tableOption);
    });
    overlaySelector.innerHTML = '<option value="">Misma capa</option>';
    vectorEntries.forEach(function (entry, index) { var option = document.createElement('option'); option.value = String(index); option.textContent = entry.name; overlaySelector.appendChild(option); });
    if (previous && Number(previous) < vectorEntries.length) selector.value = previous;
    else if (vectorEntries.length) selector.value = '0';
    tableLayerSelector.value = selector.value;
    updateFields();
  }
  function current() { return selector.value === '' ? null : vectorEntries[Number(selector.value)]; }
  function updateFields() {
    var entry = current(); var fields = document.getElementById('attribute-field'); var classes = document.getElementById('class-field');
    fields.innerHTML = ''; classes.innerHTML = '<option value="">Sin clasificación</option>';
    if (!entry || !entry.features.length) return;
    fields.innerHTML = '<option value="">Selecciona campo</option>';
    var keys = Array.from(new Set(entry.features.reduce(function (all, feature) { return all.concat(Object.keys(feature.feature.properties || {})); }, [])));
    keys.forEach(function (key) { [fields, classes].forEach(function (select) { var option = document.createElement('option'); option.value = key; option.textContent = key; select.appendChild(option); }); });
    say(entry.features.length + ' elementos vectoriales disponibles.');
    if (!table.hidden) renderTable();
  }
  selector.addEventListener('change', function () { if (geometryEditingEntry) setGeometryEditing(geometryEditingEntry, false); tableLayerSelector.value = selector.value; clearAttributeSelection(); updateFields(); });
  tableLayerSelector.addEventListener('change', function () { selector.value = tableLayerSelector.value; if (geometryEditingEntry) setGeometryEditing(geometryEditingEntry, false); clearAttributeSelection(); updateFields(); renderTable(); });
  map.on('layeradd layerremove', function () { window.setTimeout(refreshLayers, 250); });
  window.setInterval(refreshLayers, 1800);
  function restoreStyles(entry) {
    var base = entry.layer;
    if (base) delete base._geovisorUniformColor;
    if (base && base._tipo && typeof base.setStyle === 'function') {
      base.setStyle(function (feature) { return estiloShapefile(base._tipo, feature); });
      return;
    }
    entry.features.forEach(function (feature) { if (feature.setStyle) feature.setStyle({ color: '#000000', weight: 2, fillColor: '#c96e57', fillOpacity: .28, opacity: .9, dashArray: null }); });
  }
  function clearAttributeSelection() {
    selected.forEach(function (feature) {
      if (feature.setStyle && feature._selectionBaseStyle) feature.setStyle(feature._selectionBaseStyle);
      delete feature._selectionBaseStyle;
    });
    selected = [];
    renderTable();
  }
  map.on('geovisor:clear-selection', clearAttributeSelection);
  map.on('geovisor:clear-analysis', function () {
    var removed = resultNames.length;
    resultNames.forEach(function (name) {
      var layer = overlayLayers[name];
      if (layer) { layerControl.removeLayer(layer); if (map.hasLayer(layer)) map.removeLayer(layer); }
      delete overlayLayers[name];
    });
    resultLayers.getLayers().slice().forEach(function (layer) {
      if (!layer._geovisorBuffer) return;
      layerControl.removeLayer(layer);
      if (map.hasLayer(layer)) map.removeLayer(layer);
      resultLayers.removeLayer(layer);
    });
    resultNames = [];
    activeBufferName = null;
    activeBufferLayer = null;
    document.getElementById('delete-buffer').disabled = true;
    resultLayers.clearLayers();
    Object.keys(overlayLayers).forEach(function (name) {
      var layer = overlayLayers[name];
      if (layer) delete layer._geovisorUniformColor;
      if (layer && layer._tipo && typeof layer.setStyle === 'function') layer.setStyle(function (feature) { return estiloShapefile(layer._tipo, feature); });
    });
    document.getElementById('class-field').value = '';
    document.getElementById('layer-color').value = '#c96e57';
    document.getElementById('layer-opacity').value = '55';
    document.getElementById('opacity-value').textContent = '55%';
    refreshDrawingStyleTargets();
    refreshLayers();
    say(removed ? 'Mapa limpio: se quitaron los resultados del análisis y los dibujos.' : 'Mapa limpio.');
  });
  function highlightSelection(features) {
    clearAttributeSelection();
    selected = features.slice();
    selected.forEach(function (feature) {
      if (!feature.setStyle) return;
      feature._selectionBaseStyle = { color: feature.options.color, weight: feature.options.weight, opacity: feature.options.opacity, fillColor: feature.options.fillColor, fillOpacity: feature.options.fillOpacity, fill: feature.options.fill, dashArray: feature.options.dashArray };
      feature.setStyle({ color: '#c96e57', weight: Math.max(Number(feature.options.weight) || 1, 3), opacity: 1 });
    });
    renderTable();
  }
  function setGeometryEditing(entry, enabled) {
    if (geometryEditingEntry && geometryEditingEntry !== entry) setGeometryEditing(geometryEditingEntry, false);
    var changed = 0;
    entry.features.forEach(function (feature) {
      if (!feature.editing) return;
      if (enabled && typeof feature.editing.enable === 'function') { feature.editing.enable(); changed++; }
      else if (!enabled && typeof feature.editing.disable === 'function') feature.editing.disable();
      if (!enabled && feature.feature && feature.toGeoJSON) feature.feature.geometry = feature.toGeoJSON().geometry;
    });
    geometryEditingEntry = enabled ? entry : null;
    var button = document.getElementById('geometry-edit-toggle');
    button.setAttribute('aria-pressed', String(enabled)); button.textContent = enabled ? 'Terminar geometrÃ­as' : 'Editar geometrÃ­as';
    if (attributeEditStatus) attributeEditStatus.textContent = enabled ? (changed ? 'EdiciÃ³n activa: arrastra los vÃ©rtices de lÃ­neas y polÃ­gonos. Descarga el GeoJSON para conservar los cambios.' : 'Esta capa no expone vÃ©rtices editables en el mapa. Puedes cambiar sus atributos en la tabla.') : 'Los cambios se aplican en esta sesiÃ³n. Descarga la capa para conservarlos.';
  }
  function applyBufferStyle() {
    if (!activeBufferLayer || typeof activeBufferLayer.setStyle !== 'function') return false;
    var color = document.getElementById('layer-color').value;
    var opacity = Number(document.getElementById('layer-opacity').value) / 100;
    activeBufferLayer.setStyle({ color: color, fillColor: color, fillOpacity: opacity, opacity: opacity, weight: 2 });
    document.dispatchEvent(new Event('geovisor:mapstyleschanged'));
    return true;
  }
  document.getElementById('layer-color').addEventListener('input', applyBufferStyle);
  document.getElementById('layer-opacity').addEventListener('input', function (event) {
    document.getElementById('opacity-value').textContent = event.target.value + '%';
    applyBufferStyle();
  });
  document.getElementById('class-field').addEventListener('change', function (event) {
    var entry = current(); if (!entry || !event.target.value) { if (entry) { delete entry.layer._geovisorActiveClassField; entry.features.forEach(function (feature) { delete feature._geovisorClassField; }); restoreStyles(entry); } document.dispatchEvent(new Event('geovisor:mapstyleschanged')); return; }
    if (entry.layer) delete entry.layer._geovisorUniformColor;
    if (entry.layer && ['limite', 'manzanas', 'vias'].indexOf(entry.layer._tipo) >= 0) { restoreStyles(entry); document.dispatchEvent(new Event('geovisor:mapstyleschanged')); say('Esta capa conserva el color normativo asignado.'); return; }
    if (entry.layer) entry.layer._geovisorActiveClassField = event.target.value;
    var values = Array.from(new Set(entry.features.map(function (f) { return String((f.feature.properties || {})[event.target.value]); })));
    entry.features.forEach(function (feature) { var value = String((feature.feature.properties || {})[event.target.value]); var color = entry.layer && entry.layer._tipo === 'tratamientos' ? (colorTratamiento(value) || colorPorCategoria(value)) : colorPorCategoria(value); feature._geovisorClassField = event.target.value; if (feature.setStyle) feature.setStyle({ color: color, fillColor: color, fillOpacity: .38 }); });
    document.dispatchEvent(new Event('geovisor:mapstyleschanged'));
    say('Clasificación única aplicada: ' + values.length + ' categorías.');
  });
  document.getElementById('select-attribute').addEventListener('click', function () {
    var entry = current(); var field = document.getElementById('attribute-field').value; var query = document.getElementById('attribute-query').value.trim().toLowerCase();
    if (!entry || !field || !query) { say('Selecciona una capa, un campo y un valor para buscar.'); return; }
    var exact = document.getElementById('attribute-match').value === 'equals';
    var matches = entry.features.filter(function (feature) {
      var value = String((feature.feature.properties || {})[field] == null ? '' : (feature.feature.properties || {})[field]).toLowerCase();
      return exact ? value === query : value.includes(query);
    });
    highlightSelection(matches);
    say(selected.length + ' elemento(s) seleccionado(s).');
  });
  document.getElementById('clear-selection').addEventListener('click', function () { clearAttributeSelection(); say('Selección de atributos quitada.'); });
  document.addEventListener('geovisor:attributeschanged', function () {
    aplicarPaletaCompartidaEnMapa();
  });
  document.getElementById('zoom-selection').addEventListener('click', function () { var bounds = L.featureGroup(selected).getBounds(); if (bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30] }); else say('No hay elementos seleccionados.'); });
  var activeBufferName = null;
  var activeBufferLayer = null;
  function removeActiveBuffer() {
    if (!activeBufferName && !activeBufferLayer) return false;
    var oldBuffer = activeBufferLayer || overlayLayers[activeBufferName];
    if (oldBuffer) {
      if (map.hasLayer(oldBuffer)) map.removeLayer(oldBuffer);
      layerControl.removeLayer(oldBuffer);
      resultLayers.removeLayer(oldBuffer);
    }
    if (activeBufferName) {
      delete overlayLayers[activeBufferName];
      resultNames = resultNames.filter(function (name) { return name !== activeBufferName; });
    }
    activeBufferName = null;
    activeBufferLayer = null;
    document.getElementById('delete-buffer').disabled = true;
    refreshDrawingStyleTargets();
    layerSignature = '';
    refreshLayers();
    return true;
  }
  function dissolveBufferFeatures(buffered) {
    var features = buffered && buffered.type === 'FeatureCollection' ? buffered.features : (buffered ? [buffered] : []);
    if (!features.length) throw new Error('No se obtuvo geometría para esta distancia.');
    var merged = features[0];
    for (var i = 1; i < features.length; i++) {
      var next = features[i];
      if (typeof turf.union === 'function') {
        var unioned = turf.union(merged, next);
        if (unioned) { merged = unioned; continue; }
      }
      if (typeof turf.combine === 'function') merged = turf.combine(turf.featureCollection([merged, next])).features[0];
      else throw new Error('No se pudieron unir todas las zonas del buffer.');
    }
    return merged;
  }
  function addGeoJSON(geojson, name) { var result = L.geoJSON(geojson, { style: { color: '#c96e57', weight: 2, fillColor: '#c96e57', fillOpacity: .3 }, pointToLayer: function (feature, latlng) { return L.circleMarker(latlng, { radius: 6, color: '#c96e57', weight: 2, fillColor: '#c96e57', fillOpacity: .3 }); }, onEachFeature: mostrarAtributos }); resultLayers.addLayer(result); var overlayName = name + ' (' + (resultLayers.getLayers().length) + ')'; overlayLayers[overlayName] = result; resultNames.push(overlayName); layerControl.addOverlay(result, overlayName); document.dispatchEvent(new Event('geovisor:layerschanged')); refreshDrawingStyleTargets(); say(name + ' agregado al mapa.'); return overlayName; }
  var importPanel = document.getElementById('data-import-panel');
  var importInput = document.getElementById('data-import-input');
  var directoryInput = document.getElementById('data-import-directory');
  var importStatus = document.getElementById('data-import-status');
  function importMessage(message) { importStatus.textContent = message; }
  function fileExtension(file) { return file.name.split('.').pop().toLowerCase(); }
  function cleanLayerName(file) { return file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Capa importada'; }
  function asFeatureCollection(data) {
    if (Array.isArray(data)) data = { type: 'FeatureCollection', features: data.reduce(function (all, item) { return all.concat(item.features || []); }, []) };
    if (data && data.type === 'Feature') data = { type: 'FeatureCollection', features: [data] };
    if (data && !data.type && typeof data === 'object') data = { type: 'FeatureCollection', features: Object.keys(data).reduce(function (all, key) { var item = data[key]; return all.concat(item && item.features || []); }, []) };
    if (!data || data.type !== 'FeatureCollection' || !Array.isArray(data.features)) throw new Error('No se encontró una colección de entidades vectoriales válida.');
    return data;
  }
  function addImportedVector(data, name) { var overlayName = addGeoJSON(asFeatureCollection(data), name); var layer = overlayLayers[overlayName]; if (layer) layer._geovisorImported = true; document.dispatchEvent(new Event('geovisor:layerschanged')); var bounds = layer && layer.getBounds(); if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 17 }); return overlayName; }
  function parseCsv(text) {
    var firstLine = text.split(/\r?\n/, 1)[0] || '';
    var delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : ((firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length ? '\t' : ',');
    var rows = [], row = [], value = '', quoted = false;
    for (var i = 0; i < text.length; i++) { var ch = text[i]; if (quoted && ch === '"' && text[i + 1] === '"') { value += '"'; i++; } else if (ch === '"') quoted = !quoted; else if (ch === delimiter && !quoted) { row.push(value); value = ''; } else if ((ch === '\n' || ch === '\r') && !quoted) { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(value); if (row.some(function (cell) { return cell.trim(); })) rows.push(row); row = []; value = ''; } else value += ch; }
    row.push(value); if (row.some(function (cell) { return cell.trim(); })) rows.push(row);
    if (rows.length < 2) throw new Error('El CSV necesita encabezados y filas de datos.');
    var fields = rows[0].map(function (field, index) { return field.replace(/^\uFEFF/, '').trim() || 'campo_' + (index + 1); });
    var normalized = fields.map(function (field) { return field.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ''); });
    function findField(aliases) { var index = normalized.findIndex(function (field) { return aliases.indexOf(field) >= 0; }); return index; }
    var latIndex = findField(['lat', 'latitude', 'latitud', 'y', 'coordy', 'northing']);
    var lonIndex = findField(['lon', 'lng', 'long', 'longitude', 'longitud', 'x', 'coordx', 'easting']);
    var wktIndex = findField(['wkt', 'geometry', 'geom']);
    var features = [];
    rows.slice(1).forEach(function (cells) {
      var properties = {}; fields.forEach(function (field, index) { properties[field] = (cells[index] || '').trim(); });
      var geometry = null;
      if (latIndex >= 0 && lonIndex >= 0) { var lat = Number(properties[fields[latIndex]].replace(',', '.')); var lon = Number(properties[fields[lonIndex]].replace(',', '.')); if (Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) geometry = { type: 'Point', coordinates: [lon, lat] }; }
      if (!geometry && wktIndex >= 0) { var match = String(properties[fields[wktIndex]]).match(/^\s*POINT\s*\(?\s*(-?[\d.]+)[ ,]+(-?[\d.]+)/i); if (match) geometry = { type: 'Point', coordinates: [Number(match[1]), Number(match[2])] }; }
      if (geometry) features.push({ type: 'Feature', properties: properties, geometry: geometry });
    });
    if (!features.length) throw new Error('No se detectaron coordenadas WGS84. El CSV debe tener columnas lat/lon, latitude/longitude o x/y.');
    return { type: 'FeatureCollection', features: features };
  }
  function addLocalRaster(file) {
    return file.arrayBuffer().then(function (buffer) { return parseGeoraster(buffer, { readOnDemand: true }); }).then(function (georaster) {
      var raster = new GeoRasterLayer({ georaster: georaster, resolution: 256, opacity: .82, pixelValuesToColorFn: function (values) { if (values[0] == null || Number.isNaN(values[0])) return null; if (values.length >= 3) return 'rgb(' + values[0] + ',' + values[1] + ',' + values[2] + ')'; var gray = Math.max(0, Math.min(255, values[0])); return 'rgb(' + gray + ',' + gray + ',' + gray + ')'; } });
      var group = L.layerGroup([raster]); var name = cleanLayerName(file); overlayLayers[name] = group; layerControl.addOverlay(group, name); group.addTo(map); var bounds = raster.getBounds(); if (bounds && bounds.isValid()) map.fitBounds(bounds, { padding: [20, 20] }); return name;
    });
  }
  function addLocalVector(file) {
    var ext = fileExtension(file); var name = cleanLayerName(file);
    if (ext === 'geojson' || ext === 'json') return file.text().then(function (text) { return addImportedVector(JSON.parse(text), name); });
    if (ext === 'csv') return file.text().then(function (text) { return addImportedVector(parseCsv(text), name); });
    if (ext === 'kml' || ext === 'gpx') return file.text().then(function (text) { if (!window.togeojson) throw new Error('No se cargó el conversor KML/GPX.'); var xml = new DOMParser().parseFromString(text, 'text/xml'); if (xml.querySelector('parsererror')) throw new Error('El archivo XML no tiene un formato válido.'); var converted = ext === 'kml' ? window.togeojson.kml(xml) : window.togeojson.gpx(xml); return addImportedVector(converted, name); });
    if (ext === 'kmz') return window.JSZip.loadAsync(file).then(function (archive) { var kmlPath = Object.keys(archive.files).find(function (path) { return /(^|\/)doc\.kml$/i.test(path); }) || Object.keys(archive.files).find(function (path) { return /\.kml$/i.test(path); }); if (!kmlPath) throw new Error('El KMZ no contiene un archivo KML.'); return archive.file(kmlPath).async('text'); }).then(function (text) { if (!window.togeojson) throw new Error('No se cargó el conversor KML/KMZ.'); var xml = new DOMParser().parseFromString(text, 'text/xml'); if (xml.querySelector('parsererror')) throw new Error('El KML incluido no tiene un formato válido.'); return addImportedVector(window.togeojson.kml(xml), name); });
    if (ext === 'tif' || ext === 'tiff') return addLocalRaster(file);
    return Promise.reject(new Error('Formato no reconocido: ' + file.name));
  }
  function addShapefileZip(file) {
    if (typeof window.shp !== 'function') return Promise.reject(new Error('No está disponible el lector SHP.'));
    return file.arrayBuffer().then(function (buffer) { return window.shp(buffer); }).then(function (data) { return addImportedVector(data, cleanLayerName(file)); });
  }
  function zipLooseShapefile(files, shpFile) {
    if (!window.JSZip || typeof window.shp !== 'function') return Promise.reject(new Error('No se cargó el lector para SHP sueltos.'));
    var base = shpFile.name.replace(/\.shp$/i, '').toLowerCase(); var zip = new window.JSZip();
    files.filter(function (file) { return file.name.replace(/\.[^.]+$/, '').toLowerCase() === base && ['shp', 'dbf', 'shx', 'prj', 'cpg'].indexOf(fileExtension(file)) >= 0; }).forEach(function (file) { zip.file(file.name, file); });
    return zip.generateAsync({ type: 'arraybuffer' }).then(function (buffer) { return window.shp(buffer); }).then(function (data) { return addImportedVector(data, cleanLayerName(shpFile)); });
  }
  function importFiles(fileList) {
    var files = Array.from(fileList || []); if (!files.length) return;
    importMessage('Leyendo ' + files.length + ' archivo(s)…');
    var imported = 0; var errors = [];
    var tasks = files.map(function (file) {
      var ext = fileExtension(file);
      if (ext === 'shp') return zipLooseShapefile(files, file).then(function () { imported++; }).catch(function (error) { errors.push(file.name + ': ' + error.message); });
      if (['dbf', 'shx', 'prj', 'cpg'].indexOf(ext) >= 0) return Promise.resolve();
      if (ext === 'zip') return addShapefileZip(file).then(function () { imported++; }).catch(function (error) { errors.push(file.name + ': ' + error.message); });
      if (['geojson', 'json', 'csv', 'kml', 'kmz', 'gpx', 'tif', 'tiff'].indexOf(ext) >= 0) return addLocalVector(file).then(function () { imported++; }).catch(function (error) { errors.push(file.name + ': ' + error.message); });
      return Promise.resolve();
    });
    Promise.all(tasks).then(function () {
      var gdb = files.some(function (file) { return /\.gdb([/\\]|$)/i.test(file.webkitRelativePath || file.name); });
      var summary = imported + ' capa(s) agregada(s).'; if (gdb) summary += ' FileGDB no está soportada directamente: expórtala a SHP, GeoJSON o CSV.';
      if (errors.length) summary += ' ' + errors.slice(0, 2).join(' · ');
      if (!imported && !errors.length && !gdb) summary = 'No se reconocieron archivos compatibles. Usa ZIP/SHP, GeoJSON, CSV, KML/KMZ, GPX o GeoTIFF.';
      importMessage(summary);
      if (errors.length) document.dispatchEvent(new CustomEvent('geovisor:importerror', { detail: { message: 'No se pudo leer la capa: ' + errors[0].split(':')[0] + '.' } }));
    });
  }
  document.getElementById('data-import-files').addEventListener('click', function () { importInput.click(); });
  document.getElementById('data-import-folder').addEventListener('click', function () { directoryInput.click(); });
  importInput.addEventListener('change', function () { importFiles(importInput.files); importInput.value = ''; });
  directoryInput.addEventListener('change', function () { importFiles(directoryInput.files); directoryInput.value = ''; });
  map.getContainer().addEventListener('dragover', function (event) { event.preventDefault(); });
  map.getContainer().addEventListener('drop', function (event) { event.preventDefault(); importPanel.open = true; importFiles(event.dataTransfer.files); });
  document.getElementById('delete-buffer').addEventListener('click', function () {
    if (removeActiveBuffer()) say('Buffer eliminado. Puedes crear uno nuevo.');
  });
  document.getElementById('make-buffer').addEventListener('click', function () {
    var entry = current(); var distance = Number(document.getElementById('buffer-distance').value);
    if (!entry || !window.turf || !(distance > 0)) { say('Selecciona una capa y una distancia válida.'); return; }
    try { var features = entry.features.map(function (f) { return f.toGeoJSON(); }); var collection = turf.featureCollection(features); var buffered = turf.buffer(collection, distance, { units: 'meters' }); var dissolved = dissolveBufferFeatures(buffered); removeActiveBuffer(); activeBufferName = addGeoJSON(dissolved, 'Buffer ' + distance + ' m'); activeBufferLayer = overlayLayers[activeBufferName]; activeBufferLayer._geovisorBuffer = true; applyBufferStyle(); document.getElementById('delete-buffer').disabled = false; } catch (error) { say('No se pudo crear el buffer: ' + error.message); }
  });
  document.getElementById('overlay-intersection').addEventListener('click', function () {
    var entry = current(); var second = overlaySelector.value === '' ? entry : vectorEntries[Number(overlaySelector.value)];
    if (!entry || !second || !window.turf || (entry === second && entry.features.length < 2)) { say('Selecciona dos capas o al menos dos elementos para intersectar.'); return; }
    try { var result = []; var features = entry.features.map(function (f) { return f.toGeoJSON(); }); var otherFeatures = second.features.map(function (f) { return f.toGeoJSON(); });
      for (var i = 0; i < features.length; i++) for (var j = 0; j < otherFeatures.length; j++) { if (entry === second && j <= i) continue; var overlap = turf.intersect(features[i], otherFeatures[j]); if (overlap) result.push(overlap); }
      if (result.length) addGeoJSON(turf.featureCollection(result), 'Intersección'); else say('No se encontraron áreas de intersección entre los elementos.');
    } catch (error) { say('Intersección: ' + error.message); }
  });
document.getElementById('attributes-toggle').addEventListener('click', function () {
    refreshLayers();
    if (!current() && vectorEntries.length) { selector.value = '0'; tableLayerSelector.value = '0'; updateFields(); }
    var entry = current(); if (!entry) { if (tableStatus) tableStatus.textContent = 'No hay capas vectoriales disponibles todavía.'; openToolPanel(table); return; }
    if (!table.hidden) { openToolPanel(table); return; }
    tableLayerSelector.value = selector.value; openToolPanel(table); renderTable();
  });
  document.addEventListener('geovisor:close-tool-panel', function (event) {
    if (event.detail && event.detail.id === table.id && geometryEditingEntry) setGeometryEditing(geometryEditingEntry, false);
  });
  document.getElementById('close-attribute-table').addEventListener('click', function () { if (geometryEditingEntry) setGeometryEditing(geometryEditingEntry, false); closeToolPanel(table); });
  document.getElementById('attribute-edit-toggle').addEventListener('click', function (event) { attributeEditing = !attributeEditing; event.currentTarget.setAttribute('aria-pressed', String(attributeEditing)); event.currentTarget.textContent = attributeEditing ? 'Terminar edición' : 'Editar atributos'; if (attributeEditStatus && !geometryEditingEntry) attributeEditStatus.textContent = attributeEditing ? 'Edición activa: modifica directamente las celdas de la tabla.' : 'Los cambios se aplican en esta sesión. Descarga la capa para conservarlos.'; renderTable(); });
  document.getElementById('geometry-edit-toggle').addEventListener('click', function () { var entry = current(); if (!entry) return; setGeometryEditing(entry, geometryEditingEntry !== entry); });
  document.getElementById('attribute-export').addEventListener('click', function () {
    var entry = current(); if (!entry) { say('Selecciona una capa vectorial para descargarla.'); return; }
    if (geometryEditingEntry) setGeometryEditing(geometryEditingEntry, false);
    var output = entry.layer.toGeoJSON();
    if (output.type === 'Feature') output = { type: 'FeatureCollection', features: [output] };
    var blob = new Blob([JSON.stringify(output, null, 2)], { type: 'application/geo+json;charset=utf-8' });
    var url = URL.createObjectURL(blob); var link = document.createElement('a'); link.href = url; link.download = entry.name.replace(/[^\w.-]+/g, '_') + '.geojson'; link.click(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    if (attributeEditStatus) attributeEditStatus.textContent = 'Capa GeoJSON descargada con los cambios actuales.';
  });
  function renderTable() {
    var grid = document.getElementById('attribute-grid'); var entry = current();
    if (!grid || !entry) { if (grid) grid.innerHTML = '<p>No hay capa seleccionada.</p>'; if (tableStatus) tableStatus.textContent = 'No hay capas vectoriales disponibles para consultar.'; return; }
    var features = entry.features.slice(0, 500);
    if (tableStatus) tableStatus.textContent = entry.name + ' · ' + entry.features.length + ' registros · mostrando hasta 500.';
    var keys = Array.from(new Set(features.reduce(function (all, feature) { return all.concat(Object.keys(feature.feature.properties || {})); }, [])));
    grid.innerHTML = '<table><thead><tr><th>Sel.</th><th>#</th>' + keys.map(function (key) { return '<th>' + escapeHTML(key) + '</th>'; }).join('') + '</tr></thead><tbody>' + features.map(function (feature, index) {
      var row = feature.feature.properties || {};
      return '<tr class="' + (selected.indexOf(feature) >= 0 ? 'is-selected' : '') + '"><td><input type="checkbox" data-feature-index="' + index + '" aria-label="Seleccionar registro ' + (index + 1) + '" ' + (selected.indexOf(feature) >= 0 ? 'checked' : '') + '></td><th>' + (index + 1) + '</th>' + keys.map(function (key) { return '<td' + (attributeEditing ? ' contenteditable="true" class="attribute-editable" data-feature-index="' + index + '" data-field="' + escapeHTML(key) + '" title="Editar atributo"' : '') + '>' + escapeHTML(row[key] == null ? '' : row[key]) + '</td>'; }).join('') + '</tr>';
    }).join('') + '</tbody></table>' + (entry.features.length > features.length ? '<small>Mostrando ' + features.length + ' de ' + entry.features.length + ' registros.</small>' : '');
    grid.querySelectorAll('input[data-feature-index]').forEach(function (checkbox) {
      checkbox.addEventListener('change', function () {
        var feature = entry.features[Number(checkbox.dataset.featureIndex)];
        var next = selected.filter(function (item) { return item !== feature; });
        if (checkbox.checked) next.push(feature);
        highlightSelection(next);
        say(selected.length + ' elemento(s) seleccionado(s).');
      });
    });
    grid.querySelectorAll('td.attribute-editable').forEach(function (cell) { cell.addEventListener('blur', function () { var target = entry.features[Number(cell.dataset.featureIndex)]; if (!target || !target.feature) return; target.feature.properties = target.feature.properties || {}; target.feature.properties[cell.dataset.field] = cell.textContent.trim(); if (attributeEditStatus) attributeEditStatus.textContent = 'Atributo actualizado en la sesiÃ³n. Descarga la capa para conservar todos los cambios.'; document.dispatchEvent(new Event('geovisor:attributeschanged')); }); });
  }
  function escapeHTML(value) { return String(value).replace(/[&<>"']/g, function (c) { return ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' })[c]; }); }
  var exportPanel = document.getElementById('map-export-panel');
  var exportButton = document.getElementById('save-map');
  var exportWidth = document.getElementById('export-width');
  var exportHeight = document.getElementById('export-height');
  var exportDimensions = document.getElementById('export-dimensions');
  var exportFormat = document.getElementById('export-format');
  var exportQualityRow = document.getElementById('export-quality-row');
  var exportTitleEnabled = document.getElementById('export-title-enabled');
  var exportTitleRow = document.getElementById('export-title-row');
  function updateExportOptions() {
    var size = map.getSize();
    if (!exportWidth.value) exportWidth.value = Math.round(size.x * 2);
    if (!exportHeight.value) exportHeight.value = Math.round(size.y * 2);
    exportDimensions.textContent = 'Tamaño de salida: ' + (Number(exportWidth.value) || 0) + ' × ' + (Number(exportHeight.value) || 0) + ' px.';
    exportQualityRow.hidden = exportFormat.value !== 'jpeg';
    exportTitleRow.hidden = !exportTitleEnabled.checked;
  }
  exportButton.addEventListener('click', function () {
    openToolPanel(exportPanel);
    updateExportOptions();
  });
  document.getElementById('close-export-panel').addEventListener('click', function () { closeToolPanel(exportPanel); });
  exportWidth.addEventListener('input', updateExportOptions);
  exportHeight.addEventListener('input', updateExportOptions);
  exportFormat.addEventListener('change', updateExportOptions);
  exportTitleEnabled.addEventListener('change', updateExportOptions);
  document.getElementById('export-quality').addEventListener('input', function (event) { document.getElementById('export-quality-value').textContent = event.target.value + '%'; });
  map.on('resize', updateExportOptions);
  document.getElementById('export-image').addEventListener('click', function () {
    var status = document.getElementById('export-status');
    var downloadButton = document.getElementById('export-image');
    if (!window.leafletImage) { status.textContent = 'No se cargó la herramienta de captura. Comprueba la conexión y vuelve a abrir la página.'; return; }
    downloadButton.disabled = true;
    status.textContent = 'Capturando la vista actual del mapa…';
    try {
      window.leafletImage(map, function (error, sourceCanvas) {
        if (error || !sourceCanvas) {
          status.textContent = 'No se pudo capturar el mapa. Revisa la conexión de los mapas base y vuelve a intentar.';
          downloadButton.disabled = false;
          return;
        }
        try {
          var outputWidth = Number(exportWidth.value);
          var outputHeight = Number(exportHeight.value);
          if (!Number.isInteger(outputWidth) || !Number.isInteger(outputHeight) || outputWidth < 100 || outputHeight < 100 || outputWidth > 12000 || outputHeight > 12000) throw new Error('El ancho y el alto deben estar entre 100 y 12.000 píxeles.');
          var scale = outputWidth / sourceCanvas.width;
          var outputCanvas = document.createElement('canvas');
          outputCanvas.width = outputWidth;
          outputCanvas.height = outputHeight;
          if (outputCanvas.width * outputCanvas.height > 50000000) throw new Error('La resolución seleccionada es demasiado grande. Elige una escala menor.');
          var context = outputCanvas.getContext('2d');
          var isJpeg = exportFormat.value === 'jpeg';
          if (isJpeg) { context.fillStyle = '#ffffff'; context.fillRect(0, 0, outputCanvas.width, outputCanvas.height); }
          context.drawImage(sourceCanvas, 0, 0, outputCanvas.width, outputCanvas.height);
          if (exportTitleEnabled.checked) {
            var title = document.getElementById('export-title').value.trim() || 'GeoVisor Territorial · Juan Mina';
            var pad = 14 * scale; var fontSize = 18 * scale; var boxHeight = 42 * scale;
            context.font = '600 ' + fontSize + 'px Segoe UI, sans-serif';
            var boxWidth = Math.min(outputCanvas.width - pad * 2, context.measureText(title).width + pad * 2);
            context.fillStyle = 'rgba(45,15,29,.88)'; context.fillRect(pad, pad, boxWidth, boxHeight);
            context.fillStyle = '#fffaf5'; context.textBaseline = 'middle'; context.fillText(title, pad * 2, pad + boxHeight / 2, boxWidth - pad * 2);
          }
          var mime = isJpeg ? 'image/jpeg' : 'image/png';
          var quality = Number(document.getElementById('export-quality').value) / 100;
          var dataUrl = outputCanvas.toDataURL(mime, quality);
          var filename = document.getElementById('export-filename').value.trim().replace(/[\\/:*?"<>|]+/g, '-').replace(/\s+/g, '-') || 'geovisor-juan-mina';
          var link = document.createElement('a'); link.download = filename + (isJpeg ? '.jpg' : '.png'); link.href = dataUrl; link.click();
          status.textContent = 'Imagen descargada: ' + outputCanvas.width + ' × ' + outputCanvas.height + ' px.';
          say('Imagen del mapa descargada correctamente.');
        } catch (exportError) {
          status.textContent = exportError.message.indexOf('tainted') >= 0 || exportError.name === 'SecurityError' ? 'El navegador bloqueó la exportación por permisos de origen de alguna capa.' : 'No se pudo crear la imagen: ' + exportError.message;
        }
        downloadButton.disabled = false;
      });
    } catch (error) {
      status.textContent = 'Error al preparar la imagen: ' + error.message;
      downloadButton.disabled = false;
    }
  });
  updateExportOptions();
  var compass = L.control({ position: 'topright' });
  compass.onAdd = function () {
    var root = L.DomUtil.create('div', 'earth-navigation-control');
    root.setAttribute('role', 'group'); root.setAttribute('aria-label', 'Orientación y desplazamiento del mapa');
    root.innerHTML = '<div class="earth-compass"><button class="compass-n" type="button" aria-label="Mover al norte" title="Norte"><span class="direction-arrow">▲</span>N</button><button class="compass-s" type="button" aria-label="Mover al sur" title="Sur"><span class="direction-arrow">▼</span>S</button><button class="compass-w" type="button" aria-label="Mover al oeste" title="Oeste"><span class="direction-arrow">◀</span>O</button><button class="compass-e" type="button" aria-label="Mover al este" title="Este"><span class="direction-arrow">▶</span>E</button><button class="compass-center" type="button" aria-label="Volver al centro del mapa" title="Volver a Juan Mina"><span aria-hidden="true">✥</span></button></div><div class="compass-zoom" aria-label="Zoom del mapa"><button class="compass-zoom-in" type="button" aria-label="Acercar mapa" title="Acercar">+</button><input class="compass-zoom-slider" type="range" min="3" max="18" step="1" value="17" aria-label="Nivel de zoom" title="Arrastra para cambiar el zoom"><button class="compass-zoom-out" type="button" aria-label="Alejar mapa" title="Alejar">−</button><output class="compass-zoom-value" aria-live="polite">17</output></div>';
    L.DomEvent.disableClickPropagation(root); L.DomEvent.disableScrollPropagation(root);
    bindPanButton(root.querySelector('.compass-n'), 0, 1);
    bindPanButton(root.querySelector('.compass-s'), 0, -1);
    bindPanButton(root.querySelector('.compass-e'), 1, 0);
    bindPanButton(root.querySelector('.compass-w'), -1, 0);
    root.querySelector('.compass-center').addEventListener('click', function () { map.setView([10.9594, -74.8897], 17); });
    var zoomSlider = root.querySelector('.compass-zoom-slider');
    var zoomValue = root.querySelector('.compass-zoom-value');
    function syncZoomSlider() { zoomSlider.value = map.getZoom(); zoomValue.textContent = map.getZoom(); }
    root.querySelector('.compass-zoom-in').addEventListener('click', function () { map.zoomIn(); });
    root.querySelector('.compass-zoom-out').addEventListener('click', function () { map.zoomOut(); });
    zoomSlider.addEventListener('input', function () { map.setZoom(Number(zoomSlider.value)); zoomValue.textContent = zoomSlider.value; });
    map.on('zoomend', syncZoomSlider);
    syncZoomSlider();
    return root;
  };
  function moveMap(dx, dy) { map.panBy([dx * 36, -dy * 36], { animate: false }); }
  function bindPanButton(button, dx, dy) {
    var holdDelay = null; var repeatPan = null;
    function stopPan() { window.clearTimeout(holdDelay); window.clearInterval(repeatPan); holdDelay = null; repeatPan = null; }
    button.addEventListener('pointerdown', function (event) {
      event.preventDefault();
      moveMap(dx, dy);
      if (button.setPointerCapture) button.setPointerCapture(event.pointerId);
      holdDelay = window.setTimeout(function () { repeatPan = window.setInterval(function () { moveMap(dx, dy); }, 130); }, 320);
    });
    button.addEventListener('pointerup', stopPan);
    button.addEventListener('pointercancel', stopPan);
    button.addEventListener('lostpointercapture', stopPan);
    button.addEventListener('click', function (event) { if (event.detail === 0) moveMap(dx, dy); });
    window.addEventListener('blur', stopPan);
  }
  compass.addTo(map);
  var coords = L.control({ position: 'bottomright' }); coords.onAdd = function () { this.node = L.DomUtil.create('div', 'coordinate-readout'); this.node.textContent = 'Lat: — · Lon: —'; return this.node; }; coords.addTo(map);
  map.on('mousemove', function (event) { coords.node.textContent = 'Lat: ' + event.latlng.lat.toFixed(6) + ' · Lon: ' + event.latlng.lng.toFixed(6); });
  window.setTimeout(refreshLayers, 600);
})();

// Análisis espacial específico de las capas territoriales de Juan Mina.
(function configurarAnalisisEspacial() {
  var panel = document.getElementById('spatial-analysis-panel');
  if (!panel) return;
  var dashboardFoot = dashboard.querySelector('.dashboard-foot');
  dashboard.insertBefore(panel, dashboardFoot || null);
  panel.hidden = false;
  var expandButton = document.getElementById('spatial-info-expand');
  var collapseButton = document.getElementById('spatial-analysis-collapse');
  var spatialContent = document.getElementById('spatial-analysis-content');
  if (spatialContent) spatialContent.hidden = true;
  if (collapseButton) {
    collapseButton.setAttribute('aria-expanded', 'false');
    collapseButton.setAttribute('aria-label', 'Maximizar análisis espacial');
    collapseButton.title = 'Maximizar panel';
  }
  if (collapseButton && spatialContent) {
    collapseButton.addEventListener('click', function () {
      var expanded = collapseButton.getAttribute('aria-expanded') !== 'true';
      collapseButton.setAttribute('aria-expanded', String(expanded));
      collapseButton.setAttribute('aria-label', (expanded ? 'Minimizar' : 'Maximizar') + ' análisis espacial');
      collapseButton.title = expanded ? 'Minimizar panel' : 'Maximizar panel';
      spatialContent.hidden = !expanded;
    });
  }
  function restoreSpatialPanel() {
    dashboard.insertBefore(panel, dashboard.querySelector('.dashboard-foot') || null);
    panel.hidden = false;
    sideToolPanelIds = sideToolPanelIds.filter(function (id) { return id !== panel.id; });
    if (expandButton) {
      expandButton.setAttribute('aria-expanded', 'false');
      expandButton.title = 'Maximizar análisis en el panel inferior';
      var label = expandButton.querySelector('span');
      if (label) label.textContent = 'Maximizar análisis';
    }
  }
  if (expandButton) {
    expandButton.addEventListener('click', function () {
      if (openToolPanelIds.indexOf(panel.id) >= 0) { closeToolPanel(panel); return; }
      if (spatialContent) spatialContent.hidden = false;
      if (collapseButton) {
        collapseButton.setAttribute('aria-expanded', 'true');
        collapseButton.setAttribute('aria-label', 'Minimizar análisis espacial');
        collapseButton.title = 'Minimizar panel';
      }
      if (sideToolPanelIds.indexOf(panel.id) < 0) sideToolPanelIds.push(panel.id);
      toolDockContent.appendChild(panel);
      panel.hidden = false;
      expandButton.setAttribute('aria-expanded', 'true');
      expandButton.title = 'Volver al Panel del proyecto';
      var label = expandButton.querySelector('span');
      if (label) label.textContent = 'Volver al proyecto';
      openToolPanel(panel);
    });
    document.addEventListener('geovisor:close-tool-panel', function (event) {
      if (event.detail && event.detail.id === panel.id) restoreSpatialPanel();
    });
  }
  var status = document.getElementById('spatial-analysis-status');
  var distance = document.getElementById('spatial-buffer-distance');
  var bufferValue = document.getElementById('spatial-buffer-value');
  var bufferLayer = null; var intersectionLayer = null; var bufferGeojson = null; var intersectionRows = [];
  var choiceByPair = Object.create(null); var latestTables = {};
  var colors = ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949', '#af7aa1', '#ff9da7', '#9c755f', '#bab0ab'];
  function say(message) { status.textContent = message; }
  function fmt(value) { return Number.isFinite(value) ? new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value) : '—'; }
  function normalized(value) { return String(value == null ? '' : value).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[_-]+/g, ' ').trim(); }
  function feats(kind) {
    var layer = Object.keys(overlayLayers).map(function (key) { return overlayLayers[key]; }).find(function (item) { return item && item._tipo === kind; });
    if (!layer) return [];
    var result = []; layer.eachLayer(function (child) { if (child.feature) result.push(child.feature); }); return result;
  }
  function field(features, candidates) {
    if (!features.length) return null;
    var keys = Object.keys(features[0].properties || {});
    for (var i = 0; i < candidates.length; i++) {
      var found = keys.find(function (key) { return normalized(key) === normalized(candidates[i]); });
      if (found) return found;
    }
    return null;
  }
  function prop(feature, key) { return key && feature.properties ? feature.properties[key] : null; }
  function uniqueValues(features, key) {
    return Array.from(new Set(features.map(function (feature) {
      var value = prop(feature, key);
      return String(value == null || value === '' ? '(Sin dato)' : value);
    })));
  }
  function safeArea(feature) { try { var area = turf.area(feature); if (Number.isFinite(area)) return area; console.warn('Geometría inválida; el área no es finita.'); return null; } catch (error) { console.warn('Geometría inválida; se omitió el cálculo de área.', error); return null; } }
  function addMetric(container, label, value, support, progress, hint) {
    if (container.children.length >= 6) return;
    var card = document.createElement('article'); card.className = 'spatial-indicator-card';
    var strong = document.createElement('strong'); strong.textContent = value; card.appendChild(strong);
    var caption = document.createElement('span'); caption.className = 'spatial-indicator-title'; caption.textContent = label; card.appendChild(caption);
    var detail = document.createElement('small'); detail.textContent = support || ''; card.appendChild(detail);
    if (Number.isFinite(progress)) { var track = document.createElement('div'); track.className = 'spatial-indicator-track'; var fill = document.createElement('span'); fill.style.width = Math.max(0, Math.min(100, progress)) + '%'; track.appendChild(fill); card.appendChild(track); }
    if (hint) { var info = document.createElement('span'); info.className = 'spatial-indicator-info'; info.textContent = 'i'; info.title = hint; info.setAttribute('aria-label', hint); card.appendChild(info); }
    container.appendChild(card);
  }
  function featureCollection(features) { return turf.featureCollection(features); }
  function dissolve(features) {
    var merged = null;
    features.forEach(function (feature) {
      try {
        if (!feature.geometry || !/Polygon/.test(feature.geometry.type)) throw new Error('Se esperaba geometría poligonal.');
        merged = merged ? turf.union(merged, feature) : feature;
      } catch (error) { console.warn('No se pudo disolver un polígono:', error); }
    });
    return merged;
  }
  function getFeatureByPair(usage, treatment, intersection) {
    intersection.properties = { uso: usage, tratamiento: treatment };
    return intersection;
  }
  function renderCompatibility(uses, treatments, usageField, treatmentField) {
    var container = document.getElementById('spatial-compatibility'); container.innerHTML = '';
    var guidance = document.createElement('p'); guidance.className = 'spatial-analysis-note'; guidance.textContent = 'Compatibilidad pendiente: marca cada cruce en la tabla.'; container.appendChild(guidance);
    var note = document.createElement('details'); note.className = 'spatial-values-disclosure';
    var summary = document.createElement('summary'); summary.textContent = 'Ver valores de uso y tratamiento'; note.appendChild(summary);
    var useLine = document.createElement('p'); useLine.textContent = usageField + ': ' + uses.join(', '); note.appendChild(useLine);
    var treatmentLine = document.createElement('p'); treatmentLine.textContent = treatmentField + ': ' + treatments.join(', '); note.appendChild(treatmentLine);
    container.appendChild(note);
  }
  function updateIntersectionTable() {
    var body = document.querySelector('#spatial-intersection-table tbody'); body.innerHTML = '';
    var total = intersectionRows.reduce(function (sum, row) { return sum + row.area; }, 0);
    var conflict = 0;
    var shownPercent = 0;
    intersectionRows.forEach(function (row, index) {
      var key = row.use + '\u0000' + row.treatment; var choice = choiceByPair[key] || 'Sin evaluar';
      if (choice === 'Conflictiva') conflict += row.area;
      var pct = total ? Math.round((index === intersectionRows.length - 1 ? 100 - shownPercent : row.area / total * 100) * 100) / 100 : 0; shownPercent += pct;
      var tr = document.createElement('tr'); [row.use, row.treatment, fmt(row.area / 10000), fmt(pct) + '%'].forEach(function (value) { var td = document.createElement('td'); td.textContent = value; tr.appendChild(td); });
      var td = document.createElement('td'); var select = document.createElement('select');
      [['Sin evaluar', 'Sin evaluar'], ['Compatible', 'Compatible'], ['Conflictiva', 'Conflictiva']].forEach(function (optionData) { var option = document.createElement('option'); option.value = optionData[0]; option.textContent = optionData[1]; select.appendChild(option); });
      select.value = choice; select.addEventListener('change', function () { choiceByPair[key] = select.value; updateIntersectionTable(); renderIntersectionStyles(); }); td.appendChild(select); tr.appendChild(td); body.appendChild(tr);
    });
    var evaluated = intersectionRows.filter(function (row) { return choiceByPair[row.use + '\u0000' + row.treatment] && choiceByPair[row.use + '\u0000' + row.treatment] !== 'Sin evaluar'; }).length;
    document.getElementById('spatial-intersection-results').textContent = !intersectionRows.length ? 'Sin cruces espaciales.' : (evaluated ? 'Cruces: ' + intersectionRows.length + ' · Conflictos: ' + fmt(conflict / 10000) + ' ha.' : 'Cruces: ' + intersectionRows.length + ' · Conflictos sin evaluar.');
    shownPercent = 0;
    latestTables.intersection = intersectionRows.map(function (row, index) { var pct = total ? Math.round((index === intersectionRows.length - 1 ? 100 - shownPercent : row.area / total * 100) * 100) / 100 : 0; shownPercent += pct; return [row.use, row.treatment, row.area / 10000, pct, choiceByPair[row.use + '\u0000' + row.treatment] || 'Sin evaluar']; });
  }
  function renderIntersectionStyles() {
    if (!intersectionLayer) return;
    intersectionLayer.setStyle(function (feature) {
      var key = feature.properties.uso + '\u0000' + feature.properties.tratamiento;
      var value = choiceByPair[key] || 'Sin evaluar';
      var hueIndex = Math.abs((feature.properties.uso + '|' + feature.properties.tratamiento).split('').reduce(function (h, c) { return ((h * 31) + c.charCodeAt(0)) | 0; }, 0)) % colors.length;
      var color = value === 'Conflictiva' ? '#d62828' : value === 'Compatible' ? '#2a9d62' : colors[hueIndex];
      return { color: color, fillColor: color, weight: value === 'Conflictiva' ? 2 : 1, opacity: .9, fillOpacity: .48 };
    });
  }
  function calcIntersection() {
    var usage = feats('usos'); var treatments = feats('tratamientos');
    var usageField = field(usage, ['nombre_uso', 'etiqueta', 'actividad', 'uso']);
    var treatmentField = field(treatments, ['tratamient', 'tipo_trata', 'tratamiento']);
    if (!usage.length || !treatments.length || !usageField || !treatmentField) { say('Faltan capas o campos para cruzar usos y tratamientos.'); return; }
    renderCompatibility(uniqueValues(usage, usageField), uniqueValues(treatments, treatmentField), usageField, treatmentField);
    var byPair = Object.create(null); var output = [];
    usage.forEach(function (u) { treatments.forEach(function (t) {
      try {
        var piece = turf.intersect(u, t); if (!piece) return;
        var useName = String(prop(u, usageField) == null ? '(Sin dato)' : prop(u, usageField));
        var treatmentName = String(prop(t, treatmentField) == null ? '(Sin dato)' : prop(t, treatmentField));
        var a = safeArea(piece); if (a == null || a <= 0) return;
        var key = useName + '\u0000' + treatmentName;
        if (!byPair[key]) byPair[key] = { use: useName, treatment: treatmentName, area: 0 };
        byPair[key].area += a; output.push(getFeatureByPair(useName, treatmentName, piece));
      } catch (error) { console.warn('Se omitió una geometría inválida del cruce:', error); }
    }); });
    intersectionRows = Object.keys(byPair).map(function (key) { return byPair[key]; });
    if (intersectionLayer) { layerControl.removeLayer(intersectionLayer); map.removeLayer(intersectionLayer); Object.keys(overlayLayers).forEach(function (key) { if (overlayLayers[key] === intersectionLayer) delete overlayLayers[key]; }); }
    intersectionLayer = L.geoJSON(featureCollection(output), { style: { color: '#6b4eff', weight: 1, fillOpacity: .45 } });
    overlayLayers['Cruce de usos y tratamientos'] = intersectionLayer; layerControl.addOverlay(intersectionLayer, 'Cruce de usos y tratamientos');
    renderIntersectionStyles(); updateIntersectionTable();
  }
  function renderBuffer() {
    if (!window.turf) { say('No se cargó Turf.js; revisa la conexión e intenta recargar.'); return; }
    var roads = feats('vias'); var blocks = feats('manzanas'); var boundary = feats('limite');
    if (!roads.length || !blocks.length || !boundary.length) { say('Esperando vías, manzanas y límite de Juan Mina.'); return; }
    var meters = Number(distance.value); bufferValue.textContent = meters + ' m';
    var buffers = [];
    roads.forEach(function (road) { try { buffers.push(turf.buffer(road, meters, { units: 'meters', steps: 8 })); } catch (error) { console.warn('Vía inválida omitida al crear buffer:', error); } });
    var dissolvedRoadBuffer = dissolve(buffers);
    var dissolvedBoundary = dissolve(boundary);
    if (!dissolvedRoadBuffer || !dissolvedBoundary) { say('No fue posible disolver las geometrías válidas para el buffer.'); return; }
    bufferGeojson = dissolvedRoadBuffer;
    if (bufferLayer) { layerControl.removeLayer(bufferLayer); map.removeLayer(bufferLayer); Object.keys(overlayLayers).forEach(function (key) { if (overlayLayers[key] === bufferLayer) delete overlayLayers[key]; }); }
    bufferLayer = L.geoJSON(dissolvedRoadBuffer, { style: { color: '#733f87', weight: 2, fillColor: '#9a6ab0', fillOpacity: .28 } });
    overlayLayers['Buffer vial · ' + meters + ' m'] = bufferLayer;
    layerControl.addOverlay(bufferLayer, 'Buffer vial · ' + meters + ' m');
    var clipped; try { clipped = turf.intersect(dissolvedRoadBuffer, dissolvedBoundary); } catch (error) { console.warn('No se pudo recortar el buffer por límite:', error); clipped = null; }
    var zoneArea = clipped ? safeArea(clipped) : 0; var boundaryArea = safeArea(dissolvedBoundary) || 0;
    var touchedCount = 0; var blocksIn = 0; var blockRows = [];
    blocks.forEach(function (block, index) {
      try {
        var blockArea = safeArea(block); if (blockArea == null) return;
        var part = turf.intersect(block, dissolvedRoadBuffer); var insideArea = part ? safeArea(part) : 0;
        if (insideArea > 0) blocksIn++;
        else if (typeof turf.booleanTouches === 'function' && turf.booleanTouches(block, dissolvedRoadBuffer)) touchedCount++;
        if (insideArea > 0) blockRows.push({ label: String(prop(block, field(blocks, ['FolderPath', 'Name', 'id'])) || 'Manzana ' + (index + 1)), area: insideArea, pctBlock: blockArea ? insideArea / blockArea * 100 : 0, pctZone: zoneArea ? insideArea / zoneArea * 100 : 0 });
      } catch (error) { console.warn('Se omitió una manzana con geometría inválida:', error); }
    });
    var results = document.getElementById('spatial-buffer-results');
    results.textContent = 'Área: ' + fmt(zoneArea / 10000) + ' ha · ' + fmt(boundaryArea ? zoneArea / boundaryArea * 100 : 0) + '% del límite · Manzanas alcanzadas: ' + (blocksIn + touchedCount) + ' (' + blocksIn + ' dentro, ' + touchedCount + ' en el borde).';
    var body = document.querySelector('#spatial-blocks-table tbody'); body.innerHTML = '';
    blockRows.forEach(function (row) { var tr = document.createElement('tr'); [row.label, fmt(row.area / 10000), fmt(row.pctBlock) + '%', fmt(row.pctZone) + '%'].forEach(function (value) { var td = document.createElement('td'); td.textContent = value; tr.appendChild(td); }); body.appendChild(tr); });
    latestTables.buffer = [['Área influencia ha', zoneArea / 10000], ['Porcentaje límite', boundaryArea ? zoneArea / boundaryArea * 100 : 0], ['Manzanas con área dentro', blocksIn], ['Manzanas solo tocadas', touchedCount]].concat(blockRows.map(function (r) { return [r.label, r.area / 10000, r.pctBlock, r.pctZone]; }));
    updateIndicators(zoneArea, boundaryArea);
    say('Buffer vial de ' + meters + ' m actualizado.');
    if (intersectionLayer) intersectionLayer.bringToFront();
  }
  function updateIndicatorsLegacy(bufferArea, boundaryArea) {
    var boundary = feats('limite'); var uses = feats('usos'); var blocks = feats('manzanas'); var roads = feats('vias');
    var boundaryField = field(boundary, ['area_has', 'area_ha', 'Shape_Area']);
    var totalArea = boundary.reduce(function (sum, f) { return sum + (safeArea(f) || 0); }, 0);
    var useField = field(uses, ['nombre_uso', 'etiqueta', 'actividad', 'uso']); var useTotals = Object.create(null);
    uses.forEach(function (f) { try { var a = safeArea(f); if (a == null) return; var label = String(prop(f, useField) == null ? '(Sin dato)' : prop(f, useField)); useTotals[label] = (useTotals[label] || 0) + a; } catch (error) { console.warn('Uso de suelo inválido omitido:', error); } });
    var useTotal = Object.keys(useTotals).reduce(function (sum, key) { return sum + useTotals[key]; }, 0);
    var totalRoadKm = roads.reduce(function (sum, f) { try { return sum + turf.length(f, { units: 'kilometers' }); } catch (error) { console.warn('Vía inválida omitida en longitud:', error); return sum; } }, 0);
    var cards = document.getElementById('spatial-indicators'); cards.innerHTML = '';
    addMetric(cards, 'Área del límite (ha)', fmt(totalArea / 10000)); addMetric(cards, 'Manzanas', fmt(blocks.length)); addMetric(cards, 'Longitud vías (km)', fmt(totalRoadKm)); addMetric(cards, 'Dentro de influencia (ha)', fmt((bufferArea || 0) / 10000)); addMetric(cards, 'Límite cubierto (%)', fmt(boundaryArea ? (bufferArea || 0) / boundaryArea * 100 : 0) + '%');
    var chart = document.getElementById('spatial-uses-chart'); chart.innerHTML = '<h4>Porcentaje por uso del suelo</h4>';
    Object.keys(useTotals).sort().forEach(function (label, index) {
      var pct = useTotal ? useTotals[label] / useTotal * 100 : 0; var row = document.createElement('div'); row.className = 'spatial-use-row';
      var caption = document.createElement('span'); caption.textContent = label + ' · ' + fmt(pct) + '% (' + fmt(useTotals[label] / 10000) + ' ha)';
      var track = document.createElement('div'); track.className = 'spatial-use-track'; var bar = document.createElement('span'); bar.style.width = Math.max(0, Math.min(100, pct)) + '%'; bar.style.backgroundColor = colors[index % colors.length]; track.appendChild(bar); row.appendChild(caption); row.appendChild(track); chart.appendChild(row);
    });
    var quality = document.getElementById('spatial-quality'); var checks = [];
    var usePctSum = Object.keys(useTotals).reduce(function (sum, k) { return sum + (useTotal ? useTotals[k] / useTotal * 100 : 0); }, 0);
    checks.push('Porcentajes por uso: ' + fmt(usePctSum) + '%; las áreas de las categorías suman ' + fmt(useTotal / 10000) + ' ha.');
    if (totalArea && useTotal) {
      var coverageDiff = Math.abs(useTotal - totalArea) / totalArea * 100;
      checks.push('Suma de áreas de uso frente al límite calculado (' + fmt(totalArea / 10000) + ' ha): diferencia ' + fmt(coverageDiff) + '%'+ (coverageDiff > 10 ? ' (mayor a 10%; revise huecos, traslapes o cobertura).' : '.'));
    }
    if (boundaryField) {
      var stored = boundary.reduce(function (sum, f) { var v = Number(prop(f, boundaryField)); return sum + (Number.isFinite(v) ? v : 0); }, 0);
      // Shape_Area en capas geográficas puede estar expresado en grados; solo comparamos valores declarados en hectáreas.
      if (normalized(boundaryField).includes('ha')) checks.push('Área guardada (' + boundaryField + '): ' + fmt(stored) + ' ha frente a ' + fmt(totalArea / 10000) + ' ha calculadas.');
    }
    var useAreaField = field(uses, ['area_has']);
    if (useAreaField) {
      var storedUses = uses.reduce(function (sum, f) { var v = Number(prop(f, useAreaField)); return sum + (Number.isFinite(v) ? v : 0); }, 0);
      var diff = useTotal ? Math.abs(storedUses - useTotal / 10000) / (useTotal / 10000) * 100 : 0;
      checks.push('Control area_has de usos: guardada ' + fmt(storedUses) + ' ha; calculada ' + fmt(useTotal / 10000) + ' ha' + (diff > 10 ? ' · DIFERENCIA MAYOR A 10% (' + fmt(diff) + '%).' : '.'));
    }
    var treatments = feats('tratamientos'); var treatmentAreaField = field(treatments, ['area_has']);
    if (treatmentAreaField) {
      var calculatedTreatmentArea = treatments.reduce(function (sum, f) { return sum + (safeArea(f) || 0); }, 0) / 10000;
      var storedTreatmentArea = treatments.reduce(function (sum, f) { var v = Number(prop(f, treatmentAreaField)); return sum + (Number.isFinite(v) ? v : 0); }, 0);
      var treatmentDiff = calculatedTreatmentArea ? Math.abs(storedTreatmentArea - calculatedTreatmentArea) / calculatedTreatmentArea * 100 : 0;
      checks.push('Control area_has de tratamientos: guardada ' + fmt(storedTreatmentArea) + ' ha; calculada ' + fmt(calculatedTreatmentArea) + ' ha' + (treatmentDiff > 10 ? ' · DIFERENCIA MAYOR A 10% (' + fmt(treatmentDiff) + '%).' : '.'));
    }
    quality.textContent = checks.join(' ');
    latestTables.indicators = [['Área límite (ha)', totalArea / 10000], ['Número de manzanas', blocks.length], ['Longitud vías (km)', totalRoadKm]].concat(Object.keys(useTotals).map(function (k) { return ['Uso: ' + k, useTotals[k] / 10000, useTotal ? useTotals[k] / useTotal * 100 : 0]; }));
  }
  var layerSelect = document.getElementById('spatial-layer-select');
  var fieldSelect = document.getElementById('spatial-field-select');
  var zoneSelect = document.getElementById('spatial-zone-select');
  var removeLayerButton = document.getElementById('spatial-remove-layer');
  var dynamicStatus = document.getElementById('spatial-dynamic-status');
  var selectedLayerName = '__base__'; var lastImportedLayerName = null;
  function layerFeatureList(layer) {
    var result = [];
    function visit(group) { if (!group || typeof group.eachLayer !== 'function') return; group.eachLayer(function (child) { if (child.feature && child.feature.geometry) result.push(child.feature); else visit(child); }); }
    visit(layer); return result;
  }
  function currentSpatialEntry() {
    if (layerSelect.value === '__base__') return null;
    var layer = overlayLayers[layerSelect.value]; return layer ? { name: layerSelect.value, layer: layer, features: layerFeatureList(layer) } : null;
  }
  function updateSpatialFieldOptions() {
    var entry = currentSpatialEntry(); var source = entry ? entry.features : feats('usos'); var prior = fieldSelect.value;
    fieldSelect.innerHTML = '<option value="">Sin agrupar</option>';
    var keys = Array.from(new Set(source.reduce(function (all, feature) { return all.concat(Object.keys(feature.properties || {})); }, [])));
    keys.forEach(function (key) { var option = document.createElement('option'); option.value = key; option.textContent = key; fieldSelect.appendChild(option); });
    if (keys.indexOf(prior) >= 0) fieldSelect.value = prior;
    removeLayerButton.disabled = !(entry && entry.layer._geovisorImported);
    renderSelectedIndicators();
  }
  function refreshSpatialLayerOptions() {
    var prior = selectedLayerName; var entries = []; var invalidNewImport = false;
    Object.keys(overlayLayers).forEach(function (name) {
      var layer = overlayLayers[name]; if (!layer || layer === bufferLayer || layer === intersectionLayer || /^(Buffer vial|Cruce de usos)/i.test(name)) return;
      var features = layerFeatureList(layer);
      if (layer._geovisorImported && !layer._geovisorSpatialSeen) { lastImportedLayerName = name; layer._geovisorSpatialSeen = true; if (!features.length) invalidNewImport = true; }
      if (features.length || layer._geovisorImported) entries.push({ name: name, features: features });
    });
    layerSelect.innerHTML = '<option value="__base__">Indicadores base · Juan Mina</option>';
    entries.forEach(function (entry) { var option = document.createElement('option'); option.value = entry.name; option.textContent = entry.name; layerSelect.appendChild(option); });
    var wanted = lastImportedLayerName || prior;
    selectedLayerName = wanted !== '__base__' && entries.some(function (entry) { return entry.name === wanted; }) ? wanted : '__base__';
    layerSelect.value = selectedLayerName; lastImportedLayerName = null; updateSpatialFieldOptions();
    if (invalidNewImport) dynamicStatus.textContent = 'Capa sin geometrías válidas.';
  }
  function geometryKind(geometry, counts) {
    if (!geometry) return;
    if (geometry.type === 'GeometryCollection') { (geometry.geometries || []).forEach(function (item) { geometryKind(item, counts); }); return; }
    var type = geometry.type || ''; var kind = /Point/.test(type) ? 'points' : (/Line/.test(type) ? 'lines' : (/Polygon/.test(type) ? 'polygons' : 'other'));
    counts[kind] = (counts[kind] || 0) + 1;
  }
  function detectKind(features) {
    var counts = {}; features.forEach(function (feature) { geometryKind(feature.geometry, counts); });
    var kinds = Object.keys(counts).filter(function (kind) { return kind !== 'other'; }).sort(function (a, b) { return counts[b] - counts[a]; });
    return { kind: kinds[0] || 'other', mixed: kinds.length > 1 };
  }
  function getBoundaryGeometry() { return dissolve(feats('limite')); }
  function getZoneGeometry() {
    var boundary = getBoundaryGeometry(); if (!boundary) return null;
    if (zoneSelect.value === 'limit') return boundary;
    if (!bufferGeojson) return null;
    try { return turf.intersect(boundary, bufferGeojson); } catch (error) { console.warn('Zona de influencia inválida.', error); return null; }
  }
  function inside(point, polygon) { try { return turf.booleanPointInPolygon(point, polygon); } catch (error) { console.warn('Punto inválido omitido.', error); return false; } }
  function clippedLineParts(feature, polygon, sourceIndex) {
    var lines = feature.geometry.type === 'LineString' ? [feature.geometry.coordinates] : feature.geometry.coordinates;
    var polygonParts = polygon.geometry.type === 'Polygon' ? [polygon.geometry.coordinates] : polygon.geometry.coordinates;
    var edges = []; polygonParts.forEach(function (poly) { poly.forEach(function (ring) { for (var e = 0; e < ring.length - 1; e++) edges.push([ring[e], ring[e + 1]]); }); });
    var output = [];
    lines.forEach(function (line) { for (var i = 0; i < line.length - 1; i++) {
      var a = line[i], b = line[i + 1], dx = b[0] - a[0], dy = b[1] - a[1]; if (dx * dx + dy * dy < 1e-24) continue;
      var ts = [0, 1]; edges.forEach(function (edge) { var c = edge[0], d = edge[1], ex = d[0] - c[0], ey = d[1] - c[1], den = dx * ey - dy * ex; if (Math.abs(den) < 1e-12) return; var t = ((c[0] - a[0]) * ey - (c[1] - a[1]) * ex) / den; var u = ((c[0] - a[0]) * dy - (c[1] - a[1]) * dx) / den; if (t > 0 && t < 1 && u >= 0 && u <= 1) ts.push(t); });
      ts.sort(function (x, y) { return x - y; }); ts = ts.filter(function (t, index) { return !index || Math.abs(t - ts[index - 1]) > 1e-10; });
      for (var j = 0; j < ts.length - 1; j++) { var t0 = ts[j], t1 = ts[j + 1], mid = (t0 + t1) / 2; if (t1 - t0 < 1e-12 || !inside(turf.point([a[0] + dx * mid, a[1] + dy * mid]), polygon)) continue; var lineProperties = Object.assign({}, feature.properties || {}); lineProperties.__spatialSourceIndex = sourceIndex; var part = turf.lineString([[a[0] + dx * t0, a[1] + dy * t0], [a[0] + dx * t1, a[1] + dy * t1]], lineProperties); output.push(part); }
    }});
    return output;
  }
  function featuresInScope(features, polygon, kind) {
    var result = [];
    features.forEach(function (feature, sourceIndex) { try {
      if (kind === 'points') {
        var points = feature.geometry.type === 'Point' ? [feature] : (feature.geometry.type === 'MultiPoint' ? feature.geometry.coordinates.map(function (xy) { return turf.point(xy, feature.properties || {}); }) : []);
        points.forEach(function (point) { if (inside(point, polygon)) result.push(point); });
      } else if (kind === 'polygons') { var piece = turf.intersect(feature, polygon); if (piece && (safeArea(piece) || 0) > 0) { piece.properties = feature.properties || {}; result.push(piece); } }
      else if (kind === 'lines') result = result.concat(clippedLineParts(feature, polygon, sourceIndex));
    } catch (error) { console.warn('Entidad inválida omitida del análisis dinámico.', error); }});
    return result;
  }
  function measureFeature(feature, kind) { try { return kind === 'polygons' ? safeArea(feature) : (kind === 'lines' ? turf.length(feature, { units: 'kilometers' }) : 1); } catch (error) { console.warn('No se pudo medir una entidad.', error); return null; } }
  function drawCategoryPercentages(features, kind, key) {
    var chart = document.getElementById('spatial-uses-chart'); chart.innerHTML = ''; var sums = Object.create(null); var total = 0;
    features.forEach(function (feature) { var raw = feature.properties && feature.properties[key]; var label = String(raw == null || raw === '' ? '(Sin dato)' : raw); var weight = measureFeature(feature, kind); if (weight == null || !Number.isFinite(weight) || weight < 0) return; sums[label] = (sums[label] || 0) + weight; total += weight; });
    var heading = document.createElement('h4'); heading.textContent = 'Por categoría'; chart.appendChild(heading);
    var labels = Object.keys(sums).sort(function (a, b) { return sums[b] - sums[a]; }); var allocated = 0;
    labels.forEach(function (label, index) { var pct = total ? Math.round((index === labels.length - 1 ? 100 - allocated : sums[label] / total * 100) * 100) / 100 : 0; allocated += pct; var row = document.createElement('div'); row.className = 'spatial-use-row'; var caption = document.createElement('span'); caption.textContent = label + ' · ' + fmt(pct) + '%'; var track = document.createElement('div'); track.className = 'spatial-use-track'; var bar = document.createElement('span'); bar.style.width = pct + '%'; bar.style.backgroundColor = colors[index % colors.length]; track.appendChild(bar); row.appendChild(caption); row.appendChild(track); chart.appendChild(row); });
    dynamicStatus.textContent = 'Categorías: ' + fmt(Object.keys(sums).reduce(function (sum, label) { return sum + (total ? sums[label] / total * 100 : 0); }, 0)) + '% · ponderadas por ' + (kind === 'polygons' ? 'área' : kind === 'lines' ? 'longitud' : 'cantidad') + '.';
  }
  function numericFieldValues(features, key) { return features.map(function (feature) { var raw = feature.properties && feature.properties[key]; if (raw == null || String(raw).trim() === '') return null; var val = typeof raw === 'number' ? raw : Number(String(raw).replace(',', '.')); return Number.isFinite(val) ? val : null; }).filter(function (value) { return value != null; }); }
  function isNumericField(features, key) {
    if (/^(id|fid|objectid|symbolid|codigo|code)(\b|$)/.test(normalized(key))) return false;
    var present = features.filter(function (feature) { var value = feature.properties && feature.properties[key]; return value != null && String(value).trim() !== ''; });
    var numbers = numericFieldValues(features, key); return numbers.length > 0 && numbers.length >= Math.max(1, Math.ceil(present.length * .8));
  }
  function renderSelectedIndicators() {
    var cards = document.getElementById('spatial-indicators'); cards.innerHTML = ''; document.getElementById('spatial-uses-chart').innerHTML = '';
    var entry = currentSpatialEntry(); if (!entry) { renderBaseIndicators(); return; }
    if (!entry.features.length) { dynamicStatus.textContent = 'Capa sin geometrías válidas.'; return; }
    var kindData = detectKind(entry.features), kind = kindData.kind;
    if (kind === 'other') { dynamicStatus.textContent = 'Tipo de geometría no compatible.'; return; }
    var boundary = getBoundaryGeometry(), scope = getZoneGeometry();
    if (!boundary || !scope) { dynamicStatus.textContent = 'Zona de análisis no disponible.'; addMetric(cards, 'Elementos', '—', 'revise la influencia'); return; }
    var bounded = featuresInScope(entry.features, boundary, kind); var scoped = zoneSelect.value === 'influence' ? featuresInScope(entry.features, scope, kind) : bounded;
    if (!bounded.length) dynamicStatus.textContent = 'La capa no intersecta Juan Mina.';
    else dynamicStatus.textContent = (kindData.mixed ? 'Capa mixta · ' : 'Geometría: ') + (kind === 'polygons' ? 'polígonos.' : kind === 'lines' ? 'líneas.' : 'puntos.');
    var boundaryArea = safeArea(boundary) || 0, scopeArea = safeArea(scope) || 0;
    if (kind === 'polygons') {
      var mergedScope = dissolve(scoped); var area = mergedScope ? (safeArea(mergedScope) || 0) : 0; var pct = boundaryArea ? area / boundaryArea * 100 : 0;
      addMetric(cards, 'Área total', fmt(area / 10000), 'ha'); addMetric(cards, '% del límite', fmt(pct) + '%', fmt(area / 10000) + ' ha', pct); addMetric(cards, 'Elementos', fmt(scoped.length), 'polígonos');
    } else if (kind === 'lines') {
      var length = scoped.reduce(function (sum, feature) { return sum + (measureFeature(feature, kind) || 0); }, 0); var allLength = bounded.reduce(function (sum, feature) { return sum + (measureFeature(feature, kind) || 0); }, 0);
      var influence = featuresInScope(entry.features, bufferGeojson ? getZonePolygon() : null, kind); var influenceLength = influence.reduce(function (sum, feature) { return sum + (measureFeature(feature, kind) || 0); }, 0); var pctLine = allLength ? influenceLength / allLength * 100 : 0;
      addMetric(cards, 'Longitud total', fmt(length), 'km'); addMetric(cards, '% en influencia', fmt(pctLine) + '%', fmt(influenceLength) + ' km', pctLine);
    } else {
      var totalPoints = bounded.length, zonePoints = bufferGeojson ? featuresInScope(entry.features, getZonePolygon(), 'points').length : 0, outsidePoints = Math.max(0, totalPoints - zonePoints), count = scoped.length, density = scopeArea ? count / (scopeArea / 1000000) : 0;
      var insidePct = totalPoints ? Math.round(zonePoints / totalPoints * 10000) / 100 : 0; var outsidePct = totalPoints ? Math.round((100 - insidePct) * 100) / 100 : 0;
      addMetric(cards, 'Puntos', fmt(count), 'en la zona'); addMetric(cards, 'Dentro influencia', fmt(zonePoints), fmt(insidePct) + '%', insidePct); addMetric(cards, 'Fuera influencia', fmt(outsidePoints), fmt(outsidePct) + '%', outsidePct); addMetric(cards, 'Densidad', fmt(density), 'puntos/km²');
    }
    var key = fieldSelect.value;
    if (key) { var attributeFeatures = kind === 'lines' ? scoped.filter(function (feature, index, list) { return list.findIndex(function (other) { return other.properties && feature.properties && other.properties.__spatialSourceIndex === feature.properties.__spatialSourceIndex; }) === index; }) : scoped; var nums = numericFieldValues(attributeFeatures, key);
      if (isNumericField(attributeFeatures, key)) { var sum = nums.reduce(function (a, b) { return a + b; }, 0); addMetric(cards, 'Resumen numérico', fmt(sum), 'Σ · ' + fmt(sum / nums.length) + ' prom. · mín. ' + fmt(Math.min.apply(Math, nums)) + ' · máx. ' + fmt(Math.max.apply(Math, nums)), null, 'Suma, promedio, mínimo y máximo del campo numérico.'); dynamicStatus.textContent += ' Campo numérico: ' + key + '.'; }
      else if (scoped.length) drawCategoryPercentages(scoped, kind, key);
    }
    if (kindData.mixed) dynamicStatus.textContent = 'Capa con geometrías mixtas · se muestran métricas de ' + (kind === 'polygons' ? 'polígonos.' : kind === 'lines' ? 'líneas.' : 'puntos.');
    latestTables.indicators = Array.from(cards.children).map(function (card) { return [card.querySelector('.spatial-indicator-title').textContent, card.querySelector('strong').textContent, card.querySelector('small').textContent]; });
  }
  function getZonePolygon() { var boundary = getBoundaryGeometry(); if (!boundary || !bufferGeojson) return null; try { return turf.intersect(boundary, bufferGeojson); } catch (error) { console.warn('Influencia no válida.', error); return null; } }
  function renderBaseIndicators() {
    var boundary = getBoundaryGeometry(), uses = feats('usos'), blocks = feats('manzanas'), roads = feats('vias'); var totalArea = boundary ? (safeArea(boundary) || 0) : 0; var zone = getZonePolygon(); var zoneArea = zone ? (safeArea(zone) || 0) : 0;
    var cards = document.getElementById('spatial-indicators'); cards.innerHTML = '';
    addMetric(cards, 'Área del límite', fmt(totalArea / 10000), 'ha', null, 'Área geodésica de la capa límite.'); addMetric(cards, 'Influencia vial', fmt(totalArea ? zoneArea / totalArea * 100 : 0) + '%', fmt(zoneArea / 10000) + ' ha', totalArea ? zoneArea / totalArea * 100 : 0); addMetric(cards, 'Manzanas', fmt(blocks.length), 'elementos');
    var roadKm = roads.reduce(function (sum, road) { return sum + (measureFeature(road, 'lines') || 0); }, 0); addMetric(cards, 'Longitud vial', fmt(roadKm), 'km');
    var useField = fieldSelect.value || field(uses, ['nombre_uso', 'etiqueta', 'actividad', 'uso']); var totals = Object.create(null), totalUseArea = 0;
    uses.forEach(function (feature) { var label = String(prop(feature, useField) == null ? '(Sin dato)' : prop(feature, useField)); var area = safeArea(feature) || 0; totals[label] = (totals[label] || 0) + area; totalUseArea += area; });
    var chart = document.getElementById('spatial-uses-chart'); chart.innerHTML = ''; var heading = document.createElement('h4'); heading.textContent = 'Usos del suelo'; chart.appendChild(heading);
    var useLabels = Object.keys(totals).sort(function (a, b) { return totals[b] - totals[a]; }); var usePctAllocated = 0;
    useLabels.forEach(function (label, index) { var pct = totalUseArea ? Math.round((index === useLabels.length - 1 ? 100 - usePctAllocated : totals[label] / totalUseArea * 100) * 100) / 100 : 0; usePctAllocated += pct; var row = document.createElement('div'); row.className = 'spatial-use-row'; var caption = document.createElement('span'); caption.textContent = label + ' · ' + fmt(pct) + '%'; var track = document.createElement('div'); track.className = 'spatial-use-track'; var bar = document.createElement('span'); bar.style.width = pct + '%'; bar.style.backgroundColor = colors[index % colors.length]; track.appendChild(bar); row.appendChild(caption); row.appendChild(track); chart.appendChild(row); });
    if (fieldSelect.value) {
      var baseNumbers = numericFieldValues(uses, fieldSelect.value);
      if (isNumericField(uses, fieldSelect.value)) {
        var baseSum = baseNumbers.reduce(function (sum, value) { return sum + value; }, 0); chart.innerHTML = '<h4>Resumen numérico · ' + fieldSelect.value + '</h4><p>Suma ' + fmt(baseSum) + ' · promedio ' + fmt(baseSum / baseNumbers.length) + ' · mínimo ' + fmt(Math.min.apply(Math, baseNumbers)) + ' · máximo ' + fmt(Math.max.apply(Math, baseNumbers)) + '</p>';
        addMetric(cards, 'Resumen numérico', fmt(baseSum), 'Σ · prom. ' + fmt(baseSum / baseNumbers.length) + ' · mín. ' + fmt(Math.min.apply(Math, baseNumbers)) + ' · máx. ' + fmt(Math.max.apply(Math, baseNumbers)), null, 'Suma, promedio, mínimo y máximo del campo numérico.');
      }
    }
    dynamicStatus.textContent = 'Indicadores base · ' + fmt(Object.keys(totals).reduce(function (sum, label) { return sum + (totalUseArea ? totals[label] / totalUseArea * 100 : 0); }, 0)) + '% en usos.';
    var areaField = field(uses, ['area_has']); var stored = areaField ? uses.reduce(function (sum, feature) { var value = Number(prop(feature, areaField)); return sum + (Number.isFinite(value) ? value : 0); }, 0) : null; var diff = stored != null && totalUseArea ? Math.abs(stored - totalUseArea / 10000) / (totalUseArea / 10000) * 100 : 0;
    var quality = document.getElementById('spatial-quality'); quality.textContent = stored == null ? '' : (diff > 10 ? 'ⓘ Área guardada difiere >10%' : 'ⓘ Áreas verificadas'); quality.title = stored == null ? 'Porcentajes calculados desde geometrías y normalizados a 100%.' : 'area_has: ' + fmt(stored) + ' ha; geometría: ' + fmt(totalUseArea / 10000) + ' ha; diferencia: ' + fmt(diff) + '%. Porcentajes normalizados a 100%.';
    latestTables.indicators = [['Área del límite (ha)', totalArea / 10000], ['Manzanas', blocks.length], ['Longitud vial (km)', roadKm]].concat(Object.keys(totals).map(function (label) { return ['Uso: ' + label, totals[label] / 10000, totalUseArea ? totals[label] / totalUseArea * 100 : 0]; }));
  }
  function updateIndicators() { renderSelectedIndicators(); }
  layerSelect.addEventListener('change', function () { selectedLayerName = layerSelect.value || '__base__'; updateSpatialFieldOptions(); });
  fieldSelect.addEventListener('change', renderSelectedIndicators);
  zoneSelect.addEventListener('change', renderSelectedIndicators);
  removeLayerButton.addEventListener('click', function () {
    var entry = currentSpatialEntry(); if (!entry || !entry.layer._geovisorImported) return;
    if (map.hasLayer(entry.layer)) map.removeLayer(entry.layer);
    layerControl.removeLayer(entry.layer); resultLayers.removeLayer(entry.layer);
    resultNames = resultNames.filter(function (name) { return name !== entry.name; }); delete overlayLayers[entry.name];
    selectedLayerName = '__base__'; document.dispatchEvent(new Event('geovisor:layerschanged'));
  });
  map.on('overlayadd', function (event) {
    var name = event && event.name; var selectable = name && Array.from(layerSelect.options).some(function (option) { return option.value === name; }); if (selectable && overlayLayers[name] && layerFeatureList(overlayLayers[name]).length) { selectedLayerName = name; layerSelect.value = name; updateSpatialFieldOptions(); }
  });
  document.addEventListener('geovisor:importerror', function (event) { dynamicStatus.textContent = event.detail && event.detail.message ? event.detail.message : 'No se pudo leer la capa.'; if (dashboard.hidden) dashboardToggle.click(); });
  function runAll() {
    if (!window.turf) { say('No se cargó Turf.js; revisa la conexión e intenta recargar.'); return; }
    if (!feats('limite').length || !feats('manzanas').length || !feats('vias').length || !feats('usos').length || !feats('tratamientos').length) { say('Cargando capas territoriales…'); return; }
    try {
      calcIntersection();
      renderBuffer();
    } catch (error) {
      console.error('Error en análisis espacial:', error);
      say('No se pudo completar el análisis: ' + (error.message || 'geometría inválida.'));
    }
  }
  distance.addEventListener('input', renderBuffer);
  document.querySelectorAll('[data-buffer-shortcut]').forEach(function (button) { button.addEventListener('click', function () { distance.value = button.dataset.bufferShortcut; renderBuffer(); }); });
  document.getElementById('spatial-export-csv').addEventListener('click', function () {
    var lines = ['Sección,Campo 1,Campo 2,Campo 3,Campo 4,Campo 5'];
    Object.keys(latestTables).forEach(function (section) { latestTables[section].forEach(function (row) { lines.push([section].concat(row).map(function (cell) { return '"' + String(cell == null ? '' : cell).replace(/"/g, '""') + '"'; }).join(',')); }); });
    var blob = new Blob(['\ufeff' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' }); var url = URL.createObjectURL(blob); var link = document.createElement('a'); link.href = url; link.download = 'analisis-espacial-juan-mina.csv'; link.click(); URL.revokeObjectURL(url);
  });
  document.getElementById('spatial-clear-analysis').addEventListener('click', function () {
    [bufferLayer, intersectionLayer].forEach(function (layer) { if (!layer) return; map.removeLayer(layer); layerControl.removeLayer(layer); });
    Object.keys(overlayLayers).forEach(function (key) { if (/^(Buffer vial|Cruce de usos y tratamientos)/.test(key)) delete overlayLayers[key]; });
    bufferLayer = null; intersectionLayer = null; bufferGeojson = null; intersectionRows = []; choiceByPair = Object.create(null); latestTables = {};
    document.querySelector('#spatial-blocks-table tbody').innerHTML = ''; document.querySelector('#spatial-intersection-table tbody').innerHTML = '';
    document.getElementById('spatial-buffer-results').textContent = ''; document.getElementById('spatial-intersection-results').textContent = '';
    document.querySelector('#spatial-indicators').innerHTML = ''; document.getElementById('spatial-uses-chart').innerHTML = ''; document.getElementById('spatial-quality').textContent = '';
  });
  document.addEventListener('geovisor:layerschanged', function () { window.setTimeout(function () { refreshSpatialLayerOptions(); runAll(); }, 0); });
  map.on('geovisor:clear-analysis', function () { document.getElementById('spatial-clear-analysis').click(); });
  runAll();
})();

// Street View clásico incrustado en iframe (sin clave de API).
(function () {
  var panel = document.getElementById('street-view-panel');
  var toggle = document.getElementById('street-view-toggle');
  var frame = document.getElementById('street-view-frame');
  var status = document.getElementById('street-view-status');
  var locationMarker = null;
  var lastMarkerPoint = null;
  var markerHeading = 0;
  var markerDragTimer = null;
  function makeLocationIcon(heading) {
    var faceLeft = heading > 180 && heading < 360;
    var facingTransform = faceLeft ? 'translate(36 0) scale(-1 1)' : '';
    var artwork = '<svg viewBox="0 0 36 48" aria-hidden="true"><ellipse class="person-shadow" cx="18" cy="46.5" rx="7" ry="1.1"/><circle class="person-head" cx="18" cy="8.5" r="5.4"/><path class="person-helmet" d="M11.8 8.2C11.8 4.4 14.2 2 18 2s6.2 2.4 6.2 6.2v1H11.8z"/><path class="person-helmet-brim" d="M10.2 9.1h15.6c.8 0 1 .5.5 1.1-.5.6-1.3.8-2.2.8H11.9c-.9 0-1.7-.2-2.2-.8-.5-.6-.3-1.1.5-1.1Z"/><path class="person-helmet-ridge" d="M18 2.8v5.7"/><path class="person-body" d="M18 14.7c-4 0-6.8.9-7.2 3.7L9.8 28c-.2 1.5.7 2.5 2.2 2.5h.1l-.3 14.3c0 1.9.9 2.9 2.2 2.9 1.2 0 2-.9 2-2.9V32h4v12.8c0 2 .8 2.9 2 2.9 1.3 0 2.2-1 2.2-2.9l-.3-14.3h.1c1.5 0 2.4-1 2.2-2.5l-1-9.6c-.4-2.8-3.2-3.7-7.2-3.7Z"/><path class="person-arm" d="m11.2 17.4-1.5 5.4-.4 4.8m15.4-10.2 1.5 5.4.4 4.8"/><circle class="person-hand" cx="9.3" cy="28" r="1.2"/><circle class="person-hand" cx="26.7" cy="28" r="1.2"/></svg>';
    return L.divIcon({ className: 'street-view-map-marker', html: '<span class="street-view-person-wrap">' + artwork + '</span>', iconSize: [32, 44], iconAnchor: [16, 41] });
  }
  function bearingBetween(from, to) {
    var a = from.lat * Math.PI / 180;
    var b = to.lat * Math.PI / 180;
    var deltaLng = (to.lng - from.lng) * Math.PI / 180;
    var y = Math.sin(deltaLng) * Math.cos(b);
    var x = Math.cos(a) * Math.sin(b) - Math.sin(a) * Math.cos(b) * Math.cos(deltaLng);
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }
  function mapCenter() { return map.getCenter(); }
  function loadStreetView(location, source, markerIsDragging) {
    var lat = Number(location.lat); var lng = Number(location.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
    var coordinates = lat.toFixed(6) + ',' + lng.toFixed(6);
    var currentPoint = L.latLng(lat, lng);
    if (lastMarkerPoint) {
      var movedMeters = map.distance(lastMarkerPoint, currentPoint);
      if (movedMeters > 2) markerHeading = bearingBetween(lastMarkerPoint, currentPoint);
    }
    // Conserva el formato Street View incrustado que usaba el panel.
    var params = new URLSearchParams({ q: '', layer: 'c', cbll: coordinates, cbp: '12,0,0,0,0', output: 'svembed', hl: 'es' });
    frame.src = 'https://maps.google.com/maps?' + params.toString();
    if (!locationMarker) {
      locationMarker = L.marker(currentPoint, { icon: makeLocationIcon(markerHeading), interactive: true, draggable: true, autoPan: true, bubblingMouseEvents: false, zIndexOffset: 1000 });
      locationMarker.on('drag', function (event) {
        window.clearTimeout(markerDragTimer);
        markerDragTimer = window.setTimeout(function () {
          loadStreetView(event.target.getLatLng(), 'persona en movimiento', true);
        }, 450);
      });
      locationMarker.on('dragend', function (event) {
        window.clearTimeout(markerDragTimer);
        loadStreetView(event.target.getLatLng(), 'ubicación elegida con la persona');
      });
    }
    if (!markerIsDragging) locationMarker.setLatLng(currentPoint);
    locationMarker.setIcon(makeLocationIcon(markerHeading));
    lastMarkerPoint = currentPoint;
    if (!map.hasLayer(locationMarker)) locationMarker.addTo(map);
    status.textContent = 'Cargando Street View para ' + coordinates + (source ? ' (' + source + ').' : '.');
  }
  frame.addEventListener('load', function () {
    if (!panel.hidden) status.textContent = 'Panorama actualizado. Si no hay imagen en este punto, Google mostrará un aviso en el visor.';
  });
  frame.addEventListener('error', function () {
    status.textContent = 'No se pudo cargar el panorama. Comprueba la conexión e intenta de nuevo.';
  });
  function openStreetView() {
    openToolPanel(panel);
    panel.hidden = false;
    document.body.classList.add('street-view-open');
    map.closePopup();
    panel.setAttribute('aria-hidden', 'false');
    toggle.setAttribute('aria-expanded', 'true');
    loadStreetView(mapCenter(), 'centro actual del mapa');
  }
  function closeStreetView() {
    closeToolPanel(panel);
    resetStreetViewPanel();
    toggle.focus();
  }
  function resetStreetViewPanel() {
    document.body.classList.remove('street-view-open');
    panel.setAttribute('aria-hidden', 'true');
    toggle.setAttribute('aria-expanded', 'false');
    frame.removeAttribute('src');
    if (locationMarker && map.hasLayer(locationMarker)) map.removeLayer(locationMarker);
    lastMarkerPoint = null;
    markerHeading = 0;
  }
  document.addEventListener('geovisor:close-tool-panel', function (event) {
    if (event.detail && event.detail.id === panel.id) resetStreetViewPanel();
  });
  map.on('popupopen', function () { if (!panel.hidden) map.closePopup(); });
  toggle.addEventListener('click', openStreetView);
  document.getElementById('street-view-close').addEventListener('click', closeStreetView);
  document.getElementById('street-view-reload').addEventListener('click', function () { loadStreetView(mapCenter(), 'centro actual del mapa'); });
  // Usar el evento de Leaflet garantiza que la posición elegida sea la del
  // mapa (y no la coordenada del contenedor en eventos de controles/capas).
  // La misma función actualiza el marcador y solicita el panorama cercano.
  map.on('click', function (event) {
    if (panel.hidden || (event.originalEvent && event.originalEvent.target.closest &&
        (event.originalEvent.target.closest('.leaflet-control') || event.originalEvent.target.closest('.street-view-map-marker')))) return;
    loadStreetView(event.latlng, 'ubicación seleccionada');
  });
  document.addEventListener('keydown', function (event) {
    if (panel.hidden) return;
    if (event.key === 'Escape') { closeStreetView(); return; }
    var active = document.activeElement;
    if (active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName)) return;
    var steps = { ArrowUp: 0, ArrowRight: 90, ArrowDown: 180, ArrowLeft: 270 };
    if (!Object.prototype.hasOwnProperty.call(steps, event.key)) return;
    event.preventDefault();
    var origin = locationMarker ? locationMarker.getLatLng() : mapCenter();
    var stepMeters = 12;
    var angle = steps[event.key] * Math.PI / 180;
    var lat = origin.lat + (stepMeters * Math.cos(angle)) / 111320;
    var lngScale = 111320 * Math.cos(origin.lat * Math.PI / 180);
    var lng = origin.lng + (stepMeters * Math.sin(angle)) / Math.max(1, lngScale);
    loadStreetView(L.latLng(lat, lng), 'flecha del teclado');
  });
})();
// Análisis estadístico basado en las entidades y atributos de las capas vectoriales.
(function () {
  var layerSelect = document.getElementById('statistics-layer');
  var categorySelect = document.getElementById('statistics-category');
  var valueSelect = document.getElementById('statistics-value');
  var xValueSelect = document.getElementById('statistics-x-value');
  var operationSelect = document.getElementById('statistics-operation');
  var typeSelect = document.getElementById('statistics-chart-type');
  var percentInput = document.getElementById('statistics-percent');
  var titleInput = document.getElementById('statistics-chart-title');
  var colorInput = document.getElementById('statistics-color');
  var backgroundInput = document.getElementById('statistics-background');
  var legendPosition = document.getElementById('statistics-legend-position');
  var fontFamilySelect = document.getElementById('statistics-font-family');
  var fontSizeInput = document.getElementById('statistics-font-size');
  var labelRotationInput = document.getElementById('statistics-label-rotation');
  var exportWidthInput = document.getElementById('statistics-export-width');
  var exportHeightInput = document.getElementById('statistics-export-height');
  var canvas = document.getElementById('statistics-chart');
  var status = document.getElementById('statistics-status');
  var metrics = document.getElementById('statistics-metrics');
  var downloadButton = document.getElementById('statistics-download');
  var chartPanel = document.getElementById('statistics-chart-panel');
  var largeChartWrap = document.getElementById('statistics-large-chart-wrap');
  var compactChartWrap = canvas.parentElement;
  var expandChartButton = document.getElementById('statistics-chart-expand');
  var chartPanelTitle = document.getElementById('statistics-chart-panel-title');
  var chart = null;
  expandChartButton.disabled = true;
  var knownLayerNames = '';
  function say(message) { status.textContent = message; }
  function option(select, value, label) { var item = document.createElement('option'); item.value = value; item.textContent = label; select.appendChild(item); }
  function collectFeatures(layer, result) {
    if (!layer) return;
    if (layer.feature && layer.feature.type === 'Feature') { result.push(layer.feature); return; }
    if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) { collectFeatures(child, result); });
  }
  function collectRenderedFeatureLayers(layer, result) {
    if (!layer) return;
    if (layer.feature && layer.feature.type === 'Feature') { result.push(layer); return; }
    if (typeof layer.eachLayer === 'function') layer.eachLayer(function (child) { collectRenderedFeatureLayers(child, result); });
  }
  function renderedColor(layer) {
    var options = layer && layer.options ? layer.options : {};
    var color = options.fillColor || options.color;
    return typeof color === 'string' && color ? color : null;
  }
  function getActualLayerColor(feature) {
    var leaves = [];
    collectRenderedFeatureLayers(activeLayer(), leaves);
    var match = leaves.find(function (leaf) { return leaf.feature === feature; });
    return match ? renderedColor(match) : null;
  }
  function colorForChartCategory(label, categoryField, index) {
    var leaves = [];
    collectRenderedFeatureLayers(activeLayer(), leaves);
    var wanted = String(label == null ? '(Sin dato)' : label);
    var counts = Object.create(null);
    leaves.forEach(function (leaf) {
      var properties = featureProperties(leaf.feature);
      if (categoryField && String(properties[categoryField] == null || properties[categoryField] === '' ? '(Sin dato)' : properties[categoryField]) !== wanted) return;
      var color = renderedColor(leaf);
      if (color) counts[color] = (counts[color] || 0) + 1;
    });
    var colors = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; });
    return colors[0] || (categoryField ? colorPorCategoria(label) : colorInput.value || colorAt(index));
  }
  function dominantLayerColor() {
    return colorForChartCategory('Total', '', 0);
  }
  function activeLayer() { return overlayLayers[layerSelect.value] || null; }
  function activeFeatures() { var output = []; collectFeatures(activeLayer(), output); return output; }
  function hasVectorFeatures(layer) { var features = []; collectFeatures(layer, features); return features.length > 0; }
  function parseNumeric(value) {
    if (typeof value === 'number') return Number.isFinite(value) ? value : null;
    if (value == null || String(value).trim() === '') return null;
    var normalized = String(value).trim();
    if (normalized.indexOf(',') >= 0 && normalized.indexOf('.') < 0) normalized = normalized.replace(',', '.');
    var number = Number(normalized);
    return Number.isFinite(number) ? number : null;
  }
  function geometryArea(feature) {
    if (!feature || !feature.geometry || !/Polygon/.test(feature.geometry.type)) return null;
    if (window.turf && typeof window.turf.area === 'function') return window.turf.area(feature);
    return null;
  }
  function featureProperties(feature) { return feature.properties || {}; }
  function numericValues(features, field) {
    return features.map(function (feature) {
      if (field === '__geometry_area_m2') return geometryArea(feature);
      return parseNumeric(featureProperties(feature)[field]);
    }).filter(function (value) { return value != null; });
  }
  function fillFields() {
    var features = activeFeatures();
    var oldCategory = categorySelect.value;
    var oldValue = valueSelect.value;
    var oldXValue = xValueSelect.value;
    var keys = Array.from(new Set(features.reduce(function (all, feature) { return all.concat(Object.keys(featureProperties(feature))); }, [])));
    categorySelect.innerHTML = '';
    option(categorySelect, '', 'Sin agrupación');
    keys.forEach(function (key) { option(categorySelect, key, key); });
    if (keys.indexOf(oldCategory) >= 0) categorySelect.value = oldCategory;
    valueSelect.innerHTML = '';
    option(valueSelect, '', 'Selecciona un campo numérico');
    var numericKeys = keys.filter(function (key) { return features.some(function (feature) { return parseNumeric(featureProperties(feature)[key]) != null; }); });
    numericKeys.forEach(function (key) { option(valueSelect, key, key); });
    if (features.some(function (feature) { return geometryArea(feature) != null; })) option(valueSelect, '__geometry_area_m2', 'Área geométrica calculada (m²)');
    if (Array.from(valueSelect.options).some(function (item) { return item.value === oldValue; })) valueSelect.value = oldValue;
    else if (numericKeys.length) valueSelect.value = numericKeys[0];
    xValueSelect.innerHTML = '';
    option(xValueSelect, '__record_index', 'Índice del registro');
    numericKeys.forEach(function (key) { option(xValueSelect, key, key); });
    if (Array.from(xValueSelect.options).some(function (item) { return item.value === oldXValue; })) xValueSelect.value = oldXValue;
    else xValueSelect.value = numericKeys.length > 1 ? numericKeys[1] : '__record_index';
    if (features.length && !categorySelect.value) {
      var category = keys.find(function (key) { return !numericKeys.includes(key); });
      if (category) categorySelect.value = category;
    }
  }
  function refreshLayerOptions() {
    var names = Object.keys(overlayLayers).filter(function (name) { return hasVectorFeatures(overlayLayers[name]); });
    var signature = names.map(function (name) { var found = []; collectFeatures(overlayLayers[name], found); return name + ':' + found.length; }).join('|');
    if (signature === knownLayerNames) return;
    var previous = layerSelect.value;
    knownLayerNames = signature;
    layerSelect.innerHTML = '';
    if (!names.length) option(layerSelect, '', 'Carga una capa vectorial');
    names.forEach(function (name) { option(layerSelect, name, name); });
    if (names.indexOf(previous) >= 0) layerSelect.value = previous;
    else if (names.length) layerSelect.value = names[0];
    fillFields();
    updateAnalysis();
  }
  function median(values) { var sorted = values.slice().sort(function (a, b) { return a - b; }); var middle = Math.floor(sorted.length / 2); return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2; }
  function aggregate(features, categoryField, valueField, operation) {
    var groups = new Map();
    features.forEach(function (feature) {
      var properties = featureProperties(feature);
      var key = categoryField ? String(properties[categoryField] == null || properties[categoryField] === '' ? '(Sin dato)' : properties[categoryField]) : 'Total';
      var amount = operation === 'count' ? 1 : (operation === 'area' ? geometryArea(feature) : (valueField === '__geometry_area_m2' ? geometryArea(feature) : parseNumeric(properties[valueField])));
      if (amount == null) return;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(amount);
    });
    return Array.from(groups.entries()).map(function (entry) {
      var values = entry[1]; var total = values.reduce(function (sum, value) { return sum + value; }, 0);
      var result = operation === 'count' || operation === 'sum' || operation === 'area' ? total : operation === 'mean' ? total / values.length : operation === 'median' ? median(values) : operation === 'min' ? Math.min.apply(Math, values) : operation === 'max' ? Math.max.apply(Math, values) : total;
      return { label: entry[0], value: result, count: values.length };
    });
  }
  function areaTotal(features) { return features.reduce(function (sum, feature) { return sum + (geometryArea(feature) || 0); }, 0); }
  function formatNumber(value, digits) { return new Intl.NumberFormat('es-CO', { maximumFractionDigits: digits == null ? 2 : digits }).format(value); }
  function metric(label, value) {
    var card = document.createElement('div'); card.className = 'statistics-metric';
    var strong = document.createElement('strong'); strong.textContent = value;
    var caption = document.createElement('span'); caption.textContent = label;
    card.appendChild(strong); card.appendChild(caption); metrics.appendChild(card);
  }
  function renderMetrics(features) {
    metrics.innerHTML = '';
    var values = numericValues(features, valueSelect.value);
    var sum = values.reduce(function (total, value) { return total + value; }, 0);
    metric('Registros', formatNumber(features.length, 0));
    metric('Suma del campo', values.length ? formatNumber(sum) : '—');
    metric('Promedio', values.length ? formatNumber(sum / values.length) : '—');
    metric('Área geométrica (ha)', areaTotal(features) ? formatNumber(areaTotal(features) / 10000) : '—');
  }
  function hexToHsl(hex) {
    var r = parseInt(hex.slice(1, 3), 16) / 255; var g = parseInt(hex.slice(3, 5), 16) / 255; var b = parseInt(hex.slice(5, 7), 16) / 255;
    var max = Math.max(r, g, b); var min = Math.min(r, g, b); var h = 0; var s = 0; var l = (max + min) / 2;
    if (max !== min) { var d = max - min; s = l > .5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = (g - b) / d + (g < b ? 6 : 0); else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; }
    return { h: h, s: s * 100, l: l * 100 };
  }
  function colorAt(index) {
    var base = hexToHsl(colorInput.value); var light = Math.max(30, Math.min(70, base.l + (index % 2 ? 13 : -5)));
    return 'hsl(' + ((base.h + index * 43) % 360) + ', ' + Math.max(35, base.s) + '%, ' + light + '%)';
  }
  function histogram(values) {
    if (!values.length) return { labels: [], values: [] };
    var min = Math.min.apply(Math, values); var max = Math.max.apply(Math, values); var bins = Math.max(5, Math.min(14, Math.ceil(Math.sqrt(values.length))));
    if (min === max) { min -= .5; max += .5; }
    var width = (max - min) / bins; var counts = Array(bins).fill(0);
    values.forEach(function (value) { counts[Math.min(bins - 1, Math.floor((value - min) / width))]++; });
    return { labels: counts.map(function (_, index) { return formatNumber(min + width * index) + '–' + formatNumber(min + width * (index + 1)); }), values: counts };
  }
  function renderAnalysis() {
    chartPanelTitle.textContent = titleInput.value.trim() || 'Gráfico estadístico';
    if (!window.Chart) { say('No se cargó Chart.js. Comprueba la conexión e intenta recargar el geovisor.'); downloadButton.disabled = true; return; }
    var features = activeFeatures();
    renderMetrics(features);
    if (chart) { chart.destroy(); chart = null; }
    downloadButton.disabled = true; expandChartButton.disabled = true;
    if (!features.length) { say('Selecciona una capa vectorial cargada para analizar sus atributos.'); if (openToolPanelIds.indexOf(chartPanel.id) >= 0) closeToolPanel(chartPanel); return; }
    var type = typeSelect.value; var operation = operationSelect.value; var field = valueSelect.value; var category = categorySelect.value; var xField = xValueSelect.value;
    var labels; var values; var scatterX = []; var scatterColors = []; var chartType = type === 'barHorizontal' || type === 'histogram' ? 'bar' : (type === 'areaChart' ? 'line' : type);
    if (type === 'scatter' || type === 'bubble') {
      var scatterRows = [];
      features.forEach(function (feature, index) {
        var properties = featureProperties(feature);
        var x = xField === '__record_index' ? index + 1 : parseNumeric(properties[xField]);
        var y = operation === 'count' ? 1 : (operation === 'area' ? geometryArea(feature) : (field === '__geometry_area_m2' ? geometryArea(feature) : parseNumeric(properties[field])));
        if (x == null || y == null) return;
        scatterRows.push({ x: x, y: y, label: category ? String(properties[category] == null ? '(Sin dato)' : properties[category]) : 'Registro ' + (index + 1), color: getActualLayerColor(feature) });
      });
      labels = scatterRows.map(function (row) { return row.label; });
      scatterX = scatterRows.map(function (row) { return row.x; });
      values = scatterRows.map(function (row) { return row.y; });
      scatterColors = scatterRows.map(function (row) { return row.color || colorForChartCategory(row.label, category, 0); });
    } else if (type === 'histogram') {
      if (operation === 'count' || operation === 'area' || !field) { say('Para el histograma elige un campo numérico y una operación distinta de Conteo o Área.'); return; }
      var histogramData = histogram(numericValues(features, field)); labels = histogramData.labels; values = histogramData.values; chartType = 'bar';
    } else {
      if (operation !== 'count' && operation !== 'area' && !field) { say('Selecciona un campo numérico o usa Conteo.'); return; }
      var rows = aggregate(features, category, field, operation);
      labels = rows.map(function (row) { return row.label; }); values = rows.map(function (row) { return row.value; });
    }
    if (!values.length) { say(operation === 'area' ? 'No se encontraron geometrías de polígono con área calculable.' : 'No hay valores válidos para la combinación de campos elegida.'); return; }
    if (percentInput.checked) { var denominator = values.reduce(function (sum, value) { return sum + value; }, 0); if (denominator) values = values.map(function (value) { return value / denominator * 100; }); }
    if (['pie', 'doughnut', 'polarArea'].includes(chartType) && values.some(function (value) { return value < 0; })) { say('Los gráficos circulares requieren valores no negativos. Elige otro tipo de gráfico o una operación con resultados positivos.'); return; }
    var palette = chartType === 'scatter' || chartType === 'bubble'
      ? scatterColors
      : labels.map(function (label, index) { return type === 'histogram' ? dominantLayerColor() : colorForChartCategory(label, category, index); });
    var dataValues;
    if (chartType === 'scatter' || chartType === 'bubble') dataValues = values.map(function (value, index) { return chartType === 'bubble' ? { x: scatterX[index], y: value, r: Math.max(4, Math.min(18, Math.sqrt(Math.abs(value)) + 4)) } : { x: scatterX[index], y: value }; });
    else dataValues = values;
    var dataset = { label: operation === 'count' ? 'Registros' : (operation === 'area' ? 'Área (m²)' : (operationSelect.options[operationSelect.selectedIndex].text + ' · ' + valueSelect.options[valueSelect.selectedIndex].text)), data: dataValues, backgroundColor: palette, borderColor: palette, segment: chartType === 'line' ? { borderColor: function (context) { return palette[context.p1DataIndex] || colorInput.value; } } : undefined, pointBackgroundColor: palette, pointBorderColor: palette, borderWidth: 2, tension: .28, fill: type === 'areaChart' || chartType === 'radar', pointRadius: chartType === 'scatter' ? 4 : 3 };
    var backgroundRgb = backgroundInput.value.match(/[\da-f]{2}/gi).map(function (part) { return parseInt(part, 16); });
    var backgroundLightness = (backgroundRgb[0] * 299 + backgroundRgb[1] * 587 + backgroundRgb[2] * 114) / 1000;
    var chartTextColor = backgroundLightness < 145 ? '#fffaf5' : '#3c2028';
    var chartMutedColor = backgroundLightness < 145 ? '#f3d8c6' : '#573842';
    var chartGridColor = backgroundLightness < 145 ? 'rgba(255,250,245,.2)' : 'rgba(70,24,39,.12)';
    var options = { responsive: true, maintainAspectRatio: false, animation: false, indexAxis: type === 'barHorizontal' ? 'y' : 'x', plugins: { title: { display: !!titleInput.value.trim(), text: titleInput.value.trim(), color: chartTextColor, font: { size: 15, weight: '600' } }, legend: { display: legendPosition.value !== 'none', position: legendPosition.value === 'none' ? 'top' : legendPosition.value, labels: { color: chartTextColor } }, tooltip: { callbacks: { title: function (items) { return items.length ? labels[items[0].dataIndex] : ''; }, label: function (context) { var number = chartType === 'scatter' || chartType === 'bubble' ? context.raw.y : context.raw; return context.dataset.label + ': ' + formatNumber(number) + (percentInput.checked ? '%' : ''); } } } }, scales: {} };
    if (chartType === 'scatter' || chartType === 'bubble') options.scales = { x: { type: 'linear', position: 'bottom', title: { display: true, text: xValueSelect.options[xValueSelect.selectedIndex].text, color: chartMutedColor }, ticks: { color: chartMutedColor }, grid: { color: chartGridColor } }, y: { ticks: { color: chartMutedColor }, grid: { color: chartGridColor } } };
    else if (chartType === 'radar') options.scales = { r: { ticks: { color: chartMutedColor, backdropColor: 'transparent' }, grid: { color: chartGridColor }, pointLabels: { color: chartMutedColor } } };
    else if (!['pie', 'doughnut', 'polarArea'].includes(chartType)) options.scales = { x: { ticks: { color: chartMutedColor }, grid: { display: false } }, y: { beginAtZero: true, ticks: { color: chartMutedColor, callback: function (value) { return formatNumber(value) + (percentInput.checked ? '%' : ''); } }, grid: { color: chartGridColor } } };
    var fontFamily = fontFamilySelect.value; var fontSize = Number(fontSizeInput.value); var rotation = Number(labelRotationInput.value);
    options.layout = { padding: { top: fontSize + 10, right: fontSize + 10, bottom: fontSize + 10, left: fontSize + 10 } };
    options.devicePixelRatio = 1;
    options.plugins.title.font = { family: fontFamily, size: fontSize + 3, weight: '600' };
    options.plugins.legend.labels.font = { family: fontFamily, size: fontSize };
    Object.keys(options.scales).forEach(function (axis) {
      var scaleOptions = options.scales[axis];
      if (scaleOptions.ticks) { scaleOptions.ticks.font = { family: fontFamily, size: fontSize }; if (axis === (type === 'barHorizontal' ? 'y' : 'x')) { scaleOptions.ticks.minRotation = rotation; scaleOptions.ticks.maxRotation = rotation; } }
      if (scaleOptions.pointLabels) scaleOptions.pointLabels.font = { family: fontFamily, size: fontSize };
      if (scaleOptions.title) scaleOptions.title.font = { family: fontFamily, size: fontSize, weight: '600' };
    });
    var backgroundPlugin = { id: 'statisticsCanvasBackground', beforeDraw: function (instance) { var context = instance.canvas.getContext('2d'); context.save(); context.globalCompositeOperation = 'destination-over'; context.fillStyle = backgroundInput.value; context.fillRect(0, 0, instance.width, instance.height); context.restore(); } };
    var outsideValueLabels = {
      id: 'statisticsOutsideValueLabels',
      afterDatasetsDraw: function (instance) {
        if (['pie', 'doughnut', 'polarArea', 'scatter', 'bubble'].indexOf(chartType) >= 0) return;
        var context = instance.ctx;
        context.save();
        context.font = fontSize + 'px ' + fontFamily;
        context.fillStyle = chartTextColor;
        context.textBaseline = 'middle';
        instance.data.datasets.forEach(function (series, datasetIndex) {
          var meta = instance.getDatasetMeta(datasetIndex);
          meta.data.forEach(function (element, dataIndex) {
            var value = Number(series.data[dataIndex]);
            if (!Number.isFinite(value)) return;
            var text = formatNumber(value) + (percentInput.checked ? '%' : '');
            var position = element.tooltipPosition();
            if (chartType === 'radar') {
              var area = instance.chartArea;
              var centerX = (area.left + area.right) / 2;
              var centerY = (area.top + area.bottom) / 2;
              var dx = position.x - centerX;
              var dy = position.y - centerY;
              var length = Math.sqrt(dx * dx + dy * dy) || 1;
              context.textAlign = 'center';
              context.fillText(text, position.x + dx / length * 13, position.y + dy / length * 13);
            } else if (type === 'barHorizontal') {
              context.textAlign = 'left';
              context.fillText(text, position.x + 7, position.y);
            } else {
              context.textAlign = 'center';
              context.fillText(text, position.x, position.y - 10);
            }
          });
        });
        context.restore();
      }
    };
    chart = new Chart(canvas.getContext('2d'), { type: chartType, data: { labels: chartType === 'scatter' || chartType === 'bubble' ? undefined : labels, datasets: [dataset] }, options: options, plugins: [backgroundPlugin, outsideValueLabels] });
    downloadButton.disabled = false; expandChartButton.disabled = false;
    say(features.length + ' registros analizados; ' + values.length + ' valores representados.' + (percentInput.checked ? ' Valores expresados como porcentaje.' : ''));
  }

  function updateAnalysis() {
    try { renderAnalysis(); }
    catch (error) { console.error('No se pudo actualizar el análisis estadístico:', error); say('No se pudo generar el análisis: ' + (error.message || 'revisa los campos y el tipo de gráfico.')); downloadButton.disabled = true; }
  }

  layerSelect.addEventListener('change', function () { fillFields(); updateAnalysis(); });
  [categorySelect, valueSelect, xValueSelect, operationSelect, typeSelect, percentInput, titleInput, colorInput, backgroundInput, legendPosition, fontFamilySelect, fontSizeInput, labelRotationInput].forEach(function (control) {
    control.addEventListener('change', updateAnalysis);
    if (control.type === 'color' || control.type === 'text' || control.type === 'range') control.addEventListener('input', updateAnalysis);
  });
  fontSizeInput.addEventListener('input', function () { document.getElementById('statistics-font-size-value').textContent = fontSizeInput.value + ' px'; });
  labelRotationInput.addEventListener('input', function () { document.getElementById('statistics-label-rotation-value').textContent = labelRotationInput.value + '°'; });
  function downloadStyledChart() {
    if (!chart) return;
    var margin = 36; var headerHeight = 150; var footerHeight = 58;
    var requestedWidth = Math.round(Number(exportWidthInput.value)); var requestedHeight = Math.round(Number(exportHeightInput.value));
    if (requestedWidth < 800 || requestedWidth > 5000 || requestedHeight < 600 || requestedHeight > 4000) { say('El ancho debe estar entre 800 y 5.000 px y el alto entre 600 y 4.000 px.'); return; }
    var graphWidth = requestedWidth - margin * 2;
    var graphHeight = requestedHeight - headerHeight - footerHeight - margin;
    chart.resize(graphWidth, graphHeight); chart.update('none');
    var source = canvas;
    var output = document.createElement('canvas');
    output.width = requestedWidth;
    output.height = requestedHeight;
    var context = output.getContext('2d');
    context.fillStyle = '#eee7e0'; context.fillRect(0, 0, output.width, output.height);
    var cardX = 18, cardY = 18, cardWidth = output.width - 36, cardHeight = output.height - 36;
    context.save(); context.shadowColor = 'rgba(45,15,29,.18)'; context.shadowBlur = 22; context.shadowOffsetY = 8;
    context.beginPath(); context.roundRect(cardX, cardY, cardWidth, cardHeight, 22); context.fillStyle = '#fffaf5'; context.fill(); context.restore();
    context.save(); context.beginPath(); context.roundRect(cardX, cardY, cardWidth, cardHeight, 22); context.clip();
    var headerGradient = context.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + headerHeight);
    headerGradient.addColorStop(0, '#2d0f1d'); headerGradient.addColorStop(1, '#000000');
    context.fillStyle = headerGradient; context.fillRect(cardX, cardY, cardWidth, headerHeight);
    context.fillStyle = '#e2a281'; context.fillRect(cardX, cardY + headerHeight - 4, cardWidth, 4);
    var left = cardX + 32; var right = cardX + cardWidth - 32; var textScale = Math.max(1, Math.min(1.6, graphWidth / 1200)); var exportFont = fontFamilySelect.value;
    var exportFeatures = activeFeatures(); var selectedOperation = operationSelect.value;
    context.textBaseline = 'alphabetic'; context.textAlign = 'left';
    context.fillStyle = '#e2a281'; context.font = '700 ' + Math.round(13 * textScale) + 'px ' + exportFont; context.fillText('GEOVISOR TERRITORIAL JUAN MINA', left, cardY + 34);
    context.fillStyle = '#fffaf5'; context.font = '700 ' + Math.round(24 * textScale) + 'px ' + exportFont;
    var layerName = layerSelect.options[layerSelect.selectedIndex] ? layerSelect.options[layerSelect.selectedIndex].text : 'Capa vectorial';
    context.fillText(layerName, left, cardY + 72, cardWidth - 250);
    context.fillStyle = 'rgba(255,250,245,.78)'; context.font = '400 ' + Math.round(13 * textScale) + 'px ' + exportFont;
    var operationLabel = operationSelect.options[operationSelect.selectedIndex] ? operationSelect.options[operationSelect.selectedIndex].text : 'Conteo';
    var fieldLabel = selectedOperation === 'count' || selectedOperation === 'area' ? '' : ' · ' + (valueSelect.options[valueSelect.selectedIndex] ? valueSelect.options[valueSelect.selectedIndex].text : '');
    context.fillText(exportFeatures.length + ' registros · ' + operationLabel + fieldLabel, left, cardY + 101, cardWidth - 64);
    var typeLabel = typeSelect.options[typeSelect.selectedIndex] ? typeSelect.options[typeSelect.selectedIndex].text : 'Gráfico';
    var dateLabel = new Date().toLocaleDateString('es-CO');
    context.textAlign = 'right'; context.fillStyle = '#f3d8c6'; context.font = '600 ' + Math.round(12 * textScale) + 'px ' + exportFont; context.fillText(typeLabel.toUpperCase(), right, cardY + 34);
    context.fillStyle = 'rgba(255,250,245,.68)'; context.font = '400 ' + Math.round(12 * textScale) + 'px ' + exportFont; context.fillText(dateLabel, right, cardY + 57);
    context.restore();
    context.drawImage(source, cardX + margin, cardY + headerHeight + 22, graphWidth, graphHeight);
    var footerY = cardY + headerHeight + graphHeight + 43;
    context.textAlign = 'left'; context.fillStyle = '#6c4a4b'; context.font = '600 ' + Math.round(11 * textScale) + 'px ' + exportFont;
    context.fillText('ANÁLISIS ESTADÍSTICO', cardX + 32, footerY);
    context.textAlign = 'right'; context.fillStyle = '#8b7770'; context.font = '400 ' + Math.round(11 * textScale) + 'px ' + exportFont;
    context.fillText('Fuente: tabla de atributos', cardX + cardWidth - 32, footerY);
    chart.resize(); chart.update('none');
    output.toBlob(function (blob) {
      if (!blob) { say('No se pudo preparar la imagen PNG.'); return; }
      var url = URL.createObjectURL(blob); var link = document.createElement('a'); link.href = url; link.download = 'analisis-estadistico.png'; link.click(); window.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      say('Gráfico PNG descargado a ' + requestedWidth + ' × ' + requestedHeight + ' px.');
    }, 'image/png');
  }
  downloadButton.addEventListener('click', function () {
    downloadStyledChart();
  });
  function openChartPanel() {
    if (canvas.parentElement !== largeChartWrap) largeChartWrap.appendChild(canvas);
    openToolPanel(chartPanel);
    expandChartButton.setAttribute('aria-expanded', 'true');
    window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); if (chart) chart.resize(); });
  }
  function restoreCompactChart() {
    if (canvas.parentElement !== compactChartWrap) compactChartWrap.appendChild(canvas);
    expandChartButton.setAttribute('aria-expanded', 'false');
    window.requestAnimationFrame(function () { map.invalidateSize({ pan: false }); if (chart) chart.resize(); });
  }
  document.addEventListener('geovisor:close-tool-panel', function (event) {
    if (event.detail && event.detail.id === chartPanel.id) restoreCompactChart();
  });
  document.addEventListener('geovisor:dock-changed', function () {
    window.requestAnimationFrame(function () { if (chart) chart.resize(); });
  });
  expandChartButton.addEventListener('click', openChartPanel);
  window.addEventListener('resize', function () {
    if (openToolPanelIds.indexOf(chartPanel.id) >= 0) window.requestAnimationFrame(function () { if (chart) chart.resize(); });
  });
  var layerRefreshTimer = null;
  function queueLayerRefresh() { window.clearTimeout(layerRefreshTimer); layerRefreshTimer = window.setTimeout(refreshLayerOptions, 180); }
  map.on('layeradd layerremove', queueLayerRefresh);
  document.addEventListener('geovisor:layerschanged', queueLayerRefresh);
  refreshLayerOptions();

  var statisticsDetails = document.getElementById('statistics-details');
  document.addEventListener('geovisor:palettechanged', updateAnalysis);
  document.addEventListener('geovisor:mapstyleschanged', updateAnalysis);
  statisticsDetails.addEventListener('toggle', function () {
    if (statisticsDetails.open && chart) window.setTimeout(function () { chart.resize(); }, 40);
  });
  document.addEventListener('geovisor:attributeschanged', renderAnalysis);
})();
