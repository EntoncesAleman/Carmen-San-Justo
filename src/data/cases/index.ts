import { CaseDefinition } from '../types';
import { caso1Medialunas } from './caso1_medialunas';
import { caso2Contador } from './caso2_contador';
import { caso3Trofeo } from './caso3_trofeo';

// Registro central de casos. Agregar un caso nuevo = agregar un archivo acá
// y sumarlo a este arreglo. Ningún system ni scene debe importar un caso
// directamente por nombre.
export const CASES: CaseDefinition[] = [caso1Medialunas, caso2Contador, caso3Trofeo];

export function getCase(id: string): CaseDefinition | undefined {
    return CASES.find((c) => c.id === id);
}

export function getFirstCase(): CaseDefinition {
    return CASES[0];
}
