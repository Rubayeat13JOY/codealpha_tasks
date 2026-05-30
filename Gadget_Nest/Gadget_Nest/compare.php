<?php
session_start();
include 'db.php';
$page_title = "Compare Products";
$page_active = "compare";
$placeholder = "images/placeholder.png";

$logged_user = null;
if(isset($_SESSION['user_id'])) {
    $uid = $_SESSION['user_id'];
    $u = $conn->prepare("SELECT fullname FROM users WHERE id=?");
    $u->bind_param("i", $uid);
    $u->execute();
    $logged_user = $u->get_result()->fetch_assoc();
}

// Initialize compare session
if(!isset($_SESSION['compare'])) $_SESSION['compare'] = [];

// Add / Remove Product from Compare
if(isset($_GET['add'])) {
    $pid = (int)$_GET['add'];
    if(!in_array($pid,$_SESSION['compare']) && count($_SESSION['compare'])<3){
        $_SESSION['compare'][] = $pid;
    }
}
if(isset($_GET['remove'])) {
    $pid = (int)$_GET['remove'];
    $_SESSION['compare'] = array_diff($_SESSION['compare'], [$pid]);
}

// Add to Cart
if($_SERVER['REQUEST_METHOD']==='POST' && isset($_POST['add_to_cart']) && $logged_user){
    $pid = intval($_POST['product_id']);
    $stmt = $conn->prepare("SELECT id, name, price, main_image, stock_status FROM products WHERE id=?");
    $stmt->bind_param("i",$pid);
    $stmt->execute();
    $p = $stmt->get_result()->fetch_assoc();

    if($p && $p['stock_status']==="In Stock"){
        if(!isset($_SESSION['cart'])) $_SESSION['cart'] = [];
        if(isset($_SESSION['cart'][$pid])){
            $_SESSION['cart'][$pid]['quantity'] += 1;
        }else{
            $_SESSION['cart'][$pid] = [
                'id' => $p['id'],
                'name' => $p['name'],
                'price' => $p['price'],
                'image' => $p['main_image'] ?: $placeholder,
                'quantity' => 1
            ];
        }
        header("Location: compare.php");
        exit;
    }
}

// Fetch Compared Products
$compare_products = [];
if(!empty($_SESSION['compare'])){
    $ids = implode(',',$_SESSION['compare']);
    $res = $conn->query("SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON p.category_id=c.id WHERE p.id IN ($ids)");

    while($row = $res->fetch_assoc()){
        // Average Rating
        $stmt = $conn->prepare("SELECT AVG(rating) as avg_rating FROM product_reviews WHERE product_id=?");
        $stmt->bind_param("i",$row['id']);
        $stmt->execute();
        $row['avg_rating'] = $stmt->get_result()->fetch_assoc()['avg_rating'] ?? 0;

        // Specifications
        $row['specs'] = [];
        $sq = $conn->prepare("SELECT spec_name,spec_value FROM product_specifications WHERE product_id=?");
        $sq->bind_param("i",$row['id']);
        $sq->execute();
        $sr = $sq->get_result();
        while($s=$sr->fetch_assoc()) $row['specs'][]=$s;

        $compare_products[] = $row;
    }
}

// All products for dropdown
$all_products = $conn->query("SELECT id,name FROM products ORDER BY name");

// Stars helper
function stars($rating){
    $r = round($rating);
    return str_repeat('★',$r).str_repeat('☆',5-$r);
}

include 'base.php';
?>

<section class="compare-section">
    <h2>Compare Products</h2>
    <div class="compare-grid">
        <!-- Add Product -->
        <div class="compare-card add-card">
            <div class="plus-icon">+</div>
            <select id="product-select">
                <option value="">Select Product</option>
                <?php while($p=$all_products->fetch_assoc()): ?>
                    <option value="<?= $p['id'] ?>"><?= htmlspecialchars($p['name']) ?></option>
                <?php endwhile; ?>
            </select>
        </div>

        <!-- Compared Products -->
        <?php foreach($compare_products as $p): ?>
        <div class="compare-card">
            <a class="remove-btn" href="compare.php?remove=<?= $p['id'] ?>">×</a>
            <img src="<?= $p['main_image'] ?: $placeholder ?>" alt="<?= htmlspecialchars($p['name']) ?>">
            <h3><?= htmlspecialchars($p['name']) ?></h3>
            <div class="stars"><?= stars($p['avg_rating']) ?></div>
            <p class="price">৳ <?= number_format($p['price'],2) ?></p>

            <!-- Specifications -->
            <table class="features">
                <tr><td>Category:</td><td><?= htmlspecialchars($p['category_name']) ?></td></tr>
                <?php foreach($p['specs'] as $s): ?>
                <tr>
                    <td><?= htmlspecialchars($s['spec_name']) ?>:</td>
                    <td><?= htmlspecialchars($s['spec_value']) ?></td>
                </tr>
                <?php endforeach; ?>
            </table>

            <!-- Add to Cart / Out of Stock -->
            <?php if($p['stock_status']==="In Stock"): ?>
            <form method="POST">
                <input type="hidden" name="product_id" value="<?= $p['id'] ?>">
                <button type="submit" name="add_to_cart" class="add-btn">Add to Cart</button>
            </form>
            <?php else: ?>
            <button class="add-btn" disabled>Out of Stock</button>
            <?php endif; ?>
        </div>
        <?php endforeach; ?>
    </div>
</section>

<!-- Choices.js dropdown -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/choices.js/public/assets/styles/choices.min.css"/>
<script src="https://cdn.jsdelivr.net/npm/choices.js/public/assets/scripts/choices.min.js"></script>
<script>
document.addEventListener('DOMContentLoaded',function(){
    const select = document.getElementById('product-select');
    new Choices(select,{searchEnabled:true,itemSelectText:'',placeholder:true,placeholderValue:'Search Product',searchPlaceholderValue:'Type to search...'});
    select.addEventListener('change',function(){
        if(this.value) location='compare.php?add='+this.value;
    });
});
</script>

<link rel="stylesheet" href="compare.css">
<?php include 'base_footer.php'; ?>
