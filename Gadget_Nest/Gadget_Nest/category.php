<?php
session_start();
$page_title = "Category";
$page_active = "category";
include 'base.php';
include 'db.php';

$is_logged_in = isset($_SESSION['user_id']);
$is_admin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
$placeholder = "images/placeholder.png";

// Fetch categories
$query = "SELECT id, name, image FROM categories ORDER BY name";
$result = $conn->query($query);
?>

<section class="categories">
    <?php if($is_admin): ?>
        <div class="admin-add">
            <a href="add_category.php" class="btn">+ Add New Category</a>
        </div>
    <?php endif; ?>

    <div class="category-grid">
        <?php
        if($result && $result->num_rows > 0){
            while($row = $result->fetch_assoc()){
                $img = !empty($row['image']) ? $row['image'] : $placeholder;
                $href = $is_logged_in ? "products.php?category_id={$row['id']}" : "#";
                $link_class = $is_logged_in ? "" : "login-popup";

                echo '<div class="cat-box">';
                echo "<a href='{$href}' class='{$link_class}' style='display:block; text-decoration:none; color:inherit; width:100%; height:100%;'>";
                echo "<img src='{$img}' alt='".htmlspecialchars($row['name'])."' onerror=\"this.src='{$placeholder}'\">";
                echo '<p>'.htmlspecialchars($row['name']).'</p>';
                echo '</a>';

                if($is_admin){
                    echo '<div class="admin-actions">';
                    echo "<a href='edit_category.php?id={$row['id']}'>Edit</a> | ";
                    echo "<a href='delete_category.php?id={$row['id']}' onclick=\"return confirm('Are you sure?');\">Delete</a>";
                    echo '</div>';
                }

                echo '</div>';
            }
        } else {
            echo '<p>No categories found.</p>';
        }
        ?>
    </div>
</section>

<?php include 'base_footer.php'; ?>
<link rel="stylesheet" href="category.css">

<script>
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.login-popup').forEach(function(link){
        link.addEventListener('click', function(e){
            e.preventDefault();
            const popup = document.getElementById('popup-placeholder');
            if(popup){
                popup.style.display = 'block';
            }
        });
    });
});
</script>
