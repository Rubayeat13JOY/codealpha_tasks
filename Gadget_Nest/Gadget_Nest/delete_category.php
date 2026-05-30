<?php
session_start();
include 'db.php';

if(!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin'){
    die('Access denied');
}

if(!isset($_GET['id'])){
    die('Category ID missing');
}

$id = intval($_GET['id']);

// Optional: delete image file from server
$stmt = $conn->prepare("SELECT image FROM categories WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$category = $result->fetch_assoc();

if($category && !empty($category['image'])){
    $img_path = $category['image'];
    if(file_exists($img_path)){
        unlink($img_path);
    }
}

// Delete category
$stmt = $conn->prepare("DELETE FROM categories WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();

header("Location: category.php");
exit;
