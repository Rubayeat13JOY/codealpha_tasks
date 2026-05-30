<?php
session_start();
include 'db.php';

if(!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin'){
    die('Access denied');
}

$placeholder = "images/placeholder.png";

if($_SERVER['REQUEST_METHOD'] === 'POST'){
    $name = trim($_POST['name']);
    $price = floatval($_POST['price']);
    $category_id = intval($_POST['category_id']);
    $image = '';

    if(!empty($_FILES['image']['name'])){
        $target_dir = "images/";
        if(!is_dir($target_dir)) mkdir($target_dir, 0777, true);
        $image = time().'_'.basename($_FILES['image']['name']);
        move_uploaded_file($_FILES['image']['tmp_name'], $target_dir.$image);
    }

    $stmt = $conn->prepare("INSERT INTO products (name, price, main_image, category_id) VALUES (?,?,?,?)");
    $stmt->bind_param("sdsi", $name, $price, $image, $category_id);
    $stmt->execute();

    header("Location: products.php");
    exit;
}

// Fetch categories
$categories = $conn->query("SELECT id, name FROM categories ORDER BY name");
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Add New Product</title>
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
            border: 1px solid #000; /* Black border for inputs */
            border-radius: 8px;
            background-color: #fff; /* White input */
            color: #000;
            font-size: 14px;
        }

        input[type="text"]::placeholder,
        input[type="number"]::placeholder {
            color: #555;
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
            background-color: #444; /* Slightly lighter black on hover */
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
    <h2>Add New Product</h2>
    <form method="POST" enctype="multipart/form-data">
        <label>Product Name</label>
        <input type="text" name="name" placeholder="Enter product name" required>

        <label>Price</label>
        <input type="number" step="0.01" name="price" placeholder="Enter price" required>

        <label>Category</label>
        <select name="category_id" required>
            <?php while($cat = $categories->fetch_assoc()): ?>
                <option value="<?= $cat['id'] ?>"><?= htmlspecialchars($cat['name']) ?></option>
            <?php endwhile; ?>
        </select>

        <label>Product Image</label>
        <input type="file" name="image">

        <button type="submit">Add Product</button>
    </form>
</div>

</body>
</html>
