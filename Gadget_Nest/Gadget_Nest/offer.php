<?php
$page_title = "Offers";
$page_active = "offer";
include 'base.php';
include 'db.php';

// fetch active offers
$offers = $conn->query("SELECT * FROM offers WHERE status='active' ORDER BY id DESC");
?>

<section class="offer-section">
  <h2>Hot Offers</h2>
  <div class="offer-grid">

    <?php if($offers && $offers->num_rows > 0): ?>
      <?php while($row = $offers->fetch_assoc()): ?>
        <div class="offer-card">
          <img src="<?= htmlspecialchars($row['image']) ?>" alt="<?= htmlspecialchars($row['product_name']) ?>">
          <div class="offer-info">
            <h3><?= htmlspecialchars($row['product_name']) ?></h3>
            <span class="discount">-<?= (int)$row['discount_percent'] ?>% Off</span>
            <p><?= htmlspecialchars($row['description']) ?></p>

            <div class="price-box">
              <span class="old-price">৳ <?= number_format($row['old_price'],2) ?></span>
              <span class="new-price">৳ <?= number_format($row['new_price'],2) ?></span>
            </div>

            <button class="add-btn">Shop Now</button>
          </div>
        </div>
      <?php endwhile; ?>
    <?php else: ?>
      <p style="text-align:center;">No offers available right now.</p>
    <?php endif; ?>

  </div>
</section>

<?php include 'base_footer.php'; ?>
<link rel="stylesheet" href="offer.css">
