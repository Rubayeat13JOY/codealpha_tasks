<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

$username_or_email = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$role = $_POST['role'] ?? 'user';

$response = ['success'=>false,'message'=>''];

if($role === 'admin'){
    $stmt = $conn->prepare("SELECT id, username, password FROM admins WHERE username=?");
    $stmt->bind_param("s", $username_or_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()){
        if($password === $row['password']){
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['username'];
            $_SESSION['role'] = 'admin';
            $response['success'] = true;
        }else{
            $response['message'] = "Wrong password";
        }
    }else{
        $response['message'] = "Admin not found";
    }   
}else{
    $stmt = $conn->prepare("SELECT id, fullname, password FROM users WHERE email=?");
    $stmt->bind_param("s", $username_or_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if($row = $result->fetch_assoc()){
        if($password === $row['password']){
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['user_name'] = $row['fullname'];
            $_SESSION['role'] = 'user';
            $response['success'] = true;
        }else{
            $response['message'] = "Wrong password";
        }
    }else{
        $response['message'] = "User not found";
    }
}

echo json_encode($response);
exit;
