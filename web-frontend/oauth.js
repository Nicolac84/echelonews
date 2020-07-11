/** echelonews - Web frontend OAuth2 framework (Google specific)
 * @license
 * Copyright (c) 2020 Nicola Colao, Paolo Lucchesi, Dejan Nuzzi
 * All rights reserved
 */
'use strict'
const fetch = require('node-fetch')

class OAuthMiddlewares {
  static setup({ oauthBridge, clientID, clientSecret, log } = {}) {
    this.oauthBridge = oauthBridge
    this.clientID = clientID
    this.clientSecret = clientSecret
    this.log = log
  }

  static directPath(req, res) {
    const urlParams = new URLSearchParams({
      client_id: OAuthMiddlewares.clientID,
      redirect_uri: `${req.protocol}://${req.get('host')}/oauth/callback`,
      response_type: 'code',
      scope: 'profile',
      access_type: 'online',
    })
    res.redirect(
      `https://accounts.google.com/o/oauth2/v2/auth?${urlParams.toString()}`
    )
  }

  static async callbackPath(req, res) {
    try {
      if (req.query.error) return res.status(500).send('OAuth error')

      // Get OAuth credentials
      const params = new URLSearchParams({
        client_id: OAuthMiddlewares.clientID,
        client_secret: OAuthMiddlewares.clientSecret,
        code: req.query.code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/oauth/callback`,
      })
      const authResponse = await fetch(`https://oauth2.googleapis.com/token`, {
        method: 'post',
        body: params
      })
      const auth = await authResponse.json()
      if (!authResponse.ok) {
        return res.status(500).send(`OAuth error with status ${authResponse.status}`)
      }

      // Get the user Google profile data
      const profileResponse = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
        method: 'get',
        headers: { 'Authorization': `Bearer ${auth.access_token}`}
      })
      const profile = await profileResponse.json()

      // Retrieve (i.e. fetch or register) the OAuth user
      const tokenRes = await fetch(`${OAuthMiddlewares.oauthBridge}/oauth`, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: profile.sub,
          name: profile.name
        })
      })
      const tokenResBody = await tokenRes.json()

      // Set token as 'jwt' cookie
      // TODO: Determine the cookie max age according to the jwt expiration
      res.cookie('jwt', `Bearer ${tokenResBody.token}`, { maxAge: 3600000 })
      res.redirect('/') // TODO: Redirect to profile
    } catch (err) {
      OAuthMiddlewares.log.error(err)
      res.status(500).send('Internal server error. Sorry')
    }
  }
}

module.exports = OAuthMiddlewares
