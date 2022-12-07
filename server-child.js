const express = require('express');
const app = express();
const port = 8001;

app.use(express.static(__dirname + '/sample/otherdomain'));
app.use('/build', express.static(__dirname + '/build'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Child app listening on port ${port}`);
});