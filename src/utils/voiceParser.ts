import { InventoryItem, ParsedVoiceResult } from '../types';

// Mapa de palabras a números básicos
const NUMBER_WORDS: { [key: string]: number } = {
    'un': 1, 'uno': 1, 'una': 1, 'unos': 1, 'unas': 1,
    'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
    'seis': 6, 'siete': 7, 'ocho': 8, 'nueve': 9,
    'diez': 10, 'once': 11, 'doce': 12, 'trece': 13, 'catorce': 14, 'quince': 15,
    'dieciseis': 16, 'diecisiete': 17, 'dieciocho': 18, 'diecinueve': 19,
    'veinte': 20, 'veintiuno': 21, 'veintidos': 22, 'veintitres': 23, 'veinticuatro': 24, 'veinticinco': 25,
    'treinta': 30, 'cuarenta': 40, 'cincuenta': 50, 'sesenta': 60, 'setenta': 70, 'ochenta': 80, 'noventa': 90,
    'cien': 100, 'ciento': 100, 'doscientos': 200, 'trescientos': 300, 'cuatrocientos': 400, 'quinientos': 500,
    'seiscientos': 600, 'setecientos': 700, 'ochocientos': 800, 'novecientos': 900,
    // Multiplicadores
    'mil': 1000, 'millon': 1000000, 'millones': 1000000
};

export const parseVoiceInput = (text: string): ParsedVoiceResult | null => {
    let cleanText = text.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Eliminar tildes
        .replace(/[.,]/g, '') // Eliminar puntuación
        .trim();

    // 0. Detectar Comandos
    const deleteKeywords = ['borrar', 'eliminar', 'corregir', 'deshacer', 'atras', 'quitar'];
    if (deleteKeywords.some(keyword => cleanText.includes(keyword))) {
        return {
            type: 'COMMAND',
            command: 'DELETE_LAST',
            rawText: text
        };
    }

    // 1. Tokenización y mapeo inicial
    const tokens = cleanText.split(/\s+/);

    // Convertir tokens a valores numéricos o mantener el texto
    // Usamos una estructura intermedia para saber si es número o texto
    type Token = { val: number | string, isNum: boolean, original: string };

    let processedTokens: Token[] = tokens.map(t => {
        // Casos especiales como "2", "100" escritos en dígitos
        if (!isNaN(Number(t))) {
            return { val: Number(t), isNum: true, original: t };
        }
        const mapped = NUMBER_WORDS[t];
        if (mapped !== undefined) {
            return { val: mapped, isNum: true, original: t };
        }
        return { val: t, isNum: false, original: t };
    });

    // 2. Combinación de Decenas + 'y' + Unidades (ej: "cuarenta" "y" "dos" -> 42)
    // Debemos iterar y comprimir la lista
    const mergedTokens: Token[] = [];
    for (let i = 0; i < processedTokens.length; i++) {
        const curr = processedTokens[i];

        // Mirar patrón: [NUM > 29] + ["y" literal] + [NUM < 10]
        if (curr.isNum && (curr.val as number) >= 20 && (curr.val as number) < 100) {
            const next1 = processedTokens[i + 1];
            const next2 = processedTokens[i + 2];

            if (next1 && next1.original === 'y' && next2 && next2.isNum && (next2.val as number) < 10) {
                // Fusionar
                const newVal = (curr.val as number) + (next2.val as number);
                mergedTokens.push({ val: newVal, isNum: true, original: `${curr.original} y ${next2.original}` });
                i += 2; // Saltar 'y' y el siguiente número
                continue;
            }
        }
        mergedTokens.push(curr);
    }

    // 3. Aplicación de Multiplicadores (ej: "42" "mil" -> 42000)
    // Manejo de 'mil' y 'millon'. 
    // Nota: "mil quinientos" -> 1500. "Dos mil quinientos" -> 2500.
    // Estrategia: Agrupar números adyacentes multiplicando si el siguiente es mayor (multiplicador) o sumando si es menor (aditivo).
    // Simplificación para este caso: Detectar multiplicadores explícitos (1000, 1000000).

    const finalNumbers: number[] = [];
    let currentAccumulator = 0;
    let hasAccumulator = false;

    // Pasada para resolver multiplicaciones
    // Vamos a extraer solo las secuencias de números y operarlas

    // Nueva estrategia: Recorrer, si encontramos números los vamos acumulando en un buffer temporal para resolver su valor total
    let tempBuffer: number[] = [];

    const flushBuffer = () => {
        if (tempBuffer.length === 0) return;

        // Resolver el valor del buffer. Ej: [2, 1000, 500] -> 2500
        // Ej: [1000, 500] -> 1500 (implícito un 'mil')

        let total = 0;
        let currentGroup = 0;

        for (let j = 0; j < tempBuffer.length; j++) {
            let val = tempBuffer[j];

            if (val === 1000 || val === 1000000) {
                // Multiplicador
                if (currentGroup === 0) currentGroup = 1; // "mil" a secas es 1000
                currentGroup *= val;

                // Si es un multiplicador mayor (millón), a veces cierra un grupo, pero 'mil' suele seguir.
                // Simplificación: sumamos al total y reseteamos grupo local?
                // Mejor: Sumar al total global, porque "dos mil" (2000) "quinientos" (500) -> 2000 + 500
                total += currentGroup;
                currentGroup = 0;
            } else {
                // Número normal (aditivo)
                // Si ya teníamos un valor en currentGroup (ej: "ciento" 100), y viene otro "cincuenta" 50 -> sumar
                // Pero si teníamos "dos" (2) y viene "mil", el 2 se multiplica.
                // El problema es [100, 50].

                // En español, los números van descendiendo o multiplicando.
                // 100 + 50 = 150.
                if (val > currentGroup) {
                    // Si el nuevo es mayor que lo que llevamos, podría ser un error o nueva secuencia?
                    // Excepto si currentGroup es 0.
                }
                currentGroup += val;
            }
        }
        total += currentGroup;
        finalNumbers.push(total);
        tempBuffer = [];
    };

    for (let i = 0; i < mergedTokens.length; i++) {
        const t = mergedTokens[i];
        if (t.isNum) {
            tempBuffer.push(t.val as number);
        } else {
            // Se rompió la racha de números (palabra no numérica)
            flushBuffer();
        }
    }
    flushBuffer(); // Flush final

    // 4. Extracción final de Cantidad y Precio
    if (finalNumbers.length >= 2) {
        // [8, 42000]
        return {
            type: 'RECORD',
            data: {
                quantity: finalNumbers[0],
                unitPrice: finalNumbers[1],
                rawText: text,
                productIdentifier: text,
                subtotal: finalNumbers[0] * finalNumbers[1]
            }
        };
    }

    return null;
};
