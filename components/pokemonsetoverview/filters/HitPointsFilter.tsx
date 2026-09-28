import MultiSelect from '@/components/select/MultiSelect'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'

type HitPointsFilterProps = {
  options: number[]
  onChange: (options: {label: string; value: number | null}) => void
  selected: number | null
}

const HitPointsFilter: React.FC<HitPointsFilterProps> = ({
  options,
  onChange,
  selected
}) => {
  const {messages} = useSiteI18n()
  return options.length > 1 ? (
    <MultiSelect
      label={messages.hitPoints}
      innerLabel={messages.filterByHitPoints}
      onChange={selectedOptions => {
        const selectedOption =
          selectedOptions.filter(o => o.value !== `${selected}`)[0] || null
        onChange({
          label: selectedOption?.label || messages.anyHitPoints,
          value: selectedOption?.value
            ? Number(selectedOption.value) === selected
              ? null
              : Number(selectedOption.value)
            : null
        })
      }}
      options={options.map(option => ({
        label: `${option} HP`,
        value: `${option}`
      }))}
      placeholder={messages.anyHitPoints}
      selected={selected !== null ? [`${selected}`] : undefined}
    />
  ) : null
}

export default HitPointsFilter
