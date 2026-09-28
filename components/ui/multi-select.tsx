'use client'

import * as React from 'react'

import {useEffect} from 'react'

import {Command as CommandPrimitive, useCommandState} from 'cmdk'
import {ChevronDown, XIcon} from 'lucide-react'

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList
} from '@/components/ui/command'
import {cn} from '@/lib/utils'
import {Dialog} from 'radix-ui'
import {useSiteI18n} from '@/components/sitei18n/SiteI18nProvider'

export interface Option {
  icon?: React.FC<React.SVGProps<SVGSVGElement>>
  value: string
  label: string
  disable?: boolean

  /** fixed option that can't be removed. */
  fixed?: boolean

  /** Group the options by providing key. */
  [key: string]:
    | string
    | boolean
    | undefined
    | React.FC<React.SVGProps<SVGSVGElement>>
}
interface GroupOption {
  [key: string]: Option[]
}

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]

  /** manually controlled options */
  options?: Option[]
  placeholder?: string

  /**
   * sync search. This search will not showing loadingIndicator.
   * The rest props are the same as async search.
   * i.e.: creatable, groupBy, delay.
   **/
  onChange?: (options: Option[]) => void

  /** Limit the maximum number of selected options. */
  maxSelected?: number

  /** When the number of selected options exceeds the limit, the onMaxSelected will be called. */
  onMaxSelected?: (maxLimit: number) => void

  /** Hide the placeholder when there are options selected. */
  disabled?: boolean

  /** Group the options base on provided key. */
  groupBy?: string
  className?: string
  badgeClassName?: string

  /** Allow user to create option when there is no option matched. */
  creatable?: boolean

  /** Props of `Command` */
  commandProps?: React.ComponentPropsWithoutRef<typeof Command>

  /** Props of `CommandInput` */
  inputProps?: Omit<
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>,
    'value' | 'placeholder' | 'disabled'
  >

  innerLabel?: string
}

export interface MultipleSelectorRef {
  selectedValue: Option[]
  input: HTMLInputElement
  focus: () => void
  reset: () => void
}

function transToGroupOption(options: Option[], groupBy?: string) {
  if (options.length === 0) return {}

  if (!groupBy)
    return {
      '': options
    }

  const groupOption: GroupOption = {}

  options.forEach(option => {
    const key = (option[groupBy] as string) || ''

    if (!groupOption[key]) {
      groupOption[key] = []
    }

    groupOption[key].push(option)
  })

  return groupOption
}

function removePickedOption(groupOption: GroupOption, picked: Option[]) {
  const options = {} as GroupOption
  for (const [key, value] of Object.entries(groupOption)) {
    options[key] = value.filter(val => !picked.find(p => p.value === val.value))
  }
  return options
}

