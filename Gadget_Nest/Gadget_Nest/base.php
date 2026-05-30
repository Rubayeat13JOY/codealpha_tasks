<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
// Optional: you can check if user is logged in
$is_logged_in = isset($_SESSION['user_id']);
$user_name = $_SESSION['user_name'] ?? '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title><?php echo $page_title ?? "Gadget Nest"; ?></title>
  <link rel="stylesheet" href="base.css" />
</head>
<body>

<!-- Header -->
<header>
  <div class="header-container">
    <div class="logo"><a href="index.php"><img src="images/logo.png" alt="Gadget Nest" /></a></div>
    <div class="search-bar">
  <form action="products.php" method="GET" id="search-form">
    <input type="text" name="q" placeholder="Search products..." value="<?= htmlspecialchars($_GET['q'] ?? '') ?>" />
  </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Submit form on Enter from anywhere
    const searchInput = document.querySelector('.search-bar input[name="q"]');
    const searchForm = document.getElementById('search-form');

    searchInput.addEventListener('keydown', function(e){
        if(e.key === 'Enter'){
            searchForm.submit();
        }
    });
});
</script>

    <div class="auth-buttons">
        <?php if(isset($_SESSION['user_id'])): ?>
    <?php if($_SESSION['role'] === 'admin'): ?>
        <a href="admin-dashboard.php"><img src="images/admin-icon.png" alt="Admin" /></a>
        <a href="logout.php">Logout</a>
    <?php else: ?>
        <a href="profile.php"><img src="images/user-icon.png" alt="User" /></a>
        <a href="logout.php">Logout</a>
    <?php endif; ?>
<?php else: ?>
    <a href="#" class="login">Login</a>
    <a href="#" class="register">Register</a>
<?php endif; ?>

    </div>
  </div>
</header>

<!-- Navigation -->
<nav>
  <ul>
    <li><a href="index.php" class="<?php if($page_active=='home') echo 'active'; ?>">home</a></li>
    <li><a href="products.php" class="<?php if($page_active=='products') echo 'active'; ?>">products</a></li>
    <li><a href="category.php" class="<?php if($page_active=='category') echo 'active'; ?>">category</a></li>
    <li><a href="bestselling.php" class="<?php if($page_active=='bestselling') echo 'active'; ?>">best sellings</a></li>

    <?php if(isset($_SESSION['user_id'])): ?>
        <?php if($_SESSION['role'] !== 'admin'): ?>
            <li><a href="cart.php" class="<?php if($page_active=='cart') echo 'active'; ?>">cart</a></li>
            <li><a href="compare.php" class="<?php if($page_active=='compare') echo 'active'; ?>">compare product</a></li>
        <?php endif; ?>
    <?php else: ?>
        <!-- For guests, show cart/compare but trigger popup -->
        <li><a href="#" class="login-popup">cart</a></li>
        <li><a href="#" class="login-popup">compare product</a></li>
    <?php endif; ?>

    <li><a href="offer.php" class="<?php if($page_active=='offer') echo 'active'; ?>">offers</a></li>
    <li><a href="reviews.php" class="<?php if($page_active=='reviews') echo 'active'; ?>">reviews</a></li>

    <?php 
    // যদি checkout page এ থাকি, checkout link দেখাই
    if(isset($page_active) && $page_active == 'checkout'): ?>
      <li><a href="checkout.php" class="active">checkout</a></li>
    <?php endif; ?>
  </ul>
</nav>








<!-- Popup -->
<div id="popup-placeholder">
  <?php include 'popup.php'; ?>
</div>

<!-- Page Content Starts Here -->
<div class="page-content">
  
<script>
document.addEventListener('DOMContentLoaded', function() {
  // trigger popup for login button and cart/compare for guests
  document.querySelectorAll('.login, .login-popup').forEach(function(link) {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const loginModal = document.getElementById('login-popup');
      if(loginModal) loginModal.style.display = 'flex'; // same as login button
    });
  });
});
</script>

