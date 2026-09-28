import MultiSelect from '@/components/select/MultiSelect'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'
import {Energy} from '@/consts/energy'

type PokemonFilterProps = {
  options: {
    label: string
    value: string
  }[]
  onChange: (options: {label: string; value: Energy | null}) => void
  selected: string | null
}

const PokemonFilter: React.FC<PokemonFilterProps> = ({
  options,
  onChange,
  selected
}) => {
  const {messages} = useSiteI18n()
  return options.length > 1 ? (
    <MultiSelect
      innerLabel={messages.filterByPokemon}
      label="Pokémon"
      onChange={selectedOptions => {
        const selectedOption =
          selectedOptions.filter(o => o.value !== selected)[0] || null
        onChange({
          label: selectedOption?.label || messages.allPokemon,
          value: selectedOption?.value
            ? selectedOption.value === selected
              ? null
              : (selectedOption.value as Energy)
            : null
        })
      }}
      options={options}
      placeholder={messages.allPokemon}
      selected={selected ? [selected] : undefined}
    />
  ) : null
}

export default PokemonFilter
