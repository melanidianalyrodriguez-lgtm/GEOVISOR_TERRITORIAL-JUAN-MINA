(function () {
  'use strict';

  var button = document.getElementById('export-image');
  var status = document.getElementById('export-status');
  var format = document.getElementById('export-format');
  var PDF = window.PDFLib;
  // Márgenes iguales al espacio exterior derecho de la plantilla y un canal entre mapa y rótulo.
  var mapFrame = { x: 41.1, top: 31.2, width: 825.4, height: 726 };
  var labelDividerX = mapFrame.x + mapFrame.width + 13;

  function updateExportLabel() { button.textContent = format.value === 'png' ? 'Exportar PNG' : 'Exportar PDF'; }
  format.addEventListener('change', updateExportLabel);
  updateExportLabel();

  function stamp() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function wrap(text, font, size, width) {
    var words = String(text || '').trim().split(/\s+/).filter(Boolean), lines = [], line = '';
    words.forEach(function (word) {
      var next = line ? line + ' ' + word : word;
      if (line && font.widthOfTextAtSize(next, size) > width) { lines.push(line); line = word; }
      else line = next;
    });
    if (line) lines.push(line);
    return lines;
  }
  function textBox(page, text, font, box, options) {
    options = options || {};
    var pad = options.pad == null ? 9 : options.pad, size = options.size || 12, min = options.min || 6.5;
    var lines;
    do {
      lines = wrap(text, font, size, box.width - pad * 2);
      if (lines.length * size * 1.25 <= box.height - pad * 2) break;
      size -= .5;
    } while (size >= min);
    var lineHeight = size * 1.25;
    lines.forEach(function (line, i) {
      var top = box.top + pad + i * lineHeight;
      if (top + size <= box.top + box.height - pad + 2) {
        var lineWidth = font.widthOfTextAtSize(line, size);
        var x = options.center ? box.x + (box.width - lineWidth) / 2 : box.x + pad;
        page.drawText(line, { x: x, y: 792 - top - size, size: size, font: font, color: options.color || PDF.rgb(.12, .15, .16) });
      }
    });
  }
  function color(hex) {
    var s = String(hex || '#555555').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(s)) s = '555555';
    return PDF.rgb(parseInt(s.slice(0, 2), 16) / 255, parseInt(s.slice(2, 4), 16) / 255, parseInt(s.slice(4, 6), 16) / 255);
  }
  function formatCoordinate(value, isLat) {
    var abs = Math.abs(value), deg = Math.floor(abs), min = Math.round((abs - deg) * 60);
    if (min === 60) { deg++; min = 0; }
    return deg + '°' + String(min).padStart(2, '0') + "'" + (isLat ? (value < 0 ? 'S' : 'N') : (value < 0 ? 'O' : 'E'));
  }
  function interval(span, count) {
    var raw = span / count, power = Math.pow(10, Math.floor(Math.log10(raw || 1))), unit = raw / power;
    return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 5 ? 5 : 10) * power;
  }
  function artwork(source) {
    // El marco coincide exactamente con la primera y la última línea horizontal del rótulo.
    var width = mapFrame.width, height = mapFrame.height, frameTop = mapFrame.top, density = 2;
    var canvas = document.createElement('canvas'); canvas.width = Math.round(width * density); canvas.height = Math.round(height * density);
    var ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    var ratio = canvas.width / canvas.height, srcRatio = source.width / source.height;
    var cropW = source.width, cropH = source.height, cropX = 0, cropY = 0;
    if (srcRatio > ratio) { cropW = source.height * ratio; cropX = (source.width - cropW) / 2; }
    else { cropH = source.width / ratio; cropY = (source.height - cropH) / 2; }
    ctx.drawImage(source, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4; ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
    return { canvas: canvas, cropX: cropX, cropY: cropY, cropWidth: cropW, cropHeight: cropH, frameTop: frameTop, frameHeight: height };
  }
  function drawPdfGrid(page, font, source, art) {
    var size = map.getSize(), sourcePerCssX = source.width / size.x, sourcePerCssY = source.height / size.y;
    function geographicAt(x, y) { return map.containerPointToLatLng([x / sourcePerCssX, y / sourcePerCssY]); }
    function point(latlng) {
      var p = map.latLngToContainerPoint(latlng), sx = p.x * sourcePerCssX, sy = p.y * sourcePerCssY;
      return { x: mapFrame.x + (sx - art.cropX) / art.cropWidth * mapFrame.width, y: 792 - mapFrame.top - (sy - art.cropY) / art.cropHeight * mapFrame.height };
    }
    var nw = geographicAt(art.cropX, art.cropY), se = geographicAt(art.cropX + art.cropWidth, art.cropY + art.cropHeight);
    var latStep = interval(nw.lat - se.lat, 7), lonStep = interval(se.lng - nw.lng, 8);
    var ink = PDF.rgb(.07, .11, .13), labelSize = 7.2;
    var leftEdge = mapFrame.x, rightEdge = mapFrame.x + mapFrame.width;
    var topEdge = 792 - mapFrame.top, bottomEdge = 792 - mapFrame.top - mapFrame.height;
    function tick(start, end) { page.drawLine({ start: start, end: end, thickness: .65, color: ink }); }
    for (var lat = Math.ceil(se.lat / latStep) * latStep; lat <= nw.lat; lat += latStep) {
      var left = point(L.latLng(lat, nw.lng)), right = point(L.latLng(lat, se.lng));
      var latLabel = formatCoordinate(lat, true);
      var labelWidth = font.widthOfTextAtSize(latLabel, labelSize);
      page.drawLine({ start: left, end: right, thickness: .55, color: ink, opacity: .68 });
      tick({ x: leftEdge, y: left.y }, { x: leftEdge - 4, y: left.y });
      tick({ x: rightEdge, y: right.y }, { x: rightEdge + 4, y: right.y });
      page.drawText(latLabel, { x: (leftEdge - labelWidth) / 2, y: left.y - labelSize / 2, size: labelSize, font: font, color: ink });
      page.drawText(latLabel, { x: rightEdge + 9, y: right.y - labelWidth / 2, size: labelSize, font: font, color: ink, rotate: PDF.degrees(90) });
    }
    for (var lon = Math.ceil(nw.lng / lonStep) * lonStep; lon <= se.lng; lon += lonStep) {
      var top = point(L.latLng(nw.lat, lon)), bottom = point(L.latLng(se.lat, lon));
      var lonLabel = formatCoordinate(lon, false);
      var lonWidth = font.widthOfTextAtSize(lonLabel, labelSize);
      page.drawLine({ start: top, end: bottom, thickness: .55, color: ink, opacity: .68 });
      tick({ x: top.x, y: topEdge }, { x: top.x, y: topEdge + 4 });
      tick({ x: bottom.x, y: bottomEdge }, { x: bottom.x, y: bottomEdge - 4 });
      page.drawText(lonLabel, { x: top.x - lonWidth / 2, y: topEdge + 6, size: labelSize, font: font, color: ink });
      page.drawText(lonLabel, { x: bottom.x - lonWidth / 2, y: bottomEdge - 14, size: labelSize, font: font, color: ink });
    }
  }
  function artworkPngWithGrid(source) {
    var art = artwork(source), density = 2;
    var canvas = document.createElement('canvas'); canvas.width = Math.round(labelDividerX * density); canvas.height = 792 * density;
    var ctx = canvas.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(art.canvas, mapFrame.x * density, mapFrame.top * density);
    var size = map.getSize(), sx = source.width / size.x, sy = source.height / size.y;
    function geographicAt(x, y) { return map.containerPointToLatLng([x / sx, y / sy]); }
    function point(latlng) {
      var p = map.latLngToContainerPoint(latlng), px = p.x * sx, py = p.y * sy;
      return { x: (mapFrame.x + (px - art.cropX) / art.cropWidth * mapFrame.width) * density, y: (mapFrame.top + (py - art.cropY) / art.cropHeight * mapFrame.height) * density };
    }
    var nw = geographicAt(art.cropX, art.cropY), se = geographicAt(art.cropX + art.cropWidth, art.cropY + art.cropHeight);
    var latStep = interval(nw.lat - se.lat, 7), lonStep = interval(se.lng - nw.lng, 8), left = mapFrame.x * density, right = (mapFrame.x + mapFrame.width) * density;
    ctx.strokeStyle = 'rgba(18,32,36,.68)'; ctx.fillStyle = '#18272b'; ctx.lineWidth = 1.1; ctx.font = '14px Arial, sans-serif'; ctx.textBaseline = 'middle';
    for (var lat = Math.ceil(se.lat / latStep) * latStep; lat <= nw.lat; lat += latStep) {
      var pLeft = point(L.latLng(lat, nw.lng)), pRight = point(L.latLng(lat, se.lng)), label = formatCoordinate(lat, true);
      ctx.beginPath(); ctx.moveTo(pLeft.x, pLeft.y); ctx.lineTo(pRight.x, pRight.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(left, pLeft.y); ctx.lineTo(left - 8, pLeft.y); ctx.moveTo(right, pRight.y); ctx.lineTo(right + 8, pRight.y); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText(label, left / 2, pLeft.y); ctx.save(); ctx.translate(right + (labelDividerX - mapFrame.x - mapFrame.width) * density / 2, pRight.y); ctx.rotate(-Math.PI / 2); ctx.fillText(label, 0, 0); ctx.restore();
    }
    for (var lon = Math.ceil(nw.lng / lonStep) * lonStep; lon <= se.lng; lon += lonStep) {
      var pTop = point(L.latLng(nw.lat, lon)), pBottom = point(L.latLng(se.lat, lon)), lonLabel = formatCoordinate(lon, false);
      ctx.beginPath(); ctx.moveTo(pTop.x, pTop.y); ctx.lineTo(pBottom.x, pBottom.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(pTop.x, mapFrame.top * density); ctx.lineTo(pTop.x, mapFrame.top * density - 8); ctx.moveTo(pBottom.x, (mapFrame.top + mapFrame.height) * density); ctx.lineTo(pBottom.x, (mapFrame.top + mapFrame.height) * density + 8); ctx.stroke();
      ctx.textAlign = 'center'; ctx.fillText(lonLabel, pTop.x, mapFrame.top * density / 2); ctx.fillText(lonLabel, pBottom.x, (mapFrame.top + mapFrame.height) * density + (792 - mapFrame.top - mapFrame.height) * density / 2);
    }
    ctx.beginPath(); ctx.lineWidth = 2; ctx.moveTo(labelDividerX * density, mapFrame.top * density); ctx.lineTo(labelDividerX * density, (mapFrame.top + mapFrame.height) * density); ctx.stroke();
    return canvas;
  }
  function getExportBounds() {
    var boundary = Object.keys(overlayLayers || {}).map(function (name) { return { name: name, layer: overlayLayers[name] }; }).find(function (entry) {
      return entry.layer && map.hasLayer(entry.layer) && (entry.layer._tipo === 'limite' || /l[ií]mite/i.test(entry.name));
    });
    function boundsOf(layer) {
      try { var bounds = layer && typeof layer.getBounds === 'function' ? layer.getBounds() : null; return bounds && bounds.isValid() ? bounds : null; }
      catch (e) { return null; }
    }
    var target = boundary ? boundsOf(boundary.layer) : null;
    if (target) return target;
    var combined = null;
    Object.keys(overlayLayers || {}).forEach(function (name) {
      var layer = overlayLayers[name]; if (!layer || !map.hasLayer(layer)) return;
      var bounds = boundsOf(layer); if (bounds) { if (!combined) combined = L.latLngBounds(bounds); else combined.extend(bounds); }
    });
    return combined;
  }
  function focusBoundsForExport() {
    var target = getExportBounds(); if (!target) return;
    var size = map.getSize(), frameRatio = mapFrame.width / mapFrame.height;
    var padX = Math.max(30, (size.x - size.y * frameRatio) / 2 + 30);
    var padY = Math.max(30, (size.y - size.x / frameRatio) / 2 + 30);
    map.fitBounds(target, { paddingTopLeft: [padX, padY], paddingBottomRight: [padX, padY], maxZoom: 17, animate: false });
  }
  function waitForMapTiles() { return new Promise(function (resolve) { window.setTimeout(resolve, 1300); }); }
  function captureMap() {
    return new Promise(function (resolve, reject) {
      leafletImage(map, function (error, canvas) { if (error || !canvas) reject(error || new Error('No se pudo capturar la vista actual.')); else resolve(canvas); });
    });
  }
  function legendEntries() {
    var entries = [];
    function visit(layer, info) {
      if (!layer) return;
      if (layer.eachLayer) layer.eachLayer(function (child) { visit(child, info); });
      if (layer.options && (layer.setStyle || layer instanceof L.CircleMarker || layer instanceof L.Marker)) {
        info.style = info.style || Object.assign({}, layer.options, typeof layer.getStyle === 'function' ? layer.getStyle() : {});
        info.kind = info.kind || (layer instanceof L.CircleMarker || layer instanceof L.Marker ? 'point' : (layer.options.fill ? 'area' : 'line'));
      }
    }
    Object.keys(overlayLayers || {}).forEach(function (name) {
      var layer = overlayLayers[name]; if (!layer || !map.hasLayer(layer)) return;
      if (typeof legendFeatureRows === 'function') {
        var categories = legendFeatureRows(layer);
        if (categories.length) {
          categories.forEach(function (item) {
            var label = item.label === 'Color uniforme' ? name : name + ': ' + item.label;
            entries.push({ name: label, style: { color: item.color, fillColor: item.color, fill: true }, kind: 'area' });
          });
          return;
        }
      }
      var info = {}; visit(layer, info);
      if (typeof layerLegendColor === 'function' && layer._tipo) {
        var preset = layerLegendColor(layer); info.style = Object.assign({}, info.style, { color: preset.color, fillColor: preset.color });
        info.kind = preset.line ? 'line' : 'area';
      }
      entries.push({ name: name, style: info.style || layer.options || {}, kind: info.kind || 'area' });
    });
    if (typeof drawnItems !== 'undefined' && map.hasLayer(drawnItems) && drawnItems.getLayers().length) {
      var drawn = {}; visit(drawnItems, drawn); entries.push({ name: 'Dibujos', style: drawn.style || {}, kind: drawn.kind || 'line' });
    }
    return entries;
  }
  async function locatorPng(center, bounds) {
    var host = document.createElement('div'); host.style.cssText = 'position:fixed;left:-10000px;top:0;width:700px;height:350px;z-index:-1'; document.body.appendChild(host);
    var locator = L.map(host, { zoomControl: false, attributionControl: false, dragging: false, scrollWheelZoom: false, doubleClickZoom: false, boxZoom: false, keyboard: false });
    try {
      if (activeBaseLayer && activeBaseLayer._url) L.tileLayer(activeBaseLayer._url, Object.assign({}, activeBaseLayer.options, { crossOrigin: true, maxZoom: Math.min(10, activeBaseLayer.options.maxZoom || 10) })).addTo(locator);
      locator.setView(center, 6, { animate: false });
      await new Promise(function (resolve) { setTimeout(resolve, 1700); });
      var tileCanvas = await new Promise(function (resolve) { leafletImage(locator, function (err, result) { resolve(err || !result ? null : result); }); });
      if (!tileCanvas) return null;
      var canvas = document.createElement('canvas'); canvas.width = 700; canvas.height = 350; var ctx = canvas.getContext('2d'); ctx.drawImage(tileCanvas, 0, 0, 700, 350);
      var nw = locator.latLngToContainerPoint(bounds.getNorthWest()), se = locator.latLngToContainerPoint(bounds.getSouthEast()); ctx.strokeStyle = '#d71920'; ctx.lineWidth = 4; ctx.strokeRect(nw.x, nw.y, Math.max(1, se.x - nw.x), Math.max(1, se.y - nw.y));
      return canvas.toDataURL('image/png');
    } catch (err) { console.warn('No se pudo generar el mapa de localización:', err); return null; }
    finally { locator.remove(); host.remove(); }
  }
  function scaleBar(page, font, bold, denominator) {
    var frameWidthPoints = mapFrame.width, frameWidthMeters = frameWidthPoints / 72 * .0254;
    var representedKm = frameWidthMeters * denominator / 1000;
    var targetKm = representedKm * 220 / frameWidthPoints;
    var power = Math.pow(10, Math.floor(Math.log10(Math.max(targetKm, .001))));
    var km = 5 * power <= targetKm ? 5 * power : 2 * power <= targetKm ? 2 * power : power;
    var barWidth = frameWidthPoints * km / representedKm, x = 892.5 + (290.4 - barWidth) / 2, y = 792 - (319.6 + 36);
    var scaleLabel = '1:' + Math.round(denominator).toLocaleString('es-CO');
    var labelX = 1037.7 - font.widthOfTextAtSize('Escala ' + scaleLabel, 11) / 2;
    page.drawText('Escala ' + scaleLabel, { x: labelX, y: y + 5, size: 11, font: bold });
    var segments = 4, segmentWidth = barWidth / segments, barY = y - 13;
    for (var i = 0; i < segments; i++) page.drawRectangle({ x: x + i * segmentWidth, y: barY, width: segmentWidth, height: 7, color: i % 2 === 0 ? PDF.rgb(.08, .1, .11) : PDF.rgb(1, 1, 1), borderColor: PDF.rgb(.08, .1, .11), borderWidth: .55 });
    page.drawLine({ start: { x: x, y: barY - 1 }, end: { x: x, y: barY + 9 }, thickness: .7, color: PDF.rgb(.08, .1, .11) });
    page.drawLine({ start: { x: x + barWidth, y: barY - 1 }, end: { x: x + barWidth, y: barY + 9 }, thickness: .7, color: PDF.rgb(.08, .1, .11) });
    page.drawText('0', { x: x - 2, y: barY - 12, size: 8, font: font }); page.drawText(km + ' km', { x: x + barWidth - font.widthOfTextAtSize(km + ' km', 8), y: barY - 12, size: 8, font: font });
  }
  function drawNorthSymbol(page, font, bold, style) {
    var x = mapFrame.x + mapFrame.width - 42, y = 708;
    var ink = PDF.rgb(.06, .12, .15), pale = PDF.rgb(.45, .56, .58), red = PDF.rgb(.68, .2, .16), white = PDF.rgb(1, 1, 1);
    function nLabel(offset) { page.drawText('N', { x: x - 4.6, y: y + offset, size: 13, font: bold, color: ink }); }
    function northTip(color, width, height, baseY) {
      page.drawSvgPath('M 0 ' + height + ' L ' + width + ' 0 L 0 5 L -' + width + ' 0 Z', { x: x, y: y + baseY, color: color });
    }
    if (style === 'minimal') {
      nLabel(25);
      page.drawLine({ start: { x: x, y: y - 24 }, end: { x: x, y: y + 4 }, thickness: 2.8, color: ink });
      northTip(ink, 9, 19, -9);
      return;
    }
    page.drawCircle({ x: x, y: y, size: 30, color: white, opacity: .97, borderColor: ink, borderWidth: 1 });
    page.drawCircle({ x: x, y: y, size: 24, borderColor: pale, borderWidth: .55 });
    nLabel(16);
    if (style === 'classic') {
      page.drawLine({ start: { x: x, y: y - 20 }, end: { x: x, y: y + 4 }, thickness: 2.4, color: ink });
      northTip(ink, 9, 18, -10);
      page.drawSvgPath('M 0 -17 L 7 0 L 0 -5 L -7 0 Z', { x: x, y: y, color: red });
      page.drawCircle({ x: x, y: y - 1, size: 2.2, color: white, borderColor: ink, borderWidth: .8 });
      return;
    }
    if (style === 'rose') {
      northTip(ink, 8, 18, -10);
      page.drawSvgPath('M 0 -18 L 7 0 L 0 -5 L -7 0 Z', { x: x, y: y, color: red });
      page.drawSvgPath('M 18 0 L 0 7 L 5 0 L 0 -7 Z', { x: x, y: y, color: ink });
      page.drawSvgPath('M -18 0 L 0 7 L -5 0 L 0 -7 Z', { x: x, y: y, color: ink });
      page.drawCircle({ x: x, y: y, size: 2.3, color: white, borderColor: ink, borderWidth: .8 });
      return;
    }
    // Rosa náutica: ocho puntas alternas dentro de dos aros concéntricos.
    northTip(ink, 8, 18, -10);
    page.drawSvgPath('M 0 -18 L 6 0 L 0 -5 L -6 0 Z', { x: x, y: y, color: red });
    page.drawSvgPath('M 18 0 L 0 6 L 5 0 L 0 -6 Z', { x: x, y: y, color: ink });
    page.drawSvgPath('M -18 0 L 0 6 L -5 0 L 0 -6 Z', { x: x, y: y, color: ink });
    [[-13, -13, -4, -4], [13, -13, 4, -4], [-13, 13, -4, 4], [13, 13, 4, 4]].forEach(function (ray) {
      page.drawLine({ start: { x: x + ray[0], y: y + ray[1] }, end: { x: x + ray[2], y: y + ray[3] }, thickness: 1.2, color: pale });
    });
    page.drawCircle({ x: x, y: y, size: 2.3, color: white, borderColor: ink, borderWidth: .8 });
  }
  async function buildPdf(source) {
    if (!PDF) throw new Error('No se cargó pdf-lib; revisa la conexión e inténtalo otra vez.');
    var templateResponse = await fetch(new URL('Layout.pdf', document.baseURI));
    if (!templateResponse.ok) throw new Error('No se encontró Layout.pdf junto al geovisor.');
    var doc = await PDF.PDFDocument.load(await templateResponse.arrayBuffer());
    var page = doc.getPages()[0], regular = await doc.embedFont(PDF.StandardFonts.Helvetica), bold = await doc.embedFont(PDF.StandardFonts.HelveticaBold);
    var art = artwork(source);
    var mapImage = await doc.embedPng(art.canvas.toDataURL('image/png'));
    page.drawImage(mapImage, { x: mapFrame.x, y: 792 - art.frameTop - art.frameHeight, width: mapFrame.width, height: art.frameHeight });
    if (document.getElementById('export-grid').checked) drawPdfGrid(page, regular, source, art);
    page.drawLine({ start: { x: labelDividerX, y: 34.8 }, end: { x: labelDividerX, y: 760.8 }, thickness: 1.8, color: PDF.rgb(.05, .07, .08) });
    var center = map.getCenter(), mpp = 156543.03392 * Math.cos(center.lat * Math.PI / 180) / Math.pow(2, map.getZoom());
    var cssPixelsAcrossCrop = art.cropWidth * map.getSize().x / source.width;
    var denominator = mpp * cssPixelsAcrossCrop / (mapFrame.width / 72 * .0254);

    // Se aprovechan las cinco zonas existentes de la plantilla, conservando sus líneas y el logo.
    var meta = { x: 892.5, top: 164.7, width: 290.4, height: 154.9 };
    var scale = { x: 892.5, top: 319.6, width: 290.4, height: 74.6 };
    var legend = { x: 892.5, top: 394.2, width: 290.4, height: 254.5 };
    var footer = { x: 892.5, top: 648.7, width: 290.4, height: 108.5 };
    textBox(page, document.getElementById('export-faculty').value, bold, { x: meta.x, top: meta.top + 8, width: meta.width, height: 44 }, { size: 13, min: 8, center: true });
    textBox(page, document.getElementById('export-program').value, bold, { x: meta.x, top: meta.top + 53, width: meta.width, height: 39 }, { size: 12, min: 8, center: true });
    textBox(page, document.getElementById('export-title').value, bold, { x: meta.x, top: meta.top + 96, width: meta.width, height: 52 }, { size: 16, min: 8, center: true, color: PDF.rgb(.05, .26, .3) });
    scaleBar(page, regular, bold, denominator);

    page.drawText('Leyenda', { x: 906, y: 792 - (legend.top + 23), size: 13, font: bold });
    var entries = legendEntries(), includeLocator = document.getElementById('export-locator').checked;
    var rowTop = legend.top + 31, reserved = includeLocator ? 100 : 12;
    var rowH = entries.length ? Math.min(includeLocator ? 18 : 24, (legend.height - 39 - reserved) / entries.length) : 18;
    rowH = Math.max(7, rowH);
    entries.forEach(function (entry, i) {
      var y = 792 - (rowTop + i * rowH + 13), style = entry.style || {}, stroke = color(style.color || style.fillColor), fill = color(style.fillColor || style.color);
      if (entry.kind === 'point') page.drawCircle({ x: 917, y: y + 4, size: 4, color: fill, borderColor: stroke, borderWidth: 1 });
      else if (entry.kind === 'line') page.drawLine({ start: { x: 907, y: y + 4 }, end: { x: 927, y: y + 4 }, thickness: Math.max(1, Math.min(4, style.weight || 2)), color: stroke });
      else page.drawRectangle({ x: 907, y: y, width: 19, height: 9, color: fill, borderColor: stroke, borderWidth: 1 });
      textBox(page, entry.name, regular, { x: 932, top: rowTop + i * rowH, width: 241, height: rowH }, { size: 9.5, min: 6, pad: 2 });
    });
    if (includeLocator) {
      var locatorTop = rowTop + entries.length * rowH + 5, availableH = legend.top + legend.height - locatorTop - 9;
      if (availableH >= 52) {
        var data = await locatorPng(center, map.getBounds());
        if (data) { var loc = await doc.embedPng(data), ratio = Math.min(260 / loc.width, availableH / loc.height); page.drawImage(loc, { x: 907, y: 792 - locatorTop - loc.height * ratio, width: loc.width * ratio, height: loc.height * ratio }); }
      }
    }
    textBox(page, 'Fuente: ' + (document.getElementById('export-source').value.trim() || 'Sin especificar'), regular, { x: footer.x, top: footer.top + 5, width: footer.width, height: 47 }, { size: 10, min: 8, center: true });
    textBox(page, 'Autor: ' + document.getElementById('export-author').value, regular, { x: footer.x, top: footer.top + 54, width: footer.width, height: 47 }, { size: 10, min: 8, center: true });

    // Brújula norte vectorial con halo blanco para que contraste con cualquier mapa base.
    drawNorthSymbol(page, regular, bold, document.getElementById('export-north-style').value);

    var bytes = await doc.save(), blob = new Blob([bytes], { type: 'application/pdf' }), url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'Mapa_JuanMina_' + stamp() + '.pdf'; link.click(); setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    return Math.round(denominator);
  }
  button.addEventListener('click', function (event) {
    event.preventDefault(); event.stopImmediatePropagation();
    if (!window.leafletImage) { status.textContent = 'No está disponible la captura Leaflet.'; return; }
    button.disabled = true; status.textContent = 'Centrando las capas visibles y preparando la exportación…';
    var previousCenter = map.getCenter(), previousZoom = map.getZoom();
    try {
      (async function () {
        try {
          focusBoundsForExport();
          await waitForMapTiles();
          var canvas = await captureMap();
          if (format.value === 'png') {
            var png = document.getElementById('export-grid').checked ? artworkPngWithGrid(canvas) : artwork(canvas).canvas, pngLink = document.createElement('a');
            pngLink.href = png.toDataURL('image/png'); pngLink.download = 'Mapa_JuanMina_' + stamp() + '.png'; pngLink.click();
            status.textContent = 'Imagen PNG centrada y encajada dentro del marco.';
            if (typeof say === 'function') say('Imagen PNG del mapa descargada correctamente.');
            return;
          }
          var denominator = await buildPdf(canvas);
          status.textContent = 'PDF centrado en el límite · escala 1:' + denominator.toLocaleString('es-CO') + ' · página 1224 × 792 pt.';
          if (typeof say === 'function') say('Mapa PDF descargado correctamente.');
        } catch (err) {
          console.error('Exportación del mapa:', err);
          status.textContent = 'No se pudo crear el archivo: ' + (err.message || err);
        } finally {
          map.setView(previousCenter, previousZoom, { animate: false });
          await waitForMapTiles();
          button.disabled = false;
        }
      })();
    } catch (err) {
      map.setView(previousCenter, previousZoom, { animate: false });
      button.disabled = false;
      status.textContent = 'No se pudo preparar la exportación: ' + err.message;
    }
  }, true);
})();
