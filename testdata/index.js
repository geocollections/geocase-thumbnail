const fs = require("fs");
var _ = require("lodash");

console.log(__dirname);

let list = [],
  max_images_per_json = 10;

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
  </head>
  <body>
 {CONTENT}
  </body>
</html>
`;

const imaginary = template.replace(
  "{CONTENT}",
  list.reduce(
    (a, c) => {
      const uri = encodeURIComponent(c);
      return (
        a +
        `<a href="http://localhost:2020/?url=${uri}" target="_blank" title="Original url:${c}"><img src="http://localhost:2020/resize?width=100&url=${uri}"/></a>`
      );
    },

    ""
  )
);

console.log("Saving imaginary.html preview...");
fs.writeFileSync(`${__dirname}/index.html`, imaginary);
console.log("Done.");
