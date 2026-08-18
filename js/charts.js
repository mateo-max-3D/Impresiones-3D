/**
 * PROTOTYP 3D - Chart Visualizations Engine
 * Renders high-fidelity interactive SVG charts with cyber-industrial styling
 */

class ChartEngine {
    // Render Dashboard Financial Flow Bar Chart
    static renderFinancialFlowBars(containerId, data = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const defaultData = [
            { height: '40%', val: '$14,200', type: 'income', label: 'SEM 1' },
            { height: '60%', val: '$21,400', type: 'income', label: 'SEM 2' },
            { height: '30%', val: '$9,800', type: 'income', label: 'SEM 3' },
            { height: '80%', val: '$28,900', type: 'income', label: 'SEM 4' },
            { height: '50%', val: '$18,300', type: 'income', label: 'SEM 5' },
            { height: '20%', val: '-$6,400', type: 'expense', label: 'CORTE' },
            { height: '90%', val: '$32,500', type: 'income', label: 'ACTUAL' }
        ];

        const bars = data || defaultData;
        
        container.innerHTML = bars.map(b => {
            const isExp = b.type === 'expense';
            const bgClass = isExp 
                ? 'bg-error/20 border-error hover:bg-error/40 shadow-[0_0_8px_rgba(255,180,171,0.3)]' 
                : 'bg-primary/20 border-primary hover:bg-primary/40 shadow-[0_0_8px_rgba(182,196,255,0.2)]';
            const textClass = isExp ? 'text-error' : 'text-primary';

            return `
                <div class="flex flex-col items-center gap-1 group/bar h-full justify-end relative cursor-pointer">
                    <!-- Tooltip -->
                    <div class="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-surface-container-high border border-outline-variant/40 px-2 py-1 rounded text-[10px] font-data-mono ${textClass} whitespace-nowrap z-20 pointer-events-none shadow-lg">
                        ${b.label}: ${b.val}
                    </div>
                    <div class="w-7 sm:w-9 md:w-11 border ${bgClass} rounded-t-sm transition-all duration-300" style="height: ${b.height};"></div>
                    <span class="font-data-mono text-[9px] text-outline select-none mt-1">${b.label}</span>
                </div>
            `;
        }).join('');
    }

