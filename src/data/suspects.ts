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
