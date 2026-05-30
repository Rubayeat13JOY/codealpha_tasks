<?php
session_start();
include 'db.php';

if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    die('Access denied');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name']);
    $image = '';

    if (!empty($_FILES['image']['name'])) {
        $target_dir = "images/";
        if (!is_dir($target_dir)) mkdir($target_dir, 0777, true);

        $image = time() . '_' . basename($_FILES['image']['name']);
        move_uploaded_file($_FILES['image']['tmp_name'], $target_dir . $image);
    }

    $stmt = $conn->prepare("INSERT INTO categories (name, image) VALUES (?, ?)");
    $stmt->bind_param("ss", $name, $image);
    $stmt->execute();

    header("Location: category.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Add Category</title>

<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">

<style>
    body{
        background:#fff;
        color:#000;
        min-height:100vh;
        font-family: Arial, sans-serif;
    }

    .page-wrapper{
        padding:50px;
        max-width: 700px;
        margin: 0 auto;
    }

    .page-title{
        font-size:32px;
        font-weight:700;
        border-bottom:2px solid #000;
        padding-bottom:10px;
        margin-bottom:40px;
    }

    .form-control{
        border:2px solid #000;
        border-radius:4px;
        padding:12px;
        font-size:16px;
        background:#fff;
        color:#000;
    }

    .form-control:focus{
        box-shadow:none;
        border-color:#000;
    }

    .btn-black{
        background:#000;
        color:#fff;
        border-radius:4px;
        padding:12px;
        font-size:16px;
        font-weight:600;
        transition: all 0.3s ease;
    }

    .btn-black:hover{
        background:#222;
        color:#fff;
    }

    label{
        font-weight:600;
        margin-bottom:6px;
        display:block;
    }

</style>
</head>

<body>

<div class="page-wrapper">

    <div class="page-title">
        Add New Category
    </div>

    <form method="POST" enctype="multipart/form-data">

        <div class="mb-4">
            <label>Category Name</label>
            <input type="text" name="name" class="form-control"
                   placeholder="Enter category name" required>
        </div>

        <div class="mb-4">
            <label>Category Image</label>
            <input type="file" name="image" class="form-control">
        </div>

        <div class="mb-4">
            <button type="submit" class="btn btn-black w-100">
                ADD CATEGORY
            </button>
        </div>

    </form>

</div>

</body>
</html>
