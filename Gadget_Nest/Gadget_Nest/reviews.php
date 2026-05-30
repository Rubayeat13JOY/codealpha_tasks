<?php
session_start();
$page_title = "Reviews";
$page_active = "reviews"; 
include 'base.php';
include 'db.php'; 

$is_logged_in = isset($_SESSION['user_id']); 
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
$placeholder = "images/placeholder.png";

// -----------------------
// ADD TO CART
// -----------------------
if($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart'])){
    $pid = intval($_POST['product_id']);
    $qty = 1;

    $stmt = $conn->prepare("SELECT id, name, price, main_image, stock_status FROM products WHERE id=?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $result = $stmt->get_result();
    $product = $result->fetch_assoc();

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

// -----------------------
// HELPER FUNCTION TO FETCH REVIEWS WITH AVERAGE RATING
// -----------------------
function fetch_reviews($conn, $where_clause, $order_clause) {
    $sql = "SELECT p.id, p.name AS product_name, p.main_image, p.stock_status,
                   COALESCE(ROUND(AVG(r.rating),1),0) AS avg_rating,
                   COUNT(r.id) AS review_count
            FROM products p
            JOIN product_reviews r ON p.id = r.product_id
            $where_clause
            GROUP BY p.id
            $order_clause
            LIMIT 6";
    return $conn->query($sql);
}

function displayStars($rating){
    return str_repeat('★', floor($rating)) . str_repeat('☆', 5 - floor($rating));
}
?>

<!-- Last 24 Hours Reviews -->
<section class="review-section">
  <h2>Last 24 Hours Reviews</h2>
  <div class="review-list">
    <?php
    $result = fetch_reviews($conn, "WHERE r.created_at >= NOW() - INTERVAL 1 DAY", "ORDER BY r.created_at DESC");

    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $image = empty($row['main_image']) ? $placeholder : $row['main_image'];
            $stars = displayStars($row['avg_rating']);
            $in_stock = $row['stock_status'] === 'In Stock';
            $button_text = $in_stock ? 'Add to Cart' : 'Out of Stock';
            $disabled_attr = $in_stock ? '' : 'disabled';
            $href = $is_logged_in ? "product.php?id={$row['id']}" : "#";
            $link_class = $is_logged_in ? '' : 'login-popup';
            ?>
            <div class="review-item" data-href="<?= $href ?>" data-login="<?= $link_class ? '1' : '0' ?>">
                <img src="<?= $image ?>" alt="<?= htmlspecialchars($row['product_name']) ?>" onerror="this.src='<?= $placeholder ?>';">
                <div class="review-info">
                    <h3><?= htmlspecialchars($row['product_name']) ?></h3>
                    <div class="stars"><?= $stars ?></div>
                    <div class="review-count"><?= $row['review_count'] ?> reviews</div>
                    <p style="color:<?= $in_stock ? 'green' : 'red' ?>;font-weight:bold;margin:0;"><?= $row['stock_status'] ?></p>
                </div>
                <?php if($is_logged_in): ?>
                    <form method="POST" class="add-cart-form">
                        <input type="hidden" name="product_id" value="<?= $row['id'] ?>">
                        <button type="submit" name="add_to_cart" class="add-cart-btn" <?= $disabled_attr ?>>
                            <?= $button_text ?>
                        </button>
                    </form>
                <?php endif; ?>
            </div>
        <?php
        }
    } else {
        echo '<p>No reviews in the last 24 hours.</p>';
    }
    ?>
  </div>
</section>

<!-- This Year Reviews -->
<section class="review-section">
  <h2>This Year Reviews</h2>
  <div class="review-list">
    <?php
    $result = fetch_reviews($conn, "WHERE r.created_at >= DATE_FORMAT(NOW() ,'%Y-01-01')", "ORDER BY review_count DESC");

    if ($result && $result->num_rows > 0) {
        while($row = $result->fetch_assoc()) {
            $image = empty($row['main_image']) ? $placeholder : $row['main_image'];
            $stars = displayStars($row['avg_rating']);
            $in_stock = $row['stock_status'] === 'In Stock';
            $button_text = $in_stock ? 'Add to Cart' : 'Out of Stock';
            $disabled_attr = $in_stock ? '' : 'disabled';
            $href = $is_logged_in ? "product.php?id={$row['id']}" : "#";
            $link_class = $is_logged_in ? '' : 'login-popup';
            ?>
            <div class="review-item" data-href="<?= $href ?>" data-login="<?= $link_class ? '1' : '0' ?>">
                <img src="<?= $image ?>" alt="<?= htmlspecialchars($row['product_name']) ?>" onerror="this.src='<?= $placeholder ?>';">
                <div class="review-info">
                    <h3><?= htmlspecialchars($row['product_name']) ?></h3>
                    <div class="stars"><?= $stars ?></div>
                    <div class="review-count"><?= $row['review_count'] ?> reviews</div>
                    <p style="color:<?= $in_stock ? 'green' : 'red' ?>;font-weight:bold;margin:0;"><?= $row['stock_status'] ?></p>
                </div>
                <?php if($is_logged_in): ?>
                    <form method="POST" class="add-cart-form">
                        <input type="hidden" name="product_id" value="<?= $row['id'] ?>">
                        <button type="submit" name="add_to_cart" class="add-cart-btn" <?= $disabled_attr ?>>
                            <?= $button_text ?>
                        </button>
                    </form>
                <?php endif; ?>
            </div>
        <?php
        }
    } else {
        echo '<p>No reviews for this year.</p>';
    }
    ?>
  </div>
</section>

<?php include 'base_footer.php'; ?>
<link rel="stylesheet" href="reviews.css">

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Click anywhere on review-item navigates to product page
    document.querySelectorAll('.review-item').forEach(function(item){
        item.addEventListener('click', function(e){
            if(e.target.closest('.add-cart-form')) return;

            const href = item.getAttribute('data-href');
            const loginPopup = item.getAttribute('data-login') === '1';

            if(loginPopup){
                const popup = document.getElementById('popup-placeholder');
                if(popup) popup.style.display = 'block';
            } else if(href){
                window.location.href = href;
            }
        });
    });
});
</script>
