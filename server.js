if (process.env.NODE_ENV !== 'production'){
   require('dotenv').config()
}

const express =require('express')
const app = express()
const bodyParser = require('body-parser')
const bcrypt = require ('bcrypt')
const passport =require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-conf')
initializePassport(
 passport,
 email => users.find (user => user.email === email ),
 id => users.find(user => user.id === id )
)

// database da inserire !
const user =[]
app.use(express.json())

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.use(express.urlencoded({extended: false}))

app.set('view engine', 'ejs')
app.use(express.static('views'))



app.use(flash())

app.use(session({ 
secret: process.env.SESSION_SECRET,
resave: false,
saveUnitialized: false

}))


app.get('/',chekAuthenticated ,(req, res)=> {


})

app.post('/users', async (req, res) => {
  try { const salt = await bcrypt.genSalt()
      const hashedPassword = await bcrypt.hash(req.body.password, salt)
      console.log(salt)
      console.log(hashedPassword) 
      const user = { name: req.body.name, password: hashedPassword }
      users.push(user)
      res.status(201).send()
  }   catch {
      res.status(500).send()
  }
})


app.get('/login',checkNotAuthenticated,(req, res) => {
  res.render('login.ejs')
})

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect: '/',
    failureRedirect:  '/login',
    failureFlash: true
}))
 
 
app.get('/register', checkNotAuthenticated, (req,res) => {
   res.render('register.ejs')
})

app.post('/register',checkNotAuthenticated, async (req, res)=>{
try {
   const hashedPassword = await bcrypt.hash(req.body.password, 10)
   user.push({
      id: Date.now().toString(),
      name: req.body.name, 
      email: req.body.email,
      password: hashedPassword
})
   res.redirect('/login')
   }catch {
   res.redirec('/register')
}
})

app.delete('/logout',(req, res)=>{
   req.logOut()
   req.redirect('/login')

})

function chekAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
  return next()
  }

res.redirect('/login')
}

function checkNotAuthenticated(req, res, next){
   if (req.isAuthenticated()){
       return res.redirect('/')
   }
    next()
}

app.listen(3000)
