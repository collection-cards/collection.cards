import MultiSelect from '@/components/select/MultiSelect'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {Energy, energy, getEnergyIcon} from '@/consts/energy'

type EnergyFilterProps = {
  options: Energy[]
  onChange: (options: {label: string; value: Energy | null}) => void
  selected: Energy | null
}

const EnergyFilter: React.FC<EnergyFilterProps> = ({
  options,
  onChange,
  selected
}) => {
  const {messages} = useSiteI18n()
  return options.length > 1 ? (
    <MultiSelect
      innerLabel={messages.filterByEnergy}
      label={messages.energy}
      onChange={selectedOptions => {
        const selectedOption =
          selectedOptions.filter(o => o.value !== selected)[0] || null
        onChange({
          label: selectedOption?.label || messages.allEnergies,
          value: selectedOption?.value
            ? selectedOption.value === selected
              ? null
              : (selectedOption.value as Energy)
            : null
        })
      }}
      options={options.map(option => ({
        icon: getEnergyIcon(option),
        label: energy[option],
        value: option
      }))}
      placeholder={messages.allEnergies}
      selected={selected ? [selected] : undefined}
    />
  ) : null
}

export default EnergyFilter
