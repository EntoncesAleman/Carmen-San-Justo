import { GangMember } from './types';

// "Los Administradores" — banda ficticia y caricaturesca, organizada como una
// oficina pública. Contexto narrativo únicamente: ningún dato acá describe
// procedimientos reales de ningún delito.
export const GANG_NAME = 'Los Administradores';

export const GANG_MEMBERS: GangMember[] = [
    { id: 'delia_robirosa', nombre: 'Delia Robirosa', apodo: 'La Directora', rol: 'Líder', descripcion: 'Dirige la banda como si fuera una gerencia de organismo público. Todo pasa por "el formulario correspondiente".' },
    { id: 'renato_uzal', nombre: 'Renato Uzal', apodo: 'El Escribano', rol: 'Segundo al mando', descripcion: 'Frío y preciso. Cita reglamentos internos de la banda como si fueran ley.' },
    { id: 'chiche_molina', nombre: 'Chiche Molina', apodo: 'El Contador', rol: 'Especialista financiero', descripcion: 'Obsesionado con las facturas. Una vez auditó a la propia banda y encontró un faltante.' },
    { id: 'pampa_ledesma', nombre: 'Ledesma', apodo: 'Pampa', rol: 'Conductor', descripcion: 'Ex taxista, conoce cada atajo del Cinturón. El único con sentido común del grupo.' },
    { id: 'osvaldo_pais', nombre: 'Osvaldo Pais', apodo: 'El Loro', rol: 'Informante', descripcion: 'Habla tanto que ya no se sabe qué información es real y cuál inventó para sonar importante.' },
    { id: 'tinta_robledo', nombre: 'Robledo', apodo: 'Tinta', rol: 'Falsificador ficticio de sellos y membretes', descripcion: 'Su trabajo cuela solo porque nadie mira los papeles con atención.' },
    { id: 'gps_herrera', nombre: 'Herrera', apodo: 'GPS', rol: 'Organiza rutas', descripcion: 'Memorizó cada calle del Cinturón. No memorizó, en cambio, ningún nombre de persona.' },
    { id: 'bocha_fernandez', nombre: 'Fernández', apodo: 'Bocha', rol: 'El incompetente', descripcion: 'Está en la banda por parentesco con La Directora, no por mérito. Arruina un plan por capítulo.' },
];

export function getGangMember(id: string): GangMember | undefined {
    return GANG_MEMBERS.find((m) => m.id === id);
}
