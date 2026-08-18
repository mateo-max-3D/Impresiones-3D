/**
 * PROTOTYP 3D - Central Reactive Store
 * Persists data to localStorage and provides reactive events
 */

const STORAGE_KEY = 'prototyp3d_state_v1';

const defaultState = {
    balance: 142890.50,
    income30d: 24500.00,
    expenses30d: 8240.00,
    budgetTotal: 5000.00,
    budgetConsumed: 4250.00,
    
    // Income Breakdown
    incomeCategories: [
        { id: 'print', name: 'IMPRESIÓN 3D', amount: 15200.00, icon: '3d_rotation', color: '#b6c4ff' },
        { id: 'filament', name: 'FILAMENTOS (VENTA)', amount: 5100.00, icon: 'inventory_2', color: '#b6c4ff' },
        { id: 'design', name: 'SERVICIOS DE DISEÑO', amount: 4200.00, icon: 'design_services', color: '#b6c4ff' }
    ],

    // Stock & Expense Items
    stockItems: [
        {
            id: 'TX-9982-F',
            name: 'Filamentos PLA/PETG',
            subtitle: 'Lote #492-A | Proveedor: PolyMaker',
            amount: 1200.00,
            usage: 60,
            icon: 'precision_manufacturing',
            type: 'expense',
            status: 'normal',
            category: 'Materiales',
            date: '2023.10.24 14:32'
        },
        {
            id: 'STK-0552-M',
            name: 'Stock Medio',
            subtitle: 'Resina Estándar | 5000 ML',
            units: '25 Unidades',
            level: 50,
            icon: 'inventory',
            type: 'stock',
            status: 'warning',
            category: 'Insumos',
            date: '2023.10.25 11:10'
        },
        {
            id: 'STK-0104-C',
            name: 'Stock Mínimo',
            subtitle: 'Boquillas 0.4mm | Reabastecer',
            units: '3 Unidades',
            level: 10,
            icon: 'warning',
            type: 'stock',
            status: 'critical',
            category: 'Repuestos',
            date: '2023.10.26 08:45'
        },
        {
            id: 'ORD-8812-B',
            name: 'Compras de Materiales del Mes',
            subtitle: 'Varios Proveedores',
            amount: 3450.00,
            badge: '12 Órdenes',
            icon: 'shopping_cart',
            type: 'expense',
            status: 'normal',
            category: 'Compras',
            date: '2023.10.27 16:00'
        }
    ],

    // General Transactions (Dashboard & Recent tables)
    transactions: [
        { id: 'TXN-89A2', title: 'Impresión SLA Lote Prototipos', date: '2023-10-27 14:32', amount: 1200.00, type: 'income', status: 'COMPLETED' },
        { id: 'TXN-42B9', title: 'Compra Filamento PETG Carbón', date: '2023-10-26 09:15', amount: -450.00, type: 'expense', status: 'COMPLETED' },
        { id: 'TXN-77C1', title: 'Contrato Modelado CAD Aeroespacial', date: '2023-10-25 16:45', amount: 3400.00, type: 'income', status: 'PROCESSING' },
        { id: 'TRX-8921-A', title: 'Impresión SLA Dental Master', date: '2023-10-24 18:20', amount: 1250.00, type: 'income', status: 'COMPLETED' },
        { id: 'TRX-8922-B', title: 'Venta PLA (Lote 15kg)', date: '2023-10-23 11:30', amount: 850.00, type: 'income', status: 'COMPLETED' },
        { id: 'TRX-8923-C', title: 'Modelado CAD Turbina', date: '2023-10-22 14:15', amount: 2100.00, type: 'income', status: 'PROCESSING' },
        { id: 'TRX-8924-A', title: 'Impresión FDM Gabinetes', date: '2023-10-20 10:00', amount: 340.00, type: 'income', status: 'COMPLETED' }
    ],

    // Cashflow Vectors
    cashflowVectors: [
        {
            id: 'VEC-442',
            title: 'Pago Lote Titanio #442',
            date: '12 NOV 2023',
            entity: 'CNC Aerospace',
            amount: 8500.00,
            type: 'inflow',
            status: 'CONFIRMADO',
            badgeClass: 'text-primary bg-primary/10 border-primary'
        },
        {
            id: 'VEC-109',
            title: 'Mantenimiento Extrusoras',
            date: '15 NOV 2023',
            entity: 'TechServ',
            amount: -1200.00,
            type: 'outflow',
            status: 'PROGRAMADO',
            badgeClass: 'text-secondary-container bg-secondary-container/10 border-secondary-container'
        },
        {
            id: 'VEC-883',
            title: 'Prototipos Auto (Fase 1)',
            date: '18 NOV 2023',
            entity: 'MotorWorks',
            amount: 4300.00,
            type: 'inflow',
            status: 'PENDIENTE',
            badgeClass: 'text-on-surface-variant bg-surface-variant/30 border-outline'
        },
        {
            id: 'VEC-991',
            title: 'Nómina Operadores',
            date: '30 NOV 2023',
            entity: 'Interno',
            amount: -8250.00,
            type: 'outflow',
            status: 'CRÍTICO',
            badgeClass: 'text-secondary-container bg-secondary-container/20 border-secondary-container'
        }
    ],

    // Estado de Resultados Data
    financialStatement: {
        period: 'Q3 2023 vs Q2 2023',
        kpis: {
            grossIncome: { current: 1245000.00, change: 12.4, trend: 'up' },
            operatingExpenses: { current: 428500.00, change: 5.2, trend: 'up' },
            netUtility: { current: 816500.00, change: 16.8, trend: 'up' }
        },
        breakdown: [
            { category: 'Ventas 3D Print', q3: 850000, q2: 750000, var: 13.3, type: 'income', isHeader: false },
            { category: 'Ventas Filamento', q3: 200000, q2: 180000, var: 11.1, type: 'income', isHeader: false, indent: true },
            { category: 'Servicios Diseño', q3: 195000, q2: 177000, var: 10.2, type: 'income', isHeader: false, indent: true },
            { category: 'Total Ingresos', q3: 1245000, q2: 1107000, var: 12.4, type: 'income', isTotal: true },
            { category: 'Costo Materiales', q3: -180500, q2: -170000, var: 6.1, type: 'expense', isHeader: false },
            { category: 'Mantenimiento Eq.', q3: -45000, q2: -42000, var: 7.1, type: 'expense', isHeader: false, indent: true },
            { category: 'Gastos Operativos', q3: -203000, q2: -195500, var: 3.8, type: 'expense', isHeader: false, indent: true },
            { category: 'Total Gastos', q3: -428500, q2: -407500, var: 5.2, type: 'expense', isTotal: true },
            { category: 'Utilidad Neta', q3: 816500, q2: 699500, var: 16.8, type: 'net', isNet: true }
        ]
    }
};

