<?php
session_start();
include 'db.php';

$page_title = "Products";
$page_active = "products";

$is_logged_in = isset($_SESSION['user_id']);
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
$placeholder = "images/placeholder.png";

$category_id = isset($_GET['category_id']) ? (int)$_GET['category_id'] : 5;
$search_query = isset($_GET['q']) ? trim($_GET['q']) : '5';

/* -----------------------
   ADD TO CART
----------------------- */
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart'])){
    $pid = intval($_POST['product_id']);
    $qty = 1;

    $stmt = $conn->prepare("SELECT id, name, price, main_image, stock_status FROM products WHERE id=?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $product = $stmt->get_result()->fetch_assoc();

    if($product && $product['stock_status'] === 'In Stock'){
        if(!isset($_SESSION['cart'])) $_SESSION['cart'] = [];
        if(isset($_SESSION['cart'][$pid])){
            $_SESSION['cart'][$pid]['quantity'] += $qty;
        } else {
            $_SESSION['cart'][$pid] = [
                'name' => $product['name'],
                'price' => $product['price'],
                'image' => $product['main_image'] ?: $placeholder,
                'quantity' => $qty
            ];
        }
    }
}

/* -----------------------
   FETCH CATEGORIES
----------------------- */
$categories = [];
$res = $conn->query("SELECT id, name FROM categories ORDER BY name");
while($row = $res->fetch_assoc()){
    $categories[$row['id']] = $row['name'];
}

/* -----------------------
   FETCH PRODUCTS (WITH SEARCH)
----------------------- */
$sql = "
    SELECT p.id, p.name, p.price, p.main_image, c.name AS category_name, p.stock_status,
           COALESCE(AVG(r.rating),0) AS avg_rating
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_reviews r ON p.id = r.product_id
";

$where = [];
$params = [];
$types = '';

if($category_id > 0){
    $where[] = "p.category_id = ?";
    $types .= 'i';
    $params[] = $category_id;
}

if($search_query !== ''){
    $where[] = "p.name LIKE ?";
    $types .= 's';
    $params[] = "%{$search_query}%";
}

if($where){
    $sql .= " WHERE " . implode(" AND ", $where);
}

$sql .= " GROUP BY p.id ORDER BY p.name ASC";

$stmt = $conn->prepare($sql);
if($params){
    $stmt->bind_param($types, ...$params);
}
$stmt->execute();
$product_result = $stmt->get_result();

include 'base.php';
?>


<section class="products-section">

<?php if($is_admin): ?>
<div style="margin-bottom:20px;">
    <a href="add_product.php" class="add-cart">+ Add New Product</a>
</div>
<?php endif; ?>

<div class="product-grid" id="product-grid">
<?php
if ($product_result && $product_result->num_rows > 0) {
    while ($row = $product_result->fetch_assoc()) {

        $image = (!isset($row['main_image']) || trim($row['main_image']) === '')
                 ? $placeholder : $row['main_image'];

        $stars = str_repeat('★', floor($row['avg_rating'])) .
                 str_repeat('☆', 5 - floor($row['avg_rating']));

        $href = $is_logged_in ? "product.php?id={$row['id']}" : "#";
        $link_class = $is_logged_in ? '' : 'login-popup';

        // Stock check
        $in_stock = ($row['stock_status'] === 'In Stock');
        $button_text = $in_stock ? 'Add to Cart' : 'Out of Stock';
        $disabled_attr = $in_stock ? '' : 'disabled';
?>
    <div class="product-card"
         data-category="<?= htmlspecialchars($row['category_name']) ?>"
         data-price="<?= $row['price'] ?>"
         data-rating="<?= $row['avg_rating'] ?>">

        <?php if($is_admin): ?>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
            <a href="edit_product.php?id=<?= $row['id'] ?>">Edit</a>
            <a href="delete_product.php?id=<?= $row['id'] ?>"
               onclick="return confirm('Delete this product?')">Delete</a>
        </div>
        <?php endif; ?>

        <a href="<?= $href ?>" class="link <?= $link_class ?>">
            <img src="<?= $image ?>" alt="<?= htmlspecialchars($row['name']) ?>"
                 onerror="this.src='<?= $placeholder ?>';">
            <div class="product-info">
                <div class="name-rating">
                    <h3><?= htmlspecialchars($row['name']) ?></h3>
                    <div class="stars"><?= $stars ?></div>
                </div>
                <p class="price">৳ <?= number_format($row['price'], 2) ?></p>
                <p class="stock-status"><b>Status:</b> <?= $row['stock_status'] ?></p>
            </div>
        </a>

        <?php if($is_logged_in): ?>
        <form method="POST" class="add-cart-form">
            <input type="hidden" name="product_id" value="<?= $row['id'] ?>">
            <button type="submit" name="add_to_cart" class="add-cart" <?= $disabled_attr ?>>
                <?= $button_text ?>
            </button>
        </form>
        <?php endif; ?>

    </div>
<?php
    }
} else {
    echo '<p>No products found.</p>';
}
?>
</div>
</section>

<?php include 'base_footer.php'; ?>
<link rel="stylesheet" href="products.css">

<script>
document.addEventListener('DOMContentLoaded', function() {

    document.querySelectorAll('.login-popup').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const popup = document.getElementById('popup-placeholder');
            if(popup) popup.style.display = 'block';
        });
    });

});
</script>