const CommandEmpty = ({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) => {
  const render = useCommandState(state => state.filtered.count === 0)

  if (!render) return null

  return (
    <div
      className={cn('px-2 py-4 text-center text-sm', className)}
      cmdk-empty=""
      role="presentation"
      {...props}
    />
  )
}

CommandEmpty.displayName = 'CommandEmpty'

const MultipleSelector = ({
  value,
  onChange,
  placeholder,
  defaultOptions: arrayDefaultOptions = [],
  maxSelected = Number.MAX_SAFE_INTEGER,
  onMaxSelected,
  disabled,
  groupBy,
  className,
  badgeClassName,
  commandProps,
  inputProps,
  innerLabel
}: MultipleSelectorProps) => {
  const {messages} = useSiteI18n()
  const [open, setOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null) // Added this

  const [selected, setSelected] = React.useState<Option[]>(value || [])

  const options = transToGroupOption(arrayDefaultOptions, groupBy)

  // const handleClickOutside = (event: MouseEvent | TouchEvent) => {
  //   if (
  //     dropdownRef.current &&
  //     !dropdownRef.current.contains(event.target as Node)
  //   ) {
  //     setOpen(false)
  //   }
  // }

  const handleUnselect = React.useCallback(
    (option: Option) => {
      const newOptions = selected.filter(s => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)
    },
    [onChange, selected]
  )

  // useEffect(() => {
  //   if (open) {
  //     document.addEventListener('mousedown', handleClickOutside)
  //     document.addEventListener('touchend', handleClickOutside)
  //   } else {
  //     document.removeEventListener('mousedown', handleClickOutside)
  //     document.removeEventListener('touchend', handleClickOutside)
  //   }

  //   return () => {
  //     document.removeEventListener('mousedown', handleClickOutside)
  //     document.removeEventListener('touchend', handleClickOutside)
  //   }
  // }, [open])

  const selectables = React.useMemo<GroupOption>(
    () => removePickedOption(options, selected),
    [options, selected]
  )

  useEffect(() => {
    if (!open || !dropdownRef.current) return

    const rect = dropdownRef.current.getBoundingClientRect()

    document.documentElement.style.setProperty(
      '--trigger-left',
      `${rect.left}px`
    )
    document.documentElement.style.setProperty(
      '--trigger-top',
      `${rect.bottom}px`
    )
    document.documentElement.style.setProperty(
      '--trigger-width',
      `${rect.width}px`
    )
  }, [open])

  return (
    <Command
      ref={dropdownRef}
      {...commandProps}
      onKeyDown={e => {
        commandProps?.onKeyDown?.(e)
      }}
      className={cn(
        'h-auto overflow-visible bg-transparent',
        commandProps?.className
      )}
      shouldFilter={
        commandProps?.shouldFilter !== undefined
          ? commandProps.shouldFilter
          : false
      }
    >
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <div
          className={cn(
            'relative pointer-events-auto border-input has-aria-invalid:ring-destructive/20 dark:has-aria-invalid:ring-destructive/40 has-aria-invalid:border-destructive relative min-h-[38px] rounded-md border text-sm transition-[color,box-shadow] outline-none has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50',
            {
              'p-1': selected.length !== 0,
              'cursor-text': !disabled && selected.length !== 0
            },
            'pr-9',
            className,
            open ? 'hover:bg-background z-20' : 'hover:bg-accent'
          )}
          onClick={() => {
            if (disabled) return
          }}
        >
          <div className="flex flex-nowrap gap-1">
            {selected.map(option => {
              return (
                <div
                  key={option.value}
                  className={cn(
                    'animate-fadeIn bg-background text-secondary-foreground hover:bg-background relative inline-flex h-6.5 cursor-default items-center rounded-md border pr-7 pl-2 text-xs font-medium transition-all disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 data-fixed:pr-2 gap-2 whitespace-nowrap',
                    badgeClassName
                  )}
                  data-fixed={option.fixed}
                  data-disabled={disabled || undefined}
                >
                  {option.icon && React.isValidElement(<option.icon />)
                    ? React.cloneElement(<option.icon />, {
                        'aria-hidden': 'true',
                        className: 'opacity-60',
                        size: 16,
                        width: 16,
                        height: 16
                      })
                    : null}
                  {option.label}
                  <button
                    className="text-muted-foreground/80 hover:text-foreground absolute -inset-y-px -right-px flex size-6.5 items-center justify-center rounded-r-md border border-transparent p-0 outline-hidden transition-[color,box-shadow] outline-none cursor-pointer"
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        handleUnselect(option)
                        setOpen(false)
                      }
                    }}
                    onMouseDown={e => {
                      e.preventDefault()
                      e.stopPropagation()
                    }}
                    onClick={() => {
                      handleUnselect(option)
                      setOpen(false)
                    }}
                    aria-label={messages.remove}
                  >
                    <XIcon size={14} aria-hidden="true" />
                  </button>
                </div>
              )
            })}
            <div
              className={cn(
                'flex items-center content-center gap-2 cursor-default placeholder:text-muted-foreground/70 flex-1 bg-transparent outline-hidden disabled:cursor-not-allowed',
                {
                  'px-3 py-2': selected.length === 0
                },
                inputProps?.className,
                open ? 'bg-background hover:bg-background' : 'hover:bg-accent',
                {
                  'pl-2': selected.length === 0
                }
              )}
              onClick={() => {
                setOpen(o => !o)
              }}
            >
              {selected.length !== 0 ? (
                ''
              ) : (
                <span className="whitespace-nowrap">{placeholder}</span>
              )}
              <button
                type="button"
                className="text-foreground/60 rounded-md transition-[color,box-shadow] outline-none"
                aria-label={messages.toggleDropdown}
              >
                <ChevronDown size={16} aria-hidden="true" className="-me-1" />
              </button>
            </div>
          </div>
        </div>
        <Dialog.Portal>
          <Dialog.Overlay
            className={cn('fixed inset-0 bg-transparent', open && 'z-10')}
          />
          <Dialog.Content
            className={cn(
              'fixed pointer-events-auto mt-1 left-[var(--trigger-left)] top-[var(--trigger-top)] w-auto min-w-[min(250px,calc(var(--trigger-width)+30px))] overflow-hidden rounded-md border bg-popover shadow-lg max-h-[calc(100vh-var(--trigger-top)-10px)]',
              'data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 min-w-40 overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
              open && 'z-50'
            )}
            aria-label={messages.selectItems}
            onInteractOutside={e => {
              // Prevent dialog from closing when clicking inside the input or trigger
              if (dropdownRef.current?.contains(e.target as Node)) {
                e.preventDefault()
              }
            }}
            style={{'--radius': '8px'} as React.CSSProperties}
          >
            <Dialog.Title className="sr-only">
              {messages.selectItems}
            </Dialog.Title>
            <CommandList className="bg-popover text-popover-foreground outline-hidden overflow-y-auto max-h-[inherit]">
              <>
                <CommandItem value="-" className="hidden" />
                {Object.entries(selectables).map(([key, dropdowns]) => (
                  <CommandGroup key={key} heading={key}>
                    {innerLabel && dropdowns.length > 0 && (
                      <div
                        data-slot="select-label"
                        className="text-muted-foreground px-2 py-1.5 text-xs whitespace-nowrap"
                      >
                        {innerLabel}
                      </div>
                    )}
                    {dropdowns.map(option => (
                      <CommandItem
                        key={option.value}
                        value={option.value}
                        disabled={option.disable}
                        onPointerDown={e => {
                          e.preventDefault()
                          e.stopPropagation()
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.removeAttribute('data-selected')
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.setAttribute('data-selected', 'true')
                        }}
                        onSelect={() => {
                          if (
                            maxSelected !== 1 &&
                            selected.length >= maxSelected
                          ) {
                            onMaxSelected?.(selected.length)
                            return
                          } else if (maxSelected === 1) {
                            setSelected([option])
                            onChange?.([option])
                            setOpen(false)
                            return
                          }
                          const newOptions = [...selected, option]
                          setSelected(newOptions)
                          onChange?.(newOptions)
                        }}
                        className={cn(
                          'cursor-pointer',
                          option.disable &&
                            'pointer-events-none cursor-not-allowed opacity-50'
                        )}
                      >
                        {option.icon && React.isValidElement(<option.icon />)
                          ? React.cloneElement(<option.icon />, {
                              'aria-hidden': 'true',
                              className: 'opacity-60',
                              size: 16
                            })
                          : null}
                        {option.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </>
            </CommandList>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </Command>
  )
}

MultipleSelector.displayName = 'MultipleSelector'
export default MultipleSelector
