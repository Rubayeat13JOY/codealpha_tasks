<?php
session_start();
include 'db.php';   // Database connection

$placeholder = "images/placeholder.png";

// =========================
// ADMIN CHECK
// =========================
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

// =========================
// LOGGED IN USER
// =========================
$logged_user = null;
if (isset($_SESSION['user_id'])) {
    $uid = $_SESSION['user_id'];
    $u = $conn->prepare("SELECT fullname FROM users WHERE id=?");
    $u->bind_param("i", $uid);
    $u->execute();
    $ur = $u->get_result();
    $logged_user = $ur->fetch_assoc();
}

// =========================
// FETCH PRODUCT
// =========================
$product_id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$stmt = $conn->prepare("SELECT * FROM products WHERE id=?");
$stmt->bind_param("i", $product_id);
$stmt->execute();
$res = $stmt->get_result();
$product = $res->fetch_assoc();
if (!$product) { header("Location: products.php"); exit; }

// =========================
// FEATURES
// =========================
$features = [];
$fq = $conn->prepare("SELECT feature FROM product_features WHERE product_id=?");
$fq->bind_param("i", $product_id);
$fq->execute();
$fr = $fq->get_result();
while ($f = $fr->fetch_assoc()) $features[] = $f['feature'];

// =========================
// SPECIFICATIONS
// =========================
$specs = [];
$sq = $conn->prepare("SELECT spec_name, spec_value FROM product_specifications WHERE product_id=?");
$sq->bind_param("i", $product_id);
$sq->execute();
$sr = $sq->get_result();
while ($s = $sr->fetch_assoc()) $specs[] = $s;

// =========================
// REVIEWS
// =========================
$reviews = [];
$avg_rating = 0;
$rq = $conn->prepare("SELECT id, customer_name, rating, comment FROM product_reviews WHERE product_id=?");
$rq->bind_param("i", $product_id);
$rq->execute();
$rr = $rq->get_result();
$total_rating = 0;
$count = 0;
while ($r = $rr->fetch_assoc()) {
    $reviews[] = $r;
    $total_rating += $r['rating'];
    $count++;
}
if ($count > 0) $avg_rating = $total_rating / $count;

// =========================
// RELATED PRODUCTS
// =========================
$related = [];
$relq = $conn->prepare("
    SELECT id, name, price, main_image
    FROM products
    WHERE id != ?
    ORDER BY RAND()
    LIMIT 4
");
$relq->bind_param("i", $product_id);
$relq->execute();
$relr = $relq->get_result();
while ($rel = $relr->fetch_assoc()) $related[] = $rel;

// =========================
// ADD TO CART
// =========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['add_to_cart']) && $logged_user && $product['stock_status'] === 'In Stock') {
    $pid = intval($_POST['product_id']);
    $stmt = $conn->prepare("SELECT id, name, price, main_image FROM products WHERE id=?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $res = $stmt->get_result();
    $p = $res->fetch_assoc();
    if ($p) {
        if (!isset($_SESSION['cart'])) $_SESSION['cart'] = [];
        if (isset($_SESSION['cart'][$pid])) {
            $_SESSION['cart'][$pid]['quantity'] += 1;
        } else {
            $_SESSION['cart'][$pid] = [
                'id'       => $p['id'],
                'name'     => $p['name'],
                'price'    => $p['price'],
                'image'    => $p['main_image'] ?: $placeholder,
                'quantity' => 1
            ];
        }
    }
}

// =========================
// BUY NOW
// =========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['buy_now']) && $logged_user && $product['stock_status'] === 'In Stock') {
    $pid = intval($_POST['product_id']);
    $stmt = $conn->prepare("SELECT id, name, price, main_image FROM products WHERE id=?");
    $stmt->bind_param("i", $pid);
    $stmt->execute();
    $res = $stmt->get_result();
    $p = $res->fetch_assoc();
    if ($p) {
        $_SESSION['cart'] = [];
        $_SESSION['cart'][$pid] = [
            'id'       => $p['id'],
            'name'     => $p['name'],
            'price'    => $p['price'],
            'image'    => $p['main_image'] ?: $placeholder,
            'quantity' => 1
        ];
        header("Location: checkout.php");
        exit;
    }
}

