export const formatCurrency = (amount: number): string => {
    // Fallback for simple formatting if Intl is not available or behaves unexpectedly on some Android engines
    try {
        return new Intl.NumberFormat('es-CO', {
            style: 'currency',
            currency: 'COP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    } catch (e) {
        // Fallback: simple dot separator
        return '$ ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
};
