const express = require("express"),
  stream = require("stream"),
  http = require("http"),
  fs = require("fs"),
  cors = require("cors");

/**
 * Capture close
 */

const app = express(),
  port = 4000;

/** Enable cross-domain */
app.use(cors());

const THUMBS = `${__dirname}/thumbnails`;
if (!fs.existsSync(THUMBS)) {
  try {
    fs.mkdirSync(THUMBS);
    console.log("Created the thumbnail directory.");
  } catch (e) {
    console.log("Could not create thumbnail directory");
    process.exit(0);
  }
}

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
    .request(url, function(http_res) {
      const { statusCode } = http_res,
        contentType = http_res.headers["content-type"];

      if (statusCode !== 200) {
        /** Image probably doesn't exist */
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
        http_res.on("data", function(chunk) {
          data.push(chunk);
        });

        /** Wait for data to complete */
        http_res.on("end", function() {
          fs.writeFile(filename, data.read(), err => {
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
  res.send({
    jsonapi: {
      endpoint: {
        "/thumbnails": { description: "List all cached thumbnails" },
        "/thumbnail/:url": {
          description:
            "Return a cached thumbnail. If it is not present one will be generated. Use ?force=1 to ignore the cache and recreate the image."
        },
        "/thumbnail/delete/:url": {
          description:
            "Delete a cached thumbnail. If {url} starts with an asterix(*), if will be interpreted as a wildcard."
        }
      }
    }
  });
});

/** List of all thumbnails */
app.get("/thumbnails", async (req, res, next) => {
  let result = [];
  fs.readdirSync(THUMBS).forEach(file => {
    result.push(file);
  });
  res.send({ data: result });
});

/** Thumbnail endpoint */
app.get("/thumbnail/:url", async (req, res, next) => {
  const { params, query } = req;

  const encoded = encodeURIComponent(params.url),
    url = `http://imaginary:9000/resize?width=200&url=${encoded}`,
    filename = `${THUMBS}/${encoded}`;

  if (!query.force && fs.existsSync(filename)) {
    console.log("Returning cached", filename);
    res.sendFile(filename);
  } else {
    renderAndGetImage(url, filename, res, next);
  }
});

/** Delete thumbnail endpoint */
app.get("/thumbnail/delete/:url", async (req, res, next) => {
  const { params } = req;

  if (params.url.indexOf("*") === 0) {
    let errors = [],
      success = [];
    fs.readdirSync(THUMBS).forEach(file => {
      if (file.indexOf(params.url.substring(1)) !== -1) {
        try {
          fs.unlinkSync(`${THUMBS}/${file}`);
          success.push(file);
        } catch (e) {
          errors.push({ file: file, error: e });
        }
      }
    });

    const result = {
      data: { message: `Deleted ${success.length} files` },
      files: success
    };
    if (errors.length) result.errors = errors;
    res.send(result);
  } else {
    try {
      fs.unlinkSync(`${THUMBS}/${encodeURIComponent(params.url)}`);
      res.send({
        data: { message: `Deleted ${encodeURIComponent(params.url)}` }
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

/** Default 404 endpoint */
app.use(function(req, res, next) {
  res.status(404).send({ errors: [{ status: 404, code: "Page Not Found" }] });
});

/** Catching errors */
app.use(function(err, req, res, next) {
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
const server = app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

/**
 *
 * http://localhost:4000/thumbnail/http%3A%2F%2Fcoll.mfn-berlin.de%2Fimg%2FMFN_MIN_2011_00049__et_Argentit.jpg
 *
 */
