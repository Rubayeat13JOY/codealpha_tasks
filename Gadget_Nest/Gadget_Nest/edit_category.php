<?php
session_start();
include 'db.php';

if(!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin'){
    die('Access denied');
}

$placeholder = "images/placeholder.png";

if(!isset($_GET['id'])){
    die('Category ID missing');
}

$id = intval($_GET['id']);

// Fetch existing category
$stmt = $conn->prepare("SELECT * FROM categories WHERE id = ?");
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();
$category = $result->fetch_assoc();

if(!$category){
    die('Category not found');
}

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = trim($_POST['name']);
    $image = $category['image'];

    if(!empty($_FILES['image']['name'])){
        $target_dir = "images/";
        if(!is_dir($target_dir)){
            mkdir($target_dir, 0777, true);
        }
        $image = time().'_'.basename($_FILES['image']['name']);
        move_uploaded_file($_FILES['image']['tmp_name'], $target_dir.$image);
    }

    $stmt = $conn->prepare("UPDATE categories SET name = ?, image = ? WHERE id = ?");
    $stmt->bind_param("ssi", $name, $image, $id);
    $stmt->execute();

    header("Location: category.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Edit Category</title>

<style>
    body{
        margin:0;
        font-family: Arial, Helvetica, sans-serif;
        background:#fff;
        color:#000;
    }

    .page-wrap{
        padding:50px;
        width:100%;
    }

    .page-title{
        font-size:32px;
        font-weight:700;
        border-bottom:2px solid #000;
        padding-bottom:10px;
        margin-bottom:40px;
    }

    form{
        max-width:700px;
    }

    label{
        display:block;
        font-weight:600;
        margin-bottom:8px;
        margin-top:25px;
    }

    input[type="text"],
    input[type="file"]{
        width:100%;
        padding:14px;
        border:2px solid #000;
        font-size:16px;
        background:#fff;
        color:#000;
    }

    .current-image{
        margin-top:15px;
    }

    .current-image img{
        width:180px;
        border:2px solid #000;
        display:block;
        margin-top:10px;
    }

    .form-actions{
        margin-top:40px;
        display:flex;
        gap:20px;
    }

    .btn{
        padding:14px 25px;
        font-size:15px;
        font-weight:600;
        border:2px solid #000;
        cursor:pointer;
        text-decoration:none;
        text-align:center;
    }

    .btn-black{
        background:#000;
        color:#fff;
    }

    .btn-black:hover{
        background:#222;
    }

    .btn-outline{
        background:#fff;
        color:#000;
    }
</style>
</head>

<body>

<div class="page-wrap">

    <div class="page-title">
        Edit Category
    </div>

    <form method="POST" enctype="multipart/form-data">

        <label>Category Name</label>
        <input type="text" name="name"
               value="<?php echo htmlspecialchars($category['name']); ?>" required>

        <label>Change Image</label>
        <input type="file" name="image">

        <div class="current-image">
            <strong>Current Image</strong>
            <img src="<?php echo $category['image'] ? $category['image'] : $placeholder; ?>"
                 onerror="this.src='<?php echo $placeholder; ?>'">
        </div>

        <div class="form-actions">
            <button type="submit" class="btn btn-black">
                UPDATE CATEGORY
            </button>

            <a href="category.php" class="btn btn-outline">
                CANCEL
            </a>
        </div>

    </form>

</div>

</body>
</html>
