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

// Fetch product
$stmt = $conn->prepare("SELECT * FROM products WHERE id=?");
$stmt->bind_param("i",$id);
$stmt->execute();
$product = $stmt->get_result()->fetch_assoc();
if(!$product) die('Product not found');

// Fetch categories
$categories = $conn->query("SELECT id, name FROM categories ORDER BY name");

$placeholder = "images/placeholder.png";

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = trim($_POST['name']);
    $price = floatval($_POST['price']);
    $category_id = intval($_POST['category_id']);
    $image = $product['main_image'];

    if(!empty($_FILES['image']['name'])){
        $target_dir = "images/";
        if(!is_dir($target_dir)) mkdir($target_dir,0777,true);
        $image = time().'_'.basename($_FILES['image']['name']);
        move_uploaded_file($_FILES['image']['tmp_name'],$target_dir.$image);
    }

    $stmt = $conn->prepare("UPDATE products SET name=?, price=?, main_image=?, category_id=? WHERE id=?");
    $stmt->bind_param("sdsii",$name,$price,$image,$category_id,$id);
    $stmt->execute();

    header("Location: products.php");
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Edit Product</title>
    <style>
        body {
            background-color: #fff; /* Page white */
            font-family: Arial, sans-serif;
            color: #000;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 50px auto;
            padding: 40px;
            background-color: #fff; /* Form white */
            border: 2px solid #000; /* Black border */
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
        }

        h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #000;
        }

        label {
            display: block;
            margin-bottom: 8px;
            font-weight: bold;
            color: #000;
        }

        input[type="text"],
        input[type="number"],
        select,
        input[type="file"] {
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            border: 1px solid #000;
            border-radius: 8px;
            background-color: #fff;
            color: #000;
            font-size: 14px;
        }

        input[type="text"]::placeholder,
        input[type="number"]::placeholder {
            color: #555;
        }

        img {
            margin-bottom: 20px;
            border-radius: 8px;
            border: 1px solid #000;
        }

        button {
            width: 100%;
            padding: 14px;
            background-color: #000; /* Black button */
            color: #fff;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        button:hover {
            background-color: #444;
        }

        input:focus, select:focus {
            outline: none;
            border-color: #000;
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>

<div class="container">
    <h2>Edit Product</h2>
    <form method="POST" enctype="multipart/form-data">
        <label>Product Name</label>
        <input type="text" name="name" value="<?= htmlspecialchars($product['name']) ?>" required>

        <label>Price</label>
        <input type="number" step="0.01" name="price" value="<?= $product['price'] ?>" required>

        <label>Category</label>
        <select name="category_id" required>
            <?php
            // Reset result pointer for categories
            $categories->data_seek(0);
            while($cat = $categories->fetch_assoc()): ?>
                <option value="<?= $cat['id'] ?>" <?= $cat['id']==$product['category_id']?'selected':'' ?>>
                    <?= htmlspecialchars($cat['name']) ?>
                </option>
            <?php endwhile; ?>
        </select>

        <label>Change Image</label>
        <input type="file" name="image">

        <p>Current Image:</p>
        <img src="<?= $product['main_image'] ?: $placeholder ?>" alt="Product Image" width="150">

        <button type="submit">Update Product</button>
    </form>
</div>

</body>
</html>
