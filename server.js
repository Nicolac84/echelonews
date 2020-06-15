const express = require('express');
const app = express();
const bodyparser = require('body-parser');

app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended: true }));

app.use(express.static('public'));



app.get('/prova', function(req,res){
res.render('index',{title: 'ciao' , message:' bella rega' });
})

app.post('/new-user', (req,res)=>{
console.log('body:',req.body);
var nome = req.body.nome;
var cognome = req.body.cognome;
})


app.listen(3000, function(){
   console.log('server listening on port 3000');
   

})
