<?php
session_start();
include 'db.php';
include 'base.php';

$page_title = "Gadget Nest | Checkout";
$page_active = "checkout";
$placeholder = "images/placeholder.png";

// Ensure user is logged in
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}
$user_id = $_SESSION['user_id'];

// Ensure cart exists
if (!isset($_SESSION['cart']) || empty($_SESSION['cart'])) {
    $_SESSION['cart'] = [];
}

// Calculate totals
$subtotal = 0;
foreach ($_SESSION['cart'] as $item) {
    $subtotal += $item['price'] * $item['quantity'];
}
$shipping = $subtotal > 0 ? 500 : 0;
$tax = $subtotal * 0.025;
$total = $subtotal + $shipping + $tax;

// Handle form submission
$order_success = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['place_order'])) {

    // Get form values
    $first = trim($_POST['first'] ?? '');
    $last  = trim($_POST['last'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $phone = trim($_POST['phone'] ?? '');
    $address = trim($_POST['address'] ?? '');
    $city = trim($_POST['city'] ?? '');
    $payment = $_POST['payment'] ?? '';

    // Optional payment fields (empty string if not provided)
    $trx = $_POST['trx'] ?? '';
    $card_num = $_POST['card_num'] ?? '';
    $card_exp = $_POST['card_exp'] ?? '';
    $card_cvv = $_POST['card_cvv'] ?? '';

    // Insert order
    $stmt = $conn->prepare("
        INSERT INTO orders 
        (user_id, first_name, last_name, email, phone, address, city, payment_method, transaction_id, card_number, card_expiry, card_cvv, subtotal, shipping, tax, total)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if ($stmt) {
        $stmt->bind_param(
            "isssssssssssdddd",
            $user_id, $first, $last, $email, $phone, $address, $city, $payment,
            $trx, $card_num, $card_exp, $card_cvv,
            $subtotal, $shipping, $tax, $total
        );

        if ($stmt->execute()) {
            // Get last inserted order ID
            $order_id = $conn->insert_id;

            // Insert each cart item
            foreach ($_SESSION['cart'] as $item) {
                $stmt_item = $conn->prepare("
                    INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                    VALUES (?, ?, ?, ?, ?)
                ");
                $stmt_item->bind_param(
                    "iisdi",
                    $order_id, $item['id'], $item['name'], $item['price'], $item['quantity']
                );
                $stmt_item->execute();
                $stmt_item->close();
            }

            // Clear cart
            $_SESSION['cart'] = [];
            $order_success = true;
        } else {
            die("Execute failed: " . $stmt->error);
        }

        $stmt->close();
    } else {
        die("Database error: " . $conn->error);
    }
}
?>

<link rel="stylesheet" href="products.css">
<link rel="stylesheet" href="checkout.css">
<link rel="icon" type="image/png" href="images/title.png" />

<section class="checkout-section">
  <div class="checkout-container" style="display:flex; gap:30px; flex-wrap:wrap;">

    <form method="POST" class="checkout-form-wrapper" style="display:flex; gap:30px; flex-wrap:wrap; width:100%;">

      <!-- Billing Details -->
      <div class="checkout-form" style="flex:0 0 65%; min-width:300px;">
        <h2>Billing Details</h2>
        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input type="text" name="first" required>
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" name="last" required>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input type="email" name="email" required>
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" name="phone" required>
          </div>
        </div>

        <div class="form-group">
          <label>Address</label>
          <textarea rows="3" name="address" required></textarea>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>City</label>
            <input type="text" name="city" required>
          </div>

          <div class="form-group">
            <br><br><label>Payment Method</label>

            <div class="form-group" id="onlinePaymentBox" style="display:none;">
              <label>Transaction ID</label>
              <input type="text" id="trxId" name="trx" placeholder="Enter Transaction ID">
              <br><small style="color:#555;">
                Send money to <b>01XXXXXXXXX</b> and enter Trx ID
              </small>
            </div><br>

            <div class="form-group" id="cardPaymentBox" style="display:none;">
              <label>Card Details</label>
              <input type="text" placeholder="Card Number" id="cardNumber" name="card_num">
              <input type="text" placeholder="MM / YY" id="cardExpiry" style="margin-top:8px;" name="card_exp">
              <br><input type="text" placeholder="CVV" id="cardCVV" style="margin-top:8px;" name="card_cvv">
            </div><br>

            <div class="payment-options">
              <label class="payment-card">
                <input type="radio" name="payment" value="Cash on Delivery" checked>
                <span>Cash on Delivery</span>
              </label>
              <label class="payment-card">
                <input type="radio" name="payment" value="bKash">
                <span>bKash</span>
              </label>
              <label class="payment-card">
                <input type="radio" name="payment" value="Nagad">
                <span>Nagad</span>
              </label>
              <label class="payment-card">
                <input type="radio" name="payment" value="Card Payment">
                <span>Card Payment</span>
              </label>
            </div>

          </div>
        </div>

        <div style="margin-top:20px;">
          <button type="submit" name="place_order" class="place-order-btn">Place Order</button>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary" style="flex:0 0 30%; min-width:250px;">
        <h2>Your Order</h2>
        <?php foreach ($_SESSION['cart'] as $item): ?>
        <div class="summary-item">
          <span><?= htmlspecialchars($item['name']) ?> (x<?= $item['quantity'] ?>)</span>
          <span>৳ <?= number_format($item['price'] * $item['quantity'], 2) ?></span>
        </div>
        <?php endforeach; ?>

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
      </div>

    </form>
  </div>
</section>

<?php if ($order_success): ?>
<div class="order-popup" id="orderPopup" style="display:flex;">
  <div class="popup-box">
    <div class="checkmark">✔</div>
    <p>Your order has been confirmed</p>
    <button onclick="redirectToProducts()">OK</button>
  </div>
</div>

<script>
function redirectToProducts() {
    window.location.href = "products.php"; // redirect to products page
}
</script>
<?php endif; ?>


<script>
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const onlineBox = document.getElementById('onlinePaymentBox');
const trxInput = document.getElementById('trxId');
const cardBox = document.getElementById('cardPaymentBox');
const cardNumber = document.getElementById('cardNumber');
const cardExpiry = document.getElementById('cardExpiry');
const cardCVV = document.getElementById('cardCVV');

paymentRadios.forEach(radio => {
  radio.addEventListener('change', () => {
    const method = radio.nextElementSibling.innerText;
    onlineBox.style.display = 'none';
    cardBox.style.display = 'none';
    trxInput.value = '';
    cardNumber.value = '';
    cardExpiry.value = '';
    cardCVV.value = '';

    if (method === 'bKash' || method === 'Nagad') {
      onlineBox.style.display = 'block';
    }
    if (method === 'Card Payment') {
      cardBox.style.display = 'block';
    }
  });
});

function closePopup() {
  document.getElementById('orderPopup').style.display = 'none';
}
</script>
