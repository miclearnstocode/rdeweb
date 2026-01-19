<?php
if(isset($_POST['upload'])){
    if(move_uploaded_file($_FILES['file']['tmp_name'], 'local/' .$_FILES['file']['name'])){
        echo 'okey';
    }else{
        echo 'failed';
    }
}