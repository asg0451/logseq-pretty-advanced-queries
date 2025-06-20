// Seed data for the mocked Logseq database used in the sandbox environment.

export interface Block {
  id: number
  content: string
  refs?: string[]
}

// A minimal set of blocks that cover typical query targets.
export const blocks: Block[] = [
  {
    id: 1,
    content: 'TODO Write documentation for the plugin',
    refs: ['TODO'],
  },
  {
    id: 2,
    content: 'DONE Initial project scaffold',
    refs: ['DONE'],
  },
  {
    id: 3,
    content: 'TODO Implement query runner',
    refs: ['TODO'],
  },
]
