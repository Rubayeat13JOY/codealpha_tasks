<?php
$page_title = "Cart";
$page_active = "cart";
include 'base.php';

$placeholder = "images/placeholder.png";

/* =====================
   CART INITIALIZE
===================== */
if (!isset($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

/* =====================
   REMOVE ITEM
===================== */
if (isset($_GET['remove'])) {
    $remove_id = (int) $_GET['remove'];
    unset($_SESSION['cart'][$remove_id]);
 
}

/* =====================
   UPDATE QUANTITY
===================== */
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_cart'])) {
    foreach ($_POST['quantity'] as $pid => $qty) {
        $pid = (int)$pid;
        $qty = max(1, (int)$qty);
        if (isset($_SESSION['cart'][$pid])) {
            $_SESSION['cart'][$pid]['quantity'] = $qty;
        }
    }
    header("Location: cart.php");
    exit;
}

/* =====================
   CALCULATE TOTALS
===================== */
$subtotal = 0;
foreach ($_SESSION['cart'] as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}
$shipping = $subtotal > 0 ? 500 : 0;
$tax = $subtotal * 0.025;
$total = $subtotal + $shipping + $tax;
?>

<section class="cart-section">
  <div class="cart-container">

    <!-- LEFT: CART ITEMS -->
    <div class="cart-items">
      <h2>Your Cart</h2>

      <?php if (!empty($_SESSION['cart'])): ?>
      <form method="POST">
        <?php foreach ($_SESSION['cart'] as $pid => $item): ?>
        <div class="cart-item">
          <span class="remove-icon">
            <a href="cart.php?remove=<?= $pid ?>">&times;</a>
          </span>

          <img src="<?= !empty($item['image']) ? $item['image'] : $placeholder ?>"
               onerror="this.src='<?= $placeholder ?>'"
               alt="<?= htmlspecialchars($item['name']) ?>">

          <div class="item-details">
            <p class="item-name"><?= htmlspecialchars($item['name']) ?></p>

            <div class="quantity-controls">
              <button type="button" class="qty-btn minus">-</button>
              <input type="number" name="quantity[<?= $pid ?>]" value="<?= $item['quantity'] ?>" min="1">
              <button type="button" class="qty-btn plus">+</button>
            </div>

            <p class="item-price" data-price="<?= $item['price'] ?>">
              ৳ <?= number_format($item['price'] * $item['quantity'], 2) ?>
            </p>
          </div>
        </div>
        <?php endforeach; ?>

        <button type="submit" name="update_cart" class="update-cart-btn">Update Cart</button>
      </form>
      <?php else: ?>
        <p>Your cart is empty.</p>
      <?php endif; ?>
    </div>

    <!-- RIGHT: ORDER SUMMARY -->
    <div class="order-summary">
      <h2>Order Summary</h2>

      <div class="summary-item">
        <span>Subtotal</span>
        <span>৳ <?= number_format($subtotal, 2) ?></span>
      </div>

      <div class="summary-item">
        <span>Shipping</span>
        <span>৳ <?= number_format($shipping, 2) ?></span>
      </div>

      <div class="summary-item">
        <span>Tax</span>
        <span>৳ <?= number_format($tax, 2) ?></span>
      </div>

      <div class="summary-total">
        <span>Total</span>
        <span>৳ <?= number_format($total, 2) ?></span>
      </div>

      <?php if (!empty($_SESSION['cart'])): ?>
      <button class="checkout-btn" onclick="proceedToCheckout()">Proceed to Checkout</button>
      <?php endif; ?>
    </div>

  </div>
</section>

<link rel="stylesheet" href="cart.css">

<script>
// Quantity buttons
document.querySelectorAll('.cart-item').forEach(item => {
    const minusBtn = item.querySelector('.minus');
    const plusBtn  = item.querySelector('.plus');
    const qtyInput = item.querySelector('input[type="number"]');
    const priceBox = item.querySelector('.item-price');
    const unitPrice = parseFloat(priceBox.dataset.price);

    function updatePrice() {
        let qty = parseInt(qtyInput.value);
        if (qty < 1) qty = 1;
        priceBox.innerText = '৳ ' + (unitPrice * qty).toFixed(2);
    }

    minusBtn.addEventListener('click', () => {
        qtyInput.value = Math.max(1, parseInt(qtyInput.value) - 1);
        updatePrice();
    });

    plusBtn.addEventListener('click', () => {
        qtyInput.value = parseInt(qtyInput.value) + 1;
        updatePrice();
    });

    qtyInput.addEventListener('change', updatePrice);
});

// Proceed to checkout
function proceedToCheckout() {
    window.location.href = "checkout.php";
}
</script>

<?php include 'base_footer.php'; ?>
