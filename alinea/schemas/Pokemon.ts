import {Config, Field, Infer} from 'alinea'
import {defaultBlocks} from '../blocks/Blocks.schema'

export type Pokemon = Infer<typeof Pokemon>

export const Pokemon = Config.type('Pokémon', {
  fields: {
    number: Field.number('Number', {width: 0.2, required: true}),
    title: Field.text('Title', {width: 0.8, required: true}),
    path: Field.path('Path', {hidden: true}),
    aliases: Field.list('Aliases', {
      schema: {
        Alias: Config.type('Alias', {
          fields: {
            name: Field.text('Name', {required: true})
          }
        })
      }
    }),
    evolvesFrom: Field.entry('Evolves from', {
      location: {
        workspace: 'main',
        root: 'pages',
        parentId: '36cjRyzFa6sfGCDv5vTu8DBs8vK'
      },
      condition: {_type: 'Pokemon'},
      enableNavigation: false,
      pickChildren: false,
      width: 0.5
    }),
    evolvesTo: Field.entry.multiple('Evolves to', {
      location: {
        workspace: 'main',
        root: 'pages',
        parentId: '36cjRyzFa6sfGCDv5vTu8DBs8vK'
      },
      condition: {_type: 'Pokemon'},
      enableNavigation: false,
      pickChildren: false,
      width: 0.5
    }),
    blocks: Field.list('Blocks', {
      schema: defaultBlocks
    })
  },
  insertOrder: 'first'
})
