# GeoCASe-thumbnail

The [GeoCASe-UI 2.0](http://geocase.geocollections.info/) requires an image-server to generate thumbnails of images from various domains.

The docker-compose.yml creates a docker application with three services:

- an [NGINX](https://www.nginx.com/) server which uses
  - [h2non/Imaginary](https://github.com/h2non/imaginary) for rendering the images and
  - [PHP](https://hub.docker.com/_/php) for creating an image-proxy.

## Getting started

`docker-compose up` starts the services at http://localhost:2020. You can change the port in `docker-compose.yml`. Try out these urls to test if the service is running:

- [Resized 100x](http://localhost:2020/resize?width=100&url=http%3A%2F%2Fwww.geo-coll.ethz.ch%2Flook_eth2%2Ffile%2Fimage%2F53%2F0000000006021.jpg)
- [Proxied](http://localhost:2020/?url=http%3A%2F%2Fwww.geo-coll.ethz.ch%2Flook_eth2%2Ffile%2Fimage%2F53%2F0000000006021.jpg)
- [Original](http://www.geo-coll.ethz.ch/look_eth2/file/image/53/0000000006021.jpg)

## Testing

Some test-urls were downloaded from [GeoCASe 2.0](http://geocase.geocollections.info/). You can render an html file showing these images with:

```
npm install
node testdata
serve testdata
```

The first time you load the page the images need to be written. After reload they should come from the varnish-cache and display considerately faster.

## Services

### Imaginary

`Imaginary` is a **[Fast](#benchmarks) HTTP [microservice](http://microservices.io/patterns/microservices.html)** written in Go **for high-level image processing** backed by [bimg](https://github.com/h2non/bimg) and [libvips](https://github.com/jcupitt/libvips). `imaginary` can be used as private or public HTTP service for massive image processing with first-class support for [Docker](#docker) & [Fly.io](#flyio).
It's almost dependency-free and only uses [`net/http`](http://golang.org/pkg/net/http/) native package without additional abstractions for better [performance](#performance).

#### Endpoints

- /health
- /form
- /info
- /crop
- /smartcrop
- /resize
- /enlarge
- /extract
- /zoom
- /thumbnail
- /fit
- /rotate
- /autorotate
- /flip
- /flop
- /convert
- /pipeline
- /watermark
- /watermarkimage
- /blur

Read more about `imaginary`s endpoints [here](https://github.com/h2non/imaginary#get-)

#### Params

Complete list of available params. Take a look to each specific [endpoint](https://github.com/h2non/imaginary/blob/master/README.md#params) to see which params are supported. Image measures are always in pixels, unless otherwise indicated.

- **width** `int` - Width of image area to extract/resize
- **height** `int` - Height of image area to extract/resize
- **top** `int` - Top edge of area to extract. Example: `100`
- **left** `int` - Left edge of area to extract. Example: `100`
- **areawidth** `int` - Height area to extract. Example: `300`
- **areaheight** `int` - Width area to extract. Example: `300`
- **quality** `int` - JPEG image quality between 1-100. Defaults to `80`
- **compression** `int` - PNG compression level. Default: `6`
- **rotate** `int` - Image rotation angle. Must be multiple of `90`. Example: `180`
- **factor** `int` - Zoom factor level. Example: `2`
- **margin** `int` - Text area margin for watermark. Example: `50`
- **dpi** `int` - DPI value for watermark. Example: `150`
- **textwidth** `int` - Text area width for watermark. Example: `200`
- **opacity** `float` - Opacity level for watermark text or watermark image. Default: `0.2`
- **flip** `bool` - Transform the resultant image with flip operation. Default: `false`
- **flop** `bool` - Transform the resultant image with flop operation. Default: `false`
- **force** `bool` - Force image transformation size. Default: `false`
- **nocrop** `bool` - Disable crop transformation. Defaults depend on the operation
- **noreplicate** `bool` - Disable text replication in watermark. Defaults to `false`
- **norotation** `bool` - Disable auto rotation based on EXIF orientation. Defaults to `false`
- **noprofile** `bool` - Disable adding ICC profile metadata. Defaults to `false`
- **stripmeta** `bool` - Remove original image metadata, such as EXIF metadata. Defaults to `false`
- **text** `string` - Watermark text content. Example: `copyright (c) 2189`
- **font** `string` - Watermark text font type and format. Example: `sans bold 12`
- **color** `string` - Watermark text RGB decimal base color. Example: `255,200,150`
- **image** `string` - Watermark image URL pointing to the remote HTTP server.
- **type** `string` - Specify the image format to output. Possible values are: `jpeg`, `png`, `webp` and `auto`. `auto` will use the preferred format requested by the client in the HTTP Accept header. A client can provide multiple comma-separated choices in `Accept` with the best being the one picked.
- **gravity** `string` - Define the crop operation gravity. Supported values are: `north`, `south`, `centre`, `west`, `east` and `smart`. Defaults to `centre`.
- **file** `string` - Use image from server local file path. In order to use this you must pass the `-mount=<dir>` flag.
- **url** `string` - Fetch the image from a remote HTTP server. In order to use this you must pass the `-enable-url-source` flag.
- **colorspace** `string` - Use a custom color space for the output image. Allowed values are: `srgb` or `bw` (black&white)
- **field** `string` - Custom image form field name if using `multipart/form`. Defaults to: `file`
- **extend** `string` - Extend represents the image extend mode used when the edges of an image are extended. Defaults to `mirror`. Allowed values are: `black`, `copy`, `mirror`, `white`, `lastpixel` and `background`. If `background` value is specified, you can define the desired extend RGB color via `background` param, such as `?extend=background&background=250,20,10`. For more info, see [libvips docs](https://libvips.github.io/libvips/API/current/libvips-conversion.html#VIPS-EXTEND-BACKGROUND:CAPS).
- **background** `string` - Background RGB decimal base color to use when flattening transparent PNGs. Example: `255,200,150`
- **sigma** `float` - Size of the gaussian mask to use when blurring an image. Example: `15.0`
- **minampl** `float` - Minimum amplitude of the gaussian filter to use when blurring an image. Default: Example: `0.5`
- **operations** `json` - Pipeline of image operation transformations defined as URL safe encoded JSON array. See [pipeline](#get--post-pipeline) endpoints for more details.
- **sign** `string` - URL signature (URL-safe Base64-encoded HMAC digest)
- **interlace** `bool` - Use progressive / interlaced format of the image output. Defaults to `false`
- **aspectratio** `string` - Apply aspect ratio by giving either image's height or width. Exampe: `16:9`
