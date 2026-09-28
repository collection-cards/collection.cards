'use client'

import {stackedCardOffset} from '@/consts/stack'
import {useWindowVirtualizer} from '@tanstack/react-virtual'
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import Card, {CardProps} from '../card/Card'
import CardModal from '../cardmodal/CardModal'
import CardModalPlaceholder from '../cardmodal/CardModalPlaceholder'
import NoResults from '../noresults/NoResults'
import PokemonCardDetails, {
  PokemonCardDetailsProps
} from '../pokemoncarddetails/PokemonCardDetails'
import {useSiteI18n} from '../sitei18n/SiteI18nProvider'
import CardGridRow from './CardGridRow'

const gapSize = 16
const containerPadding = 48
const sizes = `(max-width: 639px) calc(50vw - ${containerPadding}px - ${gapSize}px), (max-width: 676px) 187px, (max-width: 1023px) 230px, (max-width: 1279px) 232px,  (max-width: 1535px) 296px, 360px`

function getColumnCount(width: number): number {
  if (width < 640) return 2 // mobile
  if (width < 1024) return 3 // tablet
  return 4 // desktop
}

type Card = PokemonCardDetailsProps & Omit<CardProps, 'onClick' | 'sizes'>

export type CardGridProps = {
  cards: (Card | (Card & {variants: Card[]}))[]
  columns?: number
  isBinderLeftPage?: boolean
  isBinderRightPage?: boolean
  isStacked?: boolean
  pockets?: number
  setTotalHeight?: (height: number) => void
}

type State = {
  currentColumn: number
  currentRow: number
  currentIndex: number
  nextColumn: number | null
  nextRow: number | null
  nextIndex: number | null
  status: 'positioning' | 'opening' | 'open' | 'closing' | 'closed'
}

const defaultState: State = {
  currentColumn: 0,
  currentRow: 0,
  currentIndex: 0,
  nextColumn: null,
  nextRow: null,
  nextIndex: null,
  status: 'closed'
}

