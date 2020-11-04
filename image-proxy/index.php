<?php

    $url = "";
    $count = count($_GET);

    if( isset( $_GET['url'] ) && $count === 1 )
    {
        $url = $_GET[ 'url' ];
    }
    else
    {
        $status = array(
            "message" => "Cannot process the image due to missing or invalid params",
            "status" => 400
        );
        header('Content-type: application/json');
        exit(json_encode($status));
    }

    $imginfo = getimagesize( $url );
    header("Content-type: ".$imginfo['mime']);
    readfile( $url );

?>