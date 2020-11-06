const fs = require("fs");
var _ = require("lodash");

console.log(__dirname);

let list = [],
  max_images_per_json = 5;

fs.readdirSync(`${__dirname}/json/`).forEach(file => {
  const json = fs.readFileSync(`${__dirname}/json/${file}`);
  const data = JSON.parse(json);
  const docs = _.get(data, "response.docs");

  console.log(`extract urls from ${file}.repsonse.docs(${docs.length})`);
  if (docs) {
    docs.forEach(
      (doc, index) => index < max_images_per_json && list.push(doc.url)
    );
  }

  list = list.reverse();
});

/** Zürich files have a new api url */
list = list.map(u => u.replace("look_eth", "look_eth2"));

console.log(`Saving ${list.length} urls.`);
fs.writeFileSync(`${__dirname}/urls.json`, JSON.stringify(list, null, 2));
console.log("Done.");

const template = `
<!DOCTYPE  html>
<html>
  <head>
    <meta charset="UTF-8">
    <link rel="stylesheet" href="./index.css" type="text/css">
    <script>

      function purge(uri){
        console.log('purge/' + uri);
        fetch('http://localhost:2020/purge/' + uri,  { method: 'GET'})
          .then( response => response.json() )
          .then(data =>  {
            console.log(data)
            alert( JSON.stringify(data, null, 2))
          });
      }
    
    </script>
  </head>
  <body>
    <hr/>
    <button onclick="purge('all')">purge-all</button>
    <hr/>
    <h3>Icons</h3>
    {ICONS}
    <hr/>
    <h3>Originals</h3>
    {IMAGES}
  </body>
</html>
`;

const imaginary = template
  .replace(
    "{ICONS}",
    list.reduce((a, c) => {
      const uri = encodeURIComponent(c);
      return (
        a +
        `<div class="thumb">
          <img src="http://localhost:2020/resize?width=100&url=${uri}" title="Original url:${c}" />
          <button onclick="purge('resize?width=100&url=${uri}')">purge-icon</button>
        </div>`
      );
    }, "")
  )
  .replace(
    "{IMAGES}",
    list.reduce((a, c) => {
      const uri = encodeURIComponent(c);
      return (
        a +
        `<div class="full">
        <img src="http://localhost:2020/?url=${uri}" title="Original url:${c}" />
        <button onclick="purge('?url=${uri}')">purge-image</button>
      </div>`
      );
    }, "")
  );

console.log("Saving index.html preview...");
fs.writeFileSync(`${__dirname}/index.html`, imaginary);
console.log("Done.");
