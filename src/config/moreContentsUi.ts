export interface MoreContentsCardItem {
  description: string
  namePage: string
  routerTo?: string
  externalLink?: string
}

export type MoreContentsPage = 'home' | 'geoservices' | 'about'

const GITHUB_ORG_URL = 'https://github.com/Rural-Environmental-Registry'

const cardHome: MoreContentsCardItem = {
  description: 'Browse registered data on the home page',
  namePage: 'Home page',
  routerTo: '/',
}

const cardDownloads: MoreContentsCardItem = {
  description: 'Download public data from the DSP',
  namePage: 'Downloads',
  routerTo: '/geoservices',
}

const cardAbout: MoreContentsCardItem = {
  description: 'Learn what it is and how it works',
  namePage: 'About',
  routerTo: '/about',
}

const cardGithub: MoreContentsCardItem = {
  description: 'Explore the open source DPG on GitHub',
  namePage: 'Open source',
  externalLink: GITHUB_ORG_URL,
}

export const moreContentsUiConfig = {
  title: 'More content',
  subtitle: 'See more information available on the Data Sharing Platform',
  githubUrl: GITHUB_ORG_URL,
  cardsByPage: {
    home: [cardDownloads, cardAbout, cardGithub],
    geoservices: [cardHome, cardAbout, cardGithub],
    about: [cardHome, cardDownloads, cardGithub],
  } satisfies Record<MoreContentsPage, MoreContentsCardItem[]>,
}

export function getMoreContentsCards(
  page: MoreContentsPage,
  isAboutEnabled = true,
): MoreContentsCardItem[] {
  const cards = moreContentsUiConfig.cardsByPage[page]
  return isAboutEnabled ? cards : cards.filter((card) => card !== cardAbout)
}
