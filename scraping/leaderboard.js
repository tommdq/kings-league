import * as cheerio from 'cheerio'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const DB_PATH = path.join(process.cwd(), './db')
const TEAMS = await readFile(`${DB_PATH}/teams.json`, 'utf-8').then(JSON.parse)

const URLS = {
  leaderboard: 'https://kingsleague.pro/estadisticas/clasificacion/'
}

async function scrape (url) {
  const res = await fetch(url)
  const html = await res.text()
  return cheerio.load(html)
}

async function getLeaderBoard () {
  const $ = await scrape(URLS.leaderboard)
  const $rows = $('table tbody tr')

  const LEADERBOARD_SELECTORS = {
    team: { selector: '.fs-table-text_3', typeOf: 'string' },
    wins: { selector: '.fs-table-text_4', typeOf: 'number' },
    loses: { selector: '.fs-table-text_5', typeOf: 'number' },
    scoredGoals: { selector: '.fs-table-text_6', typeOf: 'number' },
    concededGoals: { selector: '.fs-table-text_7', typeOf: 'number' },
    yellowCards: { selector: '.fs-table-text_8', typeOf: 'number' },
    redCards: { selector: '.fs-table-text_9', typeOf: 'number' }
  }

  const getTeamFrom = ({ name }) => TEAMS.find((team) => team.name === name)

  const cleanText = text =>
    text
      .replace(/\t|\n|\s:/g, '')
      .replace(/.*:/g, ' ')
      .trim()

  const leaderBoardSelectorEntries = Object.entries(LEADERBOARD_SELECTORS)

  const leaderBoard = []

  $rows.each((index, element) => {
    const leaderBoardEntries = leaderBoardSelectorEntries.map(
      ([key, { selector, typeOf }]) => {
        const rawValue = $(element).find(selector).text()
        const cleanedValue = cleanText(rawValue)
        const value = typeOf === 'number' ? +cleanedValue : cleanedValue
        return [key, value]
      }
    )
    const { team: teamName, ...leaderboardForTeam } = Object.fromEntries(leaderBoardEntries)
    const team = getTeamFrom({ name: teamName })

    leaderBoard.push({ ...leaderboardForTeam, team })
  })
  return leaderBoard
}

const leaderBoard = await getLeaderBoard()

// ** process.cwd -> Current working directory -> Desde donde se esta ejecutando el script **

// ** Escribimos dentro de nuestro archivo JSON el LeaderBoard **
await writeFile(`${DB_PATH}/leaderboard.json`, JSON.stringify(leaderBoard, null, 2), 'utf8')
