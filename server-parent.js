const express = require('express');
const app = express();
const port = 8000;

app.use(express.static(__dirname + '/sample'));
app.use('/build', express.static(__dirname + '/build'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Parent app listening on port ${port}`);
});