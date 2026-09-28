import MultiSelect from '@/components/select/MultiSelect'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {
  HolofoilPattern,
  holofoilPatterns,
  Pattern,
  ReverseHolofoilPattern,
  reverseHolofoilPatterns
} from '@/consts/pattern'
import {variant, Variant} from '@/consts/variant'

type VariantFilterProps = {
  options: (Variant | Pattern)[]
  onChange: (options: {
    label: string
    value: (Variant | Pattern) | null
  }) => void
  selected: (Variant | Pattern) | null
}

const VariantFilter: React.FC<VariantFilterProps> = ({
  options,
  onChange,
  selected
}) => {
  const {messages} = useSiteI18n()
  return options.length > 1 ? (
    <MultiSelect
      innerLabel={messages.filterByVariant}
      label={messages.variant}
      onChange={selectedOptions => {
        const selectedOption =
          selectedOptions.filter(o => o.value !== selected)[0] || null
        onChange({
          label: selectedOption?.label || messages.allVariants,
          value: selectedOption?.value
            ? selectedOption.value === selected
              ? null
              : (selectedOption.value as Variant | Pattern)
            : null
        })
      }}
      options={options.map(option => ({
        label:
          variant[option as Variant] ||
          reverseHolofoilPatterns[option as ReverseHolofoilPattern] ||
          holofoilPatterns[option as HolofoilPattern],
        value: option
      }))}
      placeholder={messages.allVariants}
      selected={selected ? [selected] : undefined}
    />
  ) : null
}

export default VariantFilter
