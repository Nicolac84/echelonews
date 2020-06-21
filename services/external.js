const express = require ('express')
const app = express()


app.get('/',(req,res) => {

res.render('index.html',)

})

app.get('/login',(req,res) => {


})
/*
app.get('/register', (
*/

app.listen(3000)
