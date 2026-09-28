import MultiSelect from '@/components/select/MultiSelect'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {cardType, CardType} from '@/consts/cardtype'

type TypeFilterProps = {
  options: CardType[]
  onChange: (options: {label: string; value: CardType | null}) => void
  selected: CardType | null
}

const TypeFilter: React.FC<TypeFilterProps> = ({options, onChange, selected}) => {
  const {messages} = useSiteI18n()
  return options.length > 1 ? (
    <MultiSelect
      innerLabel={messages.filterByType}
      label={messages.type}
      onChange={selectedOptions => {
        const selectedOption =
          selectedOptions.filter(o => o.value !== selected)[0] || null
        onChange({
          label: selectedOption?.label || messages.allTypes,
          value: selectedOption?.value
            ? selectedOption.value === selected
              ? null
              : (selectedOption.value as CardType)
            : null
        })
      }}
      options={options.map(option => ({
        label: cardType[option],
        value: option
      }))}
      placeholder={messages.allTypes}
      selected={selected ? [selected] : undefined}
    />
  ) : null
}

export default TypeFilter
