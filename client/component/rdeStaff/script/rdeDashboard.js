import { $ } from "../../../lib/lib.js";

export const RdeDashboard = () => {
    let dashData = null;
    let statsRow;
    let chartsArea;

    const COLORS = ['#00bcd4','#4caf50','#ff9800','#e91e63','#9c27b0',
                    '#2196f3','#009688','#ff5722','#ffeb3b','#607d8b'];

    // ─── fetch ────────────────────────────────────────────────────────────────
    const fetchData = async () => {
        try {
            const fd = new FormData();
            fd.append('action', 'stats');
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

    // ─── Stat card ────────────────────────────────────────────────────────────
    const statCard = (label, value, icon, color, sub) => {
        return $({
            tag: 'div',
            style: {
                flex: '1', minWidth: '150px',
                background: 'linear-gradient(135deg,#2e2e2e 0%,#3a3a3a 100%)',
                borderRadius: '16px', padding: '20px',
                border: `1px solid ${color}33`,
                boxShadow: `0 4px 20px rgba(0,0,0,0.25)`,
                display: 'flex', flexDirection: 'column', gap: '10px',
                position: 'relative', overflow: 'hidden'
            },
            child: [
                // glow circle
                $({ tag: 'div', style: {
                    position:'absolute', top:'-24px', right:'-24px',
                    width:'80px', height:'80px', borderRadius:'50%',
                    background:`${color}18`, pointerEvents:'none'
                }}),
                // top row: label + icon
                $({ tag: 'div', style: { display:'flex', justifyContent:'space-between', alignItems:'flex-start' }, child: [
                    $({ tag: 'div', style: { display:'flex', flexDirection:'column', gap:'4px' }, child: [
                        $({ tag: 'span', text: label, style: { color:'#999', fontSize:'11px', fontWeight:'600', textTransform:'uppercase', letterSpacing:'0.8px' } }),
                        $({ tag: 'span', text: String(value), style: { color:'#fff', fontSize:'30px', fontWeight:'800', lineHeight:'1', fontFamily:'Segoe UI,sans-serif' } })
                    ]}),
                    $({ tag: 'span', att: { className: `fa-solid ${icon}` }, style: { fontSize:'26px', color, opacity:'0.9' } })
                ]}),
                $({ tag: 'span', text: sub || '', style: { color:'#555', fontSize:'11px' } })
            ]
        });
    };

    // ─── Bar chart (pure DOM/CSS) ─────────────────────────────────────────────
    const barChart = (title, items, labelKey) => {
        const max = Math.max(...items.map(i => i.count), 1);

        const bars = items.map((item, idx) => {
            const pct = Math.round((item.count / max) * 100);
            const color = COLORS[idx % COLORS.length];
            const label = item[labelKey] || '';

            return $({ tag: 'div', style: { display:'flex', flexDirection:'column', alignItems:'center', flex:'1', minWidth:'32px', gap:'4px' }, child: [
                $({ tag: 'span', text: String(item.count), style: { color:'#fff', fontSize:'11px', fontWeight:'700' } }),
                $({ tag: 'div', style: { width:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', height:'120px' }, child: [
                    $({ tag: 'div', style: {
                        width:'100%', height:`${pct}%`, minHeight:'4px',
                        background:`linear-gradient(180deg,${color} 0%,${color}77 100%)`,
                        borderRadius:'4px 4px 0 0',
                        boxShadow:`0 -2px 8px ${color}44`
                    }})
                ]}),
                $({ tag: 'span', text: label, style: { color:'#777', fontSize:'9px', textAlign:'center', wordBreak:'break-word', maxWidth:'50px', lineHeight:'1.2' } })
            ]});
        });

        return $({ tag: 'div', style: {
            background:'#272727', borderRadius:'14px', padding:'18px 20px',
            border:'1px solid #3a3a3a', flex:'1'
        }, child: [
            $({ tag: 'span', text: title, style: { color:'#bbb', fontSize:'13px', fontWeight:'600', display:'block', marginBottom:'16px' } }),
            $({ tag: 'div', style: { display:'flex', gap:'6px', alignItems:'flex-end', flexWrap:'wrap' }, child: bars })
        ]});
    };

    // ─── Donut chart (SVG) ────────────────────────────────────────────────────
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

        // Track
        const track = document.createElementNS(svgNS, 'circle');
        track.setAttribute('cx', cx); track.setAttribute('cy', cy);
        track.setAttribute('r', R); track.setAttribute('fill', 'none');
        track.setAttribute('stroke', '#333'); track.setAttribute('stroke-width', strokeW);
        svg.appendChild(track);

        let offset = 0;
        items.forEach((item, idx) => {
            const pct = item.count / total;
            const dash = pct * circ;
            const dashOff = -offset * circ + circ * 0.25;
            const slice = document.createElementNS(svgNS, 'circle');
            slice.setAttribute('cx', cx); slice.setAttribute('cy', cy);
            slice.setAttribute('r', R); slice.setAttribute('fill', 'none');
            slice.setAttribute('stroke', COLORS[idx % COLORS.length]);
            slice.setAttribute('stroke-width', strokeW);
            slice.setAttribute('stroke-dasharray', `${dash} ${circ - dash}`);
            slice.setAttribute('stroke-dashoffset', dashOff);
            svg.appendChild(slice);
            offset += pct;
        });

        // Center text
        const t1 = document.createElementNS(svgNS, 'text');
        t1.setAttribute('x', cx); t1.setAttribute('y', cy - 5);
        t1.setAttribute('text-anchor', 'middle'); t1.setAttribute('fill', '#fff');
        t1.setAttribute('font-size', '18'); t1.setAttribute('font-weight', '800');
        t1.textContent = String(total);
        svg.appendChild(t1);
        const t2 = document.createElementNS(svgNS, 'text');
        t2.setAttribute('x', cx); t2.setAttribute('y', cy + 13);
        t2.setAttribute('text-anchor', 'middle'); t2.setAttribute('fill', '#777');
        t2.setAttribute('font-size', '10'); t2.textContent = 'total';
        svg.appendChild(t2);

        // Legend
        const legendItems = items.map((item, idx) => {
            const lbl = item[labelKey] || '—';
            return $({ tag: 'div', style: { display:'flex', alignItems:'center', gap:'8px', marginBottom:'5px' }, child: [
                $({ tag: 'div', style: { width:'10px', height:'10px', borderRadius:'50%', backgroundColor: COLORS[idx % COLORS.length], flexShrink:'0' } }),
                $({ tag: 'span', text: `${lbl}: ${item.count}`, style: { color:'#aaa', fontSize:'11px', lineHeight:'1.3' } })
            ]});
        });

        const legend = $({ tag: 'div', style: { display:'flex', flexDirection:'column' }, child: legendItems });

        const chartRow = $({ tag: 'div', style: { display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap' }});
        chartRow.appendChild(svg);
        chartRow.appendChild(legend);

        return $({ tag: 'div', style: {
            background:'#272727', borderRadius:'14px', padding:'18px 20px',
            border:'1px solid #3a3a3a', flex:'1'
        }, child: [
            $({ tag: 'span', text: title, style: { color:'#bbb', fontSize:'13px', fontWeight:'600', display:'block', marginBottom:'14px' } }),
            chartRow
        ]});
    };

    // ─── Render stats cards ───────────────────────────────────────────────────
    const renderStats = () => {
        if (!statsRow || !dashData) return;
        statsRow.innerHTML = '';
        const d = dashData;
        const utilTotal = (d.utilization || []).reduce((s, u) => s + u.count, 0);

        const cards = [
            ['Total Research',  d.totalAccepted,               'fa-book-open',           '#00bcd4', 'Unique accepted titles'],
            ['Internally Funded', d.inHouseReview,             'fa-house',               '#ff9800', 'In-House Review (Monitoring)'],
            ['Symposium',       d.symposium,                   'fa-users',               '#4caf50', 'Symposium papers'],
            ['Presented',       d.presented,                   'fa-person-chalkboard',   '#2196f3', 'With presentation records'],
            ['Published',       d.published,                   'fa-newspaper',           '#9c27b0', 'Journal publications'],
            ['IP Assets',       d.patents + d.utilityModels,   'fa-certificate',         '#e91e63', `${d.patents} Patent · ${d.utilityModels} UM`],
            ['Utilizations',    utilTotal,                     'fa-hand-holding-heart',  '#009688', 'Extension & industry use'],
        ];

        cards.forEach(([label, value, icon, color, sub]) => {
            statsRow.appendChild(statCard(label, value, icon, color, sub));
        });
    };

    // ─── Render charts ────────────────────────────────────────────────────────
    const renderCharts = () => {
        if (!chartsArea || !dashData) return;
        chartsArea.innerHTML = '';
        const d = dashData;

        // Row 1: Year trend + Campus
        const row1 = $({ tag: 'div', style: { display:'flex', gap:'16px', flexWrap:'wrap' } });
        if (d.byYear?.length) row1.appendChild(barChart('📈 Research per Year', d.byYear, 'year'));
        if (d.byCampus?.length) row1.appendChild(barChart('🏫 Research by Campus', d.byCampus, 'campus'));
        chartsArea.appendChild(row1);

        // Row 2: Category donut + Utilization donut
        const row2 = $({ tag: 'div', style: { display:'flex', gap:'16px', flexWrap:'wrap', marginTop:'16px' } });
        if (d.byCategory?.length) row2.appendChild(donutChart('🗂️ Research by Category', d.byCategory.slice(0, 8), 'category'));
        if (d.utilization?.length) row2.appendChild(donutChart('🔄 Utilization Types', d.utilization, 'type'));
        chartsArea.appendChild(row2);
    };

    // ─── Get stat row ref ─────────────────────────────────────────────────────
    const getStatsRow = (el) => {
        statsRow = el;
    };

    // ─── Get charts area ref ──────────────────────────────────────────────────
    const getChartsArea = (el) => {
        chartsArea = el;
    };

    // ─── Root element handler ─────────────────────────────────────────────────
    const onMount = (el) => {
        fetchData();
    };

    // ─── Build DOM ────────────────────────────────────────────────────────────
    return $({
        tag: 'div',
        elementHandler: onMount,
        style: { width:'100%', height:'100%', overflow:'auto', backgroundColor:'#1e1e1e',
                 display:'flex', flexDirection:'column', fontFamily:'Segoe UI,sans-serif' },
        child: [
            // ── Header ──
            $({ tag: 'div', style: {
                display:'flex', justifyContent:'space-between', alignItems:'center',
                padding:'20px 26px', borderBottom:'1px solid #333', backgroundColor:'#242424'
            }, child: [
                $({ tag: 'div', style: { display:'flex', alignItems:'center', gap:'12px' }, child: [
                    $({ tag: 'span', att: { className: 'fa-solid fa-gauge-high' }, style: { color:'#00bcd4', fontSize:'22px' } }),
                    $({ tag: 'span', text: 'RDE Office Dashboard', style: { color:'#fff', fontSize:'18px', fontWeight:'700' } }),
                    $({ tag: 'span', text: 'Live', style: {
                        backgroundColor:'rgba(0,188,212,0.15)', border:'1px solid rgba(0,188,212,0.4)',
                        borderRadius:'20px', padding:'3px 10px', color:'#00bcd4', fontSize:'11px', fontWeight:'600'
                    }})
                ]}),
                $({ tag: 'span', text: `Updated: ${new Date().toLocaleTimeString()}`, style: { color:'#444', fontSize:'12px' } })
            ]}),

            // ── Stat Cards ──
            $({ tag: 'div', elementHandler: getStatsRow, style: {
                display:'flex', gap:'14px', padding:'20px 26px',
                flexWrap:'wrap', borderBottom:'1px solid #2a2a2a', backgroundColor:'#232323'
            }}),

            // ── Charts ──
            $({ tag: 'div', elementHandler: getChartsArea, style: {
                padding:'20px 26px', display:'flex', flexDirection:'column'
            }})
        ]
    });
};