// =========================
// SUBMIT REVIEW
// =========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['submit_review']) && $logged_user) {
    $pid     = intval($_POST['product_id']);
    $rating  = intval($_POST['rating']);
    $comment = trim($_POST['comment']);
    if ($rating >= 1 && $rating <= 5 && $comment !== '') {
        $stmt = $conn->prepare(
            "INSERT INTO product_reviews (product_id, customer_name, rating, comment)
             VALUES (?, ?, ?, ?)"
        );
        $stmt->bind_param("isis", $pid, $logged_user['fullname'], $rating, $comment);
        $stmt->execute();
        header("Location: product.php?id=$pid"); 
        exit;
    }
}

// =========================
// ADMIN STOCK UPDATE
// =========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_stock']) && $is_admin) {
    $status = $_POST['stock_status'];
    $stmt = $conn->prepare("UPDATE products SET stock_status=? WHERE id=?");
    $stmt->bind_param("si", $status, $product_id);
    $stmt->execute();
    header("Location: product.php?id=$product_id");
    exit;
}

// =========================
// ADMIN DELETE REVIEW
// =========================
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_review']) && $is_admin) {
    $rid = intval($_POST['review_id']);
    $pid = intval($_POST['product_id']); // product id needed for redirect
    $stmt = $conn->prepare("DELETE FROM product_reviews WHERE id=?");
    $stmt->bind_param("i", $rid);
    $stmt->execute();
    header("Location: product.php?id=$pid");
    exit;
}

include 'base.php';
?>