    // Render Cash Flow Trajectory Chart with period filter (7D, 30D, 90D)
    static renderCashFlowChart(svgContainerId, period = '30D') {
        const svg = document.getElementById(svgContainerId);
        if (!svg) return;

        let points = [];
        let projectionStart = 4;
        let xLabels = [];

        if (period === '7D') {
            points = [
                { x: 50, y: 190, val: '$38,200', date: 'Lun' },
                { x: 170, y: 160, val: '$40,500', date: 'Mar' },
                { x: 290, y: 130, val: '$42,100', date: 'Mie' },
                { x: 410, y: 150, val: '$41,200', date: 'Jue' },
                { x: 530, y: 100, val: '$45,800', date: 'Vie' },
                { x: 650, y: 80, val: '$48,000', date: 'Sab', isProj: true },
                { x: 750, y: 60, val: '$51,200', date: 'Dom', isProj: true }
            ];
            projectionStart = 4;
            xLabels = points.map(p => ({ x: p.x, label: p.date }));
        } else if (period === '90D') {
            points = [
                { x: 50, y: 220, val: '$28,000' },
                { x: 160, y: 190, val: '$33,000' },
                { x: 270, y: 150, val: '$39,500' },
                { x: 380, y: 140, val: '$41,000' },
                { x: 490, y: 110, val: '$44,500' },
                { x: 600, y: 80, val: '$49,000', isProj: true },
                { x: 750, y: 45, val: '$58,000', isProj: true }
            ];
            projectionStart = 4;
            xLabels = [
                { x: 100, label: 'MES 1' },
                { x: 300, label: 'MES 2' },
                { x: 500, label: 'MES 3' },
                { x: 700, label: 'PROYECTADO' }
            ];
        } else { // 30D (Default template)
            points = [
                { x: 50, y: 150, val: '$35,000' },
                { x: 150, y: 120, val: '$38,500' },
                { x: 250, y: 180, val: '$32,000', isOutflow: true },
                { x: 350, y: 110, val: '$41,500', isInflow: true },
                { x: 450, y: 140, val: '$39,000' },
                { x: 550, y: 90, val: '$44,000', isCurrent: true },
                { x: 650, y: 130, val: '$41,200', isProj: true },
                { x: 750, y: 60, val: '$49,800', isProj: true }
            ];
            projectionStart = 5;
            xLabels = [
                { x: 100, label: '01/11' },
                { x: 250, label: '08/11' },
                { x: 400, label: '15/11' },
                { x: 550, label: '22/11' },
                { x: 700, label: 'PROYECTADO', isHighlighted: true }
            ];
        }

        // Build path strings
        const histPoints = points.slice(0, projectionStart + 1);
        const histPathD = histPoints.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

        const projPoints = points.slice(projectionStart);
        const projPathD = projPoints.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

        const fullPathD = points.map((p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(' ');

        svg.innerHTML = `
            <!-- Grid Lines -->
            <line x1="50" y1="50" x2="780" y2="50" stroke="#434656" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.3"></line>
            <line x1="50" y1="125" x2="780" y2="125" stroke="#434656" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.3"></line>
            <line x1="50" y1="200" x2="780" y2="200" stroke="#434656" stroke-width="1" stroke-opacity="0.5"></line>
            <line x1="50" y1="275" x2="780" y2="275" stroke="#434656" stroke-width="1" stroke-dasharray="4 4" stroke-opacity="0.3"></line>
            
            <!-- Y Axis Labels -->
            <text x="40" y="55" fill="#8d90a2" font-family="JetBrains Mono" font-size="10" text-anchor="end">60k</text>
            <text x="40" y="130" fill="#8d90a2" font-family="JetBrains Mono" font-size="10" text-anchor="end">40k</text>
            <text x="40" y="205" fill="#8d90a2" font-family="JetBrains Mono" font-size="10" text-anchor="end">20k</text>
            <text x="40" y="280" fill="#8d90a2" font-family="JetBrains Mono" font-size="10" text-anchor="end">0</text>
            
            <!-- X Axis Labels -->
            ${xLabels.map(xl => `
                <text x="${xl.x}" y="295" fill="${xl.isHighlighted ? '#b6c4ff' : '#8d90a2'}" 
                      font-family="JetBrains Mono" font-size="10" 
                      font-weight="${xl.isHighlighted ? 'bold' : 'normal'}" 
                      text-anchor="middle">${xl.label}</text>
            `).join('')}

            <!-- Data Line (Historical + Projection) -->
            <path class="animated-line" d="${fullPathD}" fill="none" stroke="#b6c4ff" stroke-width="3" style="filter: drop-shadow(0 0 6px rgba(182, 196, 255, 0.6));"></path>
            
            <!-- Projection Dotted Line Overlay -->
            <path d="${projPathD}" fill="none" stroke="#b6c4ff" stroke-width="3" stroke-dasharray="8 4" stroke-opacity="0.75"></path>
            
            <!-- Dynamic Markers and Nodes -->
            ${points.map((p, i) => {
                let nodeHtml = '';
                const delay = (i * 0.15).toFixed(2);

                if (p.isOutflow) {
                    nodeHtml += `
                        <circle class="animated-point" cx="${p.x}" cy="${p.y}" r="8" fill="none" stroke="#ff5708" stroke-width="1" stroke-opacity="0.8" style="animation-delay: ${delay}s;"></circle>
                        <line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="275" stroke="#ff5708" stroke-width="1" stroke-dasharray="2 2" stroke-opacity="0.3"></line>
                    `;
                }
                if (p.isInflow) {
                    nodeHtml += `
                        <circle class="animated-point" cx="${p.x}" cy="${p.y}" r="8" fill="none" stroke="#b6c4ff" stroke-width="1" stroke-opacity="0.8" style="animation-delay: ${delay}s;"></circle>
                        <line x1="${p.x}" y1="${p.y}" x2="${p.x}" y2="275" stroke="#b6c4ff" stroke-width="1" stroke-dasharray="2 2" stroke-opacity="0.3"></line>
                    `;
                }

                if (p.isCurrent) {
                    nodeHtml += `
                        <circle class="animated-point" cx="${p.x}" cy="${p.y}" r="6" fill="#b6c4ff" stroke="#0e141b" stroke-width="2" style="animation-delay: ${delay}s; filter: drop-shadow(0 0 8px #b6c4ff);"></circle>
                    `;
                } else {
                    nodeHtml += `
                        <circle class="animated-point" cx="${p.x}" cy="${p.y}" r="4" fill="#0e141b" stroke="#b6c4ff" stroke-width="2" style="animation-delay: ${delay}s;"></circle>
                    `;
                }

                return nodeHtml;
            }).join('')}
        `;
    }
}

window.ChartEngine = ChartEngine;
