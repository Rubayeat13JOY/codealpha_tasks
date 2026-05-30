<?php
session_start();
$page_title = "Best Selling Products";
$page_active = "bestselling";
include 'base.php';
include 'db.php';

$placeholder = "images/placeholder.png";
$logged_in = isset($_SESSION['user_id']);
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];

// Add to Cart Logic
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart']) && $logged_in) {
    $pid = (int)$_POST['product_id'];
    $stmt = $conn->prepare("SELECT id, name, price, main_image, stock_status FROM products WHERE id = ?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($product = $result->fetch_assoc()) {
        if($product['stock_status'] === 'In Stock'){ // only add if in stock
            $_SESSION['cart'][$pid]['id'] = $product['id'];
            $_SESSION['cart'][$pid]['name'] = $product['name'];
            $_SESSION['cart'][$pid]['price'] = $product['price'];
            $_SESSION['cart'][$pid]['image'] = $product['main_image'] ?: $placeholder;
            $_SESSION['cart'][$pid]['quantity'] = ($_SESSION['cart'][$pid]['quantity'] ?? 0) + 1;
        }
    }
}

// SQL Queries
$sql_last24 = "(SELECT p.id AS id, p.name, p.price, p.main_image, p.stock_status, SUM(oi.quantity) AS sold, COALESCE(ROUND(AVG(r.rating),1),0) AS rating
FROM order_items oi
JOIN products p ON p.id = oi.product_id
LEFT JOIN product_reviews r ON p.id = r.product_id
WHERE oi.product_id IS NOT NULL AND oi.order_date >= NOW() - INTERVAL 1 DAY
GROUP BY p.id)
UNION ALL
(SELECT NULL AS id, oi.product_name AS name, oi.price, NULL AS main_image, 'In Stock' AS stock_status, SUM(oi.quantity) AS sold, 0 AS rating
FROM order_items oi
WHERE oi.product_id IS NULL AND oi.order_date >= NOW() - INTERVAL 1 DAY
GROUP BY oi.product_name, oi.price)
ORDER BY sold DESC
LIMIT 10";
$last24 = $conn->query($sql_last24)->fetch_all(MYSQLI_ASSOC);

$sql_thisyear = "(SELECT p.id AS id, p.name, p.price, p.main_image, p.stock_status, SUM(oi.quantity) AS sold, COALESCE(ROUND(AVG(r.rating),1),0) AS rating
FROM order_items oi
JOIN products p ON p.id = oi.product_id
LEFT JOIN product_reviews r ON p.id = r.product_id
WHERE oi.product_id IS NOT NULL AND YEAR(oi.order_date) = YEAR(CURDATE())
GROUP BY p.id)
UNION ALL
(SELECT NULL AS id, oi.product_name AS name, oi.price, NULL AS main_image, 'In Stock' AS stock_status, SUM(oi.quantity) AS sold, 0 AS rating
FROM order_items oi
WHERE oi.product_id IS NULL AND YEAR(oi.order_date) = YEAR(CURDATE())
GROUP BY oi.product_name, oi.price)
ORDER BY sold DESC
LIMIT 10";
$thisyear = $conn->query($sql_thisyear)->fetch_all(MYSQLI_ASSOC);

function displayStars($rating) {
    return str_repeat('★', floor($rating)) . str_repeat('☆', 5 - floor($rating));
}
?>

