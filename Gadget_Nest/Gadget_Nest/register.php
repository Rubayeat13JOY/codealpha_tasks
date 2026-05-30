<?php
session_start();
include 'db.php';
header('Content-Type: application/json');

$fullname = $_POST['fullname'] ?? '';
$email    = $_POST['email'] ?? '';
$password = $_POST['password'] ?? '';
$confirm  = $_POST['confirm_password'] ?? '';

$response = ['success'=>false,'message'=>''];

if($password !== $confirm){
    $response['message'] = "Passwords do not match!";
    echo json_encode($response); exit();
}
if(strlen($password) < 8){
    $response['message'] = "Password must be at least 8 characters!";
    echo json_encode($response); exit();
}

// Check email exists
$stmt = $conn->prepare("SELECT id FROM users WHERE email=?");
$stmt->bind_param("s", $email);
$stmt->execute();
$stmt->store_result();
if($stmt->num_rows > 0){
    $response['message'] = "Email already exists!";
    echo json_encode($response); exit();
}

// Insert user (without hash)
$stmt = $conn->prepare("INSERT INTO users(fullname,email,password) VALUES(?,?,?)");
$stmt->bind_param("sss", $fullname, $email, $password);

if($stmt->execute()){
    // Auto login
    $_SESSION['user_id'] = $stmt->insert_id;
    $_SESSION['user_name'] = $fullname;
    $_SESSION['role'] = 'user';
    $response['success'] = true;
}else{
    $response['message'] = "An error occurred. Try again.";
}

echo json_encode($response);
