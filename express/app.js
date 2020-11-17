const express = require("express"),
  stream = require("stream"),
  http = require("http"),
  fs = require("fs");

const app = express(),
  port = 4000;

const THUMBS = `${__dirname}/thumbnails`;

/**
 *
 *
 *  Helpers
 *
 *
 */
const renderAndGetImage = (url, filename, res, next) => {
  /**
   * Query the h2non/imaginary server
   * */
  http
    .request(url, function (http_res) {
      const { statusCode } = http_res,
        contentType = http_res.headers["content-type"];

      if (statusCode !== 200) {
        /** Image probably doesn't exist */

        console.log("####", http_res);

        next(new Error(`Request ${url} Failed.\nStatus Code: ${statusCode}`));
      } else if (!/^image\/.*/.test(contentType)) {
        /** Probably a json was returned mentioning some missing param */

        next(
          new Error(
            `Invalid content-type.\nExpected image/* but received ${contentType}`
          )
        );
      } else {
        /** Start a stream */
        const data = new stream.Transform();

        /** Collect chunks */
        http_res.on("data", function (chunk) {
          data.push(chunk);
        });

        /** Wait for data to complete */
        http_res.on("end", function () {
          fs.writeFile(filename, data.read(), (err) => {
            if (err) {
              /** File writing error */
              next(err);
            } else {
              /** All is well, return the image */
              res.sendFile(filename);
            }
          });
        });
      }
    })
    .end();
};

/**
 *
 *
 *  Endpoints
 *
 *
 *
 */

/** Home */
app.get("/", (req, res) => {
  res.send({ jsonapi: "About this API" });
});

/** List of all thumbnails */
app.get("/thumbnails", async (req, res, next) => {
  let result = [];
  fs.readdirSync(THUMBS).forEach((file) => {
    result.push(file);
  });
  res.send({ data: result });
});

/** Thumbnail endpoint */
app.get("/thumbnail/:url", async (req, res, next) => {
  const { params } = req;

  const encoded = encodeURIComponent(params.url),
    url = `http://imaginary:9000/resize?width=200&url=${encoded}`,
    filename = `${THUMBS}/${encoded}`;

  if (fs.existsSync(filename)) {
    console.log("Returning cached", filename);
    res.sendFile(filename);
  } else {
    renderAndGetImage(url, filename, res, next);
  }
});

/** Delete thumbnail endpoint */
app.get("/thumbnail/delete/:url", async (req, res, next) => {
  const { params, query } = req;
  const result = [];

  if (query.wildcard) {
    let result = [];
    fs.readdirSync(THUMBS).forEach((file) => {
      result.push(file);
    });
    res.send({ data: result });
  } else {
    try {
      fs.unlinkSync(`${THUMBS}/${encodeURIComponent(params.url)}`);
      res.send({
        data: { message: `Deleted ${encodeURIComponent(params.url)}` },
      });
    } catch (err) {
      next(err);
    }
  }
});

/**
 *
 * middleware
 */
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

/** Default 404 endpoint */
app.use(function (req, res, next) {
  res.status(404).send({ errors: [{ status: 404, code: "Page Not Found" }] });
});

/** Catching errors */
app.use(function (err, req, res, next) {
  //console.log(err);
  res.status(500).send({ errors: [{ code: err.message }] });
});

/**
 *
 *
 *
 *
 * Start the service
 *
 *
 *
 * */
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/**
 *
 * http://localhost:4000/thumbnail/http%3A%2F%2Fcoll.mfn-berlin.de%2Fimg%2FMFN_MIN_2011_00049__et_Argentit.jpg
 *
 */