<main class="product-details">
  <div class="product-container">
    <!-- IMAGE -->
    <div class="product-image">
      <img src="<?= $product['main_image'] ?: $placeholder ?>" alt="<?= htmlspecialchars($product['name']) ?>" onerror="this.src='<?= $placeholder ?>';">
    </div>

    <!-- SUMMARY -->
    <div class="product-summary">
      <h1><?= htmlspecialchars($product['name']) ?></h1>
      <p class="brand"><b>Brand:</b> <?= htmlspecialchars($product['brand']) ?></p>
      <p class="model"><b>Model:</b> <?= htmlspecialchars($product['model']) ?></p>

      <!-- Average Rating -->
      <div class="rating">
        <?= str_repeat('★', floor($avg_rating)) . str_repeat('☆', 5 - floor($avg_rating)) ?>
        (<?= number_format($avg_rating, 1) ?>/5)
      </div>

      <h2 class="price">৳ <?= number_format($product['price'], 2) ?></h2>
      <p class="stock-status"><b>Status:</b> <?= $product['stock_status'] ?></p>

      <!-- ADMIN STOCK CONTROL -->
      <?php if($is_admin): ?>
        <form method="POST" style="margin-top:10px;">
          <label><b>Stock Status:</b></label>
          <select name="stock_status">
            <option value="In Stock" <?= $product['stock_status']=='In Stock'?'selected':'' ?>>In Stock</option>
            <option value="Out of Stock" <?= $product['stock_status']=='Out of Stock'?'selected':'' ?>>Out of Stock</option>
          </select>
          <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
          <button type="submit" name="update_stock" class="add-cart">Update</button>
        </form>
      <?php endif; ?>

      <!-- FEATURES -->
      <div class="key-features">
        <h3>Key Features:</h3>
        <ul><?php foreach ($features as $f) echo "<li>" . htmlspecialchars($f) . "</li>"; ?></ul>
      </div>

      <!-- ACTION BUTTONS -->
      <?php
      $in_stock = ($product['stock_status'] === 'In Stock');
      $button_text = $in_stock ? 'Add to Cart' : 'Out of Stock';
      $buy_text = $in_stock ? 'Buy Now' : 'Out of Stock';
      $disabled_attr = $in_stock ? '' : 'disabled';
      ?>
      <div class="actions">
        <form method="POST" style="display:inline;">
            <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
            <button type="submit" name="add_to_cart" class="add-cart" <?= $disabled_attr ?>><?= $button_text ?></button>
        </form>
        <form method="POST" style="display:inline;">
            <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
            <button type="submit" name="buy_now" class="buy-now" <?= $disabled_attr ?>><?= $buy_text ?></button>
        </form>
      </div>

    </div>
  </div>

  <!-- SPECIFICATIONS -->
  <section class="spec-section">
    <h2>Specification</h2>
    <table>
      <?php foreach ($specs as $s): ?>
        <tr><th><?= htmlspecialchars($s['spec_name']) ?></th><td><?= htmlspecialchars($s['spec_value']) ?></td></tr>
      <?php endforeach; ?>
    </table>
  </section>

  <!-- DESCRIPTION -->
  <section class="desc-section">
    <h2>Description</h2>
    <p><?= nl2br(htmlspecialchars($product['description'])) ?></p>
  </section>

  <!-- REVIEWS -->
  <section class="reviews">
    <h2>Customer Reviews</h2>
    <?php if ($reviews): ?>
      <?php foreach ($reviews as $r): ?>
        <div class="review-card">
          <strong><?= htmlspecialchars($r['customer_name']) ?></strong>
          <span><?= str_repeat('★', $r['rating']) . str_repeat('☆', 5 - $r['rating']) ?></span>
          <p><?= htmlspecialchars($r['comment']) ?></p>

          <?php if($is_admin): ?>
            <form method="POST" style="display:inline;" onsubmit="return confirm('Delete this review?')">
              <input type="hidden" name="review_id" value="<?= $r['id'] ?>">
              <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
              <button type="submit" name="delete_review" class="add-cart" style="background:red;">Delete</button>
            </form>
          <?php endif; ?>
        </div>
      <?php endforeach; ?>
    <?php else: ?>
      <p>No reviews yet.</p>
    <?php endif; ?>

    <?php if ($logged_user): ?>
      <div class="review-card">
        <form method="POST">
          <input type="hidden" name="product_id" value="<?= $product['id'] ?>">
          <input type="hidden" name="rating" id="rating-value" value="0">
          <strong><?= htmlspecialchars($logged_user['fullname']) ?></strong>
          <div class="review-input">
            <div id="star-rating">
              <?php for($i=1;$i<=5;$i++): ?>
                <span class="star" data-value="<?= $i ?>">★</span>
              <?php endfor; ?>
            </div>
            <textarea name="comment" placeholder="Write your review..." required></textarea>
            <button type="submit" class="send-icon" name="submit_review">&#10148;</button>
          </div>
        </form>
      </div>

      <script>
        const stars = document.querySelectorAll('#star-rating .star');
        const ratingInput = document.getElementById('rating-value');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                let rating = star.getAttribute('data-value');
                ratingInput.value = rating;
                stars.forEach(s => s.classList.toggle('selected', s.getAttribute('data-value') <= rating));
            });
        });
      </script>
    <?php else: ?>
      <p><a href="login.php">Login</a> to write a review.</p>
    <?php endif; ?>
  </section>

  <!-- RELATED PRODUCTS -->
  <section class="related-products">
    <h2>Related Products</h2>
    <div class="related-grid">
      <?php foreach ($related as $rel): ?>
        <div class="related-item">
          <a href="product.php?id=<?= $rel['id'] ?>">
            <img src="<?= $rel['main_image'] ?: $placeholder ?>" alt="<?= htmlspecialchars($rel['name']) ?>" onerror="this.src='<?= $placeholder ?>';">
            <p><?= htmlspecialchars($rel['name']) ?></p>
            <span>৳ <?= number_format($rel['price'], 2) ?></span>
          </a>
        </div>
      <?php endforeach; ?>
    </div>
  </section>
</main>

<link rel="stylesheet" href="product.css">
<?php include 'base_footer.php'; ?>
