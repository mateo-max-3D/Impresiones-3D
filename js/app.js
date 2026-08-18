/**
 * PROTOTYP 3D - Main Application Controller
 * Handles SPA Routing, UI bindings, Modals, Forms & Reactive sync
 */

class AppRouter {
    constructor() {
        this.currentView = 'login';
        this.views = ['login', 'dashboard', 'ingresos', 'gastos', 'estado', 'flujo'];
    }

    init() {
        // Bind navigation clicks
        document.querySelectorAll('[data-nav]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = btn.getAttribute('data-nav');
                this.navigate(target);
            });
        });

        // Check authentication
        if (window.authService.isAuthenticated()) {
            this.navigate('dashboard');
        } else {
            this.navigate('login');
        }
    }

    navigate(viewName) {
        if (!this.views.includes(viewName)) return;

        // If not authenticated and trying to access protected view, force login
        if (viewName !== 'login' && !window.authService.isAuthenticated()) {
            this.navigate('login');
            return;
        }

        this.currentView = viewName;

        // Toggle sections directly with inline display styles to eliminate any CSS conflict
        this.views.forEach(v => {
            const el = document.getElementById(`view-${v}`);
            if (el) {
                if (v === viewName) {
                    el.classList.add('active');
                    el.style.display = (v === 'login' ? 'flex' : 'block');
                } else {
                    el.classList.remove('active');
                    el.style.display = 'none';
                }
            }
        });

        const header = document.getElementById('main-header');
        const mobileNav = document.getElementById('mobile-bottom-nav');

        if (viewName === 'login') {
            if (header) header.style.display = 'none';
            if (mobileNav) mobileNav.style.display = 'none';
        } else {
            if (header) header.style.display = 'flex';
            if (mobileNav) mobileNav.style.display = 'flex';
            this.updateNavHighlight(viewName);
            this.renderCurrentView(viewName);
        }

        // Scroll to top
        window.scrollTo(0, 0);
    }

    updateNavHighlight(viewName) {
        // Desktop nav
        document.querySelectorAll('.nav-link').forEach(link => {
            const target = link.getAttribute('data-nav');
            if (target === viewName) {
                link.className = 'nav-link font-label-caps text-label-caps text-primary border-b-2 border-primary px-3 py-1.5 transition-all';
            } else {
                link.className = 'nav-link font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-colors hover:bg-primary/10 px-3 py-1.5 rounded';
            }
        });

        // Mobile bottom nav
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            const target = item.getAttribute('data-nav');
            if (target === viewName) {
                item.className = 'mobile-nav-item flex flex-col items-center justify-center text-primary bg-primary/10 rounded-lg py-1 px-2 ring-1 ring-primary/40 transition-all shadow-[0_0_8px_rgba(182,196,255,0.3)]';
            } else {
                item.className = 'mobile-nav-item flex flex-col items-center justify-center text-on-surface-variant py-1 px-2 hover:text-primary transition-all';
            }
        });
    }

    renderCurrentView(viewName) {
        switch(viewName) {
            case 'dashboard':
                renderDashboard();
                break;
            case 'ingresos':
                renderIngresos();
                break;
            case 'gastos':
                renderGastos();
                break;
            case 'estado':
                renderEstado();
                break;
            case 'flujo':
                renderFlujo();
                break;
        }
    }
}

// -------------------------------------------------------------
// UI RENDERERS
// -------------------------------------------------------------

function renderDashboard() {
    const state = window.appStore.getState();

    // Update numbers
    const totalBal = document.getElementById('dash-total-balance');
    const inc30d = document.getElementById('dash-income-30d');
    const exp30d = document.getElementById('dash-expenses-30d');

    if (totalBal) totalBal.textContent = window.appStore.formatCurrency(state.balance);
    if (inc30d) inc30d.textContent = window.appStore.formatCurrency(state.income30d);
    if (exp30d) exp30d.textContent = window.appStore.formatCurrency(state.expenses30d);

    // Financial Flow Chart
    window.ChartEngine.renderFinancialFlowBars('financial-flow-bars-container');

    // Recent Activity Table (top 4)
    const table = document.getElementById('dash-recent-activity-table');
    if (table) {
        const topTx = state.transactions.slice(0, 4);
        table.innerHTML = topTx.map(tx => {
            const isInc = tx.amount > 0;
            const amtClass = isInc ? 'text-primary' : 'text-error';
            const sign = isInc ? '+' : '-';
            const absAmt = Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });
            const badgeClass = tx.status === 'COMPLETED'
                ? 'bg-primary/10 border border-primary text-primary'
                : 'bg-secondary-container/10 border border-secondary-container text-secondary-container';

            return `
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border-b border-outline/10 hover:bg-surface-variant/10 transition-colors items-center">
                    <div class="font-data-mono text-data-mono text-on-surface truncate flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full ${isInc ? 'bg-primary' : 'bg-secondary-container'}"></span>
                        ${tx.id}
                    </div>
                    <div class="font-data-mono text-data-mono text-on-surface-variant text-sm">${tx.date}</div>
                    <div class="font-data-mono text-data-mono ${amtClass}">${sign}$${absAmt}</div>
                    <div><span class="inline-block px-2 py-1 ${badgeClass} font-label-caps text-[10px] rounded">${tx.status}</span></div>
                </div>
            `;
        }).join('');
    }
}