const CardGrid: React.FC<CardGridProps> = ({
  cards,
  columns,
  isBinderLeftPage,
  isBinderRightPage,
  isStacked,
  pockets,
  setTotalHeight
}) => {
  const {messages} = useSiteI18n()
  const gridRef = useRef<HTMLDivElement>(null)
  const [gridWidth, setGridWidth] = useState(0)
  const [state, setState] = useState<State>(defaultState)

  const resetStateEvent = useEffectEvent(() => {
    setState(defaultState)
  })

  useEffect(() => {
    resetStateEvent()
  }, [cards])

  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      setGridWidth(entries[0].contentRect.width)
    })

    const currentGrid = gridRef.current
    if (currentGrid) {
      observer.observe(currentGrid)
    }

    return () => {
      if (currentGrid) {
        observer.unobserve(currentGrid)
      }
    }
  }, [])

  const cardsWithPlaceholders = [...cards]
  if (pockets && cardsWithPlaceholders.length < pockets) {
    cardsWithPlaceholders.push(
      ...Array(pockets - cardsWithPlaceholders.length).fill({} as Card)
    )
  }

  const currentCard = cards[state.currentIndex]
  const extendedCard = useMemo(() => ({...currentCard, sizes}), [currentCard])
  const columnCount = useMemo(
    () => columns || getColumnCount(gridWidth),
    [gridWidth, columns]
  )
  const columnWidth = (gridWidth - (columnCount - 1) * gapSize) / columnCount
  const rowHeight = Math.floor(columnWidth * (1024 / 733) + gapSize) // maintain 408:555 ratio
  const rowCount = Math.ceil(cardsWithPlaceholders.length / columnCount)
  const hasNextButton = state.currentIndex < cards.length - 1
  const hasPrevButton = state.currentIndex > 0

  const rowHeights = useMemo(() => {
    const heights: number[] = []
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const start = rowIndex * columnCount
      const end = start + columnCount
      const rowItems = cards.slice(start, end)
      const maxVariantsInRow = Math.max(
        0,
        ...rowItems.map(card =>
          (card as Card & {variants: Card[]}).variants
            ? (card as Card & {variants: Card[]}).variants.length
            : 0
        )
      )

      const newRowHeight = rowHeight + stackedCardOffset * maxVariantsInRow

      heights[rowIndex] = newRowHeight === 1 ? 0 : newRowHeight
    }
    return heights
  }, [cards, columnCount, rowCount, rowHeight])

  useLayoutEffect(() => {
    if (setTotalHeight) {
      const totalHeight = rowHeights.reduce((a, b) => a + b, 0)
      if (totalHeight !== 0) setTotalHeight(totalHeight - gapSize)
    }
  }, [rowHeights, setTotalHeight, isStacked])

  const getRowHeight = useCallback(
    (rowIndex: number) => {
      if (!isStacked) return rowHeight
      return rowHeights[rowIndex]
    },
    [isStacked, rowHeight, rowHeights]
  )

  const virtualizer = useWindowVirtualizer({
    count: rowCount,
    estimateSize: getRowHeight,
    overscan: 2
  })

  useEffect(() => {
    virtualizer.measure()
  }, [isStacked, virtualizer, cards, gridWidth])

  const scrollToRow = useCallback(
    (rowIndex: number) => {
      virtualizer.scrollToIndex(rowIndex, {
        align: 'start',
        behavior: 'smooth'
      })
    },
    [virtualizer]
  )

  const handlePositioning = useEffectEvent(() => {
    if (
      state.currentRow === state.nextRow &&
      state.currentColumn === state.nextColumn
    ) {
      // already in position, skip to opening
      setState(s => ({
        ...s,
        status: 'opening'
      }))
    }
  })

  useEffect(() => {
    switch (state.status) {
      case 'positioning':
        handlePositioning()
        break
      case 'open':
        if (state.nextRow !== null && state.currentRow !== state.nextRow)
          scrollToRow(state.nextRow)
        break
    }
  }, [state, scrollToRow])

  useEffect(() => {
    virtualizer.measure()
  }, [rowHeight, columnCount, virtualizer])

  const nextHandler = useCallback(() => {
    const newNextSelectedIndex =
      state.currentIndex !== null ? state.currentIndex + 1 : 0
    setState(s => ({
      ...s,
      nextColumn: newNextSelectedIndex % columnCount,
      nextRow: Math.floor(newNextSelectedIndex / columnCount),
      nextIndex: newNextSelectedIndex,
      status: 'open'
    }))
  }, [state.currentIndex, columnCount])

  const prevHandler = useCallback(() => {
    const newNextSelectedIndex =
      state.currentIndex !== null ? state.currentIndex - 1 : 0
    setState(s => ({
      ...s,
      nextColumn: newNextSelectedIndex % columnCount,
      nextRow: Math.floor(newNextSelectedIndex / columnCount),
      nextIndex: newNextSelectedIndex,
      status: 'open'
    }))
  }, [state.currentIndex, columnCount])

  const onCloseModalHandler = useCallback(() => {
    setState(s => ({
      ...s,
      status: 'closing'
    }))
  }, [])

  const onExitCompleteHandler = useCallback(() => {
    setState(s => ({
      ...s,
      status: 'closed'
    }))
  }, [])

  const onOpenModalHandler = useCallback(() => {
    setState(s => ({
      ...s,
      status: s.status === 'opening' ? 'open' : s.status
    }))
  }, [])

  const onPlaceholderAnimationCompleteHandler = useCallback(() => {
    if (state.status !== 'closed') {
      // positioning the placeholder finished, open the modal
      setState(s => ({
        ...s,
        currentColumn: s.nextColumn!,
        currentRow: s.nextRow!,
        currentIndex: s.nextIndex!,
        status: s.status === 'positioning' ? 'opening' : s.status
      }))
    }
  }, [state.status])

  const top =
    rowHeights.reduce(
      (acc, height, index) =>
        index < (state.nextRow !== null ? state.nextRow : state.currentRow)
          ? acc + height
          : acc,
      0
    ) +
    rowHeights[state.nextRow !== null ? state.nextRow : state.currentRow] -
    rowHeight

  return (
    <>
      <div
        ref={gridRef}
        className="relative"
        style={{height: virtualizer.getTotalSize() - gapSize}}
      >
        {cards.length === 0 && (
          <NoResults
            contribute={true}
            title={messages.noResults}
            description={messages.noFilterResultsDescription}
          />
        )}
        {gridWidth > 0 && (
          <>
            {virtualizer.getVirtualItems().map(virtualRow => {
              const start = virtualRow.index * columnCount
              const end = start + columnCount
              const rowItems = cardsWithPlaceholders.slice(start, end)
              const onClickHandler = (column: number) => {
                setState(s => ({
                  ...s,
                  nextColumn: column,
                  nextRow: virtualRow.index,
                  nextIndex: start + column,
                  status: 'positioning'
                }))
              }

              return (
                <CardGridRow
                  activeCardId={
                    state.status === 'open' ? currentCard.id : undefined
                  }
                  cards={rowItems}
                  cardSizes={sizes}
                  columns={columnCount}
                  height={rowHeight - gapSize}
                  key={virtualRow.key}
                  onClickHandler={onClickHandler}
                  virtualRow={virtualRow}
                />
              )
            })}
            <CardModalPlaceholder
              card={extendedCard}
              columnWidth={columnWidth}
              gapSize={gapSize}
              height={rowHeight - gapSize}
              isBinderPage={
                isBinderLeftPage ? 'left' : isBinderRightPage ? 'right' : null
              }
              modalState={state.status}
              nextSelectionCol={
                state.nextColumn !== null
                  ? state.nextColumn
                  : state.currentColumn
              }
              onAnimationComplete={onPlaceholderAnimationCompleteHandler}
              top={top}
            />
          </>
        )}
      </div>
      <CardModal
        card={
          ['opening', 'open'].includes(state.status) && currentCard
            ? extendedCard
            : null
        }
        isBinderPage={
          isBinderLeftPage ? 'left' : isBinderRightPage ? 'right' : null
        }
        onClose={onCloseModalHandler}
        onExitComplete={onExitCompleteHandler}
        onOpen={onOpenModalHandler}
      >
        {currentCard && (
          <PokemonCardDetails
            {...currentCard}
            nextHandler={hasNextButton ? nextHandler : undefined}
            prevHandler={hasPrevButton ? prevHandler : undefined}
          />
        )}
      </CardModal>
    </>
  )
}
export default CardGrid