class Store {
    constructor() {
        this.state = this.loadState();
        this.subscribers = [];
    }

    loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return { ...defaultState, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Error loading state:', e);
        }
        return JSON.parse(JSON.stringify(defaultState));
    }

    saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
            this.notify();
        } catch (e) {
            console.error('Error saving state:', e);
        }
    }

    subscribe(callback) {
        this.subscribers.push(callback);
    }

    notify() {
        this.subscribers.forEach(cb => cb(this.state));
    }

    getState() {
        return this.state;
    }

    // Format currency helper
    formatCurrency(val, includeSign = false) {
        const num = Number(val);
        const absVal = Math.abs(num);
        const formatted = absVal.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
        if (includeSign) {
            return (num >= 0 ? '+$' : '-$') + formatted;
        }
        return '$' + formatted;
    }

    // Add new Income Transaction
    addIncome({ concept, amount, category, date, status = 'COMPLETED' }) {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return false;

        const newId = 'TRX-' + Math.floor(1000 + Math.random() * 9000) + '-' + String.fromCharCode(65 + Math.floor(Math.random() * 26));
        const now = date || new Date().toISOString().replace('T', ' ').substring(0, 16);

        const newTx = {
            id: newId,
            title: concept,
            date: now,
            amount: amt,
            type: 'income',
            status: status
        };

        this.state.transactions.unshift(newTx);
        this.state.balance += amt;
        this.state.income30d += amt;

        // Update category breakdown
        const catObj = this.state.incomeCategories.find(c => c.name.toLowerCase().includes(category.toLowerCase()));
        if (catObj) {
            catObj.amount += amt;
        } else {
            this.state.incomeCategories[0].amount += amt;
        }

        // Add to cashflow projected inflow
        this.state.cashflowVectors.unshift({
            id: 'VEC-' + Math.floor(100 + Math.random() * 900),
            title: concept,
            date: now.split(' ')[0],
            entity: 'Cliente Directo',
            amount: amt,
            type: 'inflow',
            status: status === 'COMPLETED' ? 'CONFIRMADO' : 'PENDIENTE',
            badgeClass: 'text-primary bg-primary/10 border-primary'
        });

        this.saveState();
        return newTx;
    }

    // Add new Expense Transaction
    addExpense({ concept, amount, category, date, provider = 'TechSupply' }) {
        const amt = parseFloat(amount);
        if (isNaN(amt) || amt <= 0) return false;

        const newId = 'TXN-' + Math.floor(1000 + Math.random() * 9000);
        const now = date || new Date().toISOString().replace('T', ' ').substring(0, 16);

        const newTx = {
            id: newId,
            title: concept,
            date: now,
            amount: -amt,
            type: 'expense',
            status: 'COMPLETED'
        };

        this.state.transactions.unshift(newTx);
        this.state.balance -= amt;
        this.state.expenses30d += amt;
        this.state.budgetConsumed += amt;

        // Add to stock/expense item list
        this.state.stockItems.unshift({
            id: newId,
            name: concept,
            subtitle: `Categoría: ${category} | ${provider}`,
            amount: amt,
            usage: Math.min(100, Math.floor(Math.random() * 40 + 30)),
            icon: 'shopping_cart',
            type: 'expense',
            status: 'normal',
            category: category,
            date: now
        });

        // Add to cashflow vectors
        this.state.cashflowVectors.unshift({
            id: 'VEC-' + Math.floor(100 + Math.random() * 900),
            title: concept,
            date: now.split(' ')[0],
            entity: provider,
            amount: -amt,
            type: 'outflow',
            status: 'PROGRAMADO',
            badgeClass: 'text-secondary-container bg-secondary-container/10 border-secondary-container'
        });

        this.saveState();
        return newTx;
    }

    // Reset to initial demo data
    resetState() {
        this.state = JSON.parse(JSON.stringify(defaultState));
        this.saveState();
    }
}

window.appStore = new Store();
