const api = "api_key da inserire";
const googleTranslate = require('google-translate')(api);

let text = 'testo da tradurre'
console.log("italiano :>",text);
googleTranslate.translate(text, 'en', function(err, translation) {
  console.log("inglese :>",translation.translatedText);
});
