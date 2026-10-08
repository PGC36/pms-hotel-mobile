import type { HousekeepingChecklistDTO } from '../src/modules/housekeeping/dtos/checklist.dto';
import { selectTurnoverChecklist } from '../src/modules/housekeeping/mappers/checklist.mapper';

function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected)
    throw new Error(`${message}: esperaba ${String(expected)}, obtuvo ${String(actual)}`);
}

const checklist: HousekeepingChecklistDTO = {
  id: 'turnover',
  serviceRequestId: null,
  roomId: 'room',
  status: 'in_progress',
  createdAt: '2026-10-08T10:00:00Z',
  items: [
    { id: 'second', label: 'Baño', checked: false, position: 1, notes: null },
    { id: 'first', label: 'Cama', checked: true, position: 0, notes: null },
  ],
};

assertEqual(selectTurnoverChecklist([]), null, 'Sin checklist');
assertEqual(
  selectTurnoverChecklist([
    {
      ...checklist,
      id: 'request',
      serviceRequestId: 'request-id',
      createdAt: '2026-10-08T12:00:00Z',
    },
    { ...checklist, id: 'old', createdAt: '2026-10-07T10:00:00Z' },
    checklist,
    { ...checklist, id: 'cancelled', status: 'cancelled', createdAt: '2026-10-08T13:00:00Z' },
  ])?.id,
  'turnover',
  'Selecciona el último recambio activo',
);
assertEqual(
  selectTurnoverChecklist([checklist])
    ?.items.map((item) => item.id)
    .join(','),
  'first,second',
  'Ordena los ítems',
);

console.log('Housekeeping checklist selection passed.');
