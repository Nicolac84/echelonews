const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20')



passport.use(

new GoogleStrategy({

callbackURL:'/profile',
clientID: 'c',
clientSecret: 'c'

}, () => {

})
)