<!-- Last 24 Hours Section -->
<section class="bestselling-section">
  <h2 style="font-size:24px;margin-bottom:25px;">Last 24 Hours Best Selling</h2>
  <div class="product-list">
    <?php if (!empty($last24)): ?>
      <?php foreach ($last24 as $product): 
          $in_stock = ($product['stock_status'] === 'In Stock');
          $button_text = $in_stock ? 'Add to Cart' : 'Out of Stock';
          $disabled_attr = $in_stock ? '' : 'disabled';
      ?>
      <div class="product-list-item" style="display:flex;justify-content:space-between;align-items:center;background:#fff;border-radius:10px;padding:15px 20px;box-shadow:0 0 5px rgba(0,0,0,0.1);margin-bottom:15px;transition:all 0.3s ease;">
        
        <a href="<?= $product['id'] !== null ? 'product.php?id=' . $product['id'] : '#' ?>" 
           style="display:flex;flex:1;text-decoration:none;color:#000;gap:20px;align-items:center;">
          <img src="<?= htmlspecialchars($product['main_image'] ?: $placeholder) ?>" 
               onerror="this.src='<?= $placeholder ?>';" 
               style="width:150px;height:150px;object-fit:contain;border-radius:8px;flex-shrink:0;">
          <div class="product-info" style="display:flex;flex-direction:column;gap:8px;">
            <h3 style="margin:0;font-size:18px;font-weight:600;color:#000;"><?= htmlspecialchars($product['name']) ?></h3>
            <p class="price" style="margin:0;color:red;font-weight:bold;font-size:16px;">৳ <?= number_format($product['price'], 2) ?></p>
            <div class="sold-count" style="color:#000;">Sold: <?= $product['sold'] ?></div>
            <div class="stars" style="color:gold;font-size:14px;"><?= displayStars($product['rating']) ?></div>
            <p style="color:<?= $in_stock ? 'green' : 'red' ?>;font-weight:bold;margin:0;"><?= $product['stock_status'] ?></p>
          </div>
        </a>

        <?php if ($logged_in && $product['id'] !== null): ?>
        <form method="POST" style="margin-left:20px;">
          <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
          <button type="submit" name="add_to_cart" 
                  style="background:#111;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;transition:background 0.3s;"
                  <?= $disabled_attr ?>>
            <?= $button_text ?>
          </button>
        </form>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    <?php else: ?>
      <p>No products sold in the last 24 hours.</p>
    <?php endif; ?>
  </div>
</section>

<!-- This Year Section -->
<section class="bestselling-section">
  <h2 style="font-size:24px;margin-bottom:25px;">This Year Best Selling</h2>
  <div class="product-list">
    <?php if (!empty($thisyear)): ?>
      <?php foreach ($thisyear as $product): 
          $in_stock = ($product['stock_status'] === 'In Stock');
          $button_text = $in_stock ? 'Add to Cart' : 'Out of Stock';
          $disabled_attr = $in_stock ? '' : 'disabled';
      ?>
      <div class="product-list-item" style="display:flex;justify-content:space-between;align-items:center;background:#fff;border-radius:10px;padding:15px 20px;box-shadow:0 0 5px rgba(0,0,0,0.1);margin-bottom:15px;transition:all 0.3s ease;">
        
        <a href="<?= $product['id'] !== null ? 'product.php?id=' . $product['id'] : '#' ?>" 
           style="display:flex;flex:1;text-decoration:none;color:#000;gap:20px;align-items:center;">
          <img src="<?= htmlspecialchars($product['main_image'] ?: $placeholder) ?>" 
               onerror="this.src='<?= $placeholder ?>';" 
               style="width:150px;height:150px;object-fit:contain;border-radius:8px;flex-shrink:0;">
          <div class="product-info" style="display:flex;flex-direction:column;gap:8px;">
            <h3 style="margin:0;font-size:18px;font-weight:600;color:#000;"><?= htmlspecialchars($product['name']) ?></h3>
            <p class="price" style="margin:0;color:red;font-weight:bold;font-size:16px;">৳ <?= number_format($product['price'], 2) ?></p>
            <div class="sold-count" style="color:#000;">Sold: <?= $product['sold'] ?></div>
            <div class="stars" style="color:gold;font-size:14px;"><?= displayStars($product['rating']) ?></div>
            <p style="color:<?= $in_stock ? 'green' : 'red' ?>;font-weight:bold;margin:0;"><?= $product['stock_status'] ?></p>
          </div>
        </a>

        <?php if ($logged_in && $product['id'] !== null): ?>
        <form method="POST" style="margin-left:20px;">
          <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
          <button type="submit" name="add_to_cart" 
                  style="background:#111;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;transition:background 0.3s;"
                  <?= $disabled_attr ?>>
            <?= $button_text ?>
          </button>
        </form>
        <?php endif; ?>
      </div>
      <?php endforeach; ?>
    <?php else: ?>
      <p>No products sold this year.</p>
    <?php endif; ?>
  </div>
</section>

<?php include 'base_footer.php'; ?>

