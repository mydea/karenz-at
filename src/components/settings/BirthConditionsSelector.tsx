import { BirthCondition } from '@/types';
import { CheckboxGroup } from '@/components/ui';

interface BirthConditionsSelectorProps {
  values: BirthCondition[];
  onChange: (values: BirthCondition[]) => void;
}

const BIRTH_CONDITION_OPTIONS = [
  {
    value: BirthCondition.CESAREAN,
    label: 'Kaiserschnitt',
    description: 'Verlängert Mutterschutz auf 12 Wochen nach Geburt',
  },
  {
    value: BirthCondition.PREMATURE,
    label: 'Frühgeburt',
    description: 'Verlängert Mutterschutz auf 12 Wochen nach Geburt',
  },
  {
    value: BirthCondition.TWINS,
    label: 'Zwillinge',
    description: 'Mehrlingszuschlag +€7,27/Tag',
  },
  {
    value: BirthCondition.TRIPLETS_OR_MORE,
    label: 'Drillinge oder mehr',
    description: 'Höherer Mehrlingszuschlag',
  },
  {
    value: BirthCondition.COMPLICATED_BIRTH,
    label: 'Komplikationen bei der Geburt',
    description: 'Kann Mutterschutz verlängern (ärztliches Attest erforderlich)',
  },
];

export function BirthConditionsSelector({ values, onChange }: BirthConditionsSelectorProps) {
  // If twins is selected, remove triplets and vice versa
  const handleChange = (newValues: BirthCondition[]) => {
    // Can't have both twins and triplets
    if (newValues.includes(BirthCondition.TWINS) && newValues.includes(BirthCondition.TRIPLETS_OR_MORE)) {
      // Keep the most recently added one
      const hadTwins = values.includes(BirthCondition.TWINS);
      const hadTriplets = values.includes(BirthCondition.TRIPLETS_OR_MORE);
      
      if (hadTwins && !hadTriplets) {
        // Triplets was just added, remove twins
        newValues = newValues.filter((v) => v !== BirthCondition.TWINS);
      } else if (hadTriplets && !hadTwins) {
        // Twins was just added, remove triplets
        newValues = newValues.filter((v) => v !== BirthCondition.TRIPLETS_OR_MORE);
      }
    }
    
    onChange(newValues);
  };

  return (
    <div className="card space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Besondere Umstände bei der Geburt</h3>
        <p className="mt-1 text-sm text-gray-500">
          Diese Angaben sind relevant für die Berechnung des Mutterschutzes und mögliche Zuschläge.
        </p>
      </div>

      <CheckboxGroup
        values={values}
        onChange={handleChange}
        options={BIRTH_CONDITION_OPTIONS}
      />

      {values.length > 0 && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            <strong>Ausgewählt:</strong>{' '}
            {values
              .map((v) => BIRTH_CONDITION_OPTIONS.find((o) => o.value === v)?.label)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
