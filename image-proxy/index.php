<?php

    $info = "None";
    $uri = 'http://'.$_SERVER['HTTP_HOST'].$_SERVER['PHP_SELF'];
   
    if( isset( $_GET['url'] ) &&  count($_GET) === 1 )
    {
        $url = $_GET[ 'url' ];
        $file_headers = @get_headers($filename);

        if($file_headers[0] == 'HTTP/1.0 404 Not Found'){
            $info = "The file $filename does not exist";
        } else if ($file_headers[0] == 'HTTP/1.0 302 Found' && $file_headers[7] == 'HTTP/1.0 404 Not Found'){
            $info = "The file $filename does not exist, and I got redirected to a custom 404 page";
        } else {
            $imginfo = @getimagesize( $url );
            if( is_array($imginfo) ){
                header("Content-type: ".$imginfo['mime']);
                exit( readfile( $url ) );
            }else{
                $info = "Getimagessize($url) did not return an array";
            }
        }

      
    }else if($count < 2 ){
        $info = "Missing url parameter";
    }else{
        $info = "Too many parameters";
    }

    // ELSE
    $status = array(
        "message" => "Cannot process the image due to missing or invalid params",
        "status" => 404,
        "info" => "$info",
        "uri" => "$uri",
        "params" => $_GET
    );
    header('Content-type: application/json');
    var_dump(http_response_code(404));
    exit(json_encode($status));

?>