import { $ } from "../../../lib/lib.js";

export const RdeDashboard = () => {
    let dashData = null;
    let statsRow;
    let chartsArea;
    let currentFilter = null;
    let filterButtons = [];

    const COLORS = ['#00bcd4', '#4caf50', '#ff9800', '#e91e63', '#9c27b0',
        '#2196f3', '#009688', '#ff5722', '#ffeb3b', '#607d8b'];

    const createFilterUI = () => {
        const filterContainer = $({
            tag: 'div', style: {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e8e8e8',
                marginBottom: '16px',
                flexWrap: 'wrap'
            }, child: []
        });

        // Label
        const label = $({
            tag: 'span',
            text: 'Filter:',
            style: {
                color: '#555',
                fontSize: '12px',
                fontWeight: '600',
                marginRight: '4px'
            }
        });
        filterContainer.appendChild(label);

        // Filter buttons
        const filters = [
            { id: null, label: 'All Research' },
            { id: 'extension', label: '🌱 Extension' },
            { id: 'inhouse', label: '📋 In-House Review' },
            { id: 'symposium', label: '🎤 Symposium' },
            { id: 'undergraduate', label: '🎓 Undergraduate' },
            { id: 'graduate', label: '👨‍🎓 Graduate' }
        ];

        filters.forEach(filter => {
            const btn = $({
                tag: 'button',
                text: filter.label,
                style: {
                    padding: '6px 14px',
                    backgroundColor: currentFilter === filter.id ? '#4caf50' : 'transparent',
                    color: currentFilter === filter.id ? '#ffffff' : '#555',
                    border: `1px solid ${currentFilter === filter.id ? '#4caf50' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: currentFilter === filter.id ? '600' : '400',
                    fontFamily: 'Segoe UI, sans-serif',
                    transition: 'all 0.3s ease',
                    whiteSpace: 'nowrap'
                },
                event: {
                    type: 'click',
                    method: () => {
                        currentFilter = filter.id;
                        // Update button styles
                        filterButtons.forEach(btn => {
                            btn.style.backgroundColor = 'transparent';
                            btn.style.color = '#555';
                            btn.style.borderColor = '#e0e0e0';
                            btn.style.fontWeight = '400';
                        });
                        btn.style.backgroundColor = '#4caf50';
                        btn.style.color = '#ffffff';
                        btn.style.borderColor = '#4caf50';
                        btn.style.fontWeight = '600';
                        // Refetch data with filter
                        fetchData();
                    }
                },
                mouseenter: (e) => {
                    if (currentFilter !== filter.id) {
                        e.target.style.borderColor = '#4caf50';
                        e.target.style.backgroundColor = 'rgba(76,175,80,0.05)';
                    }
                },
                mouseleave: (e) => {
                    if (currentFilter !== filter.id) {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.backgroundColor = 'transparent';
                    }
                }
            });
            filterButtons.push(btn);
            filterContainer.appendChild(btn);
        });

        return filterContainer;
    };

    const fetchData = async () => {
        try {
            const fd = new FormData();
            fd.append('action', 'stats');
            if (currentFilter) {
                fd.append('filter', currentFilter);
            }
            const res = await fetch('/dashboard', { method: 'POST', body: fd });
            const json = await res.json();
            if (json.success) {
                dashData = json.data;
                renderStats();
                renderCharts();
            }
        } catch (e) {
            console.error('Dashboard fetch error:', e);
        }
    };

    const statCard = (label, value, icon, color, sub) => {
        return $({
            tag: 'div',
            style: {
                flex: '1', 
                minWidth: '150px',
                background: '#ffffff',
                borderRadius: '16px', 
                padding: '20px',
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                display: 'flex', 
                flexDirection: 'column', 
                gap: '10px',
                position: 'relative', 
                overflow: 'hidden',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer'
            },
            child: [
                // glow circle
                $({
                    tag: 'div', style: {
                        position: 'absolute', top: '-24px', right: '-24px',
                        width: '80px', height: '80px', borderRadius: '50%',
                        background: `${color}10`, 
                        pointerEvents: 'none',
                        transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }),
                // top row: label + icon
                $({
                    tag: 'div', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }, child: [
                        $({
                            tag: 'div', style: { display: 'flex', flexDirection: 'column', gap: '4px' }, child: [
                                $({ 
                                    tag: 'span', 
                                    text: label, 
                                    style: { 
                                        color: '#888', 
                                        fontSize: '13px', 
                                        fontWeight: '600', 
                                        textTransform: 'uppercase', 
                                        letterSpacing: '0.8px',
                                        transition: 'color 0.3s ease'
                                    } 
                                }),
                                $({ 
                                    tag: 'span', 
                                    text: String(value), 
                                    style: { 
                                        color: '#1a1a2e', 
                                        fontSize: '30px', 
                                        fontWeight: '800', 
                                        lineHeight: '1', 
                                        fontFamily: 'Segoe UI,sans-serif',
                                        transition: 'color 0.3s ease, transform 0.3s ease'
                                    } 
                                })
                            ]
                        }),
                        $({ 
                            tag: 'span', 
                            att: { className: `fa-solid ${icon}` }, 
                            style: { 
                                fontSize: '26px', 
                                color, 
                                opacity: '0.8',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                            } 
                        })
                    ]
                }),
                $({ 
                    tag: 'span', 
                    text: sub || '', 
                    style: { 
                        color: '#aaa', 
                        fontSize: '12px',
                        transition: 'color 0.3s ease'
                    } 
                }),
                // Bottom accent bar
                $({
                    tag: 'div',
                    style: {
                        position: 'absolute', 
                        bottom: '0', 
                        left: '0', 
                        right: '0',
                        height: '4px',
                        background: `linear-gradient(90deg, ${color}, ${color}66)`,
                        opacity: '0.25',
                        borderRadius: '0 0 16px 16px',
                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                }),
                // Shine effect overlay (hidden by default)
                $({
                    tag: 'div',
                    style: {
                        position: 'absolute',
                        top: '-50%',
                        left: '-50%',
                        width: '200%',
                        height: '200%',
                        background: `linear-gradient(45deg, transparent 30%, ${color}08 50%, transparent 70%)`,
                        transform: 'rotate(45deg) translateX(-100%)',
                        transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                        pointerEvents: 'none'
                    }
                })
            ],
            // Hover effects
            mouseenter: (e) => {
                const card = e.currentTarget;
                const glowCircle = card.querySelector('div:first-child');
                const icon = card.querySelector('.fa-solid');
                const value = card.querySelector('span:last-child');
                const accentBar = card.querySelectorAll('div')[2];
                
                // Card lift and shadow
                card.style.boxShadow = `0 8px 32px ${color}25, 0 4px 16px rgba(0,0,0,0.06)`;
                card.style.transform = 'translateY(-6px) scale(1.01)';
                card.style.borderColor = color;
                
                // Glow circle expansion
                if (glowCircle) {
                    glowCircle.style.transform = 'scale(1.5)';
                    glowCircle.style.background = `${color}18`;
                }
                
                // Icon animation
                if (icon) {
                    icon.style.transform = 'scale(1.15) rotate(-5deg)';
                    icon.style.opacity = '1';
                }
                
                // Value color change
                if (value) {
                    value.style.color = color;
                }
                
                // Accent bar
                if (accentBar) {
                    accentBar.style.opacity = '0.8';
                    accentBar.style.height = '5px';
                }
                
                // Shine effect
                const shine = card.querySelectorAll('div')[3];
                if (shine) {
                    shine.style.transform = 'rotate(45deg) translateX(50%)';
                }
            },
            mouseleave: (e) => {
                const card = e.currentTarget;
                const glowCircle = card.querySelector('div:first-child');
                const icon = card.querySelector('.fa-solid');
                const value = card.querySelector('span:last-child');
                const accentBar = card.querySelectorAll('div')[2];
                
                // Reset card
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                card.style.transform = 'translateY(0) scale(1)';
                card.style.borderColor = '#e8e8e8';
                
                // Reset glow circle
                if (glowCircle) {
                    glowCircle.style.transform = 'scale(1)';
                    glowCircle.style.background = `${color}10`;
                }
                
                // Reset icon
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                    icon.style.opacity = '0.8';
                }
                
                // Reset value
                if (value) {
                    value.style.color = '#1a1a2e';
                }
                
                // Reset accent bar
                if (accentBar) {
                    accentBar.style.opacity = '0.25';
                    accentBar.style.height = '4px';
                }
                
                // Reset shine
                const shine = card.querySelectorAll('div')[3];
                if (shine) {
                    shine.style.transform = 'rotate(45deg) translateX(-100%)';
                }
            }
        });
    };

    const lineChart = (title, items, labelKey) => {
        const max = Math.max(...items.map(i => i.count), 1);
        const min = Math.min(...items.map(i => i.count), 0);
        const range = max - min || 1;
        const padding = 25;
        const chartWidth = 500;
        const chartHeight = 160;
        
        const points = items.map((item, idx) => {
            const x = padding + (idx / (items.length - 1 || 1)) * (chartWidth - padding * 2);
            const y = chartHeight - padding - ((item.count - min) / range) * (chartHeight - padding * 2);
            return { x, y, count: item.count, label: item[labelKey] || '' };
        });

        // ─── Catmull-Rom spline interpolation ────────────────────────────────────
        const catmullRomSpline = (pts, segments = 15) => {
            if (pts.length < 2) return pts.map(p => `${p.x},${p.y}`).join(' ');
            
            const result = [];
            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i === 0 ? 0 : i - 1];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[i === pts.length - 2 ? pts.length - 1 : i + 2];
                
                for (let t = 0; t <= 1; t += 1/segments) {
                    const t2 = t * t;
                    const t3 = t2 * t;
                    
                    const x = 0.5 * (
                        (2 * p1.x) +
                        (-p0.x + p2.x) * t +
                        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
                    );
                    
                    const y = 0.5 * (
                        (2 * p1.y) +
                        (-p0.y + p2.y) * t +
                        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
                    );
                    
                    result.push({ x, y });
                }
            }
            return result;
        };

        // Generate smooth points
        const smoothPoints = points.length >= 2 ? catmullRomSpline(points) : points;

        // Build SVG
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', chartWidth);
        svg.setAttribute('height', chartHeight + 35);
        svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight + 35}`);
        svg.style.width = '100%';
        svg.style.height = 'auto';
        svg.style.maxWidth = '100%';

        // Gradient definition for area fill
        const defs = document.createElementNS(svgNS, 'defs');
        
        // Area gradient
        const areaGradient = document.createElementNS(svgNS, 'linearGradient');
        areaGradient.setAttribute('id', 'areaGradient');
        areaGradient.setAttribute('x1', '0%');
        areaGradient.setAttribute('y1', '0%');
        areaGradient.setAttribute('x2', '0%');
        areaGradient.setAttribute('y2', '100%');
        
        const stop1 = document.createElementNS(svgNS, 'stop');
        stop1.setAttribute('offset', '0%');
        stop1.setAttribute('stop-color', '#4caf50');
        stop1.setAttribute('stop-opacity', '0.3');
        areaGradient.appendChild(stop1);
        
        const stop2 = document.createElementNS(svgNS, 'stop');
        stop2.setAttribute('offset', '100%');
        stop2.setAttribute('stop-color', '#4caf50');
        stop2.setAttribute('stop-opacity', '0.02');
        areaGradient.appendChild(stop2);
        
        defs.appendChild(areaGradient);
        svg.appendChild(defs);

        // Grid lines (horizontal) - fewer lines
        const gridLines = 3;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i / gridLines) * (chartHeight - padding * 2);
            const gridLine = document.createElementNS(svgNS, 'line');
            gridLine.setAttribute('x1', padding);
            gridLine.setAttribute('y1', y);
            gridLine.setAttribute('x2', chartWidth - padding);
            gridLine.setAttribute('y2', y);
            gridLine.setAttribute('stroke', '#f0f0f0');
            gridLine.setAttribute('stroke-width', '0.5');
            gridLine.setAttribute('stroke-dasharray', '3,3');
            svg.appendChild(gridLine);
        }

        // Area fill (using smooth points)
        if (smoothPoints.length > 1) {
            const areaPoints = smoothPoints.map(p => `${p.x},${p.y}`).join(' ');
            const startX = points[0]?.x || padding;
            const endX = points[points.length - 1]?.x || chartWidth - padding;
            
            const areaPath = document.createElementNS(svgNS, 'path');
            areaPath.setAttribute('d', `M ${startX},${chartHeight - padding} L ${areaPoints} L ${endX},${chartHeight - padding} Z`);
            areaPath.setAttribute('fill', 'url(#areaGradient)');
            areaPath.setAttribute('opacity', '1');
            areaPath.setAttribute('stroke', 'none');
            svg.appendChild(areaPath);
        }

        // Smooth line path
        if (smoothPoints.length > 1) {
            const linePath = document.createElementNS(svgNS, 'path');
            const pathData = smoothPoints.map((p, i) => {
                return i === 0 ? `M ${p.x},${p.y}` : `L ${p.x},${p.y}`;
            }).join(' ');
            linePath.setAttribute('d', pathData);
            linePath.setAttribute('fill', 'none');
            linePath.setAttribute('stroke', '#4caf50');
            linePath.setAttribute('stroke-width', '2');
            linePath.setAttribute('stroke-linecap', 'round');
            linePath.setAttribute('stroke-linejoin', 'round');
            svg.appendChild(linePath);
        }

        // Data points with always-visible value labels (smaller)
        points.forEach((p, idx) => {
            // Value label background (pill shape) - smaller
            const labelBg = document.createElementNS(svgNS, 'rect');
            const labelWidth = 22;
            const labelHeight = 16;
            const labelX = p.x - labelWidth / 2;
            const labelY = p.y - 22;
            labelBg.setAttribute('x', labelX);
            labelBg.setAttribute('y', labelY);
            labelBg.setAttribute('width', labelWidth);
            labelBg.setAttribute('height', labelHeight);
            labelBg.setAttribute('rx', '8');
            labelBg.setAttribute('fill', '#4caf50');
            labelBg.setAttribute('opacity', '0.12');
            svg.appendChild(labelBg);

            // Value label text (always visible) - smaller font
            const valueLabel = document.createElementNS(svgNS, 'text');
            valueLabel.setAttribute('x', p.x);
            valueLabel.setAttribute('y', p.y - 10);
            valueLabel.setAttribute('text-anchor', 'middle');
            valueLabel.setAttribute('fill', '#2e7d32');
            valueLabel.setAttribute('font-size', '9');
            valueLabel.setAttribute('font-weight', '700');
            valueLabel.setAttribute('font-family', 'Segoe UI, sans-serif');
            valueLabel.textContent = p.count;
            valueLabel.style.pointerEvents = 'none';
            svg.appendChild(valueLabel);

            // Circle - smaller
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', p.x);
            circle.setAttribute('cy', p.y);
            circle.setAttribute('r', '3.5');
            circle.setAttribute('fill', '#ffffff');
            circle.setAttribute('stroke', '#4caf50');
            circle.setAttribute('stroke-width', '2');
            circle.style.cursor = 'pointer';
            circle.style.transition = 'all 0.3s ease';
            
            // Hover effects for circle
            circle.addEventListener('mouseenter', () => {
                circle.setAttribute('r', '6');
                circle.setAttribute('fill', '#4caf50');
                circle.setAttribute('stroke', '#2e7d32');
                circle.setAttribute('stroke-width', '2.5');
                
                // Highlight value label
                valueLabel.setAttribute('fill', '#1a1a2e');
                valueLabel.setAttribute('font-size', '10');
                labelBg.setAttribute('fill', '#4caf50');
                labelBg.setAttribute('opacity', '0.25');
            });
            circle.addEventListener('mouseleave', () => {
                circle.setAttribute('r', '3.5');
                circle.setAttribute('fill', '#ffffff');
                circle.setAttribute('stroke', '#4caf50');
                circle.setAttribute('stroke-width', '2');
                
                // Reset value label
                valueLabel.setAttribute('fill', '#2e7d32');
                valueLabel.setAttribute('font-size', '9');
                labelBg.setAttribute('fill', '#4caf50');
                labelBg.setAttribute('opacity', '0.12');
            });
            
            // Tooltip on hover (additional info)
            const tooltip = document.createElementNS(svgNS, 'title');
            tooltip.textContent = `${p.label}: ${p.count} research papers`;
            circle.appendChild(tooltip);
            svg.appendChild(circle);

            // Labels (years) at bottom - smaller
            const label = document.createElementNS(svgNS, 'text');
            label.setAttribute('x', p.x);
            label.setAttribute('y', chartHeight + 8);
            label.setAttribute('text-anchor', 'middle');
            label.setAttribute('fill', '#999');
            label.setAttribute('font-size', '8');
            label.setAttribute('font-family', 'Segoe UI, sans-serif');
            label.textContent = p.label;
            svg.appendChild(label);
        });

        // Animate the line drawing
        const style = document.createElementNS(svgNS, 'style');
        style.textContent = `
            @keyframes drawLine {
                from {
                    stroke-dashoffset: 1000;
                }
                to {
                    stroke-dashoffset: 0;
                }
            }
            .line-path {
                stroke-dasharray: 1000;
                animation: drawLine 1.2s ease-in-out forwards;
            }
        `;
        svg.appendChild(style);

        // Add class to line path for animation
        const linePaths = svg.querySelectorAll('path[stroke="#4caf50"]');
        linePaths.forEach(path => {
            path.classList.add('line-path');
        });

        return $({
            tag: 'div', style: {
                background: '#ffffff', borderRadius: '12px', padding: '12px 16px',
                border: '1px solid #e8e8e8', flex: '1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }, child: [
                $({ 
                    tag: 'span', 
                    text: title, 
                    style: { 
                        color: '#555', 
                        fontSize: '11px', 
                        fontWeight: '600', 
                        display: 'block', 
                        marginBottom: '10px' 
                    } 
                }),
                $({ 
                    tag: 'div', 
                    style: { 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        width: '100%',
                        overflow: 'hidden'
                    }, 
                    child: [svg] 
                })
            ]
        });
    };

    const multiLineChart = (title, data) => {
        if (!data || data.length === 0) {
            return $({
                tag: 'div', style: {
                    background: '#ffffff', borderRadius: '12px', padding: '12px 16px',
                    border: '1px solid #e8e8e8', flex: '1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    minHeight: '150px'
                }, child: [
                    $({ tag: 'span', text: 'No data available', style: { color: '#999', fontSize: '12px' } })
                ]
            });
        }

        const researchData = dashData?.campusCenterByYear || data;

        const campusColor = '#2196f3';
        const centerColor = '#ff9800';
        const padding = 30;
        const chartWidth = 500;
        const chartHeight = 150;

        const max = Math.max(...researchData.map(d => Math.max(d.campus || 0, d.center || 0)), 1);
        const xStep = (chartWidth - padding * 2) / ((researchData.length - 1) || 1);
        const xAt = (i) => padding + i * xStep;
        const yAt = (v) => chartHeight - padding - (v / max) * (chartHeight - padding * 2);

        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('viewBox', `0 0 ${chartWidth} ${chartHeight + 40}`);
        svg.style.width = '100%';
        svg.style.height = 'auto';

        // grid lines (top, middle, baseline)
        [0, 0.5, 1].forEach(f => {
            const y = padding + f * (chartHeight - padding * 2);
            const line = document.createElementNS(svgNS, 'line');
            line.setAttribute('x1', padding);
            line.setAttribute('y1', y);
            line.setAttribute('x2', chartWidth - padding);
            line.setAttribute('y2', y);
            line.setAttribute('stroke', '#f0f0f0');
            line.setAttribute('stroke-dasharray', '3,3');
            svg.appendChild(line);
        });

        // Catmull-Rom spline interpolation
        const catmullRomSpline = (pts, segments = 20) => {
            if (pts.length < 2) return pts;
            const result = [];
            for (let i = 0; i < pts.length - 1; i++) {
                const p0 = pts[i === 0 ? 0 : i - 1];
                const p1 = pts[i];
                const p2 = pts[i + 1];
                const p3 = pts[i === pts.length - 2 ? pts.length - 1 : i + 2];
                for (let t = 0; t <= 1; t += 1/segments) {
                    const t2 = t * t;
                    const t3 = t2 * t;
                    result.push({
                        x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
                        y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
                    });
                }
            }
            return result;
        };

        const drawSeries = (key, color, label) => {
            const points = researchData.map((d, i) => ({ x: xAt(i), y: yAt(d[key] || 0), val: d[key] || 0 }));
            
            // Generate smooth curve points
            const smoothPts = points.length >= 2 ? catmullRomSpline(points) : points;

            // Area fill (subtle gradient under the curve)
            if (smoothPts.length > 1) {
                const areaPts = smoothPts.map(p => `${p.x},${p.y}`).join(' ');
                const area = document.createElementNS(svgNS, 'path');
                area.setAttribute('d', `M ${smoothPts[0].x},${chartHeight - padding} L ${areaPts} L ${smoothPts[smoothPts.length-1].x},${chartHeight - padding} Z`);
                area.setAttribute('fill', color);
                area.setAttribute('opacity', '0.08');
                area.setAttribute('stroke', 'none');
                svg.appendChild(area);
            }

            // Smooth curved line
            if (smoothPts.length > 1) {
                const pathData = smoothPts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x},${p.y}`).join(' ');
                const path = document.createElementNS(svgNS, 'path');
                path.setAttribute('d', pathData);
                path.setAttribute('fill', 'none');
                path.setAttribute('stroke', color);
                path.setAttribute('stroke-width', '2.5');
                path.setAttribute('stroke-linecap', 'round');
                path.setAttribute('stroke-linejoin', 'round');
                svg.appendChild(path);
            }

            // Data points with labels
            points.forEach(p => {
                // Value label background
                const bg = document.createElementNS(svgNS, 'rect');
                const bw = 24, bh = 18;
                bg.setAttribute('x', p.x - bw/2);
                bg.setAttribute('y', p.y - 28);
                bg.setAttribute('width', bw);
                bg.setAttribute('height', bh);
                bg.setAttribute('rx', '9');
                bg.setAttribute('fill', color);
                bg.setAttribute('opacity', '0.12');
                svg.appendChild(bg);

                // Value label text
                const text = document.createElementNS(svgNS, 'text');
                text.setAttribute('x', p.x);
                text.setAttribute('y', p.y - 15);
                text.setAttribute('text-anchor', 'middle');
                text.setAttribute('fill', color);
                text.setAttribute('font-size', '9');
                text.setAttribute('font-weight', '700');
                text.textContent = p.val;
                svg.appendChild(text);

                // Circle
                const circle = document.createElementNS(svgNS, 'circle');
                circle.setAttribute('cx', p.x);
                circle.setAttribute('cy', p.y);
                circle.setAttribute('r', '4.5');
                circle.setAttribute('fill', color);
                circle.setAttribute('stroke', '#fff');
                circle.setAttribute('stroke-width', '1.5');
                const tip = document.createElementNS(svgNS, 'title');
                tip.textContent = `${label}: ${p.val}`;
                circle.appendChild(tip);
                svg.appendChild(circle);
            });
        };

        drawSeries('campus', campusColor, 'Campus');
        drawSeries('center', centerColor, 'Center');

        // year labels
        researchData.forEach((d, i) => {
            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', xAt(i));
            text.setAttribute('y', chartHeight + 5);
            text.setAttribute('text-anchor', 'middle');
            text.setAttribute('fill', '#999');
            text.setAttribute('font-size', '9');
            text.textContent = d.year;
            svg.appendChild(text);
        });

        // legend
        const legendY = chartHeight + 25;
        [['Campus', campusColor, -60], ['Center', centerColor, 10]].forEach(([label, color, offset]) => {
            const rect = document.createElementNS(svgNS, 'rect');
            rect.setAttribute('x', chartWidth / 2 + offset);
            rect.setAttribute('y', legendY);
            rect.setAttribute('width', 10);
            rect.setAttribute('height', 10);
            rect.setAttribute('fill', color);
            svg.appendChild(rect);

            const text = document.createElementNS(svgNS, 'text');
            text.setAttribute('x', chartWidth / 2 + offset + 14);
            text.setAttribute('y', legendY + 9);
            text.setAttribute('fill', '#555');
            text.setAttribute('font-size', '9');
            text.textContent = label;
            svg.appendChild(text);
        });

        return $({
            tag: 'div', style: {
                background: '#ffffff', borderRadius: '12px', padding: '12px 16px',
                border: '1px solid #e8e8e8', flex: '1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }, child: [
                $({ tag: 'span', text: title, style: { color: '#555', fontSize: '11px', fontWeight: '600', display: 'block', marginBottom: '10px' } }),
                $({ tag: 'div', style: { display: 'flex', justifyContent: 'center' }, child: [svg] })
            ]
        });
    };

    const campusBarChart = (title, items, labelKey, extensionData) => {
        let isExtensionView = false;
        let campusData = items || [];
        let extData = extensionData || [];

        const max = Math.max(...campusData.map(i => i.count), 1);

        const getDisplayName = (name) => {
            if (!name) return '';
            if (name.length > 25) {
                return name.substring(0, 25) + '...';
            }
            return name;
        };

        const renderBars = (data) => {
            if (!data || data.length === 0) {
                return [$({
                    tag: 'div', style: {
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        padding: '20px 0',
                        color: '#999',
                        fontSize: '12px'
                    }, text: 'No data available'
                })];
            }

            const maxVal = Math.max(...data.map(i => i.count), 1);
            
            return data.map((item, idx) => {
                const pct = Math.round((item.count / maxVal) * 100);
                const color = COLORS[idx % COLORS.length];
                const fullName = item[labelKey] || '';
                const displayName = getDisplayName(fullName);

                return $({
                    tag: 'div', style: { 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        flex: '1', 
                        minWidth: '50px', 
                        maxWidth: '80px',
                        gap: '6px' 
                    }, child: [
                        $({ 
                            tag: 'span', 
                            text: String(item.count), 
                            style: { 
                                color: '#555', 
                                fontSize: '13px', 
                                fontWeight: '700' 
                            } 
                        }),
                        $({
                            tag: 'div', style: { 
                                width: '100%', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'flex-end', 
                                height: '190px' 
                            }, child: [
                                $({
                                    tag: 'div', style: {
                                        width: '100%', 
                                        height: `${pct}%`, 
                                        minHeight: '6px',
                                        background: `linear-gradient(180deg,${color} 0%,${color}77 100%)`,
                                        borderRadius: '50px',
                                        boxShadow: `0 -2px 8px ${color}22`,
                                        transition: 'height 0.6s ease'
                                    }
                                })
                            ]
                        }),
                        $({ 
                            tag: 'span', 
                            text: displayName, 
                            style: { 
                                color: '#999', 
                                fontSize: '10px', 
                                textAlign: 'center', 
                                fontWeight: '600',
                                maxWidth: '70px', 
                                lineHeight: '1.3',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            } 
                        })
                    ]
                });
            });
        };

        // Create the chart container
        const chartContainer = $({
            tag: 'div', style: {
                background: '#ffffff', borderRadius: '14px', padding: '18px 20px',
                border: '1px solid #e8e8e8', flex: '1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                overflow: 'hidden',
                cursor: extData && extData.length > 0 ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
            },
            mouseenter: (e) => {
                if (extData && extData.length > 0) {
                    e.currentTarget.style.borderColor = '#4caf50';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                }
            },
            mouseleave: (e) => {
                if (extData && extData.length > 0) {
                    e.currentTarget.style.borderColor = '#e8e8e8';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                }
            }
        });

        // Title with toggle indicator
        const titleContainer = $({
            tag: 'div', style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px'
            }, child: [
                $({ 
                    tag: 'span', 
                    text: title, 
                    style: { 
                        color: '#555', 
                        fontSize: '14px', 
                        fontWeight: '600' 
                    } 
                }),
                $({ 
                    tag: 'span', 
                    text: extData && extData.length > 0 ? 'Click to toggle' : '', 
                    style: { 
                        color: '#aaa', 
                        fontSize: '10px', 
                        fontWeight: '400',
                        fontStyle: 'italic'
                    } 
                })
            ]
        });

        // Bars container
        const barsContainer = $({
            tag: 'div', style: { 
                display: 'flex', 
                gap: '8px', 
                alignItems: 'flex-end', 
                flexWrap: 'wrap',
                justifyContent: 'center'
            }
        });

        // Initial render
        const currentBars = renderBars(campusData);
        currentBars.forEach(bar => barsContainer.appendChild(bar));

        chartContainer.appendChild(titleContainer);
        chartContainer.appendChild(barsContainer);

        // Only add toggle if extension data exists
        if (extData && extData.length > 0) {
            // Toggle click handler
            chartContainer.addEventListener('click', () => {
                if (!isExtensionView) {
                    // Switch to Extension view
                    if (extData && extData.length > 0) {
                        isExtensionView = true;
                        barsContainer.innerHTML = '';
                        const extBars = renderBars(extData);
                        extBars.forEach(bar => barsContainer.appendChild(bar));
                        
                        // Update title
                        const titleSpan = titleContainer.childNodes[0];
                        const toggleSpan = titleContainer.childNodes[1];
                        titleSpan.textContent = '🌱 Extension by Campus';
                        toggleSpan.textContent = 'Click to return';
                        
                        // Add visual feedback
                        chartContainer.style.borderColor = '#ff9800';
                        chartContainer.style.boxShadow = '0 4px 12px rgba(255,152,0,0.2)';
                    }
                } else {
                    // Switch back to Campus view
                    isExtensionView = false;
                    barsContainer.innerHTML = '';
                    const campusBars = renderBars(campusData);
                    campusBars.forEach(bar => barsContainer.appendChild(bar));
                    
                    // Update title
                    const titleSpan = titleContainer.childNodes[0];
                    const toggleSpan = titleContainer.childNodes[1];
                    titleSpan.textContent = title;
                    toggleSpan.textContent = 'Click to toggle';
                    
                    // Reset visual feedback
                    chartContainer.style.borderColor = '#e8e8e8';
                    chartContainer.style.boxShadow = '0 2px 4px rgba(0,0,0,0.02)';
                }
            });
        }

        return chartContainer;
    };

    const centerBarChart = (title, items, labelKey) => {
        const max = Math.max(...items.map(i => i.count), 1);

        const getAcronym = (name) => {
            if (!name) return '';
            
            // Check if name already has acronym in parentheses
            const match = name.match(/\(([^)]+)\)/);
            if (match) {
                return match[1];
            }
            
            const words = name.split(' ');
            let acronym = '';
            for (let word of words) {
                if (word.length > 0 && word !== 'and' && word !== '&' && word !== 'of' && word !== 'the') {
                    acronym += word[0];
                }
            }
            return acronym.toUpperCase() || name.substring(0, 8);
        };

        const bars = items.map((item, idx) => {
            const pct = Math.round((item.count / max) * 100);
            const color = COLORS[idx % COLORS.length];
            const fullName = item[labelKey] || '';
            const displayName = getAcronym(fullName);

            return $({
                tag: 'div', style: { 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    flex: '1', 
                    minWidth: '50px', 
                    maxWidth: '80px',
                    gap: '6px' 
                }, child: [
                    $({ 
                        tag: 'span', 
                        text: String(item.count), 
                        style: { 
                            color: '#555', 
                            fontSize: '13px', 
                            fontWeight: '700' 
                        } 
                    }),
                    $({
                        tag: 'div', style: { 
                            width: '100%', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'flex-end', 
                            height: '190px' 
                        }, child: [
                            $({
                                tag: 'div', style: {
                                    width: '100%', 
                                    height: `${pct}%`, 
                                    minHeight: '6px',
                                    background: `linear-gradient(180deg,${color} 0%,${color}77 100%)`,
                                    borderRadius: '50px',
                                    boxShadow: `0 -2px 8px ${color}22`,
                                    transition: 'height 0.6s ease'
                                }
                            })
                        ]
                    }),
                    $({ 
                        tag: 'span', 
                        text: displayName, 
                        style: { 
                            color: '#999', 
                            fontSize: '10px', 
                            textAlign: 'center', 
                            fontWeight: '600',
                            maxWidth: '70px', 
                            lineHeight: '1.3',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                        } 
                    })
                ]
            });
        });

        return $({
            tag: 'div', style: {
                background: '#ffffff', borderRadius: '14px', padding: '18px 20px',
                border: '1px solid #e8e8e8', flex: '1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                overflow: 'hidden'
            }, child: [
                $({ 
                    tag: 'span', 
                    text: title, 
                    style: { 
                        color: '#555', 
                        fontSize: '14px', 
                        fontWeight: '600', 
                        display: 'block', 
                        marginBottom: '16px' 
                    } 
                }),
                $({ 
                    tag: 'div', 
                    style: { 
                        display: 'flex', 
                        gap: '8px', 
                        alignItems: 'flex-end', 
                        flexWrap: 'wrap',
                        justifyContent: 'center'
                    }, 
                    child: bars 
                })
            ]
        });
    };

    const donutChart = (title, items, labelKey) => {
        const total = items.reduce((s, i) => s + i.count, 0) || 1;
        const R = 58, cx = 75, cy = 75, strokeW = 26;
        const circ = 2 * Math.PI * R;

        // Build SVG manually
        const svgNS = 'http://www.w3.org/2000/svg';
        const svg = document.createElementNS(svgNS, 'svg');
        svg.setAttribute('width', '150');
        svg.setAttribute('height', '150');
        svg.setAttribute('viewBox', '0 0 150 150');

        // Track (subtle background ring)
        const track = document.createElementNS(svgNS, 'circle');
        track.setAttribute('cx', cx); track.setAttribute('cy', cy);
        track.setAttribute('r', R); track.setAttribute('fill', 'none');
        track.setAttribute('stroke', '#f0f0f0'); track.setAttribute('stroke-width', strokeW);
        svg.appendChild(track);

        let offset = 0;
        const gap = 7; // Visual gap between segments
        items.forEach((item, idx) => {
            const pct = item.count / total;
            const sliceLen = pct * circ;

            const dash = Math.max(0.1, sliceLen - gap - strokeW);
            const dashOff = (-offset * circ + circ * 0.25) - (gap + strokeW) / 2;

            const slice = document.createElementNS(svgNS, 'circle');
            slice.setAttribute('cx', cx); slice.setAttribute('cy', cy);
            slice.setAttribute('r', R); slice.setAttribute('fill', 'none');
            slice.setAttribute('stroke', COLORS[idx % COLORS.length]);
            slice.setAttribute('stroke-width', strokeW);
            slice.setAttribute('stroke-linecap', 'round');
            slice.setAttribute('stroke-dasharray', `${dash} ${circ - dash}`);
            slice.setAttribute('stroke-dashoffset', dashOff);
            svg.appendChild(slice);
            offset += pct;
        });

        // Center text
        const t1 = document.createElementNS(svgNS, 'text');
        t1.setAttribute('x', cx); t1.setAttribute('y', cy - 5);
        t1.setAttribute('text-anchor', 'middle'); t1.setAttribute('fill', '#1a1a2e');
        t1.setAttribute('font-size', '18'); t1.setAttribute('font-weight', '800');
        t1.textContent = String(total);
        svg.appendChild(t1);
        const t2 = document.createElementNS(svgNS, 'text');
        t2.setAttribute('x', cx); t2.setAttribute('y', cy + 13);
        t2.setAttribute('text-anchor', 'middle'); t2.setAttribute('fill', '#aaa');
        t2.setAttribute('font-size', '12'); t2.textContent = 'total';
        svg.appendChild(t2);

        // Legend
        const legendItems = items.map((item, idx) => {
            const lbl = item[labelKey] || '—';
            return $({
                tag: 'div', style: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }, child: [
                    $({ tag: 'div', style: { width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[idx % COLORS.length], flexShrink: '0' } }),
                    $({ tag: 'span', text: `${lbl}: ${item.count}`, style: { color: '#555', fontSize: '11px', lineHeight: '1.3' } })
                ]
            });
        });

        const legend = $({ tag: 'div', style: { display: 'flex', flexDirection: 'column' }, child: legendItems });

        const chartRow = $({ tag: 'div', style: { display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' } });
        chartRow.appendChild(svg);
        chartRow.appendChild(legend);

        return $({
            tag: 'div', style: {
                background: '#ffffff', borderRadius: '14px', padding: '18px 20px',
                border: '1px solid #e8e8e8', flex: '1',
                boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }, child: [
                $({ tag: 'span', text: title, style: { color: '#555', fontSize: '13px', fontWeight: '600', display: 'block', marginBottom: '14px' } }),
                chartRow
            ]
        });
    };

    const renderStats = () => {
        if (!statsRow || !dashData) return;
        statsRow.innerHTML = '';
        const d = dashData;
        const utilTotal = (d.utilization || []).reduce((s, u) => s + u.count, 0);

        const cards = [
            ['Total Research', d.totalAccepted, 'fa-book-open', '#00bcd4', 'Unique accepted titles'],
            ['Internally Funded', d.inHouseReview, 'fa-house', '#ff9800', 'In-House Review (Monitoring)'],
            ['Symposium', d.symposium, 'fa-users', '#4caf50', 'Symposium papers'],
            ['Presented', d.presented, 'fa-person-chalkboard', '#2196f3', 'With presentation records'],
            ['Published', d.published, 'fa-newspaper', '#9c27b0', 'Journal publications'],
            ['IP Assets', d.patents + d.utilityModels, 'fa-certificate', '#e91e63', `${d.patents} Patent · ${d.utilityModels} UM`],
            ['Utilizations', utilTotal, 'fa-hand-holding-heart', '#009688', 'Extension & industry use'],
        ];

        cards.forEach(([label, value, icon, color, sub]) => {
            statsRow.appendChild(statCard(label, value, icon, color, sub));
        });
    };

    const renderCharts = () => {
        if (!chartsArea || !dashData) return;
        chartsArea.innerHTML = '';
        const d = dashData;

        // Get dynamic titles based on filter
        const getLineChartTitle = () => {
            switch (currentFilter) {
                case 'extension': return '🌱 Extension Trend per Year';
                case 'inhouse': return '📋 Research Proposal Trend per Year';
                case 'symposium': return '🎤 Research Paper Trend per Year';
                case 'undergraduate': return '🎓 Undergraduate Research Trend per Year';
                case 'graduate': return '👨‍🎓 Graduate Research Trend per Year';
                default: return '📈 Research per Year';
            }
        };

        const getCampusTitle = () => {
            switch (currentFilter) {
                case 'extension': return '🌱 Extension by Campus';
                case 'inhouse': return '📋 Research Proposal by Campus';
                case 'symposium': return '🎤 Research Paper by Campus';
                case 'undergraduate': return '🎓 Undergraduate Research by Campus';
                case 'graduate': return '👨‍🎓 Graduate Research by Campus';
                default: return '🏫 Research by Campus';
            }
        };

        const getCenterTitle = () => {
            // Always show "Research by Center" - title never changes
            return '🏢 Research by Center';
        };

        const getCampusCenterTitle = () => {
            // Always show "Campus vs Center by Year" - title never changes
            return '📊 Campus vs Center by Year';
        };

        const getCategoryTitle = () => {
            switch (currentFilter) {
                case 'extension': return '🗂️ Extension by Category';
                case 'inhouse': return '🗂️ Research Proposal by Category';
                case 'symposium': return '🗂️ Research Paper by Category';
                case 'undergraduate': return '🗂️ Undergraduate Research by Category';
                case 'graduate': return '🗂️ Graduate Research by Category';
                default: return '🗂️ Research by Category';
            }
        };

        // Row 1: Year trend (Line Chart) + Campus (Bar Chart)
        const row1 = $({ tag: 'div', style: { display: 'flex', gap: '16px', flexWrap: 'wrap' } });
        if (d.byYear?.length) row1.appendChild(lineChart(getLineChartTitle(), d.byYear, 'year'));
        if (d.byCampus?.length) {
            // Pass extension data only when filter is 'extension'
            const extData = currentFilter === 'extension' ? d.extensionByCampus : null;
            row1.appendChild(campusBarChart(getCampusTitle(), d.byCampus, 'campus', extData));
        }
        chartsArea.appendChild(row1);

        // Row 1b: Center data (Bar Chart) + Campus vs Center Multi-Line Chart
        const row1b = $({ tag: 'div', style: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' } });
        
        if (d.byCenter && d.byCenter.length > 0) {
            row1b.appendChild(centerBarChart(getCenterTitle(), d.byCenter, 'center'));
        } else {
            row1b.appendChild($({
                tag: 'div', style: {
                    background: '#ffffff', borderRadius: '14px', padding: '18px 20px',
                    border: '1px solid #e8e8e8', flex: '1',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    minHeight: '200px',
                    color: '#999',
                    fontSize: '13px'
                }, child: [
                    $({ tag: 'span', text: 'No center data available' })
                ]
            }));
        }
        
        if (d.campusCenterByYear && d.campusCenterByYear.length > 0) {
            row1b.appendChild(multiLineChart('Research: Campus vs Center by Year', d.campusCenterByYear));
        }
        chartsArea.appendChild(row1b);

        // Row 2: Category donut
        const row2 = $({ tag: 'div', style: { display: 'flex', gap: '16px', flexWrap: 'wrap', marginTop: '16px' } });
        if (d.byCategory?.length) {
            row2.appendChild(donutChart(getCategoryTitle(), d.byCategory.slice(0, 8), 'category'));
        }
        if (d.utilization?.length) row2.appendChild(donutChart('🔄 Utilization Types', d.utilization, 'type'));
        chartsArea.appendChild(row2);
    };

    const getStatsRow = (el) => {
        statsRow = el;
    };

    const getChartsArea = (el) => {
        chartsArea = el;
    };

    const onMount = (el) => {
        fetchData();
    };

    return $({
        tag: 'div',
        elementHandler: onMount,
        style: {
            width: '100%', height: '100%', overflow: 'auto', 
            backgroundColor: '#f5f7fa',
            display: 'flex', flexDirection: 'column', 
            fontFamily: 'Segoe UI,sans-serif'
        },
        child: [
            // ── Header ──
            $({
                tag: 'div', style: {
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '20px 26px', 
                    borderBottom: '1px solid #e8e8e8', 
                    backgroundColor: '#ffffff'
                }, child: [
                    $({
                        tag: 'div', style: { display: 'flex', alignItems: 'center', gap: '12px' }, child: [
                            $({ tag: 'span', att: { className: 'fa-solid fa-gauge-high' }, style: { color: '#4caf50', fontSize: '22px' } }),
                            $({ tag: 'span', text: 'RDE Office Dashboard', style: { color: '#1a1a2e', fontSize: '18px', fontWeight: '700' } }),
                            $({
                                tag: 'span', text: 'Live', style: {
                                    backgroundColor: 'rgba(76,175,80,0.1)', 
                                    border: '1px solid rgba(76,175,80,0.3)',
                                    borderRadius: '20px', padding: '3px 10px', 
                                    color: '#4caf50', fontSize: '11px', fontWeight: '600'
                                }
                            })
                        ]
                    }),
                    $({ 
                        tag: 'span', 
                        text: `Updated: ${new Date().toLocaleTimeString()}`, 
                        style: { color: '#aaa', fontSize: '12px' } 
                    })
                ]
            }),

            // ── Stat Cards ──
            $({
                tag: 'div', 
                elementHandler: getStatsRow, 
                style: {
                    display: 'flex', gap: '14px', padding: '20px 26px',
                    flexWrap: 'wrap', 
                    borderBottom: '1px solid #e8e8e8', 
                    backgroundColor: '#fafafa'
                }
            }),

            // ── Filter UI ──
            createFilterUI(),

            // ── Charts ──
            $({
                tag: 'div', 
                elementHandler: getChartsArea, 
                style: {
                    padding: '0 26px 20px 26px', 
                    display: 'flex', 
                    flexDirection: 'column',
                    backgroundColor: '#f5f7fa'
                }
            })
        ]
    });
};