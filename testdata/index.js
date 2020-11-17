const fs = require("fs");
var _ = require("lodash");

console.log(__dirname);

let list = [],
  max_images_per_json = 5000;

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

      function removeThumbnails(uri){
        console.log('thumbnail/delete/' + uri);
        fetch('http://localhost:2020/thumbnail/delete/' + uri,  { method: 'GET'})
          .then( response => {
            return response.json();
          }).then(data =>  {
            alert( JSON.stringify(data, null, 2))
          }).catch(e => {
            console.log(e)
          })
      }
      
    </script>
  </head>
  <body>
    <hr/>
    <button onclick="removeThumbnails('*')">Delete all</button>
    <button onclick="removeThumbnails('*mfn-berlin')">Delete *mfn-berlin</button>
    <button onclick="removeThumbnails('*geocollections')">Delete *geocollections</button>
    <button onclick="removeThumbnails('*ethz.ch')">Delete *ethz.ch</button>
    <hr/>
    <h3>Icons</h3>
    {ICONS}
  </body>
</html>
`;

const imaginary = template.replace(
  "{ICONS}",
  list.reduce((a, c) => {
    const uri = encodeURIComponent(c);
    return (
      a +
      `<div class="thumb">
          <img src="http://localhost:2020/thumbnail/${uri}" title="Original url:${c}" />
          <button onclick="removeThumbnails('${uri}')">Delete</button>
        </div>`
    );
  }, "")
);

console.log("Saving index.html preview...");
fs.writeFileSync(`${__dirname}/index.html`, imaginary);
console.log("Done.");
