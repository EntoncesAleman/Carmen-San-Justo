import { SuspectProfile } from './types';

// Base de datos del Sistema de Inteligencia Criminal. Incluye a los cacos
// reales de cada caso (id = NPC confrontable) y señuelos con atributos
// parcialmente compartidos, para que armar el identikit sea una deducción
// real y no una elección trivial.
export const SUSPECTS: SuspectProfile[] = [
    {
        id: 'el_ingeniero_contreras',
        nombreClave: '"El Ingeniero"',
        atributos: {
            cabello: 'Negro',
            ojos: 'Marrones',
            vehiculo: 'Peugeot 504',
            profesion: 'Ingeniero trucho',
            hobby: 'Numerología',
            comida: 'Medialunas',
        },
    },
    {
        id: 'chiche_molina',
        nombreClave: '"El Contador"',
        atributos: {
            cabello: 'Canoso',
            ojos: 'Verdes',
            vehiculo: 'Fiat Duna',
            profesion: 'Contador',
            hobby: 'Truco',
            comida: 'Empanadas',
        },
    },
    {
        id: 'senuelo_kiosquero',
        nombreClave: '"El Turco Paredes"',
        atributos: {
            cabello: 'Negro',
            ojos: 'Verdes',
            vehiculo: 'Ford Falcon',
            profesion: 'Kiosquero',
            hobby: 'Palomas',
            comida: 'Medialunas',
        },
    },
    {
        id: 'senuelo_remisero',
        nombreClave: '"El Colo Funes"',
        atributos: {
            cabello: 'Rubio',
            ojos: 'Marrones',
            vehiculo: 'Renault 12',
            profesion: 'Remisero',
            hobby: 'Pesca',
            comida: 'Bondiola',
        },
    },
    {
        id: 'senuelo_gestor',
        nombreClave: '"El Vasco Iturri"',
        atributos: {
            cabello: 'Canoso',
            ojos: 'Azules',
            vehiculo: 'Bicicleta',
            profesion: 'Falso gestor',
            hobby: 'Fileteado porteño',
            comida: 'Milanesas',
        },
    },
    {
        id: 'senuelo_contador_falso',
        nombreClave: '"Media Suela" Bianchi',
        atributos: {
            cabello: 'Pelado',
            ojos: 'Verdes',
            vehiculo: 'Peugeot 504',
            profesion: 'Contador',
            hobby: 'Numerología',
            comida: 'Empanadas',
        },
    },
    {
        id: 'bocha_ferreyra',
        nombreClave: '"El Bocha" Ferreyra',
        atributos: {
            cabello: 'Rubio',
            ojos: 'Marrones',
            vehiculo: 'Combi Volkswagen',
            profesion: 'Utilero',
            hobby: 'Truco',
            comida: 'Bondiola',
        },
    },
    // Señuelos agregados junto con el Caso 3, pensados para tapar dos
    // atributos que hasta acá eran únicos en toda la base — y que por lo
    // tanto resolvían el identikit de un solo golpe con una sola pista:
    // `profesion: 'Ingeniero trucho'` (solo el caco del Caso 1) y
    // `vehiculo: 'Fiat Duna'` (solo el caco del Caso 2). Ver
    // CrimeComputerSystem.test.ts → "ningún atributo revelado es único".
    {
        id: 'senuelo_utilero_rival',
        nombreClave: '"Cabezón" Bermúdez',
        atributos: {
            cabello: 'Pelado',
            ojos: 'Azules',
            vehiculo: 'Combi Volkswagen',
            profesion: 'Utilero',
            hobby: 'Pesca',
            comida: 'Milanesas',
        },
    },
    {
        id: 'senuelo_ingeniero_trucho_2',
        nombreClave: '"El Junior" Robledo',
        atributos: {
            cabello: 'Negro',
            ojos: 'Azules',
            vehiculo: 'Fiat Duna',
            profesion: 'Ingeniero trucho',
            hobby: 'Pesca',
            comida: 'Milanesas',
        },
    },
    // Operativos nuevos para que el pool de "posibles cacos" del generador
    // de casos (ver data/generator/operatives.ts) no repita siempre a los
    // mismos 3. Cada atributo elegido reutiliza un valor que ya comparte
    // otro sospechoso de la base — nunca uno nuevo sin señuelo — para no
    // reintroducir la falla de "una sola pista resuelve todo" (ver
    // CrimeComputerSystem.test.ts).
    {
        id: 'colorada_benitez',
        nombreClave: '"La Colorada" Benítez',
        atributos: {
            cabello: 'Rubio',
            ojos: 'Verdes',
            vehiculo: 'Bicicleta',
            profesion: 'Peluquera',
            hobby: 'Fileteado porteño',
            comida: 'Bondiola',
        },
    },
    {
        id: 'media_lengua_vidal',
        nombreClave: '"Media Lengua" Vidal',
        atributos: {
            cabello: 'Pelado',
            ojos: 'Marrones',
            vehiculo: 'Ford Falcon',
            profesion: 'Locutor',
            hobby: 'Palomas',
            comida: 'Empanadas',
        },
    },
    {
        id: 'tuerto_ibarra',
        nombreClave: '"El Tuerto" Ibarra',
        atributos: {
            cabello: 'Canoso',
            ojos: 'Azules',
            vehiculo: 'Renault 12',
            profesion: 'Chapista',
            hobby: 'Truco',
            comida: 'Milanesas',
        },
    },
    // Señuelos de los 3 operativos nuevos: comparten SOLO la profesión
    // (el único valor nuevo que introduce cada uno), el resto son valores
    // ya compartidos en la base a propósito.
    {
        id: 'senuelo_peluquero',
        nombreClave: '"Rulos" Andrada',
        atributos: {
            cabello: 'Negro',
            ojos: 'Marrones',
            vehiculo: 'Peugeot 504',
            profesion: 'Peluquera',
            hobby: 'Numerología',
            comida: 'Empanadas',
        },
    },
    {
        id: 'senuelo_locutor',
        nombreClave: '"Micrófono" Salcedo',
        atributos: {
            cabello: 'Rubio',
            ojos: 'Verdes',
            vehiculo: 'Fiat Duna',
            profesion: 'Locutor',
            hobby: 'Truco',
            comida: 'Medialunas',
        },
    },
    {
        id: 'senuelo_chapista',
        nombreClave: '"Fierrero" Domato',
        atributos: {
            cabello: 'Pelado',
            ojos: 'Azules',
            vehiculo: 'Combi Volkswagen',
            profesion: 'Chapista',
            hobby: 'Pesca',
            comida: 'Bondiola',
        },
    },
];

export function getSuspect(id: string): SuspectProfile | undefined {
    return SUSPECTS.find((s) => s.id === id);
}

// Devuelve todos los sospechosos cuyos atributos coinciden con TODOS los
// pares clave/valor conocidos hasta el momento (identikit parcial).
export function filterSuspects(known: Partial<Record<string, string>>): SuspectProfile[] {
    const entries = Object.entries(known).filter(([, v]) => !!v);
    if (entries.length === 0) return SUSPECTS;
    return SUSPECTS.filter((s) => entries.every(([key, value]) => s.atributos[key as keyof typeof s.atributos] === value));
}
