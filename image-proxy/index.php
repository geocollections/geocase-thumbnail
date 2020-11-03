<?php

    $url = "";

    if( isset( $_GET['url'] ) )
    {
        $url = $_GET[ 'url' ];
    }
    else
    {
        exit('no url param');
    }

    $imginfo = getimagesize( $url );
    header("Content-type: ".$imginfo['mime']);
    readfile( $url );

?>