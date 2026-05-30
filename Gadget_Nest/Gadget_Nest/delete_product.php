<?php
session_start();
include 'db.php';

if(!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin'){
    die('Access denied');
}

if(!isset($_GET['id'])){
    die('Product ID missing');
}

$id = intval($_GET['id']);

$stmt = $conn->prepare("DELETE FROM products WHERE id=?");
$stmt->bind_param("i",$id);
$stmt->execute();

header("Location: products.php");
exit;
