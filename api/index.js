import { Hono } from 'hono'
import leaderboard from '../db/leaderboard.json'
import { serveStatic } from 'hono/serve-static.module'
import presidents from '../db/presidents.json'
import teams from '../db/teams.json'

const app = new Hono()

app.get('/', (ctx) => ctx.json([
  {
    endpoint: '/leaderboard',
    description: 'Returns Kings League leaderboard'
  },
  {
    endpoint: '/presidents',
    description: 'Returns Kings League presidents'
  },
  {
    endpoint: '/teams',
    description: 'Returns Kings League teams'
  }

]))

app.get('/leaderboard', ctx => ctx.json(leaderboard))

app.get('/presidents', ctx => ctx.json(presidents))

app.get('/presidents/:id', ctx => {
  const id = ctx.req.param('id')
  const foundPresident = presidents.find(president => president.id === id)

  return foundPresident
    ? ctx.json(foundPresident)
    : ctx.json({ message: 'President not found' }, 404)
})

app.get('/teams', ctx => ctx.json(teams))

app.get('/static/*', serveStatic({ root: './' }))

export default app