function renderIngresos() {
    const state = window.appStore.getState();

    // Total display
    const totalDisplay = document.getElementById('ingresos-total-display');
    if (totalDisplay) totalDisplay.textContent = window.appStore.formatCurrency(state.income30d);

    // Breakdown cards
    const catContainer = document.getElementById('income-categories-container');
    if (catContainer) {
        const totalCat = state.incomeCategories.reduce((acc, c) => acc + c.amount, 0) || 1;
        catContainer.innerHTML = state.incomeCategories.map(c => {
            const pct = Math.round((c.amount / totalCat) * 100);
            return `
                <div class="bg-surface-container border border-outline-variant/20 rounded p-4 relative group hover:border-primary/50 transition-colors">
                    <div class="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-30 group-hover:opacity-100 transition-opacity">
                        <span class="material-symbols-outlined text-primary text-[18px]">${c.icon}</span>
                    </div>
                    <p class="font-label-caps text-label-caps text-on-surface-variant mb-1">${c.name}</p>
                    <p class="font-headline-md text-headline-md text-on-surface">${window.appStore.formatCurrency(c.amount)}</p>
                    <div class="w-full bg-surface-dim mt-3 h-1.5 rounded-full overflow-hidden flex">
                        <div class="bg-primary h-full transition-all duration-500" style="width: ${pct}%;"></div>
                    </div>
                    <div class="flex justify-between font-data-mono text-[10px] text-outline mt-1">
                        <span>Participación</span>
                        <span>${pct}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Income transactions table
    const table = document.getElementById('table-income-activity');
    if (table) {
        const incomeList = state.transactions.filter(t => t.amount > 0);
        table.innerHTML = incomeList.map(tx => {
            return `
                <tr class="border-b border-outline-variant/20 hover:bg-primary/5 transition-colors group cursor-pointer">
                    <td class="py-4 text-primary font-bold">${tx.id}</td>
                    <td class="py-4 text-on-surface-variant text-sm">${tx.date}</td>
                    <td class="py-4 text-on-surface font-body-md">${tx.title}</td>
                    <td class="py-4 text-right text-primary font-bold">$ ${Math.abs(tx.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                    <td class="py-4 text-center">
                        <span class="bg-primary/10 border border-primary text-primary px-2 py-1 rounded text-[10px] uppercase tracking-wider">${tx.status}</span>
                    </td>
                </tr>
            `;
        }).join('');
    }
}

function renderGastos() {
    const state = window.appStore.getState();

    // Gastos total & budget
    const totalEl = document.getElementById('gastos-total-display');
    const budgetPctEl = document.getElementById('gastos-budget-pct');
    const budgetBarEl = document.getElementById('gastos-budget-bar');

    const pct = Math.min(100, Math.round((state.budgetConsumed / state.budgetTotal) * 100));

    if (totalEl) totalEl.textContent = window.appStore.formatCurrency(state.budgetConsumed);
    if (budgetPctEl) budgetPctEl.textContent = `${pct}%`;
    if (budgetBarEl) budgetBarEl.value = pct;

    // Stock & Expense items
    const listEl = document.getElementById('gastos-stock-list');
    if (listEl) {
        listEl.innerHTML = state.stockItems.map((item, idx) => {
            const isStock = item.type === 'stock';
            const borderAccent = item.status === 'critical' ? 'border-l-4 border-l-error' : (item.status === 'warning' ? 'border-l-4 border-l-secondary-container' : '');
            const iconColor = item.status === 'critical' ? 'text-error' : (item.status === 'warning' ? 'text-secondary-container' : 'text-primary');

            return `
                <div onclick="selectExpenseItem('${item.id}')" class="bg-surface-container-low border border-outline-variant/20 p-3.5 flex flex-col md:flex-row justify-between md:items-center gap-3 hover:bg-surface-container transition-colors cursor-pointer group rounded ${borderAccent}">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-surface-variant flex items-center justify-center border border-outline-variant/30 rounded">
                            <span class="material-symbols-outlined ${iconColor}">${item.icon}</span>
                        </div>
                        <div>
                            <div class="font-body-lg text-body-lg text-on-surface font-medium">${item.name}</div>
                            <div class="font-label-caps text-label-caps text-outline uppercase mt-0.5">${item.subtitle}</div>
                        </div>
                    </div>
                    <div class="flex flex-col md:items-end">
                        ${isStock ? `
                            <div class="font-data-mono text-data-mono ${iconColor} font-bold">${item.units}</div>
                            <div class="flex items-center gap-2 mt-1">
                                <span class="font-label-caps text-[10px] text-outline uppercase">Nivel: ${item.level}%</span>
                                <progress class="w-16 h-1.5 progress-stepped rounded-none" max="100" value="${item.level}"></progress>
                            </div>
                        ` : `
                            <div class="font-data-mono text-data-mono text-primary group-hover:tech-glow transition-all font-bold">$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                            <div class="flex items-center gap-2 mt-1">
                                ${item.usage ? `
                                    <span class="font-label-caps text-[10px] text-outline uppercase">Uso: ${item.usage}%</span>
                                    <div class="w-16 h-1 bg-surface-variant overflow-hidden rounded">
                                        <div class="h-full bg-primary" style="width: ${item.usage}%"></div>
                                    </div>
                                ` : `
                                    <span class="bg-surface-variant text-outline px-1.5 py-0.5 border border-outline-variant font-label-caps text-[10px] uppercase">${item.badge || 'PROCESADO'}</span>
                                `}
                            </div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }
}

function selectExpenseItem(id) {
    const state = window.appStore.getState();
    const item = state.stockItems.find(s => s.id === id);
    if (!item) return;

    const title = document.getElementById('inspector-title');
    const amount = document.getElementById('inspector-amount');
    const idEl = document.getElementById('inspector-id');
    const cat = document.getElementById('inspector-category');
    const dateEl = document.getElementById('inspector-date');

    if (title) title.textContent = item.name;
    if (amount) amount.textContent = item.amount ? `$${item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : item.units;
    if (idEl) idEl.textContent = item.id;
    if (cat) cat.textContent = item.category || 'Insumo 3D';
    if (dateEl) dateEl.textContent = item.date || '2023.10.27';

    showToast('Inspector Actualizado', `Detalles cargados para ${item.name}`, 'info');
}

function renderEstado() {
    // Already structured in index.html with static/reactive balance points
}

function renderFlujo() {
    const state = window.appStore.getState();

    // Render chart
    window.ChartEngine.renderCashFlowChart('cashflow-svg-chart', currentChartPeriod);

    // Render cashflow vectors
    const vectorsEl = document.getElementById('cashflow-vectors-container');
    if (vectorsEl) {
        vectorsEl.innerHTML = state.cashflowVectors.map(v => {
            const isInf = v.type === 'inflow';
            const icon = isInf ? 'south_east' : 'north_west';
            const iconBg = isInf ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-secondary-container/10 border-secondary-container/30 text-secondary-container';
            const amtClass = isInf ? 'text-primary' : 'text-secondary-container';
            const sign = isInf ? '+$' : '-$';
            const absAmt = Math.abs(v.amount).toLocaleString('en-US', { minimumFractionDigits: 2 });

            return `
                <div class="bg-[#1C1D21] border border-outline-variant/20 rounded p-3 flex justify-between items-center hover:border-primary/50 transition-colors cursor-default isometric-glow">
                    <div class="flex items-center gap-3">
                        <div class="w-8 h-8 rounded ${iconBg} border flex items-center justify-center">
                            <span class="material-symbols-outlined text-[18px]">${icon}</span>
                        </div>
                        <div>
                            <div class="font-data-mono text-[13px] text-on-surface font-semibold">${v.title}</div>
                            <div class="font-label-caps text-[10px] text-on-surface-variant mt-0.5">${v.date} • ${v.entity}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="font-data-mono text-data-mono ${amtClass} font-bold">${sign}${absAmt}</div>
                        <div class="text-[10px] ${v.badgeClass} font-label-caps px-1.5 py-0.5 rounded border inline-block mt-1">${v.status}</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// -------------------------------------------------------------
// CHART PERIOD FILTER
// -------------------------------------------------------------
let currentChartPeriod = '30D';

function filterCashflowChart(period) {
    currentChartPeriod = period;
    document.querySelectorAll('.chart-filter-btn').forEach(btn => {
        btn.className = 'chart-filter-btn bg-surface-variant/50 border border-outline-variant/50 text-on-surface-variant font-label-caps text-[10px] px-3 py-1 rounded hover:border-primary hover:text-primary transition-colors';
    });

    const activeBtn = document.getElementById(`btn-chart-${period.toLowerCase()}`);
    if (activeBtn) {
        activeBtn.className = 'chart-filter-btn bg-primary/20 border border-primary text-primary font-label-caps text-[10px] px-3 py-1 rounded transition-colors shadow-[0_0_8px_rgba(182,196,255,0.2)]';
    }

    window.ChartEngine.renderCashFlowChart('cashflow-svg-chart', period);
}

// -------------------------------------------------------------
// MODALS LOGIC
// -------------------------------------------------------------
function openModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.remove('hidden');
}

function closeModal(id) {
    const m = document.getElementById(id);
    if (m) m.classList.add('hidden');
}

// Close modals on ESC
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.add('hidden'));
    }
});

// -------------------------------------------------------------
// TOAST NOTIFICATIONS
// -------------------------------------------------------------
function showToast(title, message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    const borderClass = type === 'error' ? 'border-error text-error' : (type === 'info' ? 'border-primary text-primary' : 'border-primary text-on-surface');
    const icon = type === 'error' ? 'error' : (type === 'info' ? 'info' : 'check_circle');

    toast.className = `p-3.5 bg-surface-container-high/95 backdrop-blur-md border ${borderClass} rounded shadow-2xl flex items-center gap-3 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto`;
    toast.innerHTML = `
        <span class="material-symbols-outlined text-xl">${icon}</span>
        <div class="flex flex-col">
            <span class="font-label-caps text-xs font-bold uppercase tracking-wider">${title}</span>
            <span class="font-body-md text-xs text-on-surface-variant">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove('translate-y-2', 'opacity-0');
    }, 10);

    setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-2');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// -------------------------------------------------------------
// SIMULATED ACTIONS & EXPORTS
// -------------------------------------------------------------
function downloadInvoiceSimulated() {
    showToast('Generando Factura', 'El comprobante técnico se ha descargado correctamente (CAD-TX-9982.pdf)', 'info');
}

function exportFinancialReportPDF() {
    showToast('Exportando Estado de Resultados', 'Preparando documento PDF de alta resolución...', 'info');
    setTimeout(() => {
        window.print();
    }, 600);
}

// -------------------------------------------------------------
// AUTHENTICATION WIRING
// -------------------------------------------------------------
function fillAndLogin(user, pass) {
    const userInp = document.getElementById('login-email');
    const passInp = document.getElementById('login-password');
    if (userInp) userInp.value = user;
    if (passInp) passInp.value = pass;
    
    // Trigger submit
    const form = document.getElementById('form-login');
    if (form) form.dispatchEvent(new Event('submit'));
}

function updateHeaderUserInfo() {
    const user = window.authService.getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById('user-name-display');
    const roleEl = document.getElementById('user-role-display');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl) nameEl.textContent = user.username;
    if (roleEl) roleEl.textContent = 'ADMINISTRADOR';
    if (avatarEl) avatarEl.textContent = user.username.charAt(0).toUpperCase();
}

// -------------------------------------------------------------
// INITIALIZATION
// -------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
    window.appRouter = new AppRouter();
    window.appRouter.init();

    // Subscribe store to trigger re-renders
    window.appStore.subscribe(() => {
        window.appRouter.renderCurrentView(window.appRouter.currentView);
    });

    if (window.authService.isAuthenticated()) {
        updateHeaderUserInfo();
    }

    // Login Form Submit
    const loginForm = document.getElementById('form-login');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const id = document.getElementById('login-email').value;
            const pass = document.getElementById('login-password').value;
            const errBanner = document.getElementById('login-error');
            const errText = document.getElementById('login-error-text');

            const res = window.authService.login(id, pass);
            if (res.success) {
                if (errBanner) errBanner.classList.add('hidden');
                updateHeaderUserInfo();
                window.appRouter.navigate('dashboard');
                showToast('Acceso Concedido', `Bienvenido al sistema PROTOTYP 3D, ${res.user.username}.`);
            } else {
                if (errBanner) {
                    errBanner.classList.remove('hidden');
                    if (errText) errText.textContent = res.message;
                }
            }
        });
    }

    // Logout Click
    const logoutBtn = document.getElementById('btn-logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.authService.logout();
            window.appRouter.navigate('login');
            showToast('Sesión Finalizada', 'Has cerrado sesión de forma segura.', 'info');
        });
    }

    // Inline Income form submit
    const inlineIncomeForm = document.getElementById('form-inline-income');
    if (inlineIncomeForm) {
        inlineIncomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const concept = document.getElementById('inline-inc-concept').value;
            const amount = document.getElementById('inline-inc-amount').value;
            const category = document.getElementById('inline-inc-category').value;

            const res = window.appStore.addIncome({ concept, amount, category });
            if (res) {
                inlineIncomeForm.reset();
                showToast('Ingreso Registrado', `+${window.appStore.formatCurrency(amount)} asignado a ${category}.`);
            }
        });
    }

    // Modal Add Income form submit
    const modalIncomeForm = document.getElementById('modal-form-income');
    if (modalIncomeForm) {
        modalIncomeForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const concept = document.getElementById('modal-inc-concept').value;
            const amount = document.getElementById('modal-inc-amount').value;
            const category = document.getElementById('modal-inc-category').value;

            const res = window.appStore.addIncome({ concept, amount, category });
            if (res) {
                modalIncomeForm.reset();
                closeModal('modal-add-income');
                showToast('Ingreso Añadido', `+${window.appStore.formatCurrency(amount)} registrado exitosamente.`);
            }
        });
    }

    // Modal Add Expense form submit
    const modalExpenseForm = document.getElementById('modal-form-expense');
    if (modalExpenseForm) {
        modalExpenseForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const concept = document.getElementById('modal-exp-concept').value;
            const amount = document.getElementById('modal-exp-amount').value;
            const category = document.getElementById('modal-exp-category').value;
            const provider = document.getElementById('modal-exp-provider').value || 'Proveedor Local';

            const res = window.appStore.addExpense({ concept, amount, category, provider });
            if (res) {
                modalExpenseForm.reset();
                closeModal('modal-add-expense');
                showToast('Gasto Registrado', `-$${Number(amount).toFixed(2)} cargado a ${category}.`, 'error');
            }
        });
    }

    // Notification click
    const notifBtn = document.getElementById('btn-notifications');
    if (notifBtn) {
        notifBtn.addEventListener('click', () => {
            showToast('Monitor de Sistema', 'Estado de impresoras 3D: 12 activas, 2 en mantenimiento programado.', 'info');
        });
    }

    // -------------------------------------------------------------
    // PROGRESSIVE WEB APP (PWA) REGISTRATION & INSTALLATION PROMPT
    // -------------------------------------------------------------
    let deferredPrompt = null;
    const installBtn = document.getElementById('btn-install-pwa');

    // Register Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then((reg) => {
                    console.log('[PWA] Service Worker registrado con alcance:', reg.scope);
                })
                .catch((err) => {
                    console.error('[PWA] Error al registrar Service Worker:', err);
                });
        });
    }

    // Capture install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (installBtn) {
            installBtn.classList.remove('hidden');
        }
    });

    // Install Button Click
    if (installBtn) {
        installBtn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                console.log(`[PWA] Instalación respuesta del usuario: ${outcome}`);
                if (outcome === 'accepted') {
                    showToast('PWA Instalada', 'PROTOTYP 3D se ha instalado en tu dispositivo.', 'success');
                }
                deferredPrompt = null;
                installBtn.classList.add('hidden');
            } else {
                showToast('Instalación PWA', 'Puedes instalar la aplicación desde el menú de tu navegador.', 'info');
            }
        });
    }

    // App installed event
    window.addEventListener('appinstalled', () => {
        if (installBtn) installBtn.classList.add('hidden');
        showToast('PWA Lista', 'Aplicación instalada exitosamente para uso sin conexión.', 'success');
    });
});

