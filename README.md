# GeoCASe-thumbnail

The [GeoCASe-UI 2.0](http://geocase.geocollections.info/) requires an image-server to generate thumbnails of images from various domains.

The docker-compose.yml creates a docker application with two services:

- an [express](https://expressjs.com/) server which calls
- [h2non/Imaginary](https://github.com/h2non/imaginary) for rendering the images

## Getting started

`docker-compose up` starts the services at http://localhost:2020. You can change the port in `docker-compose.yml`. Try out these urls to test if the service is running:

### Endpoints

- [/](http://localhost:2020)
- [/thumbnails](http://localhost:2020/thumbnails): List all rendered thumbnails.
- [/thumbnail/:url](http://localhost:2020/thumbnail/http%3A%2F%2Fwww.geo-coll.ethz.ch%2Flook_eth2%2Ffile%2Fimage%2F53%2F0000000006021.jpg): Generate a thumbnail. If it already exists a cached version will be returned. Use `?force=1` to force the regeneration of a thumbnail.
- [/thumbnail/delete/:url](http://localhost:2020/thumbnail/delete/http%3A%2F%2Fwww.geo-coll.ethz.ch%2Flook_eth2%2Ffile%2Fimage%2F53%2F0000000006021.jpg): Delete a thumbnail. If `url` starts with an `*`, it removes all thumbnails containing the `url`

## Testing

Some test-urls were downloaded from [GeoCASe 2.0](http://geocase.geocollections.info/). You can render an html file showing these images with:

```
npm install
node testdata
serve testdata
```

The first time you load the page the images need to be written. After reload they should come from the cache and display considerately faster.

## Services

### Imaginary

`Imaginary` is a **[Fast](#benchmarks) HTTP [microservice](http://microservices.io/patterns/microservices.html)** written in Go **for high-level image processing** backed by [bimg](https://github.com/h2non/bimg) and [libvips](https://github.com/jcupitt/libvips). `imaginary` can be used as private or public HTTP service for massive image processing with first-class support for [Docker](#docker) & [Fly.io](#flyio).
It's almost dependency-free and only uses [`net/http`](http://golang.org/pkg/net/http/) native package without additional abstractions for better [performance](#performance).
