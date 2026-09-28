import MultiSelect from '@/components/select/MultiSelect'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {getRarityIcon, Rarity, rarity} from '@/consts/rarity'

type RarityFilterProps = {
  options: Rarity[]
  onChange: (options: {label: string; value: Rarity | null}) => void
  selected: Rarity | null
}

const RarityFilter: React.FC<RarityFilterProps> = ({
  options,
  onChange,
  selected
}) => {
  const {messages} = useSiteI18n()
  return options.length > 1 ? (
    <MultiSelect
      label={messages.rarity}
      innerLabel={messages.filterByRarity}
      onChange={selectedOptions => {
        const selectedOption =
          selectedOptions.filter(o => o.value !== selected)[0] || null
        onChange({
          label: selectedOption?.label || messages.anyRarity,
          value: selectedOption?.value
            ? selectedOption.value === selected
              ? null
              : (selectedOption.value as Rarity)
            : null
        })
      }}
      options={options.map(option => ({
        icon: getRarityIcon(option),
        label: `${rarity[option]}`,
        value: `${option}`
      }))}
      placeholder={messages.anyRarity}
      selected={selected !== null ? [selected] : undefined}
    />
  ) : null
}

export default RarityFilter
