const express = require("express"),
  stream = require("stream"),
  http = require("http"),
  https = require("https"),
  fs = require("fs"),
  cors = require("cors"),
  isReachable = require("is-reachable");

const THUMBNAIL_WIDTH = process.env.THUMBNAIL_WIDTH || "400",
  REACHABLE_TIMEOUT = Number(process.env.REACHABLE_TIMEOUT || "5000"),
  RENDER_TIMEOUT = Number(process.env.RENDER_TIMEOUT || "10000");

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
    console.log(`Created the thumbnail directory: ${THUMBS}`);
  } catch (e) {
    console.log(`Could not create thumbnail directory: ${THUMBS}`);
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
const renderAndGetImage = async (url, filename, res, next) => {
  const failed = (o) => {
    console.log("Failed.", o);
    next(o);
  };

  /**
   * Check if the url is reachable
   */
  const reachable = await isReachable(url, { timeout: REACHABLE_TIMEOUT });
  if (reachable) {
    /**
     * Query the imaginary server
     */
    const options = {
      protocol: "http:",
      host: "imaginary",
      port: 9000,
      path: `/resize?width=${THUMBNAIL_WIDTH}&url=${encodeURIComponent(url)}`,
      timeout: RENDER_TIMEOUT,
    };

    const request = http.request(options, function (response) {
      const { statusCode } = response,
        contentType = response.headers["content-type"];

      if (statusCode !== 200) {
        /** Image probably doesn't exist */
        failed(new Error(`Invalid Status Code: ${statusCode}`));
      } else if (!/^image\/.*/.test(contentType)) {
        /** Probably a json was returned mentioning some missing param */
        failed(new Error(`Invalid content-type: ${contentType}.`));
      } else {
        /** Start a stream */
        const data = new stream.Transform();

        /** Collect chunks */
        response.on("data", function (chunk) {
          data.push(chunk);
        });

        /** Wait for data to complete */
        response.on("end", function () {
          console.log("Render complete. Writing image");
          fs.writeFile(filename, data.read(), (err) => {
            if (err) {
              /** File writing error */
              failed(err);
            } else {
              /** All is well, return the image */
              console.log("Success!");
              res.sendFile(filename);
            }
          });
        });
      }
    });

    request.on("timeout", function () {
      request.destroy();
      failed(
        new Error(
          `Request to imaginary:9000 timed out. RENDER_TIMEOUT:${RENDER_TIMEOUT}`
        )
      );
    });

    request.on("error", (error) => {
      failed(new Error("Unhandled error"));
    });

    request.end();
  } else {
    failed(
      new Error(
        `${url} is not reachable. REACHABLE_TIMEOUT:${REACHABLE_TIMEOUT}`
      )
    );
  }
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
        "/thumbnail/?url=url": {
          description:
            "Return a cached thumbnail. If it is not present one will be generated. Use ?force=1 to ignore the cache and recreate the image.",
        },
        "/thumbnail/delete/?url=url": {
          description:
            "Delete a cached thumbnail. If {url} starts with an asterix(*), if will be interpreted as a wildcard.",
        },
      },
    },
  });
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
app.get("/thumbnail", async (req, res, next) => {
  const { params, query } = req;

  const url = decodeURIComponent(query.url),
    encoded = encodeURIComponent(url),
    filename = `${THUMBS}/${encoded}`;

  if (!query.hasOwnProperty("force") && fs.existsSync(filename)) {
    console.log("Returning cached", filename);
    res.sendFile(filename);
  } else {
    console.log(
      "Requesting to render image",
      query.hasOwnProperty("force") ? "(force)" : "",
      filename
    );
    renderAndGetImage(url, filename, res, next);
  }
});

/** Delete thumbnail endpoint */
app.get("/thumbnail/delete", async (req, res, next) => {
  const { params, query } = req;

  if (query.url.indexOf("*") === 0) {
    let errors = [],
      success = [];
    fs.readdirSync(THUMBS).forEach((file) => {
      if (file.indexOf(query.url.substring(1)) !== -1) {
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
      files: success,
    };
    if (errors.length) result.errors = errors;
    res.send(result);
  } else {
    try {
      fs.unlinkSync(
        `${THUMBS}/${encodeURIComponent(decodeURIComponent(query.url))}`
      );
      res.send({
        data: {
          message: `Deleted ${encodeURIComponent(
            decodeURIComponent(query.url)
          )}`,
        },
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
app.use(function (req, res, next) {
  res.status(404).send({ errors: [{ status: 404, code: "Page Not Found" }] });
});

/** Catching errors */
app.use(function (err, req, res, next) {
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
  console.log(`Express has started.`);
});
