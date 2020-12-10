# GeoCASe-thumbnail

The [GeoCASe-UI 2.0](http://geocase.geocollections.info/) requires an image-server to generate thumbnails of images from various domains.

The docker-compose starts two services:

- An [express](https://expressjs.com/) server which queries:
- a [h2non/Imaginary](https://github.com/h2non/imaginary) container for making images

## Requirements

- docker
- docker-compose
- node.js

## Build

`docker-compose up` starts the services and exposes http://localhost:2020. You can change the port in `docker-compose.yml`. Try out the endpoints to test if the service is running properly:

### Endpoints

- [/](http://localhost:2020)
- [/thumbnails](http://localhost:2020/thumbnails): List all rendered thumbnails.
- [/thumbnail/?url=...](http://localhost:2020/thumbnail/url=?http%3A%2F%2Fwww.geo-coll.ethz.ch%2Flook_eth2%2Ffile%2Fimage%2F53%2F0000000006021.jpg): Generate a thumbnail. If it already exists a cached version will be returned. Use `&force=1` to force the regeneration of a thumbnail. The url should be encoded with `encodeURIComponent` or similar
- [/thumbnail/delete?url=...](http://localhost:2020/thumbnail/delete/http%3A%2F%2Fwww.geo-coll.ethz.ch%2Flook_eth2%2Ffile%2Fimage%2F53%2F0000000006021.jpg): Delete a thumbnail. If `url` starts with an `*{string}`, it removes all thumbnails with an url containing `{string}`.

### Services

#### Express

[Express](https://expressjs.com/) is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.

#### Imaginary

`Imaginary` is a **[Fast](https://github.com/h2non/imaginary#benchmark) HTTP [microservice](http://microservices.io/patterns/microservices.html)** written in Go **for high-level image processing** backed by [bimg](https://github.com/h2non/bimg) and [libvips](https://github.com/jcupitt/libvips). `imaginary` can be used as private or public HTTP service for massive image processing with first-class support for [Docker](https://github.com/h2non/imaginary#docker) & [Fly.io](https://github.com/h2non/imaginary#flyio).
It's almost dependency-free and only uses [`net/http`](http://golang.org/pkg/net/http/) native package without additional abstractions for better [performance](https://github.com/h2non/imaginary#performance).

## Testing

Some test-urls were downloaded from [GeoCASe 2.0](http://geocase.geocollections.info/). You can render an html file showing these images with:

```
npm install
node testdata
serve testdata
```

The first time you load the page the images need to be created. After reload they should come from the cache and display considerately faster.
