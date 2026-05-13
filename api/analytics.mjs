import { sendDashboardResponse } from '../server/vercel-bridge.mjs'

export default async function handler(req, res) {
  await sendDashboardResponse(req, res, '/api/analytics')
}
